using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Kitten: drag the yarn ball around (or tap anywhere to roll it there) and the kitten pounces on it.
    /// Pounces in the puddle are the muddiest; after each pounce the kitten bats the yarn away.
    /// </summary>
    public class YarnToy : PlayToy
    {
        public Transform yarn;
        public Transform yarnHome;
        public Transform puddleSpot;
        public float puddleWidth = 3.2f;

        public override int Rounds => 4;
        public override Transform HintTarget => yarn;

        bool dragging, moved, pouncing;
        float nextPounce;
        Coroutine roll;

        protected override void Setup()
        {
            yarn.position = yarnHome.position;
            yarn.rotation = Quaternion.identity;
            dragging = moved = pouncing = false;
            nextPounce = 0f;
            act.ShowPuddle(puddleSpot.position, puddleWidth);
        }

        protected override void Teardown() => yarn.position = yarnHome.position;

        public override void ShowHint()
        {
            // Drag the yarn toward the puddle.
            if (act.Ctx.hint) act.Ctx.hint.ShowDrag(yarn.position, puddleSpot.position);
        }

        protected override void Down(Vector2 p)
        {
            if (pouncing) return;
            if (Vector2.Distance(p, yarn.position) < 1.4f) dragging = true;
            else RollTo(OnLawn(p)); // a tap elsewhere rolls the yarn there
        }

        protected override void Drag(Vector2 p, Vector2 delta)
        {
            if (!dragging || pouncing) return;
            if (roll != null) { StopCoroutine(roll); roll = null; }
            var to = OnLawn(p);
            yarn.Rotate(0f, 0f, -(to.x - yarn.position.x) * 120f);
            yarn.position = to;
            moved = true;
        }

        protected override void Up(Vector2 p) => dragging = false;

        void RollTo(Vector3 to)
        {
            if (roll != null) StopCoroutine(roll);
            roll = StartCoroutine(Roll(to, 0.35f));
            moved = true;
        }

        IEnumerator Roll(Vector3 to, float duration)
        {
            var from = yarn.position;
            float spin = -(to.x - from.x) * 140f;
            var r0 = yarn.eulerAngles.z;
            yield return Ease.Tween(duration, k =>
            {
                yarn.position = Vector3.Lerp(from, to, Ease.OutCubic(k));
                yarn.rotation = Quaternion.Euler(0f, 0f, r0 + spin * k);
            }, null, false);
            roll = null;
        }

        void Update()
        {
            if (stopped || pouncing || !moved || Time.time < nextPounce) return;
            if (Vector2.Distance(yarn.position, pet.transform.position + Vector3.up * 0.3f) < 0.6f) return;
            StartCoroutine(Pounce());
        }

        IEnumerator Pounce()
        {
            pouncing = Busy = true;
            moved = false;
            // Wiggle wiggle... pounce!
            pet.Animator.Play(PetReaction.Jump);
            yield return new WaitForSeconds(0.25f);
            var target = OnLawn(yarn.position + Vector3.down * 0.3f);
            yield return OutdoorActivity.Arc(pet.transform, target, 1.5f, 0.5f);
            bool wet = act.InPuddle(target);
            if (wet) act.Splash(target, 2, true);
            else { act.Dust(target); act.Splash(target, 1); }
            Audio?.Play(Sfx.Pop, 0.5f, 1.3f);
            // Bat the yarn away (unless the child is holding it).
            if (!dragging)
            {
                var away = OnLawn(yarn.position + (Vector3)(Random.insideUnitCircle.normalized * 2.4f));
                if (roll != null) StopCoroutine(roll);
                roll = StartCoroutine(Roll(away, 0.5f));
            }
            pet.Animator.Play(Random.value < 0.5f ? PetReaction.Giggle : PetReaction.Purr);
            yield return new WaitForSeconds(0.6f);
            nextPounce = Time.time + 0.6f;
            pouncing = false;
            moved = false;
            Done();
        }
    }
}
