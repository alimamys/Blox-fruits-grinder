namespace OopsiePets
{
    public enum ActivityKind { Wash = 0, Bubbles = 1, Brush = 2, DressUp = 3 }

    public enum AccessorySlot { Hat = 0, Eyes = 1, Neck = 2, HeadSide = 3 }

    public enum PetExpression { Neutral, Happy, Laugh, Surprised, Sneeze, Excited, Sleepy, Tongue }

    public enum PetReaction
    {
        Bounce, Giggle, Surprised, HeadTilt, Jump, Celebrate, Sneeze, Shake, EarWiggle, Purr, Wiggle, Pose, Roll
    }

    // Append only: the order is the index of each voice's synthesized clips.
    public enum PetVoice { Puppy, Kitten, Bunny, Piglet, Lamb, Panda, Unicorn }

    /// <summary>Little signature surprises a pet brings to the activities. A pet can have several.</summary>
    [System.Flags]
    public enum PetQuirk
    {
        None = 0,
        GiantSneezeBubble = 1 << 0, // bubbles: sneezes out a giant bubble
        EarBubbles = 1 << 1,        // bubbles: little bubbles land on its long ears
        MudLover = 1 << 2,          // wash: "Oopsie!" one more splat of mud mid-bath; arrives extra muddy
        ExtraFluffy = 1 << 3,       // brush: more tufts, and a big fluffy poof at the end
        Somersault = 1 << 4,        // bubbles: big pops make it roll head over heels
        Sparkly = 1 << 5,           // every reaction and bubble pop sprinkles stars
    }
}
