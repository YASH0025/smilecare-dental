#!/usr/bin/env python3
"""Generates the flat-illustration SVG assets used by the SmileCare demo.

All artwork is original and generated here. Swap any path in the CMS for real
photography later (the image fields accept URLs or /images/... paths).
"""
import os, math

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "images")

NAVY = "#0b1b34"
BLUE = "#1f5ad6"
BLUE_2 = "#3b74e6"
SKY = "#dce7fb"
SKY_2 = "#eef4ff"
MIST = "#f5f8fd"
TEAL = "#0f9b9a"
TEAL_SOFT = "#d8f1ef"
SAND = "#f4ebe0"
WOOD = "#d8b894"
WOOD_D = "#b89370"
WHITE = "#ffffff"
LINE = "#c9d6ea"
ENAMEL = "#fbfcfe"
ENAMEL_EDGE = "#d4dceb"
GUM = "#f2a7a5"
LIP = "#d98a86"
SKIN = ["#f1c9a5", "#e0ae88", "#c98e6b", "#a86f4f"]
HAIR = ["#2a1d17", "#3b2a20", "#1b1b1f", "#5a3b2a"]


def svg(w, h, body, bg=None):
    bgrect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{bgrect}{body}</svg>'


def save(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)


# ------------------------------------------------------------------ primitives
def tooth(x, y, s=1.0, fill=ENAMEL, stroke=NAVY, sw=6, extra=""):
    """Molar outline, origin top-left, ~ 120x140 at s=1."""
    d = (
        "M20 28 C20 8 45 0 60 12 C75 0 100 8 100 28 C100 55 92 68 90 90 "
        "C88 112 84 136 74 136 C64 136 66 104 60 104 C54 104 56 136 46 136 "
        "C36 136 32 112 30 90 C28 68 20 55 20 28 Z"
    )
    return (
        f'<g transform="translate({x} {y}) scale({s})">'
        f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>{extra}</g>'
    )


def sparkle(x, y, r, color=TEAL):
    return (
        f'<path d="M{x} {y-r} Q{x+r*0.18} {y-r*0.18} {x+r} {y} Q{x+r*0.18} {y+r*0.18} {x} {y+r} '
        f'Q{x-r*0.18} {y+r*0.18} {x-r} {y} Q{x-r*0.18} {y-r*0.18} {x} {y-r} Z" fill="{color}"/>'
    )


