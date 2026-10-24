---
name: devops-integrado-tailscale-centraldark
description: "Use when operating CentralDark via Tailscale or VMware."
version: 1.0.0
license: internal
author: Hermes Agent
metadata:
  hermes:
    tags: [devops, tailscale, centraldark, vmware, ssh, api, access-proof]
    category: devops
---

# DevOps integrado — Tailscale · CentralDark · VMware

CHEFE is final authority. SOL coordinates. Hermes executes. This skill extends the existing CentralDark operational family; it does not create a parallel control plane.

## When to Use

Use this skill for Tailscale app/API access checks, SSH policy diagnosis, CentralDark host or VMware guest verification, shared-folder readback, and integrated DevOps receipts.

## Security contract

- Never print, paste, store, or commit an auth-key secret or API-token secret.
- IDs shown in the Tailscale console are identifiers, not credentials. Do not treat an ID as a usable token.
- Use the Tailscale app/local API or an injected secret store/environment only when the credential is already available through an authorized runtime route.
- Prefer an existing device identity/private key over creating or distributing auth keys.
- Never revoke, rotate, change ACLs, firewall rules, accounts, or device policy without explicit authorization for that exact class of mutation.
- If a credential is supplied in chat, do not echo it or write it to disk; route through the approved secret mechanism or stop with an exact blocker.
- API access proves control-plane visibility; it does not prove SSH, filesystem, VMware, or guest access.

## One integrated route

```text
INTENÇÃO
→ IDENTIFY TARGET DEVICE AND OWNER
→ TAILSCALE APP/API STATUS
→ DEVICE/IP/ONLINE READBACK
→ TCP/SSH ROUTE TEST
→ AUTHORIZATION/ACL CLASSIFICATION
→ VM HOST PROOF
→ GUEST PROOF
→ SHARED-PATH READBACK
→ COUNTERPROOF
→ RECEIPT
```

Parallelize read-only measurements; serialize mutations.

## Measurement order

1. Identify the exact target by stable device identity, not only an IP.
2. Query the authorized Tailscale API or local app status without exposing tokens.
3. Record online state, tailnet IPs, hostname, OS, last-seen, and SSH capability when available.
4. Test the route from the active executor. Distinguish DNS/Tailscale reachability, TCP listener, Tailscale SSH policy denial, OpenSSH authentication failure, shell authorization failure, VMware host access, guest OS access, and shared-folder presence.
5. For VMware, prove both host and guest. A reachable host is not proof that a guest is running or that a shared folder is mounted.
6. Read the requested shared folder fully only after path identity is proven. Hash or inventory files when material; preserve filenames and timestamps.
7. Backcheck from an independent route when available. Do not call HTTP 200, API visibility, process existence, or a successful command alone PASS.

## Safe credential handling

Accepted runtime sources, in descending preference:

1. Tailscale local app/API session already authenticated on the machine.
2. Hermes vault or approved OS credential store, resolved server-side.
3. Process environment injected by the authorized runtime, never printed.
4. A human-only masked prompt handled by the credential system.

Forbidden:

- hardcoding token values in SKILL.md, scripts, receipts, shell history, Git, or chat;
- using console key IDs as token values;
- asking CHEFE to paste a secret into chat;
- claiming API access from a token catalog alone.

## ACL and SSH diagnosis

Classify exactly:

```text
TAILSCALE_CONTROL_PLANE = PASS|UNKNOWN|BLOCKED
TARGET_DEVICE = identified|unknown
TAILSCALE_REACHABILITY = PASS|UNKNOWN|BLOCKED
TAILSCALE_SSH_POLICY = PASS|DENIED|UNKNOWN
OPENSSH_AUTH = PASS|FAIL|UNKNOWN
VMWARE_HOST = PASS|UNKNOWN|BLOCKED
VM_GUEST = PASS|UNKNOWN|BLOCKED
SHARED_PATH = PASS|UNKNOWN|BLOCKED
```

If Tailscale reports `tailnet policy does not permit SSH as user X`, do not assume the literal username is the cause. When the effective rule uses `autogroup:nonroot`, any valid non-root local user should be covered; first verify the active tailnet/account, destination membership, policy propagation, source identity, and effective rule readback. Treat literal-user mismatch as a hypothesis only after those checks. Do not retry blindly or call it a key failure. Continue independent API/device measurements.

## Receipt

```text
TARGET_DEVICE=
TAILSCALE_API=
TAILSCALE_APP=
TAILSCALE_IPS=
ONLINE=
TAILSCALE_SSH_POLICY=
SSH_ROUTE=
SSH_USER=
VMWARE_HOST=
VM_GUEST=
SHARED_PATH=
FILES_READ=
BACKCHECK=
COUNTERPROOF=
FIXED_POINT=
UNKNOWN=
BLOCKER_ID=
NEXT_CURSOR=
```

`FIXED_POINT=true` requires the requested claim to be measured at the applicable layer. API control-plane access alone never closes a filesystem or VMware claim.
