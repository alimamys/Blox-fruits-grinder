using System;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    [Serializable]
    public struct AccessoryReaction
    {
        public AccessoryDefinition accessory;
        public PetReaction reaction;
    }

    /// <summary>Everything that makes one pet different: art, voice, personality, idle motion and favorite reactions.</summary>
    [CreateAssetMenu(menuName = "Oopsie Pets/Pet", fileName = "Pet")]
    public class PetDefinition : ScriptableObject
    {
        public string id;
        public string displayName;
        public Sprite portrait;
        [Tooltip("Rig prefab with PetView, PetRig and PetAnimator.")]
        public PetView prefab;

        [Header("Voice")]
        public PetVoice voice;
        [Range(0.6f, 1.6f)] public float voicePitch = 1f;

        [Header("Look")]
        [Tooltip("Tint for messy fur tufts while brushing.")]
        public Color furTint = Color.white;
        public Sprite mouthSmileOverride;
        public Sprite mouthLaughOverride;

        [Header("Personality")]
        [Tooltip("Reactions picked at random when the pet is tapped.")]
        public List<PetReaction> tapReactions = new List<PetReaction> { PetReaction.Bounce, PetReaction.Giggle, PetReaction.HeadTilt };
        public PetReaction favoriteReaction = PetReaction.Giggle;
        public List<AccessoryReaction> accessoryReactions = new List<AccessoryReaction>();

        [Header("Idle motion")]
        public float tailWagSpeed = 3f;
        public float tailWagAngle = 15f;
        public float earSwayAngle = 3f;
        public float earSwaySpeed = 1.2f;
        public float breathe = 0.025f;

        [Header("Progression")]
        public StickerDefinition sticker;

        public PetReaction ReactionFor(AccessoryDefinition acc)
        {
            foreach (var r in accessoryReactions)
                if (r.accessory == acc) return r.reaction;
            return acc != null ? acc.reaction : favoriteReaction;
        }
    }
}
