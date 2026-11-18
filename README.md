# shorts-skilss — DeployTv video sistemi

Claude Code + Remotion ile çalışan, yapay zeka destekli teknoloji haberi kanalı altyapısı:
haftalık 15 dakikalık YouTube bülteni, ondan kesilen Shorts/Reels'ler ve ham çekimlerden sinematik reels kurgusu.

## İçerik

| Klasör | Ne var |
|---|---|
| `skills/reels-sinematik/` | Claude Code skill'i (`SKILL.md` + bileşen kopyaları). `~/.claude/skills/` altına kopyala. |
| `src/reels/haber/Bulten.tsx` | Veriyle çalışan haftalık bülten şablonu (16:9) ve dikey Shorts düzeni (`BultenDikey`) |
| `src/reels/cizgi/kit.tsx` | Çizgi robot sunucu, yüz sticker'ı, altyazı bileşenleri |
| `src/reels/sistem/` | Ham çekimden reels kurgusu (tam + 60 sn) |
| `src/reels/deploytv-*/script.json` | Bölüm senaryoları (sahne metni + başlık + ekrana gelen öğeler) |
| `scripts/tts-eleven.mjs` | ElevenLabs seslendirme + kelime zamanları (eleven_v3 duygu etiketleri destekli) |
| `scripts/stt-eleven.mjs` | ElevenLabs konuşma→metin (ham çekim transkripti) |
| `scripts/kes-short.mjs` | Bölümden Shorts kesiti (yeni seslendirme gerekmez) |
| `scripts/sistem-edl.mjs` | Transkriptten kurgu listesi: "eee"ler ve boşluklar atılır |
| `scripts/get-mixkit-sfx.sh` | Ses efekti kütüphanesini Mixkit'ten indirir |

## Kurulum

```bash
npm install
cp .env.example .env          # ElevenLabs anahtarını ve ses kimliğini yaz
bash scripts/get-mixkit-sfx.sh  # ses efektleri -> public/sfx
npx remotion studio
```

## Repoda olmayanlar (bilerek)

- `.env` ve her türlü anahtar
- `public/` altındaki medya: ham çekimler, yüz fotoğrafları, seslendirme dosyaları, haber görselleri
  (görsellerin kaynak ve lisansları `public/*/img/CREDITS.json` içinde)
- Mixkit ses dosyaları (lisans yeniden dağıtıma izin vermiyor; script ile indirilir)
- Render çıktıları (`out/`)

Bu yüzden bölümleri render etmek için kendi seslendirmeni (`node scripts/tts-eleven.mjs <bölüm>`) ve görsellerini üretmen gerekir.
