package main

import (
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "syscall"
    "unsafe"
)

var (
    user32 = syscall.NewLazyDLL("user32.dll")
    msgBox = user32.NewProc("MessageBoxW")
)

func messageBox(title, text string) {
    tp, _ := syscall.UTF16PtrFromString(title)
    xp, _ := syscall.UTF16PtrFromString(text)
    msgBox.Call(0, uintptr(unsafe.Pointer(xp)), uintptr(unsafe.Pointer(tp)), 0x40)
}

func firstExisting(paths []string) string {
    for _, p := range paths {
        if st, err := os.Stat(p); err == nil && !st.IsDir() {
            return p
        }
    }
    return ""
}

func main() {
    exePath, err := os.Executable()
    if err != nil {
        messageBox("CentralDark Remote", "Nao foi possivel resolver o caminho do executavel.")
        return
    }
    base := filepath.Dir(exePath)
    local := os.Getenv("LOCALAPPDATA")
    if local == "" {
        local = os.TempDir()
    }
    runtimeRoot := filepath.Join(local, "CentralDark", "Remote-Tray")
    _ = os.MkdirAll(runtimeRoot, 0755)

    script := firstExisting([]string{
        filepath.Join(base, "engine", "CentralDark-Remote-Tray.ps1"),
        filepath.Join(base, "CentralDark-Remote-Tray.ps1"),
        filepath.Join(runtimeRoot, "engine", "CentralDark-Remote-Tray.ps1"),
    })
    if script == "" {
        messageBox("CentralDark Remote", fmt.Sprintf("Engine nao encontrado. Pasta atual:\n%s", base))
        return
    }

    pwsh, err := exec.LookPath("pwsh.exe")
    if err != nil {
        pwsh, err = exec.LookPath("powershell.exe")
        if err != nil {
            messageBox("CentralDark Remote", "PowerShell nao encontrado no PATH.")
            return
        }
    }

    args := []string{"-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-STA", "-File", script}
    cmd := exec.Command(pwsh, args...)
    cmd.Dir = base
    cmd.Env = append(os.Environ(),
        "CENTRALDARK_REMOTE_HOME="+runtimeRoot,
        "CENTRALDARK_REMOTE_SOURCE_DIR="+base,
    )
    cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
    if err := cmd.Start(); err != nil {
        messageBox("CentralDark Remote", "Falha ao iniciar engine:\n"+err.Error())
        return
    }
}
