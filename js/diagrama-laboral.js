// Diagrama Laboral - Clear Petroleum - Sepulveda Favio - v2 14x7
// 14x7 = 7 días DÍA + 7 días NOCHE + 7 días FRANCO = ciclo 21 días
// Inicio: Jueves 16 de Julio 2026 en DÍA

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEKDAYS_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const WEEKDAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];

// CONFIGURACIÓN DIAGRAMA
// El usuario dijo: 14x7 primero iniciando de dia, inicie el diagrama el dia jueves 16 de este mes.
// Asumimos mes actual = Julio 2026 (coincide con que 16 Julio 2026 es jueves)
const DIAGRAMA_CONFIG = {
  // Fecha inicio: Jueves 16 Julio 2026 - Día 1 de turno DÍA
  startDate: new Date(2026, 6, 16), // mes 6 = Julio (0-index)
  pattern: [
    { type: 'dia', label: 'DÍA', short: 'DÍA', icon: '☀️', days: 7, color: '#FFB800' },
    { type: 'noche', label: 'NOCHE', short: 'NOC', icon: '🌙', days: 7, color: '#3B82F6' },
    { type: 'franco', label: 'FRANCO', short: 'FRA', icon: '🏠', days: 7, color: '#22C55E' },
  ]
};

let viewDate = new Date();
let selectedDate = new Date();
const today = new Date();
const $ = (s) => document.querySelector(s);
const monthYearTitle = () => MONTHS_ES[viewDate.getMonth()] + ' ' + viewDate.getFullYear();

function sameDay(a,b){ return a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear(); }
function getMondayBasedDay(date){ let d=date.getDay(); return (d+6)%7; }
function formatLong(date){ const day=WEEKDAYS_ES[getMondayBasedDay(date)]; const m=MONTHS_ES[date.getMonth()]; return `${day} ${date.getDate()} de ${m} de ${date.getFullYear()}`; }
function formatShortDM(date){ return `${date.getDate()} ${MONTHS_ES[date.getMonth()].substring(0,3)}`; }
function getWeekNumber(d){ const date=new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dayNum=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-dayNum); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); return Math.ceil((((date-yearStart)/86400000)+1)/7); }
function getDayOfYear(d){ return Math.floor((d - new Date(d.getFullYear(),0,0))/1000/60/60/24); }

function diffDays(a,b){
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcB - utcA)/86400000);
}

function getTurnoForDate(date){
  const cycleLength = DIAGRAMA_CONFIG.pattern.reduce((sum,p)=>sum+p.days,0); // 21
  const diff = diffDays(DIAGRAMA_CONFIG.startDate, date); // días desde inicio
  // modulo positivo para fechas anteriores también
  const dayInCycle = ((diff % cycleLength) + cycleLength) % cycleLength;
  let acc = 0;
  for(let i=0;i<DIAGRAMA_CONFIG.pattern.length;i++){
    const seg = DIAGRAMA_CONFIG.pattern[i];
    if(dayInCycle < acc + seg.days){
      const dayInSeg = dayInCycle - acc; // 0-index dentro del segmento
      const daysLeftInSeg = seg.days - dayInSeg - 1; // días restantes en este turno (sin contar hoy)
      const daysLeftToFranco = (()=>{
        // calcular días hasta próximo franco
        if(seg.type==='franco') return 0;
        // sumar resto del segmento actual + segmentos siguientes hasta franco
        let remaining = seg.days - dayInSeg - 1;
        for(let j=i+1;j<DIAGRAMA_CONFIG.pattern.length;j++){
          if(DIAGRAMA_CONFIG.pattern[j].type==='franco') break;
          remaining += DIAGRAMA_CONFIG.pattern[j].days;
        }
        return remaining + 1; // +1 para llegar al primer día de franco
      })();
      const nextChangeDate = new Date(date);
      nextChangeDate.setDate(date.getDate() + daysLeftInSeg + 1);
      return {
        ...seg,
        dayInCycle,
        cycleLength,
        diff,
        dayInSeg, // 0-index
        dayNumberInSeg: dayInSeg + 1, // 1-index (día 1 de 7)
        daysLeftInSeg,
        daysLeftToFranco,
        nextChangeDate,
        isToday: sameDay(date, today),
        isStartOfCycle: dayInCycle===0,
      };
    }
    acc += seg.days;
  }
  return null;
}

