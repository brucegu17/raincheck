package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"
)

type pendingAttempt struct {
	class, name string
	attemptNo   int
	startedAt   time.Time
	expiresAt   time.Time
}

type API struct {
	store    *Store
	tokenTTL time.Duration

	mu       sync.Mutex
	pending  map[string]pendingAttempt
	finished map[string]int // token → best score（幂等）
}

func NewAPI(s *Store, tokenTTL time.Duration) *API {
	return &API{store: s, tokenTTL: tokenTTL,
		pending: map[string]pendingAttempt{}, finished: map[string]int{}}
}

func (a *API) Mux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", a.health)
	mux.HandleFunc("/api/start", a.start)
	mux.HandleFunc("/api/finish", a.finish)
	return mux
}

func (a *API) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, map[string]any{"ok": true})
}

func clean(s string) string { return strings.TrimSpace(s) }

func validIdentity(class, name string) bool {
	if name == "" || class == "" {
		return false
	}
	if len([]rune(name)) > 20 || len([]rune(class)) > 20 {
		return false
	}
	for _, r := range name + class {
		if r < 0x20 || r == 0x7f {
			return false
		}
	}
	return true
}

func newToken() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func (a *API) start(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		writeJSON(w, 405, map[string]any{"ok": false, "reason": "method not allowed"})
		return
	}
	var body struct{ Class, Name string }
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "bad json"})
		return
	}
	class := clean(body.Class)
	name := clean(body.Name)
	if !validIdentity(class, name) {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "请输入合法的班级与姓名"})
		return
	}
	already := a.store.AttemptsCount(class, name)
	if already >= 2 {
		writeJSON(w, 409, map[string]any{"ok": false, "reason": "已完成 2 次，不能再玩。"})
		return
	}

	tok := newToken()
	a.mu.Lock()
	now := time.Now()
	a.pending[tok] = pendingAttempt{
		class: class, name: name,
		attemptNo: already + 1,
		startedAt: now,
		expiresAt: now.Add(a.tokenTTL),
	}
	a.mu.Unlock()

	writeJSON(w, 200, map[string]any{"ok": true, "token": tok, "attemptNo": already + 1})
}

func (a *API) finish(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		writeJSON(w, 405, map[string]any{"ok": false, "reason": "method not allowed"})
		return
	}
	var body struct {
		Token     string
		Score     int
		Breakdown map[string]int
		Set       string
		Stars     int
		Title     string
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "bad json"})
		return
	}

	a.mu.Lock()
	if best, ok := a.finished[body.Token]; ok {
		a.mu.Unlock()
		writeJSON(w, 200, map[string]any{"ok": true, "best": best, "duplicate": true})
		return
	}
	p, ok := a.pending[body.Token]
	if !ok || time.Now().After(p.expiresAt) {
		delete(a.pending, body.Token)
		a.mu.Unlock()
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "token 无效或已过期，请刷新页面重新开始"})
		return
	}
	a.mu.Unlock()

	if body.Score < 0 || body.Score > 100 {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "score 越界"})
		return
	}
	sum := 0
	for _, v := range body.Breakdown {
		sum += v
	}
	if sum != body.Score {
		writeJSON(w, 400, map[string]any{"ok": false, "reason": "breakdown 总和与 score 不一致"})
		return
	}

	att := Attempt{
		AttemptNo: p.attemptNo, Score: body.Score, Breakdown: body.Breakdown,
		Set: body.Set, Stars: body.Stars, Title: body.Title,
		StartedAt: p.startedAt, FinishedAt: time.Now(),
	}
	if err := a.store.AppendAttempt(p.class, p.name, att); err != nil {
		if err == ErrAlreadyTwoAttempts {
			writeJSON(w, 409, map[string]any{"ok": false, "reason": "已完成 2 次"})
			return
		}
		writeJSON(w, 500, map[string]any{"ok": false, "reason": "保存失败"})
		return
	}
	best := a.store.Best(p.class, p.name)

	a.mu.Lock()
	delete(a.pending, body.Token)
	a.finished[body.Token] = best
	a.mu.Unlock()

	writeJSON(w, 200, map[string]any{"ok": true, "best": best})
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}
