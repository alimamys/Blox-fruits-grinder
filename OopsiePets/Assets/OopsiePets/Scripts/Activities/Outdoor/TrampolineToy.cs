using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Lamb: bouncing on the trampoline. Each tap is a bigger boing (the second one with a flip); the third
    /// bounce is so big the lamb sails off and lands in the mud puddle.
    /// </summary>
    public class TrampolineToy : PlayToy
    {
        public Transform trampoline; // sprite, pivot at its feet
        public Transform matTop;     // where the pet stands on the mat
        public Transform puddleSpot;
        public float puddleWidth = 3.4f;

        public override int Rounds => 3;
        public override Transform HintTarget => matTop;

        Vector3 trampScale;

        protected override void Setup()
        {
            trampScale = trampoline.localScale;
            pet.transform.position = matTop.position;
            act.ShowPuddle(puddleSpot.position, puddleWidth);
        }

        protected override void Teardown()
        {
            if (trampScale != Vector3.zero) trampoline.localScale = trampScale;
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            StartCoroutine(Bounce());
        }

        IEnumerator Squash()
        {
            yield return Ease.Tween(0.12f, k => trampoline.localScale = new Vector3(trampScale.x * (1f + 0.05f * k), trampScale.y * (1f - 0.12f * k), 1f), null, false);
            yield return Ease.Tween(0.25f, k => trampoline.localScale = new Vector3(trampScale.x * (1f + 0.05f * (1f - k)), trampScale.y * (1f - 0.12f * (1f - Ease.OutBack(k))), 1f), null, false);
            trampoline.localScale = trampScale;
        }

        IEnumerator Bounce()
        {
            Busy = true;
            int n = round + 1;
            StartCoroutine(Squash());
            Audio?.Play(Sfx.Boing, 0.8f, 0.9f + n * 0.15f);
            float height = 1.4f + n * 1.1f;
            if (n < Rounds)
            {
                pet.Animator.Play(n == 2 ? PetReaction.Roll : PetReaction.Jump);
                yield return OutdoorActivity.Arc(pet.transform, matTop.position, height, 0.6f + n * 0.1f);
                StartCoroutine(Squash());
                Audio?.Play(Sfx.Boing, 0.5f, 1.3f);
                Fx?.Sparkles(matTop.position + Vector3.up * 0.3f, 4, 0.8f);
                yield return new WaitForSeconds(0.2f);
            }
            else
            {
                // Boooing! ...splash.
                pet.Animator.Play(PetReaction.Roll);
                var land = puddleSpot.position + Vector3.down * 0.1f;
                yield return OutdoorActivity.Arc(pet.transform, land, height, 0.9f);
                act.Splash(land, 5, true);
                pet.Animator.Play(PetReaction.Giggle);
                yield return new WaitForSeconds(0.8f);
            }
            Done();
        }
    }
}
