# Agent Teams — Master Reference Guide

> A practical reference for building and running effective Claude Code agent teams.
> Source: https://code.claude.com/docs/en/agent-teams
> Requires Claude Code **v2.1.32+** (`claude --version`). Agent teams are **experimental** and **disabled by default**.

---

## 1. What agent teams are

Agent teams coordinate multiple Claude Code instances working together:

- **One session is the team lead** — it creates the team, spawns teammates, assigns tasks, and synthesizes results.
- **Teammates work independently**, each in its own context window, and **communicate directly with each other** (not only with the lead).
- You can **talk to any teammate directly**, not just through the lead.

This is the key difference from subagents: subagents only report back to the main agent and never talk to each other.

---

## 2. Agent teams vs. subagents

|                   | Subagents                                        | Agent teams                                         |
| :---------------- | :----------------------------------------------- | :-------------------------------------------------- |
| **Context**       | Own context window; results return to the caller | Own context window; fully independent               |
| **Communication** | Report results back to the main agent only       | Teammates message each other directly               |
| **Coordination**  | Main agent manages all work                      | Shared task list with self-coordination             |
| **Best for**      | Focused tasks where only the result matters      | Complex work requiring discussion and collaboration |
| **Token cost**    | Lower (results summarized back to main context)  | Higher (each teammate is a separate Claude instance)|

**Rule of thumb:** Use subagents when you need quick, focused workers that report back. Use agent teams when workers must share findings, challenge each other, and coordinate on their own.

---

## 3. When to use (and not use) agent teams

**Strongest use cases:**

- **Research & review** — investigate different aspects in parallel, then share/challenge findings.
- **New modules or features** — each teammate owns a separate piece without collisions.
- **Debugging with competing hypotheses** — teammates test rival theories in parallel and converge faster.
- **Cross-layer coordination** — frontend / backend / tests, each owned by a different teammate.

**Avoid for** (use a single session or subagents instead):

- Sequential tasks with many dependencies.
- Same-file edits (risk of overwrites).
- Routine work where coordination overhead and token cost aren't worth it.

---

## 4. Enabling agent teams

Set the environment variable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, via your shell or `settings.json`:

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

---

## 5. Starting a team

After enabling, describe the task **and** the team structure in natural language. Claude creates the team, spawns teammates, and coordinates.

```text
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles: one
teammate on UX, one on technical architecture, one playing devil's advocate.
```

**How teams get started:**

- **You request a team** — give a task that benefits from parallel work and ask explicitly.
- **Claude proposes a team** — if it detects parallelizable work, it may suggest one. You always confirm first; Claude never creates a team without approval.

---

## 6. Architecture

| Component     | Role                                                                       |
| :------------ | :------------------------------------------------------------------------- |
| **Team lead** | Main session: creates the team, spawns teammates, coordinates work          |
| **Teammates** | Separate Claude Code instances, each working assigned tasks                 |
| **Task list** | Shared list of work items teammates claim and complete                      |
| **Mailbox**   | Messaging system for inter-agent communication                             |

**Local storage (auto-generated, auto-removed):**

- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

Both directories exist only while the team is active and are removed on cleanup or session end.

- The team config holds runtime state (session IDs, tmux pane IDs) and a `members` array (name, agent ID, agent type). **Don't edit or pre-author it** — it's overwritten on every state update. Teammates can read it to discover other members.
- There is **no project-level team config**. A `.claude/teams/teams.json` in your project is treated as an ordinary file, not configuration.

The system manages task dependencies automatically: completing a task unblocks dependents without manual intervention.

---

## 7. Display modes

| Mode          | Behavior                                                               | Requirements             |
| :------------ | :-------------------------------------------------------------------- | :----------------------- |
| **in-process**| All teammates run in your main terminal; cycle with **Shift+Down**     | Any terminal             |
| **split panes**| Each teammate gets its own pane; click in to interact                 | tmux **or** iTerm2       |

`teammateMode` default is `"auto"` (split panes if already in tmux or iTerm2, otherwise in-process). `"tmux"` enables split-pane mode and auto-detects tmux vs. iTerm2.

```json
// ~/.claude/settings.json
{
  "teammateMode": "in-process"
}
```

Force in-process for one session:

```bash
claude --teammate-mode in-process
```

**Split-pane setup:**

