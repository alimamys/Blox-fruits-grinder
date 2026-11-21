using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// The game's conductor: loads the save, owns the three screens (clubhouse, care activities including the
    /// garden, sticker album) and moves between them with soft fades. One scene, no loading screens.
    /// </summary>
    public class GameFlow : MonoBehaviour
    {
        public enum Screen { Clubhouse, Care, Album }

        public static GameFlow Instance { get; private set; }

        public ContentDatabase database;
        public FaceSet face;
        public Fader fader;
        [Tooltip("Material with the OopsiePets/RainbowSprite shader, for rainbow coats.")]
        public Material rainbowMaterial;

        [Header("Screens (world + UI roots)")]
        public GameObject clubhouseWorld;
        public GameObject clubhouseUI;
        public GameObject careWorld;
        public GameObject careUI;
        public GameObject albumWorld;
        public GameObject albumUI;

        [Header("Controllers")]
        public Clubhouse clubhouse;
        public CareSession care;
        public AlbumScreen album;
        public ParentGate parentGate;
        public SettingsPanel settings;

        [Header("Buttons")]
        public Button albumButton;
        public Button albumBackButton;
        public Button settingsButton;

        public Screen Current { get; private set; }
        /// <summary>The pet from the last visit (so the next "wants to play" turn goes to someone else).</summary>
        public PetDefinition LastCared { get; private set; }
        public bool Busy { get; private set; }

        void Awake()
        {
            Instance = this;
            Application.targetFrameRate = 60;
            SaveSystem.Load();
            PetCoat.RainbowMaterial = rainbowMaterial;

            albumButton.onClick.AddListener(() => StartCoroutine(Go(Screen.Album, () => album.Refresh())));
            albumBackButton.onClick.AddListener(() => StartCoroutine(Go(Screen.Clubhouse, () => clubhouse.Enter(null))));
            settingsButton.onClick.AddListener(() => parentGate.Open(() => settings.Open()));
        }

        void Start()
        {
            Show(Screen.Clubhouse);
            // Everyone starts clean; one pet is bored and wants to go play (getting muddy is part of the fun).
            clubhouse.Enter(null);
            StartCoroutine(fader.FadeIn());
        }

        void OnApplicationPause(bool paused)
        {
            if (paused) SaveSystem.Save();
        }

        void OnApplicationQuit() => SaveSystem.Save();

        void Show(Screen s)
        {
            Current = s;
            clubhouseWorld.SetActive(s == Screen.Clubhouse);
            clubhouseUI.SetActive(s == Screen.Clubhouse);
            careWorld.SetActive(s == Screen.Care);
            careUI.SetActive(s == Screen.Care);
            albumWorld.SetActive(s == Screen.Album);
            albumUI.SetActive(s == Screen.Album);
        }

        IEnumerator Go(Screen s, System.Action whileHidden)
        {
            if (Busy) yield break;
            Busy = true;
            yield return fader.FadeOut();
            if (Current == Screen.Clubhouse) clubhouse.Clear();
            Show(s);
            whileHidden?.Invoke();
            yield return fader.FadeIn();
            Busy = false;
        }

        public void StartCare(PetDefinition pet, ActivityKind[] sequence)
        {
            if (Busy || pet == null) return;
            StartCoroutine(Go(Screen.Care, () => care.Begin(pet, sequence)));
        }

        public IEnumerator ReturnToClubhouse(PetDefinition caredFor, CareSession session)
        {
            if (Busy) yield break;
            Busy = true;
            yield return fader.FadeOut();
            var muddy = session.MuddyPet; // left the garden mid-play: comes home muddy
            LastCared = caredFor;
            session.Cleanup();
            Show(Screen.Clubhouse);
            clubhouse.Enter(muddy);
            yield return fader.FadeIn();
            Busy = false;
            // Pets stay clean at home: the next pet that wants to play shows its thought bubble.
        }

        public void RefreshClubhouse()
        {
            if (Current == Screen.Clubhouse) clubhouse.Enter(null);
        }

        /// <summary>After the grown-ups change something in the settings, the room fades and rebuilds.</summary>
        public IEnumerator RebuildClubhouse()
        {
            if (Busy || Current != Screen.Clubhouse) yield break;
            Busy = true;
            yield return fader.FadeOut();
            clubhouse.Enter(null);
            yield return fader.FadeIn();
            Busy = false;
        }

        /// <summary>Creates a pet from its definition, wearing its saved outfit if asked, in its coat colour.</summary>
        public PetView SpawnPet(PetDefinition def, Transform parent, float scale, bool withAccessories)
        {
            var p = Instantiate(def.prefab, parent, false);
            p.name = "Pet_" + def.id;
            p.transform.localPosition = Vector3.zero;
            p.transform.localScale = Vector3.one * scale;
            p.Init(def, face);
            var save = SaveSystem.Data.Pet(def.id);
            // Each friend starts out wearing its own accessory (the unicorn its crown), once; after that the
            // outfit is whatever the child picked.
            if (!save.outfitSet)
            {
                save.outfitSet = true;
                if (def.giftAccessory != null && !save.accessories.Contains(def.giftAccessory.id))
                {
                    save.accessories.RemoveAll(id => { var a = database.Accessory(id); return a != null && a.slot == def.giftAccessory.slot; });
                    save.accessories.Add(def.giftAccessory.id);
                }
                SaveSystem.Save();
            }
            if (save.rainbow && ContentDatabase.IsCompleted(def)) p.Coat.SetRainbow(true);
            if (withAccessories)
                foreach (var id in save.accessories)
                {
                    var acc = database.Accessory(id);
                    if (acc) p.Rig.Wear(acc);
                }
            return p;
        }
    }
}
