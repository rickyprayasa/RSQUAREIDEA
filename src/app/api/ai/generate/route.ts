import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';

export const maxDuration = 60;

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
    } else if (command === 'generate') {
        systemInstruction += `

TUGAS: Tulis artikel atau bagian artikel berdasarkan permintaan pengguna.

FORMAT OUTPUT (WAJIB):
- Gunakan format HTML yang valid
- Gunakan <h2> untuk sub-judul utama, <h3> untuk sub-sub-judul
- Gunakan <p> untuk paragraf
- Gunakan <ul><li> untuk daftar
- Gunakan <strong> untuk penekanan penting
- JANGAN gunakan Markdown, gunakan HTML saja
- Buat paragraf pendek-pendek (2-3 kalimat) agar mudah dibaca

GAYA PENULISAN:
- Mulai dengan kalimat pembuka yang menarik
- Jelaskan poin-poin dengan bahasa sederhana
- Berikan contoh nyata jika memungkinkan
- Akhiri dengan ringkasan atau ajakan bertindak`;
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

        // Use generateText instead of streamText for simpler response handling
        const { text } = await generateText({
            model: zai('glm-4.7'),
            messages: messages,
        });

        console.log("Generation complete, length:", text.length);

        // Return as JSON response
        return Response.json({ text });
    } catch (error) {
        console.error("AI Error:", error);
        return Response.json({ error: "Failed to generate content." }, { status: 500 });
    }
}
