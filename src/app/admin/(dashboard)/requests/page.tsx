'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    FileSpreadsheet,
    Clock,
    Check,
    X,
    Loader2,
    User,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    FileText,
    Play,
    XCircle,
    Trash2,
    Receipt,
    Package,
    Send,
    ExternalLink,
    Download,
    Sparkles,
    Copy
} from 'lucide-react'
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

interface TemplateRequest {
    id: number
    name: string
    email: string
    phone: string | null
    template_name: string
    description: string | null
    budget: string | null
    deadline: string | null
    status: 'pending' | 'in_progress' | 'completed' | 'rejected'
    admin_notes: string | null
    service_type?: string | null
    company?: string | null
    created_at: string
    prd_content?: string | null
    proposal_content?: string | null
}

interface RequestInvoice {
    id: number
    invoice_number: string
    status: string
    total: number
    delivery_status: string
}

const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    in_progress: { label: 'Dikerjakan', color: 'bg-blue-100 text-blue-700', icon: Play },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-700', icon: Check },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function RequestsPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<TemplateRequest[]>([])
    const [invoiceMap, setInvoiceMap] = useState<Record<number, RequestInvoice[]>>({})
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<TemplateRequest | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'rejected'>('all')
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; request: TemplateRequest | null }>({ isOpen: false, request: null })

    // Deliver modal state
    const [showDeliver, setShowDeliver] = useState(false)
    const [deliverForm, setDeliverForm] = useState({ delivery_url: '', delivery_file_url: '', message: '' })
    const [deliverLoading, setDeliverLoading] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

    // PRD State
    const [prdContent, setPrdContent] = useState<string>('')
    const [isGeneratingPrd, setIsGeneratingPrd] = useState(false)
    const [showPrdModal, setShowPrdModal] = useState(false)

    // Proposal State
    const [proposalContent, setProposalContent] = useState<string>('')
    const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
    const [showProposalModal, setShowProposalModal] = useState(false)
    const [isSendingProposal, setIsSendingProposal] = useState(false)
    const [showSendProposalModal, setShowSendProposalModal] = useState(false)
    const [sendProposalForm, setSendProposalForm] = useState({ email: '' })



    useEffect(() => {
        fetchRequests()
        fetchInvoices()
    }, [])

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
    }

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/requests')
            const data = await res.json()
            if (data.requests) setRequests(data.requests)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/admin/request-invoices')
            const data = await res.json()
            if (data.invoices) {
                const map: Record<number, RequestInvoice[]> = {}
                for (const inv of data.invoices) {
                    if (inv.request_id) {
                        if (!map[inv.request_id]) map[inv.request_id] = []
                        map[inv.request_id].push(inv)
                    }
                }
                setInvoiceMap(map)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await fetch('/api/admin/requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            })
            await fetchRequests()
            setSelectedRequest(null)
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const openDeleteModal = (req: TemplateRequest, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleteModal({ isOpen: true, request: req })
    }

    const deleteRequest = async () => {
        if (!deleteModal.request) return
        setDeletingId(deleteModal.request.id)
        try {
            const res = await fetch(`/api/admin/requests/${deleteModal.request.id}`, { method: 'DELETE' })
            if (res.ok) {
                await fetchRequests()
                setDeleteModal({ isOpen: false, request: null })
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setDeletingId(null)
        }
    }

    const handleCreateInvoice = (req: TemplateRequest) => {
        sessionStorage.setItem('prefill_invoice', JSON.stringify({
            request_id: req.id,
            customer_name: req.name,
            customer_email: req.email,
            customer_phone: req.phone || '',
            description: req.template_name + (req.description ? ' - ' + req.description : ''),
        }))
        router.push('/admin/invoices?create=1')
    }

    const handleDeliverApp = async () => {
        if (!selectedRequest) return
        const invoices = invoiceMap[selectedRequest.id]
        const invoiceId = invoices?.[0]?.id

        if (!invoiceId) {
            showToast('Buat invoice terlebih dahulu sebelum kirim aplikasi', 'error')
            return
        }

        setDeliverLoading(true)
        try {
            const res = await fetch('/api/admin/request-invoices/deliver', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId,
                    deliveryUrl: deliverForm.delivery_url || null,
                    deliveryFileUrl: deliverForm.delivery_file_url || null,
                    message: deliverForm.message || null,
                }),
            })
            if (res.ok) {
                showToast('Aplikasi berhasil dikirim ke pelanggan!', 'success')
                setShowDeliver(false)
                setDeliverForm({ delivery_url: '', delivery_file_url: '', message: '' })
                setSelectedRequest(null)
                await fetchInvoices()
            } else {
                const d = await res.json()
                showToast(d.error || 'Gagal mengirim aplikasi', 'error')
            }
        } catch {
            showToast('Gagal mengirim aplikasi', 'error')
        } finally {
            setDeliverLoading(false)
        }
    }

    const [isSavingDraft, setIsSavingDraft] = useState(false)

    const handleSaveDraft = async (docType: 'prd' | 'proposal', content: string) => {
        if (!selectedRequest) return
        setIsSavingDraft(true)
        try {
            const res = await fetch('/api/admin/requests/save-doc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    docType,
                    content
                })
            })
            if (res.ok) {
                showToast(`Draf ${docType.toUpperCase()} berhasil disimpan!`, 'success')
                // Update local state
                setSelectedRequest(prev => prev ? {
                    ...prev,
                    [docType === 'prd' ? 'prd_content' : 'proposal_content']: content
                } : null)
                // Also update the requests array
                setRequests(prev => prev.map(r => r.id === selectedRequest.id ? {
                    ...r,
                    [docType === 'prd' ? 'prd_content' : 'proposal_content']: content
                } : r))
            } else {
                showToast(`Gagal menyimpan draf`, 'error')
            }
        } catch {
            showToast('Terjadi kesalahan saat menyimpan', 'error')
        } finally {
            setIsSavingDraft(false)
        }
    }

    const handleGeneratePrd = async (forceRegenerate = false) => {
        if (!selectedRequest) return

        if (!forceRegenerate && selectedRequest.prd_content) {
            setPrdContent(selectedRequest.prd_content)
            setShowPrdModal(true)
            return
        }

        setIsGeneratingPrd(true)
        setPrdContent('')
        
        try {
            const res = await fetch('/api/ai/generate-prd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    template_name: selectedRequest.template_name,
                    description: selectedRequest.description,
                    budget: selectedRequest.budget,
                    deadline: selectedRequest.deadline,
                    service_type: selectedRequest.service_type
                })
            })
            
            const data = await res.json()
            if (data.success && data.prd) {
                setPrdContent(data.prd)
                setShowPrdModal(true)
                showToast('PRD berhasil dibuat dengan AI!', 'success')
                
                // Update local request object
                setSelectedRequest(prev => prev ? { ...prev, prd_content: data.prd } : null)
                setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, prd_content: data.prd } : r))
            } else {
                showToast(data.error || 'Gagal membuat PRD', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat memanggil AI', 'error')
        } finally {
            setIsGeneratingPrd(false)
        }
    }

    const handleCopyPrd = () => {
        if (!prdContent) return
        navigator.clipboard.writeText(prdContent)
        showToast('PRD disalin ke clipboard', 'success')
    }

    const handleDownloadPrd = () => {
        if (!prdContent || !selectedRequest) return
        const element = document.createElement('a')
        const file = new Blob([prdContent], { type: 'text/markdown' })
        element.href = URL.createObjectURL(file)
        const fileName = `PRD_${selectedRequest.template_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`
        element.download = fileName
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const handleCopyProposal = async () => {
        if (!proposalContent) return
        try {
            const htmlBlob = new Blob([proposalContent], { type: 'text/html' });
            const textBlob = new Blob([proposalContent.replace(/<[^>]*>?/gm, '')], { type: 'text/plain' });
            const data = [new ClipboardItem({ 
                'text/html': htmlBlob,
                'text/plain': textBlob
            })];
            await navigator.clipboard.write(data);
            showToast('Proposal disalin ke clipboard', 'success');
        } catch (err) {
            navigator.clipboard.writeText(proposalContent);
            showToast('Proposal disalin ke clipboard', 'success');
        }
    }

    const handleDownloadProposal = () => {
        if (!proposalContent || !selectedRequest) return
        const element = document.createElement('a')
        const file = new Blob([proposalContent], { type: 'text/markdown' })
        element.href = URL.createObjectURL(file)
        const fileName = `Proposal_${selectedRequest.template_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`
        element.download = fileName
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const handleGenerateProposal = async (forceRegenerate = false) => {
        if (!selectedRequest) return

        if (!forceRegenerate && selectedRequest.proposal_content) {
            setProposalContent(selectedRequest.proposal_content)
            setShowProposalModal(true)
            return
        }

        setIsGeneratingProposal(true)
        setProposalContent('')
        
        try {
            const res = await fetch('/api/admin/requests/generate-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    templateName: selectedRequest.template_name,
                    description: selectedRequest.description,
                    serviceType: selectedRequest.service_type,
                    email: selectedRequest.email
                })
            })
            
            const data = await res.json()
            if (res.ok && data.proposal) {
                setProposalContent(data.proposal)
                setShowProposalModal(true)
                showToast('Proposal berhasil disusun!', 'success')

                // Update local state
                setSelectedRequest(prev => prev ? { ...prev, proposal_content: data.proposal } : null)
                setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, proposal_content: data.proposal } : r))
            } else {
                showToast(data.error || 'Gagal menyusun proposal', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat memanggil AI', 'error')
        } finally {
            setIsGeneratingProposal(false)
        }
    }

    const handleOpenSendProposalModal = () => {
        if (!selectedRequest) return
        setSendProposalForm({ email: selectedRequest.email })
        setShowSendProposalModal(true)
    }

    const handleSendProposal = async () => {
        if (!selectedRequest || !proposalContent) return
        
        if (!sendProposalForm.email) {
            showToast('Email tujuan harus diisi', 'error')
            return
        }

        setIsSendingProposal(true)
        
        try {
            const res = await fetch('/api/admin/requests/send-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    proposalContent: proposalContent,
                    recipientEmail: sendProposalForm.email,
                    recipientName: selectedRequest.name
                })
            })
            
            const data = await res.json()
            if (res.ok && data.success) {
                showToast('Proposal berhasil dikirim ke email!', 'success')
                setShowSendProposalModal(false)
            } else {
                showToast(data.error || 'Gagal mengirim proposal', 'error')
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat mengirim email', 'error')
        } finally {
            setIsSendingProposal(false)
        }
    }


    const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter)
    const pendingCount = requests.filter(r => r.status === 'pending').length

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {toast.message}
                </motion.div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Request Template</h1>
                        {pendingCount > 0 && (
                            <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
                                {pendingCount} Pending
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1">Kelola permintaan template kustom</p>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
                {(['all', 'pending', 'in_progress', 'completed', 'rejected'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {f === 'all' && 'Semua'}
                        {f === 'pending' && `Menunggu (${requests.filter(r => r.status === 'pending').length})`}
                        {f === 'in_progress' && 'Dikerjakan'}
                        {f === 'completed' && 'Selesai'}
                        {f === 'rejected' && 'Ditolak'}
                    </button>
                ))}
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <FileSpreadsheet className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Request</h3>
                    <p className="text-gray-500">Permintaan template kustom akan muncul di sini</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map((req) => {
                        const status = statusConfig[req.status]
                        const StatusIcon = status.icon
                        const reqInvoices = invoiceMap[req.id] || []
                        const hasInvoice = reqInvoices.length > 0
                        const isDelivered = reqInvoices.some(i => i.delivery_status === 'delivered')

                        return (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-2xl border p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${req.status === 'pending' ? 'border-yellow-300' : 'border-gray-200'
                                    }`}
                                onClick={() => setSelectedRequest(req)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-gray-900">{req.template_name}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </span>
                                            {hasInvoice && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                                                    <Receipt className="h-3 w-3" />
                                                    Invoice
                                                </span>
                                            )}
                                            {isDelivered && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                                                    <Package className="h-3 w-3" />
                                                    Terkirim
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{req.name} • {req.email}</p>
                                        {req.description && (
                                            <p className="text-gray-600 text-sm line-clamp-2">{req.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {req.budget && (
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        {req.budget}
                                                    </span>
                                                )}
                                                {req.deadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {req.deadline}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(req.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => openDeleteModal(req, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequest && !showDeliver && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Detail Request</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">Template yang Diminta</label>
                                    <p className="text-lg font-bold text-orange-600">{selectedRequest.template_name}</p>
                                    {selectedRequest.service_type && (
                                        <p className="text-sm font-medium text-gray-600 mt-1">
                                            Jenis Aplikasi: <span className="text-indigo-600 font-semibold">{
                                                selectedRequest.service_type === 'sheets' ? 'Google Sheets' :
                                                selectedRequest.service_type === 'webapp' ? 'Google Web App' :
                                                selectedRequest.service_type === 'fullstack' ? 'Full Stack Dev' :
                                                selectedRequest.service_type === 'consultation' ? 'Konsultasi' :
                                                selectedRequest.service_type
                                            }</span>
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{selectedRequest.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{selectedRequest.email}</span>
                                    </div>
                                    {selectedRequest.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">{selectedRequest.phone}</span>
                                        </div>
                                    )}
                                    {selectedRequest.budget && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">{selectedRequest.budget}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedRequest.description && (
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm text-gray-500 flex items-center gap-1">
                                                <FileText className="h-4 w-4" /> Deskripsi
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleGenerateProposal}
                                                    disabled={isGeneratingProposal}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    {isGeneratingProposal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                                                    {isGeneratingProposal ? 'Menyusun...' : 'Proposal Klien'}
                                                </button>
                                                <button
                                                    onClick={handleGeneratePrd}
                                                    disabled={isGeneratingPrd}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    {isGeneratingPrd ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                                    {isGeneratingPrd ? 'Menyusun...' : 'PRD Internal'}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="p-4 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap">
                                            {selectedRequest.description}
                                        </p>

                                        {((selectedRequest.prd_content && !showPrdModal) || (selectedRequest.proposal_content && !showProposalModal)) && (
                                            <div className="mt-3 flex justify-end gap-2">
                                                {selectedRequest.proposal_content && !showProposalModal && (
                                                    <button
                                                        onClick={() => {
                                                            setProposalContent(selectedRequest.proposal_content!);
                                                            setShowProposalModal(true);
                                                        }}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                                    >
                                                        <Mail className="h-4 w-4" /> Buka Proposal yang Tersimpan
                                                    </button>
                                                )}
                                                {selectedRequest.prd_content && !showPrdModal && (
                                                    <button
                                                        onClick={() => {
                                                            setPrdContent(selectedRequest.prd_content!);
                                                            setShowPrdModal(true);
                                                        }}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                                    >
                                                        <Sparkles className="h-4 w-4" /> Buka PRD yang Tersimpan
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Invoice Info */}
                                {invoiceMap[selectedRequest.id] && invoiceMap[selectedRequest.id].length > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-1.5">
                                            <Receipt className="h-4 w-4" /> Invoice Terkait
                                        </p>
                                        {invoiceMap[selectedRequest.id].map(inv => (
                                            <div key={inv.id} className="flex items-center justify-between text-sm">
                                                <span className="text-orange-700 font-medium">{inv.invoice_number}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-orange-600">Rp {(inv.total || 0).toLocaleString('id-ID')}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {inv.status === 'paid' ? 'Lunas' : inv.status === 'sent' ? 'Terkirim' : 'Draft'}
                                                    </span>
                                                    {inv.delivery_status === 'delivered' && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                            Dikirim
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Status Actions */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        <Play className="h-5 w-5" />
                                        Mulai Kerjakan
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                    >
                                        <Check className="h-5 w-5" />
                                        Selesai
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Invoice & Delivery Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleCreateInvoice(selectedRequest)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        <Receipt className="h-5 w-5" />
                                        Buat Invoice
                                    </button>
                                    <button
                                        onClick={() => setShowDeliver(true)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                                    >
                                        <Package className="h-5 w-5" />
                                        Kirim Aplikasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Deliver App Modal */}
            {showDeliver && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Kirim Aplikasi</h2>
                                <button onClick={() => setShowDeliver(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                                Kirim link/file aplikasi ke <strong>{selectedRequest.name}</strong> ({selectedRequest.email})
                            </p>

                            {!(invoiceMap[selectedRequest.id]?.length) && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                                    ⚠️ Belum ada invoice untuk request ini. Buat invoice terlebih dahulu agar bisa mengirim aplikasi.
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Aplikasi (URL)</label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="https://app.example.com"
                                            value={deliverForm.delivery_url}
                                            onChange={e => setDeliverForm(prev => ({ ...prev, delivery_url: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Download File</label>
                                    <div className="relative">
                                        <Download className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="https://storage.example.com/file.zip"
                                            value={deliverForm.delivery_file_url}
                                            onChange={e => setDeliverForm(prev => ({ ...prev, delivery_file_url: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesan (opsional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Instruksi penggunaan..."
                                        value={deliverForm.message}
                                        onChange={e => setDeliverForm(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDeliver(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeliverApp}
                                    disabled={deliverLoading || (!deliverForm.delivery_url && !deliverForm.delivery_file_url) || !(invoiceMap[selectedRequest.id]?.length)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium disabled:opacity-50"
                                >
                                    {deliverLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Kirim ke Email
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, request: null })}
                onConfirm={deleteRequest}
                title="Hapus Request"
                message="Apakah Anda yakin ingin menghapus request template ini?"
                itemName={deleteModal.request?.template_name}
                isDeleting={deletingId !== null}
            />

            {/* Fullscreen PRD Preview Modal */}
            {showPrdModal && prdContent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    Hasil Generate PRD
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedRequest?.template_name}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleSaveDraft('prd', prdContent)}
                                    disabled={isSavingDraft}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Simpan Draf
                                </button>
                                <button
                                    onClick={() => handleGeneratePrd(true)}
                                    disabled={isGeneratingPrd}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingPrd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Buat Ulang
                                </button>
                                <button
                                    onClick={handleCopyPrd}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
                                    title="Salin Teks"
                                >
                                    <Copy className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleDownloadPrd}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                >
                                    <Download className="h-4 w-4" /> Download .md
                                </button>
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={() => setShowPrdModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-0 bg-gray-50 overflow-hidden">
                            <textarea
                                readOnly
                                value={prdContent}
                                className="w-full h-full p-6 text-[14px] leading-relaxed font-mono text-gray-800 bg-transparent resize-none focus:outline-none"
                            />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Fullscreen Proposal Preview Modal */}
            {showProposalModal && proposalContent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-orange-500" />
                                    Proposal Klien
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedRequest?.template_name}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleSaveDraft('proposal', proposalContent)}
                                    disabled={isSavingDraft}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Simpan Draf
                                </button>
                                <button
                                    onClick={() => handleGenerateProposal(true)}
                                    disabled={isGeneratingProposal}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isGeneratingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Buat Ulang
                                </button>
                                <button
                                    onClick={handleCopyProposal}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
                                    title="Salin Teks"
                                >
                                    <Copy className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleDownloadProposal}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                >
                                    <Download className="h-4 w-4" /> Download .md
                                </button>
                                <button
                                    onClick={handleOpenSendProposalModal}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
                                >
                                    <Send className="h-4 w-4" />
                                    Kirim ke Email
                                </button>
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={() => setShowProposalModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-0 bg-white overflow-y-auto">
                            <RichTextEditor
                                content={proposalContent}
                                onChange={setProposalContent}
                                editable={true}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
            
            {/* Send Proposal Confirm Modal */}
            {showSendProposalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Send className="h-5 w-5 text-orange-500" />
                                Kirim Proposal Klien
                            </h3>
                            <button
                                onClick={() => setShowSendProposalModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Proposal akan dikirim ke alamat email berikut. Anda dapat mengubahnya jika ingin mengirimkan tes ke email Anda sendiri terlebih dahulu.
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Tujuan</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={sendProposalForm.email}
                                        onChange={e => setSendProposalForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                        placeholder="nama@email.com"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSendProposalModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSendProposal}
                                    disabled={isSendingProposal || !sendProposalForm.email}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium disabled:opacity-50 transition-colors"
                                >
                                    {isSendingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    Kirim Sekarang
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
