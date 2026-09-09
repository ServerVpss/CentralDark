package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"
)

const (
	appVersion     = "2026.09.09-temp1"
	oldEndpoint    = "https://mcp.desktopcommander.app/mcp"
	centraldarkMCP = "https://mcp.centralldark.com/mcp"
	defaultWorkdir = `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE`
	desktopPkg     = "@wonderwhy-er/desktop-commander@latest"
)

type State struct {
	Timestamp             string `json:"timestamp"`
	Version               string `json:"version"`
	Device                string `json:"device"`
	Mode                  string `json:"mode"`
	Endpoint              string `json:"endpoint"`
	CentralDarkMCPEnabled bool   `json:"centraldark_mcp_enabled"`
	Workdir               string `json:"workdir"`
	Attempt               int    `json:"attempt"`
	Status                string `json:"status"`
	ExitCode              int    `json:"exit_code"`
	UnexpectedJSON        bool   `json:"unexpected_json"`
	MCP32603              bool   `json:"mcp_32603"`
	Screenpipe            string `json:"screenpipe"`
	NextRetrySeconds      int    `json:"next_retry_seconds"`
	Note                  string `json:"note,omitempty"`
}

type Logger struct {
	mu   sync.Mutex
	file *os.File
}

func (l *Logger) Printf(cat, f string, a ...any) {
	line := fmt.Sprintf("[%s] [%s] %s", time.Now().Format(time.RFC3339Nano), cat, fmt.Sprintf(f, a...))
	l.mu.Lock()
	defer l.mu.Unlock()
	fmt.Println(line)
	if l.file != nil {
		_, _ = fmt.Fprintln(l.file, line)
		_ = l.file.Sync()
	}
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func ensureDir(path string) error { return os.MkdirAll(path, 0o755) }

func atomicJSON(path string, v any) error {
	if err := ensureDir(filepath.Dir(path)); err != nil {
		return err
	}
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, append(b, '\n'), 0o644); err != nil {
		return err
	}
	_ = os.Remove(path)
	return os.Rename(tmp, path)
}

func look(name string) string {
	p, err := exec.LookPath(name)
	if err != nil {
		return ""
	}
	return p
}

func commandVersion(ctx context.Context, name string, args ...string) string {
	p := look(name)
	if p == "" {
		return "MISSING"
	}
	cctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	out, err := exec.CommandContext(cctx, p, args...).CombinedOutput()
	if err != nil {
		return "ERROR:" + err.Error()
	}
	return strings.TrimSpace(string(out))
}

func getScreenpipeToken(ctx context.Context) string {
	if v := strings.TrimSpace(os.Getenv("SCREENPIPE_LOCAL_API_KEY")); v != "" {
		return v
	}
	for _, spec := range [][]string{{"screenpipe", "auth", "token"}, {"npx.cmd", "-y", "screenpipe@latest", "auth", "token"}} {
		if look(spec[0]) == "" {
			continue
		}
		cctx, cancel := context.WithTimeout(ctx, 12*time.Second)
		out, err := exec.CommandContext(cctx, spec[0], spec[1:]...).CombinedOutput()
		cancel()
		if err == nil {
			lines := strings.Split(strings.TrimSpace(string(out)), "\n")
			if len(lines) > 0 {
				if t := strings.TrimSpace(lines[len(lines)-1]); t != "" {
					return t
				}
			}
		}
	}
	return ""
}

func httpGetJSON(ctx context.Context, url, token string, timeout time.Duration) (any, error) {
	cctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	req, err := http.NewRequestWithContext(cctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	req.Header.Set("X-Screenpipe-Client", "api")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("HTTP_%d", resp.StatusCode)
	}
	var v any
	dec := json.NewDecoder(io.LimitReader(resp.Body, 4<<20))
	if err := dec.Decode(&v); err != nil {
		return nil, err
	}
	return v, nil
}

