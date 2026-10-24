// delivery-bip.c — Hermes Gateway media delivery failure alert (Windows C starter)
//
// Watches a log file for a failure signature and alerts audibly when one is found.
// Two sound options:
//   1. Beep() — simple, no external file, good for a quick audible cue.
//   2. PlaySound() — plays a custom WAV if you want a more distinctive alert.
//
// A real monitor should also:
//   - deduplicate by failure fingerprint (file path + platform + window)
//   - log the alert context, not just beep
//   - only alert on terminal/budget-exhausted failures, not transient retries
//
// Compile:
//   MSVC:  cl /O2 delivery-bip.c /Fe:delivery-bip.exe
//   MinGW: gcc delivery-bip.c -o delivery-bip.exe -lwinmm

#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <time.h>

// ---- Audio alert (two implementations, pick one) ----

// Option A: simple console beep. No external file needed.
static void beep_alert(void) {
    // 800 Hz for 300 ms — a neutral attention tone, not an alarm siren.
    Beep(800, 300);
}

// Option B: play a custom alert WAV from the same directory as this exe.
// Uncomment to use instead of/beep_alert() above.
//
// static void wav_alert(void) {
//     char path[MAX_PATH];
//     GetModuleFileNameA(NULL, path, MAX_PATH);
//     // Drop the exe name, keep the directory
//     char *slash = strrchr(path, '\\');
//     if (slash) *slash = '\0';
//     strcat(path, "\\alert.wav");
//     // SND_ASYNC so we don't block; SND_ALIAS not used (we play a file)
//     PlaySoundA(path, NULL, SND_FILENAME | SND_ASYNC);
// }

// ---- Alert with context log ----

static void alert(const char *signature, const char *detail) {
    time_t now = time(NULL);
    char ts[64];
    // ISO-8601-ish local timestamp for the log line
    struct tm *tm_info = localtime(&now);
    strftime(ts, sizeof(ts), "%Y-%m-%d %H:%M:%S", tm_info);

    // Audible cue
    beep_alert();

    // Traceable log line — the sound gets attention, this tells the user what broke.
    fprintf(stderr, "[%s] [ALERT] delivery-failure %s: %s\n", ts, signature, detail);
}

// ---- Minimal line-by-line log watcher (starter, not production-ready) ----

// Polls a log file incrementally and calls alert() when a line matches a
// failure signature substring. This is intentionally simple: real monitoring
// should use proper file-tail logic (share-mode open, last-read offset,
// handle the file being rotated), and should rate-limit / dedup.

static int tail_and_watch(const char *log_path, const char *signature) {
    FILE *fp = fopen(log_path, "r");
    if (!fp) {
        fprintf(stderr, "[WARN] cannot open log %s\n", log_path);
        return -1;
    }

    // Seek to end so we only watch new lines (starter behavior).
    fseek(fp, 0, SEEK_END);

    char line[4096];
    while (1) {
        if (feof(fp)) {
            // No new data yet — sleep a bit and recheck.
            Sleep(1000);
            clearerr(fp);
            continue;
        }
        if (fgets(line, sizeof(line), fp) == NULL) {
            Sleep(1000);
            clearerr(fp);
            continue;
        }
        // Strip trailing newline for cleaner matching
        size_t len = strlen(line);
        if (len > 0 && line[len - 1] == '\n') line[len - 1] = '\0';
        if (len > 1 && line[len - 2] == '\r') line[len - 2] = '\0';

        if (strstr(line, signature) != NULL) {
            // In a real monitor, fingerprint + dedup goes here.
            alert(signature, line);
        }
    }

    fclose(fp);
    return 0;
}

// ---- Entry point ----

int main(int argc, char **argv) {
    const char *log_path  = "~/.hermes/logs/gateway.log";
    const char *signature = "Couldn't deliver";

    if (argc >= 2) log_path  = argv[1];
    if (argc >= 3) signature = argv[2];

    fprintf(stderr, "[START] watching %s for: %s\n", log_path, signature);
    fprintf(stderr, "[START] press Ctrl+C to stop\n");

    // Simple tilde expansion is not done here on purpose — pass an absolute
    // path from the shell or a batch file. E.g. on this Windows box:
    //   delivery-bip.exe "C:/Users/Administrador/AppData/Local/hermes/logs/gateway.log" "Couldn't deliver"
    return tail_and_watch(log_path, signature);
}
