#!/usr/bin/env python3
"""
Tự động chuyển đổi technical_reference.md sang technical_reference.pdf chuẩn phong cách học thuật cao cấp
(Table of Contents có dotted leaders, căn đều 2 bên, chuyển hóa 100% ký hiệu toán học sang Unicode, thuần text).
"""

import os
import sys
import re
import subprocess
import html

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD_PATH = os.path.join(WORKSPACE_DIR, "technical_reference.md")
HTML_PATH = os.path.join(WORKSPACE_DIR, "technical_reference.html")
PDF_PATH = os.path.join(WORKSPACE_DIR, "technical_reference.pdf")

def find_browser():
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def clean_math_syntax(text):
    """Chuyển hóa triệt để toàn bộ cú pháp LaTeX sang ký hiệu toán học / Unicode chuẩn"""
    replacements = [
        # Indicator function & Greek / Calligraphy
        (r"\\mathbb\{I\}", "<strong>I</strong>"),
        (r"\\mathcal\{G\}", "<strong>G</strong>"),
        (r"\\mathcal\{U\}_\{?\\text\{Academic\}?\}?", "<em>U</em><sub>Academic</sub>"),
        (r"\\mathcal\{U\}_1", "<em>U</em>₁"),
        (r"\\mathcal\{U\}_2", "<em>U</em>₂"),
        (r"\\mathcal\{U\}_3", "<em>U</em>₃"),
        (r"\\mathcal\{U\}_\{?\\text\{data\}?\}?", "<em>U</em><sub>data</sub>"),
        (r"\\mathcal\{U\}_\{?\\text\{policy\}?\}?", "<em>U</em><sub>policy</sub>"),
        (r"\\mathcal\{U\}_\{?\\text\{auth\}?\}?", "<em>U</em><sub>auth</sub>"),
        (r"\\mathcal\{U\}", "<em>U</em>"),
        (r"\\mathcal\{D\}\(R,\s*\\mathcal\{S\}\)", "<em>D</em>(<em>R</em>, <em>S</em>)"),
        (r"\\mathcal\{D\}\(R,\s*S\)", "<em>D</em>(<em>R</em>, <em>S</em>)"),
        (r"\\mathcal\{D\}", "<em>D</em>"),
        (r"\\mathcal\{V\}_\{?\\text\{doc\}?\}\(R\)", "<em>V</em><sub>doc</sub>(<em>R</em>)"),
        (r"\\mathcal\{V\}", "<em>V</em>"),
        (r"\\mathcal\{A\}_\{?\\text\{new\}?\}\(R,\s*\\mathcal\{S\}\)", "<em>A</em><sub>new</sub>(<em>R</em>, <em>S</em>)"),
        (r"\\mathcal\{A\}_\{?\\text\{new\}?\}", "<em>A</em><sub>new</sub>"),
        (r"\\mathcal\{A\}", "<em>A</em>"),
        (r"\\mathcal\{T\}_i", "<em>T</em><sub>i</sub>"),
        (r"\\mathcal\{T\}", "<em>T</em>"),
        (r"\\mathcal\{S\}", "<em>S</em>"),
        (r"\\mathcal\{R\}", "<em>R</em>"),
        (r"U_1\b", "<em>U</em>₁"),
        (r"U_2\b", "<em>U</em>₂"),
        (r"U_3\b", "<em>U</em>₃"),
        (r"U_Academic\b", "<em>U</em><sub>Academic</sub>"),
        (r"U_data\b", "<em>U</em><sub>data</sub>"),
        (r"U_policy\b", "<em>U</em><sub>policy</sub>"),
        (r"U_auth\b", "<em>U</em><sub>auth</sub>"),
        (r"V_\{?\\text\{doc\}?\}\(R\)", "<em>V</em><sub>doc</sub>(<em>R</em>)"),
        (r"V_doc\b", "<em>V</em><sub>doc</sub>"),
        (r"A_\{?\\text\{new\}?\}", "<em>A</em><sub>new</sub>"),
        (r"A_new\b", "<em>A</em><sub>new</sub>"),
        (r"T_i\b", "<em>T</em><sub>i</sub>"),
        (r"H_i\b", "<em>H</em><sub>i</sub>"),
        (r"H_\{i-1\}", "<em>H</em><sub>i-1</sub>"),
        (r"\\left\(", "("),
        (r"\\right\)", ")"),
        (r"\\implies", "⇒"),
        (r"\\iff", "⇔"),
        (r"\\wedge", "∧"),
        (r"\\vee", "∨"),
        (r"\\langle", "⟨"),
        (r"\\rangle", "⟩"),
        (r"\\rightarrow", "→"),
        (r"\\longrightarrow", "→"),
        (r"\\to", "→"),
        (r"\\in", "∈"),
        (r"\\subset", "⊂"),
        (r"\\ge", "≥"),
        (r"\\le", "≤"),
        (r"\\ne", "≠"),
        (r"\\neq", "≠"),
        (r"\\approx", "≈"),
        (r"\\pm", "±"),
        (r"\\times", "×"),
        (r"\\cdot", "·"),
        (r"\\dots", "..."),
        (r"\\quad", " &nbsp; "),
        (r"\\;", " "),
        (r"\\text\{([^}]+)\}", r"\1"),
        (r"\\frac\{([^}]+)\}\{([^}]+)\}", r"(\1 / \2)"),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)

    # Subscripts and superscripts cleanup
    text = re.sub(r"\_\{([^}]+)\}", r"<sub>\1</sub>", text)
    text = re.sub(r"\^\{([^}]+)\}", r"<sup>\1</sup>", text)
    text = re.sub(r"\$([^\$]+?)\$", r"\1", text)
    return text

