using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OopsiePets;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

// Play-mode test driver. Sends pointer down/drag/up events through the game's InputRouter (the same
// handler a finger or mouse reaches) and clicks UI buttons through the EventSystem.
// Run with: unity command script run --file AgentScripts/PlayTest.cs --entry PlayTest.<Method>
public static class PlayTest
{
    static Camera Cam => Camera.main;
    static InputRouter Router => InputRouter.Instance;

    static PointerEventData Ev(Vector3 world)
    {
        var screen = RectTransformUtility.WorldToScreenPoint(Cam, world);
        return new PointerEventData(EventSystem.current) { position = screen, pointerId = -1, button = PointerEventData.InputButton.Left };
    }

    static Task Frames(int ms) => Task.Delay(ms);

    public static string State()
    {
        var f = GameFlow.Instance;
        var sb = new StringBuilder();
        sb.Append($"screen={f.Current} busy={f.Busy}");
        if (f.Current == GameFlow.Screen.Care && f.care.Current)
            sb.Append($" activity={f.care.Current.Kind} progress={f.care.Current.Progress:0.00} complete={f.care.Current.IsComplete} next={f.care.nextButton.gameObject.activeInHierarchy}");
        if (f.Current == GameFlow.Screen.Clubhouse)
            sb.Append($" pets=[{string.Join(",", f.clubhouse.Pets.Select(p => p.Definition.id + (f.clubhouse.IsLocked(p) ? "(locked)" : p.tappable ? "" : "(arriving)")))}] visitor={(f.clubhouse.Visitor ? f.clubhouse.Visitor.Definition.id : "none")}");
        if (f.Current == GameFlow.Screen.Clubhouse) sb.Append($" bored={(f.clubhouse.Bored ? f.clubhouse.Bored.Definition.id : "none")}");
        sb.Append($" full={Entitlements.FullVersion} playable=[{string.Join(",", f.database.PlayablePets().Select(p => p.id))}]");
        sb.Append($" stickers=[{string.Join(",", SaveSystem.Data.stickers)}] frame={Time.frameCount}");
        return sb.ToString();
    }

    public static async Task<string> Tap(float x, float y)
    {
        var p = new Vector3(x, y, 0f);
        Router.OnPointerDown(Ev(p));
        await Frames(80);
        Router.OnPointerUp(Ev(p));
        await Frames(300);
        return State();
    }

    public static async Task<string> TapPet(string id)
    {
        var pet = Object.FindObjectsByType<PetView>(FindObjectsSortMode.None).FirstOrDefault(p => p.Definition && p.Definition.id == id);
        if (!pet) return "no pet " + id;
        var at = pet.Rig.head.position;
        return $"tapped {id} at {at}: " + await Tap(at.x, at.y);
    }

    public static async Task<string> Click(string path)
    {
        var go = GameObject.Find(path);
        if (!go) return "no object " + path;
        if (!go.activeInHierarchy) return "inactive " + path;
        var ev = new PointerEventData(EventSystem.current) { button = PointerEventData.InputButton.Left };
        ExecuteEvents.Execute(go, ev, ExecuteEvents.pointerDownHandler);
        ExecuteEvents.Execute(go, ev, ExecuteEvents.pointerUpHandler);
        ExecuteEvents.Execute(go, ev, ExecuteEvents.pointerClickHandler);
        await Frames(500);
        return $"clicked {path}: " + State();
    }

    public static async Task<string> Drag(Vector3 from, Vector3 to, int steps, int msPerStep)
    {
        Router.OnPointerDown(Ev(from));
        for (int i = 1; i <= steps; i++)
        {
            Router.OnDrag(Ev(Vector3.Lerp(from, to, i / (float)steps)));
            await Frames(msPerStep);
        }
        Router.OnPointerUp(Ev(to));
        return State();
    }

    /// <summary>Scrubs back and forth over every remaining mud splat, like a child rubbing the sponge.</summary>
    public static async Task<string> Scrub(int rounds)
    {
        var sb = new StringBuilder();
        for (int r = 0; r < rounds; r++)
        {
            var spots = Object.FindObjectsByType<MudSpot>(FindObjectsSortMode.None).Where(s => !s.Cleared).ToList();
            if (spots.Count == 0) break;
            foreach (var s in spots.Take(3))
            {
                var c = s.transform.position;
                // the sponge sits a little above the finger; aim the finger just below the splat
                var a = c + new Vector3(-0.7f, -0.35f, 0f);
                var b = c + new Vector3(0.7f, -0.35f, 0f);
                Router.OnPointerDown(Ev(a));
                for (int k = 0; k < 4; k++)
                    for (int i = 1; i <= 8; i++)
                    {
                        Router.OnDrag(Ev(Vector3.Lerp(k % 2 == 0 ? a : b, k % 2 == 0 ? b : a, i / 8f)));
                        await Frames(16);
                    }
                Router.OnPointerUp(Ev(b));
            }
            sb.AppendLine($"round {r}: {State()}");
        }
        return sb.ToString();
    }

