using System;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>A floating soap bubble. Tap to pop (forgiving: InputRouter picks the nearest one under the finger).</summary>
    [RequireComponent(typeof(SpriteRenderer), typeof(CircleCollider2D))]
    public class Bubble : MonoBehaviour, ITappable
    {
        /// <summary>Diameter in world units.</summary>
        public float Size { get; private set; }
        public bool Popping { get; private set; }
        public Action<Bubble> Popped;

        SpriteRenderer sr;
        CircleCollider2D col;
        Vector2 velocity;
        float wobblePhase, wobbleFreq, age, life, scale;

        void Awake()
        {
            sr = GetComponent<SpriteRenderer>();
            col = GetComponent<CircleCollider2D>();
        }

        public void Launch(Vector3 pos, float size, Vector2 vel, float lifetime, int order)
        {
            transform.position = pos;
            Size = size;
            scale = size / Mathf.Max(0.01f, sr.sprite.bounds.size.x);
            velocity = vel;
            life = lifetime;
            age = 0f;
            wobblePhase = UnityEngine.Random.Range(0f, 6f);
            wobbleFreq = UnityEngine.Random.Range(1.2f, 2.2f);
            Popping = false;
            sr.sortingOrder = order;
            sr.color = Palette.Untinted;
            transform.localScale = Vector3.zero;
            col.radius = sr.sprite.bounds.extents.x * 0.95f;
            gameObject.SetActive(true);
        }

        public bool CanTap => !Popping && gameObject.activeInHierarchy;

        public void OnTap(Vector2 worldPos) => Pop();

        public void Pop()
        {
            if (Popping) return;
            Popping = true;
            Popped?.Invoke(this);
            StartCoroutine(Ease.Tween(0.12f, k =>
            {
                transform.localScale = Vector3.one * scale * Mathf.Lerp(1f, 1.35f, k);
                sr.color = Palette.WithAlpha(Palette.Untinted, 1f - k);
            }, Ease.OutCubic, false));
            Invoke(nameof(Hide), 0.13f);
        }

        void Hide() => gameObject.SetActive(false);

        void Update()
        {
            if (Popping) return;
            age += Time.deltaTime;
            float grow = Mathf.Min(1f, age / 0.35f);
            // Breathing wobble: bubbles squish slightly as they float.
            float w = Mathf.Sin(age * wobbleFreq * Mathf.PI * 2f + wobblePhase);
            transform.localScale = new Vector3(scale * Ease.OutBack(grow) * (1f + w * 0.04f), scale * Ease.OutBack(grow) * (1f - w * 0.04f), 1f);
            transform.position += (Vector3)(velocity + new Vector2(Mathf.Sin(age * 1.3f + wobblePhase) * 0.35f, 0f)) * Time.deltaTime;
            if (age > life) Pop();
        }
    }
}
