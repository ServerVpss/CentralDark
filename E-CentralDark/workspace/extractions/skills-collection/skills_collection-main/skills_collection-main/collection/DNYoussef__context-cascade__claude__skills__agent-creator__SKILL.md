---
name: agent-creator
version: 2.2.0
description: Creates specialized AI agents with optimized system prompts using the official 5-phase SOP methodology (v2.0 adds Phase 0 expertise loading), combined with evidence-based prompting techniques and Claude Agent SDK implementation. Use this skill when creating production-ready agents for specific domains, workflows, or tasks requiring consistent high-quality performance with deeply embedded domain knowledge. Integrates with recursive improvement loop.
---

# Agent Creator - Enhanced with 5-Phase SOP Methodology (v2.0)

This skill provides the **official comprehensive framework** for creating specialized AI agents, integrating the proven 5-phase methodology (v2.0 adds Phase 0 for expertise loading) from Desktop .claude-flow with Claude Agent SDK implementation and evidence-based prompting techniques.

## When to Use This Skill

Use agent-creator for:
- Creating project-specialized agents with deeply embedded domain knowledge
- Building agents for recurring tasks requiring consistent behavior
- Rewriting existing agents to optimize performance
- Creating multi-agent workflows with sequential or parallel coordination
- Agents that will integrate with MCP servers and Claude Flow

## MCP Requirements

This skill requires the following MCP servers for optimal functionality:

### memory-mcp (6.0k tokens)

**Purpose**: Store agent specifications, design decisions, and metadata for cross-session persistence and pattern learning.

**Tools Used**:
- `mcp__memory-mcp__memory_store`: Store agent specs, cognitive frameworks, and design patterns
- `mcp__memory-mcp__vector_search`: Retrieve similar agent patterns for reuse

**Activation** (PowerShell):
```powershell
# Check if already active
claude mcp list

# Add if not present
claude mcp add memory-mcp node C:\Users\17175\memory-mcp\build\index.js
```

**Usage Example**:
```javascript
// Store agent specification
await mcp__memory-mcp__memory_store({
  text: `Agent: ${agentName}. Role: ${roleTitle}. Domains: ${expertiseDomains}. Capabilities: ${coreCapabilities}. Commands: ${specialistCommands}`,
  metadata: {
    key: `agents/${agentName}/specification`,
    namespace: "agent-creation",
    layer: "long-term",
    category: "agent-architecture",
    tags: {
      WHO: "agent-creator",
      WHEN: new Date().toISOString(),
      PROJECT: agentName,
      WHY: "agent-specification"
    }
  }
});

// Retrieve similar agent patterns
const similarAgents = await mcp__memory-mcp__vector_search({
  query: `Agent for ${domain} with capabilities ${capabilities}`,
  limit: 5
});
```

**Token Cost**: 6.0k tokens (3.0% of 200k context)
**When to Load**: When creating new agents or optimizing existing agent architectures

## The 5-Phase Agent Creation Methodology (v2.0)

**Source**: Desktop `.claude-flow/` official SOP documentation + Recursive Improvement System
**Total Time**: 2.5-4 hours per agent (first-time), 1.5-2 hours (speed-run)

This methodology was developed through systematic reverse engineering of fog-compute agent creation and validated through production use. **v2.0 adds Phase 0 for expertise loading and recursive improvement integration.**

### Phase 0: Expertise Loading (5-10 minutes) [NEW]

**Objective**: Load domain expertise before beginning agent creation.

**Activities**:
1. **Detect Domain**
   - What domain does this agent operate in?
   - Examples: authentication, payments, ML, frontend, etc.

2. **Check for Expertise File**
   ```bash
   # Check if expertise exists
   ls .claude/expertise/{domain}.yaml
   ```

3. **Load If Available**
   ```yaml
   if expertise_exists:
     - Run: /expertise-validate {domain}
     - Load: file_locations, patterns, known_issues
     - Context: Agent inherits domain knowledge
   else:
     - Flag: Discovery mode - agent will learn
     - After: Generate expertise from agent creation
   ```

4. **Apply to Agent Design**
   - Use expertise.file_locations for code references
   - Use expertise.patterns for conventions
   - Use expertise.known_issues to prevent bugs

**Validation Gate**:
- [ ] Checked for domain expertise
- [ ] Loaded expertise if available
- [ ] Flagged for discovery if not

