'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardStack } from '@/components/home/CardStack'

interface Template {
    _id: string
    title: string
    slug: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isFeatured?: boolean
    downloadUrl?: string
    demoUrl?: string
}

interface TemplateSectionProps {
    title: string
    subtitle: string
    templates: Template[]
    viewAllLink: string
    bgClass?: string
}

export function TemplateSection({ title, subtitle, templates, viewAllLink, bgClass = "bg-white" }: TemplateSectionProps) {
    return (
        <section className="py-16 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
                </div>

                {/* Card Stack Layout */}
                <CardStack templates={templates} />

                {/* View All Button */}
                <div className="text-center mt-6">
                    <Button asChild variant="outline" size="lg" className="px-8">
                        <Link href={viewAllLink}>
                            Lihat Semua Template
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
