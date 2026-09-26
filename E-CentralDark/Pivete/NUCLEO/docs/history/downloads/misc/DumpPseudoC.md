# OUTRO - DumpPseudoC.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\meteor-decomp-develop\tools\ghidra_scripts\DumpPseudoC.java
**SHA:** cc4f94728724f110
**Timestamp:** 2026-08-28T12:23:04.571603
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- long start = System.currentTimeMillis();

### Ouro Bruto (primeiros 5000 chars)
```
// meteor-decomp — clean-room decompilation of FINAL FANTASY XIV 1.x client binaries
// Copyright (C) 2026  Samuel Stegall
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Walk every function in currentProgram and dump Ghidra's decompiler
// output as a hint for autonomous matching agents. We CANNOT open the
// .gpr GUI artefact from an agent process, so this script exports the
// pseudo-C to plain text files instead:
//
//   build/ghidra-decomp/<binary>/<rva>_<symbol>.c
//
// The output is decompiler-best-effort C: useful as a structural hint
// for what the function is doing, but never byte-correct. Matching
// must still validate against the asm + objdiff.
//
// Invoked from headless via:
//   analyzeHeadless ... -postScript DumpPseudoC.java
//
//@category meteor-decomp
//@menupath
//@toolbar

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileOptions;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.decompiler.DecompiledFunction;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressRange;
import ghidra.program.model.address.AddressSetView;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import ghidra.program.model.listing.Program;

public class DumpPseudoC extends GhidraScript {

    private static final int DECOMP_TIMEOUT_SEC = 30;

    @Override
    public void run() throws Exception {
        Program prog = currentProgram;
        long imageBase = prog.getImageBase().getOffset();

        String repoRoot = System.getenv("METEOR_DECOMP_ROOT");
        if (repoRoot == null) {
            repoRoot = new File(
                getScriptArgs().length > 0 ? getScriptArgs()[0] : "."
            ).getAbsolutePath();
        }

        String binary = prog.getName().toLowerCase().replace(".exe", "");
        File outDir = new File(repoRoot, "build/ghidra-decomp/" + binary);
        outDir.mkdirs();

        DecompInterface decomp = new DecompInterface();
        DecompileOptions opts = new DecompileOptions();
        decomp.setOptions(opts);
        // Simplification level: the SIMPLIFY action gives us clean
        // pseudo-C without going all the way to NORMALIZE (which
        // tries to invert compiler tricks and is slower + noisier).
        decomp.toggleCCode(true);
        decomp.toggleSyntaxTree(true);
        decomp.setSimplificationStyle("decompile");

        if (!decomp.openProgram(prog)) {
            println("DumpPseudoC: FAILED to open program for decompilation: "
                + decomp.getLastMessage());
            return;
        }

        FunctionIterator iter = prog.getFunctionManager().getFunctions(true);
        int total = 0, ok = 0, fail = 0, skipped = 0;
        long start = System.currentTimeMillis();

        while (iter.hasNext() && !monitor.isCancelled()) {
            Function fn = iter.next();
            if (fn.isExternal()) {
                skipped++;
                continue;
            }
            total++;

            Address entry = fn.getEntryPoint();
            long rva = entry.getOffset() - imageBase;
            String name = fn.getName();
            String safe = sanitize(name);
            File outFile = new File(outDir, String.format("%08x_%s.c", rva, safe));

            // Skip if already up-to-date (idempotent reruns).
            // We don't have a great freshness signal — for now, skip
            // if the output file exists. Pass --force at the wrapper
            // level (or `rm -rf build/ghidra-decomp/<binary>/`) to
            // rebuild.
            if (outFile.exists() && outFile.length() > 0) {
                ok++;
                continue;
            }

            try {
                DecompileResults res = decomp.decompileFunction(
                    fn, DECOMP_TIMEOUT_SEC, monitor
                );
                DecompiledFunction decFn = res == null ? null : res.getDecompiledFunction();
                if (decFn == null || decFn.getC() == null) {
                    String err = res == null ? "no result" : res.getErrorMessage();
                    writeStub(outFile, fn, rva, "decompile failed: " + err);
                    fail++;
                    continue;
                }
                writeOutput(outFile, fn, rva, decFn.getSignature(), decFn.getC());
                ok++;
            } catch (Exception e) {
                writeStub(outFile, fn, rva, "exception: " + e.getMessage());
                fail++;
            }

            if (total % 500 == 0) {
                println(String.format("DumpPseudoC: %s 
```