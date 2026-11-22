# Számmester 1000 – V11 / online eredménykövetés

## Mi változott?
- Minden játékosnak kötelező **nevet megadnia**, mielőtt a játékot használhatja (friss fülben ismét kérdezi).
- A **befejezett** 10 feladatos gyakorlások, 12 kártyás paklik, 5 feladatos ismétlések és a birodalom+főellenfél teljesítései bekerülhetnek az online eredménynaplóba.
- A **szülői/tanári nézet**: `admin.html` – Google-bejelentkezés után név, feladat, szint, elsőre helyesek aránya, időpont, CSV export és törlés.
- A korábbi V1–V10 matematikai feladatok, helyi mentések, érmek, bolt, korábban megvett karakterkiegészítők érintetlenek.
- A nevet a játék **csak aktuális böngészőfülre** jegyzi meg, tehát közös eszközön váltsatok játékost. A régi mentések továbbra is eszköz-/böngészőalapúak, *nem* lesznek a névhez kapcsolva automatikusan.

## Fontos: két egymást követő telepítési lépés

### A. Firebase projekt és jogosultságok létrehozása

1. [Firebase Console](https://console.firebase.google.com/) → **Add project** → például `szammester-eredmenyek`. Új Firebase-projekt szükséges; a GitHub Pages önmagában nem tárol online játékoseredményeket.
2. **Build → Authentication → Get started → Sign-in method** alatt kapcsold be a **Google** és az **Anonymous** beléptetési módot.
3. **Authentication → Settings → Authorized domains**: add hozzá a `hajgre.github.io` domaint (ha nincs). Helyi `file://` megnyitással a felhő nem fog működni; a GitHub Pages-en tesztelj.
4. **Build → Firestore Database → Create database**: válassz EU-s régiót, ha megfelelő (például `europe-west3` vagy `eur3`, az aktuális lehetőségektől függően). Indulj zárt (production) szabályokkal, ne a `allow read, write: if true` tesztbeállítással.
5. **Project settings → Your apps → Web app**: regisztrálj egy webappot. A megkapott `firebaseConfig` objektumból másold át a `apiKey`, `authDomain`, `projectId`, `appId` mezőket a ZIP-ben levő **`firebase-config.js`** fájlba. Ez kliensoldali, nyilvános webkonfiguráció: nem privát admin-kulcs. **Service account private key fájlt soha ne tegyél a GitHubra!**
6. **Mielőtt személyes neveket gyűjtesz:** töltsd ki az `adatkezeles.html` sablont (adatkezelő neve/kapcsolata, cél, jogalap, megőrzési idő, törlés igénylése), és tájékoztasd az érintetteket / szülőket. Iskolai használathoz egyeztess az intézményi adatvédelmi felelőssel. Ha ez rendezett, a `firebase-config.js` fájlban változtasd `privacyReady: false` értékét `privacyReady: true`-ra. Addig az online beküldés tudatosan KI van kapcsolva.
7. A `firebase-config.js` kitöltésével és a V11-fájlok feltöltésével megnyílik az `https://hajgre.github.io/szammester-1000/admin.html` oldal, ahol **Google-belépés** után kiírja a **Firebase UID-t**. Ekkor még üres/hozzáférés-megtagadva napló látható, ez természetes.
8. A ZIP-ben található **`firestore.rules`** fájlban cseréld ki az `IDE_A_SAJAT_ADMIN_UID` szöveget a **saját Google-fiókodhoz tartozó Firebase UID-re**. A Firebase Console → **Firestore Database → Rules** lapon másold be a *teljes* szabályfájlt és kattints a **Publish** gombra. A jogosultság ekkor lép életbe.
9. Ezt követően ugyanazon a `admin.html` címen, a saját Google-fiókoddal belépve már lekérheted a beérkezett eredményeket. Ha az admin oldal nyitva van, frissítsd.

### B. GitHub Pages fájlok

A V10 négy korábbi fájlját (`index.html`, `style.css`, `app.js`, `README.md`) cseréld le, és **pluszban** töltsd fel a következőket a `main` ág gyökerébe: `firebase-config.js`, `online.js`, `admin.html`, `admin.js`, `admin.css`, `adatkezeles.html`. A `firestore.rules` ellenőrzési és telepítési célra feltölthető a GitHubra, de azt a GitHub nem telepíti automatikusan a Firebase-be.

Commit üzenet: `V11 – Névmegadás és jogosultságvédett online eredmények`.

Játék: https://hajgre.github.io/szammester-1000/
Admin felület: https://hajgre.github.io/szammester-1000/admin.html

## Ellenőrzés
1. A játék első indításkor nevet kér. Név nélkül nem indul.
2. Egy kártyapakli (12 feladat) befejezése után az eredményoldalon sikeres felküldés jelenik meg.
3. A saját Google-fiókoddal nyisd meg az adminoldalt – ott legyen a név, 12-ből elsőre helyes válaszok száma, időpont és a témakör.
4. Próbáld meg **másik böngészőben** (nem belépett admin-fiókkal) az adminoldalt. Az adatokat nem láthatja.
5. A V10 csillagok/érmék/mentések maradjanak meg ugyanazon az eszközön. Az új online eredmények **nem** szinkronizálják a korábbi helyi mentéseket.
6. Hibás konfiguráció vagy internet nélkül a játék továbbra is használható, de **nem küld online eredményt** (látható figyelmeztetés).

## Adatvédelem és korlátok
- **Kiskorúakról van szó.** Ha a tényleges nevüket gyűjtöd, az személyes adat. Iskolai használat előtt tisztázni kell az adatkezelő személyét, a jogalapot, az érintettek/szülők tájékoztatását, a megőrzési időt és a törlés lehetőségét. Alapértelmezetten inkább keresztnév + egyedi jel használatát javasoljuk, amíg nincs jóváhagyott folyamat.
- A játékos által írt név **nem bizonyítja a személyazonosságát**. Játékosok más nevet is beírhatnak. Biztos azonosításhoz külön belépési/azonosítási megoldás szükséges.
- A Firestore szabályai megakadályozzák, hogy anonim játékosok mások eredményeit olvassák vagy módosítsák; kizárólag az admin UID tekintheti meg vagy törölheti őket. Az anonim beküldést nem lehet teljesen megvédeni a hamis eredményektől. Később **Firebase App Check** javasolt visszaélések ellen.
- A tanulói haladás továbbra is csak a helyi böngészőben mentődik. A webes eredménynapló kizárólag a befejezett játékkörök összefoglalóit tárolja.
- Az `admin.html` URL-je nyilvános, **az adatok nem**. A védelem a Firebase-ben beállított biztonsági szabályokon múlik.
- A napló az utolsó 500 eredményt mutatja, a régebbiek nem tűnnek el; teljes exporthoz további lapozás szükséges.
- Nem készült valódi Firebase-projekt a nevedben. A feltöltés után *még szükséges a Firebase létrehozása és a biztonsági szabályok bekapcsolása*.

A névmegadási oldalon található adatkezelési tájékoztatót (`adatkezeles.html`) saját valós adatokkal kell kitölteni. A minta önmagában nem minősül jogi megfelelőségnek.
