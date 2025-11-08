// js/ventas.js
(() => {
  const STORAGE_KEY_PRODUCTS = 'fit_products_v1';

  // DOM
  const searchProducts = document.getElementById('searchProducts');
  const availableTbody = document.getElementById('availableTbody');
  const cartTbody = document.getElementById('cartTbody');
  const cartTotalEl = document.getElementById('cartTotal');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const backBtn = document.getElementById('backBtn');

  // Confirm button (directo a pago en efectivo)
  const confirmSaleBtn = document.getElementById('confirmSaleBtn');

  // Payment modal (efectivo)
  const paymentOverlay = document.getElementById('paymentOverlay');
  const payTotalEl = document.getElementById('payTotal');
  const receivedInput = document.getElementById('receivedInput');
  const payResultEl = document.getElementById('payResult');
  const payChangeEl = document.getElementById('payChange');
  const quickCalcBtns = Array.from(document.querySelectorAll('.quick-calc'));
  const calcExactBtn = document.getElementById('calcExactBtn');
  const completeSaleBtn = document.getElementById('completeSaleBtn');

  // Numeric pad
  const numPad = document.getElementById('numPad');
  const numKeys = numPad ? Array.from(numPad.querySelectorAll('.num-key')) : [];

  // State
  let products = []; // catálogo desde storage
  let cart = {}; // map productId -> cantidad

  // Helpers
  function loadProducts(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      products = raw ? JSON.parse(raw) : [];
    } catch (e) { products = []; }
  }
  function saveProducts(){ localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products)); }
  function findProduct(id){ return products.find(p => Number(p.id) === Number(id)); }
  function formatPrice(n){ return '$' + Number(n).toFixed(2); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  // Renderers
  function renderAvailable(filter = ''){
    const q = (filter || '').trim().toLowerCase();
    const rows = products
      .filter(p => {
        if(!q) return true;
        return String(p.id).includes(q) || p.nombre.toLowerCase().includes(q);
      })
      .map(p => {
        const disabled = (Number(p.cantidad) <= 0) ? 'disabled' : '';
        const stock = Number(p.cantidad);
        return `
          <tr data-id="${p.id}">
            <td>${p.id}</td>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${stock}</td>
            <td>${formatPrice(p.precio)}</td>
            <td>
              <button class="btn-inline btn-add" data-action="add" data-id="${p.id}" ${disabled}>+</button>
              <button class="btn-inline btn-delete" data-action="remove" data-id="${p.id}">-</button>
            </td>
          </tr>
        `;
      }).join('');
    availableTbody.innerHTML = rows || '<tr><td colspan="5" class="small-muted">No hay productos disponibles</td></tr>';
  }

  function renderCart(){
    const items = Object.keys(cart).map(id => {
      const p = findProduct(id);
      return { id: p.id, nombre: p.nombre, cantidad: cart[id], precio: Number(p.precio) };
    });
    if(items.length === 0){
      cartTbody.innerHTML = '<tr class="empty-row"><td colspan="5" class="small-muted">Carrito vacío</td></tr>';
      cartTotalEl.textContent = formatPrice(0);
      return;
    }
    const rows = items.map(it => {
      const subtotal = it.cantidad * it.precio;
      return `
        <tr data-id="${it.id}">
          <td>${escapeHtml(it.nombre)}</td>
          <td>${it.cantidad}</td>
          <td>${formatPrice(it.precio)}</td>
          <td>${formatPrice(subtotal)}</td>
          <td>
            <button class="btn-inline row-edit" data-action="cart-decrease" data-id="${it.id}">-</button>
            <button class="btn-inline btn-add" data-action="cart-increase" data-id="${it.id}">+</button>
          </td>
        </tr>
      `;
    }).join('');
    cartTbody.innerHTML = rows;
    const total = items.reduce((s, it) => s + it.cantidad * it.precio, 0);
    cartTotalEl.textContent = formatPrice(total);
  }

  // Cart ops
  function addToCart(id, qty = 1){
    const p = findProduct(id);
    if(!p) return;
    const available = Number(p.cantidad);
    const current = cart[id] || 0;
    if(available <= current) {
      alert('Stock insuficiente para "' + p.nombre + '".');
      return;
    }
    cart[id] = current + Number(qty);
    renderCart();
  }
  function removeFromCart(id, qty = 1){
    if(!cart[id]) return;
    cart[id] = cart[id] - Number(qty);
    if(cart[id] <= 0) delete cart[id];
    renderCart();
  }

  function computeTotal(){
    return Object.keys(cart).reduce((sum, id) => {
      const p = findProduct(id);
      if(!p) return sum;
      return sum + Number(p.precio) * Number(cart[id]);
    }, 0);
  }

  // Overlay open/close
  function openOverlay(o){ if(!o) return; o.classList.add('active'); o.setAttribute('aria-hidden','false'); }
  function closeOverlay(o){ if(!o) return; o.classList.remove('active'); o.setAttribute('aria-hidden','true'); }

  // Events: global click for table buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if(action === 'add') addToCart(id, 1);
    else if(action === 'remove') removeFromCart(id, 1);
    else if(action === 'cart-decrease') removeFromCart(id, 1);
    else if(action === 'cart-increase') addToCart(id, 1);
  });

  // Clear cart
  clearCartBtn && clearCartBtn.addEventListener('click', () => {
    if(!Object.keys(cart).length) return;
    if(confirm('Vaciar carrito?')) { cart = {}; renderCart(); }
  });

  // Back
  backBtn && backBtn.addEventListener('click', () => window.history.back());

  // Search
  searchProducts && searchProducts.addEventListener('input', (e) => renderAvailable(e.target.value));

  // Confirm => abre modal de pago en efectivo directamente
  confirmSaleBtn && confirmSaleBtn.addEventListener('click', () => {
    const total = computeTotal();
    if(total <= 0){ alert('El carrito está vacío.'); return; }
    payTotalEl.textContent = formatPrice(total);
    receivedInput.value = '';
    payResultEl.textContent = formatPrice(0);
    payChangeEl.textContent = '';
    openOverlay(paymentOverlay);
    // focus input for keyboard users
    setTimeout(()=> receivedInput.focus(), 120);
  });

  // Quick calc buttons
  quickCalcBtns.forEach(b => {
    b.addEventListener('click', () => {
      const add = Number(b.getAttribute('data-add') || 0);
      const cur = parseNumber(receivedInput.value);
      receivedInput.value = formatNumber(cur + add);
      updatePaymentPreview();
    });
  });

  // Usar exacto
  calcExactBtn && calcExactBtn.addEventListener('click', () => {
    const total = computeTotal();
    receivedInput.value = formatNumber(total);
    updatePaymentPreview();
  });

  // Numeric pad handling
  numKeys.forEach(key => {
    key.addEventListener('click', () => {
      const v = key.textContent.trim();
      if(v === 'C'){ // clear last / or clear all if long press
        // simple clear: remove last char
        receivedInput.value = receivedInput.value.slice(0, -1);
        updatePaymentPreview();
        return;
      }
      // append dot or digit; ensure only one dot allowed and max two decimals
      if(v === '.'){
        if(receivedInput.value.includes('.')) return;
        receivedInput.value = receivedInput.value + '.';
        updatePaymentPreview();
        return;
      }
      // digit
      // prevent leading zeros like "00" unless after decimal
      const cur = receivedInput.value || '';
      if(cur === '0') receivedInput.value = v;
      else receivedInput.value = cur + v;
      updatePaymentPreview();
    });
  });

  // allow typing but sanitize input on change
  receivedInput && receivedInput.addEventListener('input', () => {
    // allow only digits and dot, and at most one dot, and max 2 decimals
    const sanitized = sanitizeNumericString(receivedInput.value);
    if(sanitized !== receivedInput.value) receivedInput.value = sanitized;
    updatePaymentPreview();
  });

  function sanitizeNumericString(s){
    s = String(s).replace(/[^0-9.]/g,'');
    const parts = s.split('.');
    if(parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
    if(s.includes('.')){
      const [intPart, decPart] = s.split('.');
      s = intPart + '.' + decPart.slice(0,2);
    }
    // remove leading zeros (but keep "0" or "0.xx")
    if(/^0\d/.test(s) && !s.startsWith('0.')) s = String(Number(s));
    return s;
  }

  function parseNumber(s){
    const n = Number(String(s).replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  function formatNumber(n){
    return Number(n).toFixed(Math.max(0, Math.min(2, (String(n).split('.')[1] || '').length))) ;
  }

  // Finalizar venta: valida recibido >= total, descuenta stock, limpia carrito
  completeSaleBtn && completeSaleBtn.addEventListener('click', () => {
    const total = computeTotal();
    const received = parseNumber(receivedInput.value);
    if(Number.isNaN(received) || received < total){
      alert('La cantidad recibida no cubre el total.');
      return;
    }
    // Deduct stock
    Object.keys(cart).forEach(id => {
      const p = findProduct(id);
      if(p){
        p.cantidad = Number(p.cantidad) - Number(cart[id]);
        if(p.cantidad < 0) p.cantidad = 0;
      }
    });
    saveProducts();
    cart = {};
    renderAvailable(searchProducts.value);
    renderCart();
    closeOverlay(paymentOverlay);
    alert('Venta completada. Cambio: ' + formatPrice(received - total));
  });

  // Modal close handlers
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ov = e.target.closest('.overlay');
      closeOverlay(ov);
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ov = e.target.closest('.overlay');
      closeOverlay(ov);
    });
  });

  // Update payment preview
  function updatePaymentPreview(){
    const total = computeTotal();
    payTotalEl.textContent = formatPrice(total);
    const received = parseNumber(receivedInput.value);
    payResultEl.textContent = formatPrice(received);
    if(received >= total){
      const change = received - total;
      payChangeEl.textContent = 'Cambio: ' + formatPrice(change);
      payChangeEl.style.color = '#1f6e28';
    } else {
      const need = total - received;
      payChangeEl.textContent = 'Falta: ' + formatPrice(need);
      payChangeEl.style.color = 'var(--danger)';
    }
  }

  // Seed fallback
  function seedIfEmpty(){
    if(products.length) return;
    products = [
      { id:1, nombre:'Producto 1', cantidad:2, estado:'Activo', precio:150.00 },
      { id:2, nombre:'Producto 2', cantidad:3, estado:'Activo', precio:300.00 },
      { id:3, nombre:'Producto 3', cantidad:1, estado:'Inactivo', precio:200.00 },
      { id:4, nombre:'Producto 4', cantidad:5, estado:'Activo', precio:100.00 },
      { id:5, nombre:'Producto 5', cantidad:4, estado:'Inactivo', precio:120.00 }
    ];
    saveProducts();
  }

  // Init
  function init(){
    loadProducts();
    seedIfEmpty();
    renderAvailable();
    renderCart();
  }
  init();

})();