def md_to_html(md_text):
    lines = md_text.splitlines()
    html_lines = []
    in_code = False
    code_lang = ""
    code_buf = []
    in_table = False
    table_buf = []

    def flush_table():
        nonlocal in_table, table_buf
        if not table_buf:
            return ""
        res = ["<div class='table-container'><table>"]
        header_done = False
        for row in table_buf:
            cells = [c.strip() for c in row.split("|")[1:-1]]
            if not cells or all(re.match(r"^:?-+:?$", c) for c in cells):
                header_done = True
                continue
            if not header_done:
                res.append("<thead><tr>" + "".join(f"<th>{inline_format(c)}</th>" for c in cells) + "</tr></thead><tbody>")
                header_done = True
            else:
                res.append("<tr>" + "".join(f"<td>{inline_format(c)}</td>" for c in cells) + "</tr>")
        res.append("</tbody></table></div>")
        in_table = False
        table_buf = []
        return "\n".join(res)

    def inline_format(text):
        text = clean_math_syntax(text)
        text = re.sub(r"\*\*([^\*]+?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"\*([^\*]+?)\*", r"<em>\1</em>", text)
        text = re.sub(r"`([^`]+?)`", r"<code>\1</code>", text)
        return text

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Kiểm tra phần Table of Contents
        if stripped == "# TABLE OF CONTENTS":
            if in_table:
                html_lines.append(flush_table())
            html_lines.append("<div class='toc-section'>")
            html_lines.append("<h1 class='toc-heading'>TABLE OF CONTENTS</h1>")
            i += 1
            while i < len(lines):
                toc_line = lines[i].rstrip()
                toc_stripped = toc_line.strip()
                if toc_stripped.startswith("# 1.") or (toc_stripped.startswith("---") and i + 1 < len(lines) and lines[i+1].strip().startswith("# 1.")):
                    break
                if not toc_stripped:
                    i += 1
                    continue
                if toc_stripped.startswith("---"):
                    i += 1
                    continue

                if toc_stripped.startswith("**"):
                    m_top = re.match(r"^\*\*(.*?)\*\*\s*\.{3,}\s*(?:Page\s*)?(\d+|[A-Za-z0-9]+)$", toc_stripped)
                    if m_top:
                        html_lines.append(
                            f"<div class='toc-row toc-item-main' style='font-weight: 700; margin-top: 8px;'>"
                            f"<span class='toc-label'>{inline_format(m_top.group(1))}</span>"
                            f"<span class='toc-leader'></span>"
                            f"<span class='toc-page-num'>{m_top.group(2)}</span>"
                            f"</div>"
                        )
                    else:
                        part_title = toc_stripped.replace("**", "").strip()
                        html_lines.append(f"<div class='toc-part'>{part_title}</div>")
                else:
                    indent = len(toc_line) - len(toc_line.lstrip())
                    is_sub = indent >= 2 or (toc_stripped.startswith("- 1.") and "." in toc_stripped[4:8])
                    
                    m = re.match(r"^[-\*]?\s*(.*?)\s*\.{3,}\s*(?:Page\s*)?(\d+|[A-Za-z0-9]+)$", toc_stripped)
                    if not m:
                        m = re.match(r"^[-\*]?\s*(.*?)\s+(?:Page\s*)(\d+|[A-Za-z0-9]+)$", toc_stripped)
                    
                    if m:
                        title_part = m.group(1).strip()
                        page_part = m.group(2).strip()
                        lvl_cls = "toc-item-sub" if is_sub else "toc-item-main"
                        html_lines.append(
                            f"<div class='toc-row {lvl_cls}'>"
                            f"<span class='toc-label'>{inline_format(title_part)}</span>"
                            f"<span class='toc-leader'></span>"
                            f"<span class='toc-page-num'>{page_part}</span>"
                            f"</div>"
                        )
                    else:
                        clean_text = toc_stripped.lstrip("-* ").strip()
                        html_lines.append(f"<div class='toc-row toc-item-main'><span class='toc-label'>{inline_format(clean_text)}</span></div>")
                i += 1
            html_lines.append("</div><div class='page-break'></div>")
            continue

        # Code block
        if stripped.startswith("```"):
            if in_code:
                in_code = False
                escaped_code = html.escape("\n".join(code_buf))
                html_lines.append(f"<pre class='code-block'><code>{escaped_code}</code></pre>")
                code_buf = []
            else:
                if in_table:
                    html_lines.append(flush_table())
                in_code = True
                code_lang = stripped[3:].strip()
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # Tables
        if stripped.startswith("|") and stripped.endswith("|"):
            in_table = True
            table_buf.append(stripped)
            i += 1
            continue
        elif in_table:
            html_lines.append(flush_table())

                        # Blockquote / Manifesto / Formula box
        if stripped.startswith(">"):
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip().lstrip("> ").strip())
                i += 1

            formatted_quote = []
            in_quote_list = False
            for ql in quote_lines:
                if ql.startswith("- ") or ql.startswith("* "):
                    if not in_quote_list:
                        formatted_quote.append("<ul style='margin: 4px 0 4px 18px; padding-left: 0;'>")
                        in_quote_list = True
                    formatted_quote.append(f"<li>{inline_format(ql[2:])}</li>")
                else:
                    if in_quote_list:
                        formatted_quote.append("</ul>")
                        in_quote_list = False
                    if ql:
                        formatted_quote.append(f"<p style='margin-bottom: 4px;'>{inline_format(ql)}</p>")
            if in_quote_list:
                formatted_quote.append("</ul>")

            html_lines.append(f"<div class='callout-quote'>{''.join(formatted_quote)}</div>")
            continue

        # Image: ![alt](src)
        m_img = re.match(r"^!\[(.*?)\]\((.*?)\)$", stripped)
        if m_img:
            alt_text = m_img.group(1)
            img_src = m_img.group(2)
            abs_img_path = os.path.join(WORKSPACE_DIR, img_src.replace('/', os.sep))
            if os.path.exists(abs_img_path) and img_src.endswith('.svg'):
                with open(abs_img_path, 'r', encoding='utf-8') as svg_f:
                    svg_content = svg_f.read()
                # strip xml declaration if present
                svg_content = re.sub(r"<\?xml[\s\S]*?\?>", "", svg_content)
                html_lines.append(f"<div class='diagram-container' style='text-align: center; margin: 16px 0; page-break-inside: avoid;'>{svg_content}</div>")
            else:
                html_lines.append(f"<div class='diagram-container' style='text-align: center; margin: 16px 0; page-break-inside: avoid;'><img src='{img_src}' alt='{alt_text}' style='max-width: 100%; height: auto;'/></div>")
            i += 1
            continue

        # Headers
        if stripped.startswith("# "):
            title_text = inline_format(stripped[2:])
            html_lines.append(f"<h1 class='doc-title'>{title_text}</h1>")
            i += 1
            continue
        elif stripped.startswith("## "):
            html_lines.append(f"<h2>{inline_format(stripped[3:])}</h2>")
            i += 1
            continue
        elif stripped.startswith("### "):
            html_lines.append(f"<h3>{inline_format(stripped[4:])}</h3>")
            i += 1
            continue
        elif stripped.startswith("#### "):
            html_lines.append(f"<h4>{inline_format(stripped[5:])}</h4>")
            i += 1
            continue

        # Horizontal rule
        if stripped in ["---", "***", "___"]:
            html_lines.append("<hr class='section-divider'/>")
            i += 1
            continue

        # Math display block: $$...$$
        if stripped.startswith("$$"):
            math_buf = []
            if stripped.endswith("$$") and len(stripped) > 2:
                math_buf.append(stripped[2:-2].strip())
                i += 1
            else:
                math_buf.append(stripped[2:].strip())
                i += 1
                while i < len(lines) and not lines[i].strip().endswith("$$"):
                    math_buf.append(lines[i].strip())
                    i += 1
                if i < len(lines):
                    math_buf.append(lines[i].strip()[:-2].strip())
                    i += 1
            math_content = clean_math_syntax(" ".join(math_buf))
            html_lines.append(f"<div class='math-display'>{math_content}</div>")
            continue

        # Bullet list
        if stripped.startswith("- ") or stripped.startswith("* "):
            list_items = []
            while i < len(lines) and (lines[i].strip().startswith("- ") or lines[i].strip().startswith("* ")):
                list_items.append(lines[i].strip()[2:])
                i += 1
            html_lines.append("<ul class='content-list'>" + "".join(f"<li>{inline_format(it)}</li>" for it in list_items) + "</ul>")
            continue

        # Numbered list
        if re.match(r"^\d+\.\s+", stripped):
            list_items = []
            m_first = re.match(r"^(\d+)\.\s+(.+)$", stripped)
            start_num = m_first.group(1) if m_first else "1"
            while i < len(lines) and re.match(r"^\d+\.\s+", lines[i].strip()):
                m_it = re.match(r"^\d+\.\s+(.+)$", lines[i].strip())
                if m_it:
                    list_items.append(m_it.group(1))
                i += 1
            html_lines.append(f"<ol class='content-list' start='{start_num}'>" + "".join(f"<li>{inline_format(it)}</li>" for it in list_items) + "</ol>")
            continue

        if not stripped:
            i += 1
            continue

        # Paragraph
        html_lines.append(f"<p>{inline_format(line)}</p>")
        i += 1

    if in_table:
        html_lines.append(flush_table())

    return "\n".join(html_lines)

