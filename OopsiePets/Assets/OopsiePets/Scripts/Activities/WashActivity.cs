using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Wash the pet: drag the big sponge over the mud. Each splat wipes away pixel by pixel where the
    /// sponge actually touches, bubbles foam up, and the pet gets happier as it gets cleaner. Then rinse:
    /// the shower comes out and the child sprays the shampoo suds away.
    /// </summary>
    public class WashActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Wash;

        [Header("Scene")]
        public Transform sponge;
        public Transform spongeHome;
        public SpriteRenderer tubFront;
        public Sprite[] mudSprites;
        public Transform shower;
        public Transform showerHome;
        public Sprite dropSprite;
        public Sprite sudsSprite;

        [Header("Tuning")]
        public Vector2Int mudOnHead = new Vector2Int(4, 5);
        public Vector2Int mudOnBody = new Vector2Int(5, 6);
        public float spongeRadius = 1.05f;
        [Tooltip("How much mud one world-unit of sponge movement wipes (0..1 alpha per pass).")]
        public float scrubStrength = 0.3f;
        [Tooltip("Suds on the pet when the rinse starts (scrubbing makes it extra foamy).")]
        public int rinseSuds = 8;
        [Tooltip("How fast the shower washes suds away (per second under the spray).")]
        public float rinseRate = 1.2f;
        public Vector2 showerFingerOffset = new Vector2(0.4f, 1.5f);
        public float cleanEnough = 0.9f;
        public float hintAfterIdle = 5f;
        public Vector2 spongeFingerOffset = new Vector2(0f, 0.35f);

        readonly List<MudSpot> spots = new List<MudSpot>();
        readonly List<SoapSuds> suds = new List<SoapSuds>();
        bool rinsing, rinseDone;
        float sudsTotal, nextDrop, nextSplash;
        Vector3 showerScale;

        public bool Rinsing => rinsing;
        float total, lastReaction, scrubTime;
        bool dragging, finishing, sneezed, extraMud;
        Vector3 spongeScale;

        void Awake()
        {
            spongeScale = sponge.localScale;
            if (shower) showerScale = shower.localScale;
        }

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            finishing = false;
            sneezed = Random.value < 0.5f; // only some washes get the surprise sneeze
            extraMud = !pet.Definition.Has(PetQuirk.MudLover);
            if (tubFront) tubFront.gameObject.SetActive(true);
            sponge.position = spongeHome.position;
            sponge.gameObject.SetActive(true);
            rinsing = rinseDone = false;
            if (shower) shower.gameObject.SetActive(false);
            suds.Clear();
            foreach (var s in pet.GetComponentsInChildren<SoapSuds>()) suds.Add(s); // lather from the shampoo
            MakeMud();
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
            foreach (var s in spots) if (s) Destroy(s.gameObject);
            foreach (var s in suds) if (s) Destroy(s.gameObject);
            suds.Clear();
            if (shower) shower.gameObject.SetActive(false);
            spots.Clear();
            sponge.gameObject.SetActive(false);
            if (tubFront) tubFront.gameObject.SetActive(false);
            base.End();
        }

        IEnumerator Intro()
        {
            // "Oopsie!" The muddy pet shakes and looks surprised before the child starts.
            yield return new WaitForSeconds(0.4f);
            pet.Animator.Play(PetReaction.Surprised);
            yield return new WaitForSeconds(1.1f);
            ShowDragHint();
        }

        void ShowDragHint()
        {
            if (IsComplete || spots.Count == 0) return;
            MudSpot target = null;
            foreach (var s in spots) if (!s.Cleared && (target == null || s.Remaining > target.Remaining)) target = s;
            if (target && ctx.hint) ctx.hint.ShowDrag(spongeHome.position, target.transform.position);
        }

        void MakeMud()
        {
            total = 0f;
            // Mud the pet brought in from the garden stays put: the child scrubs off exactly what they saw.
            foreach (var m in pet.GetComponentsInChildren<MudSpot>())
                if (!m.Cleared) spots.Add(m);
            int have = spots.Count;
            int head = Mathf.Max(0, Random.Range(mudOnHead.x, mudOnHead.y + 1) - have / 2);
            int body = Mathf.Max(0, Random.Range(mudOnBody.x, mudOnBody.y + 1) - (have - have / 2));
            if (have + head + body < 4) body += 4 - (have + head + body);
            if (head > 0) AddMud(pet.Rig.headRenderer, pet.Rig.headDecor, head, 0.05f, 60);
            if (body > 0) AddMud(pet.Rig.bodyRenderer, pet.Rig.bodyDecor, body, 0.18f, 20);
            foreach (var s in spots) total += s.Initial;
        }

        void AddMud(SpriteRenderer part, Transform parent, int n, float yBias, int order)
        {
            var pts = PetDecor.SpreadPoints(part, n, 0.24f, 0.34f, 0.26f, yBias);
            for (int i = 0; i < n; i++) spots.Add(NewSpot(part, parent, pts[i], order + i));
        }

        MudSpot NewSpot(SpriteRenderer part, Transform parent, Vector3 at, int order) => MudSpot.Splat(mudSprites, part, parent, at, order);

        IEnumerator OopsieSplat()
        {
            // Mud lovers can't help it: a giggle, a wiggle, and "Oopsie!" one more splat to scrub.
            yield return new WaitForSeconds(0.3f);
            pet.Animator.Play(PetReaction.Wiggle);
            yield return new WaitForSeconds(0.5f);
            var part = pet.Rig.bodyRenderer;
            var at = PetDecor.SpreadPoints(part, 1, 0.24f, 0.34f, 0.26f, 0.22f)[0];
            var spot = NewSpot(part, pet.Rig.bodyDecor, at, 40);
            spots.Add(spot);
            total += spot.Initial;
            Audio?.Play(Sfx.Splash, 0.6f, 1.3f);
            Fx?.Burst(spot.transform.position, 6, 2f, 0.3f, 0.5f, Fx.glowDot);
            var s = spot.transform.localScale;
            yield return Ease.Tween(0.3f, k => spot.transform.localScale = s * Ease.OutBack(k), null, false);
        }

        void OnDown(Vector2 p)
        {
            dragging = true;
            if (ctx.hint) ctx.hint.Hide();
            if (rinsing) { idleTime = 0f; MoveShower(p); return; }
            if (finishing) return;
            StartCoroutine(Ease.Tween(0.12f, k => sponge.localScale = spongeScale * Mathf.Lerp(1f, 1.12f, k), Ease.OutBack, false));
            MoveSponge(p);
        }

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!dragging) return;
            if (rinsing) { idleTime = 0f; MoveShower(p); return; }
            if (finishing) return;
            MoveSponge(p);
            Scrub(delta.magnitude);
        }

        void OnUp(Vector2 p)
        {
            dragging = false;
            sponge.localScale = spongeScale;
            if (!IsComplete) pet.Animator.SetMood(PetExpression.Neutral);
        }

        void MoveSponge(Vector2 p) => sponge.position = new Vector3(p.x + spongeFingerOffset.x, p.y + spongeFingerOffset.y, 0f);

        void Scrub(float moved)
        {
            if (moved <= 0.0001f) return;
            idleTime = 0f;
            float strength = Mathf.Clamp01(moved * scrubStrength);
            float removed = 0f;
            Vector2 at = sponge.position;
            foreach (var s in spots) removed += s.Scrub(at, spongeRadius, strength);
            // The sponge squishes the lather down a little (the shower takes the rest).
            foreach (var s in suds) if (s && Vector2.Distance(at, s.transform.position) < spongeRadius) s.Wash(strength * 0.4f, 0.35f);
            // A little squish, wobble and foam whenever the sponge is working on the pet.
            var bounds = pet.VisualBounds();
            bool onPet = bounds.Contains(new Vector3(at.x, at.y, bounds.center.z));
            if (onPet || removed > 0f)
            {
                scrubTime += Time.deltaTime;
                Audio?.Play(Sfx.Squish, 0.55f);
                sponge.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 25f) * 6f);
                if (Fx && Random.value < 0.25f)
                    Fx.Emit(Random.value < 0.6f ? Fx.bubble : Fx.foamPuff, at + Random.insideUnitCircle * 0.6f,
                        new Vector2(Random.Range(-0.6f, 0.6f), Random.Range(0.6f, 1.6f)), Random.Range(0.25f, 0.6f), Random.Range(0.6f, 1.1f), Palette.Untinted, -0.3f);
                if (!IsComplete) pet.Animator.SetMood(PetExpression.Happy);
                if (Time.time - lastReaction > 2.6f && scrubTime > 1f)
                {
                    lastReaction = Time.time;
                    var pool = new[] { PetReaction.Giggle, PetReaction.Wiggle, PetReaction.HeadTilt, PetReaction.EarWiggle };
                    if (pet.Definition.voice == PetVoice.Kitten) pool[3] = PetReaction.Purr;
                    pet.Animator.Play(pool[Random.Range(0, pool.Length)]);
                }
            }
            UpdateProgress();
        }

        void UpdateProgress()
        {
            if (total <= 0f) return;
            float left = 0f;
            foreach (var s in spots) left += Mathf.Max(0f, s.Remaining);
            float measured = 1f - left / total;
            SetProgress(Mathf.Max(Progress, measured)); // stars never go out, even after an extra splat
            if (!extraMud && measured > 0.55f)
            {
                extraMud = true;
                StartCoroutine(OopsieSplat());
            }
            if (!sneezed && Progress > 0.45f)
            {
                sneezed = true;
                pet.Animator.Play(PetReaction.Sneeze); // bubbles tickle the nose
            }
            if (!finishing && extraMud && measured >= cleanEnough) StartCoroutine(Finish());
        }

        IEnumerator Finish()
        {
            finishing = true;
            foreach (var s in spots) s.ClearAll();
            dragging = false;
            yield return new WaitForSeconds(0.3f);
            if (shower) { yield return StartRinse(); yield break; }
            Audio?.Play(Sfx.Splash, 0.7f);
            pet.Animator.Play(PetReaction.Shake);
            yield return new WaitForSeconds(1.0f);
            Fx?.Sparkles(pet.VisualBounds().center, 14, 1.8f);
            Audio?.Play(Sfx.Sparkle, 0.8f);
            pet.Animator.SetMood(PetExpression.Happy);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }

        // ---------- Rinse ----------

        IEnumerator StartRinse()
        {
            // Mud's gone, but scrubbing made the pet all foamy: time to rinse.
            SetProgress(Mathf.Max(Progress, 0.6f));
            pet.Animator.Play(PetReaction.Giggle);
            var b = pet.VisualBounds();
            suds.RemoveAll(s => !s || s.Cleared);
            foreach (var s in suds) s.Refoam(0.9f);
            for (int i = suds.Count; i < rinseSuds; i++)
            {
                bool onHead = i % 3 == 2;
                var part = onHead ? pet.Rig.headRenderer : pet.Rig.bodyRenderer;
                var parent = onHead ? pet.Rig.headDecor : pet.Rig.bodyDecor;
                var local = PetDecor.RandomPointOn(part, 0.32f, 0.28f, onHead ? 0.05f : 0.2f);
                var world = parent.TransformPoint(local);
                suds.Add(SoapSuds.Spawn(sudsSprite, parent, world, b.size.x * 0.2f, onHead ? 78 : 38, false));
            }
            sudsTotal = suds.Count;
            yield return Ease.Tween(0.3f, k => sponge.localScale = spongeScale * (1f - k), null, false);
            sponge.gameObject.SetActive(false);
            sponge.localScale = spongeScale;
            shower.gameObject.SetActive(true);
            shower.localScale = showerScale;
            var start = showerHome.position + new Vector3(3f, 0f, 0f);
            yield return Ease.Tween(0.35f, k => shower.position = Vector3.Lerp(start, showerHome.position, Ease.OutBack(k)), null, false);
            rinsing = true;
            idleTime = 0f;
            ShowRinseHint();
        }

        void ShowRinseHint()
        {
            if (ctx.hint && rinsing && !rinseDone) ctx.hint.ShowDrag(showerHome.position, pet.VisualBounds().center);
        }

        void MoveShower(Vector2 p) => shower.position = new Vector3(p.x + showerFingerOffset.x, p.y + showerFingerOffset.y, 0f);

        void Rinse(float dt)
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
                if (Mathf.Abs(q.x - spray.x) < 1.1f && q.y < spray.y + 0.3f && q.y > spray.y - 4.2f) { s.Wash(rinseRate * dt); hit = true; }
            }
            if (hit)
            {
                pet.Animator.SetMood(PetExpression.Happy);
                if (Time.time - lastReaction > 2.6f) { lastReaction = Time.time; pet.Animator.Play(Random.value < 0.5f ? PetReaction.Giggle : PetReaction.EarWiggle); }
            }
            int left = 0;
            foreach (var s in suds) if (s && !s.Cleared) left++;
            SetProgress(Mathf.Max(Progress, 0.6f + 0.4f * (1f - left / Mathf.Max(1f, sudsTotal))));
            if (left == 0 && !rinseDone) StartCoroutine(RinseFinished());
        }

        IEnumerator RinseFinished()
        {
            rinseDone = true;
            dragging = false;
            if (ctx.hint) ctx.hint.Hide();
            var from = shower.position;
            var away = showerHome.position + new Vector3(3f, 0f, 0f);
            yield return Ease.Tween(0.35f, k => shower.position = Vector3.Lerp(from, away, Ease.OutCubic(k)), null, false);
            shower.gameObject.SetActive(false);
            rinsing = false;
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
            if (rinsing && !rinseDone)
            {
                if (dragging) Rinse(Time.deltaTime);
                else
                {
                    var home = showerHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.08f;
                    shower.position = Vector3.Lerp(shower.position, home, Time.deltaTime * 6f);
                    idleTime += Time.deltaTime;
                    if (idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible) { idleTime = 0f; ShowRinseHint(); }
                }
                return;
            }
            if (!dragging)
            {
                // Sponge drifts home and bobs, inviting a grab.
                var home = spongeHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.08f;
                sponge.position = Vector3.Lerp(sponge.position, home, Time.deltaTime * 6f);
                sponge.localRotation = Quaternion.Slerp(sponge.localRotation, Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 1.3f) * 5f), Time.deltaTime * 5f);
                idleTime += Time.deltaTime;
                if (!IsComplete && idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible)
                {
                    idleTime = 0f;
                    ShowDragHint();
                }
            }
        }
    }
}
