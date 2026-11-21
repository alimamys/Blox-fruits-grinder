using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Panda: sitting on the rope swing. Each tap is a push, so it swings higher and higher; after the
    /// third push it lets go at the top, rolls head over heels through the air and lands in the mud puddle.
    /// </summary>
    public class SwingToy : PlayToy
    {
        public Transform pivot;      // top of the ropes; rotates
        public Transform seat;       // where the pet sits (child of pivot, unscaled)
        public Transform puddleSpot;
        public float puddleWidth = 4.2f;
        public float period = 1.7f;

        public override int Rounds => 3;
        public override Transform HintTarget => seat;

        float amp, phase;
        int pushes;
        bool onSwing, leaping;
        Transform petParent;

        protected override void Setup()
        {
            amp = phase = 0f;
            pushes = 0;
            leaping = false;
            pivot.localRotation = Quaternion.identity;
            petParent = pet.transform.parent;
            var scale = pet.transform.localScale;
            pet.transform.SetParent(seat, false);
            pet.transform.localPosition = Vector3.zero;
            pet.transform.localRotation = Quaternion.identity;
            pet.transform.localScale = scale;
            onSwing = true;
            act.ShowPuddle(puddleSpot.position, puddleWidth);
        }

        protected override void Teardown()
        {
            if (pet && pet.transform.parent == seat) pet.transform.SetParent(petParent, true);
            if (pet) pet.transform.rotation = Quaternion.identity;
            pivot.localRotation = Quaternion.identity;
            onSwing = false;
        }

        protected override void Down(Vector2 p)
        {
            if (!onSwing || leaping || pushes >= Rounds) return;
            pushes++;
            // The last push always swings high enough to let go, however long the child waited.
            amp = pushes >= Rounds ? Mathf.Clamp(amp + 14f, 36f, 44f) : Mathf.Min(amp + 14f, 44f);
            Audio?.Play(Sfx.Whoosh, 0.55f, 0.9f + pushes * 0.1f);
            pet.Animator.Play(pushes == 1 ? PetReaction.Giggle : PetReaction.Jump);
            Fx?.Sparkles(seat.position + Vector3.up * 1.5f, 4, 0.6f);
            if (pushes < Rounds) Done(); // the last push finishes with the big leap
            else Busy = true;
        }

        void Update()
        {
            if (!onSwing) { pivot.localRotation = Quaternion.Slerp(pivot.localRotation, Quaternion.identity, Time.deltaTime * 2f); return; }
            float before = Mathf.Sin(phase);
            phase += Time.deltaTime * Mathf.PI * 2f / period;
            float s = Mathf.Sin(phase);
            if (pushes < Rounds) amp = Mathf.Max(0f, amp - Time.deltaTime * 1.5f);
            pivot.localRotation = Quaternion.Euler(0f, 0f, amp * s);
            // Let go at the top of a big forward swing.
            if (pushes >= Rounds && !leaping && amp > 30f && before < 0.98f && s >= 0.98f) StartCoroutine(Leap());
        }

        IEnumerator Leap()
        {
            leaping = true;
            onSwing = false;
            pet.transform.SetParent(petParent, true);
            pet.transform.rotation = Quaternion.identity;
            pet.Animator.Play(PetReaction.Roll);
            Audio?.Play(Sfx.Whoosh, 0.8f, 1.3f);
            var land = puddleSpot.position + Vector3.down * 0.1f;
            yield return OutdoorActivity.Arc(pet.transform, land, 2.2f, 0.85f);
            act.Splash(land, 5, true);
            pet.Animator.Play(PetReaction.Wiggle);
            yield return new WaitForSeconds(1.0f);
            Done();
        }
    }
}
