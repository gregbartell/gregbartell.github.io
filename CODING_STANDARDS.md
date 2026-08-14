# Coding Standards

This is a hobby repo, not an enterprise project. The collection and the fun are
the point, so write code that serves the site as it exists today.

Follow the hard repository rules in `AGENTS.md`. Within them:

- Choose the simplest local solution that handles the requested happy path.
- Prefer obvious code to layers, patterns, configuration, and flexibility.
- A little duplication is cheaper than an abstraction the repo has not earned.
- Spend complexity only on a real problem present in the current change.
- Match nearby code and leave unrelated code alone.

Good enough is the standard: the requested behavior works, the relevant check
passes, and a future agent can understand the change without learning a
miniature architecture.
