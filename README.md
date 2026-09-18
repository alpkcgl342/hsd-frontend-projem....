# HSD Gelişim — Tanıtım Sitesi

İstanbul Gelişim Üniversitesi Huawei Student Developers topluluğunun tanıtım sitesi.

## Backend bağlantısı

Site artık backend'e bağlı. API adresi `js/api.js` içinde belirlenir ve
varsayılan olarak `http://localhost:3000` kullanılır.

Adresi değiştirmenin iki yolu var:

**1. Sayfada tanımlayarak** (yayına alırken önerilen) — `js/api.js`'ten **önce**:

```html
<script>window.HSD_API_URL = "https://api.hsd-gelisim.com";</script>
<script src="js/api.js"></script>
```

**2. Tarayıcı konsolundan** (geliştirme sırasında):

```js
localStorage.setItem("hsdApiUrl", "http://localhost:3000");
```

## Hangi sayfa neyi çekiyor?

| Sayfa | Uç nokta | Davranış |
|---|---|---|
| `iletisim.html` | `POST /contact` | Form gerçekten gönderilir |
| `duyurular.html` | `GET /announcements` | Duyurular backend'den gelir |
| `blog.html` | `GET /blog` | Yayımlanmış yazılar listenin başına eklenir |
| `blog-detay.html` | `GET /blog/:id` | Yazı detayı, görüntülenme sayacını artırır |
| `komiteler.html` | `GET /committees` | Komiteler ve üye sayıları |
| `komite-detay.html` | `GET /committees/:id/members` | Yalnızca statik karşılığı olmayan komiteler için |

Backend'e ulaşılamazsa sayfalardaki mevcut statik içerik olduğu gibi gösterilir;
site hiçbir durumda boş kalmaz. Tek istisna iletişim formudur: gönderilemezse
kullanıcıya açıkça hata gösterilir ve form temizlenmez.

### Elle hazırlanmış ekip sayfaları

`komite-detay.html` içindeki komite verisi üye fotoğrafı, bölüm ve LinkedIn
bilgisi içerir; backend'de bu alanlar yok. Bu yüzden statik komiteler
(`?komite=teknik` gibi) olduğu gibi bırakılmıştır. Backend'e sonradan eklenen
ve statik listede karşılığı olmayan komiteler `?id=` ile açılır ve üyeleri
API'den çekilir.

## Yerel çalıştırma

Sayfalar `file://` ile açıldığında tarayıcı CORS nedeniyle API isteklerini
engeller. Bir statik sunucu üzerinden açın:

```bash
npx serve -l 5500
```

Backend'in `CORS_ORIGINS` ayarında bu adresin (`http://localhost:5500`) ekli
olması gerekir.

## Yayına almadan önce

- [ ] `window.HSD_API_URL` gerçek API adresine ayarlanmalı
- [ ] Backend'de `CORS_ORIGINS` sitenin alan adını içermeli
- [ ] Backend `.env` dosyasındaki `JWT_SECRET` / `JWT_REFRESH_SECRET` üretilmiş olmalı
