---
name: reels-sinematik
description: Hazal'ın ham çekimlerinden sinematik, hızlı tempolu, grafikli Instagram Reels (9:16) montajı yapar — kelime kelime Türkçe altyazı, neon anahtar kelime başlıkları, kişinin arkasına giren grafikler, telefon mockup'ı, sıcak sinematik renk, whoosh geçişler. Remotion ile çalışır. Kullanıcı reels/kısa video editlemek, "Ada Büyük tarzı" / "davinci tarzı" montaj, reels grafiği veya altyazısı istediğinde kullan.
---

# Reels Sinematik

Referans stil: Ada Büyük'ün Gemini reels'i (Kasım 2026). Analizi aşağıda; amaç bu *dilde* montaj yapmak,
onu kopyalamak değil. Kendi renkleri/fontları için `assets/theme.ts`'i değiştir.

**Önce `remotion-best-practices` skill'ini yükle** — Remotion API kuralları (interpolate, Sequence, effects,
video-matting, captions) oradan gelir. Bu skill sadece stil + iş akışıdır.

## Proje

- Remotion projesi: `C:\Users\hazal\reels-studio` (Remotion 4.0.543, React 19, npm).
- Hazır bileşenler: `src/reels/components.tsx`, `src/reels/theme.ts`. Proje yoksa/kaybolduysa
  `npx create-video@latest --yes --blank --no-tailwind reels-studio`, sonra
  `npx remotion add @remotion/effects @remotion/google-fonts @remotion/media` ve bu skill'in `assets/` dosyalarını
  `src/reels/` altına kopyala (`get-mixkit-sfx.sh` → `scripts/`, sonra `bash scripts/get-mixkit-sfx.sh`).
- Her yeni reels için `src/reels/<kısa-ad>/` klasörü aç, `Root.tsx`'e ayrı `<Composition>` olarak ekle
  (1080x1920, 30 fps). Ham medya `public/<kısa-ad>/` altına.
