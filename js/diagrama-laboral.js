// Diagrama Laboral v3 - Clear Petroleum - Sepulveda Favio - 14x7 + Feriados AR
// 7 DIA + 7 NOCHE + 7 FRANCO - Inicio Jue 16 Jul 2026

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const WEEKDAYS_ES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const WEEKDAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];

// FERIADOS ARGENTINA 2024-2027 (Nacionales inamovibles + trasladables principales)
// Fuente: calendario oficial. Incluye puentes turísticos comunes.
const FERIADOS_AR = {
  // 2024
  '2024-01-01':'Año Nuevo',
  '2024-02-12':'Carnaval','2024-02-13':'Carnaval',
  '2024-03-24':'Memoria Verdad y Justicia','2024-03-28':'Jueves Santo','2024-03-29':'Viernes Santo',
  '2024-04-02':'Día del Veterano y Malvinas','2024-05-01':'Día del Trabajador',
  '2024-05-25':'Revolución de Mayo','2024-06-17':'Paso a Güemes','2024-06-20':'Paso a Belgrano',
  '2024-07-09':'Día de la Independencia','2024-08-17':'Paso a San Martín','2024-10-12':'Diversidad Cultural',
  '2024-11-20':'Día de la Soberanía Nacional','2024-12-08':'Inmaculada Concepción','2024-12-25':'Navidad',
  // 2025
  '2025-01-01':'Año Nuevo',
  '2025-03-03':'Carnaval','2025-03-04':'Carnaval',
  '2025-03-24':'Memoria Verdad y Justicia','2025-04-02':'Día del Veterano y Malvinas',
  '2025-04-17':'Jueves Santo','2025-04-18':'Viernes Santo',
  '2025-05-01':'Día del Trabajador','2025-05-02':'Feriado puente',
  '2025-05-25':'Revolución de Mayo','2025-06-16':'Paso a Güemes Trasladado','2025-06-20':'Paso a Belgrano',
  '2025-07-09':'Día de la Independencia','2025-08-15':'Feriado puente','2025-08-17':'Paso a San Martín',
  '2025-10-12':'Diversidad Cultural','2025-11-21':'Feriado puente','2025-11-24':'Soberanía Nacional Trasladado',
  '2025-12-08':'Inmaculada Concepción','2025-12-25':'Navidad',
  // 2026
  '2026-01-01':'Año Nuevo',
  '2026-02-16':'Carnaval','2026-02-17':'Carnaval',
  '2026-03-24':'Memoria Verdad y Justicia','2026-04-02':'Día del Veterano y Malvinas + Jueves Santo','2026-04-03':'Viernes Santo',
  '2026-05-01':'Día del Trabajador','2026-05-25':'Revolución de Mayo',
  '2026-06-15':'Paso a Güemes Trasladado','2026-06-20':'Paso a Belgrano',
  '2026-07-09':'Día de la Independencia','2026-07-10':'Feriado puente',
  '2026-08-17':'Paso a San Martín','2026-10-12':'Diversidad Cultural',
  '2026-11-20':'Soberanía Nacional','2026-11-23':'Feriado puente',
  '2026-12-07':'Feriado puente','2026-12-08':'Inmaculada Concepción','2026-12-25':'Navidad',
  // 2027
  '2027-01-01':'Año Nuevo',
  '2027-02-08':'Carnaval','2027-02-09':'Carnaval',
  '2027-03-24':'Memoria Verdad y Justicia','2027-03-25':'Jueves Santo','2027-03-26':'Viernes Santo',
  '2027-04-02':'Día del Veterano y Malvinas','2027-05-01':'Día del Trabajador','2027-05-25':'Revolución de Mayo',
  '2027-06-20':'Paso a Belgrano','2027-06-21':'Paso a Güemes Trasladado','2027-07-09':'Independencia',
  '2027-08-16':'Paso a San Martín Trasladado','2027-10-11':'Diversidad Cultural Trasladado','2027-11-20':'Soberanía',
  '2027-12-08':'Inmaculada Concepción','2027-12-25':'Navidad',
};

