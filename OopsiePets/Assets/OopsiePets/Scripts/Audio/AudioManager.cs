using UnityEngine;

namespace OopsiePets
{
    public enum VoiceKind { Happy, Giggle, Surprised, Sneeze, Purr, Excited }

    public enum Sfx { Tap, Pop, Squish, Brush, Sparkle, Whoosh, Celebrate, Sticker, Equip, Unequip, Splash }

    /// <summary>
    /// All game audio. Every sound is synthesized at startup (original, license-free); assign real
    /// recordings to the clip fields later and they are used instead. Volumes come from the parent settings.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Optional recorded replacements (left empty = synthesized)")]
        public AudioClip tap, pop, squish, brush, sparkle, whoosh, celebrate, sticker, equip, unequip, splash, music;

        [Range(0f, 1f)] public float musicLevel = 0.3f;

        AudioSource musicSource;
        AudioSource[] sfx;
        int nextSfx;
        float lastSquish, lastBrush;

        // Synthesized voice clips per pet voice and kind.
        AudioClip[,] voices;

        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            if (tap == null) tap = Synth.Blip("tap", 660f, 880f, 0.07f, 0.35f);
            if (pop == null) pop = Synth.Pop();
            if (squish == null) squish = Synth.Squish();
            if (brush == null) brush = Synth.Swish();
            if (sparkle == null) sparkle = Synth.Arp("sparkle", new[] { 1318.5f, 1568f, 2093f }, 0.06f, 0.25f);
            if (whoosh == null) whoosh = Synth.Whoosh();
            if (celebrate == null) celebrate = Synth.Arp("celebrate", new[] { 523.25f, 659.25f, 783.99f, 1046.5f, 783.99f, 1046.5f, 1318.5f }, 0.11f, 0.45f);
            if (sticker == null) sticker = Synth.Arp("sticker", new[] { 783.99f, 1046.5f, 1318.5f, 1568f }, 0.09f, 0.4f);
            if (equip == null) equip = Synth.Blip("equip", 520f, 1040f, 0.16f, 0.4f);
            if (unequip == null) unequip = Synth.Blip("unequip", 700f, 420f, 0.12f, 0.3f);
            if (splash == null) splash = Synth.Splash();
            if (music == null) music = Synth.MusicBox();

            voices = new AudioClip[3, 6];
            for (int v = 0; v < 3; v++)
                for (int k = 0; k < 6; k++)
                    voices[v, k] = Synth.Voice((PetVoice)v, (VoiceKind)k);

            musicSource = gameObject.AddComponent<AudioSource>();
            musicSource.clip = music;
            musicSource.loop = true;
            musicSource.playOnAwake = false;
            sfx = new AudioSource[10];
            for (int i = 0; i < sfx.Length; i++)
            {
                sfx[i] = gameObject.AddComponent<AudioSource>();
                sfx[i].playOnAwake = false;
            }
        }

        void Start()
        {
            ApplyVolumes();
            musicSource.Play();
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        float MusicVolume => SaveSystem.Data != null ? SaveSystem.Data.settings.musicVolume : 0.7f;
        float SfxVolume => SaveSystem.Data != null ? SaveSystem.Data.settings.soundVolume : 1f;

        public void ApplyVolumes()
        {
            if (musicSource) musicSource.volume = musicLevel * MusicVolume;
        }

        /// <summary>Softly lowers the music (e.g. behind the parent settings).</summary>
        public void DuckMusic(bool duck)
        {
            if (musicSource) musicSource.volume = musicLevel * MusicVolume * (duck ? 0.5f : 1f);
        }

        public void Play(Sfx s, float volume = 0.8f, float pitch = 1f, float jitter = 0.05f)
        {
            // Continuous tools would otherwise retrigger every frame.
            if (s == Sfx.Squish)
            {
                if (Time.unscaledTime - lastSquish < 0.16f) return;
                lastSquish = Time.unscaledTime;
            }
            if (s == Sfx.Brush)
            {
                if (Time.unscaledTime - lastBrush < 0.2f) return;
                lastBrush = Time.unscaledTime;
            }
            var clip = s switch
            {
                Sfx.Tap => tap, Sfx.Pop => pop, Sfx.Squish => squish, Sfx.Brush => brush, Sfx.Sparkle => sparkle,
                Sfx.Whoosh => whoosh, Sfx.Celebrate => celebrate, Sfx.Sticker => sticker, Sfx.Equip => equip,
                Sfx.Unequip => unequip, _ => splash,
            };
            PlayClip(clip, volume, pitch * (1f + Random.Range(-jitter, jitter)));
        }

        public void PlayVoice(PetVoice voice, float pitch, VoiceKind kind)
        {
            if (voices == null) return;
            PlayClip(voices[(int)voice, (int)kind], 0.75f, pitch * Random.Range(0.95f, 1.05f));
        }

        void PlayClip(AudioClip clip, float volume, float pitch)
        {
            if (clip == null || sfx == null) return;
            var src = sfx[nextSfx];
            nextSfx = (nextSfx + 1) % sfx.Length;
            src.pitch = pitch;
            src.volume = volume * SfxVolume;
            src.clip = clip;
            src.Play();
        }
    }
}
