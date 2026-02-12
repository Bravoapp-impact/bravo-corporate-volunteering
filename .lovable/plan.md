

# Piano: Popolare la Dashboard HR di "Azienda Prova"

## Problema Attuale

La dashboard HR e' vuota perche':
- Tutte le date delle esperienze sono nel **futuro** (dal 23 febbraio 2026 in poi)
- La dashboard conta solo le partecipazioni **completate** (date passate con booking confermati)
- I campi `beneficiaries_count` sono tutti a **0**

## Soluzione: Inserire Dati Storici

Creeremo date passate con prenotazioni confermate per simulare attivita' gia' svolta, senza toccare i dati esistenti.

### Dati da inserire

**4 date passate** (dicembre 2025 - febbraio 2026) distribuite su esperienze diverse:

| Esperienza | Data | Ore | Beneficiari | Partecipanti |
|-----------|------|-----|-------------|--------------|
| Doposcuola bambini (SOS Villaggio) | 15 dic 2025 | 3h | 12 | Beatrice, Nicole |
| Prepara il pranzo mensa (Opera Messa) | 10 gen 2026 | 5h | 40 | Beatrice, HR Admin |
| Ridipingi la palestra (Qiqajon) | 25 gen 2026 | 4h | 15 | Nicole, HR Admin |
| Piccoli lavori abitazioni (La Taska) | 5 feb 2026 | 3h | 8 | Beatrice, Nicole, HR Admin |

### Risultato atteso sulla Dashboard

| Metrica | Valore |
|---------|--------|
| Dipendenti Registrati | 3 |
| Tasso di Partecipazione | 100% (3/3 hanno partecipato) |
| Ore di Volontariato | 34h totali (3+5+4+3 x partecipanti) |
| Beneficiari Raggiunti | 75 |
| Partecipazioni Totali | 9 |
| SDGs impattati | SDG 1, 2, 3, 4, 10 |

### Impatto SDG

- **SDG 4** (Istruzione): 10h (doposcuola + palestra)
- **SDG 10** (Disuguaglianze): 6h (doposcuola + abitazioni)
- **SDG 2** (Fame Zero): 10h (mensa)
- **SDG 1** (Poverta'): 19h (mensa + abitazioni)
- **SDG 3** (Salute): 9h (abitazioni)

## Dettaglio Tecnico

### Step 1: Aggiornare `beneficiaries_count` sulle date esistenti future

```sql
-- Aggiorna i beneficiaries_count anche sulle date future per coerenza
UPDATE experience_dates SET beneficiaries_count = 12
WHERE experience_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND company_id = 'f03f1df0-0248-4128-9203-52d985c18d94';
-- (ripetuto per le altre esperienze)
```

### Step 2: Inserire 4 nuove `experience_dates` passate

```sql
INSERT INTO experience_dates (experience_id, company_id, start_datetime, end_datetime,
  max_participants, volunteer_hours, beneficiaries_count)
VALUES
  -- Doposcuola 15 dic 2025
  ('a1b2c3d4-...', 'f03f1df0-...', '2025-12-15 13:00+01', '2025-12-15 16:00+01', 4, 3, 12),
  -- Mensa 10 gen 2026
  ('56566ebb-...', 'f03f1df0-...', '2026-01-10 07:00+01', '2026-01-10 12:00+01', 3, 5, 40),
  -- Palestra 25 gen 2026
  ('c3d4e5f6-...', 'f03f1df0-...', '2026-01-25 12:00+01', '2026-01-25 16:00+01', 10, 4, 15),
  -- Abitazioni 5 feb 2026
  ('b2c3d4e5-...', 'f03f1df0-...', '2026-02-05 13:00+01', '2026-02-05 16:00+01', 3, 3, 8);
```

### Step 3: Inserire 9 `bookings` confermati per le date passate

Distribuiti tra i 3 dipendenti:
- **Beatrice** (9bedd500): doposcuola, mensa, abitazioni = 3 partecipazioni
- **Nicole** (2bac0b59): doposcuola, palestra, abitazioni = 3 partecipazioni
- **HR Admin** (08c46c16): mensa, palestra, abitazioni = 3 partecipazioni

### Step 4: Aggiornare `beneficiaries_count` sulle date future

Impostare valori realistici anche sulle date future gia' esistenti per coerenza.

## Cosa NON viene toccato

- Nessuna modifica a tabelle di struttura (no migration)
- Nessuna modifica a prenotazioni esistenti
- Nessuna modifica al codice frontend
- Solo INSERT di nuove righe e UPDATE di `beneficiaries_count`