const DIAGRAMA_CONFIG = {
  startDate: new Date(2026, 6, 16), // 16 Julio 2026 Jueves - Día 1 DÍA
  pattern: [
    { type: 'dia', label: 'DÍA', short: 'DÍA', full: 'DIA', icon: '☀️', days: 7, color: '#FFB800' },
    { type: 'noche', label: 'NOCHE', short: 'NOCHE', full: 'NOCHE', icon: '🌙', days: 7, color: '#3B82F6' },
    { type: 'franco', label: 'FRANCO', short: 'FRANCO', full: 'FRANCO', icon: '🏠', days: 7, color: '#22C55E' },
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
function toISODate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function getWeekNumber(d){ const date=new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dayNum=date.getUTCDay()||7; date.setUTCDate(date.getUTCDate()+4-dayNum); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); return Math.ceil((((date-yearStart)/86400000)+1)/7); }
function getDayOfYear(d){ return Math.floor((d - new Date(d.getFullYear(),0,0))/1000/60/60/24); }
function diffDays(a,b){ const utcA=Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()); const utcB=Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()); return Math.floor((utcB-utcA)/86400000); }
function getFeriado(date){ return FERIADOS_AR[toISODate(date)] || null; }

function getTurnoForDate(date){
  const cycleLength = DIAGRAMA_CONFIG.pattern.reduce((sum,p)=>sum+p.days,0);
  const diff = diffDays(DIAGRAMA_CONFIG.startDate, date);
  const dayInCycle = ((diff % cycleLength) + cycleLength) % cycleLength;
  let acc = 0;
  for(let i=0;i<DIAGRAMA_CONFIG.pattern.length;i++){
    const seg = DIAGRAMA_CONFIG.pattern[i];
    if(dayInCycle < acc + seg.days){
      const dayInSeg = dayInCycle - acc;
      const daysLeftInSeg = seg.days - dayInSeg - 1;
      const daysLeftToFranco = (()=>{ if(seg.type==='franco') return 0; let rem=seg.days-dayInSeg-1; for(let j=i+1;j<DIAGRAMA_CONFIG.pattern.length;j++){ if(DIAGRAMA_CONFIG.pattern[j].type==='franco') break; rem+=DIAGRAMA_CONFIG.pattern[j].days; } return rem+1; })();
      const nextChangeDate = new Date(date); nextChangeDate.setDate(date.getDate()+daysLeftInSeg+1);
      const feriado = getFeriado(date);
      return { ...seg, dayInCycle, cycleLength, diff, dayInSeg, dayNumberInSeg: dayInSeg+1, daysLeftInSeg, daysLeftToFranco, nextChangeDate, feriado, isToday: sameDay(date,today), isStartOfCycle: dayInCycle===0 };
    }
    acc += seg.days;
  }
  return null;
}

function getNextEvents(fromDate){
  const todayTurno = getTurnoForDate(fromDate);
  let nextFrancoDate=null, nextEntradaDate=null;
  for(let offset=0; offset<90; offset++){
    const d=new Date(fromDate); d.setDate(d.getDate()+offset);
    const t=getTurnoForDate(d);
    if(offset>0){
      if(!nextFrancoDate && t.type==='franco' && todayTurno.type!=='franco') nextFrancoDate=new Date(d);
      if(!nextEntradaDate && t.type!=='franco' && todayTurno.type==='franco') nextEntradaDate=new Date(d);
    }
    if(nextFrancoDate && nextEntradaDate) break;
  }
  let finFrancoDate=null, inicioProximoCiclo=null;
  if(todayTurno.type==='franco'){
    finFrancoDate=new Date(fromDate); finFrancoDate.setDate(finFrancoDate.getDate()+todayTurno.daysLeftInSeg+1);
    inicioProximoCiclo=new Date(finFrancoDate);
  } else {
    if(nextFrancoDate){
      const francoTurno=getTurnoForDate(nextFrancoDate);
      finFrancoDate=new Date(nextFrancoDate); finFrancoDate.setDate(finFrancoDate.getDate()+francoTurno.days-1);
      inicioProximoCiclo=new Date(finFrancoDate); inicioProximoCiclo.setDate(inicioProximoCiclo.getDate()+1);
    }
  }
  return { nextFrancoDate, nextEntradaDate, finFrancoDate, inicioProximoCiclo };
}

