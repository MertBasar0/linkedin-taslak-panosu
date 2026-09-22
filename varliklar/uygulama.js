/* LinkedIn Taslak Panosu — veri/paylasimlar.json içeriğini sayfaya basar.
   Yeni paylaşım eklemek için: metni veri/ altına .txt olarak koy,
   medyayı medya/<id>/ altına at, paylasimlar.json'a bir kayıt ekle. */

const $ = (sec) => document.querySelector(sec);

/* ---------- yardımcılar ---------- */

function kacis(s) {
  return String(s ?? "").replace(/[&<>"']/g, (k) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[k]));
}

let bildirimZaman;
function bildir(mesaj) {
  const el = $("#bildirim");
  el.textContent = mesaj;
  el.classList.add("acik");
  clearTimeout(bildirimZaman);
  bildirimZaman = setTimeout(() => el.classList.remove("acik"), 1800);
}

/* Pano kopyalama. navigator.clipboard yalnızca güvenli bağlamda (https)
   çalışır; http veya file:// açılırsa seçim tabanlı yönteme düşer. */
async function panoyaYaz(metin, dugme) {
  let oldu = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(metin);
      oldu = true;
    }
  } catch (_) { /* yedek yönteme düş */ }

  if (!oldu) {
    const ta = document.createElement("textarea");
    ta.value = metin;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    try { oldu = document.execCommand("copy"); } catch (_) { oldu = false; }
    document.body.removeChild(ta);
  }

  if (oldu) {
    bildir("Kopyalandı");
    if (dugme) {
      const eski = dugme.textContent;
      dugme.textContent = "✓ Kopyalandı";
      dugme.classList.add("tamam");
      setTimeout(() => { dugme.textContent = eski; dugme.classList.remove("tamam"); }, 1800);
    }
  } else {
    bildir("Kopyalanamadı — metni elle seçin");
  }
}

/* ---------- kart üreticiler ---------- */

function kart(baslik, govdeHtml, sagHtml = "") {
  return `<section class="kart">
    <h2><span>${kacis(baslik)}</span>${sagHtml}</h2>
    <div class="govde">${govdeHtml}</div>
  </section>`;
}

function basligiCiz(p) {
  const meta = [
    ["Seri", p.seri],
    ["Sıra", p.sira],
    ["Durum", p.durum],
    ["Hazırlandı", p.hazirlandi],
  ].filter(([, d]) => d)
    .map(([e, d]) => `<li>${kacis(e)}: <b>${kacis(d)}</b></li>`)
    .join("");

  const onceki = p.oncekiHalka
    ? `<p class="not">Önceki halka: ${kacis(p.oncekiHalka)}</p>` : "";

  return `<section class="kart">
    <div class="govde">
      <h2 class="pbaslik">${kacis(p.baslik)}</h2>
      ${onceki}
      <ul class="meta">${meta}</ul>
    </div>
  </section>`;
}

function metniCiz(p, metin) {
  const uzun = metin.length > 900;
  const govde = `
    <pre class="metin${uzun ? " kisali" : ""}" id="metin-${kacis(p.id)}">${kacis(metin)}</pre>
    <div class="dugmeler">
      <button class="dugme ana" data-kopyala="metin" data-id="${kacis(p.id)}">Metni kopyala</button>
      ${uzun ? `<button class="dugme" data-ac="metin-${kacis(p.id)}">Tamamını göster</button>` : ""}
      <a class="dugme" href="${kacis(p.metinDosyasi)}" download>.txt indir</a>
      <a class="dugme" href="https://www.linkedin.com/feed/?shareActive=true" target="_blank" rel="noopener noreferrer">LinkedIn'de aç</a>
    </div>`;
  return kart("Paylaşım metni", govde,
    `<span class="h2yan">${metin.length} karakter</span>`);
}

