# Philosophy

This is a personal hobby project, not a professional software project. The
collection and the fun are the point; software ceremony is not. Prefer
simplicity, YAGNI, the owner's caprice, and vibes over corporatism, bureaucracy,
rigid process, and overengineering. A clear local solution, even repeated,
beats a sophisticated abstraction. Optimize for happy paths and handle edge
cases when they appear. The stakes are low; good enough is good enough.

# Tooling

Build the site with HTML and CSS; add plain browser JavaScript only for behavior
HTML cannot provide. Keep the site usable by opening `index.html` directly. Use
the existing Node and Python maintainer tools as needed. Any new language,
dependency, framework, package manager, build step, or dev server requires
explicit human approval.

# Catalog Source Of Truth

The Plate Catalog in `src/data/plate-catalog.js` is authoritative. Keep catalog
facts there and derive presentation from them. Use the canonical language in
`CONTEXT.md`. After changing the Plate Catalog or its Selected Assets, run
`node tools/audit-catalog.js`.

# Collection Photos

Treat full-size photos, including unselected alternates, as collection
material. Preserve them unless the user explicitly approves deletion.

# Task Guides

- **Plate-photo intake:** Follow `docs/agents/plate-photo-intake.md` when the
  user places uncropped JPEGs in the repository for collection use.
- **Presentation:** Consult `.stitch/DESIGN.md` for visual design or visible
  copy changes. Preserve keyboard access, modal focus and Escape behavior, lazy
  thumbnail loading, and catalog-derived alt text. Open `index.html` directly
  and inspect the result.
- **Domain changes:** Follow `docs/agents/domain.md` when changing domain
  vocabulary, catalog structure, or architectural decisions.
- **Issues and PRDs:** Follow `docs/agents/issue-tracker.md` for local issue and
  PRD work; external pull requests are not a triage surface.
- **Triage:** Follow `docs/agents/triage-labels.md` when assigning triage roles.

# Git

Use conventional commit titles: `<type>(<scope>): <subject>`. Keep the subject
imperative and 50 characters or less. Wrap commit body lines at 72 characters or
less.

Keep commits atomic: one logical repo change per commit.
