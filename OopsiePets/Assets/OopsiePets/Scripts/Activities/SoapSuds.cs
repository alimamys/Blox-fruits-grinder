using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// A patch of shampoo foam stuck on the pet. It starts as a pink dollop, turns into white lather as it
    /// is rubbed in, shrinks a little under the sponge, and rinses away under the shower.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class SoapSuds : MonoBehaviour
    {
        static readonly Color Dollop = new Color(1f, 0.72f, 0.84f, 1f);

        SpriteRenderer sr;
        Vector3 baseScale;
        float amount = 1f;  // how much foam is left (1 = full, 0 = rinsed away)
        float lather;       // 0 = fresh dollop, 1 = fully rubbed in
        bool gone;

        public float Amount => amount;
        public float Lather => lather;
        public bool Cleared => gone || amount <= 0.02f;

        /// <summary>Creates a foam patch of <paramref name="worldSize"/> at a world point, parented to a pet part.</summary>
        public static SoapSuds Spawn(Sprite sprite, Transform parent, Vector3 worldPos, float worldSize, int order, bool asDollop)
        {
            var go = new GameObject(asDollop ? "Shampoo" : "Suds");
            go.transform.SetParent(parent, true);
            go.transform.position = new Vector3(worldPos.x, worldPos.y, parent.position.z);
            go.transform.rotation = Quaternion.Euler(0f, 0f, Random.Range(-30f, 30f));
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = sprite;
            sr.sortingOrder = order;
            var s = go.AddComponent<SoapSuds>();
            s.sr = sr;
            float w = sprite.bounds.size.x * Mathf.Abs(parent.lossyScale.x);
            s.baseScale = Vector3.one * (worldSize / Mathf.Max(0.0001f, w));
            s.lather = asDollop ? 0f : 1f;
            s.Apply();
            return s;
        }

        /// <summary>Rubbing it in: the dollop spreads into white lather. Returns true when it just became fully lathered.</summary>
        public bool Rub(float by)
        {
            if (lather >= 1f) return false;
            lather = Mathf.Min(1f, lather + by);
            Apply();
            return lather >= 1f;
        }

        /// <summary>Puffs the foam back up (scrubbing whips up more lather).</summary>
        public void Refoam(float atLeast)
        {
            if (gone) return;
            amount = Mathf.Max(amount, atLeast);
            Apply();
        }

        /// <summary>Washes some foam away (never below <paramref name="floor"/>).</summary>
        public void Wash(float by, float floor = 0f)
        {
            if (gone) return;
            amount = Mathf.Max(floor, amount - by);
            Apply();
            if (amount <= 0.02f)
            {
                gone = true;
                if (FxSpawner.Instance) FxSpawner.Instance.Burst(transform.position, 3, 1.5f, 0.25f, 0.4f, FxSpawner.Instance.bubble);
                Destroy(gameObject, 0.05f);
            }
        }

        void Apply()
        {
            if (!sr) sr = GetComponent<SpriteRenderer>();
            var c = Color.Lerp(Dollop, Palette.Untinted, lather);
            c.a = Mathf.Clamp01(amount * 1.4f) * 0.95f;
            sr.color = c;
            float grow = Mathf.Lerp(0.75f, 1.35f, lather);
            transform.localScale = baseScale * grow * Mathf.Lerp(0.45f, 1f, amount);
        }
    }
}
