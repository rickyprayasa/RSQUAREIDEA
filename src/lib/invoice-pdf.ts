import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { RSQUARE_LOGO_BASE64 } from './logo-base64'
import { RSQUARE_QR_BASE64 } from './qrcode-base64'

interface InvoiceItem {
    name: string
    qty: number
    price: number
}

interface PaymentMethod {
    name: string
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
}

interface InvoiceData {
    invoice_number: string
    customer_name: string
    customer_email: string
    customer_phone: string | null
    description: string | null
    app_type: string | null
    items: InvoiceItem[]
    subtotal: number
    tax_percent: number
    tax_amount: number
    discount: number
    total: number
    status: string
    due_date: string | null
    notes: string | null
    terms_conditions: string | null
    created_at: string
}

const COMPANY = {
    name: 'RSQUARE',
    tagline: 'Solusi Digital & Otomatisasi Bisnis',
    address: 'Bumi Arum Regency Blok Akasia no.21',
    city: 'Rancaekek, Bandung 40394',
    country: 'Indonesia',
    phone: '+62 856 5967 4001',
    email: 'info@rsquareidea.my.id',
    website: 'www.rsquareidea.my.id',
    websiteUrl: 'https://rsquareidea.my.id',
}

const COLORS = {
    primary: [249, 115, 22] as [number, number, number],
    primaryDark: [234, 88, 12] as [number, number, number],
    dark: [31, 41, 55] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [243, 244, 246] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    tableHeader: [31, 41, 55] as [number, number, number],
    tableBorder: [209, 213, 219] as [number, number, number],
}

const DEFAULT_TERMS = `1. Pembayaran dilakukan sesuai nominal yang tertera pada invoice ini.
2. Invoice ini berlaku sebagai bukti penagihan resmi.
3. Pekerjaan akan dimulai setelah pembayaran diterima.
4. Revisi minor termasuk dalam paket layanan (maks. 2x revisi).
5. Free maintenance sesuai paket layanan yang dipilih.`

