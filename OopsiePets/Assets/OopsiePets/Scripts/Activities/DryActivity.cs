using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Drying off: the pet steps out of the bath onto a fluffy mat, dripping wet (its fur looks darker and
    /// drops slide off it). Rub it with the big towel until every drop is gone; the fur fluffs back up, the
    /// colour comes back, and the pet gives a happy shake.
    /// </summary>
    public class DryActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Dry;

        [Header("Scene")]
        public Transform towel;
        public Transform towelHome;
        public SpriteRenderer mat;
        public Sprite dropSprite;

        [Header("Tuning")]
        [Tooltip("Drops to towel off (more drops and a gentler towel make drying last longer).")]
        public int drops = 14;
        public float rubRadius = 0.95f;
        [Tooltip("How much one world-unit of towel rubbing dries a drop.")]
        public float rubPower = 0.28f;
        public Color wetTint = new Color(0.88f, 0.92f, 1f, 1f);
        public Vector2 towelFingerOffset = new Vector2(0f, 0.5f);
        public float hintAfterIdle = 5f;

        class Drip { public Transform t; public SpriteRenderer sr; public float wet = 1f; public Vector3 scale; public float phase; }

        readonly List<Drip> drips = new List<Drip>();
        readonly Dictionary<SpriteRenderer, Color> fur = new Dictionary<SpriteRenderer, Color>();
        bool dragging, finishing;
        float lastReaction, nextFall;
        Vector3 towelScale;

        void Awake() => towelScale = towel.localScale;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            dragging = finishing = false;
            if (mat) mat.gameObject.SetActive(true);
            towel.gameObject.SetActive(true);
            towel.position = towelHome.position;
            towel.rotation = Quaternion.identity;
            towel.localScale = towelScale;
            MakeWet();
            pet.Animator.SetMood(PetExpression.Neutral);
            Input.PointerDown += OnDown;
            Input.PointerDrag += OnDrag;
            Input.PointerUp += OnUp;
            StartCoroutine(Intro());
        }

        public override void End()
        {
            Input.PointerDown -= OnDown;
            Input.PointerDrag -= OnDrag;
            Input.PointerUp -= OnUp;
            StopAllCoroutines();
            foreach (var d in drips) if (d.t) Destroy(d.t.gameObject);
            drips.Clear();
            RestoreFur(1f);
            fur.Clear();
            towel.gameObject.SetActive(false);
            if (mat) mat.gameObject.SetActive(false);
            base.End();
        }

        void MakeWet()
        {
            drips.Clear();
            fur.Clear();
            // Wet fur looks a little darker and bluer (body parts only; the face stays bright).
            foreach (var sr in pet.Rig.visual.GetComponentsInChildren<SpriteRenderer>(true))
            {
                if (sr == pet.Rig.eyeLeft || sr == pet.Rig.eyeRight || sr == pet.Rig.mouth) continue;
                if (sr.GetComponent<MudSpot>() || sr.GetComponent<SoapSuds>()) continue;
                fur[sr] = sr.color;
                sr.color = sr.color * wetTint;
            }
            float size = pet.VisualBounds().size.x * 0.1f;
            for (int i = 0; i < drops; i++)
            {
                bool onHead = i % 3 == 0;
                var part = onHead ? pet.Rig.headRenderer : pet.Rig.bodyRenderer;
                var parent = onHead ? pet.Rig.headDecor : pet.Rig.bodyDecor;
                var go = new GameObject("Drip");
                go.transform.SetParent(parent, false);
                go.transform.localPosition = PetDecor.RandomPointOn(part, 0.34f, 0.3f, onHead ? 0f : 0.12f);
                var sr = go.AddComponent<SpriteRenderer>();
                sr.sprite = dropSprite;
                sr.sortingOrder = onHead ? 70 : 30;
                float s = size / Mathf.Max(0.001f, dropSprite.bounds.size.x * Mathf.Abs(parent.lossyScale.x));
                go.transform.localScale = Vector3.one * s;
                drips.Add(new Drip { t = go.transform, sr = sr, scale = go.transform.localScale, phase = Random.Range(0f, 6f) });
            }
        }

        void RestoreFur(float dryness)
        {
            foreach (var kv in fur)
                if (kv.Key) kv.Key.color = Color.Lerp(kv.Value * wetTint, kv.Value, dryness);
        }

        IEnumerator Intro()
        {
            // Brrr! Dripping wet.
            yield return new WaitForSeconds(0.4f);
            pet.Animator.Play(PetReaction.Surprised);
            yield return new WaitForSeconds(1.0f);
            ShowHint();
        }

        void ShowHint()
        {
            if (ctx.hint && !IsComplete) ctx.hint.ShowDrag(towelHome.position, pet.VisualBounds().center);
        }

        void OnDown(Vector2 p)
        {
            if (finishing) return;
            dragging = true;
            idleTime = 0f;
            if (ctx.hint) ctx.hint.Hide();
            MoveTowel(p);
        }

        void OnUp(Vector2 p) => dragging = false;

        void MoveTowel(Vector2 p) => towel.position = new Vector3(p.x + towelFingerOffset.x, p.y + towelFingerOffset.y, 0f);

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!dragging || finishing) return;
            idleTime = 0f;
            MoveTowel(p);
            float moved = delta.magnitude;
            if (moved <= 0.0001f) return;
            towel.rotation = Quaternion.Euler(0f, 0f, Mathf.Clamp(-delta.x * 25f, -18f, 18f));
            bool any = false;
            foreach (var d in drips)
            {
                if (d.wet <= 0f || !d.t) continue;
                if (Vector2.Distance(towel.position, d.t.position) > rubRadius) continue;
                any = true;
                d.wet = Mathf.Max(0f, d.wet - moved * rubPower);
                if (d.wet <= 0f)
                {
                    Fx?.Emit(Fx.foamPuff, d.t.position, Vector2.up * 0.8f, 0.35f, 0.6f, Palette.Untinted, -0.2f);
                    Audio?.Play(Sfx.Pop, 0.35f, 1.6f);
                    d.t.gameObject.SetActive(false);
                }
            }
            var b = pet.VisualBounds();
            if (any || b.Contains(new Vector3(p.x, p.y, b.center.z)))
            {
                Audio?.Play(Sfx.Brush, 0.45f, 0.8f);
                // Fluffy bits fly as the fur dries.
                if (Fx && Random.value < 0.25f)
                    Fx.Emit(Fx.foamPuff, (Vector2)towel.position + Random.insideUnitCircle * 0.6f, new Vector2(Random.Range(-1f, 1f), Random.Range(0.4f, 1.2f)), Random.Range(0.2f, 0.35f), 0.7f, Palette.Untinted, -0.2f);
                pet.Animator.SetMood(PetExpression.Happy);
                if (Time.time - lastReaction > 2.5f) { lastReaction = Time.time; pet.Animator.Play(Random.value < 0.5f ? PetReaction.Giggle : PetReaction.Wiggle); }
            }
            UpdateProgress();
        }

        void UpdateProgress()
        {
            float wet = 0f;
            foreach (var d in drips) wet += Mathf.Max(0f, d.wet);
            float dryness = drips.Count > 0 ? 1f - wet / drips.Count : 1f;
            RestoreFur(dryness * 0.85f);
            SetProgress(dryness);
            if (dryness >= 0.999f && !finishing) StartCoroutine(Finish());
        }

        IEnumerator Finish()
        {
            finishing = true;
            dragging = false;
            if (ctx.hint) ctx.hint.Hide();
            var from = towel.position;
            yield return Ease.Tween(0.3f, k => { towel.position = Vector3.Lerp(from, towelHome.position, Ease.OutCubic(k)); towel.rotation = Quaternion.identity; }, null, false);
            // All dry: a big fluffy shake, and the colour comes back.
            pet.Animator.Play(PetReaction.Shake);
            yield return Ease.Tween(0.6f, k => RestoreFur(Mathf.Lerp(0.85f, 1f, k)), null, false);
            var v = pet.Rig.visual;
            var s0 = v.localScale;
            yield return Ease.Tween(0.4f, k => v.localScale = s0 * (1f + 0.1f * Ease.Bump(k)), null, false);
            Fx?.Sparkles(pet.VisualBounds().center, 14, 1.8f);
            Audio?.Play(Sfx.Sparkle, 0.8f);
            pet.Animator.SetMood(PetExpression.Happy);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }

        void Update()
        {
            if (IsComplete) return;
            // Drips wobble and now and then a drop falls off.
            foreach (var d in drips)
            {
                if (!d.t || d.wet <= 0f) continue;
                float w = Mathf.Sin(Time.time * 3f + d.phase) * 0.06f;
                d.t.localScale = d.scale * (0.5f + 0.5f * d.wet) * (1f + w);
            }
            if (Fx && Time.time >= nextFall)
            {
                nextFall = Time.time + Random.Range(0.25f, 0.6f);
                var live = drips.FindAll(d => d.t && d.wet > 0f);
                if (live.Count > 0)
                {
                    var d = live[Random.Range(0, live.Count)];
                    Fx.Emit(dropSprite, d.t.position, new Vector2(0f, -1.5f), 0.16f, 0.6f, Palette.Untinted, 5f);
                }
            }
            if (!dragging)
            {
                var home = towelHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.07f;
                towel.position = Vector3.Lerp(towel.position, home, Time.deltaTime * 6f);
                towel.rotation = Quaternion.Slerp(towel.rotation, Quaternion.identity, Time.deltaTime * 5f);
                idleTime += Time.deltaTime;
                if (idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible) { idleTime = 0f; ShowHint(); }
            }
        }
    }
}