func screenpipeLoop(ctx context.Context, workdir string, log *Logger, stateCh chan<- string) {
	base := strings.TrimRight(envOr("SCREENPIPE_LOCAL_API_URL", "http://127.0.0.1:3030"), "/")
	contextDir := filepath.Join(workdir, "context")
	latestPath := filepath.Join(contextDir, "screenpipe-latest.json")
	statusPath := filepath.Join(contextDir, "screenpipe-status.json")
	token := ""
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	probe := func() {
		health, err := httpGetJSON(ctx, base+"/health", "", 5*time.Second)
		if err != nil {
			_ = atomicJSON(statusPath, map[string]any{"generated_at": time.Now().Format(time.RFC3339Nano), "ok": false, "error": err.Error(), "remote_mcp": oldEndpoint})
			select {
			case stateCh <- "UNAVAILABLE":
			default:
			}
			return
		}
		if token == "" {
			token = getScreenpipeToken(ctx)
		}
		mode := "health-only"
		var activity any
		if token != "" {
			if v, e := httpGetJSON(ctx, base+"/activity-summary?start_time=15m%20ago&end_time=now&include_recording=false&include_memories=false&include_key_texts=false&include_guidance=false&max_snippets=8&max_snippet_chars=500", token, 20*time.Second); e == nil {
				activity = v
				mode = "activity-summary"
			}
		}
		payload := map[string]any{"generated_at": time.Now().Format(time.RFC3339Nano), "source": "screenpipe", "mode": mode, "device": "SEGREDO", "health": health, "context": activity}
		_ = atomicJSON(latestPath, payload)
		_ = atomicJSON(statusPath, map[string]any{"generated_at": time.Now().Format(time.RFC3339Nano), "ok": true, "mode": mode, "latest": latestPath, "remote_mcp": oldEndpoint})
		select {
		case stateCh <- "OK:" + mode:
		default:
		}
	}

	probe()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			probe()
		}
	}
}

func runStreaming(ctx context.Context, cmd *exec.Cmd, log *Logger) (exitCode int, output string, err error) {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return -1, "", err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return -1, "", err
	}
	if err := cmd.Start(); err != nil {
		return -1, "", err
	}

	var buf bytes.Buffer
	var bufMu sync.Mutex
	var wg sync.WaitGroup
	copyStream := func(r io.Reader) {
		defer wg.Done()
		s := bufio.NewScanner(r)
		s.Buffer(make([]byte, 4096), 1024*1024)
		for s.Scan() {
			line := s.Text()
			log.Printf("REMOTO", "%s", line)
			bufMu.Lock()
			buf.WriteString(line)
			buf.WriteByte('\n')
			bufMu.Unlock()
		}
	}
	wg.Add(2)
	go copyStream(stdout)
	go copyStream(stderr)
	waitErr := cmd.Wait()
	wg.Wait()

	if waitErr == nil {
		return 0, buf.String(), nil
	}
	var ee *exec.ExitError
	if errors.As(waitErr, &ee) {
		return ee.ExitCode(), buf.String(), waitErr
	}
	return -1, buf.String(), waitErr
}

func runRepair(ctx context.Context, workdir string, log *Logger) {
	log.Printf("REPARO", "npm cache verify + isolated cache on next attempt")
	if look("npm.cmd") != "" {
		cctx, cancel := context.WithTimeout(ctx, 60*time.Second)
		out, err := exec.CommandContext(cctx, "npm.cmd", "cache", "verify").CombinedOutput()
		cancel()
		if err != nil {
			log.Printf("REPARO", "npm cache verify failed: %v", err)
		}
		if len(out) > 0 {
			log.Printf("REPARO", "%s", strings.TrimSpace(string(out)))
		}
	}
	_ = ensureDir(filepath.Join(workdir, "cache", "desktop-commander-isolated"))
}

func selfTest(ctx context.Context, workdir string) int {
	report := map[string]any{
		"version":                  appVersion,
		"os":                       runtime.GOOS,
		"arch":                     runtime.GOARCH,
		"workdir":                  workdir,
		"node":                     commandVersion(ctx, "node.exe", "--version"),
		"npx":                      commandVersion(ctx, "npx.cmd", "--version"),
		"npm":                      commandVersion(ctx, "npm.cmd", "--version"),
		"old_endpoint":             oldEndpoint,
		"centraldark_endpoint":     centraldarkMCP,
		"centraldark_mcp_enabled": false,
	}
	b, _ := json.MarshalIndent(report, "", "  ")
	fmt.Println(string(b))
	if report["node"] == "MISSING" || report["npx"] == "MISSING" {
		return 2
	}
	return 0
}