**Outputs**:
- Domain expertise context (if available)
- Discovery mode flag (if not)

---

### Phase 1: Initial Analysis & Intent Decoding (30-60 minutes)

**Objective**: Deep domain understanding through systematic research, not assumptions.

**Activities**:
1. **Domain Breakdown**
   - What problem does this agent solve?
   - What are the key challenges in this domain?
   - What patterns do human experts use?
   - What are common failure modes?

2. **Technology Stack Mapping**
   - What tools, frameworks, libraries are used?
   - What file types, formats, protocols?
   - What integrations or APIs?
   - What configuration patterns?

3. **Integration Points**
   - What MCP servers will this agent use?
   - What other agents will it coordinate with?
   - What data flows in/out?
   - What memory patterns needed?

**Validation Gate**:
- [ ] Can describe domain in specific, technical terms
- [ ] Identified 5+ key challenges
- [ ] Mapped technology stack comprehensively
- [ ] Clear on integration requirements

**Outputs**:
- Domain analysis document
- Technology stack inventory
- Integration requirements list

---

### Phase 2: Meta-Cognitive Extraction (30-45 minutes)

**Objective**: Identify the cognitive expertise domains activated when you reason about this agent's tasks.

**Activities**:
1. **Expertise Domain Identification**
   - What knowledge domains are activated when you think about this role?
   - What heuristics, patterns, rules-of-thumb?
   - What decision-making frameworks?
   - What quality standards?

2. **Agent Specification Creation**
   ```markdown
   # Agent Specification: [Name]

   ## Role & Expertise
   - Primary role: [Specific title]
   - Expertise domains: [List activated domains]
   - Cognitive patterns: [Heuristics used]

   ## Core Capabilities
   1. [Capability with specific examples]
   2. [Capability with specific examples]
   ...

   ## Decision Frameworks
   - When X, do Y because Z
   - Always check A before B
   - Never skip validation of C

   ## Quality Standards
   - Output must meet [criteria]
   - Performance measured by [metrics]
   - Failure modes to prevent: [list]
   ```

3. **Supporting Artifacts**
   - Create examples of good vs bad outputs
   - Document edge cases
   - List common pitfalls

**Validation Gate**:
- [ ] Identified 3+ expertise domains
- [ ] Documented 5+ decision heuristics
- [ ] Created complete agent specification
- [ ] Examples demonstrate quality standards

**Outputs**:
- Agent specification document
- Example outputs (good/bad)
- Edge case inventory

---

### Phase 3: Agent Architecture Design (45-60 minutes)

**Objective**: Transform specification into production-ready base system prompt.

