using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Giraffe: an apple tree with a mud puddle underneath. Tap an apple; the giraffe trots under it,
    /// stretches up tall on its tiptoes and bonks the branch with its head. The apple drops... plop! right
    /// into the puddle, splashing mud everywhere. Then the giraffe munches it.
    /// </summary>
    public class AppleTreeToy : PlayToy
    {
        public SpriteRenderer[] apples;
        public Transform puddleSpot;
        public float puddleWidth = 4.4f;
        [Tooltip("Height of the giraffe's feet under the tree.")]
        public float standY = -5.0f;
        public Vector2 standRangeX = new Vector2(-3.6f, 0.8f);

        public override int Rounds => apples.Length;
        public override Transform HintTarget
        {
            get
            {
                for (int i = 0; i < apples.Length; i++) if (!picked[i]) return apples[i].transform;
                return apples[0].transform;
            }
        }

        bool[] picked = new bool[0];
        Vector3[] home = new Vector3[0];
        Vector3[] scale = new Vector3[0];

        protected override void Setup()
        {
            if (home.Length != apples.Length)
            {
                home = new Vector3[apples.Length];
                scale = new Vector3[apples.Length];
                for (int i = 0; i < apples.Length; i++) { home[i] = apples[i].transform.position; scale[i] = apples[i].transform.localScale; }
            }
            picked = new bool[apples.Length];
            for (int i = 0; i < apples.Length; i++) Restore(i);
            act.ShowPuddle(puddleSpot.position, puddleWidth);
        }

        void Restore(int i)
        {
            var t = apples[i].transform;
            t.position = home[i];
            t.localScale = scale[i];
            t.localRotation = Quaternion.identity;
            apples[i].gameObject.SetActive(true);
        }

        protected override void Teardown()
        {
            for (int i = 0; i < apples.Length && i < home.Length; i++) Restore(i);
        }

        void Update()
        {
            // Ripe apples sway gently on the branches.
            for (int i = 0; i < apples.Length; i++)
                if (!picked[i] && i < home.Length)
                    apples[i].transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 1.6f + i * 1.3f) * 6f);
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            int best = -1;
            float bestD = float.MaxValue;
            for (int i = 0; i < apples.Length; i++)
            {
                if (picked[i]) continue;
                float d = Vector2.Distance(p, apples[i].transform.position);
                if (d < bestD) { bestD = d; best = i; }
            }
            if (best >= 0) StartCoroutine(Pick(best));
        }

        IEnumerator Pick(int i)
        {
            Busy = true;
            picked[i] = true;
            var apple = apples[i].transform;
            var stand = new Vector3(Mathf.Clamp(apple.position.x + 0.5f, standRangeX.x, standRangeX.y), standY, 0f);
            if (Vector3.Distance(pet.transform.position, stand) > 0.3f)
                yield return OutdoorActivity.HopTo(pet.transform, stand, 2, 0.4f, 0.3f, act.HappyVoice);

            // Stretch up tall... taller... bonk!
            var s0 = pet.transform.localScale;
            pet.Animator.SetMood(PetExpression.Excited);
            Audio?.Play(Sfx.Whoosh, 0.5f, 1.3f);
            yield return Ease.Tween(0.45f, k => pet.transform.localScale = new Vector3(s0.x * (1f - 0.08f * k), s0.y * (1f + 0.18f * k), s0.z), Ease.OutCubic, false);
            var up = pet.transform.position;
            yield return Ease.Tween(0.22f, k => pet.transform.position = up + Vector3.up * 0.6f * Ease.OutCubic(k), null, false);
            Audio?.Play(Sfx.Tap, 0.7f, 0.8f);
            Fx?.Sparkles(apple.position, 6, 0.5f);
            StartCoroutine(Shake(apple));
            yield return Ease.Tween(0.25f, k =>
            {
                pet.transform.position = up + Vector3.up * 0.6f * (1f - Ease.InCubic(k));
                pet.transform.localScale = new Vector3(s0.x * (1f - 0.08f * (1f - k)), s0.y * (1f + 0.18f * (1f - k)), s0.z);
            }, null, false);
            pet.transform.localScale = s0;
            pet.transform.position = up;
            pet.Animator.SetMood(PetExpression.Happy);

            // The apple drops into the puddle beside the giraffe: plop, splash!
            var from = apple.position;
            var land = new Vector3(Mathf.Clamp(stand.x + 1.0f, puddleSpot.position.x - puddleWidth * 0.4f, puddleSpot.position.x + puddleWidth * 0.4f), puddleSpot.position.y + 0.1f, 0f);
            yield return Ease.Tween(0.5f, k =>
            {
                apple.position = Vector3.Lerp(from, land, k) + Vector3.down * 0.0f + Vector3.up * Mathf.Sin(k * Mathf.PI) * 0.4f * (1f - k);
                apple.localRotation = Quaternion.Euler(0f, 0f, -300f * k);
            }, Ease.InQuad, false);
            act.Splash(land, 2, true);
            pet.Animator.Play(PetReaction.Surprised);
            yield return Ease.Tween(0.3f, k => apple.position = land + Vector3.up * Ease.Bump(k) * 0.5f, null, false);
            yield return new WaitForSeconds(0.4f);

            // Munch munch.
            var mouth = pet.Rig.mouth.transform.position + Vector3.down * 0.15f;
            var a0 = apple.position;
            yield return Ease.Tween(0.4f, k => apple.position = Vector3.Lerp(a0, mouth, k) + Vector3.up * Ease.Bump(k) * 0.8f, null, false);
            pet.Animator.Play(PetReaction.Giggle);
            var sc = apple.localScale;
            for (int k = 0; k < 3; k++)
            {
                Audio?.Play(Sfx.Squish, 0.5f, 1.3f);
                float f0 = Mathf.Lerp(1f, 0.25f, k / 3f), f1 = Mathf.Lerp(1f, 0.25f, (k + 1) / 3f);
                yield return Ease.Tween(0.25f, t => apple.localScale = sc * Mathf.Lerp(f0, f1, t), null, false);
            }
            Fx?.Sparkles(apple.position, 5, 0.4f);
            apples[i].gameObject.SetActive(false);
            pet.Animator.Play(PetReaction.Bounce);
            yield return new WaitForSeconds(0.4f);
            Done();
        }

        IEnumerator Shake(Transform apple)
        {
            // The whole branch wobbles: every apple still on the tree jiggles.
            var list = new List<int>();
            for (int i = 0; i < apples.Length; i++) if (!picked[i]) list.Add(i);
            yield return Ease.Tween(0.4f, k =>
            {
                foreach (var j in list) apples[j].transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(k * 30f) * 14f * (1f - k));
            }, null, false);
        }
    }
}
