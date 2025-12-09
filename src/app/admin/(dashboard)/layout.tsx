import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getSession()
    
    if (!user) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="lg:pl-64">
                <AdminHeader user={user} />
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