**Activities**:
1. **System Prompt Structure Design**

   ```markdown
   # [AGENT NAME] - SYSTEM PROMPT v1.0

   ## 🎭 CORE IDENTITY

   I am a **[Role Title]** with comprehensive, deeply-ingrained knowledge of [domain]. Through systematic reverse engineering and domain expertise, I possess precision-level understanding of:

   - **[Domain Area 1]** - [Specific capabilities from Phase 2]
   - **[Domain Area 2]** - [Specific capabilities from Phase 2]
   - **[Domain Area 3]** - [Specific capabilities from Phase 2]

   My purpose is to [primary objective] by leveraging [unique expertise].

   ## 📋 UNIVERSAL COMMANDS I USE

   **File Operations**:
   - /file-read, /file-write, /glob-search, /grep-search
   WHEN: [Specific situations from domain analysis]
   HOW: [Exact patterns]

   **Git Operations**:
   - /git-status, /git-commit, /git-push
   WHEN: [Specific situations]
   HOW: [Exact patterns]

   **Communication & Coordination**:
   - /memory-store, /memory-retrieve
   - /agent-delegate, /agent-escalate
   WHEN: [Specific situations]
   HOW: [Exact patterns with namespace conventions]

   ## 🎯 MY SPECIALIST COMMANDS

   [List role-specific commands with exact syntax and examples]

   ## 🔧 MCP SERVER TOOLS I USE

   **Claude Flow MCP**:
   - mcp__claude-flow__agent_spawn
     WHEN: [Specific coordination scenarios]
     HOW: [Exact function call patterns]

   - mcp__claude-flow__memory_store
     WHEN: [Cross-agent data sharing]
     HOW: [Namespace pattern: agent-role/task-id/data-type]

   **[Other relevant MCP servers from Phase 1]**

   ## 🧠 COGNITIVE FRAMEWORK

   ### Self-Consistency Validation
   Before finalizing deliverables, I validate from multiple angles:
   1. [Domain-specific validation 1]
   2. [Domain-specific validation 2]
   3. [Cross-check with standards]

   ### Program-of-Thought Decomposition
   For complex tasks, I decompose BEFORE execution:
   1. [Domain-specific decomposition pattern]
   2. [Dependency analysis]
   3. [Risk assessment]

   ### Plan-and-Solve Execution
   My standard workflow:
   1. PLAN: [Domain-specific planning]
   2. VALIDATE: [Domain-specific validation]
   3. EXECUTE: [Domain-specific execution]
   4. VERIFY: [Domain-specific verification]
   5. DOCUMENT: [Memory storage patterns]

   ## 🚧 GUARDRAILS - WHAT I NEVER DO

   [From Phase 2 failure modes and edge cases]

   **[Failure Category 1]**:
   ❌ NEVER: [Dangerous pattern]
   WHY: [Consequences from domain knowledge]

   WRONG:
     [Bad example]

   CORRECT:
     [Good example]

   ## ✅ SUCCESS CRITERIA

   Task complete when:
   - [ ] [Domain-specific criterion 1]
   - [ ] [Domain-specific criterion 2]
   - [ ] [Domain-specific criterion 3]
   - [ ] Results stored in memory
   - [ ] Relevant agents notified

   ## 📖 WORKFLOW EXAMPLES

   ### Workflow 1: [Common Task Name from Phase 1]

   **Objective**: [What this achieves]

   **Step-by-Step Commands**:
   ```yaml
   Step 1: [Action]
     COMMANDS:
       - /[command-1] --params
       - /[command-2] --params
     OUTPUT: [Expected]
     VALIDATION: [Check]

   Step 2: [Next Action]
     COMMANDS:
       - /[command-3] --params
     OUTPUT: [Expected]
     VALIDATION: [Check]
   ```

   **Timeline**: [Duration]
   **Dependencies**: [Prerequisites]
   ```

2. **Evidence-Based Technique Integration**

   For each technique (from existing agent-creator skill):
   - Self-consistency: When to use, how to apply
   - Program-of-thought: Decomposition patterns
   - Plan-and-solve: Planning frameworks

   Integrate these naturally into the agent's methodology.

3. **Quality Standards & Guardrails**

   From Phase 2 failure modes, create explicit guardrails:
   - What patterns to avoid
   - What validations to always run
   - When to escalate vs. retry
   - Error handling protocols

**Validation Gate**:
- [ ] System prompt follows template structure
- [ ] All Phase 2 expertise embedded
- [ ] Evidence-based techniques integrated
- [ ] Guardrails cover identified failure modes
- [ ] 2+ workflow examples with exact commands

**Outputs**:
- Base system prompt (v1.0)
- Cognitive framework specification
- Guardrails documentation

---

### Phase 4: Deep Technical Enhancement (60-90 minutes)

**Objective**: Reverse-engineer exact implementation patterns and document with precision.

**Activities**:
1. **Code Pattern Extraction**

   For technical agents, extract EXACT patterns from codebase:
   ```markdown
   ## Code Patterns I Recognize

   ### Pattern: [Name]
   **File**: `path/to/file.py:123-156`

   ```python
   class ExamplePattern:
       def __init__(
           self,
           param1: Type = default,  # Line 125: Exact default
           param2: Type = default   # Line 126: Exact default
       ):
           # Extracted from actual implementation
           pass
   ```

   **When I see this pattern, I know**:
   - [Specific insight about architecture]
   - [Specific constraint or requirement]
   - [Common mistake to avoid]
   ```

2. **Critical Failure Mode Documentation**

   From experience and domain knowledge:
   ```markdown
   ## Critical Failure Modes

   ### Failure: [Name]
   **Severity**: Critical/High/Medium
   **Symptoms**: [How to recognize]
   **Root Cause**: [Why it happens]
   **Prevention**:
     ❌ DON'T: [Bad pattern]
     ✅ DO: [Good pattern with exact code]

   **Detection**:
     ```bash
     # Exact command to detect this failure
     [command]
     ```
   ```

