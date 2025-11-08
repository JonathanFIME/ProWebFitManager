// js/products.js
(() => {
  const STORAGE_KEY = 'fit_products_v1';

  // DOM
  const searchInput = document.getElementById('searchInput');
  const productsTbody = document.getElementById('productsTbody');
  const openAddBtn = document.getElementById('openAddBtn');
  const backBtn = document.getElementById('backBtn');

  const productFormWrap = document.getElementById('productFormWrap');
  const productForm = document.getElementById('productForm');
  const prodNombre = document.getElementById('prodNombre');
  const prodCantidad = document.getElementById('prodCantidad');
  const prodEstado = document.getElementById('prodEstado');
  const prodPrecio = document.getElementById('prodPrecio');
  const cancelFormBtn = document.getElementById('cancelFormBtn');
  const saveFormBtn = document.getElementById('saveFormBtn');

  const errorNombre = document.getElementById('errorNombre');
  const errorNombreDup = document.getElementById('errorNombreDup');
  const errorEstado = document.getElementById('errorEstado');
  const errorPrecio = document.getElementById('errorPrecio');

  // State
  let products = [];
  let editingId = null; // null => new, otherwise id number

  // Helpers
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      products = raw ? JSON.parse(raw) : [];
    } catch (e) { products = []; }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
  function nextId() {
    return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  }

  function formatPrice(n){
    return '$' + Number(n).toFixed(2);
  }

  function clearFormErrors(){
    [errorNombre, errorNombreDup, errorEstado, errorPrecio].forEach(e => e && e.classList.remove('active'));
  }

  function resetForm(){
    productForm.reset();
    prodCantidad.value = '';
    editingId = null;
    clearFormErrors();
  }

  function openForm(editProduct){
    productFormWrap.style.display = 'block';
    if(editProduct){
      editingId = editProduct.id;
      prodNombre.value = editProduct.nombre;
      prodCantidad.value = String(editProduct.cantidad);
      prodEstado.value = editProduct.estado;
      prodPrecio.value = String(editProduct.precio);
    } else {
      editingId = null;
      productForm.reset();
      prodCantidad.value = ''; // empty -> will default to 0
    }
    prodNombre.focus();
  }

  function closeForm(){
    productFormWrap.style.display = 'none';
    resetForm();
  }

  function renderTable(filterText = ''){
    const q = String(filterText || '').trim().toLowerCase();
    const rows = products
      .filter(p => {
        if(!q) return true;
        return String(p.id).includes(q) || p.nombre.toLowerCase().includes(q);
      })
      .map(p => {
        return `
          <tr data-id="${p.id}">
            <td>${p.id}</td>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${p.cantidad}</td>
            <td>${escapeHtml(p.estado)}</td>
            <td>${formatPrice(p.precio)}</td>
            <td>
              <button class="btn-inline btn-edit" data-action="edit" data-id="${p.id}">Editar</button>
              <button class="btn-inline btn-delete" data-action="delete" data-id="${p.id}">Eliminar</button>
            </td>
          </tr>
        `;
      }).join('');
    productsTbody.innerHTML = rows || '<tr><td colspan="6" class="small-muted">No hay productos</td></tr>';
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
  }

  // Validation rules
  function validateForm() {
    clearFormErrors();
    let ok = true;
    const nombre = (prodNombre.value || '').trim();
    const estado = (prodEstado.value || '').trim();
    const precioRaw = prodPrecio.value;
    const precio = precioRaw === '' ? NaN : Number(precioRaw);
    const cantidadRaw = prodCantidad.value;
    const cantidad = cantidadRaw === '' ? 0 : Number(cantidadRaw);

    if(!nombre){
      errorNombre.classList.add('active'); ok = false;
    }

    // duplicate name check (case-insensitive), excluding currently editing id
    const dup = products.find(p => p.nombre.toLowerCase() === nombre.toLowerCase() && p.id !== editingId);
    if(dup){
      errorNombreDup.classList.add('active'); ok = false;
    }

    if(!estado){
      errorEstado.classList.add('active'); ok = false;
    }

    if(Number.isNaN(precio) || precio < 0){
      errorPrecio.classList.add('active'); ok = false;
    }

    return { ok, nombre, estado, precio, cantidad };
  }

  // Actions
  function handleSave(ev){
    ev.preventDefault();
    const res = validateForm();
    if(!res.ok) return;

    if(editingId == null){
      // create new; ensure unique name enforced above
      const newProd = {
        id: nextId(),
        nombre: res.nombre,
        cantidad: Number.isInteger(res.cantidad) ? res.cantidad : Math.floor(res.cantidad || 0),
        estado: res.estado,
        precio: Number(res.precio)
      };
      products.push(newProd);
      save();
      renderTable(searchInput.value);
      closeForm();
      return;
    }

    // update existing
    const idx = products.findIndex(p => p.id === editingId);
    if(idx === -1) { closeForm(); return; }
    products[idx].nombre = res.nombre;
    products[idx].cantidad = Number.isInteger(res.cantidad) ? res.cantidad : Math.floor(res.cantidad || 0);
    products[idx].estado = res.estado;
    products[idx].precio = Number(res.precio);
    save();
    renderTable(searchInput.value);
    closeForm();
  }

  function handleTableClick(e){
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    const id = Number(btn.getAttribute('data-id'));
    const prod = products.find(p => p.id === id);
    if(!prod) return;

    if(action === 'edit'){
      openForm(prod);
    } else if(action === 'delete'){
      const ok = confirm(`Eliminar "${prod.nombre}" (ID ${prod.id})? Esta acción no se puede deshacer.`);
      if(!ok) return;
      products = products.filter(p => p.id !== id);
      save();
      renderTable(searchInput.value);
    }
  }

  // Initialize with sample data if empty
  function seedIfEmpty(){
    if(products.length) return;
    products = [
      { id:1, nombre:'Producto 1', cantidad:2, estado:'Activo', precio:150.00 },
      { id:2, nombre:'Producto 2', cantidad:3, estado:'Activo', precio:300.00 },
      { id:3, nombre:'Producto 3', cantidad:1, estado:'Inactivo', precio:200.00 },
      { id:4, nombre:'Producto 4', cantidad:5, estado:'Activo', precio:100.00 },
      { id:5, nombre:'Producto 5', cantidad:4, estado:'Inactivo', precio:120.00 }
    ];
    save();
  }

  // Events
  openAddBtn.addEventListener('click', () => openForm(null));
  cancelFormBtn.addEventListener('click', () => closeForm());
  backBtn.addEventListener('click', () => window.history.back());

  productForm.addEventListener('submit', handleSave);
  productsTbody.addEventListener('click', handleTableClick);

  searchInput.addEventListener('input', (e) => renderTable(e.target.value));

  // Ensure cantidad default to 0 when left blank before saving
  prodCantidad.addEventListener('blur', () => {
    if(prodCantidad.value.trim() === '') prodCantidad.value = '';
  });

  // Init
  load();
  seedIfEmpty();
  renderTable();

})();
