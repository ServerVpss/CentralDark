# COUNTERPROOF — ENVELOPE

The envelope is invalid if any condition fails:

- canonical ZIP missing;
- canonical ZIP CRC fails;
- canonical ZIP SHA differs from included sidecar or receipt;
- extracted canonical tree differs materially from the ZIP payload;
- internal canonical receipt missing;
- envelope manifest invalid;
- any payload hash listed by envelope differs;
- weak PASS-only audit is treated as sole proof;
- old GitHub state is presented as current;
- project-global FIXED_POINT is claimed without runtime/global closure;
- envelope verifier cannot reproduce checks after extraction.

Expected result after remediation: all envelope/package checks PASS; global project fixed point remains NOT_PROVEN.
