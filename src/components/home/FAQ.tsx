'use client'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
    {
        question: "Apakah saya perlu berlangganan bulanan?",
        answer: "Tidak! Semua template RSQUARE adalah sekali bayar (one-time purchase). Kamu bisa menggunakannya selamanya tanpa biaya tambahan.",
    },
    {
        question: "Apakah template ini bisa digunakan di Excel?",
        answer: "Template kami dirancang khusus untuk Google Sheets untuk memanfaatkan fitur kolaborasi dan otomatisasi online. Beberapa fitur mungkin tidak berjalan sempurna jika diekspor ke Excel.",
    },
    {
        question: "Bagaimana jika saya butuh bantuan?",
        answer: "Setiap pembelian dilengkapi dengan panduan video lengkap. Jika masih ada kendala, tim support kami siap membantu melalui WhatsApp atau Email.",
    },
    {
        question: "Apakah saya bisa request fitur tambahan?",
        answer: "Tentu! Kami menyediakan layanan kustomisasi template dengan biaya tambahan sesuai tingkat kesulitan request Kamu.",
    },
    {
        question: "Apakah data saya aman?",
        answer: "Sangat aman. Template ini berjalan di akun Google Drive Kamu sendiri. Kami tidak memiliki akses ke data yang Kamu input.",
    },
]

export function FAQ() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
                    <p className="text-gray-600">
                        Jawaban untuk pertanyaan yang sering diajukan oleh pengguna kami.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left text-lg font-medium text-gray-900 hover:text-orange-600">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
