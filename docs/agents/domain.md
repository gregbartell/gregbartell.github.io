# Domain Docs

This is a single-context repo. Agents use two sources of truth:

- `CONTEXT.md` defines the repo's canonical domain language.
- `docs/adr/` records architectural decisions.

## Before codebase work

1. Read `CONTEXT.md` completely before exploring or naming domain concepts.
2. Read every ADR that touches behavior or architecture in the requested area.

This preparation is complete when every relevant term and architectural
constraint is accounted for in the planned work.

## Canonical language

Use the terms defined in `CONTEXT.md` in code, tests, documentation, and
explanations. Use terms marked `_Avoid_` only when quoting existing material or
explaining a vocabulary mismatch.

Treat a missing or disputed concept as an unresolved terminology decision.
Resolve it with the user before establishing a canonical term, then record the
agreed language in `CONTEXT.md`.

## Architectural decisions

Surface any conflict with an existing ADR before proceeding. Name the ADR and
explain the conflict so the user can decide whether to preserve or revisit the
decision.

Record approved architectural decisions under `docs/adr/` using the existing
numbered-file style.
