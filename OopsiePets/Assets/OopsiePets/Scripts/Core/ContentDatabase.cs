using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>All content the game knows about, grouped in packs.</summary>
    [CreateAssetMenu(menuName = "Oopsie Pets/Content Database", fileName = "ContentDatabase")]
    public class ContentDatabase : ScriptableObject
    {
        public List<ContentPack> packs = new List<ContentPack>();
        public FaceSet defaultFace;

        public IEnumerable<PetDefinition> AvailablePets()
        {
            foreach (var p in packs)
                if (Entitlements.IsUnlocked(p))
                    foreach (var pet in p.pets) yield return pet;
        }

        public IEnumerable<AccessoryDefinition> AvailableAccessories()
        {
            foreach (var p in packs)
                if (Entitlements.IsUnlocked(p))
                    foreach (var a in p.accessories) yield return a;
        }

        public IEnumerable<StickerDefinition> AllStickers()
        {
            foreach (var p in packs)
                foreach (var s in p.stickers) yield return s;
        }

        public PetDefinition Pet(string id)
        {
            foreach (var p in AvailablePets()) if (p.id == id) return p;
            return null;
        }

        public AccessoryDefinition Accessory(string id)
        {
            foreach (var a in AvailableAccessories()) if (a.id == id) return a;
            return null;
        }

        public StickerDefinition Sticker(string id)
        {
            foreach (var s in AllStickers()) if (s.id == id) return s;
            return null;
        }
    }
}
