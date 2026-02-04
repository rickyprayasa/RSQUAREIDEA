import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

export const maxDuration = 60;
export const runtime = 'edge';

// Initialize Z.Ai (Zhipu AI) using OpenAI-compatible provider
const zai = createOpenAICompatible({
    name: 'zai',
    baseURL: 'https://api.z.ai/api/coding/paas/v4',
    headers: {
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
    },
});

export async function POST(req: Request) {
    const { prompt, command, context, imageUrl } = await req.json();

    // Base system instruction with emphasis on natural Bahasa Indonesia
    let systemInstruction = `Kamu adalah asisten penulis konten profesional untuk blog berbahasa Indonesia. 

ATURAN PENTING:
- Gunakan Bahasa Indonesia yang NATURAL, RAMAH, dan MUDAH DIPAHAMI
- Hindari bahasa yang kaku atau terlalu formal seperti terjemahan mesin
- Tulis seperti sedang berbicara dengan teman yang ingin belajar
- Gunakan kata-kata sehari-hari yang umum digunakan orang Indonesia
- Berikan contoh praktis yang relevan dengan kehidupan sehari-hari`;

    if (command === 'optimize') {
        systemInstruction += `

TUGAS: Perbaiki teks berikut agar lebih enak dibaca dan dipahami.
- Perbaiki tata bahasa yang salah
- Buat kalimat lebih mengalir
- Jaga makna aslinya
- Kembalikan HANYA teks yang sudah diperbaiki, tanpa penjelasan.`;
    } else if (command === 'expand') {
        systemInstruction += `

TUGAS: Kembangkan teks berikut dengan menambahkan detail, contoh, atau penjelasan lebih lanjut.`;
    } else if (command === 'outline') {
        systemInstruction += `

TUGAS: Buat outline artikel yang komprehensif berdasarkan topik. Gunakan format Markdown.`;
    } else if (command === 'fix_format') {
        systemInstruction += `

TUGAS: Rapikan struktur HTML dari konten berikut tanpa mengubah isinya.

PERBAIKAN YANG HARUS DILAKUKAN:
1. Hapus tag <span> yang tidak perlu (style inline yang berantakan)
2. Pastikan heading berurutan (<h2> lalu <h3>)
3. Ubah teks pendek yang seharusnya heading menjadi tag heading yang sesuai
4. Pastikan paragraf dibungkus <p> dengan benar
5. Perbaiki format list <ul> dan <ol>
6. Hapus spasi ganda atau baris kosong berlebih
7. JANGAN ubah kata-kata atau redaksi kalimat, HANYA format HTML-nya saja.

RETURN: Hanya kode HTML yang sudah dirapikan.`;
    } else if (command === 'fix_grammar') {
        systemInstruction += `

TUGAS: Koreksi Typo, Ejaan, dan Kesalahan Penulisan Lainnya dari konten HTML berikut tanpa merusak tag HTML-nya.

PERBAIKAN YANG HARUS DILAKUKAN:
1. Koreksi semua kesalahan penulisan (typo) Bahasa Indonesia.
2. Hapus spasi berlebih (misal: "kalimat  ini" menjadi "kalimat ini").
3. Hapus kata yang tertulis ganda secara tidak sengaja (misal: "dan dan" menjadi "dan", "saya saya" menjadi "saya").
   CATATAN: Hati-hati dengan kata ulang yang valid dalam Bahasa Indonesia (misal: "kura-kura", "jalan-jalan", "makan-makan" itu BENAR, jangan dihapus).
4. Perbaiki tanda baca (titik, koma, spasi setelah tanda baca).
5. Gunakan Ejaan Yang Disempurnakan (EYD) / PUEBI.
6. SANGAT PENTING: JANGAN MENGHAPUS ATAU MERUSAK TAG HTML (<p>, <h2>, <strong>, dll).
7. JANGAN mengubah makna kalimat atau gaya bahasa (tetap santai/casual jika aslinya demikian).

RETURN: Kode HTML lengkap yang isinya sudah dikoreksi.`;
    } else if (command === 'generate') {
        systemInstruction += `

TUGAS: Tulis artikel atau bagian artikel berdasarkan permintaan pengguna.

GAYA PENULISAN (TONE & VOICE):
- Gunakan Bahasa Indonesia yang **NON-FORMAL, SANTAI, dan RAMAH** (seperti ngobrol dengan teman akrab).
- **HINDARI** bahasa baku kaku seperti "Anda", "adalah", "merupakan". Ganti dengan "Kamu", "itu", "tuh".
- Buat tulisan yang **MUDAH DIPAHAMI** oleh pemula sekalipun. Hindari istilah teknis yang rumit tanpa penjelasan.
- Gunakan **EMOJI (Icon)** yang relevan di judul, sub-judul, atau poin-poin penting agar tampilan LEBIH MENARIK 🤩✨.
- Boleh gunakan kata seru seperti "Wah", "Lho", "Kok bisa?", "Nah", dll.

FORMAT OUTPUT (WAJIB HTML):
- Gunakan format HTML yang valid.
- Gunakan <h2> untuk sub-judul utama, <h3> untuk sub-sub-judul.
- Gunakan <p> untuk paragraf.
- Gunakan <ul><li> untuk daftar.
- Gunakan <strong> untuk penekanan penting.
- JANGAN gunakan Markdown, gunakan HTML saja.
- Buat paragraf pendek-pendek (2-3 kalimat) agar mata tidak lelah.

STRUKTUR KONTEN:
1. **Hook**: Mulai dengan pertanyaan atau pernyataan yang relate dengan masalah pembaca.
2. **Body**: Jelaskan solusi dengan langkah-langkah yang jelas.
3. **Closing**: Berikan kesimpulan singkat dan semangat.

INSTRUKSI KHUSUS (VISUAL & FORMULA):
1. **FORMULA EXCEL/SPREADSHEET**: Jika menulis rumus, WAJIB gunakan format UI gelap agar terlihat profesional. Gunakan struktur HTML ini:
   \`\`\`html
   <div class="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm shadow-sm overflow-x-auto my-4 border border-slate-700">
     =RUMUS(param1; param2; ...)
   </div>
   \`\`\`
   JANGAN hanya menulis rumus di dalam paragraf biasa atau blockquote.

2. **ILUSTRASI GAMBAR**: Berikan saran di mana gambar harus diletakkan untuk memperjelas penjelasan. Gunakan format placeholder ini:
   \`\`\`html
   <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 my-4 flex items-start gap-3">
     <span class="text-2xl mt-1">🖼️</span>
     <div>
       <strong>Saran Ilustrasi:</strong> [Deskripsi detail gambar yang sebaiknya dimasukkan di sini, misal: Screenshot tabel data sebelum difilter]
     </div>
   </div>
   \`\`\`
   Berikan minimal 1-2 saran ilustrasi per artikel.`;
    }

    try {
        console.log("Generating with model glm-4.7 on Z.Ai...");

        const messages: any[] = [
            { role: 'system', content: systemInstruction },
        ];

        if (imageUrl) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: prompt || context || "Explain this image" },
                    { type: 'image', image: new URL(imageUrl) }
                ]
            });
        } else {
            messages.push({
                role: 'user',
                content: prompt || context
            });
        }

        // Use streamText to prevent Vercel 504 timeouts on long generations
        const result = await streamText({
            model: zai('glm-4.7'),
            messages: messages,
        });

        // Return stream response
        return result.toTextStreamResponse();
    } catch (error) {
        console.error("AI Error:", error);
        return Response.json({ error: "Failed to generate content." }, { status: 500 });
    }
}
