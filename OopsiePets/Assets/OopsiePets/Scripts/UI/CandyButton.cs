using System.Collections;
using UnityEngine;
using UnityEngine.EventSystems;

namespace OopsiePets
{
    /// <summary>Squishes on press, springs back on release, plays a soft tap, and can gently pulse for attention.</summary>
    public class CandyButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IPointerClickHandler
    {
        public bool pulse;
        public float pressedScale = 0.88f;
        Vector3 baseScale = Vector3.one;
        Coroutine anim;
        bool pressed;

        void Awake() => baseScale = transform.localScale;

        void OnEnable()
        {
            pressed = false;
            transform.localScale = baseScale;
        }

        public void OnPointerDown(PointerEventData e)
        {
            pressed = true;
            To(pressedScale, 0.08f, Ease.OutCubic);
        }

        public void OnPointerUp(PointerEventData e)
        {
            pressed = false;
            To(1f, 0.3f, Ease.OutBack);
        }

        public void OnPointerClick(PointerEventData e)
        {
            if (AudioManager.Instance) AudioManager.Instance.Play(Sfx.Tap, 0.6f);
        }

        void To(float s, float d, System.Func<float, float> ease)
        {
            if (!isActiveAndEnabled) return;
            if (anim != null) StopCoroutine(anim);
            float from = transform.localScale.x / Mathf.Max(0.0001f, baseScale.x);
            anim = StartCoroutine(Run(from, s, d, ease));
        }

        IEnumerator Run(float from, float to, float d, System.Func<float, float> ease)
        {
            yield return Ease.Tween(d, k => transform.localScale = baseScale * Mathf.LerpUnclamped(from, to, k), ease);
            anim = null;
        }

        void Update()
        {
            if (!pulse || pressed || anim != null) return;
            transform.localScale = baseScale * (1f + 0.06f * Mathf.Sin(Time.unscaledTime * Mathf.PI * 1.6f));
        }
    }
}
