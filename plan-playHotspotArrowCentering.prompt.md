# Plan: Play Hotspot Arrow Centering

## Objective
Ensure the arrow remains visually centered for **play hotspots** when hotspot width is small, while leaving **drag hotspot** behavior unchanged.

## Confirmed Scope
- Center all play hotspots by default.
- Do not modify drag hotspot arrows.
- No UI/flow changes beyond arrow alignment behavior.

## Root Cause Summary
1. The arrow pseudo-element currently relies on `transform: translateX(-50%)` for horizontal centering.
2. The bounce animation also writes to `transform`, which overrides horizontal centering.
3. When hotspot width becomes small, this conflict causes visible horizontal drift.

## Implementation Plan
1. Update the play-hotspot arrow CSS in `labs/exp3/simulation-page.html` so centering and animation do not fight over the same `transform` value.
2. Keep horizontal centering (`translateX(-50%)`) persistent in base styling.
3. Rework animation to affect only vertical motion while preserving horizontal centering at all times.
4. Apply this fix only to play hotspot arrow styles; avoid touching `.drop-zone`/drag hotspot arrow rules.
5. Verify steps with small play hotspot widths still render arrow centered at different viewport sizes.

## Validation Checklist
- Arrow remains centered in small play hotspots.
- Bounce animation still works.
- Drag hotspot arrows remain unchanged in placement and behavior.
- No regressions in other exp3 simulation steps.

## Notes for Refinement
- If any play step intentionally depends on non-centered arrow behavior, handle with explicit per-step overrides after the baseline centering fix.
- Keep changes minimal and localized to avoid retuning existing drag-step hotspot offsets.