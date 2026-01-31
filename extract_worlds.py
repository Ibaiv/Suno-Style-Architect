"""
Extraction script to convert inline CREATIVE_WORLDS content into separate JSON files.
Run with: python3 extract_worlds.py
Handles both worlds with and without group property, and escaped quotes in names.
"""

import re
import json
import os

SOURCE_FILE = os.path.join(os.path.dirname(__file__), 'js/creative_cosmos.js')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'data/worlds')

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read the source file
with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
    source_content = f.read()

# Find the CREATIVE_WORLDS section boundaries
worlds_start = source_content.find('const CREATIVE_WORLDS = {')
# Find the closing of CREATIVE_WORLDS (after prepared_piano)
search_from = source_content.find('prepared_piano:', worlds_start)
worlds_end = source_content.find('};', search_from) + 2

worlds_section = source_content[worlds_start:worlds_end]

# Unified pattern that captures optionally the group
# Handle escaped quotes in name property with [^']*(?:\\'[^']*)*
# key: { id: '...', (group: '...',)? name: '...', icon: '...', wikiContent: `
unified_pattern = r"(\w+):\s*\{\s*id:\s*'([^']+)',\s*(?:group:\s*'([^']+)',\s*)?name:\s*'((?:[^'\\]|\\.)*)'\s*,\s*icon:\s*'([^']+)',\s*wikiContent:\s*`"

worlds = []
matches = list(re.finditer(unified_pattern, worlds_section))

print(f"Found {len(matches)} world matches in source file.")

for i, match in enumerate(matches):
    groups = match.groups()
    key = groups[0]
    world_id = groups[1]
    group = groups[2]  # May be None if no group
    # Unescape the name
    name = groups[3].replace("\\'", "'")
    icon = groups[4]
    
    # Find the content between the backticks
    content_start = match.end()
    
    # Find the closing backtick
    if i < len(matches) - 1:
        # Content ends before the next world definition
        next_match = matches[i + 1]
        search_area = worlds_section[content_start:next_match.start()]
        end_pattern = r'`\s*\}'
        end_match = re.search(end_pattern, search_area)
        if end_match:
            content = search_area[:end_match.start()]
        else:
            content = search_area.strip()
    else:
        # Last world - find closing backtick before final };
        search_area = worlds_section[content_start:]
        end_pattern = r'`\s*\}\s*\};'
        end_match = re.search(end_pattern, search_area)
        if end_match:
            content = search_area[:end_match.start()]
        else:
            last_backtick = search_area.rfind('`')
            content = search_area[:last_backtick] if last_backtick != -1 else search_area
    
    worlds.append({
        'key': key,
        'id': world_id,
        'group': group,  # Can be None
        'name': name,
        'icon': icon,
        'content': content.strip()
    })

print(f"Successfully parsed {len(worlds)} worlds.")

# Create index.json with metadata only
index_data = {
    'worlds': []
}

for w in worlds:
    entry = {
        'id': w['id'],
        'name': w['name'],
        'icon': w['icon']
    }
    if w['group']:
        entry['group'] = w['group']
    index_data['worlds'].append(entry)

with open(os.path.join(OUTPUT_DIR, 'index.json'), 'w', encoding='utf-8') as f:
    json.dump(index_data, f, indent=2, ensure_ascii=False)
print('Created index.json')

# Create individual world files
for world in worlds:
    world_data = {
        'id': world['id'],
        'name': world['name'],
        'icon': world['icon'],
        'content': world['content']
    }
    if world['group']:
        world_data['group'] = world['group']
    
    filepath = os.path.join(OUTPUT_DIR, f"{world['id']}.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(world_data, f, indent=2, ensure_ascii=False)
    print(f"Created {world['id']}.json ({len(world['content'])} chars)")

print(f"\nExtraction complete!")
print(f"Total worlds extracted: {len(worlds)}")
print(f"Output directory: {OUTPUT_DIR}")

# List all world IDs
print("\nExtracted worlds:")
for w in worlds:
    group_str = f" (group: {w['group']})" if w['group'] else " (no group)"
    print(f"  - {w['id']}: {w['name']}{group_str}")
