package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const adminPassword = "832091"

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	dataDir := flag.String("data", ".", "directory for scores.json")
	flag.Parse()

	scoresPath := filepath.Join(*dataDir, "scores.json")
	store, err := NewStore(scoresPath)
	if err != nil {
		log.Fatalf("load store: %v", err)
	}
	api := NewAPI(store, 30*time.Minute)

	mux := http.NewServeMux()
	mux.Handle("/api/", api.Mux())
	mux.Handle("/", staticHandler())

	admin := NewAdmin(store, adminPassword)
	admin.Register(mux)

	abs, _ := filepath.Abs(scoresPath)
	PrintBanner(*addr, abs, adminPassword)

	fmt.Fprintln(os.Stderr, "listening on", *addr)
	if err := http.ListenAndServe(*addr, mux); err != nil {
		log.Fatal(err)
	}
}
