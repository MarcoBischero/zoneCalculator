# 🚀 Roadmap 2.0: The Evolution to "Killer App"

> "Non una semplice calcolatrice, ma un'estensione del tuo metabolismo."

Questa roadmap traccia l'evoluzione di **ZoneCalculator PRO** verso una piattaforma olistica di *Precision Nutrition*. Abbandoniamo la mera contabilità dei blocchi per abbracciare l'intelligenza artificiale, l'automazione e l'iper-personalizzazione.

## 🌟 I 4 Pilastri Strategici

### 1. 🧬 Hyper-Personalization (Il "Digital Twin" Metabolico)
**Obiettivo:** Trasformare l'app da passiva (l'utente inserisce dati) a proattiva (l'app guida l'utente).
- **Integrazione Wearables:** Connessione con Apple Health / Google Fit per lettura automatica di:
    - Dispendio calorico attivo/a riposo.
    - Qualità del sonno.
    - Attività fisica (tipo e intensità).
- **Dynamic Zone blocks:** Ricalcolo automatico del fabbisogno blocchi giornaliero in base all'attività reale registrata.
    - *Scenario:* Hai corso 10km? Il sistema aggiunge automaticamente 2 blocchi carboidrati e 1 blocco proteine allo spuntino post-workout.
- **Bio-Feedback Loop:** Correlazione tra pasti e performance/benessere (es. "Quando mangi A a colazione, la tua energia pomeridiana cala").

### 2. ⚡ Frictionless Logging (Voice & Vision First)
**Obiettivo:** Abbattere la barriera d'ingresso. Loggare un pasto deve richiedere < 5 secondi.
- **Enhanced Vision AI:**
    - Riconoscimento istantaneo multiprodotto dal vassoio.
    - Stima volumetrica delle porzioni (Smart Portioning).
- **Conversational Logging (Voice):**
    - "Ehi ZoneBot, ho mangiato una frittata di 2 uova e mezza mela." -> *Parsed & Logged*.
    - Niente più form, niente più drag & drop se non necessario.

### 3. 💬 AI Nutritionist Coach ("ZoneMentor")
**Obiettivo:** Un dietista esperto sempre in tasca, disponibile 24/7.
- **Context-Aware Chat:** Non un semplice chatbot standard, ma un assistente che conosce:
    - Il tuo storico pasti.
    - Le tue preferenze e intolleranze.
    - I tuoi obiettivi di peso/performance.
- **Proactive Coaching:**
    - "Marco, vedo che sei basso in proteine oggi. Che ne dici di aggiungere uno yogurt greco stasera?"
    - "Attenzione, questo pasto sbilancia troppo i grassi rispetto alla tua media settimanale."
- **Educational:** Spiegazione del "perché" dietro ai suggerimenti (educazione alimentare continua).

### 4. 🌐 Marketplace Nutrizionisti (The "Creator Economy")
**Obiettivo:** Scalare il lato B2B trasformando i professionisti in *Content Creators*.
- **Store Digitale:** I dietisti possono pubblicare e vendere:
    - Piani alimentari mensili pre-configurati (es. "Piano Crossfit", "Piano Vegetariano Invernale").
    - Ricettari esclusivi "Zone-Perfect".
- **Revenue Share:** Modello di business a commissione per la piattaforma.
- **Verified Badge:** Sistema di accreditamento per nutrizionisti certificati Zona.

---

## 📅 Execution Plan (Draft)

### Phase 1: The AI Coach (Low Hanging Fruit) 🍒
Sfruttiamo l'infrastruttura Gemini già esistente per creare il **ZoneMentor**.
- [ ] Nuovo endpoint `/api/ai/coach`.
- [ ] Interfaccia Chat Flottante (Global).
- [ ] Injection del contesto utente nel prompt di sistema.

### Phase 2: Frictionless Logging 📸
Potenziamento della "Vision" e introduzione della "Voice".
- [ ] Refactoring `/api/vision` per supportare multi-object detection più preciso.
- [ ] Integrazione Web Speech API per input vocale.

### Phase 3: Digital Twin ⌚
Integrazione HealthKit/Google Fit (richiede Mobile App o PWA avanzata).

### Phase 4: Marketplace 🏪
Sviluppo infrastruttura e-commerce e gestione pagamenti (Stripe Connect).
