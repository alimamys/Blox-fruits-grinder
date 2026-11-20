using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// One mud splat stuck on the pet. It owns a private copy of its texture so the sponge can wipe it
    /// away pixel by pixel (partial cleaning, not all-or-nothing).
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class MudSpot : MonoBehaviour
    {
        SpriteRenderer sr;
        Texture2D tex;
        Color32[] px;
        Vector2 pivotPx;
        float ppu;
        float initialAlpha, remainingAlpha;
        bool dirty;
        public bool Cleared { get; private set; }

        public float Remaining => remainingAlpha;
        public float Initial => initialAlpha;

        public void Init(Sprite source, int sortingOrder)
        {
            sr = GetComponent<SpriteRenderer>();
            var r = source.rect;
            int w = (int)r.width, h = (int)r.height;
            tex = new Texture2D(w, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            var src = source.texture.GetPixels32();
            px = new Color32[w * h];
            int tw = source.texture.width;
            for (int y = 0; y < h; y++)
                for (int x = 0; x < w; x++)
                    px[y * w + x] = src[((int)r.y + y) * tw + (int)r.x + x];
            initialAlpha = 0f;
            foreach (var c in px) initialAlpha += c.a;
            remainingAlpha = initialAlpha;
            tex.SetPixels32(px);
            tex.Apply(false);
            ppu = source.pixelsPerUnit;
            pivotPx = source.pivot;
            sr.sprite = Sprite.Create(tex, new Rect(0, 0, w, h), new Vector2(pivotPx.x / w, pivotPx.y / h), ppu);
            sr.sortingOrder = sortingOrder;
            Cleared = false;
        }

        /// <summary>Wipes mud inside a world-space circle. Returns how much alpha was removed (0..255 units).</summary>
        public float Scrub(Vector2 world, float worldRadius, float strength)
        {
            if (Cleared || tex == null) return 0f;
            Vector2 local = transform.InverseTransformPoint(world);
            float scale = Mathf.Max(0.0001f, Mathf.Abs(transform.lossyScale.x));
            float r = worldRadius / scale * ppu;
            float cx = local.x * ppu + pivotPx.x, cy = local.y * ppu + pivotPx.y;
            int w = tex.width, h = tex.height;
            int x0 = Mathf.Max(0, (int)(cx - r)), x1 = Mathf.Min(w - 1, (int)(cx + r));
            int y0 = Mathf.Max(0, (int)(cy - r)), y1 = Mathf.Min(h - 1, (int)(cy + r));
            if (x0 > x1 || y0 > y1) return 0f;
            float removed = 0f, r2 = r * r;
            for (int y = y0; y <= y1; y++)
            {
                for (int x = x0; x <= x1; x++)
                {
                    float dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
                    if (d2 > r2) continue;
                    int i = y * w + x;
                    byte a = px[i].a;
                    if (a == 0) continue;
                    float fall = 1f - d2 / r2; // soft edge
                    int na = Mathf.Max(0, (int)(a - 255f * strength * fall));
                    removed += a - na;
                    px[i].a = (byte)na;
                }
            }
            if (removed > 0f)
            {
                remainingAlpha -= removed;
                dirty = true;
            }
            return removed;
        }

        /// <summary>Fades out whatever is left (used when the pet is "clean enough").</summary>
        public void ClearAll()
        {
            if (Cleared) return;
            Cleared = true;
            remainingAlpha = 0f;
            StartCoroutine(Ease.Tween(0.4f, k => sr.color = Palette.WithAlpha(Palette.Untinted, 1f - k), Ease.OutCubic, false));
        }

        void LateUpdate()
        {
            if (!dirty) return;
            dirty = false;
            tex.SetPixels32(px);
            tex.Apply(false);
            if (remainingAlpha < initialAlpha * 0.06f) ClearAll();
        }

        void OnDestroy()
        {
            if (tex) Destroy(tex);
            if (sr && sr.sprite) Destroy(sr.sprite);
        }
    }
}
