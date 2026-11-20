import os
import io
import json
import base64
import logging
import tempfile
import subprocess
from pathlib import Path
from typing import Optional, List
from jinja2 import Environment, FileSystemLoader
from backend.app.models.all_models import Quotation, CompanySetting, Customer, QuotationSection, QuotationItem

logger = logging.getLogger(__name__)

TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
STATIC_DIR = Path(__file__).parent.parent / "static"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=True
)

def format_currency_filter(val):
    if val is None:
        return "0.00"
    try:
        return f"{float(val):.2f}"
    except (ValueError, TypeError):
        return "0.00"

def format_date_filter(d, fmt='%d/%m/%Y'):
    if not d:
        return ""
    if hasattr(d, 'strftime'):
        return d.strftime(fmt)
    try:
        from datetime import datetime
        s = str(d).strip()[:10]
        return datetime.fromisoformat(s).strftime(fmt)
    except Exception:
        return str(d)

def resolve_image_to_data_uri(img_ref: Optional[str]) -> Optional[str]:
    """Convert any image reference (local path, static file, or remote URL) to an inline base64 data URI."""
    if not img_ref:
        return None
    s = str(img_ref).strip()
    if not s or s.lower() == "none":
        return None
    if s.startswith("data:image"):
        return s
    
    # 1. Check local static directory
    clean_path = s.lstrip("/\\")
    local_p = STATIC_DIR / clean_path
    if local_p.exists() and local_p.is_file():
        ext = local_p.suffix.lower().replace(".", "")
        if ext == "jpg": ext = "jpeg"
        try:
            with open(local_p, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
                return f"data:image/{ext};base64,{b64}"
        except Exception as e:
            logger.warning(f"Error reading local image {local_p}: {e}")

    # 2. Check if it's an HTTP / Supabase Storage URL
    if s.startswith("http://") or s.startswith("https://"):
        try:
            import urllib.request
            req = urllib.request.Request(s, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = resp.read()
                content_type = resp.headers.get_content_type() or "image/png"
                b64 = base64.b64encode(data).decode("utf-8")
                return f"data:{content_type};base64,{b64}"
        except Exception as e:
            logger.warning(f"Error fetching remote image {s}: {e}")
            return s  # Return original URL as fallback

    return None

jinja_env.filters['currency'] = format_currency_filter
jinja_env.filters['format_date'] = format_date_filter
jinja_env.filters['to_data_uri'] = resolve_image_to_data_uri


def get_file_base64(filename: str) -> Optional[str]:
    path = STATIC_DIR / filename
    if path.exists():
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return None

def get_logo_base64() -> Optional[str]:
    return get_file_base64("letterhead_banner.png") or get_file_base64("logo.png")


def render_quotation_html(
    quotation: Quotation,
    company: CompanySetting,
    customer: Customer,
    sections: List[QuotationSection],
    items: List[QuotationItem]
) -> str:
    template = jinja_env.get_template("quotation_pdf.html")
    company_code = (getattr(company, 'company_code', None) or getattr(quotation, 'company_code', None) or 'kleanmaxpro').lower()
    
    header_b64 = get_file_base64(f"headers/header_{company_code}.png") or get_file_base64("letterhead_banner.png") or get_logo_base64()
    footer_b64 = get_file_base64(f"headers/footer_{company_code}.png")
    machine_b64 = get_file_base64("karcher_scrubber.png")
    rb800_b64 = get_file_base64("products/rb800.png")
    rb650_b64 = get_file_base64("products/rb650.png")
    bd5050_b64 = get_file_base64("products/bd5050.png")
    wall_printing_1_b64 = get_file_base64("unique_painters/wall_printing_machine_1.jpeg")
    wall_printing_2_b64 = get_file_base64("unique_painters/wall_printing_machine_2.jpeg")
    robotic_1_b64 = get_file_base64("unique_painters/robotic_plastering_1.jpeg")
    robotic_2_b64 = get_file_base64("unique_painters/robotic_plastering_2.jpeg")
    km_logo_b64 = get_file_base64("kleanmax/kleanmax_butterfly_logo.jpeg")
    km_team_page_b64 = get_file_base64("kleanmax/kleanmax_team_page.jpeg")

    prepared_by_name = quotation.prepared_by.full_name if quotation.prepared_by else "Admin"

    snapshot = {}
    raw_snap = getattr(quotation, 'snapshot_json', None)
    if raw_snap:
        if isinstance(raw_snap, dict):
            snapshot = raw_snap
        elif isinstance(raw_snap, str):
            try:
                snapshot = json.loads(raw_snap)
            except Exception:
                snapshot = {}

    # Prioritize values from snapshot rows if present to ensure 100% exact parity with editor display
    if snapshot.get('rows') and isinstance(snapshot['rows'], list) and len(snapshot['rows']) > 0:
        row_sum = sum(float(r.get('amount') or 0) for r in snapshot['rows'])
        subtotal_val = float(snapshot.get('subtotal') or (row_sum if row_sum > 0 else (quotation.subtotal or 0)))
    elif snapshot.get('items') and isinstance(snapshot['items'], list) and len(snapshot['items']) > 0:
        item_sum = sum(float(it.get('total') or it.get('amount') or (float(it.get('qty', 0)) * float(it.get('rate', 0))) or 0) for it in snapshot['items'] if not it.get('is_header'))
        subtotal_val = float(snapshot.get('subtotal') or (item_sum if item_sum > 0 else (quotation.subtotal or 0)))
    else:
        subtotal_val = float(snapshot.get('subtotal') or quotation.subtotal or 0)

    tax_rate_val = float(snapshot.get('taxPercent') or getattr(quotation, 'tax_rate', None) or (18 if snapshot.get('applyTax') else 0))
    apply_tax_val = bool(snapshot.get('applyTax') if 'applyTax' in snapshot else (tax_rate_val > 0 or (quotation.total_tax and quotation.total_tax > 0)))
    if apply_tax_val:
        tax_val = float(snapshot.get('gstAmount') or snapshot.get('totalTax') or quotation.total_tax or (subtotal_val * tax_rate_val / 100))
        final_amount_val = float(snapshot.get('finalTotal') or snapshot.get('totalAmount') or quotation.final_amount or (subtotal_val + tax_val))
    else:
        tax_val = 0.0
        final_amount_val = float(snapshot.get('finalTotal') or snapshot.get('totalAmount') or subtotal_val)

    # Ensure items have resolved data URIs for images
    source_items = items or []
    if (not source_items) and snapshot.get('items'):
        source_items = snapshot['items']

    processed_items = []
    for itm in source_items:
        itm_img = None
        if isinstance(itm, dict):
            itm_img = itm.get('image_url')
            name = itm.get('item_name') or ''
        else:
            itm_img = getattr(itm, 'image_url', None)
            name = getattr(itm, 'item_name', '') or ''
        
        # If no explicit image_url, detect product machine image by name
        if not itm_img and name:
            nm = name.upper()
            if 'KARCHER' in nm or 'SCRUBBER' in nm:
                itm_img = "/karcher_scrubber.png"
            elif 'RB-800' in nm or '800' in nm:
                itm_img = "/products/rb800.png"
            elif 'RB-650' in nm or '650' in nm:
                itm_img = "/products/rb650.png"
            elif 'BD-50' in nm or 'BD50' in nm:
                itm_img = "/products/bd5050.png"

        resolved_uri = resolve_image_to_data_uri(itm_img)
        if isinstance(itm, dict):
            itm_dict = dict(itm)
            itm_dict['resolved_image_uri'] = resolved_uri
            processed_items.append(itm_dict)
        else:
            setattr(itm, 'resolved_image_uri', resolved_uri)
            processed_items.append(itm)

    html_content = template.render(
        snapshot=snapshot,
        subtotal_val=subtotal_val,
        tax_rate_val=tax_rate_val,
        apply_tax_val=apply_tax_val,
        tax_val=tax_val,
        final_amount_val=final_amount_val,
        quotation=quotation,
        company=company,
        customer=customer,
        sections=sections,
        items=processed_items,
        company_code=company_code,
        logo_base64=header_b64,
        header_base64=header_b64,
        footer_base64=footer_b64,
        banner_base64=header_b64,
        machine_base64=machine_b64,
        rb800_base64=rb800_b64,
        rb650_base64=rb650_b64,
        bd5050_base64=bd5050_b64,
        wall_printing_1_base64=wall_printing_1_b64,
        wall_printing_2_base64=wall_printing_2_b64,
        robotic_1_base64=robotic_1_b64,
        robotic_2_base64=robotic_2_b64,
        km_logo_base64=km_logo_b64,
        km_team_page_base64=km_team_page_b64,
        prepared_by_name=prepared_by_name
    )
    return html_content


async def generate_pdf_bytes_async(html_content: str) -> bytes:
    """Uses Playwright or native Edge Chromium to render pixel-perfect A4 PDF with background graphics enabled."""
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    exec_path = None
    for p in edge_paths:
        if os.path.exists(p):
            exec_path = p
            break

    # 1. Try Playwright with installed Chromium or system Edge/Chrome
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            launch_kwargs = {"headless": True}
            try:
                browser = await p.chromium.launch(**launch_kwargs)
            except Exception:
                if exec_path:
                    launch_kwargs["executable_path"] = exec_path
                browser = await p.chromium.launch(**launch_kwargs)
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="load")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                prefer_css_page_size=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
            await browser.close()
            if pdf_bytes and pdf_bytes.startswith(b"%PDF"):
                return pdf_bytes
    except Exception as e:
        logger.warning(f"Playwright PDF generation failed: {e}, falling back to system browser CLI")

    # 2. Rock-solid fallback using Edge/Chrome CLI --print-to-pdf
    if exec_path:
        temp_html = None
        temp_pdf = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".html", delete=False, mode="w", encoding="utf-8") as f:
                f.write(html_content)
                temp_html = f.name
            temp_pdf = temp_html.replace(".html", ".pdf")
            cmd = [
                exec_path,
                "--headless",
                "--disable-gpu",
                "--no-pdf-header-footer",
                f"--print-to-pdf={temp_pdf}",
                temp_html
            ]
            res = subprocess.run(cmd, capture_output=True, timeout=25)
            if os.path.exists(temp_pdf) and os.path.getsize(temp_pdf) > 1000:
                with open(temp_pdf, "rb") as pf:
                    data = pf.read()
                    if data.startswith(b"%PDF"):
                        return data
        except Exception as cli_err:
            logger.error(f"Edge CLI PDF fallback error: {cli_err}")
        finally:
            if temp_html and os.path.exists(temp_html):
                try: os.remove(temp_html)
                except Exception: pass
            if temp_pdf and os.path.exists(temp_pdf):
                try: os.remove(temp_pdf)
                except Exception: pass

    raise RuntimeError("Failed to generate a valid PDF document. Please ensure browser is available.")


def generate_quotation_pdf(
    quotation: Quotation,
    company: CompanySetting,
    customer: Customer,
    sections: List[QuotationSection],
    items: List[QuotationItem]
) -> str:
    """Synchronous HTML generation for preview and printing."""
    return render_quotation_html(quotation, company, customer, sections, items)
