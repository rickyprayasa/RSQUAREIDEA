'use client'

import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { mergeAttributes, Node } from '@tiptap/core'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { useEffect } from 'react'

// --- Custom LordIcon Extension ---
const LordIconExtension = Node.create({
    name: 'lordIcon',
    group: 'inline',
    inline: true,
    draggable: true,
    atom: true, // It's a single unit, cursor can't go "inside"

    addAttributes() {
        return {
            src: {
                default: null,
            },
            colors: {
                default: '',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'lord-icon',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['lord-icon', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(({ node }) => {
            return (
                <NodeViewWrapper className="inline-flex align-middle mx-0.5 select-none leading-none">
                    <div className="w-[24px] h-[24px]">
                        {/* 
                           We use the ClientLordIcon wrapper, but we need to ensure 
                           it renders correctly inside the editor 
                        */}
                        <ClientLordIcon
                            src={node.attrs.src}
                            trigger="loop"
                            colors={node.attrs.colors}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>
                </NodeViewWrapper>
            )
        })
    },
})

interface RichCommentEditorProps {
    content: string
    onChange: (html: string) => void
    onSubmit?: () => void
    editable?: boolean
    placeholder?: string
    setEditorInstance?: (editor: any) => void
}

export function RichCommentEditor({
    content,
    onChange,
    onSubmit,
    editable = true,
    placeholder = 'Tulis komentar...',
    setEditorInstance
}: RichCommentEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            LordIconExtension,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            // Get HTML, but maybe sanitize if needed on server side
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm w-full max-w-none focus:outline-none min-h-[100px] max-h-[300px] overflow-y-auto px-4 py-3',
            },
            handleKeyDown: (view, event) => {
                // Submit on Ctrl+Enter or Cmd+Enter
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    if (onSubmit) {
                        onSubmit()
                        return true
                    }
                }
                return false
            }
        },
        immediatelyRender: false,
    })

    // Expose editor instance to parent (e.g., for inserting icons programmatically)
    useEffect(() => {
        if (editor && setEditorInstance) {
            setEditorInstance(editor)
        }
    }, [editor, setEditorInstance])

    // Update content if it changes externally (e.g. clear form)
    useEffect(() => {
        if (editor && content === '' && editor.getText() !== '') {
            editor.commands.clearContent()
        }
    }, [content, editor])

    return (
        <div className={`rounded-xl border border-gray-200 bg-white transition-all ${editable ? 'focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20' : 'bg-gray-50'}`}>
            <EditorContent editor={editor} />
            <style jsx global>{`
                .is-editor-empty:first-child::before {
                    color: #9ca3af;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                /* Ensure LordIcon doesn't mess up line height too much */
                lord-icon {
                    display: inline-block;
                    vertical-align: middle;
                }
            `}</style>
        </div>
    )
}
