# 🗺️ Számmester 1000 – Számország hét kapuja (2.0)

A már meglévő Számmester 1000 játék **új, térképes Kaland módja**. A nyolc eredeti gyakorló játékmód is megmaradt.

## Újdonságok

- 7 egymás után feloldható kapu: számsorrend, helyi érték, alaki érték, valódi érték, számszomszédok, beváltások, számegyenes.
- Minden kapuban **5 véletlenszerű feladat**, a korábbi **10 feladatos szabad gyakorlás** változatlanul elérhető.
- 3 nehézség, egymástól független kalandmentésekkel.
- Elsőre helyes megoldásért csillag; hibázás után is teljesíthető a kapu.
- Legjobb csillageredmények, teljesített kapuk, és a félbehagyott küldetés automatikus mentése.
- Mobilon és számítógépen is játszható, nincs időkorlát, nem szükséges felhasználói fiók.

**Fontos:** A mentés kizárólag a böngésző helyi tárhelyére (`localStorage`) történik. Másik eszközre nem kerül át és a böngésző adatainak törlésével elveszhet.

## Hogyan próbáld ki?

Tartsd egy mappában az `index.html`, `style.css`, `app.js` fájlokat. Nyisd meg duplakattintással az `index.html` fájlt. A játék internet nélkül is működik.

## Hogyan frissítsd a GitHub Pages játékodat?

Repo: https://github.com/hajgre/szammester-1000

1. Nyisd meg a repositoryt, majd **Add file → Upload files**.
2. A kicsomagolt csomagból **az `index.html`, `style.css`, `app.js`, `README.md` fájlokat** húzd a feltöltőbe.
3. A GitHub felismeri az egyező fájlneveket, és felülírásra készül.
4. A commit leírása legyen: `Kaland mód: Számország hét kapuja`.
5. Kattints a **Commit changes** gombra.
6. Az új változat a meglévő GitHub Pages linken lesz elérhető: https://hajgre.github.io/szammester-1000/

**Biztonság:** feltöltés előtt megőrizheted az eredeti verziót a GitHub verziótörténetében. A korábbi commitokra bármikor vissza lehet térni. Ha biztosra mennél, külön `kaland-fejlesztes` branchen is kipróbálhatod.

## Fájlok

- `index.html` – az oldal kerete.
- `style.css` – stílusok, kalandtérkép.
- `app.js` – matematikai feladatok, térkép, haladás mentése.
- `README.md` – útmutató.

A játék nem tárol tanulónevet és nem küld adatokat szerverre.
