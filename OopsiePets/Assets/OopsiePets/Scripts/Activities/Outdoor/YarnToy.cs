using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Kitten: a ball of yarn that rolls like a real ball, trailing its loose string. Tap anywhere and it
    /// rolls there; hold and it follows the finger; flick it and it keeps rolling, slowing down and bouncing
    /// off the edges of the lawn. The kitten pounces after it, splashing through the puddle, and bats it away.
    /// </summary>
    public class YarnToy : PlayToy
    {
        public Transform yarn;
        public Transform yarnHome;
        public Transform puddleSpot;
        public float puddleWidth = 3.2f;

        [Header("Rolling")]
        public float yarnRadius = 0.6f;
        [Tooltip("How quickly a rolling ball slows down (per second).")]
        public float friction = 2.4f;
        [Tooltip("How tightly the ball follows a finger that holds it.")]
        public float follow = 12f;
        public float maxSpeed = 14f;

        [Header("String")]
        public LineRenderer strand;
        public LineRenderer strandEdge;
        public int strandPoints = 22;
        public float strandSegment = 0.15f;

        public override int Rounds => 4;
        public override Transform HintTarget => yarn;

        Vector3 vel, target, yarnScale;
        bool held, childMoved, pouncing;
        float pressTime, nextPounce, squash;
        Vector3[] pts = new Vector3[0], prev = new Vector3[0];

        protected override void Setup()
        {
            if (yarnScale == Vector3.zero) yarnScale = yarn.localScale;
            yarn.position = yarnHome.position;
            yarn.rotation = Quaternion.identity;
            yarn.localScale = yarnScale;
            vel = Vector3.zero;
            held = childMoved = pouncing = false;
            nextPounce = 0f;
            squash = 0f;
            act.ShowPuddle(puddleSpot.position, puddleWidth);
            ResetStrand();
        }

        protected override void Teardown()
        {
            yarn.position = yarnHome.position;
            vel = Vector3.zero;
            held = false;
            ResetStrand();
        }

        public override void ShowHint()
        {
            // Drag the yarn toward the puddle.
            if (act.Ctx.hint) act.Ctx.hint.ShowDrag(yarn.position, puddleSpot.position);
        }

        // ---------- Input: tap = roll there, hold = follow, release after a drag = flick ----------

        protected override void Down(Vector2 p)
        {
            held = true;
            pressTime = Time.time;
            target = OnLawn(p);
            childMoved = true;
        }

        protected override void Drag(Vector2 p, Vector2 delta)
        {
            if (held) target = OnLawn(p);
        }

        protected override void Up(Vector2 p)
        {
            if (!held) return;
            held = false;
            // A quick tap rolls the ball to exactly that spot (it slows down to a stop there); after a
            // drag it keeps the speed the finger gave it.
            if (Time.time - pressTime < 0.25f) vel = (target - yarn.position) * friction;
        }

        void Update()
        {
            float dt = Time.deltaTime;
            if (dt <= 0f) return;
            if (held)
            {
                var want = (target - yarn.position) * follow;
                vel = Vector3.Lerp(vel, want, 1f - Mathf.Exp(-14f * dt));
            }
            else vel *= Mathf.Exp(-friction * dt);
            if (vel.magnitude > maxSpeed) vel = vel.normalized * maxSpeed;
            if (!held && vel.sqrMagnitude < 0.0025f) vel = Vector3.zero;

            var p = yarn.position + vel * dt;
            // Bounce off the edges of the lawn.
            bool bounced = false;
            if (p.x < LawnMin.x || p.x > LawnMax.x) { vel.x = -vel.x * 0.6f; p.x = Mathf.Clamp(p.x, LawnMin.x, LawnMax.x); bounced = true; }
            if (p.y < LawnMin.y || p.y > LawnMax.y) { vel.y = -vel.y * 0.6f; p.y = Mathf.Clamp(p.y, LawnMin.y, LawnMax.y); bounced = true; }
            if (bounced && vel.magnitude > 1.5f) { squash = 1f; Audio?.Play(Sfx.Tap, 0.3f, 0.7f); }

            // Roll: turn by the distance travelled (clockwise when rolling right).
            var step = p - yarn.position;
            float dist = step.magnitude;
            if (dist > 0f)
            {
                float dir = Mathf.Abs(step.x) > 0.0001f ? -Mathf.Sign(step.x) : -1f;
                yarn.Rotate(0f, 0f, dir * dist / Mathf.Max(0.05f, yarnRadius) * Mathf.Rad2Deg);
            }
            yarn.position = p;
            squash = Mathf.MoveTowards(squash, 0f, dt * 5f);
            float s = Mathf.Sin(squash * Mathf.PI) * 0.12f;
            yarn.localScale = new Vector3(yarnScale.x * (1f + s), yarnScale.y * (1f - s), yarnScale.z);

            StepStrand(dt);

            if (!stopped && !pouncing && childMoved && Time.time >= nextPounce
                && Vector2.Distance(yarn.position, pet.transform.position + Vector3.up * 0.3f) > 0.8f
                && (!held || Time.time - pressTime > 0.3f))
                StartCoroutine(Pounce());
        }

        // ---------- The loose string (a simple rope that trails behind the ball) ----------

        void ResetStrand()
        {
            if (strandPoints < 2) return;
            pts = new Vector3[strandPoints];
            prev = new Vector3[strandPoints];
            // A loose curl lying on the grass beside the ball.
            for (int i = 0; i < strandPoints; i++)
            {
                var q = yarn.position + new Vector3(0.25f + i * strandSegment * 0.85f, -0.3f + Mathf.Sin(i * 0.45f) * 0.22f, 0f);
                pts[i] = prev[i] = q;
            }
            ApplyStrand();
        }

        void StepStrand(float dt)
        {
            if (pts.Length < 2) return;
            // The string comes out from under the ball.
            pts[0] = prev[0] = yarn.position + Vector3.down * 0.22f;
            float keep = Mathf.Exp(-5f * dt); // grass slows the string down
            for (int i = 1; i < pts.Length; i++)
            {
                var cur = pts[i];
                pts[i] += (pts[i] - prev[i]) * keep;
                prev[i] = cur;
            }
            // Rope: a link only pulls when stretched, so slack string can bunch up and curl.
            for (int it = 0; it < 8; it++)
                for (int i = 1; i < pts.Length; i++)
                {
                    var d = pts[i] - pts[i - 1];
                    float len = d.magnitude;
                    if (len > strandSegment) pts[i] = pts[i - 1] + d / len * strandSegment;
                }
            ApplyStrand();
        }

        void ApplyStrand()
        {
            foreach (var lr in new[] { strandEdge, strand })
            {
                if (!lr) continue;
                lr.positionCount = pts.Length;
                lr.SetPositions(pts);
            }
        }

        // ---------- The kitten ----------

        IEnumerator Pounce()
        {
            pouncing = Busy = true;
            childMoved = false;
            // Wiggle wiggle... pounce! (aiming where the ball is going)
            pet.Animator.Play(PetReaction.Jump);
            yield return new WaitForSeconds(0.25f);
            var landing = OnLawn(yarn.position + vel * 0.45f + Vector3.down * 0.3f);
            yield return OutdoorActivity.Arc(pet.transform, landing, 1.5f, 0.5f);
            bool wet = act.InPuddle(landing);
            if (wet) act.Splash(landing, 2, true);
            else { act.Dust(landing); act.Splash(landing, 1); }
            Audio?.Play(Sfx.Pop, 0.5f, 1.3f);
            // Got it! Bat the ball away (unless the child is holding it).
            if (!held && Vector2.Distance(yarn.position, landing) < 1.8f)
            {
                var away = (Vector3)Random.insideUnitCircle.normalized;
                if (away.sqrMagnitude < 0.01f) away = Vector3.right;
                vel = away * Random.Range(4.5f, 6.5f);
                squash = 1f;
            }
            pet.Animator.Play(Random.value < 0.5f ? PetReaction.Giggle : PetReaction.Purr);
            yield return new WaitForSeconds(0.6f);
            nextPounce = Time.time + 0.8f;
            pouncing = false;
            childMoved = false;
            Done();
        }
    }
}
