/**
 * Duyurular sayfası - backend bağlantısı
 *
 * Kartlar HTML'e elle gömülüydü; yeni bir duyuru eklemek için dosyayı
 * düzenlemek gerekiyordu. Artık GET /announcements ucundan çekiliyor.
 *
 * Sayfadaki inline filtre kodu kart listesini açılışta bir kez yakalıyor
 * ve aradığı ".title" / ".body" / "data-tarih" alanları statik kartlarda
 * bulunmadığı için arama ve sıralama zaten çalışmıyordu. Bu yüzden
 * filtre/arama/sıralama burada yeniden kuruluyor.
 *
 * Backend'e ulaşılamazsa sayfadaki statik kartlar olduğu gibi kalır.
 */
document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('duyuru-grid');
  if (!grid || typeof HsdApi === 'undefined') return;

  // Backend enum'u -> sayfadaki filtre anahtarı ve rozet görünümü
  var KATEGORILER = {
    GENERAL: { anahtar: 'duyuru', etiket: 'Duyuru', sinif: 'bg-green-100 text-green-800' },
    EVENT: { anahtar: 'etkinlik', etiket: 'Etkinlik', sinif: 'bg-blue-100 text-blue-800' },
    EDUCATION: { anahtar: 'egitim', etiket: 'Eğitim', sinif: 'bg-yellow-100 text-yellow-800' },
    PROJECT: { anahtar: 'proje', etiket: 'Proje', sinif: 'bg-purple-100 text-purple-800' },
  };

  var VARSAYILAN = KATEGORILER.GENERAL;
  var kartlar = [];

  function tarihFormatla(isoTarih) {
    try {
      return new Date(isoTarih).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  function kartOlustur(duyuru, sira) {
    var kategori = KATEGORILER[duyuru.category] || VARSAYILAN;

    var kart = document.createElement('div');
    kart.className = 'duyuru-kart bg-white border border-gray-200 rounded-xl p-5';
    kart.setAttribute('data-kategori', kategori.anahtar);
    // Sıralamanın çalışabilmesi için tarih karta yazılır.
    kart.setAttribute('data-tarih', duyuru.createdAt);
    kart.setAttribute('data-aos', 'fade-up');
    kart.setAttribute('data-aos-delay', String(Math.min(sira * 80, 400)));

    var ust = document.createElement('div');
    ust.className = 'flex justify-between items-start mb-2';

    var rozet = document.createElement('span');
    rozet.className = 'text-xs font-semibold px-3 py-1 rounded-full ' + kategori.sinif;
    rozet.textContent = kategori.etiket;

    var tarih = document.createElement('span');
    tarih.className = 'text-xs text-gray-400';
    tarih.textContent = tarihFormatla(duyuru.createdAt);

    ust.appendChild(rozet);
    ust.appendChild(tarih);

    // "title" ve "body" sınıfları aramanın çalışması için gerekli.
    var baslik = document.createElement('p');
    baslik.className = 'title font-semibold text-sm text-gray-800 mb-1';
    // textContent: içerik HTML olarak yorumlanmaz (XSS koruması)
    baslik.textContent = duyuru.title;

    var icerik = document.createElement('p');
    icerik.className = 'body text-sm text-gray-500';
    icerik.textContent = duyuru.content;

    kart.appendChild(ust);
    kart.appendChild(baslik);
    kart.appendChild(icerik);

    return kart;
  }

  // --- Filtre / arama / sıralama ---

  function sayaclariGuncelle(gorunenler) {
    var eslesme = {
      toplamSayi: gorunenler.length,
      etkinlikSayi: gorunenler.filter(function (k) {
        return k.dataset.kategori === 'etkinlik';
      }).length,
      egitimSayi: gorunenler.filter(function (k) {
        return k.dataset.kategori === 'egitim';
      }).length,
      projeSayi: gorunenler.filter(function (k) {
        return k.dataset.kategori === 'proje';
      }).length,
    };

    Object.keys(eslesme).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = eslesme[id];
    });
  }

  function yenidenCiz() {
    var aktifBtn = document.querySelector('.filtre-btn.aktif');
    var aktifKategori = (aktifBtn && aktifBtn.dataset.kategori) || 'tumu';

    var aramaEl = document.getElementById('searchInput');
    var arama = aramaEl ? aramaEl.value.toLocaleLowerCase('tr').trim() : '';

    var siralamaEl = document.getElementById('sortSelect');
    var siralama = siralamaEl ? siralamaEl.value : 'yeni';

    var gorunenler = kartlar.filter(function (kart) {
      var kategoriUyar = aktifKategori === 'tumu' || kart.dataset.kategori === aktifKategori;

      var baslikEl = kart.querySelector('.title');
      var govdeEl = kart.querySelector('.body');
      var baslik = baslikEl ? baslikEl.textContent.toLocaleLowerCase('tr') : '';
      var govde = govdeEl ? govdeEl.textContent.toLocaleLowerCase('tr') : '';
      var aramaUyar = arama === '' || baslik.indexOf(arama) !== -1 || govde.indexOf(arama) !== -1;

      return kategoriUyar && aramaUyar;
    });

    gorunenler.sort(function (a, b) {
      var tA = new Date(a.dataset.tarih).getTime();
      var tB = new Date(b.dataset.tarih).getTime();
      if (isNaN(tA) || isNaN(tB)) return 0;
      return siralama === 'yeni' ? tB - tA : tA - tB;
    });

    kartlar.forEach(function (k) {
      k.classList.add('gizli');
      k.style.order = '';
    });
    gorunenler.forEach(function (k, i) {
      k.classList.remove('gizli');
      k.style.order = i;
    });

    var bosMesaj = document.getElementById('bos-mesaj');
    if (bosMesaj) bosMesaj.style.display = gorunenler.length === 0 ? 'block' : 'none';

    sayaclariGuncelle(gorunenler);
  }

  // Sayfadaki inline kod eski kart listesini kapsıyor. Kontrolleri
  // klonlayarak eski dinleyicileri kaldırıp yenilerini bağlıyoruz.
  function kontrolleriYenidenBagla() {
    document.querySelectorAll('.filtre-btn').forEach(function (btn) {
      var yeni = btn.cloneNode(true);
      btn.parentNode.replaceChild(yeni, btn);

      yeni.addEventListener('click', function () {
        document.querySelectorAll('.filtre-btn').forEach(function (b) {
          b.classList.remove('aktif');
        });
        yeni.classList.add('aktif');
        yenidenCiz();
      });
    });

    var arama = document.getElementById('searchInput');
    if (arama) {
      var yeniArama = arama.cloneNode(true);
      arama.parentNode.replaceChild(yeniArama, arama);

      var zamanlayici;
      yeniArama.addEventListener('input', function () {
        clearTimeout(zamanlayici);
        zamanlayici = setTimeout(yenidenCiz, 250);
      });
    }

    var siralama = document.getElementById('sortSelect');
    if (siralama) {
      var yeniSiralama = siralama.cloneNode(true);
      siralama.parentNode.replaceChild(yeniSiralama, siralama);
      yeniSiralama.addEventListener('change', yenidenCiz);
    }
  }

  HsdApi.getAnnouncements()
    .then(function (duyurular) {
      if (!Array.isArray(duyurular) || duyurular.length === 0) return;

      grid.innerHTML = '';
      duyurular.forEach(function (duyuru, i) {
        grid.appendChild(kartOlustur(duyuru, i));
      });

      kartlar = Array.prototype.slice.call(grid.querySelectorAll('.duyuru-kart'));
      kontrolleriYenidenBagla();
      yenidenCiz();

      if (typeof AOS !== 'undefined') AOS.refresh();
    })
    .catch(function (error) {
      // Statik kartlar sayfada kalır; kullanıcı boş ekran görmez.
      console.warn('Duyurular yüklenemedi, sayfadaki içerik gösteriliyor:', error.message);
    });
});
