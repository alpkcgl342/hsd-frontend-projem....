/**
 * Komite detay sayfası - backend bağlantısı
 *
 * Sayfadaki statik KOMITELER verisi üye fotoğrafı, bölüm ve LinkedIn
 * bilgisi içeriyor; backend'de bu alanlar yok. Bu yüzden statik komiteler
 * olduğu gibi bırakılır ve bu dosya yalnızca URL'de ?id= ile gelen,
 * statik listede karşılığı olmayan komiteler için devreye girer.
 *
 * Bu sayede elle hazırlanmış ekip sayfaları korunur, backend'e sonradan
 * eklenen komiteler de sitede görünür.
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof HsdApi === 'undefined') return;

  var params = new URLSearchParams(window.location.search);
  var komiteId = params.get('id');
  var statikAnahtar = params.get('komite');

  // Statik veri varsa ona dokunma.
  if (!komiteId) return;
  if (statikAnahtar && typeof KOMITELER !== 'undefined' && KOMITELER[statikAnahtar]) return;

  var grid = document.getElementById('uyeGrid');
  if (!grid) return;

  var RENK = '#0a58ca';

  var ROL_ETIKET = {
    BASKAN: 'Başkan',
    YONETIM_KURULU: 'Yönetim Kurulu',
    UYE: 'Üye',
  };

  function avatarUrl(isim, mevcutUrl) {
    if (mevcutUrl) return mevcutUrl;
    return (
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(isim) +
      '&background=' +
      RENK.replace('#', '') +
      '&color=fff&size=120'
    );
  }

  function uyeKarti(uye) {
    var isim = (uye.user && uye.user.fullName) || 'İsimsiz Üye';
    var rol = ROL_ETIKET[uye.role] || 'Üye';

    var kart = document.createElement('div');
    kart.className =
      'uye-kart bg-white dark:bg-[#1a1e23] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center';

    var cerceve = document.createElement('div');
    cerceve.className = 'w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2';
    cerceve.style.borderColor = RENK;

    var gorsel = document.createElement('img');
    gorsel.className = 'w-full h-full object-cover';
    gorsel.alt = isim;
    gorsel.src = avatarUrl(isim, uye.photoUrl);
    gorsel.addEventListener('error', function () {
      gorsel.src = avatarUrl(isim, null);
    });
    cerceve.appendChild(gorsel);

    var ad = document.createElement('h5');
    ad.className = 'font-bold text-blue-900 dark:text-white text-sm mb-2';
    ad.textContent = isim;

    var rozet = document.createElement('span');
    rozet.className = 'text-xs font-medium px-3 py-1 rounded-full inline-block';
    rozet.style.background = RENK + '20';
    rozet.style.color = RENK;
    rozet.textContent = rol;

    kart.appendChild(cerceve);
    kart.appendChild(ad);
    kart.appendChild(rozet);

    return kart;
  }

  Promise.all([HsdApi.getCommittees(), HsdApi.getCommitteeMembers(komiteId)])
    .then(function (sonuclar) {
      var komiteler = sonuclar[0] || [];
      var uyeler = sonuclar[1] || [];

      var komite = komiteler.filter(function (k) {
        return k.id === komiteId;
      })[0];

      if (komite) {
        var baslik = document.getElementById('heroBaslik');
        var altBaslik = document.getElementById('heroAltBaslik');
        var ikon = document.getElementById('heroIcon');

        if (baslik) baslik.textContent = komite.name;
        if (altBaslik) altBaslik.textContent = komite.description || '';
        if (ikon) ikon.textContent = '👥';
        document.title = komite.name + ' – HSD Gelişim';
      }

      grid.innerHTML = '';

      if (uyeler.length === 0) {
        var bos = document.createElement('p');
        bos.className = 'col-span-full text-center text-gray-400 text-sm';
        bos.textContent = 'Bu komiteye henüz üye eklenmemiş.';
        grid.appendChild(bos);
        return;
      }

      uyeler.forEach(function (uye) {
        grid.appendChild(uyeKarti(uye));
      });
    })
    .catch(function (error) {
      console.warn('Komite üyeleri yüklenemedi:', error.message);
    });
});
