import { PaymentForm } from '@/components/admin/PaymentForm'

export default function NewPaymentPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tambah Metode Pembayaran</h1>
                <p className="text-gray-500 mt-1">Tambahkan opsi pembayaran baru</p>
            </div>
            
            <PaymentForm />
        </div>
    )
}
