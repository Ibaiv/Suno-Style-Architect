# Feature Request: Automatic Image Compression for Stil-Synchronisator

## Summary

When a user uploads an image to the "Stil-Synchronisator" decoder that exceeds the 5MB file size limit (fal.ai constraint), instead of just showing an error message, the application should offer an automatic compression dialog allowing the user to resize/compress the image to fit within the limit.

---

## Problem Statement

Currently, when a user attempts to upload an image larger than 5MB, they receive an error message:
> "Die Datei ist zu groß (X MB). Maximale Größe: 5 MB."

This forces the user to:
1. Leave the application
2. Find an external tool to compress their image
3. Return and re-upload

This workflow interruption is frustrating, especially for users with high-resolution photos from modern smartphones (which often exceed 5MB).

---

## Proposed Solution

### User Flow

1. User drops/selects an image > 5MB
2. Instead of an error alert, a **modal dialog** appears with:
   - Preview of the original image (thumbnail)
   - Original file size displayed
   - Compression options (quality slider or presets)
   - Live preview of estimated output size
   - "Komprimieren & Verwenden" (Compress & Use) button
   - "Abbrechen" (Cancel) button
3. Upon compression:
   - Use Canvas API to resize/recompress the image
   - Automatically use the compressed version in the decoder
4. If cancelled, return to the drop zone without changes

### Technical Implementation

#### Core Logic (in `js/features.js`)

```javascript
async function compressImage(file, maxSizeMB = 5, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            let { width, height } = img;
            
            // Progressive resize if needed
            const maxDimension = 2048; // Reasonable max for most use cases
            if (width > maxDimension || height > maxDimension) {
                const ratio = Math.min(maxDimension / width, maxDimension / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(
                (blob) => {
                    if (blob.size <= maxSizeMB * 1024 * 1024) {
                        resolve(blob);
                    } else {
                        // Recursively try with lower quality
                        if (quality > 0.3) {
                            compressImage(file, maxSizeMB, quality - 0.1)
                                .then(resolve)
                                .catch(reject);
                        } else {
                            reject(new Error('Cannot compress below minimum quality'));
                        }
                    }
                },
                'image/jpeg',
                quality
            );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}
```

#### UI Components Needed

1. **Compression Modal** (`index.html`)
   - Glass-panel styled dialog matching app theme
   - Image preview container
   - Quality slider (0.3 - 1.0)
   - Size indicator (original → estimated)
   - Action buttons

2. **CSS Styling** (`css/styles.css`)
   - Modal positioning and backdrop
   - Slider styling consistent with existing sliders
   - Progress/loading indicator during compression

---

## Acceptance Criteria

- [ ] Modal appears when image > 5MB is selected/dropped
- [ ] Original image preview is displayed
- [ ] Quality slider allows adjustment (optional, can use auto-compression)
- [ ] Estimated output size updates in real-time (optional)
- [ ] "Compress & Use" successfully compresses and loads the image
- [ ] "Cancel" returns to empty drop zone
- [ ] Compressed image works correctly with the decoder API
- [ ] Works for both drag-and-drop and file picker uploads
- [ ] Maintains aspect ratio during compression
- [ ] German language for all UI text

---

## Design Mockup (Conceptual)

```
┌─────────────────────────────────────────────────────┐
│                 Bild komprimieren                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│           ┌─────────────────────┐                   │
│           │                     │                   │
│           │   [Image Preview]   │                   │
│           │                     │                   │
│           └─────────────────────┘                   │
│                                                     │
│   Originalgröße:    8.2 MB                         │
│   Geschätzte Größe: ~4.1 MB                        │
│                                                     │
│   Qualität: ═══════════●═══  80%                   │
│                                                     │
│   ┌──────────────────┐  ┌────────────────────────┐ │
│   │    Abbrechen     │  │ Komprimieren & Verwenden│ │
│   └──────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `ux`

---

## Priority

**Medium** - Quality of life improvement that reduces user friction.

---

## Related

- Current 5MB limit implementation in `js/features.js` (`handleFiles` function)
- fal.ai API constraints
