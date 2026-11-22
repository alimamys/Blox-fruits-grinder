using System.Collections.Generic;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.UI;

namespace OopsiePets.EditorTools
{
    /// <summary>
    /// Builds Assets/OopsiePets/Scenes/OopsiePets_Main.unity from scratch: camera, lighting, the three
    /// screens (clubhouse, care activities, sticker album), all UI, and every reference wired up.
    /// Safe to re-run; it rewrites the scene.
    /// </summary>
    public static class OopsieScene
    {
        public const string ScenePath = OopsieImport.Root + "/Scenes/OopsiePets_Main.unity";
        static Sprite S(string rel) => OopsieData.S(rel);

        static Transform Node(string name, Transform parent, Vector3 pos)
        {
            var go = new GameObject(name);
            if (parent) go.transform.SetParent(parent, false);
            go.transform.localPosition = pos;
            return go.transform;
        }

        static SpriteRenderer Spr(string name, Transform parent, Sprite sprite, Vector3 pos, float scale, int order)
        {
            var t = Node(name, parent, pos);
            t.localScale = Vector3.one * scale;
            var sr = t.gameObject.AddComponent<SpriteRenderer>();
            sr.sprite = sprite;
            sr.sortingOrder = order;
            return sr;
        }

        static SpriteRenderer Background(string name, Transform parent, Sprite sprite, Camera cam)
        {
            var sr = Spr(name, parent, sprite, Vector3.zero, 1f, -100);
            sr.gameObject.AddComponent<BackgroundFit>().cam = cam;
            return sr;
        }

