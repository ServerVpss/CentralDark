# COMANDO - skill-card.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\aiq-research\skill-card.md
**SHA:** bec96647ce61f801
**Timestamp:** 2026-08-26T18:31:13.985574
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Underlying evaluation signals used in this run: <br>

### Riscos
- Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>

### Ouro Bruto (primeiros 5000 chars)
```
## Description: <br>
Use when asked to run deep research or AI-Q research through a reachable NVIDIA AI-Q Blueprint backend. <br>

This skill is ready for commercial/non-commercial use. <br>

## Owner
NVIDIA <br>

### License/Terms of Use: <br>
Apache 2.0 <br>
## Use Case: <br>
Developers and engineers who need to run deep research queries through a locally running or self-hosted NVIDIA AI-Q Blueprint backend. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [NVIDIA AI-Q Blueprint Repository](https://github.com/NVIDIA-AI-Blueprints/aiq) <br>
- [DeepResearch Bench Leaderboard](https://huggingface.co/spaces/muset-ai/DeepResearch-Bench-Leaderboard) <br>
- [DeepResearch Bench Paper](https://arxiv.org/pdf/2506.11763) <br>
- [Helper script](scripts/aiq.py) <br>


## Skill Output: <br>
**Output Type(s):** [Analysis, API Calls] <br>
**Output Format:** [JSON] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Agents Used: <br>
- Claude Code (`claude-code`) <br>
- Codex (`codex`) <br>



## Evaluation Tasks: <br>
Evaluated against 3 internal evaluation tasks (all positive skill-activation cases) with 2 attempts per task. Pass threshold: 50%. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Security: Checks whether skill-assisted execution avoids unsafe behavior such as secret leakage, destructive commands, or unauthorized access. <br>
- Correctness: Checks whether the agent follows the expected workflow and produces the correct final output. <br>
- Discoverability: Checks whether the agent loads the skill when relevant and avoids using it when irrelevant. <br>
- Effectiveness: Checks whether the agent performs measurably better with the skill than without it. <br>
- Efficiency: Checks whether the agent uses fewer tokens and avoids redundant work. <br>

Underlying evaluation signals used in this run: <br>
- `security`: Checks for unsafe operations, secret leakage, and unauthorized access. <br>
- `skill_execution`: Verifies that the agent loaded the expected skill and workflow. <br>
- `skill_efficiency`: Checks routing quality, decoy avoidance, and redundant tool usage. <br>
- `accuracy`: Grades final-answer correctness against the reference answer. <br>
- `goal_accuracy`: Checks whether the overall user task completed successfully. <br>
- `behavior_check`: Verifies expected behavior steps, including safety expectations. <br>
- `token_efficiency`: Compares token usage with and without the skill. <br>



## Evaluation Results: <br>
| Dimension | Num | `claude-code` | `codex` |
|---|---:|---:|---:|
| Security | 6 | 100% (+0%) | 92% (+8%) |
| Correctness | 6 | 73% (+18%) | 77% (+3%) |
| Discoverability | 6 | 69% (+27%) | 52% (-7%) |
| Effectiveness | 6 | 58% (+3%) | 68% (+3%) |
| Efficiency | 6 | 63% (+18%) | 49% (-7%) |

## Skill Version(s): <br>
2.1.0 (source: frontmatter) <br>

## Ethical Considerations: <br>
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications. When downloaded or used in accordance with our terms of service, developers should work with their internal team to ensure this skill meets requirements for the relevant industry and use case and addresses unforeseen product misuse. <br>

(For Release on NVIDIA Platforms Only) <br>
Please report quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://app.intigriti.com/programs/nvidia/nvidiavdp/detail). <br>

```ts requirements for the relevant industry and use case and addresses unforeseen product misuse. <br>

(For Release on NVIDIA Platforms Only) <br>
Please report quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://app.intigriti.com/programs/nvidia/nvidiavdp/detail). <br>

```

---

# COMANDO - skill-card.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-realtime-viewer\skill-card.md
**SHA:** a0554c492abf0889
**Timestamp:** 2026-08-26T18:39:38.183722
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>

### Ouro Bruto (primeiros 5000 chars)
```
## Description: <br>
Use as the top-level router for Omniverse Realtime Viewer USD app requests and focused viewer reference documents. <br>

This skill is ready for commercial/non-commercial use. <br>

## Owner
NVIDIA <br>

### License/Terms of Use: <br>
Apache-2.0 <br>
## Use Case: <br>
Developers and engineers building RTX-rendered USD viewer applications across streaming, local, and native delivery paths using NVIDIA Omniverse technologies. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [Routing](references/routing.md) <br>
- [Conventions](references/conventions.md) <br>
- [Validation](references/validation.md) <br>
- [Streaming vs Local](references/streaming-vs-local/README.md) <br>
- [USD Viewer App](references/usd-viewer-app/README.md) <br>
- [Dependencies](references/dependencies/README.md) <br>
- [Streaming Viewer Recipe](references/streaming-viewer-recipe/README.md) <br>
- [OVUI Local Viewer Recipe](references/ovui-local-viewer-recipe/README.md) <br>
- [Cloud Deployment](references/cloud-deployment/README.md) <br>
- [Troubleshooting](references/troubleshooting/README.md) <br>


