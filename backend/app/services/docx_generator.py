import os
import io
from pathlib import Path
from decimal import Decimal
from typing import List, Optional
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

STATIC_DIR = Path(__file__).parent.parent / "static"


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
    """Generates an authentic 3-page quotation document for Unique Painters.
    Features equal balanced margins, letterhead header on Page 1 ONLY,
    and neat professional table formatting.
    """
    doc = docx.Document()
    header_img = STATIC_DIR / "headers" / "header_uniquepainters.png"
    if not header_img.exists():
        header_img = STATIC_DIR / "unique_painters" / "header_sec0_image1.jpeg"

    # Balanced, equal corner margins: 0.7 inches on all sides
    sec = doc.sections[0]
    sec.top_margin = Inches(0.65)
    sec.bottom_margin = Inches(0.65)
    sec.left_margin = Inches(0.7)
    sec.right_margin = Inches(0.7)
    sec.page_width = Inches(8.27)
    sec.page_height = Inches(11.69)

    # Clear header paragraphs so header banner is in body on Page 1 alone
    for p in sec.header.paragraphs:
        p.text = ""

    # ==================== PAGE 1 ====================
    # 1. Header Banner Image (Page 1 ONLY, centered, equal corner margins)
    if os.path.exists(header_img):
        p_hdr = doc.add_paragraph()
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_hdr.paragraph_format.space_before = Pt(0)
        p_hdr.paragraph_format.space_after = Pt(12)
        r_hdr = p_hdr.add_run()
        r_hdr.add_picture(str(header_img), width=Inches(6.87))

    # 2. Quotation Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(10)
    r_t = p_title.add_run("SURFACE COATING & PAINTING PROPOSAL")
    r_t.bold = True
    r_t.underline = True
    r_t.font.size = Pt(13)
    r_t.font.name = "Arial"
    r_t.font.color.rgb = RGBColor(15, 23, 42)

    # 3. Meta Table (To & Date) - Equal 2-Column Grid
    meta_tbl = doc.add_table(rows=1, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_tbl.autofit = False
    c_left, c_right = meta_tbl.cell(0, 0), meta_tbl.cell(0, 1)
    c_left.width = Inches(4.3)
    c_right.width = Inches(2.57)

    # Left: Client Address ("TO :-")
    p_to = c_left.paragraphs[0]
    p_to.paragraph_format.space_before = Pt(0)
    p_to.paragraph_format.space_after = Pt(2)
    p_to.paragraph_format.line_spacing = 1.15

    r = p_to.add_run("To,\n")
    r.bold = True
    r.font.size = Pt(11)
    r.font.name = "Arial"

    c_name = (getattr(customer, 'company_name', None) or 'TRUE NUTRITION').upper()
    r = p_to.add_run(f"{c_name}\n")
    r.bold = True
    r.font.size = Pt(11.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    addr_parts = []
    if getattr(customer, 'billing_address_line1', None):
        addr_parts.append(customer.billing_address_line1)
    if getattr(customer, 'billing_city', None):
        addr_parts.append(customer.billing_city)
    addr_str = ", ".join(addr_parts) if addr_parts else "KODUNGAIYUR"
    r = p_to.add_run(f"{addr_str}\n")
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(51, 65, 85)

    c_phone = getattr(customer, 'phone', None) or "07676131368"
    r = p_to.add_run(f"Contact: {c_phone}\n\n")
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(51, 65, 85)

    r = p_to.add_run("DEAR SIR;")
    r.bold = True
    r.font.size = Pt(11)
    r.font.name = "Arial"

    # Right: Date & Quotation No
    p_date = c_right.paragraphs[0]
    p_date.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_date.paragraph_format.space_before = Pt(0)
    p_date.paragraph_format.space_after = Pt(2)
    p_date.paragraph_format.line_spacing = 1.25

    q_date = getattr(quotation, 'quotation_date', None) or ""
    if hasattr(q_date, 'strftime'):
        q_date = q_date.strftime('%d/%m/%Y')
    else:
        q_date = str(q_date) if q_date else "21/10/2025"
    q_num = getattr(quotation, 'quotation_number', None) or "UNP/2026/001"

    r = p_date.add_run("DATE: ")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r = p_date.add_run(f"{q_date}\n")
    r.font.size = Pt(10.5)
    r.font.name = "Arial"

    r = p_date.add_run("QUOTATION NO: ")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r = p_date.add_run(f"{q_num}\n")
    r.font.size = Pt(10.5)
    r.font.name = "Arial"

    # 4. Introductory Paragraphs
    p_intro1 = doc.add_paragraph()
    p_intro1.paragraph_format.space_before = Pt(8)
    p_intro1.paragraph_format.space_after = Pt(4)
    p_intro1.paragraph_format.line_spacing = 1.2
    r = p_intro1.add_run(
        "We are glad to inform you that we are in the Painting and Cleaning industry for the past 12 years "
        "and we do Interior and exterior painting, wall graphics, 3D paintings, starting from 900 to 100000 Sq. "
        "using traditional and latest technology Unifying Expertise."
    )
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(30, 41, 59)

    p_intro2 = doc.add_paragraph()
    p_intro2.paragraph_format.space_before = Pt(2)
    p_intro2.paragraph_format.space_after = Pt(10)
    p_intro2.paragraph_format.line_spacing = 1.2
    r = p_intro2.add_run(
        "After a through survey of your site we are herewith submitting our proposal for the painting of your above property."
    )
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(30, 41, 59)

    # 5. Neat Proposal Table (Equal Page Margin Width: 6.87 in)
    col_widths = [Inches(0.6), Inches(4.67), Inches(1.60)]
    tbl = doc.add_table(rows=1, cols=3)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False

    # Header Row
    headers = ["S. No", "Description", "Amount in INR"]
    hdr_cells = tbl.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].width = col_widths[i]
        _set_cell_background(hdr_cells[i], "1E293B")
        _set_cell_margins(hdr_cells[i], top=120, bottom=120, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else (WD_ALIGN_PARAGRAPH.RIGHT if i == 2 else WD_ALIGN_PARAGRAPH.LEFT)
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(10)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(255, 255, 255)

    sections_list = sections or []
    items_list = items or []
    subtotal = Decimal(str(getattr(quotation, 'subtotal', 0)))
    final_amount = Decimal(str(getattr(quotation, 'final_amount', subtotal)))

    data_rows = []
    if sections_list:
        for idx, s in enumerate(sections_list, 1):
            title = (s.section_name or "INTERIOR WALL PAINTING").upper()
            svc = (s.service_name or "ASIAN PAINT TRACTOR EMULSION").upper()
            notes = getattr(s, 'notes', '') or ""
            dim_str = ""
            if s.billable_area:
                dim_str = f"Area: {Decimal(str(s.billable_area)):,.0f} sq.ft @ Rs.{Decimal(str(s.applied_rate)):,.2f} / sq.ft"
            amt = Decimal(str(s.line_total or 0))
            data_rows.append((idx, title, svc, notes, dim_str, amt))
    elif items_list:
        for idx, itm in enumerate(items_list, 1):
            title = itm.item_name.upper()
            desc = itm.description or ""
            amt = Decimal(str(itm.line_total or 0))
            data_rows.append((idx, title, "", desc, "", amt))
    else:
        title = "INTERIOR WALL PAINTING"
        svc = "ASIAN PAINT TRACTOR EMULSION"
        notes = "APPLY TWO CODE PREMIER EMULSION SHYNE INTERIOR WALLS CEILING WALL PUTTY AREA TWO CODE"
        dim_str = "Area: 4,200 sq.ft @ Rs.22.14 / sq.ft"
        data_rows.append((1, title, svc, notes, dim_str, final_amount or Decimal("93000")))

    # Populate Data Rows
    for idx, title, svc, notes, dim_str, amt in data_rows:
        row_cells = tbl.add_row().cells
        for c_i in range(3):
            row_cells[c_i].width = col_widths[c_i]
            _set_cell_margins(row_cells[c_i], top=100, bottom=100, left=120, right=120)
            if idx % 2 == 0:
                _set_cell_background(row_cells[c_i], "F8FAFC")

        # Col 0: S. No
        p_idx = row_cells[0].paragraphs[0]
        p_idx.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p_idx.add_run(f"{idx}.")
        r.bold = True
        r.font.size = Pt(10)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(71, 85, 105)

        # Col 1: Description
        p_desc = row_cells[1].paragraphs[0]
        p_desc.paragraph_format.line_spacing = 1.2
        p_desc.paragraph_format.space_after = Pt(2)

        r_title = p_desc.add_run(f"{title}")
        r_title.bold = True
        r_title.font.size = Pt(10)
        r_title.font.name = "Arial"
        r_title.font.color.rgb = RGBColor(15, 23, 42)

        if svc:
            r_svc = p_desc.add_run(f": {svc}\n")
            r_svc.bold = True
            r_svc.font.size = Pt(9.5)
            r_svc.font.name = "Arial"
            r_svc.font.color.rgb = RGBColor(88, 28, 135)
        else:
            p_desc.add_run("\n")

        if notes:
            r_notes = p_desc.add_run(f"{notes}\n")
            r_notes.font.size = Pt(8.5)
            r_notes.font.name = "Arial"
            r_notes.font.color.rgb = RGBColor(71, 85, 105)

        if dim_str:
            r_dim = p_desc.add_run(f"{dim_str}")
            r_dim.bold = True
            r_dim.font.size = Pt(8.5)
            r_dim.font.name = "Arial"
            r_dim.font.color.rgb = RGBColor(124, 58, 237)

        # Col 2: Amount in INR
        p_amt = row_cells[2].paragraphs[0]
        p_amt.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p_amt.add_run(f"RS.{amt:,.0f}" if amt == amt.to_integral() else f"RS.{amt:,.2f}")
        r.bold = True
        r.font.size = Pt(10.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(15, 23, 42)

    # Total Project Value Row
    tot_row = tbl.add_row().cells
    tot_row[0].width = col_widths[0]
    tot_row[1].width = col_widths[1]
    tot_row[2].width = col_widths[2]
    _set_cell_background(tot_row[0], "F3E8FF")
    _set_cell_background(tot_row[1], "F3E8FF")
    _set_cell_background(tot_row[2], "F3E8FF")
    _set_cell_margins(tot_row[0], top=100, bottom=100, left=120, right=120)
    _set_cell_margins(tot_row[1], top=100, bottom=100, left=120, right=120)
    _set_cell_margins(tot_row[2], top=100, bottom=100, left=120, right=120)

    p_t1 = tot_row[1].paragraphs[0]
    p_t1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_t1.add_run("TOTAL PROJECT VALUE :")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    p_t2 = tot_row[2].paragraphs[0]
    p_t2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_t2.add_run(f"RS.{final_amount:,.0f}" if final_amount == final_amount.to_integral() else f"RS.{final_amount:,.2f}")
    r.bold = True
    r.font.size = Pt(11)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    # ==================== PAGE 2 (NO HEADER BANNER) ====================
    doc.add_page_break()

    # Machineries Heading
    p_m_title = doc.add_paragraph()
    p_m_title.paragraph_format.space_before = Pt(12)
    p_m_title.paragraph_format.space_after = Pt(8)
    r = p_m_title.add_run("List of Machineries and consumables")
    r.bold = True
    r.underline = True
    r.font.size = Pt(12)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    machineries = [
        "Airless Sprayer with latest technology",
        "Sanding Machine",
        "Vacuum Cleaner",
        "Putty blades",
        "Sanding paper",
        "Leveling tool",
        "Ladders or Scissor Lift",
        "Banian waste",
        "Metal paste",
        "Wall putty",
        "Primer",
        "Thinner",
        "Brush and rollers",
        "Masking papers",
        "Safety equipment.",
    ]

    for m in machineries:
        p_m = doc.add_paragraph()
        p_m.paragraph_format.space_before = Pt(1)
        p_m.paragraph_format.space_after = Pt(1)
        p_m.paragraph_format.left_indent = Inches(0.25)
        r = p_m.add_run(f"•  {m}")
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(30, 41, 59)

    # Call note
    p_call = doc.add_paragraph()
    p_call.paragraph_format.space_before = Pt(10)
    p_call.paragraph_format.space_after = Pt(12)
    r = p_call.add_run("Looking forward for your favourable orders. Please call - 9500065813 / 9710148218.")
    r.font.size = Pt(10)
    r.bold = True
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    # Terms & Conditions Heading
    p_tc_title = doc.add_paragraph()
    p_tc_title.paragraph_format.space_before = Pt(6)
    p_tc_title.paragraph_format.space_after = Pt(6)
    r = p_tc_title.add_run("Terms & Conditions")
    r.bold = True
    r.underline = True
    r.font.size = Pt(12)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(15, 23, 42)

    terms = [
        "GST 18% Extra",
        "50% Payment in Advance and the balance on completion of work.",
        "Water and power supply to be provided by you.",
        "Apart from the above mentioned jobs, if yours require additional services Please inform before the issuing work order.",
        "Scaffolding charges will Extra",
    ]

    for t in terms:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(1)
        p_t.paragraph_format.space_after = Pt(1)
        p_t.paragraph_format.left_indent = Inches(0.25)
        r = p_t.add_run(f"•  {t}")
        r.font.size = Pt(9.5)
        r.font.name = "Arial"
        r.font.color.rgb = RGBColor(30, 41, 59)

    # Satisfaction statement
    p_sat = doc.add_paragraph()
    p_sat.paragraph_format.space_before = Pt(10)
    p_sat.paragraph_format.space_after = Pt(16)
    r = p_sat.add_run("Your satisfaction is our Goal. Looking forward for your favourable orders.")
    r.font.size = Pt(10)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(30, 41, 59)

    # Signatory block table
    sig_tbl = doc.add_table(rows=1, cols=2)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_tbl.autofit = False
    s_left, s_right = sig_tbl.cell(0, 0), sig_tbl.cell(0, 1)
    s_left.width = Inches(4.3)
    s_right.width = Inches(2.57)

    p_sl = s_left.paragraphs[0]
    p_sl.paragraph_format.space_after = Pt(2)
    p_sl.paragraph_format.line_spacing = 1.2

    r = p_sl.add_run("Regards\n")
    r.font.size = Pt(10.5)
    r.font.name = "Arial"

    r = p_sl.add_run("Unique Painters\n\n")
    r.bold = True
    r.font.size = Pt(11.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(88, 28, 135)

    r = p_sl.add_run("K. SRIDHAR\n")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"

    r = p_sl.add_run("Operations Head\n")
    r.font.size = Pt(9.5)
    r.font.name = "Arial"

    r = p_sl.add_run("9710148218 / 7338882034")
    r.font.size = Pt(9.5)
    r.font.name = "Arial"

    p_sr = s_right.paragraphs[0]
    p_sr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sr.paragraph_format.space_after = Pt(2)
    p_sr.paragraph_format.line_spacing = 1.2

    r = p_sr.add_run("\nClient Signature\n\n\n\n______________________")
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.name = "Arial"

    # ==================== PAGE 3 (NO HEADER BANNER) ====================
    doc.add_page_break()

    p_f1 = doc.add_paragraph()
    p_f1.paragraph_format.space_before = Pt(12)
    p_f1.paragraph_format.space_after = Pt(8)
    r = p_f1.add_run("UPCOMING OUR FUTURE TECHNOLOGY; 3D WALL PRINTING MACHINE:")
    r.bold = True
    r.underline = True
    r.font.size = Pt(11.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(124, 58, 237)

    # 3D Wall Printing Images Table
    img_tbl1 = doc.add_table(rows=1, cols=2)
    img_tbl1.alignment = WD_TABLE_ALIGNMENT.CENTER
    img_tbl1.autofit = False
    c1, c2 = img_tbl1.cell(0, 0), img_tbl1.cell(0, 1)
    c1.width = Inches(3.43)
    c2.width = Inches(3.43)

    img_w1 = STATIC_DIR / "unique_painters" / "wall_printing_machine_1.jpeg"
    img_w2 = STATIC_DIR / "unique_painters" / "wall_printing_machine_2.jpeg"
    if img_w1.exists():
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.add_run().add_picture(str(img_w1), width=Inches(3.2))
    if img_w2.exists():
        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.add_run().add_picture(str(img_w2), width=Inches(3.2))

    p_f2 = doc.add_paragraph()
    p_f2.paragraph_format.space_before = Pt(16)
    p_f2.paragraph_format.space_after = Pt(8)
    r = p_f2.add_run("ROBOTIC PLASTERING AND PAINTING MACHINE ;")
    r.bold = True
    r.underline = True
    r.font.size = Pt(11.5)
    r.font.name = "Arial"
    r.font.color.rgb = RGBColor(124, 58, 237)

    img_tbl2 = doc.add_table(rows=1, cols=2)
    img_tbl2.alignment = WD_TABLE_ALIGNMENT.CENTER
    img_tbl2.autofit = False
    c3, c4 = img_tbl2.cell(0, 0), img_tbl2.cell(0, 1)
    c3.width = Inches(3.43)
    c4.width = Inches(3.43)

    img_r1 = STATIC_DIR / "unique_painters" / "robotic_plastering_1.jpeg"
    img_r2 = STATIC_DIR / "unique_painters" / "robotic_plastering_2.jpeg"
    if img_r1.exists():
        p3 = c3.paragraphs[0]
        p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p3.add_run().add_picture(str(img_r1), width=Inches(3.2))
    if img_r2.exists():
        p4 = c4.paragraphs[0]
        p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p4.add_run().add_picture(str(img_r2), width=Inches(3.2))

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

            row_cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[2].paragraphs[0].add_run(f"{Decimal(str(itm.quantity)):.2f}").font.size = Pt(8.5)

            row_cells[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[3].paragraphs[0].add_run(str(itm.uom).upper()).font.size = Pt(8.5)

            row_cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            row_cells[4].paragraphs[0].add_run(f"{Decimal(str(itm.unit_price)):,.2f}").font.size = Pt(8.5)

            row_cells[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r_total = row_cells[5].paragraphs[0].add_run(f"{Decimal(str(itm.line_total)):,.2f}")
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
            row_cells[3].paragraphs[0].add_run(f"{Decimal(str(sec.billable_area)):,.1f} sq.ft").font.size = Pt(8.5)

            row_cells[4].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            row_cells[4].paragraphs[0].add_run(f"{Decimal(str(sec.applied_rate)):,.2f}").font.size = Pt(8.5)

            row_cells[5].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r_total = row_cells[5].paragraphs[0].add_run(f"{Decimal(str(sec.line_total)):,.2f}")
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

        fallback_subtotal = Decimal(str(getattr(quotation, 'subtotal', 0)))
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
    subtotal = Decimal(str(getattr(quotation, 'subtotal', 0)))
    cgst_rate = Decimal(str(getattr(quotation, 'cgst_rate', 9)))
    cgst_amount = Decimal(str(getattr(quotation, 'cgst_amount', 0)))
    sgst_rate = Decimal(str(getattr(quotation, 'sgst_rate', 9)))
    sgst_amount = Decimal(str(getattr(quotation, 'sgst_amount', 0)))
    final_amount = Decimal(str(getattr(quotation, 'final_amount', subtotal + cgst_amount + sgst_amount)))

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

    if 'RENTAL' in job_desc or q_type == 'rental':
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

    if 'cleantech' in company_code:
        bank_text = (
            "• A/c Holder: CLEANTECH\n"
            "• Bank Name: IDFC BANK\n"
            "• A/c No: 73388820361\n"
            "• Branch & IFSC: Chennai - Iyyapanthangal & IDFB0081831"
        )
    elif 'kleanmax' in company_code:
        bank_text = (
            "• A/c Holder: KLEAN MAX BANK\n"
            "• Bank Name: KVB BANK A/C 1278135000007113\n"
            "• A/c No: 1278135000007113\n"
            "• Branch & IFSC: ASHOK NAGAR & KVBL0001278"
        )
    else:
        bank_name = getattr(company, 'bank_name', 'HDFC Bank') or 'HDFC Bank'
        bank_acc = getattr(company, 'bank_account_no', '50200088991122') or '50200088991122'
        bank_ifsc = getattr(company, 'bank_ifsc', 'HDFC0001234') or 'HDFC0001234'
        bank_branch = getattr(company, 'bank_branch', 'Chennai Branch') or 'Chennai Branch'
        holder = getattr(company, 'company_name', 'KLEAN MAX PRO').upper()
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

    if 'cleantech' in company_code:
        r_for = p_sign.add_run("For Clean tech\n\n\n")
        r_for.bold = True
        r_for.font.size = Pt(8.5)
        r_sig = p_sign.add_run("Mr. Manikandan Balamurugan\n")
        r_sig.bold = True
        r_sig.font.size = Pt(9)
        p_sign.add_run("Sales and Service Head\n").font.size = Pt(8)
        p_sign.add_run("+91 7338882036\n").font.size = Pt(7.5)
        r_auth = p_sign.add_run("Authorised Signatory")
        r_auth.bold = True
        r_auth.font.size = Pt(8)
    else:
        r_for = p_sign.add_run(f"For {company.company_name if company else 'Klean Max Pro'}\n\n\n")
        r_for.bold = True
        r_for.font.size = Pt(8.5)

        sig_name = "Mr. Manikandan" if "kleanmax" in company_code else "Admin / Project Manager"
        r_sig = p_sign.add_run(f"{sig_name}\n")
        r_sig.bold = True
        r_sig.font.size = Pt(9)
        p_sign.add_run("Authorized Signatory\n").font.size = Pt(8)
        p_sign.add_run(f"+91 7338882036 / {getattr(company, 'phone1', '') or ''}").font.size = Pt(7.5)

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