3. **Integration Patterns**

   Document exact MCP tool usage:
   ```markdown
   ## MCP Integration Patterns

   ### Pattern: Cross-Agent Data Sharing
   ```javascript
   // Exact pattern for storing outputs
   mcp__claude-flow__memory_store({
     key: "marketing-specialist/campaign-123/audience-analysis",
     value: {
       segments: [...],
       targeting: {...},
       confidence: 0.89
     },
     ttl: 86400
   })
   ```

   **Namespace Convention**:
   - Format: `{agent-role}/{task-id}/{data-type}`
   - Example: `backend-dev/api-v2/schema-design`
   ```

4. **Performance Metrics**

   Define what to track:
   ```markdown
   ## Performance Metrics I Track

   ```yaml
   Task Completion:
     - /memory-store --key "metrics/[my-role]/tasks-completed" --increment 1
     - /memory-store --key "metrics/[my-role]/task-[id]/duration" --value [ms]

   Quality:
     - validation-passes: [count successful validations]
     - escalations: [count when needed help]
     - error-rate: [failures / attempts]

   Efficiency:
     - commands-per-task: [avg commands used]
     - mcp-calls: [tool usage frequency]
   ```

   These metrics enable continuous improvement.
   ```

**Validation Gate**:
- [ ] Code patterns include file/line references
- [ ] Failure modes have detection + prevention
- [ ] MCP patterns show exact syntax
- [ ] Performance metrics defined
- [ ] Agent can self-improve through metrics

**Outputs**:
- Enhanced system prompt (v2.0)
- Code pattern library
- Failure mode handbook
- Integration pattern guide
- Metrics specification

---

## Integrated Agent Creation Process

Combining 5-phase SOP (v2.0) with existing best practices:

### Complete Workflow

0. **Phase 0: Expertise Loading** (5-10 min) [NEW in v2.0]
   - Detect domain from request
   - Check for expertise file
   - Load if available, flag discovery mode if not
   - Output: Expertise context or discovery flag

1. **Phase 1: Domain Analysis** (30-60 min)
   - Research domain systematically
   - Map technology stack
   - Identify integration points
   - Output: Domain analysis doc

2. **Phase 2: Expertise Extraction** (30-45 min)
   - Identify cognitive domains
   - Create agent specification
   - Document decision frameworks
   - Output: Agent spec + examples

3. **Phase 3: Architecture Design** (45-60 min)
   - Draft base system prompt
   - Integrate evidence-based techniques
   - Add quality guardrails
   - Output: Base prompt v1.0

4. **Phase 4: Technical Enhancement** (60-90 min)
   - Extract code patterns
   - Document failure modes
   - Define MCP integrations
   - Add performance metrics
   - Output: Enhanced prompt v2.0

5. **SDK Implementation** (30-60 min)
   - Implement with Claude Agent SDK
   - Configure tools and permissions
   - Set up MCP servers
   - Output: Production agent

6. **Testing & Validation** (30-45 min)
   - Test typical cases
   - Test edge cases
   - Test error handling
   - Verify consistency
   - Output: Test report

7. **Documentation & Packaging** (15-30 min)
   - Create agent README
   - Document usage examples
   - Package supporting files
   - Output: Complete agent package

**Total Time**: 3.5-5.5 hours (first-time), 2-3 hours (speed-run) [+5-10 min for Phase 0]

---

## Claude Agent SDK Implementation

Once system prompt is finalized, implement with SDK:

### TypeScript Implementation

```typescript
import { query, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

// Custom domain-specific tools
const domainTool = tool({
  name: 'domain_operation',
  description: 'Performs domain-specific operation',
  parameters: z.object({
    param: z.string()
  }),
  handler: async ({ param }) => {
    // Implementation from Phase 4
    return { result: 'data' };
  }
});

// Agent configuration
for await (const message of query('Perform domain task', {
  model: 'claude-sonnet-4-5',
  systemPrompt: enhancedPromptV2,  // From Phase 4
  permissionMode: 'acceptEdits',
  allowedTools: ['Read', 'Write', 'Bash', domainTool],
  mcpServers: [{
    command: 'npx',
    args: ['claude-flow@alpha', 'mcp', 'start'],
    env: { ... }
  }],
  settingSources: ['user', 'project']
})) {
  console.log(message);
}
```

