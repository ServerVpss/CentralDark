# OUTRO - e2e_test.go
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\94f2c10e177b3171\e2e_test.go
**SHA:** aa1bdb2a46d38bae
**Timestamp:** 2026-08-28T02:53:49.794135
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- t.Fatalf("debugpy did not start: %v", err)

### Ouro Bruto (primeiros 5000 chars)
```
package dap

import (
	"encoding/json"
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// e2eBinary is the path to the built binary, shared across all E2E tests.
// Built once in TestMain.
var e2eBinary string

func TestMain(m *testing.M) {
	// Build binary once for all E2E tests.
	tmp, err := os.MkdirTemp("", "dap-e2e-*")
	if err != nil {
		fmt.Fprintf(os.Stderr, "creating temp dir: %v\n", err)
		os.Exit(1)
	}
	defer func() { _ = os.RemoveAll(tmp) }()

	binary := filepath.Join(tmp, "dap")
	build := exec.Command("go", "build", "-o", binary, "./cmd/dap")
	// Find project root from current dir
	dir, _ := os.Getwd()
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			break
		}
		dir = filepath.Dir(dir)
	}
	build.Dir = dir
	if out, err := build.CombinedOutput(); err != nil {
		fmt.Fprintf(os.Stderr, "build failed: %s\n%s\n", err, out)
		os.Exit(1)
	}
	e2eBinary = binary

	os.Exit(m.Run())
}

// e2eEnv holds a built binary, running daemon, and helper to run CLI commands.
type e2eEnv struct {
	t          *testing.T
	binary     string
	socketPath string
	daemon     *exec.Cmd
}

func newE2EEnv(t *testing.T) *e2eEnv {
	t.Helper()
	if testing.Short() {
		t.Skip("skipping E2E test in short mode")
	}

	// Use /tmp for socket to avoid Unix socket path length limit (~104 bytes on macOS).
	// t.TempDir() paths with long test names can exceed this limit.
	sockDir, err := os.MkdirTemp("/tmp", "dap-test-*")
	if err != nil {
		t.Fatalf("creating socket dir: %v", err)
	}
	t.Cleanup(func() { _ = os.RemoveAll(sockDir) })
	socketPath := filepath.Join(sockDir, "test.sock")

	daemon := exec.Command(e2eBinary, "__daemon", "--socket", socketPath)
	daemon.Stdout = os.Stderr
	daemon.Stderr = os.Stderr
	if err := daemon.Start(); err != nil {
		t.Fatalf("starting daemon: %v", err)
	}

	// Wait for daemon socket
	for i := 0; i < 50; i++ {
		if _, err := os.Stat(socketPath); err == nil {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	env := &e2eEnv{t: t, binary: e2eBinary, socketPath: socketPath, daemon: daemon}
	t.Cleanup(func() {
		_ = exec.Command(e2eBinary, "stop", "--socket", socketPath).Run()
		_ = daemon.Process.Kill()
		_ = daemon.Wait()
		_ = os.Remove(socketPath)
	})
	return env
}

func (e *e2eEnv) run(args ...string) (string, error) {
	cmd := exec.Command(e.binary, append(args, "--socket", e.socketPath)...)
	cmd.Dir = projectRoot(e.t)
	out, err := cmd.CombinedOutput()
	return string(out), err
}

// runEnv is like run but with extra environment variables merged into os.Environ().
func (e *e2eEnv) runEnv(extraEnv []string, args ...string) (string, error) {
	cmd := exec.Command(e.binary, append(args, "--socket", e.socketPath)...)
	cmd.Dir = projectRoot(e.t)
	cmd.Env = append(os.Environ(), extraEnv...)
	out, err := cmd.CombinedOutput()
	return string(out), err
}

// --- Python tests ---

// TestE2E_DebugPython runs a full debug session: debug → step → eval → continue → stop.
func TestE2E_DebugPython(t *testing.T) {
	if err := exec.Command("python3", "-c", "import debugpy").Run(); err != nil {
		t.Skip("debugpy not installed")
	}

	env := newE2EEnv(t)
	scriptPath := filepath.Join(projectRoot(t), "testdata", "python", "simple.py")

	// 1. Debug with breakpoint at line 3
	out, err := env.run("debug", scriptPath, "--break", scriptPath+":3")
	if err != nil {
		t.Fatalf("debug failed: %v\n%s", err, out)
	}
	if !strings.Contains(out, "Stopped: breakpoint") {
		t.Errorf("expected breakpoint stop, got:\n%s", out)
	}
	if !strings.Contains(out, "x (int) = 1") {
		t.Errorf("expected x=1 in locals, got:\n%s", out)
	}
	if !strings.Contains(out, "y (int) = 2") {
		t.Errorf("expected y=2 in locals, got:\n%s", out)
	}

	// 2. Step over
	out, err = env.run("step")
	if err != nil {
		t.Fatalf("step failed: %v\n%s", err, out)
	}
	if !strings.Contains(out, "Stopped: step") {
		t.Errorf("expected step stop, got:\n%s", out)
	}
	if !strings.Contains(out, "z (int) = 3") {
		t.Errorf("expected z=3 after step, got:\n%s", out)
	}

	// 3. Eval expression
	out, err = env.run("eval", "x + y + z")
	if err != nil {
		t.Fatalf("eval failed: %v\n%s", err, out)
	}
	if !strings.Contains(out, "6") {
		t.Errorf("expected eval result 6, got:\n%s", out)
	}

	// 4. Continue to end
	out, err = env.run("continue")
	if err != nil {
		t.Fatalf("continue failed: %v\n%s", err, out)
	}
	if !strings.Contains(out, "terminated") || !strings.Contains(out, "Program terminated") {
		t.Errorf("expected terminated, got:\n%s", out)
	}
	if !strings.Contains(out, "Result: 3") {
		t.Errorf("expected program output, got:\n%s", out)
	}

	// 5. Stop
	out, err = env.run("stop")
	if err != nil {
		t.Fatalf("stop failed: %v\n%s", err, out)
	}
	if !strings.Contains(out, "OK") {
		t.Errorf("expected OK, got:\n%s", out)
	}
}

// TestE2E_JSONOutput verifies --json flag produces valid JSON.
func TestE2E_JSONOutput(t *testing.T) {
	if err := exec.Command("python3", "-c", "import debugpy").Run(); err != nil {
		t.Skip("debugpy not installed
```