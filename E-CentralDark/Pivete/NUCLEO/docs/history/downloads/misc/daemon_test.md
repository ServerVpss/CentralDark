# OUTRO - daemon_test.go
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\94f2c10e177b3171\daemon_test.go
**SHA:** 09d965471da1deff
**Timestamp:** 2026-08-28T02:53:57.268750
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start := time.Now()
- start := time.Now()

### Ouro Bruto (primeiros 5000 chars)
```
package dap

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"testing"
	"time"
)

func TestOutputBufferBoundedAtWrite(t *testing.T) {
	d := &Daemon{}

	// Write more than maxOutputLines lines — buffer must never exceed cap
	total := maxOutputLines + 500
	for i := 0; i < total; i++ {
		d.appendOutput(fmt.Sprintf("line %d\n", i))
	}

	if len(d.outputLines) > maxOutputLines {
		t.Errorf("expected at most %d lines in buffer, got %d", maxOutputLines, len(d.outputLines))
	}

	// Last line in buffer should be the last complete line written
	lastExpected := fmt.Sprintf("line %d", total-1)
	last := d.outputLines[len(d.outputLines)-1]
	if last != lastExpected {
		t.Errorf("expected last buffered line %q, got %q", lastExpected, last)
	}
}

func TestOutputBufferUnderLimit(t *testing.T) {
	d := &Daemon{}

	for i := 0; i < 10; i++ {
		d.appendOutput(fmt.Sprintf("line %d\n", i))
	}

	// All 10 lines should be present (no trimming below cap)
	if len(d.outputLines) != 10 {
		t.Errorf("expected 10 lines, got %d", len(d.outputLines))
	}
}

func TestHandleOutput(t *testing.T) {
	d := &Daemon{}
	d.appendOutput("hello\n")
	d.appendOutput("world\n")

	resp := d.handleOutput(nil)

	if resp.Status != "ok" {
		t.Fatalf("expected status ok, got %q", resp.Status)
	}
	if resp.Data == nil {
		t.Fatal("expected Data to be set")
	}
	if resp.Data.Output != "hello\nworld" {
		t.Errorf("expected output %q, got %q", "hello\nworld", resp.Data.Output)
	}

	// Buffer should be cleared
	if d.outputLines != nil || d.outputPartial.Len() != 0 {
		t.Error("buffer should be cleared after handleOutput")
	}
}

func TestTempBinaryCleanup(t *testing.T) {
	// Verify cleanup function is called in stopSession
	called := false
	d := &Daemon{
		cleanupFn: func() { called = true },
	}

	d.stopSession()

	if !called {
		t.Error("cleanupFn was not called during stopSession")
	}
	if d.cleanupFn != nil {
		t.Error("cleanupFn should be nil after stopSession")
	}
}

func TestTempBinaryCleanup_NilSafe(t *testing.T) {
	// Verify stopSession with nil cleanupFn doesn't panic
	d := &Daemon{}
	d.stopSession() // should not panic
}

func TestStopSessionGracefulShutdown(t *testing.T) {
	// Process that exits quickly on its own — should not need SIGKILL
	cmd := exec.Command("sleep", "0")
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	d := &Daemon{adapterCmd: cmd}

	start := time.Now()
	d.stopSession()
	elapsed := time.Since(start)

	if elapsed > 2*time.Second {
		t.Errorf("graceful shutdown took too long: %v (expected < 2s)", elapsed)
	}
	if d.adapterCmd != nil {
		t.Error("adapterCmd should be nil after stopSession")
	}
}

func TestStopSessionKillsHangingProcess(t *testing.T) {
	// Process that ignores signals and hangs — should be killed after timeout
	cmd := exec.Command("sleep", "60")
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	d := &Daemon{adapterCmd: cmd}

	start := time.Now()
	d.stopSession()
	elapsed := time.Since(start)

	// Should take ~3s (the timeout), not 60s
	if elapsed > 5*time.Second {
		t.Errorf("expected kill after ~3s, took %v", elapsed)
	}
	if elapsed < 2*time.Second {
		t.Errorf("expected to wait for timeout, but finished in %v", elapsed)
	}
	if d.adapterCmd != nil {
		t.Error("adapterCmd should be nil after stopSession")
	}
}

func TestParseBreakpointSpec(t *testing.T) {
	tests := []struct {
		name     string
		spec     string
		wantFile string // suffix check (absolute paths vary)
		wantLine int
		wantCond string
		wantErr  bool
	}{
		{
			name:     "file:line",
			spec:     "/app.py:10",
			wantFile: "/app.py",
			wantLine: 10,
		},
		{
			name:     "file:line:condition",
			spec:     "/app.py:10:x > 5",
			wantFile: "/app.py",
			wantLine: 10,
			wantCond: "x > 5",
		},
		{
			name:     "condition with colons",
			spec:     "/app.py:10:a:b",
			wantFile: "/app.py",
			wantLine: 10,
			wantCond: "a:b",
		},
		{
			name:     "empty trailing condition",
			spec:     "/app.py:10:",
			wantFile: "/app.py",
			wantLine: 10,
		},
		{
			name:    "no line",
			spec:    "app.py",
			wantErr: true,
		},
		{
			name:    "non-numeric line",
			spec:    "/app.py:abc",
			wantErr: true,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bp, err := parseBreakpointSpec(tt.spec)
			if (err != nil) != tt.wantErr {
				t.Fatalf("parseBreakpointSpec(%q) error = %v, wantErr %v", tt.spec, err, tt.wantErr)
			}
			if tt.wantErr {
				return
			}
			if bp.Line != tt.wantLine {
				t.Errorf("line = %d, want %d", bp.Line, tt.wantLine)
			}
			if bp.Condition != tt.wantCond {
				t.Errorf("condition = %q, want %q", bp.Condition, tt.wantCond)
			}
			if tt.wantFile != "" && bp.File != tt.wantFile {
				t.Errorf("file = %q, want suffix %q", bp.File, tt.wantFile)
			}
		})
	}
}

func TestBreakWarnings(t *testing.T) {
	d := &Daemon{}

	// Initially empty
	if w := d.drainBreakWarnings(); w != nil {
		t.Errorf("expected nil, got %v", w)
	}

	// Accumulate warnings
	d.addBreakWarning("line 999 not found")
	d.addBreakWarning("line 
```