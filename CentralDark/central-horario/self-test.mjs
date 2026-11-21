import assert from 'node:assert/strict';
import {
  TIME_ZONE,
  DISPLAY_LABEL,
  formatBrasilia,
  formatBrasiliaTime,
  utcIso,
  formatFinalReportBrasilia,
  finalReportTimeFields,
  finalReportTimeHeader,
} from './node.mjs';

assert.equal(TIME_ZONE, 'America/Sao_Paulo');
assert.equal(DISPLAY_LABEL, 'BRT');

const instant = new Date('2026-09-11T09:14:00.000Z');
assert.equal(utcIso(instant), '2026-09-11T09:14:00.000Z');

const human = formatBrasilia(instant);
assert.match(human, /11\/09\/2026/);
assert.match(human, /06:14:00/);
assert.match(human, /BRT$/);

const clock = formatBrasiliaTime(instant);
assert.match(clock, /^06:14:00 BRT$/);

assert.equal(formatFinalReportBrasilia(instant), '11/09/2026 06:14:00 BRT');

const reportFields = finalReportTimeFields(instant);
assert.deepEqual(reportFields, {
  Date: '11/09/2026 06:14:00 BRT',
  'Date-UTC': '2026-09-11T09:14:00.000Z',
});
assert.equal(
  finalReportTimeHeader(instant),
  'Date: 11/09/2026 06:14:00 BRT\nDate-UTC: 2026-09-11T09:14:00.000Z',
);

console.log('CENTRALDARK_TIME_ZONE=America/Sao_Paulo');
console.log('MACHINE_UTC=PASS');
console.log('HUMAN_BRT=PASS');
console.log('FINAL_REPORT_TIME_RECIPE=PASS');
console.log('TIME_FIXED_POINT_SELF_TEST=PASS');
