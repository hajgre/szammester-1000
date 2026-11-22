# Számmester 1000 – V9: Karakterbolt, csak a teljes kaland után 🛍️

**Ez a V8 folytatása.** Az összes korábbi funkció (hét birodalom, 35 mező, 7 főellenfél, kincsesládák, érmék, jelvények, hangok, négy kártyapakli, hibaismétlés) és a régi mentési kulcsok megmaradtak.

## Új szabály: előbb teljesítsd a játékot, utána vásárolhatsz

- Az érmék a korábbi módon gyűlnek. **Az első hat birodalomban és a hetedik főellenfél legyőzéséig nem lehet elkölteni őket.**
- A karakterbolt **csak akkor nyílik meg**, ha a választott nehézségi szinten **mind a hét birodalom teljesítve** és **mind a hét főellenfél jelvénye megszerezve**. A kártyapaklik befejezése önmagában nem nyitja meg a boltot.
- A bolt a játék befejezését követően a főoldalon, a térképen és az utolsó győzelem után érhető el.
- A megvásárolt kiegészítők újrajátszásnál is megmaradnak; egy megvett tárgyat utólag korlátlanul, **ingyen** fel/le lehet venni.
- **9 kiegészítő** négy ruházati helyen: sapka/varázskalap/korona, kétféle szemüveg, köpeny/szárnyak, varázspálca/pajzs. Egyszerre helyenként egy viselhető.
- Az öltözékek a térképen látható bábu, a hősválasztó, a győzelmi jelenet és a bolt előnézetének megjelenését módosítják. Játékbeli előnyt nem adnak.
- A vásárlás **csak játékbeli érmével**, valódi pénz nélkül történik. Nincsenek reklámok, személyes adatkérések vagy hálózati szolgáltatások.

## Mentés és biztonság

A pénztárca korábbi `szammester1000_rewards_v5_<szint>` helyi mentéséhez hozzáadtunk egy `shop` mezőt, így a levonás és a megvásárolt tárgyak *együtt, egy mentéssel* íródnak. A kalandmentés, az érmek és a V6 hibagyakorlás mentési kulcsai **nem változtak**. Minden nehézségi szintnek külön pénztárcája és felszerelése van. A V9 új kulcson megőrzi, melyik szint volt utoljára kiválasztva. A mentések **ugyanabban a böngészőben és ugyanazon a GitHub Pages webcímen** érhetők el, nem szinkronizálódnak eszközök között. A böngészőadatok törlése a mentéseket is eltávolíthatja.

## GitHubra telepítés

1. Csomagold ki a ZIP-et, próbáld ki az `index.html` fájlt (a helyben megnyitott fájl nem ugyanazt a mentést látja, mint a GitHub Pages).
2. Nyisd meg: https://github.com/hajgre/szammester-1000
3. A tároló főmappájában **Add file → Upload files**, és cseréld le a négy fájlt: `index.html`, `style.css`, `app.js`, `README.md`.
4. Commit üzenet: `V9 – Karakterbolt a teljes kaland végén`.
5. Az élő cím: https://hajgre.github.io/szammester-1000/ . Ha még a V8 jelenik meg, Ctrl+F5.

## Próbáld ki

A játék közben a karakterbolt szürke/zárolt. Mind a hét kapu és mind a hét főellenfél után feloldódik. Vásárolj egy 35 érmés Kalandorsapkát, válassz másik sapkát, majd vedd vissza ingyen. Ellenőrizd, hogy a pályán megjelenik-e. Minden nehézségi szint külön teljesíthető.
