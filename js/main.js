const $ = s => document.querySelector(s);
const modal = $('#modal'), body = $('#modalBody');
let branch = 0;

/* плавное появление блоков при скролле */
const io = new IntersectionObserver(list => list.forEach(x => {
  if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
}), {threshold: .12, rootMargin: '0px 0px -40px 0px'});
function reveal() {
  document.querySelectorAll('h2,.sub,.hero__title,.hero__sub,.card,.slider,.info,.founder,.svc,.branch,.tabs,.masters__title,.master,.brands__list li').forEach(el => {
    if (el.dataset.rv) return;
    el.dataset.rv = 1; el.classList.add('reveal');
    el.style.setProperty('--d', ([...el.parentElement.children].indexOf(el) % 4) * .08 + 's');
    io.observe(el);
  });
}

/* меню */
document.addEventListener('click', e => {
  if (e.target.closest('[data-menu]')) $('#menuOverlay').hidden = !$('#menuOverlay').hidden;
  else if (e.target.closest('#menuOverlay a')) $('#menuOverlay').hidden = true;
});

/* прокрутка: бургер, кнопка «наверх» */
addEventListener('scroll', () => {
  const y = scrollY > 300;
  document.querySelector('.burger').classList.toggle('show', y);
  $('#up').classList.toggle('show', y);
}, {passive: true});

/* cookie */
try { if (localStorage.getItem('ck')) $('#cookie').hidden = true; } catch (e) {}
$('#cookieOk').onclick = () => { $('#cookie').hidden = true; try { localStorage.setItem('ck', 1); } catch (e) {} };

/* слайдер */
const slides = [...document.querySelectorAll('.slide')]; let si = 0;
const show = n => { si = (n + slides.length) % slides.length; slides.forEach((s, i) => s.classList.toggle('on', i === si)); };
show(0);
$('.slider__btn--prev').onclick = () => show(si - 1);
$('.slider__btn--next').onclick = () => show(si + 1);
setInterval(() => show(si + 1), 6000);

/* филиалы */
const setBranch = i => {
  branch = i; const b = BRANCHES[i];
  $('#headerPhone').textContent = b.phone; $('#headerPhone').href = 'tel:' + b.tel; $('#headerTg').href = b.tg;
};
$('#branchesGrid').innerHTML = BRANCHES.map((b, i) => `
  <article class="branch" style="background-image:url(${b.img})">
    <h3><svg width="26" height="34" viewBox="0 0 24 32" fill="#fff"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.600 0 12 0zm0 17a5 5 0 110-10 5 5 0 010 10z"/></svg>${b.address}</h3>
    <p>${b.text}</p>
    <button class="btn" data-book data-branch="${i}">Записаться</button>
  </article>`).join('');
$('#dockBranch').onclick = () => {
  body.innerHTML = '<h3>Выберите филиал</h3><div class="pick">' + BRANCHES.map((b, i) =>
    `<button data-pick="${i}"><b>${b.name}</b><br>${b.address}<br>${b.phone}</button>`).join('') + '</div>';
  modal.showModal();
};
body.addEventListener('click', e => {
  const p = e.target.closest('[data-pick]'); if (!p) return;
  setBranch(+p.dataset.pick); modal.close();
});

/* услуги */
$('#servicesGrid').innerHTML = SERVICES.map((s, i) => `
  <button class="svc" data-i="${i}" style="background-image:url(${s.img})">
    <span class="svc__top"><span>${s.name}</span><b>›</b></span><p>${s.text}</p>
  </button>`).join('');
$('#servicesGrid').addEventListener('click', e => {
  const c = e.target.closest('.svc'); if (!c) return;
  const s = SERVICES[c.dataset.i];
  body.innerHTML = `<h3>${s.name}</h3><ul class="price">${s.items.map(i => `<li><span>${i[0]}</span><span>${i[1]}</span></li>`).join('')}</ul>
    <button class="btn" style="margin:0;width:100%" data-book data-what="${s.name}">Записаться</button>`;
  modal.showModal();
});

/* мастера */
let grp = 0;
function drawMasters() {
  $('#masterTabs').innerHTML = MASTER_GROUPS.map((g, i) => `<button class="tab" role="tab" aria-selected="${i === grp}" data-g="${i}">${g}</button>`).join('');
  $('#mastersTitle').textContent = MASTER_GROUPS[grp].toUpperCase();
  $('#mastersGrid').innerHTML = MASTERS.map((m, i) => ({m, i})).filter(x => x.m.g === grp).map(({m, i}) => `
    <article class="master" data-i="${i}">
      <div class="master__photo" style="background-image:url(${m.img})" role="img" aria-label="${m.name}"></div>
      <div class="master__body">
        <h3>${m.name}</h3><span class="cat">${m.cat}</span>
        <p>Опыт: ${m.total}, в салоне — ${m.salon}<br>${m.spec}</p>
        <div class="mtabs"><button class="mtab" aria-selected="true" data-k="about">О себе</button><button class="mtab" aria-selected="false" data-k="col">Коллеги о ней</button><button class="mtab" aria-selected="false" data-k="cli">Клиенты о ней</button></div>
        <p class="mtext">${m.about}</p>
        <button class="mbtn" data-book data-what="${m.name}">Записаться к мастеру</button>
      </div></article>`).join('') || '<p>Скоро здесь появятся мастера.</p>';
  reveal();
}
$('#masterTabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) { grp = +t.dataset.g; drawMasters(); } });
$('#mastersGrid').addEventListener('click', e => {
  const t = e.target.closest('.mtab'); if (!t) return;
  const c = t.closest('.master');
  c.querySelectorAll('.mtab').forEach(b => b.setAttribute('aria-selected', b === t));
  c.querySelector('.mtext').textContent = MASTERS[c.dataset.i][t.dataset.k];
});
drawMasters();

/* бренды */
if (!BRANDS.length) document.querySelector('.brands').remove();
else $('#brandsList').innerHTML = BRANDS.map(b => `<li><img src="${b.img}" alt="${b.name}"></li>`).join('');

/* запись */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-book]'); if (!b) return;
  if (b.dataset.branch) setBranch(+b.dataset.branch);
  body.innerHTML = `<h3>Онлайн-запись</h3><form class="form">
    ${b.dataset.what ? `<p>${b.dataset.what}</p>` : ''}
    <select aria-label="Филиал">${BRANCHES.map((x, i) => `<option ${i === branch ? 'selected' : ''}>${x.address}</option>`).join('')}</select>
    <input name="name" placeholder="Ваше имя" required autocomplete="name">
    <input name="phone" type="tel" placeholder="Телефон" required autocomplete="tel">
    <input name="date" type="datetime-local" aria-label="Дата и время">
    <button class="btn" type="submit">Отправить заявку</button></form>`;
  if (!modal.open) modal.showModal();
});
body.addEventListener('submit', e => {
  e.preventDefault();
  /* TODO: отправьте данные в CRM: fetch('/api/booking', {method:'POST', body:new FormData(e.target)}) */
  body.innerHTML = '<h3>Заявка отправлена</h3><p>Мы перезвоним вам в ближайшее время.</p>';
});
$('#modalClose').onclick = () => modal.close();
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

reveal();
