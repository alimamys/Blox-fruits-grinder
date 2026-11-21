using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Dress-up: tap an accessory in the tray to put it on (tap again to take it off). Each slot holds one
    /// item, so a hat replaces a hat. The pet reacts to each item. The big check button saves and finishes.
    /// Once a pet has earned its sticker (a full visit), a rainbow button appears too: it turns the pet's
    /// coat rainbow (and back), saved for that pet.
    /// </summary>
    public class DressUpActivity : Activity
    {
        public override ActivityKind Kind => ActivityKind.DressUp;

        public ContentDatabase database;
        public RectTransform tray;
        public AccessoryButton buttonPrefab;
        public Button doneButton;
        public CanvasGroup trayGroup;
        public GridLayoutGroup grid;
        [Tooltip("Rainbow coat toggle, shown once this pet has completed a full visit.")]
        public Button rainbowButton;
        public GameObject rainbowRing;

        readonly List<AccessoryButton> buttons = new List<AccessoryButton>();
        bool tried;

        public override void Begin(PetView pet, ActivityContext ctx)
        {
            base.Begin(pet, ctx);
            tried = false;
            pet.Animator.SetMood(PetExpression.Happy);
            if (ctx.stars) ctx.stars.gameObject.SetActive(false);
            BuildTray();
            trayGroup.gameObject.SetActive(true);
            StartCoroutine(Ease.Tween(0.35f, k => trayGroup.alpha = k, Ease.OutCubic));
            doneButton.onClick.RemoveListener(OnDone);
            doneButton.onClick.AddListener(OnDone);
            if (rainbowButton)
            {
                bool earned = ContentDatabase.IsCompleted(pet.Definition);
                rainbowButton.gameObject.SetActive(earned);
                rainbowButton.onClick.RemoveListener(OnRainbow);
                rainbowButton.onClick.AddListener(OnRainbow);
                if (rainbowRing) rainbowRing.SetActive(pet.Coat.Rainbow);
            }
            StartCoroutine(HintSoon());
        }

        void OnRainbow()
        {
            tried = true;
            if (ctx.hint) ctx.hint.Hide();
            bool on = !pet.Coat.Rainbow;
            pet.Coat.SetRainbow(on);
            SaveSystem.Data.Pet(pet.Definition.id).rainbow = on;
            SaveSystem.Save();
            if (rainbowRing) rainbowRing.SetActive(on);
            var c = pet.VisualBounds().center;
            if (on)
            {
                Audio?.Play(Sfx.Sparkle, 0.9f, 1.1f);
                Audio?.Play(Sfx.Celebrate, 0.5f);
                Fx?.Sparkles(c, 18, 1.6f);
                Fx?.Burst(c, 14, 3f, 0.5f, 0.8f, Fx.star, Fx.sparklePink, Fx.sparkleYellow);
                pet.Animator.Play(PetReaction.Celebrate);
            }
            else
            {
                Audio?.Play(Sfx.Unequip, 0.7f);
                Fx?.Sparkles(c, 6, 1.2f);
                pet.Animator.Play(PetReaction.HeadTilt);
            }
            SetProgress(1f);
        }

        public override void End()
        {
            doneButton.onClick.RemoveListener(OnDone);
            if (rainbowButton) rainbowButton.onClick.RemoveListener(OnRainbow);
            trayGroup.gameObject.SetActive(false);
            if (ctx.stars) ctx.stars.gameObject.SetActive(true);
            base.End();
        }

        void BuildTray()
        {
            foreach (var b in buttons) if (b) Destroy(b.gameObject);
            buttons.Clear();
            foreach (var acc in database.UnlockedAccessories())
            {
                var b = Instantiate(buttonPrefab, tray);
                b.Bind(acc, OnAccessory);
                buttons.Add(b);
            }
            // One row for up to six items, two even rows up to ten, then rows of five with slightly smaller
            // buttons; the tray grows upward to fit.
            if (grid)
            {
                int n = buttons.Count;
                int cols = n <= 6 ? Mathf.Max(1, n) : n <= 10 ? Mathf.CeilToInt(n / 2f) : 5;
                int rows = Mathf.CeilToInt(n / (float)cols);
                grid.cellSize = rows >= 3 ? new Vector2(140f, 140f) : new Vector2(150f, 150f);
                grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
                grid.constraintCount = cols;
                var size = tray.sizeDelta;
                size.y = grid.padding.vertical + rows * grid.cellSize.y + (rows - 1) * grid.spacing.y;
                tray.sizeDelta = size;
            }
            RefreshButtons();
        }

        IEnumerator HintSoon()
        {
            yield return new WaitForSeconds(1.0f);
            if (!tried && buttons.Count > 0 && ctx.hint) ctx.hint.ShowTapUI(buttons[Random.Range(0, buttons.Count)].transform as RectTransform);
        }

        void OnAccessory(AccessoryDefinition acc)
        {
            tried = true;
            if (ctx.hint) ctx.hint.Hide();
            if (pet.Rig.Worn(acc.slot) == acc)
            {
                pet.Rig.Remove(acc.slot);
                Audio?.Play(Sfx.Unequip, 0.7f);
                pet.Animator.Play(PetReaction.HeadTilt);
            }
            else
            {
                pet.Rig.Wear(acc);
                Audio?.Play(Sfx.Equip, 0.7f);
                var r = pet.Rig.WornRenderer(acc.slot);
                if (r && Fx) Fx.Sparkles(r.transform.position, 7, 0.7f);
                pet.Animator.Play(pet.Definition.ReactionFor(acc));
                if (r) StartCoroutine(PopIn(r.transform));
            }
            RefreshButtons();
            SetProgress(1f);
        }

        IEnumerator PopIn(Transform t)
        {
            var s = t.localScale;
            yield return Ease.Tween(0.3f, k => t.localScale = s * Mathf.LerpUnclamped(0.3f, 1f, k), Ease.OutBack, false);
        }

        void RefreshButtons()
        {
            foreach (var b in buttons) b.SetSelected(pet.Rig.Worn(b.Accessory.slot) == b.Accessory);
        }

        void OnDone()
        {
            if (IsComplete) return;
            var save = SaveSystem.Data.Pet(pet.Definition.id);
            save.accessories.Clear();
            foreach (var a in pet.Rig.AllWorn()) save.accessories.Add(a.id);
            SaveSystem.Save();
            Audio?.Play(Sfx.Celebrate, 0.6f);
            pet.Animator.Play(PetReaction.Celebrate);
            Complete();
        }
    }
}
