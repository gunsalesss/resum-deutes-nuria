# Deutes amb la Núria

Web per portar el compte dels diners que es deuen a la Núria (mensualitats de
Movistar, etc.) i les compres que se li fan per compensar-ho, en temps real
(Firebase Firestore) en comptes de la llista de WhatsApp.

## Funcionalitats

- **Mensualitats**: afegeix cada mes (p.ex. Movistar 24€), agrupades per any amb subtotal pendent.
- **Compres**: afegeix compres fetes a la Núria. Si enganxes un link d'Amazon i
  prems "Obtenir dades", s'omplen automàticament el títol i la imatge (el preu
  no es pot obtenir automàticament d'Amazon, cal posar-lo a mà).
- **Romanents**: per afegir deute acumulat d'altres anys o altres conceptes puntuals.
- Cada entrada es pot marcar com a **Saldada** (deixa de comptar al total) o eliminar-se.
- **Resum** en temps real: deute total pendent = mensualitats + romanents − compres.
- Tot es sincronitza a l'instant entre tots els dispositius que tinguin el link obert (Firestore en temps real).

⚠️ **Accés sense login**: qualsevol persona amb la URL pot veure i editar les
dades (decisió explícita, per simplicitat). No comparteixis el link públicament.

## 1. Configurar Firebase

1. Vés a <https://console.firebase.google.com/> i crea un projecte nou (ja que
   `despeses-cadaques` existeix i pertany a un altre projecte, tria un nom nou,
   p.ex. `deutes-nuria`).
2. Dins del projecte, activa **Firestore Database** (mode producció, qualsevol regió propera com `eur3`).
3. Afegeix una app web (icona `</>`) des de "Project settings" → "General" → "Your apps".
4. Copia les claus que et dona (`apiKey`, `authDomain`, `projectId`, etc.).
5. Copia `.env.example` a `.env` i omple els valors:

   ```bash
   cp .env.example .env
   ```

6. Publica les regles de seguretat (ja incloses a `firestore.rules`, accés obert):

   ```bash
   npx firebase-tools login
   npx firebase-tools use --add   # tria el teu projecte i posa'l com a "default"
   npx firebase-tools deploy --only firestore:rules
   ```

## 2. Desenvolupament local

```bash
npm install
npm run dev
```

## Tests

```bash
npm test          # tests unitaris i d'integració (Vitest + Testing Library)
npm run test:watch
```

Els tests no toquen Firestore real: mockegen el SDK de firebase (`firebase/firestore`)
perquè es puguin executar sense xarxa ni emulador. S'executen automàticament
a cada Pull Request (`.github/workflows/test.yml`).

## 3. Importar les dades inicials (opcional, un cop)

Amb el `.env` ja configurat, per carregar les dades que ja teníeu a la llista de WhatsApp:

```bash
npm run seed
```

Això crea: l'acumulat de 2025 (60€), les mensualitats de Movistar de gener a
juliol 2025 (24€/mes) i les 6 compres ja fetes. Revisa-ho i edita/elimina el
que calgui des de la web un cop desplegada.

## 4. Desplegar a Firebase Hosting

```bash
npm run build
npx firebase-tools deploy --only hosting
```

La URL final te la dona la pròpia CLI (del tipus `https://<el-teu-project-id>.web.app`).

## Estructura de dades (Firestore)

Col·lecció `entries`, un document per cada mensualitat/compra/romanent:

```json
{
  "type": "mensualitat | romanent | compra",
  "label": "Movistar",
  "amount": 24,
  "year": 2025,
  "month": 8,
  "link": "https://amazon.es/...",
  "image": "https://...",
  "saldada": false,
  "createdAt": "..."
}
```
