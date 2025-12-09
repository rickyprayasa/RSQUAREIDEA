'use client'

interface GridBackgroundProps {
    className?: string
}

export function GridBackground({ className = '' }: GridBackgroundProps) {
    return (
        <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
            {/* Base */}
            <div className="absolute inset-0 bg-white" />
            
            {/* Grid Pattern - very subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
    )
}
