using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Runs a care visit for one pet: either the full adventure (play outside with its own toy → shampoo →
    /// sponge → bubbles → rinse → dry → brush hair → brush teeth → dress-up → sticker) or a short routine
    /// picked from the menu (bath time, grooming, bubbles, dress-up). A pet that is already muddy skips the
    /// garden and goes straight to the bath. Between activities a big "next" button appears; nothing moves on
    /// by itself, so a child can keep playing as long as they like. Home is always one tap away.
    /// </summary>
    public class CareSession : MonoBehaviour
    {
        public static readonly ActivityKind[] FullCare =
        {
            ActivityKind.Outdoor, ActivityKind.Shampoo, ActivityKind.Wash, ActivityKind.Bubbles, ActivityKind.Rinse,
            ActivityKind.Dry, ActivityKind.Brush, ActivityKind.Teeth, ActivityKind.DressUp,
        };
        /// <summary>For a pet that is already muddy (an "Oopsie!" visitor): straight to the bath.</summary>
        public static readonly ActivityKind[] CleanUp =
        {
            ActivityKind.Shampoo, ActivityKind.Wash, ActivityKind.Bubbles, ActivityKind.Rinse, ActivityKind.Dry,
            ActivityKind.Brush, ActivityKind.Teeth, ActivityKind.DressUp,
        };
        /// <summary>Bath time from the menu: shampoo, sponge, bubbles, rinse, dry.</summary>
        public static readonly ActivityKind[] Bath = { ActivityKind.Shampoo, ActivityKind.Wash, ActivityKind.Bubbles, ActivityKind.Rinse, ActivityKind.Dry };
        /// <summary>Grooming from the menu: brush the fur, then brush the teeth.</summary>
        public static readonly ActivityKind[] Grooming = { ActivityKind.Brush, ActivityKind.Teeth };

        /// <summary>A full visit (earns the pet's sticker): it includes the bath through dress-up.</summary>
        public static bool IsFull(ActivityKind[] seq) =>
            seq != null && seq.Length >= 4 && System.Array.IndexOf(seq, ActivityKind.Wash) >= 0 && System.Array.IndexOf(seq, ActivityKind.DressUp) >= 0;

        public List<Activity> activities = new List<Activity>();
        public ActivityContext context;
        public Transform tubStage, cushionStage, dressStage, gardenStage, matStage, teethStage;
        public Button homeButton;
        public Button nextButton;
        public RewardPanel reward;

        public PetView Pet { get; private set; }
        /// <summary>Set when the child leaves the garden with a muddy pet: it comes home muddy.</summary>
        public PetDefinition MuddyPet { get; private set; }
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
            // A bird has a beak, not teeth: it skips tooth brushing.
            if (pet.hasBeak) sequence = System.Array.FindAll(sequence, k => k != ActivityKind.Teeth);
            foreach (var a in activities) a.gameObject.SetActive(false);
            run = StartCoroutine(Run(pet, sequence));
        }

        IEnumerator Run(PetDefinition petDef, ActivityKind[] seq)
        {
            bool full = IsFull(seq);
            MuddyPet = null;
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
                // This friend is now completed (it may open a star lock, and offers the rainbow coat).
                SaveSystem.Data.Pet(petDef.id).completed = true;
                SaveSystem.Save();
                // Sticker reward on the dress-up stage, with the pet wearing its outfit.
                Stage(ActivityKind.DressUp, Get(ActivityKind.DressUp));
                var sticker = StickerBook.Award(GameFlow.Instance.database, petDef);
                Pet.Animator.Play(PetReaction.Celebrate);
                homeButton.gameObject.SetActive(false);
                if (context.stars) context.stars.gameObject.SetActive(false);
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
                ActivityKind.Outdoor => gardenStage,
                ActivityKind.Dry => matStage ? matStage : tubStage,
                ActivityKind.Teeth => teethStage ? teethStage : cushionStage,
                _ => tubStage,
            };
            Pet.transform.SetParent(spot, false);
            Pet.transform.localPosition = Vector3.zero;
            Pet.transform.localRotation = Quaternion.identity;
            float s = act ? act.petScale : 0.62f;
            Pet.transform.localScale = Vector3.one * s;
            // Stray taps on the pet during care must not set off its tap tricks (the panda used to roll
            // over in the tub). Only in dress-up is tapping the pet part of the fun.
            Pet.tappable = kind == ActivityKind.DressUp;
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
            // Leaving the garden after a splash: the pet comes home muddy and asks for a bath.
            if (Current && Current.Kind == ActivityKind.Outdoor && Pet && Pet.GetComponentInChildren<MudSpot>())
                MuddyPet = Pet.Definition;
            StopCoroutine(run);
            run = null;
            GameFlow.Instance.StartCoroutine(GameFlow.Instance.ReturnToClubhouse(def, this)); // owned by GameFlow: this object is hidden on the way out
        }

        void Finish()
        {
            run = null;
            GameFlow.Instance.StartCoroutine(GameFlow.Instance.ReturnToClubhouse(def, this)); // owned by GameFlow: this object is hidden on the way out
        }

        /// <summary>Called by GameFlow while the screen is faded out.</summary>
        public void Cleanup()
        {
            if (Current) Current.End();
            Current = null;
            nextButton.gameObject.SetActive(false);
            reward.HideNow();
            homeButton.gameObject.SetActive(true);
            if (context.stars) context.stars.gameObject.SetActive(true);
            if (Pet) Destroy(Pet.gameObject);
            Pet = null;
            if (context.hint) context.hint.Hide();
        }
    }
}
