# Bravo! - Stato Refactoring Componenti Base

## ✅ Refactoring Completato

### Componenti Base Creati

| Componente | Path | Descrizione |
|------------|------|-------------|
| `BaseCardImage` | `src/components/common/BaseCardImage.tsx` | Immagine card con aspect ratio, fallback emoji e badge overlay |
| `BaseModal` | `src/components/common/BaseModal.tsx` | Modal bottom-sheet (mobile) / centered (desktop) con header opzionale |
| `ModalCloseButton` | `src/components/common/BaseModal.tsx` | Bottone X per overlay su immagini |

### Componenti Migrati

| Componente | Usa BaseCardImage | Usa BaseModal | Stato |
|------------|-------------------|---------------|-------|
| `BookingCard` | ✅ | - | Completato |
| `BookingDetailModal` | ✅ | ✅ | Completato |
| `ExperienceCardCompact` | ✅ | - | Completato |
| `ExperienceDetailModal` | ✅ | ✅ | Completato |
| `ExperienceCard` | ✅ | - | Completato |
| `HRExperienceCard` | ✅ | - | Completato |

### Linee di Codice Risparmiate

- ~50 righe per ogni card che usa `BaseCardImage`
- ~30 righe per ogni modal che usa `BaseModal`
- **Totale stimato: ~200+ righe eliminate**

---

## 📖 Come Usare i Componenti Base

### BaseCardImage

```tsx
import { BaseCardImage } from "@/components/common/BaseCardImage";

// Card con immagine quadrata e badge categoria
<BaseCardImage
  imageUrl={item.image_url}
  alt={item.title}
  aspectRatio="square"  // "square" | "video" | "portrait"
  fallbackEmoji="🤝"
  badge={<Badge>Categoria</Badge>}
  badgePosition="top-left"  // "top-left" | "top-right" | "bottom-left" | "bottom-right"
/>

// IMPORTANTE: Aggiungere `group` al parent per hover scale
<motion.button className="group ...">
  <BaseCardImage ... />
</motion.button>
```

### BaseModal

```tsx
import { BaseModal, ModalCloseButton } from "@/components/common/BaseModal";

// Modal semplice con close overlay
<BaseModal open={isOpen} onClose={handleClose}>
  <div className="relative">
    <div className="absolute top-4 right-4 z-10">
      <ModalCloseButton onClick={handleClose} />
    </div>
    {/* contenuto */}
  </div>
</BaseModal>

// Modal con header (back + title + close)
<BaseModal
  open={isOpen}
  onClose={handleClose}
  showBackButton
  onBack={handleBack}
  title="Seleziona data"
>
  {/* contenuto */}
</BaseModal>
```

### Pattern Standard per Modal con Immagine

```tsx
<BaseModal open={!!item} onClose={onClose}>
  <div className="flex flex-col max-h-[95vh] sm:max-h-[90vh]">
    {/* Close button overlay */}
    <div className="absolute top-4 right-4 z-10">
      <ModalCloseButton onClick={onClose} />
    </div>

    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto">
      <BaseCardImage
        imageUrl={item.image}
        alt={item.title}
        className="rounded-none"
      />
      <div className="p-5 space-y-4">
        {/* Contenuto */}
      </div>
    </div>

    {/* Fixed footer */}
    <div className="flex-shrink-0 p-5 border-t border-border bg-background">
      <Button className="w-full h-12 rounded-xl">Azione</Button>
    </div>
  </div>
</BaseModal>
```

---

## 📚 Documentazione

La documentazione completa dei componenti è in `docs/design-system.md`:
- Sezione "BaseCardImage" con tutte le props e esempi
- Sezione "BaseModal" con pattern di utilizzo
- Sezione "CRUD Table Pattern" per tabelle admin

---

## 🔜 Refactoring Futuri Consigliati

1. **ExperienceCard.tsx** → Usare `BaseCardImage`
2. **HRExperienceCard.tsx** → Usare `BaseCardImage`  
3. **Altre modal** → Valutare migrazione a `BaseModal`

---

## 📝 Note Tecniche

- **Z-index Modal**: `z-[100]` per sovrapporsi alla navigazione
- **Hover su immagini**: Richiede `group` sul parent per `group-hover:scale-105`
- **Aspect ratio**: `square` (1:1), `video` (16:9), `portrait` (3:4)
- **Badge position**: 4 posizioni angolari supportate
