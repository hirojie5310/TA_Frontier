const products = [
  { id:'jacket', name:'機能性ジャケット', emoji:'🧥', price:150, dept:'機能素材事業部', deptIcon:'🌦️', color:'#178bd0', blurb:'軽量で高い撥水・透湿性。街からアウトドアまで、快適な一日を支える。', job:'素材の機能を組み合わせ、驚きのある快適さを届けるチーム。研究・企画・販売がつながって製品を育てます。' },
  { id:'fabric', name:'高機能ファブリック', emoji:'🧶', price:100, dept:'ファッション素材部門', deptIcon:'🎨', color:'#ef5d78', blurb:'色・風合い・機能を掛け合わせ、毎日着たくなる服の可能性を広げる。', job:'トレンドと技術を結び、ブランドと一緒に次のファッションを形にします。' },
  { id:'tent', name:'タフネステント', emoji:'⛺', price:200, dept:'生活製品部門', deptIcon:'🏕️', color:'#1aa779', blurb:'軽く、丈夫で、持ち運びやすい。繊維の力で外の時間をもっと自由に。', job:'暮らしやレジャーの身近な課題を見つけ、使う人目線の商品へ仕立てます。' },
  { id:'material', name:'産業用軽量資材', emoji:'🏗️', price:250, dept:'産業資材部門', deptIcon:'⚙️', color:'#ff8b29', blurb:'強さと軽さを両立し、建築や産業の現場を見えないところから支える。', job:'幅広い産業のお客様と向き合い、素材の知識で社会の課題を解決します。' }
];

const quests = {
  forest:{name:'繊維の森',icon:'🌲',reward:100,question:'森の案内人から質問です。繊維から生まれるものは、服だけでしょうか？',choices:[['服だけ！',false],['テントや建材などにも広がる',true],['食べ物だけ',false]],success:'正解！ 繊維は衣料から住まい・産業まで、暮らしの多くを支えています。'},
  town:{name:'生地の町',icon:'🏘️',reward:150,question:'雨の日も蒸れにくい上着を作りたいそうです。重視する組み合わせは？',choices:[['撥水性と透湿性',true],['厚さと重さだけ',false],['色の数だけ',false]],success:'ぴったり！ 相反しそうな機能を両立させるのが、素材開発の腕の見せ所です。'},
  street:{name:'ファッションの街',icon:'🏰',reward:180,question:'新しい服を企画中。素材の会社がブランドと一緒にできることは？',choices:[['生地を渡して終わり',false],['企画・機能提案から一緒につくる',true],['値札だけつくる',false]],success:'その通り！ 素材の技術と市場の声をつなぎ、新しい価値を共創します。'},
  mine:{name:'建材の砦',icon:'⛺',reward:220,question:'運びやすく、現場の負担も減らす資材に大切な特徴は？',choices:[['軽さと強さ',true],['とにかく大きいこと',false],['水に溶けること',false]],success:'見事！ 高機能な繊維は、産業や建築の課題解決にも活躍しています。'}
};

const state = {points:0,completed:new Set(),owned:new Set(),equipped:new Set(),discovered:new Set(),sound:true,finished:false};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function beep(freq=520,duration=.08){
  if(!state.sound) return;
  try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=freq;g.gain.setValueAtTime(.07,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.start();o.stop(a.currentTime+duration)}catch(_){ }
}

function switchView(id){
  $$('.view').forEach(v=>v.classList.toggle('active-view',v.id===id));
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id));
  if(id==='shop') $('#shopBadge').hidden=true;
  beep(380);
}

function openModal({icon='✨',eyebrow='',title,body,actions}){
  $('#modalIcon').textContent=icon; $('#modalEyebrow').textContent=eyebrow; $('#modalTitle').textContent=title;
  $('#modalBody').innerHTML=body; $('#modalActions').innerHTML='';
  actions.forEach(a=>{const b=document.createElement('button');b.type='button';b.className=a.primary?'primary':'choice-btn';b.textContent=a.label;b.onclick=a.onClick;$('#modalActions').appendChild(b)});
  $('#modal').classList.add('open');
}
function closeModal(){ $('#modal').classList.remove('open'); }
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2400)}

function startQuest(id){
  const q=quests[id],el=$(`[data-quest="${id}"]`);$('#playerToken').style.setProperty('--x',el.style.getPropertyValue('--x'));$('#playerToken').style.setProperty('--y',el.style.getPropertyValue('--y'));
  if(state.completed.has(id)){openModal({icon:q.icon,eyebrow:'QUEST COMPLETE',title:q.name,body:`<p>${q.success}</p><p>このクエストは達成済みです。</p>`,actions:[{label:'マップへ戻る',primary:true,onClick:closeModal}]});return}
  openModal({icon:q.icon,eyebrow:'NEW QUEST',title:q.name,body:`<p>${q.question}</p>`,actions:q.choices.map(([label,ok])=>({label,onClick:()=>answerQuest(id,ok)}))});
}
function answerQuest(id,correct){
  const q=quests[id];
  if(!correct){beep(180,.18);$('#modalBody').innerHTML=`<p>惜しい！ ヒントは「繊維の可能性を広げる」こと。もう一度考えてみよう。</p>`;return}
  state.completed.add(id);state.points+=q.reward;beep(760,.16);$(`[data-quest="${id}"]`).classList.add('completed');$('#shopBadge').hidden=false;
  update();
  openModal({icon:'⭐',eyebrow:'QUEST COMPLETE!',title:`${q.reward} pt 獲得！`,body:`<p>${q.success}</p><div class="reward">所持ポイント ${state.points} pt</div>`,actions:[{label:'商品市場へ行く',primary:true,onClick:()=>{closeModal();switchView('shop')}},{label:'冒険を続ける',onClick:closeModal}]});
}

