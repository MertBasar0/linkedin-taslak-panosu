# LinkedIn Taslak Panosu

Yayınlanmamış LinkedIn paylaşımlarının metnini, görselini ve videosunu telefondan
veya herhangi bir cihazdan tek adresten görmek için kurulmuş statik şablon site.
GitHub Pages üzerinden servis edilir; sunucu, veritabanı veya derleme adımı yok.

## Ne yapar

- Paylaşım metnini tam hâliyle gösterir, tek tuşla panoya kopyalar
- Görseli ve videoyu gömülü olarak oynatır, indirme bağlantısı verir
- ALT (alternatif) metnini ayrı kopyalanabilir alanda tutar
- Yayın kurallarını, kontrol listesini ve doğrulama kaynağını gösterir
- Elenen görsel adaylarını arşiv olarak saklar

## Yeni paylaşım eklemek

1. Metni `veri/paylasim-N-metin.txt` olarak kaydet (LinkedIn'e girecek hâliyle, düz metin).
2. Medyayı `medya/paylasim-N/` altına koy.
3. `veri/paylasimlar.json` içindeki `paylasimlar` dizisine bir kayıt ekle.

Kayıt alanları:

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `id` | evet | Benzersiz kısa ad, örn. `paylasim-4` |
| `baslik` | evet | Paylaşım başlığı |
| `metinDosyasi` | hayır | Metin dosyasının yolu |
| `gorsel` | hayır | `{dosya, ad, olcu, not}` |
| `video` | hayır | `{dosya, ad, olcu, not}` |
| `altMetni` | hayır | Erişilebilirlik metni |
| `uyari` / `yerlesim` | hayır | Yayın notları |
| `kontrolListesi` | hayır | Metin dizisi |
| `kaynak` | hayır | `{alinti, url, not}` |
| `arsiv` | hayır | `{dosya, ad, not}` dizisi |

HTML'e dokunmak gerekmez; sayfa JSON'dan üretilir.

## Yerelde açmak

Tarayıcı `file://` üzerinden veri dosyalarını okumaz. Yerel önizleme için:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Gizlilik

Depo herkese açık — GitHub Pages ücretsiz hesapta özel depo yayınlamaz.
`robots.txt` ve `noindex` etiketi arama motorlarına kapatır, ancak **adresi bilen
herkes içeriği görebilir**. Yayınlanmamış taslak buraya konurken bu bilinerek konur.
