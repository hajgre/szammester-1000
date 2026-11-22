// V11 – kizárólag BEFEJEZETT eredmények egyszeri beküldése. A játékosok nem olvashatják a naplót.
const config=window.SZAMMESTER_FIREBASE_CONFIG||{};
const configured=!!(config.privacyReady === true && config.apiKey && config.projectId && config.appId &&
  !Object.values(config).some(x=>typeof x==='string' && x.startsWith('IDE_')));
let firebasePromise;
async function getFirebase(){
  if (!configured) throw new Error('Firebase még nincs konfigurálva');
  if (!firebasePromise) firebasePromise=Promise.all([
    import('https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js')
  ]).then(([appMod,authMod,dbMod])=>{
    const app=appMod.initializeApp(config);
    return {auth:authMod.getAuth(app),db:dbMod.getFirestore(app),authMod,dbMod};
  });
  return firebasePromise;
}
async function send(record){
  const {auth,db,authMod,dbMod}=await getFirebase();
  // Az admin Google-bejelentkezése nem ad játékos-lekérdezési jogot.
  if (!auth.currentUser?.isAnonymous) await authMod.signInAnonymously(auth);
  const {id,name,category,mode,level,stars,total}=record;
  await dbMod.setDoc(dbMod.doc(db,'results',id),{
    name,category,mode,level,stars,total,
    playerUid:auth.currentUser.uid,
    appVersion:11,
    completedAt:dbMod.serverTimestamp()
  });
}
window.SzamOnline={configured,send};
window.dispatchEvent(new CustomEvent('szammester-online-ready'));
