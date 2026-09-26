# BENCHLAB
ILLUMINATE YOUR INSIGHTS | REAL-TIME SYSTEM TELEMETRY SOLUTION

BENCHLAB is a cutting-edge, compact, real-time system telemetry solution engineered for PC DIY enthusiasts.
It allows you to effortlessly monitor critical system metrics, including temperature, power usage, and voltage levels.
You can also manage system fan speeds. The telemetry data is displayed in the BENCHLAB software, and you can log and export data to a file or to HWiNFO.

Monitoring is available for:
- Power
- Voltage
- Temperature
- Humidity

BENCHLAB is available for purchase starting from December 29th, 2023 at BENCHLAB.io.
![image](https://github.com/BENCHLAB-io/BENCHLAB/assets/2151317/6aa9c95a-c936-4c4b-9b91-a81a62c2ebf7)

# BENCHLAB Software
The software available on this page is made to exclusively work with the BENCHLAB Hardware. The software is made to run on Windows 10/11.

# How to install & use the BENCHLAB software
- Download the BENCHLAB software from the official Github releases page: [https://github.com/BENCHLAB-io](https://github.com/BENCHLAB-io/BENCHLAB/releases)
- Unzip the files in a new folder
- Double-click the executable "BENCHLAB.exe" to start the software
- Make sure the BENCHLAB is connected to the system where the software is installed
- Run the software, you should see that the BENCHLAB device is connected

# FAQ
- My antivirus is giving a warning when I unzip / run the program
This can happen with WIndows Defender SmartScreen or AVAST as we are a small team we are not yet a "known" source for software distribution.

- Can I communicate with the BENCHLAB Hardware with a script?
Yes you can check the example Python Script at : https://github.com/BENCHLAB-io/BENCHLAB.PythonSample

# Change log
Check the release page for changes.

# Some things that we might be working on
- Add saving settings options (save permanent/export/import/factory reset)
- Better installation process, especially with less AV flag.
- Light & Dark mode options
- Add a Re-calibration feature (to re-calibrate your BENCHLAB board)
- Advanced Fan control options in software
- Advanced Fan control options save on the BENCHLAB board (whenever possible)
- Report status of RGB header connected

# Professional services, support & calibration
For professional partners, Labs and Benchmark-automation groups, feel free to contact us at contact@BENCHLAB.io for alternative way to communicate with the BENCHLAB hardware, dedicated support and extra calibration needs.

# Disclaimer
The BENCHLAB Team's goals are to provide a reliable and good user experience, keep in mind that bugs & limitations can still be present.
If you encounter a bug in the software, you can report it in the "issue" tab on Github. If you need support 

To download the latest version, check the Releases tab.

## BENCHLAB is brought to you by The OpenBenchtable Project & ElmorLabs

## This project is made possible using Open Source components
- SkiaSharp https://github.com/mono/SkiaSharp
- HarfBuzz https://github.com/harfbuzz/harfbuzz
- AvaloniaUI https://github.com/AvaloniaUI/Avalonia


---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\mock-updates\README.md
**SHA:** 3385ea822efe9e57
**Timestamp:** 2026-08-23T14:15:54.097239
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:
- In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

### Ouro Bruto (primeiros 5000 chars)
```
# Local updater test (quick commands)

## 1) Build and stage the newer release

Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:

```bash
bun run updater-local:build
bun run updater-local:stage-last
bun run updater-local:serve
```

Keep the server terminal running.

## 2) Build the older app

In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

```bash
bun run updater-local:build
```

## 3) Verify update flow

Launch the old installed app and trigger update check.

Expected: it pulls the staged update from `http://127.0.0.1:8765/`.

## Notes

- Build newer first: building the older app later overwrites `src-tauri/target/release/bundle`.
- Scripts used above are in `apps/screenpipe-app-tauri/package.json`:
  - `updater-local:build`
  - `updater-local:stage-last`
  - `updater-local:serve`

```

---

# OUTRO - README.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\e2e\mock-updates\README.md
**SHA:** 3385ea822efe9e574fc3ad7d2a5459f807818fb4104bb081e681ca9e311d5a6a
**Timestamp:** 2026-08-23T23:43:23.160973
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:
- In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

### Ouro Bruto (primeiros 5000 chars)
```
# Local updater test (quick commands)

## 1) Build and stage the newer release

Set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to a newer semver (example: `2.4.229`), then run:

```bash
bun run updater-local:build
bun run updater-local:stage-last
bun run updater-local:serve
```

Keep the server terminal running.

## 2) Build the older app

In another terminal, set `apps/screenpipe-app-tauri/src-tauri/Cargo.toml` to an older semver (must be lower than step 1), then run:

```bash
bun run updater-local:build
```

## 3) Verify update flow

Launch the old installed app and trigger update check.

Expected: it pulls the staged update from `http://127.0.0.1:8765/`.

## Notes

- Build newer first: building the older app later overwrites `src-tauri/target/release/bundle`.
- Scripts used above are in `apps/screenpipe-app-tauri/package.json`:
  - `updater-local:build`
  - `updater-local:stage-last`
  - `updater-local:serve`

```