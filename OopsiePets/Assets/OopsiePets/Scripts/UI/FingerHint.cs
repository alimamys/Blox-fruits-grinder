using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>A friendly animated hand that shows what to do (drag here, tap this). Replaces written instructions.</summary>
    public class FingerHint : MonoBehaviour
    {
        public Image hand;
        public Camera worldCamera;
        public RectTransform canvasRect;
        public Camera canvasCamera;
        [Tooltip("Offset so the fingertip, not the hand's center, lands on the target.")]
        public Vector2 fingertipOffset = new Vector2(70f, -95f);

        Coroutine routine;
        public bool Visible => routine != null;

        void Awake() => hand.enabled = false;

        public void Hide()
        {
            if (routine != null) StopCoroutine(routine);
            routine = null;
            hand.enabled = false;
        }

        public void ShowDrag(Vector3 worldFrom, Vector3 worldTo)
        {
            Hide();
            routine = StartCoroutine(Drag(worldFrom, worldTo));
        }

        public void ShowTap(Transform worldTarget)
        {
            Hide();
            routine = StartCoroutine(Tap(() => worldTarget ? ToCanvas(worldTarget.position) : Vector2.zero, () => worldTarget && worldTarget.gameObject.activeInHierarchy));
        }

        public void ShowTapUI(RectTransform target)
        {
            Hide();
            routine = StartCoroutine(Tap(() => UiToCanvas(target), () => target && target.gameObject.activeInHierarchy));
        }

        Vector2 ToCanvas(Vector3 world)
        {
            var screen = RectTransformUtility.WorldToScreenPoint(worldCamera, world);
            RectTransformUtility.ScreenPointToLocalPointInRectangle(canvasRect, screen, canvasCamera, out var local);
            return local;
        }

        Vector2 UiToCanvas(RectTransform t)
        {
            var screen = RectTransformUtility.WorldToScreenPoint(canvasCamera, t.position);
            RectTransformUtility.ScreenPointToLocalPointInRectangle(canvasRect, screen, canvasCamera, out var local);
            return local;
        }

        void Place(Vector2 p, float scale, float alpha)
        {
            hand.rectTransform.anchoredPosition = p + fingertipOffset;
            hand.rectTransform.localScale = Vector3.one * scale;
            hand.color = Palette.WithAlpha(Palette.Untinted, alpha);
        }

        IEnumerator Drag(Vector3 from, Vector3 to)
        {
            hand.enabled = true;
            for (int loop = 0; loop < 3; loop++)
            {
                var a = ToCanvas(from);
                var b = ToCanvas(to);
                yield return Ease.Tween(0.25f, k => Place(a, Mathf.Lerp(0.6f, 1f, k), k), Ease.OutBack);
                yield return Ease.Tween(0.15f, k => Place(a, Mathf.Lerp(1f, 0.88f, k), 1f));
                yield return Ease.Tween(0.7f, k => Place(Vector2.Lerp(a, b, Ease.InOutSine(k)), 0.88f, 1f));
                // scrub back and forth over the target
                yield return Ease.Tween(0.9f, k => Place(b + new Vector2(Mathf.Sin(k * Mathf.PI * 4f) * 60f, Mathf.Sin(k * Mathf.PI * 2f) * 20f), 0.88f, 1f));
                yield return Ease.Tween(0.25f, k => Place(b, 0.88f, 1f - k));
                yield return new WaitForSecondsRealtime(0.25f);
            }
            hand.enabled = false;
            routine = null;
        }

        IEnumerator Tap(System.Func<Vector2> pos, System.Func<bool> alive)
        {
            hand.enabled = true;
            for (int loop = 0; loop < 4 && alive(); loop++)
            {
                yield return Ease.Tween(0.2f, k => Place(pos() + Vector2.up * 30f * (1f - k), 1f, k));
                yield return Ease.Tween(0.12f, k => Place(pos(), Mathf.Lerp(1f, 0.85f, k), 1f));
                yield return Ease.Tween(0.2f, k => Place(pos(), Mathf.Lerp(0.85f, 1f, k), 1f));
                yield return Ease.Tween(0.3f, k => Place(pos() + Vector2.up * 30f * k, 1f, 1f - k));
                yield return new WaitForSecondsRealtime(0.3f);
            }
            hand.enabled = false;
            routine = null;
        }
    }
}
