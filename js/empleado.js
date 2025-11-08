// js/empleado.js
(() => {
  const STORAGE_KEY_EMPLOYEES = 'fit_employees_v1';

  // DOM
  const empAvatar = document.getElementById('empAvatar');
  const empNombreEl = document.getElementById('empNombre');
  const empClockEl = document.getElementById('empClock');
  const logoutBtn = document.getElementById('logoutBtn');

  let employees = [];
  let currentEmployeeId = null;
  let clockTimer = null;

  // Storage helpers
  function loadEmployees(){
    try { employees = JSON.parse(localStorage.getItem(STORAGE_KEY_EMPLOYEES)) || []; }
    catch(e){ employees = []; }
  }

  function getEmployeeById(id){ return employees.find(e => String(e.id) === String(id)); }

  // Identify current employee: prefer sessionStorage.current_employee_id, else first employee
  function initCurrentEmployee(){
    const sid = sessionStorage.getItem('current_employee_id');
    if(sid && getEmployeeById(sid)){ currentEmployeeId = String(sid); return; }
    if(employees.length){ currentEmployeeId = String(employees[0].id); sessionStorage.setItem('current_employee_id', currentEmployeeId); }
  }

  // Render minimal profile (photo + name)
  function renderProfile(){
    const emp = getEmployeeById(currentEmployeeId);
    if(!emp){
      empNombreEl.textContent = 'Empleado';
      if(empAvatar) empAvatar.src = 'imagen/avatar-placeholder.png';
      return;
    }
    if(empNombreEl) empNombreEl.textContent = emp.nombre || 'Empleado';
    if(empAvatar && emp.foto) empAvatar.src = emp.foto;
  }

  // Clock helpers
  function pad(n){ return String(n).padStart(2,'0'); }
  function formatTime(d){
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function updateClock(){
    if(!empClockEl) return;
    const now = new Date();
    empClockEl.textContent = formatTime(now);
  }

  function startClock(){
    if(!empClockEl) return;
    stopClock();
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  function stopClock(){
    if(clockTimer){ clearInterval(clockTimer); clockTimer = null; }
  }

  // Logout
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('current_employee_id');
      window.location.href = 'index.html';
    });
  }

  // Seed sample employees if none (admin should populate in production)
  function seedEmployeesIfEmpty(){
    if(employees.length) return;
    employees = [
      { id: 101, nombre: 'María Gómez', foto: 'imagen/avatar-maria.jpg' },
      { id: 102, nombre: 'Luis Pérez', foto: 'imagen/avatar-luis.jpg' }
    ];
    try { localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees)); }
    catch(e){}
  }

  // Init
  function init(){
    loadEmployees();
    seedEmployeesIfEmpty();
    initCurrentEmployee();
    renderProfile();
    startClock();
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => stopClock());

  init();
})();
