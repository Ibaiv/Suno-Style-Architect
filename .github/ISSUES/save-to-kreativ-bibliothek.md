# Feature Request: Save to Kreativ-Bibliothek

## Summary

Add the ability to save generated images and their associated prompts from the Stil-Synchronisator directly to the Kreativ-Bibliothek (Creative Library) for future reference and reuse.

---

## Problem Statement

The Stil-Synchronisator generates valuable visual-audio pairings:
- **Encoder**: Music prompt → Visual representation
- **Decoder**: Image → Music prompt interpretation

Currently, there's no way to preserve these pairings within the app's ecosystem. Users must:
- Manually download images
- Copy prompts separately
- Lose the connection between visual and audio concepts

The Kreativ-Bibliothek already exists as a knowledge/reference system but doesn't integrate with generated content.

---

## Proposed Solution

### User Flow

1. After generating an image (Encoder) or music prompt (Decoder):
   - A "Save to Library" button appears
2. Clicking opens a quick-save dialog:
   - Auto-generated title (editable)
   - Category/tag selection
   - Optional notes field
3. Upon save:
   - Content is added to a new "Generierte Werke" (Generated Works) section in Kreativ-Bibliothek
   - Visual preview + prompt pairing is preserved

### UI Design

#### Save Button Location

```
┌─────────────────────────────────────────┐
│         Generated Image                  │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │          [Image]                │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌────────┐ ┌────────┐ ┌──────────────┐ │
│  │Download│ │  Copy  │ │Save to Lib 📚│ │
│  └────────┘ └────────┘ └──────────────┘ │
└─────────────────────────────────────────┘
```

#### Save Dialog

```
┌─────────────────────────────────────────┐
│     In Bibliothek speichern             │
├─────────────────────────────────────────┤
│                                         │
│  Titel:                                 │
│  ┌─────────────────────────────────┐   │
│  │ Melodic Techno Vision - 28.01   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Kategorie:                             │
│  ○ Klanglandschaften                    │
│  ○ Stimmungsbilder                      │
│  ○ Genre-Archetypen                     │
│  ● Eigene Kreationen                    │
│                                         │
│  Tags: [techno] [dark] [club] [+]       │
│                                         │
│  Notizen (optional):                    │
│  ┌─────────────────────────────────┐   │
│  │ Gute Basis für düstere Tracks   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌──────────────┐  ┌────────────────┐  │
│  │  Abbrechen   │  │   Speichern    │  │
│  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────┘
```

### Technical Implementation

#### Data Structure

```javascript
// Library entry for generated content
const generatedWorkEntry = {
    id: 'uuid-v4',
    type: 'generated',              // Distinguishes from static library content
    source: 'encoder' | 'decoder',  // Which flow created it
    timestamp: Date.now(),
    title: string,
    category: string,
    tags: string[],
    notes: string,
    
    // Content
    imageUrl: string,               // Base64 or blob URL
    musicPrompt: string,            // Original or decoded prompt
    visualPrompt: string,           // If encoder, the visual description
    
    // Metadata
    model: string,                  // FAL model used
    aspectRatio: string
};
```

#### Integration Points

1. **Kreativ-Bibliothek UI** (`js/creative_cosmos.js`)
   - Add "Generierte Werke" as a new world/section
   - Display saved items in card format
   - Allow filtering by source (encoder/decoder)

2. **Stil-Synchronisator** (`js/features.js`)
   - Add save button to result overlays
   - Implement save dialog modal
   - Handle local storage write

3. **Storage** (`localStorage` or `IndexedDB`)
   - Store generated works separately from static content
   - Sync with history system if implemented

#### Sample Save Function

```javascript
async function saveToLibrary(content) {
    const entry = {
        id: crypto.randomUUID(),
        type: 'generated',
        source: content.source,
        timestamp: Date.now(),
        title: content.title,
        category: content.category,
        tags: content.tags,
        notes: content.notes,
        imageUrl: content.imageUrl,
        musicPrompt: content.musicPrompt,
        visualPrompt: content.visualPrompt,
        model: FAL_MODEL,
        aspectRatio: content.aspectRatio
    };
    
    const library = JSON.parse(localStorage.getItem('kreativBibliothek') || '[]');
    library.unshift(entry);
    localStorage.setItem('kreativBibliothek', JSON.stringify(library));
    
    showToast('Erfolgreich in Bibliothek gespeichert!');
}
```

---

## Acceptance Criteria

- [ ] "Save to Library" button appears after successful generation
- [ ] Save dialog allows editing title, category, tags, notes
- [ ] Saved content appears in Kreativ-Bibliothek under "Generierte Werke"
- [ ] Library entries show image thumbnail + prompt preview
- [ ] Clicking entry opens full view with all metadata
- [ ] Can delete entries from library
- [ ] Tags are searchable/filterable
- [ ] Works for both Encoder and Decoder outputs
- [ ] German UI text throughout

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `kreativ-bibliothek`
- `integration`

---

## Priority

**High** - Creates lasting value from generated content and integrates features.

---

## Estimated Effort

**Medium** - Requires new UI components and Kreativ-Bibliothek integration.

---

## Dependencies

- Kreativ-Bibliothek must support dynamic/user content (currently static)
