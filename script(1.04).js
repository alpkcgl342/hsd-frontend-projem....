// ===== FORM VALIDATION =====
document.getElementById("iletisimForm").addEventListener("submit", function(e) {
    e.preventDefault();
    formKontrol();
});

function formKontrol() {
    let gecerli = true;

    // --- AD SOYAD ---
    let adSoyad = document.getElementById("adSoyad").value.trim();
    let adSoyadInput = document.getElementById("adSoyad");
    let adSoyadHata = document.getElementById("adSoyadHata");

    if (adSoyad === "") {
        adSoyadInput.classList.add("is-invalid");
        adSoyadHata.textContent = "Ad soyad boş bırakılamaz!";
        gecerli = false;
    } else {
        adSoyadInput.classList.remove("is-invalid");
        adSoyadInput.classList.add("is-valid");
    }

    // --- EMAIL ---
    let email = document.getElementById("email").value.trim();
    let emailInput = document.getElementById("email");
    let emailHata = document.getElementById("emailHata");
    let emailKurali = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        emailInput.classList.add("is-invalid");
        emailHata.textContent = "E-posta boş bırakılamaz!";
        gecerli = false;
    } else if (!emailKurali.test(email)) {
        emailInput.classList.add("is-invalid");
        emailHata.textContent = "E-posta adresi yanlış yazıldı!";
        gecerli = false;
    } else {
        emailInput.classList.remove("is-invalid");
        emailInput.classList.add("is-valid");
    }

    // --- KONU ---
    let konu = document.getElementById("konu").value.trim();
    let konuInput = document.getElementById("konu");
    let konuHata = document.getElementById("konuHata");

    if (konu === "") {
        konuInput.classList.add("is-invalid");
        konuHata.textContent = "Konu başlığı boş bırakılamaz!";
        gecerli = false;
    } else {
        konuInput.classList.remove("is-invalid");
        konuInput.classList.add("is-valid");
    }

    // --- MESAJ ---
    let mesaj = document.getElementById("mesaj").value.trim();
    let mesajInput = document.getElementById("mesaj");
    let mesajHata = document.getElementById("mesajHata");

    if (mesaj === "") {
        mesajInput.classList.add("is-invalid");
        mesajHata.textContent = "Mesaj boş bırakılamaz!";
        gecerli = false;
    } else {
        mesajInput.classList.remove("is-invalid");
        mesajInput.classList.add("is-valid");
    }

    // --- HEPSİ DOĞRUYSA ---
    if (gecerli) {
        alert("Mesajınız başarıyla gönderildi! 🎉");
        document.getElementById("iletisimForm").reset();
    }
}


// ===== LIGHTBOX =====
const overlay     = document.getElementById("lightbox-overlay");
const lightboxImg = document.getElementById("lightbox-img");
const caption     = document.getElementById("lightbox-caption");
const closeBtn    = document.getElementById("lightbox-close");
const prevBtn     = document.getElementById("lightbox-prev");
const nextBtn     = document.getElementById("lightbox-next");

let triggers   = [];
let aktifIndex = 0;

function lightboxAc(index) {
    aktifIndex = index;
    lightboxImg.src = triggers[index].src;
    caption.textContent = triggers[index].dataset.caption || "";
    overlay.classList.add("aktif");
    document.body.style.overflow = "hidden";
}

function lightboxKapat() {
    overlay.classList.remove("aktif");
    document.body.style.overflow = "";
}

function onceki() {
    aktifIndex = (aktifIndex - 1 + triggers.length) % triggers.length;
    lightboxAc(aktifIndex);
}

function sonraki() {
    aktifIndex = (aktifIndex + 1) % triggers.length;
    lightboxAc(aktifIndex);
}

document.addEventListener("DOMContentLoaded", function () {
    triggers = Array.from(document.querySelectorAll(".lightbox-trigger"));

    triggers.forEach(function (img, i) {
        img.addEventListener("click", function () {
            lightboxAc(i);
        });
    });
});

closeBtn.addEventListener("click", lightboxKapat);
prevBtn.addEventListener("click", onceki);
nextBtn.addEventListener("click", sonraki);

// Overlay'e (fotoğraf dışına) tıklayınca kapat
overlay.addEventListener("click", function (e) {
    if (e.target === overlay) lightboxKapat();
});

// Klavye: ESC → kapat | ← → önceki | → → sonraki
document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("aktif")) return;
    if (e.key === "Escape")     lightboxKapat();
    if (e.key === "ArrowLeft")  onceki();
    if (e.key === "ArrowRight") sonraki();
});