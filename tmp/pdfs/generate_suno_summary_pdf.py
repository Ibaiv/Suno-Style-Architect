#!/usr/bin/env python3
import textwrap
from pathlib import Path

OUT_PATH = Path('output/pdf/suno_style_architect_summary.pdf')


def esc(text: str) -> str:
    return text.replace('\\', r'\\').replace('(', r'\(').replace(')', r'\)')


def wrap_plain(text: str, width: int):
    return textwrap.wrap(text, width=width, break_long_words=False, break_on_hyphens=False) or ['']


def wrap_bullet(text: str, width: int):
    wrapped = textwrap.wrap(text, width=width, break_long_words=False, break_on_hyphens=False)
    if not wrapped:
        return ['-']
    lines = [f"- {wrapped[0]}"]
    lines.extend([f"  {line}" for line in wrapped[1:]])
    return lines


PAGE_W, PAGE_H = 612, 792  # US Letter
LEFT, RIGHT, TOP, BOTTOM = 44, 44, 44, 44
TEXT_W = PAGE_W - LEFT - RIGHT

# Conservative character widths for Helvetica at body sizes
BODY_WRAP = 92

sections = [
    (
        'What it is',
        [
            'Suno Style Architect is a browser-based app for building Suno-ready music prompts from ideas and optional lyrics.',
            'It combines LLM prompt generation and refinement (OpenRouter) with optional visual concept generation via Fal.ai.'
        ],
        False,
    ),
    (
        "Who it's for",
        [
            'Primary persona: music creators (producers, songwriters, prompt-focused artists) who want faster, higher-quality Suno prompt workflows.'
        ],
        False,
    ),
    (
        'What it does',
        [
            'Generates a base prompt from user input in the main idea and lyrics fields.',
            'Applies expert refinements (for example producer, musician, film composer, DJ, sound engineer).',
            'Provides KLUG tools such as genre mixing, hook generation, song structure, vibe, artist, and tempo helpers.',
            'Supports Pro-style and custom-instruction refinements on the current prompt text.',
            'Includes visual ideation flows that call Fal.ai models for image generation from prompt concepts.',
            'Stores settings and productivity data in browser localStorage (API/model config, history, keybindings).'
        ],
        True,
    ),
    (
        'How it works (repo evidence)',
        [
            'UI layer: static frontend in index.html with Tailwind CDN, custom CSS, and modular JS files loaded in sequence.',
            'Core orchestration: js/app.js manages settings, generation flow, and primary event handlers.',
            'Prompt logic: js/prompts.js provides system prompts; js/features.js wires advanced tool modules and modal actions.',
            'Service layer: js/api.js sends fetch requests to OpenRouter chat completions and Fal.ai endpoints.',
            'Data flow: user input -> prompt assembly -> API call -> result rendered in #result-text -> optional iterative refinement.',
            'Server-side persistence or internal app database: Not found in repo.'
        ],
        True,
    ),
    (
        'How to run (minimal)',
        [
            'From the project root, start the local server: python3 server.py (or ./start.sh).',
            'Open http://localhost:8000 in a browser.',
            'Enter an OpenRouter key in setup (expects sk-or-v1- prefix) and select a model.',
            'Optional: enter Fal.ai key/model to enable visual features.',
            'Enter idea or lyrics and click Prompt Architektieren.'
        ],
        True,
    ),
]

commands = []
y = PAGE_H - TOP

# Ensure a deterministic white page background for rasterizers.
commands.append(f"q 1 1 1 rg 0 0 {PAGE_W} {PAGE_H} re f Q")
# Set text fill color to black.
commands.append("0 0 0 rg")

# Title
y -= 8
commands.append(f"BT /F2 19 Tf {LEFT} {y:.2f} Td ({esc('Suno Style Architect - One Page App Summary')}) Tj ET")
y -= 20
commands.append(f"BT /F1 9 Tf {LEFT} {y:.2f} Td ({esc('Evidence source: repository files in this workspace. Date: 2026-02-07.')}) Tj ET")
y -= 16

for heading, items, bullets in sections:
    commands.append(f"BT /F2 12 Tf {LEFT} {y:.2f} Td ({esc(heading)}) Tj ET")
    y -= 13

    for item in items:
        lines = wrap_bullet(item, BODY_WRAP) if bullets else wrap_plain(item, BODY_WRAP)
        for line in lines:
            commands.append(f"BT /F1 10 Tf {LEFT} {y:.2f} Td ({esc(line)}) Tj ET")
            y -= 11
    y -= 6

if y < BOTTOM:
    raise RuntimeError(f'Content overflowed one page (y={y:.2f}).')

content = '\n'.join(commands).encode('latin-1', errors='replace')

objects = []
objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
objects.append(b"2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n")
objects.append(
    f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n".encode('ascii')
)
objects.append(
    b"4 0 obj\n<< /Length " + str(len(content)).encode('ascii') + b" >>\nstream\n" + content + b"\nendstream\nendobj\n"
)
objects.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
objects.append(b"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")

pdf = bytearray()
pdf.extend(b"%PDF-1.4\n")
offsets = [0]
for obj in objects:
    offsets.append(len(pdf))
    pdf.extend(obj)

xref_start = len(pdf)
pdf.extend(f"xref\n0 {len(objects)+1}\n".encode('ascii'))
pdf.extend(b"0000000000 65535 f \n")
for off in offsets[1:]:
    pdf.extend(f"{off:010d} 00000 n \n".encode('ascii'))

pdf.extend(
    f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n".encode('ascii')
)

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
OUT_PATH.write_bytes(pdf)
print(str(OUT_PATH))
