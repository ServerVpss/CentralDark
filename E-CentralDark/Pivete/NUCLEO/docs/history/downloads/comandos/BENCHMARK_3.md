# Evaluation Report

Evaluation of the `physical-ai-neural-reconstruction` skill before publication through NVSkills-Eval.

This benchmark summarizes 3-Tier Evaluation from NVSkills-Eval results for the skill. The goal is to document whether the skill is safe, discoverable, effective, and useful for agents before it is published for broader workflow use.

## Evaluation Summary

- Skill: `physical-ai-neural-reconstruction`
- Evaluation date: 2026-05-28
- NVSkills-Eval profile: `external`
- Overall verdict: PASS
- Tier 3 live agent evaluation: not available in this report

## Agents Used

- Tier 3 agent details were not available in this report.

## Metrics Used

Reported benchmark dimensions:

- Security: checks whether skill-assisted execution avoids unsafe behavior such as secret leakage, destructive commands, or unauthorized access.
- Correctness: checks whether the agent follows the expected workflow and produces the correct final output.
- Discoverability: checks whether the agent loads the skill when relevant and avoids using it when irrelevant.
- Effectiveness: checks whether the agent performs measurably better with the skill than without it.
- Efficiency: checks whether the agent uses fewer tokens and avoids redundant work.

Underlying evaluation signals used in this run:

- No Tier 3 evaluation signal details were available in this report.

## Test Tasks

Tier 3 evaluation task details were not available in this report.

## Results

Tier 3 dimension rollup was not available in this report.

## Tier 1: Static Validation Summary

Tier 1 validation passed with observations. NVSkills-Eval ran 9 checks and found 6 total findings.

Top findings:

- MEDIUM SCHEMA/body_recommended_section: Missing recommended section: '## Instructions' (`skills/physical-ai-neural-reconstruction/SKILL.md`)
- MEDIUM SCHEMA/body_recommended_section: Missing recommended section: '## Examples' (`skills/physical-ai-neural-reconstruction/SKILL.md`)
- MEDIUM SECURITY/Unknown (SDI-2): The reference document instructs an AI agent to clone an external GitHub repository and execute a sequence of shell comm (`references/upstream-fetch.md:25`)
- MEDIUM SECURITY/Unknown (SDI-1): The skill manifest explicitly states 'Do NOT use for infra setup' yet the reference document provides detailed infrastru (`references/upstream-fetch.md:20`)
- MEDIUM SECURITY/Unknown (SQP-2): The markdown instructs git clone, git pull, mkdir, and checkout operations without any warning to the user about side ef (`references/upstream-fetch.md:25`)

## Tier 2: Deduplication Summary

Tier 2 validation passed. NVSkills-Eval ran 2 checks and found 0 total findings.

Notable observations:

- Context Deduplication: Collected 7 file(s)
- Inter-Skill Deduplication: Parsed skill 'physical-ai-neural-reconstruction': 149 char description

## Publication Recommendation

The skill is suitable to proceed toward NVSkills-Eval publication based on this benchmark. Skill owners should keep this file with the skill and refresh it when the evaluation dataset, skill behavior, or target agents materially change.
k8s/reference.md:
  "# Verify" in components/osmo-azure/reference.md (lines 86-89)
  vs "# Verify" in components/osmo-k8s/reference.md (lines 71-74) (`components/osmo-azure/reference.md:86`)
- HIGH DUPLICATE/duplicate: Duplicate content found across components/cluster-azure/scripts/preflight.sh and components/cluster-microk8s/scripts/preflight.sh and components/inference-azure/scripts/preflight.sh and components/inference-nim-operator/scripts/preflight.sh and components/inference-nvcf/scripts/preflight.sh and components/osmo-azure/scripts/preflight.sh and components/osmo-cli/scripts/preflight.sh and components/osmo-k8s/scripts/preflight.sh:
  "check_min_version()" in components/cluster-azure/scripts/preflight.sh (lines 118-129)
  vs "check_min_version()" in components/cluster-microk8s/scripts/preflight.sh (lines 62-73)
  vs "check_min_version()" in components/inference-azure/scripts/preflight.sh (lines 110-121)
  vs "check_min_version()" in components/inference-nim-operator/scripts/preflight.sh (lines 47-58)
  vs "check_min_version()" in components/inference-nvcf/scripts/preflight.sh (lines 47-58)
  vs "check_min_version()" in components/osmo-azure/scripts/preflight.sh (lines 110-121)
  vs "check_min_version()" in components/osmo-cli/scripts/preflight.sh (lines 42-53)
  vs "check_min_version()" in components/osmo-k8s/scripts/preflight.sh (lines 48-59) (`components/cluster-azure/scripts/preflight.sh:118`)
- HIGH DUPLICATE/duplicate: Duplicate content found across components/cluster-azure/scripts/preflight.sh and components/cluster-microk8s/scripts/preflight.sh and components/inference-azure/scripts/preflight.sh and components/inference-nim-operator/scripts/preflight.sh and components/inference-nvcf/scripts/preflight.sh and components/osmo-azure/scripts/preflight.sh and components/osmo-k8s/scripts/preflight.sh:
  "require_cmds()" in components/cluster-azure/scripts/preflight.sh (lines 30-39)
  vs "require_cmds()" in components/cluster-microk8s/scripts/preflight.sh (lines 17-26)
  vs "require_cmds()" in components/inference-azure/scripts/preflight.sh (lines 22-31)
  vs "require_cmds()" in components/inference-nim-operator/scripts/preflight.sh (lines 19-28)
  vs "require_cmds()" in components/inference-nvcf/scripts/preflight.sh (lines 19-28)
  vs "require_cmds()" in components/osmo-azure/scripts/preflight.sh (lines 22-31)
  vs "require_cmds()" in components/osmo-k8s/scripts/preflight.sh (lines 20-29) (`components/cluster-azure/scripts/preflight.sh:30`)
- HIGH DUPLICATE/duplicate: Duplicate content found across components/cluster-azure/scripts/preflight.sh and components/inference-nim-operator/scripts/preflight.sh and components/osmo-azure/scripts/preflight.sh and components/osmo-k8s/scripts/preflight.sh:
  "kubectl_version()" in components/cluster-azure/scripts/preflight.sh (lines 139-145)
  vs "kubectl_semver()" in components/inference-nim-operator/scripts/preflight.sh (lines 60-65)
  vs "kubectl_semver()" in components/osmo-azure/scripts/preflight.sh (lines 123-128)
  vs "kubectl_semver()" in components/osmo-k8s/scripts/preflight.sh (lines 61-66) (`components/cluster-azure/scripts/preflight.sh:139`)

## Publication Recommendation

The skill should be reviewed before NVSkills-Eval publication. Skill owners should address the findings above and rerun NVSkills-Eval to refresh this benchmark.