### Python Implementation

```python
from claude_agent_sdk import query, tool, ClaudeAgentOptions
import asyncio

@tool()
async def domain_operation(param: str) -> dict:
    """Domain-specific operation from Phase 4."""
    # Implementation
    return {"result": "data"}

async def run_agent():
    options = ClaudeAgentOptions(
        model='claude-sonnet-4-5',
        system_prompt=enhanced_prompt_v2,  # From Phase 4
        permission_mode='acceptEdits',
        allowed_tools=['Read', 'Write', 'Bash', domain_operation],
        mcp_servers=[{
            'command': 'npx',
            'args': ['claude-flow@alpha', 'mcp', 'start']
        }],
        setting_sources=['user', 'project']
    )

    async for message in query('Perform domain task', **options):
        print(message)

asyncio.run(run_agent())
```

---

## Agent Specialization Patterns

From existing agent-creator skill, enhanced with 5-phase methodology (v2.0):

### Analytical Agents

**Phase 0 Focus**: Load domain expertise for data patterns
**Phase 1 Focus**: Evidence evaluation patterns, data quality standards
**Phase 2 Focus**: Analytical heuristics, validation frameworks
**Phase 3 Focus**: Self-consistency checking, confidence calibration
**Phase 4 Focus**: Statistical validation code, error detection patterns

### Generative Agents

**Phase 0 Focus**: Load domain expertise for output conventions
**Phase 1 Focus**: Quality criteria, template patterns
**Phase 2 Focus**: Creative heuristics, refinement cycles
**Phase 3 Focus**: Plan-and-solve frameworks, requirement tracking
**Phase 4 Focus**: Generation patterns, quality validation code

### Diagnostic Agents

**Phase 0 Focus**: Load domain expertise for known issues
**Phase 1 Focus**: Problem patterns, debugging workflows
**Phase 2 Focus**: Hypothesis generation, systematic testing
**Phase 3 Focus**: Program-of-thought decomposition, evidence tracking
**Phase 4 Focus**: Detection scripts, root cause analysis patterns

### Orchestration Agents

**Phase 0 Focus**: Load domain expertise for workflow patterns
**Phase 1 Focus**: Workflow patterns, dependency management
**Phase 2 Focus**: Coordination heuristics, error recovery
**Phase 3 Focus**: Plan-and-solve with dependencies, progress tracking
**Phase 4 Focus**: Orchestration code, retry logic, escalation paths

---

## Testing & Validation

From existing framework + SOP enhancements:

### Test Suite Creation

1. **Typical Cases** - Expected behavior on common tasks
2. **Edge Cases** - Boundary conditions and unusual inputs
3. **Error Cases** - Graceful handling and escalation
4. **Integration Cases** - End-to-end workflow with other agents
5. **Performance Cases** - Speed, efficiency, resource usage

### Validation Checklist

- [ ] **Identity**: Agent maintains consistent role
- [ ] **Commands**: Uses universal commands correctly
- [ ] **Specialist Skills**: Demonstrates domain expertise
- [ ] **MCP Integration**: Coordinates via memory and tools
- [ ] **Guardrails**: Prevents identified failure modes
- [ ] **Workflows**: Executes examples successfully
- [ ] **Metrics**: Tracks performance data
- [ ] **Code Patterns**: Applies exact patterns from Phase 4
- [ ] **Error Handling**: Escalates appropriately
- [ ] **Consistency**: Produces stable outputs on repeat

---

## Quick Reference

### When to Use Each Phase

**Phase 0 (Expertise Loading)** [NEW in v2.0]:
- Always - Check for existing domain expertise first
- Skip search thrash if expertise available
- Enables discovery mode if expertise missing

**Phase 1 (Analysis)**:
- Always - Required foundation
- Especially for domains you're less familiar with

**Phase 2 (Expertise Extraction)**:
- Always - Captures cognitive patterns
- Essential for complex reasoning tasks

**Phase 3 (Architecture)**:
- Always - Creates base system prompt
- Critical for clear behavioral specification

**Phase 4 (Enhancement)**:
- For production agents
- For technical domains requiring exact patterns
- When precision and failure prevention are critical

### Speed-Run Approach (Experienced Creators)

