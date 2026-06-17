package main

import (
	"crypto/rand"
	"embed"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"html/template"
	"net"
	"net/http"
	"strconv"
	"sync"
	"time"
)

//go:embed templates/*.html
var adminTemplates embed.FS

const (
	maxLoginAttempts = 5
	lockoutWindow    = 5 * time.Minute
	sessionCookie    = "admin_session"
	sessionTTL       = 6 * time.Hour
)

type loginFailure struct {
	count int
	until time.Time
}

type session struct {
	expiresAt time.Time
}

type Admin struct {
	store    *Store
	password string
	tpl      *template.Template

	mu       sync.Mutex
	sessions map[string]session
	fails    map[string]loginFailure
}

func NewAdmin(store *Store, password string) *Admin {
	funcs := template.FuncMap{"add": func(a, b int) int { return a + b }}
	t, err := template.New("").Funcs(funcs).ParseFS(adminTemplates, "templates/*.html")
	if err != nil {
		panic(err)
	}
	return &Admin{
		store: store, password: password, tpl: t,
		sessions: map[string]session{},
		fails:    map[string]loginFailure{},
	}
}

func (a *Admin) Register(mux *http.ServeMux) {
	mux.HandleFunc("/admin", a.dashboard)
	mux.HandleFunc("/admin/login", a.login)
	mux.HandleFunc("/admin/export.csv", a.requireAuth(a.exportCSV))
	mux.HandleFunc("/admin/api/rename", a.requireAuth(a.opRename))
	mux.HandleFunc("/admin/api/reset", a.requireAuth(a.opReset))
	mux.HandleFunc("/admin/api/delete", a.requireAuth(a.opDelete))
}

func ipOf(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (a *Admin) authed(r *http.Request) bool {
	c, err := r.Cookie(sessionCookie)
	if err != nil {
		return false
	}
	a.mu.Lock()
	defer a.mu.Unlock()
	s, ok := a.sessions[c.Value]
	if !ok || time.Now().After(s.expiresAt) {
		delete(a.sessions, c.Value)
		return false
	}
	return true
}

func (a *Admin) requireAuth(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !a.authed(r) {
			writeJSON(w, 401, map[string]any{"ok": false, "reason": "未登录"})
			return
		}
		h(w, r)
	}
}

func (a *Admin) dashboard(w http.ResponseWriter, r *http.Request) {
	if !a.authed(r) {
		a.renderLogin(w, "")
		return
	}
	a.renderDashboard(w)
}

func (a *Admin) renderLogin(w http.ResponseWriter, errMsg string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = a.tpl.ExecuteTemplate(w, "login.html", map[string]string{"Error": errMsg})
}

type dashRow struct {
	Class, Name            string
	Attempt1, Attempt2, Best int
	Sets                    string
}

type dashData struct {
	TotalStudents, TotalAttempts, TopScore, AvgScore int
	Rows                                              []dashRow
}

func (a *Admin) buildDashData() dashData {
	students := a.store.Snapshot()
	rows := make([]dashRow, 0, len(students))
	totalAttempts, top, sum := 0, 0, 0
	for _, s := range students {
		r := dashRow{Class: s.Class, Name: s.Name}
		sets := ""
		for i, att := range s.Attempts {
			if i == 0 { r.Attempt1 = att.Score } else { r.Attempt2 = att.Score }
			if att.Score > r.Best { r.Best = att.Score }
			if sets != "" { sets += "/" }
			sets += att.Set
			totalAttempts++; sum += att.Score
			if att.Score > top { top = att.Score }
		}
		r.Sets = sets
		rows = append(rows, r)
	}
	for i := 0; i < len(rows); i++ {
		for j := i + 1; j < len(rows); j++ {
			if rows[j].Best > rows[i].Best {
				rows[i], rows[j] = rows[j], rows[i]
			}
		}
	}
	avg := 0
	if totalAttempts > 0 { avg = sum / totalAttempts }
	return dashData{
		TotalStudents: len(students), TotalAttempts: totalAttempts,
		TopScore: top, AvgScore: avg, Rows: rows,
	}
}