function getNextEvents(fromDate){
  const todayTurno = getTurnoForDate(fromDate);
  // Buscar próximo franco y próxima entrada
  let nextFrancoDate = null;
  let nextEntradaDate = null;
  for(let offset=0; offset<60; offset++){
    const d = new Date(fromDate); d.setDate(d.getDate()+offset);
    const t = getTurnoForDate(d);
    if(offset>0){
      if(!nextFrancoDate && t.type==='franco' && todayTurno.type!=='franco'){
        nextFrancoDate = new Date(d);
      }
      if(!nextEntradaDate && t.type!=='franco' && todayTurno.type==='franco'){
        nextEntradaDate = new Date(d);
      }
    }
    if(nextFrancoDate && nextEntradaDate) break;
  }
  // Si hoy es franco, nextEntrada, si hoy es trabajo, nextFranco
  // También calcular fin de franco actual si está de franco
  let finFrancoDate = null;
  let inicioProximoCiclo = null;
  if(todayTurno.type==='franco'){
    // fin del franco actual = días restantes + hoy
    finFrancoDate = new Date(fromDate);
    finFrancoDate.setDate(finFrancoDate.getDate() + todayTurno.daysLeftInSeg + 1);
    inicioProximoCiclo = new Date(finFrancoDate);
  } else {
    // buscar fin de próximo franco después de trabajar
    if(nextFrancoDate){
      const francoTurno = getTurnoForDate(nextFrancoDate);
      // el franco dura 7 días
      finFrancoDate = new Date(nextFrancoDate);
      finFrancoDate.setDate(finFrancoDate.getDate() + francoTurno.days -1);
      inicioProximoCiclo = new Date(finFrancoDate);
      inicioProximoCiclo.setDate(inicioProximoCiclo.getDate()+1);
    }
  }
  return { nextFrancoDate, nextEntradaDate, finFrancoDate, inicioProximoCiclo };
}

function renderSelectors(){
  const monthSel=$('#selectMonth'); const yearSel=$('#selectYear');
  if(!monthSel||!yearSel) return;
  monthSel.innerHTML=MONTHS_ES.map((m,i)=>`<option value="${i}" ${i===viewDate.getMonth()?'selected':''}>${m}</option>`).join('');
  if(yearSel.options.length===0){
    const currentYear=today.getFullYear();
    for(let y=currentYear-5; y<=currentYear+5; y++){
      const opt=document.createElement('option'); opt.value=y; opt.textContent=y;
      if(y===viewDate.getFullYear()) opt.selected=true;
      yearSel.appendChild(opt);
    }
  } else { yearSel.value=viewDate.getFullYear(); }
}

function renderHeader(){
  $('#monthYearLabel').textContent=monthYearTitle();
  renderSelectors();
  const badge=$('#badgeHoy');
  if(badge){
    const showingTodayMonth=viewDate.getMonth()===today.getMonth() && viewDate.getFullYear()===today.getFullYear();
    badge.style.display=showingTodayMonth?'inline-block':'none';
  }
  // Update config bar if exists
  const cfgStart=$('#cfgStartDate');
  if(cfgStart){
    cfgStart.textContent = formatShortDM(DIAGRAMA_CONFIG.startDate) + ' ' + DIAGRAMA_CONFIG.startDate.getFullYear();
  }
}

function renderWeekdays(){
  const container=$('#weekdays'); if(!container) return;
  container.innerHTML=WEEKDAYS_SHORT.map(d=>`<div>${d}</div>`).join('');
}

