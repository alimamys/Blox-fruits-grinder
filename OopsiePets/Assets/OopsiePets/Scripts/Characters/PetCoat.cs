using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// The pet's coat colour. Normally its own fur; with the rainbow coat on (offered once the pet has had a
    /// full visit), the fur sprites switch to the rainbow shader: soft pastel bands drifting over the pet.
    /// If that shader can't run on a device, the fur parts gently cycle through rainbow tints instead.
    /// </summary>
    public class PetCoat : MonoBehaviour
    {
        /// <summary>Set once by GameFlow from the scene (a material using OopsiePets/RainbowSprite).</summary>
        public static Material RainbowMaterial;

        PetRig rig;
        SpriteRenderer[] fur;
        Material[] original;
        bool rainbow, fallback;

        public bool Rainbow => rainbow;

        void Awake() => Collect();

        void Collect()
        {
            if (fur != null) return;
            rig = GetComponent<PetRig>();
            var list = new System.Collections.Generic.List<SpriteRenderer>();
            void Add(Transform t) { if (t && t.TryGetComponent<SpriteRenderer>(out var sr)) list.Add(sr); }
            if (rig)
            {
                list.Add(rig.bodyRenderer);
                list.Add(rig.headRenderer);
                Add(rig.earLeft); Add(rig.earRight); Add(rig.tail);
            }
            list.RemoveAll(r => r == null);
            fur = list.ToArray();
            original = new Material[fur.Length];
            for (int i = 0; i < fur.Length; i++) original[i] = fur[i].sharedMaterial;
        }

        public void SetRainbow(bool on)
        {
            Collect();
            if (on == rainbow) return;
            rainbow = on;
            bool shader = RainbowMaterial && RainbowMaterial.shader && RainbowMaterial.shader.isSupported;
            fallback = on && !shader;
            for (int i = 0; i < fur.Length; i++)
            {
                if (!fur[i]) continue;
                fur[i].sharedMaterial = on && shader ? RainbowMaterial : original[i];
                if (!on) Tint(i, Color.white);
            }
        }

        // Fallback only: the colour the fur would have without the rainbow is white (renderer colours are
        // also used for the wet look while drying, so only the hue is changed, not the brightness).
        void Tint(int i, Color c)
        {
            var cur = fur[i].color;
            fur[i].color = new Color(c.r, c.g, c.b, cur.a);
        }

        void Update()
        {
            if (!fallback) return;
            for (int i = 0; i < fur.Length; i++)
            {
                if (!fur[i]) continue;
                var c = Color.HSVToRGB(Mathf.Repeat(Time.time * 0.08f + i * 0.21f, 1f), 0.35f, 1f);
                Tint(i, c);
            }
        }
    }
}