func (a *Admin) renderDashboard(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_ = a.tpl.ExecuteTemplate(w, "admin.html", a.buildDashData())
}

func (a *Admin) login(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "method not allowed", 405)
		return
	}
	ip := ipOf(r)
	a.mu.Lock()
	f := a.fails[ip]
	if f.count >= maxLoginAttempts && time.Now().Before(f.until) {
		a.mu.Unlock()
		http.Error(w, "尝试次数过多，请稍后再试", 429)
		return
	}
	a.mu.Unlock()

	pw := r.FormValue("password")
	if pw != a.password {
		a.mu.Lock()
		f := a.fails[ip]
		f.count++
		if f.count >= maxLoginAttempts {
			f.until = time.Now().Add(lockoutWindow)
		}
		a.fails[ip] = f
		a.mu.Unlock()
		w.WriteHeader(http.StatusUnauthorized)
		a.renderLogin(w, "口令错误，请重试")
		return
	}

	b := make([]byte, 32)
	_, _ = rand.Read(b)
	token := base64.RawURLEncoding.EncodeToString(b)
	a.mu.Lock()
	delete(a.fails, ip)
	a.sessions[token] = session{expiresAt: time.Now().Add(sessionTTL)}
	a.mu.Unlock()
	http.SetCookie(w, &http.Cookie{
		Name: sessionCookie, Value: token, Path: "/admin",
		HttpOnly: true, MaxAge: int(sessionTTL.Seconds()),
	})
	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}

func (a *Admin) exportCSV(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition",
		`attachment; filename="raincheck-scores-`+time.Now().Format("20060102-1504")+`.csv"`)
	_, _ = w.Write([]byte{0xEF, 0xBB, 0xBF}) // UTF-8 BOM for Excel

	cw := csv.NewWriter(w)
	_ = cw.Write([]string{"班级", "姓名",
		"第1次成绩", "第2次成绩", "最高分",
		"第1次细项", "第2次细项",
		"第1次题集", "第2次题集",
		"第1次完成时间", "第2次完成时间"})

	for _, s := range a.store.Snapshot() {
		row := []string{s.Class, s.Name, "", "", "", "", "", "", "", "", ""}
		best := 0
		for i, att := range s.Attempts {
			if att.Score > best { best = att.Score }
			base := 2 + i
			row[base] = itoa(att.Score)
			row[base+2] = breakdownStr(att.Breakdown)
			row[base+4] = att.Set
			row[base+6] = att.FinishedAt.Format("2006-01-02 15:04")
		}
		row[4] = itoa(best)
		_ = cw.Write(row)
	}
	cw.Flush()
}

func (a *Admin) opRename(w http.ResponseWriter, r *http.Request) {
	var b struct{ FromClass, FromName, ToClass, ToName string }
	if err := decodeJSON(r, &b); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "bad json"})
		return
	}
	if err := a.store.Rename(b.FromClass, b.FromName, b.ToClass, b.ToName); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"ok": true})
}

func (a *Admin) opReset(w http.ResponseWriter, r *http.Request) {
	var b struct{ Class, Name string }
	if err := decodeJSON(r, &b); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "bad json"})
		return
	}
	if err := a.store.ResetLastAttempt(b.Class, b.Name); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"ok": true})
}

func (a *Admin) opDelete(w http.ResponseWriter, r *http.Request) {
	var b struct{ Class, Name string }
	if err := decodeJSON(r, &b); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "bad json"})
		return
	}
	if err := a.store.Delete(b.Class, b.Name); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": err.Error()})
		return
	}
	writeJSON(w, 200, map[string]any{"ok": true})
}

func decodeJSON(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func itoa(n int) string { return strconv.Itoa(n) }

func breakdownStr(m map[string]int) string {
	order := []string{"collect", "clean", "train", "decide"}
	out := ""
	for _, k := range order {
		if out != "" { out += " " }
		out += k + "=" + strconv.Itoa(m[k])
	}
	return out
}
