using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OopsiePets;
using UnityEngine;

public static class ShampooRepro
{
    static void Down(Vector2 p) => Send("PointerDown", p, Vector2.zero);
    static void Up(Vector2 p) => Send("PointerUp", p, Vector2.zero);
    static void Drag(Vector2 p, Vector2 d) => Send("PointerDrag", p, d);
    static void Send(string ev, Vector2 p, Vector2 d)
    {
        var r = InputRouter.Instance;
        var f = typeof(InputRouter).GetField(ev, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
        var del = f.GetValue(r) as System.Delegate;
        if (del == null) return;
        if (ev == "PointerDrag") del.DynamicInvoke(p, d); else del.DynamicInvoke(p);
    }

    public static async Task<string> Run()
    {
        var act = GameFlow.Instance.care.Current as ShampooActivity;
        if (!act) return "not shampoo";
        var pet = GameFlow.Instance.care.Pet;
        var b = pet.VisualBounds();
        var sb = new StringBuilder($"pet bounds y {b.min.y:0.0}..{b.max.y:0.0} ");
        // Like a child: tap low on the tummy (near the tub rim) and on the face.
        var taps = new[] { new Vector2(b.center.x - 0.5f, b.min.y + b.size.y * 0.32f), new Vector2(b.center.x + 0.6f, b.min.y + b.size.y * 0.33f),
                           new Vector2(b.center.x, b.min.y + b.size.y * 0.7f), new Vector2(b.center.x - 0.4f, b.min.y + b.size.y * 0.62f), new Vector2(b.center.x + 0.4f, b.min.y + b.size.y * 0.4f) };
        foreach (var t in taps) { Down(t); await Task.Delay(60); Up(t); await Task.Delay(900); }
        await Task.Delay(800);
        sb.Append($"after taps progress={act.Progress:0.00} rubbing={act.Rubbing} ");
        // Then rub back and forth along the hint's path (across the middle of the pet), 12 strokes.
        float y = b.center.y;
        var a = new Vector2(b.center.x - b.extents.x * 0.6f, y);
        Down(a);
        var prev = a;
        for (int s = 0; s < 12; s++)
            for (int i = 1; i <= 15; i++)
            {
                float k = i / 15f;
                var p = new Vector2(Mathf.Lerp(b.center.x - b.extents.x * 0.6f, b.center.x + b.extents.x * 0.6f, s % 2 == 0 ? k : 1f - k), y);
                Drag(p, p - prev); prev = p;
                await Task.Delay(16);
            }
        Up(prev);
        await Task.Delay(500);
        sb.Append($"after rubbing progress={act.Progress:0.00} complete={act.IsComplete} tub rim y={(act.tubFront ? act.tubFront.bounds.max.y : 0):0.0} | blobs: ");
        foreach (var s in pet.GetComponentsInChildren<SoapSuds>().Where(x => x.name == "Shampoo"))
            sb.Append($"({s.transform.position.x:0.0},{s.transform.position.y:0.0}) lather={s.Lather:0.00}; ");
        return sb.ToString();
    }

    /// <summary>Rinse like a child might: spray back and forth across the middle of the pet only.</summary>
    public static async Task<string> RinseMiddle(int strokes)
    {
        var act = GameFlow.Instance.care.Current as RinseActivity;
        if (!act) return "not rinse";
        for (int w = 0; w < 40 && !act.Ready; w++) await Task.Delay(100);
        var pet = GameFlow.Instance.care.Pet;
        var b = pet.VisualBounds();
        float y = b.center.y - 0.6f;
        var a = new Vector2(b.min.x, y);
        Down(a);
        var prev = a;
        for (int s = 0; s < strokes && !act.IsComplete; s++)
            for (int i = 1; i <= 20; i++)
            {
                float k = i / 20f;
                var p = new Vector2(Mathf.Lerp(b.min.x, b.max.x, s % 2 == 0 ? k : 1f - k), y);
                Drag(p, p - prev); prev = p;
                await Task.Delay(30);
            }
        Up(prev);
        for (int w = 0; w < 30 && !act.IsComplete; w++) await Task.Delay(100);
        return $"rinse progress={act.Progress:0.00} complete={act.IsComplete}";
    }
}