func main() {
	workdir := envOr("CENTRALDARK_WORKDIR", defaultWorkdir)
	if len(os.Args) > 1 && os.Args[1] == "--self-test" {
		os.Exit(selfTest(context.Background(), workdir))
	}

	_ = ensureDir(workdir)
	receiptDir := filepath.Join(workdir, "receipts", "remote-bridge")
	_ = ensureDir(receiptDir)
	logPath := filepath.Join(receiptDir, "one-exe-"+time.Now().Format("20060102-150405")+".log")
	f, _ := os.OpenFile(logPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	log := &Logger{file: f}
	if f != nil {
		defer f.Close()
	}

	fmt.Println("==============================================================")
	fmt.Println(" CENTRALDARK REMOTE ONE-EXE - TEMP / OLD METHOD")
	fmt.Println(" Desktop Commander Remote MCP")
	fmt.Println(" Endpoint: " + oldEndpoint)
	fmt.Println("==============================================================")

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	log.Printf("INICIO", "CENTRALDARK_REMOTE_ONE=START version=%s", appVersion)
	log.Printf("MODO", "OLD_METHOD=true ONE_EXE_ORCHESTRATOR=true")
	log.Printf("ROTA", "REMOTE_MCP_CONNECT=%s", oldEndpoint)
	log.Printf("ROTA", "CENTRALDARK_MCP=%s enabled=false", centraldarkMCP)
	log.Printf("DIRETORIO", "%s", workdir)

	node := look("node.exe")
	npx := look("npx.cmd")
	log.Printf("PRE-CHECAGEM", "NODE=%s", envOrPath(node, "MISSING"))
	log.Printf("PRE-CHECAGEM", "NPX=%s", envOrPath(npx, "MISSING"))
	if node == "" || npx == "" {
		log.Printf("BLOQUEADO", "Node.js/npx ausente. Nenhum falso verde.")
		os.Exit(2)
	}

	var spState atomic.Value
	spState.Store("UNKNOWN")
	stateCh := make(chan string, 2)
	go screenpipeLoop(ctx, workdir, log, stateCh)
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case s := <-stateCh:
				spState.Store(s)
				log.Printf("SCREENPIPE", "STATE=%s", s)
			}
		}
	}()

	statusPath := filepath.Join(receiptDir, "status.json")
	repaired := false
	backoffs := []int{5, 10, 20, 30}
	attempt := 0

	for ctx.Err() == nil {
		attempt++
		log.Printf("CONEXAO", "ATTEMPT=%d PACKAGE=%s", attempt, desktopPkg)

		cmd := exec.CommandContext(ctx, npx, "-y", "--prefer-online", desktopPkg, "remote")
		cmd.Dir = workdir
		cmd.Env = os.Environ()
		if repaired {
			iso := filepath.Join(workdir, "cache", "desktop-commander-isolated")
			cmd.Env = append(cmd.Env, "npm_config_cache="+iso)
			log.Printf("CONEXAO", "ISOLATED_NPM_CACHE=%s", iso)
		}

		exit, output, err := runStreaming(ctx, cmd, log)
		unexpected := strings.Contains(output, "Unexpected end of JSON input")
		mcp32603 := strings.Contains(output, "MCP error -32603")
		next := backoffs[min(attempt-1, len(backoffs)-1)]
		note := ""
		if err != nil {
			note = err.Error()
		}
		st := State{
			Timestamp: time.Now().Format(time.RFC3339Nano), Version: appVersion, Device: "SEGREDO", Mode: "OLD_METHOD",
			Endpoint: oldEndpoint, CentralDarkMCPEnabled: false, Workdir: workdir, Attempt: attempt,
			Status: "OFFLINE", ExitCode: exit, UnexpectedJSON: unexpected, MCP32603: mcp32603,
			Screenpipe: spState.Load().(string), NextRetrySeconds: next, Note: note,
		}
		if exit == 0 {
			st.Status = "REMOTE_PROCESS_EXITED_0"
		}
		_ = atomicJSON(statusPath, st)
		log.Printf("SAIDA", "REMOTE_MCP_EXIT=%d UNEXPECTED_JSON=%v MCP_32603=%v", exit, unexpected, mcp32603)

		if ctx.Err() != nil {
			break
		}
		if unexpected && !repaired {
			repaired = true
			runRepair(ctx, workdir, log)
		}
		log.Printf("NOVA-TENTATIVA", "in=%ds", next)
		select {
		case <-ctx.Done():
			break
		case <-time.After(time.Duration(next) * time.Second):
		}
	}
	log.Printf("ENCERRAMENTO", "CENTRALDARK_REMOTE_ONE=STOP")
}

func envOrPath(v, fallback string) string {
	if strings.TrimSpace(v) == "" {
		return fallback
	}
	return v
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
