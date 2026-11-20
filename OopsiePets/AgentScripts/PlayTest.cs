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
            sb.Append($" pets=[{string.Join(",", f.clubhouse.Pets.Select(p => p.Definition.id + (p.tappable ? "" : "(arriving)")))}] visitor={(f.clubhouse.Visitor ? f.clubhouse.Visitor.Definition.id : "none")}");
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

    public static string ResetSave()
    {
        SaveSystem.ResetProgress();
        return "reset: " + Save();
    }
}
