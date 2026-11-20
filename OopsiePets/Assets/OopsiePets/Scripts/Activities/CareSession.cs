using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Runs a care visit for one pet: either the full adventure (wash → bubbles → brush → dress-up → sticker)
    /// or a single favourite activity. Between activities a big "next" button appears; nothing moves on
    /// by itself, so a child can keep playing as long as they like. Home is always one tap away.
    /// </summary>
    public class CareSession : MonoBehaviour
    {
        public static readonly ActivityKind[] FullCare = { ActivityKind.Wash, ActivityKind.Bubbles, ActivityKind.Brush, ActivityKind.DressUp };

        public List<Activity> activities = new List<Activity>();
        public ActivityContext context;
        public Transform tubStage, cushionStage, dressStage;
        public Button homeButton;
        public Button nextButton;
        public RewardPanel reward;

        public PetView Pet { get; private set; }
        public Activity Current { get; private set; }
        public bool Running => run != null;

        Coroutine run;
        bool nextPressed;
        PetDefinition def;

        void Awake()
        {
            homeButton.onClick.AddListener(GoHome);
            nextButton.onClick.AddListener(() => nextPressed = true);
            nextButton.gameObject.SetActive(false);
        }

        Activity Get(ActivityKind k)
        {
            foreach (var a in activities) if (a.Kind == k) return a;
            return null;
        }

        public void Begin(PetDefinition pet, ActivityKind[] sequence)
        {
            def = pet;
            foreach (var a in activities) a.gameObject.SetActive(false);
            run = StartCoroutine(Run(pet, sequence));
        }

        IEnumerator Run(PetDefinition petDef, ActivityKind[] seq)
        {
            bool full = seq.Length == FullCare.Length;
            Pet = GameFlow.Instance.SpawnPet(petDef, tubStage, 0.62f, false);
            Pet.SetSortingOrder(10);
            for (int i = 0; i < seq.Length; i++)
            {
                var kind = seq[i];
                var act = Get(kind);
                if (act == null) continue;
                if (i > 0) yield return GameFlow.Instance.fader.FadeOut();
                Stage(kind, act);
                Current = act;
                act.Begin(Pet, context);
                if (i > 0) yield return GameFlow.Instance.fader.FadeIn();
                while (!act.IsComplete) yield return null;

                var save = SaveSystem.Data.Pet(petDef.id);
                if (!save.completedActivities.Contains((int)kind)) save.completedActivities.Add((int)kind);
                SaveSystem.Save();

                if (kind == ActivityKind.DressUp)
                {
                    yield return new WaitForSeconds(1.4f);
                }
                else
                {
                    yield return new WaitForSeconds(1.2f);
                    nextPressed = false;
                    nextButton.gameObject.SetActive(true);
                    while (!nextPressed) yield return null;
                    nextButton.gameObject.SetActive(false);
                }
                if (i < seq.Length - 1 || full) act.End();
                else Current = act; // last single activity stays on screen under the home transition
            }

            SaveSystem.Data.Pet(petDef.id).careCount++;
            SaveSystem.Save();

            if (full)
            {
                // Sticker reward on the dress-up stage, with the pet wearing its outfit.
                Stage(ActivityKind.DressUp, Get(ActivityKind.DressUp));
                var sticker = StickerBook.Award(GameFlow.Instance.database, petDef);
                Pet.Animator.Play(PetReaction.Celebrate);
                yield return reward.Show(sticker);
            }
            Finish();
        }

        void Stage(ActivityKind kind, Activity act)
        {
            var spot = kind switch
            {
                ActivityKind.Brush => cushionStage,
                ActivityKind.DressUp => dressStage,
                _ => tubStage,
            };
            Pet.transform.SetParent(spot, false);
            Pet.transform.localPosition = Vector3.zero;
            float s = act ? act.petScale : 0.62f;
            Pet.transform.localScale = Vector3.one * s;
            Pet.Rig.RemoveAll();
            if (kind == ActivityKind.DressUp)
                foreach (var id in SaveSystem.Data.Pet(Pet.Definition.id).accessories)
                {
                    var acc = GameFlow.Instance.database.Accessory(id);
                    if (acc) Pet.Rig.Wear(acc);
                }
        }

        public void GoHome()
        {
            if (run == null) return;
            // Leaving dress-up early still keeps the outfit the child picked.
            if (Current && Current.Kind == ActivityKind.DressUp && Pet)
            {
                var save = SaveSystem.Data.Pet(Pet.Definition.id);
                save.accessories.Clear();
                foreach (var a in Pet.Rig.AllWorn()) save.accessories.Add(a.id);
                SaveSystem.Save();
            }
            StopCoroutine(run);
            run = null;
            StartCoroutine(GameFlow.Instance.ReturnToClubhouse(def, this));
        }

        void Finish()
        {
            run = null;
            StartCoroutine(GameFlow.Instance.ReturnToClubhouse(def, this));
        }

        /// <summary>Called by GameFlow while the screen is faded out.</summary>
        public void Cleanup()
        {
            if (Current) Current.End();
            Current = null;
            nextButton.gameObject.SetActive(false);
            reward.HideNow();
            if (Pet) Destroy(Pet.gameObject);
            Pet = null;
            if (context.hint) context.hint.Hide();
        }
    }
}
