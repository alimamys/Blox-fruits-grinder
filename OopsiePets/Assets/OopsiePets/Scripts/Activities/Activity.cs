using System;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>Shared services an activity can use. Filled in by the scene builder.</summary>
    [Serializable]
    public class ActivityContext
    {
        public Camera camera;
        public Transform stage;          // where the pet sits
        public SpriteRenderer background;
        public ProgressStars stars;
        public FingerHint hint;
    }

    /// <summary>
    /// Base for every mini-game (wash, bubbles, brush, dress-up). An activity never fails: it reports
    /// progress 0..1 and raises <see cref="Completed"/> once; the child may keep playing afterwards.
    /// </summary>
    public abstract class Activity : MonoBehaviour
    {
        public abstract ActivityKind Kind { get; }
        public Sprite background;
        [Tooltip("Pet scale on this activity's stage.")]
        public float petScale = 0.62f;

        public event Action<Activity> Completed;
        public float Progress { get; protected set; }
        public bool IsComplete { get; private set; }

        protected PetView pet;
        protected ActivityContext ctx;
        protected float idleTime;

        public virtual void Begin(PetView pet, ActivityContext ctx)
        {
            this.pet = pet;
            this.ctx = ctx;
            IsComplete = false;
            Progress = 0f;
            idleTime = 0f;
            gameObject.SetActive(true);
            if (ctx.background && background) ctx.background.sprite = background;
            if (ctx.stars) ctx.stars.ResetStars();
        }

        public virtual void End()
        {
            if (ctx?.hint) ctx.hint.Hide();
            gameObject.SetActive(false);
        }

        protected void SetProgress(float p)
        {
            Progress = Mathf.Clamp01(p);
            if (ctx.stars && ctx.stars.isActiveAndEnabled) ctx.stars.Show(Progress); // dress-up hides the stars
        }

        protected void Complete()
        {
            if (IsComplete) return;
            IsComplete = true;
            SetProgress(1f);
            if (ctx.hint) ctx.hint.Hide();
            Completed?.Invoke(this);
        }

        protected InputRouter Input => InputRouter.Instance;
        protected static AudioManager Audio => AudioManager.Instance;
        protected static FxSpawner Fx => FxSpawner.Instance;
    }
}
