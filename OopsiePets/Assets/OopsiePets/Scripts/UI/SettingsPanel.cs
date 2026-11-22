using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Parent settings (behind the parent gate): music and sound volume, start over, the full version
    /// purchase, restore purchases, and a plain privacy note. The full version is bought through
    /// <see cref="FullVersionStore"/> (Google Play / App Store); the button shows the store's price and what
    /// the purchase is doing. The Editor and development builds also show a small test switch (no payment);
    /// the web demo has no store, so its full version button is that test switch.
    /// </summary>
    public class SettingsPanel : MonoBehaviour
    {
        public Slider music;
        public Slider sound;
        public Button reset;
        public TMP_Text resetLabel;
        [Tooltip("Buy the full version (or, in the web demo, the test switch).")]
        public Button unlockAll;
        public TMP_Text unlockLabel;
        public Button restore;
        public TMP_Text restoreLabel;
        [Tooltip("What the store said last (thank you, declined, waiting for approval...).")]
        public TMP_Text storeStatus;
        [Tooltip("Editor and development builds only: switch the full version on/off without paying.")]
        public Button testUnlock;
        public TMP_Text testLabel;
        public Button close;
        bool armed, changed;

        static FullVersionStore Store => FullVersionStore.Instance;
        static bool HasStore => Store && Store.Supported;

        void Awake()
        {
            music.onValueChanged.AddListener(v => { SaveSystem.Data.settings.musicVolume = v; AudioManager.Instance?.ApplyVolumes(); AudioManager.Instance?.DuckMusic(true); });
            sound.onValueChanged.AddListener(v => { SaveSystem.Data.settings.soundVolume = v; AudioManager.Instance?.Play(Sfx.Tap, 0.7f); });
            reset.onClick.AddListener(OnReset);
            if (unlockAll) unlockAll.onClick.AddListener(OnFullVersion);
            if (restore) restore.onClick.AddListener(OnRestore);
            if (testUnlock) testUnlock.onClick.AddListener(OnTestUnlock);
            close.onClick.AddListener(Close);
            gameObject.SetActive(false);
        }

        void OnEnable()
        {
            if (Store) { Store.Changed += Refresh; Store.Unlocked += OnUnlocked; }
        }

        void OnDisable()
        {
            if (Store) { Store.Changed -= Refresh; Store.Unlocked -= OnUnlocked; }
        }

        public void Open()
        {
            armed = false;
            changed = false;
            resetLabel.text = "Start over";
            music.SetValueWithoutNotify(SaveSystem.Data.settings.musicVolume);
            sound.SetValueWithoutNotify(SaveSystem.Data.settings.soundVolume);
            gameObject.SetActive(true);
            if (HasStore && Store.State == FullVersionStore.StoreState.Unavailable) Store.Connect(); // try again
            Refresh();
            AudioManager.Instance?.DuckMusic(true);
        }

        void Refresh()
        {
            if (!gameObject.activeInHierarchy) return;
            bool owned = Entitlements.FullVersion;
            if (HasStore)
            {
                var s = Store.State;
                bool bought = owned && SaveSystem.Data.fullVersionSource == Entitlements.SourceStore;
                string label = bought ? "Full version unlocked. Thank you!" : s switch
                {
                    FullVersionStore.StoreState.Connecting => "Connecting to the store…",
                    FullVersionStore.StoreState.Ready => string.IsNullOrEmpty(Store.Price) ? "Unlock the full version" : $"Unlock the full version  {Store.Price}",
                    FullVersionStore.StoreState.Purchasing => "Waiting for the store…",
                    FullVersionStore.StoreState.WaitingForApproval => "Waiting for a grown-up to approve",
                    FullVersionStore.StoreState.Unavailable => "Store not available. Tap to try again",
                    _ => "Unlock the full version",
                };
                if (unlockLabel) unlockLabel.text = label;
                if (unlockAll) unlockAll.interactable = !bought && (s == FullVersionStore.StoreState.Ready || s == FullVersionStore.StoreState.Unavailable);
                if (restoreLabel) restoreLabel.text = "Restore purchases";
                if (storeStatus) storeStatus.text = Store.LastMessage ?? "";
            }
            else
            {
                // Web demo: no store. The button is the test switch, clearly labelled.
                if (unlockLabel) unlockLabel.text = owned ? "Full version: ON (web demo). Tap to lock again" : "Unlock full version (web demo, no payment)";
                if (unlockAll) unlockAll.interactable = true;
                if (restoreLabel) restoreLabel.text = "Restore purchases";
                if (storeStatus) storeStatus.text = "";
            }
            bool showTest = HasStore && Entitlements.TestUnlockAllowed;
            if (testUnlock) testUnlock.gameObject.SetActive(showTest);
            if (testLabel && showTest)
                testLabel.text = SaveSystem.Data.fullVersion && SaveSystem.Data.fullVersionSource == Entitlements.SourceTest
                    ? "Test switch: ON (no payment)" : "Test switch: OFF (no payment)";
        }

        void OnFullVersion()
        {
            if (HasStore)
            {
                if (Store.State == FullVersionStore.StoreState.Unavailable) Store.Connect();
                else Store.Buy();
                Refresh();
                return;
            }
            // Web demo test switch.
            Entitlements.SetFullVersionForTesting(!Entitlements.FullVersion);
            changed = true;
            AudioManager.Instance?.Play(Entitlements.FullVersion ? Sfx.Celebrate : Sfx.Tap, 0.6f);
            Refresh();
        }

        void OnRestore()
        {
            if (HasStore) { Store.Restore(); Refresh(); return; }
            if (storeStatus) storeStatus.text = "Purchases are made in the app on a phone or tablet.";
        }

        void OnTestUnlock()
        {
            bool on = !(SaveSystem.Data.fullVersion && SaveSystem.Data.fullVersionSource == Entitlements.SourceTest);
            if (SaveSystem.Data.fullVersionSource == Entitlements.SourceStore) return; // already bought for real
            Entitlements.SetFullVersionForTesting(on);
            changed = true;
            AudioManager.Instance?.Play(on ? Sfx.Celebrate : Sfx.Tap, 0.6f);
            Refresh();
        }

        void OnUnlocked()
        {
            changed = true;
            AudioManager.Instance?.Play(Sfx.Celebrate, 0.7f);
            Refresh();
        }

        void OnReset()
        {
            if (!armed)
            {
                armed = true;
                resetLabel.text = "Tap again to erase stickers and outfits";
                return;
            }
            SaveSystem.ResetProgress();
            resetLabel.text = "Done: progress erased";
            armed = false;
            GameFlow.Instance.RefreshClubhouse();
        }

        public bool IsOpen => gameObject.activeSelf;

        void Close()
        {
            SaveSystem.Save();
            gameObject.SetActive(false);
            AudioManager.Instance?.DuckMusic(false);
            // Padlocks open (or close) once the panel is out of the way, so the celebration is seen.
            if (changed) GameFlow.Instance.StartCoroutine(GameFlow.Instance.RebuildClubhouse());
            changed = false;
        }
    }
}
