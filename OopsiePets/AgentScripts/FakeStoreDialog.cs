using System;
using System.Linq;
using System.Reflection;
using UnityEngine;

/// <summary>Test helper: presses Buy or Cancel on Unity IAP's Fake Store dialog (an IMGUI window).</summary>
public static class FakeStoreDialog
{
    public static string Press(bool buy)
    {
        var t = AppDomain.CurrentDomain.GetAssemblies().Select(a => a.GetType("UnityEngine.Purchasing.UIFakeStoreWindow")).FirstOrDefault(x => x != null);
        if (t == null) return "no window type";
        var w = UnityEngine.Object.FindAnyObjectByType(t);
        if (!w) return "no dialog open";
        var f = t.GetField(buy ? "m_OnOk" : "m_OnCancel", BindingFlags.Instance | BindingFlags.NonPublic);
        var cb = f?.GetValue(w) as Action;
        if (cb == null) return "no callback";
        cb();
        return buy ? "pressed Buy" : "pressed Cancel";
    }
}
