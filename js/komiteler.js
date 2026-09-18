/**
 * Komiteler sayfası - backend bağlantısı
 *
 * Komite kartları HTML'e elle yazılmıştı. Artık GET /committees ucundan
 * çekiliyor; her komitenin üye sayısı da gösteriliyor.
 *
 * Emoji ve tema rengi artık backend'den geliyor (yönetim panelinden
 * düzenlenebilir). Eski kayıtlarda bu alanlar boşsa komite adına göre
 * eşleşen bir tema kullanılır.
 *
 * Backend'e ulaşılamazsa sayfadaki mevcut statik kartlar korunur.
 */
document.addEventListener('DOMContentLoaded', function () {
  var bolum = document.getElementById('komiteler-section');
  if (!bolum || typeof HsdApi === 'undefined') return;

  var grid = bolum.querySelector('.grid');
  if (!grid) return;

  var TEMALAR = [
    { anahtar: ['sosyal', 'medya', 'içerik', 'icerik'], ikon: '📱', renk: 'pink' },
    { anahtar: ['organizasyon', 'etkinlik'], ikon: '🎪', renk: 'green' },
    { anahtar: ['sponsor', 'dış ilişkiler', 'dis iliskiler'], ikon: '🤝', renk: 'yellow' },
    { anahtar: ['yazılım', 'yazilim', 'teknik', 'geliştirme', 'gelistirme'], ikon: '💻', renk: 'blue' },
    { anahtar: ['tasarım', 'tasarim', 'grafik'], ikon: '🎨', renk: 'purple' },
    { anahtar: ['eğitim', 'egitim', 'akademi'], ikon: '📚', renk: 'indigo' },
  ];

  var VARSAYILAN_TEMA = { ikon: '👥', renk: 'blue' };

  // komite-detay.html içindeki statik ekip sayfalarının anahtarları
  var STATIK_ANAHTARLAR = {
    'sosyal-medya': ['sosyal', 'medya'],
    organizasyon: ['organizasyon'],
    sponsorluk: ['sponsor'],
    teknik: ['teknik', 'yazılım', 'yazilim', 'ar-ge'],
    medium: ['medium'],
  };

  function statikAnahtarBul(ad) {
    var kucuk = (ad || '').toLocaleLowerCase('tr');

    for (var anahtar in STATIK_ANAHTARLAR) {
      if (!Object.prototype.hasOwnProperty.call(STATIK_ANAHTARLAR, anahtar)) continue;

      var kelimeler = STATIK_ANAHTARLAR[anahtar];
      for (var i = 0; i < kelimeler.length; i++) {
        if (kucuk.indexOf(kelimeler[i]) !== -1) return anahtar;
      }
    }

    return null;
  }

  function temaBul(komite) {
    // Yönetim panelinde belirlenen değerler önceliklidir.
    if (komite.icon || komite.color) {
      return {
        ikon: komite.icon || VARSAYILAN_TEMA.ikon,
        renk: komite.color || VARSAYILAN_TEMA.renk,
      };
    }

    var kucuk = (komite.name || '').toLocaleLowerCase('tr');

    for (var i = 0; i < TEMALAR.length; i++) {
      for (var j = 0; j < TEMALAR[i].anahtar.length; j++) {
        if (kucuk.indexOf(TEMALAR[i].anahtar[j]) !== -1) return TEMALAR[i];
      }
    }

    return VARSAYILAN_TEMA;
  }

  function kartOlustur(komite, sira) {
    var tema = temaBul(komite);
    var uyeSayisi = Array.isArray(komite.members) ? komite.members.length : 0;

    var dis = document.createElement('div');
    dis.className = 'komite-kart';
    dis.setAttribute('data-aos', 'fade-up');
    dis.setAttribute('data-aos-delay', String(Math.min(sira * 100, 400)));

    var ic = document.createElement('div');
    ic.className =
      'komite-kart-inner bg-white border border-gray-200 rounded-3xl p-8 flex flex-col h-full shadow-sm';

    var ust = document.createElement('div');
    ust.className = 'flex items-center gap-5 mb-6';

    var ikon = document.createElement('div');
    ikon.className =
      'w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-' +
      tema.renk +
      '-500/10';
    ikon.textContent = tema.ikon;

    var baslik = document.createElement('h3');
    baslik.className = 'text-gray-900 text-2xl font-bold leading-snug';
    baslik.textContent = komite.name;

    ust.appendChild(ikon);
    ust.appendChild(baslik);

    var aciklama = document.createElement('p');
    aciklama.className = 'text-gray-400 text-sm leading-relaxed flex-1';
    aciklama.textContent = komite.description || '';

    var alt = document.createElement('div');
    alt.className = 'mt-6 pt-5 border-t border-gray-100 flex items-center justify-between';

    var baglanti = document.createElement('a');
    // Elle hazırlanmış ekip sayfaları (fotoğraf, bölüm, LinkedIn) korunsun diye
    // statik karşılığı olan komitelerde o sayfaya yönlendiriyoruz; yoksa
    // üyeler backend'den çekilir.
    var statikAnahtar = komite.slug || statikAnahtarBul(komite.name);
    baglanti.href =
      'komite-detay.html?id=' +
      encodeURIComponent(komite.id) +
      (statikAnahtar ? '&komite=' + encodeURIComponent(statikAnahtar) : '');
    baglanti.className =
      'inline-flex items-center gap-2 text-' +
      tema.renk +
      '-500 font-bold text-sm hover:gap-3 transition-all';
    baglanti.textContent = 'Ekibi Gör →';

    var sayac = document.createElement('span');
    sayac.className = 'text-gray-400 text-xs font-medium';
    sayac.textContent = uyeSayisi + ' üye';

    alt.appendChild(baglanti);
    alt.appendChild(sayac);

    ic.appendChild(ust);
    ic.appendChild(aciklama);
    ic.appendChild(alt);
    dis.appendChild(ic);

    return dis;
  }

  HsdApi.getCommittees()
    .then(function (komiteler) {
      if (!Array.isArray(komiteler) || komiteler.length === 0) return;

      grid.innerHTML = '';
      komiteler.forEach(function (komite, i) {
        grid.appendChild(kartOlustur(komite, i));
      });

      if (typeof AOS !== 'undefined') AOS.refresh();
    })
    .catch(function (error) {
      console.warn('Komiteler yüklenemedi, sayfadaki içerik gösteriliyor:', error.message);
    });
});
