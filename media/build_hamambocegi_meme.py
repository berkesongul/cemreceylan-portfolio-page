#!/usr/bin/env python3
"""Render the generated KYK cockroach keyframes into a short meme video."""

from pathlib import Path
import math
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "hamambocegi_meme_assets"
OUTPUT = ROOT / "hamambocegi_meme.mp4"
SILENT_VIDEO = ASSETS / "silent_video.mp4"

WIDTH, HEIGHT = 1280, 720
FPS = 24
DURATION = 16.5

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"

IMAGES = {
    "establishing": Image.open(ASSETS / "01_establishing.png").convert("RGB"),
    "warning": Image.open(ASSETS / "02_warning.png").convert("RGB"),
    "phone": Image.open(ASSETS / "03_phone.png").convert("RGB"),
    "chair": Image.open(ASSETS / "04_chair.png").convert("RGB"),
}


def cover(image: Image.Image, zoom: float, focus_x: float, focus_y: float) -> Image.Image:
    """Aspect-fill an image, then apply a small focal-point zoom."""
    source_ratio = image.width / image.height
    target_ratio = WIDTH / HEIGHT
    if source_ratio > target_ratio:
        base_h = image.height
        base_w = int(base_h * target_ratio)
    else:
        base_w = image.width
        base_h = int(base_w / target_ratio)

    crop_w = max(2, int(base_w / zoom))
    crop_h = max(2, int(base_h / zoom))
    cx = int(focus_x * image.width)
    cy = int(focus_y * image.height)
    left = max(0, min(image.width - crop_w, cx - crop_w // 2))
    top = max(0, min(image.height - crop_h, cy - crop_h // 2))
    return image.crop((left, top, left + crop_w, top + crop_h)).resize(
        (WIDTH, HEIGHT), Image.Resampling.LANCZOS
    )


def scene_at(t: float) -> tuple[str, float, float, float]:
    if t < 1.70:
        return "establishing", 1.00 + 0.025 * (t / 1.70), 0.50, 0.50
    if t < 4.55:
        p = (t - 1.70) / 2.85
        return "warning", 1.015 + 0.035 * p, 0.53, 0.48
    if t < 5.70:
        return "establishing", 1.04, 0.50, 0.50
    if t < 11.20:
        p = (t - 5.70) / 5.50
        return "phone", 1.02 + 0.055 * p, 0.49, 0.48
    if t < 12.00:
        p = (t - 11.20) / 0.80
        return "phone", 1.25 + 0.18 * p, 0.75, 0.47
    p = (t - 12.00) / 4.50
    return "chair", 1.03 + 0.08 * p, 0.53, 0.48


def rounded_label(draw: ImageDraw.ImageDraw, text: str, x: int, y: int) -> None:
    font = ImageFont.truetype(FONT_BOLD, 29)
    box = draw.textbbox((0, 0), text, font=font, stroke_width=1)
    w, h = box[2] - box[0], box[3] - box[1]
    pad_x, pad_y = 22, 14
    draw.rounded_rectangle(
        (x - w // 2 - pad_x, y - h // 2 - pad_y,
         x + w // 2 + pad_x, y + h // 2 + pad_y),
        radius=18,
        fill=(0, 0, 0, 185),
        outline=(255, 216, 67, 220),
        width=2,
    )
    draw.text(
        (x, y), text, font=font, anchor="mm", fill=(255, 255, 255, 255),
        stroke_width=2, stroke_fill=(0, 0, 0, 255)
    )


def subtitle(frame: Image.Image, speaker: str, lines: list[str]) -> Image.Image:
    layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    speaker_font = ImageFont.truetype(FONT_BOLD, 25)
    text_font = ImageFont.truetype(FONT_BOLD, 38)
    rendered = [speaker.upper()] + lines
    heights = [31] + [47 for _ in lines]
    total_h = sum(heights) + 30
    y0 = HEIGHT - total_h - 22
    draw.rounded_rectangle((65, y0 - 16, WIDTH - 65, HEIGHT - 24), radius=22, fill=(0, 0, 0, 190))
    y = y0
    draw.text((WIDTH // 2, y), rendered[0], font=speaker_font, anchor="ma", fill=(255, 213, 55, 255))
    y += 37
    for line in rendered[1:]:
        draw.text(
            (WIDTH // 2, y), line, font=text_font, anchor="ma", fill=(255, 255, 255, 255),
            stroke_width=2, stroke_fill=(0, 0, 0, 255)
        )
        y += 47
    return Image.alpha_composite(frame.convert("RGBA"), layer).convert("RGB")


def decorate(frame: Image.Image, t: float) -> Image.Image:
    if 0.20 <= t < 1.45:
        layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        rounded_label(ImageDraw.Draw(layer), "KYK  •  02:17", WIDTH // 2, 70)
        frame = Image.alpha_composite(frame.convert("RGBA"), layer).convert("RGB")
    if 1.75 <= t < 2.90:
        frame = subtitle(frame, "BERKE", ["Sessiz ol."])
    elif 3.05 <= t < 4.35:
        frame = subtitle(frame, "KIVANÇ", ["Tamam kanka."])
    elif 4.72 <= t < 5.55:
        layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        rounded_label(ImageDraw.Draw(layer), "3 SANİYE SONRA...", WIDTH // 2, HEIGHT // 2)
        frame = Image.alpha_composite(frame.convert("RGBA"), layer).convert("RGB")
    elif 5.80 <= t < 10.95:
        frame = subtitle(frame, "KIVANÇ (TELEFONDA)", [
            "Alo kanka, kartları açtım! Kule geldi.",
            "Kesin geri dönecek diyorum sana! Dinle, bu çok net!",
        ])
    elif 11.20 <= t < 11.95:
        frame = subtitle(frame, "BERKE", ["..."])
    elif 12.00 <= t < 14.95:
        frame = subtitle(frame, "BERKE", ["LAN OROSPU ÇOCUĞU", "SESSİZ OLSANA!"])
    elif 15.05 <= t < 16.35:
        layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        rounded_label(ImageDraw.Draw(layer), "KARTLAR BUNU GÖSTERMEMİŞTİ", WIDTH // 2, 80)
        frame = Image.alpha_composite(frame.convert("RGBA"), layer).convert("RGB")
    return frame


def render_silent_video(ffmpeg: str) -> None:
    command = [
        ffmpeg, "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(SILENT_VIDEO),
    ]
    proc = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert proc.stdin is not None
    total_frames = int(DURATION * FPS)
    for index in range(total_frames):
        t = index / FPS
        name, zoom, fx, fy = scene_at(t)
        frame = cover(IMAGES[name], zoom, fx, fy)

        if t >= 12.0:
            intensity = max(0.0, 1.0 - (t - 12.0) / 1.9)
            dx = int(math.sin(index * 2.4) * 12 * intensity)
            dy = int(math.cos(index * 2.9) * 8 * intensity)
            shaken = Image.new("RGB", (WIDTH, HEIGHT), (15, 8, 5))
            shaken.paste(frame, (dx, dy))
            frame = shaken

        if 11.92 <= t <= 12.06:
            flash = int(210 * (1.0 - abs(t - 12.0) / 0.08))
            overlay = Image.new("RGB", frame.size, (255, 245, 220))
            frame = Image.blend(frame, overlay, max(0, min(1, flash / 255)))

        frame = decorate(frame, t)
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("Video encoding failed")


def add_audio(ffmpeg: str) -> None:
    quiet = ASSETS / "berke_quiet.aiff"
    okay = ASSETS / "kivanc_okay.aiff"
    phone = ASSETS / "kivanc_phone.aiff"
    shout = ASSETS / "berke_shout.aiff"
    command = [
        ffmpeg, "-y", "-i", str(SILENT_VIDEO),
        "-i", str(quiet), "-i", str(okay), "-i", str(phone), "-i", str(shout),
        "-f", "lavfi", "-t", str(DURATION), "-i", "sine=frequency=52:sample_rate=44100",
        "-f", "lavfi", "-t", "0.42", "-i", "anoisesrc=color=brown:amplitude=0.75:sample_rate=44100",
        "-filter_complex",
        "[1:a]asetrate=44100*0.82,aresample=44100,atempo=1.2195,volume=1.25,adelay=1780|1780[q];"
        "[2:a]asetrate=44100*1.06,aresample=44100,atempo=0.9434,volume=1.15,adelay=3050|3050[o];"
        "[3:a]asetrate=44100*1.09,aresample=44100,atempo=0.9174,volume=1.38,adelay=5820|5820[p];"
        "[4:a]asetrate=44100*0.80,aresample=44100,atempo=1.25,volume=2.0,adelay=12000|12000[s];"
        "[5:a]volume=0.025[hum];"
        "[6:a]lowpass=f=210,volume=1.8,adelay=13300|13300[hit];"
        "[q][o][p][s][hum][hit]amix=inputs=6:duration=longest:normalize=0,alimiter=limit=0.96[a]",
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-t", str(DURATION), "-movflags", "+faststart", str(OUTPUT),
    ]
    subprocess.run(command, check=True)


if __name__ == "__main__":
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    render_silent_video(ffmpeg_path)
    add_audio(ffmpeg_path)
    print(OUTPUT)
