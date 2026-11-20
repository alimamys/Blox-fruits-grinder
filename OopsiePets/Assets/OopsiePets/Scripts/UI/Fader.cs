using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>Soft full-screen fade used between screens.</summary>
    public class Fader : MonoBehaviour
    {
        public Image overlay;
        public float duration = 0.35f;

        public IEnumerator FadeOut()
        {
            overlay.raycastTarget = true;
            if (AudioManager.Instance) AudioManager.Instance.Play(Sfx.Whoosh, 0.35f);
            yield return Ease.Tween(duration, k => overlay.color = Palette.WithAlpha(Palette.Lavender, k), Ease.OutCubic);
        }

        public IEnumerator FadeIn()
        {
            yield return Ease.Tween(duration, k => overlay.color = Palette.WithAlpha(Palette.Lavender, 1f - k), Ease.OutCubic);
            overlay.raycastTarget = false;
        }
    }
}
