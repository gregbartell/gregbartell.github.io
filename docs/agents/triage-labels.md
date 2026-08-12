# Triage Labels

Local Markdown issues represent triage labels as values in their
`**Status:**` field. An ordinary implementation issue has exactly one of these
states:

| Status              | Meaning                                              |
| ------------------- | ---------------------------------------------------- |
| `needs-triage`      | The maintainer needs to evaluate the issue.           |
| `needs-info`        | Work is waiting for requested information.            |
| `ready-for-agent`   | An agent can implement the fully specified issue.     |
| `ready-for-human`   | The issue requires human judgment, access, or action. |
| `wontfix`           | The issue will not be implemented.                    |

Wayfinding decision tickets use the separate lifecycle states documented in
`docs/agents/issue-tracker.md`.
