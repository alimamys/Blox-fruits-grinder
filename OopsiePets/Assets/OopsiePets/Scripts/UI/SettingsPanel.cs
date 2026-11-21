using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>Parent settings: music and sound volume, start over, let every friend in, and a plain privacy note.</summary>
    public class SettingsPanel : MonoBehaviour
    {
        public Slider music;
        public Slider sound;
        public Button reset;
        public TMP_Text resetLabel;
        [Tooltip("Grown-up shortcut: every friend arrives now instead of being earned from the gift box.")]
        public Button unlockAll;
        public TMP_Text unlockLabel;
        public Button close;
        bool armed;

        void Awake()
        {
            music.onValueChanged.AddListener(v => { SaveSystem.Data.settings.musicVolume = v; AudioManager.Instance?.ApplyVolumes(); AudioManager.Instance?.DuckMusic(true); });
            sound.onValueChanged.AddListener(v => { SaveSystem.Data.settings.soundVolume = v; AudioManager.Instance?.Play(Sfx.Tap, 0.7f); });
            reset.onClick.AddListener(OnReset);
            if (unlockAll) unlockAll.onClick.AddListener(OnUnlockAll);
            close.onClick.AddListener(Close);
            gameObject.SetActive(false);
        }

        public void Open()
        {
            armed = false;
            resetLabel.text = "Start over";
            if (unlockLabel) unlockLabel.text = GameFlow.Instance.database.NextFriend() == null ? "All friends are here" : "Let all friends in now";
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
                resetLabel.text = "Tap again to erase stickers, outfits and friends";
                return;
            }
            SaveSystem.ResetProgress();
            resetLabel.text = "Done: progress erased";
            armed = false;
            GameFlow.Instance.RefreshClubhouse();
        }

        void OnUnlockAll()
        {
            int n = FriendGiftRules.UnlockAll(GameFlow.Instance.database);
            if (unlockLabel) unlockLabel.text = n > 0 ? "All friends are here" : "All friends are here";
            AudioManager.Instance?.Play(Sfx.Celebrate, 0.6f);
            GameFlow.Instance.RefreshClubhouse();
        }

        void Close()
        {
            SaveSystem.Save();
            gameObject.SetActive(false);
            AudioManager.Instance?.DuckMusic(false);
        }
    }
}
