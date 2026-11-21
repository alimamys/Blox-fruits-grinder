using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Cow: a playground slide that ends in a big mud puddle. Tap the slide; the calf climbs the ladder,
    /// sits at the top, and whooshes down... SPLOSH! into the mud. Then it trots back for another go.
    /// </summary>
    public class MudSlideToy : PlayToy
    {
        public Transform slide;
        public Transform ladderBase;
        public Transform slideTop;
        public Transform slideEnd;
        public Transform puddleSpot;
        public float puddleWidth = 3.2f;
        public Transform waitSpot;

        public override int Rounds => 3;
        public override Transform HintTarget => slideTop ? slideTop : slide;

        Vector3 slideScale;

        protected override void Setup()
        {
            if (slideScale == Vector3.zero) slideScale = slide.localScale;
            slide.localScale = slideScale;
            act.ShowPuddle(puddleSpot.position, puddleWidth);
        }

        protected override void Teardown()
        {
            if (slideScale != Vector3.zero) slide.localScale = slideScale;
        }

        protected override void Down(Vector2 p)
        {
            if (Busy) return;
            StartCoroutine(Ride());
        }

        IEnumerator Ride()
        {
            Busy = true;
            var t = pet.transform;
            // Over to the ladder...
            if (Vector3.Distance(t.position, ladderBase.position) > 0.3f)
                yield return OutdoorActivity.HopTo(t, ladderBase.position, 2, 0.45f, 0.3f, act.HappyVoice);
            // ...climb, climb, climb...
            var from = t.position;
            for (int i = 0; i < 3; i++)
            {
                var a = Vector3.Lerp(from, slideTop.position, i / 3f);
                var b = Vector3.Lerp(from, slideTop.position, (i + 1) / 3f);
                Audio?.Play(Sfx.Tap, 0.4f, 0.9f + i * 0.12f);
                yield return Ease.Tween(0.28f, k => t.position = Vector3.Lerp(a, b, k) + Vector3.up * Ease.Bump(k) * 0.25f, null, false);
            }
            // ...wiggle at the top, and wheee!
            pet.Animator.Play(PetReaction.Wiggle);
            AudioManager.Instance?.PlayVoice(pet.Definition.voice, pet.Definition.voicePitch, VoiceKind.Excited);
            yield return new WaitForSeconds(0.45f);
            pet.Animator.SetMood(PetExpression.Excited);
            Audio?.Play(Sfx.Whoosh, 0.8f);
            var top = slideTop.position;
            var end = slideEnd.position;
            float tilt = Mathf.Atan2(end.y - top.y, end.x - top.x) * Mathf.Rad2Deg * 0.5f;
            yield return Ease.Tween(0.7f, k =>
            {
                t.position = Vector3.Lerp(top, end, k);
                t.localRotation = Quaternion.Euler(0f, 0f, tilt * Mathf.Sin(Mathf.Clamp01(k * 1.2f) * Mathf.PI * 0.5f));
            }, Ease.InQuad, false);
            // Off the end, into the mud.
            var land = puddleSpot.position + new Vector3(Random.Range(-0.3f, 0.3f), 0.15f, 0f);
            var e0 = t.position;
            yield return Ease.Tween(0.4f, k =>
            {
                t.position = Vector3.Lerp(e0, land, k) + Vector3.up * Ease.Bump(k) * 0.8f;
                t.localRotation = Quaternion.Euler(0f, 0f, tilt * (1f - k));
            }, null, false);
            t.localRotation = Quaternion.identity;
            act.Splash(land, 3, true);
            pet.Animator.Play(PetReaction.Giggle);
            pet.Animator.SetMood(PetExpression.Laugh);
            yield return new WaitForSeconds(0.9f);
            pet.Animator.SetMood(PetExpression.Happy);
            // Out of the puddle, ready for another go.
            yield return OutdoorActivity.HopTo(t, waitSpot.position, 2, 0.4f, 0.3f, act.HappyVoice);
            Done();
        }
    }
}