def dots_pattern(w, h, color, step=26, r=1.6, opacity=0.5):
    out = []
    for yy in range(step // 2, h, step):
        for xx in range(step // 2, w, step):
            out.append(f'<circle cx="{xx}" cy="{yy}" r="{r}" fill="{color}" opacity="{opacity}"/>')
    return "".join(out)


def card_bg(w, h, tint, accent):
    return (
        f'<rect width="{w}" height="{h}" fill="{tint}"/>'
        f'<circle cx="{w*0.82}" cy="{h*0.18}" r="{h*0.42}" fill="{accent}" opacity="0.35"/>'
        f'<circle cx="{w*0.12}" cy="{h*0.95}" r="{h*0.32}" fill="{WHITE}" opacity="0.55"/>'
        + dots_pattern(w, h, accent, 28, 1.6, 0.55)
    )


# ------------------------------------------------------------------ service art
def service_glyph(kind):
    cx, cy = 400, 300
    t = lambda **k: tooth(cx - 90, cy - 118, 1.5, **k)
    g = []
    if kind == "implant":
        g.append(tooth(cx - 72, cy - 150, 1.2, extra=""))
        # screw
        g.append(f'<rect x="{cx-16}" y="{cy+18}" width="32" height="120" rx="10" fill="{SKY}" stroke="{NAVY}" stroke-width="6"/>')
        for i in range(5):
            yy = cy + 34 + i * 20
            g.append(f'<path d="M{cx-24} {yy} L{cx+24} {yy+8}" stroke="{NAVY}" stroke-width="6" stroke-linecap="round"/>')
        g.append(f'<rect x="{cx-110}" y="{cy+20}" width="220" height="12" rx="6" fill="{GUM}" opacity=".6"/>')
    elif kind == "rootcanal":
        g.append(t())
        g.append(f'<path d="M{cx-18} {cy-40} C{cx-24} {cy+20} {cx-30} {cy+60} {cx-36} {cy+86}" stroke="{BLUE}" stroke-width="8" fill="none" stroke-linecap="round"/>')
        g.append(f'<path d="M{cx+18} {cy-40} C{cx+24} {cy+20} {cx+30} {cy+60} {cx+36} {cy+86}" stroke="{BLUE}" stroke-width="8" fill="none" stroke-linecap="round"/>')
        g.append(f'<ellipse cx="{cx}" cy="{cy-50}" rx="34" ry="16" fill="{SKY}" stroke="{BLUE}" stroke-width="6"/>')
    elif kind == "whitening":
        g.append(t())
        g += [sparkle(cx + 130, cy - 110, 30), sparkle(cx - 140, cy - 60, 18, BLUE), sparkle(cx + 150, cy + 30, 14, BLUE)]
        g.append(f'<path d="M{cx-30} {cy-80} q20 -18 44 -10" stroke="{SKY}" stroke-width="10" fill="none" stroke-linecap="round"/>')
    elif kind == "crown":
        g.append(t())
        g.append(f'<path d="M{cx-92} {cy-40} L{cx-92} {cy-110} L{cx-46} {cy-78} L{cx} {cy-128} L{cx+46} {cy-78} L{cx+92} {cy-110} L{cx+92} {cy-40} Z" fill="#f6d98f" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/>')
    elif kind == "veneer":
        g.append(f'<rect x="{cx-70}" y="{cy-130}" width="140" height="210" rx="56" fill="{ENAMEL}" stroke="{NAVY}" stroke-width="6"/>')
        g.append(f'<rect x="{cx-50}" y="{cy-110}" width="130" height="190" rx="50" fill="{SKY}" opacity=".7" stroke="{BLUE}" stroke-width="5"/>')
        g.append(sparkle(cx + 120, cy - 100, 22))
    elif kind == "aligner":
        g.append(f'<path d="M{cx-190} {cy+40} C{cx-190} {cy-160} {cx+190} {cy-160} {cx+190} {cy+40}" fill="none" stroke="{NAVY}" stroke-width="44" stroke-linecap="round" opacity=".08"/>')
        for i in range(8):
            a = math.pi * (0.1 + 0.8 * i / 7)
            x = cx - math.cos(a) * 160
            y = cy + 30 - math.sin(a) * 140
            g.append(f'<rect x="{x-20}" y="{y-24}" width="40" height="48" rx="14" fill="{ENAMEL}" stroke="{NAVY}" stroke-width="5"/>')
        g.append(f'<path d="M{cx-188} {cy+40} C{cx-188} {cy-160} {cx+188} {cy-160} {cx+188} {cy+40}" fill="none" stroke="{TEAL}" stroke-width="10" stroke-linecap="round" opacity=".55"/>')
    elif kind == "braces":
        for i in range(5):
            x = cx - 200 + i * 84
            g.append(f'<rect x="{x}" y="{cy-90}" width="72" height="140" rx="26" fill="{ENAMEL}" stroke="{NAVY}" stroke-width="6"/>')
            g.append(f'<rect x="{x+20}" y="{cy-30}" width="32" height="26" rx="5" fill="{LINE}" stroke="{NAVY}" stroke-width="4"/>')
        g.append(f'<path d="M{cx-200} {cy-17} L{cx+212} {cy-17}" stroke="{BLUE}" stroke-width="6"/>')
    elif kind == "cleaning":
        g.append(tooth(cx - 150, cy - 118, 1.4))
        g.append(f'<g transform="rotate(-30 {cx+120} {cy})"><rect x="{cx+40}" y="{cy-14}" width="220" height="28" rx="14" fill="{BLUE}"/>'
                 f'<rect x="{cx+30}" y="{cy-64}" width="70" height="50" rx="8" fill="{WHITE}" stroke="{NAVY}" stroke-width="5"/>'
                 + "".join(f'<line x1="{cx+40+i*12}" y1="{cy-60}" x2="{cx+40+i*12}" y2="{cy-18}" stroke="{TEAL}" stroke-width="5"/>' for i in range(5))
                 + "</g>")
        g += [f'<circle cx="{cx+60}" cy="{cy-150}" r="14" fill="{WHITE}" stroke="{LINE}" stroke-width="4"/>', f'<circle cx="{cx+100}" cy="{cy-120}" r="9" fill="{WHITE}" stroke="{LINE}" stroke-width="4"/>']
    elif kind == "filling":
        g.append(t())
        g.append(f'<path d="M{cx-40} {cy-80} q40 -30 80 0 q-6 40 -40 44 q-34 -4 -40 -44Z" fill="{SKY}" stroke="{BLUE}" stroke-width="6"/>')
    elif kind == "extraction":
        g.append(tooth(cx - 80, cy - 170, 1.3))
        g.append(f'<path d="M{cx} {cy+120} L{cx} {cy+30}" stroke="{BLUE}" stroke-width="10" stroke-linecap="round"/>')
        g.append(f'<path d="M{cx-26} {cy+56} L{cx} {cy+28} L{cx+26} {cy+56}" stroke="{BLUE}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
        g.append(f'<rect x="{cx-150}" y="{cy+130}" width="300" height="14" rx="7" fill="{GUM}" opacity=".6"/>')
    elif kind == "wisdom":
        g.append(f'<g transform="rotate(-22 {cx} {cy})">{tooth(cx-90, cy-118, 1.5)}</g>')
        g.append(f'<path d="M{cx-200} {cy+120} C{cx-80} {cy+60} {cx+80} {cy+60} {cx+200} {cy+120}" stroke="{GUM}" stroke-width="18" fill="none" stroke-linecap="round" opacity=".7"/>')
    elif kind == "kids":
        g.append(tooth(cx - 72, cy - 110, 1.2, fill=WHITE))
        g.append(f'<circle cx="{cx-22}" cy="{cy-40}" r="7" fill="{NAVY}"/><circle cx="{cx+22}" cy="{cy-40}" r="7" fill="{NAVY}"/>')
        g.append(f'<path d="M{cx-22} {cy-12} q22 22 44 0" stroke="{NAVY}" stroke-width="6" fill="none" stroke-linecap="round"/>')
        g.append(f'<circle cx="{cx-40}" cy="{cy-20}" r="9" fill="{GUM}" opacity=".6"/><circle cx="{cx+40}" cy="{cy-20}" r="9" fill="{GUM}" opacity=".6"/>')
        g += [sparkle(cx + 130, cy - 110, 22, "#f2b84b"), sparkle(cx - 140, cy - 90, 16)]
    elif kind == "gum":
        g.append(t())
        g.append(f'<path d="M{cx-200} {cy+10} C{cx-120} {cy-40} {cx-60} {cy+30} {cx} {cy-10} C{cx+60} {cy+30} {cx+120} {cy-40} {cx+200} {cy+10} L{cx+200} {cy+160} L{cx-200} {cy+160} Z" fill="{GUM}" opacity=".85"/>')
    elif kind == "dentures":
        g.append(f'<path d="M{cx-200} {cy+60} C{cx-200} {cy-150} {cx+200} {cy-150} {cx+200} {cy+60} L{cx+150} {cy+60} C{cx+150} {cy-90} {cx-150} {cy-90} {cx-150} {cy+60} Z" fill="{GUM}" stroke="{NAVY}" stroke-width="6" stroke-linejoin="round"/>')
        for i in range(10):
            a = math.pi * (0.08 + 0.84 * i / 9)
            x = cx - math.cos(a) * 150
            y = cy + 40 - math.sin(a) * 128
            g.append(f'<rect x="{x-16}" y="{y-20}" width="32" height="40" rx="12" fill="{ENAMEL}" stroke="{NAVY}" stroke-width="4"/>')
    elif kind == "makeover":
        g.append(f'<path d="M{cx-200} {cy-30} Q{cx} {cy+160} {cx+200} {cy-30} Q{cx} {cy+60} {cx-200} {cy-30} Z" fill="{LIP}" stroke="{NAVY}" stroke-width="6"/>')
        g.append(f'<path d="M{cx-160} {cy-4} Q{cx} {cy+90} {cx+160} {cy-4} Q{cx} {cy+30} {cx-160} {cy-4} Z" fill="{WHITE}" stroke="{NAVY}" stroke-width="4"/>')
        for i in range(1, 8):
            x = cx - 160 + i * 40
            g.append(f'<line x1="{x}" y1="{cy+4}" x2="{x}" y2="{cy+46}" stroke="{ENAMEL_EDGE}" stroke-width="3"/>')
        g += [sparkle(cx + 170, cy - 110, 28), sparkle(cx - 170, cy - 110, 18, BLUE), sparkle(cx + 60, cy - 150, 12, BLUE)]
    elif kind == "consult":
        g.append(f'<rect x="{cx-170}" y="{cy-150}" width="340" height="250" rx="22" fill="{NAVY}"/>')
        g.append(f'<rect x="{cx-150}" y="{cy-130}" width="300" height="210" rx="12" fill="#1c2f52"/>')
        for i in range(6):
            x = cx - 130 + i * 46
            g.append(f'<rect x="{x}" y="{cy-100}" width="34" height="62" rx="12" fill="#c7d6f2" opacity=".85"/>')
            g.append(f'<rect x="{x}" y="{cy-10}" width="34" height="62" rx="12" fill="#c7d6f2" opacity=".75"/>')
        g.append(f'<rect x="{cx-30}" y="{cy+100}" width="60" height="40" fill="{NAVY}"/><rect x="{cx-90}" y="{cy+136}" width="180" height="14" rx="7" fill="{NAVY}"/>')
    return "".join(g)


SERVICES = {
    "dental-implants": ("implant", SKY_2, "#bcd0f6"),
    "root-canal": ("rootcanal", SKY_2, "#bcd0f6"),
    "teeth-whitening": ("whitening", "#eefaf8", "#b9e6e1"),
    "dental-crowns": ("crown", "#fbf6ee", "#f1dcb6"),
    "porcelain-veneers": ("veneer", "#eefaf8", "#b9e6e1"),
    "clear-aligners": ("aligner", "#f3f0fd", "#d6cbf6"),
    "braces": ("braces", "#f3f0fd", "#d6cbf6"),
    "dental-cleaning": ("cleaning", "#eefaf8", "#b9e6e1"),
    "tooth-fillings": ("filling", SKY_2, "#bcd0f6"),
    "tooth-extraction": ("extraction", "#fbf2f1", "#f3cfcb"),
    "wisdom-tooth-removal": ("wisdom", "#fbf2f1", "#f3cfcb"),
    "pediatric-dentistry": ("kids", "#fff8ea", "#f6dfa6"),
    "gum-treatment": ("gum", "#fbf2f1", "#f3cfcb"),
    "dentures": ("dentures", "#fbf6ee", "#f1dcb6"),
    "smile-makeover": ("makeover", "#eefaf8", "#b9e6e1"),
    "dental-consultation": ("consult", SKY_2, "#bcd0f6"),
}


def build_services():
    for slug, (kind, tint, accent) in SERVICES.items():
        body = card_bg(800, 600, tint, accent) + f'<g transform="translate(400 300) scale(1.3) translate(-400 -300)">{service_glyph(kind)}</g>'
        save(f"services/{slug}.svg", svg(800, 600, body))


# ------------------------------------------------------------------ people
def person(x, y, s=1.0, skin=SKIN[0], hair=HAIR[0], style="short", coat=WHITE, scrub=BLUE, mask=False, stetho=True):
    """Bust figure; (x,y) = top of head centre."""
    parts = []
    # shoulders / coat
    parts.append(f'<path d="M-150 330 C-150 220 -90 180 0 180 C90 180 150 220 150 330 Z" fill="{coat}" stroke="{NAVY}" stroke-width="5"/>')
    parts.append(f'<path d="M-40 184 L0 260 L40 184 Z" fill="{scrub}"/>')
    parts.append(f'<path d="M-40 184 L-10 330 M40 184 L10 330" stroke="{NAVY}" stroke-width="4" opacity=".35"/>')
    # neck
    parts.append(f'<rect x="-24" y="140" width="48" height="52" rx="16" fill="{skin}"/>')
    # hair back (long)
    if style == "long":
        parts.append(f'<path d="M-78 40 C-86 150 -70 210 -40 214 L40 214 C70 210 86 150 78 40 Z" fill="{hair}"/>')
    # head
    parts.append(f'<ellipse cx="0" cy="84" rx="66" ry="78" fill="{skin}"/>')
    # ears
    parts.append(f'<ellipse cx="-64" cy="92" rx="10" ry="16" fill="{skin}"/><ellipse cx="64" cy="92" rx="10" ry="16" fill="{skin}"/>')
    # hair front
    if style == "short":
        parts.append(f'<path d="M-68 74 C-72 10 -20 -4 8 2 C50 6 74 30 68 74 C58 44 30 34 -4 38 C-36 40 -58 52 -68 74 Z" fill="{hair}"/>')
    elif style == "long":
        parts.append(f'<path d="M-70 90 C-76 14 -20 -6 10 2 C54 8 78 40 70 96 C60 50 34 34 4 38 C-10 60 -44 64 -70 90 Z" fill="{hair}"/>')
    elif style == "bun":
        parts.append(f'<circle cx="0" cy="-6" r="30" fill="{hair}"/>')
        parts.append(f'<path d="M-68 80 C-72 14 -20 -2 8 4 C52 8 74 36 68 80 C56 46 28 36 -4 40 C-34 42 -56 56 -68 80 Z" fill="{hair}"/>')
    # face
    if mask:
        parts.append(f'<path d="M-52 96 Q0 86 52 96 L46 138 Q0 158 -46 138 Z" fill="#bfe4e1" stroke="{NAVY}" stroke-width="3"/>')
        parts.append(f'<circle cx="-22" cy="80" r="5" fill="{NAVY}"/><circle cx="22" cy="80" r="5" fill="{NAVY}"/>')
    else:
        parts.append(f'<circle cx="-22" cy="84" r="5" fill="{NAVY}"/><circle cx="22" cy="84" r="5" fill="{NAVY}"/>')
        parts.append(f'<path d="M-16 118 Q0 130 16 118" stroke="{NAVY}" stroke-width="4" fill="none" stroke-linecap="round"/>')
        parts.append(f'<circle cx="-36" cy="104" r="9" fill="{GUM}" opacity=".35"/><circle cx="36" cy="104" r="9" fill="{GUM}" opacity=".35"/>')
    if stetho:
        parts.append(f'<path d="M-46 200 C-60 260 -30 290 0 292 C30 290 60 260 46 200" stroke="{NAVY}" stroke-width="5" fill="none"/>')
        parts.append(f'<circle cx="0" cy="300" r="12" fill="{SKY}" stroke="{NAVY}" stroke-width="4"/>')
    return f'<g transform="translate({x} {y}) scale({s})">{"".join(parts)}</g>'


def build_dentists():
    conf = {
        "dr-ananya-deshmukh": dict(skin=SKIN[1], hair=HAIR[0], style="long", bg=SKY_2, accent="#c7d8f7"),
        "dr-rohan-mehta": dict(skin=SKIN[2], hair=HAIR[2], style="short", bg="#eefaf8", accent="#bfe6e1"),
        "dr-kavya-iyer": dict(skin=SKIN[2], hair=HAIR[1], style="bun", bg="#f3f0fd", accent="#dcd2f7"),
    }
    for slug, c in conf.items():
        body = (
            f'<rect width="600" height="720" fill="{c["bg"]}"/>'
            f'<circle cx="470" cy="150" r="190" fill="{c["accent"]}" opacity=".5"/>'
            + dots_pattern(600, 720, c["accent"], 30, 1.6, 0.7)
            + person(300, 250, 1.35, skin=c["skin"], hair=c["hair"], style=c["style"])
        )
        save(f"dentists/{slug}.svg", svg(600, 720, body))


# ------------------------------------------------------------------ smile (portfolio)
def smile(state, w=800, h=600):
    """Front teeth framed by lips. state controls the defect shown."""
    cx, cy = w / 2, h / 2 + 10
    out = [f'<rect width="{w}" height="{h}" fill="{"#f6efe9" if state != "after" else "#eef5fb"}"/>']
    # face skin area
    out.append(f'<rect width="{w}" height="{h}" fill="{SKIN[1]}" opacity=".35"/>')
    # lips outer
    out.append(
        f'<path d="M{cx-300} {cy-20} C{cx-200} {cy-150} {cx-60} {cy-120} {cx} {cy-96} C{cx+60} {cy-120} {cx+200} {cy-150} {cx+300} {cy-20} '
        f'C{cx+200} {cy+170} {cx-200} {cy+170} {cx-300} {cy-20} Z" fill="{LIP}"/>'
    )
    # mouth opening
    out.append(
        f'<path d="M{cx-250} {cy-20} C{cx-150} {cy-80} {cx+150} {cy-80} {cx+250} {cy-20} C{cx+150} {cy+110} {cx-150} {cy+110} {cx-250} {cy-20} Z" fill="#5a1f22"/>'
    )
    # gums upper
    out.append(f'<path d="M{cx-240} {cy-24} C{cx-150} {cy-76} {cx+150} {cy-76} {cx+240} {cy-24} L{cx+240} {cy-10} C{cx+150} {cy-50} {cx-150} {cy-50} {cx-240} {cy-10} Z" fill="{GUM}"/>')

    widths = [46, 54, 60, 72, 72, 60, 54, 46]
    total = sum(widths) + 7 * 3
    x = cx - total / 2
    enamel = {"after": ENAMEL, "stain": "#efe0b6", "cleaning": "#eadbb3"}.get(state, "#f7f3ea")
    for i, tw in enumerate(widths):
        th = 96 if i in (3, 4) else (84 if i in (2, 5) else 74)
        ty = cy - 52
        dx, rot, fill, skip, chip = 0, 0, enamel, False, False
        if state == "crowded" and i in (2, 5):
            rot = -10 if i == 2 else 12
            dx = 8 if i == 2 else -8
        if state == "crowded" and i in (3,):
            ty += 6
        if state == "gap" and i >= 4:
            dx = 22
        if state == "gap" and i <= 3:
            dx = -22
        if state == "missing" and i == 5:
            skip = True
        if state == "chip" and i == 3:
            chip = True
        if state == "crown" and i == 6:
            fill = "#b9a58a"
        if state == "makeover":
            fill = "#efe0b6"
            if i == 4:
                chip = True
            if i in (1, 6):
                rot = 8 if i == 1 else -8
        if not skip:
            path_chip = (
                f'<path d="M{x+tw*0.5+dx} {ty+th} l{tw*0.3} -{th*0.28} l{tw*0.22} {th*0.1} Z" fill="#5a1f22"/>' if chip else ""
            )
            out.append(
                f'<g transform="rotate({rot} {x+tw/2+dx} {ty+th/2})">'
                f'<rect x="{x+dx}" y="{ty}" width="{tw}" height="{th}" rx="{tw*0.32}" fill="{fill}" stroke="{ENAMEL_EDGE}" stroke-width="2"/>'
                f'<rect x="{x+dx+tw*0.2}" y="{ty+8}" width="{tw*0.18}" height="{th*0.5}" rx="{tw*0.09}" fill="{WHITE}" opacity=".55"/>'
                f"{path_chip}</g>"
            )
        x += tw + 3
    # lower teeth hint
    out.append(f'<path d="M{cx-180} {cy+54} C{cx-80} {cy+86} {cx+80} {cy+86} {cx+180} {cy+54}" stroke="{enamel}" stroke-width="22" fill="none" stroke-linecap="round" opacity=".9"/>')
    if state == "after":
        out.append(sparkle(cx + 230, cy - 150, 22, TEAL))
        out.append(sparkle(cx + 270, cy - 110, 12, BLUE))
    return svg(w, h, "".join(out))


def build_portfolio():
    cases = {
        "whitening": "stain",
        "implant": "missing",
        "aligners": "crowded",
        "veneers": "chip",
        "bonding": "chip",
        "gap": "gap",
        "cleaning": "cleaning",
        "crown": "crown",
        "makeover": "makeover",
        "bridge": "missing",
    }
    for name, before in cases.items():
        save(f"portfolio/{name}-before.svg", smile(before))
        save(f"portfolio/{name}-after.svg", smile("after"))


# ------------------------------------------------------------------ scenes
def room(w, h, wall=MIST, floor=SAND):
    return (
        f'<rect width="{w}" height="{h}" fill="{wall}"/>'
        f'<rect y="{h*0.72}" width="{w}" height="{h*0.28}" fill="{floor}"/>'
        f'<rect y="{h*0.72-6}" width="{w}" height="6" fill="{LINE}"/>'
    )


def window(x, y, w, h):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#e3edfb" stroke="{LINE}" stroke-width="6"/>'
        f'<rect x="{x+w*0.08}" y="{y+h*0.55}" width="{w*0.2}" height="{h*0.45}" fill="#c8d8f3"/>'
        f'<rect x="{x+w*0.32}" y="{y+h*0.38}" width="{w*0.16}" height="{h*0.62}" fill="#bccff0"/>'
        f'<rect x="{x+w*0.55}" y="{y+h*0.5}" width="{w*0.22}" height="{h*0.5}" fill="#c8d8f3"/>'
        f'<line x1="{x+w/2}" y1="{y}" x2="{x+w/2}" y2="{y+h}" stroke="{LINE}" stroke-width="5"/>'
    )


def plant(x, y, s=1.0):
    return (
        f'<g transform="translate({x} {y}) scale({s})">'
        f'<path d="M-30 0 L30 0 L22 60 L-22 60 Z" fill="{WOOD}"/>'
        f'<path d="M0 0 C-50 -40 -40 -110 -6 -130 C-10 -80 -4 -40 0 0 Z" fill="{TEAL}"/>'
        f'<path d="M0 0 C40 -30 60 -90 30 -120 C22 -70 12 -40 0 0 Z" fill="#2fb3a8"/>'
        f'<path d="M0 0 C-10 -50 20 -90 10 -150 C-12 -110 -14 -50 0 0 Z" fill="#128a84"/>'
        "</g>"
    )


def dental_chair(x, y, s=1.0):
    return (
        f'<g transform="translate({x} {y}) scale({s})">'
        f'<rect x="-10" y="120" width="40" height="90" fill="{NAVY}" opacity=".85"/>'
        f'<rect x="-80" y="200" width="200" height="20" rx="10" fill="{NAVY}" opacity=".85"/>'
        f'<path d="M-160 40 C-180 20 -170 -10 -140 -6 L40 30 C70 36 90 60 110 90 L150 150 C160 170 140 184 124 172 L80 120 C60 100 40 96 20 96 L-120 96 C-150 96 -160 70 -160 40 Z" fill="{BLUE}"/>'
        f'<path d="M-170 -40 C-190 -44 -196 -10 -176 0 L-130 20 C-110 24 -104 -8 -124 -16 Z" fill="{BLUE_2}"/>'
        f'<rect x="-130" y="96" width="200" height="30" rx="14" fill="#174bb8"/>'
        "</g>"
    )


def lamp(x, y, s=1.0):
    return (
        f'<g transform="translate({x} {y}) scale({s})">'
        f'<path d="M0 0 L0 -140 L120 -170" stroke="{NAVY}" stroke-width="8" fill="none" stroke-linecap="round"/>'
        f'<ellipse cx="140" cy="-160" rx="46" ry="22" fill="{WHITE}" stroke="{NAVY}" stroke-width="6"/>'
        f'<path d="M110 -148 L60 -40 L220 -40 L170 -148 Z" fill="#fff7d6" opacity=".45"/>'
        "</g>"
    )


def monitor(x, y, w=160, h=110, screen="#1c2f52", content=""):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{NAVY}"/>'
        f'<rect x="{x+8}" y="{y+8}" width="{w-16}" height="{h-16}" rx="6" fill="{screen}"/>{content}'
        f'<rect x="{x+w/2-8}" y="{y+h}" width="16" height="30" fill="{NAVY}"/>'
        f'<rect x="{x+w/2-40}" y="{y+h+28}" width="80" height="10" rx="5" fill="{NAVY}"/>'
    )


def xray_teeth(x, y, w, h):
    out = []
    n = 6
    for i in range(n):
        xx = x + 10 + i * (w - 20) / n
        out.append(f'<rect x="{xx}" y="{y+10}" width="{(w-20)/n-6}" height="{h/2-16}" rx="8" fill="#c7d6f2" opacity=".85"/>')
        out.append(f'<rect x="{xx}" y="{y+h/2+4}" width="{(w-20)/n-6}" height="{h/2-16}" rx="8" fill="#c7d6f2" opacity=".7"/>')
    return "".join(out)


def desk(x, y, w, h=110, color=WOOD):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{color}"/>'
        f'<rect x="{x}" y="{y}" width="{w}" height="16" rx="8" fill="{WOOD_D}"/>'
    )