0. **Phase 0** (5 min): Quick expertise check
1. **Combined Phase 1+2** (30 min): Rapid domain analysis + spec
2. **Phase 3** (30 min): Base prompt from template
3. **Phase 4** (45 min): Code patterns + failure modes
4. **Testing** (15 min): Quick validation suite

**Total**: 2 hours 5 min for experienced creators with templates

---

## Examples from Production

### Example: Marketing Specialist Agent

See: `docs/agent-architecture/agents-rewritten/MARKETING-SPECIALIST-AGENT.md`

**Phase 0 Output**: Loaded marketing domain expertise (if available)
**Phase 1 Output**: Marketing domain analysis, tools (Google Analytics, SEMrush, etc.)
**Phase 2 Output**: Marketing expertise (CAC, LTV, funnel optimization, attribution)
**Phase 3 Output**: Base prompt with 9 specialist commands
**Phase 4 Output**: Campaign workflow patterns, A/B test validation, ROI calculations

**Result**: Production-ready agent with deeply embedded marketing expertise

---

## Maintenance & Iteration

### Continuous Improvement

1. **Metrics Review**: Weekly review of agent performance metrics
2. **Failure Analysis**: Document and fix new failure modes
3. **Pattern Updates**: Add newly discovered code patterns
4. **Workflow Optimization**: Refine based on usage patterns

### Version Control

- v1.0: Base prompt from Phase 3
- v1.x: Minor refinements from testing
- v2.0: Enhanced with Phase 4 patterns
- v2.x: Production iterations and improvements

---

## Summary

This enhanced agent-creator skill combines:
- Phase 0: Expertise Loading (NEW in v2.0)
- Phase 1-4: Official SOP methodology (Desktop .claude-flow)
- Evidence-based prompting techniques (self-consistency, PoT, plan-and-solve)
- Claude Agent SDK implementation (TypeScript + Python)
- Production validation and testing frameworks
- Continuous improvement through metrics
- Recursive improvement loop integration

Use this methodology to create agents with:
- Deeply embedded domain knowledge
- Exact command and MCP tool specifications
- Production-ready failure prevention
- Measurable performance tracking

## Cross-Skill Coordination

Agent Creator works with:
- **skill-forge**: To improve agent-creator itself
- **prompt-architect**: To optimize agent system prompts
- **eval-harness**: To validate created agents

See: `.claude/skills/META-SKILLS-COORDINATION.md` for full coordination matrix.

## GraphViz Diagram

Create `agent-creator-process.dot` to visualize the 5-phase workflow:

```dot
digraph AgentCreator {
    rankdir=TB;
    compound=true;
    node [shape=box, style=filled, fontname="Arial"];

    start [shape=ellipse, label="Start:\nAgent Request", fillcolor=lightgreen];
    end [shape=ellipse, label="Complete:\nProduction Agent", fillcolor=green, fontcolor=white];

    subgraph cluster_phase0 {
        label="Phase 0: Expertise Loading";
        fillcolor=lightyellow;
        style=filled;
        p0 [label="Load Domain\nExpertise"];
    }

    subgraph cluster_phase1 {
        label="Phase 1: Analysis";
        fillcolor=lightblue;
        style=filled;
        p1 [label="Domain\nBreakdown"];
    }

    subgraph cluster_phase2 {
        label="Phase 2: Extraction";
        fillcolor=lightblue;
        style=filled;
        p2 [label="Meta-Cognitive\nExtraction"];
    }

    subgraph cluster_phase3 {
        label="Phase 3: Architecture";
        fillcolor=lightblue;
        style=filled;
        p3 [label="System Prompt\nDesign"];
    }

    subgraph cluster_phase4 {
        label="Phase 4: Enhancement";
        fillcolor=lightblue;
        style=filled;
        p4 [label="Technical\nPatterns"];
    }

    eval [shape=octagon, label="Eval Harness\nGate", fillcolor=orange];

    start -> p0;
    p0 -> p1;
    p1 -> p2;
    p2 -> p3;
    p3 -> p4;
    p4 -> eval;
    eval -> end [label="pass", color=green];
    eval -> p1 [label="fail", color=red, style=dashed];

    labelloc="t";
    label="Agent Creator: 5-Phase Workflow (v2.0)";
    fontsize=16;
}
```

