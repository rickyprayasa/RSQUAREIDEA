import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="sticky top-0 z-50">
                <Header />
                <AnnouncementBar />
            </div>
            <main className="min-h-screen">{children}</main>
            <Footer />
            <ScrollToTop />
        </>
    )
}
