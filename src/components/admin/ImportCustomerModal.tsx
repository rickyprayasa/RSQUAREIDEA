'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Loader2, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface ImportCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface ImportResult {
    success: boolean
    imported: number
    skipped: number
    total: number
    errors?: string[]
}

export default function ImportCustomerModal({ isOpen, onClose, onSuccess }: ImportCustomerModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<ImportResult | null>(null)
    const [csvData, setCsvData] = useState<Record<string, string>[]>([])
    const [fileName, setFileName] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setError('')
        setResult(null)

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string
                const lines = text.split('\n').filter(line => line.trim())
                
                if (lines.length < 2) {
                    setError('File CSV harus memiliki header dan minimal 1 baris data')
                    return
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
                const data: Record<string, string>[] = []

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
                    const row: Record<string, string> = {}
                    
                    headers.forEach((header, index) => {
                        row[header] = values[index] || ''
                    })
                    
                    if (row.name || row.nama || row.email) {
                        // Normalize field names
                        data.push({
                            name: row.name || row.nama || '',
                            email: row.email || '',
                            phone: row.phone || row.telepon || row.hp || '',
                            source: row.source || row.sumber || '',
                            products: row.products || row.produk || '',
                            notes: row.notes || row.catatan || '',
                            amount: row.amount || row.nominal || row.harga || '',
                        })
                    }
                }

                setCsvData(data)
            } catch (err) {
                setError('Gagal membaca file CSV')
                console.error(err)
            }
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        if (csvData.length === 0) {
            setError('Tidak ada data untuk diimport')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/customers/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customers: csvData }),
            })

            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || 'Gagal import data')

            setResult(data)
            
            if (data.imported > 0) {
                onSuccess()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setCsvData([])
        setFileName('')
        setError('')
        setResult(null)
        onClose()
    }

    const downloadTemplate = () => {
        const template = 'name,email,phone,source,products,notes,amount\nJohn Doe,john@example.com,081234567890,lynk_id,"Product A, Product B",Catatan pelanggan,150000'
        const blob = new Blob([template], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'template_import_pelanggan.csv'
        link.click()
        URL.revokeObjectURL(url)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Import Pelanggan</h3>
                                    <p className="text-sm text-gray-500">Upload file CSV</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            {result && (
                                <div className={`p-4 rounded-xl ${result.imported > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {result.imported > 0 ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                        )}
                                        <span className={`font-medium ${result.imported > 0 ? 'text-green-700' : 'text-amber-700'}`}>
                                            Hasil Import
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-700">Total data: {result.total}</p>
                                        <p className="text-green-600">Berhasil: {result.imported}</p>
                                        {result.skipped > 0 && (
                                            <p className="text-amber-600">Dilewati: {result.skipped}</p>
                                        )}
                                    </div>
                                    {result.errors && result.errors.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Error:</p>
                                            {result.errors.map((err, i) => (
                                                <p key={i} className="text-xs text-red-600">{err}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!result && (
                                <>
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <h4 className="font-medium text-blue-800 mb-2">Format CSV</h4>
                                        <p className="text-sm text-blue-700 mb-2">
                                            File CSV harus memiliki kolom berikut (header di baris pertama):
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {['name', 'email', 'phone', 'source', 'products', 'notes', 'amount'].map((col) => (
                                                <code key={col} className="px-2 py-0.5 bg-white rounded text-xs text-blue-600">
                                                    {col}
                                                </code>
                                            ))}
                                        </div>
                                        <button
                                            onClick={downloadTemplate}
                                            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download template CSV
                                        </button>
                                    </div>

                                    <label className="block cursor-pointer">
                                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                            fileName ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                        }`}>
                                            {fileName ? (
                                                <>
                                                    <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                                    <p className="font-medium text-green-700">{fileName}</p>
                                                    <p className="text-sm text-green-600 mt-1">
                                                        {csvData.length} data ditemukan
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="font-medium text-gray-700">Klik untuk upload file CSV</p>
                                                    <p className="text-sm text-gray-500 mt-1">atau drag & drop</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>

                                    {csvData.length > 0 && (
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Preview ({Math.min(3, csvData.length)} dari {csvData.length}):</p>
                                            <div className="space-y-2">
                                                {csvData.slice(0, 3).map((row, i) => (
                                                    <div key={i} className="text-xs bg-white p-2 rounded-lg">
                                                        <span className="font-medium">{row.name}</span>
                                                        <span className="text-gray-400 mx-1">-</span>
                                                        <span className="text-gray-600">{row.email}</span>
                                                        {row.source && (
                                                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                                {row.source}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 text-gray-700 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    {result ? 'Tutup' : 'Batal'}
                                </button>
                                {!result && (
                                    <button
                                        onClick={handleImport}
                                        disabled={loading || csvData.length === 0}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Mengimport...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5" />
                                                Import {csvData.length} Data
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
