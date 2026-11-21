using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace OopsiePets.EditorTools
{
    /// <summary>One-click player builds (also callable with `unity build --execute-method`).</summary>
    public static class OopsieBuild
    {
        static string[] Scenes => new[] { OopsieScene.ScenePath };

        [MenuItem("Oopsie Pets/Build/Android APK (test)")]
        public static void Android() => Build(BuildTarget.Android, "Builds/Android/OopsiePets.apk");

        [MenuItem("Oopsie Pets/Build/Web (WebGL)")]
        public static void WebGL()
        {
            // Plays from any static host: Brotli files (smaller than gzip) that the page can unpack itself
            // if the server does not send Content-Encoding headers.
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
            PlayerSettings.WebGL.decompressionFallback = true;
            PlayerSettings.WebGL.dataCaching = false;
            PlayerSettings.WebGL.nameFilesAsHashes = false;
            Build(BuildTarget.WebGL, "Builds/WebGL");
        }

        static void Build(BuildTarget target, string output)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(output)) ?? ".");
            var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = Scenes,
                locationPathName = output,
                target = target,
                options = BuildOptions.None,
            });
            var s = report.summary;
            Debug.Log($"[OopsieBuild] {target}: {s.result}, {s.totalSize / 1048576f:0.0} MB, {s.totalErrors} errors, {s.totalTime}");
            if (Application.isBatchMode) EditorApplication.Exit(s.result == BuildResult.Succeeded ? 0 : 1);
        }
    }
}