        [MenuItem("Oopsie Pets/3. Build Scene")]
        public static string Build()
        {
            var db = AssetDatabase.LoadAssetAtPath<ContentDatabase>(OopsieImport.Root + "/Data/ContentDatabase.asset");
            var face = AssetDatabase.LoadAssetAtPath<FaceSet>(OopsieImport.Root + "/Data/FaceSet.asset");
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            // ---------- Camera, light, post ----------
            var camGo = new GameObject("Main Camera");
            camGo.tag = "MainCamera";
            camGo.transform.position = new Vector3(0, 0, -10);
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true;
            cam.orthographicSize = 9.6f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = Palette.Cream;
            camGo.AddComponent<AudioListener>();
            camGo.AddComponent<CameraFit>();
            var camData = camGo.AddComponent<UniversalAdditionalCameraData>();
            camData.renderPostProcessing = true;

            var light = new GameObject("Global Light 2D").AddComponent<Light2D>();
            light.lightType = Light2D.LightType.Global;
            light.intensity = 1f;
            light.color = Palette.Untinted;

            var volGo = new GameObject("Global Volume");
            var vol = volGo.AddComponent<Volume>();
            vol.isGlobal = true;
            vol.sharedProfile = PostProfile();

            // ---------- Systems ----------
            var systems = Node("Systems", null, Vector3.zero);
            var flow = systems.gameObject.AddComponent<GameFlow>();
            flow.database = db;
            flow.face = face;
            systems.gameObject.AddComponent<AudioManager>();
            var fx = Node("FX", null, Vector3.zero).gameObject.AddComponent<FxSpawner>();
            fx.sparkleYellow = S("Effects/fx_sparkle_yellow");
            fx.sparklePink = S("Effects/fx_sparkle_pink");
            fx.heart = S("Effects/fx_heart");
            fx.glowDot = S("Effects/fx_glow_dot");
            fx.star = S("Effects/fx_star");
            fx.foamPuff = S("Effects/fx_foam_puff");
            fx.bubble = S("Effects/bubble");

            var es = new GameObject("EventSystem");
            es.AddComponent<EventSystem>();
            es.AddComponent<InputSystemUIInputModule>().AssignDefaultActions();

            // ---------- UI root ----------
            var canvasGo = new GameObject("UI", typeof(RectTransform));
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceCamera;
            canvas.worldCamera = cam;
            canvas.planeDistance = 5f;
            canvas.sortingOrder = 1000;
            var scaler = canvasGo.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0f;
            canvasGo.AddComponent<GraphicRaycaster>();
            var canvasRect = (RectTransform)canvasGo.transform;

            var catcher = UIKit.Image("InputCatcher", canvasRect, null, Palette.WithAlpha(Palette.Untinted, 0f), true);
            UIKit.Stretch(catcher.rectTransform);
            var router = catcher.gameObject.AddComponent<InputRouter>();
            router.worldCamera = cam;

            RectTransform MakeScreen(string name)
            {
                var r = UIKit.Rect(name, canvasRect);
                UIKit.Stretch(r);
                var safe = UIKit.Rect("Safe", r);
                UIKit.Stretch(safe);
                safe.gameObject.AddComponent<SafeArea>();
                return safe;
            }

            var tl = new Vector2(0, 1);
            var tr = new Vector2(1, 1);
            var bc = new Vector2(0.5f, 0);
            var mid = new Vector2(0.5f, 0.5f);

            // ---------- Clubhouse ----------
            var clubWorld = Node("ClubhouseWorld", null, Vector3.zero);
            Background("Background", clubWorld, S("Backgrounds/bg_clubhouse"), cam);
            // Beds are laid out by the Clubhouse at runtime (all eleven friends; locked ones nap behind a padlock).
            var basket = Spr("ToyBasket", clubWorld, S("Objects/toy_basket"), new Vector3(-4.7f, -9.15f), 0.42f, 30);
            basket.gameObject.AddComponent<BoxCollider2D>().isTrigger = true;
            basket.gameObject.AddComponent<ClubhouseToy>().kind = ClubhouseToy.Kind.Basket;
            var ball = Spr("ToyBall", clubWorld, S("Objects/toy_ball"), new Vector3(4.8f, -9.25f), 0.4f, 31);
            ball.gameObject.AddComponent<CircleCollider2D>().isTrigger = true;
            ball.gameObject.AddComponent<ClubhouseToy>().kind = ClubhouseToy.Kind.Ball;
            var door = Node("Door", clubWorld, new Vector3(7.2f, -3.2f));
            var club = clubWorld.gameObject.AddComponent<Clubhouse>();
            club.bedSprite = S("Objects/pet_bed");
            club.thoughtBubble = S("UI/thought_bubble");
            club.padlockSprite = S("UI/lock_padlock");
            club.starEmpty = S("UI/lock_star_empty");
            club.starFull = S("UI/lock_star_full");
            club.doorSpot = door;
            club.mudSprites = MudSprites();

            var clubUI = MakeScreen("ClubhouseUI");
            var albumBtn = UIKit.Button("AlbumButton", clubUI, S("UI/btn_album"), tl, tl, new Vector2(40, -40), 220, pulse: false);
            var settingsBtn = UIKit.Button("SettingsButton", clubUI, S("UI/btn_settings"), tr, tr, new Vector2(-40, -40), 120);
            club.settingsButton = settingsBtn.transform as RectTransform;

            // ---------- Care (activities) ----------
            var careWorld = Node("CareWorld", null, Vector3.zero);
            var careBg = Background("Background", careWorld, S("Backgrounds/bg_washroom"), cam);
            var tubStage = Node("TubStage", careWorld, new Vector3(0f, -3.45f));
            var tub = Spr("TubFront", careWorld, S("Objects/bathtub"), new Vector3(0f, -4.95f), 1.05f, 100);
            var cushionStage = Node("CushionStage", careWorld, new Vector3(0f, -4.6f));
            var cushion = Spr("Cushion", careWorld, S("Objects/pet_bed"), new Vector3(0f, -4.35f), 1.05f, 5);
            var dressStage = Node("DressStage", careWorld, new Vector3(0f, -4.0f));
            var matStage = Node("MatStage", careWorld, new Vector3(0f, -6.2f));
            var teethStage = Node("TeethStage", careWorld, new Vector3(0f, -9.6f));
            tub.gameObject.SetActive(false);
            cushion.gameObject.SetActive(false);

            var activities = Node("Activities", careWorld, Vector3.zero);
            // Wash
            var washT = Node("Wash", activities, Vector3.zero);
            var wash = washT.gameObject.AddComponent<WashActivity>();
            wash.background = S("Backgrounds/bg_washroom");
            wash.petScale = 0.7f;
            wash.tubFront = tub;
            wash.mudSprites = MudSprites();
            wash.spongeHome = Node("SpongeHome", washT, new Vector3(3.1f, -8.2f));
            wash.sponge = Spr("Sponge", washT, S("Objects/sponge"), new Vector3(3.1f, -8.2f), 0.58f, 200).transform;
            wash.sudsSprite = S("Effects/fx_foam_puff");

            // Rinse (after the bubbles): spray the suds away with the shower.
            var rinseT = Node("Rinse", activities, Vector3.zero);
            var rinse = rinseT.gameObject.AddComponent<RinseActivity>();
            rinse.background = S("Backgrounds/bg_washroom");
            rinse.petScale = 0.7f;
            rinse.tubFront = tub;
            rinse.showerHome = Node("ShowerHome", rinseT, new Vector3(3.4f, -7.6f));
            rinse.shower = Spr("Shower", rinseT, S("Objects/bath_shower"), new Vector3(3.4f, -7.6f), WidthScale("Objects/bath_shower", 1.9f), 200).transform;
            rinse.shower.gameObject.SetActive(false);
            rinse.dropSprite = S("Effects/fx_water_drop");
            rinse.sudsSprite = S("Effects/fx_foam_puff");

            // Shampoo (first step of bath time)
            var shampooT = Node("Shampoo", activities, Vector3.zero);
            var shampoo = shampooT.gameObject.AddComponent<ShampooActivity>();
            shampoo.background = S("Backgrounds/bg_washroom");
            shampoo.petScale = 0.7f;
            shampoo.tubFront = tub;
            shampoo.foamSprite = S("Effects/fx_foam_puff");
            shampoo.bottleHome = Node("BottleHome", shampooT, new Vector3(3.4f, -7.9f));
            shampoo.bottle = Spr("Bottle", shampooT, S("Objects/bath_shampoo"), new Vector3(3.4f, -7.9f), WidthScale("Objects/bath_shampoo", 1.3f), 200).transform;

            // Dry off on a fluffy bath mat with a towel
            var dryT = Node("Dry", activities, Vector3.zero);
            var dry = dryT.gameObject.AddComponent<DryActivity>();
            dry.background = S("Backgrounds/bg_washroom");
            dry.petScale = 0.66f;
            dry.mat = Spr("BathMat", careWorld, S("Objects/bath_mat"), new Vector3(0f, -6.3f), WidthScale("Objects/bath_mat", 5.4f), 3);
            dry.mat.gameObject.SetActive(false);
            dry.towelHome = Node("TowelHome", dryT, new Vector3(3.0f, -8.4f));
            dry.towel = Spr("Towel", dryT, S("Objects/bath_towel"), new Vector3(3.0f, -8.4f), WidthScale("Objects/bath_towel", 2.5f), 200).transform;
            dry.dropSprite = S("Effects/fx_water_drop");

            // Brush teeth (big and close up, so the teeth are easy to reach)
            var teethT = Node("Teeth", activities, Vector3.zero);
            var teeth = teethT.gameObject.AddComponent<TeethActivity>();
            teeth.background = S("Backgrounds/bg_washroom");
            teeth.petScale = 1.05f;
            teeth.mouthSprite = S("Characters/Shared/mouth_teeth_open");
            teeth.speckSprites = new[] { S("Effects/teeth_speck_01"), S("Effects/teeth_speck_02") };
            teeth.brushHome = Node("BrushHome", teethT, new Vector3(3.0f, -8.5f));
            teeth.brush = Spr("Toothbrush", teethT, S("Objects/bath_toothbrush"), new Vector3(3.0f, -8.5f), WidthScale("Objects/bath_toothbrush", 2.6f), 200).transform;
            teeth.cupHome = Node("CupHome", teethT, new Vector3(-3.3f, -8.2f));
            teeth.cup = Spr("Cup", teethT, S("Objects/bath_cup"), new Vector3(-3.3f, -8.2f), WidthScale("Objects/bath_cup", 1.4f), 200).transform;
            teeth.cup.gameObject.SetActive(false);
            // Bubbles
            var bubT = Node("Bubbles", activities, Vector3.zero);
            var bubbles = bubT.gameObject.AddComponent<BubbleActivity>();
            bubbles.background = S("Backgrounds/bg_washroom");
            bubbles.petScale = 0.7f;
            bubbles.tubFront = tub;
            bubbles.spawnLine = Node("SpawnLine", bubT, new Vector3(0f, -2.8f));
            bubbles.bubblePrefab = AssetDatabase.LoadAssetAtPath<GameObject>(OopsieImport.Root + "/Prefabs/Objects/Bubble.prefab").GetComponent<Bubble>();
            // Brush
            var brushT = Node("Brush", activities, Vector3.zero);
            var brush = brushT.gameObject.AddComponent<BrushActivity>();
            brush.background = S("Backgrounds/bg_dressup");
            brush.petScale = 0.66f;
            brush.cushion = cushion;
            brush.tuftSprites = new[] { S("Effects/fur_tuft_01"), S("Effects/fur_tuft_02"), S("Effects/fur_tuft_03"), S("Effects/fur_tuft_04"), S("Effects/fur_tuft_05"), S("Effects/fur_tuft_06") };
            brush.brushHome = Node("BrushHome", brushT, new Vector3(3.0f, -8.3f));
            brush.brush = Spr("BrushTool", brushT, S("Objects/brush"), new Vector3(3.0f, -8.3f), 0.62f, 200).transform;
            // Dress-up
            var dressT = Node("DressUp", activities, Vector3.zero);
            var dress = dressT.gameObject.AddComponent<DressUpActivity>();
            dress.background = S("Backgrounds/bg_dressup");
            dress.petScale = 0.7f;
            dress.database = db;
            dress.buttonPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(OopsieImport.Root + "/Prefabs/UI/AccessoryButton.prefab").GetComponent<AccessoryButton>();

            // Garden: play outside with each pet's own toy (and get muddy)
            var gardenStage = Node("GardenStage", careWorld, new Vector3(0f, -4.5f));
            var outT = Node("Outdoor", activities, Vector3.zero);
            var outdoor = outT.gameObject.AddComponent<OutdoorActivity>();
            outdoor.background = S("Backgrounds/bg_garden");
            outdoor.petScale = 0.5f;
            outdoor.mudSprites = MudSprites();
            outdoor.puddle = Spr("Puddle", outT, S("Objects/garden_puddle"), Vector3.zero, 1f, 2);
            outdoor.toys = BuildToys(outT);

            var careUI = MakeScreen("CareUI");
            var home = UIKit.Button("HomeButton", careUI, S("UI/btn_home"), tl, tl, new Vector2(40, -40), 190);
            var starsRt = UIKit.Rect("Stars", careUI);
            UIKit.Place(starsRt, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(60, -60), new Vector2(480, 150));
            var stars = starsRt.gameObject.AddComponent<ProgressStars>();
            stars.stars = new Image[3];
            for (int i = 0; i < 3; i++)
            {
                var st = UIKit.Image("Star" + (i + 1), starsRt, S("UI/star_icon"), Palette.Untinted);
                UIKit.Place(st.rectTransform, mid, mid, new Vector2((i - 1) * 155, 0), new Vector2(140, 140));
                stars.stars[i] = st;
            }
            var next = UIKit.Button("NextButton", careUI, S("UI/btn_play"), bc, bc, new Vector2(0, 140), 270, pulse: true);
            var trayRt = UIKit.Image("DressTray", careUI, S("UI/panel_lavender"), Palette.Untinted, true);
            UIKit.Place(trayRt.rectTransform, bc, bc, new Vector2(0, 24), new Vector2(1040, 220));
            var trayGroup = trayRt.gameObject.AddComponent<CanvasGroup>();
            var row = trayRt.gameObject.AddComponent<GridLayoutGroup>();
            row.padding = new RectOffset(24, 24, 30, 30);
            row.spacing = new Vector2(16, 16);
            row.cellSize = new Vector2(150, 150);
            row.childAlignment = TextAnchor.MiddleCenter;
            row.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            row.constraintCount = 6;
            dress.grid = row;
            var done = UIKit.Button("DoneButton", trayRt.transform, S("UI/btn_done"), new Vector2(1, 1), new Vector2(1, 0), new Vector2(-10, 30), 220, pulse: true);
            done.gameObject.AddComponent<LayoutElement>().ignoreLayout = true;
            // Rainbow coat (appears once the pet has its sticker): sits on the tray's top-left corner.
            var rainbowBtn = UIKit.IconButton("RainbowButton", trayRt.transform, S("UI/btn_blank_lavender"), S("Stickers/sticker_rainbow"), new Vector2(0, 1), new Vector2(0, 0), new Vector2(10, 30), 190, 0.14f);
            rainbowBtn.gameObject.AddComponent<LayoutElement>().ignoreLayout = true;
            var rainbowRing = UIKit.Image("Ring", rainbowBtn.transform, S("UI/select_ring"), Palette.Untinted);
            UIKit.Stretch(rainbowRing.rectTransform, -14f);
            rainbowRing.raycastTarget = false;
            dress.rainbowButton = rainbowBtn;
            dress.rainbowRing = rainbowRing.gameObject;
            dress.tray = trayRt.rectTransform;
            dress.trayGroup = trayGroup;
            dress.doneButton = done;
            trayRt.gameObject.SetActive(false);

            // ---------- Album ----------
            var albumWorld = Node("AlbumWorld", null, Vector3.zero);
            Background("Background", albumWorld, S("Backgrounds/bg_album"), cam);
            // Two album pages, four stickers per row, two rows per page (16 slots: one per friend, plus extras).
            var slotPos = new List<Vector3>();
            foreach (var y in new[] { 5.6f, 2.3f, -2.0f, -5.3f })
                foreach (var x in new[] { -3.45f, -1.15f, 1.15f, 3.45f }) slotPos.Add(new Vector3(x, y));
            var slots = new List<Transform>();
            for (int i = 0; i < slotPos.Count; i++) slots.Add(Node("Slot" + (i + 1), albumWorld, slotPos[i]));
            var album = albumWorld.gameObject.AddComponent<AlbumScreen>();
            album.slots = slots.ToArray();
            album.stickerSize = 2.05f;
            var albumUI = MakeScreen("AlbumUI");
            var back = UIKit.Button("BackButton", albumUI, S("UI/btn_back"), tl, tl, new Vector2(40, -40), 190);

            // ---------- Overlays ----------
            var menuRoot = UIKit.Rect("CareMenu", canvasRect);
            UIKit.Stretch(menuRoot);
            var menuGroup = menuRoot.gameObject.AddComponent<CanvasGroup>();
            var menuPanel = UIKit.Rect("Panel", menuRoot);
            UIKit.Place(menuPanel, mid, mid, Vector2.zero, new Vector2(660, 420));
            // Big "let's play" button: shows the tapped pet's own garden toy.
            var full = UIKit.IconButton("FullCare", menuPanel, S("UI/btn_blank_yellow"), S("Objects/garden_frisbee"), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0, 0), 230, 0.17f);
            full.GetComponent<CandyButton>().pulse = true;
            var fullIcon = full.transform.Find("Icon").GetComponent<Image>();
            var acts = new[] { ("Wash", "btn_blank_turquoise", "Objects/sponge"), ("Bubbles", "btn_blank_blue", "Effects/bubble"), ("Brush", "btn_blank_pink", "Objects/brush"), ("Dress", "btn_blank_yellow", "Accessories/acc_bow") };
            var actBtns = new Button[4];
            for (int i = 0; i < 4; i++)
                actBtns[i] = UIKit.IconButton(acts[i].Item1, menuPanel, S("UI/" + acts[i].Item2), S(acts[i].Item3), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2((i - 1.5f) * 160, 0), 145, 0.2f);
            var menu = menuRoot.gameObject.AddComponent<CareMenu>();
            menu.fullCare = full; menu.fullCareIcon = fullIcon; menu.wash = actBtns[0]; menu.bubbles = actBtns[1]; menu.brush = actBtns[2]; menu.dress = actBtns[3];
            menu.group = menuGroup; menu.panel = menuPanel; menu.worldCamera = cam; menu.canvasRect = canvasRect; menu.canvasCamera = cam;
            club.menu = menu;

