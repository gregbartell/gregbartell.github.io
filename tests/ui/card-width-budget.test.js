#!/usr/bin/env node
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");

const stylesheet = fs.readFileSync(
    path.join(__dirname, "../../styles.css"),
    "utf8"
);

assert.match(
    stylesheet,
    /\.plate-grid\s*{[^}]*minmax\(328px,\s*1fr\)/s
);

console.log("Card width budget tests passed.");
