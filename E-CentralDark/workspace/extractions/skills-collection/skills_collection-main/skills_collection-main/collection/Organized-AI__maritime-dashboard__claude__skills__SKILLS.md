---
name: cc-session-manager
description: Manage Claude Code session time limits with automatic notifications and progress tracking. Use when users want to start/stop sessions, check time remaining, or receive automatic warnings at 30min, 10min, and session end. Tracks 5-hour session blocks with visual progress bars.
---

# Claude Code Session Manager

Intelligently manage your Claude Code 5-hour session time limits with automatic tracking, notifications, and progress monitoring.

## Core Capabilities

- **Session Control** - Start/stop 5-hour session tracking
- **Real-time Status** - Check elapsed time, remaining time, and progress
- **Automatic Notifications** - Receive alerts at 30min, 10min, and session end
- **Background Monitoring** - Continuous session tracking with timed alerts

## Slash Commands

### Session Management
- `/session-start` - Start new 5-hour session with notifications
- `/session-stop` - End current session and show duration
- `/session-status` - Display current session info with progress bar
- `/session-monitor` - Run background monitor for automatic notifications

## Session Tracking Details

**Session Duration:** 5 hours (18,000 seconds)

**Notification Timing:**
- Session start - Immediate confirmation
- 30 minutes remaining - First warning
- 10 minutes remaining - Final warning
- Session end - Time expired notification

**Status Information:**
- Start time and end time
- Elapsed time (formatted as hours/minutes)
- Remaining time (formatted as hours/minutes)
- Visual progress bar with percentage
- Warning indicators for low time

## Usage Patterns

### Starting a Work Session

When user wants to begin a Claude Code session:

1. Execute `/session-start`
2. Confirm session started with start/end times
3. Optionally start monitor: `/session-monitor`
4. Begin work

**User Request Examples:**
- "Start tracking my session"
- "Begin a new 5-hour block"
- "Start the session timer"

### Checking Session Status

When user wants to know time remaining:

1. Execute `/session-status`
2. Display comprehensive status report:
   - Time information (started, ends, elapsed, remaining)
   - Progress bar visualization
   - Percentage complete
   - Warning if time is low

**User Request Examples:**
- "How much time do I have left?"
- "Show session status"
- "Am I running out of time?"

### Ending a Session

When user finishes work or wants to stop tracking:

1. Execute `/session-stop`
2. Display total session duration
3. Confirm with notification

**User Request Examples:**
- "Stop my session"
- "End the current session"
- "I'm done for now"

### Background Monitoring

When user wants automatic notifications:

1. Execute `/session-monitor`
2. Monitor runs in background checking every 60 seconds
3. Sends notifications at key intervals:
   - 30 minutes remaining
   - 10 minutes remaining
   - Session end (0 minutes)
4. Press Ctrl+C to stop monitor

**User Request Examples:**
- "Start the background monitor"
- "Send me notifications when time is low"
- "Monitor my session automatically"

## Command Execution Flow

### /session-start Workflow

```bash
claude-session start
```

**Output:**
```
✅ Session started at 02:30 PM
   Session ends at: 07:30 PM

🔔 Notification sent: "Session Started"

💡 Tip: Run 'claude-session monitor' in another terminal
   to receive automatic notifications
```

**Error Cases:**
- Session already active → Shows current session details
- Unable to send notification → Warns about System Settings

### /session-stop Workflow

```bash
claude-session stop
```

**Output:**
```
✅ Session ended
   Duration: 3h 45m
🔔 Notification sent: "Session Ended"
```

**Error Cases:**
- No active session → Displays "ℹ️  No active session"

### /session-status Workflow

```bash
claude-session status
```

**Output:**
```
============================================================
🟢 Active Claude Session
============================================================

⏰ Time:
   Started:    02:30 PM on Oct 23
   Ends:       07:30 PM on Oct 23
   Elapsed:    2h 15m
   Remaining:  2h 45m

📊 Progress: [████████████████████░░░░░░░░░░░░░░░░░░░░] 45%

============================================================
```

**Warning States:**
- < 30 minutes: "⏰ Notice: Less than 30 minutes remaining"
- < 10 minutes: "⚠️  WARNING: Less than 10 minutes remaining!"
- Expired: "🔴 Session time expired! New 5-hour block is available"

**Error Cases:**
- No active session → Shows how to start a session

### /session-monitor Workflow

```bash
claude-session monitor
```

**Output:**
```
🔄 Starting session monitor...
Press Ctrl+C to stop

[14:30:45] Sent 30-minute warning
[15:20:12] Sent 10-minute warning
[15:30:00] Session ended

👋 Monitor stopped
```

**Behavior:**
- Checks session every 60 seconds
- Sends macOS notifications at key intervals
- Updates state file to prevent duplicate notifications
- Automatically deactivates session when time expires

## State Management

