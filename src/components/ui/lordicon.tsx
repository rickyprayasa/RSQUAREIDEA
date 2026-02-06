'use client'

import React, { useEffect, useState } from 'react'

// Icon JSON imports - We'll use CDN URLs for simplicity
const ICON_URLS: Record<string, string> = {
    // Navigation & Actions
    'arrow-right': 'https://cdn.lordicon.com/whtfgdfm.json',
    'arrow-left': 'https://cdn.lordicon.com/zmkotitn.json',
    'external-link': 'https://cdn.lordicon.com/ercyvufy.json',

    // E-commerce
    'shopping-cart': 'https://cdn.lordicon.com/pbrgppbb.json',
    'shopping-bag': 'https://cdn.lordicon.com/cosvjkbu.json',
    'credit-card': 'https://cdn.lordicon.com/qmcsqnle.json',
    'discount': 'https://cdn.lordicon.com/ternnbni.json',

    // Communication
    'mail': 'https://cdn.lordicon.com/diihvcfp.json',
    'phone': 'https://cdn.lordicon.com/srsgifqc.json',
    'message': 'https://cdn.lordicon.com/fdxqrdfe.json',
    'send': 'https://cdn.lordicon.com/ternnbni.json',

    // Media
    'play': 'https://cdn.lordicon.com/becebamh.json',
    'youtube': 'https://cdn.lordicon.com/aklfruoc.json',
    'video': 'https://cdn.lordicon.com/aklfruoc.json',

    // Features & Status
    'sparkles': 'https://cdn.lordicon.com/hvueufdo.json',
    'star': 'https://cdn.lordicon.com/mdgrhyca.json',
    'check': 'https://cdn.lordicon.com/oqdmuxru.json',
    'verified': 'https://cdn.lordicon.com/egiwmiit.json',

    // Business
    'chart': 'https://cdn.lordicon.com/gqdnbnwt.json',
    'trending-up': 'https://cdn.lordicon.com/yxyampao.json',
    'zap': 'https://cdn.lordicon.com/akqsdstj.json',
    'bolt': 'https://cdn.lordicon.com/akqsdstj.json',

    // UI Elements
    'menu': 'https://cdn.lordicon.com/eouimtlu.json',
    'close': 'https://cdn.lordicon.com/nqtddedc.json',
    'plus': 'https://cdn.lordicon.com/zrkkrrpl.json',
    'minus': 'https://cdn.lordicon.com/hwuyodym.json',
    'search': 'https://cdn.lordicon.com/kkvxgpti.json',

    // Help & Support
    'help': 'https://cdn.lordicon.com/ujxzdfjx.json',
    'question': 'https://cdn.lordicon.com/ujxzdfjx.json',
    'info': 'https://cdn.lordicon.com/yqzmiobz.json',

    // Files & Documents
    'file': 'https://cdn.lordicon.com/wloilxuq.json',
    'spreadsheet': 'https://cdn.lordicon.com/wloilxuq.json',
    'download': 'https://cdn.lordicon.com/ternnbni.json',

    // Social
    'instagram': 'https://cdn.lordicon.com/qfmqzqts.json',
    'tiktok': 'https://cdn.lordicon.com/vqcuhczx.json',

    // Location
    'location': 'https://cdn.lordicon.com/surcxhka.json',
    'map-pin': 'https://cdn.lordicon.com/surcxhka.json',

    // Security
    'shield': 'https://cdn.lordicon.com/jgnvfzqg.json',
    'lock': 'https://cdn.lordicon.com/egrthbtj.json',

    // Users
    'user': 'https://cdn.lordicon.com/dxjqoygy.json',
    'users': 'https://cdn.lordicon.com/bhfjfgqz.json',

    // Misc
    'fire': 'https://cdn.lordicon.com/lkwvvpfj.json',
    'rocket': 'https://cdn.lordicon.com/xkumezul.json',
    'gift': 'https://cdn.lordicon.com/wcjauznf.json',
    'trash': 'https://cdn.lordicon.com/skkahier.json',
    'edit': 'https://cdn.lordicon.com/wloilxuq.json',
    'settings': 'https://cdn.lordicon.com/lecprnjb.json',
    'refresh': 'https://cdn.lordicon.com/qhkvfxpn.json',
    'loading': 'https://cdn.lordicon.com/xjovhxra.json',
}

