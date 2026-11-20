using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>Parent settings: music and sound volume, start over, and a plain privacy note.</summary>
    public class SettingsPanel : MonoBehaviour
    {
        public Slider music;
        public Slider sound;
        public Button reset;
        public TMP_Text resetLabel;
        public Button close;
        bool armed;

        void Awake()
        {
            music.onValueChanged.AddListener(v => { SaveSystem.Data.settings.musicVolume = v; AudioManager.Instance?.ApplyVolumes(); AudioManager.Instance?.DuckMusic(true); });
            sound.onValueChanged.AddListener(v => { SaveSystem.Data.settings.soundVolume = v; AudioManager.Instance?.Play(Sfx.Tap, 0.7f); });
            reset.onClick.AddListener(OnReset);
            close.onClick.AddListener(Close);
            gameObject.SetActive(false);
        }

        public void Open()
        {
            armed = false;
            resetLabel.text = "Start over";
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
                resetLabel.text = "Tap again to erase all stickers and outfits";
                return;
            }
            SaveSystem.ResetProgress();
            resetLabel.text = "Done: progress erased";
            armed = false;
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
