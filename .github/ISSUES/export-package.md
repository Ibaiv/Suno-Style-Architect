# Feature Request: Export Package

## Summary

Add the ability to export a complete package from the Stil-Synchronisator containing the generated image, all associated prompts, metadata, and optionally the source image (for Decoder), bundled as a ZIP file.

---

## Problem Statement

Users who want to save their work externally or share it must:
1. Download the image separately
2. Copy the music prompt manually
3. Copy the visual prompt (if encoder) manually
4. Lose metadata like timestamp, model used, aspect ratio

For professional workflows, documentation, or sharing with collaborators, a complete export package is essential.

---

## Proposed Solution

### Export Contents

| File | Description | Encoder | Decoder |
|------|-------------|---------|---------|
| `image.jpg` | Generated/input image | ✓ | ✓ |
| `music-prompt.txt` | Music prompt text | ✓ (input) | ✓ (output) |
| `visual-prompt.txt` | Visual description | ✓ (output) | ✗ |
| `metadata.json` | All technical details | ✓ | ✓ |
| `source-image.jpg` | Original uploaded image | ✗ | ✓ (optional) |
| `README.md` | Human-readable summary | ✓ | ✓ |

### metadata.json Structure

```json
{
    "version": "1.0",
    "exportDate": "2025-01-31T09:30:00Z",
    "source": "encoder",
    "app": "Suno Style Architect",
    "model": {
        "image": "fal-ai/flux-pro",
        "llm": "openai/gpt-4o-mini"
    },
    "settings": {
        "aspectRatio": "16:9",
        "guidanceScale": 3.5
    },
    "prompts": {
        "musicPrompt": "Melodic techno, 128 BPM...",
        "visualPrompt": "Underground concrete bunker..."
    },
    "image": {
        "filename": "image.jpg",
        "width": 1024,
        "height": 576,
        "format": "JPEG"
    }
}
```

### README.md Template

```markdown
# Stil-Synchronisator Export

**Generated:** 31. Januar 2025, 10:30 Uhr
**Mode:** Encoder (Sound → Image)

## Music Prompt (Input)
> Melodic techno, 128 BPM, deep rolling bassline...

## Visual Prompt (Generated)
> Underground concrete bunker club at 3am, sweat condensing...

## Image
![Generated Image](image.jpg)

## Technical Details
- **Image Model:** Flux Pro
- **Aspect Ratio:** 16:9
- **Dimensions:** 1024 × 576

---
*Exported from Suno Style Architect*
```

### UI Design

#### Export Button Location

```
┌─────────────────────────────────────────┐
│  Generated Image / Decoded Prompt        │
├─────────────────────────────────────────┤
│                                          │
│           [Content Area]                 │
│                                          │
├─────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────────┐   │
│  │Download│ │  Copy  │ │Export ZIP 📦│   │
│  └────────┘ └────────┘ └────────────┘   │
└─────────────────────────────────────────┘
```

### Technical Implementation

#### Using JSZip Library

```javascript
// Add JSZip via CDN or npm
async function exportPackage(data) {
    const zip = new JSZip();
    
    // Add image
    const imageBlob = await fetch(data.imageUrl).then(r => r.blob());
    zip.file('image.jpg', imageBlob);
    
    // Add prompts
    zip.file('music-prompt.txt', data.musicPrompt);
    if (data.visualPrompt) {
        zip.file('visual-prompt.txt', data.visualPrompt);
    }
    
    // Add metadata
    const metadata = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        source: data.source,
        app: 'Suno Style Architect',
        model: {
            image: FAL_MODEL,
            llm: SELECTED_MODEL
        },
        settings: {
            aspectRatio: data.aspectRatio
        },
        prompts: {
            musicPrompt: data.musicPrompt,
            visualPrompt: data.visualPrompt
        }
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));
    
    // Add README
    const readme = generateReadme(data, metadata);
    zip.file('README.md', readme);
    
    // Generate and download
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `stil-sync-${data.source}-${Date.now()}.zip`;
    downloadBlob(content, filename);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
```

---

## Acceptance Criteria

- [ ] "Export ZIP" button visible after generation
- [ ] ZIP contains image file
- [ ] ZIP contains music prompt as text file
- [ ] ZIP contains visual prompt (encoder only)
- [ ] ZIP contains metadata.json with all technical details
- [ ] ZIP contains human-readable README.md
- [ ] Filename includes timestamp and source type
- [ ] Works for both Encoder and Decoder outputs
- [ ] Loading indicator during ZIP generation
- [ ] Error handling if export fails
- [ ] German filename option or localized README

---

## Dependencies

- JSZip library (https://stuk.github.io/jszip/) OR
- Native Compression Streams API (modern browsers only)

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `export`

---

## Priority

**Medium** - Professional feature for power users and documentation.

---

## Estimated Effort

**Small-Medium** - Requires adding JSZip dependency and export logic.
