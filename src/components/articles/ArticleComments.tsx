'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Loader2, Smile, Pencil, Trash2, ThumbsUp, ThumbsDown, MessageCircle, CornerDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { CommentEmojiPicker } from './CommentEmojiPicker'
import { RichCommentEditor } from './RichCommentEditor'
import { checkCommentSafety } from '@/app/actions/comment-actions'

interface Comment {
    id: string
    article_id: string
    parent_id: string | null
    name: string
    email?: string
    content: string
    created_at: string
    pinned?: boolean
    approved?: boolean
    likes_count?: number
    dislikes_count?: number
    user_vote?: 'like' | 'dislike' | null
    replies?: Comment[]
    avatar_url?: string | null
    gender?: string | null
}

interface ArticleCommentsProps {
    articleId: string
    isAdmin?: boolean
}

// --- Reply Form Component (Isolated State) ---
interface ReplyFormProps {
    commentId: string
    commentName: string
    onSubmit: (content: string) => Promise<void>
    onCancel: () => void
}

const ReplyForm = ({ commentId, commentName, onSubmit, onCancel }: ReplyFormProps) => {
    const [content, setContent] = useState('')
    const [editorInstance, setEditorInstance] = useState<any>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)

    // Click outside for emoji picker
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSubmit = async () => {
        if (!content.replace(/<[^>]+>/g, '').trim() && !content.includes('lord-icon') && !content.includes('<img')) {
            toast.error('Balasan tidak boleh kosong')
            return
        }
        setSubmitting(true)
        try {
            await onSubmit(content)
            setContent('')
            editorInstance?.commands.clearContent()
        } catch (e) {
            console.error(e)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEmojiClick = (emoji: string) => {
        editorInstance?.chain().focus().insertContent(emoji).run()
    }

    const handleIconClick = (url: string) => {
        editorInstance?.chain().focus().insertContent({
            type: 'lordIcon',
            attrs: { src: url, trigger: 'loop', style: 'width: 48px; height: 48px' }
        }).run()
        setShowEmojiPicker(false)
    }

    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative mb-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                <CornerDownRight className="w-3 h-3" />
                Membalas <span className="font-semibold text-gray-700">@{commentName}</span>
            </div>
            <div className="relative">
                <RichCommentEditor
                    content={content}
                    onChange={setContent}
                    setEditorInstance={setEditorInstance}
                    placeholder="Tulis balasanmu..."
                    onSubmit={handleSubmit}
                />
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute bottom-3 right-3 p-1.5 text-gray-400 hover:text-orange-500 bg-white/50 hover:bg-white rounded-lg transition-colors z-20"
                >
                    <Smile className="w-4 h-4" />
                </button>
                {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl" ref={pickerRef}>
                        <CommentEmojiPicker onEmojiClick={handleEmojiClick} onIconClick={handleIconClick} />
                    </div>
                )}
            </div>
            <div className="flex gap-2 mt-3 justify-end">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                    Batal
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Kirim Balasan'}
                </button>
            </div>
        </div>
    )
}

// --- Helper Functions ---

function buildCommentTree(flatComments: Comment[]): Comment[] {
    const commentMap: { [key: string]: Comment } = {}
    const roots: Comment[] = []
    // Deep clone to avoid mutating original state references during build
    const comments = flatComments.map(c => ({ ...c, replies: [] }))

    comments.forEach(c => { commentMap[c.id] = c })
    comments.forEach(c => {
        if (c.parent_id && commentMap[c.parent_id]) {
            commentMap[c.parent_id].replies?.push(commentMap[c.id])
        } else {
            roots.push(commentMap[c.id])
        }
    })

    const sortReplies = (items: Comment[]) => {
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        items.forEach(c => { if (c.replies) sortReplies(c.replies) })
    }

    roots.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    roots.forEach(root => { if (root.replies) sortReplies(root.replies) })
    return roots
}

