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

        /// <summary>Raised after the pet reacts to a tap.</summary>
        public event Action<PetView> Tapped;

        [Tooltip("When false, taps are ignored (e.g. during a scripted moment).")]
        public bool tappable = true;

        void Awake()
        {
            Rig = GetComponent<PetRig>();
            Animator = GetComponent<PetAnimator>();
        }

        public void Init(PetDefinition def, FaceSet face)
        {
            Definition = def;
            Animator.definition = def;
            Animator.face = face;
        }

        public void SetSortingOrder(int order)
        {
            if (Rig.sortingGroup) Rig.sortingGroup.sortingOrder = order;
        }

        public bool CanTap => tappable && isActiveAndEnabled;

        public void OnTap(Vector2 worldPos)
        {
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
