using UnityEngine;

namespace OopsiePets
{
    /// <summary>Procedural sound effects and music: soft, quiet and child-friendly. No audio files required.</summary>
    public static class Synth
    {
        const int Rate = 44100;

        static AudioClip Make(string name, float[] d, float fade = 0.006f)
        {
            int n = Mathf.Min(d.Length / 2, Mathf.RoundToInt(fade * Rate));
            for (int i = 0; i < n; i++)
            {
                float g = (float)i / n;
                d[i] *= g;
                d[d.Length - 1 - i] *= g;
            }
            var c = AudioClip.Create(name, d.Length, 1, Rate, false);
            c.SetData(d, 0);
            return c;
        }

        static float[] Buf(float seconds) => new float[Mathf.Max(1, Mathf.RoundToInt(seconds * Rate))];

        public static AudioClip Blip(string name, float f0, float f1, float dur, float amp)
        {
            var d = Buf(dur);
            float ph = 0f;
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / d.Length;
                ph += 2f * Mathf.PI * Mathf.Lerp(f0, f1, Ease.OutCubic(t)) / Rate;
                d[i] = (Mathf.Sin(ph) + 0.2f * Mathf.Sin(ph * 2f)) * amp * Mathf.Exp(-4f * t);
            }
            return Make(name, d);
        }

        public static AudioClip Arp(string name, float[] notes, float step, float amp)
        {
            float len = step * 2.4f;
            var d = Buf(step * (notes.Length - 1) + len);
            for (int n = 0; n < notes.Length; n++)
            {
                int start = Mathf.RoundToInt(n * step * Rate);
                int nl = Mathf.RoundToInt(len * Rate);
                for (int i = 0; i < nl && start + i < d.Length; i++)
                {
                    float t = (float)i / Rate;
                    float env = Mathf.Exp(-5f * t) * Mathf.Min(1f, t / 0.004f);
                    d[start + i] += (Mathf.Sin(2f * Mathf.PI * notes[n] * t) + 0.25f * Mathf.Sin(4f * Mathf.PI * notes[n] * t)) * env * amp * 0.7f;
                }
            }
            return Make(name, d);
        }

