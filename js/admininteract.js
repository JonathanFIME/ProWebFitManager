// amindinteract.js
(() => {
  // Elements
  const profileBtn = document.getElementById('profileBtn');
  const profileMenu = document.getElementById('profileMenu');
  const menuAdminName = document.getElementById('menuAdminName');
  const menuAvatar = document.getElementById('menuAvatar');
  const headerAvatar = document.getElementById('headerAvatar');
  const adminNameEls = [
    document.getElementById('admin-name'),
    document.getElementById('menuAdminName'),
    document.getElementById('viewName')
  ];

  // Modals and controls
  const overlayView = document.getElementById('overlayView');
  const overlayEdit = document.getElementById('overlayEdit');
  const viewProfileBtn = document.getElementById('viewProfileBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editPhotoBtn = document.getElementById('editPhotoBtn');
  const signoutBtnMenu = document.getElementById('signoutBtnMenu');

  // Form inputs
  const editForm = document.getElementById('editForm');
  const nombreInput = document.getElementById('nombreInput');
  const direccionInput = document.getElementById('direccionInput');
  const telefonoInput = document.getElementById('telefonoInput');
  const correoInput = document.getElementById('correoInput');
  const avatarInput = document.getElementById('editAvatarInput');
  const editAvatarPreview = document.getElementById('editAvatarPreview');

  // View fields
  const viewDireccion = document.getElementById('viewDireccion');
  const viewTelefono = document.getElementById('viewTelefono');
  const viewCorreo = document.getElementById('viewCorreo');
  const viewAvatar = document.getElementById('viewAvatar');

  // Quick actions navigation
  document.querySelectorAll('.action-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-target');
      if (t) window.location.href = t;
    });
  });

  // Load profile from localStorage
  const storedRaw = localStorage.getItem('fit_admin_profile');
  const stored = storedRaw ? JSON.parse(storedRaw) : {};
  const profile = {
    nombre: stored.nombre || 'Admin',
    direccion: stored.direccion || '',
    telefono: stored.telefono || '',
    correo: stored.correo || '',
    avatarData: stored.avatarData || ''
  };

  // Apply profile to UI
  function applyProfileToUI(data) {
    adminNameEls.forEach(el => { if (el) el.textContent = data.nombre; });
    menuAvatar.src = data.avatarData || 'imagen/avatar-default.png';
    headerAvatar.src = data.avatarData || 'imagen/avatar-default.png';
    viewAvatar.src = data.avatarData || 'imagen/avatar-default.png';
    viewDireccion.textContent = data.direccion || 'No especificado';
    viewTelefono.textContent = data.telefono || 'No especificado';
    viewCorreo.textContent = data.correo || 'No especificado';
    if (nombreInput) nombreInput.value = data.nombre || '';
    if (direccionInput) direccionInput.value = data.direccion || '';
    if (telefonoInput) telefonoInput.value = data.telefono || '';
    if (correoInput) correoInput.value = data.correo || '';
    if (editAvatarPreview) editAvatarPreview.src = data.avatarData || 'imagen/avatar-default.png';
  }
  applyProfileToUI(profile);

  // Dropdown: toggle only on click, not visible by default
  function closeDropdown() {
    profileMenu.classList.remove('open');
    profileMenu.setAttribute('aria-hidden', 'true');
    profileBtn.setAttribute('aria-expanded', 'false');
  }
  function openDropdown() {
    profileMenu.classList.add('open');
    profileMenu.setAttribute('aria-hidden', 'false');
    profileBtn.setAttribute('aria-expanded', 'true');
    const first = profileMenu.querySelector('.menu-item');
    if (first) first.focus();
  }

  // Initialize closed
  closeDropdown();

  profileBtn && profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (profileMenu.classList.contains('open')) closeDropdown(); else openDropdown();
  });

  // Close dropdown on outside click or Escape
  document.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target) && e.target !== profileBtn && profileMenu.classList.contains('open')) {
      closeDropdown();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (profileMenu.classList.contains('open')) { closeDropdown(); profileBtn.focus(); }
    }
  });

  // Modal helpers
  function openOverlay(o) { if (!o) return; o.classList.add('active'); o.setAttribute('aria-hidden', 'false'); }
  function closeOverlay(o) { if (!o) return; o.classList.remove('active'); o.setAttribute('aria-hidden', 'true'); }

  // Menu actions
  viewProfileBtn && viewProfileBtn.addEventListener('click', () => {
    closeDropdown();
    openOverlay(overlayView);
  });
  editProfileBtn && editProfileBtn.addEventListener('click', () => {
    closeDropdown();
    openOverlay(overlayEdit);
  });
  editPhotoBtn && editPhotoBtn.addEventListener('click', () => {
    closeDropdown();
    openOverlay(overlayEdit);
    setTimeout(() => { avatarInput && avatarInput.focus(); }, 200);
  });
  signoutBtnMenu && signoutBtnMenu.addEventListener('click', () => {
    localStorage.removeItem('fit_admin_profile');
    localStorage.removeItem('fit_admin_name');
    window.location.href = 'index.html';
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const o = e.target.closest('.overlay');
      closeOverlay(o);
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const o = e.target.closest('.overlay');
      closeOverlay(o);
    });
  });

  // Open edit from view modal
  const openEditFromView = document.getElementById('openEditFromView');
  openEditFromView && openEditFromView.addEventListener('click', () => {
    closeOverlay(overlayView);
    openOverlay(overlayEdit);
  });

  // Click outside modal closes it
  [overlayView, overlayEdit].forEach(ov => {
    if (!ov) return;
    ov.addEventListener('click', (e) => {
      if (e.target === ov) closeOverlay(ov);
    });
  });

  // Avatar upload preview (limit 2MB)
  avatarInput && avatarInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      alert('La imagen excede 2MB. Elige otra más ligera.');
      avatarInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      editAvatarPreview.src = reader.result;
    };
    reader.readAsDataURL(f);
  });

  // Validation helpers
  function setError(el, msg) {
    const id = el.id;
    const err = document.getElementById('error' + id.charAt(0).toUpperCase() + id.slice(1));
    if (err) { err.textContent = msg; err.classList.add('active'); }
    el.setAttribute('aria-invalid', 'true');
  }
  function clearError(el) {
    const id = el.id;
    const err = document.getElementById('error' + id.charAt(0).toUpperCase() + id.slice(1));
    if (err) err.classList.remove('active');
    el.removeAttribute('aria-invalid');
  }

  // Form submit: all fields required (nombre, direccion, telefono, correo)
  editForm && editForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let valid = true;

    // Nombre
    if (!nombreInput.value.trim()) { setError(nombreInput, 'Este campo es obligatorio'); valid = false; } else clearError(nombreInput);

    // Dirección
    if (!direccionInput.value.trim()) { setError(direccionInput, 'Este campo es obligatorio'); valid = false; } else clearError(direccionInput);

    // Teléfono
    const telVal = telefonoInput.value.trim();
    const telRe = /^[0-9()+\s-]{6,25}$/;
    if (!telVal || !telRe.test(telVal)) { setError(telefonoInput, 'Introduce un teléfono válido'); valid = false; } else clearError(telefonoInput);

    // Correo
    const mailVal = correoInput.value.trim();
    const mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mailVal || !mailRe.test(mailVal)) { setError(correoInput, 'Introduce un correo válido'); valid = false; } else clearError(correoInput);

    if (!valid) return;

    // Save to localStorage
    const avatarData = editAvatarPreview.src && !editAvatarPreview.src.endsWith('imagen/avatar-default.png') ? editAvatarPreview.src : '';
    const profileToStore = {
      nombre: nombreInput.value.trim(),
      direccion: direccionInput.value.trim(),
      telefono: telefonoInput.value.trim(),
      correo: correoInput.value.trim(),
      avatarData: avatarData
    };
    localStorage.setItem('fit_admin_profile', JSON.stringify(profileToStore));
    localStorage.setItem('fit_admin_name', profileToStore.nombre);

    // update UI
    applyProfileToUI(profileToStore);

    // close and confirm
    closeOverlay(overlayEdit);
    alert('Perfil actualizado correctamente.');
  });

  // Apply profile to UI function (reused inside module)
  function applyProfileToUI(data) {
    adminNameEls.forEach(el => { if (el) el.textContent = data.nombre; });
    menuAvatar.src = data.avatarData || 'imagen/avatar-default.png';
    headerAvatar.src = data.avatarData || 'imagen/avatar-default.png';
    viewAvatar.src = data.avatarData || 'imagen/avatar-default.png';
    viewDireccion.textContent = data.direccion || 'No especificado';
    viewTelefono.textContent = data.telefono || 'No especificado';
    viewCorreo.textContent = data.correo || 'No especificado';
    if (nombreInput) nombreInput.value = data.nombre || '';
    if (direccionInput) direccionInput.value = data.direccion || '';
    if (telefonoInput) telefonoInput.value = data.telefono || '';
    if (correoInput) correoInput.value = data.correo || '';
    if (editAvatarPreview) editAvatarPreview.src = data.avatarData || 'imagen/avatar-default.png';
  }

  // Initialize UI with stored data (if any)
  const persistedRaw = localStorage.getItem('fit_admin_profile');
  if (persistedRaw) {
    try {
      const persisted = JSON.parse(persistedRaw);
      applyProfileToUI(persisted);
    } catch (e) { /* ignore */ }
  }

  // Accessibility: close dropdown if focus moves outside (basic)
  document.addEventListener('focusin', (e) => {
    if (profileMenu.classList.contains('open') && !profileMenu.contains(e.target) && e.target !== profileBtn) {
      // keep open if focusing inside menu; otherwise close
      if (!profileMenu.contains(e.target)) closeDropdown();
    }
  });

  // Expose closeDropdown for internal use
  function closeDropdown() {
    profileMenu.classList.remove('open');
    profileMenu.setAttribute('aria-hidden', 'true');
    profileBtn.setAttribute('aria-expanded', 'false');
  }

})();
