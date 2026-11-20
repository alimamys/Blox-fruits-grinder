using System.Text;
using UnityEditor;

public static class ReadConsole
{
    // Returns the Editor console's current error/warning lines (internal LogEntries API).
    public static string All()
    {
        var sb = new StringBuilder();
        int n = LogEntries.StartGettingEntries();
        try
        {
            var e = new LogEntry();
            for (int i = 0; i < n; i++)
            {
                LogEntries.GetEntryInternal(i, e);
                sb.AppendLine($"[{e.mode}] {e.message.Split('\n')[0]}  ({e.file}:{e.line})");
            }
        }
        finally { LogEntries.EndGettingEntries(); }
        return sb.ToString();
    }
}
