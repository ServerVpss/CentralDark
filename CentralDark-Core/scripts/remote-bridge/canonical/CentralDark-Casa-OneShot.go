// CentralDark Remote Tray OneShot launcher.
// Reuses the existing Casa OneShot installer and the current MCP/bridge owner.
// It does not implement a second agent and does not expose pairing tokens.
package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const installerName = "CentralDark-Casa-OneShot.ps1"

func psQuote(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

func findInstaller() string {
	exe, err := os.Executable()
	if err != nil {
		return ""
	}
	volume := filepath.VolumeName(exe)
	candidates := []string{
		filepath.Join(volume+string(os.PathSeparator), "scripts", installerName),
		filepath.Join(filepath.Dir(exe), "..", "scripts", installerName),
		filepath.Join(filepath.Dir(exe), installerName),
	}
	for _, candidate := range candidates {
		abs, err := filepath.Abs(candidate)
		if err == nil {
			if st, err := os.Stat(abs); err == nil && !st.IsDir() {
				return abs
			}
		}
	}
	return ""
}

func powershellPath() string {
	for _, name := range []string{"powershell.exe", "powershell"} {
		if path, err := exec.LookPath(name); err == nil {
			return path
		}
	}
	return ""
}

func validateInstaller(ps, installer string) error {
	if ps == "" {
		return fmt.Errorf("WINDOWS_POWERSHELL_NOT_FOUND")
	}
	if installer == "" {
		return fmt.Errorf("CASA_ONESHOT_INSTALLER_NOT_FOUND")
	}
	command := "$p=" + psQuote(installer) + "; $tokens=$null; $errors=$null; " +
		"[void][System.Management.Automation.Language.Parser]::ParseFile($p,[ref]$tokens,[ref]$errors); " +
		"if ($errors.Count -gt 0) { $errors | ForEach-Object { [Console]::Error.WriteLine($_.Message) }; exit 1 }; " +
		"[Console]::WriteLine('POWERSHELL_SYNTAX=PASS')"
	cmd := exec.Command(ps, "-NoProfile", "-NonInteractive", "-Command", command)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("INSTALLER_SYNTAX_FAILED: %s: %s", err, strings.TrimSpace(string(output)))
	}
	fmt.Print(string(output))
	return nil
}

func openLog() (*os.File, string, error) {
	exe, err := os.Executable()
	if err != nil {
		return nil, "", err
	}
	volume := filepath.VolumeName(exe)
	if volume == "" {
		return nil, "", fmt.Errorf("EXECUTABLE_VOLUME_UNKNOWN")
	}
	dir := filepath.Join(volume+string(os.PathSeparator), "Bridge", "logs")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, "", fmt.Errorf("BRIDGE_LOG_DIR_CREATE_FAILED: %w", err)
	}
	path := filepath.Join(dir, "tray-oneshot-"+time.Now().Format("20060102-150405")+".log")
	f, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		return nil, "", fmt.Errorf("BRIDGE_LOG_CREATE_FAILED: %w", err)
	}
	return f, path, nil
}

func selfTest() int {
	ps := powershellPath()
	installer := findInstaller()
	fmt.Println("CENTRALDARK_REMOTE_TRAY_ONESHOT_SELF_TEST")
	fmt.Printf("POWERSHELL_FOUND=%t\n", ps != "")
	fmt.Printf("INSTALLER_FOUND=%t\n", installer != "")
	if installer != "" {
		fmt.Printf("INSTALLER_PATH=%s\n", installer)
	}
	if err := validateInstaller(ps, installer); err != nil {
		fmt.Printf("SELF_TEST=FAIL\nREASON=%s\n", err)
		return 2
	}
	fmt.Println("SELF_TEST=PASS")
	fmt.Println("INSTALLER_EXECUTED=false")
	return 0
}

func main() {
	for _, arg := range os.Args[1:] {
		if arg == "--self-test" {
			os.Exit(selfTest())
		}
		if arg == "--help" || arg == "-h" {
			fmt.Println("CentralDark Remote Tray OneShot")
			fmt.Println("Default: validate then run the existing scripts\\CentralDark-Casa-OneShot.ps1.")
			fmt.Println("--self-test: validate source and PowerShell syntax without installing or changing tasks.")
			fmt.Println("No pairing token is printed or forwarded.")
			return
		}
	}

	ps := powershellPath()
	installer := findInstaller()
	if err := validateInstaller(ps, installer); err != nil {
		fmt.Fprintf(os.Stderr, "PRECHECK=FAIL: %v\n", err)
		os.Exit(2)
	}
	log, logPath, err := openLog()
	if err != nil {
		fmt.Fprintf(os.Stderr, "LOG_CREATE=FAIL: %v\n", err)
		os.Exit(3)
	}
	defer log.Close()
	fmt.Printf("LOG=%s\n", logPath)
	fmt.Fprintf(log, "START=%s\n", time.Now().Format(time.RFC3339Nano))
	fmt.Fprintf(log, "OWNER_SCRIPT=%s\n", installer)
	fmt.Fprintln(log, "PAIRING_TOKEN_LOGGED=false")
	fmt.Fprintln(log, "MCP_DEPLOY_PERFORMED_BY_WRAPPER=false")

	cmd := exec.Command(ps, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", installer)
	cmd.Dir = filepath.Dir(installer)
	cmd.Stdout = io.MultiWriter(os.Stdout, log)
	cmd.Stderr = io.MultiWriter(os.Stderr, log)
	err = cmd.Run()
	if err == nil {
		fmt.Fprintln(log, "INSTALLER_EXIT_CODE=0")
		fmt.Println("INSTALLER_EXIT_CODE=0")
		return
	}
	code := 1
	if exit, ok := err.(*exec.ExitError); ok {
		code = exit.ExitCode()
	}
	fmt.Fprintf(log, "INSTALLER_EXIT_CODE=%d\nINSTALLER_ERROR=%s\n", code, err.Error())
	fmt.Fprintf(os.Stderr, "INSTALLER_EXIT_CODE=%d\n", code)
	os.Exit(code)
}
