using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// One pet's garden toy. Taps are forgiving: almost anywhere on the lawn works, because the toy decides
    /// what a tap means (throw, push, bounce...). After each round it reports to the activity.
    /// </summary>
    public abstract class PlayToy : MonoBehaviour
    {
        [Tooltip("Where the pet stands when play begins.")]
        public Transform petStart;

        /// <summary>How many rounds of play make the pet muddy enough for a bath.</summary>
        public abstract int Rounds { get; }
        /// <summary>What the bouncing hand points at when the child waits.</summary>
        public abstract Transform HintTarget { get; }

        public bool Busy { get; protected set; }

        protected OutdoorActivity act;
        protected PetView pet;
        protected bool stopped;
        protected int round;

        protected static AudioManager Audio => AudioManager.Instance;
        protected static FxSpawner Fx => FxSpawner.Instance;

        // The lawn the pets play on (world units).
        public static readonly Vector2 LawnMin = new Vector2(-4.2f, -8.4f);
        public static readonly Vector2 LawnMax = new Vector2(4.2f, -2.6f);

        public static Vector3 OnLawn(Vector3 p) =>
            new Vector3(Mathf.Clamp(p.x, LawnMin.x, LawnMax.x), Mathf.Clamp(p.y, LawnMin.y, LawnMax.y), 0f);

        public void Begin(OutdoorActivity activity)
        {
            act = activity;
            pet = activity.Pet;
            stopped = false;
            Busy = false;
            round = 0;
            gameObject.SetActive(true);
            if (petStart) pet.transform.position = petStart.position;
            var input = InputRouter.Instance;
            if (input)
            {
                input.PointerDown += OnDown;
                input.PointerDrag += OnDrag;
                input.PointerUp += OnUp;
            }
            Setup();
        }

        public void End()
        {
            var input = InputRouter.Instance;
            if (input)
            {
                input.PointerDown -= OnDown;
                input.PointerDrag -= OnDrag;
                input.PointerUp -= OnUp;
            }
            StopAllCoroutines();
            Busy = false;
            Teardown();
            gameObject.SetActive(false);
        }

        /// <summary>No more input once the pet is muddy enough.</summary>
        public void Stop() => stopped = true;

        public virtual void ShowHint()
        {
            if (act.Ctx.hint && HintTarget) act.Ctx.hint.ShowTap(HintTarget);
        }

        protected virtual void Setup() { }
        protected virtual void Teardown() { }
        protected virtual void Down(Vector2 p) { }
        protected virtual void Drag(Vector2 p, Vector2 delta) { }
        protected virtual void Up(Vector2 p) { }

        void OnDown(Vector2 p)
        {
            if (stopped) return;
            act.TouchIdle();
            if (act.Ctx.hint) act.Ctx.hint.Hide();
            Down(p);
        }

        void OnDrag(Vector2 p, Vector2 d)
        {
            if (stopped) return;
            act.TouchIdle();
            Drag(p, d);
        }

        void OnUp(Vector2 p)
        {
            if (!stopped) Up(p);
        }

        /// <summary>Finishes a round: counts it and lets the activity decide whether play is over.</summary>
        protected void Done()
        {
            round++;
            Busy = false;
            act.RoundDone();
        }
    }
}
