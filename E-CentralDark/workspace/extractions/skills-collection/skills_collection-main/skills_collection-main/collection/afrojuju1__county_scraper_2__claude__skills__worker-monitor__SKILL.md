---
name: worker-monitor
description: |
  Monitor Docker workers, RQ queue health, and auto-scale workers (max 4). Use when: checking job progress, monitoring queue depth, scaling workers up/down, diagnosing slow processing, or waiting for jobs to complete. Referenced by data-quality skill during reprocessing.
---

## Quick Reference

| Action | Command |
|--------|---------|
| Queue status | `inv core.rq-status` |
| Scale workers | `inv core.ws --workers N` (max 4) |
| Worker logs | `docker logs parcelum-worker-1 --tail 50` |
| Container status | `docker ps --format "table {{.Names}}\t{{.Status}}" \| grep -E "worker\|redis\|mongo"` |

## Monitoring Workflow

### 1. Check Environment Health

```bash
# Docker containers
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "worker|redis|mongo"

# Expected: parcelum-worker-1 (healthy), parcelum_redis (healthy), parcelum_mongodb (up)
```

**Health indicators**:
- `(healthy)` = good
- `(unhealthy)` or missing = problem
- Worker count: check how many `parcelum-worker-N` containers exist

### 2. Check Queue Depth

```bash
inv core.rq-status
```

**Output interpretation**:
| Metric | Healthy | Action if unhealthy |
|--------|---------|---------------------|
| `queued` | < 20 | Scale up if > 20 |
| `started` | 1 per worker | Normal |
| `failed` | 0 | Investigate failures |

### 3. Check Worker Logs

```bash
# Recent activity
docker logs parcelum-worker-1 --tail 30

# Search for errors
docker logs parcelum-worker-1 2>&1 | grep -i "error\|exception\|failed" | tail -20

# Follow live (use sparingly)
docker logs parcelum-worker-1 --follow --tail 10
```

**Log patterns**:
| Pattern | Meaning |
|---------|---------|
| `Streaming ... (valuations)` | Processing sub-files |
| `Saved batch N/M` | Progress indicator |
| `Successfully saved X parcels` | Batch complete |
| `ERROR` or `Exception` | Problem - investigate |

## Scaling Rules

**Max workers: 4** (hardware constraint)

### When to Scale Up

| Signal | Action |
|--------|--------|
| Queue depth > 10 jobs | Scale to 2 |
| Queue depth > 20 jobs | Scale to 3-4 |
| Processing large counties (dallas, tarrant, harris) | Scale to 3-4 |

### When to Scale Down

| Signal | Action |
|--------|--------|
| Queue empty, no started jobs | Scale to 1 |
| After batch reprocessing completes | Scale to 1 |

### Scale Commands

```bash
# Scale up
inv core.ws --workers 2
inv core.ws --workers 4

# Scale down
inv core.ws --workers 1

# Check current scale
docker ps | grep worker | wc -l
```

## Wait-for-Completion Pattern

When waiting for jobs to finish (e.g., after `inv core.rqp`):

```bash
# Poll every 30 seconds until queue empty
while true; do
  status=$(inv core.rq_status 2>&1)
  queued=$(echo "$status" | grep -oP 'queued: \K\d+' || echo "0")
  started=$(echo "$status" | grep -oP 'started: \K\d+' || echo "0")
  
  if [ "$queued" = "0" ] && [ "$started" = "0" ]; then
    echo "All jobs complete"
    break
  fi
  
  echo "Waiting... queued=$queued started=$started"
  sleep 30
done
```

Or use the monitoring script:

```bash
python .claude/skills/worker-monitor/scripts/monitor.py --wait
```

## Troubleshooting

### Jobs Stuck in Queue

1. Check workers are running: `docker ps | grep worker`
2. Check worker health: `docker logs parcelum-worker-1 --tail 20`
3. Restart worker if needed: `docker restart parcelum-worker-1`

### Worker Not Processing

1. Check Redis connection: `docker logs parcelum-worker-1 2>&1 | grep -i redis`
2. Check for import errors: `docker logs parcelum-worker-1 2>&1 | grep -i "import\|module"`
3. Rebuild if code changed: `docker-compose build worker && inv core.ws --workers 1`

### High Memory Usage

1. Check: `docker stats --no-stream | grep worker`
2. If memory > 4GB per worker, scale down and let jobs complete
3. Large counties (dallas, tarrant) need more memory per worker

## Integration with data-quality Skill

When reprocessing counties after fixes:

1. **Before reprocessing**: Check queue is empty, scale to 2+ workers
2. **After enqueueing**: Monitor progress with `inv core.rq_status`
3. **While waiting**: Check logs for errors
4. **After completion**: Scale down to 1, proceed to validation

Example flow:
```
# 1. Scale up
inv core.ws --workers 2

# 2. Enqueue jobs
inv core.rqp fort_bend -r
inv core.rqp dallas -r

# 3. Monitor
inv core.rq_status
docker logs parcelum-worker-1 --tail 20

# 4. After complete, scale down
inv core.ws --workers 1

# 5. Validate
python -m county_parser.cli.validate --county fort_bend,dallas --size 500
```
