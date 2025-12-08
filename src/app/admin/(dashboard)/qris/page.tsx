import { redirect } from 'next/navigation'

export default function QRISPage() {
    redirect('/admin/orders?filter=pending_confirmation')
}
