using UnityEngine;

namespace OopsiePets
{
    /// <summary>Helpers for sticking things (mud, tufts, bubbles) onto a pet's head or body so they move with it.</summary>
    public static class PetDecor
    {
        /// <summary>A random point (in the part's local space) inside an ellipse on the part's sprite, avoiding the edges.</summary>
        public static Vector3 RandomPointOn(SpriteRenderer part, float rx = 0.36f, float ry = 0.32f, float yBias = 0f)
        {
            var b = part.sprite.bounds; // local space
            var p = Random.insideUnitCircle;
            return new Vector3(b.center.x + p.x * b.size.x * rx, b.center.y + (p.y * ry + yBias) * b.size.y, 0f);
        }

        /// <summary>Spreads n points over the part so they do not pile up on top of each other.</summary>
        public static Vector3[] SpreadPoints(SpriteRenderer part, int n, float minDistFrac, float rx = 0.36f, float ry = 0.32f, float yBias = 0f)
        {
            var pts = new Vector3[n];
            float minDist = part.sprite.bounds.size.x * minDistFrac;
            for (int i = 0; i < n; i++)
            {
                Vector3 best = RandomPointOn(part, rx, ry, yBias);
                for (int attempt = 0; attempt < 12; attempt++)
                {
                    var c = RandomPointOn(part, rx, ry, yBias);
                    bool ok = true;
                    for (int j = 0; j < i; j++)
                        if (Vector3.Distance(c, pts[j]) < minDist) { ok = false; break; }
                    best = c;
                    if (ok) break;
                }
                pts[i] = best;
            }
            return pts;
        }
    }
}
