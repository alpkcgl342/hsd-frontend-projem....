/**
 * HSD Gelişim - Backend API istemcisi
 *
 * Site şimdiye kadar tamamen statikti; hiçbir sayfa backend'e istek atmıyordu.
 * Bu dosya tüm sayfaların ortak kullandığı ince bir API katmanı sağlar.
 *
 * API adresini değiştirmek için iki yol var:
 *   1) Sayfada bu dosyadan ÖNCE:  <script>window.HSD_API_URL = "https://api.hsd-gelisim.com";</script>
 *   2) Tarayıcı konsolundan:      localStorage.setItem("hsdApiUrl", "http://localhost:3000")
 */
(function (global) {
  'use strict';

  function resolveBaseUrl() {
    if (global.HSD_API_URL) return global.HSD_API_URL;

    try {
      var stored = global.localStorage && global.localStorage.getItem('hsdApiUrl');
      if (stored) return stored;
    } catch (e) {
      // Gizli sekmede localStorage erişimi hata verebilir; sorun değil.
    }

    return 'http://localhost:3000';
  }

  var BASE_URL = resolveBaseUrl().replace(/\/+$/, '');

  /**
   * Backend tüm cevapları { success, data, message } zarfıyla döndürür.
   * Burada zarf açılır, hata durumunda anlamlı bir Error fırlatılır.
   */
  async function request(path, options) {
    options = options || {};

    var config = {
      method: options.method || 'GET',
      headers: Object.assign({ Accept: 'application/json' }, options.headers || {}),
    };

    if (options.body !== undefined) {
      config.headers['Content-Type'] = 'application/json; charset=utf-8';
      config.body = JSON.stringify(options.body);
    }

    var token = HsdApi.getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }

    var response;
    try {
      response = await fetch(BASE_URL + path, config);
    } catch (networkError) {
      throw new Error('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.');
    }

    var payload = null;
    try {
      payload = await response.json();
    } catch (e) {
      // Cevap gövdesi boş ya da JSON değil.
    }

    if (!response.ok) {
      var message = (payload && payload.message) || 'Beklenmeyen bir hata oluştu.';
      if (Array.isArray(message)) message = message.join(' ');

      if (response.status === 429) {
        message = 'Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.';
      }

      var error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload && Object.prototype.hasOwnProperty.call(payload, 'data')
      ? payload.data
      : payload;
  }

  var HsdApi = {
    baseUrl: BASE_URL,

    getToken: function () {
      try {
        return global.localStorage && global.localStorage.getItem('hsdAccessToken');
      } catch (e) {
        return null;
      }
    },

    // --- İletişim ---
    sendContactMessage: function (data) {
      return request('/contact', { method: 'POST', body: data });
    },

    // --- Duyurular ---
    getAnnouncements: function (category) {
      var query = category ? '?category=' + encodeURIComponent(category) : '';
      return request('/announcements' + query);
    },

    // --- Blog ---
    getBlogPosts: function () {
      return request('/blog');
    },

    getBlogPost: function (id) {
      return request('/blog/' + encodeURIComponent(id));
    },

    subscribeNewsletter: function (email) {
      return request('/blog/newsletter/subscribe', {
        method: 'POST',
        body: { email: email },
      });
    },

    // --- Komiteler ---
    getCommittees: function () {
      return request('/committees');
    },

    getCommitteeMembers: function (id) {
      return request('/committees/' + encodeURIComponent(id) + '/members');
    },

    // --- Etkinlikler ---
    getEvents: function (status) {
      var query = status ? '?status=' + encodeURIComponent(status) : '';
      return request('/events' + query);
    },

    registerForEvent: function (eventId, data) {
      return request('/events/' + encodeURIComponent(eventId) + '/register', {
        method: 'POST',
        body: data,
      });
    },

    // --- Üyelik başvurusu ---
    applyForMembership: function (data) {
      return request('/applications', { method: 'POST', body: data });
    },
  };

  global.HsdApi = HsdApi;
})(window);
