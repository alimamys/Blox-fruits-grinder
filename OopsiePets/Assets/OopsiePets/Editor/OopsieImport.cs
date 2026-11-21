using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEngine;

namespace OopsiePets.EditorTools
{
    [Serializable] public class RigFile { public RigPet[] pets; }

    [Serializable]
    public class RigPet
    {
        public string id, folder, mouth, furTint;
        public RigPart[] parts;
        public float eyeDx, eyeY, eyeScale, mouthY, mouthScale, headWidth;
        public float[] hat, eyes, side, neck;

        public RigPart Part(string name)
        {
            foreach (var p in parts) if (p.name == name) return p;
            return null;
        }
    }

    [Serializable]
    public class RigPart
    {
        public string name, file;
        public float x, y, scale, pivotX, pivotY, rot;
        public int order;
    }

    /// <summary>Sprite import settings, project/player settings and TMP resources for Oopsie Pets.</summary>
    public static class OopsieImport
    {
        public const string Root = "Assets/OopsiePets";
        public const string Art = Root + "/Art";

        public static RigFile LoadRig() => JsonUtility.FromJson<RigFile>(File.ReadAllText(Root + "/Data/rig_layout.json"));

        [MenuItem("Oopsie Pets/1. Configure Sprites")]
        public static string ConfigureSprites()
        {
            var rig = LoadRig();
            int n = 0;
            foreach (var guid in AssetDatabase.FindAssets("t:Texture2D", new[] { Art }))
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                var file = Path.GetFileNameWithoutExtension(path);
                float ppu = 100f;
                var pivot = new Vector2(0.5f, 0.5f);
                bool readable = false, compress = true;
                int max = 1024;
                Vector4 border = Vector4.zero;

                if (path.Contains("/Backgrounds/")) { ppu = 80f; max = 2048; }
                if (file.StartsWith("mud_splat")) { readable = true; compress = false; max = 512; }
                if (file.StartsWith("mouth_")) pivot = new Vector2(0.5f, 1f);
                if (file == "garden_swing_ropes" || file == "garden_swing_seat") pivot = new Vector2(0.5f, 1f);
                if (file == "thought_bubble") pivot = new Vector2(0.10f, 0.107f); // the smallest trail circle
                if (file == "garden_trampoline" || file == "garden_hoop" || file == "garden_carrot_mound") pivot = new Vector2(0.5f, 0f);
                if (file == "garden_tree" || file == "garden_slide" || file == "garden_worm") pivot = new Vector2(0.5f, 0f);
                if (file.StartsWith("panel_")) border = new Vector4(80, 80, 80, 80);
                if (file.StartsWith("slider_")) border = new Vector4(30, 28, 30, 28);
                foreach (var pet in rig.pets)
                    foreach (var part in pet.parts)
                        if (part.file == file) pivot = new Vector2(part.pivotX, part.pivotY);

                if (SetSprite(path, ppu, pivot, readable, compress, max, border)) n++;
            }
            return $"configured {n} sprites";
        }

        static bool SetSprite(string path, float ppu, Vector2 pivot, bool readable, bool compress, int max, Vector4 border)
        {
            var ti = AssetImporter.GetAtPath(path) as TextureImporter;
            if (ti == null) return false;
            ti.textureType = TextureImporterType.Sprite;
            ti.spriteImportMode = SpriteImportMode.Single;
            ti.spritePixelsPerUnit = ppu;
            ti.mipmapEnabled = false;
            ti.alphaIsTransparency = true;
            ti.isReadable = readable;
            ti.filterMode = FilterMode.Bilinear;
            ti.wrapMode = TextureWrapMode.Clamp;
            ti.maxTextureSize = max;
            var s = new TextureImporterSettings();
            ti.ReadTextureSettings(s);
            s.spriteAlignment = (int)SpriteAlignment.Custom;
            s.spritePivot = pivot;
            s.spriteMeshType = border != Vector4.zero ? SpriteMeshType.FullRect : SpriteMeshType.Tight;
            s.spriteBorder = border;
            ti.SetTextureSettings(s);
            ti.textureCompression = compress ? TextureImporterCompression.CompressedHQ : TextureImporterCompression.Uncompressed;
            // Phones: ASTC keeps pastel gradients clean at a fraction of the memory.
            var android = ti.GetPlatformTextureSettings("Android");
            android.overridden = compress;
            android.format = TextureImporterFormat.ASTC_6x6;
            android.maxTextureSize = max;
            android.compressionQuality = 100;
            ti.SetPlatformTextureSettings(android);
            ti.SaveAndReimport();
            return true;
        }

        [MenuItem("Oopsie Pets/0. Configure Player Settings")]
        public static string ConfigurePlayer()
        {
            PlayerSettings.productName = "Oopsie Pets!";
            PlayerSettings.companyName = "OopsiePets";
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
            PlayerSettings.allowedAutorotateToPortrait = true;
            PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
            PlayerSettings.allowedAutorotateToLandscapeLeft = false;
            PlayerSettings.allowedAutorotateToLandscapeRight = false;
            PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.oopsiepets.game");
            PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.bundleVersion = "0.1.0";
            PlayerSettings.Android.bundleVersionCode = 1;
            PlayerSettings.runInBackground = true;

            // Children's game: no crash reporting, analytics or performance reporting.
            PlayerSettings.enableCrashReportAPI = false;
            UnityEditor.CrashReporting.CrashReportingSettings.enabled = false;
            UnityEditor.Analytics.AnalyticsSettings.enabled = false;
            UnityEditor.Analytics.PerformanceReportingSettings.enabled = false;

            var icon = AssetDatabase.LoadAssetAtPath<Texture2D>(Art + "/Stickers/sticker_puppy_happy.png");
            if (icon) PlayerSettings.SetIcons(NamedBuildTarget.Unknown, new[] { icon }, IconKind.Any);
            AssetDatabase.SaveAssets();
            return "player settings configured";
        }

        [MenuItem("Oopsie Pets/Import TMP Essentials")]
        public static string ImportTmp()
        {
            if (AssetDatabase.FindAssets("t:TMP_Settings").Length > 0) return "TMP essentials already present";
            TMPro.TMP_PackageResourceImporter.ImportResources(true, false, false);
            return "TMP essentials import started";
        }
    }
}