## Skill Output: <br>
**Output Type(s):** [Code, Shell commands, Configuration instructions] <br>
**Output Format:** [Markdown with inline code blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Security: Checks whether skill-assisted execution avoids unsafe behavior such as secret leakage, destructive commands, or unauthorized access. <br>
- Correctness: Checks whether the agent follows the expected workflow and produces the correct final output. <br>
- Discoverability: Checks whether the agent loads the skill when relevant and avoids using it when irrelevant. <br>
- Effectiveness: Checks whether the agent performs measurably better with the skill than without it. <br>
- Efficiency: Checks whether the agent uses fewer tokens and avoids redundant work. <br>



## Skill Version(s): <br>
0.1.0 (source: frontmatter, pyproject.toml) <br>

## Ethical Considerations: <br>
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications. When downloaded or used in accordance with our terms of service, developers should work with their internal team to ensure this skill meets requirements for the relevant industry and use case and addresses unforeseen product misuse. <br>

(For Release on NVIDIA Platforms Only) <br>
Please report quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://app.intigriti.com/programs/nvidia/nvidiavdp/detail). <br>

```

---

# COMANDO - skill-card.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\skill-card.md
**SHA:** b703e2d3d3cc530e
**Timestamp:** 2026-08-26T18:39:55.537329
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>

### Ouro Bruto (primeiros 5000 chars)
```
## Description: <br>
Top-level workflow skill for USD performance diagnosis and optimization. Use for slow loading, high memory, low FPS, or 'optimize my scene' requests; delegates auth/runtime setup to Phase 0 owners. <br>

This skill is ready for commercial/non-commercial use. <br>

## Owner: NVIDIA <br>

### License/Terms of Use: <br>
Apache 2.0 <br>
## Use Case: <br>
Developers and engineers use this skill to diagnose and optimize USD scene performance — addressing slow loading, high memory usage, low FPS, and GPU crashes — within NVIDIA Omniverse workflows. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [Workflow Reference](references/workflow.md) <br>
- [Skill Map](references/skill-map.md) <br>
- [USD Structure Assessment](references/usd-structure-assessment/README.md) <br>
- [Scene Optimizer Operations](references/so-run-operations/README.md) <br>
- [USD Validation Runner](references/usd-validation-runner/README.md) <br>
- [Profile Stage](references/profile-stage/README.md) <br>
- [Compare Profiles](references/compare-profiles/README.md) <br>
- [Optimization Report](references/optimization-report/README.md) <br>
- [Setup USD Performance Tuning](references/setup-usd-performance-tuning/README.md) <br>
- [CAD Conversion Advisor](references/cad-conversion/README.md) <br>


## Skill Output: <br>
**Output Type(s):** [Analysis, Shell commands, Files] <br>
**Output Format:** [Markdown and JSON structured reports] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [Produces optimization-report JSON conforming to optimization-report.schema.json and rendered HTML/Markdown summaries] <br>

## Skill Version(s): <br>
0.1.0 (source: frontmatter, pyproject.toml) <br>

## Ethical Considerations: <br>
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications. When downloaded or used in accordance with our terms of service, developers should work with their internal team to ensure this skill meets requirements for the relevant industry and use case and addresses unforeseen product misuse. <br>

(For Release on NVIDIA Platforms Only) <br>
Please report quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://app.intigriti.com/programs/nvidia/nvidiavdp/detail). <br>

```

---

# COMANDO - skill-card.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-infrastructure-setup-and-resilient-scaling\skill-card.md
**SHA:** 4c55580838d6214e
**Timestamp:** 2026-08-26T18:40:10.652878
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>

### Ouro Bruto (primeiros 5000 chars)
```
## Description: <br>
Use when the user wants to set up, scale, validate, or harden NVIDIA physical AI infrastructure for synthetic data generation workflows across local MicroK8s or Azure AKS, including Kubernetes clusters, inference endpoint deployment, OSMO deployment, workload submission readiness, and infrastructure failure recovery. <br>

This skill is ready for commercial/non-commercial use. <br>

## Owner
NVIDIA <br>

### License/Terms of Use: <br>
Apache-2.0 <br>
## Use Case: <br>
Developers and infrastructure engineers composing cluster, inference, OSMO, and workload stages into a reproducible Physical AI synthetic data generation environment on MicroK8s or Azure AKS, then keeping the environment observable and recoverable. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [Cluster Azure Reference](components/cluster-azure/reference.md) <br>
- [Cluster MicroK8s Reference](components/cluster-microk8s/reference.md) <br>
- [NIM Operator Inference Reference](components/inference-nim-operator/reference.md) <br>
- [NVCF Inference Reference](components/inference-nvcf/reference.md) <br>
- [Azure AI Foundry Inference Reference](components/inference-azure/reference.md) <br>
- [OSMO Azure Reference](components/osmo-azure/reference.md) <br>
- [OSMO Kubernetes Reference](components/osmo-k8s/reference.md) <br>
- [OSMO CLI Reference](components/osmo-cli/reference.md) <br>


## Skill Output: <br>
**Output Type(s):** [Shell commands, Configuration instructions, Analysis] <br>
**Output Format:** [Markdown with inline bash code blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
NVSkills-Eval 3-Tier Evaluation with external profile. Tier 1 static validation ran 9 checks (13 findings). Tier 2 deduplication ran 2 checks (16 findings). Tier 3 live agent evaluation was not available. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Security: Checks whether skill-assisted execution avoids unsafe behavior such as secret leakage, destructive commands, or unauthorized access. <br>
- Correctness: Checks whether the agent follows the expected workflow and produces the correct final output. <br>
- Discoverability: Checks whether the agent loads the skill when relevant and avoids using it when irrelevant. <br>
- Effectiveness: Checks whether the agent performs measurably better with the skill than without it. <br>
- Efficiency: Checks whether the agent uses fewer tokens and avoids redundant work. <br>



## Skill Version(s): <br>
1.0.0 (source: frontmatter) <br>

## Ethical Considerations: <br>
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications. When downloaded or used in accordance with our terms of service, developers should work with their internal team to ensure this skill meets requirements for the relevant industry and use case and addresses unforeseen product misuse. <br>

(For Release on NVIDIA Platforms Only) <br>
Please report quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://app.intigriti.com/programs/nvidia/nvidiavdp/detail). <br>

```

---

# COMANDO - skill-card.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-neural-reconstruction\skill-card.md
**SHA:** cf7addb77d9155d9
**Timestamp:** 2026-08-26T18:40:15.660410
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>

### Ouro Bruto (primeiros 5000 chars)
```
## Description: <br>
Router for NVIDIA NuRec/NRE: USDZ rendering, NCore conversion, 3DGS, gRPC sensor sim, PhysicalAI HF datasets. <br>

This skill is ready for commercial/non-commercial use. <br>

## Owner
NVIDIA <br>

### License/Terms of Use: <br>
Apache 2.0 <br>
## Use Case: <br>
Developers and engineers building Physical AI applications who need to route NVIDIA Neural Reconstruction (NuRec) requests to the appropriate upstream sibling skill for 3D scene reconstruction, rendering, and sensor simulation from camera, LiDAR, or radar recordings. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: Review before execution as proposals could introduce incorrect or misleading guidance into skills. <br>
Mitigation: Review and scan skill before deployment. <br>

## Reference(s): <br>
- [Upstream NuRec Skills Repository](https://github.com/NVIDIA/nurec-skills) <br>
- [Workflows Reference](references/workflows.md) <br>
- [Upstream Fetch Reference](references/upstream-fetch.md) <br>
- [Mix-ups and Naming Overlaps](references/mix-ups.md) <br>
- [Maintenance Guide](references/maintenance.md) <br>
- [Teardown Guide](references/teardown.md) <br>


## Skill Output: <br>
**Output Type(s):** [Shell commands, Configuration instructions, Analysis] <br>
**Output Format:** [Markdown with inline bash code blocks] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [None] <br>

## Evaluation Tasks: <br>
Evaluated against NVSkills-Eval `external` profile with Tier 1 static validation (9 checks, 6 findings) and Tier 2 deduplication (2 checks, 0 findings). Overall verdict: PASS. <br>

## Evaluation Metrics Used: <br>
Reported benchmark dimensions: <br>
- Security: Checks whether skill-assisted execution avoids unsafe behavior such as secret leakage, destructive commands, or unauthorized access. <br>
- Correctness: Checks whether the agent follows the expected workflow and produces the correct final output. <br>
- Discoverability: Checks whether the agent loads the skill when relevant and avoids using it when irrelevant. <br>
- Effectiveness: Checks whether the agent performs measurably better with the skill than without it. <br>
- Efficiency: Checks whether the agent uses fewer tokens and avoids redundant work. <br>



## Skill Version(s): <br>
0.3.0 (source: frontmatter) <br>

## Ethical Considerations: <br>
NVIDIA believes Trustworthy AI is a shared responsibility and we have established policies and practices to enable development for a wide array of AI applications. When downloaded or used in accordance with our terms of service, developers should work with their internal team to ensure this skill meets requirements for the relevant industry and use case and addresses unforeseen product misuse. <br>

(For Release on NVIDIA Platforms Only) <br>
Please report quality, risk, security vulnerabilities or NVIDIA AI Concerns [here](https://app.intigriti.com/programs/nvidia/nvidiavdp/detail). <br>

```