function formatRupiah(amount: number): string {
    return 'Rp ' + amount.toLocaleString('id-ID')
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export { DEFAULT_TERMS }

export function generateInvoicePDF(invoice: InvoiceData, paymentMethods: PaymentMethod[] = []): Buffer {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    const colRight = pageWidth / 2 + 10
    let y = 0

    // ============================================================
    // DYNAMIC HEADER SHAPES
    // ============================================================
    // Create an elegant corner polygon shape on top right
    doc.setFillColor(...COLORS.primary)
    // Base orange polygon
    doc.triangle(pageWidth - 90, 0, pageWidth, 0, pageWidth, 40, 'F')

    // Dark overlay polygon
    doc.setFillColor(...COLORS.dark)
    doc.triangle(pageWidth - 65, 0, pageWidth, 0, pageWidth, 28, 'F')

    // Top flat bar to extend leftwards slightly
    doc.setFillColor(...COLORS.primary)
    doc.rect(0, 0, pageWidth - 80, 4, 'F')
    doc.setFillColor(...COLORS.dark)
    doc.rect(0, 4, pageWidth - 100, 2, 'F')

    y = 18

    // ============================================================
    // HEADER — Logo + Company Info (Letterhead left)
    // ============================================================
    // Logo
    try {
        doc.addImage(RSQUARE_LOGO_BASE64, 'PNG', margin, y, 16, 16)
    } catch {
        // Fallback
    }

    // Company name
    doc.setTextColor(...COLORS.dark)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('RSQUARE', margin + 20, y + 7)

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    doc.text(COMPANY.tagline, margin + 20, y + 12)

    // Company contact details just below the name/logo
    const companyInfoY = y + 25
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.dark)
    doc.text(COMPANY.address, margin, companyInfoY)
    doc.text(COMPANY.city, margin, companyInfoY + 4)
    doc.setTextColor(...COLORS.gray)
    doc.text(`${COMPANY.phone} | ${COMPANY.email}`, margin, companyInfoY + 8)

    // ============================================================
    // INVOICE TITLE & INFO (Right side)
    // ============================================================
    // We position this cleanly below the corner shapes
    const invoiceBoxY = y + 10

    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.dark)
    doc.text('INVOICE', pageWidth - margin, invoiceBoxY, { align: 'right' })

    // Invoice Number
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.dark)
    doc.text(invoice.invoice_number, pageWidth - margin, invoiceBoxY + 8, { align: 'right' })

    // Important Dates
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    doc.text('Tanggal:', pageWidth - margin - 35, invoiceBoxY + 16, { align: 'left' })
    doc.setTextColor(...COLORS.dark)
    doc.setFont('helvetica', 'bold')
    doc.text(formatDate(invoice.created_at), pageWidth - margin, invoiceBoxY + 16, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    doc.text('Jatuh Tempo:', pageWidth - margin - 35, invoiceBoxY + 21, { align: 'left' })
    doc.setTextColor(...COLORS.dark)
    doc.setFont('helvetica', 'bold')
    doc.text(formatDate(invoice.due_date), pageWidth - margin, invoiceBoxY + 21, { align: 'right' })

    // ============================================================
    // CUSTOMER INFO
    // ============================================================
    y = companyInfoY + 20

    doc.setFillColor(249, 250, 251)
    doc.rect(margin, y, contentWidth, 26, 'F')

    // Left border accent
    doc.setFillColor(...COLORS.primary)
    doc.rect(margin, y, 2, 26, 'F')

    const custStartY = y + 8

    doc.setTextColor(...COLORS.gray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('KEPADA', margin + 8, custStartY)

    doc.setTextColor(...COLORS.dark)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(invoice.customer_name, margin + 8, custStartY + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.gray)
    doc.text(invoice.customer_email, margin + 8, custStartY + 11)
    if (invoice.customer_phone) {
        doc.text(invoice.customer_phone, margin + 8, custStartY + 15)
    }

    // App type (right side within the box)
    if (invoice.app_type) {
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...COLORS.gray)
        doc.text('TIPE PROJECT', colRight, custStartY)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...COLORS.dark)
        doc.text(invoice.app_type, colRight, custStartY + 6)
    }

    y += 34

    // ============================================================
    // ITEMS TABLE 
    // ============================================================
    const tableData = invoice.items.map((item, idx) => [
        String(idx + 1),
        item.name,
        String(item.qty),
        formatRupiah(item.price),
        formatRupiah(item.qty * item.price),
    ])

    autoTable(doc, {
        startY: y,
        head: [['No', 'Deskripsi Item', 'Qty', 'Harga Satuan', 'Jumlah']],
        body: tableData,
        theme: 'grid',
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        styles: {
            lineColor: COLORS.tableBorder,
            lineWidth: 0.1,
            fontSize: 9,
            cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
            valign: 'middle',
        },
        headStyles: {
            fillColor: COLORS.tableHeader,
            textColor: COLORS.white,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 6, bottom: 6, left: 4, right: 4 },
            halign: 'center',
            lineColor: COLORS.tableHeader,
        },
        bodyStyles: {
            textColor: COLORS.dark,
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251],
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 14, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8

    // ============================================================
    // TOTALS SECTION — right-aligned
    // ============================================================
    const totalsX = pageWidth - margin - 85
    const totalsW = 85
    const labelX = totalsX + 2
    const valueX = totalsX + totalsW - 2

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    doc.text('Subtotal', labelX, y + 5)
    doc.setTextColor(...COLORS.dark)
    doc.text(formatRupiah(invoice.subtotal), valueX, y + 5, { align: 'right' })

    let totalY = y + 5

    if (invoice.tax_percent > 0) {
        totalY += 6
        doc.setTextColor(...COLORS.gray)
        doc.text(`Pajak (${invoice.tax_percent}%)`, labelX, totalY)
        doc.setTextColor(...COLORS.dark)
        doc.text(formatRupiah(invoice.tax_amount), valueX, totalY, { align: 'right' })
    }

    if (invoice.discount > 0) {
        totalY += 6
        doc.setTextColor(...COLORS.gray)
        doc.text('Diskon', labelX, totalY)
        doc.setTextColor(239, 68, 68)
        doc.text('- ' + formatRupiah(invoice.discount), valueX, totalY, { align: 'right' })
    }

    totalY += 6

    // Total decorative bar
    doc.setFillColor(...COLORS.primary)
    doc.rect(totalsX, totalY, totalsW, 10, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.white)
    doc.text('TOTAL', labelX + 2, totalY + 7)
    doc.text(formatRupiah(invoice.total), valueX - 2, totalY + 7, { align: 'right' })

    y = totalY + 20

    // ============================================================
    // NOTES (if any)
    // ============================================================
    if (invoice.notes) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...COLORS.primaryDark)
        doc.text('Catatan Pelanggan:', margin, y)

        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...COLORS.dark)
        const noteLines = doc.splitTextToSize(invoice.notes, contentWidth)
        doc.text(noteLines, margin, y + 5)
        y += 5 + noteLines.length * 4.5 + 8
    }

    // ============================================================
    // BOTTOM AREA: METODE PEMBAYARAN, T&C, QR
    // Without border cards, clean flat design
    // ============================================================
    // Separator line
    doc.setDrawColor(...COLORS.tableBorder)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    const colWidth = (contentWidth - 10) / 3

    // Column 1 & 2 combined for T&C and Payment info
    const leftBlockW = colWidth * 2

    // -- Payment Method --
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primaryDark)
    doc.text('Metode Pembayaran', margin, y)

    let pmY = y + 5

    if (paymentMethods.length > 0) {
        paymentMethods.forEach((pm, idx) => {
            const bankLabel = pm.bankName || pm.name
            doc.setFontSize(8.5)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...COLORS.dark)
            doc.text(`${idx + 1}. ${bankLabel}`, margin, pmY)
            pmY += 4
            if (pm.accountNumber) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...COLORS.gray)
                doc.text(`No. Rek: ${pm.accountNumber}`, margin + 4, pmY)
                pmY += 3.5
            }
            if (pm.accountName) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.setTextColor(...COLORS.gray)
                doc.text(`A/N: ${pm.accountName}`, margin + 4, pmY)
                pmY += 6
            }
        })
    } else {
        doc.setFontSize(8.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...COLORS.dark)
        doc.text('Hubungi kami untuk info pembayaran.', margin, pmY + 2)
        pmY += 8
    }

    // -- Terms & Conditions (Below Payment Method) --
    const termsY = pmY + 4
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primaryDark)
    doc.text('Syarat & Ketentuan', margin, termsY)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    const termsText = invoice.terms_conditions || DEFAULT_TERMS
    const termsLines = doc.splitTextToSize(termsText, leftBlockW)
    doc.text(termsLines, margin, termsY + 5)

    // -- Column 3: Customer Care & QR Code --
    const col3X = pageWidth - margin - colWidth

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primaryDark)
    doc.text('Customer Care', col3X, y)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.dark)
    doc.text(`WA: ${COMPANY.phone}`, col3X, y + 5)
    doc.text(`Email: ${COMPANY.email}`, col3X, y + 10)
    doc.text(`Web: ${COMPANY.website}`, col3X, y + 15)

    // Real QR Code Image
    const qrY = y + 22
    const qrSize = 32
    try {
        doc.addImage(RSQUARE_QR_BASE64, 'PNG', col3X, qrY, qrSize, qrSize)
    } catch {
        // Safe fallback
        doc.setFillColor(243, 244, 246)
        doc.rect(col3X, qrY, qrSize, qrSize, 'F')
    }

    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.dark)
    doc.text('SCAN UNTUK INFO LEBIH', col3X + qrSize / 2, qrY + qrSize + 4, { align: 'center' })

    // ============================================================
    // ENHANCED FOOTER SHAPES
    // ============================================================
    // Bottom left corner shapes
    doc.setFillColor(...COLORS.primary)
    doc.triangle(0, pageHeight - 35, 0, pageHeight, 80, pageHeight, 'F')

    doc.setFillColor(...COLORS.dark)
    doc.triangle(0, pageHeight - 20, 0, pageHeight, 45, pageHeight, 'F')

    // Bottom right corner shapes (smaller)
    doc.setFillColor(...COLORS.gray)
    doc.triangle(pageWidth - 40, pageHeight, pageWidth, pageHeight - 20, pageWidth, pageHeight, 'F')

    doc.setFillColor(...COLORS.primaryDark)
    doc.rect(0, pageHeight - 3, pageWidth, 3, 'F')

    // Centered Footer Text
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.gray)
    doc.text(`© ${new Date().getFullYear()} ${COMPANY.name}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(COMPANY.tagline, pageWidth / 2, pageHeight - 6, { align: 'center' })

    // Return
    const arrayBuffer = doc.output('arraybuffer')
    return Buffer.from(arrayBuffer)
}
