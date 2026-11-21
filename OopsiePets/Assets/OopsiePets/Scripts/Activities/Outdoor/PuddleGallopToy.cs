using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Pony: three puddles on the lawn. Tap a puddle; the pony gallops over (clip-clop, dust flying) and
    /// leaps right into it with a giant SPLASH. Every puddle gets a turn.
    /// </summary>
    public class PuddleGallopToy : PlayToy
    {
        public SpriteRenderer[] puddles;

        public override int Rounds => puddles.Length;
        public override Transform HintTarget
        {
            get
            {
                for (int i = 0; i < puddles.Length; i++) if (!splashed[i]) return puddles[i].transform;
                return puddles[0].transform;
            }
        }

        bool[] splashed = new bool[0];
        Vector3[] scale = new Vector3[0];

        protected override void Setup()
        {
            act.HidePuddle(); // this toy brings its own puddles
            if (scale.Length != puddles.Length)
            {
                scale = new Vector3[puddles.Length];
                for (int i = 0; i < puddles.Length; i++) scale[i] = puddles[i].transform.localScale;
            }
            splashed = new bool[puddles.Length];
            for (int i = 0; i < puddles.Length; i++) { puddles[i].transform.localScale = scale[i]; puddles[i].color = Color.white; }
        }

        protected override void Teardown()
        {
            for (int i = 0; i < puddles.Length && i < scale.Length; i++) { puddles[i].transform.localScale = scale[i]; puddles[i].color = Color.white; }
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            int best = -1;
            float bestD = float.MaxValue;
            for (int i = 0; i < puddles.Length; i++)
            {
                if (splashed[i]) continue;
                float d = Vector2.Distance(p, puddles[i].transform.position);
                if (d < bestD) { bestD = d; best = i; }
            }
            if (best >= 0) StartCoroutine(Gallop(best));
        }

        IEnumerator Gallop(int i)
        {
            Busy = true;
            splashed[i] = true;
            var t = pet.transform;
            var target = puddles[i].transform.position + Vector3.up * 0.1f;
            var dir = (target - t.position);
            // Gallop up to the edge of the puddle (quick little bounds with dust puffs)...
            var edge = target - dir.normalized * Mathf.Min(1.6f, dir.magnitude * 0.5f);
            int hops = Mathf.Clamp(Mathf.RoundToInt(Vector3.Distance(t.position, edge) / 0.9f), 1, 6);
            pet.Animator.SetMood(PetExpression.Excited);
            var from = t.position;
            for (int h = 0; h < hops; h++)
            {
                var a = Vector3.Lerp(from, edge, h / (float)hops);
                var b = Vector3.Lerp(from, edge, (h + 1) / (float)hops);
                Audio?.Play(Sfx.Tap, 0.45f, h % 2 == 0 ? 0.9f : 1.1f); // clip-clop
                yield return Ease.Tween(0.17f, k => t.position = Vector3.Lerp(a, b, k) + Vector3.up * Ease.Bump(k) * 0.35f, Ease.Linear, false);
                act.Dust(t.position, 2);
            }
            // ...and a big leap right in!
            AudioManager.Instance?.PlayVoice(pet.Definition.voice, pet.Definition.voicePitch, VoiceKind.Excited);
            yield return OutdoorActivity.Arc(t, target, 1.6f, 0.5f);
            act.Splash(target, 2, true);
            var pt = puddles[i].transform;
            var s = scale[i];
            StartCoroutine(Ease.Tween(0.5f, k => pt.localScale = new Vector3(s.x * (1f + 0.25f * Ease.Bump(k)), s.y * (1f - 0.15f * Ease.Bump(k)), s.z), null, false));
            pet.Animator.Play(PetReaction.Giggle);
            pet.Animator.SetMood(PetExpression.Laugh);
            yield return new WaitForSeconds(0.8f);
            // A splashed puddle is a little smaller (most of the water is on the pony now!).
            yield return Ease.Tween(0.3f, k => pt.localScale = s * Mathf.Lerp(1f, 0.8f, k), null, false);
            puddles[i].color = new Color(1f, 1f, 1f, 0.75f);
            pet.Animator.SetMood(PetExpression.Happy);
            Done();
        }
    }
}
