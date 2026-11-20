using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace OopsiePets
{
    /// <summary>
    /// Grown-ups only: the settings (and any future purchase or link) sit behind this gate. It asks for
    /// three numbers written as words, which a pre-reader can't follow. A wrong tap quietly starts over.
    /// </summary>
    public class ParentGate : MonoBehaviour
    {
        public TMP_Text prompt;
        public Button[] digits; // 1..9
        public Button close;
        public CanvasGroup group;

        static readonly string[] Words = { "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine" };
        readonly int[] code = new int[3];
        int step;
        Action onPass;

        void Awake()
        {
            for (int i = 0; i < digits.Length; i++)
            {
                int d = i + 1;
                digits[i].onClick.AddListener(() => Press(d));
            }
            close.onClick.AddListener(Close);
            gameObject.SetActive(false);
        }

        public void Open(Action passed)
        {
            onPass = passed;
            for (int i = 0; i < 3; i++) code[i] = UnityEngine.Random.Range(1, 10);
            step = 0;
            prompt.text = $"For grown-ups\n<size=70%>Tap the numbers: <b>{Words[code[0]]}, {Words[code[1]]}, {Words[code[2]]}</b></size>";
            gameObject.SetActive(true);
            group.alpha = 1f;
            if (AudioManager.Instance) AudioManager.Instance.DuckMusic(true);
        }

        void Press(int d)
        {
            if (d != code[step])
            {
                Open(onPass); // new code, start again
                return;
            }
            step++;
            if (step == 3)
            {
                gameObject.SetActive(false);
                onPass?.Invoke();
            }
        }

        public void Close()
        {
            gameObject.SetActive(false);
            if (AudioManager.Instance) AudioManager.Instance.DuckMusic(false);
        }
    }
}
