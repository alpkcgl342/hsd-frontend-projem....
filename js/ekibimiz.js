/**
 * Ekibimiz sayfası - backend bağlantısı
 *
 * Kartlar HTML'e elle yazılmıştı. Artık GET /team ucundan çekiliyor ve
 * yönetim panelinden düzenlenebiliyor.
 *
 * Backend'e ulaşılamazsa sayfadaki mevcut statik kartlar korunur.
 */
document.addEventListener('DOMContentLoaded', function () {
  var bolum = document.getElementById('ekibimiz');
  if (!bolum || typeof HsdApi === 'undefined') return;

  var kap = bolum.querySelector('.max-w-7xl');
  if (!kap) return;

  var GRUPLAR = [
    {
      anahtar: 'ELCI',
      etiket: 'Elçi',
      rozetSinif: 'bg-yellow-100 text-yellow-700',
      kartSinif:
        'bg-white border-2 border-yellow-400 rounded-2xl p-8 text-center w-64 relative shadow-yellow-100 shadow-lg hover:-translate-y-2 transition-transform',
      cerceveSinif: 'w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden mx-auto mb-4',
      adSinif: 'font-bold text-blue-900',
      yildiz: true,
      sarmalSinif: 'flex justify-center mb-12',
    },
    {
      anahtar: 'ELCI_YARDIMCISI',
      etiket: 'Elçi Yardımcıları',
      rozetSinif: 'bg-blue-100 text-blue-800',
      kartSinif:
        'bg-white border border-blue-200 rounded-2xl p-6 text-center w-52 relative hover:-translate-y-2 transition-transform',
      cerceveSinif: 'w-20 h-20 rounded-full border-3 border-blue-800 overflow-hidden mx-auto mb-4',
      adSinif: 'font-bold text-blue-900 text-sm',
      yildiz: true,
      sarmalSinif: 'flex justify-center gap-6 mb-12 flex-wrap',
    },
    {
      anahtar: 'KULUP_BASKANI',
      etiket: 'Kulüp Başkanları',
      rozetSinif: 'bg-green-100 text-green-800',
      kartSinif:
        'bg-white border border-teal-200 rounded-2xl p-6 text-center w-52 hover:-translate-y-2 transition-transform',
      cerceveSinif: 'w-20 h-20 rounded-full overflow-hidden mx-auto mb-4',
      adSinif: 'font-bold text-blue-900 text-sm',
      yildiz: false,
      // 4 sütunlu ızgarada kişi sayısı 4'ün katı değilse kartlar sola
      // yaslanıp üstteki ortalı bölümlere göre kayık duruyordu. Ortalanmış
      // esnek dizilim her sayıda simetrik kalır.
      sarmalSinif: 'flex flex-wrap justify-center gap-6',
    },
  ];

  var UNVAN_ROZET = {
    ELCI: 'bg-yellow-100 text-yellow-700',
    ELCI_YARDIMCISI: 'bg-blue-100 text-blue-700',
    KULUP_BASKANI: 'bg-green-100 text-green-700',
  };

  function yedekAvatar(isim) {
    return (
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(isim) +
      '&background=0028a5&color=fff&size=120'
    );
  }

  function ayracOlustur(grup) {
    var satir = document.createElement('div');
    satir.className = 'flex items-center gap-4 mb-8';

    var sol = document.createElement('div');
    sol.className = 'flex-1 h-px bg-gradient-to-r from-transparent to-gray-200';

    var etiket = document.createElement('span');
    etiket.className =
      grup.rozetSinif + ' text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest';
    etiket.textContent = grup.etiket;

    var sag = document.createElement('div');
    sag.className = 'flex-1 h-px bg-gradient-to-l from-transparent to-gray-200';

    satir.appendChild(sol);
    satir.appendChild(etiket);
    satir.appendChild(sag);

    return satir;
  }

  function kartOlustur(kisi, grup) {
    var kart = document.createElement('div');
    kart.className = grup.kartSinif;

    if (grup.yildiz) {
      var yildiz = document.createElement('div');
      yildiz.className =
        'absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm';
      yildiz.textContent = '★';
      kart.appendChild(yildiz);
    }

    var cerceve = document.createElement('div');
    cerceve.className = grup.cerceveSinif;

    var gorsel = document.createElement('img');
    gorsel.className = 'w-full h-full object-cover';
    gorsel.alt = kisi.fullName;
    gorsel.src = kisi.photoUrl ? HsdApi.mediaUrl(kisi.photoUrl) : yedekAvatar(kisi.fullName);
    gorsel.addEventListener('error', function () {
      gorsel.src = yedekAvatar(kisi.fullName);
    });
    cerceve.appendChild(gorsel);

    var ad = document.createElement('h5');
    ad.className = grup.adSinif;
    // textContent: içerik HTML olarak yorumlanmaz (XSS koruması)
    ad.textContent = kisi.fullName;

    var unvan = document.createElement('span');
    unvan.className =
      (UNVAN_ROZET[kisi.group] || 'bg-blue-100 text-blue-700') +
      ' text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block';
    unvan.textContent = kisi.title;

    kart.appendChild(cerceve);
    kart.appendChild(ad);
    kart.appendChild(unvan);

    if (kisi.subtitle) {
      var alt = document.createElement('span');
      alt.className = 'block text-gray-400 text-xs italic mt-2';
      alt.textContent = kisi.subtitle;
      kart.appendChild(alt);
    }

    if (kisi.linkedinUrl) {
      var baglanti = document.createElement('a');
      baglanti.href = kisi.linkedinUrl;
      baglanti.target = '_blank';
      baglanti.rel = 'noopener noreferrer';
      baglanti.className = 'block text-blue-700 text-xs font-semibold mt-2 hover:underline';
      baglanti.textContent = 'LinkedIn →';
      kart.appendChild(baglanti);
    }

    return kart;
  }

  HsdApi.getTeam()
    .then(function (kisiler) {
      if (!Array.isArray(kisiler) || kisiler.length === 0) return;

      // Başlık bloğunu (h2 + açıklama + çizgi) koruyup altındakileri yenile
      var korunacak = Array.prototype.slice.call(kap.children, 0, 3);
      kap.innerHTML = '';
      korunacak.forEach(function (el) {
        kap.appendChild(el);
      });

      GRUPLAR.forEach(function (grup) {
        var grupKisileri = kisiler.filter(function (k) {
          return k.group === grup.anahtar;
        });

        if (grupKisileri.length === 0) return;

        kap.appendChild(ayracOlustur(grup));

        var sarmal = document.createElement('div');
        sarmal.className = grup.sarmalSinif;

        grupKisileri.forEach(function (kisi) {
          sarmal.appendChild(kartOlustur(kisi, grup));
        });

        kap.appendChild(sarmal);
      });
    })
    .catch(function (error) {
      console.warn('Ekip yüklenemedi, sayfadaki içerik gösteriliyor:', error.message);
    });
});