const getGenderIcon = (gender?: string) => {
    const lowerGender = gender?.toLowerCase()
    if (lowerGender === 'male' || lowerGender === 'laki-laki' || lowerGender === 'pria') return "https://cdn.lordicon.com/daeumrty.json"
    if (lowerGender === 'female' || lowerGender === 'perempuan' || lowerGender === 'wanita') return "https://cdn.lordicon.com/tcauouay.json"
    return "https://cdn.lordicon.com/hroklero.json"
}

const renderLegacyContent = (text: string) => {
    const parts = text.split(/(!\[.*?\]\(.*?\)|\[LORDICON\]\(.*?\))/)
    return parts.map((part, index) => {
        const matchIcon = part.match(/\[LORDICON\]\((.*?)\)/)
        if (matchIcon) return <span key={index} className="inline-block align-middle mx-1"><ClientLordIcon src={matchIcon[1]} trigger="loop" style={{ width: '48px', height: '48px' }} /></span>
        const matchImg = part.match(/!\[(.*?)\]\((.*?)\)/)
        if (matchImg) return <img key={index} src={matchImg[2]} alt={matchImg[1]} className="max-w-[150px] rounded-lg my-2" />
        return <span key={index}>{part}</span>
    })
}

const renderContent = (content: string) => {
    if (content.includes('<') && content.includes('>')) {
        if (!content.trim().startsWith('<')) return renderLegacyContent(content)
        const patchedContent = content.replace(
            /<lord-icon\s+src="([^"]+)"\s*><\/lord-icon>/g,
            '<lord-icon src="$1" trigger="loop" style="width: 48px; height: 48px; display: inline-block;"></lord-icon>'
        ).replace(
            /<lord-icon((?:(?!trigger).)*?)>/g,
            (match) => {
                if (match.includes('trigger=')) return match;
                return match.replace('<lord-icon', '<lord-icon trigger="loop" style="width: 48px; height: 48px; display: inline-block;" ')
            }
        )
        return <div className="prose prose-sm max-w-none [&>p]:mb-1 [&>p]:mt-0" dangerouslySetInnerHTML={{ __html: patchedContent }} />
    }
    return renderLegacyContent(content)
}

// --- Comment Item Component ---

interface CommentItemProps {
    comment: Comment
    depth?: number
    user: any
    isAdmin: boolean
    editingCommentId: string | null
    setEditingCommentId: (id: string | null) => void
    editContent: string
    setEditContent: (content: string) => void
    replyingToId: string | null
    setReplyingToId: (id: string | null) => void
    handleVote: (id: string, vote: 'like' | 'dislike' | null, action: 'like' | 'dislike') => void
    handleUpdateComment: (id: string) => void
    handleDelete: (id: string) => void
    handleTogglePin: (id: string, pinned: boolean) => void
    handleSubmitReply: (parentId: string, content: string) => Promise<void>
    // Editor Ref setters for Main/Edit
    setEditEditorInstance: (instance: any) => void
    // Emoji handlers for Edit
    handleEmojiClick: (emoji: string, target: 'main' | 'edit') => void
    handleIconClick: (url: string, target: 'main' | 'edit') => void
    // UI states for Edit emoji picker
    showEditEmojiPicker: boolean
    setShowEditEmojiPicker: (show: boolean) => void
    editEmojiPickerRef: React.RefObject<HTMLDivElement | null>
}

