import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    const { prompt, command, context, imageUrl } = await req.json();

    // Base system instruction with emphasis on natural Bahasa Indonesia
    let systemInstruction = `Kamu adalah asisten penulis konten profesional untuk blog berbahasa Indonesia.

TUJUAN UTAMA:
- Membantu membuat konten edukatif berkualitas tinggi seputar Google Sheets, Excel, Spreadsheet, dan produktivitas bisnis.
- Fokus memberikan VALUE dan SOLUSI nyata untuk pembaca, BUKAN promosi produk.

ATURAN PENTING KONTEN:
- JANGAN mempromosikan atau menyebut produk/layanan apapun secara eksplisit dalam artikel.
- JANGAN menambahkan CTA (Call to Action) yang menyuruh pembaca membeli sesuatu.
- Biarkan kualitas konten yang berbicara. Pembaca akan menghargai konten yang helpful tanpa dipaksa beli.
- Fokus 100% pada memberikan edukasi dan solusi untuk masalah pembaca.

ATURAN PENTING BAHASA:
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
7. JIKA teks terlihat seperti data tabel atau skema database (misal: daftar Sheet dan kolom yang dipisahkan spasi), ubah struktur tersebut menjadi tabel HTML (<table>, <thead>, <tbody>, <tr>, <th>, <td>) dengan class "table-auto w-full border-collapse border border-gray-300 my-4" dan beri styling border/padding di <td>/<th>.
8. JANGAN ubah kata-kata atau redaksi kalimat, HANYA format HTML-nya saja.

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
    } else if (command === 'suggest_ideas') {
        systemInstruction += `

TUGAS: Berikan 5 ide artikel blog yang potensial dan menarik untuk target audience UMKM & Profesional Indonesia.

KRITERIA IDE:
1. Relevan dengan Google Sheets, Excel, Produktivitas, atau Manajemen Bisnis/Keuangan.
2. Menjawab masalah nyata (pain points) yang sering dialami admin/pebisnis (misal: stok berantakan, laporan keuangan pusing, gaji karyawan ribet).
3. Judul harus "Clicky" tapi tidak clickbait murahan. Gunakan teknik copywriting (misal: Menggunakan Angka, Menjanjikan Kemudahan, Menakut-nakuti kesalahan fatal).
4. Variasikan topik: Tutorial Teknis, Tips Bisnis, Studi Kasus, atau Inspirasi Produktivitas.

FORMAT OUTPUT (HTML):
Berikan output berupa list HTML <ul> yang rapi tanpa bullet point default (gunakan emoji sebagai bullet).
Contoh format:
<ul class="space-y-4">
  <li class="p-4 bg-orange-50 rounded-lg border border-orange-100">
    <h3 class="font-bold text-gray-900 text-lg mb-1">🎯 [Judul Artikel]</h3>
    <p class="text-gray-600 text-sm">[Deskripsi singkat premis artikel dan kenapa ini penting]</p>
  </li>
  ...
</ul>

Langsung berikan listnya saja.`;
    } else if (command === 'edit_selection') {
        systemInstruction += `

TUGAS: Modifikasi teks/HTML yang diberikan oleh pengguna sesuai dengan instruksi.

INSTRUKSI MODIFIKASI:
${prompt}

TEKS/HTML YANG HARUS DIMODIFIKASI:
${context}

ATURAN:
1. Pahami konteks teks asli dan terapkan instruksi dari pengguna.
2. JANGAN mengubah struktur HTML secara drastis jika tidak diminta.
3. Kembalikan HANYA teks/HTML yang sudah dimodifikasi, tanpa pengantar, tanpa penjelasan, dan jangan gunakan markdown block (\`\`\`html).
4. Gunakan gaya bahasa non-formal, santai, dan ramah seperti asisten penulis artikel blog Indonesia.`;
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
     <p class="m-0 flex items-start gap-3">
       <span class="text-2xl mt-1">🖼️</span>
       <span>
         <strong>Saran Ilustrasi:</strong> [Deskripsi detail...]
       </span>
     </p>
   </div>
   \`\`\`
   Berikan minimal 1-2 saran ilustrasi per artikel.`;
    }

    try {
        const supabase = await createClient();
        const { data } = await supabase.from('site_settings').select('key, value').in('key', ['openrouter_api_key', 'openrouter_base_url', 'primary_ai_model']);
        
        const openrouterKey = data?.find(s => s.key === 'openrouter_api_key')?.value || '';
        const openrouterBaseUrl = data?.find(s => s.key === 'openrouter_base_url')?.value || 'https://openrouter.ai/api/v1';
        const primaryAiModel = data?.find(s => s.key === 'primary_ai_model')?.value || '';

        let modelInstance;
        
        if (primaryAiModel && openrouterKey) {
            const openrouter = createOpenAICompatible({
                name: 'openrouter',
                apiKey: openrouterKey,
                baseURL: openrouterBaseUrl,
            });
            modelInstance = openrouter(primaryAiModel);
            console.log(`Generating with primary model ${primaryAiModel} on 9Router...`);
        } else if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            modelInstance = google('gemini-2.5-flash');
            console.log("Generating with fallback model gemini-2.5-flash...");
        } else {
            throw new Error("No AI provider configured.");
        }

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

        // Use streamText
        const result = await streamText({
            model: modelInstance,
            messages: messages,
        });

        // Return stream response
        return result.toTextStreamResponse();
    } catch (error) {
        console.error("AI Error:", error);
        return Response.json({ error: "Failed to generate content." }, { status: 500 });
    }
}
