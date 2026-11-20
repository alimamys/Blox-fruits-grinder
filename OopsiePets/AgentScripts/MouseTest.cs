using System.Linq;
using System.Threading.Tasks;
using OopsiePets;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;

// Queues real Input System mouse events (position + left button), so they travel the full path:
// Input System -> InputSystemUIInputModule -> EventSystem raycasts -> buttons / InputRouter.
public static class MouseTest
{
    static Mouse M => Mouse.current ?? InputSystem.AddDevice<Mouse>();

    static void Send(Vector2 screen, bool down)
    {
        var st = new MouseState { position = screen }.WithButton(MouseButton.Left, down);
        InputSystem.QueueStateEvent(M, st);
    }

    static Vector2 W2S(Vector3 w) => Camera.main.WorldToScreenPoint(w);

    static string State()
    {
        var f = GameFlow.Instance;
        var a = f.care.Current;
        return $"screen={f.Current}" + (f.Current == GameFlow.Screen.Care && a ? $" activity={a.Kind} progress={a.Progress:0.00}" : "");
    }

    public static async Task<string> TapWorld(float x, float y)
    {
        var s = W2S(new Vector3(x, y, 0));
        Send(s, false); await Task.Delay(120);
        Send(s, true); await Task.Delay(150);
        Send(s, false); await Task.Delay(500);
        return $"tap at screen {s}: {State()}";
    }

    public static async Task<string> TapPet(string id)
    {
        var p = Object.FindObjectsByType<PetView>(FindObjectsSortMode.None).First(v => v.Definition.id == id);
        var h = p.Rig.head.position;
        var r = await TapWorld(h.x, h.y);
        var menu = Object.FindFirstObjectByType<CareMenu>(FindObjectsInactive.Include);
        return r + $" menuVisible={menu.Visible}";
    }

    public static async Task<string> ClickUI(string path)
    {
        var go = GameObject.Find(path);
        if (!go) return "no object " + path;
        var rt = (RectTransform)go.transform;
        var s = RectTransformUtility.WorldToScreenPoint(Camera.main, rt.TransformPoint(rt.rect.center));
        Send(s, false); await Task.Delay(120);
        Send(s, true); await Task.Delay(150);
        Send(s, false); await Task.Delay(800);
        return $"clicked {path} at {s}: {State()}";
    }

    public static async Task<string> TapPetThenWash(string id)
    {
        var a = await TapPet(id);
        var b = await ClickUI("UI/CareMenu/Panel/Wash");
        await Task.Delay(1500);
        return a + " || " + b + " || after: " + State();
    }

    public static async Task<string> ScrubFirstMud(int strokes)
    {
        var spot = Object.FindObjectsByType<MudSpot>(FindObjectsSortMode.None).FirstOrDefault(m => !m.Cleared);
        if (!spot) return "no mud";
        var c = spot.transform.position;
        Vector2 a = W2S(c + new Vector3(-0.7f, -0.35f)), b = W2S(c + new Vector3(0.7f, -0.35f));
        float before = spot.Remaining;
        Send(a, false); await Task.Delay(100);
        Send(a, true); await Task.Delay(100);
        for (int k = 0; k < strokes; k++)
            for (int i = 1; i <= 8; i++)
            {
                Send(Vector2.Lerp(k % 2 == 0 ? a : b, k % 2 == 0 ? b : a, i / 8f), true);
                await Task.Delay(40);
            }
        Send(b, false); await Task.Delay(300);
        return $"mud remaining {before:0} -> {spot.Remaining:0}; {State()}";
    }
}
