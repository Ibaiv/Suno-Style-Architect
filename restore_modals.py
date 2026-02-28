import re

def process():
    with open('old_index.html', 'r', encoding='utf-8') as f:
        old_html = f.read()

    with open('index.html', 'r', encoding='utf-8') as f:
        new_html = f.read()

    # Extract idea-starter-modal
    idea_match = re.search(r'(<div id="idea-starter-modal".*?<!-- ### KLANG-STUDIO MODAL)', old_html, re.DOTALL)
    if not idea_match:
        print("Could not find idea-starter-modal in old_index.html")
        return
    idea_modal = idea_match.group(1).rsplit('<!--', 1)[0].strip()

    # Extract klang-studio-modal
    klang_match = re.search(r'(<div id="klang-studio-modal".*?<!-- Context Menu \(Global\))', old_html, re.DOTALL)
    if not klang_match:
        print("Could not find klang-studio-modal")
        return
    klang_modal = klang_match.group(1).rsplit('<!--', 1)[0].strip()

    # Extract wiki-context-menu
    wiki_context = re.search(r'(<div id="wiki-context-menu".*?<!-- ### STYLE SYNC STUDIO)', old_html, re.DOTALL)
    if wiki_context:
        wiki_menu = wiki_context.group(1).rsplit('<!--', 1)[0].strip()
    else:
        wiki_menu = ""

    # Extract style-sync-studio
    sync_match = re.search(r'(<div id="style-sync-studio".*?)<script src="js/config.js">', old_html, re.DOTALL)
    if not sync_match:
        print("Could not find style-sync-studio")
        return
    sync_modal = sync_match.group(1).strip()

    # In new_html, find where to replace
    # We have:
    # <div id="idea-starter-modal" class="fixed inset-0 z-[130] hidden"></div>
    # <div id="klang-studio-modal" class="fixed inset-0 z-[130] hidden"></div>
    # And we'll just append wiki_menu and sync_modal before the scripts
    
    new_html = re.sub(r'<div id="idea-starter-modal"[^>]*></div>', idea_modal, new_html)
    new_html = re.sub(r'<div id="klang-studio-modal"[^>]*></div>', klang_modal + "\n" + wiki_menu + "\n" + sync_modal, new_html)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    print("Modals restored successfully.")

if __name__ == '__main__':
    process()
