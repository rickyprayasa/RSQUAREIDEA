'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Loader2, Smile, Pencil, Trash2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { CommentEmojiPicker } from './CommentEmojiPicker'
import { RichCommentEditor } from './RichCommentEditor'

// Import Shadcn Dialog (assuming these exist or we use raw divs for now to be safe)
// Since we don't have full shadcn context, I'll build a custom Modal using Framer Motion/Divs to avoid missing component errors.

interface Comment {
    id: string
    name: string
    email?: string
    content: string
    created_at: string
    pinned?: boolean
    approved?: boolean
}

interface ArticleCommentsProps {
    articleId: string
    isAdmin?: boolean
}

export function ArticleComments({ articleId, isAdmin: isAdminProp }: ArticleCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Editor States
    const [content, setContent] = useState('')
    const [editorInstance, setEditorInstance] = useState<any>(null)

    const [user, setUser] = useState<any>(null)
    const [userLoading, setUserLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(isAdminProp || false)
    const [customName, setCustomName] = useState('')

    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    // Edit Mode States
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [editEditorInstance, setEditEditorInstance] = useState<any>(null)
    const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false)
    const editEmojiPickerRef = useRef<HTMLDivElement>(null)

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check auth status
    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setUserLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    // Fetch comments
    useEffect(() => {
        async function fetchComments() {
            let query = supabase
                .from('article_comments')
                .select('id, name, email, content, created_at, pinned, approved')
                .eq('article_id', articleId)

            if (!isAdmin) {
                query = query.eq('approved', true)
            }

            const { data, error } = await query.order('pinned', { ascending: false }).order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching comments:', error)
            } else {
                setComments(data || [])
            }
            setLoading(false)
        }

        fetchComments()
    }, [articleId, supabase, isAdmin])

    // Check Admin
    useEffect(() => {
        async function checkAdminStatus() {
            if (!user) return
            const initialName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || ''
            setCustomName(initialName)

            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (data?.role === 'admin' || data?.role === 'superadmin') {
                setIsAdmin(true)
            }
        }
        checkAdminStatus()
    }, [user, supabase])

    // Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false)
            }
            if (editEmojiPickerRef.current && !editEmojiPickerRef.current.contains(event.target as Node)) {
                setShowEditEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.href }
        })
        if (error) toast.error('Gagal login dengan Google')
    }

    // --- Insert Handlers ---
    const handleEmojiClick = (emoji: string) => {
        // Insert emoji at cursor
        if (editorInstance) {
            editorInstance.chain().focus().insertContent(emoji).run()
        }
    }

    const handleIconClick = (url: string) => {
        // Insert lord-icon node
        if (editorInstance) {
            editorInstance.chain().focus().insertContent({
                type: 'lordIcon',
                attrs: { src: url }
            }).run()
            setShowEmojiPicker(false)
        }
    }

    const handleEditEmojiClick = (emoji: string) => {
        if (editEditorInstance) {
            editEditorInstance.chain().focus().insertContent(emoji).run()
        }
    }

    const handleEditIconClick = (url: string) => {
        if (editEditorInstance) {
            editEditorInstance.chain().focus().insertContent({
                type: 'lordIcon',
                attrs: { src: url }
            }).run()
            setShowEditEmojiPicker(false)
        }
    }

    // --- Submit Handlers ---
    const handleSubmit = async () => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu')
            return
        }

        // Check if empty (strip tags)
        const plainText = content.replace(/<[^>]+>/g, '').trim()
        // If content has lord-icon tags or images, it's not empty even if text is empty
        const hasMedia = content.includes('lord-icon') || content.includes('<img')

        if (!plainText && !hasMedia) {
            toast.error('Komentar harus diisi')
            return
        }

        setSubmitting(true)

        try {
            const displayName = customName.trim() || user.user_metadata?.full_name || 'Pengguna'

            const { data, error } = await supabase
                .from('article_comments')
                .insert({
                    article_id: articleId,
                    name: displayName,
                    email: user.email,
                    content: content, // Save HTML directly
                    approved: true
                })
                .select()
                .single()

            if (error) throw error

            setComments(prev => [data, ...prev])
            // Clear editor
            if (editorInstance) editorInstance.commands.clearContent()
            setContent('')
            toast.success('Komentar berhasil ditambahkan!')
        } catch (error: any) {
            console.error('Error submitting comment:', error)
            toast.error('Gagal mengirim komentar')
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateComment = async (commentId: string) => {
        const plainText = editContent.replace(/<[^>]+>/g, '').trim()
        const hasMedia = editContent.includes('lord-icon')

        if (!plainText && !hasMedia) {
            toast.error('Komentar tidak boleh kosong')
            return
        }

        try {
            const { error } = await supabase
                .from('article_comments')
                .update({ content: editContent })
                .eq('id', commentId)

            if (error) throw error

            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, content: editContent } : c
            ))
            setEditingCommentId(null)
            setEditContent('')
            toast.success('Komentar berhasil diperbarui')
        } catch (error) {
            console.error('Error updating comment:', error)
            toast.error('Gagal memperbarui komentar')
        }
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const { error } = await supabase
                .from('article_comments')
                .delete()
                .eq('id', deleteId)

            if (error) throw error

            setComments(prev => prev.filter(c => c.id !== deleteId))
            toast.success('Komentar dihapus')
        } catch (error) {
            console.error('Error deleting comment:', error)
            toast.error('Gagal menghapus komentar')
        } finally {
            setDeleteId(null)
        }
    }

    // --- Renderers ---
    const getGenderIcon = (gender?: string) => {
        const lowerGender = gender?.toLowerCase()
        if (lowerGender === 'male' || lowerGender === 'laki-laki' || lowerGender === 'pria') {
            return "https://cdn.lordicon.com/daeumrty.json"
        }
        if (lowerGender === 'female' || lowerGender === 'perempuan' || lowerGender === 'wanita') {
            return "https://cdn.lordicon.com/tcauouay.json"
        }
        return "https://cdn.lordicon.com/hroklero.json"
    }

    const renderContent = (content: string) => {
        // ... existing renderContent logic ...
        // If content looks like HTML (contains tags), render as HTML
        if (content.includes('<') && content.includes('>')) {
            if (!content.trim().startsWith('<')) {
                return renderLegacyContent(content)
            }
            return (
                <div
                    className="prose prose-sm max-w-none [&>p]:mb-1 [&>p]:mt-0"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )
        }
        return renderLegacyContent(content)
    }

    // ... existing renderLegacyContent ...
    const renderLegacyContent = (text: string) => {
        const parts = text.split(/(!\[.*?\]\(.*?\)|\[LORDICON\]\(.*?\))/)
        return parts.map((part, index) => {
            const matchIcon = part.match(/\[LORDICON\]\((.*?)\)/)
            if (matchIcon) {
                return (
                    <span key={index} className="inline-block align-middle mx-1">
                        <ClientLordIcon
                            src={matchIcon[1]}
                            trigger="loop"
                            style={{ width: '24px', height: '24px' }}
                        />
                    </span>
                )
            }
            const matchImg = part.match(/!\[(.*?)\]\((.*?)\)/)
            if (matchImg) {
                return <img key={index} src={matchImg[2]} alt={matchImg[1]} className="max-w-[150px] rounded-lg my-2" />
            }
            return <span key={index}>{part}</span>
        })
    }

    return (
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <ClientLordIcon
                        src="https://cdn.lordicon.com/fdxqrdfe.json"
                        trigger="loop"
                        delay={3000}
                        style={{ width: '28px', height: '28px' }}
                    />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Komentar</h3>
                    <p className="text-gray-500 text-sm">{comments.length} komentar</p>
                </div>
            </div>

            {/* Comment Form */}
            {userLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
            ) : user ? (
                <div className="mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100 relative z-10">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="p-1.5 bg-orange-100 rounded-full">
                                <ClientLordIcon
                                    src={getGenderIcon(user.user_metadata?.gender)}
                                    trigger="hover"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Nama Kamu" className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none w-full transition-colors placeholder:text-gray-400" />
                            <p className="text-xs text-gray-500">Berkomentar sebagai</p>
                        </div>
                        {!isAdmin && (
                            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }} className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                                <ClientLordIcon src="https://cdn.lordicon.com/rhyfwlig.json" trigger="hover" style={{ width: '35px', height: '35px' }} />
                            </button>
                        )}
                    </div>

                    <div className="mb-4 relative">
                        <RichCommentEditor
                            content={content}
                            onChange={setContent}
                            setEditorInstance={setEditorInstance}
                            onSubmit={handleSubmit} // Allow Ctrl+Enter
                        />

                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute bottom-3 right-3 p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors z-20"
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl" ref={emojiPickerRef}>
                                <CommentEmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    onIconClick={handleIconClick}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-orange-200"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <ClientLordIcon src="https://cdn.lordicon.com/ternnbni.json" trigger="hover" style={{ width: '18px', height: '18px' }} />
                        )}
                        Kirim Komentar
                    </button>
                </div>
            ) : (
                <div className="mb-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 text-center flex flex-col items-center">
                    <div className="mb-4 p-3 bg-white/50 rounded-full shadow-sm ring-1 ring-orange-100">
                        <ClientLordIcon
                            src="https://cdn.lordicon.com/hroklero.json"
                            trigger="loop"
                            delay={2000}
                            style={{ width: '64px', height: '64px' }}
                        />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Login untuk Berkomentar</h4>
                    <button onClick={handleGoogleLogin} className="mt-4 px-6 py-3 bg-white border border-gray-200 hover:border-orange-200 rounded-xl text-gray-700 font-medium hover:bg-orange-50 transition-all shadow-sm flex items-center gap-2">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                        Login dengan Google
                    </button>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-6">
                        {comments.map((comment, index) => (
                            <motion.div key={comment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-white rounded-xl p-5 border shadow-sm ${comment.pinned ? 'border-orange-200 ring-1 ring-orange-100' : comment.approved === false ? 'border-red-200 opacity-60' : 'border-gray-100'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="p-1.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full shrink-0">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/hroklero.json"
                                            trigger="hover"
                                            style={{ width: '22px', height: '22px' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-gray-900">{comment.name}</span>
                                            {comment.pinned && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">📌 Pinned</span>}
                                            <span className="text-gray-400 text-xs">• {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: idLocale })}</span>
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="mt-2 relative">
                                                <div className="mb-4 relative">
                                                    <RichCommentEditor
                                                        content={editContent}
                                                        onChange={setEditContent}
                                                        setEditorInstance={setEditEditorInstance}
                                                    />
                                                    <button onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)} className="absolute bottom-3 right-3 p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors z-20">
                                                        <Smile className="w-5 h-5" />
                                                    </button>
                                                    {showEditEmojiPicker && (
                                                        <div className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl" ref={editEmojiPickerRef}>
                                                            <CommentEmojiPicker onEmojiClick={handleEditEmojiClick} onIconClick={handleEditIconClick} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleUpdateComment(comment.id)} className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">Simpan</button>
                                                    <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Batal</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-700">{renderContent(comment.content)}</div>
                                        )}

                                        {/* Actions */}
                                        {(isAdmin || (user && user.email === comment.email)) && !editingCommentId && (
                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                                                {user && user.email === comment.email && (
                                                    <button onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content) }} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors">
                                                        <Pencil className="w-3 h-3" /> Edit
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button onClick={() => handleTogglePin(comment.id, comment.pinned || false)} className="text-xs font-medium text-gray-600">{comment.pinned ? 'Unpin' : 'Pin'}</button>
                                                )}
                                                <button onClick={() => setDeleteId(comment.id)} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                                                    <Trash2 className="w-3 h-3" /> Hapus
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}

            {/* Custom Delete Modal */}
            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteId(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Komentar?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Apakah kamu yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setDeleteId(null)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
                                    >
                                        Ya, Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
