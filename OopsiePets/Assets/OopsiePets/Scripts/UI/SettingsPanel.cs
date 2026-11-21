using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Parent settings (behind the parent gate): music and sound volume, start over, the full version, and a
    /// plain privacy note. The full version button is a TEST switch in this build: no store, no payment.
    /// "Restore purchases" is where a real store restore would go; here it only re-reads what is saved.
    /// </summary>
    public class SettingsPanel : MonoBehaviour
    {
        public Slider music;
        public Slider sound;
        public Button reset;
        public TMP_Text resetLabel;
        [Tooltip("Full version (TEST ONLY: no payment in this build).")]
        public Button unlockAll;
        public TMP_Text unlockLabel;
        public Button restore;
        public TMP_Text restoreLabel;
        public Button close;
        bool armed, changed;

        void Awake()
        {
            music.onValueChanged.AddListener(v => { SaveSystem.Data.settings.musicVolume = v; AudioManager.Instance?.ApplyVolumes(); AudioManager.Instance?.DuckMusic(true); });
            sound.onValueChanged.AddListener(v => { SaveSystem.Data.settings.soundVolume = v; AudioManager.Instance?.Play(Sfx.Tap, 0.7f); });
            reset.onClick.AddListener(OnReset);
            if (unlockAll) unlockAll.onClick.AddListener(OnFullVersion);
            if (restore) restore.onClick.AddListener(OnRestore);
            close.onClick.AddListener(Close);
            gameObject.SetActive(false);
        }

        public void Open()
        {
            armed = false;
            changed = false;
            resetLabel.text = "Start over";
            ShowFullVersion();
            if (restoreLabel) restoreLabel.text = "Restore purchases";
            music.SetValueWithoutNotify(SaveSystem.Data.settings.musicVolume);
            sound.SetValueWithoutNotify(SaveSystem.Data.settings.soundVolume);
            gameObject.SetActive(true);
            AudioManager.Instance?.DuckMusic(true);
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

        void ShowFullVersion()
        {
            if (unlockLabel) unlockLabel.text = Entitlements.FullVersion
                ? "Full version: ON (test). Tap to lock again"
                : "Unlock full version (test, no payment)";
        }

        void OnFullVersion()
        {
            Entitlements.SetFullVersionForTesting(!Entitlements.FullVersion);
            changed = true;
            ShowFullVersion();
            AudioManager.Instance?.Play(Entitlements.FullVersion ? Sfx.Celebrate : Sfx.Tap, 0.6f);
        }

        void OnRestore()
        {
            // No store is connected in this build, so there is nothing to fetch: show what is saved here.
            SaveSystem.Load();
            if (restoreLabel) restoreLabel.text = Entitlements.FullVersion ? "Restored: full version" : "Nothing to restore (test build)";
            ShowFullVersion();
            changed = true;
        }

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
