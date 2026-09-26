# Probe SDK High-Level Scenarios

## 1) Meeting Pre-Join Readiness Gate

- Run Probe diagnostics before showing Meeting SDK join button.
- Block join for severe failures (no media permissions, fatal network score).
- Show guidance and retry path for recoverable failures.

## 2) Video Session Quality Predictor

- Pair Probe results with Video SDK session UX.
- Choose default video quality and renderer path based on capability checks.
- Fall back to audio-first profile when network quality is poor.

## 3) Support/Triage Diagnostic Capture

- Collect final diagnostic report for helpdesk workflows.
- Attach report to support ticket to reduce reproduction time.
- Compare report against known-good baseline by browser/OS cohort.

## 4) Managed Device Certification

- Run automated checks across approved browser/device matrix.
- Persist pass/fail score and feature support profile.
- Use certification output to guide endpoint policy and rollout.

## 5) Incident Response Validation

- During outage/performance alerts, run Probe tests from affected geos.
- Distinguish local device failures from Zoom/service-zone path issues.
- Route incident response based on network and protocol-specific findings.
 recording and BYOS endpoint field changes after upgrades.

## 4) AWS Lambda Event Receiver Deployment

- Module: product-specific client + `AwsLambdaReceiver`
- Flow:
1. Instantiate client with `receiver: new AwsLambdaReceiver(...)`.
2. Export Lambda handler that delegates to `await client.start()` handler.
3. Use API Gateway/serverless-offline for local parity.
- Risks:
- User OAuth expectations with unsupported receiver flow.
- Secret token mismatch across Lambda environments.

## 5) Multi-Tenant Event Router

- Modules: one or more, with external token/state stores
- Flow:
1. Receive webhook.
2. Resolve tenant and token context.
3. Execute routed API action.
4. Persist audit and retry state.
- Risks:
- In-memory token store only (tokens lost on restart).
- Missing idempotency for retried webhook events.
