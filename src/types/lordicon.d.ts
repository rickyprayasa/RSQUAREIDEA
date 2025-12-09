import 'react'

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'lord-icon': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string
                    trigger?: string
                    delay?: string | number
                    colors?: string
                    state?: string
                    target?: string
                },
                HTMLElement
            >
        }
    }
}
