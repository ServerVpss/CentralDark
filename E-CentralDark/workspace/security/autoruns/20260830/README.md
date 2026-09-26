# Autoruns Casa: zero-trust read-only control

The original `Autoruns.zip` stays untouched at `C:\Users\danda\Downloads\Autoruns.zip`.
The extracted Microsoft-signed package is under `package\`.

`Start-AutorunsCasa.ps1` is the plug-and-play collector for the Casa:

- validates the Microsoft signature and records SHA-256;
- collects Autoruns in read-only mode;
- classifies missing targets, scripts, unverified entries and user-writable paths;
- writes a JSON report and a Hermes handoff;
- probes only the local SOL health endpoint;
- performs zero deletions, registry changes, Defender changes or execution of findings.

Hermes is the analysis owner, not the enforcement owner. The handoff policy requires human approval for any remediation. Defender, WDAC and Windows remain the enforcement layer.

Run from PowerShell 7 in the Casa:

```powershell
pwsh -NoProfile -File E:\CentralDark\workspace\security\autoruns\20260830\Start-AutorunsCasa.ps1
```

To analyze an existing CSV without recollecting:

```powershell
pwsh -NoProfile -File E:\CentralDark\workspace\security\autoruns\20260830\Start-AutorunsCasa.ps1 -InputCsv E:\CentralDark\workspace\security\autoruns\20260830\reports\baseline-20260830-052235\autoruns.csv
```

The `-SendToSol` switch is intentionally fail-closed until the local SOL handoff contract is proven. It cannot silently transmit security inventory.