    public static async Task<string> PopBubbles(int n)
    {
        int popped = 0;
        for (int i = 0; i < n * 3 && popped < n; i++)
        {
            var b = Object.FindObjectsByType<Bubble>(FindObjectsSortMode.None).Where(x => x.CanTap).OrderBy(x => x.transform.position.y).FirstOrDefault();
            if (!b) { await Frames(300); continue; }
            var p = b.transform.position;
            Router.OnPointerDown(Ev(p));
            Router.OnPointerUp(Ev(p));
            popped++;
            await Frames(250);
        }
        return $"popped {popped}: {State()}";
    }

    public static async Task<string> BrushAll(int rounds)
    {
        var sb = new StringBuilder();
        for (int r = 0; r < rounds; r++)
        {
            var tufts = Object.FindObjectsByType<FurTuft>(FindObjectsSortMode.None).Where(t => !t.Settled).ToList();
            if (tufts.Count == 0) break;
            foreach (var t in tufts)
            {
                var c = t.transform.position;
                var a = c + new Vector3(-0.8f, -0.25f, 0f);
                var b = c + new Vector3(0.6f, -0.25f, 0f);
                Router.OnPointerDown(Ev(a));
                for (int k = 0; k < 3; k++)
                    for (int i = 1; i <= 8; i++)
                    {
                        Router.OnDrag(Ev(Vector3.Lerp(k % 2 == 0 ? a : b, k % 2 == 0 ? b : a, i / 8f)));
                        await Frames(16);
                    }
                Router.OnPointerUp(Ev(b));
            }
            sb.AppendLine($"round {r}: {State()}");
        }
        return sb.ToString();
    }

    public static async Task<string> Wear(string accessoryId)
    {
        var b = Object.FindObjectsByType<AccessoryButton>(FindObjectsSortMode.None).FirstOrDefault(x => x.Accessory && x.Accessory.id == accessoryId);
        if (!b) return "no button " + accessoryId;
        var ev = new PointerEventData(EventSystem.current) { button = PointerEventData.InputButton.Left };
        ExecuteEvents.Execute(b.gameObject, ev, ExecuteEvents.pointerClickHandler);
        await Frames(700);
        var pet = GameFlow.Instance.care.Pet;
        return $"wore {accessoryId}; worn=[{string.Join(",", pet.Rig.AllWorn().Select(a => a.id))}]";
    }

    public static string Save() => System.IO.File.Exists(Application.persistentDataPath + "/oopsiepets_save.json")
        ? System.IO.File.ReadAllText(Application.persistentDataPath + "/oopsiepets_save.json")
        : "no save file";

    /// <summary>Test switch: full version on/off (same as the parent settings button), then rebuild the room.</summary>
    public static string SetFull(bool on)
    {
        Entitlements.SetFullVersionForTesting(on);
        GameFlow.Instance.RefreshClubhouse();
        return State();
    }

    /// <summary>Test shortcut: marks pets as completed (gives them their stickers), e.g. "puppy,kitten".</summary>
    public static string Complete(string ids)
    {
        var db = GameFlow.Instance.database;
        foreach (var id in ids.Split(','))
        {
            var p = db.Pet(id.Trim());
            if (p && p.sticker && !SaveSystem.Data.stickers.Contains(p.sticker.id)) SaveSystem.Data.stickers.Add(p.sticker.id);
            if (p) SaveSystem.Data.Pet(p.id).completed = true;
        }
        SaveSystem.Save();
        GameFlow.Instance.RefreshClubhouse();
        return State();
    }

    /// <summary>Starts a visit directly (seq: full, cleanup, bath, grooming).</summary>
    public static async Task<string> Visit(string id, string seq)
    {
        var def = GameFlow.Instance.database.Pet(id);
        var s = seq == "bath" ? CareSession.Bath : seq == "grooming" ? CareSession.Grooming : seq == "cleanup" ? CareSession.CleanUp : CareSession.FullCare;
        GameFlow.Instance.StartCare(def, s);
        await Frames(2500);
        return State();
    }

