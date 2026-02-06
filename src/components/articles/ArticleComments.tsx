'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientLordIcon } from '@/components/ui/lordicon'
import Link from 'next/link'

interface Comment {
    id: string
    name: string
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
    const [content, setContent] = useState('')
    const [user, setUser] = useState<any>(null)
    const [userLoading, setUserLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(isAdminProp || false)

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

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    // Fetch comments
    useEffect(() => {
        async function fetchComments() {
            // Admins can see all comments, public only sees approved
            let query = supabase
                .from('article_comments')
                .select('id, name, content, created_at, pinned, approved')
                .eq('article_id', articleId)

            if (!isAdmin) {
                query = query.eq('approved', true)
            }

            // Order by pinned first, then by date
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

    // Check if current user is admin
    useEffect(() => {
        async function checkAdminStatus() {
            if (!user) return
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

    // Handle Google login
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href
            }
        })
        if (error) {
            toast.error('Gagal login dengan Google')
        }
    }

    // Submit new comment
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error('Silakan login terlebih dahulu')
            return
        }

        if (!content.trim()) {
            toast.error('Komentar harus diisi')
            return
        }

        setSubmitting(true)

        try {
            // Get display name from user metadata
            const displayName = user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'Pengguna'

            const { data, error } = await supabase
                .from('article_comments')
                .insert({
                    article_id: articleId,
                    name: displayName,
                    email: user.email,
                    content: content.trim(),
                    approved: true
                })
                .select()
                .single()

            if (error) throw error

            // Add to local state
            setComments(prev => [data, ...prev])
            setContent('')
            toast.success('Komentar berhasil ditambahkan!')
        } catch (error: any) {
            console.error('Error submitting comment:', error)
            toast.error('Gagal mengirim komentar')
        } finally {
            setSubmitting(false)
        }
    }

    // Admin: Delete comment
    const handleDelete = async (commentId: string) => {
        if (!confirm('Yakin ingin menghapus komentar ini?')) return

        try {
            const { error } = await supabase
                .from('article_comments')
                .delete()
                .eq('id', commentId)

            if (error) throw error

            setComments(prev => prev.filter(c => c.id !== commentId))
            toast.success('Komentar dihapus')
        } catch (error) {
            console.error('Error deleting comment:', error)
            toast.error('Gagal menghapus komentar')
        }
    }

    // Admin: Toggle hide/show comment
    const handleToggleApproval = async (commentId: string, currentApproved: boolean) => {
        try {
            const { error } = await supabase
                .from('article_comments')
                .update({ approved: !currentApproved })
                .eq('id', commentId)

            if (error) throw error

            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, approved: !currentApproved } : c
            ))
            toast.success(currentApproved ? 'Komentar disembunyikan' : 'Komentar ditampilkan')
        } catch (error) {
            console.error('Error toggling approval:', error)
            toast.error('Gagal mengubah status komentar')
        }
    }

    // Admin: Toggle pin/unpin comment
    const handleTogglePin = async (commentId: string, currentPinned: boolean) => {
        try {
            const { error } = await supabase
                .from('article_comments')
                .update({ pinned: !currentPinned })
                .eq('id', commentId)

            if (error) throw error

            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, pinned: !currentPinned } : c
            ))
            toast.success(currentPinned ? 'Komentar di-unpin' : 'Komentar di-pin')
        } catch (error) {
            console.error('Error toggling pin:', error)
            toast.error('Gagal mengubah status pin')
        }
    }

    return (
        <div className="mt-16 pt-12 border-t border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <ClientLordIcon
                        src="https://cdn.lordicon.com/fdxqrdfe.json"
                        trigger="loop"
                        delay={3000}
                        colors="primary:#f97316,secondary:#fbbf24"
                        style={{ width: '28px', height: '28px' }}
                    />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Komentar</h3>
                    <p className="text-gray-500 text-sm">
                        {comments.length} komentar
                    </p>
                </div>
            </div>

            {/* Comment Form or Login Prompt */}
            {userLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
            ) : user ? (
                <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full"
                            />
                        ) : (
                            <div className="p-1.5 bg-orange-100 rounded-full">
                                <ClientLordIcon
                                    src="https://cdn.lordicon.com/kthelypq.json"
                                    trigger="hover"
                                    colors="primary:#f97316,secondary:#fbbf24"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-900">
                                {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                            </p>
                            <p className="text-xs text-gray-500">Berkomentar sebagai</p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tulis komentar kamu di sini..."
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-orange-200"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ClientLordIcon
                                src="https://cdn.lordicon.com/ternnbni.json"
                                trigger="hover"
                                colors="primary:#ffffff,secondary:#ffffff"
                                style={{ width: '18px', height: '18px' }}
                            />
                        )}
                        Kirim Komentar
                    </button>
                </form>
            ) : (
                <div className="mb-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 text-center">
                    <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-4">
                        <ClientLordIcon
                            src="https://cdn.lordicon.com/hrjifpbq.json"
                            trigger="loop"
                            delay={2000}
                            colors="primary:#f97316,secondary:#fbbf24"
                            style={{ width: '48px', height: '48px' }}
                        />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Login untuk Berkomentar</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Untuk menjaga kualitas diskusi, silakan login terlebih dahulu sebelum berkomentar.
                    </p>
                    <button
                        onClick={handleGoogleLogin}
                        className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 hover:border-orange-200 rounded-xl text-gray-700 font-medium hover:bg-orange-50 transition-all shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Login dengan Google
                    </button>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <ClientLordIcon
                        src="https://cdn.lordicon.com/fdxqrdfe.json"
                        trigger="loop"
                        delay={5000}
                        colors="primary:#d1d5db,secondary:#e5e7eb"
                        style={{ width: '64px', height: '64px' }}
                    />
                    <p className="text-gray-500 font-medium mt-3">Belum ada komentar</p>
                    <p className="text-gray-400 text-sm">Jadilah yang pertama berkomentar!</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-6">
                        {comments.map((comment, index) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${comment.pinned ? 'border-orange-200 ring-1 ring-orange-100' :
                                        comment.approved === false ? 'border-red-200 opacity-60' : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-1.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full shrink-0">
                                        <ClientLordIcon
                                            src="https://cdn.lordicon.com/kthelypq.json"
                                            trigger="hover"
                                            colors="primary:#f97316,secondary:#fbbf24"
                                            style={{ width: '22px', height: '22px' }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-gray-900">
                                                {comment.name}
                                            </span>
                                            {comment.pinned && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                    📌 Pinned
                                                </span>
                                            )}
                                            {comment.approved === false && isAdmin && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                    🙈 Hidden
                                                </span>
                                            )}
                                            <span className="text-gray-400 text-xs">•</span>
                                            <span className="text-gray-400 text-xs">
                                                {formatDistanceToNow(new Date(comment.created_at), {
                                                    addSuffix: true,
                                                    locale: idLocale
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>

                                        {/* Admin Actions */}
                                        {isAdmin && (
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleTogglePin(comment.id, comment.pinned || false)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${comment.pinned
                                                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    📌 {comment.pinned ? 'Unpin' : 'Pin'}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleApproval(comment.id, comment.approved !== false)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${comment.approved === false
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {comment.approved === false ? '👁 Show' : '🙈 Hide'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    🗑 Delete
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
        </div>
    )
}

