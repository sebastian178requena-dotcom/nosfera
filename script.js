gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

// ==========================================
// CONTRASEÑA DE ADMINISTRADOR
// ==========================================
const ADMIN_PASS = "pley456";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Pantalla de bienvenida
  const tl = gsap.timeline();
  tl.from(".Welcome-text", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" })
    .from(".Loader-bar", { scaleX: 0, duration: 0.7, ease: "power2.inOut" }, "-=0.2")
    .to(".Loader", {
      yPercent: -100,
      duration: 0.7,
      ease: "power4.inOut",
      delay: 0.2,
      onComplete: () => {
        document.querySelector(".Loader").style.display = "none";
      }
    });

  // 2. Cambio de Vista (Inicio vs Información)
  const navTabs = document.querySelectorAll(".nav-tab, .BackBtn");
  const views = document.querySelectorAll(".ViewContainer");

  navTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetViewId = tab.getAttribute("data-view");
      if (!targetViewId) return;

      views.forEach((v) => v.classList.add("hidden"));
      document.getElementById(targetViewId).classList.remove("hidden");

      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("selected"));
      const activeNav = document.querySelector(`.nav-tab[data-view="${targetViewId}"]`);
      if (activeNav) activeNav.classList.add("selected");

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // 3. Registro de visitas
  let totalVisitas = parseInt(localStorage.getItem("contadorVisitas") || "0") + 1;
  localStorage.setItem("contadorVisitas", totalVisitas);
  const visitEl = document.getElementById("footerVisitCount");
  const adminVisitEl = document.getElementById("visitCount");
  if (visitEl) visitEl.textContent = `Visitas: ${totalVisitas}`;
  if (adminVisitEl) adminVisitEl.textContent = totalVisitas;

  // 4. Cargar y actualizar datos de contacto guardados
  function loadContactInfo() {
    const savedEmail = localStorage.getItem("contactEmail") || "sebastian178requena@gmail.com";
    const savedPhone = localStorage.getItem("contactPhone") || "+58 400 000 0000";

    const dispEmail = document.getElementById("displayContactEmail");
    const dispPhone = document.getElementById("displayContactPhone");

    if (dispEmail) {
      dispEmail.textContent = savedEmail;
      dispEmail.setAttribute("href", `mailto:${savedEmail}`);
    }
    if (dispPhone) {
      dispPhone.textContent = savedPhone;
      dispPhone.setAttribute("href", `https://wa.me/${savedPhone.replace(/[^0-9]/g, '')}`);
    }
  }
  loadContactInfo();

  // 5. Gestión de Videos de Trabajo
  const videosGrid = document.getElementById("videosGrid");
  const addVideoBtn = document.getElementById("addVideoBtn");
  const videoTitleInput = document.getElementById("videoTitleInput");
  const videoUrlInput = document.getElementById("videoUrlInput");

  const defaultVideos = [
    { title: "Demo Tienda Moda Shopify", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
  ];

  function getSavedVideos() {
    const stored = localStorage.getItem("workVideos");
    return stored ? JSON.parse(stored) : defaultVideos;
  }

  function convertToEmbedUrl(url) {
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  }

  function renderVideos() {
    const videos = getSavedVideos();
    if (videosGrid) {
      videosGrid.innerHTML = videos.map((v) => {
        const embedUrl = convertToEmbedUrl(v.url);
        const isYoutube = embedUrl.includes("youtube.com/embed");
        const mediaTag = isYoutube
          ? `<iframe src="${embedUrl}" allowfullscreen></iframe>`
          : `<video src="${embedUrl}" controls muted></video>`;

        return `
          <div class="VideoCard">
            ${mediaTag}
            <div class="VideoCard-title">${v.title}</div>
          </div>
        `;
      }).join("");
    }

    const adminList = document.getElementById("adminVideosList");
    if (adminList) {
      adminList.innerHTML = videos.map((v, idx) => `
        <li>
          <span>${v.title}</span>
          <button class="DeleteMiniBtn" onclick="deleteWorkVideo(${idx})">Eliminar</button>
        </li>
      `).join("");
    }
  }

  window.deleteWorkVideo = function(index) {
    let videos = getSavedVideos();
    videos.splice(index, 1);
    localStorage.setItem("workVideos", JSON.stringify(videos));
    renderVideos();
  };

  if (addVideoBtn) {
    addVideoBtn.addEventListener("click", () => {
      const title = videoTitleInput.value.trim() || "Proyecto Shopify";
      const url = videoUrlInput.value.trim();
      if (!url) {
        alert("Por favor pega el enlace del video.");
        return;
      }
      let videos = getSavedVideos();
      videos.push({ title, url });
      localStorage.setItem("workVideos", JSON.stringify(videos));
      videoTitleInput.value = "";
      videoUrlInput.value = "";
      renderVideos();
      alert("¡Video agregado!");
    });
  }

  renderVideos();

  // 6. Solicitud de servicio (Clientes)
  const serviceModal = document.getElementById("serviceModal");
  const selectedPlanName = document.getElementById("selectedPlanName");
  const serviceRequestForm = document.getElementById("serviceRequestForm");
  const closeServiceModal = document.getElementById("closeServiceModal");

  document.querySelectorAll(".RequestServiceBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (selectedPlanName) selectedPlanName.textContent = btn.getAttribute("data-plan");
      if (serviceModal) serviceModal.classList.remove("hidden");
    });
  });

  if (closeServiceModal) {
    closeServiceModal.addEventListener("click", () => serviceModal.classList.add("hidden"));
  }

  if (serviceRequestForm) {
    serviceRequestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("clientName").value.trim();
      const email = document.getElementById("clientEmail").value.trim();
      const phone = document.getElementById("clientPhone").value.trim();
      const plan = selectedPlanName ? selectedPlanName.textContent : "General";

      let requests = JSON.parse(localStorage.getItem("serviceRequests") || "[]");
      requests.push({ name, email, phone, plan });
      localStorage.setItem("serviceRequests", JSON.stringify(requests));

      alert(`¡Gracias ${name}! Tu solicitud para "${plan}" fue registrada con éxito.`);
      serviceRequestForm.reset();
      serviceModal.classList.add("hidden");
      updateAdminStats();
    });
  }

  // 7. Acceso Restringido mediante Contraseña (pley456)
  const openAdminLogin = document.getElementById("openAdminLogin");
  const ownerLoginModal = document.getElementById("ownerLoginModal");
  const closeOwnerLogin = document.getElementById("closeOwnerLogin");
  const ownerAuthForm = document.getElementById("ownerAuthForm");
  const openAdminModal = document.getElementById("openAdminModal");
  const adminModal = document.getElementById("adminModal");
  const closeAdminModal = document.getElementById("closeAdminModal");

  if (sessionStorage.getItem("isOwner") === "true") {
    if (openAdminModal) openAdminModal.classList.remove("hidden");
    if (openAdminLogin) openAdminLogin.classList.add("hidden");
  }

  if (openAdminLogin) {
    openAdminLogin.addEventListener("click", (e) => {
      e.preventDefault();
      if (ownerLoginModal) ownerLoginModal.classList.remove("hidden");
    });
  }

  if (closeOwnerLogin) {
    closeOwnerLogin.addEventListener("click", () => ownerLoginModal.classList.add("hidden"));
  }

  if (ownerAuthForm) {
    ownerAuthForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const passInput = document.getElementById("ownerPassInput").value.trim();
      
      // VALIDACIÓN DE CONTRASEÑA
      if (passInput === ADMIN_PASS) {
        sessionStorage.setItem("isOwner", "true");
        if (ownerLoginModal) ownerLoginModal.classList.add("hidden");
        if (openAdminLogin) openAdminLogin.classList.add("hidden");
        if (openAdminModal) openAdminModal.classList.remove("hidden");
        updateAdminStats();
      } else {
        alert("Contraseña incorrecta.");
      }
    });
  }

  if (openAdminModal) {
    openAdminModal.addEventListener("click", (e) => {
      e.preventDefault();
      updateAdminStats();
      if (adminModal) adminModal.classList.remove("hidden");
    });
  }

  if (closeAdminModal) {
    closeAdminModal.addEventListener("click", () => adminModal.classList.add("hidden"));
  }

  function updateAdminStats() {
    let requests = JSON.parse(localStorage.getItem("serviceRequests") || "[]");
    const totalReqEl = document.getElementById("totalRequestsCount");
    if (totalReqEl) totalReqEl.textContent = requests.length;

    const listEl = document.getElementById("registeredRequestsList");
    if (listEl) {
      listEl.innerHTML = requests.length
        ? requests.map(r => `<li><div><strong>${r.name}</strong> - ${r.plan}<br><small>${r.email} | ${r.phone}</small></div></li>`).join("")
        : "<li>Aún no hay solicitudes registradas.</li>";
    }

    const adminEmailInput = document.getElementById("adminEmailInput");
    const adminPhoneInput = document.getElementById("adminPhoneInput");
    if (adminEmailInput) adminEmailInput.value = localStorage.getItem("contactEmail") || "sebastian178requena@gmail.com";
    if (adminPhoneInput) adminPhoneInput.value = localStorage.getItem("contactPhone") || "+58 400 000 0000";
  }

  // 8. Cambiar Imagen de Fondo (Admin)
  const saveBgBtn = document.getElementById("saveBgBtn");
  const imgUrlInput = document.getElementById("imgUrlInput");
  const bgGallery = document.getElementById("bgGallery");

  const customBg = localStorage.getItem("customBgImage");
  if (customBg && bgGallery) {
    bgGallery.innerHTML = `<div class="bg-slide active" style="background-image: url('${customBg}')"></div>`;
  }

  if (saveBgBtn) {
    saveBgBtn.addEventListener("click", () => {
      const newUrl = imgUrlInput.value.trim();
      if (newUrl) {
        localStorage.setItem("customBgImage", newUrl);
        bgGallery.innerHTML = `<div class="bg-slide active" style="background-image: url('${newUrl}')"></div>`;
        alert("¡Imagen de fondo actualizada!");
        imgUrlInput.value = "";
      }
    });
  }

  // 9. Guardar Cambios de Contacto (Admin)
  const saveContactBtn = document.getElementById("saveContactBtn");
  if (saveContactBtn) {
    saveContactBtn.addEventListener("click", () => {
      const newEmail = document.getElementById("adminEmailInput").value.trim();
      const newPhone = document.getElementById("adminPhoneInput").value.trim();

      if (newEmail) localStorage.setItem("contactEmail", newEmail);
      if (newPhone) localStorage.setItem("contactPhone", newPhone);

      loadContactInfo();
      alert("¡Datos de contacto actualizados con éxito!");
    });
  }

  // 10. Contacto Directo Interactivo
  const btnReveal = document.getElementById("btnRevealContact");
  const contactDetails = document.getElementById("contactDetails");
  if (btnReveal && contactDetails) {
    btnReveal.addEventListener("click", () => {
      contactDetails.classList.toggle("hidden");
      btnReveal.textContent = contactDetails.classList.contains("hidden")
        ? "Mostrar Contacto Directo"
        : "Ocultar Contacto";
    });
  }

  // 11. Carrusel lento de fondo y Scroll
  if (!customBg) {
    const slides = document.querySelectorAll(".bg-slide");
    let currentSlide = 0;
    if (slides.length > 0) {
      setInterval(() => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
      }, 6000);
    }
  }

  document.querySelectorAll(".Arrow").forEach((arrow) => {
    arrow.addEventListener("click", () => {
      const target = document.querySelector(arrow.getAttribute("data-target"));
      if (target) {
        gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 10 }, ease: "power3.inOut" });
      }
    });
  });
});