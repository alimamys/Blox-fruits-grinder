using System;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>A round tray button showing one accessory. Selected items get a glowing ring and a little bounce.</summary>
    [RequireComponent(typeof(Button))]
    public class AccessoryButton : MonoBehaviour
    {
        public Image icon;
        public Image ring;
        public AccessoryDefinition Accessory { get; private set; }
        Action<AccessoryDefinition> onPick;

        public void Bind(AccessoryDefinition acc, Action<AccessoryDefinition> pick)
        {
            Accessory = acc;
            onPick = pick;
            icon.sprite = acc.sprite;
            icon.preserveAspect = true;
            var b = GetComponent<Button>();
            b.onClick.RemoveAllListeners();
            b.onClick.AddListener(() => onPick?.Invoke(Accessory));
        }

        public void SetSelected(bool on)
        {
            if (ring) ring.enabled = on;
            transform.localScale = on ? Vector3.one * 1.08f : Vector3.one;
        }
    }
}