function gorseliCiz(p) {
  const g = p.gorsel;
  if (!g) return "";
  const govde = `
    <a href="${kacis(g.dosya)}" target="_blank" rel="noopener">
      <img class="medya" src="${kacis(g.dosya)}" alt="${kacis(p.altMetni || p.baslik)}" loading="lazy">
    </a>
    ${g.not ? `<p class="not">${kacis(g.not)}</p>` : ""}
    <div class="dugmeler">
      <a class="dugme ana" href="${kacis(g.dosya)}" download="${kacis(g.ad || "gorsel.png")}">Görseli indir</a>
      <a class="dugme" href="${kacis(g.dosya)}" target="_blank" rel="noopener">Tam boy aç</a>
    </div>`;
  return kart("Görsel", govde,
    `<span class="h2yan">${kacis(g.olcu || "")}</span>`);
}

function videoyuCiz(p) {
  const v = p.video;
  if (!v) return "";
  const govde = `
    <video class="medya" src="${kacis(v.dosya)}" controls playsinline loop muted preload="metadata"></video>
    ${v.not ? `<p class="not">${kacis(v.not)}</p>` : ""}
    <div class="dugmeler">
      <a class="dugme ana" href="${kacis(v.dosya)}" download="${kacis(v.ad || "video.mp4")}">Videoyu indir</a>
      <a class="dugme" href="${kacis(v.dosya)}" target="_blank" rel="noopener">Yeni sekmede aç</a>
    </div>`;
  return kart("Video", govde,
    `<span class="h2yan">${kacis(v.olcu || "")}</span>`);
}

function altMetniCiz(p) {
  if (!p.altMetni) return "";
  const govde = `
    <p class="metin alt">${kacis(p.altMetni)}</p>
    <div class="dugmeler">
      <button class="dugme ana" data-kopyala="alt" data-id="${kacis(p.id)}">ALT metnini kopyala</button>
    </div>
    <p class="not">Görseli yüklerken LinkedIn'in "alternatif metin" alanına yapıştırılır.</p>`;
  return kart("Erişilebilirlik — ALT metni", govde);
}

function kurallariCiz(p) {
  let govde = "";
  if (p.uyari) govde += `<p class="uyari">${kacis(p.uyari)}</p>`;
  if (p.yerlesim) govde += `<p class="not">${kacis(p.yerlesim)}</p>`;
  if (p.kontrolListesi?.length) {
    govde += `<ul class="kontrol">` +
      p.kontrolListesi.map((m) => `<li>${kacis(m)}</li>`).join("") + `</ul>`;
  }
  return govde ? kart("Yayın kuralları ve kontrol", govde) : "";
}

function kaynagiCiz(p) {
  const k = p.kaynak;
  if (!k) return "";
  const govde = `
    ${k.alinti ? `<blockquote class="alinti">${kacis(k.alinti)}</blockquote>` : ""}
    ${k.not ? `<p class="not sifirust">${kacis(k.not)}</p>` : ""}
    ${k.url ? `<p class="kaynakSat"><a class="kaynak" href="${kacis(k.url)}" target="_blank" rel="noopener noreferrer">${kacis(k.url)}</a></p>` : ""}`;
  return kart("Doğrulama kaynağı", govde);
}

function arsiviCiz(p) {
  if (!p.arsiv?.length) return "";
  const govde = `<div class="izgara">` + p.arsiv.map((a) => `
    <figure>
      <a href="${kacis(a.dosya)}" target="_blank" rel="noopener">
        <img src="${kacis(a.dosya)}" alt="${kacis(a.ad)}" loading="lazy">
      </a>
      <figcaption><b>${kacis(a.ad)}</b><span>${kacis(a.not || "")}</span></figcaption>
    </figure>`).join("") + `</div>`;
  return kart("Arşiv — kullanılmayan sürümler", govde);
}

/* ---------- çizim ---------- */

const metinDeposu = new Map();

