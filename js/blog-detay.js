/**
 * Blog yazısı detay sayfası
 *
 * GET /blog/:id ucundan yazıyı çeker. Bu uç aynı zamanda görüntülenme
 * sayacını artırır. Taslak yazılar backend tarafından 404 döndürülür.
 */
document.addEventListener('DOMContentLoaded', function () {
  var yukleniyor = document.getElementById('yukleniyor');
  var hataKutusu = document.getElementById('hata');
  var kapsayici = document.getElementById('yazi');

  function hataGoster(mesaj) {
    if (yukleniyor) yukleniyor.classList.add('hidden');
    if (!hataKutusu) return;
    hataKutusu.textContent = mesaj;
    hataKutusu.classList.remove('hidden');
  }

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

  var id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    hataGoster('Yazı bulunamadı: adreste yazı kimliği eksik.');
    return;
  }

  HsdApi.getBlogPost(id)
    .then(function (yazi) {
      document.title = yazi.title + ' — HSD Gelişim';

      var kategori = document.getElementById('kategori');
      if (yazi.category && yazi.category.name && kategori) {
        kategori.textContent = yazi.category.name;
        kategori.classList.remove('hidden');
      }

      // textContent kullanılıyor: içerik HTML olarak yorumlanmaz (XSS koruması)
      document.getElementById('baslik').textContent = yazi.title;
      document.getElementById('icerik').textContent = yazi.content;
      document.getElementById('yazar').textContent =
        '✍️ ' + ((yazi.author && yazi.author.fullName) || 'HSD Gelişim');
      document.getElementById('tarih').textContent = tarihFormatla(yazi.createdAt);
      document.getElementById('okuma').textContent = (yazi.readingTime || 1) + ' dk okuma';
      document.getElementById('goruntulenme').textContent =
        (yazi.viewCount || 0) + ' görüntülenme';

      var etiketler = document.getElementById('etiketler');
      if (etiketler && Array.isArray(yazi.tags) && yazi.tags.length > 0) {
        yazi.tags.forEach(function (etiket) {
          var rozet = document.createElement('span');
          rozet.className =
            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full';
          rozet.textContent = '#' + etiket.name;
          etiketler.appendChild(rozet);
        });
      }

      if (yukleniyor) yukleniyor.classList.add('hidden');
      if (kapsayici) kapsayici.classList.remove('hidden');
    })
    .catch(function (error) {
      if (error.status === 404) {
        hataGoster('Bu yazı bulunamadı ya da henüz yayımlanmamış.');
      } else {
        hataGoster(error.message || 'Yazı yüklenemedi.');
      }
    });
});
