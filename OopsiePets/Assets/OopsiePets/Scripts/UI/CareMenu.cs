using System;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Pops up above a tapped pet: one big "let's play" button showing the pet's own toy (the full visit:
    /// garden → wash → bubbles → brush → dress-up) and four small activity buttons to revisit a favourite.
    /// Icons only, no text.
    /// </summary>
    public class CareMenu : MonoBehaviour
    {
        public Button fullCare;
        [Tooltip("Icon on the big button; shows the tapped pet's own toy.")]
        public Image fullCareIcon;
        public Button wash, bubbles, brush, dress;
        public CanvasGroup group;
        public RectTransform panel;
        public Camera worldCamera;
        public RectTransform canvasRect;
        public Camera canvasCamera;
        public float autoHide = 6f;

        PetView pet;
        float shownAt;
        int shownFrame = -1;
        public bool Visible => pet != null;
        public bool ShownThisFrame => shownFrame == Time.frameCount;
        public Action<PetView, ActivityKind[]> Chosen;

        void Awake()
        {
            fullCare.onClick.AddListener(() => Pick(CareSession.FullCare));
            wash.onClick.AddListener(() => Pick(CareSession.Bath));
            bubbles.onClick.AddListener(() => Pick(new[] { ActivityKind.Bubbles }));
            brush.onClick.AddListener(() => Pick(CareSession.Grooming));
            dress.onClick.AddListener(() => Pick(new[] { ActivityKind.DressUp }));
            HideNow();
        }

        public void Show(PetView p)
        {
            pet = p;
            if (fullCareIcon && p.Definition && p.Definition.toyIcon) fullCareIcon.sprite = p.Definition.toyIcon;
            shownAt = Time.unscaledTime;
            shownFrame = Time.frameCount;
            gameObject.SetActive(true);
            Follow();
            StopAllCoroutines();
            StartCoroutine(Ease.Tween(0.3f, k => { group.alpha = k; panel.localScale = Vector3.one * Mathf.LerpUnclamped(0.6f, 1f, k); }, Ease.OutBack));
            group.blocksRaycasts = true;
        }

        public void HideNow()
        {
            group.alpha = 0f;
            group.blocksRaycasts = false;
            gameObject.SetActive(false);
            pet = null;
        }

        void Pick(ActivityKind[] seq)
        {
            var p = pet;
            HideNow();
            if (p) Chosen?.Invoke(p, seq);
        }

        void Follow()
        {
            if (!pet) return;
            var top = pet.VisualBounds();
            var world = new Vector3(top.center.x, top.max.y + 0.2f, 0f);
            var screen = RectTransformUtility.WorldToScreenPoint(worldCamera, world);
            RectTransformUtility.ScreenPointToLocalPointInRectangle(canvasRect, screen, canvasCamera, out var local);
            // Keep the menu on screen.
            float halfW = panel.rect.width * 0.5f, halfCanvas = canvasRect.rect.width * 0.5f;
            local.x = Mathf.Clamp(local.x, -halfCanvas + halfW + 20f, halfCanvas - halfW - 20f);
            local.y = Mathf.Min(local.y + panel.rect.height * 0.5f, canvasRect.rect.height * 0.5f - panel.rect.height * 0.5f - 220f);
            panel.anchoredPosition = local;
        }

        void Update()
        {
            if (!pet) return;
            Follow();
            if (Time.unscaledTime - shownAt > autoHide) HideNow();
        }
    }
}
