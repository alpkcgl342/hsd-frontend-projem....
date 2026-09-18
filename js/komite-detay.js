/**
 * Komite detay sayfası - backend bağlantısı
 *
 * Üyeler GET /committees/:id/members ucundan gelir; fotoğraf, bölüm ve
 * LinkedIn bilgisi dâhil her şey yönetim panelinden düzenlenebilir.
 *
 * Sayfadaki inline script açılışta statik KOMITELER verisini çizer.
 * Bu dosya API cevabı gelince üzerine yazar. API'ye ulaşılamazsa statik
 * içerik ekranda kalır, yani sayfa hiçbir durumda boş görünmez.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof HsdApi === 'undefined') return;

  var params = new URLSearchParams(window.location.search);
  var komiteId = params.get('id');
  var statikAnahtar = params.get('komite');

  var grid = document.getElementById('uyeGrid');
  if (!grid) return;

  // Yönetim panelinde tema rengi Tailwind adıyla tutulur; sayfadaki
  // kenarlık ve rozetler ise doğrudan renk kodu kullanıyor.
  var RENK_KODU = {
    blue: '#0a58ca',
    pink: '#e91e8c',
    green: '#00897b',
    yellow: '#f57c00',
    purple: '#6c3fc5',
    teal: '#00b074',
    indigo: '#4f46e5',
    red: '#dc2626',
  };

  var VARSAYILAN_RENK = '#0a58ca';

  var ROL_ETIKET = {
    BASKAN: 'Başkan',
    YONETIM_KURULU: 'Yönetim Kurulu',
    UYE: 'Üye',
  };

  function avatarUrl(isim, mevcutUrl, renk) {
    if (mevcutUrl) return HsdApi.mediaUrl(mevcutUrl);
    return (
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(isim) +
      '&background=' +
      renk.replace('#', '') +
      '&color=fff&size=120'
    );
  }

  // --- MODAL ---
  // Sayfadaki inline modal yeniden kullanılır; içeriği burada üretilir.

  function modalAc(uye, renk) {
    var modal = document.getElementById('modal');
    var icerik = document.getElementById('modalIcerik');
    if (!modal || !icerik) return;

    icerik.innerHTML = '';

    var cerceve = document.createElement('div');
    cerceve.className = 'w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 border-4';
    cerceve.style.borderColor = renk;

    var gorsel = document.createElement('img');
    gorsel.className = 'w-full h-full object-cover';
    gorsel.alt = uye.fullName;
    gorsel.src = avatarUrl(uye.fullName, uye.photoUrl, renk);
    gorsel.addEventListener('error', function () {
      gorsel.src = avatarUrl(uye.fullName, null, renk);
    });
    cerceve.appendChild(gorsel);

    var ad = document.createElement('h3');
    ad.className = 'text-xl font-bold text-gray-900 dark:text-white mb-1';
    ad.textContent = uye.fullName;

    icerik.appendChild(cerceve);
    icerik.appendChild(ad);

    if (uye.department) {
      var bolum = document.createElement('span');
      bolum.className = 'text-sm font-medium px-4 py-1 rounded-full inline-block mb-4';
      bolum.style.background = renk + '20';
      bolum.style.color = renk;
      bolum.textContent = uye.department;
      icerik.appendChild(bolum);
    }

    if (uye.linkedinUrl) {
      var sarmal = document.createElement('div');
      sarmal.className = 'mt-4';

      var baglanti = document.createElement('a');
      baglanti.href = uye.linkedinUrl;
      baglanti.target = '_blank';
      baglanti.rel = 'noopener noreferrer';
      baglanti.className =
        'inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-full transition';
      baglanti.textContent = 'LinkedIn Profili →';

      sarmal.appendChild(baglanti);
      icerik.appendChild(sarmal);
    } else {
      var yok = document.createElement('p');
      yok.className = 'text-sm text-gray-400 mt-2';
      yok.textContent = 'LinkedIn profili henüz eklenmedi.';
      icerik.appendChild(yok);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // --- ÜYE KARTI ---

  function uyeKarti(uye, renk) {
    var kart = document.createElement('div');
    kart.className =
      'uye-kart bg-white dark:bg-[#1a1e23] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center';

    var cerceve = document.createElement('div');
    cerceve.className = 'w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2';
    cerceve.style.borderColor = renk;

    var gorsel = document.createElement('img');
    gorsel.className = 'w-full h-full object-cover';
    gorsel.alt = uye.fullName;
    gorsel.src = avatarUrl(uye.fullName, uye.photoUrl, renk);
    gorsel.addEventListener('error', function () {
      gorsel.src = avatarUrl(uye.fullName, null, renk);
    });
    cerceve.appendChild(gorsel);

    var ad = document.createElement('h5');
    ad.className = 'font-bold text-blue-900 dark:text-white text-sm mb-2';
    // textContent: içerik HTML olarak yorumlanmaz (XSS koruması)
    ad.textContent = uye.fullName;

    kart.appendChild(cerceve);
    kart.appendChild(ad);

    // Bölüm yoksa görevi göster; kart hiçbir zaman boş kalmasın.
    var rozet = document.createElement('span');
    rozet.className = 'text-xs font-medium px-3 py-1 rounded-full inline-block';
    rozet.style.background = renk + '20';
    rozet.style.color = renk;
    rozet.textContent = uye.department || ROL_ETIKET[uye.role] || 'Üye';
    kart.appendChild(rozet);

    if (uye.role === 'BASKAN') {
      var gorev = document.createElement('p');
      gorev.className = 'text-xs text-gray-400 mt-2 font-semibold';
      gorev.textContent = 'Başkan';
      kart.appendChild(gorev);
    }

    if (uye.linkedinUrl) {
      var ipucu = document.createElement('p');
      ipucu.className = 'text-xs text-gray-400 mt-2';
      ipucu.textContent = 'LinkedIn →';
      kart.appendChild(ipucu);
    }

    kart.addEventListener('click', function () {
      modalAc(uye, renk);
    });

    return kart;
  }

  // --- YÜKLEME ---

  function komiteyiBul(komiteler) {
    if (komiteId) {
      var idIle = komiteler.filter(function (k) {
        return k.id === komiteId;
      })[0];
      if (idIle) return idIle;
    }

    if (statikAnahtar) {
      return komiteler.filter(function (k) {
        return k.slug === statikAnahtar;
      })[0];
    }

    return null;
  }

  HsdApi.getCommittees()
    .then(function (komiteler) {
      if (!Array.isArray(komiteler) || komiteler.length === 0) return;

      var komite = komiteyiBul(komiteler);
      if (!komite) return; // statik içerik ekranda kalsın

      var renk = RENK_KODU[komite.color] || VARSAYILAN_RENK;

      // Başlık alanı
      var baslik = document.getElementById('heroBaslik');
      var altBaslik = document.getElementById('heroAltBaslik');
      var ikon = document.getElementById('heroIcon');
      var cizgi = document.getElementById('altCizgi');
      var banner = document.getElementById('heroBanner');

      if (baslik) baslik.textContent = komite.name;

      // Açıklama komite adının içinde zaten geçiyorsa tekrar yazdırma
      // (ör. "Sponsorluk & Dış İlişkiler Komitesi" + "& Dış İlişkiler Komitesi").
      if (altBaslik) {
        var aciklama = komite.description || '';
        var adKucuk = (komite.name || '').toLocaleLowerCase('tr');
        var aciklamaKucuk = aciklama.replace(/^&\s*/, '').toLocaleLowerCase('tr');

        altBaslik.textContent =
          aciklama && aciklamaKucuk && adKucuk.indexOf(aciklamaKucuk) !== -1 ? '' : aciklama;
      }
      if (ikon && komite.icon) ikon.textContent = komite.icon;
      if (cizgi) cizgi.style.background = renk;
      if (banner) banner.style.background = renk;
      document.title = komite.name + ' – HSD Gelişim';

      return HsdApi.getCommitteeMembers(komite.id).then(function (uyeler) {
        grid.innerHTML = '';

        if (!Array.isArray(uyeler) || uyeler.length === 0) {
          var bos = document.createElement('p');
          bos.className = 'col-span-full text-center text-gray-400 text-sm';
          bos.textContent = 'Bu komiteye henüz üye eklenmemiş.';
          grid.appendChild(bos);
          return;
        }

        uyeler.forEach(function (uye) {
          grid.appendChild(uyeKarti(uye, renk));
        });
      });
    })
    .catch(function (error) {
      // Statik içerik ekranda kalır; kullanıcı boş sayfa görmez.
      console.warn('Komite üyeleri yüklenemedi, sayfadaki içerik gösteriliyor:', error.message);
    });
});