function renderSelectors(){
  const monthSel=$('#selectMonth'); const yearSel=$('#selectYear'); if(!monthSel||!yearSel) return;
  monthSel.innerHTML=MONTHS_ES.map((m,i)=>`<option value="${i}" ${i===viewDate.getMonth()?'selected':''}>${m}</option>`).join('');
  if(yearSel.options.length===0){
    const currentYear=today.getFullYear();
    for(let y=currentYear-5; y<=currentYear+5; y++){ const opt=document.createElement('option'); opt.value=y; opt.textContent=y; if(y===viewDate.getFullYear()) opt.selected=true; yearSel.appendChild(opt); }
  } else yearSel.value=viewDate.getFullYear();
}

function renderHeader(){
  $('#monthYearLabel').textContent=monthYearTitle();
  renderSelectors();
  const badge=$('#badgeHoy'); if(badge){ badge.style.display=(viewDate.getMonth()===today.getMonth() && viewDate.getFullYear()===today.getFullYear())?'inline-block':'none'; }
  const cfgStart=$('#cfgStartDate'); if(cfgStart) cfgStart.textContent=formatShortDM(DIAGRAMA_CONFIG.startDate)+' '+DIAGRAMA_CONFIG.startDate.getFullYear();
  // contar feriados mes visible
  const cf=$('#cfgFeriadosMes');
  if(cf){
    let count=0; const y=viewDate.getFullYear(); const m=viewDate.getMonth();
    const daysInMonth=new Date(y,m+1,0).getDate();
    for(let d=1; d<=daysInMonth; d++){ const dt=new Date(y,m,d); if(getFeriado(dt)) count++; }
    cf.textContent = count>0 ? `${count} feriado${count>1?'s':''} este mes` : 'sin feriados este mes';
    cf.style.color = count>0 ? '#F87171' : '#9A9A9A';
  }
}

function renderWeekdays(){ const c=$('#weekdays'); if(!c) return; c.innerHTML=WEEKDAYS_SHORT.map(d=>`<div>${d}</div>`).join(''); }

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
    if(i<startOffset){ dayNumber=prevMonthLastDay-startOffset+1+i; cellDate=new Date(year,month-1,dayNumber); isOtherMonth=true; }
    else if(i>=startOffset+daysInMonth){ dayNumber=i-(startOffset+daysInMonth)+1; cellDate=new Date(year,month+1,dayNumber); isOtherMonth=true; }
    else { dayNumber=i-startOffset+1; cellDate=new Date(year,month,dayNumber); }

    const turno=getTurnoForDate(cellDate);
    const isToday=sameDay(cellDate,today);
    const isSelected=sameDay(cellDate,selectedDate);
    const isWeekend=getMondayBasedDay(cellDate)>=5;
    const feriadoName=getFeriado(cellDate);

    const cell=document.createElement('div');
    cell.className='day-cell';
    cell.classList.add(turno.type);
    if(isOtherMonth) cell.classList.add('other-month');
    if(isToday) cell.classList.add('today');
    if(isSelected) cell.classList.add('selected');
    if(isWeekend) cell.classList.add('weekend');
    if(feriadoName) cell.classList.add('feriado');

    const progressPercent=((turno.dayNumberInSeg)/turno.days)*100;

    cell.innerHTML=`
      <div class="day-top">
        <span class="day-number">${dayNumber}</span>
        ${feriadoName ? `<span class="feriado-flag" title="${feriadoName}">!</span>` : `<span class="day-indicator" style="background:${turno.color};box-shadow:0 0 6px ${turno.color}"></span>`}
      </div>
      <div class="day-center-icon">${turno.icon}</div>
      <div class="day-bottom">
        <span class="turno-label ${turno.type}">${turno.full} ${turno.dayNumberInSeg}/${turno.days}</span>
        ${feriadoName ? `<span class="feriado-name" title="${feriadoName}">${feriadoName.substring(0,18)}</span>` : ''}
        <div class="day-progress ${turno.type}"><span style="width:${progressPercent}%"></span></div>
      </div>
    `;

    let tooltip=`${formatLong(cellDate)} - ${turno.label} ${turno.dayNumberInSeg}/${turno.days}`;
    if(feriadoName) tooltip+=` - FERIADO: ${feriadoName}`;
    cell.title=tooltip;
    cell.addEventListener('click',()=>{ selectedDate=new Date(cellDate); renderAll(); });
    grid.appendChild(cell);
  }
}

