// A biztonságot nem az admin.html URL-je, hanem a Firestore Security Rules adja.
const $=id=>document.getElementById(id);
const config=window.SZAMMESTER_FIREBASE_CONFIG||{};
const configured=!!(config.apiKey && config.projectId && config.appId && !Object.values(config).some(x=>typeof x==='string'&&x.startsWith('IDE_')));
let auth,db,authMod,dbMod,unsub=()=>{},allRows=[];
const modeNames={order:'Számsorrend',place:'Helyi érték',face:'Alaki érték',real:'Valódi érték',neighbors:'Számszomszédok',exchange:'Beváltások',line:'Számegyenes',mixed:'Vegyes gyakorlás',digitcards:'Számjegykártyák',placecards:'Helyiérték-kártyák',exchangecards:'Beváltáskártyák',neighborcards:'Szomszédkártyák'};
const catNames={practice:'Gyakorlás',cards:'Kártyapakli',review:'Hibaismétlés',adventure:'Birodalom + főellenfél'};
function status(message){$('pageStatus').textContent=message;}
function cell(tr,text){const td=document.createElement('td');td.textContent=String(text);tr.append(td);return td;}
function dt(row){const date=row.completedAt?.toDate?.();return date?date.toLocaleString('hu-HU'):'Nincs dátum';}
function score(row){return `${row.stars} / ${row.total}`;}
function safeFile(text){return String(text).replace(/[\r\n]/g,' ').replace(/^[=+@\-\t]/,'\'$&');}
function csvValue(value){return '"'+safeFile(value).replace(/"/g,'""')+'"';}
function visible(){const q=$('searchInput').value.trim().toLocaleLowerCase('hu-HU');return allRows.filter(r=>r.name.toLocaleLowerCase('hu-HU').includes(q));}
function refresh(){
  const rows=visible();$('rows').replaceChildren();
  for(const r of rows){
    const tr=document.createElement('tr');
    cell(tr,dt(r));cell(tr,r.name);cell(tr,(catNames[r.category]||r.category)+' – '+(modeNames[r.mode]||r.mode));cell(tr,['Kezdő','Közép','Haladó'][r.level]||r.level);cell(tr,score(r));cell(tr,'Igen');
    const td=document.createElement('td');const btn=document.createElement('button');btn.textContent='Törlés';btn.title='Eredmény törlése';btn.addEventListener('click',async()=>{
      if(!confirm(`${r.name} eredményét biztosan törlöd?`))return;
      try{await dbMod.deleteDoc(dbMod.doc(db,'results',r.id));status('A kiválasztott eredmény törölve.');}catch(e){status('Nem sikerült törölni: '+e.message)}
    });td.append(btn);tr.append(td);$('rows').append(tr);
  }
  $('totalRuns').textContent=rows.length;
  $('totalPlayers').textContent=new Set(rows.map(r=>r.name.toLocaleLowerCase('hu-HU'))).size;
  $('avgScore').textContent=rows.length?(100*rows.reduce((s,r)=>s+r.stars/r.total,0)/rows.length).toFixed(0)+'%':'–';
}
$('loginBtn').addEventListener('click',async()=>{
  if(!configured){status('Előbb töltsd ki a firebase-config.js fájlt!');return;}
  try {
    if(!auth){
      const [appMod,a,f]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js')
      ]);
      const app=appMod.initializeApp(config);
      auth=a.getAuth(app);db=f.getFirestore(app);authMod=a;dbMod=f;
      await a.setPersistence(auth,a.inMemoryPersistence);
    }
    const provider=new authMod.GoogleAuthProvider();
    await authMod.signInWithPopup(auth,provider);
    const user=auth.currentUser;
    $('authStatus').textContent=`Belépve: ${user.email} · Firebase UID: ${user.uid}`;
    $('loginBtn').hidden=true;$('dataPanel').hidden=false;
    $('currentUser').textContent=`Bejelentkezve: ${user.email}`;
    unsub=dbMod.onSnapshot(dbMod.query(dbMod.collection(db,'results'),dbMod.orderBy('completedAt','desc'),dbMod.limit(500)),snap=>{
      allRows=snap.docs.map(d=>({id:d.id,...d.data()}));refresh();status('Az adatok frissültek. Az utolsó 500 eredmény jelenik meg.');
    },error=>status('Nincs hozzáférés az adatokhoz. Ellenőrizd a firestore.rules ADMIN UID-ját és a közzétett szabályokat. Részlet: '+error.message));
  } catch(e){status('Bejelentkezési hiba: '+e.message);}
});
$('logoutBtn').addEventListener('click',async()=>{unsub();unsub=()=>{};allRows=[];if(auth)await authMod.signOut(auth);$('dataPanel').hidden=true;$('loginBtn').hidden=false;$('authStatus').textContent='Kiléptél.';status('');});
$('searchInput').addEventListener('input',refresh);
$('exportBtn').addEventListener('click',()=>{
  const cols=['Dátum','Név','Mód','Szint','Elsőre jó','Összes feladat','Befejezve'];
  const lines=[cols,...visible().map(r=>[dt(r),r.name,(catNames[r.category]||r.category)+' – '+(modeNames[r.mode]||r.mode),['Kezdő','Közép','Haladó'][r.level]||r.level,r.stars,r.total,'igen'])];
  const text='\ufeff'+lines.map(row=>row.map(csvValue).join(';')).join('\r\n');
  const blob=new Blob([text],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='szammester-eredmenyek.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
if(!configured)status('A Firebase még nincs beállítva. Kezdd a README.md útmutatóval!');
