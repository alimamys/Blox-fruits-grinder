using UnityEngine;

namespace OopsiePets
{
    /// <summary>Scales a background sprite to cover the whole camera view, whatever the phone's shape.</summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class BackgroundFit : MonoBehaviour
    {
        public Camera cam;
        SpriteRenderer sr;

        void Awake() => sr = GetComponent<SpriteRenderer>();

        void LateUpdate()
        {
            if (!cam || !sr.sprite) return;
            float h = cam.orthographicSize * 2f, w = h * cam.aspect;
            var size = sr.sprite.bounds.size;
            float s = Mathf.Max(w / size.x, h / size.y);
            transform.localScale = new Vector3(s, s, 1f);
            var p = cam.transform.position;
            transform.position = new Vector3(p.x, p.y, transform.position.z);
        }
    }
}
