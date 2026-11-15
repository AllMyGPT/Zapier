#!/usr/bin/env python3
"""Genera las texturas pixel-art del mod "Imperio Romano".

Cada sprite se describe como un mapa ASCII de 16x16 donde cada carácter es
un índice de paleta ('.' = transparente). Así las texturas son reproducibles,
versionables y no dependen de ningún editor gráfico.

Uso:  python3 tools/generate_assets.py   (requiere Pillow)
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:  # pragma: no cover
    sys.exit("Falta Pillow. Ejecuta: make venv  (o pip3 install Pillow)")

ROOT = Path(__file__).resolve().parent.parent
RP = ROOT / "resource_pack"
BP = ROOT / "behavior_pack"

T = (0, 0, 0, 0)


def hexc(h: str, a: int = 255) -> tuple[int, int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def sprite(rows: list[str], palette: dict[str, tuple[int, int, int, int]]) -> Image.Image:
    assert len(rows) == 16 and all(len(r) == 16 for r in rows), "sprite debe ser 16x16"
    img = Image.new("RGBA", (16, 16), T)
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != ".":
                px[x, y] = palette[ch]
    return img


# --------------------------------------------------------------------------- items
GLADIUS = [
    "..............hH",
    ".............hSH",
    "............hSs.",
    "...........hSs..",
    "..........hSs...",
    ".........hSs....",
    "........hSs.....",
    ".......hSs......",
    "..g...hSs.......",
    "..gG.hSs........",
    "...gGSs.........",
    "....gGg.........",
    "...wwgGg........",
    "..rww..gG.......",
    ".rRr....g.......",
    "..r.............",
]
GLADIUS_PAL = {
    "h": hexc("F4F7FA"), "H": hexc("FFFFFF"),          # filo brillante
    "S": hexc("B9C2CC"), "s": hexc("7C8794"),          # hoja de hierro
    "g": hexc("B8860B"), "G": hexc("FFD24A"),          # guarda dorada
    "w": hexc("6B3E1F"),                              # empuñadura
    "r": hexc("8E1616"), "R": hexc("E0392B"),          # pomo rojo
}

PILUM = [
    "..............S.",
    ".............HS.",
    "............Ss..",
    "...........ss...",
    "..........gg....",
    ".........wW.....",
    "........wW......",
    ".......wW.......",
    "......wW........",
    ".....wW.........",
    "....wW..........",
    "...wW...........",
    "..wW............",
    ".wW.............",
    "dw..............",
    "d...............",
]
PILUM_PAL = {
    "S": hexc("C9D1DA"), "H": hexc("FFFFFF"), "s": hexc("7C8794"),
    "g": hexc("555B63"),                              # virola
    "w": hexc("7A4A24"), "W": hexc("B07A43"),          # asta de madera
    "d": hexc("4A2C14"),
}

DENARIUS = [
    "................",
    "................",
    ".....oooooo.....",
    "....oSSSSSSo....",
    "...oSHHSSSSdo...",
    "..oSHSSSSSSSdo..",
    "..oSHSSkkSSSdo..",
    "..oSSSkSSkSSdo..",
    "..oSSSkSSkSSdo..",
    "..oSSSSkkSSSdo..",
    "..oSSSSSSSSddo..",
    "...oSSSSSSddo...",
    "....oddddddo....",
    ".....oooooo.....",
    "................",
    "................",
]
DENARIUS_PAL = {
    "o": hexc("5E636B"), "S": hexc("C3C8CF"), "H": hexc("F5F7FA"),
    "d": hexc("8E949C"), "k": hexc("6F757D"),          # relieve central
}

# --------------------------------------------------------------------------- bloques
MARBLE = [
    "WcWWdWWcWWdWWcWW",
    "WcWWdWWcWWdWWcWW",
    "WcWvdWWcWWdWWcWW",
    "WcWWdvWcWWdWWcWW",
    "WcWWdWvcWWdWWcvW",
    "WcWWdWWcvWdWWcWv",
    "WcWWdWWcWvdWWcWW",
    "WcWWdWWcWWdvWcWW",
    "WcWWdWWcWWdWvcWW",
    "WcvWdWWcWWdWWcWW",
    "WcWvdWWcWWdWWcWW",
    "WcWWdvWcWWdWWcWW",
    "WcWWdWWcWWdWWcWW",
    "WcWWdWWcWWdWWcWW",
    "WcWWdWWcWWdWWcWW",
    "WcWWdWWcWWdWWcWW",
]
MARBLE_PAL = {
    "W": hexc("F2EFE6"),   # mármol blanco
    "c": hexc("D9CFB8"),   # estría crema
    "d": hexc("C7BDA6"),   # estría sombreada
    "v": hexc("C4C8CE"),   # veta gris
}

ALTAR = [
    "kkkkkkkkkkkkkkkk",
    "kGGGGGGGGGGGGGGk",
    "kGssssssssssssGk",
    "kGsrrrrrrrrrrsGk",
    "kGsrGGrGGrGGrsGk",
    "kGsrGrrGrGrGrsGk",
    "kGsrrGrGGrGGrsGk",
    "kGsrGGrGrrGrrsGk",
    "kGsrrrrrrrrrrsGk",
    "kGsrGGrGrrGGrsGk",
    "kGsrGrGGrrGrGsGk",
    "kGsrGGrGrrGGrsGk",
    "kGsrrrrrrrrrGsGk",
    "kGssssssssssssGk",
    "kGGGGGGGGGGGGGGk",
    "kkkkkkkkkkkkkkkk",
]
ALTAR_PAL = {
    "k": hexc("4E4A45"), "s": hexc("8D877E"),   # piedra tallada
    "G": hexc("E8B634"),                         # oro
    "r": hexc("8E1616"),                         # carmesí
}


def noise_texture(base: Image.Image, seed: int, amount: int = 10) -> Image.Image:
    """Añade una ligera variación determinista para que el bloque no se vea plano."""
    import random

    rnd = random.Random(seed)
    img = base.copy()
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            d = rnd.randint(-amount, amount)
            px[x, y] = (max(0, min(255, r + d)), max(0, min(255, g + d)), max(0, min(255, b + d)), a)
    return img


# --------------------------------------------------------------------------- SPQR (fuente 3x5)
FONT = {
    "S": ["###", "#..", "###", "..#", "###"],
    "P": ["###", "#.#", "###", "#..", "#.."],
    "Q": ["###", "#.#", "#.#", "###", "..#"],
    "R": ["##.", "#.#", "##.", "#.#", "#.#"],
}


def pack_icon(size: int = 128) -> Image.Image:
    red, dark, gold, gold_dk = hexc("9B111E"), hexc("5C0A12"), hexc("FFD24A"), hexc("B8860B")
    img = Image.new("RGBA", (size, size), red)
    d = ImageDraw.Draw(img)
    s = size // 32  # tamaño de "píxel" del icono
    d.rectangle([0, 0, size - 1, size - 1], outline=dark, width=s * 2)
    d.rectangle([s * 3, s * 3, size - 1 - s * 3, size - 1 - s * 3], outline=gold, width=s)
    # laurel simplificado arriba y abajo
    for i in range(6, 26, 3):
        d.rectangle([i * s, 6 * s, (i + 1) * s, 7 * s], fill=gold_dk)
        d.rectangle([i * s, 25 * s, (i + 1) * s, 26 * s], fill=gold_dk)
    # letras SPQR con escala 4 "píxeles" por celda de fuente
    cell = s * 1.5
    text = "SPQR"
    letter_w = 3 * cell
    gap = cell
    total = len(text) * letter_w + (len(text) - 1) * gap
    x0 = (size - total) / 2
    y0 = (size - 5 * cell) / 2
    for li, ch in enumerate(text):
        for ry, row in enumerate(FONT[ch]):
            for rx, c in enumerate(row):
                if c == "#":
                    x = x0 + li * (letter_w + gap) + rx * cell
                    y = y0 + ry * cell
                    d.rectangle([x + s // 2, y + s // 2, x + cell - 1 + s // 2, y + cell - 1 + s // 2], fill=dark)
                    d.rectangle([x, y, x + cell - 1, y + cell - 1], fill=gold)
    return img


# --------------------------------------------------------------------------- legionario (skin 64x64)
def legionary_skin() -> Image.Image:
    """Textura 64x64 con el layout UV de geometry.humanoid.custom (como una skin)."""
    img = Image.new("RGBA", (64, 64), T)
    d = ImageDraw.Draw(img)
    skin, skin_dk = hexc("C99A6E"), hexc("A87B52")
    red, red_dk = hexc("A3161F"), hexc("6E0E15")
    iron, iron_dk = hexc("B9C2CC"), hexc("7C8794")
    gold = hexc("E8B634")
    leather = hexc("6B3E1F")
    eye, hair = hexc("2B2B2B"), hexc("3A2A1A")

    def box(u: int, v: int, w: int, h: int, dpt: int, top, side, bottom=None):
        """Rellena las 6 caras de un cubo según el layout estándar de Bedrock."""
        bottom = bottom or top
        d.rectangle([u + dpt, v, u + dpt + w - 1, v + dpt - 1], fill=top)                 # arriba
        d.rectangle([u + dpt + w, v, u + dpt + 2 * w - 1, v + dpt - 1], fill=bottom)       # abajo
        d.rectangle([u, v + dpt, u + 2 * (dpt + w) - 1, v + dpt + h - 1], fill=side)       # lados

    # Cabeza (u0,v0) 8x8x8: piel + casco
    box(0, 0, 8, 8, 8, iron, skin)
    d.rectangle([0, 8, 31, 10], fill=iron)                 # casco en la frente (todos los lados)
    d.rectangle([8, 8, 15, 9], fill=iron_dk)
    d.rectangle([10, 12, 10, 12], fill=eye)
    d.rectangle([13, 12, 13, 12], fill=eye)
    d.rectangle([10, 14, 13, 14], fill=skin_dk)            # boca
    d.rectangle([24, 11, 31, 15], fill=hair)               # nuca
    d.rectangle([0, 11, 1, 15], fill=iron)                 # carrilleras
    d.rectangle([6, 11, 7, 15], fill=iron)
    # Capa exterior de la cabeza (u32,v0): cresta roja
    d.rectangle([43, 0, 44, 7], fill=red)
    d.rectangle([40, 8, 47, 8], fill=gold)

    # Cuerpo (u16,v16) 8x12x4: lorica segmentata sobre túnica roja
    box(16, 16, 8, 12, 4, iron, red)
    for yy in range(20, 28, 2):
        d.line([16, yy, 39, yy], fill=iron)
        d.line([16, yy + 1, 39, yy + 1], fill=iron_dk)
    d.rectangle([16, 28, 39, 29], fill=leather)            # cinturón (cingulum)
    d.rectangle([22, 28, 23, 29], fill=gold)
    d.rectangle([16, 30, 39, 31], fill=red_dk)             # faldón

    # Brazo derecho (u40,v16) y pierna derecha (u0,v16), 4x12x4
    box(40, 16, 4, 12, 4, iron, skin)
    d.rectangle([40, 20, 55, 23], fill=iron)               # hombrera
    d.rectangle([40, 30, 55, 31], fill=leather)            # brazal
    box(0, 16, 4, 12, 4, red_dk, skin, leather)
    d.rectangle([0, 20, 15, 22], fill=red)                 # túnica
    d.rectangle([0, 27, 15, 31], fill=leather)             # caligae
    # Brazo izquierdo (u32,v48) y pierna izquierda (u16,v48)
    box(32, 48, 4, 12, 4, iron, skin)
    d.rectangle([32, 52, 47, 55], fill=iron)
    d.rectangle([32, 62, 47, 63], fill=leather)
    box(16, 48, 4, 12, 4, red_dk, skin, leather)
    d.rectangle([16, 52, 31, 54], fill=red)
    d.rectangle([16, 59, 31, 63], fill=leather)
    return img


# --------------------------------------------------------------------------- main
def main() -> int:
    outputs: dict[Path, Image.Image] = {
        RP / "textures/items/gladius.png": sprite(GLADIUS, GLADIUS_PAL),
        RP / "textures/items/pilum.png": sprite(PILUM, PILUM_PAL),
        RP / "textures/items/denarius.png": sprite(DENARIUS, DENARIUS_PAL),
        RP / "textures/blocks/marble_pillar.png": noise_texture(sprite(MARBLE, MARBLE_PAL), seed=7, amount=4),
        RP / "textures/blocks/colosseum_altar.png": noise_texture(sprite(ALTAR, ALTAR_PAL), seed=11, amount=6),
        RP / "textures/entity/legionary.png": legionary_skin(),
        RP / "pack_icon.png": pack_icon(),
        BP / "pack_icon.png": pack_icon(),
    }
    ok = True
    for path, img in outputs.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        img.save(path, "PNG")
        size = path.stat().st_size
        # Verificación: el PNG debe reabrirse, ser RGBA y tener contenido visible.
        with Image.open(path) as check:
            visible = check.convert("RGBA").getchannel("A").getbbox() is not None
            valid = check.format == "PNG" and visible and size > 100
        ok &= valid
        print(f"{'OK ' if valid else 'ERR'} {path.relative_to(ROOT)}  {img.width}x{img.height}  {size} bytes")
    if not ok:
        print("❌ Alguna textura no es válida", file=sys.stderr)
        return 1
    print(f"✅ {len(outputs)} texturas generadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