function renderDays(){
  const grid=$('#daysGrid'); if(!grid) return; grid.innerHTML='';
  const year=viewDate.getFullYear(); const month=viewDate.getMonth();
  const firstDayOfMonth=new Date(year,month,1);
  const lastDayOfMonth=new Date(year,month+1,0);
  const daysInMonth=lastDayOfMonth.getDate();
  const startOffset=getMondayBasedDay(firstDayOfMonth);
  const totalCells=Math.ceil((startOffset+daysInMonth)/7)*7;
  const prevMonthLastDay=new Date(year,month,0).getDate();

  for(let i=0;i<totalCells;i++){
    let dayNumber, cellDate, isOtherMonth=false;
    if(i<startOffset){
      dayNumber=prevMonthLastDay-startOffset+1+i; cellDate=new Date(year,month-1,dayNumber); isOtherMonth=true;
    } else if(i>=startOffset+daysInMonth){
      dayNumber=i-(startOffset+daysInMonth)+1; cellDate=new Date(year,month+1,dayNumber); isOtherMonth=true;
    } else {
      dayNumber=i-startOffset+1; cellDate=new Date(year,month,dayNumber);
    }

    const turno = getTurnoForDate(cellDate);
    const isToday=sameDay(cellDate,today);
    const isSelected=sameDay(cellDate,selectedDate);
    const isWeekend=getMondayBasedDay(cellDate)>=5;

    const cell=document.createElement('div');
    cell.className='day-cell';
    cell.classList.add(turno.type);
    if(isOtherMonth) cell.classList.add('other-month');
    if(isToday) cell.classList.add('today');
    if(isSelected) cell.classList.add('selected');
    if(isWeekend) cell.classList.add('weekend');

    const progressPercent = ((turno.dayNumberInSeg)/turno.days)*100;

    cell.innerHTML=`
      <div class="day-top">
        <span class="day-number">${dayNumber}</span>
        <span class="day-type-badge ${turno.type}">${turno.short}</span>
      </div>
      <div class="day-bottom">
        <span class="turno-label ${turno.type}">${turno.icon} ${turno.type==='franco'?'FRANCO':turno.type.toUpperCase()} ${turno.dayNumberInSeg}/${turno.days}</span>
        <div class="day-progress ${turno.type}"><span style="width:${progressPercent}%"></span></div>
      </div>
    `;

    cell.title = `${formatLong(cellDate)} - ${turno.label} ${turno.dayNumberInSeg}/${turno.days} - Ciclo 14x7`;
    cell.addEventListener('click',()=>{ selectedDate=new Date(cellDate); renderAll(); });
    grid.appendChild(cell);
  }
}

