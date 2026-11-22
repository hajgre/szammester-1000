# Számmester 1000 – V5: Kincsvadászat 🎁🎮

Magyar nyelvű matematikai gyakorlójáték **1000-es számkörben**, GitHub Pages-en futtatható, Roblox-hangulatú, **saját készítésű blokkvilággal**. Nem hivatalos Roblox-játék, és nem Roblox Studio-projekt. A játékhoz nincs szükség szerverre, fiókra vagy előfizetésre.

## A V5 újdonságai

- **7 birodalom, 35 mező**, és az eredeti hét matematikai terület: számsorrend, helyi érték, alaki érték, valódi érték, számszomszédok, beváltások és számegyenes. A **nyolcadik, vegyes gyakorlómód** is megmarad.
- **14 kincsesláda és 7 meglepetésmező**: két kincsesláda és egy meglepetés birodalmanként. A jutalmat egy külön felületen lehet felfedni.
- **Virtuális érmék:** új mezőnként 2 érme, a ládákban 12 vagy 18 érme, a meglepetésekben további érmék, az első főellenfél-győzelemért 25 érme. Egy adott jutalom egyszer gyűjthető be minden nehézségi szinten, ezért nem lehet újrajátszással végtelen érmét gyűjteni.
- **7 főellenfél**, birodalmonként egy: az öt korábbi pályafeladat után két új, azonos témájú matematikai feladat. Nincs időkorlát, a hibákat újra lehet próbálni.
- **7 jelvény** a főellenfelekért, továbbá **Ezüst kalandor** (3 jelvény) és **Arany számmester** (7 jelvény) mérföldkő.
- **Hangeffektek:** jó és rossz válasz, felfedezés, kincs, harc, győzelem. A hangok **alapból ki vannak kapcsolva**; a 🔇 / 🔊 gombbal szabályozhatók. A hangok böngészőben, programból készülnek, nem igényelnek hangfájlt.
- **Győzelmi animációk** és animált, blokkos főellenfélfigurák. Ha a felhasználó csökkentett mozgást kér a rendszerben, az animációk leállnak.

## Hogyan lehet kipróbálni?

1. Bontsd ki a ZIP-et.
2. Nyisd meg a kibontott mappa `index.html` fájlját a böngésződben.
3. Kattints az **„Induljon a kaland!”** gombra.
4. Válassz nehézséget és hőst. A különleges mezőkön a feladat után felfedhető a jutalom.
5. Ha szeretnél hangokat, a térképen kapcsold be a **„Hang: ki”** gombbal.

## GitHub-frissítés lépésről lépésre

1. Nyisd meg a meglévő tárolót: <https://github.com/hajgre/szammester-1000>
2. Menj a **Code** fülre, ott **Add file → Upload files**.
3. A ZIP-ből **kibontva** töltsd fel a tároló **főmappájába** ezt a négy fájlt: `index.html`, `style.css`, `app.js`, `README.md`.
4. A négy régi, azonos nevű fájl lecserélése a cél. Ne magát a ZIP-et töltsd fel, ne új almappába tedd!
5. A commit leírása lehet: `V5 – kincsvadászat, érmék, jelvények és főellenfelek`.
6. Válaszd a **Commit changes** gombot, a `main` ágra mentve.
7. Néhány perc múlva ellenőrizd: <https://hajgre.github.io/szammester-1000/>
8. Régi kinézetnél próbálj **Ctrl + F5**-öt vagy inkognitóablakot. Az `index.html` a CSS-t és JavaScriptet `?v=5` végződéssel tölti be a gyorsítótár frissítése érdekében.

## Korábbi mentések megőrzése

**A V1–V4 kalandmentéseket nem töröljük és nem alakítjuk át!** A korábban teljesített birodalmak továbbra is nyitva maradnak. Ha egy birodalmat már befejeztél V4-ben, **külön kihívhatod a főellenfelét** a térképen. A korábban bejárt pályán, de még nem átvett V5-ös ládákra és meglepetésmezőkre is kattinthatsz. A félbehagyott V4-es feladatok folytathatók.

A régi kulcsok változatlanok:

- `szammester1000_adventure_v1_0`, `_1`, `_2`: birodalomeredmények és folytatható játékmenet;
- `szammester1000_board_hero_v3`: választott karakter;
- `szammester1000_<játékmód>_<szint>`: a gyakorló játékok rekordjai.

Új kulcsok:

- `szammester1000_rewards_v5_0`, `_1`, `_2`: érmék, kincsek, jelvények és félbehagyott főellenfélcsata nehézségi szintenként;
- `szammester1000_sound_v5`: hang be/ki.

**Fontos:** mindez a saját böngésző `localStorage` tárhelyében van, az adott webcímen. Másik eszközön vagy böngészőben nem szinkronizálódik; böngészőadatok törlésekor elveszhet. A helyben megnyitott `file://` verzió mentése nem feltétlenül látszik a GitHub Pages webcímen. A játék nem kér és nem küld tanulói személyes adatokat.

## Fájlok

- `index.html`: kezdő HTML és a `?v=5` verziózott hivatkozások;
- `style.css`: Roblox-hangulatú saját blokkvilág, kincsek, jelvények, főellenfelek és animációk;
- `app.js`: az eredeti feladatgenerálás, játékmenet, mentés, új jutalmak és harcok;
- `README.md`: ez az útmutató.

## Ellenőrzés

A V5 automatizált Chromium böngészőteszten ment át: 35 kalandfeladat, 14 főellenfélfeladat, 21 jutalommező, minden jelvény, mentés-visszatöltés, ismételt jutalom tiltása, három szint külön mentése, V4-ből átvett befejezett pályák, V4 félbehagyott játék, V5 félbehagyott főellenfél, a korábbi gyakorlómód és a mobilos görgetés.

---

💚 *Számmester 1000 – gyakorlás játékosan, a saját tempódban.*