- **tmux** — install via system package manager. On iTerm2, `tmux -CC` is the suggested entrypoint. tmux works best on macOS.
- **iTerm2** — install the `it2` CLI, then enable **iTerm2 → Settings → General → Magic → Enable Python API**.

Split panes are **not** supported in VS Code's integrated terminal, Windows Terminal, or Ghostty.

**In-process navigation:**

- **Shift+Down** — cycle through teammates (wraps back to lead after the last one).
- **Enter** — view a teammate's session; **Escape** — interrupt their current turn.
- **Ctrl+T** — toggle the task list.

---

## 8. Controlling the team

All control is via natural-language instructions to the lead.

### Specify teammates and models

```text
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

Teammates **don't** inherit the lead's `/model` by default. Set **Default teammate model** in `/config` (choose **Default (leader's model)** to match the lead) to control the fallback when a prompt doesn't specify a model.

### Require plan approval

```text
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

The teammate works in read-only plan mode until the lead approves. On rejection it revises and resubmits. The lead approves **autonomously** — steer it with criteria in your prompt (e.g., "only approve plans that include test coverage").

### Talk to teammates directly

Each teammate is a full, independent session.

- **In-process** — Shift+Down to select, then type to message.
- **Split-pane** — click into the pane and interact.

### Assign and claim tasks

