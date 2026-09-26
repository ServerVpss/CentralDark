## CentralDark Shared Command

The
`!CENTRALDARK RECONCILIAR_SHARED` command expands with a comprehensive flag set:

```
!CENTRALDARK RECONCILIAR_SHARED \
  MISSION_ID=AUTO \
  REPO=ServerVpss/CentralDark \
  CANONICAL_BRANCH=main \
  TRACE_MODE=SHARED \
  ROLE=AUTO \
  FIRST_WRITER_WINS=true \
  ONE_WRITER_PER_SCOPE=true \
  MULTI_READER=true \
  PARALLELIZE_PERCEPTION=true \
  SERIALIZE_MUTATION=true \
  CURRENT_OVER_HISTORY=true \
  FETCH_BEFORE_MEASURE=true \
  REMEASURE_BEFORE_ACTION=true \
  REUSE_BEFORE_CREATE=true \
  ONE_SYSTEM_ONLY=true \
  NO_V2_V3_V4=true \
  DIRTY_WORKTREE=BLOCK \
  NO_FORCE_PUSH=true \
  NO_BLIND_OVERWRITE=true \
  NO_RESET_DESTRUCTIVE=true \
  UNKNOWN_IS_NOT_PASS=true \
  ACTION_IS_NOT_PROOF=true \
  SAME_HEAD_PROOF=true \
  CLAIM_SEAL=true \
  SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE \
  META_LUPA=CONTINUOUS \
  MULTIBUSSOLA=CONTINUOUS \
  VERTEX_INVERSO=ON \
  CARACOL=UNTIL_FIXED_POINT \
  FINAL_WRITER=FIRST_WRITER \
  FINALIZE_ONLY_BY_PRIMARY_WRITER=true \
  READERS_RETURN=DELTA+EVIDENCE_REF+OWNER+NEXT_CURSOR \
  WRITER_ABSORBS_READERS=true \
  FINAL_FLOW=REMEASURERECONCILETESTCOUNTERPROOFFIXED_POINTCOMMITPUSHPR_OR_MAINREMEASURERECEIPT \
  BOOT=!CENTRALDARK#ACORDAR!CALIBRAR!MULTIBUSSOLA_META!META_LUPA!RECONCILIAR!CONTRAPROVA!VERTEX_INVERSO!CARACOL!FIXED_POINT!REGISTRA!BOOT
```

### Key Flags
- **MISSION_ID=AUTO** – Determine the active mission ID from lock state.
- **FIRST_WRITER_WINS** – Only the first writer commits and pushes.
- **RESUME_EXISTING_MISSION** – Resume when an active mission is detected.
- **CLEAN_WORKTREE** – Do not allow dirty worktrees (`DIRTY_WORKTREE=BLOCK`).
- **NO_V2_V3_V4** – Guarantees no version branching during this pass.
- **PARALLELIZE_PERCEPTION** – Readers can run in parallel.
- **SERIALIZE_MUTATION** – Mutations are serialized within the writer.
- **ACTION_IS_NOT_PROOF** – The action is not considered proof; evidence must be provided separately.
- **SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE** – If signals duplicate, drop and continue.
- **METAV_LUPA=CONTINUOUS** – Meta-lupa runs continuously during reconciliation.
- **FINAL_WRITER=FIRST_WRITER** – Designates the initial writer as final.
- **FINALIZE_ONLY_BY_PRIMARY_WRITER** – Only the primary writer can finalize.
- **READERS_RETURN** – Readers return deltas + evidence + owner + next cursor.

This reference serves as a quick summary and should be consulted before invoking the command. No other file changes are required.
