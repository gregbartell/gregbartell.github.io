#!/usr/bin/env node
const assert = require("assert/strict");
const { spawnSync } = require("child_process");

const result = spawnSync(process.execPath, ["scripts/audit_catalog.js"], {
    encoding: "utf8",
});

assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /Catalog audit passed\./);
assert.match(
    result.stdout,
    /Unselected local images \(informational, not catalog failures\):/
);
assert.match(
    result.stdout,
    /- pics\/colleges\/esc\.jpg \(matching thumbnail: pics\/thumbs\/colleges\/esc\.jpg\)/
);

console.log("Catalog audit tests passed.");
