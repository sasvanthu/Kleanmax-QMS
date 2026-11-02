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
    banner_b64 = get_file_base64("letterhead_banner.png") or get_logo_base64()
    machine_b64 = get_file_base64("karcher_scrubber.png")

    prepared_by_name = quotation.prepared_by.full_name if quotation.prepared_by else "Admin"

    html_content = template.render(
        quotation=quotation,
        company=company,
        customer=customer,
        sections=sections,
        items=items,
        logo_base64=banner_b64,
        banner_base64=banner_b64,
        machine_base64=machine_b64,
        prepared_by_name=prepared_by_name
    )
    return html_content


async def generate_pdf_bytes_async(html_content: str) -> bytes:
    """Uses Playwright to render pixel-perfect A4 PDF with background graphics enabled."""
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.set_content(html_content, wait_until="networkidle")
            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "12mm", "right": "15mm", "bottom": "15mm", "left": "15mm"}
            )
            await browser.close()
            return pdf_bytes
    except Exception as e:
        # Fallback to generating printable HTML converted with weasyprint or returning bytes
        try:
            import weasyprint
            return weasyprint.HTML(string=html_content).write_pdf()
        except Exception:
            # If Playwright browser isn't installed and weasyprint isn't present, return html as bytes
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
