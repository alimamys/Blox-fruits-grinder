using UnityEngine;

namespace OopsiePets
{
    /// <summary>A tappable clubhouse prop: the ball bounces, the basket wiggles and tosses out a sparkle.</summary>
    [RequireComponent(typeof(Collider2D))]
    public class ClubhouseToy : MonoBehaviour, ITappable
    {
        public enum Kind { Ball, Basket, Bed }
        public Kind kind;
        Vector3 home, baseScale;
        float t = 10f, dir = 1f;

        void Awake()
        {
            home = transform.localPosition;
            baseScale = transform.localScale;
        }

        public bool CanTap => isActiveAndEnabled;

        public void OnTap(Vector2 worldPos)
        {
            t = 0f;
            dir = worldPos.x < transform.position.x ? 1f : -1f;
            var a = AudioManager.Instance;
            if (a) a.Play(kind == Kind.Ball ? Sfx.Pop : Sfx.Tap, 0.6f, kind == Kind.Ball ? 0.8f : 1.1f);
            if (FxSpawner.Instance) FxSpawner.Instance.Sparkles(transform.position + Vector3.up * 0.4f, 4, 0.5f);
        }

        void Update()
        {
            t += Time.deltaTime;
            if (t > 1.4f)
            {
                transform.localPosition = Vector3.Lerp(transform.localPosition, home, Time.deltaTime * 4f);
                transform.localScale = baseScale;
                transform.localRotation = Quaternion.identity;
                return;
            }
            switch (kind)
            {
                case Kind.Ball:
                {
                    // Two shrinking bounces while rolling a little.
                    float b = Mathf.Abs(Mathf.Sin(t * 7f)) * Mathf.Exp(-2.2f * t) * 1.2f;
                    transform.localPosition = home + new Vector3(Mathf.Sin(t * 1.5f) * 0.6f * dir, b, 0f);
                    transform.localRotation = Quaternion.Euler(0f, 0f, -t * 360f * dir * 0.6f);
                    break;
                }
                case Kind.Basket:
                    transform.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(t * 25f) * 8f * Mathf.Exp(-3f * t));
                    transform.localScale = new Vector3(baseScale.x * (1f + 0.08f * Mathf.Sin(t * 20f) * Mathf.Exp(-3f * t)), baseScale.y, 1f);
                    break;
                default:
                    float s = 1f + 0.1f * Mathf.Sin(t * 14f) * Mathf.Exp(-3f * t);
                    transform.localScale = new Vector3(baseScale.x * s, baseScale.y / s, 1f);
                    break;
            }
        }
    }
}
