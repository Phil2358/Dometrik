\# AGENTS.md



\## Scope

These instructions apply to the entire repository.



\## Core rules

\- Make the smallest possible change that solves the requested task.

\- Do not modify files unrelated to the task.

\- Preserve existing behavior unless the task explicitly asks to change it.

\- Preserve UTF-8 encoding and existing line endings.

\- Do not introduce unusual Unicode characters, smart quotes, or locale-dependent formatting changes.

\- Do not rename files, move files, or refactor broadly unless explicitly requested.



\## Files to avoid unless explicitly requested

\- package-lock.json

\- yarn.lock

\- pnpm-lock.yaml

\- build output

\- generated files

\- platform/native configuration files

\- assets and exported snapshots



\## Number and formatting safety

\- Do not change number parsing, decimal separators, currency symbols, rounding, or display formatting unless explicitly requested.

\- Treat all user-visible calculations, totals, subtotals, percentages, and cost displays as high-risk areas.

\- When editing calculation logic, preserve display formatting unless the task explicitly includes formatting changes.



\## Code change policy

\- Prefer minimal diffs over broad cleanup.

\- Do not perform repo-wide search/replace unless explicitly requested.

\- Do not edit comments, text labels, or copy unless the task explicitly asks for it.

\- Do not change imports, dependencies, or package versions unless required for the task.



\## Validation

\- After making changes, explain exactly which files were changed and why.

\- Report any uncertainty clearly.

\- If tests exist, run only the relevant tests.

\- If no tests exist, say so explicitly instead of pretending validation happened.



\## For this project

\- This is a cost-estimator app. Calculation accuracy and numeric display consistency are critical.

\- Any change affecting totals, subtotals, sliders, factors, or scenario outputs must be treated carefully and kept as isolated as possible.

