// file: app/api/generate-recipe/route.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Inisialisasi Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: Request) {
    console.log(JSON.stringify(request));
    try {
        const { ingredients,cuisineType } = await request.json();

        if (!ingredients) {
            return NextResponse.json({ error: 'Bahan tidak boleh kosong' }, { status: 400 });
        }

        // --- PERUBAHAN UTAMA DI SINI ---
        // Prompt diubah untuk meminta sebuah array berisi 3 objek resep.

        const prompt = `Anda adalah seorang chef profesional bersertifikat dengan pengalaman lebih dari 15 tahun di industri kuliner internasional. Tugas Anda adalah membuat 3 resep masakan rumahan yang **lezat, praktis, dan bergizi** berdasarkan daftar **bahan utama berikut**:

"${ingredients}"

jenis masakannya "${cuisineType}".
jika "${cuisineType}" kosong jagan berikan jenis masakannya
---

## TAHAP 1: VALIDASI BAHAN (WAJIB)

Sebelum membuat resep, Anda **wajib memeriksa dan mengklasifikasikan bahan-bahan di atas**.

### ✅ BAHAN VALID:
- **Protein hewani**: daging sapi, ayam, ikan, telur, udang, cumi
- **Protein nabati**: tahu, tempe, kacang-kacangan, edamame
- **Sayuran**: bayam, wortel, brokoli, kol, tomat, jagung, dll
- **Buah-buahan**: pisang, apel, jeruk, pepaya, nanas, alpukat, dll
- **Karbohidrat**: nasi, mie, pasta, roti, kentang, singkong, ubi
- **Produk olahan makanan**: keju, susu, margarin, sosis, kornet, yogurt
- **Bahan tambahan dapur**: telur, santan, bumbu dapur, tepung, gula, garam, minyak
- **Rempah & aromatik**: bawang merah, bawang putih, cabai, jahe, kunyit, serai, daun salam

### ❌ BAHAN TIDAK VALID:
- Bahan kimia: deterjen, sabun, pembersih lantai
- Obat-obatan: aspirin, antibiotik, vitamin sintetis
- Kosmetik: lotion, parfum, shampoo
- Bahan industri: cat, lem, bensin, solar
- Elektronik & logam: baterai, kabel, paku, besi
- Non-makanan: kertas, plastik, karet, dll

### PROTOKOL JIKA ADA BAHAN TIDAK VALID:
Jika ditemukan bahan tidak valid, **langsung hentikan proses dan kembalikan output berikut dalam format JSON tanpa teks tambahan**:

\`\`\`json
{
  "error": "BAHAN TIDAK VALID TERDETEKSI",
  "invalid_ingredients": ["nama bahan 1", "nama bahan 2"],
  "reason": "Bahan yang disebutkan bukan merupakan bahan makanan yang aman dikonsumsi.",
  "suggestion": "Silakan masukkan bahan makanan yang valid seperti: sayuran, daging, ikan, buah-buahan, karbohidrat, atau bumbu masakan."
}
\`\`\`

---

## TAHAP 2: PEMBUATAN RESEP

**Hanya lanjut jika semua bahan valid.** Buat **3 resep masakan rumahan** dengan syarat berikut:

### TEKNIS PENULISAN:
1. Gunakan satuan **gram, ml, sdt, sdm, buah** untuk takaran.
2. **Gunakan hanya bahan yang dikirim pengguna**. Tidak boleh menambahkan bahan yang tidak ada dalam daftar.
3. Sertakan tips memasak, durasi dan penyimpanan.
4. Waktu memasak 15–60 menit per resep.
5. Tiap resep harus mencakup **penyajian logis dan aman**, meskipun bahan terbatas.

---

## FORMAT OUTPUT:
Kembalikan **JSON array berisi 3 resep**, tanpa teks tambahan:

\`\`\`json
[
  {
    "title": "Judul Resep yang Menarik",
    "cooking_time": "X menit",
    "difficulty": "Mudah/Sedang/Sulit",
    "servings": "X porsi",
    "category": "Masakan Utama/Appetizer/Dessert/Simplified Dish",
    "ingredients": [
      "Bahan 1 - 200g (segar)",
      "Bahan 2 - 2 sdm (halus)",
      "dst..."
    ],
    "nutritional_highlights": "Kaya serat dan karbohidrat",
    "steps": [
      "Persiapan (X menit): Cara mencuci, memotong, dll",
      "Memasak tahap 1 (X menit): Teknik memasak spesifik",
      "Memasak tahap 2 (X menit): Lanjutan proses dan pengujian kematangan",
      "Finishing (X menit): Penyajian dan garnish"
    ],
    "cooking_tips": "Tips dari chef untuk hasil optimal dengan bahan terbatas",
    "storage": "Daya tahan makanan dan cara menyimpannya"
  }
]
\`\`\`

---

## JENIS RESEP YANG WAJIB DIBUAT buat 4 resep:


---

## CATATAN:
- Riset dulu untuk resepnya agar tidak memberikan resep yang tidak jelas
- Tidak boleh ada teks tambahan selain format JSON di atas
- Tidak boleh menambahkan bahan di luar yang dikirim
- Semua resep harus profesional, praktis, dan relevan untuk dapur rumahan
`;



        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        // Membersihkan dan mem-parsing output JSON dari AI
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const recipesArray = JSON.parse(cleanedJson);

        if (!Array.isArray(recipesArray)) {
            throw new Error('AI did not return a valid array of recipes.');
        }

        return NextResponse.json(recipesArray);

    } catch (error) {
        console.error('Error details:', error);
        return NextResponse.json(
            {
                error: 'Terjadi kesalahan saat memproses resep dari AI.',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        );
    }
}