function buy(id){
  const p=products.find(x=>x.id===id);if(state.owned.has(id))return;
  if(state.points<p.price){toast(`あと ${p.price-state.points} pt 必要です`);beep(170,.14);return}
  state.points-=p.price;state.owned.add(id);beep(700,.14);update();
  openModal({icon:p.emoji,eyebrow:'ITEM GET!',title:`${p.name}を手に入れた！`,body:`<p>${p.blurb}</p><p>装備すると、この商品を扱う部署が図鑑に登録されます。</p>`,actions:[{label:'さっそく装備する',primary:true,onClick:()=>{closeModal();switchView('gear');equip(id)}},{label:'買い物を続ける',onClick:closeModal}]});
}
function equip(id){
  if(!state.owned.has(id))return;const p=products.find(x=>x.id===id),isNew=!state.discovered.has(p.dept);
  state.equipped.add(id);state.discovered.add(p.dept);beep(880,.18);update();
  if(isNew){
    const reachedGoal=state.discovered.size>=3;
    openModal({icon:p.deptIcon,eyebrow:'NEW TEAM DISCOVERED!',title:p.dept,body:`<p><strong>${p.name}</strong>の先には、こんな仕事があります。</p><p>${p.job}</p>`,actions:reachedGoal?[{label:'冒険をクリアする',primary:true,onClick:()=>{closeModal();checkClear()}}]:[{label:'部署図鑑で見る',primary:true,onClick:()=>{closeModal();switchView('book')}},{label:'装備を見る',onClick:closeModal}]})
  }else checkClear();
}
function checkClear(){
  if(state.discovered.size<3||state.finished)return;state.finished=true;setTimeout(()=>openModal({icon:'🏆',eyebrow:'ADVENTURE COMPLETE!',title:'未来を織る仲間になった！',body:'<p>3つの部署を発見し、繊維がさまざまな仕事と暮らしをつないでいることを知りました。</p><p><strong>あなたなら、繊維でどんな未来をつくりますか？</strong></p>',actions:[{label:'図鑑を完成させる',primary:true,onClick:()=>{closeModal();switchView('map')}},{label:'部署図鑑を見る',onClick:()=>{closeModal();switchView('book')}}]}),450)
}

function update(){
  $('#points').textContent=state.points;$('#discoveries').textContent=state.discovered.size;$('#rankText').textContent=state.discovered.size>=3?'称号：未来を織るフロンティア！':`次のランクまで、あと${3-state.discovered.size}つ発見`;
  $('#shopGrid').innerHTML=products.map(p=>`<article class="product-card">${state.owned.has(p.id)?'<span class="owned-ribbon">GET!</span>':''}<div class="product-art">${p.emoji}</div><h3>${p.name}</h3><p>${p.blurb}</p><div class="price-row"><span class="price">${p.price} pt</span><button class="buy-btn" data-buy="${p.id}" ${state.owned.has(p.id)?'disabled':''}>${state.owned.has(p.id)?'入手済み':'交換する'}</button></div></article>`).join('');
  $$('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));
  const owned=products.filter(p=>state.owned.has(p.id));
  $('#inventoryGrid').innerHTML=owned.length?owned.map(p=>`<div class="inventory-item"><span class="emoji">${p.emoji}</span><span><strong>${p.name}</strong><small>${state.equipped.has(p.id)?'装備中・部署発見済み':'まだ装備していません'}</small></span><button class="equip-btn" data-equip="${p.id}" ${state.equipped.has(p.id)?'disabled':''}>${state.equipped.has(p.id)?'装備中':'装備'}</button></div>`).join(''):'<div class="empty-state">🏪<br>商品市場でアイテムを手に入れよう</div>';
  $$('[data-equip]').forEach(b=>b.onclick=()=>equip(b.dataset.equip));
  $('#equippedList').innerHTML=state.equipped.size?[...state.equipped].map(id=>products.find(p=>p.id===id).emoji).join(' ')+'<br>装備中のフロンティア製品':'まだ装備はありません';
  $('#character').textContent=state.equipped.size?'🧑🏻‍🎤':'🧑🏻‍🚀';
  $('#bookGrid').innerHTML=products.map(p=>{const unlocked=state.discovered.has(p.dept);return `<article class="book-card ${unlocked?'unlocked':''}"><div class="${unlocked?'dept-icon':'lock'}">${unlocked?p.deptIcon:'🔒'}</div><span class="kicker">${unlocked?'DISCOVERED':'UNKNOWN TEAM'}</span><h3>${unlocked?p.dept:'？？？'}</h3><p>${unlocked?p.job:'対応する商品を手に入れ、装備すると部署の仕事が見えてきます。'}</p>${unlocked?`<small>関連商品：${p.emoji} ${p.name}</small>`:''}</article>`}).join('');
}

$$('.tab').forEach(t=>t.onclick=()=>switchView(t.dataset.view));
$$('[data-quest]').forEach(p=>p.onclick=()=>startQuest(p.dataset.quest));
$('#modalClose').onclick=closeModal;
$('#modalActions').onclick=e=>{if(e.target.dataset.action==='close')closeModal()};
$('#soundBtn').onclick=()=>{state.sound=!state.sound;$('#soundBtn').textContent=state.sound?'🔊':'🔇';toast(state.sound?'効果音 ON':'効果音 OFF')};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();const n=['1','2','3','4'].indexOf(e.key);if(n>=0)switchView(['map','shop','gear','book'][n])});
update();

