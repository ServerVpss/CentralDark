# Truncated output is not proof

This reference captures one recurring failure mode seen in this session:
a command's output was truncated in the tool result, and the visible tail was later
treated like a full result.

Rules:
1. If the tool output says it was truncated, do not read the visible end as the whole story.
2. If the action depends on the full output, re-run with a smaller window, paginate, or
   switch to a tool that can page through the artifact (read_file, session scroll, etc.).
3. Do not declare PASS/FAIL/green/done from a truncated view unless the task only needs
   the part that was actually observed and that part is sufficient by design.

Related:
- SKILL.md "Pitfall — structural fix or green proxy is not runtime proof"