- Bilgisayarda Python YOK. Her şeyi Node + ffmpeg ile yap (ffmpeg PATH'te var).

## Stil kuralları (referanstan çıkarıldı)

1. **Tempo:** ortalama ~2 s'de bir görüntü değişir. Her cümle = yeni çekim, yeni açı veya yeni grafik.
   Uzun tek çekimlerde her kesmede punch-in (1.0 ↔ 1.12 ölçek), vurucu cümlede yavaş push-in (+%4–8).
2. **Altyazı:** ekranda *tek kelime*, Montserrat 800, beyaz, ~78 px, hafif gölge, küçük pop (spring),
   y ≈ 1180 (yüzün altı, Instagram UI'ının üstü). Türkçe karakterler: `latin-ext` subset şart.
3. **Neon başlık:** konunun anahtar kavramı için (ör. "MOBİUS ŞERİDİ", "GEMİNİ NOTEBOOK"). Montserrat 900,
   ~130 px, sarı neon (#FFE45C + #FFC21A glow) veya beyaz glow; blur'dan girer, ilk 10 karede yanıp söner,
   büyüyüp blur'la çıkar. Türkçe büyük harf: `İ` (MOBİUS, ŞERİDİ) — `toLocaleUpperCase("tr")` kullan.
4. **Görsel metafor her cümlede:** cümle ne diyorsa ekranda o olur. Örnekler: "anlamıyorum" → kafanın
   üstünde yükleniyor simgesi; "sınav" → A+/F- kağıdı arkada süzülür; "podcast" → oynatıcı kartı;
   "bütçe" → ucuz noodle. Plan aşamasında bunları kullanıcıya öner.
5. **Kişinin arkasına grafik:** kart/görsel kişinin ARKASINDA durur → `@remotion/video-matting` (model
   `modnet`) ile ön plan WebM'i üret; sıra: orijinal video → grafik → ön plan. (remotion-best-practices →
   video-matting.md). GPU desteği yoksa `canUseVideoMatting` sebebini söyle, grafiği önde/yarı saydam koy.
6. **Ekran kaydı:** 3B eğik telefon mockup'ı içinde, koyu yeşil/teal arka plan, hafif dönüş + parallax.
   Masaüstü ekran kaydı için aynı mantıkla monitör/kart.
7. **Overlay katmanları:** sorular/metin kişinin yüzü üstünde yarı saydam akar + hafif chromatic aberration
   (`@remotion/effects/chromatic-aberration`).
8. **Geçişler:** whip (hareket bulanıklığı), kameraya el, sıcak flaş (`Flash`), 0.5 s'lik çok hızlı kesme
   patlaması (montaj "flash cut").
8b. **Ses efektleri (çok önemli — Hazal özellikle istiyor):** Ekranda olan HER görsel olayın bir sesi olur.
   Kütüphane `public/sfx/` — 67 **stüdyo kaydı** ses (Mixkit + birkaç Kenney CC0), adlar `<kategori>_<tür>`:
   pop_, whoosh_, impact_, riser_, magic_, ding_, fail_, ui_, typing_, camera_, glitch_, fx_.
   `src/reels/sfx.tsx` → `SFX_USE` hangi ses ne zaman; dinleme videosu `out/ses-katalogu.mp4`.
   `<Sequence from={...} durationInFrames={...}><Sfx name="pop_bubble-alert" volume={0.5}/></Sequence>`
   (uzun dosyaları — riser, typing, impact — `durationInFrames` ile kırp).
   Eşleştirme: altyazı/sticker/ikon → pop_bubble-alert / pop_dry; liste → pop_cluster; kart/mesaj → pop_message;
   grafik/geçiş girişi → whoosh_small-sweep / whoosh_quick-accent; whip/punch-in → whoosh_short-sweep;
   neon başlık → whoosh_impact veya impact_big-cinematic (+ magic_fairy-sparkle 0.3); açıklama öncesi →
   riser_trailer / riser_reverse-impact (kesmede biter); doğru/A+ → ding_correct-answer / ding_correct-reward;
   yanlış/F- → fail_wrong-answer; ekran görüntüsü → camera_digital-shutter; yazma → typing_*; zaman baskısı →
   kenney_clock-ticking; glitch overlay → glitch_quick; "geri saralım" → fx_tape-rewind.
   Seviye: sesin altında — pop/click 0.4–0.6, whoosh 0.4–0.5, impact 0.5, sparkle/ding 0.3–0.45. Whoosh'un tepe
   noktası görüntü değişimine denk gelsin (ses ~0.15–0.25 s önce başlar). Her kelimeye pop koyma: dakikada
   ~15–25 efekt yeterli, yoksa yorucu olur.
   **Sentetik (ffmpeg ile üretilmiş) ses KULLANMA** — Hazal hışırtılı buldu, reddetti. Yeni ses gerekirse:
   `node scripts/mixkit-list.mjs <kategori>` ile Mixkit'te ara (kategori = mixkit.co/free-sound-effects/<slug>/),
   id + ad'ı `scripts/get-mixkit-sfx.sh` listesine ekle, script'i çalıştır, kataloğu yenile. Kütüphane
   kaybolursa aynı script yeniden indirir. **CapCut kütüphanesinden ses çıkarma, telifli meme sesleri
   (SpongeBob, Windows XP, Minecraft vb.) kullanma** — özellikle reklam/sponsorlu içerikte.
9. **Renk:** sıcak tungsten pratik ışıklar, teal/yeşil gölgeler, yüksek kontrast, vinyet, ince grain
   (`Grade` bileşeni; video üstünde `colorCorrection()`/`lut()` tercih et).
10. **CTA:** sarı, kalın, glow'lu, altyazının altında (y ≈ 1330); gerekiyorsa en alta küçük beyaz not satırı.
11. **Güvenli alan:** kenarlardan 90 px, üstten 220 px; alttan 420 px ve sağdan 140 px Instagram UI'ı kaplar.

## İş akışı

Başta bir görev listesi yap. Kontrol noktalarında kullanıcıyı bekle.

1. **Girdi:** ham klipler klasörü, (varsa) senaryo, ekran kayıtları, marka/CTA metni, müzik. Klipleri
   `public/<ad>/` altına kopyala (orijinallere dokunma).
2. **Analiz:** `ffprobe` ile süre/çözünürlük/fps; her klipten 0.5 s'de bir kare contact sheet
   (`ffmpeg -vf "fps=2,scale=270:-2,tile=6x3"`) — kendin bak, ne çekildiğini öğren.
3. **Transkript:** `@remotion/whisper-webgpu` ile kelime zamanlı transkript (çok dilli model, dil `tr`;
   remotion-captions/transcribe-captions.md). GPU yoksa söyle ve alternatif sor. Sessizlikler için
   silence-detection.md.
4. **Kreatif plan (KONTROL NOKTASI):** cümle cümle tablo — zaman, söz, çekim/klip, kesme/punch-in,
   grafik/metafor, SFX. Neon başlık olacak 2–4 anahtar kavramı seç. Kullanıcı onaylamadan render alma.
5. **Montaj:** tekrarları/yanlış başlangıçları/boşlukları kes, `Sequence` + `trimBefore` ile klipleri diz.
6. **Matting** (gerekiyorsa) → `public/<ad>/fg_*.webm`.
7. **Grafikler + altyazı + renk + SFX** — `components.tsx` bileşenlerini kullan, yeni bir şey gerekirse
   oraya ekle (sonraki reels'lerde de kullanılsın; skill'in `assets/` kopyasını da güncelle).
8. **Kontrol:** `npx remotion still <id> out/<ad>/f<N>.png --frame=N` ile 6–10 kare al, ffmpeg `hstack` ile
   tek görselde birleştirip kendin bak: taşan yazı, güvenli alan, Türkçe karakter, grafik-altyazı çakışması.
   İsterse Studio: `npx remotion studio`.
9. **Render:** `npx remotion render <id> out/<ad>.mp4` (H.264, 1080x1920, 30 fps). Dosya yolunu ve
   değişiklik özetini ver.

## Kurallar

- Animasyonlar sadece `useCurrentFrame()` + `interpolate()`/`spring()` ile; CSS animation/transition çalışmaz.
- `transform` yerine `scale`/`translate`/`rotate` CSS özellikleri.
- Başkasının videosunu (referans reels) montaj malzemesi olarak kullanma; sadece stil referansı.
- Remotion lisansı: 3 kişiye kadar ekipler/bireyler için ücretsiz; daha büyük şirket kullanımında lisans gerekir.

## İkinci stil: Çizgi karakter anlatımı (çekimsiz, seslendirmeli)

Referans: illüstrasyonlu "maskot anlatıyor" reels'leri (Kasım 2026). Kit: `src/reels/cizgi/kit.tsx`
(skill kopyası `assets/cizgi-kit.tsx`), örnek: `src/reels/telefon/`.
- Karakterler BİZİM: **Bit** (ekran yüzlü robot) ve **Cep** (telefon arkadaşı); yüz: normal/happy/angry/shock/wink/side,
  kol açıları, `hold` ile elde eşya. Başkasının maskotunu kopyalama.
- Her cümle = bir sahne (`Room` duvar rengi + desen, zemin y=1185), üstte `TapeLabel` (bantlı kağıt başlık),
  altta `TagCaptions` (Bitter serif, somon etiketlerde biriken 1–3 kelime, y=1300). `Card`, `Bubble`, `Stamp`,
  `Sunburst`, `Clock`, `PaperGrain`.
- Ses: ElevenLabs. Metin `src/reels/<ad>/script.json` (`scenes[]` = sahne başına cümle, `voiceId`),
  `node scripts/tts-eleven.mjs <ad>` → `public/<ad>/voice.mp3` + `voice.json` (kelime zamanları, sahne no).
  Anahtar `reels-studio/.env` → `ELEVENLABS_API_KEY=` (git'e girmez). Anahtar yoksa `--fake` ile tahmini zamanlama.
  `--voices` sesleri listeler. Sahne ve olay zamanları `wAt(sahne, "kelime")` ile sese bağlı → metin değişince her şey kayar.
- Konu: keşfete düşen, merak/şok kancalı, doğrulanabilir bilgi; kaynakları kodda yorum olarak tut. CTA paylaşım odaklı.

## Üçüncü format: DeployTv haftalık teknoloji bülteni (YouTube 16:9 + reels)

- Şablon `src/reels/haber/Bulten.tsx` — tek bölüm = `src/reels/<bolum>/script.json`: `{ voiceId, date, scenes: [{ text, tag,
  headline, title, accent, img?, fit?, imgBg?, src, items: [...] }] }`. Öğe türleri: chip, big (sayaç), stamp, ticker,
  steps, bars; her biri `at: "kelime"` ile sese bağlı (Türkçe büyük I/İ küçülünce değişir — "IMEI", "API" gibi
  kelimelere bağlama). `Root.tsx`'e `Bulten` + defaultProps ile kaydet.
- Ses: `node scripts/tts-eleven.mjs <bolum>` + `node scripts/envelope.mjs public/<bolum>/voice.mp3 src/reels/<bolum>/envelope.json`
  (Bit sunucunun dudak senkronu). Model `eleven_v4`; varsayılan ses Seyfullah Kartal `mF7tIc9VLrznhGooGjaT` (ikinci erkek: Doğa `ctoYieZ4J7WwcdhujpMq`, kadın: Derya `NNn9dv8zq2kUo7d3JSGG`). Başka ses/model seçme.
- Haberler: birincil kaynak / büyük ajans; sadece bülten/agregatörde geçeni ALMA. "Raporlara göre" ayrımını koru.
- Görseller: Wikimedia Commons API (PD/CC0/CC BY) → `public/<bolum>/img/` + `CREDITS.json`; atıf panelde otomatik.
  Commons API hız sınırı var: tek istekte `titles=A|B|C` ile toplu sorgula.
