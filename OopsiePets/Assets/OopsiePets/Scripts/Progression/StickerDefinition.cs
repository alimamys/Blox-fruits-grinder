using UnityEngine;

namespace OopsiePets
{
    [CreateAssetMenu(menuName = "Oopsie Pets/Sticker", fileName = "Sticker")]
    public class StickerDefinition : ScriptableObject
    {
        public string id;
        public Sprite sprite;
        [Tooltip("Optional: the pet this sticker celebrates. Its first full care awards this sticker.")]
        public PetDefinition pet;
    }
}
