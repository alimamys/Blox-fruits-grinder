using UnityEngine;

namespace OopsiePets
{
    /// <summary>Keeps a UI panel inside the phone's safe area (notches, rounded corners, gesture bars).</summary>
    [RequireComponent(typeof(RectTransform))]
    public class SafeArea : MonoBehaviour
    {
        Rect last;
        Vector2Int lastSize;

        void OnEnable() => Apply();

        void Update()
        {
            if (Screen.safeArea != last || lastSize.x != Screen.width || lastSize.y != Screen.height) Apply();
        }

        void Apply()
        {
            var rt = (RectTransform)transform;
            last = Screen.safeArea;
            lastSize = new Vector2Int(Screen.width, Screen.height);
            if (Screen.width <= 0 || Screen.height <= 0) return;
            var min = new Vector2(last.xMin / Screen.width, last.yMin / Screen.height);
            var max = new Vector2(last.xMax / Screen.width, last.yMax / Screen.height);
            rt.anchorMin = min;
            rt.anchorMax = max;
            rt.offsetMin = rt.offsetMax = Vector2.zero;
        }
    }
}
