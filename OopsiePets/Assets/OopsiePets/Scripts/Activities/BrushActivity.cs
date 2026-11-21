using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>Brush the fur: drag the big brush across the messy tufts; each one smooths down and sparkles.</summary>
    public class BrushActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Brush;

        public Transform brush;
        public Transform brushHome;
        public SpriteRenderer cushion;
        public Sprite[] tuftSprites;

        [Header("Tuning")]
        public Vector2Int tuftsOnHead = new Vector2Int(4, 5);
        public Vector2Int tuftsOnBody = new Vector2Int(4, 6);
        public float brushRadius = 1.0f;
        [Tooltip("Mess removed per world unit of brushing over a tuft.")]
        public float brushPower = 0.24f;
        public Vector2 brushFingerOffset = new Vector2(0.2f, 0.45f);

        readonly List<FurTuft> tufts = new List<FurTuft>();
        bool dragging, finishing;
        float lastReaction, brushTime;
        Vector3 brushScale;

        void Awake() => brushScale = brush.localScale;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            finishing = false;
            if (cushion) cushion.gameObject.SetActive(true);
            brush.position = brushHome.position;
            brush.gameObject.SetActive(true);
            MakeTufts();
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
            foreach (var t in tufts) if (t) Destroy(t.gameObject);
            tufts.Clear();
            brush.gameObject.SetActive(false);
            if (cushion) cushion.gameObject.SetActive(false);
            base.End();
        }

        IEnumerator Intro()
        {
            yield return new WaitForSeconds(0.3f);
            pet.Animator.Play(PetReaction.HeadTilt);
            yield return new WaitForSeconds(0.8f);
            ShowHint();
        }

        void ShowHint()
        {
            FurTuft target = null;
            foreach (var t in tufts) if (!t.Settled) { target = t; break; }
            if (target && ctx.hint) ctx.hint.ShowDrag(brushHome.position, target.transform.position);
        }

        void MakeTufts()
        {
            var tint = pet.Definition.furTint;
            Add(pet.Rig.headRenderer, pet.Rig.headDecor, Random.Range(tuftsOnHead.x, tuftsOnHead.y + 1), 0.15f, 70, tint);
            int extra = pet.Definition.Has(PetQuirk.ExtraFluffy) ? 2 : 0; // woolly friends are extra messy
            Add(pet.Rig.bodyRenderer, pet.Rig.bodyDecor, Random.Range(tuftsOnBody.x, tuftsOnBody.y + 1) + extra, 0.12f, 25, tint);
        }

        void Add(SpriteRenderer part, Transform parent, int n, float yBias, int order, Color tint)
        {
            var pts = PetDecor.SpreadPoints(part, n, 0.25f, 0.38f, 0.32f, yBias);
            for (int i = 0; i < n; i++)
            {
                var go = new GameObject("Tuft");
                go.transform.SetParent(parent, false);
                go.transform.localPosition = pts[i];
                var t = go.AddComponent<FurTuft>();
                var sprite = tuftSprites[Random.Range(0, tuftSprites.Length)];
                float s = part.sprite.bounds.size.x * Random.Range(0.2f, 0.28f) / sprite.bounds.size.x;
                t.Init(sprite, tint, s, order + i);
                tufts.Add(t);
            }
        }

        void OnDown(Vector2 p)
        {
            dragging = true;
            if (ctx.hint) ctx.hint.Hide();
            brush.localScale = brushScale * 1.1f;
            Move(p);
        }

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!dragging) return;
            Move(p);
            Stroke(delta.magnitude);
        }

        void OnUp(Vector2 p)
        {
            dragging = false;
            brush.localScale = brushScale;
            if (!IsComplete) pet.Animator.SetMood(PetExpression.Neutral);
        }

        void Move(Vector2 p) => brush.position = new Vector3(p.x + brushFingerOffset.x, p.y + brushFingerOffset.y, 0f);

        void Stroke(float moved)
        {
            if (moved <= 0.0001f) return;
            idleTime = 0f;
            Vector2 at = (Vector2)brush.position - brushFingerOffset * 0.5f;
            bool touching = false;
            foreach (var t in tufts)
            {
                if (t.Settled) continue;
                if (Vector2.Distance(t.transform.position, at) > brushRadius) continue;
                touching = true;
                if (t.Brush(moved * brushPower))
                {
                    Fx?.Sparkles(t.transform.position, 5, 0.4f);
                    Audio?.Play(Sfx.Sparkle, 0.45f, Random.Range(0.95f, 1.2f));
                }
            }
            var b = pet.VisualBounds();
            if (touching || b.Contains(new Vector3(at.x, at.y, b.center.z)))
            {
                brushTime += Time.deltaTime;
                Audio?.Play(Sfx.Brush, 0.6f);
                brush.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 18f) * 8f);
                if (!IsComplete) pet.Animator.SetMood(PetExpression.Happy);
                if (Time.time - lastReaction > 3f && brushTime > 1.2f)
                {
                    lastReaction = Time.time;
                    var pool = new[] { PetReaction.Purr, PetReaction.HeadTilt, PetReaction.EarWiggle, PetReaction.Giggle };
                    pet.Animator.Play(pool[Random.Range(0, pool.Length)]);
                }
            }
            int settled = 0;
            foreach (var t in tufts) if (t.Settled) settled++;
            float mess = 0f;
            foreach (var t in tufts) mess += t.Mess;
            SetProgress(tufts.Count == 0 ? 1f : 1f - mess / tufts.Count);
            if (!finishing && settled == tufts.Count) StartCoroutine(Finish());
        }

        IEnumerator Finish()
        {
            finishing = true;
            dragging = false;
            yield return new WaitForSeconds(0.25f);
            if (pet.Definition.Has(PetQuirk.ExtraFluffy))
            {
                // A big fluffy "poof!": the freshly brushed wool puffs up.
                var c = pet.VisualBounds().center;
                for (int i = 0; i < 14; i++)
                    Fx?.Emit(Fx.foamPuff, c + (Vector3)(Random.insideUnitCircle * 1.2f), Random.insideUnitCircle.normalized * Random.Range(1.5f, 3f),
                        Random.Range(0.5f, 0.9f), 0.9f, Palette.Untinted, -0.5f);
                Audio?.Play(Sfx.Whoosh, 0.6f, 0.8f);
                var v = pet.Rig.visual;
                var s0 = v.localScale;
                yield return Ease.Tween(0.45f, k => v.localScale = s0 * (1f + 0.12f * Ease.Bump(k)), null, false);
            }
            Fx?.Sparkles(pet.VisualBounds().center, 16, 2f);
            Audio?.Play(Sfx.Celebrate, 0.7f);
            pet.Animator.SetMood(PetExpression.Happy);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }

        void Update()
        {
            if (dragging) return;
            var home = brushHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.08f;
            brush.position = Vector3.Lerp(brush.position, home, Time.deltaTime * 6f);
            brush.localRotation = Quaternion.Slerp(brush.localRotation, Quaternion.identity, Time.deltaTime * 5f);
            idleTime += Time.deltaTime;
            if (!IsComplete && idleTime > 5f && ctx.hint && !ctx.hint.Visible)
            {
                idleTime = 0f;
                ShowHint();
            }
        }
    }
}
