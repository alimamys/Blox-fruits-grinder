using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Piglet: a rubber duck bobbing in a big mud puddle. Tap and the duck squeaks; the piglet can't resist
    /// and jumps in with a huge SPLASH, wallows happily, then hops out for another go.
    /// </summary>
    public class DuckToy : PlayToy
    {
        public Transform duck;
        public Transform puddleSpot;
        public float puddleWidth = 5.4f;
        public Vector3 duckOffset = new Vector3(1.5f, 0.25f, 0f);

        public override int Rounds => 3;
        public override Transform HintTarget => duck;

        Vector3 duckBase;
        float duckKick = 10f;

        protected override void Setup()
        {
            act.ShowPuddle(puddleSpot.position, puddleWidth);
            duckBase = puddleSpot.position + duckOffset;
            duck.position = duckBase;
            duckKick = 10f;
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            StartCoroutine(JumpIn());
        }

        IEnumerator JumpIn()
        {
            Busy = true;
            Audio?.Play(Sfx.Squeak, 0.8f);
            duckKick = 0f;
            pet.Animator.Play(PetReaction.Jump);
            yield return new WaitForSeconds(0.2f);
            var target = puddleSpot.position + new Vector3(Random.Range(-1.1f, 0.2f), -0.1f);
            yield return OutdoorActivity.Arc(pet.transform, target, 2.6f, 0.65f);
            act.Splash(target, 2, true);
            Audio?.Play(Sfx.Squeak, 0.6f, 1.2f);
            duckKick = 0f;
            pet.Animator.Play(PetReaction.Wiggle); // wallowing in the mud
            yield return new WaitForSeconds(1.3f);
            yield return OutdoorActivity.Arc(pet.transform, petStart.position, 1.6f, 0.55f);
            pet.Animator.Play(PetReaction.Giggle);
            yield return new WaitForSeconds(0.3f);
            Done();
        }

        void Update()
        {
            // Bob on the puddle; jump when squeaked or splashed.
            duckKick += Time.deltaTime;
            float hop = duckKick < 0.5f ? Ease.Bump(duckKick / 0.5f) * 0.6f : 0f;
            duck.position = duckBase + new Vector3(0f, Mathf.Sin(Time.time * 2.5f) * 0.06f + hop, 0f);
            duck.rotation = Quaternion.Euler(0f, 0f, Mathf.Sin(Time.time * 1.7f) * 6f + (duckKick < 0.5f ? Mathf.Sin(duckKick * 40f) * 12f : 0f));
        }
    }
}