def sofa(x, y, w=260):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="70" rx="22" fill="{TEAL}"/>'
        f'<rect x="{x+10}" y="{y-50}" width="{w-20}" height="70" rx="22" fill="#2fb3a8"/>'
        f'<rect x="{x+18}" y="{y+68}" width="12" height="26" fill="{NAVY}"/><rect x="{x+w-30}" y="{y+68}" width="12" height="26" fill="{NAVY}"/>'
    )


def logo_sign(x, y, text="SmileCare"):
    return (
        f'<g transform="translate({x} {y})">'
        f'<rect x="0" y="0" width="260" height="70" rx="14" fill="{WHITE}" stroke="{LINE}" stroke-width="3"/>'
        + tooth(16, 12, 0.34, fill=BLUE, stroke=BLUE, sw=4)
        + f'<text x="72" y="46" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="{NAVY}">{text}</text>'
        "</g>"
    )


def scene(kind, w=900, h=640):
    b = [room(w, h)]
    if kind == "reception":
        b += [window(520, 70, 300, 220), logo_sign(90, 110), desk(80, 330, 380, 130), monitor(300, 250, 120, 80), sofa(560, 410, 280), plant(830, 460, 0.9)]
    elif kind == "operatory":
        b += [window(80, 70, 260, 200), dental_chair(470, 320, 1.4), lamp(640, 330, 1.2), monitor(90, 330, 180, 120, content=xray_teeth(98, 338, 164, 104)), plant(830, 470, 0.8)]
    elif kind == "sterilisation":
        b += [f'<rect x="80" y="320" width="740" height="140" rx="10" fill="{WHITE}" stroke="{LINE}" stroke-width="4"/>']
        b += [f'<rect x="130" y="210" width="200" height="140" rx="18" fill="#e7ecf4" stroke="{NAVY}" stroke-width="5"/>', f'<circle cx="230" cy="280" r="42" fill="{WHITE}" stroke="{NAVY}" stroke-width="5"/>', f'<circle cx="230" cy="280" r="26" fill="{SKY}"/>']
        for i in range(4):
            b.append(f'<rect x="{430+i*90}" y="250" width="70" height="80" rx="8" fill="{TEAL_SOFT}" stroke="{TEAL}" stroke-width="4"/>')
        b += [f'<rect x="80" y="90" width="740" height="18" rx="9" fill="{WOOD}"/>'] + [f'<rect x="{110+i*70}" y="50" width="46" height="40" rx="6" fill="{SKY}"/>' for i in range(10)]
    elif kind == "xray":
        b += [f'<rect x="420" y="80" width="40" height="380" fill="{NAVY}"/>', f'<rect x="300" y="120" width="300" height="60" rx="30" fill="{WHITE}" stroke="{NAVY}" stroke-width="6"/>',
              f'<path d="M320 180 C320 270 580 270 580 180" stroke="{NAVY}" stroke-width="12" fill="none"/>', f'<rect x="360" y="440" width="160" height="30" rx="10" fill="{NAVY}"/>',
              monitor(620, 260, 200, 140, content=xray_teeth(628, 268, 184, 124)), plant(140, 460, 1)]
    elif kind == "scanner":
        b += [desk(120, 380, 660), monitor(300, 160, 300, 200, content=f'<path d="M330 320 C330 200 570 200 570 320" stroke="#c7d6f2" stroke-width="30" fill="none" stroke-linecap="round"/>'),
              f'<g transform="rotate(-25 650 330)"><rect x="600" y="310" width="170" height="40" rx="20" fill="{WHITE}" stroke="{NAVY}" stroke-width="5"/><rect x="580" y="316" width="40" height="28" rx="10" fill="{TEAL}"/></g>']
    elif kind == "team":
        b = [f'<rect width="{w}" height="{h}" fill="{SKY_2}"/>', dots_pattern(w, h, "#c7d8f7", 30, 1.6, 0.8), window(560, 60, 260, 160)]
        b += [person(230, 250, 0.9, skin=SKIN[1], hair=HAIR[0], style="long"), person(450, 210, 1.0, skin=SKIN[2], hair=HAIR[2], style="short"), person(670, 250, 0.9, skin=SKIN[2], hair=HAIR[1], style="bun", coat="#e6f3f2", scrub=TEAL)]
    elif kind == "frontdesk":
        b += [logo_sign(320, 90), person(320, 250, 0.8, skin=SKIN[0], hair=HAIR[3], style="bun", coat=TEAL_SOFT, scrub=TEAL, stetho=False), person(580, 250, 0.8, skin=SKIN[2], hair=HAIR[2], style="short", coat=TEAL_SOFT, scrub=TEAL, stetho=False), desk(140, 400, 620, 160)]
    elif kind == "surgery":
        b += [dental_chair(380, 330, 1.3), lamp(560, 330, 1.2), person(700, 250, 0.8, skin=SKIN[1], hair=HAIR[0], style="bun", coat="#cfe5e3", scrub=TEAL, mask=True, stetho=False)]
    elif kind == "aligner-fit":
        b = [f'<rect width="{w}" height="{h}" fill="#f3f0fd"/>', dots_pattern(w, h, "#dcd2f7", 30, 1.6, 0.8)]
        b.append(f'<g transform="translate(0 20)">{service_glyph("aligner").replace("400", "450")}</g>')
    elif kind == "camp":
        b = [f'<rect width="{w}" height="{h}" fill="#fff8ea"/>', f'<rect y="{h*0.7}" width="{w}" height="{h*0.3}" fill="#e9f2dc"/>']
        colors = [BLUE, TEAL, "#f2b84b", LIP]
        b.append(f'<path d="M40 80 Q450 180 860 80" stroke="{NAVY}" stroke-width="3" fill="none"/>')
        for i in range(12):
            xx = 70 + i * 66
            yy = 80 + math.sin(math.pi * (i + 0.5) / 12) * 70
            b.append(f'<path d="M{xx-18} {yy} L{xx+18} {yy} L{xx} {yy+36} Z" fill="{colors[i%4]}"/>')
        b += [f'<path d="M300 440 L450 250 L600 440 Z" fill="{BLUE}"/>', f'<path d="M450 250 L520 440 L600 440 Z" fill="#174bb8"/>', f'<path d="M420 440 L450 360 L480 440 Z" fill="{NAVY}"/>',
              tooth(120, 330, 0.9, fill=WHITE), tooth(680, 360, 0.7, fill=WHITE)]
    elif kind == "oralhealthday":
        b = [f'<rect width="{w}" height="{h}" fill="{TEAL_SOFT}"/>', dots_pattern(w, h, "#a8ddd7", 30, 1.6, 0.8)]
        b += [f'<rect x="150" y="80" width="600" height="110" rx="20" fill="{WHITE}"/>', f'<text x="450" y="148" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="700" fill="{NAVY}">World Oral Health Day</text>',
              tooth(360, 250, 1.5, fill=WHITE), f'<circle cx="420" cy="330" r="8" fill="{NAVY}"/><circle cx="480" cy="330" r="8" fill="{NAVY}"/><path d="M420 360 q30 26 60 0" stroke="{NAVY}" stroke-width="6" fill="none" stroke-linecap="round"/>',
              sparkle(660, 300, 30, BLUE), sparkle(240, 320, 20, BLUE)]
    elif kind == "consult":
        b += [window(560, 70, 260, 200), desk(120, 360, 560), monitor(160, 230, 180, 120, content=xray_teeth(168, 238, 164, 104)),
              f'<rect x="700" y="340" width="120" height="120" rx="20" fill="{TEAL}"/><rect x="700" y="280" width="30" height="120" rx="12" fill="#2fb3a8"/>', plant(800, 520, 0.7)]
    return svg(w, h, "".join(b))


