#!/usr/bin/env python3
"""Draw style-matched blank UI pieces (candy circles, panels, slider parts, ring, sunburst).

Usage: python3 -I make_ui.py <Assets/OopsiePets/Art/UI dir>
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFilter

SS = 4
INK = (91, 69, 101, 255)
COLORS = {"mint": (185, 243, 217), "blue": (189, 224, 254), "pink": (255, 200, 221), "lavender": (205, 180, 219),
          "yellow": (255, 241, 168), "peach": (255, 214, 186), "cream": (255, 246, 229), "turquoise": (160, 231, 229)}


def lighten(c, k):
    return tuple(int(c[i] + (255 - c[i]) * k) for i in range(3))


def darken(c, k):
    return tuple(int(c[i] * (1 - k)) for i in range(3))


def candy_circle(color, size=256):
    W = size * SS
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    pad = 8 * SS
    # drop shadow
    sh = Image.new("RGBA", (W, W), (91, 69, 101, 0))
    ImageDraw.Draw(sh).ellipse((pad, pad + 10 * SS, W - pad, W - pad + 6 * SS), fill=(91, 69, 101, 70))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6 * SS)))
    # gradient body
    grad = Image.new("RGBA", (W, W))
    gd = ImageDraw.Draw(grad)
    top, bot = lighten(color, 0.35), darken(color, 0.08)
    for y in range(W):
        t = y / W
        gd.line([(0, y), (W, y)], fill=tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3)) + (255,))
    mask = Image.new("L", (W, W), 0)
    ImageDraw.Draw(mask).ellipse((pad, pad, W - pad, W - pad - 6 * SS), fill=255)
    im.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.ellipse((pad, pad, W - pad, W - pad - 6 * SS), outline=INK, width=9 * SS)
    # glossy highlight
    hl = Image.new("RGBA", (W, W), (255, 255, 255, 0))
    ImageDraw.Draw(hl).ellipse((W * 0.22, W * 0.12, W * 0.78, W * 0.42), fill=(255, 255, 255, 120))
    im.alpha_composite(hl.filter(ImageFilter.GaussianBlur(3 * SS)))
    return im.resize((size, size), Image.LANCZOS)


def rounded_panel(color, size=256, radius=72, outline=8):
    W = size * SS
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((outline * SS, outline * SS, W - outline * SS, W - outline * SS), radius=radius * SS,
                        fill=color + (255,), outline=INK, width=outline * SS)
    return im.resize((size, size), Image.LANCZOS)


def pill(color, w=192, h=64, outline=6):
    W, H = w * SS, h * SS
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((outline * SS, outline * SS, W - outline * SS, H - outline * SS), radius=H // 2,
                                         fill=color + (255,), outline=INK, width=outline * SS)
    return im.resize((w, h), Image.LANCZOS)


def ring(size=256):
    W = size * SS
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    glow = Image.new("RGBA", (W, W), (255, 143, 184, 0))
    ImageDraw.Draw(glow).ellipse((6 * SS, 6 * SS, W - 6 * SS, W - 6 * SS), outline=(255, 143, 184, 200), width=22 * SS)
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(5 * SS)))
    ImageDraw.Draw(im).ellipse((14 * SS, 14 * SS, W - 14 * SS, W - 14 * SS), outline=(255, 143, 184, 255), width=10 * SS)
    return im.resize((size, size), Image.LANCZOS)


def sunburst(size=512, rays=14):
    W = size * SS
    im = Image.new("RGBA", (W, W), (255, 241, 168, 0))
    d = ImageDraw.Draw(im)
    c = W / 2
    for i in range(rays):
        a0 = (i / rays) * 2 * math.pi
        a1 = a0 + math.pi / rays
        d.polygon([(c, c), (c + c * math.cos(a0), c + c * math.sin(a0)), (c + c * math.cos(a1), c + c * math.sin(a1))],
                  fill=(255, 241, 168, 150))
    mask = Image.new("L", (W, W), 0)
    md = ImageDraw.Draw(mask)
    for r in range(int(c), 0, -4 * SS):
        md.ellipse((c - r, c - r, c + r, c + r), fill=int(255 * (1 - r / c) ** 0.6))
    out = Image.new("RGBA", (W, W), (255, 241, 168, 0))
    im.putalpha(Image.composite(im.getchannel("A"), Image.new("L", (W, W), 0), mask))
    out = im
    glow = Image.new("RGBA", (W, W), (255, 250, 220, 0))
    ImageDraw.Draw(glow).ellipse((c * 0.55, c * 0.55, c * 1.45, c * 1.45), fill=(255, 250, 220, 200))
    out.alpha_composite(glow.filter(ImageFilter.GaussianBlur(30 * SS)))
    return out.resize((size, size), Image.LANCZOS)


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, col in COLORS.items():
        candy_circle(col).save(os.path.join(out, f"btn_blank_{name}.png"))
    rounded_panel(COLORS["cream"]).save(os.path.join(out, "panel_cream.png"))
    rounded_panel(COLORS["lavender"]).save(os.path.join(out, "panel_lavender.png"))
    pill(COLORS["lavender"]).save(os.path.join(out, "slider_track.png"))
    pill(COLORS["mint"]).save(os.path.join(out, "slider_fill.png"))
    ring().save(os.path.join(out, "select_ring.png"))
    sunburst().save(os.path.join(out, "sunburst.png"))
    print("ok")


if __name__ == "__main__":
    main()
