# Using auto-destilador with Hermes Cron

The auto-destilador skill can be scheduled to run automatically using Hermes's built-in cron system. This ensures continuous monitoring of the Chefe's folder without requiring a terminal to remain open.

## Basic Cron Job

To run the auto-destilador script every minute:

```
hermes cron create --schedule "1m" --prompt "python \"E:\\CentralDark\\Pivete\\skills\\auto-destilador\\scripts\\auto_destilador.py\"" --name "auto-destilador-watch" --deliver origin
```

## Using the Hermes Skill Wrapper

Alternatively, you can invoke the skill directly via Hermes (avoids hardcoding paths):

```
hermes cron create --schedule "1m" --prompt "hermes run skill auto-destilador" --name "auto-destilador-skill" --deliver origin
```

### Benefits of the skill wrapper:
- Automatically uses the correct Python environment and dependencies
- Respects any profile-specific configuration
- Integrates with Hermes's skill versioning and audit trails

## Monitoring and Logs

Check job status and output:

```
hermes cron list                # View all cron jobs
hermes cron log <job_id>        # See detailed output of a specific run
hermes cron run <job_id>        # Execute immediately (for testing)
```

## Stopping the Job

To disable or remove the automated watchdog:

```
hermes cron pause <job_id>      # Temporarily stop
hermes cron resume <job_id>     # Resume after pause
hermes cron remove <job_id>     # Permanently delete the job
```

## Tips

- Use `--schedule "every 5m"` for less frequent checks if the folder sees little activity.
- Combine with `--notify_on_complete=false` to avoid chat clutter if you don't need per-run notifications.
- Ensure the script has access to the watched folder (permissions are inherited from the Hermes process).