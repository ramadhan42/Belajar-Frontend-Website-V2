"""Analyze text regions and verify globe aspect on original vs output."""
from PIL import Image
from pathlib import Path

orig_p = Path(
    r"C:\Users\LENOVO\.cursor\projects\d-Documents-Rama-Folder-Belajar-evomi-frontend\assets"
    r"\c__Users_LENOVO_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    r"803ee547-adde-4570-b7c4-2ad8ac449ed3-THANGS_CARD_WEB-add2d89d-7a56-4641-8fff-90c6a3d4707f.png"
)
out_p = Path(
    r"C:\Users\LENOVO\.cursor\projects\d-Documents-Rama-Folder-Belajar-evomi-frontend"
    r"\assets\thanks-card-recycle-english.png"
)

for label, p in [("orig", orig_p), ("out", out_p)]:
    im = Image.open(p).convert("RGB")
    print(label, im.size)
    # sample left globe area roughly x=80-250, y=60-230 — measure bright-blue blob bbox
    px = im.load()
    xs, ys = [], []
    for y in range(50, 240):
        for x in range(40, 280):
            r, g, b = px[x, y]
            # light blue globe pixels
            if b > 180 and r > 140 and g > 170 and b >= r and b >= g:
                xs.append(x)
                ys.append(y)
    if xs:
        bw = max(xs) - min(xs) + 1
        bh = max(ys) - min(ys) + 1
        print(f"  globe bbox {bw}x{bh} ratio={bw/bh:.3f}")
