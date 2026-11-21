using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Shampoo first! Tap the pet to squeeze dollops of pink shampoo onto it, then rub them in with a finger
    /// until they turn into fluffy white lather. The lather stays on for the wash and rinses off under the
    /// shower afterwards.
    /// </summary>
    public class ShampooActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Shampoo;

        [Header("Scene")]
        public Transform bottle;
        public Transform bottleHome;
        public SpriteRenderer tubFront;
        public Sprite foamSprite;

        [Header("Tuning")]
        public int dollops = 5;
        [Tooltip("How much one world-unit of rubbing lathers a dollop.")]
        public float rubPower = 0.32f;
        public float rubRadius = 1.15f;
        public float hintAfterIdle = 5f;

        readonly List<SoapSuds> blobs = new List<SoapSuds>();
        int squirted;
        bool rubbing, busy, finishing;
        float lastReaction;
        Vector3 bottleScale;

        public bool Rubbing => rubbing;

        void Awake() => bottleScale = bottle.localScale;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            squirted = 0;
            rubbing = busy = finishing = false;
            blobs.Clear();
            if (tubFront) tubFront.gameObject.SetActive(true);
            bottle.gameObject.SetActive(true);
            bottle.position = bottleHome.position;
            bottle.rotation = Quaternion.identity;
            bottle.localScale = bottleScale;
            pet.Animator.SetMood(PetExpression.Neutral);
            Input.PointerDown += OnDown;
            Input.PointerDrag += OnDrag;
            StartCoroutine(Intro());
        }

        public override void End()
        {
            Input.PointerDown -= OnDown;
            Input.PointerDrag -= OnDrag;
            StopAllCoroutines();
            bottle.gameObject.SetActive(false);
            if (tubFront) tubFront.gameObject.SetActive(false);
            base.End(); // the lather stays on the pet for the wash
        }

        IEnumerator Intro()
        {
            yield return new WaitForSeconds(0.5f);
            pet.Animator.Play(PetReaction.HeadTilt);
            yield return new WaitForSeconds(0.6f);
            ShowHint();
        }

        void ShowHint()
        {
            if (!ctx.hint || IsComplete) return;
            var b = pet.VisualBounds();
            if (!rubbing) ctx.hint.ShowTap(pet.Rig.head);
            else ctx.hint.ShowDrag(b.center + Vector3.left * b.extents.x * 0.6f, b.center + Vector3.right * b.extents.x * 0.6f);
        }

        // Taps anywhere count: the shampoo lands on the nearest part of the pet.
        Vector3 OnPet(Vector2 p)
        {
            var b = pet.VisualBounds();
            float x = Mathf.Clamp(p.x, b.min.x + b.size.x * 0.22f, b.max.x - b.size.x * 0.22f);
            float y = Mathf.Clamp(p.y, b.min.y + b.size.y * 0.3f, b.max.y - b.size.y * 0.15f);
            return new Vector3(x, y, 0f);
        }

        void OnDown(Vector2 p)
        {
            idleTime = 0f;
            if (ctx.hint) ctx.hint.Hide();
            if (!rubbing && !busy && squirted < dollops) StartCoroutine(Squirt(OnPet(p)));
        }

        IEnumerator Squirt(Vector3 at)
        {
            busy = true;
            var from = bottle.position;
            var over = at + new Vector3(0.3f, 1.6f, 0f);
            yield return Ease.Tween(0.22f, k =>
            {
                bottle.position = Vector3.Lerp(from, over, Ease.OutCubic(k));
                bottle.rotation = Quaternion.Euler(0f, 0f, Mathf.Lerp(0f, 160f, k));
            }, null, false);
            // Squeeze!
            Audio?.Play(Sfx.Squish, 0.8f, 1.3f);
            yield return Ease.Tween(0.15f, k => bottle.localScale = new Vector3(bottleScale.x * (1f + 0.15f * Ease.Bump(k)), bottleScale.y * (1f - 0.15f * Ease.Bump(k)), 1f), null, false);
            bool onHead = pet.Rig.headRenderer.bounds.Contains(new Vector3(at.x, at.y, pet.Rig.headRenderer.bounds.center.z));
            var parent = onHead ? pet.Rig.headDecor : pet.Rig.bodyDecor;
            float size = pet.VisualBounds().size.x * 0.24f;
            var blob = SoapSuds.Spawn(foamSprite, parent, at, size, onHead ? 75 + squirted : 35 + squirted, true);
            blobs.Add(blob);
            Fx?.Sparkles(at, 3, 0.3f);
            squirted++;
            SetProgress(0.35f * squirted / dollops);
            if (Random.value < 0.5f) pet.Animator.Play(PetReaction.Giggle);
            var back = bottle.position;
            yield return Ease.Tween(0.25f, k =>
            {
                bottle.position = Vector3.Lerp(back, bottleHome.position, Ease.OutCubic(k));
                bottle.rotation = Quaternion.Euler(0f, 0f, Mathf.Lerp(160f, 0f, k));
            }, null, false);
            busy = false;
            if (squirted >= dollops)
            {
                rubbing = true;
                yield return new WaitForSeconds(0.4f);
                pet.Animator.Play(PetReaction.Wiggle);
                ShowHint(); // now rub it in
            }
        }

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!rubbing || finishing) return;
            idleTime = 0f;
            float moved = delta.magnitude;
            if (moved <= 0.0001f) return;
            bool any = false;
            foreach (var b in blobs)
            {
                if (!b || b.Lather >= 1f) continue;
                if (Vector2.Distance(p, b.transform.position) > rubRadius) continue;
                any = true;
                if (b.Rub(moved * rubPower))
                {
                    // Fully lathered: it puffs up and makes a little more foam around it.
                    Audio?.Play(Sfx.Sparkle, 0.4f, 1.3f);
                    for (int i = 0; i < 2; i++)
                    {
                        var off = (Vector3)(Random.insideUnitCircle.normalized * pet.VisualBounds().size.x * 0.12f);
                        var extra = SoapSuds.Spawn(foamSprite, b.transform.parent, b.transform.position + off, pet.VisualBounds().size.x * 0.16f, 34, false);
                        extra.Rub(1f);
                    }
                }
            }
            if (any)
            {
                Audio?.Play(Sfx.Squish, 0.45f, 1.2f);
                if (Fx && Random.value < 0.3f)
                    Fx.Emit(Fx.bubble, p + Random.insideUnitCircle * 0.4f, new Vector2(Random.Range(-0.5f, 0.5f), Random.Range(0.8f, 1.6f)), Random.Range(0.2f, 0.45f), 0.9f, Palette.Untinted, -0.3f);
                pet.Animator.SetMood(PetExpression.Happy);
                if (Time.time - lastReaction > 2.4f)
                {
                    lastReaction = Time.time;
                    pet.Animator.Play(Random.value < 0.5f ? PetReaction.Giggle : PetReaction.Wiggle);
                }
            }
            float sum = 0f;
            foreach (var b in blobs) sum += b ? b.Lather : 1f;
            float done = blobs.Count > 0 ? sum / blobs.Count : 0f;
            SetProgress(0.35f + 0.65f * done);
            if (done >= 0.999f && !finishing) StartCoroutine(Finish());
        }

        IEnumerator Finish()
        {
            finishing = true;
            yield return new WaitForSeconds(0.2f);
            Fx?.Sparkles(pet.VisualBounds().center, 10, 1.5f);
            Audio?.Play(Sfx.Sparkle, 0.7f);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }

        void Update()
        {
            if (IsComplete) return;
            var home = bottleHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.07f;
            if (!busy) bottle.position = Vector3.Lerp(bottle.position, home, Time.deltaTime * 6f);
            idleTime += Time.deltaTime;
            if (idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible && !busy)
            {
                idleTime = 0f;
                ShowHint();
            }
        }
    }
}
