# Storybook Screenshot Gallery — Template

Neutrales Template, um eine beliebige Web-App per Playwright-Screenshots zu
dokumentieren und die Bilder als statische Storybook-Galerie zu deployen.
Der gesamte Build läuft in Docker-Containern — Host-Abhängigkeit ist nur
`docker` und `bash`.

## Zielbild

- **automatisch generiert** — keine manuellen Screenshots
- **reproduzierbar** — identisch auf jedem Rechner, identisch in CI
- **ohne Backend** — App läuft in einem Fixture-/Showcase-Modus
- **statisch deploybar** — FTPS-Mirror auf beliebigen Webspace
- **framework-agnostisch** — Angular, Vue, React, Next, plain HTML …

## Prinzipien

### 1. Screenshot-first, nicht Component-first

Statt einzelne Components isoliert zu rendern, fahren Playwright-Specs **echte
End-User-Flows** und legen an definierten Punkten per `page.screenshot()` PNGs
ab. Storybook rendert sie nur als HTML-Grid. Vorteil: keine Pflege doppelter
Mock-Zustände (Component-Story vs. echter Flow), neue Features landen
automatisch in der Galerie.

### 2. Fixture-Modus: App gegen statische Daten

Die App kennt einen zusätzlichen Build-Modus, der alle HTTP-Aufrufe auf
statische JSON-Fixtures umleitet (Angular `--configuration=showcase`, Vite
`MODE=showcase`, Next `MSW`-Handler …). Playwright fährt diesen Modus —
**ohne** Datenbank, Auth-Provider oder Backend. Der Build bleibt klein und
schnell. Umschalten per ENV-Variable:

```bash
PW_SERVER_CMD="npm run start:showcase"
PW_BASE_URL="http://localhost:4200"
```

### 3. Nummerierte Szenario-Gruppen

Specs folgen einer zweistelligen Präfix-Konvention:

```
e2e/scenarios/
├── 01-navigation.spec.ts
├── 02-dashboard.spec.ts
├── 03-klienten.spec.ts
└── …
```

PNG-Dateinamen übernehmen das Präfix (`01a-sidebar-admin.png`). Das Präfix
ist gleichzeitig Sortier-, Gruppierungs- und Navigationsschlüssel in der
Galerie.

### 4. Storybook als statische Galerie

- `staticDirs: [{ from: '../e2e/screenshots/scenarios', to: '/scenarios' }]`
  mountet die PNGs in den Storybook-Build.
- Bild-URLs werden über `new URL(…, document.baseURI)` aufgelöst, damit die
  Galerie auch unter einem Deploy-Präfix (z.B. `/my-gallery/`) funktioniert —
  absolute Pfade (`/scenarios/…`) würden das Präfix umgehen und 404 liefern.
- Fehlende Screenshots werden durch einen Inline-Platzhalter ersetzt. Die
  Galerie rendert also auch dann, wenn einzelne Specs geflakt sind.

### 5. Alles in Docker — keine Host-Abhängigkeiten

Zwei Stages, zwei Images:

| Stage  | Image                                        | Aufgabe                                  |
|--------|----------------------------------------------|------------------------------------------|
| Build  | `mcr.microsoft.com/playwright:vX.Y.Z-jammy`  | `npm ci`, Playwright, `storybook build`  |
| Upload | `alpine:3.20` + `apk add lftp`               | FTPS-Mirror zum Webspace                 |

Das Playwright-Image ist **auf die exakte `@playwright/test`-Version im
`package.json` gepinnt** — so kann keine Browser/Driver-Drift zwischen lokalem
Run und CI auftreten.

### 6. Fehler sichtbar machen, nicht verstecken

Der Build toleriert einzelne Playwright-Fehler bewusst (`|| echo …`), bricht
aber **hart ab**, wenn gar kein Screenshot produziert wurde (`exit 3`). Damit
wird die Galerie nie mit stillen Null-Resultaten überschrieben. Ebenso wird
das Screenshot-Verzeichnis **vor** jedem Run gelöscht, damit keine stale PNGs
aus vorherigen Runs die aktuelle Galerie verunreinigen.

