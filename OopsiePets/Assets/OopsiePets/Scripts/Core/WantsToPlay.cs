using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// The "let's go play!" sign on one clubhouse pet: a thought bubble with its own garden toy floats
    /// above its head, and every few seconds the pet gives a big bored yawn. Tapping that pet takes it
    /// straight outside. No words needed.
    /// </summary>
    public class WantsToPlay : MonoBehaviour
    {
        // Where the cloud's middle is inside the bubble sprite (normalized, from make_thought_bubble.py).
        static readonly Vector2 CloudCentre = new Vector2(0.62f, 0.61f);
        static readonly Vector2 SpritePivot = new Vector2(0.10f, 0.107f);

        PetView pet;
        Transform root;
        SpriteRenderer bubble, icon;
        float size, t, nextYawn, popT = 10f;
        Vector3 baseScale;

        public PetView Pet => pet;

        public static WantsToPlay Attach(PetView pet, Sprite bubbleSprite, float width)
        {
            var w = pet.gameObject.AddComponent<WantsToPlay>();
            w.Build(pet, bubbleSprite, width);
            return w;
        }

        void Build(PetView p, Sprite bubbleSprite, float width)
        {
            pet = p;
            size = width;
            root = new GameObject("WantsToPlay_" + p.Definition.id).transform;
            root.SetParent(p.transform.parent ? p.transform.parent.parent : null, true);
            bubble = new GameObject("Bubble").AddComponent<SpriteRenderer>();
            bubble.transform.SetParent(root, false);
            bubble.sprite = bubbleSprite;
            bubble.sortingOrder = 200;
            float bs = width / Mathf.Max(0.01f, bubbleSprite.bounds.size.x);
            bubble.transform.localScale = Vector3.one * bs;
            icon = new GameObject("Toy").AddComponent<SpriteRenderer>();
            icon.transform.SetParent(root, false);
            icon.sprite = p.Definition.toyIcon;
            icon.sortingOrder = 201;
            if (icon.sprite)
            {
                var ib = icon.sprite.bounds.size;
                float isz = width * 0.5f / Mathf.Max(0.01f, Mathf.Max(ib.x, ib.y * 1.35f));
                icon.transform.localScale = Vector3.one * isz;
            }
            var bsz = bubbleSprite.bounds.size * bs;
            icon.transform.localPosition = new Vector3((CloudCentre.x - SpritePivot.x) * bsz.x, (CloudCentre.y - SpritePivot.y) * bsz.y, 0f);
            baseScale = Vector3.zero;
            root.localScale = Vector3.zero; // pops in
            nextYawn = Time.time + Random.Range(1.2f, 2.2f);
            Place(true);
        }

        void Place(bool snap)
        {
            if (!pet) return;
            var b = pet.VisualBounds();
            // The trail starts just above the head, a little to the right; keep the cloud on screen.
            var target = new Vector3(b.center.x + b.extents.x * 0.35f, b.max.y + 0.05f, 0f);
            var cam = Camera.main;
            if (cam)
            {
                float halfW = cam.orthographicSize * cam.aspect;
                float right = target.x + size * (1f - SpritePivot.x);
                if (right > cam.transform.position.x + halfW - 0.1f) target.x -= right - (cam.transform.position.x + halfW - 0.1f);
            }
            root.position = snap ? target : Vector3.Lerp(root.position, target, Time.deltaTime * 6f);
        }

        /// <summary>The bubble pops in a sprinkle of sparkles (the pet is off to play).</summary>
        public void Pop()
        {
            if (FxSpawner.Instance && root) FxSpawner.Instance.Sparkles(icon.transform.position, 8, 0.6f);
            AudioManager.Instance?.Play(Sfx.Pop, 0.6f, 1.3f);
            Destroy(this);
        }

        void Update()
        {
            if (!pet) { Destroy(this); return; }
            t += Time.deltaTime;
            popT += Time.deltaTime;
            Place(false);
            // Pop in, then bob gently; wiggle when the pet yawns.
            float appear = Ease.OutBack(Mathf.Clamp01(t / 0.4f));
            float bob = 1f + Mathf.Sin(t * 2.4f) * 0.04f;
            float wiggle = popT < 0.6f ? Mathf.Sin(popT * 25f) * 6f * (1f - popT / 0.6f) : 0f;
            root.localScale = Vector3.one * appear * bob;
            icon.transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(t * 1.6f) * 6f + wiggle);
            bubble.transform.localRotation = Quaternion.Euler(0f, 0f, wiggle * 0.4f);
            if (Time.time >= nextYawn && pet.tappable && !pet.Animator.IsReacting)
            {
                nextYawn = Time.time + Random.Range(4.5f, 6.5f);
                pet.Animator.Play(PetReaction.Yawn);
                popT = 0f;
            }
        }

        void OnDestroy()
        {
            if (root) Destroy(root.gameObject);
        }
    }
}
