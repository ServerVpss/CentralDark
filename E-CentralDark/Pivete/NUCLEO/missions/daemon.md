# MISSAO - daemon.go
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\94f2c10e177b3171\daemon.go
**SHA:** 12ac7823f9c1ac9d
**Timestamp:** 2026-08-28T02:53:41.294583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- return nil, fmt.Errorf("restart: %w", err)

### Ouro Bruto (primeiros 5000 chars)
```
package dap

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	godap "github.com/google/go-dap"
)

// defaultSocketDir returns the directory for the daemon socket.
func defaultSocketDir() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".dap-cli")
}

// SessionSocketPath returns the socket path for a named session.
func SessionSocketPath(name string) string {
	return filepath.Join(defaultSocketDir(), name+".sock")
}

// DefaultSocketPath returns the default socket path (session "default").
func DefaultSocketPath() string {
	return SessionSocketPath("default")
}

// Daemon holds the stateful debug session.
type Daemon struct {
	clientMu sync.Mutex // guards d.client pointer; never held during I/O
	client   *DAPClient
	backend  Backend

	adapterCmd *exec.Cmd

	// Async event dispatch
	expectCh chan godap.Message

	// Output buffer (bounded at write time)
	mu            sync.Mutex
	outputLines   []string        // complete lines, capped at maxOutputLines
	outputPartial strings.Builder // last incomplete line (no \n yet)

	// Session state
	threadID      int
	frameID       int
	frameIDs      []int // DAP frame IDs for the current stop, indexed by stack position
	captureOutput bool  // only capture output after first stop

	// Unverified breakpoint warnings, drained on next response
	breakWarnings []string

	// Requested breakpoint lines per file, for detecting line adjustments
	requestedBreakLines map[string]map[int]bool

	// Cleanup function for temp binaries (e.g. Go, Rust compilation)
	cleanupFn func()

	// Last debug args for restart
	lastDebugArgs json.RawMessage

	// Adapter address and config for child session creation (js-debug multi-session)
	adapterAddr string
	// sessionBreaks and sessionExceptionFilters are accessed from handler methods
	// serialized by cmdMu. Interrupt commands (pause, stop) don't modify them.
	// d.client is guarded by clientMu for pointer swaps (readLoop↔handlers).
	sessionBreaks           []Breakpoint // stored breakpoints for child session re-init
	sessionExceptionFilters []string     // stored exception filter IDs for child session re-init

	// Command serialization: most commands hold cmdMu for their duration.
	// Interrupt commands (pause, stop) skip it so they can run while a
	// blocking command (continue/step/debug) is in progress.
	cmdMu sync.Mutex

	// Socket
	listener   net.Listener
	socketPath string

	// Idle timeout
	idleTimer *time.Timer
}

const maxOutputLines = 200
const defaultIdleTimeout = 10 * time.Minute

const errNoSession = "no active debug session (program may have terminated) — run 'dap debug' to start a new session"

func errResponse(msg string) *Response {
	return &Response{Status: "error", Error: msg}
}

func errResponsef(format string, args ...any) *Response {
	return &Response{Status: "error", Error: fmt.Sprintf(format, args...)}
}

func (d *Daemon) requireSession() *Response {
	if d.getClient() == nil {
		return errResponse(errNoSession)
	}
	return nil
}

func (d *Daemon) getClient() *DAPClient {
	d.clientMu.Lock()
	defer d.clientMu.Unlock()
	return d.client
}

func (d *Daemon) setClient(c *DAPClient) {
	d.clientMu.Lock()
	d.client = c
	d.clientMu.Unlock()
}

func idleTimeout() time.Duration {
	if v := os.Getenv("DAP_IDLE_TIMEOUT"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return defaultIdleTimeout
}

// appendOutput appends text to the bounded output buffer. Called under mu.
func (d *Daemon) appendOutput(text string) {
	if d.outputPartial.Len() > 0 {
		text = d.outputPartial.String() + text
		d.outputPartial.Reset()
	}
	lines := strings.Split(text, "\n")
	d.outputLines = append(d.outputLines, lines[:len(lines)-1]...)
	if len(d.outputLines) > maxOutputLines {
		trimmed := make([]string, maxOutputLines)
		copy(trimmed, d.outputLines[len(d.outputLines)-maxOutputLines:])
		d.outputLines = trimmed
	}
	d.outputPartial.WriteString(lines[len(lines)-1])
}

// outputString returns buffered output as a string and clears the buffer. Called under mu.
func (d *Daemon) outputString() string {
	lines := d.outputLines
	if d.outputPartial.Len() > 0 {
		lines = append(lines, d.outputPartial.String())
	}
	d.outputLines = nil
	d.outputPartial.Reset()
	return strings.Join(lines, "\n")
}

// addBreakWarning appends a warning about an unverified breakpoint.
func (d *Daemon) addBreakWarning(w string) {
	d.mu.Lock()
	d.breakWarnings = append(d.breakWarnings, w)
	d.mu.Unlock()
}

// drainBreakWarnings returns accumulated warnings and clears them.
func (d *Daemon) drainBreakWarnings() []string {
	d.mu.Lock()
	defer d.mu.Unlock()
	if len(d.breakWarnings) == 0 {
		return nil
	}
	w := d.breakWarnings
	d.breakWarnings = nil
	return w
}

// attachWarnings drains any pending break warnings into a response.
func (d *Daemon) attachWarnings(resp *Response) {
	warnings := d.drainBreakWarnings()
	if len(warnings) == 0 {
	
```