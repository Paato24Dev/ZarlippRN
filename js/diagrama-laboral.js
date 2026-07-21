// Diagrama Laboral - Clear Petroleum - Sepulveda Favio
// Calendario base con navegación meses/años y día actual

const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const WEEKDAYS_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const WEEKDAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];

let viewDate = new Date(); // mes visible
let selectedDate = new Date(); // fecha seleccionada
const today = new Date();

const $ = (s) => document.querySelector(s);
const monthYearTitle = () => MONTHS_ES[viewDate.getMonth()] + ' ' + viewDate.getFullYear();

function sameDay(a,b) {
  return a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
}

function getMondayBasedDay(date) {
  // 0 = Lunes ... 6 = Domingo
  let d = date.getDay(); // 0=Dom, 1=Lun
  return (d + 6) % 7;
}

function formatLong(date) {
  const day = WEEKDAYS_ES[getMondayBasedDay(date)];
  const m = MONTHS_ES[date.getMonth()];
  return `${day} ${date.getDate()} de ${m} de ${date.getFullYear()}`;
}

function getWeekNumber(d) {
  // ISO week
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil(( ( (date - yearStart) / 86400000) + 1)/7);
}

function getDayOfYear(d) {
  return Math.floor((d - new Date(d.getFullYear(),0,0)) / 1000 / 60 / 60 / 24);
}

function renderSelectors() {
  const monthSel = $('#selectMonth');
  const yearSel = $('#selectYear');
  if (!monthSel || !yearSel) return;

  monthSel.innerHTML = MONTHS_ES.map((m,i)=>`<option value="${i}" ${i===viewDate.getMonth()?'selected':''}>${m}</option>`).join('');
  if (yearSel.options.length===0) {
    const currentYear = today.getFullYear();
    for(let y=currentYear-5; y<=currentYear+5; y++) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      if (y===viewDate.getFullYear()) opt.selected = true;
      yearSel.appendChild(opt);
    }
  } else {
    yearSel.value = viewDate.getFullYear();
  }
}

function renderHeader() {
  $('#monthYearLabel').textContent = monthYearTitle();
  renderSelectors();
  // Update "hoy" badge visibility
  const badge = $('#badgeHoy');
  if (badge) {
    const showingTodayMonth = viewDate.getMonth()===today.getMonth() && viewDate.getFullYear()===today.getFullYear();
    badge.style.display = showingTodayMonth ? 'inline-block' : 'none';
  }
}

function renderWeekdays() {
  const container = $('#weekdays');
  if (!container) return;
  container.innerHTML = WEEKDAYS_SHORT.map(d=>`<div>${d}</div>`).join('');
}

