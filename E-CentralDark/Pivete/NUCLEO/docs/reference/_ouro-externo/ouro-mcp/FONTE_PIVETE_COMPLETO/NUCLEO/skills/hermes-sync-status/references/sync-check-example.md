# Example output from hermes-sync-status

## In‑sync state
🟢 STATUS: LOCAL vs REMOTE
LOCAL  HEAD : feba74dac811fc1b4d553cbc22c90cbbc18532e1
REMOTE MAIN: feba74dac811fc1b4d553cbc22c90cbbc18532e1
STATUS      : IN_SYNC

## Ahead (local has commits not yet pushed)
🟡 STATUS: LOCAL vs REMOTE
LOCAL  HEAD : a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
REMOTE MAIN: 0a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t
STATUS      : AHEAD (+3 commits)

## Behind (remote has new commits)
🟡 STATUS: LOCAL vs REMOTE
LOCAL  HEAD : 1111111111111111111111111111111111111111
REMOTE MAIN: 2222222222222222222222222222222222222222
STATUS      : BEHIND (-5 commits)

## Diverged (both sides have new commits)
🔴 STATUS: LOCAL vs REMOTE
LOCAL  HEAD : abcdef1234567890abcdef1234567890abcdef12
REMOTE MAIN: fedcba0987654321fedcba0987654321fedcba09
STATUS      : DIVERGED (ahead 2, behind 4)

## With dirty working tree
⚠️  WORKING TREE: 2 modified files
🟢 STATUS: LOCAL vs REMOTE
LOCAL  HEAD : fecab1234567890fecab1234567890fecab123
REMOTE MAIN: fecab1234567890fecab1234567890fecab123
STATUS      : IN_SYNC