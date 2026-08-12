# Issue Tracker: Local Markdown

The authoritative issue tracker is `.scratch/`. Git ignores this directory, so
its contents remain local to the working copy. GitHub Issues and pull requests
are outside this workflow unless the user explicitly brings one into scope.

## Layout

An effort may contain:

    .scratch/<effort>/
    ├── spec.md
    ├── issues/
    │   └── <NN>-<slug>.md
    └── map.md

`map.md` is used only for a Wayfinding effort.

## Specs and implementation issues

- Store the effort's specification at `.scratch/<effort>/spec.md`.
- Store each implementation issue in its own file under
  `.scratch/<effort>/issues/`.
- Number issues from `01` in dependency order, with blockers before their
  dependents.
- Record dependencies in a `**Blocked by:**` field near the top of each issue.
  Use `None — can start immediately.` when there are no blockers.
- Record exactly one triage state in a `**Status:**` field. Use the values in
  `docs/agents/triage-labels.md`.
- Append later discussion under a `## Comments` heading.

When given an exact path, read that file. When given only an issue number, look
inside the named or active effort. Ask which effort the user means only when
the number is ambiguous.

## Wayfinding

Wayfinding plans an effort through a map and a set of decision tickets.

- **Map:** `.scratch/<effort>/map.md` is the canonical index. Its body contains
  `## Destination`, `## Notes`, `## Decisions so far`,
  `## Not yet specified`, and `## Out of scope`.
- **Decision ticket:** Store each ticket at
  `.scratch/<effort>/issues/<NN>-<slug>.md`. Put its question under
  `## Question`.
- **Type:** Record `**Type:** research`, `prototype`, `grilling`, or `task`.
  Grilling resolves a decision through direct conversation with the user.
- **Lifecycle:** Record `**Status:** open`, `claimed`, or `resolved`.
  Wayfinding lifecycle values replace the ordinary triage states for these
  tickets.
- **Blocking:** List blocking ticket numbers in `**Blocked by:**`. A ticket is
  unblocked when every listed ticket is `resolved`.
- **Frontier:** The frontier is the set of `open`, unblocked tickets. Choose the
  lowest-numbered ticket first.
- **Claim:** Set the ticket to `claimed` and save it before beginning work.
- **Resolve:** Append the result under `## Answer`, set the ticket to
  `resolved`, and add a linked one-line gist under the map's
  `## Decisions so far`.
