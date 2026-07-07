#!/usr/bin/env node
// Deterministic audit of the Markdown game-design document repository.
//
// Checks the conventions from SHARED-INSTRUCTIONS.md that a machine can verify:
// broken relative links, orphaned files, missing Draft appendices, unintegrated
// Draft notes, missing related-links closers, and emojis. Judgment checks
// (reciprocal links, voice, single source of truth) belong to the assistant.
//
// Usage: node check_docs.mjs [repo_root]
// Exit code 1 when broken links or missing Draft sections are found.

import { readdirSync, readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

const PLUMBING = new Set([
  "README.md", "CLAUDE.md", "AGENTS.md", "SHARED-INSTRUCTIONS.md", "Design-backlog.md",
]);
const SKIP_DIRS = new Set([".claude", ".git", ".codex", ".github", "node_modules"]);

const LINK_ANGLE = /\[[^\]]*\]\(<([^>]+)>\)/g;
const LINK_PLAIN = /\[[^\]]*\]\(([^()<>\s]+)\)/g;
const EMOJI = /[\u{1F000}-\u{1FAFF}☀-⛿✀-➿\u{FE0F}]/u;

function mdFiles(dir, root, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) mdFiles(full, root, out);
    } else if (entry.name.toLowerCase().endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}

// Links quoted inside fenced code blocks or inline code spans are examples,
// not navigation — strip code before extracting links.
function stripCode(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
}

function* linksIn(text) {
  const prose = stripCode(text);
  for (const regex of [LINK_ANGLE, LINK_PLAIN]) {
    regex.lastIndex = 0;
    for (const match of prose.matchAll(regex)) yield match[1];
  }
}

function main() {
  const root = path.resolve(process.argv[2] ?? ".");
  const files = mdFiles(root, root);
  const known = new Set(files.map((f) => path.resolve(f)));

  const broken = [];        // [file, raw link]
  const inbound = new Set(); // resolved paths at least one file links to
  const missingDraft = [];
  const dirtyDraft = [];
  const missingRelated = [];
  const emojiHits = [];     // [file, line number]

  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const rel = path.relative(root, f).replaceAll("\\", "/");
    const base = path.basename(f);

    for (const raw of linksIn(text)) {
      let target = raw.split("#")[0].trim();
      try { target = decodeURIComponent(target); } catch { /* keep raw */ }
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      const resolved = path.resolve(path.dirname(f), target);
      if (existsSync(resolved)) {
        if (known.has(resolved) && resolved !== path.resolve(f)) inbound.add(resolved);
      } else {
        broken.push([rel, raw]);
      }
    }

    if (!PLUMBING.has(base)) {
      const draftIdx = text.indexOf("## Draft");
      if (draftIdx === -1) {
        missingDraft.push(rel);
      } else {
        const leftover = text
          .slice(draftIdx + "## Draft".length)
          .replace(/<!--[\s\S]*?-->/g, "")
          .trim();
        if (leftover) dirtyDraft.push(rel);
      }
      if (!text.includes("Continue Reading") && !text.includes("See also")
          && !text.includes("Further Reading")) {
        missingRelated.push(rel);
      }
    }

    text.split(/\r?\n/).forEach((line, i) => {
      if (EMOJI.test(line)) emojiHits.push([rel, i + 1]);
    });
  }

  const orphans = [...known]
    .filter((p) => !inbound.has(p) && !PLUMBING.has(path.basename(p)))
    .map((p) => path.relative(root, p).replaceAll("\\", "/"))
    .sort();

  const section = (title, items, fmt = (x) => x) => {
    console.log(`\n== ${title} (${items.length}) ==`);
    if (items.length === 0) console.log("  none");
    for (const item of items) console.log(`  ${fmt(item)}`);
  };

  console.log(`doc-audit: scanned ${files.length} Markdown files under ${root}`);
  section("Broken links", broken, ([f, l]) => `${f} -> ${l}`);
  section("Orphaned files (no inbound links)", orphans);
  section("Missing '## Draft' appendix", missingDraft);
  section("Unintegrated Draft notes", dirtyDraft);
  section("Missing Continue Reading / See also", missingRelated);
  section("Emoji occurrences", emojiHits, ([f, n]) => `${f}:${n}`);

  const failed = broken.length > 0 || missingDraft.length > 0;
  console.log(`\nResult: ${failed ? "FAIL" : "PASS"} (broken links and missing Draft sections are failures; the rest are warnings)`);
  process.exitCode = failed ? 1 : 0;
}

main();
