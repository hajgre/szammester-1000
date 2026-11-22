# Számmester 1000 – V4: Blokk-kaland 🎮🧱

Magyar nyelvű, reklámmentes matematikai gyakorlójáték a **1000-es számkörben**, különálló, játékos társasjáték-kalandmóddal. A V4 világát a népszerű **blokkos, színes videojátékok (Roblox-hangulat)** inspirálták, de a játék **nem hivatalos Roblox-termék**, nem Roblox Studio-projekt, és nem használ Roblox-azonosítókat vagy -képeket. Ez egy böngészős játék GitHub Pages-re.

## Újdonságok a 4. verzióban

- A korábbi, hét térségre osztott 35 mezős társasjáték most élénk **blokkvárosokat, kockafákat, kristályokat, szigeteket és várat** tartalmaz.
- Eredeti, CSS-sel rajzolt **animált blokkfigurák**: Róka kalandor, Cica felfedező, Sárkány őr.
- **Karakteranimációk**: helyben mozgás, integetés, lépkedés; sikeres válasz után ugrás, a pálya teljesítésekor ünneplés.
- Négyzet alakú, 3D-hatású, számozott mezők, különleges kapuk és a már teljesített út zöld jelölése.
- Mobilon/tableten oldalra görgethető játéktábla; billentyűzetes használat; csökkentett animáció a rendszer mozgáscsökkentési beállításával.
- **Megmaradt mind a hét matematikai téma**, plusz a vegyes gyakorlás. A szabály továbbra is: egy megoldott feladat = egy lépés; nincs dobókocka és nincs időkorlát.
- Megmaradnak a korábbi V2/V3 kalandmentések és a V3-as hősválasztás is ugyanabban a böngészőben és eszközön.

## Hogyan próbáljam ki?

Nyisd meg az `index.html` fájlt a böngésződben, majd az **„Induljon a kaland!”** gombot. A kezdőlapról a hagyományos játékmódok is indíthatók.

## Hogyan frissítsem a GitHubon? (kezdőknek)

1. Töltsd le és bontsd ki ezt a ZIP-fájlt.
2. Nyisd meg a GitHubon a meglévő **`hajgre/szammester-1000`** repositoryt.
3. Válaszd az **Add file → Upload files** lehetőséget.
4. A repository **gyökerébe** töltsd fel ezt a négy fájlt: `index.html`, `style.css`, `app.js`, `README.md`. A négy korábbi azonos nevű fájlt kell felülírni. **Ne a ZIP-fájlt töltsd fel, és ne új almappába.**
5. A commit üzenete lehet: `V4 – Számország blokk-kaland`.
6. A **Commit changes** gombbal mentsd a `main` ágra.
7. Nyisd meg: `https://hajgre.github.io/szammester-1000/`.
8. Ha a régi verzió marad a képernyőn, néhány perc múlva próbáld **Ctrl + F5**-tel vagy inkognitóablakban. Ellenőrizd a **Settings → Pages / Actions** közzétételi állapotát.

## A fájlok szerepe

- `index.html`: a játék oldala, a fájlbetöltések (`?v=4` segít a frissítések láthatóságában).
- `style.css`: az új látványvilág, a blokkfigurák és az animációk.
- `app.js`: a matekfeladatok, a játéktábla, a haladás, a mentések és a választott hős.
- `README.md`: a projektleírás és a feltöltési útmutató.

## Mentések és adatvédelem

A játék a böngésző **localStorage** funkciójában tárolja a haladást és a hősválasztást, **nem továbbít személyes adatot szerverre**, nincs bejelentkezés. Másik eszközön vagy másik böngészőben a mentések nem jelennek meg automatikusan. Ha a böngészőhelyi adatokat törlik, az eredmények is elveszhetnek.

Megtartott mentési kulcsok:

- `szammester1000_adventure_v1_0`, `_1`, `_2`: nehézségi szintenkénti kalandmentés.
- `szammester1000_board_hero_v3`: a hős kiválasztása.
- `szammester1000_<játékmód>_<nehézség>`: a gyakorló játékmódok legjobb eredményei.

## Fejlesztés és tesztek

A V4-hez automatizált böngészőtesztet futtattunk: 35/35 feladat megoldása a hét kapuban, a hősválasztás, a korábbi mentések visszatöltése, az egyes nehézségek külön eredményei, a félbehagyott kör folytatása és a mobilos, vízszintesen görgethető megjelenés.

---

Számmester 1000 – játékos, otthoni matematikagyakorláshoz. 💚
