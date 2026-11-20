using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets.EditorTools
{
    /// <summary>Small helpers for building uGUI hierarchies from code.</summary>
    public static class UIKit
    {
        public static RectTransform Rect(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return (RectTransform)go.transform;
        }

        public static void Stretch(RectTransform rt, float inset = 0f)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.offsetMin = new Vector2(inset, inset);
            rt.offsetMax = new Vector2(-inset, -inset);
        }

        /// <summary>Anchors a rect to a point of its parent (e.g. (0,1) = top-left) at a pixel offset.</summary>
        public static void Place(RectTransform rt, Vector2 anchor, Vector2 pivot, Vector2 pos, Vector2 size)
        {
            rt.anchorMin = rt.anchorMax = anchor;
            rt.pivot = pivot;
            rt.anchoredPosition = pos;
            rt.sizeDelta = size;
        }

        public static Image Image(string name, Transform parent, Sprite sprite, Color color, bool raycast = false)
        {
            var rt = Rect(name, parent);
            var img = rt.gameObject.AddComponent<Image>();
            img.sprite = sprite;
            img.color = color;
            img.raycastTarget = raycast;
            img.preserveAspect = sprite != null && sprite.border == Vector4.zero;
            if (sprite != null && sprite.border != Vector4.zero) img.type = UnityEngine.UI.Image.Type.Sliced;
            return img;
        }

        public static Button Button(string name, Transform parent, Sprite sprite, Vector2 anchor, Vector2 pivot, Vector2 pos, float size, bool pulse = false)
        {
            var img = Image(name, parent, sprite, Palette.Untinted, true);
            Place(img.rectTransform, anchor, pivot, pos, new Vector2(size, size));
            var b = img.gameObject.AddComponent<Button>();
            b.transition = Selectable.Transition.None;
            b.targetGraphic = img;
            img.gameObject.AddComponent<CandyButton>().pulse = pulse;
            return b;
        }

        /// <summary>A blank candy button with an icon sprite on top.</summary>
        public static Button IconButton(string name, Transform parent, Sprite bg, Sprite icon, Vector2 anchor, Vector2 pivot, Vector2 pos, float size, float iconInset = 0.2f)
        {
            var b = Button(name, parent, bg, anchor, pivot, pos, size);
            var ic = Image("Icon", b.transform, icon, Palette.Untinted);
            Stretch(ic.rectTransform, size * iconInset);
            ic.preserveAspect = true;
            return b;
        }

        public static TextMeshProUGUI Text(string name, Transform parent, string text, float size, Color color, TextAlignmentOptions align = TextAlignmentOptions.Center)
        {
            var rt = Rect(name, parent);
            var t = rt.gameObject.AddComponent<TextMeshProUGUI>();
            t.text = text;
            t.fontSize = size;
            t.color = color;
            t.alignment = align;
            t.fontStyle = FontStyles.Bold;
            t.characterSpacing = 2f;
            t.textWrappingMode = TextWrappingModes.Normal;
            t.raycastTarget = false;
            return t;
        }

        public static Slider Slider(string name, Transform parent, Sprite track, Sprite fill, Sprite handle, Vector2 pos, Vector2 size)
        {
            var rt = Rect(name, parent);
            Place(rt, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), pos, size);
            var bg = Image("Track", rt, track, Palette.Untinted);
            Stretch(bg.rectTransform);
            var fillArea = Rect("FillArea", rt);
            Stretch(fillArea);
            var f = Image("Fill", fillArea, fill, Palette.Untinted);
            Stretch(f.rectTransform);
            var handleArea = Rect("HandleArea", rt);
            Stretch(handleArea);
            handleArea.offsetMin = new Vector2(size.y * 0.5f, 0);
            handleArea.offsetMax = new Vector2(-size.y * 0.5f, 0);
            var h = Image("Handle", handleArea, handle, Palette.Untinted, true);
            h.rectTransform.sizeDelta = new Vector2(size.y * 1.6f, size.y * 1.6f);
            var s = rt.gameObject.AddComponent<UnityEngine.UI.Slider>();
            s.fillRect = f.rectTransform;
            s.handleRect = h.rectTransform;
            s.targetGraphic = h;
            s.transition = Selectable.Transition.None;
            s.minValue = 0f;
            s.maxValue = 1f;
            s.value = 1f;
            return s;
        }
    }
}