interface LordIconProps {
    icon?: keyof typeof ICON_URLS | string
    src?: string
    size?: number
    trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang' | 'in' | 'morph-two-way'
    colors?: string | Record<string, string>
    state?: string
    className?: string
    delay?: number
}

export function LordIcon({
    icon,
    src,
    size = 24,
    trigger = 'hover',
    colors,
    state,
    className = '',
    delay = 0
}: LordIconProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const iconUrl = src || (icon ? (ICON_URLS[icon] || icon) : '')

    const colorString = typeof colors === 'string'
        ? colors
        : colors
            ? Object.entries(colors).map(([k, v]) => `${k}:${v}`).join(',')
            : 'primary:#f97316,secondary:#fbbf24'

    // Don't render on server to avoid hydration mismatch
    if (!mounted) {
        return <span style={{ display: 'inline-block', width: size, height: size }} className={className} />
    }

    return (
        <lord-icon
            src={iconUrl}
            trigger={trigger}
            delay={delay}
            colors={colorString}
            state={state}
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
            className={className}
        />
    )
}

// Client-only wrapper for inline lord-icon usage
interface ClientLordIconProps {
    src: string
    trigger?: string
    delay?: string | number
    colors?: string
    state?: string
    style?: React.CSSProperties
    className?: string
}

const ClientLordIconComponent = ({ src, trigger = 'hover', delay = 0, colors, state, style, className }: ClientLordIconProps) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <span style={{ display: 'inline-block', ...style }} className={className} />
    }

    return (
        <lord-icon
            src={src}
            trigger={trigger}
            delay={delay}
            colors={colors}
            state={state}
            style={style}
            className={className}
        />
    )
}

function arePropsEqual(prev: ClientLordIconProps, next: ClientLordIconProps) {
    return (
        prev.src === next.src &&
        prev.trigger === next.trigger &&
        prev.delay === next.delay &&
        prev.colors === next.colors &&
        prev.state === next.state &&
        prev.className === next.className &&
        // Shallow compare style objects
        (prev.style === next.style || (
            !!prev.style && !!next.style &&
            Object.keys(prev.style as React.CSSProperties).length === Object.keys(next.style as React.CSSProperties).length &&
            Object.keys(prev.style as React.CSSProperties).every(key => (prev.style as Record<string, unknown>)[key] === (next.style as Record<string, unknown>)[key])
        ))
    )
}

export const ClientLordIcon = React.memo(ClientLordIconComponent, arePropsEqual)

// Animated Button wrapper with icon animation on hover
interface AnimatedButtonProps {
    children: React.ReactNode
    icon?: keyof typeof ICON_URLS
    iconPosition?: 'left' | 'right'
    iconSize?: number
    className?: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    target?: string
    rel?: string
}

export function AnimatedButton({
    children,
    icon,
    iconPosition = 'right',
    iconSize = 20,
    className = '',
    href,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    target,
    rel,
}: AnimatedButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out relative overflow-hidden group'

    const variants = {
        primary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-300/50 hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5',
        outline: 'border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 hover:-translate-y-0.5',
        ghost: 'text-gray-600 hover:text-orange-600 hover:bg-orange-50',
    }

    const sizes = {
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-6 text-base rounded-xl',
        lg: 'h-14 px-8 text-lg rounded-xl',
    }

    const buttonContent = (
        <>
            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {icon && iconPosition === 'left' && (
                <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                    <LordIcon icon={icon} size={iconSize} trigger="loop-on-hover" />
                </span>
            )}
            <span className="relative z-10">{children}</span>
            {icon && iconPosition === 'right' && (
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                    <LordIcon icon={icon} size={iconSize} trigger="loop-on-hover" />
                </span>
            )}
        </>
    )

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`

    if (href) {
        return (
            <a href={href} className={combinedClassName} target={target} rel={rel}>
                {buttonContent}
            </a>
        )
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClassName}
        >
            {buttonContent}
        </button>
    )
}
