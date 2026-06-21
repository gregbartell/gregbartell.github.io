# AGENTS.md

## Maintenance

- Open `index.html` directly in a browser to view the site.
- Run `python3 scripts/make_thumbs.py` after adding full-size JPEGs under `pics/`.
- Run `node scripts/audit_catalog.js` after changing catalog facts.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as local markdown files under `.scratch/`; external
PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The default five-role triage vocabulary is used unchanged. See
`docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo with root `CONTEXT.md` and root `docs/adr/`. See
`docs/agents/domain.md`.
