

# Complete Crawler Upload Instructions

Everything your crawler needs to upload images directly to storage and register them in the database.

## Credentials You Need

1. **Service Role Key** — for uploading files to storage (I need to share this with you securely)
2. **Your User JWT** — for the register endpoint (get this from your browser session or login API)
3. **Your Brand ID** — the UUID of your Birkenstock brand in the system

## Storage Upload URL

```
https://hqjfjrwoyvtlhqcupceu.supabase.co/storage/v1/object/product-images/
```

## Folder Structure Convention

```
product-images/
  imports/
    {batch_id}/
      manifest.json
      {model-slug}/{color-slug}/hero.jpg
      {model-slug}/{color-slug}/top-down.jpg
      {model-slug}/{color-slug}/side.jpg
      {model-slug}/{color-slug}/sole.jpg
      {model-slug}/{color-slug}/pair.jpg
      {model-slug}/{color-slug}/detail.jpg
      {model-slug}/{color-slug}/lifestyle.jpg
```

## Angle Mapping (for Birkenstock URLs)

| URL pattern | Angle label |
|---|---|
| `1031752.jpg` (no suffix) | `hero` |
| `_top.jpg` | `top-down` |
| `_side.jpg` | `side` |
| `_sole.jpg` | `sole` |
| `_pair.jpg` | `pair` |
| `_detail.jpg` | `detail` |
| `_f_look_f.jpg` | `lifestyle` |
| `_f_closeup_f.jpg` | `closeup` |

## manifest.json Format

```json
{
  "brandId": "YOUR_BRAND_UUID",
  "products": [
    {
      "model": "Arizona",
      "productName": "Arizona Big Buckle Leather",
      "color": "New Dressy Black",
      "sourceUrl": "https://www.birkenstock.com/...",
      "images": [
        { "path": "arizona/new-dressy-black/hero.jpg", "angle": "hero" },
        { "path": "arizona/new-dressy-black/top-down.jpg", "angle": "top-down" },
        { "path": "arizona/new-dressy-black/side.jpg", "angle": "side" }
      ]
    }
  ]
}
```

## Register Endpoint

After all images + manifest are uploaded:

```
POST https://hqjfjrwoyvtlhqcupceu.supabase.co/functions/v1/register-imported-products
Content-Type: application/json

{
  "apiKey": "YOUR_USER_JWT",
  "batchId": "batch-2026-03-14"
}
```

## Complete Python Crawler Script

```python
import requests, json, os, re, time, sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ─── CONFIG ───
SUPABASE_URL = "https://hqjfjrwoyvtlhqcupceu.supabase.co"
STORAGE_URL  = f"{SUPABASE_URL}/storage/v1/object/product-images"
REGISTER_URL = f"{SUPABASE_URL}/functions/v1/register-imported-products"
SERVICE_KEY  = "YOUR_SERVICE_ROLE_KEY"   # for storage uploads
USER_JWT     = "YOUR_USER_JWT"           # for register endpoint
BRAND_ID     = "YOUR_BRAND_UUID"
BATCH_ID     = "batch-2026-03-14"

# ─── ANGLE DETECTION ───
ANGLE_PATTERNS = [
    (r'_f_look_f',    'lifestyle'),
    (r'_f_closeup_f', 'closeup'),
    (r'_top',         'top-down'),
    (r'_side',        'side'),
    (r'_sole',        'sole'),
    (r'_pair',        'pair'),
    (r'_detail',      'detail'),
]

def detect_angle(url: str) -> str:
    filename = url.split('/')[-1].split('?')[0].lower()
    for pattern, angle in ANGLE_PATTERNS:
        if pattern in filename:
            return angle
    return 'hero'

def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

# ─── UPLOAD ONE IMAGE ───
def upload_image(image_url: str, storage_path: str) -> bool:
    """Download image from source URL and upload to storage."""
    try:
        # Download from source
        resp = requests.get(image_url, timeout=30)
        resp.raise_for_status()

        # Upload to storage
        upload_resp = requests.post(
            f"{STORAGE_URL}/imports/{BATCH_ID}/{storage_path}",
            headers={
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "image/jpeg",
                "x-upsert": "true",  # overwrite if exists
            },
            data=resp.content,
        )
        upload_resp.raise_for_status()
        return True
    except Exception as e:
        print(f"  ✗ Failed {storage_path}: {e}")
        return False

# ─── MAIN ───
def main():
    # Load your products.json (from your crawler)
    with open("products.json", "r") as f:
        raw_products = json.load(f)

    manifest_products = []
    total_uploaded = 0
    total_failed = 0

    for i, product in enumerate(raw_products):
        model = product.get("model", "unknown")
        name = product.get("productName", product.get("name", "unknown"))
        color = product.get("color", "default")
        source_url = product.get("sourceUrl", "")
        image_urls = product.get("imageUrls", product.get("images", []))

        model_slug = slugify(model)
        color_slug = slugify(color)
        folder = f"{model_slug}/{color_slug}"

        print(f"[{i+1}/{len(raw_products)}] {name} — {color} ({len(image_urls)} images)")

        images_manifest = []

        # Upload images in parallel (5 at a time)
        with ThreadPoolExecutor(max_workers=5) as pool:
            futures = {}
            for img_url in image_urls:
                if isinstance(img_url, dict):
                    img_url = img_url.get("url", img_url.get("src", ""))
                angle = detect_angle(img_url)
                ext = "jpg"
                storage_path = f"{folder}/{angle}.{ext}"
                futures[pool.submit(upload_image, img_url, storage_path)] = {
                    "path": f"{folder}/{angle}.{ext}",
                    "angle": angle,
                }

            for future in as_completed(futures):
                info = futures[future]
                if future.result():
                    images_manifest.append(info)
                    total_uploaded += 1
                else:
                    total_failed += 1

        if images_manifest:
            manifest_products.append({
                "model": model,
                "productName": name,
                "color": color,
                "sourceUrl": source_url,
                "images": images_manifest,
            })

    # Upload manifest.json
    manifest = {"brandId": BRAND_ID, "products": manifest_products}
    manifest_json = json.dumps(manifest, indent=2)

    print(f"\nUploading manifest.json ({len(manifest_products)} products)...")
    resp = requests.post(
        f"{STORAGE_URL}/imports/{BATCH_ID}/manifest.json",
        headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
            "x-upsert": "true",
        },
        data=manifest_json.encode(),
    )
    resp.raise_for_status()

    # Call register endpoint
    print("Calling register endpoint...")
    reg_resp = requests.post(
        REGISTER_URL,
        json={"apiKey": USER_JWT, "batchId": BATCH_ID},
    )
    print(f"Register response: {reg_resp.status_code}")
    print(json.dumps(reg_resp.json(), indent=2))

    print(f"\nDone! Uploaded: {total_uploaded}, Failed: {total_failed}")

if __name__ == "__main__":
    main()
```

## What To Do

1. **Get the Service Role Key** — I need to share it with you securely (see next step)
2. **Get your User JWT** — from your browser dev tools (Application → Local Storage → look for `sb-*-auth-token`, copy the `access_token`)
3. **Get your Brand ID** — from the app's Settings or Brand page (it's a UUID)
4. **Adapt `products.json`** — make sure your crawler outputs a JSON array where each product has `model`, `productName`, `color`, `imageUrls`
5. **Run the script** — `python crawler_upload.py`
6. **Check your Products page** — all SKUs should appear with images organized by angle

## Next Step: Service Role Key

I need to securely provide you the service role key for storage uploads. I can set it up as a secret you can retrieve.

