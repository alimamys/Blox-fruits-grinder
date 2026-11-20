using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>Pop the bubbles: lots of gently floating bubbles in different sizes; every pop answers with sound, sparkles and sometimes a funny pet reaction.</summary>
    public class BubbleActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.Bubbles;

        public Bubble bubblePrefab;
        public SpriteRenderer tubFront;
        public Transform spawnLine;
        public float spawnWidth = 3.6f;

        [Header("Tuning")]
        public int popsToFinish = 10;
        public int maxBubbles = 9;
        public Vector2 sizeRange = new Vector2(0.55f, 1.6f);
        public float giantSize = 2.6f;
        public Vector2 riseSpeed = new Vector2(0.7f, 1.3f);
        public float spawnEvery = 0.45f;

        readonly List<Bubble> pool = new List<Bubble>();
        int pops, order;
        float spawnTimer;
        bool giantDone, earBubblesDone;
        readonly List<GameObject> earBubbles = new List<GameObject>();

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            pops = 0;
            giantDone = earBubblesDone = false;
            if (tubFront) tubFront.gameObject.SetActive(true);
            pet.Animator.SetMood(PetExpression.Happy);
            for (int i = 0; i < 5; i++) Spawn(Random.Range(0.5f, 4f));
            StartCoroutine(HintSoon());
        }

        public override void End()
        {
            foreach (var b in pool) if (b) b.gameObject.SetActive(false);
            foreach (var g in earBubbles) if (g) Destroy(g);
            earBubbles.Clear();
            if (tubFront) tubFront.gameObject.SetActive(false);
            base.End();
        }

        IEnumerator HintSoon()
        {
            yield return new WaitForSeconds(1.2f);
            if (pops == 0) ShowTapHint();
        }

        void ShowTapHint()
        {
            Bubble best = null;
            foreach (var b in pool)
                if (b && b.gameObject.activeSelf && !b.Popping && (best == null || b.Size > best.Size)) best = b;
            if (best && ctx.hint) ctx.hint.ShowTap(best.transform);
        }

        Bubble Get()
        {
            foreach (var b in pool) if (!b.gameObject.activeSelf) return b;
            var nb = Instantiate(bubblePrefab, transform);
            nb.Popped = OnPopped;
            pool.Add(nb);
            return nb;
        }

        int Alive()
        {
            int n = 0;
            foreach (var b in pool) if (b.gameObject.activeSelf && !b.Popping) n++;
            return n;
        }

        Bubble Spawn(float yOffset = 0f, float size = -1f)
        {
            var b = Get();
            if (size < 0f) size = Random.value < 0.15f ? Random.Range(1.6f, 2.0f) : Random.Range(sizeRange.x, sizeRange.y);
            var pos = spawnLine.position + new Vector3(Random.Range(-spawnWidth, spawnWidth), yOffset, 0f);
            float speed = Random.Range(riseSpeed.x, riseSpeed.y) / Mathf.Sqrt(size);
            b.Launch(pos, size, new Vector2(Random.Range(-0.2f, 0.2f), speed), 14f, 200 + (order++ % 50));
            return b;
        }

        void OnPopped(Bubble b)
        {
            idleTime = 0f;
            if (ctx.hint) ctx.hint.Hide();
            pops++;
            float pitch = Mathf.Lerp(1.35f, 0.75f, Mathf.InverseLerp(sizeRange.x, giantSize, b.Size));
            Audio?.Play(Sfx.Pop, 0.8f, pitch);
            Fx?.Burst(b.transform.position, 6 + (int)(b.Size * 4), 2.2f + b.Size, 0.35f, 0.55f, Fx.glowDot, Fx.sparkleYellow, Fx.sparklePink);

            // The pet answers: big pops make it jump, small ones sometimes make it giggle or blink.
            if (b.Size >= 1.8f) pet.Animator.Play(Random.value < 0.5f ? PetReaction.Jump : PetReaction.Surprised);
            else if (Random.value < 0.35f)
            {
                var pool = new[] { PetReaction.Giggle, PetReaction.HeadTilt, PetReaction.Bounce, PetReaction.Sneeze, PetReaction.EarWiggle };
                pet.Animator.Play(pool[Random.Range(0, pool.Length)]);
            }

            if (!IsComplete)
            {
                SetProgress((float)pops / popsToFinish);
                if (pops >= popsToFinish) StartCoroutine(Finish());
            }
        }

        IEnumerator Finish()
        {
            Complete();
            yield return null;
            Audio?.Play(Sfx.Celebrate, 0.7f);
            pet.Animator.Play(PetReaction.Celebrate);
        }

        void Update()
        {
            spawnTimer -= Time.deltaTime;
            if (spawnTimer <= 0f && Alive() < maxBubbles)
            {
                spawnTimer = spawnEvery * Random.Range(0.7f, 1.3f);
                Spawn();
            }

            // Surprises, once per visit: a giant bubble (the kitten blows one by sneezing!), or bubbles stuck on long ears.
            if (!giantDone && pops >= popsToFinish / 2)
            {
                giantDone = true;
                StartCoroutine(GiantBubble());
            }
            if (!earBubblesDone && pops >= 2 && pet.Rig.earLeft && pet.Definition.voice == PetVoice.Bunny)
            {
                earBubblesDone = true;
                StartCoroutine(EarBubbles());
            }

            idleTime += Time.deltaTime;
            if (!IsComplete && idleTime > 6f && ctx.hint && !ctx.hint.Visible)
            {
                idleTime = 0f;
                ShowTapHint();
            }
        }

        IEnumerator GiantBubble()
        {
            if (pet.Definition.voice == PetVoice.Kitten)
            {
                pet.Animator.Play(PetReaction.Sneeze);
                yield return new WaitForSeconds(0.6f);
                var b = Get();
                b.Launch(pet.Rig.head.position + Vector3.down * 0.3f, giantSize, new Vector2(0.15f, 0.45f), 16f, 260);
            }
            else
            {
                var b = Spawn(0f, giantSize);
                b.transform.position = new Vector3(0f, spawnLine.position.y, 0f);
            }
            Audio?.Play(Sfx.Sparkle, 0.5f);
        }

        IEnumerator EarBubbles()
        {
            // Little bubbles land on the bunny's ears; it wiggles them off.
            var ears = new[] { pet.Rig.earLeft, pet.Rig.earRight };
            foreach (var ear in ears)
                for (int i = 0; i < 2; i++)
                {
                    var go = new GameObject("EarBubble");
                    go.transform.SetParent(ear, false);
                    go.transform.localPosition = new Vector3(Random.Range(-0.3f, 0.3f), Random.Range(1.2f, 2.4f), 0f);
                    var sr = go.AddComponent<SpriteRenderer>();
                    sr.sprite = bubblePrefab.GetComponent<SpriteRenderer>().sprite;
                    sr.sortingOrder = 90;
                    float s = Random.Range(0.5f, 0.8f) / Mathf.Max(0.01f, ear.lossyScale.x);
                    go.transform.localScale = Vector3.one * s * 0.6f;
                    earBubbles.Add(go);
                }
            pet.Animator.Play(PetReaction.Surprised);
            yield return new WaitForSeconds(2.2f);
            pet.Animator.Play(PetReaction.EarWiggle);
            yield return new WaitForSeconds(0.7f);
            foreach (var g in earBubbles)
            {
                if (!g) continue;
                Fx?.Burst(g.transform.position, 5, 2f, 0.3f, 0.4f, Fx.glowDot);
                Destroy(g);
            }
            earBubbles.Clear();
            Audio?.Play(Sfx.Pop, 0.7f, 1.3f);
        }
    }
}
