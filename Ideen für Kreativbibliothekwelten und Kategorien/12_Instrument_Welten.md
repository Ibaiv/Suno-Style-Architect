# Instrument-Welten — Ein Instrument als ganzes Universum

**Priorität:** Mittel  
**Status:** Idee, noch nicht implementiert  
**Grund:** Manche Nutzer denken nicht in Genres sondern in Instrumenten. "Ich will Cello-Musik" ist ein klarer Einstiegspunkt. Instrument-Welten sind orthogonal zu Genre-Welten und erschließen eine andere Denkkategorie.

---

## Konzept

Jede Instrument-Welt zeigt die gesamte Bandbreite eines einzelnen Instruments — von klassisch bis modern, von einfach bis komplex. Das Instrument ist der rote Faden, nicht das Genre.

---

## Vorgeschlagene Gruppe

**Name:** Instrument Universes  
**Icon:** 🎼  
**Farbe:** Vorschlag #8b5cf6 (Violett — Handwerk, Virtuosität)

---

## Vorgeschlagene Welten

### Solo Piano Cosmos
- **Bandbreite:** Schubert Impromptus → Chopin Nocturnes → Debussy → Ravel → Keith Jarrett Köln Concert → Hauschka → Nils Frahm
- **Charakteristik:** Das Klavier ist das vollständigste Soloinstrument — Harmonie, Melodie, Rhythmus, Dynamik allein
- **Suno-Prompts:** Solo piano, [choose mood], no accompaniment, intimate, [classical/jazz/contemporary], piano only

### Guitar Universe
- **Bandbreite:** Classical Guitar (Segovia) → Blues (Robert Johnson) → Flamenco → Jazz (Django) → Rock (Hendrix) → Metal (Guthrie Govan) → Fingerpicking Folk (John Fahey)
- **Charakteristik:** Die Gitarre ist das vielseitigste Instrument der Populärmusik — fast jede Kultur hat eine Version davon
- **Suno-Prompts:** Guitar-centric, [choose style], guitar as lead voice, [acoustic/electric/classical]

### Cello Solo Landscapes
- **Bandbreite:** Bach Suiten → Dvorak Konzert → Apocalyptica (Metal-Cello) → Yo-Yo Ma (Crossover) → Gaspar Cassadó
- **Charakteristik:** Das Cello hat die dem menschlichen Stimmumfang ähnlichste Klangfarbe — tief emotional
- **Suno-Prompts:** Solo cello, [Bach suites style / romantic / contemporary / metal cello], deep emotional tone, resonant

### Trumpet Stories
- **Bandbreite:** Louis Armstrong (Jazz) → Miles Davis (Cool Jazz) → Clifford Brown (Bebop) → Don Cherry (Free) → Mariachi → New Orleans Brass → Classical Trumpet Concerto
- **Charakteristik:** Die Trompete hat die größte kulturelle Bandbreite — von Kriegssignal bis Nachtclub
- **Suno-Prompts:** Trumpet, [choose context], brass, [muted/open], jazz or classical or folk

### Accordion Worlds
- **Bandbreite:** Musette Paris → Argentine Tango (Bandoneon) → Zydeco Louisiana → Norteño México → Eastern European Folk → Contemporary Avant-Garde
- **Charakteristik:** Das Akkordeon ist das Heimwehinstrument schlechthin — immer mit einem Ort verbunden
- **Suno-Prompts:** Accordion, [musette/tango/zydeco/norteño/folk], [country of origin], nostalgic or energetic

### Organ Kingdom
- **Bandbreite:** Pfeifenorgel (Bach, Buxtehude) → Hammond B3 (Soul, Gospel, Prog Rock) → Wurlitzer (Vintage Pop, Film) → Theater Organ (Stummfilm) → Elektronische Orgel
- **Charakteristik:** Die Orgel ist das größte Instrument der Welt und gleichzeitig in einer Kneipe — extremste Bandbreite
- **Suno-Prompts:** Organ, [pipe organ/Hammond B3/Wurlitzer], [sacred/soul/rock/cinema], sustained tones

### Harp Dimensions
- **Bandbreite:** Pedal-Harfe (Orchester, klassisch) → Keltische Harfe (Folk) → Äolsharfe (Wind gespielt) → Chilenische Harfe → Harfenambient (Andreas Vollenweider)
- **Charakteristik:** Die Harfe klingt immer wie Wasser — fließend, glitzernd, ephemer
- **Suno-Prompts:** Harp, [orchestral/Celtic/ambient/world], flowing, ethereal, plucked strings, glissando

### Saxophone Dimensions
- **Bandbreite:** Bebop (Charlie Parker) → Cool Jazz (Paul Desmond) → Free Jazz (Coltrane) → Rock Sax (Clarence Clemons) → Funk (Maceo Parker) → Contemporary Classical
- **Charakteristik:** Das Saxofon ist das Instrument das am meisten nach Mensch klingt
- **Suno-Prompts:** Saxophone, [alto/tenor/soprano/baritone], [jazz/blues/funk/classical], [smooth or raw], expressive

### Violin Stories
- **Bandbreite:** Klassische Violine (Paganini, Brahms) → Jazz Geige (Stéphane Grappelli) → Bluegrass Fiddle → Irish Fiddle → Indische Sarangi → Contemporary (Hilary Hahn)
- **Suno-Prompts:** Violin / fiddle, [classical/jazz/folk/Indian], [lyrical/virtuosic/raw], [with or without accompaniment]

### Bass Guitar Universe
- **Bandbreite:** Jazz Walking Bass → Funk Bass (James Brown, Victor Wooten) → Slap Bass → Rock Bass → Fretless Bass (Jaco Pastorius) → Electronic Bass → Upright Bass
- **Charakteristik:** Der Bass ist der am meisten unterschätzte Solo-Protagonist der Musik
- **Suno-Prompts:** Bass-centric, [walking bass/slap/fretless/rock], bass as lead voice, low frequencies forward

---

## Implementierungshinweise

- Instrument-Welten sind eine **andere Dimension** als Genre-Welten — sie könnten als Filter oder als separate Gruppe funktionieren
- Die Welten sind relativ einfach zu erweitern — fast jedes Instrument hat eine ähnliche Geschichte
- Suno reagiert gut auf Instrumenten-Angaben — diese Welten haben direkten Prompt-Nutzen
- Eine "Instrument + Genre"-Kombination (Piano + Jazz, Guitar + Metal) wäre eine interessante UI-Funktion