function renderInfoPanel(){
  const todayTurno=getTurnoForDate(today);
  const todayHero=document.querySelector('.today-hero');
  if(todayHero){ todayHero.classList.remove('dia','noche','franco'); todayHero.classList.add(todayTurno.type); }

  $('#todayNumber').textContent=today.getDate().toString().padStart(2,'0');
  $('#todayWeekday').textContent=WEEKDAYS_ES[getMondayBasedDay(today)].toUpperCase();
  $('#todayMonthYear').textContent=`${MONTHS_ES[today.getMonth()]} ${today.getFullYear()}`;

  const todayTurnoPill=$('#todayTurnoPill');
  if(todayTurnoPill){ todayTurnoPill.className=`turno-pill ${todayTurno.type}`; todayTurnoPill.innerHTML=`${todayTurno.icon} ${todayTurno.full} ${todayTurno.dayNumberInSeg}/${todayTurno.days}`; }

  const todayTurnoDetail=$('#todayTurnoDetail');
  if(todayTurnoDetail){
    const feriadoHoy=getFeriado(today);
    let txt="";
    if(todayTurno.type==='franco') txt=`Día ${todayTurno.dayNumberInSeg} de FRANCO - Faltan ${todayTurno.daysLeftInSeg} días para volver`;
    else txt=`Día ${todayTurno.dayNumberInSeg} de ${todayTurno.type.toUpperCase()} - Te quedan ${todayTurno.daysLeftInSeg+1} días en este turno`;
    if(feriadoHoy) txt+=` | 🎉 FERIADO: ${feriadoHoy}`;
    todayTurnoDetail.textContent=txt;
  }

  $('#todayDayOfYear').textContent=getDayOfYear(today);
  $('#todayWeekNumber').textContent=getWeekNumber(today);
  $('#todayRemaining').textContent=365-getDayOfYear(today)+(today.getFullYear()%4===0?1:0);

  const nextEvents=getNextEvents(today);
  const nextFrancoEl=$('#todayNextFranco'); const nextEntradaEl=$('#todayNextEntrada');
  if(nextFrancoEl){
    if(todayTurno.type==='franco') nextFrancoEl.innerHTML=`<label>Fin franco - Volvés a trabajar</label><strong>${formatLong(nextEvents.finFrancoDate)} - Entrás ${formatShortDM(nextEvents.finFrancoDate)} - DIA</strong>`;
    else nextFrancoEl.innerHTML=`<label>Próximo franco</label><strong>${nextEvents.nextFrancoDate ? formatLong(nextEvents.nextFrancoDate)+' (en '+todayTurno.daysLeftToFranco+' días)' : '...'}</strong>`;
  }
  if(nextEntradaEl){
    if(todayTurno.type==='franco') nextEntradaEl.innerHTML=`<label>Próxima entrada</label><strong>${formatLong(nextEvents.finFrancoDate)} - Turno DÍA</strong>`;
    else nextEntradaEl.innerHTML=`<label>Vuelta al trabajo luego del franco</label><strong>${nextEvents.inicioProximoCiclo ? formatLong(nextEvents.inicioProximoCiclo) : '-'}</strong>`;
  }

  // Selected
  const selTurno=getTurnoForDate(selectedDate);
  const selFeriado=getFeriado(selectedDate);
  $('#selectedDateLabel').textContent=formatLong(selectedDate);
  $('#selectedWeekdayShort').textContent=WEEKDAYS_SHORT[getMondayBasedDay(selectedDate)];
  $('#selectedDayMonth').textContent=`${selectedDate.getDate()} ${MONTHS_ES[selectedDate.getMonth()].substring(0,3)}`;
  $('#selectedIsToday').textContent=sameDay(selectedDate,today) ? `HOY - Estás de ${selTurno.full}${selFeriado?' - FERIADO':''}` : `${Math.round((selectedDate-today)/86400000)} días ${selectedDate>today?'futuro':'atrás'} - ${selTurno.full}${selFeriado?' - FERIADO '+selFeriado:''}`;

  const selTurnoPill=$('#selectedTurnoPill');
  if(selTurnoPill){ selTurnoPill.className=`turno-pill ${selTurno.type}`; selTurnoPill.innerHTML=`${selTurno.icon} ${selTurno.full} ${selTurno.dayNumberInSeg}/${selTurno.days} - ${selTurno.type==='franco'?'DESCANSO':'TRABAJO'}`; }

  const selTurnoDetail=$('#selectedTurnoDetail');
  if(selTurnoDetail){
    const diff=diffDays(DIAGRAMA_CONFIG.startDate, selectedDate);
    selTurnoDetail.innerHTML=`
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div><strong style="color:${selTurno.color}">⬤ ${selTurno.full}</strong> día ${selTurno.dayNumberInSeg} de ${selTurno.days} ${selTurno.icon}</div>
        <div><strong>Ciclo:</strong> Día ${selTurno.dayInCycle+1} de ${selTurno.cycleLength} (14x7)</div>
        <div><strong>Desde inicio 16/07/26:</strong> Día ${diff}</div>
        <div><strong>Próximo cambio:</strong> ${formatLong(selTurno.nextChangeDate)} → ${(() => { const nt=getTurnoForDate(selTurno.nextChangeDate); return nt ? nt.full : ''; })()}</div>
        ${selTurno.type!=='franco' ? `<div><strong>Franco en:</strong> ${selTurno.daysLeftToFranco} días (${formatLong(new Date(selectedDate.getTime()+selTurno.daysLeftToFranco*86400000))})</div>` : `<div><strong>Volvés:</strong> ${formatLong(selTurno.nextChangeDate)}</div>`}
        ${selFeriado ? `<div style="background:#EF4444;color:white;padding:4px 8px;border-radius:6px;margin-top:4px;font-weight:800;">🎉 FERIADO: ${selFeriado}</div>` : '<div style="color:#9A9A9A;">Día laborable normal</div>'}
      </div>
    `;
  }
}

