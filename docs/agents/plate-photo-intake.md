# Plate Photo Intake

Use this workflow for plate-photo intake: the user has placed uncropped JPEGs
in the repository to add or replace Selected Assets, retain unselected
alternates, or add new Variants.

1. **Inventory the drop.** Read the repository instructions and `CONTEXT.md`,
   then inspect `git status`. Identify every newly dropped JPEG and separate it
   from pre-existing worktree changes. View each source at original resolution
   and compare its framing with established full-size plate photos. When a photo
   contains multiple plates, identify the intended plate from its filename or
   ask the user before cropping.

   **Done when:** every dropped JPEG has one identified crop target and every
   unrelated worktree change is excluded from the task.

2. **Preserve and crop.** Record each source checksum, rename `<stem>.jpg` to
   `<stem>_orig.jpg`, and create the cropped `<stem>.jpg` from that preserved
   source. Apply one axis-aligned crop at the source pixel resolution. Use a
   lossless JPEG crop tool when available; retain a few surrounding pixels when
   its block alignment requires them. Keep the full physical plate edge in the
   crop, including a frame when it obscures the plate edge. If another object
   overlaps the target, leave the overlap intact and flag it for review.

   The output is a crop only: no scaling, rotation, perspective correction,
   retouching, generated pixels, or AI image editing.

   **Done when:** every source has an unchanged `_orig.jpg`, every original-name
   file is a valid smaller JPEG containing the complete target plate, and the
   recorded checksums prove the preserved sources are byte-identical.

3. **Gate: obtain crop approval.** Present every crop to the user with its
   dimensions and any unavoidable surrounding or overlapping content. Keep all
   `_orig.jpg` files in place. Stop before proposing repository destinations or
   changing catalog assets. Revise rejected crops and repeat this gate.

   **Done when:** the user has explicitly approved every crop.

4. **Propose a disposition for every crop.** Inspect the Plate Catalog and the
   existing full-size assets before proposing changes. Full-size JPEGs live
   under `assets/plates/full/<category>/`; Selected Asset paths are relative to
   that root, and `assets/reference/` is not a catalog asset source. Use
   lowercase snake_case for category folders and asset filenames, and
   lowercase kebab-case for Variant IDs. Present one row per crop with these
   fields:

   - current crop filename;
   - proposed Category, Variant Title, and destination path;
   - selected or unselected;
   - replace an existing asset or preserve it;
   - required Plate Catalog change; and
   - `_orig.jpg` disposition.

   Treat every destination collision as a decision. A preserved alternate may
   use an established numeric suffix such as `_2`; an unselected photo may use
   a concise descriptive suffix. For a new Variant, verify uncertain official
   terminology, propose its ID and Photo Status, and place it in Catalog Order.
   Leave repository assets and the Plate Catalog unchanged during this step.

   **Done when:** every crop has one explicit proposed path and no overwrite,
   selection state, catalog change, or source deletion is implicit.

5. **Gate: obtain integration approval.** Ask the user to approve or revise the
   complete disposition table. Stop before moving crops, overwriting assets,
   deleting `_orig.jpg` files, or editing the Plate Catalog.

   **Done when:** the user has explicitly approved every row, including the
   fate of existing assets and the preserved sources.

6. **Apply the approved disposition.** Move each crop to its approved full-size
   path. Preserve or replace existing assets exactly as approved. Delete an
   untracked `_orig.jpg` only when its approved disposition says to delete it,
   and report that Git cannot recover it. Reference selected assets from
   `src/data/plate-catalog.js`; leave unselected assets unreferenced. Add or
   update Variants using the approved facts and preserve Catalog Order. Generate
   matching thumbnails under `assets/plates/thumbs/<category>/` after every
   full-size asset is in place. Pass only the approved Selected Asset paths to
   `python3 tools/make_thumbs.py <full-size-path>...`; do not generate thumbnails
   for unselected collection photos.

   **Done when:** every approved full-size asset and matching thumbnail exists,
   the Plate Catalog references exactly the approved Selected Assets, intended
   unselected assets remain unreferenced, preserved assets still exist, and no
   dropped crop remains at the repository root.

7. **Verify and report.** Visually inspect the placed full-size assets and their
   thumbnails. Run `node tools/audit-catalog.js` after all moves and catalog
   edits are complete. Inspect `git diff --check`, the diff, and `git status`
   for unintended changes. Report the resulting paths, selection states,
   replacements, preserved assets, and verification results. Stop before
   committing.

   **Done when:** all required checks pass and every worktree change is accounted
   for in the approved disposition.

8. **Gate: commit on request.** After explicit commit authorization, stage only
   the accounted-for paths and create one atomic Conventional Commit. Use an
   imperative title under 50 characters. Write the body as a concise,
   reader-facing list with one bullet per affected plate. Lead each bullet with
   the plate-level outcome, such as `Add` or `Replace`, and use the public plate
   name. Mention a special disposition only when it changes how the result
   should be understood, such as `(unselected asset)`. Omit filenames,
   thumbnail generation, and other implementation details unless they are the
   substance of the change. Keep body lines within 72 characters. Do not push
   without explicit authorization.

   **Done when:** the commit exists, every affected plate is represented by one
   outcome-focused body bullet, and the worktree is clean.
