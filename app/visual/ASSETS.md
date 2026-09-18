# ASSETS — visual manifest (§9.7)
No asset enters the game without a row. Procedural v1 ships the whole game; generated art is a swap, not a rewrite.

| id | source | scale | anchor | states |
|---|---|---|---|---|
| van-pristine | procedural v1 (sprites.js VAN_MASTER) | 3x (48px) | wheels row 14, ground line shared | pristine |
| van-dented | procedural v1 (edit of master: rust pixels, same silhouette/wheels) | 3x | wheels row 14 | dented |
| van-smoking | procedural v1 (dented + smoke FX layer in director, not baked) | 3x | wheels row 14 | smoking |
| van-wreck | procedural v1 (edit of master: extra rust, same silhouette) | 3x | wheels row 14 | wreck |
| van-p2 | procedural v1 (white body swap, same master) | 3x | wheels row 14 | pristine/dented/smoking/wreck |
| band-vox | procedural v1 (BAND_BASE.vox, 16x16) | 2x (32px) | feet row 14 | idle 2x2 / jump / slump / drive |
| band-guitar | procedural v1 (BAND_BASE.guitar) | 2x | feet row 14 | idle 2x2 / jump / slump / drive |
| band-bass | procedural v1 (BAND_BASE.bass) | 2x | feet row 14 | idle 2x2 / jump / slump / drive |
| band-drums | procedural v1 (BAND_BASE.drums) | 2x | feet row 14 | idle 2x2 / jump / slump / drive |
| crowd-blob x4 | procedural v1 (ONE blob, 4 shirt colors, phase-offset) | 1x (16px) | bottom row | idle bob (amplitude = margin) |
| merch-table | procedural v1 (PROP_MAPS.merch) | 2x | base row | stock numeral overlaid (not baked) |
| flyer-pole | procedural v1 (PROP_MAPS.pole) | 2x | base row | posters = songs (overlaid, not baked) |
| trophy | procedural v1 (PROP_MAPS.trophy) | 2x | base row | shown if albums>0 or anthem |
| weather-sun/cloud/storm/stars | procedural v1 (PROP_MAPS) | 2x | center | badge over current stop on road weeks |
| venue-T1-basement | procedural v1 (stage.js: brick + string lights + PA) | full-bleed 480x360 | — | static + band/crowd layers |
| venue-T2-club | procedural v1 (stage.js: neon sign accent + wedges) | full-bleed | — | sign text = venue name (not baked) |
| venue-T3-hall | procedural v1 (stage.js: balcony + sweeping beams) | full-bleed | — | beams margin-scaled |
| venue-W-main | procedural v1 (stage.js: arch + sky/pyro) | full-bleed | — | pyro on win (FX layer) |
| fx-confetti/pyro/dust | procedural v1 (director particles, pooled ≤220, auto-remove) | 3-5px rects | — | additive pyro/glow, alpha smoke/dust |
| marquee | canvas text blit (venue name, WKn, W/L stamp) | — | — | WIN gold / rough gray |

Scale profiles locked from idle; body sheets body-only; FX composited at runtime by director.js.
QC gate (M3): centered subjects, stable anchors, no edge-crosstalk — fail repeats redraws.

## Perf audit (M6)
- Frame budget: map ≈80 draw calls (road, dashes, houses, stops, van) + stage ≈105
  worst case (backdrop, 4 band, props, 64 crowd, verdict) ≈185 total, under the 200 cap.
- 30fps cap (`acc < 33` skip), clamped delta (`min(raw, 50ms)`), loop sleeps when the
  tab is hidden or both scenes are static >60 frames.
- Sprites parsed ONCE at boot into offscreen canvases; no per-frame allocation in hot
  paths. Particles pooled (≤160 per layer), auto-remove on life expiry.
- `prefers-reduced-motion` → static frames, captions still update. Dev FPS probe:
  load with `?fps=1` to mirror FPS into `document.title` (never shipped default).
