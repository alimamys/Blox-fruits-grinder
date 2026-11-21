#!/usr/bin/env python3
"""Generate images with the OpenAI Images API and record prompts in a manifest.

Usage: python3 -I gen_images.py <jobs.json> <project_art_dir>
Each job: {id, out (relative to art dir), prompt, model, size, quality, background, refs: [paths]}
The API key is injected by the session's network proxy; none is read or sent here.
"""
import base64, json, os, sys, time, uuid, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

API = "https://api.openai.com/v1/images/"
STYLE = (
    "Premium preschool mobile game art, original 2D cartoon illustration for children aged 3-5. "
    "Soft, rounded, chubby shapes; clean deep-plum (#5B4565) outlines of even medium weight; gentle cel shading "
    "lit from the upper left with lavender-tinted shadows (never gray or black); pastel candy palette: pastel pink "
    "#FFC8DD, lavender #CDB4DB, mint #B9F3D9, light turquoise #A0E7E5, baby blue #BDE0FE, peach #FFD6BA, "
    "cream #FFF6E5, soft yellow #FFF1A8. Warm, cheerful storybook look. Crisp, high resolution, no blur. "
    "No text, no letters, no numbers, no logos, no watermark, no signature."
)


def post_json(endpoint, payload):
    req = urllib.request.Request(API + endpoint, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r)


def post_multipart(endpoint, fields, files):
    boundary = uuid.uuid4().hex
    body = bytearray()
    for k, v in fields.items():
        body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
    for k, path in files:
        with open(path, "rb") as f:
            data = f.read()
        body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"; filename=\"{os.path.basename(path)}\"\r\n"
                 f"Content-Type: image/png\r\n\r\n").encode() + data + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(API + endpoint, data=bytes(body),
                                 headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r)


def run(job, art_dir):
    out = os.path.join(art_dir, job["out"])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    prompt = STYLE + "\n\n" + job["prompt"]
    model = job.get("model", "gpt-image-1.5")
    params = {"model": model, "prompt": prompt, "size": job.get("size", "1024x1024"),
              "quality": job.get("quality", "high"), "output_format": "png", "n": 1}
    if job.get("background"):
        params["background"] = job["background"]
    refs = [os.path.join(art_dir, r) for r in job.get("refs", [])]
    last = None
    for attempt in range(3):
        try:
            t0 = time.time()
            if refs:
                fields = {k: str(v) for k, v in params.items() if k != "n"}
                d = post_multipart("edits", fields, [("image[]", p) for p in refs])
            else:
                d = post_json("generations", params)
            if "data" not in d:
                raise RuntimeError(json.dumps(d)[:400])
            with open(out, "wb") as f:
                f.write(base64.b64decode(d["data"][0]["b64_json"]))
            return {"id": job["id"], "file": job["out"], "model": model, "size": params["size"],
                    "quality": params["quality"], "background": params.get("background", "opaque"),
                    "refs": job.get("refs", []), "prompt": job["prompt"], "style_prefix": "STYLE",
                    "seconds": round(time.time() - t0, 1), "ok": True}
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read()[:400]!r}"
        except Exception as e:  # noqa: BLE001
            last = repr(e)[:400]
        time.sleep(4 * (attempt + 1))
    return {"id": job["id"], "file": job["out"], "ok": False, "error": last, "prompt": job["prompt"]}


def main():
    jobs = json.load(open(sys.argv[1]))
    art_dir = sys.argv[2]
    workers = int(os.environ.get("GEN_WORKERS", "6"))
    with ThreadPoolExecutor(workers) as ex:
        results = list(ex.map(lambda j: run(j, art_dir), jobs))
    man_path = os.path.join(art_dir, "asset_manifest.json")
    manifest = {"style_prefix": STYLE, "assets": {}}
    if os.path.exists(man_path):
        try:
            manifest = json.load(open(man_path))
        except Exception:  # noqa: BLE001
            pass
    manifest["style_prefix"] = STYLE
    for r in results:
        if r.get("ok"):
            manifest["assets"][r["id"]] = r
    with open(man_path, "w") as f:
        json.dump(manifest, f, indent=2)
    for r in results:
        print(("OK  " if r.get("ok") else "FAIL"), r["id"], r.get("seconds", ""), r.get("error", ""))


if __name__ == "__main__":
    main()
