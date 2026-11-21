using System;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>A pet in the world: owns its rig and animator and reacts when tapped.</summary>
    [RequireComponent(typeof(PetRig), typeof(PetAnimator))]
    public class PetView : MonoBehaviour, ITappable
    {
        public PetDefinition Definition { get; private set; }
        public PetRig Rig { get; private set; }
        public PetAnimator Animator { get; private set; }
        public PetCoat Coat { get; private set; }

        /// <summary>Raised after the pet reacts to a tap.</summary>
        public event Action<PetView> Tapped;

        [Tooltip("When false, taps are ignored (e.g. during a scripted moment).")]
        public bool tappable = true;
        [Tooltip("A friend that can't be played with yet: it naps, and a tap only makes it stir.")]
        public bool locked;

        void Awake()
        {
            Rig = GetComponent<PetRig>();
            Animator = GetComponent<PetAnimator>();
            Coat = GetComponent<PetCoat>();
            if (!Coat) Coat = gameObject.AddComponent<PetCoat>();
        }

        public void Init(PetDefinition def, FaceSet face)
        {
            Definition = def;
            Animator.definition = def;
            Animator.face = face;
            // A beak is part of the drawing: no mouth overlay.
            if (def.hasBeak && Rig.mouth) Rig.mouth.enabled = false;
        }

        public void SetSortingOrder(int order)
        {
            if (Rig.sortingGroup) Rig.sortingGroup.sortingOrder = order;
        }

        public bool CanTap => tappable && isActiveAndEnabled;

        public void OnTap(Vector2 worldPos)
        {
            if (locked) { Animator.Play(PetReaction.Wiggle); Tapped?.Invoke(this); return; }
            Animator.PlayRandomTap();
            Tapped?.Invoke(this);
        }

        /// <summary>World-space bounds of the body and head, for placing mud, tufts and effects.</summary>
        public Bounds VisualBounds()
        {
            var b = Rig.bodyRenderer.bounds;
            b.Encapsulate(Rig.headRenderer.bounds);
            return b;
        }
    }
}
