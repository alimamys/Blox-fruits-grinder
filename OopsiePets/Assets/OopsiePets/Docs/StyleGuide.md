# Oopsie Pets! — Visual Style Guide

Every generated or hand-made asset follows this guide. The `STYLE` block below is pasted
verbatim at the start of every image-generation prompt (see `Art/asset_manifest.json`).

## Style statement
Premium preschool storybook: soft, rounded, chubby shapes; clean deep-plum outlines; gentle
cel shading lit from the upper left; pastel candy colors; everything looks squeezable.

## Palette (hex)
| Role | Hex | Name |
|---|---|---|
| Outline / ink | `#5B4565` | deep plum |
| Pink | `#FFC8DD` | pastel pink |
| Lavender | `#CDB4DB` | lavender |
| Mint | `#B9F3D9` | mint green |
| Turquoise | `#A0E7E5` | light turquoise |
| Blue | `#BDE0FE` | baby blue |
| Peach | `#FFD6BA` | peach |
| Cream | `#FFF6E5` | cream |
| Yellow | `#FFF1A8` | soft yellow |
| Accent | `#FF8FB8` | candy pink (celebrations, hearts) |
| Shadow tint | `#B9A3C9` | lavender shadow (never black) |

In code, every color comes from `Scripts/Core/Palette.cs`.

## Characters
- **Proportions:** chibi baby animals; head ≈ 55% of total height; body a soft pear shape;
  stubby legs; small paws. Front-facing, sitting, symmetrical (easy to rig).
- **Outline:** deep plum `#5B4565`, even weight ≈ 6 px at 1024 px.
- **Shading:** one soft cel-shadow band (lavender-tinted, not gray) on the lower-right; a soft
  highlight on the upper-left of the head; rosy cheek blush ovals.
- **Eyes (drawn in code-matched style, `Art/Characters/Shared`):** big vertical ovals in deep
  plum, two white highlights (large upper-left, small lower-right). Expressions: open, blink
  (curved line), happy (upside-down U arcs), surprised (round with small pupils).
- **Mouths:** small "w"/smile, open laugh (plum with pink tongue), small "o" surprise, sneeze.
- **Layers per pet (for rigging):** body, head (face blank: nose + blush only), left ear,
  right ear, tail. Eyes and mouths are shared overlay sprites, so every pet blinks and smiles
  identically well.
- **Accessory anchors:** `Hat` (top of head), `Eyes` (eye line), `Neck` (head/body seam),
  `HeadSide` (bow, upper-right of head).

## Animation conventions (code-driven, `PetAnimator`)
- Idle: breathing squash-stretch on body (±2.5%, 2.2 s), head bob, blink every 2–5 s,
  tail sway, occasional ear twitch.
- Reactions are short additive layers (≤ 1.2 s): bounce, giggle, surprised, head tilt,
  excited jump, celebrate, sneeze, shake, wiggle ears, purr. Each pet has its own reaction
  weights and voice pitch (`PetDefinition`).
- Squash-and-stretch preserves volume (x × y ≈ 1).

## UI
- Big rounded "candy" buttons (≥ 140 px at 1080×1920), pastel fill, plum outline, white icon
  glyph with plum outline; no text needed to play.
- Transitions: 0.35 s soft fade/scale; nothing flashes harshly.

## Don'ts
No text in art, no logos, no realistic fur/photo textures, no dark or scary colors, no copyrighted
characters, no sharp edges near hands.