def build_full_html(body_content):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ACADEMIC ESCALATION REFEREE (AER) — Technical Reference</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page {{
    size: A4;
    margin: 22mm 20mm 24mm 20mm;
    @bottom-right {{
      content: "Page " counter(page);
      font-size: 8.5pt;
      font-family: 'Inter', sans-serif;
      color: #475569;
    }}
    @top-right {{
      content: "ACADEMIC ESCALATION REFEREE · TECHNICAL REFERENCE";
      font-size: 8pt;
      font-family: 'Inter', sans-serif;
      color: #64748b;
      font-weight: 500;
    }}
  }}

  * {{
    box-sizing: border-box;
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 9.8pt;
    line-height: 1.6;
    color: #111827;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }}

  .page-break {{
    page-break-after: always;
  }}

  p {{
    margin-top: 0;
    margin-bottom: 11px;
    text-align: justify;
    text-justify: inter-word;
  }}

  li {{
    text-align: justify;
    text-justify: inter-word;
    margin-bottom: 5px;
  }}

  h1.doc-title {{
    color: #0f172a;
    font-size: 17pt;
    font-weight: 800;
    border-bottom: 2px solid #1e293b;
    padding-bottom: 6px;
    margin-top: 24px;
    margin-bottom: 14px;
    page-break-after: avoid;
    letter-spacing: -0.01em;
  }}

  h2 {{
    color: #0f172a;
    font-size: 12.5pt;
    font-weight: 700;
    margin-top: 22px;
    margin-bottom: 10px;
    page-break-after: avoid;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
  }}

  h3 {{
    color: #1e293b;
    font-size: 11pt;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }}

  h4 {{
    color: #334155;
    font-size: 10pt;
    font-weight: 600;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}

  .toc-section {{
    margin: 20px 0 30px 0;
    padding: 10px 0;
  }}

  .toc-heading {{
    text-align: center;
    font-size: 16pt;
    font-weight: 800;
    letter-spacing: 0.05em;
    margin-top: 10px;
    margin-bottom: 22px;
    color: #0f172a;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 6px;
  }}

  .toc-part {{
    font-weight: 700;
    font-size: 10pt;
    margin-top: 14px;
    margin-bottom: 6px;
    color: #0f172a;
    text-transform: uppercase;
  }}

  .toc-row {{
    display: flex;
    align-items: baseline;
    margin-bottom: 3.5px;
    font-size: 9.3pt;
  }}

  .toc-item-main {{
    font-weight: 600;
    padding-left: 10px;
    color: #1e293b;
  }}

  .toc-item-sub {{
    font-weight: 400;
    padding-left: 26px;
    color: #334155;
  }}

  .toc-label {{
    white-space: nowrap;
  }}

  .toc-leader {{
    flex-grow: 1;
    border-bottom: 1.2px dotted #94a3b8;
    margin: 0 6px;
    height: 1px;
  }}

  .toc-page-num {{
    font-weight: 600;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
    min-width: 20px;
    text-align: right;
  }}

  .callout-quote {{
    border-left: 3px solid #334155;
    background-color: #f8fafc;
    padding: 10px 14px;
    margin: 14px 0;
    font-style: italic;
    color: #1e293b;
    font-size: 9.8pt;
    text-align: justify;
    page-break-inside: avoid;
  }}

  .table-container {{
    width: 100%;
    margin: 14px 0;
    page-break-inside: avoid;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 8.8pt;
    line-height: 1.45;
  }}

  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    border-top: 1.5px solid #334155;
    border-bottom: 1.5px solid #334155;
    border-left: none;
    border-right: none;
  }}

  td {{
    padding: 6px 8px;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    border-left: none;
    border-right: none;
    vertical-align: top;
    text-align: justify;
  }}

  tbody tr:last-child td {{
    border-bottom: 1.5px solid #334155;
  }}

  pre.code-block {{
    background-color: #f8fafc;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 9px 12px;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 7.8pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 11px 0;
    page-break-inside: avoid;
  }}

  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }}

  pre code {{
    background-color: transparent;
    border: none;
    padding: 0;
  }}

  .math-display {{
    text-align: center;
    margin: 12px 0;
    font-size: 10pt;
    font-style: italic;
    page-break-inside: avoid;
  }}

  .section-divider {{
    border: 0;
    height: 1px;
    background: #cbd5e1;
    margin: 20px 0;
  }}

  ul.content-list, ol.content-list {{
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 20px;
  }}

  strong {{
    font-weight: 600;
    color: #0f172a;
  }}

  em {{
    font-style: italic;
  }}
</style>
</head>
<body>
{body_content}
</body>
</html>
"""

def generate_pdf():
    print(f"1. Reading content from {MD_PATH}...")
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()

    print("2. Converting Technical Reference Markdown to HTML...")
    body_html = md_to_html(md_text)
    full_html = build_full_html(body_html)

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"✓ Saved HTML at: {HTML_PATH}")

    browser = find_browser()
    if not browser:
        print("❌ Could not find Chrome or Microsoft Edge on system.")
        return False

    print(f"3. Calling headless browser to render PDF: {browser}")
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={PDF_PATH}",
        HTML_PATH
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(PDF_PATH):
        size_kb = os.path.getsize(PDF_PATH) / 1024
        print(f"🎉 SUCCESS! Technical Reference PDF generated at:")
        print(f"   👉 {PDF_PATH} ({size_kb:.1f} KB)")
        return True
    else:
        print(f"❌ PDF generation failed: {res.stderr}")
        return False

if __name__ == "__main__":
    generate_pdf()