    public static async Task<string> Next()
    {
        var b = GameFlow.Instance.care.nextButton;
        for (int w = 0; w < 60 && !b.gameObject.activeInHierarchy; w++) await Frames(100);
        if (!b.gameObject.activeInHierarchy) return "no next button: " + State();
        b.onClick.Invoke();
        await Frames(1800);
        return State();
    }

    /// <summary>
    /// One complete visit for a pet, the way the menu's big "play" button starts it: garden, every bath and
    /// grooming step, dress-up, sticker, home. Screenshots go to <paramref name="shots"/> (prefix). Reports
    /// each step and which sticker the reward showed.
    /// </summary>
    public static async Task<string> FullVisit(string id, string shots)
    {
        var f = GameFlow.Instance;
        var def = f.database.Pet(id);
        if (!f.database.IsPlayable(def)) return id + " is not playable: " + State();
        var sb = new StringBuilder(id + ": ");
        var before = new System.Collections.Generic.List<string>(SaveSystem.Data.stickers);
        f.StartCare(def, CareSession.FullCare);
        await Frames(2600);
        string Kind() => f.care.Current ? f.care.Current.Kind.ToString() : "none";
        void Shot(string name) => ScreenCapture.CaptureScreenshot($"{shots}_{id}_{name}.png");
        for (int step = 0; step < 12 && f.Current == GameFlow.Screen.Care; step++)
        {
            var k = f.care.Current ? f.care.Current.Kind : (ActivityKind)(-1);
            string r = k switch
            {
                ActivityKind.Outdoor => await PlayOutside(24),
                ActivityKind.Shampoo => await Shampoo(10),
                ActivityKind.Wash => await Scrub(12),
                ActivityKind.Bubbles => await PopBubbles(16),
                ActivityKind.Rinse => await Rinse(8),
                ActivityKind.Dry => await DryOff(14),
                ActivityKind.Brush => await BrushAll(12),
                ActivityKind.Teeth => await BrushTeeth(10),
                _ => "",
            };
            if (k == ActivityKind.Outdoor || k == ActivityKind.Teeth || k == ActivityKind.Rinse) Shot(k.ToString());
            if (k == ActivityKind.DressUp)
            {
                await Frames(800);
                Shot("DressUp");
                var done = GameObject.Find("UI/CareUI/Safe/DressTray/DoneButton");
                if (done) done.GetComponent<UnityEngine.UI.Button>().onClick.Invoke();
                await Frames(4500);
                var rp = f.care.reward;
                string shown = rp.sticker && rp.sticker.sprite ? rp.sticker.sprite.name : "none";
                Shot("Reward");
                sb.Append($"DressUp ok | reward sticker={shown} own={(def.sticker ? def.sticker.sprite.name : "none")} ");
                var home = GameObject.Find("UI/Reward/HomeButton");
                if (home) home.GetComponent<UnityEngine.UI.Button>().onClick.Invoke();
                await Frames(3500);
                break;
            }
            // Some steps end with a little show first (the lamb's fluffy poof, a shake): give it time.
            for (int w = 0; w < 60 && f.care.Current && !f.care.Current.IsComplete; w++) await Frames(100);
            bool ok = f.care.Current && f.care.Current.IsComplete;
            sb.Append($"{k}{(ok ? "" : "(NOT COMPLETE)")} ");
            if (!ok) return sb + " | stopped: " + State();
            await Next();
        }
        var gained = SaveSystem.Data.stickers.Where(s => !before.Contains(s));
        sb.Append($"| new stickers=[{string.Join(",", gained)}] completed={ContentDatabase.IsCompleted(def)} screen={f.Current}");
        return sb.ToString();
    }

    public static string Lock(string id)
    {
        var c = GameFlow.Instance.clubhouse;
        var p = c.Pets.FirstOrDefault(x => x.Definition.id == id);
        if (!p) return "no pet " + id;
        var (have, need) = GameFlow.Instance.database.Progress(p.Definition);
        return $"{id}: locked={c.IsLocked(p)} playable={GameFlow.Instance.database.IsPlayable(p.Definition)} progress={have}/{need} access={p.Definition.access} worn=[{string.Join(",", p.Rig.AllWorn().Select(a => a.id))}] rainbow={p.Coat.Rainbow}";
    }