function renderInfoPanel(){
  // Today
  const todayTurno = getTurnoForDate(today);
  const todayHero = document.querySelector('.today-hero');
  if(todayHero){
    todayHero.classList.remove('dia','noche','franco');
    todayHero.classList.add(todayTurno.type);
  }
  $('#todayNumber').textContent=today.getDate().toString().padStart(2,'0');
  $('#todayWeekday').textContent=WEEKDAYS_ES[getMondayBasedDay(today)].toUpperCase();
  $('#todayMonthYear').textContent=`${MONTHS_ES[today.getMonth()]} ${today.getFullYear()}`;
  $('#todayDayOfYear').textContent=getDayOfYear(today);
  $('#todayWeekNumber').textContent=getWeekNumber(today);
  $('#todayRemaining').textContent=365-getDayOfYear(today)+(today.getFullYear()%4===0?1:0);

  const todayTurnoPill = $('#todayTurnoPill');
  if(todayTurnoPill){
    todayTurnoPill.className = `turno-pill ${todayTurno.type}`;
    todayTurnoPill.innerHTML = `${todayTurno.icon} ${todayTurno.label} ${todayTurno.dayNumberInSeg}/${todayTurno.days}`;
  }
  const todayTurnoDetail = $('#todayTurnoDetail');
  if(todayTurnoDetail){
    if(todayTurno.type==='franco'){
      todayTurnoDetail.textContent = `Día ${todayTurno.dayNumberInSeg} de franco - Faltan ${todayTurno.daysLeftInSeg} días para volver`;
    } else {
      todayTurnoDetail.textContent = `Día ${todayTurno.dayNumberInSeg} de ${todayTurno.type} - Te quedan ${todayTurno.daysLeftInSeg+1} días en este turno`;
    }
  }

  const nextEvents = getNextEvents(today);
  const nextFrancoEl = $('#todayNextFranco');
  const nextEntradaEl = $('#todayNextEntrada');
  if(nextFrancoEl){
    if(todayTurno.type==='franco'){
      nextFrancoEl.innerHTML = `<label>Fin franco</label><strong>${formatLong(nextEvents.finFrancoDate)} - Entrás ${formatShortDM(nextEvents.finFrancoDate)}</strong>`;
    } else {
      nextFrancoEl.innerHTML = `<label>Próximo franco</label><strong>${nextEvents.nextFrancoDate ? formatLong(nextEvents.nextFrancoDate) + ' (en ' + todayTurno.daysLeftToFranco + ' días)' : 'Calculando...'}</strong>`;
    }
  }
  if(nextEntradaEl){
    if(todayTurno.type==='franco'){
      nextEntradaEl.innerHTML = `<label>Próxima entrada</label><strong>${formatLong(nextEvents.finFrancoDate)} - Turno DÍA</strong>`;
    } else {
      nextEntradaEl.innerHTML = `<label>Vuelta al trabajo</label><strong>${nextEvents.inicioProximoCiclo ? formatLong(nextEvents.inicioProximoCiclo) : '-'}</strong>`;
    }
  }

  // Selected
  const selTurno = getTurnoForDate(selectedDate);
  $('#selectedDateLabel').textContent=formatLong(selectedDate);
  $('#selectedWeekdayShort').textContent=WEEKDAYS_SHORT[getMondayBasedDay(selectedDate)];
  $('#selectedDayMonth').textContent=`${selectedDate.getDate()} ${MONTHS_ES[selectedDate.getMonth()].substring(0,3)}`;

  const selIsTodayText = sameDay(selectedDate,today) ? `HOY - Estás de ${selTurno.label}` : `${Math.round((selectedDate-today)/86400000)} días ${selectedDate>today?'en futuro':'atrás'} - ${selTurno.label}`;
  $('#selectedIsToday').textContent=selIsTodayText;

  const selTurnoPill = $('#selectedTurnoPill');
  if(selTurnoPill){
    selTurnoPill.className = `turno-pill ${selTurno.type}`;
    selTurnoPill.innerHTML = `${selTurno.icon} ${selTurno.label} ${selTurno.dayNumberInSeg}/${selTurno.days} - ${selTurno.type==='franco'?'DESCANSO':'TRABAJO'}`;
  }

  const selTurnoDetail = $('#selectedTurnoDetail');
  if(selTurnoDetail){
    const diff = diffDays(DIAGRAMA_CONFIG.startDate, selectedDate);
    selTurnoDetail.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div><strong>Ciclo:</strong> Día ${selTurno.dayInCycle+1} de ${selTurno.cycleLength} (14x7)</div>
        <div><strong>Turno:</strong> ${selTurno.label} día ${selTurno.dayNumberInSeg} de ${selTurno.days}</div>
        <div><strong>Desde inicio:</strong> Día ${diff>=0?diff:diff} (${DIAGRAMA_CONFIG.startDate.toLocaleDateString('es-AR')})</div>
        <div><strong>Próximo cambio:</strong> ${formatLong(selTurno.nextChangeDate)}</div>
        ${selTurno.type!=='franco' ? `<div><strong>Franco en:</strong> ${selTurno.daysLeftToFranco} días</div>` : ''}
      </div>
    `;
  }
}

function renderAll(){
  renderHeader();
  renderWeekdays();
  renderDays();
  renderInfoPanel();
}

function goPrevMonth(){ viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderAll(); }
function goNextMonth(){ viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderAll(); }
function goPrevYear(){ viewDate=new Date(viewDate.getFullYear()-1, viewDate.getMonth(), 1); renderAll(); }
function goNextYear(){ viewDate=new Date(viewDate.getFullYear()+1, viewDate.getMonth(), 1); renderAll(); }
function goToday(){ viewDate=new Date(today); selectedDate=new Date(today); renderAll(); }

function init(){
  $('#btnPrevMonth')?.addEventListener('click',goPrevMonth);
  $('#btnNextMonth')?.addEventListener('click',goNextMonth);
  $('#btnPrevYear')?.addEventListener('click',goPrevYear);
  $('#btnNextYear')?.addEventListener('click',goNextYear);
  $('#btnToday')?.addEventListener('click',goToday);
  $('#selectMonth')?.addEventListener('change',(e)=>{ viewDate=new Date(viewDate.getFullYear(), parseInt(e.target.value), 1); renderAll(); });
  $('#selectYear')?.addEventListener('change',(e)=>{ viewDate=new Date(parseInt(e.target.value), viewDate.getMonth(), 1); renderAll(); });
  document.addEventListener('keydown',(e)=>{ if(e.key==='ArrowLeft') goPrevMonth(); if(e.key==='ArrowRight') goNextMonth(); if(e.key==='ArrowUp') goPrevYear(); if(e.key==='ArrowDown') goNextYear(); if(e.key==='t'||e.key==='T') goToday(); });
  let startX=0; const grid=$('#daysGrid');
  if(grid){
    grid.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; },{passive:true});
    grid.addEventListener('touchend',e=>{ const diff=e.changedTouches[0].clientX-startX; if(Math.abs(diff)>60){ if(diff>0) goPrevMonth(); else goNextMonth(); } },{passive:true});
  }
  renderAll();
  setInterval(()=>{ const now=new Date(); if(!sameDay(now,today)){ location.reload(); } }, 60*1000);
}

document.addEventListener('DOMContentLoaded',init);
