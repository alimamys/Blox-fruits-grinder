using UnityEngine;

namespace OopsiePets
{
    [CreateAssetMenu(menuName = "Oopsie Pets/Accessory", fileName = "Accessory")]
    public class AccessoryDefinition : ScriptableObject
    {
        public string id;
        public Sprite sprite;
        public AccessorySlot slot;
        [Tooltip("Width of the accessory relative to the pet's head width for this slot.")]
        public float widthOnHead = 0.6f;
        [Tooltip("Extra local offset (rig units) from the slot anchor.")]
        public Vector2 offset;
        public float rotation;
        [Tooltip("How the pet reacts when it puts this on (pets may override).")]
        public PetReaction reaction = PetReaction.Bounce;
    }
}
