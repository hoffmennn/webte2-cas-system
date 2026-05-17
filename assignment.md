# WEBTE2 — Záverečné zadanie · LS 2025/2026

## 1. Všeobecné pokyny

- Projekty sa budú robiť v **dvojčlenných tímoch**, pričom je potrebné, aby ste si úlohy rozdelili rovnomerne.
- Zadanie je potrebné odovzdať do prostredia **MS Teams** najneskôr do **21. 5. 2026 (23:55)** jedným členom tímu.
  Neskoršie odovzdanie projektu bude penalizované **2 bodmi za každý deň omeškania** na každého člena tímu
  (t.j. 4 body/deň pri dvojčlennom tíme).
- Pre účely ukončenia predmetu je potrebné mať celý projekt umiestnený **na školskom serveri**.
- Pri odovzdávaní do MS Teams nahrajte **ZIP archív s vypracovaným zadaním** a **adresu stránky** na školskom serveri.
- Stránka musí byť optimalizovaná pre **Chrome a Firefox**.
- **Odporúčanie:** pracujte s Internetom, inšpirujte sa rôznymi stránkami. Ak však prídeme na
  **plagiátorstvo** v rozsahu viac ako 10 riadkov kódu (cca 200 znakov), tak to automaticky
  znamená **0 bodov** zo záverečného zadania, čo má za následok známku **FX** z predmetu.
- Ak pri prípadnej obhajobe člen tímu nebude vedieť zodpovedať na otázku, ako naprogramoval danú časť, považuje sa to za **nesplnené**.
- Pekne vypracované projekty, resp. ich časti, môžu byť zverejnené verejnosti.

---

## 2. Zadanie

Hlavnou úlohou projektu bude spojazdniť cez **REST API** niektorý z voľne dostupných CAS
(Computer Aided System), ktorý si je potrebné nainštalovať na niektorý zo serverov členov
tímu. Odporúčaný je voľne dostupný softvér **Octave**, ale v prípade záujmu to môže byť aj iná
alternatíva (Maxima, Python riešenia, atď.).

V prípade, že použijete nejaké API, ktoré nájdete na Internete a ktoré si prispôsobíte pre svoje
účely, treba túto skutočnosť uviesť v technickej dokumentácii, inak sa to bude považovať za
plagiátorstvo. Funkčnosť Octave príkazov si je možné na začiatku vyskúšať bez inštalácie tohto
prostredia na stránke: <https://octave-online.net/>.

Okrem API bude potrebné vytvoriť aj **frontend**, ktorý bude umožňovať vykonávanie užívateľom
zadaných výpočtov a vizualizáciu grafov a animácií využívajúcich výpočty na backende.
Nezabudnite na to, že sa hodnotí aj grafický dizajn vytvorenej aplikácie, vhodne navrhnuté
členenie, intuitívnosť orientácie v prostredí. Pamätať by ste mali aj na zabezpečenie celej
aplikácie. Na vypracovanie projektu je možné použiť aj PHP framework (backend) alebo JS
framework (frontend).

### Požiadavky na projekt

1. Pri práci na projekte je nevyhnutné používať **verzionovací systém**, napr. github, gitlab,
   bitbucket. Vo VCS systéme musí byť vidieť prácu každého člena tímu.

2. Vytvorená webstránka bude navrhnutá ako **dvojjazyčná** (slovenčina, angličtina).

   > Pozn.: ak sa prepínate medzi jazykmi, musíte zostať na tej istej podstránke, ako ste boli
   > pred prepnutím, a nie vrátiť sa na domovskú stránku aplikácie.

3. Celá stránka bude **responzívna** vrátane použitej grafiky.

4. **REST API** k nainštalovanému CAS je potrebné vytvoriť v takom rozsahu, aby ste
   dokázali realizovať základné aritmetické operácie a spustiť príkazy pre získanie numerických
   hodnôt potrebných na animáciu objektu a vykresľovanie grafu. V prípade, že výpočet
   hodnôt bude pre tieto činnosti príliš rýchly, spomaľte ho na strane servera. Prípadný
   **koeficient spomalenia** definujte v konfiguračnom súbore.

5. Jednotlivé numerické výstupy z CAS budú používateľovi poskytované na základe **autentifikačného
   tokenu alebo API kľúča**, ktorý bude definovaný v konfiguračnom súbore. Bez platného
   tokenu/API kľúča nebude prístup k službe umožnený.

6. Požiadavky na výpočet budú do CAS zasielané dvoma spôsobmi: z animácie a z **formulára**
   na web stránke (1× textarea na zadanie príkazu umožňujúca zvýraznenie syntaxe (*syntax
   highlighting*), 1× tlačidlo na odoslanie požiadavky, 1× output na výpis výstupu). V
   prípade, že si pri výpočte vytvorím pomocnú premennú, je potrebné ju **uchovať**, aby s
   ňou bolo možné pracovať pri ďalších výpočtoch. T.j. bude sa dať realizovať nasledovný výpočet:

   ```octave
   a = 1 + 1
   a + 2
   ```

