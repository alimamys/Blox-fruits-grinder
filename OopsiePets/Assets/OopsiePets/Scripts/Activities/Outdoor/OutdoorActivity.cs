using System;
using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Playing outside in the garden, where every pet has its own toy (frisbee, yarn, carrots, swing,
    /// rubber duck, trampoline, rainbow hoop). Each round of play splashes a little mud onto the pet; when
    /// the toy's rounds are done the pet looks down at itself ("Oopsie!") and is ready for the bath.
    /// The mud is real <see cref="MudSpot"/>s, so the wash that follows cleans exactly what the child saw.
    /// </summary>
    public class OutdoorActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Outdoor;

        public SpriteRenderer puddle;
        public Sprite[] mudSprites;
        [Tooltip("One toy per ToyKind, in enum order.")]
        public PlayToy[] toys;
        public float hintAfterIdle = 4f;
        [Tooltip("The bath always gets at least this much mud to wash.")]
        public int minSplats = 5;

        PlayToy toy;
        int rounds;
        bool finishing;

        public PetView Pet => pet;
        public ActivityContext Ctx => ctx;
        public int Splats { get; private set; }
        public PlayToy Toy => toy;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            rounds = 0;
            finishing = false;
            Splats = 0;
            pet.Animator.SetMood(PetExpression.Happy);
            foreach (var t in toys) if (t) t.gameObject.SetActive(false);
            HidePuddle();
            toy = toys[Mathf.Clamp((int)pet.Definition.toy, 0, toys.Length - 1)];
            toy.Begin(this);
            StartCoroutine(Hello());
        }

        public override void End()
        {
            StopAllCoroutines();
            if (toy) toy.End();
            toy = null;
            HidePuddle();
            base.End(); // the pet keeps its mud for the bath
        }

        IEnumerator Hello()
        {
            yield return new WaitForSeconds(0.4f);
            pet.Animator.Play(PetReaction.Jump); // "Let's play!"
            yield return new WaitForSeconds(1.2f);
            if (rounds == 0 && toy && !toy.Busy) toy.ShowHint();
        }

        // ---------- Puddle ----------

        public void ShowPuddle(Vector3 at, float width)
        {
            puddle.gameObject.SetActive(true);
            puddle.transform.position = at;
            float w = puddle.sprite ? puddle.sprite.bounds.size.x : 1f;
            puddle.transform.localScale = Vector3.one * (width / Mathf.Max(0.01f, w));
        }

        public void HidePuddle() => puddle.gameObject.SetActive(false);

        /// <summary>True if a pet standing at <paramref name="p"/> has its feet in the puddle.</summary>
        public bool InPuddle(Vector3 p)
        {
            if (!puddle.gameObject.activeSelf) return false;
            var b = puddle.bounds;
            float dx = (p.x - b.center.x) / Mathf.Max(0.01f, b.extents.x * 1.15f);
            float dy = (p.y - b.center.y) / Mathf.Max(0.01f, b.extents.y * 2.2f);
            return dx * dx + dy * dy <= 1f;
        }

        // ---------- Mess ----------

        /// <summary>Mud flies at <paramref name="at"/> and <paramref name="splats"/> splats stick to the pet.</summary>
        public void Splash(Vector3 at, int splats, bool big = false)
        {
            Audio?.Play(Sfx.Splash, big ? 0.9f : 0.6f, UnityEngine.Random.Range(0.9f, 1.15f));
            if (Fx)
                for (int i = 0, n = big ? 14 : 7; i < n; i++)
                {
                    var v = new Vector2(UnityEngine.Random.Range(-2.6f, 2.6f), UnityEngine.Random.Range(2f, big ? 6f : 4f));
                    Fx.Emit(mudSprites[UnityEngine.Random.Range(0, mudSprites.Length)], at + Vector3.up * 0.2f, v,
                        UnityEngine.Random.Range(0.25f, big ? 0.6f : 0.4f), UnityEngine.Random.Range(0.6f, 0.9f), Palette.Untinted, 9f, UnityEngine.Random.Range(-200f, 200f));
                }
            for (int i = 0; i < splats; i++) AddSplat();
        }

        /// <summary>A puff of dry dirt (digging, landing on grass) without new splats.</summary>
        public void Dust(Vector3 at, int count = 6)
        {
            if (!Fx) return;
            for (int i = 0; i < count; i++)
                Fx.Emit(mudSprites[UnityEngine.Random.Range(0, mudSprites.Length)], at + (Vector3)(UnityEngine.Random.insideUnitCircle * 0.3f),
                    new Vector2(UnityEngine.Random.Range(-1.8f, 1.8f), UnityEngine.Random.Range(1.5f, 3.5f)), UnityEngine.Random.Range(0.15f, 0.3f), 0.6f, Palette.Untinted, 8f);
        }

        void AddSplat()
        {
            // Mostly on the body, every third one on the head.
            bool onHead = Splats % 3 == 2;
            var part = onHead ? pet.Rig.headRenderer : pet.Rig.bodyRenderer;
            var parent = onHead ? pet.Rig.headDecor : pet.Rig.bodyDecor;
            var at = PetDecor.RandomPointOn(part, 0.3f, 0.26f, onHead ? 0.05f : 0.15f);
            var spot = MudSpot.Splat(mudSprites, part, parent, at, (onHead ? 60 : 20) + Splats, 0.24f, 0.34f);
            StartCoroutine(PopIn(spot.transform));
            Splats++;
        }

        IEnumerator PopIn(Transform t)
        {
            var s = t.localScale;
            yield return Ease.Tween(0.25f, k => { if (t) t.localScale = s * Ease.OutBack(k); }, null, false);
        }

        // ---------- Rounds ----------

        /// <summary>Called by the toy after each round of play.</summary>
        public void RoundDone()
        {
            idleTime = 0f;
            rounds++;
            SetProgress(rounds / (float)Mathf.Max(1, toy.Rounds));
            if (rounds >= toy.Rounds && !finishing) StartCoroutine(Finish());
        }

        public void TouchIdle() => idleTime = 0f;

        IEnumerator Finish()
        {
            finishing = true;
            toy.Stop();
            yield return new WaitForSeconds(0.5f);
            // Hop to the middle of the lawn so the muddy pet is in full view (and clear of the next button).
            var show = new Vector3(0f, -4.4f, 0f);
            if (Vector3.Distance(pet.transform.position, show) > 0.6f)
                yield return HopTo(pet.transform, show, 3, 0.55f, 0.28f, HappyVoice);
            while (Splats < minSplats) AddSplat();
            // "Oopsie!" The pet looks at all that mud... and giggles.
            pet.Animator.Play(PetReaction.Surprised);
            yield return new WaitForSeconds(1.0f);
            pet.Animator.Play(PetReaction.Giggle);
            pet.Animator.SetMood(PetExpression.Happy);
            Complete();
        }

        void Update()
        {
            if (IsComplete || finishing || toy == null) return;
            idleTime += Time.deltaTime;
            if (idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible && !toy.Busy)
            {
                idleTime = 0f;
                toy.ShowHint();
            }
        }

        // ---------- Movement helpers for toys ----------

        /// <summary>Hops a pet to a point in a few cheerful bounces.</summary>
        public static IEnumerator HopTo(Transform t, Vector3 to, int hops, float height, float perHop, Action onHop = null)
        {
            var from = t.position;
            for (int h = 0; h < hops; h++)
            {
                var a = Vector3.Lerp(from, to, h / (float)hops);
                var b = Vector3.Lerp(from, to, (h + 1) / (float)hops);
                onHop?.Invoke();
                yield return Ease.Tween(perHop, k => t.position = Vector3.Lerp(a, b, k) + Vector3.up * Ease.Bump(k) * height, Ease.Linear, false);
            }
            t.position = to;
        }

        /// <summary>One big jump along an arc (also straight up and down when from == to).</summary>
        public static IEnumerator Arc(Transform t, Vector3 to, float height, float duration)
        {
            var from = t.position;
            yield return Ease.Tween(duration, k => t.position = Vector3.Lerp(from, to, k) + Vector3.up * Ease.Bump(k) * height, Ease.Linear, false);
            t.position = to;
        }

        public void HappyVoice() => AudioManager.Instance?.PlayVoice(pet.Definition.voice, pet.Definition.voicePitch, VoiceKind.Happy);
    }
}
