#!/usr/bin/env node

// Compatibility shim only. The canonical owner is HERMES-CORE/core/perception-orchestra.mjs.
// No mutation, deploy, writer or independent orchestration lives here.
import { runFourAnglePerception } from '../apps/modulos/HERMES-CORE/core/perception-orchestra.mjs';

const mission = process.argv.slice(2).join(' ').trim();

if (!mission) {
  console.error('CONTROLLED_DISSONANCE_MISSION_REQUIRED');
  process.exitCode = 2;
} else {
  runFourAnglePerception({ mission })
    .then((packet) => {
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
      if (!packet.ready_for_writer) process.exitCode = 2;
    })
    .catch((error) => {
      console.error(`CONTROLLED_DISSONANCE_BLOCKED=${String(error?.message || error).replace(/\s+/g, ' ').slice(0, 240)}`);
      process.exitCode = 1;
    });
}