**State File Location:**
`~/.claude-session-state.json`

**State Structure:**
```json
{
  "active": true,
  "start_time": "2025-10-23T14:30:00.123456",
  "notified_30min": false,
  "notified_10min": false,
  "notified_end": false
}
```

**State Flags:**
- `active` - Whether session is currently running
- `start_time` - ISO format timestamp of session start
- `notified_30min` - 30-minute warning sent
- `notified_10min` - 10-minute warning sent
- `notified_end` - Session end notification sent

## Notification System

**Platform:** macOS Notification Center

**Notification Types:**

1. **Session Start**
   - Title: "Claude Session Started"
   - Body: "5-hour session active. You'll receive warnings at 30min and 10min remaining."

2. **30-Minute Warning**
   - Title: "30 Minutes Remaining"
   - Body: "Session ends at [TIME]"

3. **10-Minute Warning**
   - Title: "⚠️ 10 Minutes Remaining!"
   - Body: "Session ending soon. Plan to wrap up or start a new block."

4. **Session End**
   - Title: "Session Time Expired"
   - Body: "Session duration: [DURATION]. New 5-hour block is available."

**Requirements:**
- macOS 10.14+ (for osascript notifications)
- Notification permissions enabled for Terminal/Claude Code

## Progress Visualization

**Progress Bar Format:**
- Width: 40 characters
- Filled: █ (full block)
- Empty: ░ (light shade)
- Percentage: 0-100%

**Example States:**
```
0%:   [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
25%:  [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25%
50%:  [████████████████████░░░░░░░░░░░░░░░░░░░░] 50%
75%:  [██████████████████████████████░░░░░░░░░░] 75%
100%: [████████████████████████████████████████] 100%
```

## Common User Requests

### "Start tracking my Claude session"
1. Check if session already active
2. Execute `/session-start`
3. Confirm start time and end time
4. Suggest starting monitor

### "How much time do I have left?"
1. Execute `/session-status`
2. Display full status report
3. Highlight remaining time and warnings

### "Monitor my session and warn me when time is low"
1. Execute `/session-start` (if not already started)
2. Execute `/session-monitor`
3. Confirm monitor is running
4. Explain notification timing

### "I'm done for the day"
1. Execute `/session-stop`
2. Show total duration
3. Confirm session ended

### "Can I see my progress?"
1. Execute `/session-status`
2. Show progress bar and percentage
3. Display time breakdown

## Troubleshooting

**Notifications not appearing:**
- Check System Settings → Notifications
- Ensure Terminal/Claude Code has notification permissions
- Test with: `osascript -e 'display notification "Test"'`

**Session state corrupted:**
- Delete state file: `rm ~/.claude-session-state.json`
- Start new session: `/session-start`

**Monitor not sending notifications:**
- Check if session is active: `/session-status`
- Verify monitor is running (should see process with `ps aux | grep claude-session`)
- Check notification flags in state file

**Wrong time calculations:**
- Ensure system clock is accurate
- Check timezone settings
- Restart session if time seems incorrect

## Best Practices

1. **Always start monitor** - Run `/session-monitor` after `/session-start` for automatic warnings
2. **Check status regularly** - Use `/session-status` to stay aware of time
3. **Plan ahead** - When you get 30-minute warning, start planning to wrap up
4. **Stop when done** - Use `/session-stop` to properly end sessions
5. **Monitor in background** - Run monitor with `&` or in separate terminal

## Integration Workflow

**Recommended Daily Workflow:**

```bash
# Morning - Start session
/session-start

# Start background monitor (separate terminal or background)
/session-monitor &

# Throughout day - Check status as needed
/session-status

# End of work - Stop session
/session-stop
```

## Technical Details

**Implementation:**
- Language: Python 3
- Dependencies: Standard library only (datetime, pathlib, json, subprocess)
- State persistence: JSON file in home directory
- Notifications: macOS osascript
- Timer precision: 1-second resolution
- Check interval: 60 seconds (monitor mode)

**File Structure:**
```
cc-session-manager/
├── claude-session (main CLI executable)
├── lib/
│   ├── session.py (state management)
│   ├── timer.py (time calculations)
│   └── notifications.py (macOS notifications)
└── .claude/
    ├── commands/ (slash command definitions)
    └── skills/ (this skill file)
```

## Performance

- Command execution: <100ms
- Notification delivery: <500ms
- Monitor resource usage: Minimal (<1% CPU, <10MB RAM)
- State file size: <1KB

## Requirements

- **OS**: macOS (for notifications)
- **Python**: 3.6+
- **Permissions**: Notification access for Terminal/Claude Code
- **Disk**: <100KB total

## Additional Resources

For implementation details and development:
- `lib/timer.py` - Time calculation functions
- `lib/session.py` - Session state management
- `lib/notifications.py` - Notification system
- `.claude/commands/` - Slash command definitions

## License

MIT License
