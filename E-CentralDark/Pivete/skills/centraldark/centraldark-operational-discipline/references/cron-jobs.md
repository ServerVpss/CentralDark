# CentralDark Cron Jobs

This reference documents the cron jobs created during the last session.

## List
- `radar-17` - runs `run centraldark radar` at :17 each hour.
- `radar-47` - runs at :47 each hour.
- `duplicate-job` - runs `bash E:/CentralDark/workspace/centraldark_duplicate.sh` every 15 minutes.

These jobs are **not** meant to modify the repository; they only perform analysis/duplication. If you need to change them, edit the `cronjob` definitions.
