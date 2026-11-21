using UnityEngine;

namespace OopsiePets
{
    /// <summary>Shared eye and mouth sprites. Every pet uses the same set so expressions stay consistent.</summary>
    [CreateAssetMenu(menuName = "Oopsie Pets/Face Set", fileName = "FaceSet")]
    public class FaceSet : ScriptableObject
    {
        [Header("Eyes")]
        public Sprite eyeOpen;
        public Sprite eyeBlink;
        public Sprite eyeHappy;
        public Sprite eyeWide;
        public Sprite eyeSparkle;

        [Header("Mouths")]
        public Sprite mouthSmile;
        public Sprite mouthLaugh;
        public Sprite mouthO;
        public Sprite mouthSneeze;
        public Sprite mouthTongue;

        public Sprite Eyes(PetExpression e) => e switch
        {
            PetExpression.Happy or PetExpression.Laugh or PetExpression.Sneeze or PetExpression.Sleepy => eyeHappy,
            PetExpression.Surprised => eyeWide,
            PetExpression.Yawn or PetExpression.Asleep => eyeBlink,
            PetExpression.Excited => eyeSparkle,
            _ => eyeOpen,
        };

        public Sprite Mouth(PetExpression e, PetDefinition pet)
        {
            switch (e)
            {
                case PetExpression.Laugh:
                case PetExpression.Excited:
                    return pet != null && pet.mouthLaughOverride != null ? pet.mouthLaughOverride : mouthLaugh;
                case PetExpression.Surprised:
                case PetExpression.Yawn: return mouthO;
                case PetExpression.Sneeze: return mouthSneeze;
                case PetExpression.Tongue: return mouthTongue;
                default:
                    return pet != null && pet.mouthSmileOverride != null ? pet.mouthSmileOverride : mouthSmile;
            }
        }

        public bool UsesOpenEyes(PetExpression e) => Eyes(e) == eyeOpen || Eyes(e) == eyeWide || Eyes(e) == eyeSparkle;
    }
}