function renderAll(){ renderHeader(); renderWeekdays(); renderDays(); renderInfoPanel(); }
function goPrevMonth(){ viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()-1,1); renderAll(); }
function goNextMonth(){ viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()+1,1); renderAll(); }
function goPrevYear(){ viewDate=new Date(viewDate.getFullYear()-1, viewDate.getMonth(),1); renderAll(); }
function goNextYear(){ viewDate=new Date(viewDate.getFullYear()+1, viewDate.getMonth(),1); renderAll(); }
function goToday(){ viewDate=new Date(today); selectedDate=new Date(today); renderAll(); }
function init(){
  $('#btnPrevMonth')?.addEventListener('click',goPrevMonth);
  $('#btnNextMonth')?.addEventListener('click',goNextMonth);
  $('#btnPrevYear')?.addEventListener('click',goPrevYear);
  $('#btnNextYear')?.addEventListener('click',goNextYear);
  $('#btnToday')?.addEventListener('click',goToday);
  $('#selectMonth')?.addEventListener('change',e=>{ viewDate=new Date(viewDate.getFullYear(), parseInt(e.target.value),1); renderAll(); });
  $('#selectYear')?.addEventListener('change',e=>{ viewDate=new Date(parseInt(e.target.value), viewDate.getMonth(),1); renderAll(); });
  document.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft') goPrevMonth(); if(e.key==='ArrowRight') goNextMonth(); if(e.key==='ArrowUp') goPrevYear(); if(e.key==='ArrowDown') goNextYear(); if(e.key==='t'||e.key==='T') goToday(); });
  let startX=0; const grid=$('#daysGrid');
  if(grid){ grid.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; },{passive:true}); grid.addEventListener('touchend',e=>{ const diff=e.changedTouches[0].clientX-startX; if(Math.abs(diff)>60){ if(diff>0) goPrevMonth(); else goNextMonth(); } },{passive:true}); }
  renderAll();
  setInterval(()=>{ const now=new Date(); if(!sameDay(now,today)) location.reload(); }, 60*1000);
}
document.addEventListener('DOMContentLoaded',init);
