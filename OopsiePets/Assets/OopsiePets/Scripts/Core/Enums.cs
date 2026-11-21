namespace OopsiePets
{
    // Values are saved (completed activities): append only.
    public enum ActivityKind { Wash = 0, Bubbles = 1, Brush = 2, DressUp = 3, Outdoor = 4, Shampoo = 5, Dry = 6, Teeth = 7, Rinse = 8 }

    /// <summary>Each pet's own garden toy (how it plays outside and gets muddy).</summary>
    public enum ToyKind { Frisbee, Yarn, Carrots, Swing, Duck, Trampoline, Hoop, AppleTree, MudSlide, WormHunt, PuddleGallop }

    /// <summary>
    /// Who can play with a pet. Free pets are always playable; the full version (a one-time parent
    /// purchase, test-only in this build) opens the rest. Some friends also have to be earned by
    /// finishing a full visit (earning the sticker) with every earlier friend, and one comes last of all.
    /// </summary>
    public enum PetAccess { Free = 0, FullVersion = 1, AfterBasePets = 2, Last = 3 }

    public enum AccessorySlot { Hat = 0, Eyes = 1, Neck = 2, HeadSide = 3 }

    public enum PetExpression { Neutral, Happy, Laugh, Surprised, Sneeze, Excited, Sleepy, Tongue, Yawn, Asleep }

    public enum PetReaction
    {
        Bounce, Giggle, Surprised, HeadTilt, Jump, Celebrate, Sneeze, Shake, EarWiggle, Purr, Wiggle, Pose, Roll, Yawn
    }

    // Append only: the order is the index of each voice's synthesized clips.
    public enum PetVoice { Puppy, Kitten, Bunny, Piglet, Lamb, Panda, Unicorn, Giraffe, Bird, Cow, Pony }

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
