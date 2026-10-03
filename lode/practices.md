# Practices

Patterns and practices for working on this project. Split into focused files if this grows past ~250 lines.

## Lode Coding

- All persistent project memory lives in `lode/`. It is the AI's memory; summarize it, don't dump it.
- Lode is **descriptive** (what the system is). Repeatable procedures are **skills**, not lode files.
- A lode file covers exactly one topic, stays under 250 lines, and links related lodes by relative path.
- Lode describes **current state**, not a changelog. Update in place; never append "added X on date Y".
- Diagrams are **Mermaid only**.
- Session scraps and handovers go in `lode/tmp/` (git-ignored). Only durable learnings enter the main lode.
- If lode contradicts code, code wins: summarize the disparity and ask the owner to confirm the lode fix.
- Workflow: chat-mode design first, implement only after a decision, then immediately update the lode.

## Working with the project owner

- The owner makes final decisions and owns the code. The AI is memory + fast executor.
- Lead with the conclusion; cut hedges; frameworks over examples; plain verbs over figurative ones.
- No emotional preamble, no emojis, no "would you like me to" — just do it.
- One follow-up question maximum.

## Rebuild discipline

- The reference tool is a **behavioral spec**, not an implementation blueprint. Match behavior, not structure.
- Record each architecture decision as it is made; do not invent architecture ahead of the owner's direction.
- Prefer capturing a design in `lode/architecture/` before writing code for it.
