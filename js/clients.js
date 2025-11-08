// js/clients.js
(() => {
  // Elementos DOM
  const tbody = document.getElementById('clientesBody');
  const search = document.getElementById('search');
  const addBtn = document.getElementById('addBtn');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const backBtn = document.getElementById('backBtn');

  // Modal form
  const dialog = document.getElementById('dialog');
  const overlay = document.getElementById('overlay');
  const closeDialog = document.getElementById('closeDialog');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('clienteForm');
  const inputId = document.getElementById('cli-id');
  const inputNombre = document.getElementById('cli-nombre');
  const inputTelefono = document.getElementById('cli-telefono');
  const inputCorreo = document.getElementById('cli-correo');
  const inputMembresia = document.getElementById('cli-membresia');
  const inputInicio = document.getElementById('cli-inicio');
  const inputFin = document.getElementById('cli-fin');
  const inputIngreso = document.getElementById('cli-ingreso');

  const errNombre = document.getElementById('err-nombre');
  const errTelefono = document.getElementById('err-telefono');
  const errCorreo = document.getElementById('err-correo');
  const errMembresia = document.getElementById('err-membresia');
  const errInicio = document.getElementById('err-inicio');
  const errFin = document.getElementById('err-fin');
  const errIngreso = document.getElementById('err-ingreso');

  // Confirm
  const confirmDialog = document.getElementById('confirmDialog');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');

  let selectedRow = null;

  // Helpers
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function formatDate(iso){ if(!iso) return 'DD/MM/AAAA'; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; }

  // Modal open/close
  function openDialog(mode, row = null){
    clearValidation();
    form.reset();
    inputId.value = '';
    document.getElementById('dialogTitle').textContent = mode === 'add' ? 'Agregar cliente' : 'Editar cliente';

    if(mode === 'edit' && row){
      inputId.value = row.dataset.id;
      inputNombre.value = row.cells[1].textContent.trim();
      inputTelefono.value = row.cells[2].textContent.trim();
      inputCorreo.value = row.cells[3].textContent.trim();
      inputMembresia.value = row.cells[4].textContent.trim();

      const parseDMY = (text) => {
        const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if(!m) return '';
        return `${m[3]}-${m[2]}-${m[1]}`; // yyyy-mm-dd
      };
      inputInicio.value = parseDMY(row.cells[5].textContent.trim());
      inputFin.value = parseDMY(row.cells[6].textContent.trim());
      inputIngreso.value = parseDMY(row.cells[7].textContent.trim());
    }

    dialog.setAttribute('aria-hidden','false');
    dialog.style.display = 'flex';
    overlay.hidden = false;
    setTimeout(() => inputNombre.focus(), 50);
  }

  function closeModal(){
    dialog.setAttribute('aria-hidden','true');
    dialog.style.display = 'none';
    overlay.hidden = true;
  }

  function openConfirm(){
    confirmDialog.setAttribute('aria-hidden','false');
    confirmDialog.style.display = 'flex';
    confirmOverlay.hidden = false;
    confirmYes.focus();
  }

  function closeConfirm(){
    confirmDialog.setAttribute('aria-hidden','true');
    confirmDialog.style.display = 'none';
    confirmOverlay.hidden = true;
  }

  function selectRow(tr){
    if(selectedRow) selectedRow.classList.remove('selected');
    selectedRow = tr;
    selectedRow.classList.add('selected');
    editBtn.disabled = false;
    deleteBtn.disabled = false;
  }

  function clearSelection(){
    if(selectedRow) selectedRow.classList.remove('selected');
    selectedRow = null;
    editBtn.disabled = true;
    deleteBtn.disabled = true;
  }

  // Event listeners: selection
  tbody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if(!tr) return;
    selectRow(tr);
  });
  tbody.addEventListener('keydown', (e) => {
    const tr = e.target.closest('tr');
    if(!tr) return;
    if(e.key === 'Enter') selectRow(tr);
  });

  // Buttons
  addBtn.addEventListener('click', () => openDialog('add'));
  editBtn.addEventListener('click', () => { if(selectedRow) openDialog('edit', selectedRow); });
  deleteBtn.addEventListener('click', () => { if(selectedRow) openConfirm(); });
  backBtn.addEventListener('click', () => window.location.href = 'admin.html');

  // Modal controls
  closeDialog.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(dialog.getAttribute('aria-hidden') === 'false') closeModal();
      if(confirmDialog.getAttribute('aria-hidden') === 'false') closeConfirm();
    }
  });

  // Confirm controls
  confirmNo.addEventListener('click', closeConfirm);
  confirmOverlay.addEventListener('click', closeConfirm);
  confirmYes.addEventListener('click', () => {
    if(!selectedRow){ closeConfirm(); return; }
    selectedRow.remove();
    clearSelection();
    closeConfirm();
  });

  // Validation helpers
  function clearValidation(){
    [errNombre, errTelefono, errCorreo, errMembresia, errInicio, errFin, errIngreso].forEach(el => { if(el) el.hidden = true; });
    [inputNombre, inputTelefono, inputCorreo, inputMembresia, inputInicio, inputFin, inputIngreso].forEach(i => { if(i) i.classList.remove('input-invalid'); });
  }



  
  function showValidation(input, errEl, message){
    if(!input || !errEl) return;
    errEl.textContent = message;
    errEl.hidden = false;
    input.classList.add('input-invalid');
    input.focus();
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearValidation();

    const id = inputId.value || '';
    const nombre = inputNombre.value.trim();
    const telefono = inputTelefono.value.trim();
    const correo = inputCorreo.value.trim();
    const membresia = inputMembresia.value;
    const inicio = inputInicio.value;
    const fin = inputFin.value;
    const ingreso = inputIngreso.value;

    if(!nombre){ showValidation(inputNombre, errNombre, 'Campo obligatorio'); return; }
    if(!telefono){ showValidation(inputTelefono, errTelefono, 'Campo obligatorio'); return; }
    if(!correo){ showValidation(inputCorreo, errCorreo, 'Campo obligatorio'); return; }
    if(!membresia){ showValidation(inputMembresia, errMembresia, 'Rellenar este campo'); return; }
    if(!inicio){ showValidation(inputInicio, errInicio, 'Campo obligatorio'); return; }
    if(!fin){ showValidation(inputFin, errFin, 'Campo obligatorio'); return; }
    if(!ingreso){ showValidation(inputIngreso, errIngreso, 'Campo obligatorio'); return; }

    // Guardado simulado
    if(id){
      const row = tbody.querySelector(`tr[data-id="${id}"]`);
      if(row){
        row.cells[1].textContent = nombre;
        row.cells[2].textContent = telefono;
        row.cells[3].textContent = correo;
        row.cells[4].textContent = membresia;
        row.cells[5].textContent = formatDate(inicio);
        row.cells[6].textContent = formatDate(fin);
        row.cells[7].textContent = formatDate(ingreso);
      }
    } else {
      const newId = Date.now();
      const tr = document.createElement('tr');
      tr.dataset.id = newId;
      tr.tabIndex = 0;
      tr.innerHTML = `
        <td>${newId}</td>
        <td>${escapeHtml(nombre)}</td>
        <td>${escapeHtml(telefono)}</td>
        <td>${escapeHtml(correo)}</td>
        <td>${escapeHtml(membresia)}</td>
        <td>${formatDate(inicio)}</td>
        <td>${formatDate(fin)}</td>
        <td>${formatDate(ingreso)}</td>
      `;
      tbody.appendChild(tr);
      selectRow(tr);
    }

    closeModal();
  });

  // SEARCH: show only matching rows or "no results"
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const rows = Array.from(tbody.rows);
    const existingEmpty = document.getElementById('no-results-row');
    if (existingEmpty) existingEmpty.remove();

    if (!q) {
      // show all if empty
      rows.forEach(r => r.style.display = '');
      clearSelection();
      return;
    }

    const matches = rows.filter(row => {
      const id = row.cells[0].textContent.trim().toLowerCase();
      const text = row.textContent.toLowerCase();
      return id === q || text.includes(q);
    });

    // hide all first
    rows.forEach(r => r.style.display = 'none');

    if (matches.length === 0) {
      const tr = document.createElement('tr');
      tr.id = 'no-results-row';
      tr.innerHTML = `<td colspan="8" style="text-align:center;padding:18px;color:var(--muted)">No se encontraron resultados</td>`;
      tbody.appendChild(tr);
      clearSelection();
      return;
    }

    // show only matches
    matches.forEach(r => r.style.display = '');

    // if one match, move to top and select it
    if (matches.length === 1) {
      const row = matches[0];
      tbody.insertBefore(row, tbody.firstChild);
      selectRow(row);
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      clearSelection();
    }
  });

  // Clear validation on input
  [inputNombre, inputTelefono, inputCorreo, inputInicio, inputFin, inputIngreso].forEach(inp => {
    if(!inp) return;
    inp.addEventListener('input', () => {
      if(inp.value.trim()){ const err = document.getElementById('err-' + inp.id.split('-')[1]); if(err){ err.hidden = true; inp.classList.remove('input-invalid'); } }
    });
  });
  if(inputMembresia){
    inputMembresia.addEventListener('change', () => { if(inputMembresia.value){ errMembresia.hidden = true; inputMembresia.classList.remove('input-invalid'); } });
  }

  // AUTOFILL DATES based on membership
  (function(){
    function toIsoDate(d){
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,'0');
      const day = String(d.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    }
    function addDays(date, days){ const d = new Date(date); d.setDate(d.getDate() + days); return d; }
    function addMonths(date, months){ const d = new Date(date); d.setMonth(d.getMonth() + months); return d; }
    function addYears(date, years){ const d = new Date(date); d.setFullYear(d.getFullYear() + years); return d; }

    if(!inputMembresia || !inputInicio || !inputFin || !inputIngreso) return;

    inputMembresia.addEventListener('change', () => {
      const tipo = inputMembresia.value;
      if(!tipo) return;

      const hoy = new Date();
      let finDate;

      if(tipo.toLowerCase() === 'prueba'){ finDate = addDays(hoy, 1); }
      else if(tipo.toLowerCase() === 'mensual'){ finDate = addMonths(hoy, 1); }
      else if(tipo.toLowerCase() === 'anual'){ finDate = addYears(hoy, 1); }
      else return;

      if(!inputInicio.value) inputInicio.value = toIsoDate(hoy);
      if(!inputFin.value) inputFin.value = toIsoDate(finDate);
      if(!inputIngreso.value) inputIngreso.value = toIsoDate(hoy);

      if(errInicio){ errInicio.hidden = true; inputInicio.classList.remove('input-invalid'); }
      if(errFin){ errFin.hidden = true; inputFin.classList.remove('input-invalid'); }
      if(errIngreso){ errIngreso.hidden = true; inputIngreso.classList.remove('input-invalid'); }
    });

    // prevent typing/paste in readonly date inputs
    [inputInicio, inputFin, inputIngreso].forEach(inp => {
      if(!inp) return;
      inp.addEventListener('keydown', (e) => e.preventDefault());
      inp.addEventListener('paste', (e) => e.preventDefault());
    });
  })();

})();
