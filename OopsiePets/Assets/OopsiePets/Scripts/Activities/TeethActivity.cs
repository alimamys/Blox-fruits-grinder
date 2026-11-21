using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Brushing teeth: the pet opens wide ("Aaah!") and there are little sugar specks on its teeth. Drag the
    /// toothbrush over them; foam bubbles up and each tooth sparkles when it is clean. Then a sip from the
    /// rinse cup, a gargle, and a big shiny smile.
    /// </summary>
    public class TeethActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Teeth;

        [Header("Scene")]
        public Transform brush;
        public Transform brushHome;
        public Transform cup;
        public Transform cupHome;
        public Sprite mouthSprite;
        public Sprite[] speckSprites;

        [Header("Tuning")]
        public int dirtyTeeth = 6;
        public float brushRadius = 0.5f;
        [Tooltip("How much one world-unit of brushing cleans a speck.")]
        public float brushPower = 0.38f;
        [Tooltip("Open mouth width as a share of the face width.")]
        public float mouthWidth = 0.55f;
        public float hintAfterIdle = 5f;

        // Tooth centres in the open-mouth sprite (normalized, origin bottom-left; from make_bath_bits.py).
        static readonly Vector2[] Teeth =
        {
            new Vector2(0.207f, 0.88f), new Vector2(0.325f, 0.88f), new Vector2(0.442f, 0.88f), new Vector2(0.558f, 0.88f), new Vector2(0.675f, 0.88f), new Vector2(0.792f, 0.88f),
            new Vector2(0.345f, 0.171f), new Vector2(0.449f, 0.125f), new Vector2(0.551f, 0.125f), new Vector2(0.655f, 0.171f),
        };

        class Speck { public SpriteRenderer sr; public float dirt = 1f; public Vector3 scale; }

        readonly List<Speck> specks = new List<Speck>();
        SpriteRenderer mouthOpen;
        bool dragging, rinsePhase, busy, finishing;
        float lastReaction;
        Vector3 brushScale, cupScale, bristleOffset;

        public Transform MouthOpen => mouthOpen ? mouthOpen.transform : null;
        public bool RinsePhase => rinsePhase;

        void Awake()
        {
            brushScale = brush.localScale;
            cupScale = cup.localScale;
            // Bristles sit at the upper-left end of the toothbrush sprite.
            var b = brush.GetComponent<SpriteRenderer>().bounds;
            bristleOffset = new Vector3(-b.extents.x * 0.72f, b.extents.y * 0.55f, 0f);
        }

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            dragging = rinsePhase = busy = finishing = false;
            brush.gameObject.SetActive(true);
            brush.position = brushHome.position;
            brush.rotation = Quaternion.identity;
            brush.localScale = brushScale;
            cup.gameObject.SetActive(false);
            OpenWide();
            pet.Animator.SetMood(PetExpression.Neutral);
            AudioManager.Instance?.PlayVoice(pet.Definition.voice, pet.Definition.voicePitch * 0.9f, VoiceKind.Surprised); // "Aaah!"
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
            if (mouthOpen) Destroy(mouthOpen.gameObject);
            mouthOpen = null;
            specks.Clear();
            if (pet && pet.Rig.mouth) pet.Rig.mouth.enabled = true;
            brush.gameObject.SetActive(false);
            cup.gameObject.SetActive(false);
            base.End();
        }

        void OpenWide()
        {
            // A big open mouth with teeth replaces the little one (it moves with the head).
            var rig = pet.Rig;
            rig.mouth.enabled = false;
            var go = new GameObject("MouthOpen");
            go.transform.SetParent(rig.head, false);
            go.transform.position = rig.mouth.transform.position;
            mouthOpen = go.AddComponent<SpriteRenderer>();
            mouthOpen.sprite = mouthSprite;
            mouthOpen.sortingOrder = 47;
            float face = rig.headWidth * Mathf.Abs(rig.head.lossyScale.x);
            float s = face * mouthWidth / Mathf.Max(0.001f, mouthSprite.bounds.size.x * Mathf.Abs(rig.head.lossyScale.x));
            go.transform.localScale = Vector3.one * s;

            // Sugar specks on some of the teeth (positions in the mouth sprite's own units; pivot top-centre).
            specks.Clear();
            var order = new List<int>();
            for (int i = 0; i < Teeth.Length; i++) order.Add(i);
            for (int i = 0; i < order.Count; i++) { int j = Random.Range(i, order.Count); (order[i], order[j]) = (order[j], order[i]); }
            var size = mouthSprite.bounds.size;
            var piv = mouthSprite.pivot / mouthSprite.pixelsPerUnit;
            for (int k = 0; k < Mathf.Min(dirtyTeeth, Teeth.Length); k++)
            {
                var n = Teeth[order[k]];
                var sp = new GameObject("Speck").AddComponent<SpriteRenderer>();
                sp.transform.SetParent(go.transform, false);
                sp.transform.localPosition = new Vector3(n.x * size.x - piv.x, n.y * size.y - piv.y, 0f);
                sp.sprite = speckSprites[Random.Range(0, speckSprites.Length)];
                sp.sortingOrder = 48;
                float ss = size.x * 0.075f / Mathf.Max(0.001f, sp.sprite.bounds.size.x);
                sp.transform.localScale = Vector3.one * ss;
                sp.transform.localRotation = Quaternion.Euler(0f, 0f, Random.Range(0f, 360f));
                specks.Add(new Speck { sr = sp, scale = sp.transform.localScale });
            }
        }

        IEnumerator Intro()
        {
            yield return new WaitForSeconds(0.8f);
            ShowHint();
        }

        void ShowHint()
        {
            if (!ctx.hint || IsComplete) return;
            if (rinsePhase) ctx.hint.ShowTap(cup);
            else if (mouthOpen) ctx.hint.ShowDrag(brushHome.position, mouthOpen.bounds.center);
        }

        void OnDown(Vector2 p)
        {
            idleTime = 0f;
            if (ctx.hint) ctx.hint.Hide();
            if (finishing) return;
            if (rinsePhase) { if (!busy) StartCoroutine(Rinse()); return; }
            dragging = true;
            MoveBrush(p);
        }

        void OnUp(Vector2 p) => dragging = false;

        void MoveBrush(Vector2 p) => brush.position = new Vector3(p.x, p.y, 0f) - bristleOffset;

        void OnDrag(Vector2 p, Vector2 delta)
        {
            if (!dragging || rinsePhase || finishing) return;
            idleTime = 0f;
            MoveBrush(p);
            float moved = delta.magnitude;
            if (moved <= 0.0001f) return;
            brush.rotation = Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 30f) * 6f);
            bool any = false;
            foreach (var s in specks)
            {
                if (s.dirt <= 0f || !s.sr) continue;
                if (Vector2.Distance(p, s.sr.transform.position) > brushRadius) continue;
                any = true;
                s.dirt = Mathf.Max(0f, s.dirt - moved * brushPower);
                var c = s.sr.color;
                c.a = Mathf.Clamp01(s.dirt * 1.3f);
                s.sr.color = c;
                s.sr.transform.localScale = s.scale * (0.5f + 0.5f * s.dirt);
                if (s.dirt <= 0f)
                {
                    // Squeaky clean tooth!
                    Fx?.Sparkles(s.sr.transform.position, 5, 0.25f);
                    Audio?.Play(Sfx.Sparkle, 0.6f, 1.4f);
                    s.sr.gameObject.SetActive(false);
                }
            }
            if (any || (mouthOpen && mouthOpen.bounds.Contains(new Vector3(p.x, p.y, mouthOpen.bounds.center.z))))
            {
                Audio?.Play(Sfx.Brush, 0.5f, 1.5f);
                // Toothpaste foam.
                if (Fx && Random.value < 0.4f)
                    Fx.Emit(Fx.foamPuff, p + Random.insideUnitCircle * 0.25f, new Vector2(Random.Range(-0.5f, 0.5f), Random.Range(0.3f, 1f)), Random.Range(0.15f, 0.3f), 0.6f, Palette.Untinted, -0.2f);
                if (Time.time - lastReaction > 3f) { lastReaction = Time.time; pet.Animator.Play(PetReaction.HeadTilt); }
            }
            int clean = 0;
            foreach (var s in specks) if (s.dirt <= 0f) clean++;
            SetProgress(0.85f * clean / Mathf.Max(1, specks.Count));
            if (clean >= specks.Count && !rinsePhase) StartCoroutine(StartRinse());
        }

        IEnumerator StartRinse()
        {
            rinsePhase = true;
            dragging = false;
            var from = brush.position;
            yield return Ease.Tween(0.3f, k => { brush.position = Vector3.Lerp(from, brushHome.position, Ease.OutCubic(k)); brush.rotation = Quaternion.identity; }, null, false);
            brush.gameObject.SetActive(false);
            cup.gameObject.SetActive(true);
            cup.localScale = cupScale;
            cup.rotation = Quaternion.identity;
            var start = cupHome.position + new Vector3(-3f, 0f, 0f);
            yield return Ease.Tween(0.35f, k => cup.position = Vector3.Lerp(start, cupHome.position, Ease.OutBack(k)), null, false);
            idleTime = 0f;
            ShowHint(); // tap the cup
        }

        IEnumerator Rinse()
        {
            busy = true;
            finishing = true;
            // Sip...
            var mouth = mouthOpen ? mouthOpen.bounds.center : pet.Rig.head.position;
            var from = cup.position;
            var to = mouth + new Vector3(0.9f, -0.2f, 0f);
            yield return Ease.Tween(0.4f, k => { cup.position = Vector3.Lerp(from, to, Ease.OutCubic(k)); cup.rotation = Quaternion.Euler(0f, 0f, 60f * k); }, null, false);
            Audio?.Play(Sfx.Splash, 0.5f, 1.5f);
            yield return new WaitForSeconds(0.3f);
            yield return Ease.Tween(0.35f, k => { cup.position = Vector3.Lerp(to, cupHome.position, Ease.OutCubic(k)); cup.rotation = Quaternion.Euler(0f, 0f, 60f * (1f - k)); }, null, false);
            // ...gargle gargle...
            pet.Animator.Play(PetReaction.Purr);
            for (int i = 0; i < 4; i++)
            {
                Audio?.Play(Sfx.Pop, 0.35f, 0.8f + i * 0.15f);
                Fx?.Emit(Fx.bubble, mouth + (Vector3)(Random.insideUnitCircle * 0.3f), new Vector2(Random.Range(-0.4f, 0.4f), 1.2f), 0.25f, 0.6f, Palette.Untinted, -0.2f);
                yield return new WaitForSeconds(0.25f);
            }
            // ...and a big, shiny smile.
            if (mouthOpen) Fx?.Sparkles(mouthOpen.bounds.center, 12, mouthOpen.bounds.extents.x);
            Audio?.Play(Sfx.Sparkle, 0.8f);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
            busy = false;
        }

        void Update()
        {
            if (IsComplete) return;
            if (!dragging && !rinsePhase)
            {
                var home = brushHome.position + Vector3.up * Mathf.Sin(Time.time * 2f) * 0.07f;
                brush.position = Vector3.Lerp(brush.position, home, Time.deltaTime * 6f);
                brush.rotation = Quaternion.Slerp(brush.rotation, Quaternion.identity, Time.deltaTime * 5f);
            }
            if (!dragging && !busy)
            {
                idleTime += Time.deltaTime;
                if (idleTime > hintAfterIdle && ctx.hint && !ctx.hint.Visible) { idleTime = 0f; ShowHint(); }
            }
        }
    }
}
