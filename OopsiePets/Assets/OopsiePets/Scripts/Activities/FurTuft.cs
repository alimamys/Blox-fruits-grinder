using UnityEngine;

namespace OopsiePets
{
    /// <summary>A messy fur tuft. Brushing over it smooths it down a little each stroke until it settles and sparkles.</summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class FurTuft : MonoBehaviour
    {
        public float Mess { get; private set; } = 1f;
        public bool Settled => Mess <= 0f;

        SpriteRenderer sr;
        float messyAngle, neatAngle, baseScale, seed;
        Color tint;

        public void Init(Sprite sprite, Color furTint, float scale, int order)
        {
            sr = GetComponent<SpriteRenderer>();
            sr.sprite = sprite;
            sr.sortingOrder = order;
            tint = furTint;
            baseScale = scale;
            messyAngle = Random.Range(-70f, 70f);
            seed = Random.Range(0f, 100f);
            neatAngle = Random.Range(-8f, 8f);
            Mess = 1f;
            Apply();
        }

        /// <summary>Brush stroke; returns true when this stroke made it settle.</summary>
        public bool Brush(float amount)
        {
            if (Settled) return false;
            Mess = Mathf.Max(0f, Mess - amount);
            Apply();
            return Settled;
        }

        void Apply()
        {
            float k = 1f - Mess;
            transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Lerp(messyAngle, neatAngle, Ease.OutCubic(k)));
            float s = baseScale * Mathf.Lerp(1f, 0.55f, k);
            transform.localScale = new Vector3(s, s * Mathf.Lerp(1.15f, 0.7f, k), 1f);
            sr.color = Palette.WithAlpha(tint, Mathf.Lerp(1f, 0f, Mathf.Pow(k, 2.2f)));
        }

        void Update()
        {
            if (Settled) return;
            // Messy tufts boing a little so they read as "sticking up".
            float w = Mathf.Sin(Time.time * 6f + seed) * 3f * Mess;
            transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Lerp(messyAngle, neatAngle, Ease.OutCubic(1f - Mess)) + w);
        }
    }
}
