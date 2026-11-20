using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// The game's conductor: loads the save, owns the three screens (clubhouse, care activities, sticker
    /// album) and moves between them with soft fades. One scene, no loading screens.
    /// </summary>
    public class GameFlow : MonoBehaviour
    {
        public enum Screen { Clubhouse, Care, Album }

        public static GameFlow Instance { get; private set; }

        public ContentDatabase database;
        public FaceSet face;
        public Fader fader;

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
        public bool Busy { get; private set; }

        void Awake()
        {
            Instance = this;
            Application.targetFrameRate = 60;
            SaveSystem.Load();
            foreach (var p in database.AvailablePets())
                if (!SaveSystem.Data.unlockedPets.Contains(p.id)) SaveSystem.Data.unlockedPets.Add(p.id);
            SaveSystem.Save();

            albumButton.onClick.AddListener(() => StartCoroutine(Go(Screen.Album, () => album.Refresh())));
            albumBackButton.onClick.AddListener(() => StartCoroutine(Go(Screen.Clubhouse, () => clubhouse.Enter(null))));
            settingsButton.onClick.AddListener(() => parentGate.Open(() => settings.Open()));
        }

        void Start()
        {
            Show(Screen.Clubhouse);
            // First launch: the first pet who has never been cared for arrives muddy.
            PetDefinition first = null;
            foreach (var p in database.AvailablePets())
                if (SaveSystem.Data.Pet(p.id).careCount == 0) { first = p; break; }
            clubhouse.Enter(first ?? RandomPet());
            StartCoroutine(fader.FadeIn());
        }

        void OnApplicationPause(bool paused)
        {
            if (paused) SaveSystem.Save();
        }

        void OnApplicationQuit() => SaveSystem.Save();

        PetDefinition RandomPet()
        {
            var list = new System.Collections.Generic.List<PetDefinition>(database.AvailablePets());
            return list.Count > 0 ? list[Random.Range(0, list.Count)] : null;
        }

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
            session.Cleanup();
            Show(Screen.Clubhouse);
            clubhouse.Enter(null);
            yield return fader.FadeIn();
            Busy = false;
            // A friend who still needs help always comes back muddy; after that, sometimes one does: "Oopsie!"
            PetDefinition next = null;
            foreach (var p in database.AvailablePets())
                if (p != caredFor && (next == null || SaveSystem.Data.Pet(p.id).careCount < SaveSystem.Data.Pet(next.id).careCount)) next = p;
            bool needsHelp = next != null && SaveSystem.Data.Pet(next.id).careCount == 0;
            if (next != null && (needsHelp || Random.value < 0.5f))
            {
                yield return new WaitForSeconds(2.5f);
                if (Current == Screen.Clubhouse && !Busy) clubhouse.Enter(next);
            }
        }

        public void RefreshClubhouse()
        {
            if (Current == Screen.Clubhouse) clubhouse.Enter(null);
        }

        /// <summary>Creates a pet from its definition, wearing its saved outfit if asked.</summary>
        public PetView SpawnPet(PetDefinition def, Transform parent, float scale, bool withAccessories)
        {
            var p = Instantiate(def.prefab, parent, false);
            p.name = "Pet_" + def.id;
            p.transform.localPosition = Vector3.zero;
            p.transform.localScale = Vector3.one * scale;
            p.Init(def, face);
            if (withAccessories)
                foreach (var id in SaveSystem.Data.Pet(def.id).accessories)
                {
                    var acc = database.Accessory(id);
                    if (acc) p.Rig.Wear(acc);
                }
            return p;
        }
    }
}
