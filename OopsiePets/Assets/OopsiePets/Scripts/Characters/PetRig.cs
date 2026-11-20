using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace OopsiePets
{
    /// <summary>
    /// The layered character: transforms for each animated part, face overlays, and accessory/decor anchors.
    /// Built by the editor builder from Data/rig_layout.json; the animator drives it from code.
    /// </summary>
    public class PetRig : MonoBehaviour
    {
        public Transform visual;
        public Transform body;
        public Transform head;
        public Transform tail;
        public Transform earLeft;
        public Transform earRight;
        public SpriteRenderer bodyRenderer;
        public SpriteRenderer headRenderer;
        public SpriteRenderer eyeLeft;
        public SpriteRenderer eyeRight;
        public SpriteRenderer mouth;

        [Header("Anchors")]
        public Transform hatAnchor;
        public Transform eyesAnchor;
        public Transform neckAnchor;
        public Transform sideAnchor;
        public Transform headDecor;
        public Transform bodyDecor;

        [Tooltip("Head width in rig-local units, for sizing accessories.")]
        public float headWidth = 4f;
        public SortingGroup sortingGroup;

        [Tooltip("Sorting order base for accessories inside the pet's sorting group.")]
        public int accessoryOrder = 40;

        readonly Dictionary<AccessorySlot, SpriteRenderer> worn = new Dictionary<AccessorySlot, SpriteRenderer>();
        readonly Dictionary<AccessorySlot, AccessoryDefinition> wornDefs = new Dictionary<AccessorySlot, AccessoryDefinition>();

        public void SetFace(FaceSet face, PetDefinition def, PetExpression e, bool blinking)
        {
            if (face == null) return;
            var eyes = blinking && face.UsesOpenEyes(e) ? face.eyeBlink : face.Eyes(e);
            if (eyeLeft) eyeLeft.sprite = eyes;
            if (eyeRight) eyeRight.sprite = eyes;
            if (mouth) mouth.sprite = face.Mouth(e, def);
        }

        public Transform Anchor(AccessorySlot slot) => slot switch
        {
            AccessorySlot.Hat => hatAnchor,
            AccessorySlot.Eyes => eyesAnchor,
            AccessorySlot.Neck => neckAnchor,
            _ => sideAnchor,
        };

        public AccessoryDefinition Worn(AccessorySlot slot) => wornDefs.TryGetValue(slot, out var a) ? a : null;

        public IEnumerable<AccessoryDefinition> AllWorn() => wornDefs.Values;

        public void Wear(AccessoryDefinition acc)
        {
            if (acc == null || acc.sprite == null) return;
            if (!worn.TryGetValue(acc.slot, out var sr) || sr == null)
            {
                var go = new GameObject("Accessory_" + acc.slot);
                go.transform.SetParent(Anchor(acc.slot), false);
                sr = go.AddComponent<SpriteRenderer>();
                worn[acc.slot] = sr;
            }
            sr.sprite = acc.sprite;
            sr.sortingOrder = accessoryOrder + (int)acc.slot * 2 + (acc.slot == AccessorySlot.Neck ? -30 : 0);
            float w = acc.sprite.bounds.size.x;
            float scale = w > 0.0001f ? headWidth * acc.widthOnHead / w : 1f;
            sr.transform.localScale = Vector3.one * scale;
            sr.transform.localPosition = acc.offset;
            sr.transform.localRotation = Quaternion.Euler(0f, 0f, acc.rotation);
            sr.gameObject.SetActive(true);
            wornDefs[acc.slot] = acc;
        }

        public void Remove(AccessorySlot slot)
        {
            if (worn.TryGetValue(slot, out var sr) && sr != null) sr.gameObject.SetActive(false);
            wornDefs.Remove(slot);
        }

        public void RemoveAll()
        {
            foreach (var slot in new List<AccessorySlot>(wornDefs.Keys)) Remove(slot);
        }

        public SpriteRenderer WornRenderer(AccessorySlot slot) => worn.TryGetValue(slot, out var sr) ? sr : null;
    }
}
