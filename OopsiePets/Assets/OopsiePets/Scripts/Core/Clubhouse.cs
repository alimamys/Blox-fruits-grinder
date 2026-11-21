using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// The cozy home screen. Every pet lounges on its bed with its outfit on and reacts when tapped; tapping
    /// opens the care menu. Now and then a pet comes back muddy ("Oopsie!") and asks for a bath.
    /// The room makes space as friends join: beds are laid out for 3 to 7 pets, and the surprise gift box
    /// sits where the next friend will live.
    /// </summary>
    public class Clubhouse : MonoBehaviour
    {
        public Transform doorSpot;
        public CareMenu menu;
        public FingerHint hint;
        public FriendGift gift;
        public Sprite bedSprite;
        public Sprite[] mudSprites;

        readonly List<PetView> pets = new List<PetView>();
        readonly List<GameObject> props = new List<GameObject>();
        PetView visitor;
        Coroutine arrival, reveal, welcome;
        Layout layout;

        struct Layout
        {
            public Vector2[] spots;
            public float petScale, bedScale;
        }

        // Hand-placed arrangements on the rug for each number of beds (gift box included).
        static Layout For(int n)
        {
            if (n <= 3) return new Layout { petScale = 0.46f, bedScale = 0.72f, spots = new[] { new Vector2(-2.75f, -3.2f), new Vector2(2.75f, -3.2f), new Vector2(0f, -6.5f) } };
            // Front-row beds sit between and below the back-row beds, so nobody hides behind a friend.
            if (n == 4) return new Layout { petScale = 0.42f, bedScale = 0.62f, spots = new[] { new Vector2(-2.75f, -3.0f), new Vector2(2.75f, -3.0f), new Vector2(-1.55f, -6.95f), new Vector2(1.55f, -6.95f) } };
            if (n == 5) return new Layout { petScale = 0.38f, bedScale = 0.58f, spots = new[] { new Vector2(-3.5f, -2.9f), new Vector2(0f, -2.7f), new Vector2(3.5f, -2.9f), new Vector2(-1.75f, -6.9f), new Vector2(1.75f, -6.9f) } };
            if (n == 6) return new Layout { petScale = 0.38f, bedScale = 0.58f, spots = new[] { new Vector2(-3.5f, -2.9f), new Vector2(0f, -2.7f), new Vector2(3.5f, -2.9f), new Vector2(-3.5f, -6.9f), new Vector2(0f, -7.15f), new Vector2(3.5f, -6.9f) } };
            return new Layout { petScale = 0.34f, bedScale = 0.5f, spots = new[] { new Vector2(-3.95f, -2.9f), new Vector2(-1.32f, -2.7f), new Vector2(1.32f, -2.7f), new Vector2(3.95f, -2.9f), new Vector2(-2.65f, -6.85f), new Vector2(0f, -7.1f), new Vector2(2.65f, -6.85f) } };
        }

        public const int MaxPets = 7;

        // Pets lower on the screen are closer, so they draw in front.
        static int OrderFor(Vector2 spot) => 20 + Mathf.RoundToInt((10f - spot.y) * 2f);

        void Awake()
        {
            menu.Chosen = (p, seq) => GameFlow.Instance.StartCare(p.Definition, seq);
            if (gift)
            {
                gift.OpenRequested += OnGiftOpen;
                gift.BecameReady += _ => { if (welcome == null && arrival == null && reveal == null) welcome = StartCoroutine(PointAtGift()); };
            }
        }

        public IEnumerable<PetView> Pets => pets;
        public PetView Visitor => visitor;
        public bool Revealing => reveal != null;
        public float PetScale => layout.petScale;

        /// <summary>
        /// Rebuilds the room. If <paramref name="arrive"/> is set, that pet walks in muddy; if
        /// <paramref name="welcomed"/> is set, that new friend celebrates in its new bed.
        /// </summary>
        public void Enter(PetDefinition arrive, PetDefinition welcomed = null)
        {
            Clear();
            lastPress = Time.time;
            var db = GameFlow.Instance.database;
            var defs = new List<PetDefinition>(db.UnlockedPets());
            if (defs.Count > MaxPets) defs.RemoveRange(MaxPets, defs.Count - MaxPets);
            var next = defs.Count < MaxPets ? db.NextFriend() : null;
            layout = For(defs.Count + (next != null ? 1 : 0));

            for (int i = 0; i < defs.Count; i++)
            {
                var spot = layout.spots[i];
                MakeBed(spot, layout.bedScale);
                var anchor = new GameObject("BedSpot" + (i + 1)).transform;
                anchor.SetParent(transform, false);
                anchor.position = spot;
                props.Add(anchor.gameObject);
                var p = GameFlow.Instance.SpawnPet(defs[i], anchor, layout.petScale, true);
                p.SetSortingOrder(OrderFor(spot));
                p.Tapped += OnPetTapped;
                pets.Add(p);
            }

            if (gift)
            {
                if (next != null)
                {
                    var spot = layout.spots[defs.Count];
                    gift.Show(spot, 4.48f * layout.bedScale * 0.78f, SaveSystem.Data.giftHearts, FriendGiftRules.HeartJustEarned);
                    var group = gift.GetComponent<UnityEngine.Rendering.SortingGroup>();
                    if (group) group.sortingOrder = OrderFor(spot);
                }
                else gift.Hide();
            }
            FriendGiftRules.HeartJustEarned = false;

            if (arrive != null)
            {
                var v = pets.Find(p => p.Definition == arrive);
                if (v != null) arrival = StartCoroutine(Arrive(v));
            }
            if (welcomed != null)
            {
                var w = pets.Find(p => p.Definition == welcomed);
                if (w != null) welcome = StartCoroutine(Welcome(w));
            }
            else if (arrive == null && gift && gift.Ready) welcome = StartCoroutine(PointAtGift());
        }

        void MakeBed(Vector2 spot, float scale)
        {
            var go = new GameObject("Bed");
            go.transform.SetParent(transform, false);
            go.transform.position = (Vector3)spot + new Vector3(0f, 0.35f * scale / 0.72f, 0f);
            go.transform.localScale = Vector3.one * scale;
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = bedSprite;
            sr.sortingOrder = 5;
            go.AddComponent<BoxCollider2D>().isTrigger = true;
            go.AddComponent<ClubhouseToy>().kind = ClubhouseToy.Kind.Bed;
            props.Add(go);
        }

        public void Clear()
        {
            if (arrival != null) StopCoroutine(arrival);
            if (reveal != null) StopCoroutine(reveal);
            if (welcome != null) StopCoroutine(welcome);
            arrival = reveal = welcome = null;
            menu.HideNow();
            hint.Hide();
            foreach (var p in pets) if (p) Destroy(p.gameObject);
            pets.Clear();
            foreach (var g in props) if (g) Destroy(g);
            props.Clear();
            if (gift) gift.Hide();
            visitor = null;
        }

        void OnPetTapped(PetView p)
        {
            hint.Hide();
            if (reveal != null) return;
            if (p == visitor)
            {
                // The muddy visitor goes straight to the bath.
                GameFlow.Instance.StartCare(p.Definition, CareSession.CleanUp);
                return;
            }
            menu.Show(p);
        }

        IEnumerator Arrive(PetView p)
        {
            visitor = p;
            var bed = p.transform.parent;
            p.tappable = false;
            p.transform.SetParent(transform, true);
            // Splat some mud on so the problem is obvious without words. Mud lovers come back extra muddy.
            int splats = p.Definition.Has(PetQuirk.MudLover) ? 7 : 5;
            for (int i = 0; i < splats; i++)
            {
                bool onHead = i < 2;
                var part = onHead ? p.Rig.headRenderer : p.Rig.bodyRenderer;
                var parent = onHead ? p.Rig.headDecor : p.Rig.bodyDecor;
                var go = new GameObject("Mud");
                go.transform.SetParent(parent, false);
                go.transform.localPosition = PetDecor.RandomPointOn(part, 0.32f, 0.28f);
                var sr = go.AddComponent<SpriteRenderer>();
                sr.sprite = mudSprites[Random.Range(0, mudSprites.Length)];
                float s = part.sprite.bounds.size.x * Random.Range(0.3f, 0.38f) / sr.sprite.bounds.size.x;
                go.transform.localScale = Vector3.one * s;
                go.transform.localRotation = Quaternion.Euler(0f, 0f, Random.Range(-30f, 30f));
                sr.sortingOrder = onHead ? 60 + i : 20 + i;
            }
            Vector3 from = doorSpot.position, to = bed.position;
            p.transform.position = from;
            yield return new WaitForSeconds(0.6f);
            // Hop hop hop into the room.
            for (int h = 0; h < 4; h++)
            {
                var a = Vector3.Lerp(from, to, h / 4f);
                var b = Vector3.Lerp(from, to, (h + 1) / 4f);
                if (AudioManager.Instance) AudioManager.Instance.PlayVoice(p.Definition.voice, p.Definition.voicePitch, VoiceKind.Happy);
                yield return Ease.Tween(0.42f, k => p.transform.position = Vector3.Lerp(a, b, k) + Vector3.up * Ease.Bump(k) * 0.6f, Ease.Linear, false);
            }
            p.Animator.Play(PetReaction.Shake);
            yield return new WaitForSeconds(1.0f);
            p.Animator.Play(PetReaction.Sneeze);
            yield return new WaitForSeconds(1.2f);
            p.transform.SetParent(bed, true);
            p.Animator.SetMood(PetExpression.Surprised);
            p.tappable = true;
            hint.ShowTap(p.Rig.head);
            arrival = null;
        }

        IEnumerator PointAtGift()
        {
            yield return new WaitForSeconds(1.2f);
            if (gift && gift.Ready && !hint.Visible) hint.ShowTap(gift.lid.transform);
            welcome = null;
        }

        void OnGiftOpen(FriendGift g)
        {
            if (reveal != null || arrival != null) { g.Show(g.transform.position, g.box.bounds.size.x, SaveSystem.Data.giftHearts, false); return; }
            reveal = StartCoroutine(Reveal());
        }

        IEnumerator Reveal()
        {
            hint.Hide();
            menu.HideNow();
            yield return gift.Open();
            var friend = FriendGiftRules.OpenGift(GameFlow.Instance.database);
            if (friend == null) { reveal = null; yield break; }

            // The new friend springs out of the box, wearing the present it brought.
            Vector3 spot = gift.transform.position;
            var anchor = new GameObject("NewFriend").transform;
            anchor.SetParent(transform, false);
            anchor.position = spot;
            props.Add(anchor.gameObject);
            var p = GameFlow.Instance.SpawnPet(friend, anchor, layout.petScale, true);
            p.tappable = false;
            p.SetSortingOrder(OrderFor(spot) + 1);
            p.transform.localScale = Vector3.zero;
            AudioManager.Instance?.PlayVoice(friend.voice, friend.voicePitch, VoiceKind.Excited);
            StartCoroutine(gift.Vanish());
            float s = layout.petScale;
            yield return Ease.Tween(0.85f, k =>
            {
                p.transform.localScale = Vector3.one * s * Ease.OutBack(Mathf.Clamp01(k * 1.8f));
                p.transform.localPosition = Vector3.up * Ease.Bump(k) * 2.4f;
            }, null, false);
            p.transform.localPosition = Vector3.zero;
            var fx = FxSpawner.Instance;
            fx?.Confetti(p.Rig.head.position, 30);
            fx?.Hearts(p.Rig.head.position, 6);
            p.Animator.Play(PetReaction.Celebrate);
            // Everyone else cheers too.
            foreach (var other in pets) if (other) other.Animator.Play(Random.value < 0.5f ? PetReaction.Jump : PetReaction.Bounce);
            yield return new WaitForSeconds(2.6f);
            reveal = null;
            // The room rearranges to give the new friend its own bed (runs on GameFlow: this rebuild clears us).
            GameFlow.Instance.StartCoroutine(GameFlow.Instance.RebuildClubhouse(friend));
        }

        IEnumerator Welcome(PetView p)
        {
            yield return new WaitForSeconds(0.5f);
            if (!p) yield break;
            p.Animator.Play(PetReaction.Celebrate);
            FxSpawner.Instance?.Hearts(p.Rig.head.position, 4);
            yield return new WaitForSeconds(1.6f);
            if (p && !hint.Visible) hint.ShowTap(p.Rig.head);
            welcome = null;
        }

        void Start()
        {
            if (InputRouter.Instance) InputRouter.Instance.PointerDown += OnAnyPress;
        }

        void OnDestroy()
        {
            if (InputRouter.Instance) InputRouter.Instance.PointerDown -= OnAnyPress;
            if (gift) gift.OpenRequested -= OnGiftOpen;
        }

        // Tapping anywhere else closes the care menu. The router taps pets before raising this
        // event, so a tap that just opened the menu is recognised and left alone.
        void OnAnyPress(Vector2 world)
        {
            lastPress = Time.time;
            if (isActiveAndEnabled && menu.Visible && !menu.ShownThisFrame) menu.HideNow();
        }

        float lastPress;
        [Tooltip("Seconds without a touch before the hand invites a tap on a pet (there is always something to do).")]
        public float idleInvite = 9f;

        void Update()
        {
            if (reveal != null || hint.Visible || menu.Visible) return;
            if (Time.frameCount % 240 == 0)
            {
                // A bouncing hand keeps inviting a tap: first the muddy visitor, then a full gift box.
                if (visitor && visitor.tappable) { hint.ShowTap(visitor.Rig.head); return; }
                if (!visitor && gift && gift.isActiveAndEnabled && gift.Ready) { hint.ShowTap(gift.lid.transform); return; }
            }
            // Nothing waiting? After a quiet moment, point at a pet: tapping it opens "let's play outside".
            if (!visitor && arrival == null && welcome == null && (!gift || !gift.Ready) && pets.Count > 0
                && Time.time - lastPress > idleInvite)
            {
                lastPress = Time.time;
                var p = pets[Random.Range(0, pets.Count)];
                if (p) hint.ShowTap(p.Rig.head);
            }
        }
    }
}
