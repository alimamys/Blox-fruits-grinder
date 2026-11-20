using UnityEngine;

namespace OopsiePets
{
    /// <summary>Single source of every code-side color. Mirrors Docs/StyleGuide.md.</summary>
    public static class Palette
    {
        public static readonly Color Ink = Hex("5B4565");
        public static readonly Color Pink = Hex("FFC8DD");
        public static readonly Color Lavender = Hex("CDB4DB");
        public static readonly Color Mint = Hex("B9F3D9");
        public static readonly Color Turquoise = Hex("A0E7E5");
        public static readonly Color Blue = Hex("BDE0FE");
        public static readonly Color Peach = Hex("FFD6BA");
        public static readonly Color Cream = Hex("FFF6E5");
        public static readonly Color Yellow = Hex("FFF1A8");
        public static readonly Color Accent = Hex("FF8FB8");
        public static readonly Color Shadow = Hex("B9A3C9");

        /// <summary>No tint: keeps a sprite's own painted colors.</summary>
        public static readonly Color Untinted = new Color(1f, 1f, 1f, 1f);

        public static Color WithAlpha(Color c, float a)
        {
            c.a = a;
            return c;
        }

        public static Color Hex(string hex)
        {
            ColorUtility.TryParseHtmlString("#" + hex, out var c);
            return c;
        }
    }
}