Tasks have three states: **pending → in progress → completed**, and may depend on other tasks (a pending task with unresolved deps can't be claimed).

- **Lead assigns** — tell the lead which task goes to which teammate.
- **Self-claim** — a teammate picks up the next unassigned, unblocked task after finishing.

Claiming uses **file locking** to prevent race conditions.

### Shut down a teammate

```text
Ask the researcher teammate to shut down
```

The teammate can approve (exit gracefully) or reject with an explanation.

### Clean up the team

```text
Clean up the team
```

- **Always use the lead to clean up** — teammates may not resolve team context correctly, risking inconsistent state.
- Cleanup **fails if any teammate is still running** — shut them down first.
- Claude often cleans up on its own when work is done, so a later request may report nothing to clean up.

---

## 9. Context & communication

- Each teammate has its **own context window**.
- On spawn, a teammate loads the same project context as a regular session: **CLAUDE.md, MCP servers, skills** — plus the spawn prompt.
- The **lead's conversation history does NOT carry over** → put task-specific details in the spawn prompt.

**Information sharing:**

- **Automatic message delivery** — no polling needed.
- **Idle notifications** — teammates notify the lead when they stop.
- **Shared task list** — all agents see status and claim work.
- **Direct messaging** — message a teammate by name; to reach everyone, send one message per recipient.

The lead names each teammate on spawn. For **predictable names** you can reference later, tell the lead what to call each teammate.

---

## 10. Reusable roles via subagent definitions

Reference a [subagent](https://code.claude.com/docs/en/sub-agents) type (project, user, plugin, or CLI scope) when spawning a teammate:

```text
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

- The teammate honors the definition's `tools` allowlist and `model`.
- The definition's body is **appended** to the teammate's system prompt (not replacing it).
- Team coordination tools (`SendMessage`, task management) are **always available** even when `tools` is restricted.
- **Not applied as a teammate:** the `skills` and `mcpServers` frontmatter fields. Teammates load skills/MCP from project + user settings like a normal session.

---

## 11. Permissions

- Teammates start with the **lead's** permission settings (`--dangerously-skip-permissions` propagates to all).
- You can change individual teammate modes **after** spawning, but **not** per-teammate at spawn time.
- Teammate permission prompts bubble up to the lead → **pre-approve common operations** in permission settings to reduce friction.

---

## 12. Quality gates via hooks

| Hook              | Fires when…                       | Exit code 2 effect                         |
| :---------------- | :-------------------------------- | :----------------------------------------- |
| `TeammateIdle`    | A teammate is about to go idle     | Sends feedback and keeps the teammate working |
| `TaskCreated`     | A task is being created            | Prevents creation and sends feedback        |
| `TaskCompleted`   | A task is being marked complete    | Prevents completion and sends feedback      |

---

## 13. Token usage

Agent teams use **significantly more tokens** than a single session; usage scales with the number of active teammates. Worth it for research/review/new-feature work; for routine tasks a single session is more cost-effective.

---

## 14. Best practices

1. **Give teammates enough context** — they don't inherit the lead's history. Be explicit in the spawn prompt:

   ```text
   Spawn a security reviewer teammate with the prompt: "Review the authentication
   module at src/auth/ for security vulnerabilities. Focus on token handling, session
   management, and input validation. The app uses JWT tokens stored in httpOnly
   cookies. Report any issues with severity ratings."
   ```

2. **Choose an appropriate team size** — start with **3–5 teammates**. Token cost scales linearly; coordination overhead and diminishing returns grow with size. Three focused teammates often beat five scattered ones.

3. **Size tasks appropriately** — aim for **5–6 tasks per teammate**. Too small → coordination overhead dominates; too large → long runs without check-ins risk wasted effort. Just right = self-contained unit with a clear deliverable (a function, a test file, a review). For 15 independent tasks, ~3 teammates is a good start.

4. **Wait for teammates to finish** — if the lead starts doing the work itself:
   ```text
   Wait for your teammates to complete their tasks before proceeding
   ```

5. **Start with research and review** — clear-boundary, no-code-writing tasks (PR review, library research, bug investigation) show the value without parallel-implementation coordination challenges.

6. **Avoid file conflicts** — give each teammate a different set of files; two editing the same file leads to overwrites.

7. **Monitor and steer** — check progress, redirect failing approaches, synthesize findings as they arrive. Don't let a team run unattended too long.

---

## 15. Use-case examples

### Parallel code review

```text
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

Each reviewer applies a different lens; the lead synthesizes across all three.

### Competing-hypothesis investigation

```text
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

The adversarial debate structure fights anchoring — the surviving theory is far more likely to be the real root cause.

---

## 16. Troubleshooting

| Symptom                          | Fix                                                                                                   |
| :------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **Teammates not appearing**      | Press Shift+Down (in-process). Confirm the task was complex enough. For split panes: `which tmux`; for iTerm2 verify `it2` CLI + Python API. |
| **Too many permission prompts**  | Pre-approve common operations in permission settings before spawning.                                |
| **Teammates stopping on errors** | Inspect output (Shift+Down / click pane), then give direct instructions or spawn a replacement.      |
| **Lead shuts down too early**    | Tell it to keep going; or tell it to wait for teammates before proceeding.                            |
| **Task status lags**             | Check whether work is actually done; update status manually or nudge the teammate.                    |
| **Orphaned tmux sessions**       | `tmux ls` then `tmux kill-session -t <session-name>`.                                                 |

---

## 17. Limitations (experimental)

- **No session resumption with in-process teammates** — `/resume` and `/rewind` don't restore them. After resuming, tell the lead to spawn new teammates.
- **Task status can lag** — teammates sometimes fail to mark tasks complete, blocking dependents.
- **Shutdown can be slow** — teammates finish the current request/tool call first.
- **One team at a time** — clean up before creating a new team.
- **No nested teams** — teammates can't spawn their own teams/teammates; only the lead manages the team.
- **Lead is fixed** — the creating session is lead for the team's lifetime; you can't promote/transfer.
- **Permissions set at spawn** — all teammates start with the lead's mode; per-teammate modes only changeable after spawn.
- **Split panes require tmux or iTerm2** — unsupported in VS Code integrated terminal, Windows Terminal, Ghostty.

---

## 18. Quick checklist for building an effective team

- [ ] `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` set; Claude Code v2.1.32+.
- [ ] Task genuinely benefits from parallel, independent work.
- [ ] Roles/lenses are distinct and non-overlapping.
- [ ] 3–5 teammates; ~5–6 tasks each.
- [ ] Each teammate owns a distinct set of files (no shared-file edits).
- [ ] Spawn prompts contain all needed context (history doesn't carry over).
- [ ] Predictable teammate names assigned for later reference.
- [ ] Plan approval required for risky changes, with approval criteria stated.
- [ ] Permissions pre-approved to reduce prompt friction.
- [ ] Quality gates wired via `TeammateIdle` / `TaskCreated` / `TaskCompleted` hooks if needed.
- [ ] Plan to monitor, steer, and `Clean up the team` (via the lead) when done.

---

## 19. Related approaches

- **Subagents** — lightweight in-session delegation for research/verification without inter-agent coordination.
- **Git worktrees** — run multiple Claude Code sessions manually, without automated coordination.
