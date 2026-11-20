using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>The sticker moment: a big sticker spins in over a sunburst, confetti flies, then it tucks into the album.</summary>
    public class RewardPanel : MonoBehaviour
    {
        public CanvasGroup group;
        public RectTransform stickerRect;
        public Image sticker;
        public RectTransform rays;
        public Button homeButton;
        public RectTransform albumTarget;
        bool closed;

        void Awake()
        {
            homeButton.onClick.AddListener(() => closed = true);
            HideNow();
        }

        public void HideNow()
        {
            group.alpha = 0f;
            group.blocksRaycasts = false;
            gameObject.SetActive(false);
        }

        public IEnumerator Show(StickerDefinition s)
        {
            gameObject.SetActive(true);
            closed = false;
            group.blocksRaycasts = true;
            homeButton.gameObject.SetActive(false);
            sticker.sprite = s ? s.sprite : null;
            sticker.preserveAspect = true;
            stickerRect.anchoredPosition = new Vector2(0f, 330f);
            stickerRect.localScale = Vector3.zero;
            yield return Ease.Tween(0.3f, k => group.alpha = k, Ease.OutCubic);
            var a = AudioManager.Instance;
            if (a) a.Play(Sfx.Sticker, 0.9f);
            if (FxSpawner.Instance) FxSpawner.Instance.Confetti(Camera.main.transform.position + new Vector3(0f, 2.5f, 10f), 50);
            yield return Ease.Tween(0.6f, k =>
            {
                stickerRect.localScale = Vector3.one * Ease.OutBack(k);
                stickerRect.localRotation = Quaternion.Euler(0f, 0f, (1f - k) * 200f);
            });
            if (a) a.Play(Sfx.Celebrate, 0.7f);
            yield return new WaitForSeconds(0.6f);
            homeButton.gameObject.SetActive(true);
            while (!closed) yield return null;
            // Sticker tucks itself into the album corner.
            var start = stickerRect.anchoredPosition;
            var end = albumTarget ? (Vector2)stickerRect.parent.InverseTransformPoint(albumTarget.position) : new Vector2(-400f, 800f);
            yield return Ease.Tween(0.5f, k =>
            {
                stickerRect.anchoredPosition = Vector2.Lerp(start, end, Ease.InOutSine(k));
                stickerRect.localScale = Vector3.one * Mathf.Lerp(1f, 0.15f, k);
            });
            if (a) a.Play(Sfx.Pop, 0.6f, 1.2f);
        }

        void Update()
        {
            if (rays && group.alpha > 0f) rays.Rotate(0f, 0f, -20f * Time.unscaledDeltaTime);
        }
    }
}
