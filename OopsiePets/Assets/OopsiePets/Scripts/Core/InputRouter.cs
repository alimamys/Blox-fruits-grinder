using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

namespace OopsiePets
{
    /// <summary>Anything in the world that can be tapped (pets, bubbles, toys).</summary>
    public interface ITappable
    {
        bool CanTap { get; }
        void OnTap(Vector2 worldPos);
    }

    /// <summary>
    /// One full-screen, invisible UI element behind all buttons that receives every press, drag and
    /// release (mouse in the Editor, touch on phones). Buttons sit above it, so they naturally win.
    /// Taps are forgiving: the nearest tappable within a finger-sized radius is chosen.
    /// </summary>
    public class InputRouter : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        public static InputRouter Instance { get; private set; }

        public Camera worldCamera;
        [Tooltip("World-space radius around the finger that still counts as hitting something.")]
        public float tapRadius = 0.45f;

        public event Action<Vector2> PointerDown;
        public event Action<Vector2, Vector2> PointerDrag; // position, delta (world)
        public event Action<Vector2> PointerUp;

        public bool IsPressed { get; private set; }
        public Vector2 WorldPosition { get; private set; }
        int activePointer = int.MinValue;

        readonly List<Collider2D> hits = new List<Collider2D>(16);

        void Awake() => Instance = this;

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        Vector2 ToWorld(Vector2 screen)
        {
            var w = worldCamera.ScreenToWorldPoint(new Vector3(screen.x, screen.y, -worldCamera.transform.position.z));
            return new Vector2(w.x, w.y);
        }

        public void OnPointerDown(PointerEventData e)
        {
            if (IsPressed) return; // single-finger game: ignore extra fingers
            activePointer = e.pointerId;
            IsPressed = true;
            WorldPosition = ToWorld(e.position);
            TryTap(WorldPosition);
            PointerDown?.Invoke(WorldPosition);
        }

        public void OnDrag(PointerEventData e)
        {
            if (!IsPressed || e.pointerId != activePointer) return;
            var p = ToWorld(e.position);
            var d = p - WorldPosition;
            WorldPosition = p;
            PointerDrag?.Invoke(p, d);
        }

        public void OnPointerUp(PointerEventData e)
        {
            if (e.pointerId != activePointer) return;
            IsPressed = false;
            activePointer = int.MinValue;
            WorldPosition = ToWorld(e.position);
            PointerUp?.Invoke(WorldPosition);
        }

        /// <summary>Finds the nearest tappable around a world point and taps it. Also used by tests.</summary>
        public bool TryTap(Vector2 world)
        {
            var filter = new ContactFilter2D { useTriggers = true };
            hits.Clear();
            int n = Physics2D.OverlapCircle(world, tapRadius, filter, hits);
            ITappable best = null;
            float bestScore = float.MaxValue;
            for (int i = 0; i < n; i++)
            {
                var t = hits[i].GetComponentInParent<ITappable>();
                if (t == null || !t.CanTap) continue;
                // Prefer things the finger is directly on, then the closest edge.
                float score = hits[i].OverlapPoint(world) ? -1000f + hits[i].bounds.size.sqrMagnitude
                                                           : Vector2.Distance(hits[i].ClosestPoint(world), world);
                if (score < bestScore)
                {
                    bestScore = score;
                    best = t;
                }
            }
            best?.OnTap(world);
            return best != null;
        }
    }
}
