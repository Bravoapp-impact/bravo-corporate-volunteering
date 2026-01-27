

# Fix: Aggiungere `association_admin` al CHECK constraint della tabella profiles

## Problema Identificato
La registrazione di un utente con ruolo `association_admin` fallisce perché il CHECK constraint `profiles_role_check` sulla tabella `profiles` non include questo valore.

**Constraint attuale:**
```sql
CHECK ((role = ANY (ARRAY['super_admin'::text, 'hr_admin'::text, 'employee'::text])))
```

**Manca:** `association_admin`

## Soluzione

### Database Migration
Aggiornare il CHECK constraint per includere tutti e quattro i ruoli validi:

```sql
-- Rimuovi il constraint esistente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Ricrea il constraint con tutti i ruoli
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['super_admin'::text, 'hr_admin'::text, 'employee'::text, 'association_admin'::text]));
```

## Impatto
- **Nessun dato esistente verrà modificato**
- **Nessuna interruzione di servizio**
- Dopo la migration, la registrazione con codice di accesso per associazioni funzionerà correttamente

## File da Modificare
- Nessun file di codice da modificare
- Solo una database migration SQL

