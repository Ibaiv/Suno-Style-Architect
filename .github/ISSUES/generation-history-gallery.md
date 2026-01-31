# Feature Request: Generation History/Gallery

## Summary

Add a persistent history/gallery feature to the Stil-Synchronisator that saves all generated images locally, allowing users to browse, re-use, and manage their past generations.

---

## Problem Statement

Currently, when a user generates an image via the Encoder, the result is lost as soon as they:
- Close the modal
- Generate a new image
- Refresh the page

Users who want to compare multiple generations or revisit a previous result have no way to do so. This leads to:
- Frustration when accidentally overwriting a good generation
- Manual screenshots/downloads to preserve results
- Inability to iterate and compare different prompts

---

## Proposed Solution

### User Flow

1. Every generated image is automatically saved to local storage (IndexedDB)
2. A "History" button/tab appears in the Stil-Synchronisator modal
3. Clicking opens a gallery view showing:
   - Thumbnail grid of past generations
   - Timestamp for each
   - Original music prompt used
4. User can:
   - Click to view full-size
   - Re-load into the main view
   - Delete individual items
   - Clear all history

### UI Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Stil-Synchronisator                    [History 📚] [Close X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     HISTORY VIEW                         │   │
│  │                                                          │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │   │
│  │  │ img1 │  │ img2 │  │ img3 │  │ img4 │  │ img5 │       │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘       │   │
│  │  12:45     12:30     11:15     10:00     09:30          │   │
│  │                                                          │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                           │   │
│  │  │ img6 │  │ img7 │  │ img8 │     [Clear All 🗑️]        │   │
│  │  └──────┘  └──────┘  └──────┘                           │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Implementation

#### Data Structure

```javascript
// IndexedDB Schema
const historyItem = {
    id: 'uuid-v4',
    timestamp: Date.now(),
    imageBlob: Blob,           // Stored image data
    thumbnailBlob: Blob,       // Smaller preview
    musicPrompt: string,       // Original input prompt
    visualPrompt: string,      // Generated visual description
    model: string,             // FAL model used
    aspectRatio: string        // e.g., "16:9"
};
```

#### Core Functions

```javascript
// history-manager.js
class StyleSyncHistory {
    constructor() {
        this.dbName = 'StyleSyncHistory';
        this.storeName = 'generations';
        this.maxItems = 50; // Limit to prevent storage bloat
    }
    
    async init() { /* Open IndexedDB */ }
    async save(item) { /* Save new generation */ }
    async getAll() { /* Return all items, newest first */ }
    async delete(id) { /* Remove single item */ }
    async clear() { /* Remove all items */ }
    async getItem(id) { /* Get single item by ID */ }
}
```

#### Storage Considerations

- Use IndexedDB for blob storage (localStorage has 5MB limit)
- Generate thumbnails (200x200) for gallery view
- Implement LRU eviction when exceeding 50 items
- Estimated storage per item: ~500KB (compressed JPEG)
- Max storage footprint: ~25MB

---

## Acceptance Criteria

- [ ] Images are automatically saved after successful generation
- [ ] History persists across page refreshes
- [ ] Gallery displays thumbnails in a responsive grid
- [ ] Clicking thumbnail shows full image with metadata
- [ ] "Use this image" loads it back into main view
- [ ] "Delete" removes individual items with confirmation
- [ ] "Clear All" removes entire history with confirmation
- [ ] Oldest items are auto-deleted when limit (50) is reached
- [ ] Works offline (viewing cached items)
- [ ] German UI text throughout

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `storage`

---

## Priority

**High** - Core UX improvement that significantly enhances workflow.

---

## Estimated Effort

**Medium-Large** - Requires IndexedDB setup, new UI components, and state management.
