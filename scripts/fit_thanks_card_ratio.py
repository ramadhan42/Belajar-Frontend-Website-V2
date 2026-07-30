from PIL import Image
from pathlib import Path

src = Path(
    r"C:\Users\LENOVO\.cursor\projects\d-Documents-Rama-Folder-Belajar-evomi-frontend\assets\thanks-card-en-final.png"
)
out_assets = Path(
    r"C:\Users\LENOVO\.cursor\projects\d-Documents-Rama-Folder-Belajar-evomi-frontend\assets\thanks-card-recycle-english.png"
)
out_public = Path(
    r"D:\Documents\Rama\Folder Belajar\evomi-frontend\public\src\images\section 4\thanks-card-recycle-english.png"
)

im = Image.open(src).convert("RGB")
print("raw", im.size, "ratio", round(im.size[0] / im.size[1], 3))
w, h = im.size
px = im.load()


def margin(rgb):
    r, g, b = rgb
    return (r > 248 and g > 248 and b > 248) or (r < 15 and g < 15 and b < 15)


left, top, right, bottom = w, h, 0, 0
for y in range(0, h, 2):
    for x in range(0, w, 2):
        if not margin(px[x, y]):
            left = min(left, x)
            top = min(top, y)
            right = max(right, x)
            bottom = max(bottom, y)

content = im.crop((left, top, right + 1, bottom + 1))
cw, ch = content.size
ratio = cw / ch
print("content", content.size, "ratio", round(ratio, 3))

# Target original size. Prefer minimal distortion:
# If already near 4:1, just high-quality resize.
# If taller, TOP-align crop to 4:1 (keep headers), then resize.
TARGET_W, TARGET_H = 1024, 256
TARGET_RATIO = TARGET_W / TARGET_H  # 4.0

fitted = content
if ratio < TARGET_RATIO - 0.05:
    new_h = int(cw / TARGET_RATIO)
    # Center crop so top headers AND bottom copy stay visible
    y0 = max(0, (ch - new_h) // 2)
    fitted = content.crop((0, y0, cw, min(ch, y0 + new_h)))
elif ratio > TARGET_RATIO + 0.05:
    new_w = int(ch * TARGET_RATIO)
    x0 = (cw - new_w) // 2
    fitted = content.crop((x0, 0, x0 + new_w, ch))

# Only a small resize to exact canvas — artwork already near target ratio
final = fitted.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
print("final", final.size, "from fitted", fitted.size, "fitted_ratio", round(fitted.size[0] / fitted.size[1], 3))

out_assets.parent.mkdir(parents=True, exist_ok=True)
out_public.parent.mkdir(parents=True, exist_ok=True)
final.save(out_assets, "PNG", compress_level=1)
final.save(out_public, "PNG", compress_level=1)
print("saved")
