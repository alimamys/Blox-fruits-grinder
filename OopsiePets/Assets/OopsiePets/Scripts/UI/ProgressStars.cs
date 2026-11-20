using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>Three big stars that fill as an activity progresses. No numbers, no text.</summary>
    public class ProgressStars : MonoBehaviour
    {
        public Image[] stars;
        int lit = -1;

        public void ResetStars()
        {
            lit = 0;
            foreach (var s in stars) SetLit(s, false, instant: true);
        }

        public void Show(float progress)
        {
            int n = Mathf.Clamp(Mathf.FloorToInt(progress * stars.Length + 0.0001f), 0, stars.Length);
            if (n == lit) return;
            for (int i = 0; i < stars.Length; i++) SetLit(stars[i], i < n, instant: i < lit);
            if (n > lit && AudioManager.Instance) AudioManager.Instance.Play(Sfx.Sparkle, 0.6f, 1f + n * 0.08f);
            lit = n;
        }

        void SetLit(Image s, bool on, bool instant)
        {
            s.color = on ? Palette.Untinted : Palette.WithAlpha(Palette.Lavender, 0.55f);
            if (instant || !on)
            {
                s.rectTransform.localScale = Vector3.one * (on ? 1f : 0.82f);
                return;
            }
            StartCoroutine(Ease.Tween(0.35f, k => s.rectTransform.localScale = Vector3.one * Mathf.LerpUnclamped(1.5f, 1f, k), Ease.OutBack));
        }
    }
}
