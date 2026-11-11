import re
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import date
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, get_optional_current_user, require_roles
from backend.app.models.all_models import (
    Quotation, Customer, Profile, CompanySetting, QuotationSection, QuotationItem
)
from backend.app.schemas.quotation import (
    QuotationCreate, QuotationUpdate, QuotationResponse,
    RevisionCreateRequest, QuotationSectionSchema, QuotationItemSchema
)
from backend.app.services.calculator import (
    calculate_quotation_totals, QuotationCalculationRequest,
    QuotationCalculationResult
)
from backend.app.services.quotation_service import (
    create_quotation, update_quotation, transition_status, create_revision
)
from backend.app.services.pdf_generator import (
    render_quotation_html, generate_pdf_bytes_async
)
from backend.app.services.docx_generator import generate_quotation_docx_bytes

router = APIRouter(prefix="/quotations", tags=["Quotations"])



logger = logging.getLogger(__name__)


@router.post("/calculate", response_model=QuotationCalculationResult)
def calculate_quotation(
    req: QuotationCalculationRequest,
    current_user: Profile = Depends(get_current_user)
):
    """Authoritative live financial and area calculation endpoint."""
    try:
        return calculate_quotation_totals(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/next-number")
def get_next_quotation_number_endpoint(
    company_code: str = Query("kleanmaxpro"),
    format_style: str = Query("short"),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    company = db.query(CompanySetting).filter(CompanySetting.company_code == company_code).first()
    prefix = company.quotation_prefix if company and company.quotation_prefix else ("KM" if company_code == "kleanmax" else "KMP")
    if company_code == "kleanmax" and (not prefix or prefix == "KLM"):
        prefix = "KM"
    prefix = prefix.strip().upper()
    
    # Calculate next sequence safely by scanning all existing quotation numbers
    existing_records = db.query(Quotation.quotation_number).filter(Quotation.company_code == company_code).all()
    max_seq = 0
    for (q_num,) in existing_records:
        if q_num:
            matches = re.findall(r'(\d+)', q_num)
            if matches:
                try:
                    val = int(matches[-1])
                    if val > max_seq:
                        max_seq = val
                except ValueError:
                    pass

    next_seq = max(max_seq + 1, len(existing_records) + 1, 1)

    from backend.app.services.numbering import get_current_fiscal_year
    fy = get_current_fiscal_year()
    while True:
        candidate = f"{prefix}/{next_seq:04d}" if format_style == "short" else f"{prefix}/{fy}/{next_seq:04d}"
        if not db.query(Quotation.id).filter(Quotation.quotation_number == candidate).first():
            next_number = candidate
            break
        next_seq += 1
        
    return {
        "company_code": company_code,
        "prefix": prefix,
        "next_sequence": next_seq,
        "next_number": next_number
    }


@router.get("", response_model=List[QuotationResponse])
def get_quotations(
    search: Optional[str] = Query(None, description="Search quotation number, customer name, notes"),
    status: Optional[str] = Query(None, description="Filter by status: draft, pending_approval, approved, issued, revised, cancelled"),
    company_code: Optional[str] = Query(None, description="Filter by company_code: kleanmaxpro, kleanmax, uniquepainters, cleantech"),
    customer_id: Optional[str] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    query = db.query(Quotation).join(Customer)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Quotation.quotation_number.ilike(search_pattern),
                Customer.company_name.ilike(search_pattern),
                Quotation.notes.ilike(search_pattern),
                Quotation.customer_ref.ilike(search_pattern),
            )
        )

    if status:
        query = query.filter(Quotation.status == status)

    if company_code:
        query = query.filter(Quotation.company_code == company_code)

    if customer_id:
        query = query.filter(Quotation.customer_id == customer_id)

    if from_date:
        query = query.filter(Quotation.quotation_date >= from_date)

    if to_date:
        query = query.filter(Quotation.quotation_date <= to_date)

    quotations = query.order_by(Quotation.created_at.desc()).offset(offset).limit(limit).all()

    # Populate helper fields for response
    results = []
    for q in quotations:
        res = QuotationResponse.model_validate(q)
        res.prepared_by_name = q.prepared_by.full_name if q.prepared_by else None
        res.approved_by_name = q.approved_by.full_name if q.approved_by else None
        results.append(res)
    return results


@router.post("", response_model=QuotationResponse)
def create_new_quotation(
    data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = create_quotation(db, data, current_user)
    res = QuotationResponse.model_validate(quotation)
    res.prepared_by_name = quotation.prepared_by.full_name if quotation.prepared_by else None
    return res


@router.get("/{id}", response_model=QuotationResponse)
def get_quotation(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = db.query(Quotation).filter(Quotation.id == id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    res = QuotationResponse.model_validate(quotation)
    res.prepared_by_name = quotation.prepared_by.full_name if quotation.prepared_by else None
    res.approved_by_name = quotation.approved_by.full_name if quotation.approved_by else None
    return res


@router.patch("/{id}", response_model=QuotationResponse)
def update_existing_quotation(
    id: str,
    data: QuotationUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = update_quotation(db, id, data, current_user)
    res = QuotationResponse.model_validate(quotation)
    res.prepared_by_name = quotation.prepared_by.full_name if quotation.prepared_by else None
    return res


@router.post("/{id}/submit", response_model=QuotationResponse)
def submit_quotation_for_approval(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = transition_status(db, id, "submit", current_user)
    res = QuotationResponse.model_validate(quotation)
    return res


@router.post("/{id}/approve", response_model=QuotationResponse)
def approve_quotation(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = transition_status(db, id, "approve", current_user)
    res = QuotationResponse.model_validate(quotation)
    return res


@router.post("/{id}/issue", response_model=QuotationResponse)
def issue_quotation(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = transition_status(db, id, "issue", current_user)
    res = QuotationResponse.model_validate(quotation)
    return res


@router.post("/{id}/cancel", response_model=QuotationResponse)
def cancel_quotation(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    quotation = transition_status(db, id, "cancel", current_user)
    res = QuotationResponse.model_validate(quotation)
    return res


@router.post("/{id}/revise", response_model=QuotationResponse)
def revise_quotation(
    id: str,
    req: RevisionCreateRequest,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    new_rev = create_revision(db, id, req, current_user)
    res = QuotationResponse.model_validate(new_rev)
    return res


@router.get("/{id}/html", response_class=HTMLResponse)
def view_quotation_html(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_current_user)
):
    try:
        quotation = db.query(Quotation).filter(Quotation.id == id).first()
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")

        company = None
        if quotation.company_code:
            company = db.query(CompanySetting).filter(CompanySetting.company_code == quotation.company_code).first()
        if not company:
            company = db.query(CompanySetting).first()
        if not company:
            company = CompanySetting()

        html = render_quotation_html(
            quotation=quotation,
            company=company,
            customer=quotation.customer,
            sections=quotation.sections,
            items=quotation.items,
        )
        return HTMLResponse(content=html, status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error rendering quotation HTML preview for {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to render quotation preview: {str(e)}")


@router.get("/{id}/pdf")
async def download_quotation_pdf(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_current_user)
):
    quotation = db.query(Quotation).filter(Quotation.id == id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    company = None
    if quotation.company_code:
        company = db.query(CompanySetting).filter(CompanySetting.company_code == quotation.company_code).first()
    if not company:
        company = db.query(CompanySetting).first()
    if not company:
        company = CompanySetting()

    try:
        html = render_quotation_html(
            quotation=quotation,
            company=company,
            customer=quotation.customer,
            sections=quotation.sections,
            items=quotation.items,
        )

        pdf_bytes = await generate_pdf_bytes_async(html)
        clean_no = re.sub(r'[\/\\?%*:|"<> ]', '_', quotation.quotation_number)
        filename = f"Quotation_{clean_no}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.exception(f"Error generating PDF for {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")


@router.get("/{id}/docx")
def download_quotation_docx(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_current_user)
):
    try:
        quotation = db.query(Quotation).filter(Quotation.id == id).first()
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")

        company = None
        if quotation.company_code:
            company = db.query(CompanySetting).filter(CompanySetting.company_code == quotation.company_code).first()
        if not company:
            company = db.query(CompanySetting).first()
        if not company:
            company = CompanySetting()

        docx_bytes = generate_quotation_docx_bytes(
            quotation=quotation,
            company=company,
            customer=quotation.customer,
            sections=quotation.sections,
            items=quotation.items,
        )
        clean_no = re.sub(r'[\/\\?%*:|"<> ]', '_', quotation.quotation_number)
        filename = f"Quotation_{clean_no}.docx"

        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error generating Word (.docx) for quotation {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Word document: {str(e)}")


@router.delete("/{id}")
def delete_quotation_endpoint(
    id: str,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(require_roles(["admin", "super_admin"]))
):
    """Only Super Admin can delete a quotation."""
    quotation = db.query(Quotation).filter(Quotation.id == id).first()
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Clean up associated items and sections
    db.query(QuotationItem).filter(QuotationItem.quotation_id == id).delete()
    db.query(QuotationSection).filter(QuotationSection.quotation_id == id).delete()
    db.delete(quotation)
    db.commit()

    return {"message": "Quotation deleted successfully", "id": id}
