// js/clients_alt.js — copia funcional de clients.js adaptada para clients_alt.html
// Mantiene la lógica original, solo se asegura que el botón "Atrás" redirija a empleado.html
(() => {
  const STORAGE_KEY = 'fit_clients_v1';

  // --- DOM (mismos ids que en el HTML) ---
  const searchInput = document.getElementById('search');
  const clientsTbody = document.getElementById('clientesBody');
  const openAddBtn = document.getElementById('addBtn');
  const backBtn = document.getElementById('backBtn');

  const clientFormWrap = document.getElementById('dialog');
  const clientForm = document.getElementById('clienteForm');
  const clientIdInput = document.getElementById('cli-id');
  const clientNombre = document.getElementById('cli-nombre');
  const clientTelefono = document.getElementById('cli-telefono');
  const clientCorreo = document.getElementById('cli-correo');
  const clientMembresia = document.getElementById('cli-membresia');
  const cancelBtn = document.getElementById('cancelBtn');

  const errNombre = document.getElementById('err-nombre');
  const errTelefono = document.getElementById('err-telefono');
  const errCorreo = document.getElementById('err-correo');
  const errMembresia = document.getElementById('err-membresia');

  // --- Estado ---
  let clients = [];
  let editingId = null;

  // --- Utilidades ---
  function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (e) { console.warn('safeParse: JSON inválido', e); return fallback; }
  }
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  // --- Almacenamiento ---
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      clients = safeParse(raw, []);
      if (!Array.isArray(clients)) clients = [];
    } catch (e) { clients = []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clients)); } catch (e) { console.error('save error', e); }
  }
  function nextId() {
    try { return clients.length ? Math.max(...clients.map(c => Number(c.id || 0))) + 1 : 1; } catch(e){ return Date.now(); }
  }

  // --- UI helpers ---
  function clearFormErrors(){
    [errNombre, errTelefono, errCorreo, errMembresia].forEach(e => { if(!e) return; e.hidden = true; if(e.classList) e.classList.remove('active'); });
  }
  function resetForm(){
    if(clientForm && clientForm.reset) clientForm.reset();
    editingId = null;
    clearFormErrors();
  }
  function openForm(client){
    if(!clientFormWrap) return;
    clearFormErrors();
    clientFormWrap.style.display = 'block';
    clientFormWrap.setAttribute && clientFormWrap.setAttribute('aria-hidden','false');
    if(client){
      editingId = client.id;
      if(clientIdInput) clientIdInput.value = client.id;
      if(clientNombre) clientNombre.value = client.nombre || '';
      if(clientTelefono) clientTelefono.value = client.telefono || '';
      if(clientCorreo) clientCorreo.value = client.correo || '';
      if(clientMembresia) clientMembresia.value = client.membresia || '';
    } else {
      editingId = null;
      if(clientForm && clientForm.reset) clientForm.reset();
    }
    if(clientNombre && clientNombre.focus) clientNombre.focus();
  }
  function closeForm(){
    if(!clientFormWrap) return;
    clientFormWrap.style.display = 'none';
    clientFormWrap.setAttribute && clientFormWrap.setAttribute('aria-hidden','true');
    resetForm();
  }

  // --- Render tabla ---
  function renderTable(filter = '') {
    if(!clientsTbody) return;
    try {
      const q = String(filter || '').trim().toLowerCase();
      const rows = clients
        .filter(c => {
          if(!q) return true;
          return String(c.id).toLowerCase().includes(q) || (c.nombre && c.nombre.toLowerCase().includes(q));
        })
        .map(c => `
          <tr data-id="${c.id}" tabindex="0">
            <td>${c.id}</td>
            <td>${escapeHtml(c.nombre)}</td>
            <td>${escapeHtml(c.telefono || '')}</td>
            <td>${escapeHtml(c.membresia || '')}</td>
            <td>${escapeHtml(c.inicio || '')}</td>
            <td>${escapeHtml(c.fin || '')}</td>
          </tr>
        `).join('');
      clientsTbody.innerHTML = rows || '<tr class="empty-row"><td colspan="6" class="small-muted">No hay clientes</td></tr>';
    } catch (e) {
      console.error('renderTable error', e);
      clientsTbody.innerHTML = '<tr class="empty-row"><td colspan="6" class="small-muted">Error mostrando clientes</td></tr>';
    }
  }

  // --- Validación ---
  function validateForm(){
    clearFormErrors();
    let ok = true;
    const nombre = (clientNombre && clientNombre.value || '').trim();
    const telefono = (clientTelefono && clientTelefono.value || '').trim();
    const correo = (clientCorreo && clientCorreo.value || '').trim();
    const membresia = (clientMembresia && clientMembresia.value || '').trim();

    if(!nombre){ if(errNombre){ errNombre.hidden = false; errNombre.classList.add('active'); } ok = false; }
    if(!membresia){ if(errMembresia){ errMembresia.hidden = false; errMembresia.classList.add('active'); } ok = false; }

    if(telefono){
      const telRe = /^[0-9()+\s-]{6,25}$/;
      if(!telRe.test(telefono)){ if(errTelefono){ errTelefono.hidden = false; errTelefono.classList.add('active'); } ok = false; }
    }
    if(correo){
      const mailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!mailRe.test(correo)){ if(errCorreo){ errCorreo.hidden = false; errCorreo.classList.add('active'); } ok = false; }
    }
    return { ok, nombre, telefono, correo, membresia };
  }

  // --- Guardar desde el form ---
  function handleSave(e){
    e && e.preventDefault && e.preventDefault();
    try {
      const res = validateForm();
      if(!res.ok) return;
      if(editingId == null){
        const newClient = { id: nextId(), nombre: res.nombre, telefono: res.telefono || '', correo: res.correo || '', membresia: res.membresia || '', inicio:'', fin:'' };
        clients.push(newClient);
        save();
        renderTable(searchInput && searchInput.value);
        closeForm();
        return;
      }
      const idx = clients.findIndex(c => String(c.id) === String(editingId));
      if(idx === -1){ closeForm(); return; }
      clients[idx].nombre = res.nombre;
      clients[idx].telefono = res.telefono || '';
      clients[idx].correo = res.correo || '';
      clients[idx].membresia = res.membresia || '';
      save();
      renderTable(searchInput && searchInput.value);
      closeForm();
    } catch (err) {
      console.error('handleSave error', err);
      alert('Error al guardar. Revisa la consola.');
    }
  }

  // --- Eventos de tabla (click -> editar/eliminar) ---
  function handleTableClick(e){
    // si los botones Edit/Delete existen en tu original, aquí se podría manejar
    // pero para mantener igualdad con tu código original, solo seleccionamos filas
    const tr = e.target && e.target.closest && e.target.closest('tr');
    if(!tr) return;
    // si quieres abrir el modal al hacer click, descomenta:
    // const id = tr.getAttribute('data-id'); const client = clients.find(c=>String(c.id)===String(id)); if(client) openForm(client);
  }

  // --- Seed de ejemplo si falta data ---
  function seedIfEmpty(){
    if(clients && clients.length) return;
    clients = [
      { id:2, nombre:'Jesus Hernandez Delgado', telefono:'1122394545', correo:'jhes@example.com', membresia:'Prueba', inicio:'01/08/2025', fin:'02/08/2025' },
      { id:3, nombre:'Angel Sepulveda Millan', telefono:'1122394545', correo:'asep@example.com', membresia:'Prueba', inicio:'15/07/2025', fin:'16/07/2025' }
    ];
    save();
  }

  // --- Forzar que el botón "Atrás" redirija a empleado.html ---
  (function forceBackToEmpleado(){
    const btn = document.getElementById('backBtn');
    if(!btn) return;
    try {
      // reemplaza el nodo para eliminar listeners anteriores que hagan fallback a admin
      const replacement = btn.cloneNode(true);
      btn.parentNode.replaceChild(replacement, btn);
      const finalBtn = document.getElementById('backBtn');
      finalBtn.addEventListener('click', function(ev){
        ev && ev.preventDefault && ev.preventDefault();
        // redirigir siempre a empleado.html (singular)
        window.location.href = 'empleado.html';
      });
    } catch (err) {
      // si algo falla, añade listener directamente
      btn.addEventListener('click', function(ev){
        ev && ev.preventDefault && ev.preventDefault();
        window.location.href = 'empleado.html';
      });
    }
  })();

  // --- Enlazado de eventos ---
  if(openAddBtn) openAddBtn.addEventListener('click', () => openForm(null));
  if(cancelBtn) cancelBtn.addEventListener('click', () => closeForm());
  if(clientForm) clientForm.addEventListener('submit', handleSave);
  if(clientsTbody) clientsTbody.addEventListener('click', handleTableClick);
  if(searchInput) searchInput.addEventListener('input', (e) => renderTable(e.target.value));

  // --- Inicialización ---
  (function init(){
    load();
    seedIfEmpty();
    renderTable();
  })();

})();
