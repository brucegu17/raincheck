package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

var (
	ErrAlreadyTwoAttempts = errors.New("已完成 2 次，不能再玩")
	ErrTargetExists       = errors.New("目标姓名已存在")
	ErrNoSuchStudent      = errors.New("未找到该学生")
)

type Attempt struct {
	AttemptNo  int            `json:"attemptNo"`
	Score      int            `json:"score"`
	Breakdown  map[string]int `json:"breakdown"`
	Set        string         `json:"set"`
	Stars      int            `json:"stars"`
	Title      string         `json:"title"`
	StartedAt  time.Time      `json:"startedAt"`
	FinishedAt time.Time      `json:"finishedAt"`
}

type Student struct {
	Class    string    `json:"class"`
	Name     string    `json:"name"`
	Attempts []Attempt `json:"attempts"`
}

type fileShape struct {
	Version  int                 `json:"version"`
	Students map[string]*Student `json:"students"`
}

type Store struct {
	mu   sync.Mutex
	path string
	data fileShape
}

func key(class, name string) string { return class + "|" + name }

func NewStore(path string) (*Store, error) {
	s := &Store{path: path, data: fileShape{Version: 1, Students: map[string]*Student{}}}
	b, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return s, nil
		}
		return nil, err
	}
	if len(b) == 0 {
		return s, nil
	}
	if err := json.Unmarshal(b, &s.data); err != nil {
		return nil, fmt.Errorf("parse %s: %w", path, err)
	}
	if s.data.Students == nil {
		s.data.Students = map[string]*Student{}
	}
	return s, nil
}

func (s *Store) AttemptsCount(class, name string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	stu := s.data.Students[key(class, name)]
	if stu == nil {
		return 0
	}
	return len(stu.Attempts)
}

func (s *Store) AppendAttempt(class, name string, a Attempt) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	k := key(class, name)
	stu := s.data.Students[k]
	if stu == nil {
		stu = &Student{Class: class, Name: name}
		s.data.Students[k] = stu
	}
	if len(stu.Attempts) >= 2 {
		return ErrAlreadyTwoAttempts
	}
	stu.Attempts = append(stu.Attempts, a)
	return s.persistLocked()
}

func (s *Store) Best(class, name string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	stu := s.data.Students[key(class, name)]
	if stu == nil {
		return 0
	}
	best := 0
	for _, a := range stu.Attempts {
		if a.Score > best {
			best = a.Score
		}
	}
	return best
}

func (s *Store) Snapshot() []Student {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]Student, 0, len(s.data.Students))
	for _, stu := range s.data.Students {
		scopy := *stu
		scopy.Attempts = append([]Attempt(nil), stu.Attempts...)
		out = append(out, scopy)
	}
	return out
}

func (s *Store) Rename(fromClass, fromName, toClass, toName string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	from := key(fromClass, fromName)
	to := key(toClass, toName)
	stu, ok := s.data.Students[from]
	if !ok {
		return ErrNoSuchStudent
	}
	if from != to {
		if _, exists := s.data.Students[to]; exists {
			return ErrTargetExists
		}
	}
	stu.Class = toClass
	stu.Name = toName
	if from != to {
		delete(s.data.Students, from)
		s.data.Students[to] = stu
	}
	return s.persistLocked()
}

func (s *Store) ResetLastAttempt(class, name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	stu, ok := s.data.Students[key(class, name)]
	if !ok || len(stu.Attempts) == 0 {
		return ErrNoSuchStudent
	}
	stu.Attempts = stu.Attempts[:len(stu.Attempts)-1]
	return s.persistLocked()
}

func (s *Store) Delete(class, name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.data.Students[key(class, name)]; !ok {
		return ErrNoSuchStudent
	}
	delete(s.data.Students, key(class, name))
	return s.persistLocked()
}

func (s *Store) persistLocked() error {
	tmp := s.path + ".tmp"
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}
	b, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}
