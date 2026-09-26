**Boot Flow Summary**
- `CENTRALDARK_AI_BOOT.yaml` defines `unified_entry_pipeline` (see list).
- `boot_receipt.txt` contains evidence `!cntraldark boot signal received` confirming runtime boot.
- The flow executes at startup; no new parallel system is instantiated.
- All actions respect `REUSE_BEFORE_CREATE` and `ONE_WRITER_PER_SCOPE`.

This file is referenced from the `boot_receipt` reference when inspecting pendencias logic.