    public static string Rainbow(string id, bool on)
    {
        var s = SaveSystem.Data.Pet(id);
        s.rainbow = on;
        SaveSystem.Save();
        GameFlow.Instance.RefreshClubhouse();
        return Lock(id);
    }

    /// <summary>Where every pet sits in the clubhouse (for layout checks).</summary>
    public static string Layout()
    {
        var c = GameFlow.Instance.clubhouse;
        var sb = new StringBuilder($"petScale={c.PetScale:0.00}");
        foreach (var p in c.Pets)
        {
            var b = p.VisualBounds();
            sb.Append($" | {p.Definition.id} at ({p.transform.position.x:0.00},{p.transform.position.y:0.00}) size ({b.size.x:0.00}x{b.size.y:0.00}) worn=[{string.Join(",", p.Rig.AllWorn().Select(a => a.id))}]");
        }
        return sb.ToString();
    }

    /// <summary>Plays a reaction on a clubhouse pet and samples its body rotation and lift while it runs.</summary>
    public static async Task<string> ProbeReaction(string petId, string reaction)
    {
        var pet = GameFlow.Instance.clubhouse.Pets.FirstOrDefault(p => p.Definition.id == petId);
        if (!pet) return "no pet " + petId;
        pet.Animator.Play((PetReaction)System.Enum.Parse(typeof(PetReaction), reaction));
        var sb = new StringBuilder();
        for (int i = 0; i < 12; i++)
        {
            await Frames(90);
            var v = pet.Rig.visual;
            sb.Append($"{v.localEulerAngles.z:0}deg/{v.localPosition.y:0.00} ");
        }
        return sb.ToString();
    }

    /// <summary>Plays the pet's garden toy like a child: taps where the hint points (the yarn gets rolled around).</summary>
    public static async Task<string> PlayOutside(int maxTaps)
    {
        var act = GameFlow.Instance.care.Current as OutdoorActivity;
        if (!act) return "not outside: " + State();
        var sb = new StringBuilder($"toy={act.Toy.GetType().Name} ");
        var rnd = new System.Random(5);
        for (int i = 0; i < maxTaps && !act.IsComplete; i++)
        {
            for (int w = 0; w < 80 && act.Toy && act.Toy.Busy && !act.IsComplete; w++) await Frames(100);
            if (act.IsComplete || !act.Toy) break;
            var at = act.Toy.HintTarget ? act.Toy.HintTarget.position : Vector3.zero;
            if (act.Toy is YarnToy) at = new Vector3(rnd.Next(-35, 36) / 10f, rnd.Next(-80, -35) / 10f);
            await Tap(at.x, at.y);
            await Frames(500);
            sb.Append($"[tap{i} splats={act.Splats} p={act.Progress:0.00}]");
        }
        for (int k = 0; k < 60 && !act.IsComplete; k++) await Frames(100);
        sb.Append($" complete={act.IsComplete} splats={act.Splats} | " + State());
        return sb.ToString();
    }

    /// <summary>Press at one point, drag to another over a few frames and let go (a flick).</summary>
    public static async Task<string> Flick(float x0, float y0, float x1, float y1, int steps)
    {
        var a = new Vector3(x0, y0); var b = new Vector3(x1, y1);
        Router.OnPointerDown(Ev(a));
        for (int i = 1; i <= steps; i++) { Router.OnDrag(Ev(Vector3.Lerp(a, b, i / (float)steps))); await Frames(25); }
        Router.OnPointerUp(Ev(b));
        await Frames(50);
        return State();
    }

    // ---------- Bath time and grooming ----------

    static async Task ZigZag(Bounds b, int passes, int stepsPerPass, float yFrom = 0.2f, float yTo = 0.85f)
    {
        var a0 = new Vector3(b.min.x + b.size.x * 0.15f, b.min.y + b.size.y * yFrom);
        Router.OnPointerDown(Ev(a0));
        for (int k = 0; k < passes; k++)
        {
            float y = b.min.y + b.size.y * Mathf.Lerp(yFrom, yTo, (k % 6) / 5f);
            var l = new Vector3(b.min.x + b.size.x * 0.12f, y); var r = new Vector3(b.max.x - b.size.x * 0.12f, y);
            for (int i = 1; i <= stepsPerPass; i++) { Router.OnDrag(Ev(Vector3.Lerp(k % 2 == 0 ? l : r, k % 2 == 0 ? r : l, i / (float)stepsPerPass))); await Frames(16); }
        }
        Router.OnPointerUp(Ev(a0));
    }

