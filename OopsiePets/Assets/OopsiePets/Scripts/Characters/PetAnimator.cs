using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// Code-driven animation for a layered pet: breathing, blinking, tail wag, ear sway, little idle
    /// fidgets, plus short additive reactions (bounce, giggle, sneeze...). Every motion is a "channel"
    /// that reactions animate; LateUpdate combines them over the rig's rest pose.
    /// </summary>
    [RequireComponent(typeof(PetRig))]
    public class PetAnimator : MonoBehaviour
    {
        public PetDefinition definition;
        public FaceSet face;

        PetRig rig;
        Vector3 visualPos, visualScale, headPos, earLPos, earRPos;
        Quaternion headRot, tailRot, earLRot, earRRot;

        // Reaction channels (all 0 at rest)
        float jump, squash, shakeX, rootTilt, headTilt, headLift, earBoost, tailBoost, vibrate, spin;
        Vector3 spinCenter; // middle of the pet in the visual's parent space; spins turn around it
        PetExpression mood = PetExpression.Neutral;
        PetExpression? flash;
        float flashUntil;
        float nextBlink, blinkUntil;
        float nextFidget, fidgetTilt, fidgetTiltTarget;
        float time;
        Coroutine reaction;

        public bool IsReacting => reaction != null;
        public PetExpression Mood => mood;

        void Awake()
        {
            rig = GetComponent<PetRig>();
            visualPos = rig.visual.localPosition;
            visualScale = rig.visual.localScale;
            headPos = rig.head.localPosition;
            headRot = rig.head.localRotation;
            tailRot = rig.tail ? rig.tail.localRotation : Quaternion.identity;
            if (rig.earLeft) { earLPos = rig.earLeft.localPosition; earLRot = rig.earLeft.localRotation; }
            if (rig.earRight) { earRPos = rig.earRight.localPosition; earRRot = rig.earRight.localRotation; }
            var b = rig.bodyRenderer.bounds;
            if (rig.headRenderer) b.Encapsulate(rig.headRenderer.bounds);
            spinCenter = transform.InverseTransformPoint(b.center) - visualPos;
            time = Random.Range(0f, 10f);
            nextBlink = Random.Range(1f, 3f);
            nextFidget = Random.Range(3f, 6f);
        }

        public void SetMood(PetExpression e) => mood = e;

        public void Flash(PetExpression e, float seconds)
        {
            flash = e;
            flashUntil = time + seconds;
        }

        public void Play(PetReaction r)
        {
            if (!isActiveAndEnabled) return;
            if (reaction != null) StopCoroutine(reaction);
            ClearChannels();
            reaction = StartCoroutine(Run(r));
            // Sparkly friends sprinkle stars whenever they react.
            var fx = FxSpawner.Instance;
            if (fx && definition && definition.Has(PetQuirk.Sparkly))
                fx.Burst(HeadWorld + Vector3.up * 0.4f, 5, 2.2f, 0.4f, 0.8f, fx.star, fx.sparkleYellow, fx.sparklePink);
        }

        public void PlayRandomTap()
        {
            if (definition == null || definition.tapReactions.Count == 0)
            {
                Play(PetReaction.Bounce);
                return;
            }
            // Favorite reaction shows up a bit more often, so each pet feels like itself.
            var r = Random.value < 0.3f ? definition.favoriteReaction : definition.tapReactions[Random.Range(0, definition.tapReactions.Count)];
            Play(r);
        }

        void ClearChannels()
        {
            jump = squash = shakeX = rootTilt = headTilt = headLift = earBoost = tailBoost = vibrate = spin = 0f;
            flash = null;
        }

        void Voice(VoiceKind kind)
        {
            if (definition != null && AudioManager.Instance != null)
                AudioManager.Instance.PlayVoice(definition.voice, definition.voicePitch, kind);
        }

        Vector3 HeadWorld => rig.head.position;

        IEnumerator Run(PetReaction r)
        {
            switch (r)
            {
                case PetReaction.Bounce:
                    Flash(PetExpression.Happy, 0.6f);
                    Voice(VoiceKind.Happy);
                    yield return Phase(0.08f, k => squash = 0.08f * k);
                    yield return Phase(0.45f, k => { jump = Ease.Bump(k) * 0.45f; squash = -0.06f * Ease.Bump(k); });
                    yield return Phase(0.15f, k => squash = 0.07f * (1f - k));
                    break;

                case PetReaction.Jump:
                    Flash(PetExpression.Excited, 1.1f);
                    Voice(VoiceKind.Excited);
                    yield return Phase(0.14f, k => squash = 0.14f * Ease.OutCubic(k));
                    yield return Phase(0.6f, k => { jump = Ease.Bump(k) * 1.1f; squash = Mathf.Lerp(-0.1f, 0f, k); earBoost = 2.5f * Ease.Bump(k); });
                    yield return Phase(0.2f, k => squash = 0.12f * Ease.Bump(k));
                    break;

                case PetReaction.Giggle:
                    Flash(PetExpression.Laugh, 1.0f);
                    Voice(VoiceKind.Giggle);
                    yield return Phase(1.0f, k => { shakeX = Mathf.Sin(k * 60f) * 0.035f * (1f - k); headTilt = Mathf.Sin(k * 12f) * 7f * (1f - k); squash = Mathf.Sin(k * 30f) * 0.03f; });
                    break;

                case PetReaction.Surprised:
                    Flash(PetExpression.Surprised, 0.9f);
                    Voice(VoiceKind.Surprised);
                    yield return Phase(0.35f, k => { jump = Ease.Bump(k) * 0.3f; earBoost = 3f * Ease.Bump(k); squash = -0.08f * Ease.Bump(k); });
                    yield return Phase(0.5f, k => headTilt = Mathf.Sin(k * Mathf.PI) * -5f);
                    break;

                case PetReaction.HeadTilt:
                {
                    float dir = Random.value < 0.5f ? -1f : 1f;
                    Flash(PetExpression.Happy, 1.0f);
                    yield return Phase(0.25f, k => headTilt = 15f * dir * Ease.OutBack(k));
                    yield return Phase(0.5f, k => headTilt = 15f * dir);
                    yield return Phase(0.3f, k => headTilt = 15f * dir * (1f - Ease.OutCubic(k)));
                    break;
                }

                case PetReaction.Celebrate:
                    Flash(PetExpression.Excited, 2.0f);
                    Voice(VoiceKind.Excited);
                    if (FxSpawner.Instance) FxSpawner.Instance.Sparkles(HeadWorld, 12, 1.6f);
                    for (int i = 0; i < 2; i++)
                    {
                        yield return Phase(0.1f, k => squash = 0.12f * k);
                        float dir = i == 0 ? 1f : -1f;
                        yield return Phase(0.55f, k => { jump = Ease.Bump(k) * 0.9f; rootTilt = Mathf.Sin(k * Mathf.PI) * 10f * dir; squash = -0.08f * Ease.Bump(k); earBoost = 2f; });
                    }
                    if (FxSpawner.Instance) FxSpawner.Instance.Hearts(HeadWorld + Vector3.up * 0.5f, 5);
                    yield return Phase(0.25f, k => { squash = 0.1f * Ease.Bump(k); earBoost = 2f * (1f - k); });
                    break;

                case PetReaction.Sneeze:
                    Flash(PetExpression.Surprised, 0.5f);
                    yield return Phase(0.45f, k => { headLift = 0.12f * Ease.OutCubic(k); headTilt = -6f * Ease.OutCubic(k); squash = -0.05f * k; });
                    Flash(PetExpression.Sneeze, 0.7f);
                    Voice(VoiceKind.Sneeze);
                    if (FxSpawner.Instance)
                        for (int i = 0; i < 6; i++)
                            FxSpawner.Instance.Emit(FxSpawner.Instance.foamPuff, HeadWorld + Vector3.down * 0.4f,
                                new Vector2(Random.Range(-2f, 2f), Random.Range(-0.5f, 1.2f)), Random.Range(0.3f, 0.5f), 0.7f, Palette.Untinted, 1f);
                    yield return Phase(0.14f, k => { headLift = Mathf.Lerp(0.12f, -0.1f, k); headTilt = Mathf.Lerp(-6f, 8f, k); squash = 0.12f * k; });
                    yield return Phase(0.5f, k => { headLift = -0.1f * (1f - k); headTilt = 8f * (1f - k); squash = 0.12f * (1f - k); shakeX = Mathf.Sin(k * 40f) * 0.03f * (1f - k); });
                    break;

                case PetReaction.Shake:
                    Flash(PetExpression.Sneeze, 0.9f);
                    Voice(VoiceKind.Happy);
                    yield return Phase(0.9f, k =>
                    {
                        float env = Ease.Bump(k);
                        shakeX = Mathf.Sin(k * 55f) * 0.12f * env;
                        rootTilt = Mathf.Sin(k * 55f + 1f) * 7f * env;
                        earBoost = 5f * env;
                        tailBoost = 2f * env;
                    });
                    if (FxSpawner.Instance)
                        for (int i = 0; i < 8; i++)
                            FxSpawner.Instance.Emit(FxSpawner.Instance.bubble, HeadWorld, Random.insideUnitCircle.normalized * Random.Range(2f, 3.5f),
                                Random.Range(0.2f, 0.35f), 0.8f, Palette.Untinted, 2f);
                    break;

                case PetReaction.EarWiggle:
                    Flash(PetExpression.Happy, 1.2f);
                    Voice(VoiceKind.Happy);
                    yield return Phase(1.2f, k => { earBoost = 6f * Ease.Bump(k); headTilt = Mathf.Sin(k * 14f) * 4f * (1f - k); });
                    break;

                case PetReaction.Purr:
                    Flash(PetExpression.Happy, 1.6f);
                    Voice(VoiceKind.Purr);
                    yield return Phase(1.6f, k => { vibrate = 0.012f * Ease.Bump(k); headTilt = 9f * Ease.Bump(k); tailBoost = 0.5f; });
                    break;

                case PetReaction.Wiggle:
                    Flash(PetExpression.Laugh, 1.6f);
                    Voice(VoiceKind.Giggle);
                    yield return Phase(1.6f, k =>
                    {
                        float env = Ease.Bump(k);
                        rootTilt = Mathf.Sin(k * Mathf.PI * 6f) * 10f * env;
                        shakeX = Mathf.Sin(k * Mathf.PI * 6f) * 0.15f * env;
                        jump = Mathf.Abs(Mathf.Sin(k * Mathf.PI * 6f)) * 0.15f * env;
                        tailBoost = 1.5f * env;
                    });
                    break;

                case PetReaction.Roll:
                {
                    // Head over heels: crouch, spring up into a full roll, bouncy landing.
                    float dir = Random.value < 0.5f ? 1f : -1f;
                    Flash(PetExpression.Excited, 1.4f);
                    Voice(VoiceKind.Excited);
                    yield return Phase(0.12f, k => squash = 0.14f * k);
                    yield return Phase(0.75f, k => { jump = Ease.Bump(k) * 1.3f; spin = 360f * dir * Ease.InOutSine(k); squash = -0.06f * Ease.Bump(k); earBoost = 2f; });
                    spin = 0f;
                    if (FxSpawner.Instance) FxSpawner.Instance.Sparkles(HeadWorld, 6, 0.8f);
                    yield return Phase(0.22f, k => { squash = 0.12f * Ease.Bump(k); earBoost = 2f * (1f - k); });
                    break;
                }

                case PetReaction.Yawn:
                    // Bored: a big yawn (eyes shut, mouth open, head back), then a little slump and a sigh.
                    Flash(PetExpression.Yawn, 1.1f);
                    if (definition != null && AudioManager.Instance != null)
                        AudioManager.Instance.PlayVoice(definition.voice, definition.voicePitch * 0.72f, VoiceKind.Happy);
                    yield return Phase(0.45f, k => { headLift = 0.1f * Ease.OutCubic(k); headTilt = -8f * Ease.OutCubic(k); squash = -0.04f * k; });
                    yield return Phase(0.55f, k => { headLift = 0.1f; headTilt = -8f; squash = -0.04f; });
                    yield return Phase(0.6f, k => { headLift = Mathf.Lerp(0.1f, -0.07f, k); headTilt = Mathf.Lerp(-8f, 7f, k); squash = Mathf.Lerp(-0.04f, 0.07f, k); });
                    yield return Phase(0.5f, k => { headLift = -0.07f * (1f - k); headTilt = 7f * (1f - k); squash = 0.07f * (1f - k); });
                    break;

                case PetReaction.Pose:
                    Flash(PetExpression.Tongue, 1.5f);
                    Voice(VoiceKind.Happy);
                    if (FxSpawner.Instance) FxSpawner.Instance.Sparkles(HeadWorld + Vector3.right * 0.8f, 4, 0.4f);
                    yield return Phase(0.25f, k => { headTilt = 14f * Ease.OutBack(k); rootTilt = -5f * Ease.OutBack(k); });
                    yield return Phase(1.0f, k => { headTilt = 14f; rootTilt = -5f; });
                    yield return Phase(0.3f, k => { headTilt = 14f * (1f - k); rootTilt = -5f * (1f - k); });
                    break;
            }
            ClearChannels();
            reaction = null;
        }

        IEnumerator Phase(float duration, System.Action<float> step)
        {
            for (float t = 0f; t < duration; t += Time.deltaTime)
            {
                step(t / duration);
                yield return null;
            }
            step(1f);
        }

        void LateUpdate()
        {
            float dt = Time.deltaTime;
            time += dt;
            var def = definition;
            float breathe = def ? def.breathe : 0.025f;
            float breath = Mathf.Sin(time * Mathf.PI * 2f / 2.2f);

            // Blink every 2-5 s.
            if (time >= nextBlink)
            {
                blinkUntil = time + 0.13f;
                nextBlink = time + Random.Range(2f, 5f);
                if (Random.value < 0.15f) nextBlink = time + 0.25f; // occasional double blink
            }

            // Small idle fidgets so a resting pet still looks alive.
            if (!IsReacting && time >= nextFidget)
            {
                nextFidget = time + Random.Range(3.5f, 7f);
                fidgetTiltTarget = Random.Range(-7f, 7f);
                if (Random.value < 0.35f) earBoost = 2.5f;
            }
            fidgetTilt = Mathf.Lerp(fidgetTilt, IsReacting ? 0f : fidgetTiltTarget, dt * 2f);
            if (!IsReacting) earBoost = Mathf.MoveTowards(earBoost, 0f, dt * 3f);

            float sx = 1f + squash - breath * breathe * 0.5f;
            float sy = 1f - squash + breath * breathe;
            var vib = vibrate > 0f ? new Vector3(Random.Range(-vibrate, vibrate), Random.Range(-vibrate, vibrate), 0f) : Vector3.zero;
            var spinOffset = spin != 0f ? spinCenter - Quaternion.Euler(0f, 0f, spin) * spinCenter : Vector3.zero;
            rig.visual.localPosition = visualPos + new Vector3(shakeX, jump, 0f) + vib + spinOffset;
            rig.visual.localRotation = Quaternion.Euler(0f, 0f, rootTilt + spin);
            rig.visual.localScale = new Vector3(visualScale.x * sx, visualScale.y * sy, visualScale.z);

            rig.head.localPosition = headPos + new Vector3(0f, headLift + breath * 0.03f, 0f);
            rig.head.localRotation = headRot * Quaternion.Euler(0f, 0f, headTilt + fidgetTilt * 0.5f);

            if (rig.tail)
            {
                float speed = (def ? def.tailWagSpeed : 3f) * (1f + tailBoost);
                float angle = (def ? def.tailWagAngle : 15f) * (1f + tailBoost * 0.5f);
                rig.tail.localRotation = tailRot * Quaternion.Euler(0f, 0f, Mathf.Sin(time * speed) * angle);
            }

            float earAngle = (def ? def.earSwayAngle : 3f) * (1f + earBoost);
            float earSpeed = (def ? def.earSwaySpeed : 1.2f) * (1f + earBoost * 1.5f);
            float ear = Mathf.Sin(time * earSpeed * Mathf.PI * 2f) * earAngle;
            if (rig.earLeft) rig.earLeft.localRotation = earLRot * Quaternion.Euler(0f, 0f, ear);
            if (rig.earRight) rig.earRight.localRotation = earRRot * Quaternion.Euler(0f, 0f, -ear);

            var expr = flash.HasValue && time < flashUntil ? flash.Value : mood;
            if (flash.HasValue && time >= flashUntil) flash = null;
            rig.SetFace(face, def, expr, time < blinkUntil);
        }
    }
}
