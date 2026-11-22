# Számmester 1000 – V3: Számország varázsösvénye 🎲

**Magyar nyelvű, ingyenes, interaktív matematika-társasjáték az 1000-es számkörben**, általános iskolai gyakorláshoz. Működik laptopon, tableten és telefonon, böngészőben.

## Újdonságok a V3-ban

- 35 mezős, kanyargós társasjátéktábla (7 állomás × 5 feladat).
- Választható, animált játékbábu: róka, cica vagy sárkány.
- Minden **megoldott feladat pontosan egy mezővel** lépteti előre a bábut. Nincs véletlen kockadobás, és nincs időkorlát.
- A feladatok első próbálkozásra helyes megoldásáért csillag jár.
- Kinyitható kapuk és visszajátszható állomások.
- A korábbi, V2-es Kaland mód mentéseinek **megtartása** (a `szammester1000_adventure_v1_` kulcs nem változott).
- A korábbi nyolc szabad gyakorló mód változatlanul megmaradt.
- Telefonon a társasjátéktábla **oldalirányban görgethető**.
- Nem használ külső könyvtárat, szervert vagy reklámot.

## A hét állomás

1. Számsorrend
2. Helyi érték
3. Alaki érték
4. Valódi érték
5. Számszomszédok
6. Beváltások
7. Számegyenes

Három nehézségi szint: Kezdő, Haladó, Mester. Mindegyikhez külön kalandmentés tartozik.

## Kipróbálás a számítógépen

1. Csomagold ki a ZIP-fájlt.
2. A kibontott mappában kattints duplán az **`index.html`** fájlra.
3. A játék kezdőlapján válaszd az **„Induljon a kaland!”** gombot.
4. Válassz bábut, nehézséget, majd kattints az **1. Számsorrend** küldetésre.

## GitHub-feltöltés – a meglévő tároló frissítése

**Nem kell új GitHub-repository vagy GitHub Pages oldal.**

1. Nyisd meg ezt a tárolót: https://github.com/hajgre/szammester-1000
2. A `main` ágon, a repository gyökérmappájában válaszd az **Add file → Upload files** menüpontot.
3. A ZIP-ből kibontva töltsd fel **az `index.html`, `style.css`, `app.js`, `README.md` fájlokat**. **A fájlokat külön töltsd fel, ne a ZIP-et!** A már létezőket cseréld le; ne másik almappába kerüljenek.
4. A commit címe lehet: `V3 – Számország varázsösvénye`.
5. Kattints a **Commit changes** gombra (branch: `main`).
6. Nyisd meg a játékot: https://hajgre.github.io/szammester-1000/
7. Ha a korábbi változat jelenik meg, frissíts **Ctrl + F5**-tel (Mac: Cmd + Shift + R), vagy nyisd meg inkognitóablakban. A V3 `index.html` fájlja `?v=3` verziójelölést ad a CSS- és JS-fájlnak, hogy csökkenjen a korábbi fájlok betöltésének esélye.

A GitHub Pages közzététele néhány percet is igénybe vehet. A `Settings → Pages` részben ellenőrizhető az állapot; hibás feltöltés esetén nézd meg az `Actions` fület.

## Fájlok

- `index.html`: a kezdő HTML-oldal, két további fájl betöltésével.
- `style.css`: a teljes látvány és a társasjátéktábla stílusa, animációi.
- `app.js`: a feladatok, a pálya, a bábu, a visszajelzés és a mentés.
- `README.md`: ez az útmutató.

## Fontos a mentésről

A játék a böngésző `localStorage` tárhelyét használja. A haladás és a választott bábu **ugyanabban a böngészőben és eszközön** marad meg. Másik telefonon vagy másik böngészőben új mentés indulhat. A böngésző adatainak törlése a haladás törlését is okozhatja.

A játék nem kér és nem küld el személyes adatokat. A nyilvános GitHub-tárolóba ne tölts fel gyermekekhez köthető személyes információkat.

## Fejlesztői megjegyzés

A projekt statikus HTML/CSS/JavaScript webalkalmazás; GitHub Pages alatt külön szerver nélkül működik. A feladatok generálását a `makeQuestion` függvény és a hozzá kapcsolódó matematikai függvények végzik. A térkép és bábu a `renderBoard()` függvényben készül, és a `renderAdventureMap()` jeleníti meg.
