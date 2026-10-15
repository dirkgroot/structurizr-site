# Practices

Patterns and practices relevant to this project.

- Chat-mode first - architecture is discussed and settled in chat before code is written (Lode Coding workflow).
- Locked-decisions only - only choices the user states explicitly are treated as decided. Everything else is an open fork recorded in [architecture/open-questions.md](architecture/open-questions.md); analysis may list options and trade-offs but never silently promotes one to a decision.
- Immediate capture - when the user locks a decision, the corresponding architecture lode file is updated before moving on.
- Facts vs inference - lode entries separate observed facts (source: repo, docs, release notes) from inference; inferences are marked. When lode content contradicts code, code wins.
- Parity source of truth - for feature questions, the original tool's repo/docs are the reference: [background/original-tool.md](background/original-tool.md).
