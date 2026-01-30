
# Piano: Popolamento Dati Demo per Presentazione

## Obiettivo
Creare un set di dati demo realistico per "Azienda Demo" che mostri:
- **Scenario di crescita** dell'engagement aziendale negli ultimi 6 mesi
- Funzionalità complete sia lato **HR Admin** che lato **Employee**
- Dashboard ricche di metriche e grafici SDG

---

## Stato Attuale

| Elemento | Quantità | Note |
|----------|----------|------|
| Azienda Demo | 1 | `666d43e5-d698-46f8-960e-eafb22d4444c` |
| Dipendenti | 4 | Beatrice, Nicole, Luca, Test (HR) |
| Esperienze | 3 | Tutte assegnate ad Azienda Demo |
| Date future | 5 | Febbraio-Aprile 2026 |
| Prenotazioni | 6 | Poche, tutte future |

---

## Piano di Implementazione

### Fase 1: Nuovi Dipendenti Demo (6 profili fittizi)

Creerò 6 nuovi profili dipendente con nomi italiani realistici per simulare un'azienda di ~10 persone:

| Nome | Email | Note |
|------|-------|------|
| Marco Rossi | marco.rossi@demo.it | Alto engagement |
| Giulia Verdi | giulia.verdi@demo.it | Medio engagement |
| Alessandro Conti | alessandro.conti@demo.it | Alto engagement |
| Francesca Romano | francesca.romano@demo.it | Nuovo, da coinvolgere |
| Lorenzo Moretti | lorenzo.moretti@demo.it | Medio engagement |
| Sofia Ricci | sofia.ricci@demo.it | Da coinvolgere |

I nuovi utenti saranno creati in `auth.users` tramite registrazione con codice accesso demo e inseriti nelle tabelle `profiles`, `user_roles` e `user_tenants`.

### Fase 2: Nuove Esperienze (3 aggiuntive)

| Esperienza | Categoria | Associazione | SDGs |
|------------|-----------|--------------|------|
| **Doposcuola per bambini** | Educazione e doposcuola | Il Balzo ETS | SDG 4, SDG 10 |
| **Laboratorio di cucina solidale** | Gastronomia e cucina | La Taska Onlus | SDG 2, SDG 12 |
| **Cura dell'orto comunitario** | Orti e apicoltura | Qiqajon Associazione Francescana | SDG 2, SDG 15, SDG 11 |

Ogni esperienza avrà:
- Descrizione dettagliata
- Immagine (placeholder o URL stock)
- Status: published
- Assegnazione ad Azienda Demo

### Fase 3: Date Storiche (Agosto 2025 - Gennaio 2026)

Creerò ~15-18 date passate distribuite sugli ultimi 6 mesi per simulare lo storico:

| Mese | N° Eventi | Trend | Note |
|------|-----------|-------|------|
| Agosto 2025 | 1 | Inizio | Prima esperienza pilota |
| Settembre 2025 | 2 | Crescita | Primi feedback positivi |
| Ottobre 2025 | 2 | Stabile | |
| Novembre 2025 | 3 | Crescita | Più partecipanti |
| Dicembre 2025 | 3 | Alto | Eventi natalizi |
| Gennaio 2026 | 3 | Alto | Consolidamento |

Ogni data avrà:
- `volunteer_hours`: 2-4 ore
- `beneficiaries_count`: 5-50 (variabile per tipo)
- `max_participants`: 5-15

### Fase 4: Prenotazioni Storiche (~40-50 bookings)

Distribuite per simulare uno **scenario di crescita**:

**Pattern di crescita:**
- Agosto: 2-3 prenotazioni (solo early adopters: Marco, Luca)
- Settembre-Ottobre: 5-6 prenotazioni (si aggiungono Giulia, Nicole)
- Novembre-Dicembre: 10-12 prenotazioni (picco, coinvolti Alessandro, Beatrice)
- Gennaio: 8-10 prenotazioni (consolidamento)

**Dipendenti "da coinvolgere":**
- Francesca Romano: 0 partecipazioni
- Sofia Ricci: 0 partecipazioni

**Top performer:**
- Marco Rossi: ~12 partecipazioni, ~35 ore
- Alessandro Conti: ~10 partecipazioni, ~28 ore

---

## Risultati Attesi nelle Dashboard

### Dashboard HR
- **Dipendenti registrati**: 10
- **Tasso partecipazione**: ~80% (8 su 10 hanno partecipato)
- **Ore volontariato totali**: ~120-150 ore
- **Beneficiari raggiunti**: ~300-400
- **Griglia SDG**: 8-10 SDG colorati con diversi livelli di impatto

### Pagina Dipendenti HR
- **Top performer** visibili in tabella
- **2 dipendenti "Da coinvolgere"** con badge dedicato
- **Filtri funzionanti** per mostrare chi non ha partecipato

### Vista Employee
- **6 esperienze** nel catalogo
- **Storico prenotazioni** nella sezione "Le mie prenotazioni"
- **Pagina Impatto** con statistiche personali e SDG colorati

---

## Dettaglio Tecnico

### Tabelle coinvolte:
1. `auth.users` - Nuovi utenti (richiede signup o admin API)
2. `profiles` - Profili dipendenti
3. `user_roles` - Ruoli (employee)
4. `user_tenants` - Associazione azienda
5. `experiences` - 3 nuove esperienze
6. `experience_companies` - Assegnazioni
7. `experience_dates` - ~20 date (15 passate + 5 esistenti)
8. `bookings` - ~45 prenotazioni confermate

### Note sulla creazione utenti:
Poiché non posso creare utenti in `auth.users` direttamente via SQL, le opzioni sono:
1. **Manuale**: Creare 6 account via registrazione con codice demo
2. **Script**: Usare la Supabase Admin API in un edge function
3. **Workaround**: Creare solo dati nelle tabelle profiles/bookings usando gli ID degli utenti esistenti (simulazione parziale)

**Raccomandazione**: Procederò con l'opzione 3 come prima fase (dati completi per gli utenti esistenti + date storiche), poi ti guiderò nella creazione degli utenti aggiuntivi se necessario.

---

## Prossimi Passi

1. Creare 3 nuove esperienze con descrizioni e SDG
2. Aggiungere ~15 date passate distribuite su 6 mesi
3. Creare ~35-40 prenotazioni storiche per i 4 utenti esistenti
4. Aggiornare `beneficiaries_count` nelle date passate
5. (Opzionale) Guidarti nella creazione dei 6 nuovi utenti demo
