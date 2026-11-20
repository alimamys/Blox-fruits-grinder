using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// The cozy home screen. Every pet lounges on its bed with its outfit on and reacts when tapped; tapping
    /// opens the care menu. Now and then a pet comes back muddy ("Oopsie!") and asks for a bath.
    /// </summary>
    public class Clubhouse : MonoBehaviour
    {
        public Transform[] bedSpots;
        public Transform doorSpot;
        public CareMenu menu;
        public FingerHint hint;
        public Sprite[] mudSprites;
        public float petScale = 0.46f;

        readonly List<PetView> pets = new List<PetView>();
        PetView visitor;
        Coroutine arrival;

        void Awake()
        {
            menu.Chosen = (p, seq) => GameFlow.Instance.StartCare(p.Definition, seq);
        }

        public IEnumerable<PetView> Pets => pets;
        public PetView Visitor => visitor;

        /// <summary>Rebuilds the room. If <paramref name="arrive"/> is set, that pet walks in muddy.</summary>
        public void Enter(PetDefinition arrive)
        {
            Clear();
            int i = 0;
            foreach (var def in GameFlow.Instance.database.AvailablePets())
            {
                if (i >= bedSpots.Length) break;
                var spot = bedSpots[i++];
                var p = GameFlow.Instance.SpawnPet(def, spot, petScale, true);
                p.SetSortingOrder(20 + i);
                p.Tapped += OnPetTapped;
                pets.Add(p);
            }
            if (arrive != null)
            {
                var v = pets.Find(p => p.Definition == arrive);
                if (v != null) arrival = StartCoroutine(Arrive(v));
            }
        }

        public void Clear()
        {
            if (arrival != null) StopCoroutine(arrival);
            arrival = null;
            menu.HideNow();
            hint.Hide();
            foreach (var p in pets) if (p) Destroy(p.gameObject);
            pets.Clear();
            visitor = null;
        }

        void OnPetTapped(PetView p)
        {
            hint.Hide();
            if (p == visitor)
            {
                // The muddy visitor goes straight to the bath.
                GameFlow.Instance.StartCare(p.Definition, CareSession.FullCare);
                return;
            }
            menu.Show(p);
        }

        IEnumerator Arrive(PetView p)
        {
            visitor = p;
            var bed = p.transform.parent;
            p.tappable = false;
            p.transform.SetParent(transform, true);
            // Splat some mud on so the problem is obvious without words.
            for (int i = 0; i < 5; i++)
            {
                var part = i < 2 ? p.Rig.headRenderer : p.Rig.bodyRenderer;
                var parent = i < 2 ? p.Rig.headDecor : p.Rig.bodyDecor;
                var go = new GameObject("Mud");
                go.transform.SetParent(parent, false);
                go.transform.localPosition = PetDecor.RandomPointOn(part, 0.32f, 0.28f);
                var sr = go.AddComponent<SpriteRenderer>();
                sr.sprite = mudSprites[Random.Range(0, mudSprites.Length)];
                float s = part.sprite.bounds.size.x * Random.Range(0.3f, 0.38f) / sr.sprite.bounds.size.x;
                go.transform.localScale = Vector3.one * s;
                go.transform.localRotation = Quaternion.Euler(0f, 0f, Random.Range(-30f, 30f));
                sr.sortingOrder = i < 2 ? 60 + i : 20 + i;
            }
            Vector3 from = doorSpot.position, to = bed.position;
            p.transform.position = from;
            yield return new WaitForSeconds(0.6f);
            // Hop hop hop into the room.
            for (int h = 0; h < 4; h++)
            {
                var a = Vector3.Lerp(from, to, h / 4f);
                var b = Vector3.Lerp(from, to, (h + 1) / 4f);
                if (AudioManager.Instance) AudioManager.Instance.PlayVoice(p.Definition.voice, p.Definition.voicePitch, VoiceKind.Happy);
                yield return Ease.Tween(0.42f, k => p.transform.position = Vector3.Lerp(a, b, k) + Vector3.up * Ease.Bump(k) * 0.6f, Ease.Linear, false);
            }
            p.Animator.Play(PetReaction.Shake);
            yield return new WaitForSeconds(1.0f);
            p.Animator.Play(PetReaction.Sneeze);
            yield return new WaitForSeconds(1.2f);
            p.transform.SetParent(bed, true);
            p.Animator.SetMood(PetExpression.Surprised);
            p.tappable = true;
            hint.ShowTap(p.Rig.head);
            arrival = null;
        }

        bool wasPressed;

        void Update()
        {
            // Tapping anywhere else closes the care menu.
            var input = InputRouter.Instance;
            bool pressed = input && input.IsPressed;
            if (pressed && !wasPressed && menu.Visible && !menu.ShownThisFrame) menu.HideNow();
            wasPressed = pressed;

            // A bouncing hand keeps inviting a tap on the muddy visitor.
            if (visitor && visitor.tappable && !hint.Visible && Time.frameCount % 240 == 0) hint.ShowTap(visitor.Rig.head);
        }
    }
}
