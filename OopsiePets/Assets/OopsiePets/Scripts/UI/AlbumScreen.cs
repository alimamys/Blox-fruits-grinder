using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>The sticker album: collected stickers sit on the pages and wiggle when tapped; the rest are soft "still to find" shapes.</summary>
    public class AlbumScreen : MonoBehaviour
    {
        public Transform[] slots;
        public float stickerSize = 2.4f;
        readonly List<StickerSlot> made = new List<StickerSlot>();

        public void Refresh()
        {
            foreach (var m in made) if (m) Destroy(m.gameObject);
            made.Clear();
            int i = 0;
            foreach (var s in GameFlow.Instance.database.AllStickers())
            {
                if (i >= slots.Length) break;
                var go = new GameObject("Sticker_" + s.id);
                go.transform.SetParent(slots[i++], false);
                var slot = go.AddComponent<StickerSlot>();
                slot.Init(s, StickerBook.Has(s), stickerSize);
                made.Add(slot);
            }
        }
    }
}
