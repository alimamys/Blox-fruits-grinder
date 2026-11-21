// The rainbow coat: a sprite shader that tints the fur with soft pastel rainbow bands that drift slowly
// across the pet. Dark outlines stay dark (the rainbow multiplies the fur colour), so the pet still reads
// as itself. Unlit, like the rest of the game (a single white global 2D light makes lit and unlit match).
Shader "OopsiePets/RainbowSprite"
{
    Properties
    {
        _MainTex ("Sprite Texture", 2D) = "white" {}
        _Strength ("Rainbow strength", Range(0, 1)) = 0.85
        _Bands ("Bands per world unit", Float) = 0.45
        _Speed ("Drift speed", Float) = 0.12
        [HideInInspector] _Color ("Tint", Color) = (1,1,1,1)
        [HideInInspector] _RendererColor ("RendererColor", Color) = (1,1,1,1)
        [HideInInspector] _AlphaTex ("External Alpha", 2D) = "white" {}
        [HideInInspector] _EnableExternalAlpha ("Enable External Alpha", Float) = 0
    }

    SubShader
    {
        Tags { "Queue" = "Transparent" "RenderType" = "Transparent" "RenderPipeline" = "UniversalPipeline" }

        Blend SrcAlpha OneMinusSrcAlpha, One OneMinusSrcAlpha
        Cull Off
        ZWrite Off

        Pass
        {
            HLSLPROGRAM
            #include "Packages/com.unity.render-pipelines.universal/Shaders/2D/Include/Core2D.hlsl"

            #pragma vertex RainbowVertex
            #pragma fragment RainbowFragment
            #pragma multi_compile_instancing

            struct Attributes
            {
                COMMON_2D_INPUTS
                half4 color : COLOR;
                UNITY_SKINNED_VERTEX_INPUTS
            };

            struct Varyings
            {
                COMMON_2D_OUTPUTS
                half4 color : COLOR;
                float3 rainbowPos : TEXCOORD4;
            };

            #include "Packages/com.unity.render-pipelines.universal/Shaders/2D/Include/2DCommon.hlsl"

            CBUFFER_START(UnityPerMaterial)
                half4 _Color;
                half _Strength;
                half _Bands;
                half _Speed;
            CBUFFER_END

            Varyings RainbowVertex(Attributes input)
            {
                UNITY_SKINNED_VERTEX_COMPUTE(input);
                SetUpSpriteInstanceProperties();
                input.positionOS = UnityFlipSprite(input.positionOS, unity_SpriteProps.xy);
                Varyings o = CommonUnlitVertex(input);
                o.color = input.color * _Color * unity_SpriteColor;
                o.rainbowPos = TransformObjectToWorld(input.positionOS);
                return o;
            }

            half3 Hue(half h)
            {
                half3 k = abs(frac(h + half3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0;
                return saturate(k);
            }

            half4 RainbowFragment(Varyings input) : SV_Target
            {
                half4 tex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, input.uv) * input.color;
                // Diagonal bands moving upward over time.
                half h = frac((input.rainbowPos.y + input.rainbowPos.x * 0.35) * _Bands - _Time.y * _Speed);
                half3 pastel = lerp(half3(1, 1, 1), Hue(h), 0.62);       // soft candy colours
                // Light fur takes the full rainbow; dark outlines and eyes stay as they are.
                half light = saturate((dot(tex.rgb, half3(0.299, 0.587, 0.114)) - 0.35) / 0.4);
                half3 rgb = tex.rgb * lerp(half3(1, 1, 1), pastel * 1.08, _Strength * light);
                return half4(saturate(rgb), tex.a);
            }
            ENDHLSL
        }
    }
}
