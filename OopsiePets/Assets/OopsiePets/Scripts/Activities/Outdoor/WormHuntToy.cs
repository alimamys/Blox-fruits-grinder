using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Bird: peekaboo with the friendly garden worms. A worm pops its head out of a muddy hole and giggles;
    /// tap it, and the chick hops over and gives it a gentle "boop" with its beak. Mud flies, the worm
    /// giggles and ducks back down, and another one pops up somewhere else.
    /// </summary>
    public class WormHuntToy : PlayToy
    {
        public SpriteRenderer[] worms;
        [Tooltip("Muddy holes shown where the worms hide.")]
        public SpriteRenderer[] holes;

        public override int Rounds => worms.Length;
        public override Transform HintTarget => current >= 0 ? worms[current].transform : worms[0].transform;

        bool[] booped = new bool[0];
        Vector3[] wormScale = new Vector3[0];
        int current = -1;
        Coroutine peek;

        protected override void Setup()
        {
            act.HidePuddle(); // muddy holes instead of a puddle
            if (wormScale.Length != worms.Length)
            {
                wormScale = new Vector3[worms.Length];
                for (int i = 0; i < worms.Length; i++) wormScale[i] = worms[i].transform.localScale;
            }
            booped = new bool[worms.Length];
            for (int i = 0; i < worms.Length; i++) Hide(i);
            current = -1;
            peek = StartCoroutine(PopNext(0.8f));
        }

        protected override void Teardown()
        {
            for (int i = 0; i < worms.Length && i < wormScale.Length; i++) Hide(i);
            current = -1;
        }

        void Hide(int i)
        {
            worms[i].transform.localScale = new Vector3(wormScale[i].x, 0f, wormScale[i].z);
            worms[i].gameObject.SetActive(false);
        }

        IEnumerator PopNext(float delay)
        {
            yield return new WaitForSeconds(delay);
            // Pick a hole the chick hasn't visited, preferably not right next to it.
            int pick = -1;
            float bestScore = -1f;
            for (int i = 0; i < worms.Length; i++)
            {
                if (booped[i]) continue;
                float score = Vector2.Distance(worms[i].transform.position, pet.transform.position) + Random.Range(0f, 1.5f);
                if (score > bestScore) { bestScore = score; pick = i; }
            }
            if (pick < 0) yield break;
            current = pick;
            var w = worms[pick];
            w.gameObject.SetActive(true);
            Audio?.Play(Sfx.Pop, 0.6f, 1.4f);
            var s = wormScale[pick];
            yield return Ease.Tween(0.35f, k => w.transform.localScale = new Vector3(s.x, s.y * Ease.OutBack(k), s.z), null, false);
            act.Dust(w.transform.position, 4);
            peek = null;
            if (round == 0) ShowHint();
        }

        void Update()
        {
            // The worm that is out wiggles and peeks around.
            if (current >= 0 && !Busy && current < wormScale.Length && worms[current].gameObject.activeSelf && peek == null)
            {
                var s = wormScale[current];
                worms[current].transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 4f) * 8f);
                worms[current].transform.localScale = new Vector3(s.x * (1f + 0.04f * Mathf.Sin(Time.time * 8f)), s.y * (1f - 0.04f * Mathf.Sin(Time.time * 8f)), s.z);
            }
        }

        protected override void Down(Vector2 p)
        {
            if (Busy || current < 0 || peek != null) return;
            StartCoroutine(Boop(current));
        }

        IEnumerator Boop(int i)
        {
            Busy = true;
            booped[i] = true;
            var w = worms[i].transform;
            var side = w.position.x > pet.transform.position.x ? -1f : 1f;
            var stand = OnLawn(w.position + new Vector3(side * 1.05f, -0.05f, 0f));
            yield return OutdoorActivity.HopTo(pet.transform, stand, 2, 0.5f, 0.26f, act.HappyVoice);
            // Boop! (a little bow toward the worm)
            pet.Animator.Play(PetReaction.HeadTilt);
            var p0 = pet.transform.position;
            yield return Ease.Tween(0.25f, k => pet.transform.position = p0 + new Vector3(-side * 0.35f * Ease.Bump(k), -0.1f * Ease.Bump(k), 0f), null, false);
            Audio?.Play(Sfx.Tap, 0.7f, 1.5f);
            Fx?.Hearts(w.position + Vector3.up * 0.6f, 2);
            act.Splash(w.position, 2);
            // The worm giggles and ducks back into its hole.
            Audio?.Play(Sfx.Pop, 0.6f, 1.6f);
            var s = wormScale[i];
            yield return Ease.Tween(0.3f, k => w.localScale = new Vector3(s.x, s.y * (1f - k), s.z), null, false);
            worms[i].gameObject.SetActive(false);
            if (i < holes.Length && holes[i]) holes[i].transform.localScale *= 1.1f;
            current = -1;
            pet.Animator.Play(PetReaction.Giggle);
            yield return new WaitForSeconds(0.5f);
            Done();
            if (!stopped) peek = StartCoroutine(PopNext(0.5f));
        }
    }
}
