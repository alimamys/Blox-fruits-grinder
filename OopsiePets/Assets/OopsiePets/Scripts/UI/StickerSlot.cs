using UnityEngine;

namespace OopsiePets
{
    /// <summary>One sticker on an album page.</summary>
    public class StickerSlot : MonoBehaviour, ITappable
    {
        SpriteRenderer sr;
        bool owned;
        float t = 10f, baseScale, tilt;

        public void Init(StickerDefinition s, bool has, float size)
        {
            owned = has;
            sr = gameObject.AddComponent<SpriteRenderer>();
            sr.sprite = s.sprite;
            sr.sortingOrder = 50;
            baseScale = size / Mathf.Max(0.01f, Mathf.Max(s.sprite.bounds.size.x, s.sprite.bounds.size.y));
            transform.localScale = Vector3.one * baseScale;
            tilt = Random.Range(-8f, 8f);
            transform.localRotation = Quaternion.Euler(0f, 0f, tilt);
            // Not found yet: a soft, faded shape that hints at what's still out there.
            sr.color = owned ? Palette.Untinted : Palette.WithAlpha(Palette.Lavender, 0.28f);
            var col = gameObject.AddComponent<CircleCollider2D>();
            col.radius = Mathf.Max(s.sprite.bounds.extents.x, s.sprite.bounds.extents.y) * 0.9f;
        }

        public bool CanTap => true;

        public void OnTap(Vector2 worldPos)
        {
            t = 0f;
            var a = AudioManager.Instance;
            if (owned)
            {
                if (a) a.Play(Sfx.Sparkle, 0.7f);
                if (FxSpawner.Instance) FxSpawner.Instance.Sparkles(transform.position, 6, 0.9f);
            }
            else if (a) a.Play(Sfx.Tap, 0.4f, 0.8f);
        }

        void Update()
        {
            t += Time.deltaTime;
            float wob = t < 0.8f ? Mathf.Sin(t * 30f) * 10f * (1f - t / 0.8f) : 0f;
            float pop = t < 0.4f ? 1f + 0.15f * Ease.Bump(t / 0.4f) : 1f;
            transform.localRotation = Quaternion.Euler(0f, 0f, tilt + wob + (owned ? Mathf.Sin(Time.time * 1.5f + tilt) * 1.5f : 0f));
            transform.localScale = Vector3.one * baseScale * pop;
        }
    }
}