        public static AudioClip Pop()
        {
            var d = Buf(0.12f);
            var rng = new System.Random(5);
            float ph = 0f, lp = 0f;
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / d.Length;
                ph += 2f * Mathf.PI * Mathf.Lerp(950f, 300f, t) / Rate;
                lp = Mathf.Lerp(lp, (float)(rng.NextDouble() * 2 - 1), 0.3f);
                d[i] = Mathf.Sin(ph) * 0.5f * Mathf.Exp(-14f * t) + lp * 0.35f * Mathf.Exp(-45f * t);
            }
            return Make("pop", d);
        }

        // Wet, soft "squish" for the sponge.
        public static AudioClip Squish()
        {
            var d = Buf(0.22f);
            var rng = new System.Random(9);
            float lp = 0f, lp2 = 0f, ph = 0f;
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / d.Length;
                lp = Mathf.Lerp(lp, (float)(rng.NextDouble() * 2 - 1), 0.12f);
                lp2 = Mathf.Lerp(lp2, lp, 0.2f);
                ph += 2f * Mathf.PI * (180f + 90f * Mathf.Sin(t * 20f)) / Rate;
                float env = Mathf.Sin(t * Mathf.PI);
                d[i] = (lp2 * 0.9f + Mathf.Sin(ph) * 0.12f) * env * 0.6f;
            }
            return Make("squish", d);
        }

        // Soft brushing "swish".
        public static AudioClip Swish()
        {
            var d = Buf(0.28f);
            var rng = new System.Random(13);
            float hp = 0f, prev = 0f;
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / d.Length;
                float w = (float)(rng.NextDouble() * 2 - 1);
                hp = 0.85f * (hp + w - prev);
                prev = w;
                d[i] = hp * 0.25f * Mathf.Sin(t * Mathf.PI) * (0.7f + 0.3f * Mathf.Sin(t * 60f));
            }
            return Make("brush", d);
        }

        public static AudioClip Whoosh()
        {
            var d = Buf(0.4f);
            var rng = new System.Random(21);
            float lp = 0f;
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / d.Length;
                float a = Mathf.Lerp(0.05f, 0.4f, t);
                lp = Mathf.Lerp(lp, (float)(rng.NextDouble() * 2 - 1), a);
                d[i] = lp * 0.35f * Mathf.Sin(t * Mathf.PI);
            }
            return Make("whoosh", d);
        }

        public static AudioClip Splash()
        {
            var d = Buf(0.35f);
            var rng = new System.Random(31);
            float lp = 0f;
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / d.Length;
                lp = Mathf.Lerp(lp, (float)(rng.NextDouble() * 2 - 1), 0.5f);
                float bubbles = Mathf.Sin(2f * Mathf.PI * (600f + 400f * Mathf.Sin(t * 37f)) * t) * 0.15f * Mathf.Exp(-6f * t);
                d[i] = lp * 0.3f * Mathf.Exp(-10f * t) + bubbles;
            }
            return Make("splash", d);
        }

        /// <summary>
        /// Little cartoon voices: a "yip" for the puppy, a "mew" for the kitten, an "eep" for the bunny, a snorty
        /// "oink" for the piglet, a wobbly "baa" for the lamb, a soft squeak for the panda and a glassy trill for the unicorn.
        /// </summary>
        public static AudioClip Voice(PetVoice voice, VoiceKind kind)
        {
            float baseF = voice switch
            {
                PetVoice.Puppy => 620f, PetVoice.Kitten => 760f, PetVoice.Bunny => 900f, PetVoice.Piglet => 360f,
                PetVoice.Lamb => 540f, PetVoice.Panda => 500f, PetVoice.Unicorn => 1000f,
                PetVoice.Giraffe => 440f, PetVoice.Bird => 1500f, PetVoice.Cow => 300f, PetVoice.Pony => 820f, _ => 900f,
            };
            switch (kind)
            {
                case VoiceKind.Giggle:
                {
                    var d = Buf(0.6f);
                    for (int k = 0; k < 4; k++)
                        Chirp(d, k * 0.13f, 0.11f, baseF * (1.25f - k * 0.08f), baseF * (1.05f - k * 0.08f), 0.35f, voice);
                    return Make($"{voice}_giggle", d);
                }
                case VoiceKind.Surprised:
                {
                    var d = Buf(0.3f);
                    Chirp(d, 0f, 0.26f, baseF * 0.9f, baseF * 1.6f, 0.4f, voice);
                    return Make($"{voice}_surprised", d);
                }
                case VoiceKind.Excited:
                {
                    var d = Buf(0.5f);
                    Chirp(d, 0f, 0.18f, baseF, baseF * 1.4f, 0.38f, voice);
                    Chirp(d, 0.2f, 0.22f, baseF * 1.2f, baseF * 1.7f, 0.38f, voice);
                    return Make($"{voice}_excited", d);
                }
                case VoiceKind.Sneeze:
                {
                    // "ah..." then a soft "choo" puff
                    var d = Buf(0.7f);
                    Chirp(d, 0f, 0.3f, baseF * 0.8f, baseF * 1.1f, 0.2f, voice);
                    var rng = new System.Random(7);
                    float lp = 0f;
                    int s = Mathf.RoundToInt(0.36f * Rate);
                    for (int i = s; i < d.Length; i++)
                    {
                        float t = (float)(i - s) / Rate;
                        lp = Mathf.Lerp(lp, (float)(rng.NextDouble() * 2 - 1), 0.35f);
                        d[i] += lp * 0.4f * Mathf.Exp(-9f * t) * Mathf.Min(1f, t / 0.01f);
                    }
                    return Make($"{voice}_sneeze", d);
                }
                case VoiceKind.Purr:
                {
                    var d = Buf(1.4f);
                    var rng = new System.Random(3);
                    float lp = 0f;
                    for (int i = 0; i < d.Length; i++)
                    {
                        float t = (float)i / Rate;
                        lp = Mathf.Lerp(lp, (float)(rng.NextDouble() * 2 - 1), 0.05f);
                        float am = 0.5f + 0.5f * Mathf.Sin(2f * Mathf.PI * 24f * t);
                        d[i] = (lp * 0.8f + Mathf.Sin(2f * Mathf.PI * 70f * t) * 0.3f) * am * 0.35f * Mathf.Sin(Mathf.PI * t / 1.4f);
                    }
                    return Make($"{voice}_purr", d);
                }
                default:
                {
                    var d = Buf(0.28f);
                    Chirp(d, 0f, 0.24f, baseF * 1.1f, baseF * 0.95f, 0.38f, voice);
                    return Make($"{voice}_happy", d);
                }
            }
        }

        static void Chirp(float[] d, float start, float dur, float f0, float f1, float amp, PetVoice voice)
        {
            int s = Mathf.RoundToInt(start * Rate);
            int n = Mathf.RoundToInt(dur * Rate);
            float ph = 0f;
            for (int i = 0; i < n && s + i < d.Length; i++)
            {
                float t = (float)i / n;
                float sec = (float)i / Rate;
                float f = Mathf.Lerp(f0, f1, voice == PetVoice.Kitten ? Ease.InOutSine(t) : t);
                if (voice == PetVoice.Kitten) f *= 1f + 0.03f * Mathf.Sin(t * 50f); // a little "mew" vibrato
                else if (voice == PetVoice.Lamb) f *= 1f + 0.025f * Mathf.Sin(2f * Mathf.PI * 9f * sec);
                else if (voice == PetVoice.Unicorn) f *= 1f + 0.06f * Mathf.Sin(2f * Mathf.PI * 14f * sec); // whinny trill
                else if (voice == PetVoice.Pony) f *= 1f + 0.08f * Mathf.Sin(2f * Mathf.PI * 11f * sec); // neigh flutter
                else if (voice == PetVoice.Bird) f *= 1f + 0.12f * Mathf.Sin(2f * Mathf.PI * 28f * sec); // tweet trill
                else if (voice == PetVoice.Cow) f *= 1f + 0.04f * Mathf.Sin(t * Mathf.PI); // "moo" swell
                ph += 2f * Mathf.PI * f / Rate;
                float env = Mathf.Sin(Mathf.PI * Mathf.Pow(t, voice == PetVoice.Puppy || voice == PetVoice.Piglet ? 0.6f : 1f));
                float tone;
                switch (voice)
                {
                    case PetVoice.Piglet: // snorty: squared-off wave with a fast grunt flutter
                        tone = (float)System.Math.Tanh(3f * Mathf.Sin(ph)) * 0.75f + 0.3f * Mathf.Sin(ph * 2f);
                        env *= 0.65f + 0.35f * Mathf.Sin(2f * Mathf.PI * 38f * sec);
                        break;
                    case PetVoice.Lamb: // bleat: rich tone with a wobbling volume
                        tone = Mathf.Sin(ph) + 0.5f * Mathf.Sin(ph * 2f) + 0.25f * Mathf.Sin(ph * 3f);
                        env *= 0.6f + 0.4f * Mathf.Sin(2f * Mathf.PI * 9f * sec);
                        break;
                    case PetVoice.Panda: // soft and round
                        tone = Mathf.Sin(ph) + 0.15f * Mathf.Sin(ph * 2f);
                        break;
                    case PetVoice.Unicorn: // glassy, with a high shimmer
                        tone = Mathf.Sin(ph) + 0.2f * Mathf.Sin(ph * 2f) + 0.25f * Mathf.Sin(ph * 4f);
                        break;
                    case PetVoice.Cow: // low and warm, a soft "mmm" hum
                        tone = Mathf.Sin(ph) + 0.45f * Mathf.Sin(ph * 2f) + 0.2f * Mathf.Sin(ph * 3f);
                        env = Mathf.Sin(Mathf.PI * Mathf.Pow(t, 0.8f));
                        break;
                    case PetVoice.Bird: // a pure, bright whistle
                        tone = Mathf.Sin(ph) + 0.08f * Mathf.Sin(ph * 2f);
                        break;
                    case PetVoice.Giraffe: // gentle hum, slightly breathy
                        tone = Mathf.Sin(ph) + 0.25f * Mathf.Sin(ph * 2f) + 0.1f * Mathf.Sin(ph * 5f);
                        break;
                    case PetVoice.Pony: // bright and bouncy
                        tone = Mathf.Sin(ph) + 0.3f * Mathf.Sin(ph * 2f) + 0.15f * Mathf.Sin(ph * 3f);
                        env *= 0.75f + 0.25f * Mathf.Sin(2f * Mathf.PI * 11f * sec);
                        break;
                    default:
                        tone = Mathf.Sin(ph) + 0.35f * Mathf.Sin(ph * 2f) + 0.12f * Mathf.Sin(ph * 3f);
                        break;
                }
                d[s + i] += tone * env * amp * 0.6f;
            }
        }

        /// <summary>A gentle 8-second music-box loop (C major pentatonic over a soft pad). Seamless.</summary>
        public static AudioClip MusicBox()
        {
            const float dur = 8f;
            var d = Buf(dur);
            float[] pad = { 130.875f, 164.875f, 196f };
            for (int i = 0; i < d.Length; i++)
            {
                float t = (float)i / Rate;
                float swell = 0.6f + 0.4f * Mathf.Sin(2f * Mathf.PI * t / dur);
                float s = 0f;
                foreach (var f in pad) s += Mathf.Sin(2f * Mathf.PI * f * t);
                d[i] = s * 0.03f * swell;
            }
            float[] mel = { 659.25f, 783.99f, 880f, 783.99f, 659.25f, 587.33f, 523.25f, 587.33f,
                            659.25f, 659.25f, 587.33f, 523.25f, 440f, 523.25f, 587.33f, 523.25f };
            float step = dur / mel.Length;
            for (int n = 0; n < mel.Length; n++)
            {
                int start = Mathf.RoundToInt(n * step * Rate);
                int nl = Mathf.RoundToInt(step * 1.7f * Rate);
                for (int i = 0; i < nl; i++)
                {
                    int idx = (start + i) % d.Length;
                    float t = (float)i / Rate;
                    float env = Mathf.Exp(-4f * t) * Mathf.Min(1f, t / 0.003f);
                    d[idx] += (Mathf.Sin(2f * Mathf.PI * mel[n] * t) + 0.3f * Mathf.Sin(6f * Mathf.PI * mel[n] * t) * Mathf.Exp(-10f * t)) * env * 0.13f;
                }
            }
            var c = AudioClip.Create("music_box", d.Length, 1, Rate, false);
            c.SetData(d, 0);
            return c;
        }
    }
}
