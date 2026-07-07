#!/usr/bin/env python3
"""WCAG 2.0 AA contrast checker for Chukfi Docs landing page.

Parses custom.css token definitions (:root and :root[data-theme="dark"]),
enumerates explicit text/background pairs from both the token system and
hardcoded inline styles in Unveiling.astro, computes WCAG relative luminance
and contrast ratio, flags everything < 4.5:1 (normal) or < 3:1 (large text).
"""

import re, math, json, sys
from pathlib import Path

ROOT = Path("/home/smattera/chukfi-docs")

# ── Luminance math ──────────────────────────────────────────────

def hex_to_rgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255.0,
            int(h[2:4], 16) / 255.0,
            int(h[4:6], 16) / 255.0)

def linear(c: float) -> float:
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hex_color: str) -> float:
    r, g, b = hex_to_rgb(hex_color)
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

def contrast_ratio(fg: str, bg: str) -> float:
    l1, l2 = luminance(fg), luminance(bg)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)

AA_NORMAL = 4.5
AA_LARGE = 3.0

# ── Parse token definitions ─────────────────────────────────────

def parse_tokens(css_text: str) -> tuple[dict[str, str], dict[str, str]]:
    """Return (light_tokens, dark_tokens) from custom.css."""
    light, dark = {}, {}

    # :root block (light mode)
    root_match = re.search(r':root\s*\{([^}]+)\}', css_text, re.DOTALL)
    if root_match:
        for m in re.finditer(r'--([\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})', root_match.group(1)):
            light[m.group(1)] = m.group(2).upper()

    # :root[data-theme="dark"] block
    dark_match = re.search(r':root\[data-theme="dark"\]\s*\{([^}]+)\}', css_text, re.DOTALL)
    if dark_match:
        for m in re.finditer(r'--([\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})', dark_match.group(1)):
            dark[m.group(1)] = m.group(2).upper()

    return light, dark

# ── Build the test matrix ───────────────────────────────────────

