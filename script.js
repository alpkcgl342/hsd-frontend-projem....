document.addEventListener("DOMContentLoaded", function () {

    // ===== AOS BAŞLAT =====
    AOS.init({
        duration: 750,
        once: true,
        offset: 80,
        easing: 'ease-out-cubic'
    });


    // ===== GSAP: STICKY NAV SHRINK =====
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        start: "top -60",
        onEnter:     () => document.querySelector('nav').classList.add('nav-scrolled'),
        onLeaveBack: () => document.querySelector('nav').classList.remove('nav-scrolled')
    });


    // ===== GSAP: İSTATİSTİK SAYAÇ ANİMASYONU =====
    document.querySelectorAll('.stat-sayi-anim').forEach(el => {
        const text    = el.textContent.trim();
        const hasPlus = text.includes('+');
        const num     = parseInt(text);
        if (isNaN(num)) return;

        const obj = { val: 0 };
        gsap.to(obj, {
            val: num,
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
                el.textContent = Math.ceil(obj.val) + (hasPlus ? '+' : '');
            },
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true
            }
        });
    });


    // ===== LOTTIE: HERO ANİMASYONU =====
    const lottieContainer = document.getElementById('lottie-hero');
    if (lottieContainer) {
        lottie.loadAnimation({
            container: lottieContainer,
            renderer:  'svg',
            loop:      true,
            autoplay:  true,
            // lottiefiles.com'dan farklı bir animasyon URL'si yapıştırabilirsin
            path: 'https://assets9.lottiefiles.com/packages/lf20_jcikwtux.json'
        });
    }


    // ===== DARK MODE =====
    const darkBtn       = document.getElementById("darkModeBtn");
    const darkBtnMobile = document.getElementById("darkModeBtnMobile");
    const html          = document.documentElement;

    function applyTheme(isDark) {
        html.classList.toggle("dark", isDark);
        const icon = isDark ? "☀️" : "🌙";
        if (darkBtn)       darkBtn.textContent       = icon;
        if (darkBtnMobile) darkBtnMobile.textContent = icon;
        localStorage.setItem("tema", isDark ? "dark" : "light");

        if (window._vantaEffect) {
            window._vantaEffect.setOptions({
                backgroundColor: isDark ? 0x0d1117 : 0x04067c
            });
        }
    }

    applyTheme(localStorage.getItem("tema") === "dark");

    if (darkBtn)       darkBtn.addEventListener("click",       () => applyTheme(!html.classList.contains("dark")));
    if (darkBtnMobile) darkBtnMobile.addEventListener("click", () => applyTheme(!html.classList.contains("dark")));


    // ===== MOBİL MENÜ =====
    const menuBtn    = document.getElementById("menuToggle") || document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const menu       = document.getElementById("menu");

    if (menuBtn) {
        menuBtn.addEventListener("click", function () {
            if (mobileMenu) mobileMenu.classList.toggle("hidden");
            if (menu)       menu.classList.toggle("active");
        });

        if (mobileMenu) {
            mobileMenu.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => mobileMenu.classList.add("hidden"));
            });
        }
        if (menu) {
            menu.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", () => menu.classList.remove("active"));
            });
        }
    }


    // ===== DROPDOWN =====
    const dropdownToggle = document.getElementById("dropdownToggle");
    const dropdownMenu   = document.getElementById("dropdownMenu");

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("hidden");
        });
        document.addEventListener("click", () => dropdownMenu.classList.add("hidden"));
    }


    // ===== DUYURU FİLTRELEME =====
    const filtreButonlar = document.querySelectorAll(".filtre-btn");
    const duyuruKartlar  = document.querySelectorAll(".duyuru-kart");
    const bosMesaj       = document.getElementById("bos-mesaj");

    filtreButonlar.forEach(btn => {
        btn.addEventListener("click", () => {
            filtreButonlar.forEach(b => b.classList.remove("aktif"));
            btn.classList.add("aktif");

            const seciliKategori = btn.dataset.kategori;
            let gorunenSayisi = 0;

            duyuruKartlar.forEach(kart => {
                const eslesme = seciliKategori === "tumu" || kart.dataset.kategori === seciliKategori;
                kart.classList.toggle("gizli", !eslesme);
                if (eslesme) gorunenSayisi++;
            });

            if (bosMesaj) bosMesaj.style.display = gorunenSayisi === 0 ? "block" : "none";
        });
    });



    // NOT: Iletisim formunun gonderimi artik js/iletisim.js dosyasinda,
    // gercek bir POST /contact istegiyle yapiliyor. Buradaki eski kod
    // hicbir yere veri gondermeden "basariyla gonderildi" mesaji
    // gosterdigi icin kaldirildi.

    // ===== LIGHTBOX =====
    const overlay     = document.getElementById("lightbox-overlay");
    const lightboxImg = document.getElementById("lightbox-img");
    const caption     = document.getElementById("lightbox-caption");
    const closeBtn    = document.getElementById("lightbox-close");
    const prevBtn     = document.getElementById("lightbox-prev");
    const nextBtn     = document.getElementById("lightbox-next");

    const triggers = Array.from(document.querySelectorAll(".lightbox-trigger"));
    let aktifIndex = 0;

    function lightboxAc(index) {
        if (!triggers[index]) return;
        aktifIndex = index;
        lightboxImg.src     = triggers[index].src;
        caption.textContent = triggers[index].dataset.caption || "";
        overlay.classList.add("aktif");
        document.body.style.overflow = "hidden";
    }

    function lightboxKapat() {
        overlay.classList.remove("aktif");
        document.body.style.overflow = "";
    }

    triggers.forEach((img, i) => img.addEventListener("click", () => lightboxAc(i)));

    if (closeBtn) closeBtn.addEventListener("click", lightboxKapat);

    if (nextBtn) nextBtn.addEventListener("click", () => {
        aktifIndex = (aktifIndex + 1) % triggers.length;
        lightboxAc(aktifIndex);
    });

    if (prevBtn) prevBtn.addEventListener("click", () => {
        aktifIndex = (aktifIndex - 1 + triggers.length) % triggers.length;
        lightboxAc(aktifIndex);
    });

    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) lightboxKapat();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (!overlay || !overlay.classList.contains("aktif")) return;
        if (e.key === "Escape")      lightboxKapat();
        if (e.key === "ArrowRight")  { aktifIndex = (aktifIndex + 1) % triggers.length; lightboxAc(aktifIndex); }
        if (e.key === "ArrowLeft")   { aktifIndex = (aktifIndex - 1 + triggers.length) % triggers.length; lightboxAc(aktifIndex); }
    });

});
