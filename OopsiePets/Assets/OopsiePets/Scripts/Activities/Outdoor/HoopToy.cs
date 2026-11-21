using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Unicorn: leaping through the rainbow hoop. Tap and the unicorn trots up and soars through the
    /// rainbow in a shower of stars, landing with a splash in the puddle on the other side.
    /// </summary>
    public class HoopToy : PlayToy
    {
        public Transform hoop;       // pivot at its cloud feet
        public Transform hoopCenter; // middle of the arch
        public Transform runUp;      // last hop before the leap
        public Transform puddleSpot;
        public float puddleWidth = 3.2f;

        public override int Rounds => 3;
        public override Transform HintTarget => hoopCenter;

        protected override void Setup() => act.ShowPuddle(puddleSpot.position, puddleWidth);

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            StartCoroutine(Leap());
        }

        IEnumerator Leap()
        {
            Busy = true;
            yield return OutdoorActivity.HopTo(pet.transform, runUp.position, 2, 0.35f, 0.24f, act.HappyVoice);
            pet.Animator.Play(PetReaction.Jump);
            // High enough that the pet's middle sails through the middle of the arch.
            var from = pet.transform.position;
            var land = puddleSpot.position + Vector3.down * 0.1f;
            float half = pet.VisualBounds().extents.y;
            float apex = Mathf.Max(2.0f, hoopCenter.position.y - half * 0.6f - Mathf.Max(from.y, land.y));
            Audio?.Play(Sfx.Whoosh, 0.6f, 1.2f);
            bool burst = false;
            yield return Ease.Tween(0.8f, k =>
            {
                pet.transform.position = Vector3.Lerp(from, land, k) + Vector3.up * Ease.Bump(k) * apex;
                if (!burst && k >= 0.45f)
                {
                    burst = true;
                    Fx?.Burst(hoopCenter.position, 14, 3f, 0.45f, 0.9f, Fx.star, Fx.sparkleYellow, Fx.sparklePink);
                    Audio?.Play(Sfx.Sparkle, 0.8f);
                }
            }, Ease.Linear, false);
            pet.transform.position = land;
            act.Splash(land, 2, true);
            pet.Animator.Play(PetReaction.Giggle);
            yield return new WaitForSeconds(0.7f);
            // Trot back around for another go.
            if (round + 1 < Rounds)
                yield return OutdoorActivity.HopTo(pet.transform, petStart.position, 4, 0.4f, 0.26f);
            Done();
        }
    }
}