const CommentItem = ({
    comment, depth = 0, user, isAdmin,
    editingCommentId, setEditingCommentId, editContent, setEditContent,
    replyingToId, setReplyingToId,
    handleVote, handleUpdateComment, handleDelete, handleTogglePin, handleSubmitReply,
    setEditEditorInstance,
    handleEmojiClick, handleIconClick,
    showEditEmojiPicker, setShowEditEmojiPicker, editEmojiPickerRef
}: CommentItemProps) => {
    const isEditing = editingCommentId === comment.id
    const isReplying = replyingToId === comment.id
    const isOwner = user && user.email === comment.email
    const [overflowVisible, setOverflowVisible] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-2 ${depth > 0 ? 'ml-8 md:ml-12 mt-4' : 'mt-6'}`}
        >
            <div className={`
                bg-white rounded-xl p-4 md:p-5 border
                ${comment.pinned ? 'border-orange-200 ring-1 ring-orange-100 shadow-sm' : 'border-gray-100'} 
                ${!comment.approved ? 'opacity-60 border-red-200' : ''}
            `}>
                <div className="flex items-start gap-3 md:gap-4">
                    {comment.avatar_url ? (
                        <img
                            src={comment.avatar_url}
                            alt="Avatar"
                            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover bg-gray-100 border border-white shadow-sm shrink-0"
                        />
                    ) : (
                        <div className="p-1.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full shrink-0">
                            <ClientLordIcon
                                src={getGenderIcon(comment.gender || undefined)}
                                trigger="hover"
                                state="hover-looking-around"
                                style={{ width: '24px', height: '24px' }}
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm md:text-base">{comment.name}</span>
                            {comment.pinned && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] uppercase font-bold tracking-wide rounded-full">Pinned</span>}
                            <span className="text-gray-400 text-xs">• {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: idLocale })}</span>
                        </div>

                        {isEditing ? (
                            <div className="mt-2 relative">
                                <RichCommentEditor
                                    content={editContent}
                                    onChange={setEditContent}
                                    setEditorInstance={setEditEditorInstance}
                                />
                                <button onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)} className="absolute bottom-12 right-2 p-1.5 text-gray-400 hover:text-orange-500 bg-white/80 rounded-lg">
                                    <Smile className="w-5 h-5" />
                                </button>
                                {showEditEmojiPicker && (
                                    <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl rounded-xl" ref={editEmojiPickerRef}>
                                        <CommentEmojiPicker onEmojiClick={(e) => handleEmojiClick(e, 'edit')} onIconClick={(u) => handleIconClick(u, 'edit')} />
                                    </div>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleUpdateComment(comment.id)} className="px-3 py-1.5 bg-orange-500 text-white text-xs md:text-sm rounded-lg hover:bg-orange-600 font-medium">Simpan Perubahan</button>
                                    <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs md:text-sm rounded-lg hover:bg-gray-200">Batal</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-700 text-sm md:text-base leading-relaxed break-words">{renderContent(comment.content)}</div>
                        )}

                        {(!isEditing && !isReplying) && (
                            <div className="flex items-center flex-wrap gap-4 mt-3 pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-1 bg-gray-50 rounded-full px-1 py-0.5 border border-gray-100">
                                    <button
                                        onClick={() => handleVote(comment.id, comment.user_vote || null, 'like')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${comment.user_vote === 'like' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        <ThumbsUp className={`w-3.5 h-3.5 ${comment.user_vote === 'like' ? 'fill-current' : ''}`} />
                                        <span>{comment.likes_count || 0}</span>
                                    </button>
                                    <div className="w-px h-3 bg-gray-200" />
                                    <button
                                        onClick={() => handleVote(comment.id, comment.user_vote || null, 'dislike')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${comment.user_vote === 'dislike' ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        <ThumbsDown className={`w-3.5 h-3.5 ${comment.user_vote === 'dislike' ? 'fill-current' : ''}`} />
                                        {(comment.dislikes_count || 0) > 0 && <span>{comment.dislikes_count}</span>}
                                    </button>
                                </div>

                                {user && (
                                    <button
                                        onClick={() => setReplyingToId(comment.id)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors py-1 pl-1"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        Balas
                                    </button>
                                )}

                                {(isAdmin || isOwner) && (
                                    <div className="flex items-center gap-3 ml-auto">
                                        {isOwner && (
                                            <button onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content) }} className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-orange-600 transition-colors">
                                                <Pencil className="w-3 h-3" /> <span className="hidden sm:inline">Edit</span>
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button onClick={() => handleTogglePin(comment.id, comment.pinned || false)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${comment.pinned ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                                {comment.pinned ? 'Unpin' : 'Pin'}
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(comment.id)} className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-3 h-3" /> <span className="hidden sm:inline">Hapus</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence
                onExitComplete={() => setOverflowVisible(false)} // Reset overflow on exit
            >
                {isReplying && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`ml-8 md:ml-12 ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}
                        onAnimationComplete={(definition) => {
                            // Only set overflow visible when expanding
                            if (definition === 'visible') {
                                setOverflowVisible(true)
                            } else if (typeof definition === 'object' && !Array.isArray(definition) && (definition as any).opacity === 1) {
                                setOverflowVisible(true)
                            }
                        }}
                    >
                        <ReplyForm
                            commentId={comment.id}
                            commentName={comment.name}
                            onCancel={() => setReplyingToId(null)}
                            onSubmit={(content) => handleSubmitReply(comment.id, content)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {comment.replies && comment.replies.length > 0 && (
                <div className="relative">
                    <div className="absolute left-4 md:left-[22px] top-0 bottom-6 w-px bg-gray-200" />
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            depth={depth + 1}
                            user={user}
                            isAdmin={isAdmin}
                            editingCommentId={editingCommentId}
                            setEditingCommentId={setEditingCommentId}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            replyingToId={replyingToId}
                            setReplyingToId={setReplyingToId}
                            handleVote={handleVote}
                            handleUpdateComment={handleUpdateComment}
                            handleDelete={handleDelete}
                            handleTogglePin={handleTogglePin}
                            handleSubmitReply={handleSubmitReply}
                            setEditEditorInstance={setEditEditorInstance}
                            handleEmojiClick={handleEmojiClick}
                            handleIconClick={handleIconClick}
                            showEditEmojiPicker={showEditEmojiPicker}
                            setShowEditEmojiPicker={setShowEditEmojiPicker}
                            editEmojiPickerRef={editEmojiPickerRef}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

// --- Main ArticleComments Component ---

export function ArticleComments({ articleId, isAdmin: isAdminProp }: ArticleCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Editor States (Main)
    const [content, setContent] = useState('')
    const [editorInstance, setEditorInstance] = useState<any>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    // User State
    const [user, setUser] = useState<any>(null)
    const [userLoading, setUserLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(isAdminProp || false)
    const [customName, setCustomName] = useState('')
    const [avatarError, setAvatarError] = useState(false)
    const [sessionId, setSessionId] = useState<string>('')

    // Interaction States
    const [replyingToId, setReplyingToId] = useState<string | null>(null)
    // removed replyContent state & editors -> moved to ReplyForm

    // Edit Mode States
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [editEditorInstance, setEditEditorInstance] = useState<any>(null)
    const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false)
    const editEmojiPickerRef = useRef<HTMLDivElement>(null)

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Warning Modal State
    const [warningMessage, setWarningMessage] = useState<string | null>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // --- Data Fetching ---

    const fetchCommentsData = async () => {
        let query = supabase
            .from('article_comments')
            .select('id, article_id, parent_id, name, email, content, created_at, pinned, approved')
            .eq('article_id', articleId)

        if (!isAdmin) query = query.eq('approved', true)

        const { data: commentsData, error: commentsError } = await query

        if (commentsError) {
            console.error('Error fetching comments:', commentsError)
            setLoading(false)
            return
        }

        if (!commentsData || commentsData.length === 0) {
            setComments([])
            setLoading(false)
            return
        }

        const commentIds = commentsData.map(c => c.id)
        const { data: likesData } = await supabase
            .from('article_comment_likes')
            .select('comment_id, user_id, session_id, is_like')
            .in('comment_id', commentIds)

        const processedComments = commentsData.map(c => {
            const relevantLikes = likesData?.filter(l => l.comment_id === c.id) || []
            const likesCount = relevantLikes.filter(l => l.is_like).length
            const dislikesCount = relevantLikes.filter(l => !l.is_like).length

            let userVote: 'like' | 'dislike' | null = null
            if (user) {
                const myVote = relevantLikes.find(l => l.user_id === user.id)
                if (myVote) userVote = myVote.is_like ? 'like' : 'dislike'
            } else if (sessionId) {
                const myVote = relevantLikes.find(l => l.session_id === sessionId)
                if (myVote) userVote = myVote.is_like ? 'like' : 'dislike'
            }

            return {
                ...c,
                likes_count: likesCount,
                dislikes_count: dislikesCount,
                user_vote: userVote
            }
        })

        setComments(processedComments)
        setLoading(false)
    }

    // Initial Load & Auth Check
    useEffect(() => {
        async function init() {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            setUser(currentUser)
            setUserLoading(false)

            if (currentUser) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', currentUser.id)
                    .single()
                if (data?.role === 'admin' || data?.role === 'superadmin') setIsAdmin(true)

                const initialName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || ''
                setCustomName(initialName)
            }
        }
        init()

        // Persistent Session ID for Public Likes
        const storedSession = localStorage.getItem('comment_session_id')
        if (storedSession) {
            setSessionId(storedSession)
        } else {
            const newSession = crypto.randomUUID()
            localStorage.setItem('comment_session_id', newSession)
            setSessionId(newSession)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [supabase])

    useEffect(() => { setAvatarError(false) }, [user])

    useEffect(() => {
        if (!userLoading) fetchCommentsData()
    }, [articleId, isAdmin, user?.id, userLoading])


    const commentTree = useMemo(() => buildCommentTree(comments), [comments])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false)
            if (editEmojiPickerRef.current && !editEmojiPickerRef.current.contains(event.target as Node)) setShowEditEmojiPicker(false)
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

    const handleVote = async (commentId: string, currentVote: 'like' | 'dislike' | null, action: 'like' | 'dislike') => {
        // ALLOW public voting now
        // if (!user) { ... }
        const previousComments = [...comments]
        let newVote: 'like' | 'dislike' | null = null
        let likeDiff = 0
        let dislikeDiff = 0

        if (currentVote === action) {
            newVote = null
            if (action === 'like') likeDiff = -1
            else dislikeDiff = -1
        } else {
            newVote = action
            if (action === 'like') {
                likeDiff = 1
                if (currentVote === 'dislike') dislikeDiff = -1
            } else {
                dislikeDiff = 1
                if (currentVote === 'like') likeDiff = -1
            }
        }

        const updatedComments = comments.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    user_vote: newVote,
                    likes_count: (c.likes_count || 0) + likeDiff,
                    dislikes_count: (c.dislikes_count || 0) + dislikeDiff
                }
            }
            return c
        })
        setComments(updatedComments)

        try {
            if (newVote === null) {
                // Delete vote
                let query = supabase.from('article_comment_likes').delete().eq('comment_id', commentId)
                if (user) query = query.eq('user_id', user.id)
                else query = query.eq('session_id', sessionId)
                await query
            } else {
                // Manual Upsert: Try Update first, then Insert
                // This is required because Supabase .upsert() doesn't support targeting partial indexes (WHERE ...) easily

                let updateQuery = supabase.from('article_comment_likes')
                    .update({ is_like: newVote === 'like' })
                    .eq('comment_id', commentId)

                if (user) updateQuery = updateQuery.eq('user_id', user.id)
                else updateQuery = updateQuery.eq('session_id', sessionId)

                const { data: updated, error: updateError } = await updateQuery.select()

                if (updateError) throw updateError

                if (!updated || updated.length === 0) {
                    // No record found, so Insert
                    const payload: any = {
                        comment_id: commentId,
                        is_like: newVote === 'like'
                    }
                    if (user) payload.user_id = user.id
                    else payload.session_id = sessionId

                    const { data: insertedData, error: insertError } = await supabase
                        .from('article_comment_likes')
                        .insert(payload)
                        .select()

                    // Log insert result for debugging
                    if (insertError) {
                        console.error('Insert error:', insertError)
                        if (insertError.code !== '23505') throw insertError
                    } else if (!insertedData || insertedData.length === 0) {
                        console.error('Insert returned no data - RLS may be blocking!', { payload, sessionId })
                    } else {
                        console.log('Like VERIFIED inserted with id:', insertedData[0].id, 'session_id:', sessionId)
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error)
            setComments(previousComments)
            toast.error('Gagal memproses interaksi')
        }
    }

    // Now accepts content as arg
    const handleSubmit = async (parentId?: string, replyContentText?: string) => {
        if (!user) {
            toast.error('Silakan login terlebih dahulu')
            return
        }

        const targetContent = parentId ? replyContentText || '' : content
        const plainText = targetContent.replace(/<[^>]+>/g, '').trim()
        const hasMedia = targetContent.includes('lord-icon') || targetContent.includes('<img')

        if (!plainText && !hasMedia) {
            toast.error('Komentar harus diisi')
            return
        }

        if (!parentId) setSubmitting(true)
        // Note: For replies, loading state is handled by ReplyForm locally, but we need to wait for this function

        try {
            const displayName = customName.trim() || user.user_metadata?.full_name || 'Pengguna'

            // AI Safety Check
            const { safe, reason } = await checkCommentSafety(targetContent)
            if (!safe) {
                if (!parentId) setSubmitting(false)
                setWarningMessage(reason || 'Komentar mengandung konten yang tidak diizinkan.')
                return
            }

            const { data, error } = await supabase
                .from('article_comments')
                .insert({
                    article_id: articleId,
                    parent_id: parentId || null,
                    name: displayName,
                    email: user.email,
                    content: targetContent,
                    approved: true,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    gender: user.user_metadata?.gender || null
                })
                .select()
                .single()

            if (error) throw error

            const newComment = {
                ...data,
                likes_count: 0,
                dislikes_count: 0,
                user_vote: null
            }

            setComments(prev => [...prev, newComment])

            if (parentId) {
                setReplyingToId(null)
                // Content clearing is handled by ReplyForm
                toast.success('Balasan terkirim!')
            } else {
                setContent('')
                if (editorInstance) editorInstance.commands.clearContent()
                toast.success('Komentar berhasil ditambahkan!')
            }

        } catch (error: any) {
            console.error('Error submitting:', error)
            toast.error('Gagal mengirim komentar')
            throw error // Rethrow so ReplyForm knows it failed
        } finally {
            if (!parentId) setSubmitting(false)
        }
    }

    const handleEmojiClick = (emoji: string, target: 'main' | 'edit') => {
        let instance = target === 'main' ? editorInstance : editEditorInstance
        if (instance) instance.chain().focus().insertContent(emoji).run()
    }

    const handleIconClick = (url: string, target: 'main' | 'edit') => {
        let instance = target === 'main' ? editorInstance : editEditorInstance
        if (instance) {
            instance.chain().focus().insertContent({
                type: 'lordIcon',
                attrs: {
                    src: url,
                    trigger: 'loop',
                    style: 'width: 48px; height: 48px'
                }
            }).run()
            if (target === 'main') setShowEmojiPicker(false)
            if (target === 'edit') setShowEditEmojiPicker(false)
        }
    }

    const handleUpdateComment = async (commentId: string) => {
        if (!editContent.replace(/<[^>]+>/g, '').trim() && !editContent.includes('lord-icon')) {
            toast.error('Komentar tidak boleh kosong'); return;
        }

        const { error } = await supabase.from('article_comments').update({ content: editContent }).eq('id', commentId)
        if (error) { toast.error('Gagal update'); return }

        setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editContent } : c))
        setEditingCommentId(null)
        setEditContent('')
        toast.success('Komentar diperbarui')
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        const { error } = await supabase.from('article_comments').delete().eq('id', deleteId)
        if (error) { toast.error('Gagal hapus'); return }
        setComments(prev => prev.filter(c => c.id !== deleteId))
        setDeleteId(null)
        toast.success('Komentar dihapus')
    }

    const handleTogglePin = async (commentId: string, pinned: boolean) => {
        const { error } = await supabase.from('article_comments').update({ pinned: !pinned }).eq('id', commentId)
        if (error) { toast.error('Gagal update pin'); return }
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, pinned: !pinned } : c))
        toast.success(pinned ? 'Unpinned' : 'Pinned')
    }

    return (
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
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
                    <p className="text-gray-500 text-sm">{comments.length} interaksi</p>
                </div>
            </div>

            {userLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
            ) : user ? (
                <div className="mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100 relative z-10 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        {user.user_metadata?.avatar_url && !avatarError ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-white shadow-sm"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <div className="p-1.5 bg-orange-100 rounded-full">
                                <ClientLordIcon
                                    src={getGenderIcon(user.user_metadata?.gender)}
                                    trigger="hover"
                                    style={{ width: '28px', height: '28px' }}
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
                            onSubmit={() => handleSubmit()}
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
                                    onEmojiClick={(e) => handleEmojiClick(e, 'main')}
                                    onIconClick={(u) => handleIconClick(u, 'main')}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => handleSubmit()}
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
                <div className="mb-10 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 text-center flex flex-col items-center shadow-inner">
                    <div className="mb-4 p-3 bg-white/50 rounded-full shadow-sm ring-1 ring-orange-100">
                        <ClientLordIcon
                            src="https://cdn.lordicon.com/hroklero.json"
                            trigger="loop"
                            delay={2000}
                            style={{ width: '64px', height: '64px' }}
                        />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Login untuk Berkomentar</h4>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">Bergabunglah dalam diskusi dan berikan pendapatmu tentang artikel ini.</p>
                    <button onClick={handleGoogleLogin} className="px-6 py-3 bg-white border border-gray-200 hover:border-orange-200 rounded-xl text-gray-700 font-medium hover:bg-orange-50 transition-all shadow-sm flex items-center gap-2 transform hover:-translate-y-0.5">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                        Login dengan Google
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
            ) : (
                <div className="space-y-2 pb-12">
                    {commentTree.length > 0 ? (
                        commentTree.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                user={user}
                                isAdmin={isAdmin}
                                editingCommentId={editingCommentId}
                                setEditingCommentId={setEditingCommentId}
                                editContent={editContent}
                                setEditContent={setEditContent}
                                replyingToId={replyingToId}
                                setReplyingToId={setReplyingToId}
                                handleVote={handleVote}
                                handleUpdateComment={handleUpdateComment}
                                handleDelete={setDeleteId}
                                handleTogglePin={handleTogglePin}
                                handleSubmitReply={handleSubmit}
                                setEditEditorInstance={setEditEditorInstance}
                                handleEmojiClick={handleEmojiClick}
                                handleIconClick={handleIconClick}
                                showEditEmojiPicker={showEditEmojiPicker}
                                setShowEditEmojiPicker={setShowEditEmojiPicker}
                                editEmojiPickerRef={editEmojiPickerRef}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                            <p>Belum ada komentar. Jadilah yang pertama!</p>
                        </div>
                    )}
                </div>
            )}

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

            {/* Warning Modal */}
            <AnimatePresence>
                {warningMessage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setWarningMessage(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-amber-50">
                                    <ClientLordIcon
                                        src="https://cdn.lordicon.com/ygvjgdmk.json"
                                        trigger="loop"
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Komentar Tidak Dapat Dikirim</h3>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    {warningMessage}
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 w-full">
                                    <p className="text-xs text-amber-700 font-medium">
                                        💡 Tips: Gunakan bahasa yang sopan dan hindari konten berbahaya seperti kata kasar, promosi judi, narkoba, dan ujaran kebencian.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setWarningMessage(null)}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
                                >
                                    Mengerti, Saya Akan Perbaiki
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