7. Súčasťou projektu bude vytvoriť **dve animácie dynamického systému** a k nim priebežne
   generovaný graf sledovaných výstupov na základe užívateľom definovaných parametrov:

   - **inverzné kyvadlo** —
     <http://ctms.engin.umich.edu/CTMS/index.php?example=InvertedPendulum&section=SystemModeling>
   - **gulička na tyči** —
     <http://ctms.engin.umich.edu/CTMS/index.php?example=BallBeam&section=SystemModeling>

   Animácia (2D alebo 3D) a vykresľovanie grafu musí byť **synchronizované**.
   Návod na realizáciu výpočtov k animáciám nájdete v priloženom pdf súbore.

8. Všetky požiadavky zasielané do CAS je potrebné **logovať** (dátum a čas, odoslané príkazy,
   info o korektnosti/chybe).

9. Požiadavky z predchádzajúceho bodu umožnite **exportovať do CSV súboru**.

10. Na stránke je treba popísať vytvorené API. Vyžaduje sa dokumentácia podľa štandardu
    **OpenAPI**. V dokumentácii API musia byť uvedené všetky metódy backendu.
    Dokumentáciu exportujte aj do **pdf súboru**, v ktorom bude v hlavičke alebo pätke (je
    možná aj kombinácia) napísaný názov dokumentu a číslovanie strán spolu s celkovým
    počtom strán v dokumente (napr. v tvare `5/8`). V prípade zmeny v návode na stránke sa
    táto zmena musí odraziť aj vo vygenerovanom PDF súbore (t.j. súbor je treba generovať
    **dynamicky**).

11. Na stránke urobte **štatistiku** o tom, ktorá z animácií bola koľkokrát využívaná. Po
    rozkliknutí uveďte aj detaily o ich používaní, t.j. kedy bola ktorá animácia použitá a
    odkiaľ sa daný používateľ prihlásil (mesto, štát). Používatelia budú anonymne identifikovaní
    cez **unikátny token v cookies**. Aby sa predišlo skresleniu dát, opätovné spustenie animácie
    tým istým používateľom sa do celkovej štatistiky započíta najskôr po uplynutí **10 minút**.
    Dĺžku tohto intervalu špecifikujte v konfiguračnom súbore.

12. Aplikáciu **kontajnerizujte pomocou Dockeru**.

13. Vytvorte **video**, ktorým budete dokumentovať celú funkcionalitu vytvorenej aplikácie.
    Ak niektorá funkcionalita nebude ukázaná na videu, tak ju môžeme považovať za nespravenú.

---

## 3. Ďalšie požiadavky

Odovzdanie projektu sa robí cez **MS Teams** a je tam potrebné vložiť:

- **technickú dokumentáciu** (rovnaké požiadavky ako pri iných zadaniach), nezabudnite v nej uviesť:
  - Všetky **zmeny konfigurácie servera**, dodatočne inštalované programy, balíky, knižnice
    s ich prípadnou konfiguráciou. V prípade, že sa inštalácia nebude dať zreplikovať
    podľa priloženej dokumentácie, je považovaná za nefunkčnú.
  - **rozdelenie úloh** medzi jednotlivých členov tímu,
  - **v prípade neurobenia niektorej z úloh, to treba jasne vyznačiť**.
- **samotnú aplikáciu** ako:
  - spakované súbory vrátane **konfiguračného súboru**, v ktorom je potrebné definovať
    všetky nastavenia,
  - **sql súbor** pre naplnenie databázy,
  - **Dockerfile** a/alebo **Docker Compose** súbor.
- **vytvorené video**.

Okrem toho pri odovzdávaní je potrebné uviesť:

- adresu umiestnenia, aby sme vedeli, pod koho menom máme projekt hľadať,
- adresu projektu vo verzionovacom systéme.

Zazipované súbory samotnej aplikácie (bez videa) odovzdajte aj na
<https://node11.webte.fei.stuba.sk> do časti **záverečné zadanie**.

---

## 4. Návrh hodnotenia

| Úlohy | Body |
| --- | ---: |
| dvojjazyčnosť | 2 |
| backend aplikácie, API vrátane tokenu/API kľúča | 12 |
| funkčný a responzívny frontend (animácie vrátane koeficientu spomalenia, grafy, interakcia s CAS) | 12 |
| log-y, export do csv | 5 |
| dynamicky generované pdf s návodom | 5 |
| štatistika | 5 |
| docker balíček | 7 |
| používanie verzionovacieho systému všetkými členmi tímu <sup>1</sup> | 2 |
| finalizácia aplikácie <sup>2</sup> | 5 |
| video | 5 |
| **Spolu** | **60** |

<sup>1</sup> každý člen musí mať minimálne **3 zmysluplné commit-y**

<sup>2</sup> grafický layout, responzívnosť, štruktúra, orientácia v aplikácii, voľba DB tabuliek, úplnosť odovzdania projektu, …
