/**
 * İletişim formu - backend bağlantısı
 *
 * Form daha önce yalnızca doğrulama yapıp "Mesajınız başarıyla gönderildi"
 * yazıyordu; mesaj hiçbir yere gönderilmiyordu. Artık gerçekten
 * POST /contact ucuna gidiyor ve sonuç kullanıcıya doğru bildiriliyor.
 */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('iletisimForm');
  if (!form) return;

  var alanlar = ['adSoyad', 'email', 'konu', 'mesaj'];
  var emailKurali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var gonderButonu = form.querySelector('button[type="submit"]');
  var butonMetni = gonderButonu ? gonderButonu.textContent : 'Gönder';

  function hataGoster(inputId, mesaj) {
    var input = document.getElementById(inputId);
    var hata = document.getElementById(inputId + 'Hata');

    if (input) {
      input.classList.add('border-red-500');
      input.classList.remove('border-green-500');
    }
    if (hata) {
      hata.textContent = mesaj;
      hata.classList.remove('hidden');
    }
  }

  function hataTemizle(inputId) {
    var input = document.getElementById(inputId);
    var hata = document.getElementById(inputId + 'Hata');

    if (input) input.classList.remove('border-red-500');
    if (hata) {
      hata.textContent = '';
      hata.classList.add('hidden');
    }
  }

  function durumGoster(mesaj, basarili) {
    var kutu = document.getElementById('form-durum');

    if (!kutu) {
      kutu = document.createElement('div');
      kutu.id = 'form-durum';
      kutu.className = 'mt-4 rounded-xl px-4 py-3 text-sm font-medium';
      form.appendChild(kutu);
    }

    kutu.textContent = mesaj;
    kutu.className =
      'mt-4 rounded-xl px-4 py-3 text-sm font-medium ' +
      (basarili
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-700 border border-red-200');
    kutu.classList.remove('hidden');
  }

  function dogrula() {
    var gecerli = true;

    alanlar.forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;

      var deger = input.value.trim();

      if (deger === '') {
        hataGoster(id, 'Bu alan boş bırakılamaz!');
        gecerli = false;
      } else if (id === 'email' && !emailKurali.test(deger)) {
        hataGoster(id, 'Geçerli bir e-posta adresi giriniz!');
        gecerli = false;
      } else {
        hataTemizle(id);
      }
    });

    return gecerli;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!dogrula()) return;

    if (gonderButonu) {
      gonderButonu.disabled = true;
      gonderButonu.textContent = 'Gönderiliyor...';
    }

    try {
      await HsdApi.sendContactMessage({
        name: document.getElementById('adSoyad').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('konu').value.trim(),
        message: document.getElementById('mesaj').value.trim(),
      });

      form.reset();
      alanlar.forEach(hataTemizle);
      durumGoster('Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.', true);
    } catch (error) {
      // Artık gerçekten başarısız olduğunda kullanıcıya doğrusu söyleniyor.
      durumGoster(
        error.message || 'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.',
        false,
      );
    } finally {
      if (gonderButonu) {
        gonderButonu.disabled = false;
        gonderButonu.textContent = butonMetni;
      }
    }
  });
});
