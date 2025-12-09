'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export const ClientPortal = ({ children, selector }: { children: React.ReactNode; selector: string }) => {
    const [mounted, setMounted] = useState(false)
    const [element, setElement] = useState<HTMLElement | null>(null)

    useEffect(() => {
        setMounted(true)
        setElement(document.querySelector(selector) as HTMLElement)
        return () => setMounted(false)
    }, [selector])

    return mounted && element ? createPortal(children, element) : null
}
