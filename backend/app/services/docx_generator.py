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

    company_code = (getattr(company, 'company_code', None) or 'kleanmaxpro').lower()

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

    # Signatory Block
    p_sign = doc.add_paragraph()
    p_sign.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sign.paragraph_format.space_before = Pt(14)
    p_sign.paragraph_format.space_after = Pt(2)

    r_for = p_sign.add_run(f"For {company.company_name if company else 'Klean Max Pro'}\n\n\n")
    r_for.bold = True
    r_for.font.size = Pt(8.5)

    sig_name = "Mr. Manikandan" if "kleanmax" in company_code or "cleantech" in company_code else "Admin / Project Manager"
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

    # Save to buffer
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()
