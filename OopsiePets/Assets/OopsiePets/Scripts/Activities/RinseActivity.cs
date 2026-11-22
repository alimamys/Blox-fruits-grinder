using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Rinse: after the shampoo, the sponge and the bubbles, the pet is still all foamy. The shower comes
    /// out and the child sprays the suds away; each clump melts under the water. When the last one is gone
    /// the pet shakes the water off with a happy wiggle.
    /// </summary>
    public class RinseActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Rinse;

        [Header("Scene")]
        public SpriteRenderer tubFront;
        public Transform shower;
        public Transform showerHome;
        public Sprite dropSprite;
        public Sprite sudsSprite;

        [Header("Tuning")]
        [Tooltip("Suds on the pet when the rinse starts (the bath made it extra foamy).")]
        public int rinseSuds = 8;
        [Tooltip("How fast the shower washes suds away (per second under the spray).")]
        public float rinseRate = 1.2f;
        public Vector2 showerFingerOffset = new Vector2(0.4f, 1.5f);
        public float hintAfterIdle = 5f;

        readonly List<SoapSuds> suds = new List<SoapSuds>();
        bool dragging, ready, done;
        float sudsTotal, nextDrop, nextSplash, lastReaction;
        Vector3 showerScale;

        void Awake() => showerScale = shower.localScale;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            dragging = ready = done = false;
            if (tubFront) tubFront.gameObject.SetActive(true);
            shower.gameObject.SetActive(false);
            pet.Animator.SetMood(PetExpression.Happy);
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
            foreach (var s in suds) if (s) Destroy(s.gameObject);
            suds.Clear();
            // Any foam left over from earlier steps goes too (e.g. leaving mid-rinse).
            if (pet) foreach (var s in pet.GetComponentsInChildren<SoapSuds>()) Destroy(s.gameObject);
            shower.gameObject.SetActive(false);
            if (tubFront) tubFront.gameObject.SetActive(false);
            base.End();
        }

        IEnumerator Intro()
        {
            // The lather from the shampoo and sponge is still on: puff it back up and add a few more clumps.
            var b = pet.VisualBounds();
            suds.Clear();
            foreach (var s in pet.GetComponentsInChildren<SoapSuds>()) if (!s.Cleared) suds.Add(s);
            foreach (var s in suds) s.Refoam(0.9f);
            for (int i = suds.Count; i < rinseSuds; i++)
            {
                bool onHead = i % 3 == 2;
                var part = onHead ? pet.Rig.headRenderer : pet.Rig.bodyRenderer;
                var parent = onHead ? pet.Rig.headDecor : pet.Rig.bodyDecor;
                var local = PetDecor.RandomPointOn(part, 0.32f, 0.28f, onHead ? 0.05f : 0.2f);
                var world = parent.TransformPoint(local);
                if (onHead) world = PetDecor.KeepFaceClear(pet, world);
                var s = SoapSuds.Spawn(sudsSprite, parent, world, b.size.x * 0.2f, onHead ? 78 : 38, false);
                suds.Add(s);
                var sc = s.transform.localScale;
                StartCoroutine(Ease.Tween(0.3f, k => { if (s) s.transform.localScale = sc * Ease.OutBack(k); }, null, false));
                yield return new WaitForSeconds(0.06f);
            }
            sudsTotal = suds.Count;
            pet.Animator.Play(PetReaction.Giggle);
            yield return new WaitForSeconds(0.3f);
            shower.gameObject.SetActive(true);
            shower.localScale = showerScale;
            var start = showerHome.position + new Vector3(3f, 0f, 0f);
            yield return Ease.Tween(0.35f, k => shower.position = Vector3.Lerp(start, showerHome.position, Ease.OutBack(k)), null, false);
            ready = true;
            idleTime = 0f;
            ShowHint();
        }

        public bool Ready => ready;

        void ShowHint()
        {
            if (ctx.hint && ready && !done) ctx.hint.ShowDrag(showerHome.position, pet.VisualBounds().center);
        }

        void OnDown(Vector2 p)
        {
            if (!ready || done) return;
            dragging = true;
            idleTime = 0f;
            if (ctx.hint) ctx.hint.Hide();
            MoveShower(p);
        }

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!dragging || done) return;
            idleTime = 0f;
            MoveShower(p);
        }

        void OnUp(Vector2 p) => dragging = false;

        void MoveShower(Vector2 p) => shower.position = new Vector3(p.x + showerFingerOffset.x, p.y + showerFingerOffset.y, 0f);

        void Spray(float dt)
        {
            // Water falls from the spray face (lower left of the shower head).
            var spray = shower.position + new Vector3(-0.45f, -0.5f, 0f);
            if (Fx && Time.time >= nextDrop)
            {
                nextDrop = Time.time + 0.035f;
                Fx.Emit(dropSprite, spray + new Vector3(Random.Range(-0.35f, 0.35f), 0f, 0f),
                    new Vector2(Random.Range(-0.6f, 0.4f), Random.Range(-4.5f, -3f)), Random.Range(0.18f, 0.28f), 0.7f, Palette.Untinted, 6f);
            }
            if (Time.time >= nextSplash) { nextSplash = Time.time + 0.4f; Audio?.Play(Sfx.Splash, 0.35f, 1.4f); }
            bool hit = false;
            foreach (var s in suds)
            {
                if (!s || s.Cleared) continue;
                var q = s.transform.position;
                if (Mathf.Abs(q.x - spray.x) < 1.2f && q.y < spray.y + 0.9f && q.y > spray.y - 4.2f) { s.Wash(rinseRate * dt); hit = true; }
            }
            // Spraying anywhere on the pet always helps: the nearest suds wash off (a little slower), so
            // foam the child can't quite aim at never holds the rinse up.
            if (!hit)
            {
                var b = pet.VisualBounds();
                b.Expand(1.2f);
                if (b.Contains(new Vector3(spray.x, spray.y - 1f, b.center.z)))
                {
                    SoapSuds near = null;
                    float bestD = float.MaxValue;
                    foreach (var s in suds)
                    {
                        if (!s || s.Cleared) continue;
                        float d = Vector2.Distance(spray, s.transform.position);
                        if (d < bestD) { bestD = d; near = s; }
                    }
                    if (near) { near.Wash(rinseRate * 0.6f * dt); hit = true; }
                }
            }
            if (hit)
            {
                pet.Animator.SetMood(PetExpression.Happy);
                if (Time.time - lastReaction > 2.6f) { lastReaction = Time.time; pet.Animator.Play(Random.value < 0.5f ? PetReaction.Giggle : PetReaction.EarWiggle); }
            }
            int left = 0;
            foreach (var s in suds) if (s && !s.Cleared) left++;
            SetProgress(1f - left / Mathf.Max(1f, sudsTotal));
            if (left == 0 && !done) StartCoroutine(Finish());
        }

        IEnumerator Finish()
        {
            done = true;
            dragging = false;
            if (ctx.hint) ctx.hint.Hide();
            var from = shower.position;
            var away = showerHome.position + new Vector3(3f, 0f, 0f);
            yield return Ease.Tween(0.35f, k => shower.position = Vector3.Lerp(from, away, Ease.OutCubic(k)), null, false);
            shower.gameObject.SetActive(false);
            Audio?.Play(Sfx.Splash, 0.7f);
            pet.Animator.Play(PetReaction.Shake); // shakes the water off
            yield return new WaitForSeconds(1.0f);
            Fx?.Sparkles(pet.VisualBounds().center, 14, 1.8f);
            Audio?.Play(Sfx.Sparkle, 0.8f);
            pet.Animator.SetMood(PetExpression.Happy);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }

        void Update()
        {
            if (!ready || done) return;
            if (dragging) { Spray(Time.deltaTime); return; }
            var home = showerHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.08f;
            shower.position = Vector3.Lerp(shower.position, home, Time.deltaTime * 6f);
            idleTime += Time.deltaTime;
            if (idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible) { idleTime = 0f; ShowHint(); }
        }
    }
}