def build_gallery():
    for name in ["reception", "operatory", "sterilisation", "xray", "scanner", "team", "frontdesk", "surgery", "aligner-fit", "camp", "oralhealthday", "consult"]:
        save(f"gallery/{name}.svg", scene(name))


def build_hero():
    w, h = 960, 1040
    b = [
        f'<rect width="{w}" height="{h}" fill="{SKY_2}"/>',
        f'<rect y="{h*0.74}" width="{w}" height="{h*0.26}" fill="#e6eefb"/>',
        dots_pattern(w, int(h * 0.74), "#c7d8f7", 32, 1.7, 0.8),
        window(80, 110, 360, 300),
        logo_sign(560, 140),
        f'<rect x="560" y="240" width="300" height="12" rx="6" fill="{LINE}"/>',
        f'<rect x="560" y="266" width="220" height="12" rx="6" fill="{LINE}"/>',
        monitor(620, 420, 220, 150, content=xray_teeth(628, 428, 204, 134)),
        dental_chair(420, 640, 1.7),
        lamp(640, 620, 1.3),
        plant(110, 780, 1.1),
    ]
    save("hero-clinic.svg", svg(w, h, "".join(b)))


def build_about():
    save("about-team.svg", scene("team", 1000, 720))


def build_og():
    w, h = 1200, 630
    b = [f'<rect width="{w}" height="{h}" fill="{SKY_2}"/>', dots_pattern(w, h, "#c7d8f7", 32, 1.8, 0.8),
         tooth(90, 190, 1.8, fill=BLUE, stroke=BLUE),
         f'<text x="360" y="300" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="700" fill="{NAVY}">SmileCare</text>',
         f'<text x="364" y="370" font-family="Inter, Arial, sans-serif" font-size="36" fill="#4a5b75">Healthy Smile. Confident You.</text>',
         f'<text x="364" y="430" font-family="Inter, Arial, sans-serif" font-size="26" fill="{BLUE}">Dental Clinic · Indore</text>']
    save("og-image.svg", svg(w, h, "".join(b)))


if __name__ == "__main__":
    build_services()
    build_dentists()
    build_portfolio()
    build_gallery()
    build_hero()
    build_about()
    build_og()
    print("images generated in", os.path.abspath(ROOT))