    /// <summary>Shampoo: tap the pet five times, then rub it in until the step completes.</summary>
    public static async Task<string> Shampoo(int maxRounds)
    {
        var act = GameFlow.Instance.care.Current as ShampooActivity;
        if (!act) return "not shampoo: " + State();
        var pet = GameFlow.Instance.care.Pet;
        var b = pet.VisualBounds();
        for (int i = 0; i < 5 && !act.Rubbing; i++)
        {
            var at = new Vector3(Mathf.Lerp(b.min.x, b.max.x, 0.3f + 0.1f * i), Mathf.Lerp(b.min.y, b.max.y, i % 2 == 0 ? 0.75f : 0.45f));
            await Tap(at.x, at.y);
            await Frames(500);
        }
        for (int r = 0; r < maxRounds && !act.IsComplete; r++) await ZigZag(pet.VisualBounds(), 6, 10);
        await Frames(400);
        return $"shampoo complete={act.IsComplete} | " + State();
    }

    /// <summary>Rinse: spray the shower back and forth over the pet until the suds are gone.</summary>
    public static async Task<string> Rinse(int maxRounds)
    {
        var act = GameFlow.Instance.care.Current as RinseActivity;
        if (!act) return "not rinse: " + State();
        for (int w = 0; w < 40 && !act.Ready && !act.IsComplete; w++) await Frames(100);
        var pet = GameFlow.Instance.care.Pet;
        for (int r = 0; r < maxRounds && !act.IsComplete; r++)
        {
            var b = pet.VisualBounds();
            var a = new Vector3(b.min.x - 0.2f, b.max.y - 1.2f);
            Router.OnPointerDown(Ev(a));
            for (int k = 0; k < 4; k++)
                for (int i = 1; i <= 12; i++)
                {
                    float x = Mathf.Lerp(b.min.x - 0.2f, b.max.x + 0.4f, k % 2 == 0 ? i / 12f : 1f - i / 12f);
                    Router.OnDrag(Ev(new Vector3(x, b.max.y - 1.2f - (k % 2) * 0.8f)));
                    await Frames(30);
                }
            Router.OnPointerUp(Ev(a));
        }
        for (int w = 0; w < 30 && !act.IsComplete; w++) await Frames(100);
        return $"rinse complete={act.IsComplete} | " + State();
    }

    /// <summary>Dry: rub the towel over the pet until every drop is gone.</summary>
    public static async Task<string> DryOff(int maxRounds)
    {
        var act = GameFlow.Instance.care.Current as DryActivity;
        if (!act) return "not dry: " + State();
        var pet = GameFlow.Instance.care.Pet;
        for (int r = 0; r < maxRounds && !act.IsComplete; r++) await ZigZag(pet.VisualBounds(), 6, 10, 0.1f, 0.85f);
        for (int w = 0; w < 30 && !act.IsComplete; w++) await Frames(100);
        return $"dry complete={act.IsComplete} | " + State();
    }

    /// <summary>Teeth: brush back and forth over the open mouth, then tap the rinse cup.</summary>
    public static async Task<string> BrushTeeth(int maxRounds)
    {
        var act = GameFlow.Instance.care.Current as TeethActivity;
        if (!act) return "not teeth: " + State();
        for (int r = 0; r < maxRounds && !act.RinsePhase && act.MouthOpen; r++)
            await ZigZag(act.MouthOpen.GetComponent<SpriteRenderer>().bounds, 6, 8, 0.1f, 0.9f);
        for (int w = 0; w < 20 && !act.cup.gameObject.activeInHierarchy; w++) await Frames(100);
        await Frames(300);
        await Tap(act.cup.position.x, act.cup.position.y);
        for (int w = 0; w < 50 && !act.IsComplete; w++) await Frames(100);
        return $"teeth complete={act.IsComplete} | " + State();
    }

    public static string MudOnPet()
    {
        var pet = GameFlow.Instance.care.Pet;
        if (!pet) return "no pet";
        var spots = pet.GetComponentsInChildren<MudSpot>();
        return $"mud spots on pet: {spots.Length} (cleared {spots.Count(m => m.Cleared)})";
    }

    public static string ResetSave()
    {
        SaveSystem.ResetProgress();
        return "reset: " + Save();
    }
}
