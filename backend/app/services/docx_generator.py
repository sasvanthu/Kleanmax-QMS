import os
import io
from pathlib import Path
from decimal import Decimal

def safe_decimal(v, default="0") -> Decimal:
    if v is None:
        return Decimal(default)
    try:
        s = str(v).strip()
        if not s or s.lower() == "none":
            return Decimal(default)
        return Decimal(s)
    except Exception:
        return Decimal(default)
from typing import List, Optional
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

STATIC_DIR = Path(__file__).parent.parent / "static"

import urllib.request
import logging

logger = logging.getLogger(__name__)

def _load_image_stream(img_ref: str):
    """Load image from local path or remote URL (e.g. Supabase storage public URL)."""
    if not img_ref:
        return None
    try:
        s = str(img_ref).strip()
        if s.startswith("http://") or s.startswith("https://"):
            req = urllib.request.Request(
                s,
                headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
                return io.BytesIO(data)
        else:
            p = Path(s)
            if not p.is_absolute():
                p = STATIC_DIR / s.lstrip("/\\")
            if p.exists():
                with open(p, "rb") as f:
                    return io.BytesIO(f.read())
    except Exception as e:
        logger.warning(f"Could not load image {img_ref}: {e}")
    return None


def _set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex.replace("#", "")}"/>')
    tc_pr.append(shd)


def _set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell padding in dxa."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)



def _add_unp_section_header(sec, img_path):
    sec.header_distance = Inches(0.15)
    sec.top_margin = Inches(1.35)
    sec.bottom_margin = Inches(0.4)
    sec.left_margin = Inches(0.5)
    sec.right_margin = Inches(0.5)
    sec.page_width = Inches(8.27)
    sec.page_height = Inches(11.69)

    header = sec.header
    header.is_linked_to_previous = False
    p = header.paragraphs[0]
    p.text = ""
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    if os.path.exists(img_path):
        r = p.add_run()
        r.add_picture(str(img_path), width=Inches(7.27))


