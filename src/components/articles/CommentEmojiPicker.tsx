import { useState } from 'react'
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react'
import { Smile, Sparkles } from 'lucide-react'
import { ClientLordIcon } from '@/components/ui/lordicon'
import { lordIconAnimations } from '@/data/lord-icon-animations'

interface CommentEmojiPickerProps {
    onEmojiClick: (emoji: string) => void
    onIconClick: (url: string) => void
}

export function CommentEmojiPicker({ onEmojiClick, onIconClick }: CommentEmojiPickerProps) {
    const [activeTab, setActiveTab] = useState<'emoji' | 'animation'>('emoji')

    // Use the imported animations
    const animations = lordIconAnimations

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-[350px] overflow-hidden flex flex-col h-[400px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('emoji')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'emoji' ? 'text-orange-500 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <Smile className="w-4 h-4" />
                    Emoji
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('animation')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'animation' ? 'text-orange-500 bg-orange-50' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Animasi
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                {activeTab === 'emoji' && (
                    <EmojiPicker
                        onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)}
                        autoFocusSearch={false}
                        theme={Theme.LIGHT}
                        emojiStyle={EmojiStyle.GOOGLE}
                        width="100%"
                        height="350px"
                        previewConfig={{ showPreview: false }}
                        lazyLoadEmojis={true}
                    />
                )}

                {activeTab === 'animation' && (
                    <div className="p-4 grid grid-cols-4 gap-3">
                        {animations.map((url, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onIconClick(url)}
                                className="aspect-square rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 hover:bg-orange-50 transition-all flex items-center justify-center p-2"
                            >
                                <ClientLordIcon
                                    src={url}
                                    trigger="hover"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
