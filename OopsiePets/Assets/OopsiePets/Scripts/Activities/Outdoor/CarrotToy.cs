using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Bunny: carrots growing in the garden. Tap one; the bunny hops over, digs (dirt flies everywhere),
    /// pops the carrot out and munches it.
    /// </summary>
    public class CarrotToy : PlayToy
    {
        public SpriteRenderer[] mounds;
        public Sprite carrotSprite;
        [Tooltip("What is left after a carrot is pulled: a patch of dug-up dirt.")]
        public Sprite dugSprite;
        public float carrotSize = 1.6f;

        public override int Rounds => mounds.Length;
        public override Transform HintTarget
        {
            get
            {
                for (int i = 0; i < mounds.Length; i++) if (!pulled[i]) return mounds[i].transform;
                return mounds[0].transform;
            }
        }

        bool[] pulled = new bool[0];
        Vector3[] moundScale = new Vector3[0];
        Sprite[] moundSprite = new Sprite[0];
        readonly List<GameObject> spawned = new List<GameObject>();

        protected override void Setup()
        {
            act.HidePuddle(); // soil instead of a puddle
            if (moundScale.Length != mounds.Length)
            {
                moundScale = new Vector3[mounds.Length];
                moundSprite = new Sprite[mounds.Length];
                for (int i = 0; i < mounds.Length; i++) { moundScale[i] = mounds[i].transform.localScale; moundSprite[i] = mounds[i].sprite; }
            }
            pulled = new bool[mounds.Length];
            for (int i = 0; i < mounds.Length; i++) Restore(i);
        }

        void Restore(int i)
        {
            mounds[i].sprite = moundSprite[i];
            mounds[i].transform.localScale = moundScale[i];
            mounds[i].transform.localRotation = Quaternion.identity;
        }

        protected override void Teardown()
        {
            foreach (var g in spawned) if (g) Destroy(g);
            spawned.Clear();
            for (int i = 0; i < mounds.Length && i < moundScale.Length; i++) Restore(i);
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            int best = -1;
            float bestD = float.MaxValue;
            for (int i = 0; i < mounds.Length; i++)
            {
                if (pulled[i]) continue;
                float d = Vector2.Distance(p, mounds[i].transform.position);
                if (d < bestD) { bestD = d; best = i; }
            }
            if (best >= 0) StartCoroutine(Pull(best));
        }

        IEnumerator Pull(int i)
        {
            Busy = true;
            pulled[i] = true;
            var m = mounds[i].transform;
            var side = m.position.x > pet.transform.position.x ? -1f : 1f;
            var stand = m.position + new Vector3(side * 1.1f, -0.1f);
            yield return OutdoorActivity.HopTo(pet.transform, stand, 2, 0.6f, 0.32f, act.HappyVoice);

            // Dig, dig, dig!
            pet.Animator.Play(PetReaction.Wiggle);
            for (int k = 0; k < 3; k++)
            {
                act.Dust(m.position + Vector3.up * 0.3f, 7);
                Audio?.Play(Sfx.Brush, 0.6f, 0.8f + k * 0.1f);
                var s0 = moundScale[i];
                yield return Ease.Tween(0.22f, t => m.localScale = new Vector3(s0.x * (1f + 0.08f * Ease.Bump(t)), s0.y * (1f - 0.1f * Ease.Bump(t)), 1f), null, false);
            }
            act.Splash(pet.transform.position + Vector3.up * 0.4f, 2);

            // Pop! Out comes the carrot.
            Audio?.Play(Sfx.Pop, 0.8f, 1.1f);
            var go = new GameObject("Carrot");
            go.transform.SetParent(transform, true);
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = carrotSprite;
            sr.sortingOrder = 30;
            float cs = carrotSize / Mathf.Max(0.01f, carrotSprite.bounds.size.x);
            spawned.Add(go);
            if (dugSprite)
            {
                // Only a patch of loose dirt is left where the carrot grew.
                float w = moundSprite[i].bounds.size.x * moundScale[i].x * 0.75f;
                mounds[i].sprite = dugSprite;
                m.localScale = Vector3.one * (w / Mathf.Max(0.01f, dugSprite.bounds.size.x));
                m.localRotation = Quaternion.Euler(0f, 0f, Random.Range(-10f, 10f));
            }
            else m.localScale = moundScale[i] * 0.7f;
            var start = m.position + Vector3.up * 0.4f;
            var land = pet.Rig.mouth.transform.position + Vector3.down * 0.2f;
            yield return Ease.Tween(0.6f, t =>
            {
                go.transform.position = Vector3.Lerp(start, land, t) + Vector3.up * Ease.Bump(t) * 1.8f;
                go.transform.rotation = Quaternion.Euler(0f, 0f, t * 400f);
                go.transform.localScale = Vector3.one * cs * Mathf.Lerp(0.5f, 1f, t);
            }, null, false);

            // Munch munch.
            pet.Animator.Play(PetReaction.Giggle);
            for (int k = 0; k < 3; k++)
            {
                Audio?.Play(Sfx.Squish, 0.5f, 1.4f);
                float from = Mathf.Lerp(1f, 0.25f, k / 3f), to = Mathf.Lerp(1f, 0.25f, (k + 1) / 3f);
                yield return Ease.Tween(0.25f, t => go.transform.localScale = Vector3.one * cs * Mathf.Lerp(from, to, t), null, false);
            }
            Fx?.Sparkles(go.transform.position, 5, 0.4f);
            Destroy(go);
            spawned.Remove(go);
            pet.Animator.Play(PetReaction.Bounce);
            yield return new WaitForSeconds(0.4f);
            Done();
        }
    }
}
