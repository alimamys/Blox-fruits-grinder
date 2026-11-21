using System;
using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// The surprise present in the clubhouse. Three heart slots float above it; each finished care visit
    /// fills one. When all three glow, the box wiggles and sparkles until it is tapped, then the lid pops
    /// off and the next friend jumps out. Shown without words: hearts, wobbles and sparkles only.
    /// </summary>
    [RequireComponent(typeof(BoxCollider2D))]
    public class FriendGift : MonoBehaviour, ITappable
    {
        public Transform visual;
        public SpriteRenderer box;
        public SpriteRenderer lid;
        public SpriteRenderer[] hearts;
        [Tooltip("Heart slot size on the box front (local scale).")]
        public float heartSize = 0.95f;

        /// <summary>Raised when a full box is tapped.</summary>
        public event Action<FriendGift> OpenRequested;
        /// <summary>Raised when the last heart lands and the box starts to wiggle.</summary>
        public event Action<FriendGift> BecameReady;

        int filled;
        bool opening, ready;
        float t, nextWobble, tapT = 10f;
        Vector3 lidHome, visualScale = Vector3.one;
        Quaternion lidRot;
        Coroutine fill;
        GameObject flyer;     // the heart on its way into the box
        int flyingTo = -1;    // which slot it is heading for

        static readonly Color Empty = new Color(0.55f, 0.42f, 0.6f, 0.45f); // a soft plum "still to fill" heart on the box

        public bool Ready => ready && !opening;
        public bool Opening => opening;

        void Awake()
        {
            lidHome = lid.transform.localPosition;
            lidRot = lid.transform.localRotation;
        }

        /// <summary>Places the box and shows its hearts. With <paramref name="animateNewest"/>, the newest heart flies in.</summary>
        public void Show(Vector3 position, float size, int heartCount, bool animateNewest)
        {
            FinishFlightNow();
            opening = false;
            gameObject.SetActive(true);
            transform.position = position;
            float w = box.sprite ? box.sprite.bounds.size.x : 1f;
            visualScale = Vector3.one * (size / Mathf.Max(0.01f, w));
            visual.localScale = visualScale;
            visual.localRotation = Quaternion.identity;
            box.color = lid.color = Palette.Untinted;
            lid.transform.localPosition = lidHome;
            lid.transform.localRotation = lidRot;
            lid.gameObject.SetActive(true);
            foreach (var h in hearts) h.gameObject.SetActive(true);
            FitCollider();

            heartCount = Mathf.Clamp(heartCount, 0, hearts.Length);
            filled = animateNewest && heartCount > 0 ? heartCount - 1 : heartCount;
            ready = filled >= hearts.Length;
            PaintHearts();
            if (animateNewest && heartCount > 0) fill = StartCoroutine(FlyInHeart(heartCount - 1));
        }

        public void Hide()
        {
            FinishFlightNow();
            gameObject.SetActive(false);
        }

        // Leaving the room mid-flight (a tap, a screen change) must not strand the flying heart on screen:
        // it lands at once instead.
        void OnDisable() => FinishFlightNow();

        void FinishFlightNow()
        {
            if (fill != null) StopCoroutine(fill);
            fill = null;
            if (flyer) Destroy(flyer);
            flyer = null;
            if (flyingTo >= 0 && hearts != null)
            {
                filled = Mathf.Max(filled, flyingTo + 1);
                ready = filled >= hearts.Length;
                PaintHearts();
            }
            flyingTo = -1;
        }

        void FitCollider()
        {
            var col = GetComponent<BoxCollider2D>();
            col.isTrigger = true;
            var b = box.bounds;
            b.Encapsulate(lid.bounds);
            foreach (var h in hearts) b.Encapsulate(h.bounds);
            col.offset = transform.InverseTransformPoint(b.center);
            var s = transform.lossyScale;
            col.size = new Vector2(b.size.x / Mathf.Max(0.01f, s.x), b.size.y / Mathf.Max(0.01f, s.y));
        }

        void PaintHearts()
        {
            for (int i = 0; i < hearts.Length; i++)
            {
                hearts[i].color = i < filled ? Palette.Untinted : Empty;
                hearts[i].transform.localScale = Vector3.one * HeartScale(i);
            }
        }

        float HeartScale(int i) => heartSize * (i < filled ? 1.1f : 0.9f);

        IEnumerator FlyInHeart(int index)
        {
            yield return new WaitForSeconds(0.9f);
            var target = hearts[index].transform;
            var cam = Camera.main;
            // A heart drifts down from the top of the screen into its slot.
            flyingTo = index;
            var go = new GameObject("FlyingHeart");
            go.transform.SetParent(transform, true); // hidden and cleaned up with the box
            flyer = go;
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = hearts[index].sprite;
            sr.sortingOrder = 900;
            var from = cam ? cam.transform.position + new Vector3(0f, cam.orthographicSize * 0.75f, 10f) : target.position + Vector3.up * 6f;
            float size = target.lossyScale.x;
            AudioManager.Instance?.Play(Sfx.Whoosh, 0.5f, 1.2f);
            yield return Ease.Tween(0.9f, k =>
            {
                var p = Vector3.Lerp(from, target.position, Ease.InOutSine(k));
                p.x += Mathf.Sin(k * Mathf.PI * 2f) * 0.6f * (1f - k);
                go.transform.position = p;
                go.transform.localScale = Vector3.one * size * Mathf.Lerp(2.2f, 1f, k);
                go.transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(k * 12f) * 15f * (1f - k));
            }, null, false);
            Destroy(go);
            flyer = null;
            flyingTo = -1;
            filled = Mathf.Max(filled, index + 1);
            PaintHearts();
            FxSpawner.Instance?.Sparkles(target.position, 8, 0.6f);
            AudioManager.Instance?.Play(Sfx.Sparkle, 0.8f);
            tapT = 0f; // happy squish
            float hs = HeartScale(index);
            yield return Ease.Tween(0.35f, k => target.localScale = Vector3.one * hs * (1f + 0.6f * Ease.Bump(k)), null, false);
            if (filled >= hearts.Length)
            {
                ready = true;
                yield return new WaitForSeconds(0.3f);
                AudioManager.Instance?.Play(Sfx.Celebrate, 0.5f);
                FxSpawner.Instance?.Sparkles(box.bounds.center, 14, 1.2f);
                nextWobble = 0f;
                BecameReady?.Invoke(this);
            }
            fill = null;
        }

        public bool CanTap => isActiveAndEnabled && !opening;

        public void OnTap(Vector2 worldPos)
        {
            if (ready && fill == null)
            {
                opening = true;
                OpenRequested?.Invoke(this);
                return;
            }
            // Not full yet: the box giggles and the empty hearts blink, hinting there is more to collect.
            tapT = 0f;
            AudioManager.Instance?.Play(Sfx.Tap, 0.5f, 1.2f);
            StartCoroutine(BlinkEmpty());
        }

        IEnumerator BlinkEmpty()
        {
            yield return Ease.Tween(0.5f, k =>
            {
                for (int i = filled; i < hearts.Length; i++)
                    hearts[i].transform.localScale = Vector3.one * HeartScale(i) * (1f + 0.35f * Ease.Bump(k));
            }, null, false);
        }

        /// <summary>The big moment: shake, lid off, confetti. The clubhouse then brings the friend out.</summary>
        public IEnumerator Open()
        {
            opening = true;
            var a = AudioManager.Instance;
            // Building excitement: faster and faster rattles.
            for (int i = 0; i < 5; i++)
            {
                a?.Play(Sfx.Tap, 0.5f, 1f + i * 0.12f);
                float dir = i % 2 == 0 ? 1f : -1f;
                yield return Ease.Tween(0.16f - i * 0.015f, k =>
                {
                    visual.localRotation = Quaternion.Euler(0f, 0f, Ease.Bump(k) * 9f * dir);
                    visual.localScale = new Vector3(visualScale.x * (1f + 0.06f * Ease.Bump(k)), visualScale.y * (1f - 0.05f * Ease.Bump(k)), 1f);
                }, null, false);
            }
            visual.localRotation = Quaternion.identity;
            a?.Play(Sfx.Whoosh, 0.7f);
            a?.Play(Sfx.Pop, 0.8f, 0.8f);
            var fx = FxSpawner.Instance;
            var top = lid.transform.position;
            fx?.Confetti(top, 45);
            fx?.Sparkles(top, 14, 1.2f);
            foreach (var h in hearts)
            {
                fx?.Hearts(h.transform.position, 1);
                h.gameObject.SetActive(false);
            }
            var lt = lid.transform;
            var start = lt.position;
            float side = UnityEngine.Random.value < 0.5f ? -1f : 1f;
            yield return Ease.Tween(0.7f, k =>
            {
                lt.position = start + new Vector3(side * 2.6f * k, 3.4f * Ease.Bump(k * 0.75f) + 1.2f * k, 0f);
                lt.rotation = Quaternion.Euler(0f, 0f, -side * 260f * k);
                lid.color = new Color(1f, 1f, 1f, 1f - Mathf.Clamp01((k - 0.6f) / 0.4f));
            }, null, false);
            lid.gameObject.SetActive(false);
            a?.Play(Sfx.Celebrate, 0.8f);
        }

        /// <summary>After the friend is out, the empty box shrinks away.</summary>
        public IEnumerator Vanish()
        {
            var s0 = visual.localScale;
            yield return Ease.Tween(0.4f, k =>
            {
                visual.localScale = new Vector3(s0.x * (1f + 0.2f * Ease.Bump(k * 0.5f)) * (1f - k), s0.y * (1f - k), 1f);
                box.color = new Color(1f, 1f, 1f, 1f - k);
            }, null, false);
            FxSpawner.Instance?.Sparkles(box.transform.position + Vector3.up * 0.5f, 8, 0.8f);
            gameObject.SetActive(false);
        }

        void Update()
        {
            if (opening) return;
            t += Time.deltaTime;
            tapT += Time.deltaTime;
            float idle = Mathf.Sin(t * 2.2f) * 0.015f;
            float squish = tapT < 0.6f ? 0.1f * Mathf.Sin(tapT * 20f) * (1f - tapT / 0.6f) : 0f;
            float wob = 0f;
            if (ready && fill == null)
            {
                // A full box can't sit still: a little wiggle and a sprinkle of sparkles every couple of seconds.
                if (t >= nextWobble)
                {
                    nextWobble = t + 1.8f;
                    FxSpawner.Instance?.Sparkles(lid.transform.position, 4, 0.7f);
                }
                float w = Mathf.Clamp01((t - (nextWobble - 1.8f)) / 0.6f);
                wob = Mathf.Sin(w * Mathf.PI * 4f) * 7f * (1f - w);
                lid.transform.localPosition = lidHome + Vector3.up * Mathf.Abs(Mathf.Sin(w * Mathf.PI * 4f)) * 0.12f * (1f - w) / Mathf.Max(0.01f, visualScale.y);
                for (int i = 0; i < hearts.Length; i++)
                    hearts[i].transform.localScale = Vector3.one * HeartScale(i) * (1f + 0.08f * Mathf.Sin(t * 5f + i));
            }
            visual.localRotation = Quaternion.Euler(0f, 0f, wob);
            visual.localScale = new Vector3(visualScale.x * (1f + squish - idle), visualScale.y * (1f - squish + idle), 1f);
        }
    }
}
