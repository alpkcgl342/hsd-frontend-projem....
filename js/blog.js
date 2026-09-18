/**
 * Blog sayfası - backend bağlantısı
 *
 * Yazı kartları HTML'e elle yazılmıştı (çoğu Medium bağlantısı).
 * Artık backend'de yayımlanmış yazılar varsa onlar listenin başına eklenir.
 *
 * Mevcut Medium kartları silinmez: backend boşsa ya da erişilemezse
 * sayfa bugünkü hâliyle çalışmaya devam eder.
 */
document.addEventListener('DOMContentLoaded', function () {
  var bolum = document.getElementById('blog');
  if (!bolum || typeof HsdApi === 'undefined') return;

  var grid = bolum.querySelector('.grid');
  if (!grid) return;

  function tarihFormatla(isoTarih) {
    try {
      return new Date(isoTarih).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  function ozet(icerik, uzunluk) {
    var metin = (icerik || '').replace(/\s+/g, ' ').trim();
    if (metin.length <= uzunluk) return metin;
    return metin.slice(0, uzunluk).trim() + '…';
  }

  function kartOlustur(yazi) {
    var sarmal = document.createElement('a');
    sarmal.href = 'blog-detay.html?id=' + encodeURIComponent(yazi.id);
    sarmal.className = 'no-underline';
    sarmal.setAttribute('data-aos', 'fade-up');

    var kart = document.createElement('div');
    kart.className =
      'blog-kart bg-white rounded-2xl overflow-hidden border border-blue-100 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col';

    var govde = document.createElement('div');
    govde.className = 'p-5 flex flex-col flex-1';

    if (yazi.category && yazi.category.name) {
      var rozet = document.createElement('span');
      rozet.className =
        'bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block';
      rozet.textContent = yazi.category.name;
      govde.appendChild(rozet);
    }

    var baslik = document.createElement('h5');
    baslik.className = 'font-bold text-gray-800 mb-2';
    // textContent: içerik HTML olarak yorumlanmaz (XSS koruması)
    baslik.textContent = yazi.title;

    var paragraf = document.createElement('p');
    paragraf.className = 'text-gray-500 text-sm flex-1';
    paragraf.textContent = ozet(yazi.content, 110);

    var alt = document.createElement('div');
    alt.className = 'flex justify-between items-center mt-4 pt-3 border-t border-gray-100';

    var yazar = document.createElement('span');
    yazar.className = 'text-gray-400 text-xs';
    yazar.textContent = '✍️' + ((yazi.author && yazi.author.fullName) || 'HSD Gelişim');

    var bilgi = document.createElement('span');
    bilgi.className = 'text-blue-700 text-xs font-semibold';
    bilgi.textContent = (yazi.readingTime || 1) + ' dk okuma →';

    alt.appendChild(yazar);
    alt.appendChild(bilgi);

    govde.appendChild(baslik);
    govde.appendChild(paragraf);
    govde.appendChild(alt);

    // Tarih ve görüntülenme, kartın altında küçük bir satır olarak
    var meta = document.createElement('div');
    meta.className = 'px-5 pb-4 text-gray-400 text-xs';
    meta.textContent = tarihFormatla(yazi.createdAt) + ' · ' + (yazi.viewCount || 0) + ' görüntülenme';

    kart.appendChild(govde);
    kart.appendChild(meta);
    sarmal.appendChild(kart);

    return sarmal;
  }

  HsdApi.getBlogPosts()
    .then(function (yazilar) {
      if (!Array.isArray(yazilar) || yazilar.length === 0) return;

      // Backend yazıları en başa eklenir; mevcut Medium kartları korunur.
      var ilkCocuk = grid.firstChild;
      yazilar.forEach(function (yazi) {
        grid.insertBefore(kartOlustur(yazi), ilkCocuk);
      });

      if (typeof AOS !== 'undefined') AOS.refresh();
    })
    .catch(function (error) {
      console.warn('Blog yazıları yüklenemedi, sayfadaki içerik gösteriliyor:', error.message);
    });
});