def build_matrix(light: dict, dark: dict, astro_text: str) -> list[dict]:
    """Return list of {fg, bg, mode, label, large} to check."""
    tests = []

    # Helper to resolve var() chains
    def resolve(token: str, tokens: dict) -> str | None:
        t = token.removeprefix("--")
        val = tokens.get(t)
        if val and val.startswith("var("):
            inner = val.removeprefix("var(").removesuffix(")").strip()
            return resolve(inner, tokens)
        return val

    bg_light = resolve("sl-color-bg", light) or "#F0FDF4"
    bg_dark = resolve("sl-color-bg", dark) or "#0C1222"

    # ── Light mode pairs ──
    lm = "light"
    # Body text (gray-1) on bg
    gray1_l = resolve("sl-color-gray-1", light) or "#1E293B"
    tests.append({"fg": gray1_l, "bg": bg_light, "mode": lm, "label": "body text (gray-1)", "large": False})
    # Secondary (gray-2) on bg
    gray2_l = resolve("sl-color-gray-2", light) or "#475569"
    tests.append({"fg": gray2_l, "bg": bg_light, "mode": lm, "label": "secondary text (gray-2)", "large": False})
    # Tertiary (gray-3) on bg
    gray3_l = resolve("sl-color-gray-3", light) or "#64748B"
    tests.append({"fg": gray3_l, "bg": bg_light, "mode": lm, "label": "tertiary text (gray-3)", "large": False})
    # Accent on bg (link color, hero-logo-svg, Teams para, unveiling badge — all now accent)
    acc_l = resolve("sl-color-accent", light) or "#0F766E"
    tests.append({"fg": acc_l, "bg": bg_light, "mode": lm, "label": "link/accent text", "large": False})
    tests.append({"fg": acc_l, "bg": bg_light, "mode": lm, "label": "hero-logo-svg (accent) on bg", "large": False})
    tests.append({"fg": acc_l, "bg": bg_light, "mode": lm, "label": "Teams para (accent) on bg", "large": False})
    tests.append({"fg": acc_l, "bg": bg_light, "mode": lm, "label": "unveiling badge text", "large": False})

    # Inline colors from Unveiling.astro
    # Facebook heading
    tests.append({"fg": "#1565D8", "bg": bg_light, "mode": lm, "label": "FB heading #1565D8", "large": True})
    # Unveiling-title (large text — clamp 2.5rem, 900 weight)
    tests.append({"fg": gray1_l, "bg": bg_light, "mode": lm, "label": "unveiling-title (large)", "large": True})

    # Solid sections: teal bg with white text
    tests.append({"fg": "#F0FDF4", "bg": "#0F766E", "mode": lm, "label": "teal section: F0FDF4 on #0F766E", "large": False})
    tests.append({"fg": "#F0FDF4", "bg": "#0F766E", "mode": lm, "label": "teal section heading (large)", "large": True})
    # Amber bg with dark text
    tests.append({"fg": "#0C1222", "bg": "#D97706", "mode": lm, "label": "amber section: #0C1222 on #D97706", "large": False})
    tests.append({"fg": "#0C1222", "bg": "#D97706", "mode": lm, "label": "amber section heading (large)", "large": True})

    # AWS section code block: var tokens on teal bg
    tests.append({"fg": resolve("sl-color-white", light) or "#0C1222", "bg": bg_light, "mode": lm, "label": "AWS code text on tint bg", "large": False})

    # ── Dark mode pairs ──
    dm = "dark"
    gray1_d = resolve("sl-color-gray-1", dark) or "#CBD5E1"
    tests.append({"fg": gray1_d, "bg": bg_dark, "mode": dm, "label": "body text (gray-1)", "large": False})
    gray2_d = resolve("sl-color-gray-2", dark) or "#94A3B8"
    tests.append({"fg": gray2_d, "bg": bg_dark, "mode": dm, "label": "secondary text (gray-2)", "large": False})
    gray3_d = resolve("sl-color-gray-3", dark) or "#64748B"
    tests.append({"fg": gray3_d, "bg": bg_dark, "mode": dm, "label": "tertiary text (gray-3)", "large": False})
    acc_d = resolve("sl-color-accent", dark) or "#14B8A6"
    tests.append({"fg": acc_d, "bg": bg_dark, "mode": dm, "label": "link/accent text", "large": False})
    acc_hi_d = resolve("sl-color-accent-high", dark) or "#2DD4BF"
    tests.append({"fg": acc_hi_d, "bg": bg_dark, "mode": dm, "label": "accent-high on dark bg", "large": False})

    # Solid teal section in dark mode
    tests.append({"fg": "#F0FDF4", "bg": "#0F766E", "mode": dm, "label": "teal section: F0FDF4 on #0F766E (dark)", "large": False})
    # Amber section in dark mode
    tests.append({"fg": "#0C1222", "bg": "#D97706", "mode": dm, "label": "amber: #0C1222 on #D97706 (dark)", "large": False})

    # Teams mockup (hardcoded colors)
    # Bot bubble bg #232638 with text #F0FDF4
    tests.append({"fg": "#F0FDF4", "bg": "#232638", "mode": dm, "label": "Teams bot bubble text", "large": False})
    # Teams draft badge amber
    tests.append({"fg": "#D97706", "bg": "#1A1C2B", "mode": dm, "label": "teams-draft-badge #D97706 on #1A1C2B", "large": False})
    # Teams draft approve green
    tests.append({"fg": "#28C840", "bg": "#1A1C2B", "mode": dm, "label": "teams-draft-approve #28C840", "large": False})
    # Teams draft reject red
    tests.append({"fg": "#F87171", "bg": "#1A1C2B", "mode": dm, "label": "teams-draft-reject #F87171", "large": False})
    # Teams typing dots teal
    tests.append({"fg": "#14B8A6", "bg": bg_dark, "mode": dm, "label": "typing dot #14B8A6 on dark bg", "large": False})

    # Facebook section in dark mode — text on tinted bg (approx)
    fb_tint_dark = "#172032"  # ≈ gray-6 in dark mode
    tests.append({"fg": gray1_d, "bg": fb_tint_dark, "mode": dm, "label": "FB section text on tint bg", "large": False})

    # Tinted sections in light mode: text on tinted light bg
    teams_tint_light = "#F0FDF4"  # ≈ light bg with slight tint
    tests.append({"fg": gray1_l, "bg": teams_tint_light, "mode": lm, "label": "Teams section text (light)", "large": False})

    return tests


def main():
    css_path = ROOT / "src" / "styles" / "custom.css"
    astro_path = ROOT / "src" / "components" / "Unveiling.astro"

    css_text = css_path.read_text()
    astro_text = astro_path.read_text()

    light_tokens, dark_tokens = parse_tokens(css_text)

    print(f"=== TOKEN DUMP ===\nLight: {len(light_tokens)} tokens\nDark:  {len(dark_tokens)} tokens\n")

    matrix = build_matrix(light_tokens, dark_tokens, astro_text)

    fails = 0
    passes = 0

    print(f"{'MODE':<6} {'FG':>9} {'BG':>9} {'RATIO':>6} {'THRESH':>6} {'RESULT':>6} LABEL")
    print("-" * 80)

    for t in matrix:
        try:
            ratio = contrast_ratio(t["fg"], t["bg"])
            threshold = AA_LARGE if t["large"] else AA_NORMAL
            result = "PASS" if ratio >= threshold else "FAIL"
            if result == "FAIL":
                fails += 1
            else:
                passes += 1

            flag = "⚠" if result == "FAIL" else "✓"
            print(f"{t['mode']:<6} {t['fg']:>9} {t['bg']:>9} {ratio:>6.2f} {threshold:>6.1f} {result:>6} {flag} {t['label']}")
        except Exception as e:
            print(f"ERROR: {t} → {e}")

    print(f"\n{'='*80}")
    print(f"PASS: {passes}  FAIL: {fails}  TOTAL: {passes + fails}")

    if fails > 0:
        print("\n❌ WCAG 2.0 AA VIOLATIONS DETECTED — fix before shipping")
        sys.exit(1)
    else:
        print("\n✅ All pairs pass WCAG 2.0 AA")
        sys.exit(0)

if __name__ == "__main__":
    main()