            var rewardRoot = UIKit.Rect("Reward", canvasRect);
            UIKit.Stretch(rewardRoot);
            var rewardGroup = rewardRoot.gameObject.AddComponent<CanvasGroup>();
            var dim = UIKit.Image("Dim", rewardRoot, null, Palette.WithAlpha(Palette.Ink, 0.35f), true);
            UIKit.Stretch(dim.rectTransform);
            var rays = UIKit.Image("Rays", rewardRoot, S("UI/sunburst"), Palette.Untinted);
            UIKit.Place(rays.rectTransform, mid, mid, new Vector2(0, 330), new Vector2(1100, 1100));
            var stickerImg = UIKit.Image("Sticker", rewardRoot, null, Palette.Untinted);
            UIKit.Place(stickerImg.rectTransform, mid, mid, new Vector2(0, 330), new Vector2(620, 620));
            var rewardHome = UIKit.Button("HomeButton", rewardRoot, S("UI/btn_home"), bc, bc, new Vector2(0, 170), 250, pulse: true);
            var albumTarget = UIKit.Rect("AlbumTarget", rewardRoot);
            UIKit.Place(albumTarget, tl, tl, new Vector2(150, -150), new Vector2(10, 10));
            var reward = rewardRoot.gameObject.AddComponent<RewardPanel>();
            reward.group = rewardGroup; reward.stickerRect = stickerImg.rectTransform; reward.sticker = stickerImg; reward.rays = rays.rectTransform;
            reward.homeButton = rewardHome; reward.albumTarget = albumTarget;

