using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Dress-up: tap an accessory in the tray to put it on (tap again to take it off). Each slot holds one
    /// item, so a hat replaces a hat. The pet reacts to each item. The big check button saves and finishes.
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
            StartCoroutine(HintSoon());
        }

        public override void End()
        {
            doneButton.onClick.RemoveListener(OnDone);
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
            // One row for up to six items, otherwise two even rows; the tray grows upward to fit.
            if (grid)
            {
                int n = buttons.Count;
                int cols = n <= 6 ? Mathf.Max(1, n) : Mathf.CeilToInt(n / 2f);
                int rows = Mathf.CeilToInt(n / (float)cols);
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
