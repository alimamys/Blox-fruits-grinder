#!/usr/bin/env python3
"""Draw the "wants to play" thought bubble (style-matched with make_ui.py: white cloud, plum outline,
soft shadow). The two small circles at the lower-left lead down to the pet's head; the sprite pivot
sits on the smallest circle and the toy icon goes in the middle of the cloud.

Usage: python3 -I make_thought_bubble.py <Assets/OopsiePets/Art/UI dir>
Prints the cloud centre in normalized sprite coordinates (used by Clubhouse/WantsToPlay).
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter

SS = 4
INK = (91, 69, 101, 255)
W, H = 340, 300
OUT = 7  # outline width at 1x

# Cloud puffs (x, y, r) in 1x pixels, y down; plus the trail toward the head.
PUFFS = [(140, 110, 62), (200, 82, 70), (262, 112, 56), (176, 150, 58), (240, 156, 54), (118, 150, 46), (290, 148, 36)]
TRAIL = [(70, 228, 20), (34, 268, 12)]


def disc_mask(circles, grow):
    m = Image.new("L", (W * SS, H * SS), 0)
    d = ImageDraw.Draw(m)
    for x, y, r in circles:
        R = (r + grow) * SS
        d.ellipse((x * SS - R, y * SS - R, x * SS + R, y * SS + R), fill=255)
    return m


def main(out_dir):
    im = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    allc = PUFFS + TRAIL
    # soft drop shadow
    sh = Image.new("RGBA", im.size, (91, 69, 101, 0))
    sh.putalpha(disc_mask([(x, y + 7, r) for x, y, r in allc], OUT).point(lambda v: v * 60 // 255))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5 * SS)))
    # outline, then fill
    ink = Image.new("RGBA", im.size, INK)
    im.paste(ink, (0, 0), disc_mask(allc, OUT))
    fill = Image.new("RGBA", im.size, (255, 255, 255, 255))
    im.paste(fill, (0, 0), disc_mask(allc, 0))
    # gentle lavender shade along the bottom of the cloud
    shade = Image.new("RGBA", im.size, (205, 180, 219, 0))
    shade.putalpha(disc_mask([(x, y + 14, r - 6) for x, y, r in PUFFS], 0).point(lambda v: v * 70 // 255))
    body = disc_mask(PUFFS, 0)
    shade_cut = Image.new("L", im.size, 0)
    shade_cut.paste(shade.getchannel("A"), (0, 0))
    from PIL import ImageChops
    shade.putalpha(ImageChops.subtract(ImageChops.multiply(shade_cut, body), disc_mask([(x, y - 8, r) for x, y, r in PUFFS], 0).point(lambda v: v * 70 // 255)))
    im.alpha_composite(shade)
    im = im.resize((W, H), Image.LANCZOS)
    os.makedirs(out_dir, exist_ok=True)
    im.save(os.path.join(out_dir, "thought_bubble.png"), optimize=True)
    # cloud centre and pivot (smallest trail circle) in normalized coords, origin bottom-left
    xs = [x for x, _, _ in PUFFS]; ys = [y for _, y, _ in PUFFS]
    cx, cy = (min(xs) + max(xs)) / 2 / W, 1 - (min(ys) + max(ys)) / 2 / H
    px, py = TRAIL[-1][0] / W, 1 - TRAIL[-1][1] / H
    print(f"cloud centre ({cx:.3f}, {cy:.3f}) pivot ({px:.3f}, {py:.3f}) size {W}x{H}")


if __name__ == "__main__":
    main(sys.argv[1])