function renderDays() {
  const grid = $('#daysGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month+1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const startOffset = getMondayBasedDay(firstDayOfMonth); // cuantos días antes del lunes de la primera semana
  const totalCells = Math.ceil((startOffset + daysInMonth) /7)*7; // redondear a semanas completas (35 o 42)

  // Dias del mes anterior para rellenar
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for(let i=0;i<totalCells;i++) {
    let dayNumber, cellDate, isOtherMonth=false;

    if (i < startOffset) {
      // mes anterior
      dayNumber = prevMonthLastDay - startOffset + 1 + i;
      cellDate = new Date(year, month-1, dayNumber);
      isOtherMonth = true;
    } else if (i >= startOffset + daysInMonth) {
      // mes siguiente
      dayNumber = i - (startOffset + daysInMonth) + 1;
      cellDate = new Date(year, month+1, dayNumber);
      isOtherMonth = true;
    } else {
      dayNumber = i - startOffset + 1;
      cellDate = new Date(year, month, dayNumber);
    }

    const isToday = sameDay(cellDate, today);
    const isSelected = sameDay(cellDate, selectedDate);
    const isWeekend = getMondayBasedDay(cellDate) >=5; // sab dom

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');
    if (isSelected) cell.classList.add('selected');
    if (isWeekend) cell.classList.add('weekend');

    cell.innerHTML = `
      <div class="day-top">
        <span class="day-number">${dayNumber}</span>
        ${isToday ? '<span class="day-indicator" title="Hoy"></span>' : ''}
      </div>
      <div class="day-bottom">
        ${isWeekend ? '' : '<span class="mini-dot"></span>'}
      </div>
    `;

    cell.addEventListener('click', () => {
      selectedDate = new Date(cellDate);
      renderAll();
    });

    grid.appendChild(cell);
  }
}

function renderInfoPanel() {
  // Today hero
  $('#todayNumber').textContent = today.getDate().toString().padStart(2,'0');
  $('#todayWeekday').textContent = WEEKDAYS_ES[getMondayBasedDay(today)].toUpperCase();
  $('#todayMonthYear').textContent = `${MONTHS_ES[today.getMonth()]} ${today.getFullYear()}`;
  $('#todayDayOfYear').textContent = getDayOfYear(today);
  $('#todayWeekNumber').textContent = getWeekNumber(today);
  $('#todayRemaining').textContent = 365 - getDayOfYear(today) + ( (today.getFullYear()%4===0)?1:0 );

  // Selected
  $('#selectedDateLabel').textContent = formatLong(selectedDate);
  $('#selectedWeekdayShort').textContent = WEEKDAYS_SHORT[getMondayBasedDay(selectedDate)];
  $('#selectedDayMonth').textContent = `${selectedDate.getDate()} ${MONTHS_ES[selectedDate.getMonth()].substring(0,3)}`;
  $('#selectedIsToday').textContent = sameDay(selectedDate, today) ? 'Es hoy' : sameDay(selectedDate, new Date(today.getFullYear(), today.getMonth(), today.getDate()+1)) ? 'Mañana' : `${Math.round((selectedDate-today)/86400000)} días ${selectedDate>today?'futuro':'atrás'}`;
}

function renderAll() {
  renderHeader();
  renderWeekdays();
  renderDays();
  renderInfoPanel();
}

function goPrevMonth() { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderAll(); }
function goNextMonth() { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderAll(); }
function goPrevYear() { viewDate = new Date(viewDate.getFullYear()-1, viewDate.getMonth(), 1); renderAll(); }
function goNextYear() { viewDate = new Date(viewDate.getFullYear()+1, viewDate.getMonth(), 1); renderAll(); }
function goToday() { viewDate = new Date(today); selectedDate = new Date(today); renderAll(); }

function init() {
  // nav buttons
  $('#btnPrevMonth')?.addEventListener('click', goPrevMonth);
  $('#btnNextMonth')?.addEventListener('click', goNextMonth);
  $('#btnPrevYear')?.addEventListener('click', goPrevYear);
  $('#btnNextYear')?.addEventListener('click', goNextYear);
  $('#btnToday')?.addEventListener('click', goToday);

  $('#selectMonth')?.addEventListener('change', (e)=>{
    viewDate = new Date(viewDate.getFullYear(), parseInt(e.target.value), 1);
    renderAll();
  });
  $('#selectYear')?.addEventListener('change', (e)=>{
    viewDate = new Date(parseInt(e.target.value), viewDate.getMonth(), 1);
    renderAll();
  });

  // Keyboard nav
  document.addEventListener('keydown', (e)=>{
    if (e.key==='ArrowLeft') goPrevMonth();
    if (e.key==='ArrowRight') goNextMonth();
    if (e.key==='ArrowUp') goPrevYear();
    if (e.key==='ArrowDown') goNextYear();
    if (e.key==='t' || e.key==='T') goToday();
  });

  // Swipe support mobile
  let startX=0;
  const grid = $('#daysGrid');
  if (grid) {
    grid.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX; }, {passive:true});
    grid.addEventListener('touchend', e=>{
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff)>60) {
        if (diff>0) goPrevMonth(); else goNextMonth();
      }
    }, {passive:true});
  }

  renderAll();

  // live clock for today hero if stays open same day -> refresh at midnight?
  setInterval(()=>{
    const now = new Date();
    if (!sameDay(now, today)) {
      // actualiza referencia today si cruza medianoche
      location.reload();
    }
  }, 60*1000);
}

document.addEventListener('DOMContentLoaded', init);
