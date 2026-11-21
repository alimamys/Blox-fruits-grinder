using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Wash the pet: drag the big sponge over the mud. Each splat wipes away pixel by pixel where the
    /// sponge actually touches, bubbles foam up, and the pet gets happier as it gets cleaner.
    /// </summary>
    public class WashActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Wash;

        [Header("Scene")]
        public Transform sponge;
        public Transform spongeHome;
        public SpriteRenderer tubFront;
        public Sprite[] mudSprites;

        [Header("Tuning")]
        public Vector2Int mudOnHead = new Vector2Int(3, 4);
        public Vector2Int mudOnBody = new Vector2Int(3, 5);
        public float spongeRadius = 1.05f;
        [Tooltip("How much mud one world-unit of sponge movement wipes (0..1 alpha per pass).")]
        public float scrubStrength = 0.42f;
        public float cleanEnough = 0.9f;
        public float hintAfterIdle = 5f;
        public Vector2 spongeFingerOffset = new Vector2(0f, 0.35f);

        readonly List<MudSpot> spots = new List<MudSpot>();
        float total, lastReaction, scrubTime;
        bool dragging, finishing, sneezed, extraMud;
        Vector3 spongeScale;

        void Awake() => spongeScale = sponge.localScale;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            finishing = false;
            sneezed = Random.value < 0.5f; // only some washes get the surprise sneeze
            extraMud = !pet.Definition.Has(PetQuirk.MudLover);
            if (tubFront) tubFront.gameObject.SetActive(true);
            sponge.position = spongeHome.position;
            sponge.gameObject.SetActive(true);
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
            int head = Random.Range(mudOnHead.x, mudOnHead.y + 1);
            int body = Random.Range(mudOnBody.x, mudOnBody.y + 1);
            AddMud(pet.Rig.headRenderer, pet.Rig.headDecor, head, 0.05f, 60);
            AddMud(pet.Rig.bodyRenderer, pet.Rig.bodyDecor, body, 0.18f, 20);
            foreach (var s in spots) total += s.Initial;
        }

        void AddMud(SpriteRenderer part, Transform parent, int n, float yBias, int order)
        {
            var pts = PetDecor.SpreadPoints(part, n, 0.24f, 0.34f, 0.26f, yBias);
            for (int i = 0; i < n; i++) spots.Add(NewSpot(part, parent, pts[i], order + i));
        }

        MudSpot NewSpot(SpriteRenderer part, Transform parent, Vector3 at, int order)
        {
            var go = new GameObject("Mud");
            go.transform.SetParent(parent, false);
            go.transform.localPosition = at;
            float partWidth = part.sprite.bounds.size.x;
            var sprite = mudSprites[Random.Range(0, mudSprites.Length)];
            float s = partWidth * Random.Range(0.28f, 0.4f) / sprite.bounds.size.x;
            go.transform.localScale = new Vector3(s * (Random.value < 0.5f ? -1f : 1f), s, 1f);
            go.transform.localRotation = Quaternion.Euler(0f, 0f, Random.Range(-35f, 35f));
            var spot = go.AddComponent<MudSpot>();
            spot.Init(sprite, order);
            return spot;
        }

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
            StartCoroutine(Ease.Tween(0.12f, k => sponge.localScale = spongeScale * Mathf.Lerp(1f, 1.12f, k), Ease.OutBack, false));
            MoveSponge(p);
        }

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!dragging) return;
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
            Audio?.Play(Sfx.Splash, 0.7f);
            pet.Animator.Play(PetReaction.Shake);
            yield return new WaitForSeconds(1.0f);
            Fx?.Sparkles(pet.VisualBounds().center, 14, 1.8f);
            Audio?.Play(Sfx.Sparkle, 0.8f);
            pet.Animator.SetMood(PetExpression.Happy);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }

        void Update()
        {
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
