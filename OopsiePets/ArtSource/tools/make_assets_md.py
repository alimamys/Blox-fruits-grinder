#!/usr/bin/env python3
"""Regenerate ArtSource/ASSETS.md from asset_manifest.json and the sprites in the Unity project.

Usage: python3 -I make_assets_md.py <ArtSource dir> <Assets/OopsiePets/Art dir>
"""
import glob, json, os, sys

HEADER = """# Oopsie Pets! — Generated Art Manifest

All images below were generated with the OpenAI Images API (`gpt-image-2` for opaque backgrounds,
`gpt-image-1.5` for transparent sprites; edits endpoint with a reference image where noted), then
processed by the scripts in `ArtSource/tools/`. Every prompt is prefixed with the shared style block
stored as `style_prefix` in `asset_manifest.json` (see also `Assets/OopsiePets/Docs/StyleGuide.md`).
"""

NOTES = """
Hand-drawn in code (style-matched, not AI-generated): `Characters/Shared/eye_*`, `mouth_*`
(`tools/make_faces.py`); `UI/btn_blank_*`, `panel_*`, `slider_*`, `select_ring`, `sunburst` (`tools/make_ui.py`);
`UI/thought_bubble` (`tools/make_thought_bubble.py`); `Characters/Shared/mouth_teeth_open`, `Effects/fx_water_drop`,
`Effects/teeth_speck_*` (`tools/make_bath_bits.py`); `Objects/garden_swing_icon` (drawn ropes and branch around the
generated seat); `UI/lock_padlock`, `UI/lock_pip_on`, `UI/lock_pip_off` (`tools/make_lock.py`).

Processing notes:
- Model-drawn mouths on the "blank" heads were painted out (`tools/clean_faces.py`): puppy, bunny, lamb, pony.
- The cow parts sheet clipped the left ear at the image edge; it was rebuilt by mirroring the right ear
  (`tools/fix_clipped_ear.py`).
- The first unicorn parts sheet clipped the head at the image edge; the head was regenerated alone
  (`unicorn_head`) and the clipped piece discarded (`_unicorn_head_clipped`).
- Sprites are padded to multiples of 4 px (`tools/pad_to_4.py`) so they can be GPU-compressed on the
  web build; rig pivots are rescaled to match.
- Portraits (`*_portrait.png`) are kept as references for artists; the game does not show them.
"""


def main():
    src, art = sys.argv[1:3]
    man = json.load(open(os.path.join(src, "asset_manifest.json")))
    assets = man["assets"]
    out = [HEADER, "## Generated source images\n", "| Id | Model | Size | Reference | Raw file (ArtSource/) |", "|---|---|---|---|---|"]
    for k in sorted(assets):
        a = assets[k]
        refs = ", ".join(os.path.basename(r) for r in a.get("refs", [])) or "-"
        out.append(f"| {k} | {a['model']} | {a['size']} {a['quality']} | {refs} | `{a['file']}` |")
    out.append("\n## Sprites in the Unity project (Assets/OopsiePets/Art/)\n")
    groups = {}
    for f in sorted(glob.glob(os.path.join(art, "**", "*.png"), recursive=True)):
        rel = os.path.relpath(f, art)
        top, rest = rel.split(os.sep, 1)
        groups.setdefault(top, []).append(rest.replace(os.sep, "/"))
    for g in sorted(groups):
        out.append(f"- **{g}** ({len(groups[g])}): " + ", ".join(f"`{x}`" for x in groups[g]))
    out.append(NOTES)
    out.append("## Prompts\n")
    for k in sorted(assets):
        out.append(f"### {k}\n{assets[k]['prompt']}\n")
    open(os.path.join(src, "ASSETS.md"), "w").write("\n".join(out))
    print(len(assets), "generated images,", sum(len(v) for v in groups.values()), "sprites")


if __name__ == "__main__":
    main()
