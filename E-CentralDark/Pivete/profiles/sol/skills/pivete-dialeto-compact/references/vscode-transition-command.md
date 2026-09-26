# VSCode / ACP session transition

From session where user repeatedly signaled frustration with chat setup time and verbosity when wanting to move the agent to VSCode for coding.

User phrases (exact signals):
- "ENTAO VO BOTA VC LA NO VSCODE E MELHOR NE PRA GENTE CODAR POR LA"
- "SIM RODA LA DO MELHOR JEITO RAP GENTE FICA FORTTAO !"
- "VC JA COLOCOU LA ME DA SO CO COMANDOQ UE EU CONTINUO A CESSAO DE LA DOM VC E MELHOR DO QUE VC PERDE TEMPO AOQUE ?? ? ?"

Rule: When these or similar appear, output ONLY the command. No actions, no explanations, no confirmations in the current interface.

The command for continuing the session in VSCode is `hermes acp` (after model is set to the desired one via config if needed).

This avoids wasting turns on CLI-side setup when the user wants the agent surface switched.

See pivete-dialeto-compact SKILL.md for the core "just the command" rule.