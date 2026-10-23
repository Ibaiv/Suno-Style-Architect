# Suno Style Architect

Suno Style Architect is a creative music-prompt environment in which users develop ideas, shape musical intent, and produce prompts and supporting references for AI music generators.

## Language

**Prompt**:
The central creative object: a structured expression of musical intent prepared for an AI music generator.
_Avoid_: Result text, Meisterstück

**Application Prompt Template**:
A versioned, application-authored Markdown template that supplies instructions to a language model for a particular feature or system responsibility.
_Avoid_: Runtime request, user prompt

**Prompt Inspector**:
A read-only, user-facing catalog for inspecting, searching, copying, and downloading the application's original Application Prompt Templates.
_Avoid_: Prompt Library, prompt editor

**Idea Spark**:
A focused, guided inspiration tool that quickly introduces topics or directions a user may not already know.
_Avoid_: Ideas Starter, Creative Cosmos

**Creative Cosmos**:
A deep creative workspace for exploring musical worlds and developing source material through discovery, collection, and synthesis.
_Avoid_: Idea Spark, Ideas Starter

**Style Synchronizer**:
A bidirectional creative workspace that encodes musical text as imagery and decodes imagery into musical direction for Prompt development.
_Avoid_: Visual Spark, Visual Engine

**Klang Studio**:
A major creative workspace containing specialized Spaces for designing sound, instrumentation, performance, and related musical material.
_Avoid_: Synth Designer, sound-design modal

**Klang Studio Space**:
A specialized environment within Klang Studio whose controls, behavior, and outputs match one musical domain, such as synthesis or orchestration.
_Avoid_: Tab, generic tool

## Creative Outputs

**Prompt Contribution**:
Musical intent produced by a creative tool or Klang Studio Space for incorporation into a Prompt.
_Avoid_: Final prompt, result text

**Structured Design**:
An explicit, editable representation of musical choices within a specialized domain such as orchestration, rhythm, or synthesis.
_Avoid_: Prompt text, generated sound

**Reference Sound**:
Playable audio created or imported to communicate sonic intent and optionally accompany a Prompt as a reference for an AI music generator.
_Avoid_: Song, final audio

**Generated Image**:
An image created from musical intent as a creative intermediary or reference, including when produced by a Klang Studio Space that supports visual output.
_Avoid_: Reference Sound, album artwork
