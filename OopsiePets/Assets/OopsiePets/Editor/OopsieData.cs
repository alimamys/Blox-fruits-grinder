using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.UI;

namespace OopsiePets.EditorTools
{
    /// <summary>Creates the ScriptableObject data (pets, accessories, stickers, packs) and the prefabs.</summary>
    public static class OopsieData
    {
        const string Root = OopsieImport.Root;
        const string Art = OopsieImport.Art;
        const string Data = Root + "/Data";

        public static Sprite S(string rel)
        {
            var s = AssetDatabase.LoadAssetAtPath<Sprite>($"{Art}/{rel}.png");
            if (s == null) Debug.LogWarning($"[OopsieBuilder] Missing sprite {rel}");
            return s;
        }

        static T GetOrCreate<T>(string path) where T : ScriptableObject
        {
            var a = AssetDatabase.LoadAssetAtPath<T>(path);
            if (a != null) return a;
            a = ScriptableObject.CreateInstance<T>();
            AssetDatabase.CreateAsset(a, path);
            return a;
        }

        static AccessoryDefinition Acc(string id, string sprite, AccessorySlot slot, float width, Vector2 offset, float rot, PetReaction r)
        {
            var a = GetOrCreate<AccessoryDefinition>($"{Data}/Accessories/{id}.asset");
            a.id = id; a.sprite = S("Accessories/" + sprite); a.slot = slot; a.widthOnHead = width;
            a.offset = offset; a.rotation = rot; a.reaction = r;
            EditorUtility.SetDirty(a);
            return a;
        }

        static StickerDefinition Sticker(string id, string sprite)
        {
            var s = GetOrCreate<StickerDefinition>($"{Data}/Stickers/{id}.asset");
            s.id = id; s.sprite = S("Stickers/" + sprite);
            EditorUtility.SetDirty(s);
            return s;
        }

        [MenuItem("Oopsie Pets/2. Build Data And Prefabs")]
        public static string BuildAll()
        {
            var rig = OopsieImport.LoadRig();

            var face = GetOrCreate<FaceSet>($"{Data}/FaceSet.asset");
            face.eyeOpen = S("Characters/Shared/eye_open");
            face.eyeBlink = S("Characters/Shared/eye_blink");
            face.eyeHappy = S("Characters/Shared/eye_happy");
            face.eyeWide = S("Characters/Shared/eye_wide");
            face.eyeSparkle = S("Characters/Shared/eye_sparkle");
            face.mouthSmile = S("Characters/Shared/mouth_smile");
            face.mouthLaugh = S("Characters/Shared/mouth_laugh");
            face.mouthO = S("Characters/Shared/mouth_o");
            face.mouthSneeze = S("Characters/Shared/mouth_sneeze");
            face.mouthTongue = S("Characters/Shared/mouth_tongue");
            EditorUtility.SetDirty(face);

            var hat = Acc("party_hat", "acc_party_hat", AccessorySlot.Hat, 0.42f, new Vector2(0f, 0.16f), 8f, PetReaction.Jump);
            var bow = Acc("bow", "acc_bow", AccessorySlot.HeadSide, 0.4f, Vector2.zero, -18f, PetReaction.Wiggle);
            var sun = Acc("sunglasses", "acc_sunglasses", AccessorySlot.Eyes, 0.78f, Vector2.zero, 0f, PetReaction.Pose);
            var collar = Acc("collar", "acc_collar", AccessorySlot.Neck, 0.6f, Vector2.zero, 0f, PetReaction.Bounce);
            var crown = Acc("flower_crown", "acc_flower_crown", AccessorySlot.Hat, 0.86f, new Vector2(0f, 0.03f), 0f, PetReaction.Giggle);
            var funny = Acc("funny_glasses", "acc_funny_glasses", AccessorySlot.Eyes, 0.9f, new Vector2(0f, 0.02f), 0f, PetReaction.Giggle);
            // Presents the friends bring when they jump out of the gift box.
            var royal = Acc("crown", "acc_crown", AccessorySlot.Hat, 0.5f, new Vector2(0f, 0.08f), 0f, PetReaction.Pose);
            var bowTie = Acc("bow_tie", "acc_bow_tie", AccessorySlot.Neck, 0.42f, new Vector2(0f, 0.02f), 0f, PetReaction.Bounce);
            var starClip = Acc("star_clip", "acc_star_clip", AccessorySlot.HeadSide, 0.34f, Vector2.zero, -12f, PetReaction.Wiggle);
            var beanie = Acc("beanie", "acc_beanie", AccessorySlot.Hat, 0.8f, new Vector2(0f, -0.02f), 0f, PetReaction.Giggle);

            var sPuppy = Sticker("happy_puppy", "sticker_puppy_happy");
            var sKitten = Sticker("sleepy_kitten", "sticker_kitten_sleeping");
            var sBunny = Sticker("dancing_bunny", "sticker_bunny_dancing");
            var sPaw = Sticker("paw_print", "sticker_paw");
            var sRainbow = Sticker("rainbow", "sticker_rainbow");
            var sStar = Sticker("star", "sticker_star");
            var sHeart = Sticker("heart", "sticker_heart");
            var sPanda = Sticker("panda_bamboo", "sticker_panda_bamboo");
            var sPiglet = Sticker("piglet_puddle", "sticker_piglet_puddle");
            var sLamb = Sticker("lamb_cloud", "sticker_lamb_cloud");
            var sUnicorn = Sticker("unicorn_rainbow", "sticker_unicorn_rainbow");

            var pets = new Dictionary<string, PetDefinition>();
            foreach (var rp in rig.pets)
            {
                var def = GetOrCreate<PetDefinition>($"{Data}/Pets/{rp.id}.asset");
                def.id = rp.id;
                // Portraits stay in Art/ as references but are not shown in the game, so they are not
                // linked here (that keeps ~6 MB of textures out of every build).
                def.portrait = null;
                def.prefab = BuildPetPrefab(rp, face);
                ColorUtility.TryParseHtmlString("#" + rp.furTint, out var tint);
                def.furTint = tint;
                pets[rp.id] = def;
            }

            // Personalities: each pet has its own favourite moves, voice and tail.
            var puppy = pets["puppy"];
            puppy.displayName = "Biscuit"; puppy.voice = PetVoice.Puppy; puppy.voicePitch = 1f;
            puppy.tapReactions = new List<PetReaction> { PetReaction.Bounce, PetReaction.Giggle, PetReaction.HeadTilt, PetReaction.Jump, PetReaction.Wiggle, PetReaction.Sneeze };
            puppy.favoriteReaction = PetReaction.Bounce;
            puppy.tailWagSpeed = 10f; puppy.tailWagAngle = 18f; puppy.earSwayAngle = 3f; puppy.earSwaySpeed = 0.9f;
            puppy.sticker = sPuppy;
            puppy.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = sun, reaction = PetReaction.Pose }, new AccessoryReaction { accessory = hat, reaction = PetReaction.Bounce } };

