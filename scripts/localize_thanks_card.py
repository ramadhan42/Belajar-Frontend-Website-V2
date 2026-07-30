"""
English-only thanks card from ORIGINAL attachment.
Same pixels size 1024x256, no stretch, PNG lossless.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

SRC = Path(
    r"C:\Users\LENOVO\.cursor\projects\d-Documents-Rama-Folder-Belajar-evomi-frontend\assets"
    r"\c__Users_LENOVO_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    r"803ee547-adde-4570-b7c4-2ad8ac449ed3-THANGS_CARD_WEB-213328f7-3652-4ef3-b744-9cb4ecf42f0f.png"
)
OUT_ASSETS = Path(
    r"C:\Users\LENOVO\.cursor\projects\d-Documents-Rama-Folder-Belajar-evomi-frontend"
    r"\assets\thanks-card-recycle-english.png"
)
OUT_PUBLIC = Path(
    r"D:\Documents\Rama\Folder Belajar\evomi-frontend\public\src\images\section 4"
    r"\thanks-card-recycle-english.png"
)

img = Image.open(SRC).convert("RGB")
assert img.size == (1024, 256)
draw = ImageDraw.Draw(img)

BLUE = img.getpixel((32, 150))
WHITE = (255, 255, 255)
DARK = (38, 46, 56)
STAT = (0, 113, 188)
GREY = (135, 140, 145)


def font(size, bold=True):
    for p in (
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def wipe(box, color):
    draw.rectangle(box, fill=color)


# Opaque wipes over Indonesian / stat text only
wipe((550, 10, 835, 90), WHITE)     # top-right ID lines
wipe((540, 118, 860, 192), WHITE)   # mid-right ID lines
wipe((328, 182, 610, 255), WHITE)   # bottom-left ID lines
wipe((448, 152, 680, 255), WHITE)   # 25x putaran + UNEP
wipe((698, 32, 965, 158), BLUE)     # right quote ID

f11 = font(11, True)
f12 = font(12, True)
f14 = font(14, True)
f18 = font(18, True)
f7 = font(7, False)

draw.text((558, 24), "Nothing we throw away", font=f11, fill=DARK)
draw.text((558, 40), "is truly gone,", font=f11, fill=DARK)
draw.text((558, 134), "It will come back in a", font=f11, fill=DARK)
draw.text((558, 150), "different form", font=f11, fill=DARK)
draw.text((338, 196), "What we throw away can wrap", font=f11, fill=DARK)
draw.text((338, 212), "around the Earth", font=f11, fill=DARK)
draw.text((470, 168), "25 x rotations", font=f18, fill=STAT)
draw.text((462, 194), "United Nations Environment", font=f7, fill=GREY)
draw.text((478, 205), "Programme (UNEP) 2018", font=f7, fill=GREY)
draw.text((718, 58), "Thank you for caring", font=f14, fill=WHITE)
draw.text((718, 84), "- Earth", font=f12, fill=WHITE)

OUT_ASSETS.parent.mkdir(parents=True, exist_ok=True)
OUT_PUBLIC.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT_ASSETS, "PNG", compress_level=1)
img.save(OUT_PUBLIC, "PNG", compress_level=1)
print("OK", img.size)
