# 🎬 MovieMatch - Bir Sonraki Favori Filmini Keşfet

Tinder tarzı film keşif uygulaması. Next.js, React, Tailwind CSS ve TMDB API ile geliştirildi.

## ✨ Özellikler

- **Swipe Arayüzü**: Yumuşak kart tabanlı UI ile sürükle-kaydır
- **TMDB API**: Gerçek film verileri, posterler, puanlar ve açıklamalar
- **Akıllı Öneriler**: Beğendiğiniz türlere göre öğrenir ve önerir
- **Dil Seçimi**: Türkçe, İngilizce veya tüm diller
- **Dark Tema**: Premium glassmorphism tasarım
- **LocalStorage**: Beğenileriniz tarayıcıda saklanır
- **Mobil Uyumlu**: Tüm cihazlarda mükemmel çalışır

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- TMDB API Key (ücretsiz)

### TMDB API Key Alma

1. [TMDB'ye kaydolun](https://www.themoviedb.org/signup)
2. Hesap ayarlarından API bölümüne gidin
3. API Key (v3 auth) alın
4. `lib/api.ts` dosyasındaki `TMDB_API_KEY` değişkenine yapıştırın

### Kurulum Adımları

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. API key'inizi ekleyin:
`lib/api.ts` dosyasını açın ve şu satırı bulun:
```typescript
const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
```
`YOUR_TMDB_API_KEY` yerine kendi API key'inizi yazın.

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## 🎮 Nasıl Kullanılır

- **Sağa Kaydır** veya ❤️ butonu = Filmi beğen
- **Sola Kaydır** veya ✖️ butonu = Geç
- **Yukarı Kaydır** veya ℹ️ butonu = Detayları gör
- Uygulama beğenilerinizi öğrenir ve benzer türde filmler önerir

## 🛠️ Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Tip güvenli geliştirme
- **Tailwind CSS v4.2** - Modern CSS framework
- **Framer Motion** - Animasyonlar
- **Lucide React** - İkonlar
- **TMDB API** - Film veritabanı

## 📁 Proje Yapısı

```
moviematch/
├── app/
│   ├── globals.css       # Global stiller
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Ana sayfa
├── components/
│   ├── MovieCard.tsx     # Kaydırılabilir film kartı
│   └── MovieDetailsModal.tsx  # Film detay modal
├── lib/
│   ├── api.ts            # TMDB API entegrasyonu
│   └── storage.ts        # LocalStorage yönetimi
└── README.md
```

## 🔗 GitHub'a Bağlama

### Yeni repo oluştur:

```bash
cd moviematch
git remote add origin https://github.com/KULLANICI_ADINIZ/moviematch.git
git branch -M main
git push -u origin main
```

### GitHub CLI ile:

```bash
cd moviematch
gh repo create moviematch --public --source=. --remote=origin --push
```

## 📝 Komutlar

- `npm run dev` - Geliştirme sunucusu
- `npm run build` - Production build
- `npm start` - Production sunucu
- `npm run lint` - ESLint

## 🎨 Özelleştirme

- `app/globals.css` - Renk şemasını değiştir
- `lib/api.ts` - Film türlerini ve sorgularını düzenle
- `components/MovieCard.tsx` - Kart tasarımını değiştir

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

---

TMDB API ile geliştirildi ❤️
