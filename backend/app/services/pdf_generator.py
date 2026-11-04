import os
import base64
from pathlib import Path
from typing import Optional, List
from jinja2 import Environment, FileSystemLoader
from backend.app.models.all_models import Quotation, CompanySetting, Customer, QuotationSection, QuotationItem

TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
STATIC_DIR = Path(__file__).parent.parent / "static"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=True
)


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

    prepared_by_name = quotation.prepared_by.full_name if quotation.prepared_by else "Admin"

    html_content = template.render(
        quotation=quotation,
        company=company,
        customer=customer,
        sections=sections,
        items=items,
        company_code=company_code,
        logo_base64=header_b64,
        header_base64=header_b64,
        footer_base64=footer_b64,
        banner_base64=header_b64,
        machine_base64=machine_b64,
        rb800_base64=rb800_b64,
        rb650_base64=rb650_b64,
        bd5050_base64=bd5050_b64,
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

    # 1. Try Playwright with native Edge or installed Chromium
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            launch_kwargs = {"headless": True}
            if exec_path:
                launch_kwargs["executable_path"] = exec_path
            browser = await p.chromium.launch(**launch_kwargs)
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "10mm", "right": "12mm", "bottom": "12mm", "left": "12mm"}
            )
            await browser.close()
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
                    return pf.read()
        except Exception as cli_err:
            logger.error(f"Edge CLI PDF fallback error: {cli_err}")
        finally:
            if temp_html and os.path.exists(temp_html):
                try: os.remove(temp_html)
                except Exception: pass
            if temp_pdf and os.path.exists(temp_pdf):
                try: os.remove(temp_pdf)
                except Exception: pass

    # 3. Final fallback: return html as bytes
    return html_content.encode("utf-8")


def generate_quotation_pdf(
    quotation: Quotation,
    company: CompanySetting,
    customer: Customer,
    sections: List[QuotationSection],
    items: List[QuotationItem]
) -> str:
    """Synchronous HTML generation for preview and printing."""
    return render_quotation_html(quotation, company, customer, sections, items)
