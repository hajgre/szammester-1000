# Számmester 1000 – V10: Minőségellenőrzés és mentésvédelem

Ez a V9 játék **teljes, frissített változata**. A hét matematikai birodalom, a kártyapaklik, a főellenfelek, a jutalmak és a karakterbolt megmaradtak.

## Mit javítottunk a V10-ben?

- **Bemenetellenőrzés:** a begépelt válasz csak 0 és 1000 közötti egész szám lehet. Ha valaki 1001-et vagy 9999-et ír, ezt a játék jelzi, de nem számolja matematikai hibának.
- **Billentyűzetes kezelés:** válaszadás után a következő fontos vezérlőre kerül a fókusz, így nem kell újra a teljes oldal elejéről tabulátorozni.
- **Mentésvédelem:** a főmenü alján a „Mentéseim letöltése” egy `szammester-1000-mentes.json` nevű fájlt hoz létre, amely csak a Számmester helyi tárolókulcsait tartalmazza. A „Mentés visszaállítása” vissza tudja tölteni a játékba a saját mentésfájlt. A rendszer előzetes megerősítést kér és ellenőrzi a fájl szerkezetét.
- **Stabilabb kiadás:** új verziószám a HTML-ben és a külső fájlok hivatkozásaiban (`v=10`), ami segít a böngészőnek felismerni a frissítést.

## Mit ellenőriztünk?

- 360 000 véletlenszerű matematikai feladateset: generált megoldások, válaszlehetőségek, számhatárok.
- Teljes V9 regressziós vizsgálat: bolt csak 7 teljesített birodalom és 7 főellenfél után; vásárlás egyszer von le érmét; kiegészítők visszatöltése; nehézségi szintek elkülönítése; régi gyakorlási módok.
- V10 külön tesztek: 0–1000 bevitel, hibakövetés, billentyűzetes fókusz, JSON mentés export és import, sérült mentés visszautasítása, böngészőbeli újranyitás, mobilos szélesség.

Az automatizált tesztek nem helyettesítik a gyermekkel történő tényleges kipróbálást.

## GitHub Pages – frissítés

1. ZIP kibontása.
2. A négy fájl (`index.html`, `style.css`, `app.js`, `README.md`) feltöltése a már meglévő `hajgre/szammester-1000` repository **gyökérmappájába**, a régiek felülírásával.
3. Commit: `V10 – Nagy játékellenőrzés és mentésvédelem`.
4. Webhely: `https://hajgre.github.io/szammester-1000/` – ha szükséges, frissíts Ctrl+F5 billentyűkkel.

## Ajánlott kézi tesztlista

- [ ] A régi csillagok, birodalmak, jelvények és érmék változatlanok.
- [ ] Beváltásnál `1001` beírásakor hibaüzenetet látok, de nem vesztek csillagot.
- [ ] Egy helytelen matematikai válasz megjelenik a „Hibáimból tanulok” műhelyben.
- [ ] A karakterbolt a végső győzelem előtt zárva, utána nyitva van.
- [ ] Megvett kiegészítő visszatöltés után is megvan.
- [ ] A főmenü alján működik a mentések `.json` fájlba letöltése.
- [ ] A mentések a „Mentés visszaállítása” gombbal visszatölthetők.
- [ ] Telefonon/tableten kényelmesen olvasható a játék.

## Tudnivalók a mentésről

A játék eredményeit a böngésző `localStorage` tárhelye őrzi, **nem a GitHub**, ezért a GitHub-frissítés önmagában nem törli őket. Fontos, hogy ugyanazon az oldalon és böngészőben folytassátok a játékot. A külön megnyitott helyi `index.html` fájl ettől független tárhelyet használhat.

A privát/inkognitó mód vagy a böngésző adatainak törlése elveszítheti a haladást. A V10 megnyitása után érdemes rögtön biztonsági mentést letölteni. A `.json` fájlban eredmények és játékadatok vannak; **ne töltsd fel nyilvános GitHub-repositoryba**, és csak a saját mentésfájlodat importáld. A visszaállítás az azonos nevű helyi mentéseket felülírja, de a biztonsági másolatban nem szereplő kulcsokat nem törli.

A játék továbbra is reklám- és regisztrációmentes; valódi pénzes vásárlás vagy külső adatküldés nincs.
