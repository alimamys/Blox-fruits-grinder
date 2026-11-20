using System;
using System.Reflection;
using UnityEditor;
using UnityEngine;

// Agent helpers run with `unity command script run --file AgentScripts/EditorTools.cs --entry EditorTools.<Method>`.
public static class EditorTools
{
    /// <summary>Adds (once) and selects a fixed portrait resolution in the Game view, e.g. 1080x1920.</summary>
    public static string SetGameViewSize(int width, int height)
    {
        var asm = typeof(EditorWindow).Assembly;
        var sizesType = asm.GetType("UnityEditor.GameViewSizes");
        var singleton = typeof(ScriptableSingleton<>).MakeGenericType(sizesType);
        var instance = singleton.GetProperty("instance").GetValue(null);
        var group = sizesType.GetMethod("GetGroup").Invoke(instance, new object[] { (int)GameViewSizeGroupType.Standalone });
        var groupType = group.GetType();
        int total = (int)groupType.GetMethod("GetTotalCount").Invoke(group, null);
        int index = -1;
        for (int i = 0; i < total; i++)
        {
            var size = groupType.GetMethod("GetGameViewSize").Invoke(group, new object[] { i });
            var st = size.GetType();
            if ((int)st.GetProperty("width").GetValue(size) == width && (int)st.GetProperty("height").GetValue(size) == height) { index = i; break; }
        }
        if (index < 0)
        {
            var sizeType = asm.GetType("UnityEditor.GameViewSize");
            var enumType = asm.GetType("UnityEditor.GameViewSizeType");
            var ctor = sizeType.GetConstructor(new[] { enumType, typeof(int), typeof(int), typeof(string) });
            var newSize = ctor.Invoke(new object[] { Enum.Parse(enumType, "FixedResolution"), width, height, $"Portrait {width}x{height}" });
            groupType.GetMethod("AddCustomSize").Invoke(group, new[] { newSize });
            index = (int)groupType.GetMethod("GetTotalCount").Invoke(group, null) - 1;
        }
        var gvType = asm.GetType("UnityEditor.GameView");
        var gv = EditorWindow.GetWindow(gvType);
        var prop = gvType.GetProperty("selectedSizeIndex", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
        prop.SetValue(gv, index);
        gv.Repaint();
        return $"game view size index {index} = {width}x{height}";
    }

    public static string FixTmpFontMeta()
    {
        AssetDatabase.ImportAsset("Assets/TextMesh Pro/Fonts/LiberationSans.ttf", ImportAssetOptions.ForceUpdate);
        return "reimported";
    }

    public static string OpenMainScene()
    {
        UnityEditor.SceneManagement.EditorSceneManager.OpenScene("Assets/OopsiePets/Scenes/OopsiePets_Main.unity");
        return "opened";
    }
}