async function ciz() {
  const hedef = $("#icerik");
  let veri;

  try {
    const yanit = await fetch("veri/paylasimlar.json", { cache: "no-store" });
    if (!yanit.ok) throw new Error("HTTP " + yanit.status);
    veri = await yanit.json();
  } catch (hata) {
    hedef.innerHTML = `<div class="kart"><div class="govde hata">
      <b>Veri okunamadı.</b><br>${kacis(hata.message)}
      <p class="not">Sayfayı dosyadan (file://) açtıysanız tarayıcı veri dosyasını engeller.
      Yayındaki adresten açın ya da yerelde bir sunucu üzerinden servis edin.</p>
    </div></div>`;
    return;
  }

  if (veri.site) {
    $("#siteBaslik").textContent = veri.site.baslik || "LinkedIn Taslak Panosu";
    $("#siteAltBaslik").textContent = veri.site.altBaslik || "";
    $("#siteGuncelleme").textContent = veri.site.guncelleme ? "Son güncelleme: " + veri.site.guncelleme : "";
    document.title = veri.site.baslik || document.title;
  }

  const paylasimlar = veri.paylasimlar || [];
  if (!paylasimlar.length) {
    hedef.innerHTML = `<p class="yukleniyor">Henüz paylaşım eklenmemiş.</p>`;
    return;
  }

  const metinler = await Promise.all(paylasimlar.map(async (p) => {
    if (!p.metinDosyasi) return "";
    try {
      const y = await fetch(p.metinDosyasi, { cache: "no-store" });
      return y.ok ? await y.text() : "";
    } catch (_) { return ""; }
  }));

  // Filtre dropdown'ını doldur
  const filtreSelect = $("#filtreSelect");
  if (filtreSelect) {
    paylasimlar.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.baslik;
      filtreSelect.appendChild(opt);
    });
  }

  // Sayfayı başlangıçta tüm paylaşımlarla çiz
  cizPaylasimlari(paylasimlar, metinler, hedef);
}

function cizPaylasimlari(paylasimlar, metinler, hedef, filtreId = "") {
  const gosterilecekler = filtreId
    ? paylasimlar.filter(p => p.id === filtreId)
    : paylasimlar;

  hedef.innerHTML = gosterilecekler.map((p, _) => {
    const indeks = paylasimlar.indexOf(p);
    const metin = (metinler[indeks] || "").trim();
    metinDeposu.set(p.id, { metin, alt: p.altMetni || "" });
    return basligiCiz(p)
      + (metin ? metniCiz(p, metin) : "")
      + gorseliCiz(p)
      + videoyuCiz(p)
      + altMetniCiz(p)
      + kurallariCiz(p)
      + kaynagiCiz(p)
      + arsiviCiz(p);
  }).join("");
}

function filtreUygula() {
  const filtreSelect = $("#filtreSelect");
  const secilenId = filtreSelect.value;

  // Veriyi yeniden yükle ve filtrele
  fetch("veri/paylasimlar.json", { cache: "no-store" })
    .then(r => r.json())
    .then(veri => {
      const paylasimlar = veri.paylasimlar || [];
      const hedef = $("#icerik");

      Promise.all(paylasimlar.map(async (p) => {
        if (!p.metinDosyasi) return "";
        try {
          const y = await fetch(p.metinDosyasi, { cache: "no-store" });
          return y.ok ? await y.text() : "";
        } catch (_) { return ""; }
      })).then(metinler => {
        cizPaylasimlari(paylasimlar, metinler, hedef, secilenId);
        if (secilenId) {
          hedef.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    })
    .catch(() => {
      const hedef = $("#icerik");
      hedef.innerHTML = `<div class="kart"><div class="govde hata">
        <b>Filtre uygulanırken hata.</b>
      </div></div>`;
    });
}

/* ---------- olaylar ---------- */

document.addEventListener("click", (olay) => {
  const kop = olay.target.closest("[data-kopyala]");
  if (kop) {
    const kayit = metinDeposu.get(kop.dataset.id);
    if (!kayit) return;
    panoyaYaz(kop.dataset.kopyala === "alt" ? kayit.alt : kayit.metin, kop);
    return;
  }

  const ac = olay.target.closest("[data-ac]");
  if (ac) {
    const hedef = document.getElementById(ac.dataset.ac);
    if (!hedef) return;
    const kisali = hedef.classList.toggle("kisali");
    ac.textContent = kisali ? "Tamamını göster" : "Kısalt";
    if (kisali) hedef.scrollIntoView({ block: "nearest" });
  }
});

ciz();