**Next**: Begin agent creation using this enhanced methodology.

---

## Recursive Improvement Integration (v2.0)

Agent Creator is part of the recursive self-improvement loop:

### Role in the Loop

```
Agent Creator (FOUNDRY)
    |
    +--> Creates auditor agents (prompt, skill, expertise, output)
    +--> Creates domain experts
    +--> Can be improved BY the loop
```

### Input/Output Contracts

```yaml
input_contract:
  required:
    - domain: string  # What domain the agent operates in
    - purpose: string  # What the agent should accomplish
  optional:
    - expertise_file: path  # Pre-loaded expertise
    - similar_agents: list  # Reference agents
    - constraints: list  # Specific requirements

output_contract:
  required:
    - agent_file: path  # Created agent markdown
    - test_cases: list  # Validation tests
    - version: semver  # Agent version
  optional:
    - expertise_delta: object  # Learnings to add to expertise
    - metrics: object  # Creation performance metrics
```

### Eval Harness Integration

Created agents are tested against:

```yaml
benchmark: agent-generation-benchmark-v1
  tests:
    - has_identity_section
    - has_capabilities
    - has_guardrails
    - has_memory_integration
  minimum_scores:
    completeness: 0.8
    specificity: 0.75
    integration: 0.7

regression: agent-creator-regression-v1
  tests:
    - identity_section_present (must_pass)
    - capabilities_defined (must_pass)
    - guardrails_included (must_pass)
    - memory_integration_specified (must_pass)
```

### Memory Namespace

```yaml
namespaces:
  - agent-creator/specifications/{agent}: Agent specs
  - agent-creator/generations/{id}: Created agents
  - agent-creator/metrics: Performance tracking
  - improvement/audits/agent-creator: Audits of this skill
```

### Uncertainty Handling

When requirements are unclear:

```yaml
confidence_check:
  if confidence >= 0.8:
    - Proceed with agent creation
    - Document assumptions
  if confidence 0.5-0.8:
    - Present 2-3 agent design options
    - Ask user to select approach
    - Document uncertainty areas
  if confidence < 0.5:
    - DO NOT proceed
    - List what is unclear
    - Ask specific clarifying questions
    - NEVER fabricate requirements
```

---

## !! SKILL COMPLETION VERIFICATION (MANDATORY) !!

**After invoking this skill, you MUST complete ALL items below before proceeding:**

### Completion Checklist

- [ ] **Agent Spawning**: Did you spawn at least 1 agent via Task()?
  - Example: `Task("Agent Name", "Task description", "agent-type-from-registry")`

- [ ] **Agent Registry Validation**: Is your agent from the registry?
  - Registry location: `claude-code-plugins/ruv-sparc-three-loop-system/agents/`
  - Valid categories: delivery, foundry, operations, orchestration, platforms, quality, research, security, specialists, tooling
  - NOT valid: Made-up agent names

- [ ] **TodoWrite Called**: Did you call TodoWrite with 5+ todos?
  - Example: `TodoWrite({ todos: [8-10 items covering all work] })`

- [ ] **Work Delegation**: Did you delegate to agents (not do work yourself)?
  - CORRECT: Agents do the implementation via Task()
  - WRONG: You write the code directly after reading skill

### Correct Pattern After Skill Invocation

```javascript
// After Skill("<skill-name>") is invoked:
[Single Message - ALL in parallel]:
  Task("Agent 1", "Description of task 1...", "agent-type-1")
  Task("Agent 2", "Description of task 2...", "agent-type-2")
  Task("Agent 3", "Description of task 3...", "agent-type-3")
  TodoWrite({ todos: [
    {content: "Task 1 description", status: "in_progress", activeForm: "Working on task 1"},
    {content: "Task 2 description", status: "pending", activeForm: "Working on task 2"},
    {content: "Task 3 description", status: "pending", activeForm: "Working on task 3"},
  ]})
```

### Wrong Pattern (DO NOT DO THIS)

```javascript
// WRONG - Reading skill and then doing work yourself:
Skill("<skill-name>")
// Then you write all the code yourself without Task() calls
// This defeats the purpose of the skill system!
```

**The skill is NOT complete until all checklist items are checked.**

---

**Remember the pattern: Skill() -> Task() -> TodoWrite() - ALWAYS**