            var hintRoot = UIKit.Rect("FingerHint", canvasRect);
            UIKit.Stretch(hintRoot);
            var hand = UIKit.Image("Hand", hintRoot, S("UI/hand_pointer"), Palette.Untinted);
            UIKit.Place(hand.rectTransform, mid, mid, Vector2.zero, new Vector2(210, 240));
            var hint = hintRoot.gameObject.AddComponent<FingerHint>();
            hint.hand = hand; hint.worldCamera = cam; hint.canvasRect = canvasRect; hint.canvasCamera = cam;
            club.hint = hint;

            var gate = BuildParentGate(canvasRect);
            var settings = BuildSettings(canvasRect);

            var fadeImg = UIKit.Image("Fader", canvasRect, null, Palette.Lavender, false);
            UIKit.Stretch(fadeImg.rectTransform);
            var fader = fadeImg.gameObject.AddComponent<Fader>();
            fader.overlay = fadeImg;

            // ---------- Care session wiring ----------
            var session = careWorld.gameObject.AddComponent<CareSession>();
            session.activities = new List<Activity> { outdoor, shampoo, wash, bubbles, rinse, dry, brush, teeth, dress };
            session.context = new ActivityContext { camera = cam, stage = tubStage, background = careBg, stars = stars, hint = hint };
            session.tubStage = tubStage; session.cushionStage = cushionStage; session.dressStage = dressStage; session.gardenStage = gardenStage;
            session.matStage = matStage; session.teethStage = teethStage;
            session.homeButton = home; session.nextButton = next; session.reward = reward;
            foreach (var a in session.activities) a.gameObject.SetActive(false);

