using UnityEngine;

namespace OopsiePets
{
    /// <summary>Portrait camera that always shows the full design width (10.8 units) on any phone shape.</summary>
    [RequireComponent(typeof(Camera))]
    public class CameraFit : MonoBehaviour
    {
        public float designWidth = 10.8f;
        public float designHeight = 19.2f;
        Camera cam;

        void Awake() => cam = GetComponent<Camera>();

        void LateUpdate()
        {
            float aspect = (float)Screen.width / Mathf.Max(1, Screen.height);
            cam.orthographicSize = Mathf.Max(designHeight * 0.5f, designWidth * 0.5f / Mathf.Max(0.01f, aspect));
        }
    }
}
