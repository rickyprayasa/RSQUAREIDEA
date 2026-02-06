// Daftar Kata Terlarang (Blocklist) dengan Kategori
// Kata-kata ini akan langsung ditolak tanpa perlu pengecekan AI

type ViolationType = 'profanity' | 'gambling' | 'drugs' | 'porn' | 'hate' | 'crime' | 'spam'

interface BannedWordEntry {
    word: string
    type: ViolationType
}

const VIOLATION_MESSAGES: Record<ViolationType, string> = {
    profanity: 'Mohon gunakan bahasa yang sopan dan tidak menyinggung.',
    gambling: 'Promosi perjudian tidak diizinkan di platform ini.',
    drugs: 'Konten terkait narkoba dan obat terlarang tidak diizinkan.',
    porn: 'Konten tidak senonoh atau pornografi dilarang.',
    hate: 'Ujaran kebencian dan diskriminasi tidak diizinkan.',
    crime: 'Konten yang mempromosikan kejahatan tidak diperbolehkan.',
    spam: 'Spam dan promosi berlebihan tidak diizinkan.'
}

const BANNED_WORDS: BannedWordEntry[] = [
    // Kata Kasar / Profanity
    { word: 'anjing', type: 'profanity' },
    { word: 'babi', type: 'profanity' },
    { word: 'bangsat', type: 'profanity' },
    { word: 'bajingan', type: 'profanity' },
    { word: 'kampret', type: 'profanity' },
    { word: 'keparat', type: 'profanity' },
    { word: 'tolol', type: 'profanity' },
    { word: 'goblok', type: 'profanity' },
    { word: 'idiot', type: 'profanity' },
    { word: 'bego', type: 'profanity' },
    { word: 'tai', type: 'profanity' },
    { word: 'kontol', type: 'profanity' },
    { word: 'memek', type: 'profanity' },
    { word: 'ngentot', type: 'profanity' },
    { word: 'jancok', type: 'profanity' },
    { word: 'asu', type: 'profanity' },
    { word: 'cuk', type: 'profanity' },
    { word: 'jancuk', type: 'profanity' },
    { word: 'kimak', type: 'profanity' },
    { word: 'pukimak', type: 'profanity' },
    { word: 'pantek', type: 'profanity' },
    { word: 'brengsek', type: 'profanity' },

    // Judi / Gambling
    { word: 'slot gacor', type: 'gambling' },
    { word: 'judi online', type: 'gambling' },
    { word: 'togel', type: 'gambling' },
    { word: 'poker online', type: 'gambling' },
    { word: 'casino online', type: 'gambling' },
    { word: 'bandar bola', type: 'gambling' },
    { word: 'taruhan bola', type: 'gambling' },
    { word: 'slot88', type: 'gambling' },
    { word: 'pragmatic', type: 'gambling' },
    { word: 'maxwin', type: 'gambling' },
    { word: 'rtp slot', type: 'gambling' },
    { word: 'situs slot', type: 'gambling' },
    { word: 'agen judi', type: 'gambling' },
    { word: 'bonus deposit', type: 'gambling' },

    // Narkoba / Drugs
    { word: 'narkoba', type: 'drugs' },
    { word: 'sabu', type: 'drugs' },
    { word: 'ganja', type: 'drugs' },
    { word: 'ekstasi', type: 'drugs' },
    { word: 'heroin', type: 'drugs' },
    { word: 'kokain', type: 'drugs' },
    { word: 'morfin', type: 'drugs' },
    { word: 'shabu', type: 'drugs' },

    // Pornografi / Porn
    { word: 'bokep', type: 'porn' },
    { word: 'porno', type: 'porn' },
    { word: 'xxx', type: 'porn' },
    { word: 'onlyfans', type: 'porn' },
    { word: 'sex video', type: 'porn' },
    { word: 'open bo', type: 'porn' },
    { word: 'esek esek', type: 'porn' },

    // Ujaran Kebencian / Hate Speech
    { word: 'kafir', type: 'hate' },
    { word: 'yahudi bangsat', type: 'hate' },
    { word: 'bunuh semua', type: 'hate' },
    { word: 'musnahkan', type: 'hate' },

    // Kejahatan / Crime
    { word: 'jasa hack', type: 'crime' },
    { word: 'jual akun curian', type: 'crime' },
    { word: 'carding', type: 'crime' },
    { word: 'phising', type: 'crime' },
    { word: 'penipuan online', type: 'crime' },

    // Spam / Scam
    { word: 'klik link ini', type: 'spam' },
    { word: 'hubungi whatsapp', type: 'spam' },
    { word: 'promo terbatas', type: 'spam' },
    { word: 'gratis modal', type: 'spam' },
    { word: 'daftar sekarang dapat', type: 'spam' },
    { word: 'join grup', type: 'spam' },
]

// Fungsi untuk mengecek apakah teks mengandung kata terlarang
export function containsBannedWord(text: string): { banned: boolean; reason?: string } {
    const lowerText = text.toLowerCase()

    for (const entry of BANNED_WORDS) {
        if (lowerText.includes(entry.word.toLowerCase())) {
            return {
                banned: true,
                reason: VIOLATION_MESSAGES[entry.type]
            }
        }
    }

    return { banned: false }
}