            flow.fader = fader;
            flow.rainbowMaterial = RainbowMaterial();
            flow.clubhouseWorld = clubWorld.gameObject; flow.clubhouseUI = clubUI.parent.gameObject;
            flow.careWorld = careWorld.gameObject; flow.careUI = careUI.parent.gameObject;
            flow.albumWorld = albumWorld.gameObject; flow.albumUI = albumUI.parent.gameObject;
            flow.clubhouse = club; flow.care = session; flow.album = album;
            flow.parentGate = gate; flow.settings = settings;
            flow.albumButton = albumBtn; flow.albumBackButton = back; flow.settingsButton = settingsBtn;

            careWorld.gameObject.SetActive(false);
            careUI.parent.gameObject.SetActive(false);
            albumWorld.gameObject.SetActive(false);
            albumUI.parent.gameObject.SetActive(false);

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            return "scene built: " + ScenePath;
        }

        static Material StringMaterial()
        {
            const string path = OopsieImport.Root + "/Data/StringUnlit.mat";
            var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m == null)
            {
                m = new Material(Shader.Find("Universal Render Pipeline/2D/Sprite-Unlit-Default")) { name = "StringUnlit" };
                AssetDatabase.CreateAsset(m, path);
            }
            return m;
        }

        static Material RainbowMaterial()
        {
            const string path = OopsieImport.Root + "/Data/RainbowCoat.mat";
            var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m == null)
            {
                m = new Material(Shader.Find("OopsiePets/RainbowSprite")) { name = "RainbowCoat" };
                AssetDatabase.CreateAsset(m, path);
            }
            return m;
        }

        static LineRenderer Line(string name, Transform parent, Material mat, float width, Color color, int order)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var lr = go.AddComponent<LineRenderer>();
            lr.sharedMaterial = mat;
            lr.useWorldSpace = true;
            lr.widthMultiplier = width;
            lr.widthCurve = AnimationCurve.Linear(0f, 1f, 1f, 0.75f);
            lr.numCapVertices = 6;
            lr.numCornerVertices = 4;
            lr.startColor = lr.endColor = color;
            lr.sortingOrder = order;
            lr.positionCount = 0;
            lr.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            lr.receiveShadows = false;
            return lr;
        }

        static float WidthScale(string sprite, float width) => width / Mathf.Max(0.01f, S(sprite).bounds.size.x);

        /// <summary>The eleven garden toys, one per <see cref="ToyKind"/> (positions are world units on the lawn).</summary>
        static PlayToy[] BuildToys(Transform parent)
        {
            var toys = new PlayToy[System.Enum.GetValues(typeof(ToyKind)).Length];
            Transform P(string n, Transform p, float x, float y) => Node(n, p, new Vector3(x, y));
            SpriteRenderer Prop(string n, Transform p, string sprite, float x, float y, float width, int order) =>
                Spr(n, p, S("Objects/" + sprite), new Vector3(x, y), WidthScale("Objects/" + sprite, width), order);

            // Puppy: frisbee fetch
            var fr = Node("FrisbeeToy", parent, Vector3.zero);
            var frisbee = fr.gameObject.AddComponent<FrisbeeToy>();
            frisbee.petStart = P("PetStart", fr, -2.2f, -4.4f);
            frisbee.discHome = P("DiscHome", fr, 2.4f, -7.8f);
            frisbee.disc = Prop("Disc", fr, "garden_frisbee", 2.4f, -7.8f, 1.5f, 20).transform;
            frisbee.puddleSpot = P("PuddleSpot", fr, 1.8f, -4.2f);
            frisbee.puddleWidth = 3.4f;
            toys[(int)ToyKind.Frisbee] = frisbee;

            // Kitten: yarn ball
            var ya = Node("YarnToy", parent, Vector3.zero);
            var yarn = ya.gameObject.AddComponent<YarnToy>();
            yarn.petStart = P("PetStart", ya, -2.2f, -4.6f);
            yarn.yarnHome = P("YarnHome", ya, 2.0f, -7.2f);
            yarn.yarn = Prop("Yarn", ya, "garden_yarn", 2.0f, -7.2f, 1.3f, 12).transform;
            yarn.puddleSpot = P("PuddleSpot", ya, 2.0f, -3.9f);
            yarn.puddleWidth = 3.2f;
            // The loose string: a lavender line with a plum edge, drawn under the ball and under the kitten.
            var stringMat = StringMaterial();
            yarn.strandEdge = Line("StringEdge", ya, stringMat, 0.13f, new Color(0.36f, 0.27f, 0.4f, 1f), 7);
            yarn.strand = Line("String", ya, stringMat, 0.075f, new Color(0.8f, 0.7f, 0.88f, 1f), 8);
            yarn.yarnRadius = yarn.yarn.GetComponent<SpriteRenderer>().bounds.extents.x * 0.85f;
            toys[(int)ToyKind.Yarn] = yarn;

            // Bunny: carrot patch
            var ca = Node("CarrotToy", parent, Vector3.zero);
            var carrots = ca.gameObject.AddComponent<CarrotToy>();
            carrots.petStart = P("PetStart", ca, -3.3f, -4.2f);
            carrots.mounds = new[]
            {
                Prop("Carrot1", ca, "garden_carrot_mound", -0.4f, -7.4f, 1.7f, 4),
                Prop("Carrot2", ca, "garden_carrot_mound", 1.5f, -4.3f, 1.7f, 4),
                Prop("Carrot3", ca, "garden_carrot_mound", 3.3f, -7.0f, 1.7f, 4),
            };
            carrots.carrotSprite = S("Objects/garden_carrot");
            carrots.dugSprite = S("Effects/mud_splat_04");
            toys[(int)ToyKind.Carrots] = carrots;

            // Panda: rope swing (ropes stretch up off the top of the screen)
            var sw = Node("SwingToy", parent, Vector3.zero);
            var swing = sw.gameObject.AddComponent<SwingToy>();
            var pivot = P("Pivot", sw, 0.4f, 10.4f);
            const float seatW = 0.62f, plankTop = -3.6f;
            var seatSprite = S("Objects/garden_swing_seat");
            float seatDrop = (1f - 0.656f) * seatSprite.bounds.size.y * seatW; // seat top to plank top
            float ropeLen = pivot.position.y - (plankTop + seatDrop);
            var ropes = Spr("Ropes", pivot, S("Objects/garden_swing_ropes"), Vector3.zero, 1f, 3);
            ropes.transform.localScale = new Vector3(seatW, ropeLen / ropes.sprite.bounds.size.y, 1f);
            Spr("Seat", pivot, seatSprite, new Vector3(0f, -ropeLen), seatW, 4);
            swing.pivot = pivot;
            swing.seat = P("SeatAnchor", pivot, 0f, -ropeLen - seatDrop - 0.12f);
            swing.puddleSpot = P("PuddleSpot", sw, 2.0f, -7.6f);
            swing.puddleWidth = 4.0f;
            toys[(int)ToyKind.Swing] = swing;

            // Piglet: rubber duck in a big mud puddle
            var du = Node("DuckToy", parent, Vector3.zero);
            var duck = du.gameObject.AddComponent<DuckToy>();
            duck.petStart = P("PetStart", du, -2.8f, -4.3f);
            duck.puddleSpot = P("PuddleSpot", du, 1.1f, -6.9f);
            duck.puddleWidth = 5.4f;
            duck.duck = Prop("Duck", du, "garden_duck", 2.6f, -6.6f, 1.4f, 6).transform;
            toys[(int)ToyKind.Duck] = duck;

            // Lamb: trampoline
            var tr = Node("TrampolineToy", parent, Vector3.zero);
            var tramp = tr.gameObject.AddComponent<TrampolineToy>();
            var trampSprite = Prop("Trampoline", tr, "garden_trampoline", -1.3f, -7.0f, 4.0f, 5);
            tramp.trampoline = trampSprite.transform;
            tramp.matTop = P("MatTop", tr, -1.3f, -7.0f + trampSprite.bounds.size.y * 0.68f);
            tramp.puddleSpot = P("PuddleSpot", tr, 3.0f, -7.6f);
            tramp.puddleWidth = 3.2f;
            toys[(int)ToyKind.Trampoline] = tramp;

            // Unicorn: rainbow hoop
            var ho = Node("HoopToy", parent, Vector3.zero);
            var hoop = ho.gameObject.AddComponent<HoopToy>();
            var hoopSprite = Prop("Hoop", ho, "garden_hoop", 0.3f, -6.7f, 4.6f, 5);
            hoop.hoop = hoopSprite.transform;
            hoop.hoopCenter = P("HoopCenter", ho, 0.3f, -6.7f + hoopSprite.bounds.size.y * 0.5f);
            hoop.petStart = P("PetStart", ho, -3.5f, -6.3f);
            hoop.runUp = P("RunUp", ho, -2.6f, -6.4f);
            hoop.puddleSpot = P("PuddleSpot", ho, 3.4f, -6.8f);
            hoop.puddleWidth = 3.0f;
            toys[(int)ToyKind.Hoop] = hoop;

            // Giraffe: apple tree with a mud puddle underneath
            var at = Node("AppleTreeToy", parent, Vector3.zero);
            var tree = at.gameObject.AddComponent<AppleTreeToy>();
            Prop("Tree", at, "garden_tree", -1.4f, -3.9f, 5.6f, 2);
            tree.apples = new[]
            {
                Prop("Apple1", at, "garden_apple", -3.15f, -0.35f, 0.75f, 3),
                Prop("Apple2", at, "garden_apple", -1.55f, 0.75f, 0.75f, 3),
                Prop("Apple3", at, "garden_apple", 0.2f, -0.2f, 0.75f, 3),
                Prop("Apple4", at, "garden_apple", -2.05f, -1.15f, 0.75f, 3),
            };
            tree.petStart = P("PetStart", at, 2.6f, -5.0f);
            tree.puddleSpot = P("PuddleSpot", at, -1.0f, -5.55f);
            tree.puddleWidth = 4.6f;
            tree.standY = -5.0f;
            toys[(int)ToyKind.AppleTree] = tree;

            // Cow: playground slide into a mud puddle
            var ms = Node("MudSlideToy", parent, Vector3.zero);
            var slide = ms.gameObject.AddComponent<MudSlideToy>();
            var slideSr = Prop("Slide", ms, "garden_slide", -1.1f, -5.9f, 6.8f, 2);
            var sb = slideSr.bounds;
            slide.slide = slideSr.transform;
            slide.ladderBase = P("LadderBase", ms, sb.min.x + sb.size.x * 0.14f, sb.min.y + 0.05f);
            slide.slideTop = P("SlideTop", ms, sb.min.x + sb.size.x * 0.36f, sb.min.y + sb.size.y * 0.74f);
            slide.slideEnd = P("SlideEnd", ms, sb.min.x + sb.size.x * 0.95f, sb.min.y + sb.size.y * 0.16f);
            slide.puddleSpot = P("PuddleSpot", ms, 3.15f, -6.75f);
            slide.puddleWidth = 2.8f;
            slide.waitSpot = P("WaitSpot", ms, 2.9f, -4.1f);
            slide.petStart = P("PetStart", ms, 2.9f, -4.1f);
            toys[(int)ToyKind.MudSlide] = slide;

            // Bird: peekaboo with worms in muddy holes
            var wh = Node("WormHuntToy", parent, Vector3.zero);
            var worms = wh.gameObject.AddComponent<WormHuntToy>();
            var holeSpots = new[] { new Vector2(-2.8f, -7.4f), new Vector2(0.6f, -4.6f), new Vector2(3.0f, -6.9f), new Vector2(-0.2f, -7.9f) };
            var holes = new List<SpriteRenderer>();
            var wormList = new List<SpriteRenderer>();
            for (int i = 0; i < holeSpots.Length; i++)
            {
                var h = Spr("Hole" + (i + 1), wh, S("Effects/mud_splat_04"), new Vector3(holeSpots[i].x, holeSpots[i].y + 0.15f), WidthScale("Effects/mud_splat_04", 1.8f), 3);
                h.color = new Color(0.85f, 0.8f, 0.85f, 1f);
                holes.Add(h);
                wormList.Add(Prop("Worm" + (i + 1), wh, "garden_worm", holeSpots[i].x, holeSpots[i].y - 0.15f, 1.85f, 4));
            }
            worms.holes = holes.ToArray();
            worms.worms = wormList.ToArray();
            worms.petStart = P("PetStart", wh, -2.4f, -4.5f);
            toys[(int)ToyKind.WormHunt] = worms;

            // Pony: gallop and leap into three puddles
            var pg = Node("PuddleGallopToy", parent, Vector3.zero);
            var gallop = pg.gameObject.AddComponent<PuddleGallopToy>();
            gallop.puddles = new[]
            {
                Prop("Puddle1", pg, "garden_puddle", 2.3f, -4.3f, 2.8f, 2),
                Prop("Puddle2", pg, "garden_puddle", -2.3f, -6.3f, 2.9f, 2),
                Prop("Puddle3", pg, "garden_puddle", 2.0f, -7.8f, 2.8f, 2),
            };
            gallop.petStart = P("PetStart", pg, -2.6f, -3.9f);
            toys[(int)ToyKind.PuddleGallop] = gallop;

            foreach (var t in toys) t.gameObject.SetActive(false);
            return toys;
        }


        static Sprite[] MudSprites() => new[] { S("Effects/mud_splat_01"), S("Effects/mud_splat_02"), S("Effects/mud_splat_03"), S("Effects/mud_splat_04"), S("Effects/mud_splat_05"), S("Effects/mud_splat_06") };

        static VolumeProfile PostProfile()
        {
            const string path = OopsieImport.Root + "/Data/OopsiePostFX.asset";
            var p = AssetDatabase.LoadAssetAtPath<VolumeProfile>(path);
            if (p == null)
            {
                p = ScriptableObject.CreateInstance<VolumeProfile>();
                AssetDatabase.CreateAsset(p, path);
                var bloom = p.Add<Bloom>(true);
                bloom.intensity.Override(0.35f);
                bloom.threshold.Override(0.95f);
                bloom.scatter.Override(0.6f);
                var vig = p.Add<Vignette>(true);
                vig.intensity.Override(0.16f);
                vig.smoothness.Override(0.6f);
                vig.color.Override(Palette.Shadow);
                foreach (var c in p.components) AssetDatabase.AddObjectToAsset(c, p);
                AssetDatabase.SaveAssets();
            }
            return p;
        }

        static ParentGate BuildParentGate(RectTransform canvas)
        {
            var root = UIKit.Rect("ParentGate", canvas);
            UIKit.Stretch(root);
            var group = root.gameObject.AddComponent<CanvasGroup>();
            var dim = UIKit.Image("Dim", root, null, Palette.WithAlpha(Palette.Ink, 0.55f), true);
            UIKit.Stretch(dim.rectTransform);
            var panel = UIKit.Image("Panel", root, S("UI/panel_cream"), Palette.Untinted, true);
            var mid = new Vector2(0.5f, 0.5f);
            UIKit.Place(panel.rectTransform, mid, mid, Vector2.zero, new Vector2(880, 1180));
            var prompt = UIKit.Text("Prompt", panel.transform, "For grown-ups", 64, Palette.Ink);
            UIKit.Place(prompt.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0, -70), new Vector2(760, 260));
            var digits = new Button[9];
            for (int i = 0; i < 9; i++)
            {
                int r = i / 3, c = i % 3;
                var b = UIKit.Button("Digit" + (i + 1), panel.transform, S("UI/btn_blank_blue"), mid, mid, new Vector2((c - 1) * 220, 80 - r * 220), 190);
                var t = UIKit.Text("Label", b.transform, (i + 1).ToString(), 96, Palette.Ink);
                UIKit.Stretch(t.rectTransform);
                digits[i] = b;
            }
            var close = UIKit.Button("Close", panel.transform, S("UI/btn_close"), new Vector2(1, 1), mid, new Vector2(-30, -30), 130);
            var gate = root.gameObject.AddComponent<ParentGate>();
            gate.prompt = prompt; gate.digits = digits; gate.close = close; gate.group = group;
            return gate;
        }

        static SettingsPanel BuildSettings(RectTransform canvas)
        {
            var root = UIKit.Rect("Settings", canvas);
            UIKit.Stretch(root);
            var dim = UIKit.Image("Dim", root, null, Palette.WithAlpha(Palette.Ink, 0.55f), true);
            UIKit.Stretch(dim.rectTransform);
            var mid = new Vector2(0.5f, 0.5f);
            var panel = UIKit.Image("Panel", root, S("UI/panel_cream"), Palette.Untinted, true);
            UIKit.Place(panel.rectTransform, mid, mid, Vector2.zero, new Vector2(880, 1320));
            var title = UIKit.Text("Title", panel.transform, "Grown-up settings", 64, Palette.Ink);
            UIKit.Place(title.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0, -60), new Vector2(760, 110));
            var musicLabel = UIKit.Text("MusicLabel", panel.transform, "Music", 52, Palette.Ink);
            UIKit.Place(musicLabel.rectTransform, mid, mid, new Vector2(0, 430), new Vector2(700, 80));
            var music = UIKit.Slider("Music", panel.transform, S("UI/slider_track"), S("UI/slider_fill"), S("UI/btn_blank_pink"), new Vector2(0, 345), new Vector2(640, 64));
            var soundLabel = UIKit.Text("SoundLabel", panel.transform, "Sounds", 52, Palette.Ink);
            UIKit.Place(soundLabel.rectTransform, mid, mid, new Vector2(0, 235), new Vector2(700, 80));
            var sound = UIKit.Slider("Sound", panel.transform, S("UI/slider_track"), S("UI/slider_fill"), S("UI/btn_blank_pink"), new Vector2(0, 150), new Vector2(640, 64));
            var resetImg = UIKit.Image("ResetButton", panel.transform, S("UI/panel_lavender"), Palette.Untinted, true);
            UIKit.Place(resetImg.rectTransform, mid, mid, new Vector2(0, 10), new Vector2(680, 130));
            var reset = resetImg.gameObject.AddComponent<Button>();
            reset.transition = Selectable.Transition.None;
            resetImg.gameObject.AddComponent<CandyButton>();
            var resetLabel = UIKit.Text("Label", resetImg.transform, "Start over", 46, Palette.Ink);
            UIKit.Stretch(resetLabel.rectTransform, 16f);
            // Full version: a TEST switch in this build (no store, no payment).
            var unlockImg = UIKit.Image("FullVersionButton", panel.transform, S("UI/panel_lavender"), Palette.Untinted, true);
            UIKit.Place(unlockImg.rectTransform, mid, mid, new Vector2(0, -150), new Vector2(680, 150));
            var unlockAll = unlockImg.gameObject.AddComponent<Button>();
            unlockAll.transition = Selectable.Transition.None;
            unlockImg.gameObject.AddComponent<CandyButton>();
            var unlockLabel = UIKit.Text("Label", unlockImg.transform, "Unlock full version (test, no payment)", 40, Palette.Ink);
            UIKit.Stretch(unlockLabel.rectTransform, 18f);
            var restoreImg = UIKit.Image("RestoreButton", panel.transform, S("UI/panel_lavender"), Palette.Untinted, true);
            UIKit.Place(restoreImg.rectTransform, mid, mid, new Vector2(0, -305), new Vector2(680, 120));
            var restore = restoreImg.gameObject.AddComponent<Button>();
            restore.transition = Selectable.Transition.None;
            restoreImg.gameObject.AddComponent<CandyButton>();
            var restoreLabel = UIKit.Text("Label", restoreImg.transform, "Restore purchases", 42, Palette.Ink);
            UIKit.Stretch(restoreLabel.rectTransform, 16f);
            var note = UIKit.Text("Privacy", panel.transform,
                "No ads. No accounts. No tracking.\nWorks offline. Progress is saved only on this device.", 36, Palette.Ink);
            note.fontStyle = FontStyles.Normal;
            UIKit.Place(note.rectTransform, mid, mid, new Vector2(0, -490), new Vector2(760, 170));
            var close = UIKit.Button("Close", panel.transform, S("UI/btn_close"), new Vector2(1, 1), mid, new Vector2(-30, -30), 130);
            var sp = root.gameObject.AddComponent<SettingsPanel>();
            sp.music = music; sp.sound = sound; sp.reset = reset; sp.resetLabel = resetLabel; sp.close = close;
            sp.unlockAll = unlockAll; sp.unlockLabel = unlockLabel;
            sp.restore = restore; sp.restoreLabel = restoreLabel;
            return sp;
        }
    }
}
