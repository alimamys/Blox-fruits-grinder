using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace OopsiePets
{
    /// <summary>
    /// The cozy home screen. Every pet lounges on its bed, clean, with its outfit on, and reacts when tapped;
    /// tapping opens the care menu. One pet at a time is bored and wants to go out and play: a thought
    /// bubble shows its toy and it yawns; tapping it goes straight to the garden. (Pets only get muddy by
    /// playing; one that left the garden early comes home muddy and asks for a bath.)
    /// All eleven friends always live here. Friends that can't be played with yet nap behind a padlock
    /// (tapping one only makes it stir: there is no purchase prompt for children). In the full version,
    /// friends that are earned by playing wear a star instead of a padlock, so nobody thinks they must be
    /// bought again: the big star fills with gold, and a row of small stars (one per friend they are
    /// waiting for) turns gold as those friends get their stickers. When a lock opens, it pops off with
    /// confetti.
    /// </summary>
    public class Clubhouse : MonoBehaviour
    {
        public Transform doorSpot;
        public CareMenu menu;
        public FingerHint hint;
        public Sprite bedSprite;
        [Tooltip("Thought bubble for the pet that wants to play (its toy is drawn inside).")]
        public Sprite thoughtBubble;
        public Sprite[] mudSprites;

        [Header("Locked friends")]
        public Sprite padlockSprite;
        [Tooltip("Full version only: the star lock for friends earned by playing (same outline, empty and gold).")]
        public Sprite starEmpty;
        public Sprite starFull;
        [Tooltip("The grown-ups' gear button: it gives a little wiggle when a child taps a friend that needs the full version.")]
        public RectTransform settingsButton;
        public Color lockedTint = new Color(0.86f, 0.84f, 0.92f, 1f);

        readonly List<PetView> pets = new List<PetView>();
        readonly List<GameObject> props = new List<GameObject>();
        readonly Dictionary<PetView, Lock> locks = new Dictionary<PetView, Lock>();
        PetView visitor;
        WantsToPlay bored;
        Coroutine arrival, welcome, gearWiggle;
        Layout layout;

        class Lock
        {
            public Transform padlock;   // the padlock, or the star for friends earned by playing
            public List<SpriteRenderer> pips = new List<SpriteRenderer>();
            public List<SpriteRenderer> emptyPips = new List<SpriteRenderer>();
            public Vector3 padScale, pipScale;
        }

        readonly List<Sprite> madeSprites = new List<Sprite>();

        struct Layout
        {
            public Vector2[] spots;
            public float petScale, bedScale;
        }

        // Hand-placed arrangements on the rug. Up to 7 pets use the roomy layouts; a full house of 11 sits in
        // three rows (4, 4 and 3), front rows a little apart so nobody hides behind a friend.
        static Layout For(int n)
        {
            if (n <= 3) return new Layout { petScale = 0.46f, bedScale = 0.72f, spots = new[] { new Vector2(-2.75f, -3.2f), new Vector2(2.75f, -3.2f), new Vector2(0f, -6.5f) } };
            if (n == 4) return new Layout { petScale = 0.42f, bedScale = 0.62f, spots = new[] { new Vector2(-2.75f, -3.0f), new Vector2(2.75f, -3.0f), new Vector2(-1.55f, -6.95f), new Vector2(1.55f, -6.95f) } };
            if (n <= 6) return new Layout { petScale = 0.38f, bedScale = 0.58f, spots = new[] { new Vector2(-3.5f, -2.9f), new Vector2(0f, -2.7f), new Vector2(3.5f, -2.9f), new Vector2(-3.5f, -6.9f), new Vector2(0f, -7.15f), new Vector2(3.5f, -6.9f) } };
            if (n == 7) return new Layout { petScale = 0.34f, bedScale = 0.5f, spots = new[] { new Vector2(-3.95f, -2.9f), new Vector2(-1.32f, -2.7f), new Vector2(1.32f, -2.7f), new Vector2(3.95f, -2.9f), new Vector2(-2.65f, -6.85f), new Vector2(0f, -7.1f), new Vector2(2.65f, -6.85f) } };
            var spots = new List<Vector2>();
            float[] rows = { -1.45f, -4.6f, -7.75f };
            int left = n;
            for (int r = 0; r < 3 && left > 0; r++)
            {
                int inRow = Mathf.Min(r < 2 ? 4 : 5, left);
                float gap = inRow >= 4 ? 2.62f : 2.75f;
                for (int i = 0; i < inRow; i++) spots.Add(new Vector2((i - (inRow - 1) / 2f) * gap, rows[r] + (inRow >= 4 && (i == 0 || i == inRow - 1) ? -0.12f : 0f)));
                left -= inRow;
            }
            return new Layout { petScale = 0.3f, bedScale = 0.44f, spots = spots.ToArray() };
        }

        public const int MaxPets = 13;

        // Pets lower on the screen are closer, so they draw in front.
        static int OrderFor(Vector2 spot) => 20 + Mathf.RoundToInt((10f - spot.y) * 2f);

        void Awake()
        {
            menu.Chosen = (p, seq) => GameFlow.Instance.StartCare(p.Definition, seq);
        }

        public IEnumerable<PetView> Pets => pets;
        public PetView Visitor => visitor;
        /// <summary>The pet showing the "let's go play!" bubble.</summary>
        public PetView Bored => bored ? bored.Pet : null;
        public float PetScale => layout.petScale;
        public bool IsLocked(PetView p) => p && locks.ContainsKey(p);
        public bool Celebrating => welcome != null;

        ContentDatabase Db => GameFlow.Instance.database;

        /// <summary>
        /// Rebuilds the room. If <paramref name="arrive"/> is set, that pet walks in muddy. Friends whose
        /// padlock has just opened celebrate (the first of them is the one that wants to play).
        /// </summary>
        public void Enter(PetDefinition arrive, PetDefinition welcomed = null)
        {
            Clear();
            lastPress = Time.time;
            var db = Db;
            var defs = new List<PetDefinition>(db.AllPets());
            if (defs.Count > MaxPets) defs.RemoveRange(MaxPets, defs.Count - MaxPets);
            layout = For(defs.Count);

            // Padlocks that open now (a friend became playable since the last visit) celebrate once.
            var save = SaveSystem.Data;
            save.celebrated.RemoveAll(id => { var d = db.Pet(id); return d == null || !db.IsPlayable(d); });
            var opened = new List<PetView>();

            for (int i = 0; i < defs.Count; i++)
            {
                var def = defs[i];
                var spot = layout.spots[i];
                MakeBed(spot, layout.bedScale);
                var anchor = new GameObject("BedSpot" + (i + 1)).transform;
                anchor.SetParent(transform, false);
                anchor.position = spot;
                props.Add(anchor.gameObject);
                var p = GameFlow.Instance.SpawnPet(def, anchor, layout.petScale, true);
                p.SetSortingOrder(OrderFor(spot));
                p.Tapped += OnPetTapped;
                pets.Add(p);
                bool playable = db.IsPlayable(def);
                if (!playable) LockUp(p, spot);
                else if (def.access != PetAccess.Free && !save.celebrated.Contains(def.id))
                {
                    save.celebrated.Add(def.id);
                    LockUp(p, spot); // shown locked for a moment, then the padlock pops open
                    opened.Add(p);
                }
            }
            SaveSystem.Save();

            if (arrive != null)
            {
                var v = pets.Find(p => p.Definition == arrive);
                if (v != null && !IsLocked(v)) arrival = StartCoroutine(Arrive(v));
            }

            // One pet wants to go out and play: a friend that just joined first, then whoever has played least.
            if (welcomed == null && opened.Count > 0) welcomed = opened[0].Definition;
            var b = PickBored(welcomed, arrive, opened);
            if (b && thoughtBubble && opened.Count == 0) bored = WantsToPlay.Attach(b, thoughtBubble, 6.2f * layout.petScale);

            if (opened.Count > 0) welcome = StartCoroutine(OpenLocks(opened));
            else if (arrive == null && bored) welcome = StartCoroutine(PointAtBored(2.5f));
        }

        float PipSize => 0.98f * layout.petScale;

        void LockUp(PetView p, Vector2 spot)
        {
            p.locked = true;
            p.Animator.SetMood(PetExpression.Asleep);
            foreach (var sr in p.GetComponentsInChildren<SpriteRenderer>()) sr.color *= lockedTint;
            var l = new Lock();
            // Full version: a friend that is earned by playing gets a star, not a padlock (nothing more to buy).
            var (have, need) = Db.Progress(p.Definition);
            bool earnedByPlay = Entitlements.FullVersion && need > 0 && starEmpty && starFull;
            var sprite = earnedByPlay ? starEmpty : padlockSprite;
            // The lock sits on the pet's tummy, where it is easy to see.
            var pad = new GameObject(earnedByPlay ? "StarLock" : "Padlock").AddComponent<SpriteRenderer>();
            pad.transform.SetParent(transform, false);
            pad.sprite = sprite;
            pad.sortingOrder = OrderFor(spot) * 10 + 400;
            float size = (earnedByPlay ? 3.3f : 3.0f) * layout.petScale;
            float w = sprite ? sprite.bounds.size.x : 1f;
            pad.transform.localScale = Vector3.one * size / Mathf.Max(0.01f, w);
            pad.transform.position = (Vector3)spot + new Vector3(0.05f, 2.25f * layout.petScale, 0f);
            l.padlock = pad.transform;
            l.padScale = pad.transform.localScale;
            props.Add(pad.gameObject);
            if (earnedByPlay)
            {
                // The big star fills with gold from the bottom, one step per friend completed.
                if (have > 0) AddStarFill(pad, have / (float)need);
                // Small stars underneath: gold for each friend already completed.
                int perRow = need > 6 ? 5 : need;
                float gap = 1.2f * layout.petScale;
                for (int i = 0; i < need; i++)
                {
                    int row = i / perRow, col = i % perRow;
                    int inRow = Mathf.Min(perRow, need - row * perRow);
                    var pip = new GameObject("ProgressStar").AddComponent<SpriteRenderer>();
                    pip.transform.SetParent(transform, false);
                    bool done = i < have;
                    pip.sprite = done ? starFull : starEmpty;
                    pip.sortingOrder = pad.sortingOrder + 2;
                    l.pipScale = Vector3.one * PipSize * 1.15f / Mathf.Max(0.01f, starFull.bounds.size.x);
                    pip.transform.localScale = l.pipScale;
                    pip.transform.position = (Vector3)spot + new Vector3((col - (inRow - 1) / 2f) * gap, 0.6f * layout.petScale - row * gap, 0f);
                    l.pips.Add(pip);
                    if (!done) l.emptyPips.Add(pip);
                    props.Add(pip.gameObject);
                }
            }
            locks[p] = l;
        }

        // Height (share of the star sprite) below which the given share of the star's AREA lies, in steps
        // of 10% (measured from lock_star_full.png). Filling by area means 4 of 6 friends looks two-thirds
        // gold, not nearly full (most of a star's area is in its lower half).
        static readonly float[] StarFillHeight = { 0f, 0.176f, 0.25f, 0.328f, 0.406f, 0.469f, 0.523f, 0.574f, 0.617f, 0.695f, 0.965f };

        static float FillHeight(float fill)
        {
            float x = Mathf.Clamp01(fill) * 10f;
            int i = Mathf.Min(9, Mathf.FloorToInt(x));
            return Mathf.Lerp(StarFillHeight[i], StarFillHeight[i + 1], x - i);
        }

        // Gold fill for the star lock: the bottom part of the gold star, cut to the fill level, laid over
        // the empty star (both sprites share one outline).
        void AddStarFill(SpriteRenderer star, float fill)
        {
            var r = starFull.rect;
            float h = FillHeight(fill) * r.height;
            if (h < 1f) return;
            var part = Sprite.Create(starFull.texture, new Rect(r.x, r.y, r.width, h), new Vector2(0.5f, 0f), starFull.pixelsPerUnit, 0, SpriteMeshType.FullRect);
            part.name = "StarFill";
            madeSprites.Add(part);
            var go = new GameObject("StarFill").AddComponent<SpriteRenderer>();
            go.transform.SetParent(star.transform, false);
            go.transform.localPosition = new Vector3(0f, -r.height / 2f / starFull.pixelsPerUnit, 0f);
            go.sprite = part;
            go.sortingOrder = star.sortingOrder + 1;
        }

        IEnumerator OpenLocks(List<PetView> opened)
        {
            yield return new WaitForSeconds(0.9f);
            var fx = FxSpawner.Instance;
            var a = AudioManager.Instance;
            foreach (var p in opened)
            {
                if (!p || !locks.TryGetValue(p, out var l)) continue;
                // Rattle, rattle... pop! The padlock flies off and the friend wakes up to cheer.
                for (int i = 0; i < 3; i++)
                {
                    a?.Play(Sfx.Tap, 0.5f, 1.1f + i * 0.15f);
                    float dir = i % 2 == 0 ? 1f : -1f;
                    yield return Ease.Tween(0.14f, k => l.padlock.localRotation = Quaternion.Euler(0f, 0f, Ease.Bump(k) * 14f * dir), null, false);
                }
                a?.Play(Sfx.Pop, 0.8f, 0.9f);
                a?.Play(Sfx.Celebrate, 0.6f);
                fx?.Confetti(l.padlock.position, 30);
                fx?.Sparkles(l.padlock.position, 10, 0.8f);
                foreach (var pip in l.pips) if (pip) pip.gameObject.SetActive(false);
                var from = l.padlock.position;
                var pad = l.padlock;
                var srs = pad.GetComponentsInChildren<SpriteRenderer>();
                StartCoroutine(Ease.Tween(0.6f, k =>
                {
                    if (!pad) return;
                    pad.position = from + new Vector3(1.4f * k, 2.2f * Ease.Bump(k * 0.7f), 0f);
                    pad.localRotation = Quaternion.Euler(0f, 0f, -200f * k);
                    foreach (var sr in srs) if (sr) sr.color = new Color(1f, 1f, 1f, 1f - k);
                }, null, false));
                Unlock(p);
                p.Animator.Play(PetReaction.Celebrate);
                fx?.Hearts(p.Rig.head.position, 4);
                AudioManager.Instance?.PlayVoice(p.Definition.voice, p.Definition.voicePitch, VoiceKind.Excited);
                yield return new WaitForSeconds(1.0f);
            }
            yield return new WaitForSeconds(0.6f);
            // The first new friend wants to go and play right away.
            var first = opened.Find(x => x);
            if (first && thoughtBubble && !bored) bored = WantsToPlay.Attach(first, thoughtBubble, 6.2f * layout.petScale);
            if (first && !hint.Visible && !menu.Visible) hint.ShowTap(first.Rig.head);
            welcome = null;
        }

        void Unlock(PetView p)
        {
            if (!locks.TryGetValue(p, out var l)) return;
            locks.Remove(p);
            p.locked = false;
            p.Animator.SetMood(PetExpression.Neutral);
            foreach (var sr in p.GetComponentsInChildren<SpriteRenderer>())
            {
                var c = sr.color;
                sr.color = new Color(c.r / lockedTint.r, c.g / lockedTint.g, c.b / lockedTint.b, c.a);
            }
        }

        PetView PickBored(PetDefinition welcomed, PetDefinition muddy, List<PetView> skip)
        {
            if (welcomed != null)
            {
                var w = pets.Find(p => p.Definition == welcomed);
                if (w) return w;
            }
            var last = GameFlow.Instance.LastCared;
            int playable = 0;
            foreach (var p in pets) if (!IsLocked(p)) playable++;
            PetView best = null;
            int bestCount = int.MaxValue;
            foreach (var p in pets)
            {
                if (IsLocked(p) || skip.Contains(p)) continue;
                if (p.Definition == muddy) continue;
                if (p.Definition == last && playable > 2) continue; // someone else's turn
                int c = SaveSystem.Data.Pet(p.Definition.id).careCount;
                if (c < bestCount || (c == bestCount && Random.value < 0.4f)) { best = p; bestCount = c; }
            }
            return best;
        }

        IEnumerator PointAtBored(float delay)
        {
            yield return new WaitForSeconds(delay);
            if (bored && bored.Pet && !hint.Visible && !menu.Visible && Time.time - lastPress >= delay - 0.1f) hint.ShowTap(bored.Pet.Rig.head);
            welcome = null;
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
            if (welcome != null) StopCoroutine(welcome);
            arrival = welcome = null;
            locks.Clear();
            foreach (var sp in madeSprites) if (sp) Destroy(sp);
            madeSprites.Clear();
            menu.HideNow();
            hint.Hide();
            foreach (var p in pets) if (p) Destroy(p.gameObject);
            pets.Clear();
            foreach (var g in props) if (g) Destroy(g);
            props.Clear();
            visitor = null;
            bored = null; // destroyed with its pet
        }

        void OnPetTapped(PetView p)
        {
            hint.Hide();
            if (locks.TryGetValue(p, out var l)) { StartCoroutine(Stir(p, l)); return; }
            if (p == visitor)
            {
                // The muddy visitor goes straight to the bath.
                GameFlow.Instance.StartCare(p.Definition, CareSession.CleanUp);
                return;
            }
            if (bored && p == bored.Pet)
            {
                // The bored pet can't wait: straight out to the garden with its toy.
                bored.Pop();
                bored = null;
                GameFlow.Instance.StartCare(p.Definition, CareSession.FullCare);
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

        // A napping friend that can't be played with yet: it stirs, the padlock jiggles, and its empty dots
        // blink (there are friends to finish first). If the full version is needed, the grown-ups' gear
        // button gives a small wiggle; nothing on screen asks the child to buy anything.
        IEnumerator Stir(PetView p, Lock l)
        {
            AudioManager.Instance?.Play(Sfx.Tap, 0.5f, 0.8f);
            if (!Entitlements.FullVersion && settingsButton && gearWiggle == null) gearWiggle = StartCoroutine(WiggleGear());
            var pad = l.padlock;
            yield return Ease.Tween(0.45f, k =>
            {
                if (pad) pad.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(k * Mathf.PI * 4f) * 12f * (1f - k));
                if (pad) pad.localScale = l.padScale * (1f + 0.15f * Ease.Bump(k));
                foreach (var pip in l.emptyPips)
                    if (pip) pip.transform.localScale = l.pipScale * (1f + 0.5f * Ease.Bump(k));
            }, null, false);
            if (p && p.locked) p.Animator.SetMood(PetExpression.Asleep);
        }

        IEnumerator WiggleGear()
        {
            var t = settingsButton;
            var s0 = t.localScale;
            yield return Ease.Tween(0.6f, k =>
            {
                t.localRotation = Quaternion.Euler(0f, 0f, Mathf.Sin(k * Mathf.PI * 4f) * 14f * (1f - k));
                t.localScale = s0 * (1f + 0.12f * Ease.Bump(k));
            }, null, false);
            t.localRotation = Quaternion.identity;
            t.localScale = s0;
            yield return new WaitForSeconds(1f);
            gearWiggle = null;
        }

        void Start()
        {
            if (InputRouter.Instance) InputRouter.Instance.PointerDown += OnAnyPress;
        }

        void OnDestroy()
        {
            if (InputRouter.Instance) InputRouter.Instance.PointerDown -= OnAnyPress;
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
            if (welcome != null || hint.Visible || menu.Visible) return;
            if (Time.frameCount % 240 == 0 && visitor && visitor.tappable) { hint.ShowTap(visitor.Rig.head); return; }
            // Nothing tapped for a while? Point at the pet that wants to play (or any friend to play with).
            if (!visitor && arrival == null && Time.time - lastPress > idleInvite)
            {
                lastPress = Time.time;
                PetView p = bored ? bored.Pet : null;
                if (!p)
                {
                    var free = pets.FindAll(x => x && !IsLocked(x));
                    if (free.Count > 0) p = free[Random.Range(0, free.Count)];
                }
                if (p) hint.ShowTap(p.Rig.head);
            }
        }
    }
}
