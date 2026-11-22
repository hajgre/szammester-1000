# 🌟 Számmester 1000

Magyar nyelvű, interaktív matematikai gyakorlójáték az 1000-es számkörben, többségi általános iskolai tanuláshoz.

## Hogyan indítsd el?

Az `index.html` fájlt megnyithatod böngészőben, internetkapcsolat nélkül is. A `style.css` és `app.js` fájl **maradjon ugyanabban a mappában**.

## Mit tartalmaz?

- Számsorrend: növekvő és csökkenő rendezés
- Helyi érték: egyes, tízes, százas, ezres
- Alaki érték
- Valódi érték
- Számszomszédok: egyes, tízes, százas
- Beváltások: pl. `4sz + 13t + 36e`
- Számok helye a számegyenesen
- Vegyes gyakorlás

3 nehézségi szint, játékonként 10 véletlenszerűen generált feladat. Minden kérdés újrapróbálható. Csillag az elsőre helyes válaszért jár. A legjobb eredményt az adott böngésző helyben tárolja.

**Adatvédelem:** nem kér nevet vagy e-mail címet, nem használ külső adatbázist, nem tölt fel tanulói adatokat. A felület magyar nyelvű és időkorlát nélküli.

## A három fontos fájl

- `index.html` = a játék szerkezete (HTML)
- `style.css` = a kinézete (CSS)
- `app.js` = a feladatok, pontozás és működés (JavaScript)

## Közzététel GitHub Pages segítségével

1. GitHubon hozz létre egy **Public** tárolót `szammester-1000` néven.
2. Nyisd meg a tárolót, és válaszd: **Add file → Upload files**. Töltsd fel a három fájlt (`index.html`, `style.css`, `app.js`) és ezt a README-t.
3. Kattints: **Commit changes**.
4. Menj ide: **Settings → Pages**.
5. A **Build and deployment → Source** mezőnél válaszd: **Deploy from a branch**.
6. A **Branch** sorban válaszd: **main** és **/(root)**, majd **Save**.
7. A webcím alakja: `https://FELHASZNALONEV.github.io/szammester-1000/`.

A közzététel pár percig tarthat. A saját GitHub-felhasználónevedet írd a `FELHASZNALONEV` helyére.

## Hogyan fejlesztheted tovább?

- Az `app.js` tetején a `QUESTIONS_PER_GAME` értéke szabályozza, hány feladat legyen egy menetben.
- A `MODES` listában találod a játékmódok nevét és leírását.
- A `makeOrdering`, `makePlace`, `makeFace`, `makeReal`, `makeNeighbors`, `makeExchange`, `makeNumberline` függvények készítik a feladatokat.
- A `style.css`-ben változtathatod meg a színeket és méreteket.

A program saját tanulási célra készült, külső csomagok nélkül. Nincs szerveroldali adatkezelés.