            var kitten = pets["kitten"];
            kitten.displayName = "Mochi"; kitten.voice = PetVoice.Kitten; kitten.voicePitch = 1.05f;
            kitten.tapReactions = new List<PetReaction> { PetReaction.HeadTilt, PetReaction.Purr, PetReaction.Surprised, PetReaction.Jump, PetReaction.Giggle };
            kitten.favoriteReaction = PetReaction.Purr;
            kitten.tailWagSpeed = 2.2f; kitten.tailWagAngle = 14f; kitten.earSwayAngle = 0f; kitten.earSwaySpeed = 1f;
            kitten.sticker = sKitten;
            kitten.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = hat, reaction = PetReaction.Jump }, new AccessoryReaction { accessory = bow, reaction = PetReaction.Purr } };

            var bunny = pets["bunny"];
            bunny.displayName = "Clover"; bunny.voice = PetVoice.Bunny; bunny.voicePitch = 1.1f;
            bunny.tapReactions = new List<PetReaction> { PetReaction.EarWiggle, PetReaction.Bounce, PetReaction.Giggle, PetReaction.Jump, PetReaction.Surprised };
            bunny.favoriteReaction = PetReaction.EarWiggle;
            bunny.tailWagSpeed = 6f; bunny.tailWagAngle = 7f; bunny.earSwayAngle = 3.5f; bunny.earSwaySpeed = 0.7f;
            bunny.mouthSmileOverride = S("Characters/Shared/mouth_bunny");
            bunny.mouthLaughOverride = S("Characters/Shared/mouth_bunny_laugh");
            bunny.sticker = sBunny;
            bunny.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = bow, reaction = PetReaction.EarWiggle }, new AccessoryReaction { accessory = crown, reaction = PetReaction.Wiggle } };

            kitten.quirks = PetQuirk.GiantSneezeBubble;
            bunny.quirks = PetQuirk.EarBubbles;
            puppy.quirks = PetQuirk.None;
            foreach (var p in new[] { puppy, kitten, bunny }) { p.startsUnlocked = true; p.unlockOrder = 0; p.giftAccessory = null; }

            // Friends earned from the gift box, in arrival order. Each brings a present for dress-up.
            var panda = pets["panda"];
            panda.displayName = "Bao"; panda.voice = PetVoice.Panda; panda.voicePitch = 1f;
            panda.tapReactions = new List<PetReaction> { PetReaction.Roll, PetReaction.Bounce, PetReaction.Giggle, PetReaction.HeadTilt, PetReaction.Sneeze };
            panda.favoriteReaction = PetReaction.Roll;
            panda.tailWagSpeed = 4f; panda.tailWagAngle = 10f; panda.earSwayAngle = 0f; panda.earSwaySpeed = 1f;
            panda.quirks = PetQuirk.Somersault;
            panda.sticker = sPanda; panda.startsUnlocked = false; panda.unlockOrder = 1; panda.giftAccessory = bowTie;
            panda.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = funny, reaction = PetReaction.Roll } };

            var piglet = pets["piglet"];
            piglet.displayName = "Rosie"; piglet.voice = PetVoice.Piglet; piglet.voicePitch = 1f;
            piglet.tapReactions = new List<PetReaction> { PetReaction.Wiggle, PetReaction.Giggle, PetReaction.Bounce, PetReaction.Surprised, PetReaction.Sneeze };
            piglet.favoriteReaction = PetReaction.Wiggle;
            piglet.tailWagSpeed = 9f; piglet.tailWagAngle = 22f; piglet.earSwayAngle = 0f; piglet.earSwaySpeed = 1f;
            piglet.quirks = PetQuirk.MudLover;
            piglet.sticker = sPiglet; piglet.startsUnlocked = false; piglet.unlockOrder = 2; piglet.giftAccessory = starClip;
            piglet.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = sun, reaction = PetReaction.Pose } };

            var lamb = pets["lamb"];
            lamb.displayName = "Cotton"; lamb.voice = PetVoice.Lamb; lamb.voicePitch = 1f;
            lamb.tapReactions = new List<PetReaction> { PetReaction.Bounce, PetReaction.HeadTilt, PetReaction.Giggle, PetReaction.Jump, PetReaction.Shake };
            lamb.favoriteReaction = PetReaction.Bounce;
            lamb.tailWagSpeed = 6f; lamb.tailWagAngle = 9f; lamb.earSwayAngle = 0f; lamb.earSwaySpeed = 1f;
            lamb.quirks = PetQuirk.ExtraFluffy;
            lamb.sticker = sLamb; lamb.startsUnlocked = false; lamb.unlockOrder = 3; lamb.giftAccessory = beanie;
            lamb.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = crown, reaction = PetReaction.Wiggle } };

            var unicorn = pets["unicorn"];
            unicorn.displayName = "Sparkle"; unicorn.voice = PetVoice.Unicorn; unicorn.voicePitch = 1f;
            unicorn.tapReactions = new List<PetReaction> { PetReaction.Pose, PetReaction.Jump, PetReaction.Giggle, PetReaction.HeadTilt, PetReaction.Bounce };
            unicorn.favoriteReaction = PetReaction.Pose;
            unicorn.tailWagSpeed = 2.2f; unicorn.tailWagAngle = 10f; unicorn.earSwayAngle = 0f; unicorn.earSwaySpeed = 1f;
            unicorn.quirks = PetQuirk.Sparkly;
            unicorn.sticker = sUnicorn; unicorn.startsUnlocked = false; unicorn.unlockOrder = 4; unicorn.giftAccessory = royal;
            unicorn.accessoryReactions = new List<AccessoryReaction> { new AccessoryReaction { accessory = royal, reaction = PetReaction.Pose } };

            // Each pet's own garden toy (and the icon on its big "let's play" button).
            void Toy(PetDefinition p, ToyKind kind, string icon) { p.toy = kind; p.toyIcon = S("Objects/" + icon); }
            Toy(puppy, ToyKind.Frisbee, "garden_frisbee");
            Toy(kitten, ToyKind.Yarn, "garden_yarn");
            Toy(bunny, ToyKind.Carrots, "garden_carrot");
            Toy(panda, ToyKind.Swing, "garden_swing_seat");
            Toy(piglet, ToyKind.Duck, "garden_duck");
            Toy(lamb, ToyKind.Trampoline, "garden_trampoline");
            Toy(unicorn, ToyKind.Hoop, "garden_hoop");

            sPuppy.pet = puppy; sKitten.pet = kitten; sBunny.pet = bunny;
            sPanda.pet = panda; sPiglet.pet = piglet; sLamb.pet = lamb; sUnicorn.pet = unicorn;
            foreach (var p in pets.Values) EditorUtility.SetDirty(p);
            foreach (var s in new[] { sPuppy, sKitten, sBunny, sPanda, sPiglet, sLamb, sUnicorn }) EditorUtility.SetDirty(s);

            var starter = GetOrCreate<ContentPack>($"{Data}/Packs/StarterPack.asset");
            starter.id = "starter"; starter.displayName = "Starter Clubhouse"; starter.isFree = true; starter.futureProductId = "";
            starter.pets = new List<PetDefinition> { puppy, kitten, bunny };
            starter.accessories = new List<AccessoryDefinition> { hat, bow, sun, collar, crown, funny };
            starter.stickers = new List<StickerDefinition> { sPuppy, sKitten, sBunny, sPaw, sRainbow, sStar, sHeart };
            EditorUtility.SetDirty(starter);

            // Free: these friends are earned by playing (hearts in the gift box), never bought.
            var friends = GetOrCreate<ContentPack>($"{Data}/Packs/FriendsPack.asset");
            friends.id = "friends"; friends.displayName = "Clubhouse Friends"; friends.isFree = true; friends.futureProductId = "";
            friends.pets = new List<PetDefinition> { panda, piglet, lamb, unicorn };
            friends.accessories = new List<AccessoryDefinition> { bowTie, starClip, beanie, royal };
            friends.stickers = new List<StickerDefinition> { sPanda, sPiglet, sLamb, sUnicorn };
            EditorUtility.SetDirty(friends);

            // Future paid packs: empty, locked placeholders that document the content model. They are
            // never shown to children and contain no purchase code.
            var future = new List<ContentPack>();
            foreach (var (id, name, product) in new[] { ("fantasy_pets", "Fantasy Pets Pack", "oopsiepets.pack.fantasy"), ("farm_friends", "Farm Friends Pack", "oopsiepets.pack.farm"), ("decorations", "Decoration Pack", "oopsiepets.pack.decor") })
            {
                var pack = GetOrCreate<ContentPack>($"{Data}/Packs/{id}.asset");
                pack.id = id; pack.displayName = name; pack.isFree = false; pack.futureProductId = product;
                EditorUtility.SetDirty(pack);
                future.Add(pack);
            }

            var db = GetOrCreate<ContentDatabase>($"{Data}/ContentDatabase.asset");
            db.packs = new List<ContentPack> { starter, friends };
            db.packs.AddRange(future);
            db.defaultFace = face;
            EditorUtility.SetDirty(db);

            BuildBubblePrefab();
            BuildAccessoryButtonPrefab();
            AssetDatabase.SaveAssets();
            return "data + prefabs built";
        }

        static GameObject SpriteGO(string name, Transform parent, Sprite sprite, int order, Vector3 pos, float scale, float rot = 0f)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = pos;
            go.transform.localScale = Vector3.one * scale;
            go.transform.localRotation = Quaternion.Euler(0f, 0f, rot);
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = sprite;
            sr.sortingOrder = order;
            return go;
        }

        static GameObject Empty(string name, Transform parent, Vector3 pos)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = pos;
            return go;
        }

        public static PetView BuildPetPrefab(RigPet rp, FaceSet face)
        {
            const float U = 100f; // rig pixels per unit
            var root = new GameObject("Pet_" + rp.id);
            var view = root.AddComponent<PetView>();
            var rig = root.GetComponent<PetRig>();
            rig.sortingGroup = root.AddComponent<SortingGroup>();
            var visual = Empty("Visual", root.transform, Vector3.zero).transform;
            rig.visual = visual;

            string folder = $"Characters/{rp.folder}/";
            var headP = rp.Part("head");
            var bodyP = rp.Part("body");
            var tailP = rp.Part("tail");
            float hs = headP.scale;

            if (tailP != null)
                rig.tail = SpriteGO("Tail", visual, S(folder + tailP.file), 1, new Vector3(tailP.x / U, tailP.y / U), tailP.scale, tailP.rot).transform;
            var body = SpriteGO("Body", visual, S(folder + bodyP.file), 10, new Vector3(bodyP.x / U, bodyP.y / U), bodyP.scale);
            rig.body = body.transform;
            rig.bodyRenderer = body.GetComponent<SpriteRenderer>();
            rig.bodyDecor = Empty("BodyDecor", body.transform, Vector3.zero).transform;

            var head = SpriteGO("Head", visual, S(folder + headP.file), 40, new Vector3(headP.x / U, headP.y / U), hs);
            rig.head = head.transform;
            rig.headRenderer = head.GetComponent<SpriteRenderer>();
            Vector3 HeadLocal(float rx, float ry) => new Vector3(rx / U / hs, ry / U / hs, 0f);

            foreach (var side in new[] { "ear_left", "ear_right" })
            {
                var e = rp.Part(side);
                if (e == null) continue;
                var ear = SpriteGO(side == "ear_left" ? "EarLeft" : "EarRight", head.transform, S(folder + e.file),
                    e.order == 0 ? 2 : 42, HeadLocal(e.x - headP.x, e.y - headP.y), e.scale / hs, e.rot);
                if (side == "ear_left") rig.earLeft = ear.transform; else rig.earRight = ear.transform;
            }

            rig.eyeLeft = SpriteGO("EyeLeft", head.transform, face.eyeOpen, 45, HeadLocal(-rp.eyeDx, rp.eyeY), rp.eyeScale / hs).GetComponent<SpriteRenderer>();
            rig.eyeRight = SpriteGO("EyeRight", head.transform, face.eyeOpen, 45, HeadLocal(rp.eyeDx, rp.eyeY), rp.eyeScale / hs).GetComponent<SpriteRenderer>();
            rig.mouth = SpriteGO("Mouth", head.transform, face.mouthSmile, 46, HeadLocal(0f, rp.mouthY), rp.mouthScale / hs).GetComponent<SpriteRenderer>();
            rig.headDecor = Empty("HeadDecor", head.transform, Vector3.zero).transform;
            rig.hatAnchor = Empty("HatAnchor", head.transform, HeadLocal(rp.hat[0], rp.hat[1])).transform;
            rig.eyesAnchor = Empty("EyesAnchor", head.transform, HeadLocal(rp.eyes[0], rp.eyes[1])).transform;
            rig.sideAnchor = Empty("SideAnchor", head.transform, HeadLocal(rp.side[0], rp.side[1])).transform;
            rig.neckAnchor = Empty("NeckAnchor", head.transform, HeadLocal(rp.neck[0], rp.neck[1])).transform;
            rig.headWidth = rp.headWidth / U / hs;

            // Tap area covering head and body (generous for small fingers).
            var b = rig.bodyRenderer.bounds;
            b.Encapsulate(rig.headRenderer.bounds);
            var col = root.AddComponent<BoxCollider2D>();
            col.isTrigger = true;
            col.offset = b.center;
            col.size = new Vector2(b.size.x * 0.92f, b.size.y * 0.95f);

            var anim = root.GetComponent<PetAnimator>();
            anim.face = face;

            var path = $"{Root}/Prefabs/Characters/Pet_{char.ToUpper(rp.id[0]) + rp.id.Substring(1)}.prefab";
            var prefab = PrefabUtility.SaveAsPrefabAsset(root, path);
            Object.DestroyImmediate(root);
            return prefab.GetComponent<PetView>();
        }

        static void BuildBubblePrefab()
        {
            var go = new GameObject("Bubble");
            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = S("Effects/bubble");
            go.AddComponent<CircleCollider2D>().isTrigger = true;
            go.AddComponent<Bubble>();
            PrefabUtility.SaveAsPrefabAsset(go, $"{Root}/Prefabs/Objects/Bubble.prefab");
            Object.DestroyImmediate(go);
        }

        static void BuildAccessoryButtonPrefab()
        {
            var go = new GameObject("AccessoryButton", typeof(RectTransform));
            var rt = (RectTransform)go.transform;
            rt.sizeDelta = new Vector2(150, 150);
            var bg = go.AddComponent<Image>();
            bg.sprite = S("UI/btn_blank_cream");
            var btn = go.AddComponent<Button>();
            btn.transition = Selectable.Transition.None;
            go.AddComponent<CandyButton>();
            var ring = new GameObject("Ring", typeof(RectTransform)).AddComponent<Image>();
            ring.transform.SetParent(go.transform, false);
            UIKit.Stretch(ring.rectTransform, -14f);
            ring.sprite = S("UI/select_ring");
            ring.raycastTarget = false;
            var icon = new GameObject("Icon", typeof(RectTransform)).AddComponent<Image>();
            icon.transform.SetParent(go.transform, false);
            UIKit.Stretch(icon.rectTransform, 24f);
            icon.preserveAspect = true;
            icon.raycastTarget = false;
            var ab = go.AddComponent<AccessoryButton>();
            ab.icon = icon;
            ab.ring = ring;
            PrefabUtility.SaveAsPrefabAsset(go, $"{Root}/Prefabs/UI/AccessoryButton.prefab");
            Object.DestroyImmediate(go);
        }
    }
}