### 7. Lokaler Run = CI-Run

[scripts/deploy.sh](scripts/deploy.sh) ist ein 1:1-Ersatz für den
GitHub-Actions-Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
Credentials kommen aus einer gitignorierten `scripts/.env`-Datei, niemals
aus der Shell-History.

### 8. Deploy-Ziel ist dumm und statisch

Zielstruktur auf dem Webspace:

```
public_html/
├── .htaccess              ← Basic-Auth-Schutz
└── my-gallery/            ← Spiegel von storybook-static/
```

Kein PHP, kein Node, keine DB auf dem Host. Basic-Auth via `.htaccess` reicht
als Zugriffsschutz für interne Review-Zwecke. FTPS ist verschlüsselt und für
statische Mirrors ausreichend (`lftp mirror -R`).

## Quickstart

```bash
# 1) Install
npm ci
npx playwright install --with-deps chromium

# 2) Dev-Run auf dem Host (optional, zum Iterieren)
npm run dev                 # serves demo app on :4200
npm run e2e:scenarios       # produces PNGs in e2e/screenshots/scenarios/
npm run storybook           # serves gallery on :6006

# 3) Docker-Build (CI-äquivalent)
./scripts/deploy.sh --build-only

# 4) Docker-Build + FTPS-Deploy
cp scripts/.env.example scripts/.env
$EDITOR scripts/.env        # fill FTP_HOST / FTP_USERNAME / FTP_PASSWORD
./scripts/deploy.sh
```

Ergebnis: Galerie unter `https://<FTP_HOST>/<DEPLOY_PATH>/`.

## Ablauf für neue Szenarien

1. **Spec schreiben** — `e2e/scenarios/NN-bereich.spec.ts` anlegen, mit
   `await page.screenshot({ path: 'e2e/screenshots/scenarios/NN-bereich/Na.png' })`
   die gewünschten Zustände festhalten.
2. **Galerie-Eintrag ergänzen** — PNG-Namen in `ALL_SCREENSHOTS` in
   [stories/gallery.stories.ts](stories/gallery.stories.ts) aufnehmen.
3. **Lokal prüfen** — `npm run e2e:scenarios && npm run storybook`.
4. **Deployen** — `./scripts/deploy.sh` oder CI-Workflow mergen.

## Anpassung auf dein Projekt

- **Fixture-Modus:** setze `PW_SERVER_CMD` in
  [playwright.config.ts](playwright.config.ts) und
  [scripts/deploy.sh](scripts/deploy.sh) auf den Command, der deine App
  backend-frei startet.
- **Deploy-Ziel:** `DEPLOY_PATH` in `scripts/.env` auf den Ziel-Unterordner
  auf dem Webspace setzen.
- **Playwright-Version:** Wenn du `@playwright/test` in `package.json`
  hochziehst, **auch** `PLAYWRIGHT_IMAGE` in
  [scripts/deploy.sh](scripts/deploy.sh) und CI-Workflow auf den gleichen
  Tag anheben.

## Verzeichnisstruktur

```
.
├── .storybook/main.ts            # Storybook-Config (staticDirs → PNGs)
├── stories/gallery.stories.ts    # Galerie-Rendering (HTML-Grid über PNGs)
├── e2e/
│   ├── scenarios/*.spec.ts       # Playwright-Specs (screenshot-first)
│   └── screenshots/scenarios/    # gitignored PNG-Output
├── src/                          # Minimal-Demo-App (ersetzen durch deine App)
├── scripts/
│   ├── deploy.sh                 # Docker-Build + FTPS-Upload
│   ├── .env.example              # FTPS-Credentials-Template
│   ├── .htaccess                 # Caching-/Deploy-Hints
│   └── robots.txt                # kein Indexing
├── .github/workflows/deploy.yml  # CI-Variante von deploy.sh
├── playwright.config.ts
├── vite.config.ts
└── package.json
```