def _generate_uniquepainters_docx(
    quotation,
    company,
    customer,
    sections: list = None,
    items: list = None
) -> bytes:
    """Generates an authentic 3-page quotation document for Unique Painters
    matching the exact A4 Preview layout and content.
    """
    import json
    doc = docx.Document()
    header_img = STATIC_DIR / "headers" / "header_uniquepainters.png"
    if not header_img.exists():
        header_img = STATIC_DIR / "unique_painters" / "header_sec0_image1.jpeg"

    # Extract snapshot if available
    snapshot = {}
    raw_snap = getattr(quotation, "snapshot_json", None)
    if raw_snap:
        if isinstance(raw_snap, dict):
            snapshot = raw_snap
        elif isinstance(raw_snap, str):
            try:
                snapshot = json.loads(raw_snap)
            except Exception:
                snapshot = {}

    # Balanced margins: 0.65 in left/right (content width = 6.97 in)
    sec = doc.sections[0]
    sec.top_margin = Inches(0.4)
    sec.bottom_margin = Inches(0.5)
    sec.left_margin = Inches(0.65)
    sec.right_margin = Inches(0.65)
    sec.page_width = Inches(8.27)
    sec.page_height = Inches(11.69)

    for p in sec.header.paragraphs:
        p.text = ""

    # ==================== PAGE 1 ====================
    # 1. Header Banner Image (Page 1 ONLY, 100% width)
    if os.path.exists(header_img):
        p_hdr = doc.add_paragraph()
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_hdr.paragraph_format.space_before = Pt(0)
        p_hdr.paragraph_format.space_after = Pt(10)
        r_hdr = p_hdr.add_run()
        r_hdr.add_picture(str(header_img), width=Inches(6.97))

    # 2. Quotation Title
    title_text = (snapshot.get("quotationTitle") or getattr(quotation, "job_title", None) or "SURFACE COATING & PAINTING PROPOSAL").upper()
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(10)
    r_t = p_title.add_run(title_text)
    r_t.bold = True
    r_t.underline = True
    r_t.font.size = Pt(13)
    r_t.font.name = "Arial"
    r_t.font.color.rgb = RGBColor(15, 23, 42)

    # 3. Meta Table (To & Date) - 2-Column Grid
    meta_tbl = doc.add_table(rows=1, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.autofit = False
    c_left, c_right = meta_tbl.cell(0, 0), meta_tbl.cell(0, 1)
    c_left.width = Inches(4.3)
    c_right.width = Inches(2.67)

    # Left: Client Address
    p_to = c_left.paragraphs[0]
    p_to.paragraph_format.space_before = Pt(0)
    p_to.paragraph_format.space_after = Pt(2)
    p_to.paragraph_format.line_spacing = 1.15

    r = p_to.add_run("To,\n")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"

    c_name = (snapshot.get("customerName") or getattr(customer, "company_name", None) or "TRUE NUTRITION").upper()
    r = p_to.add_run(f"{c_name}\n")
    r.bold = True
    r.font.size = Pt(11)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    addr1 = snapshot.get("addressLine1") or getattr(customer, "billing_address_line1", None) or "KODUNGAIYUR"
    addr2 = snapshot.get("addressLine2") or getattr(customer, "billing_city", None) or ""
    if addr1:
        r = p_to.add_run(f"{addr1}\n")
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)
    if addr2:
        r = p_to.add_run(f"{addr2}\n")
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

    attn = snapshot.get("contactPerson") or getattr(customer, "contact_person", None) or ""
    if attn:
        r = p_to.add_run(f"Attn: {attn}\n")
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

    c_phone = snapshot.get("phone") or getattr(customer, "phone", None) or "07676131368"
    if c_phone:
        r = p_to.add_run(f"Ph: {c_phone}\n")
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

    salutation = snapshot.get("salutation") or "DEAR SIR;"
    r = p_to.add_run(f"\n{salutation}")
    r.bold = True
    r.font.size = Pt(10)
    r.font.name = "Arial"

    # Right: Date & Quotation No
    p_date = c_right.paragraphs[0]
    p_date.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_date.paragraph_format.space_before = Pt(0)
    p_date.paragraph_format.space_after = Pt(2)
    p_date.paragraph_format.line_spacing = 1.3

    q_date = snapshot.get("quotationDate") or ""
    if not q_date:
        raw_d = getattr(quotation, "quotation_date", None)
        if hasattr(raw_d, "strftime"):
            q_date = raw_d.strftime("%d/%m/%Y")
        else:
            q_date = str(raw_d) if raw_d else "21/10/2025"

    q_num = snapshot.get("quotationNo") or getattr(quotation, "quotation_number", None) or "UNP/2026/001"

    r = p_date.add_run("DATE: ")
    r.bold = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r = p_date.add_run(f"{q_date}\n")
    r.font.size = Pt(10)
    r.font.name = "Arial"

    r = p_date.add_run("QUOTATION NO: ")
    r.bold = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r = p_date.add_run(f"{q_num}\n")
    r.font.size = Pt(10)
    r.font.name = "Arial"

    # 4. Introductory Paragraphs
    intro1 = snapshot.get("introText1") or (
        "We are glad to inform you that we are in the Painting and Cleaning industry for the past 12 years "
        "and we do Interior and exterior painting, wall graphics, 3D paintings, starting from 900 to 100000 Sq. "
        "using traditional and latest technology Unifying Expertise."
    )
    p_intro1 = doc.add_paragraph()
    p_intro1.paragraph_format.space_before = Pt(8)
    p_intro1.paragraph_format.space_after = Pt(4)
    p_intro1.paragraph_format.line_spacing = 1.2
    r = p_intro1.add_run(intro1)
    r.font.size = Pt(9.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(30, 41, 59)

    intro2 = snapshot.get("introText2") or (
        "After a through survey of your site we are herewith submitting our proposal for the painting of your above property."
    )
    p_intro2 = doc.add_paragraph()
    p_intro2.paragraph_format.space_before = Pt(2)
    p_intro2.paragraph_format.space_after = Pt(10)
    p_intro2.paragraph_format.line_spacing = 1.2
    r = p_intro2.add_run(intro2)
    r.font.size = Pt(9.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(30, 41, 59)

    # 5. 3-Column Proposal Scope Table
    col_widths = [Inches(0.6), Inches(4.67), Inches(1.70)]
    tbl = doc.add_table(rows=1, cols=3)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False

    headers = ["S. No", "Description", "Amount in INR"]
    hdr_cells = tbl.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        _set_cell_background(hdr_cells[i], "0F172A")
        _set_cell_margins(hdr_cells[i], top=120, bottom=120, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else (WD_ALIGN_PARAGRAPH.RIGHT if i == 2 else WD_ALIGN_PARAGRAPH.LEFT)
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(255, 255, 255)

    data_rows = []
    if snapshot.get("rows") and isinstance(snapshot["rows"], list) and len(snapshot["rows"]) > 0:
        for idx, r in enumerate(snapshot["rows"], 1):
            title = (r.get("name") or "INTERIOR WALL PAINTING").upper()
            svc = (r.get("service_type") or "").upper()
            notes = r.get("description") or ""
            area = float(r.get("area_sqft") or 0)
            rate = float(r.get("rate_per_sqft") or 0)
            dim_str = f"Area: {area:,.0f} sq.ft @ Rs.{rate:,.2f} / sq.ft" if area else ""
            amt = safe_decimal(r.get("amount") or 0, "0")
            data_rows.append((idx, title, svc, notes, dim_str, amt))
    elif sections:
        for idx, s in enumerate(sections, 1):
            title = (s.section_name or "INTERIOR WALL PAINTING").upper()
            svc = (s.service_name or "ASIAN PAINT TRACTOR EMULSION").upper()
            notes = getattr(s, "notes", "") or ""
            dim_str = ""
            if s.billable_area:
                dim_str = f"Area: {safe_decimal(getattr(s, 'billable_area', 0), '0'):,.0f} sq.ft @ Rs.{safe_decimal(getattr(s, 'applied_rate', 0), '0'):,.2f} / sq.ft"
            amt = safe_decimal(getattr(s, "line_total", 0), "0")
            data_rows.append((idx, title, svc, notes, dim_str, amt))
    elif items:
        for idx, itm in enumerate(items, 1):
            title = itm.item_name.upper()
            desc = itm.description or ""
            amt = safe_decimal(getattr(itm, "line_total", 0), "0")
            data_rows.append((idx, title, "", desc, "", amt))
    else:
        title = "INTERIOR WALL PAINTING"
        svc = "ASIAN PAINT TRACTOR EMULSION"
        notes = "APPLY TWO CODE PREMIER EMULSION SHYNE INTERIOR WALLS CEILING WALL PUTTY AREA TWO CODE"
        dim_str = "Area: 4,200 sq.ft @ Rs.22.14 / sq.ft"
        data_rows.append((1, title, svc, notes, dim_str, safe_decimal(getattr(quotation, "final_amount", 93000), "93000")))

    # Calculate subtotal, tax, and total
    subtotal = safe_decimal(snapshot.get("subtotal") or quotation.subtotal or sum(r[5] for r in data_rows), "0")
    apply_tax = bool(snapshot.get("applyTax") if "applyTax" in snapshot else (getattr(quotation, "tax_rate", 0) > 0 or (quotation.total_tax and quotation.total_tax > 0)))
    gst_amt = safe_decimal(snapshot.get("gstAmount") or quotation.total_tax or (subtotal * Decimal("0.18") if apply_tax else 0), "0")
    final_amount = safe_decimal(snapshot.get("finalTotal") or quotation.final_amount or (subtotal + gst_amt if apply_tax else subtotal), "0")

    # Populate Data Rows
    for idx, title, svc, notes, dim_str, amt in data_rows:
        row_cells = tbl.add_row().cells
        for c_i in range(3):
            row_cells[c_i].width = col_widths[c_i]
            _set_cell_margins(row_cells[c_i], top=90, bottom=90, left=120, right=120)
            if idx % 2 == 0:
                _set_cell_background(row_cells[c_i], "F8FAFC")

        # Col 0: S. No
        p_idx = row_cells[0].paragraphs[0]
        p_idx.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_idx.add_run(f"{idx}.")
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(71, 85, 105)

        # Col 1: Description
        p_desc = row_cells[1].paragraphs[0]
        p_desc.paragraph_format.line_spacing = 1.2
        p_desc.paragraph_format.space_after = Pt(2)

        r_title = p_desc.add_run(f"{title}")
        r_title.bold = True
        r_title.font.size = Pt(9.5)
        r_title.font.name = "Arial"
        r_title.font.color.rgb = RGBColor(15, 23, 42)

        if svc:
            r_svc = p_desc.add_run(f": {svc}\n")
            r_svc.bold = True
            r_svc.font.size = Pt(9)
            r_svc.font.name = "Arial"
            r_svc.font.color.rgb = RGBColor(88, 28, 135)
        else:
            p_desc.add_run("\n")

        if notes:
            r_notes = p_desc.add_run(f"{notes}\n")
            r_notes.font.size = Pt(8)
            r_notes.font.name = "Arial"
            r_notes.font.color.rgb = RGBColor(100, 116, 139)

        if dim_str:
            r_dim = p_desc.add_run(f"{dim_str}")
            r_dim.bold = True
            r_dim.font.size = Pt(8)
            r_dim.font.name = "Arial"
            r_dim.font.color.rgb = RGBColor(124, 58, 237)

        # Col 2: Amount in INR
        p_amt = row_cells[2].paragraphs[0]
        p_amt.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p_amt.add_run(f"Rs.{amt:,.2f}")
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(15, 23, 42)

    # SUB TOTAL Row
    sub_row = tbl.add_row().cells
    for c_i in range(3):
        sub_row[c_i].width = col_widths[c_i]
        _set_cell_background(sub_row[c_i], "F8FAFC")
        _set_cell_margins(sub_row[c_i], top=80, bottom=80, left=120, right=120)

    p_s1 = sub_row[1].paragraphs[0]
    p_s1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_s1.add_run("SUB TOTAL:")
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(51, 65, 85)

    p_s2 = sub_row[2].paragraphs[0]
    p_s2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_s2.add_run(f"Rs.{subtotal:,.2f}")
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    # GST (18%) Row
    if apply_tax:
        gst_row = tbl.add_row().cells
        for c_i in range(3):
            gst_row[c_i].width = col_widths[c_i]
            _set_cell_margins(gst_row[c_i], top=60, bottom=60, left=120, right=120)

        p_g1 = gst_row[1].paragraphs[0]
        p_g1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p_g1.add_run("GST (18%):")
        r.font.size = Pt(8.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

        p_g2 = gst_row[2].paragraphs[0]
        p_g2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p_g2.add_run(f"Rs.{gst_amt:,.2f}")
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(15, 23, 42)

    # TOTAL PROJECT VALUE Row
    tot_row = tbl.add_row().cells
    for c_i in range(3):
        tot_row[c_i].width = col_widths[c_i]
        _set_cell_background(tot_row[c_i], "F3E8FF")
        _set_cell_margins(tot_row[c_i], top=90, bottom=90, left=120, right=120)

    p_t1 = tot_row[1].paragraphs[0]
    p_t1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_t1.add_run("TOTAL PROJECT VALUE :")
    r.bold = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    p_t2 = tot_row[2].paragraphs[0]
    p_t2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_t2.add_run(f"Rs.{final_amount:,.2f}")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    # Page 1 Footer
    p_p1 = doc.add_paragraph()
    p_p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_p1.paragraph_format.space_before = Pt(10)
    p_p1.paragraph_format.space_after = Pt(4)
    r = p_p1.add_run("Page 1 of 3")
    r.font.size = Pt(8)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(148, 163, 184)

    # ==================== PAGE 2 ====================
    doc.add_page_break()

    # Top Header Bar: Company | Quotation No • Page 2
    top_tbl2 = doc.add_table(rows=1, cols=2)
    top_tbl2.alignment = WD_TABLE_ALIGNMENT.CENTER
    top_tbl2.autofit = False
    top_tbl2.cell(0, 0).width = Inches(4.5)
    top_tbl2.cell(0, 1).width = Inches(2.47)
    _set_cell_margins(top_tbl2.cell(0, 0), top=40, bottom=80, left=0, right=0)
    _set_cell_margins(top_tbl2.cell(0, 1), top=40, bottom=80, left=0, right=0)

    p_th1 = top_tbl2.cell(0, 0).paragraphs[0]
    sig_comp_name = (snapshot.get("sigCompany") or getattr(company, "company_name", None) or "Unique Painters").upper()
    r = p_th1.add_run(sig_comp_name)
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    p_th2 = top_tbl2.cell(0, 1).paragraphs[0]
    p_th2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_th2.add_run(f"Quotation No: {q_num} • Page 2")
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(71, 85, 105)

    # Machineries Heading
    p_m_title = doc.add_paragraph()
    p_m_title.paragraph_format.space_before = Pt(8)
    p_m_title.paragraph_format.space_after = Pt(6)
    r = p_m_title.add_run("List of Machineries and consumables:")
    r.bold = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    machineries = snapshot.get("machineries") or [
        "Airless Sprayer with latest technology", "Sanding Machine", "Vacuum Cleaner", "Putty blades",
        "Sanding paper", "Leveling tool", "Ladders or Scissor Lift", "Banian waste",
        "Metal paste", "Wall putty", "Primer", "Thinner", "Brush and rollers", "Masking papers", "Safety equipment."
    ]

    # Render in 2 columns
    m_tbl = doc.add_table(rows=1, cols=2)
    m_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    m_tbl.autofit = False
    m_tbl.cell(0, 0).width = Inches(3.48)
    m_tbl.cell(0, 1).width = Inches(3.48)

    half = (len(machineries) + 1) // 2
    col_a, col_b = machineries[:half], machineries[half:]

    p_ma = m_tbl.cell(0, 0).paragraphs[0]
    p_ma.paragraph_format.space_after = Pt(0)
    p_ma.paragraph_format.line_spacing = 1.15
    for m in col_a:
        r = p_ma.add_run(f"• {m}\n")
        r.font.size = Pt(8.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

    p_mb = m_tbl.cell(0, 1).paragraphs[0]
    p_mb.paragraph_format.space_after = Pt(0)
    p_mb.paragraph_format.line_spacing = 1.15
    for m in col_b:
        r = p_mb.add_run(f"• {m}\n")
        r.font.size = Pt(8.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

    # Call Notice Box
    call_notice = snapshot.get("callNotice") or "Looking forward for your favourable orders. Please call - 9500065813 / 9710148218."
    p_call = doc.add_paragraph()
    p_call.paragraph_format.space_before = Pt(8)
    p_call.paragraph_format.space_after = Pt(10)
    r = p_call.add_run(call_notice)
    r.bold = True
    r.font.size = Pt(9)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    # Terms & Conditions Heading
    p_tc_title = doc.add_paragraph()
    p_tc_title.paragraph_format.space_before = Pt(4)
    p_tc_title.paragraph_format.space_after = Pt(4)
    r = p_tc_title.add_run("Terms & Conditions:")
    r.bold = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    terms = snapshot.get("terms") or [
        "GST 18% Extra",
        "50% Payment in Advance and the balance on completion of work.",
        "Water and power supply to be provided by you.",
        "Apart from the above mentioned jobs, if yours require additional services Please inform before the issuing work order.",
        "Scaffolding charges will Extra"
    ]
    for t in terms:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(1)
        p_t.paragraph_format.space_after = Pt(1)
        p_t.paragraph_format.left_indent = Inches(0.2)
        r = p_t.add_run(f"• {t}")
        r.font.size = Pt(8.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(51, 65, 85)

    # Satisfaction statement
    satisfaction = snapshot.get("satisfactionGoal") or "Your satisfaction is our Goal. Looking forward for your favourable orders."
    p_sat = doc.add_paragraph()
    p_sat.paragraph_format.space_before = Pt(8)
    p_sat.paragraph_format.space_after = Pt(12)
    r = p_sat.add_run(satisfaction)
    r.font.size = Pt(9)
    r.italic = True
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(71, 85, 105)

    # Signatory Block
    sig_tbl = doc.add_table(rows=1, cols=2)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_tbl.autofit = False
    s_left, s_right = sig_tbl.cell(0, 0), sig_tbl.cell(0, 1)
    s_left.width = Inches(4.2)
    s_right.width = Inches(2.77)

    p_sl = s_left.paragraphs[0]
    p_sl.paragraph_format.space_after = Pt(0)
    r = p_sl.add_run(f"This is a computer generated quotation authenticated by {sig_comp_name}.")
    r.italic = True
    r.font.size = Pt(8)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(100, 116, 139)

    p_sr = s_right.paragraphs[0]
    p_sr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sr.paragraph_format.space_after = Pt(0)
    p_sr.paragraph_format.line_spacing = 1.15

    sig_user = snapshot.get("sigName") or getattr(quotation, "signatory_name", None) or getattr(company, "signatory_name", None) or "Mr. Manikandan Balamurugan"
    sig_desig = snapshot.get("sigTitle") or getattr(quotation, "signatory_designation", None) or getattr(company, "signatory_designation", None) or "Sales and Service Head"
    sig_phone = snapshot.get("sigPhones") or getattr(company, "phone1", None) or "9710148218 / 7338882034"

    r = p_sr.add_run("Regards\n")
    r.font.size = Pt(9)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(71, 85, 105)

    r = p_sr.add_run(f"{sig_comp_name}\n")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    r = p_sr.add_run(f"{sig_user}\n")
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    r = p_sr.add_run(f"{sig_desig}\n")
    r.font.size = Pt(8.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(71, 85, 105)

    r = p_sr.add_run(sig_phone)
    r.font.size = Pt(8.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(71, 85, 105)

    # Page 2 Footer
    p_p2 = doc.add_paragraph()
    p_p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_p2.paragraph_format.space_before = Pt(8)
    p_p2.paragraph_format.space_after = Pt(4)
    r = p_p2.add_run("Page 2 of 3")
    r.font.size = Pt(8)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(148, 163, 184)

    # ==================== PAGE 3 ====================
    doc.add_page_break()

    # Top Header Bar: Upcoming Technology Showcase | Unique Painters • Page 3
    top_tbl3 = doc.add_table(rows=1, cols=2)
    top_tbl3.alignment = WD_TABLE_ALIGNMENT.CENTER
    top_tbl3.autofit = False
    top_tbl3.cell(0, 0).width = Inches(4.5)
    top_tbl3.cell(0, 1).width = Inches(2.47)
    _set_cell_margins(top_tbl3.cell(0, 0), top=40, bottom=80, left=0, right=0)
    _set_cell_margins(top_tbl3.cell(0, 1), top=40, bottom=80, left=0, right=0)

    p_t3a = top_tbl3.cell(0, 0).paragraphs[0]
    r = p_t3a.add_run("Upcoming Technology Showcase")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    p_t3b = top_tbl3.cell(0, 1).paragraphs[0]
    p_t3b.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_t3b.add_run("Unique Painters • Page 3")
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(71, 85, 105)

    # Section 1: 3D Wall Printing
    p_f1 = doc.add_paragraph()
    p_f1.paragraph_format.space_before = Pt(10)
    p_f1.paragraph_format.space_after = Pt(6)
    r = p_f1.add_run("UPCOMING OUR FUTURE TECHNOLOGY; 3D WALL PRINTING MACHINE:")
    r.bold = True
    r.underline = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    img_tbl1 = doc.add_table(rows=1, cols=2)
    img_tbl1.alignment = WD_TABLE_ALIGNMENT.CENTER
    img_tbl1.autofit = False
    c1, c2 = img_tbl1.cell(0, 0), img_tbl1.cell(0, 1)
    c1.width = Inches(3.48)
    c2.width = Inches(3.48)

    img_w1 = STATIC_DIR / "unique_painters" / "wall_printing_machine_1.jpeg"
    img_w2 = STATIC_DIR / "unique_painters" / "wall_printing_machine_2.jpeg"
    if img_w1.exists():
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.paragraph_format.space_after = Pt(2)
        p1.add_run().add_picture(str(img_w1), width=Inches(3.2))
        p1_cap = c1.add_paragraph()
        p1_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p1_cap.add_run("High-Precision 3D Vertical Wall Printer")
        r.bold = True
        r.font.size = Pt(8)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(30, 41, 59)

    if img_w2.exists():
        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_after = Pt(2)
        p2.add_run().add_picture(str(img_w2), width=Inches(3.2))
        p2_cap = c2.add_paragraph()
        p2_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p2_cap.add_run("Direct-on-Wall Architectural Graphic")
        r.bold = True
        r.font.size = Pt(8)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(30, 41, 59)

    # Section 2: Robotic Plastering
    p_f2 = doc.add_paragraph()
    p_f2.paragraph_format.space_before = Pt(14)
    p_f2.paragraph_format.space_after = Pt(6)
    r = p_f2.add_run("ROBOTIC PLASTERING AND PAINTING MACHINE :")
    r.bold = True
    r.underline = True
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    img_tbl2 = doc.add_table(rows=1, cols=2)
    img_tbl2.alignment = WD_TABLE_ALIGNMENT.CENTER
    img_tbl2.autofit = False
    c3, c4 = img_tbl2.cell(0, 0), img_tbl2.cell(0, 1)
    c3.width = Inches(3.48)
    c4.width = Inches(3.48)

    img_r1 = STATIC_DIR / "unique_painters" / "robotic_plastering_1.jpeg"
    img_r2 = STATIC_DIR / "unique_painters" / "robotic_plastering_2.jpeg"
    if img_r1.exists():
        p3 = c3.paragraphs[0]
        p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p3.paragraph_format.space_after = Pt(2)
        p3.add_run().add_picture(str(img_r1), width=Inches(3.2))
        p3_cap = c3.add_paragraph()
        p3_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p3_cap.add_run("Robotic Surface Leveling & Plastering Unit")
        r.bold = True
        r.font.size = Pt(8)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(30, 41, 59)

    if img_r2.exists():
        p4 = c4.paragraphs[0]
        p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p4.paragraph_format.space_after = Pt(2)
        p4.add_run().add_picture(str(img_r2), width=Inches(3.2))
        p4_cap = c4.add_paragraph()
        p4_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p4_cap.add_run("Automated Mechanized Spray Coating")
        r.bold = True
        r.font.size = Pt(8)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(30, 41, 59)

    # Page 3 Footer
    p_p3 = doc.add_paragraph()
    p_p3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_p3.paragraph_format.space_before = Pt(8)
    p_p3.paragraph_format.space_after = Pt(4)
    r = p_p3.add_run("Page 3 of 3")
    r.font.size = Pt(8)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(148, 163, 184)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()




def _generate_kleanmax_docx(
    quotation,
    company,
    customer,
    sections: list = None,
    items: list = None
) -> bytes:
    """Generates the authentic 4-page Klean Max Commercial Cleaning Proposal Word Document."""
    doc = docx.Document()
    
    # 0. A4 Dimensions & Margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.4)
        sec.bottom_margin = Inches(0.4)
        sec.left_margin = Inches(0.6)
        sec.right_margin = Inches(0.6)
        sec.page_width = Inches(8.27)
        sec.page_height = Inches(11.69)

    # 1. Parse snapshot
    snapshot = {}
    raw_snap = getattr(quotation, "snapshot_json", None)
    if raw_snap:
        if isinstance(raw_snap, dict):
            snapshot = raw_snap
        elif isinstance(raw_snap, str):
            try:
                import json
                snapshot = json.loads(raw_snap)
            except Exception:
                snapshot = {}

    cust_name = (
        snapshot.get("customerName")
        or (getattr(customer, "company_name", None) if customer else None)
        or "SRI CHANDAAN LOGISTICS"
    ).upper()

    attn_person = (
        snapshot.get("attentionPerson")
        or snapshot.get("contactPerson")
        or (getattr(customer, "contact_person", None) if customer else None)
        or "MR.RONAK BOTHRA ( 99419 09090)"
    ).upper()

    addr1 = snapshot.get("addressLine1") or (getattr(customer, "billing_address_line1", "") if customer else "")
    addr2 = snapshot.get("addressLine2") or (getattr(customer, "billing_city", "") if customer else "")
    addr_str = f"{addr1}, {addr2}".strip(", ") if (addr1 or addr2) else ""

    cleanable_sqft = snapshot.get("cleanableSqft") or snapshot.get("cleanable_sqft") or "36,000 SQFT"
    rate_sqft = snapshot.get("ratePerSqft") or 12.0
    final_amt = float(snapshot.get("finalTotal") or getattr(quotation, "final_amount", None) or 432000.0)

    # ===== PAGE 1: COVER PAGE =====
    t_hdr = doc.add_table(rows=1, cols=2)
    t_hdr.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_hdr.autofit = False
    t_hdr.columns[0].width = Inches(4.2)
    t_hdr.columns[1].width = Inches(2.87)

    c0 = t_hdr.cell(0, 0)
    c0.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p_logo = c0.paragraphs[0]
    p_logo.paragraph_format.space_before = Pt(0)
    p_logo.paragraph_format.space_after = Pt(0)
    logo_path = STATIC_DIR / "kleanmax" / "kleanmax_butterfly_logo.jpeg"
    if logo_path.exists():
        r = p_logo.add_run()
        r.add_picture(str(logo_path), width=Inches(2.5))

    c1 = t_hdr.cell(0, 1)
    c1.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    _set_cell_background(c1, "92D050")
    _set_cell_margins(c1, top=140, bottom=140, left=180, right=180)
    p_web = c1.paragraphs[0]
    p_web.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_web = p_web.add_run("WWW.KLEANMAX.COM")
    r_web.bold = True
    r_web.font.name = "Arial"
    r_web.font.size = Pt(12)
    r_web.font.color.rgb = RGBColor(0, 0, 0)

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(28)
    p_space.paragraph_format.space_after = Pt(0)

    p_t1 = doc.add_paragraph()
    p_t1.paragraph_format.left_indent = Inches(0.5)
    p_t1.paragraph_format.space_before = Pt(0)
    p_t1.paragraph_format.space_after = Pt(0)
    r = p_t1.add_run("Commercial")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(36)
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_t2 = doc.add_paragraph()
    p_t2.paragraph_format.left_indent = Inches(0.5)
    p_t2.paragraph_format.space_before = Pt(0)
    p_t2.paragraph_format.space_after = Pt(0)
    r = p_t2.add_run("Cleaning")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(36)
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_t3 = doc.add_paragraph()
    p_t3.paragraph_format.left_indent = Inches(0.5)
    p_t3.paragraph_format.space_before = Pt(0)
    p_t3.paragraph_format.space_after = Pt(14)
    r = p_t3.add_run("Proposal")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(36)
    r.font.color.rgb = RGBColor(254, 209, 12)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.left_indent = Inches(0.5)
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(20)
    r = p_sub.add_run("Elevating cleanliness for\nBusiness success")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_to = doc.add_paragraph()
    p_to.paragraph_format.left_indent = Inches(0.5)
    p_to.paragraph_format.space_before = Pt(0)
    p_to.paragraph_format.space_after = Pt(36)
    to_text = f"TO:  {cust_name}"
    if addr_str:
        to_text += f"\n{addr_str}"
    to_text += f"\nATT: {attn_person}"
    r = p_to.add_run(to_text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(0, 0, 0)

    t_bot = doc.add_table(rows=1, cols=1)
    t_bot.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_bot.autofit = False
    t_bot.columns[0].width = Inches(7.07)
    c_b = t_bot.cell(0, 0)
    _set_cell_background(c_b, "92D050")
    _set_cell_margins(c_b, top=160, bottom=160, left=200, right=200)

    p_b1 = c_b.paragraphs[0]
    p_b1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_b1.paragraph_format.space_before = Pt(0)
    p_b1.paragraph_format.space_after = Pt(2)
    r = p_b1.add_run("KLEAN MAX\n")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor(0, 0, 0)
    r = p_b1.add_run("NO.06, JAYAM INDUSTRIAL ESTATE,\nVANAGRAM, CHENNAI – 600095.\n\n")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(0, 0, 0)
    r = p_b1.add_run("CONTACT – 97101 48218                 INFO@KLEANMAX.COM")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(0, 0, 0)

    # ===== PAGE 2: ABOUT US & TEAM SUPPORT =====
    doc.add_page_break()
    p_p2 = doc.add_paragraph()
    p_p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_p2.paragraph_format.space_before = Pt(0)
    p_p2.paragraph_format.space_after = Pt(0)
    team_path = STATIC_DIR / "kleanmax" / "kleanmax_team_page.jpeg"
    if team_path.exists():
        r = p_p2.add_run()
        r.add_picture(str(team_path), width=Inches(7.07))

    # ===== PAGE 3: SCOPE & PROJECT VALUE =====
    doc.add_page_break()
    p_s_hdr = doc.add_paragraph()
    p_s_hdr.paragraph_format.space_before = Pt(0)
    p_s_hdr.paragraph_format.space_after = Pt(10)
    r = p_s_hdr.add_run(snapshot.get("scopeTitle") or "DEEP CLEANING SERVICE :")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(16)
    r.underline = True
    r.font.color.rgb = RGBColor(0, 0, 0)

    scope_text = snapshot.get("scopeText") or getattr(quotation, "notes", None)
    if scope_text:
        for line in scope_text.split("\n"):
            clean_line = line.strip()
            if not clean_line:
                continue
            if clean_line.startswith(("•", "-", "*", "")):
                p_b = doc.add_paragraph()
                p_b.paragraph_format.left_indent = Inches(0.2)
                p_b.paragraph_format.space_before = Pt(0)
                p_b.paragraph_format.space_after = Pt(2)
                r = p_b.add_run(f"• {clean_line.lstrip('•-* ')}")
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0, 0, 0)
            elif clean_line.endswith(":") or (clean_line.isupper() and len(clean_line) > 4):
                p_sec = doc.add_paragraph()
                p_sec.paragraph_format.space_before = Pt(8)
                p_sec.paragraph_format.space_after = Pt(3)
                r = p_sec.add_run(clean_line)
                r.bold = True
                r.font.name = "Arial"
                r.font.size = Pt(10)
                r.underline = True
                r.font.color.rgb = RGBColor(0, 0, 0)
            else:
                p_b = doc.add_paragraph()
                p_b.paragraph_format.space_before = Pt(0)
                p_b.paragraph_format.space_after = Pt(2)
                r = p_b.add_run(clean_line)
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0, 0, 0)
    else:
        default_sections = [
            ("FLOOR SCRUBBING:", [
                "Vacuum cleaner will be used for dusting the entire floor area.",
                "A single-disc machine with TASKI chemicals will be used to scrub the entire floor and staircase.",
                "Wet and dry vacuum cleaners will then be used to remove water and residue from the cleaned surfaces."
            ]),
            ("WALL & PARTITION CLEANING", [
                "Stickers, adhesive residue, and visible marks will be completely removed.",
                "Surfaces will be washed using TASKI R2 chemical.",
                "TASKI R3 will then be applied, followed by wiping with a glass wiper for a clean, streak-free finish.",
                "All partition glass surfaces will be thoroughly cleaned."
            ]),
            ("CEILING DUSTING & SOFA/INTERIOR DUSTING", [
                "After vacuuming, all ceiling surfaces will be wiped with microfiber cloths to ensure thorough removal of remaining dust particles.",
                "Cobwebs and accumulated dust will be removed using a heavy-duty vacuum cleaner with the required manpower.",
                "Cleaning of chairs, tables, doors, windows, cupboards, and all other interior areas is included in the quoted price."
            ]),
            ("SHEET CLEANING :", [
                "DEPLOYMENT OF HEAVY-DUTY HIGH-PRESSURE JET WASHER MACHINES TO DEEPLY CLEAN EXTERIOR WALL SURFACES.",
                "THIS PROCESS REMOVES STUBBORN GRIME, POLLUTION STAINS, MOLD, ALGAE, AND WEATHER-RELATED DEPOSITS.",
                "CLEANING OF EXTERIOR GLASS USING TASKI R3 CHEMICAL, FOLLOWED BY THOROUGH WIPING WITH A GLASS WIPER TO ACHIEVE A CLEAN, STREAK-FREE FINISH."
            ])
        ]
        for title, bullets in default_sections:
            p_sec = doc.add_paragraph()
            p_sec.paragraph_format.space_before = Pt(8)
            p_sec.paragraph_format.space_after = Pt(3)
            r = p_sec.add_run(title)
            r.bold = True
            r.font.name = "Arial"
            r.font.size = Pt(10)
            r.underline = True
            r.font.color.rgb = RGBColor(0, 0, 0)
            for b in bullets:
                p_b = doc.add_paragraph()
                p_b.paragraph_format.left_indent = Inches(0.2)
                p_b.paragraph_format.space_before = Pt(0)
                p_b.paragraph_format.space_after = Pt(2)
                r = p_b.add_run(f"• {b}")
                r.font.name = "Arial"
                r.font.size = Pt(8.5)
                r.font.color.rgb = RGBColor(0, 0, 0)

    # Project Value Block
    p_pv_hdr = doc.add_paragraph()
    p_pv_hdr.paragraph_format.space_before = Pt(16)
    p_pv_hdr.paragraph_format.space_after = Pt(3)
    r = p_pv_hdr.add_run("TOTAL PROJECT VALUE:")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.underline = True
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_pv1 = doc.add_paragraph()
    p_pv1.paragraph_format.space_before = Pt(0)
    p_pv1.paragraph_format.space_after = Pt(2)
    r = p_pv1.add_run(f"TOTAL CLEANABLE SQFT – APPROX {cleanable_sqft}.\nTOTAL CLEANABLE VALUE SQFT – RS.{float(rate_sqft):.2f}")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(0, 0, 0)

    t_pv = doc.add_table(rows=1, cols=1)
    t_pv.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_pv.autofit = False
    t_pv.columns[0].width = Inches(7.07)
    c_pv = t_pv.cell(0, 0)
    _set_cell_background(c_pv, "205B73")
    _set_cell_margins(c_pv, top=120, bottom=120, left=150, right=150)
    p_c_pv = c_pv.paragraphs[0]
    p_c_pv.paragraph_format.space_before = Pt(0)
    p_c_pv.paragraph_format.space_after = Pt(0)
    r = p_c_pv.add_run(f"TOTAL CLEANABLE VALUE – RS.{final_amt:,.2f}")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(255, 255, 255)

    # ===== PAGE 4: BANK DETAILS, TERMS & THANK YOU =====
    doc.add_page_break()
    p_bk_hdr = doc.add_paragraph()
    p_bk_hdr.paragraph_format.space_before = Pt(0)
    p_bk_hdr.paragraph_format.space_after = Pt(6)
    r = p_bk_hdr.add_run("Company's Bank Details:")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13.5)
    r.underline = True
    r.font.color.rgb = RGBColor(0, 0, 0)

    b_holder = snapshot.get("bankAccountName") or "KLEAN MAX BANK"
    b_name = snapshot.get("bankName") or "KVB BANK"
    b_acc = snapshot.get("bankAccountNo") or "1278135000007113"
    b_branch = snapshot.get("bankBranch") or "ASHOK NAGAR"
    b_ifsc = snapshot.get("bankIfsc") or "KVBL000127"

    bank_lines = [
        f"• A/c Holder's Name: {b_holder}",
        f"• Name: {b_name} A/C – {b_acc}",
        f"• A/c No: {b_acc}",
        f"• Branch & IFS Code: {b_branch} & {b_ifsc}"
    ]
    for bl in bank_lines:
        p_bl = doc.add_paragraph()
        p_bl.paragraph_format.space_before = Pt(0)
        p_bl.paragraph_format.space_after = Pt(3)
        r = p_bl.add_run(bl)
        r.font.name = "Arial"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_tm_hdr = doc.add_paragraph()
    p_tm_hdr.paragraph_format.space_before = Pt(16)
    p_tm_hdr.paragraph_format.space_after = Pt(6)
    r = p_tm_hdr.add_run("TERMS AND CONDITIONS:")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0, 0, 0)

    terms_list = snapshot.get("terms") or [
        "1. GST: PRICES ARE EXCLUSIVE OF GST (18%). GST WILL BE CHARGED EXTRA.",
        "2. RECLEANING POLICY: ONCE THE FLOOR IS HANDED OVER, ANY REQUEST FOR RECLEANING WILL BE SUBJECT TO ADDITIONAL CHARGES.",
        "3. UTILITIES: THE CLIENT MUST ARRANGE FOR A WATER AND ELECTRICITY SUPPLY DURING THE SERVICE.",
        "4. WORKING AREA CLEARANCE: THE CLIENT IS RESPONSIBLE FOR CLEARING THE WORKING AREA. CARE MUST BE TAKEN DURING SERVICE HOURS TO AVOID SPOILING THE CLEANED SURFACES.",
        "5. PAYMENT TERMS: A 50% ADVANCE PAYMENT IS REQUIRED. THE REMAINING BALANCE IS DUE UPON COMPLETION OF THE WORK. NO CREDIT TERMS ARE OFFERED.",
        "6. ADDITIONAL SERVICES: INFORM US IN ADVANCE IF ANY ADDITIONAL SERVICES ARE REQUIRED BEYOND THE SCOPE MENTIONED.."
    ]
    for tl in terms_list:
        p_tl = doc.add_paragraph()
        p_tl.paragraph_format.left_indent = Inches(0.15)
        p_tl.paragraph_format.space_before = Pt(0)
        p_tl.paragraph_format.space_after = Pt(3)
        r = p_tl.add_run(tl)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0, 0, 0)

    p_sat = doc.add_paragraph()
    p_sat.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sat.paragraph_format.space_before = Pt(28)
    p_sat.paragraph_format.space_after = Pt(36)
    r = p_sat.add_run(snapshot.get("satisfactionGoal") or "YOUR SATISFACTION IS OUR GOAL. LOOKING FORWARD TO YOUR FAVORABLE ORDERS.")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_ty = doc.add_paragraph()
    p_ty.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ty.paragraph_format.space_before = Pt(10)
    p_ty.paragraph_format.space_after = Pt(0)
    r = p_ty.add_run("T H A N K   Y O U...")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(22)
    r.font.color.rgb = RGBColor(0, 0, 0)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()


def generate_quotation_docx_bytes(
    quotation,
    company,
    customer,
    sections: list = None,
    items: list = None
) -> bytes:
    """Generates a professional Word (.docx) quotation document with company letterhead banner."""
    doc = docx.Document()
    sections_list = sections or []
    items_list = items or []

    # Page setup - Margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.4)
        sec.bottom_margin = Inches(0.5)
        sec.left_margin = Inches(0.6)
        sec.right_margin = Inches(0.6)
        sec.page_width = Inches(8.27)  # A4 width
        sec.page_height = Inches(11.69) # A4 height

    company_code = (getattr(company, 'company_code', None) or getattr(quotation, 'company_code', None) or 'kleanmaxpro').lower()

    if company_code == 'uniquepainters':
        return _generate_uniquepainters_docx(quotation, company, customer, sections=sections_list, items=items_list)

    if company_code == 'kleanmax':
        return _generate_kleanmax_docx(quotation, company, customer, sections=sections_list, items=items_list)

    # Brand color mapping
    brand_hex_map = {
        'kleanmaxpro': 'FED10C',
        'kleanmax': '0284C7',
        'uniquepainters': '7C3AED',
        'cleantech': '0D9488',
    }
    brand_hex = brand_hex_map.get(company_code, '0F172A')

    # 1. Header Banner Image
    header_img_path = STATIC_DIR / "headers" / f"header_{company_code}.png"
    if not header_img_path.exists():
        header_img_path = STATIC_DIR / "letterhead_banner.png"

    if header_img_path.exists():
        p_banner = doc.add_paragraph()
        p_banner.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_banner.paragraph_format.space_before = Pt(0)
        p_banner.paragraph_format.space_after = Pt(8)
        run_banner = p_banner.add_run()
        if company_code in ('kleanmax', 'cleantech'):
            # Edge-to-edge header across full page width
            p_banner.paragraph_format.left_indent = Inches(-0.6)
            p_banner.paragraph_format.right_indent = Inches(-0.6)
            run_banner.add_picture(str(header_img_path), width=Inches(8.27))
        else:
            run_banner.add_picture(str(header_img_path), width=Inches(7.07))

    # 2. Quotation Title
    q_type = getattr(quotation, 'quotation_type', 'item_based')
    job_desc = (getattr(quotation, 'job_description', '') or '').upper()

    if 'RENTAL' in job_desc or q_type == 'rental':
        title_text = "MONTHLY RENTAL QUOTATION"
    elif 'REPAIR' in q_type or 'SERVICE' in job_desc:
        title_text = "SERVICE QUOTATION"
    elif 'CLEANING' in job_desc or q_type == 'area_based':
        title_text = "COMMERCIAL CLEANING & AREA PROPOSAL"
    elif 'PAINT' in job_desc:
        title_text = "SURFACE COATING & PAINTING QUOTATION"
    else:
        title_text = "SALES QUOTATION"

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(10)
    run_title = p_title.add_run(title_text)
    run_title.bold = True
    run_title.underline = True
    run_title.font.size = Pt(14)
    run_title.font.name = "Arial"

    # 3. Meta Table (TO: Customer details & Quotation Number / Date)
    meta_table = doc.add_table(rows=1, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    cell_left = meta_table.cell(0, 0)
    cell_right = meta_table.cell(0, 1)
    cell_left.width = Inches(4.2)
    cell_right.width = Inches(2.87)

    # Customer info (Left)
    p_to = cell_left.paragraphs[0]
    p_to.paragraph_format.space_after = Pt(2)
    r_to_label = p_to.add_run("TO :\n")
    r_to_label.bold = True
    r_to_label.font.size = Pt(9.5)
    r_to_name = p_to.add_run(f"{(customer.company_name if customer else 'Valued Client').upper()}\n")
    r_to_name.bold = True
    r_to_name.font.size = Pt(10.5)

    if customer and customer.contact_person:
        r_attn = p_to.add_run(f"ATTN: {customer.contact_person}\n")
        r_attn.font.size = Pt(9)
    if customer and customer.phone:
        r_ph = p_to.add_run(f"Contact: {customer.phone}\n")
        r_ph.font.size = Pt(9)
    if customer and customer.gstin:
        r_gst = p_to.add_run(f"GSTIN: {customer.gstin}\n")
        r_gst.font.size = Pt(9)
    if customer and customer.billing_address_line1:
        addr = f"{customer.billing_address_line1}, {customer.billing_city or ''} - {customer.billing_pincode or ''}"
        r_addr = p_to.add_run(f"Address: {addr}")
        r_addr.font.size = Pt(8.5)

    # Quotation details (Right)
    p_meta = cell_right.paragraphs[0]
    p_meta.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_meta.paragraph_format.space_after = Pt(2)

    q_num = getattr(quotation, 'quotation_number', 'QUOT-0001')
    q_date = str(getattr(quotation, 'quotation_date', ''))
    v_date = str(getattr(quotation, 'validity_date', ''))
    c_ref = getattr(quotation, 'customer_ref', None)

    r_num = p_meta.add_run(f"Quotation No: {q_num}\n")
    r_num.bold = True
    r_num.font.size = Pt(10)

    r_date = p_meta.add_run(f"Date: {q_date}\n")
    r_date.font.size = Pt(9)

    if v_date:
        r_vdate = p_meta.add_run(f"Valid Till: {v_date}\n")
        r_vdate.font.size = Pt(9)

    if c_ref:
        r_ref = p_meta.add_run(f"Ref / PO: {c_ref}")
        r_ref.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 4. Job Scope / Description
    if quotation.job_description:
        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_after = Pt(8)
        p_desc.paragraph_format.space_before = Pt(0)
        r_scope = p_desc.add_run("Scope of Work / Specification:\n")
        r_scope.bold = True
        r_scope.font.size = Pt(9.5)
        r_desc_text = p_desc.add_run(quotation.job_description)
        r_desc_text.font.size = Pt(8.5)

    # 5. Data Table (Items or Sections)
    table = None
    if items_list and len(items_list) > 0:
        if 'RENTAL' in job_desc or q_type == 'rental':
            headers = ["SL NO", "DESCRIPTION", "DAYS", "UOM", "PER MONTHLY RENT", "AMOUNT (₹)"]
        else:
            headers = ["SL NO", "DESCRIPTION", "QTY", "UOM", "RATE (₹)", "AMOUNT (₹)"]
        col_widths = [Inches(0.6), Inches(3.27), Inches(0.7), Inches(0.7), Inches(0.9), Inches(1.0)]

        table = doc.add_table(rows=1, cols=6)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Header Row
        hdr_cells = table.rows[0].cells
        for i, heading in enumerate(headers):
            hdr_cells[i].width = col_widths[i]
            _set_cell_background(hdr_cells[i], "0F172A")
            _set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if i >= 4 else (WD_ALIGN_PARAGRAPH.CENTER if i != 1 else WD_ALIGN_PARAGRAPH.LEFT)
            r = p.add_run(heading)
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(255, 255, 255)

        # Data Rows
        for idx, itm in enumerate(items_list, 1):
            row_cells = table.add_row().cells
            for c_idx in range(6):
                row_cells[c_idx].width = col_widths[c_idx]
                _set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=100, right=100)
                if idx % 2 == 0:
                    _set_cell_background(row_cells[c_idx], "F8FAFC")

            row_cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[0].paragraphs[0].add_run(f"{idx}.").font.size = Pt(8.5)

            p_desc = row_cells[1].paragraphs[0]
            r_name = p_desc.add_run(itm.item_name)
            r_name.bold = True
            r_name.font.size = Pt(8.5)
            if itm.description:
                p_desc.add_run(f"\n{itm.description}").font.size = Pt(7.5)

            # Embed machine or uploaded image if available
            img_to_embed = None
            if idx == 1 and getattr(quotation, 'image_url', None):
                img_to_embed = quotation.image_url
            elif 'RB-800' in itm.item_name.upper() or '800' in itm.item_name:
                img_to_embed = str(STATIC_DIR / "products" / "rb800.png")
            elif 'RB-650' in itm.item_name.upper() or '650' in itm.item_name:
                img_to_embed = str(STATIC_DIR / "products" / "rb650.png")
            elif 'BD-50' in itm.item_name.upper() or 'BD50' in itm.item_name.upper():
                img_to_embed = str(STATIC_DIR / "products" / "bd5050.png")

            if img_to_embed:
                stream = _load_image_stream(img_to_embed)
                if stream:
                    try:
                        p_desc.add_run("\n")
                        r_img = p_desc.add_run()
                        r_img.add_picture(stream, width=Inches(1.8))
                    except Exception as err:
                        logger.warning(f"Error embedding item picture in docx: {err}")

            row_cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[2].paragraphs[0].add_run(f"{safe_decimal(getattr(itm, 'quantity', 0), '0'):.2f}").font.size = Pt(8.5)

            row_cells[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[3].paragraphs[0].add_run(str(itm.uom).upper()).font.size = Pt(8.5)

            row_cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            row_cells[4].paragraphs[0].add_run(f"{safe_decimal(getattr(itm, 'unit_price', 0), '0'):,.2f}").font.size = Pt(8.5)

            row_cells[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r_total = row_cells[5].paragraphs[0].add_run(f"{safe_decimal(getattr(itm, 'line_total', 0), '0'):,.2f}")
            r_total.bold = True
            r_total.font.size = Pt(8.5)

    elif sections_list and len(sections_list) > 0:
        headers = ["SL NO", "AREA / SERVICE DESCRIPTION", "DIMENSIONS", "BILLABLE AREA", "RATE (₹)", "TOTAL (₹)"]
        col_widths = [Inches(0.6), Inches(2.97), Inches(1.1), Inches(1.0), Inches(0.7), Inches(0.9)]

        table = doc.add_table(rows=1, cols=6)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        hdr_cells = table.rows[0].cells
        for i, heading in enumerate(headers):
            hdr_cells[i].width = col_widths[i]
            _set_cell_background(hdr_cells[i], "0F172A")
            _set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if i >= 4 else (WD_ALIGN_PARAGRAPH.CENTER if i != 1 else WD_ALIGN_PARAGRAPH.LEFT)
            r = p.add_run(heading)
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(255, 255, 255)

        for idx, sec in enumerate(sections_list, 1):
            row_cells = table.add_row().cells
            for c_idx in range(6):
                row_cells[c_idx].width = col_widths[c_idx]
                _set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=100, right=100)
                if idx % 2 == 0:
                    _set_cell_background(row_cells[c_idx], "F8FAFC")

            row_cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[0].paragraphs[0].add_run(f"{idx}.").font.size = Pt(8.5)

            p_desc = row_cells[1].paragraphs[0]
            r_name = p_desc.add_run(sec.section_name)
            r_name.bold = True
            r_name.font.size = Pt(8.5)
            if sec.service_name:
                p_desc.add_run(f"\n{sec.service_name}").font.size = Pt(7.5)

            dim = f"{sec.length} x {sec.breadth} {sec.measurement_unit}"
            if sec.repetitions > 1:
                dim += f" (x{sec.repetitions})"
            row_cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[2].paragraphs[0].add_run(dim).font.size = Pt(8.5)

            row_cells[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[3].paragraphs[0].add_run(f"{safe_decimal(getattr(sec, 'billable_area', 0), '0'):,.1f} sq.ft").font.size = Pt(8.5)

            row_cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            row_cells[4].paragraphs[0].add_run(f"{safe_decimal(getattr(sec, 'applied_rate', 0), '0'):,.2f}").font.size = Pt(8.5)

            row_cells[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r_total = row_cells[5].paragraphs[0].add_run(f"{safe_decimal(getattr(sec, 'line_total', 0), '0'):,.2f}")
            r_total.bold = True
            r_total.font.size = Pt(8.5)

    else:
        # Fallback single row table
        headers = ["SL NO", "DESCRIPTION", "QTY", "UOM", "RATE (₹)", "AMOUNT (₹)"]
        col_widths = [Inches(0.6), Inches(3.27), Inches(0.7), Inches(0.7), Inches(0.9), Inches(1.0)]

        table = doc.add_table(rows=1, cols=6)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        hdr_cells = table.rows[0].cells
        for i, heading in enumerate(headers):
            hdr_cells[i].width = col_widths[i]
            _set_cell_background(hdr_cells[i], "0F172A")
            _set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if i >= 4 else (WD_ALIGN_PARAGRAPH.CENTER if i != 1 else WD_ALIGN_PARAGRAPH.LEFT)
            r = p.add_run(heading)
            r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(255, 255, 255)

        row_cells = table.add_row().cells
        for c_idx in range(6):
            row_cells[c_idx].width = col_widths[c_idx]
            _set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=100, right=100)

        fallback_subtotal = safe_decimal(getattr(quotation, 'subtotal', 0), '0')
        row_cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_cells[0].paragraphs[0].add_run("1.").font.size = Pt(8.5)
        row_cells[1].paragraphs[0].add_run(getattr(quotation, 'job_description', 'Commercial Services') or 'Commercial Services').font.size = Pt(8.5)
        row_cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_cells[2].paragraphs[0].add_run("1.00").font.size = Pt(8.5)
        row_cells[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_cells[3].paragraphs[0].add_run("JOB").font.size = Pt(8.5)
        row_cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        row_cells[4].paragraphs[0].add_run(f"{fallback_subtotal:,.2f}").font.size = Pt(8.5)
        row_cells[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_tot = row_cells[5].paragraphs[0].add_run(f"{fallback_subtotal:,.2f}")
        r_tot.bold = True
        r_tot.font.size = Pt(8.5)

    # 6. Financial Summary Rows
    subtotal = safe_decimal(getattr(quotation, 'subtotal', 0), '0')
    cgst_rate = safe_decimal(getattr(quotation, 'cgst_rate', 9), '9')
    cgst_amount = safe_decimal(getattr(quotation, 'cgst_amount', 0), '0')
    sgst_rate = safe_decimal(getattr(quotation, 'sgst_rate', 9), '9')
    sgst_amount = safe_decimal(getattr(quotation, 'sgst_amount', 0), '0')
    final_amount = safe_decimal(getattr(quotation, 'final_amount', subtotal + cgst_amount + sgst_amount), str(subtotal + cgst_amount + sgst_amount))

    # Add Totals Rows
    def add_total_line(label, value_str, bold=False, highlight=False):
        row = table.add_row().cells
        # merge 0 to 4
        a = row[0]
        b = row[4]
        a.merge(b)
        _set_cell_margins(a, top=60, bottom=60, left=100, right=100)
        _set_cell_margins(row[5], top=60, bottom=60, left=100, right=100)
        p_lbl = a.paragraphs[0]
        p_lbl.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_lbl = p_lbl.add_run(label)
        r_lbl.bold = bold
        r_lbl.font.size = Pt(9)

        p_val = row[5].paragraphs[0]
        p_val.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_val = p_val.add_run(value_str)
        r_val.bold = bold
        r_val.font.size = Pt(9 if not highlight else 10)

        if highlight:
            _set_cell_background(a, "FEF08A")
            _set_cell_background(row[5], "FEF08A")

    add_total_line("SUB TOTAL:", f"₹ {subtotal:,.2f}", bold=True)
    if cgst_amount > 0:
        add_total_line(f"CGST ({cgst_rate}%):", f"₹ {cgst_amount:,.2f}")
        add_total_line(f"SGST ({sgst_rate}%):", f"₹ {sgst_amount:,.2f}")
    add_total_line("TOTAL AMOUNT:", f"₹ {final_amount:,.2f}", bold=True, highlight=True)

    # 7. Terms & Conditions and Bank Details
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    terms_box = doc.add_table(rows=1, cols=2)
    terms_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    terms_box.autofit = False

    t_left = terms_box.cell(0, 0)
    t_right = terms_box.cell(0, 1)
    t_left.width = Inches(4.3)
    t_right.width = Inches(2.77)

    # Terms on left
    p_t = t_left.paragraphs[0]
    p_t.paragraph_format.space_after = Pt(2)
    r_th = p_t.add_run("TERMS AND CONDITIONS:\n")
    r_th.bold = True
    r_th.font.size = Pt(8.5)

    custom_terms = getattr(quotation, 'terms_and_conditions', None)
    if custom_terms and custom_terms.strip():
        p_t.add_run(custom_terms.strip()).font.size = Pt(7.5)
    elif 'RENTAL' in job_desc or q_type == 'rental':
        rental_terms = (
            "NOTE:\n"
            "1. Transport is customer scope.\n"
            "2. Tax will be extra.\n"
            "3. 2 months rental amount deposit required.\n"
            "4. Rental period maximum 3 years required.\n\n"
            "TERMS & CONDITIONS:\n"
            "• Consumables are included in rental scope.\n"
            "• Machine maintenance and service spares included in our scope.\n"
            "• Only depreciation parts covered; broken parts due to misuse not covered.\n"
            "• Preventive maintenance once every two months.\n"
            "• Breakdown service provided within 24-48 hours.\n"
            "• Renter fully responsible for damage or missing parts.\n"
            "• Payment terms: 30 days from date of invoice submission."
        )
        p_t.add_run(rental_terms).font.size = Pt(7.5)
    elif 'cleantech' in company_code:
        cleantech_terms = (
            "TERMS & CONDITIONS:\n"
            "• Price Validity : Quoted prices are valid for 30 days from date of quotation.\n"
            "• Payment Terms : 100% ADVANCE\n"
            "• Delivery : Delivery within 1-2 working days from PO & payment.\n"
            "• Transportation Charges : Freight charges additional unless specified.\n"
            "• Installation : Basic installation/demo provided if applicable.\n"
            "• Warranty : Warranty 1 Year."
        )
        p_t.add_run(cleantech_terms).font.size = Pt(7.5)
    elif 'kleanmax' in company_code:
        kleanmax_terms = (
            "TERMS AND CONDITIONS:\n"
            "1. GST: PRICES ARE EXCLUSIVE OF GST (18%). GST WILL BE CHARGED EXTRA.\n"
            "2. RECLEANING POLICY: ONCE THE FLOOR IS HANDED OVER, ANY REQUEST FOR RECLEANING WILL BE SUBJECT TO ADDITIONAL CHARGES.\n"
            "3. UTILITIES: THE CLIENT MUST ARRANGE FOR WATER AND ELECTRICITY SUPPLY DURING THE SERVICE.\n"
            "4. WORKING AREA CLEARANCE: THE CLIENT IS RESPONSIBLE FOR CLEARING THE WORKING AREA.\n"
            "5. PAYMENT TERMS: A 50% ADVANCE PAYMENT IS REQUIRED. REMAINING BALANCE DUE UPON COMPLETION. NO CREDIT TERMS OFFERED.\n"
            "6. ADDITIONAL SERVICES: INFORM US IN ADVANCE IF ANY ADDITIONAL SERVICES ARE REQUIRED BEYOND THE SCOPE MENTIONED.\n\n"
            "YOUR SATISFACTION IS OUR GOAL. LOOKING FORWARD TO YOUR FAVORABLE ORDERS."
        )
        p_t.add_run(kleanmax_terms).font.size = Pt(7.5)
    else:
        default_terms = getattr(company, 'terms_and_conditions', None) or (
            "1. GST: Prices are exclusive of GST (18%). GST charged extra.\n"
            "2. Payment Terms: 100% advance or 50% advance & balance upon completion.\n"
            "3. Water and electricity required for service to be supplied by customer at site.\n"
            "4. Working Area Clearance: Client responsible for clearing working area.\n"
            "5. Validity: Rates valid for 30 days from quotation date."
        )
        p_t.add_run(default_terms).font.size = Pt(7.5)

    # Bank Details on right
    p_b = t_right.paragraphs[0]
    p_b.paragraph_format.space_after = Pt(2)
    r_bh = p_b.add_run("COMPANY'S BANK DETAILS:\n")
    r_bh.bold = True
    r_bh.font.size = Pt(8.5)

    # Dynamic bank details from DB (reflects Super Admin edits instantly)
    default_holder = 'CLEANTECH' if 'cleantech' in company_code else ('KLEAN MAX BANK' if 'kleanmax' in company_code else 'KLEAN MAX PRO')
    default_bank = 'IDFC BANK' if 'cleantech' in company_code else ('KVB BANK' if 'kleanmax' in company_code else 'ICICI BANK KMP')
    default_acc = '73388820361' if 'cleantech' in company_code else ('1278135000007113' if 'kleanmax' in company_code else '027505010327')
    default_branch = 'Chennai - Iyyapanthangal' if 'cleantech' in company_code else ('ASHOK NAGAR' if 'kleanmax' in company_code else 'PORUR')
    default_ifsc = 'IDFB0081831' if 'cleantech' in company_code else ('KVBL0001278' if 'kleanmax' in company_code else 'ICIC0000275')

    holder = (getattr(company, 'bank_account_name', None) or getattr(company, 'company_name', None) or default_holder).upper()
    bank_name = getattr(company, 'bank_name', None) or default_bank
    bank_acc = getattr(company, 'bank_account_no', None) or default_acc
    bank_branch = getattr(company, 'bank_branch', None) or default_branch
    bank_ifsc = getattr(company, 'bank_ifsc', None) or default_ifsc

    bank_text = (
        f"• A/c Holder: {holder}\n"
        f"• Bank Name: {bank_name}\n"
        f"• A/c No: {bank_acc}\n"
        f"• Branch & IFSC: {bank_branch} & {bank_ifsc}"
    )
    p_b.add_run(bank_text).font.size = Pt(7.5)

    # Signatory Block on LEFT
    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_sign.paragraph_format.space_before = Pt(14)
    p_sign.paragraph_format.space_after = Pt(2)

    comp_name = getattr(company, 'company_name', None) or ('Cleantech Services' if 'cleantech' in company_code else 'Klean Max Pro')
    r_for = p_sign.add_run(f"For {comp_name}\n\n\n")
    r_for.bold = True
    r_for.font.size = Pt(8.5)

    sig_name = getattr(quotation, 'signatory_name', None) or getattr(company, 'signatory_name', None) or "Mr. Manikandan Balamurugan"
    sig_desig = getattr(quotation, 'signatory_designation', None) or getattr(company, 'signatory_designation', None) or "Sales and Service Head"
    phone = getattr(company, 'phone1', None) or getattr(company, 'phone2', None) or "+91 73388 82036"

    r_sig = p_sign.add_run(f"{sig_name}\n")
    r_sig.bold = True
    r_sig.font.size = Pt(9.5)
    p_sign.add_run(f"{sig_desig}\n").font.size = Pt(8.5)
    p_sign.add_run(f"{phone}\n").font.size = Pt(7.5)
    r_auth = p_sign.add_run("Authorised Signatory")
    r_auth.bold = True
    r_auth.font.size = Pt(8)

    # Computer Notice
    p_notice = doc.add_paragraph()
    p_notice.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_notice.paragraph_format.space_before = Pt(10)
    p_notice.paragraph_format.space_after = Pt(4)
    r_notice = p_notice.add_run(
        f"This is a computer generated document and authenticated by {company.company_name if company else 'Klean Max Pro'}. "
        "Hence, it can be considered valid even if not signed manually."
    )
    r_notice.italic = True
    r_notice.font.size = Pt(7)
    r_notice.font.color.rgb = RGBColor(100, 116, 139)

    # Footer Banner Image if available
    footer_img_path = STATIC_DIR / "headers" / f"footer_{company_code}.png"
    if footer_img_path.exists():
        p_footer = doc.add_paragraph()
        p_footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_footer.paragraph_format.space_before = Pt(4)
        run_footer = p_footer.add_run()
        run_footer.add_picture(str(footer_img_path), width=Inches(7.07))

    if 'kleanmax' in company_code:
        p_ty = doc.add_paragraph()
        p_ty.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ty.paragraph_format.space_before = Pt(24)
        r_ty = p_ty.add_run("T H A N K   Y O U\n")
        r_ty.bold = True
        r_ty.font.size = Pt(15)
        r_ty.font.color.rgb = RGBColor(15, 23, 42)
        r_ty_sub = p_ty.add_run("KLEAN MAX • NO 6, B6, JAYAM INDUSTRIAL ESTATE, VANAGARAM, CHENNAI - 600077")
        r_ty_sub.font.size = Pt(8)
        r_ty_sub.font.color.rgb = RGBColor(100, 116, 139)

    # Save to buffer
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()
