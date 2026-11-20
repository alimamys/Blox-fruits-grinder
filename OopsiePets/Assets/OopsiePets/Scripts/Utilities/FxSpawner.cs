using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Lightweight pooled sprite particles (sparkles, hearts, foam, bubble bits). No per-burst allocations:
    /// a fixed pool of SpriteRenderers is simulated in Update.
    /// </summary>
    public class FxSpawner : MonoBehaviour
    {
        public static FxSpawner Instance { get; private set; }

        [Header("Sprites")]
        public Sprite sparkleYellow;
        public Sprite sparklePink;
        public Sprite heart;
        public Sprite glowDot;
        public Sprite star;
        public Sprite foamPuff;
        public Sprite bubble;

        public int poolSize = 160;
        public int sortingOrder = 300;

        struct P
        {
            public SpriteRenderer sr;
            public Vector2 vel;
            public float life, age, size, spin, gravity, fadeIn;
            public bool active;
        }

        P[] parts;
        int next;

        void Awake()
        {
            Instance = this;
            parts = new P[poolSize];
            for (int i = 0; i < poolSize; i++)
            {
                var go = new GameObject("fx");
                go.transform.SetParent(transform, false);
                var sr = go.AddComponent<SpriteRenderer>();
                sr.sortingOrder = sortingOrder;
                go.SetActive(false);
                parts[i].sr = sr;
            }
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        public void Emit(Sprite sprite, Vector3 pos, Vector2 vel, float size, float life, Color tint, float gravity = 0f, float spin = 0f)
        {
            if (sprite == null) return;
            ref var p = ref parts[next];
            next = (next + 1) % parts.Length;
            p.active = true;
            p.age = 0f;
            p.life = life;
            p.vel = vel;
            p.size = size;
            p.gravity = gravity;
            p.spin = spin;
            p.sr.sprite = sprite;
            p.sr.color = tint;
            var t = p.sr.transform;
            t.position = new Vector3(pos.x, pos.y, 0f);
            t.localScale = Vector3.zero;
            t.rotation = Quaternion.Euler(0f, 0f, Random.Range(-20f, 20f));
            p.sr.gameObject.SetActive(true);
        }

        /// <summary>Radial burst of mixed sprites.</summary>
        public void Burst(Vector3 pos, int count, float speed, float size, float life, params Sprite[] sprites)
        {
            for (int i = 0; i < count; i++)
            {
                float a = Random.Range(0f, Mathf.PI * 2f);
                var v = new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * speed * Random.Range(0.5f, 1.1f);
                var s = sprites[Random.Range(0, sprites.Length)];
                Emit(s, pos + (Vector3)(Random.insideUnitCircle * 0.15f), v, size * Random.Range(0.6f, 1.15f), life * Random.Range(0.75f, 1.2f), Color.white, -1.2f, Random.Range(-160f, 160f));
            }
        }

        public void Sparkles(Vector3 pos, int count = 8, float radius = 0.8f)
        {
            for (int i = 0; i < count; i++)
            {
                var off = Random.insideUnitCircle * radius;
                Emit(Random.value < 0.5f ? sparkleYellow : sparklePink, pos + (Vector3)off, off * 0.4f + Vector2.up * 0.4f,
                    Random.Range(0.35f, 0.6f), Random.Range(0.5f, 0.9f), Color.white, 0f, Random.Range(-90f, 90f));
            }
        }

        public void Hearts(Vector3 pos, int count = 4)
        {
            for (int i = 0; i < count; i++)
                Emit(heart, pos + (Vector3)(Random.insideUnitCircle * 0.5f), new Vector2(Random.Range(-0.6f, 0.6f), Random.Range(1.2f, 2f)),
                    Random.Range(0.4f, 0.6f), 1.1f, Color.white);
        }

        public void Confetti(Vector3 pos, int count = 40)
        {
            Sprite[] pick = { sparkleYellow, sparklePink, heart, star, glowDot };
            for (int i = 0; i < count; i++)
            {
                float a = Random.Range(50f, 130f) * Mathf.Deg2Rad;
                var v = new Vector2(Mathf.Cos(a), Mathf.Sin(a)) * Random.Range(5f, 9f);
                Emit(pick[Random.Range(0, pick.Length)], pos, v, Random.Range(0.35f, 0.65f), Random.Range(1.4f, 2.1f), Color.white, 6f, Random.Range(-300f, 300f));
            }
        }

        void Update()
        {
            float dt = Time.deltaTime;
            for (int i = 0; i < parts.Length; i++)
            {
                ref var p = ref parts[i];
                if (!p.active) continue;
                p.age += dt;
                float k = p.age / p.life;
                if (k >= 1f)
                {
                    p.active = false;
                    p.sr.gameObject.SetActive(false);
                    continue;
                }
                p.vel.y -= p.gravity * dt;
                p.vel *= 1f - 0.8f * dt;
                var t = p.sr.transform;
                t.position += (Vector3)(p.vel * dt);
                t.Rotate(0f, 0f, p.spin * dt);
                float s = k < 0.15f ? Ease.OutBack(k / 0.15f) : 1f - Mathf.Max(0f, (k - 0.6f) / 0.4f);
                t.localScale = Vector3.one * (p.size * s);
            }
        }
    }
}
