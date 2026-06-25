export interface InvoiceMetadata {
    notes: string
    invoice_type: 'full' | 'dp' | 'settlement'
    dp_percent?: number
    dp_amount?: number
    parent_invoice_id?: number | null
}

export function parseInvoiceNotes(notesField: string | null): InvoiceMetadata {
    if (!notesField) {
        return { notes: '', invoice_type: 'full' }
    }
    try {
        const trimmed = notesField.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const parsed = JSON.parse(trimmed)
            if (typeof parsed === 'object' && parsed !== null) {
                return {
                    notes: parsed.notes || '',
                    invoice_type: parsed.invoice_type || 'full',
                    dp_percent: parsed.dp_percent !== undefined ? Number(parsed.dp_percent) : undefined,
                    dp_amount: parsed.dp_amount !== undefined ? Number(parsed.dp_amount) : undefined,
                    parent_invoice_id: parsed.parent_invoice_id || null
                }
            }
        }
    } catch (e) {
        // Fallback to plain text
    }
    return {
        notes: notesField,
        invoice_type: 'full'
    }
}

export function serializeInvoiceNotes(data: InvoiceMetadata): string {
    if (data.invoice_type === 'full') {
        return data.notes // Save as plain text if it's a standard invoice
    }
    return JSON.stringify({
        notes: data.notes,
        invoice_type: data.invoice_type,
        dp_percent: data.dp_percent,
        dp_amount: data.dp_amount,
        parent_invoice_id: data.parent_invoice_id,
    })
}
