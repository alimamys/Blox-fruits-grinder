using System;
using System.Collections;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>Easing curves plus a coroutine tween. Unscaled time by default so UI keeps moving while paused.</summary>
    public static class Ease
    {
        public static float Linear(float t) => Mathf.Clamp01(t);

        public static float OutCubic(float t)
        {
            t = Mathf.Clamp01(t) - 1f;
            return t * t * t + 1f;
        }

        public static float InQuad(float t) { t = Mathf.Clamp01(t); return t * t; }

        public static float InCubic(float t) { t = Mathf.Clamp01(t); return t * t * t; }

        public static float InOutSine(float t) => -(Mathf.Cos(Mathf.PI * Mathf.Clamp01(t)) - 1f) / 2f;

        public static float OutBack(float t)
        {
            const float c1 = 1.70158f, c3 = c1 + 1f;
            t = Mathf.Clamp01(t) - 1f;
            return 1f + c3 * t * t * t + c1 * t * t;
        }

        public static float OutElastic(float t)
        {
            t = Mathf.Clamp01(t);
            if (t == 0f || t == 1f) return t;
            const float c4 = (2f * Mathf.PI) / 3f;
            return Mathf.Pow(2f, -10f * t) * Mathf.Sin((t * 10f - 0.75f) * c4) + 1f;
        }

        /// <summary>Rises to 1 and back to 0 (a "bump").</summary>
        public static float Bump(float t) => Mathf.Sin(Mathf.Clamp01(t) * Mathf.PI);

        public static IEnumerator Tween(float duration, Action<float> apply, Func<float, float> ease = null, bool unscaled = true)
        {
            ease ??= Linear;
            if (duration <= 0f)
            {
                apply(ease(1f));
                yield break;
            }
            for (float t = 0f; t < 1f; t += (unscaled ? Time.unscaledDeltaTime : Time.deltaTime) / duration)
            {
                apply(ease(t));
                yield return null;
            }
            apply(ease(1f));
        }
    }
}
