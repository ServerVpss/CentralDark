#!/usr/bin/env bash
# Health check script for Hermes-Casa
# Outputs short status or detailed report if issues

# Function to get memory usage of a process by name (sum of WorkingSet)
get_proc_mem() {
    local name="$1"
    tasklist /FI "IMAGENAME eq $name" /FO CSV /NH 2>/dev/null | awk -F, '{gsub(/"/,"",$5); gsub(/ K/,"",$5); sum+=$5} END {print sum+0}'
}

# Function to get count of processes with a name
get_proc_count() {
    local name="$1"
    tasklist /FI "IMAGENAME eq $name" /FO CSV /NH 2>/dev/null | wc -l
}

# Function to get Not Responding processes
get_not_responding() {
    tasklist /FI "STATUS eq Not Responding" /FO CSV /NH 2>/dev/null | wc -l
}

# Function to get CPU load percentage
get_cpu_load() {
    wmic cpu get loadpercentage /value 2>/dev/null | grep -i LoadPercentage | cut -d= -f2 | tr -d '\r'
}

# Function to get total and used memory (RAM) via wmic OS
get_mem_info() {
    local line
    line=$(wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value 2>/dev/null)
    local total=$(echo "$line" | grep -i TotalVisibleMemorySize | cut -d= -f2 | tr -d '\r')
    local free=$(echo "$line" | grep -i FreePhysicalMemory | cut -d= -f2 | tr -d '\r')
    # Convert from KB to MB
    printf "%.0f %.0f" "$(echo "$total/1024" | bc -l 2>/dev/null || echo 0)" "$(echo "(($total-$free)/1024)" | bc -l 2>/dev/null || echo 0)"
}

# Main check
CPU_LOAD=$(get_cpu_load)
MEM_INFO=$(get_mem_info)
RAM_TOTAL_MB=$(echo "$MEM_INFO" | awk '{print $1}')
RAM_USED_MB=$(echo "$MEM_INFO" | awk '{print $2}')
RAM_FREE_MB=$((RAM_TOTAL_MB - RAM_USED_MB))

# Thresholds (adjusted for earlier detection)
CPU_THRESHOLD=70          # percent
RAM_USED_THRESHOLD=70     # percent of total
NOT_RESPONDING_THRESHOLD=0 # any not responding is suspect
PROC_HIGH_MEM_THRESHOLD=300 # MB per process (suspect if any single process > this)

# Collect suspect processes
SUSPECTS=""
# Check each target process
for proc in ChatGPT.exe codex.exe Hermes.exe python.exe pwsh.exe Code.exe; do
    count=$(get_proc_count "$proc")
    if [[ $count -gt 0 ]]; then
        mem=$(get_proc_mem "$proc")
        if (( mem > PROC_HIGH_MEM_THRESHOLD )); then
            SUSPECTS="$SUSPECTS\n$proc: ${mem}MB ($count instâncias)"
        fi
    fi
done

# Check Not Responding
NR_COUNT=$(get_not_responding)
if [[ $NR_COUNT -gt 0 ]]; then
    SUSPECTS="$SUSPECTS\nNot Responding: $NR_COUNT processos"
fi

# Determine status
if [[ -z $SUSPECTS && $CPU_LOAD -le $CPU_THRESHOLD && $((RAM_USED_MB * 100 / RAM_TOTAL_MB)) -le $RAM_USED_THRESHOLD ]]; then
    echo "🟢 saudável"
    exit 0
else
    # Detailed report
    echo "🔴 intervenção necessária"
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "CPU Load: $CPU_LOAD%"
    echo "RAM: $RAM_USED_MB MB used / $RAM_TOTAL_MB MB total ($((RAM_USED_MB * 100 / RAM_TOTAL_MB))% used)"
    echo -e "Suspects:$SUSPECTS"
    # Optionally list top memory consumers
    echo "Top 5 processos por memória:"
    tasklist /FO CSV /NH 2>/dev/null | awk -F, '{gsub(/"/,"",$2); gsub(/ K/,"",$5); print $5, $2}' | sort -rn | head -5 | awk '{printf "  %s MB -> %s\\n", $1, $2}'
    exit 0
fi