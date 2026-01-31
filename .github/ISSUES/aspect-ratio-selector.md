# Feature Request: Aspect Ratio Selector

## Summary

Add an aspect ratio selector to the Stil-Synchronisator Encoder that allows users to choose the output image dimensions before generation, supporting common formats for different use cases.

---

## Problem Statement

Currently, the Encoder generates images with a fixed aspect ratio (16:9). However, users need different formats for various purposes:

- **1:1** - Album covers, social media profile pictures
- **9:16** - Instagram Stories, TikTok, mobile wallpapers
- **4:3** - Traditional photo format
- **16:9** - YouTube thumbnails, desktop wallpapers
- **21:9** - Ultrawide/cinematic banners

Forcing a single aspect ratio limits the feature's utility.

---

## Proposed Solution

### UI Design

Add a selector above or below the "Transcode" button in the Encoder panel:

```
┌─────────────────────────────────────────┐
│  ENCODER - Sound Transformation         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   MASTER_PROMPT_INPUT           │   │
│  │   "Melodic techno, 128 BPM..."  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Aspect Ratio:                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ 1:1 │ │ 4:3 │ │16:9 │ │ 9:16│       │
│  │  ■  │ │ ▬  │ │ ▬▬ │ │  ▮  │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│     □       □       ●       □          │
│                                         │
│           [ ⬇ Transcode ]              │
│                                         │
└─────────────────────────────────────────┘
```

### Aspect Ratio Options

| Ratio | Dimensions | Use Case |
|-------|------------|----------|
| 1:1 | 1024x1024 | Album art, social avatars |
| 4:3 | 1024x768 | Traditional photos |
| 16:9 | 1024x576 | Widescreen, YouTube |
| 9:16 | 576x1024 | Stories, mobile |
| 21:9 | 1024x439 | Ultrawide, banners |

### Technical Implementation

#### HTML Addition

```html
<!-- Aspect Ratio Selector -->
<div class="flex items-center gap-2 mb-4">
    <span class="text-xs text-neutral-500 uppercase">Format:</span>
    <div class="flex gap-1" id="aspect-ratio-selector">
        <button data-ratio="1:1" class="aspect-btn" title="Quadrat (1:1)">
            <svg><!-- Square icon --></svg>
        </button>
        <button data-ratio="4:3" class="aspect-btn" title="Standard (4:3)">
            <svg><!-- 4:3 icon --></svg>
        </button>
        <button data-ratio="16:9" class="aspect-btn active" title="Breitbild (16:9)">
            <svg><!-- 16:9 icon --></svg>
        </button>
        <button data-ratio="9:16" class="aspect-btn" title="Hochformat (9:16)">
            <svg><!-- Portrait icon --></svg>
        </button>
    </div>
</div>
```

#### JavaScript Logic

```javascript
// In setupStyleSync()
let selectedAspectRatio = '16:9'; // Default

const aspectButtons = document.querySelectorAll('.aspect-btn');
aspectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        aspectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAspectRatio = btn.dataset.ratio;
    });
});

// Pass to callFalAPI
const imageUrl = await callFalAPI(visualPrompt, { aspectRatio: selectedAspectRatio });
```

#### API Integration

Update `callFalAPI` in `api.js` to accept aspect ratio:

```javascript
// In buildPayloads()
const fluxProPayload = {
    prompt,
    image_size: aspectRatioToSize(options.aspectRatio || '16:9'),
    // ... other params
};

function aspectRatioToSize(ratio) {
    const sizes = {
        '1:1': 'square',
        '4:3': 'landscape_4_3',
        '16:9': 'landscape_16_9',
        '9:16': 'portrait_16_9',
        '21:9': { width: 1024, height: 439 }
    };
    return sizes[ratio] || 'landscape_16_9';
}
```

---

## Acceptance Criteria

- [ ] Aspect ratio selector visible in Encoder panel
- [ ] 16:9 selected by default (current behavior)
- [ ] Visual feedback shows selected ratio
- [ ] Icons clearly represent each ratio
- [ ] Selection persists during session
- [ ] Generated image matches selected ratio
- [ ] Output container adapts to show non-standard ratios correctly
- [ ] Tooltips explain each option (in German)
- [ ] Mobile-friendly button sizing

---

## Labels

- `enhancement`
- `feature-request`
- `stil-synchronisator`
- `ui`

---

## Priority

**Medium** - Common request that expands feature utility.

---

## Estimated Effort

**Small** - Primarily UI changes with minor API parameter updates.
