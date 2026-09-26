# COMANDO - metrics-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\render\skills\render-monitor\references\metrics-guide.md
**SHA:** 2957ba36ff7f5956
**Timestamp:** 2026-08-26T18:41:09.911941
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- **Formula:** `throttle_risk = cpu_usage / cpu_limit`
- **OOM Risk Formula:** `oom_risk = memory_usage / memory_limit`

### Ouro Bruto (primeiros 5000 chars)
```
# Render Metrics Interpretation Guide

Comprehensive guide to understanding and acting on Render service metrics.

## Available Metrics

| Metric | Description | Applicable Resources |
|--------|-------------|---------------------|
| `cpu_usage` | CPU utilization percentage | Services, Postgres, KV |
| `cpu_limit` | CPU limit/allocation | Services |
| `cpu_target` | Autoscaling CPU target | Services |
| `memory_usage` | Memory utilization | Services, Postgres, KV |
| `memory_limit` | Memory limit/allocation | Services |
| `memory_target` | Autoscaling memory target | Services |
| `http_request_count` | Number of HTTP requests | Services |
| `http_latency` | Response time (quantile-based) | Services |
| `bandwidth_usage` | Network bandwidth used | Services |
| `instance_count` | Number of running instances | Services |
| `active_connections` | Database connections | Postgres, KV |

---

## CPU Metrics

### cpu_usage

**What it measures:** Percentage of allocated CPU being used.

**Healthy ranges by plan:**
| Plan | Typical Healthy | Warning | Critical |
|------|-----------------|---------|----------|
| Free/Starter | <60% | 60-80% | >80% |
| Standard | <70% | 70-85% | >85% |
| Pro+ | <75% | 75-90% | >90% |

**Actions for high CPU:**
1. Profile code for inefficient operations
2. Add caching for repeated computations
3. Optimize database queries
4. Upgrade to higher plan
5. Enable autoscaling

### cpu_limit

**What it measures:** Maximum CPU allocated to the service.

**Use case:** Compare `cpu_usage` to `cpu_limit` to determine if throttling is occurring.

**Formula:** `throttle_risk = cpu_usage / cpu_limit`
- `>0.9` = High throttling risk
- `>0.8` = Moderate risk
- `<0.7` = Safe

---

## Memory Metrics

### memory_usage

**What it measures:** Memory being used by the service in bytes.

**Healthy ranges:**
| Plan | Memory Limit | Warning Threshold | Critical Threshold |
|------|-------------|-------------------|-------------------|
| Free | 512 MB | 400 MB (78%) | 460 MB (90%) |
| Starter | 512 MB | 400 MB (78%) | 460 MB (90%) |
| Standard | 2 GB | 1.6 GB (80%) | 1.8 GB (90%) |
| Pro | 4 GB | 3.2 GB (80%) | 3.6 GB (90%) |

**Actions for high memory:**
1. Profile for memory leaks
2. Reduce in-memory caching
3. Process data in streams/chunks
4. Optimize data structures
5. Upgrade plan

### memory_limit

**What it measures:** Maximum memory allocated.

**OOM Risk Formula:** `oom_risk = memory_usage / memory_limit`
- `>0.95` = Imminent OOM
- `>0.90` = High risk
- `>0.80` = Moderate risk
- `<0.70` = Safe

---

## HTTP Metrics

### http_latency

**What it measures:** Response time at a given percentile.

**Common quantiles:**
- `0.5` (p50/median) - Typical user experience
- `0.95` (p95) - Most users' worst experience
- `0.99` (p99) - Tail latency, outliers

**Healthy latency targets:**
| Endpoint Type | p50 | p95 | p99 |
|--------------|-----|-----|-----|
| Static content | <50ms | <100ms | <200ms |
| API (simple) | <100ms | <300ms | <500ms |
| API (complex) | <200ms | <500ms | <1s |
| Database-heavy | <300ms | <1s | <2s |

**Actions for high latency:**
1. Add database indexes
2. Implement caching (Redis/KV)
3. Optimize N+1 queries
4. Use connection pooling
5. Add CDN for static assets
6. Scale horizontally

### http_request_count

**What it measures:** Number of HTTP requests received.

**Use cases:**
- Detect traffic spikes
- Correlate with error rates
- Capacity planning
- Usage billing estimation

**Aggregation options:**
- By `host` - Traffic per domain
- By `statusCode` - Success vs error rates

**Calculating error rate:**
```
error_rate = (5xx_requests / total_requests) * 100
```

Target: <0.1% error rate

---

## Instance Metrics

### instance_count

**What it measures:** Number of running service instances.

**Interpreting changes:**
- Increasing: Autoscaling up (good if traffic increasing)
- Decreasing: Autoscaling down (cost optimization)
- Fluctuating: Possible instability or aggressive scaling
- Stuck at 1: May not have autoscaling enabled

**Autoscaling health check:**
Compare `instance_count` trends with `cpu_usage` and `http_request_count`:
- CPU high + instances not scaling = Check autoscaling config
- Instances scaling + latency still high = Hit max instances or DB bottleneck

---

## Database Metrics

### active_connections

**What it measures:** Number of active database connections.

**Connection limits by plan:**
| Plan | Max Connections | Warning | Critical |
|------|----------------|---------|----------|
| Free | 97 | 75 | 90 |
| Basic | 97 | 75 | 90 |
| Standard | 200-500 | 160-400 | 180-450 |
| Pro | 500+ | 400+ | 450+ |

**Actions for high connections:**
1. Implement connection pooling (PgBouncer)
2. Close idle connections
3. Reduce connection timeouts
4. Fix connection leaks in code
5. Upgrade database plan

### Database CPU/Memory

Same interpretation as service metrics, but:
- High CPU often indicates slow queries
- High memory often indicates large result sets or missing indexes

---

```