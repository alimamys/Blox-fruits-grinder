using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Puppy: fetch! Tap the lawn (or the frisbee) to throw it; the puppy dashes after it, grabs it, and
    /// brings it back. Frisbees love the mud puddle, and so does the puppy.
    /// </summary>
    public class FrisbeeToy : PlayToy
    {
        public Transform disc;
        public Transform discHome;
        public Transform puddleSpot;
        public float puddleWidth = 3.4f;

        public override int Rounds => 3;
        public override Transform HintTarget => disc;

        protected override void Setup()
        {
            disc.SetParent(transform, true);
            disc.position = discHome.position;
            disc.rotation = Quaternion.identity;
            act.ShowPuddle(puddleSpot.position, puddleWidth);
        }

        protected override void Teardown()
        {
            disc.SetParent(transform, true);
            disc.position = discHome.position;
            disc.rotation = Quaternion.identity;
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            StartCoroutine(Fetch(p));
        }

        IEnumerator Fetch(Vector2 tap)
        {
            Busy = true;
            // Throw where the child tapped. A tap on the frisbee itself, or right next to the puppy, sends it
            // to the puddle (the most fun place to fetch from).
            Vector3 target = OnLawn(tap);
            bool tappedDisc = Vector2.Distance(tap, disc.position) < 1.3f;
            if (tappedDisc || Vector2.Distance(target, pet.transform.position) < 2.2f)
                target = puddleSpot.position + new Vector3(Random.Range(-0.6f, 0.6f), Random.Range(-0.15f, 0.15f));
            var from = disc.position;
            Audio?.Play(Sfx.Whoosh, 0.6f, 1.2f);
            pet.Animator.Play(PetReaction.Surprised);
            yield return Ease.Tween(0.75f, k =>
            {
                disc.position = Vector3.Lerp(from, target, Ease.OutCubic(k)) + Vector3.up * Ease.Bump(k) * 2.4f;
                disc.rotation = Quaternion.Euler(0f, 0f, k * 900f);
            }, null, false);
            Audio?.Play(Sfx.Tap, 0.5f, 0.8f);

            // Dash, grab, splash.
            var home = petStart.position;
            var grab = target + new Vector3(0f, -0.35f);
            yield return OutdoorActivity.HopTo(pet.transform, grab, 3, 0.7f, 0.28f, act.HappyVoice);
            bool wet = act.InPuddle(grab);
            disc.SetParent(pet.Rig.head, true);
            disc.position = pet.Rig.mouth.transform.position + Vector3.down * 0.15f;
            disc.rotation = Quaternion.Euler(0f, 0f, -10f);
            if (wet) act.Splash(grab, 3, true);
            else { act.Dust(grab); act.Splash(grab, 1); }
            pet.Animator.Play(PetReaction.Wiggle);
            yield return new WaitForSeconds(0.9f);

            // Proudly back to the child, frisbee in mouth.
            yield return OutdoorActivity.HopTo(pet.transform, home, 3, 0.6f, 0.3f);
            disc.SetParent(transform, true);
            var drop = disc.position;
            yield return Ease.Tween(0.3f, k =>
            {
                disc.position = Vector3.Lerp(drop, discHome.position, k) + Vector3.up * Ease.Bump(k) * 0.6f;
                disc.rotation = Quaternion.Euler(0f, 0f, -10f * (1f - k));
            }, null, false);
            pet.Animator.Play(PetReaction.Bounce);
            Done();
        }
    }
}
