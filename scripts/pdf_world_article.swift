#!/usr/bin/env swift

import Foundation
import PDFKit

enum ExitCode: Int32 {
    case success = 0
    case validation = 2
    case extraction = 3
    case writeFailure = 4
}

struct CLIOptions {
    let pdfPath: String
    let worldId: String
    let apply: Bool
    let keywordsArg: String?
    let jsonPath: String
    let jsPath: String
}

struct UpdatePreview {
    let oldLength: Int
    let newLength: Int
    let diffPreview: String
}

private let stopwords: Set<String> = [
    "der", "die", "das", "und", "oder", "aber", "ein", "eine", "einer", "eines", "einem", "einen",
    "ist", "sind", "war", "waren", "wird", "werden", "mit", "ohne", "von", "zu", "im", "in", "am",
    "an", "auf", "für", "als", "auch", "nicht", "nur", "dass", "dem", "den", "des", "bei", "durch",
    "über", "unter", "nach", "vor", "aus", "this", "that", "with", "from", "into", "their", "there",
    "have", "has", "were", "been", "will", "would", "should", "could", "about", "more", "than"
]

func fail(_ message: String, code: ExitCode) -> Never {
    fputs("Error: \(message)\n", stderr)
    exit(code.rawValue)
}

func parseCLI() -> CLIOptions {
    var args = Array(CommandLine.arguments.dropFirst())
    var pdfPath: String?
    var worldId: String?
    var apply = false
    var keywordsArg: String?
    var jsonPath: String?
    var jsPath: String?

    func popValue(for flag: String) -> String {
        guard !args.isEmpty else {
            fail("Missing value for \(flag)", code: .validation)
        }
        return args.removeFirst()
    }

    while !args.isEmpty {
        let token = args.removeFirst()
        switch token {
        case "--pdf":
            pdfPath = popValue(for: "--pdf")
        case "--world-id":
            worldId = popValue(for: "--world-id")
        case "--apply":
            apply = true
        case "--keywords":
            keywordsArg = popValue(for: "--keywords")
        case "--json-path":
            jsonPath = popValue(for: "--json-path")
        case "--js-path":
            jsPath = popValue(for: "--js-path")
        case "--help", "-h":
            printUsage()
            exit(0)
        default:
            fail("Unknown argument: \(token)", code: .validation)
        }
    }

    guard let pdfPath else { fail("Required: --pdf <absolute path>", code: .validation) }
    guard let worldId else { fail("Required: --world-id <id>", code: .validation) }

    guard pdfPath.hasPrefix("/") else {
        fail("--pdf must be an absolute path", code: .validation)
    }

    let resolvedJSON = jsonPath ?? "data/worlds/\(worldId).json"
    let resolvedJS = jsPath ?? "js/creative_cosmos.js"

    return CLIOptions(
        pdfPath: pdfPath,
        worldId: worldId,
        apply: apply,
        keywordsArg: keywordsArg,
        jsonPath: resolvedJSON,
        jsPath: resolvedJS
    )
}

func printUsage() {
    let usage = """
    Usage:
      swift scripts/pdf_world_article.swift --pdf <absolute_pdf_path> --world-id <world_id> [options]

    Options:
      --apply                    Write changes to both files (default: dry-run only)
      --keywords "k1,k2,k3"      Comma-separated final keywords (optional)
      --json-path <path>         Override JSON path (default: data/worlds/<world_id>.json)
      --js-path <path>           Override JS path (default: js/creative_cosmos.js)
      --help, -h                 Show this help
    """
    print(usage)
}

func validateInputs(_ options: CLIOptions) {
    let fm = FileManager.default
    guard fm.fileExists(atPath: options.pdfPath) else {
        fail("PDF not found: \(options.pdfPath)", code: .validation)
    }
    guard fm.fileExists(atPath: options.jsonPath) else {
        fail("JSON file not found: \(options.jsonPath)", code: .validation)
    }
    guard fm.fileExists(atPath: options.jsPath) else {
        fail("JS file not found: \(options.jsPath)", code: .validation)
    }
}

func extractPDFText(from absolutePDFPath: String) -> String {
    guard let doc = PDFDocument(url: URL(fileURLWithPath: absolutePDFPath)) else {
        fail("Could not open PDF via PDFKit", code: .extraction)
    }
    var pages: [String] = []
    for i in 0..<doc.pageCount {
        guard let page = doc.page(at: i) else { continue }
        let text = page.string ?? ""
        if !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            pages.append(text)
        }
    }
    let joined = pages.joined(separator: "\n\n")
    if joined.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        fail("PDF has no extractable text layer (OCR not performed by design)", code: .extraction)
    }
    return joined
}

func normalizeText(_ text: String) -> String {
    var s = text.replacingOccurrences(of: "\r\n", with: "\n")
    s = s.replacingOccurrences(of: "\r", with: "\n")
    s = s.replacingOccurrences(of: "\t", with: " ")

    let lines = s.components(separatedBy: "\n").map { line -> String in
        let trimmed = line.trimmingCharacters(in: .whitespaces)
        return collapseSpaces(trimmed)
    }
    return lines.joined(separator: "\n")
}

func collapseSpaces(_ line: String) -> String {
    var result = ""
    var lastWasSpace = false
    for scalar in line.unicodeScalars {
        if CharacterSet.whitespaces.contains(scalar) {
            if !lastWasSpace {
                result.append(" ")
            }
            lastWasSpace = true
        } else {
            result.append(String(scalar))
            lastWasSpace = false
        }
    }
    return result
}

func escapeHTML(_ s: String) -> String {
    return s
        .replacingOccurrences(of: "&", with: "&amp;")
        .replacingOccurrences(of: "<", with: "&lt;")
        .replacingOccurrences(of: ">", with: "&gt;")
        .replacingOccurrences(of: "\"", with: "&quot;")
}

func headingLevel(for paragraph: String) -> Int? {
    let p = paragraph.trimmingCharacters(in: .whitespacesAndNewlines)
    if p.isEmpty { return nil }
    let lower = p.lowercased()

    if lower == "einleitung" || lower.hasPrefix("einleitung:") || lower == "fazit" || lower.hasPrefix("fazit:") || lower.hasPrefix("schluss") {
        return 2
    }

    if let regex = try? NSRegularExpression(pattern: #"^\d+\.\d+(\.\d+)?\s"#),
       regex.firstMatch(in: p, range: NSRange(location: 0, length: p.utf16.count)) != nil {
        return 3
    }
    if let regex = try? NSRegularExpression(pattern: #"^\d+\.\s"#),
       regex.firstMatch(in: p, range: NSRange(location: 0, length: p.utf16.count)) != nil {
        return 2
    }
    return nil
}

func isOrderedListItem(_ s: String) -> Bool {
    guard let regex = try? NSRegularExpression(pattern: #"^\d+\.\s+"#) else { return false }
    return regex.firstMatch(in: s, range: NSRange(location: 0, length: s.utf16.count)) != nil
}

func stripOrderedPrefix(_ s: String) -> String {
    guard let regex = try? NSRegularExpression(pattern: #"^\d+\.\s+"#),
          let m = regex.firstMatch(in: s, range: NSRange(location: 0, length: s.utf16.count)),
          let r = Range(m.range, in: s) else { return s }
    return String(s[r.upperBound...])
}

func stripUnorderedPrefix(_ s: String) -> String {
    if s.hasPrefix("- ") || s.hasPrefix("• ") {
        return String(s.dropFirst(2))
    }
    return s
}

func buildHTML(from normalizedText: String, worldId: String) -> String {
    let rawParagraphs = normalizedText
        .components(separatedBy: "\n\n")
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }

    var htmlBlocks: [String] = []
    let title = worldId.replacingOccurrences(of: "_", with: " ").capitalized
    htmlBlocks.append("<h1>\(escapeHTML(title))</h1>")

    var i = 0
    while i < rawParagraphs.count {
        let p = rawParagraphs[i]

        if let level = headingLevel(for: p) {
            let tag = level == 2 ? "h2" : "h3"
            htmlBlocks.append("<\(tag)>\(escapeHTML(p))</\(tag)>")
            i += 1
            continue
        }

        if isOrderedListItem(p) {
            var items: [String] = []
            var j = i
            while j < rawParagraphs.count && isOrderedListItem(rawParagraphs[j]) {
                items.append("<li>\(escapeHTML(stripOrderedPrefix(rawParagraphs[j])))</li>")
                j += 1
            }
            htmlBlocks.append("<ol>\(items.joined())</ol>")
            i = j
            continue
        }

        if p.hasPrefix("- ") || p.hasPrefix("• ") {
            var items: [String] = []
            var j = i
            while j < rawParagraphs.count && (rawParagraphs[j].hasPrefix("- ") || rawParagraphs[j].hasPrefix("• ")) {
                items.append("<li>\(escapeHTML(stripUnorderedPrefix(rawParagraphs[j])))</li>")
                j += 1
            }
            htmlBlocks.append("<ul>\(items.joined())</ul>")
            i = j
            continue
        }

        htmlBlocks.append("<p>\(escapeHTML(p))</p>")
        i += 1
    }

    return htmlBlocks.joined(separator: "\n")
}

func keywordCandidates(from text: String, limit: Int = 20) -> [String] {
    let pattern = #"[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9\-]{3,}"#
    guard let regex = try? NSRegularExpression(pattern: pattern) else { return [] }
    let ns = text as NSString
    let matches = regex.matches(in: text, range: NSRange(location: 0, length: ns.length))
    var counts: [String: Int] = [:]
    for m in matches {
        let token = ns.substring(with: m.range)
        let lower = token.lowercased()
        if stopwords.contains(lower) { continue }
        counts[token, default: 0] += 1
    }
    return counts
        .sorted { a, b in
            if a.value == b.value { return a.key < b.key }
            return a.value > b.value
        }
        .prefix(limit)
        .map { "\($0.key) (\($0.value))" }
}

func parseKeywords(_ keywordsArg: String?) -> [String] {
    if let keywordsArg {
        return keywordsArg
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    print("\nKeyword suggestions (top frequency candidates):")
    print("------------------------------------------------")
    return []
}

func promptForKeywords(withSuggestions suggestions: [String]) -> [String] {
    if suggestions.isEmpty {
        print("(No suggestions)")
    } else {
        for s in suggestions {
            print("- \(s)")
        }
    }
    print("\nEnter final keywords (comma-separated), or press ENTER for none:")
    guard let line = readLine() else { return [] }
    return line
        .split(separator: ",")
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }
}

func isBoundaryChar(_ c: Character?) -> Bool {
    guard let c else { return true }
    if c.isLetter || c.isNumber { return false }
    return true
}

func wrapKeywordsInPlainText(_ text: String, keywords: [String]) -> String {
    guard !keywords.isEmpty else { return text }
    let sorted = keywords.sorted { $0.count > $1.count }
    var result = text

    for keyword in sorted where !keyword.isEmpty {
        result = wrapSingleKeyword(in: result, keyword: keyword)
    }
    return result
}

func wrapSingleKeyword(in text: String, keyword: String) -> String {
    var output = ""
    var idx = text.startIndex

    while idx < text.endIndex {
        guard let range = text[idx...].range(of: keyword) else {
            output.append(contentsOf: text[idx...])
            break
        }

        let before = range.lowerBound > text.startIndex ? text[text.index(before: range.lowerBound)] : nil
        let after = range.upperBound < text.endIndex ? text[range.upperBound] : nil

        if isBoundaryChar(before) && isBoundaryChar(after) {
            output.append(contentsOf: text[idx..<range.lowerBound])
            let escapedTerm = escapeHTML(keyword)
            output.append("<span class=\"interactive-term\" data-term=\"\(escapedTerm)\">")
            output.append(contentsOf: text[range])
            output.append("</span>")
        } else {
            output.append(contentsOf: text[idx..<range.upperBound])
        }
        idx = range.upperBound
    }
    return output
}

func wrapKeywordsInHTML(_ html: String, keywords: [String]) -> String {
    guard !keywords.isEmpty else { return html }
    let tagRegex = try! NSRegularExpression(pattern: #"<[^>]+>"#, options: [])
    let ns = html as NSString
    let matches = tagRegex.matches(in: html, range: NSRange(location: 0, length: ns.length))

    var out = ""
    var cursor = 0
    var interactiveDepth = 0

    for m in matches {
        let tagRange = m.range
        if tagRange.location > cursor {
            let textChunk = ns.substring(with: NSRange(location: cursor, length: tagRange.location - cursor))
            if interactiveDepth == 0 {
                out.append(wrapKeywordsInPlainText(textChunk, keywords: keywords))
            } else {
                out.append(textChunk)
            }
        }
        let tag = ns.substring(with: tagRange)
        let lower = tag.lowercased()
        if lower.hasPrefix("<span") && lower.contains("interactive-term") {
            interactiveDepth += 1
        } else if lower.hasPrefix("</span") && interactiveDepth > 0 {
            interactiveDepth -= 1
        }
        out.append(tag)
        cursor = tagRange.location + tagRange.length
    }

    if cursor < ns.length {
        let trailing = ns.substring(from: cursor)
        if interactiveDepth == 0 {
            out.append(wrapKeywordsInPlainText(trailing, keywords: keywords))
        } else {
            out.append(trailing)
        }
    }
    return out
}

func loadTextFile(_ path: String) -> String {
    do {
        return try String(contentsOfFile: path, encoding: .utf8)
    } catch {
        fail("Could not read file: \(path) (\(error.localizedDescription))", code: .validation)
    }
}

func updateWorldJSON(jsonPath: String, worldId: String, newHTML: String) -> (String, String) {
    let oldRaw = loadTextFile(jsonPath)
    guard let data = oldRaw.data(using: .utf8),
          var obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else {
        fail("JSON parse failed for \(jsonPath)", code: .validation)
    }

    guard let existingId = obj["id"] as? String, existingId == worldId else {
        fail("World ID mismatch in JSON (\(obj["id"] ?? "nil")) != \(worldId)", code: .validation)
    }
    obj["content"] = newHTML

    guard JSONSerialization.isValidJSONObject(obj),
          let outData = try? JSONSerialization.data(withJSONObject: obj, options: [.prettyPrinted]),
          var out = String(data: outData, encoding: .utf8) else {
        fail("JSON serialization failed for \(jsonPath)", code: .writeFailure)
    }
    out.append("\n")
    return (oldRaw, out)
}

func regexEscape(_ s: String) -> String {
    NSRegularExpression.escapedPattern(for: s)
}

func updateCreativeJS(jsPath: String, worldId: String, newHTML: String) -> (String, String) {
    let oldRaw = loadTextFile(jsPath)
    let escapedWorld = regexEscape(worldId)
    let pattern = #"(?s)(\#(escapedWorld)\s*:\s*\{.*?wikiContent:\s*`)(.*?)(`\s*\n\s*\})"#
    guard let regex = try? NSRegularExpression(pattern: pattern) else {
        fail("Failed to build JS regex for world block", code: .validation)
    }

    let ns = oldRaw as NSString
    let matches = regex.matches(in: oldRaw, range: NSRange(location: 0, length: ns.length))
    guard matches.count == 1, let match = matches.first else {
        fail("Could not find unique world block for '\(worldId)' in JS", code: .validation)
    }

    let prefix = ns.substring(with: match.range(at: 1))
    let suffix = ns.substring(with: match.range(at: 3))
    let replacement = prefix + "\n" + indentMultiline(newHTML, spaces: 12) + "\n        " + suffix

    guard let range = Range(match.range, in: oldRaw) else {
        fail("Invalid JS replacement range", code: .writeFailure)
    }
    let newRaw = oldRaw.replacingCharacters(in: range, with: replacement)
    return (oldRaw, newRaw)
}

func indentMultiline(_ s: String, spaces: Int) -> String {
    let prefix = String(repeating: " ", count: spaces)
    return s
        .components(separatedBy: "\n")
        .map { prefix + $0 }
        .joined(separator: "\n")
}

func diffPreview(old: String, new: String, context: Int = 180) -> String {
    if old == new { return "(no textual differences)" }
    let oldChars = Array(old)
    let newChars = Array(new)
    var left = 0
    while left < oldChars.count && left < newChars.count && oldChars[left] == newChars[left] {
        left += 1
    }

    var right = 0
    while right < oldChars.count - left &&
            right < newChars.count - left &&
            oldChars[oldChars.count - 1 - right] == newChars[newChars.count - 1 - right] {
        right += 1
    }

    let oldStart = max(0, left - context)
    let oldEnd = min(oldChars.count, left + context)
    let newStart = max(0, left - context)
    let newEnd = min(newChars.count, left + context)
    let oldSnippet = String(oldChars[oldStart..<oldEnd])
    let newSnippet = String(newChars[newStart..<newEnd])

    return """
    --- old snippet ---
    \(oldSnippet)
    --- new snippet ---
    \(newSnippet)
    """
}

func writeAtomically(path: String, content: String) throws {
    let targetURL = URL(fileURLWithPath: path)
    let tmpURL = targetURL.deletingLastPathComponent().appendingPathComponent(".\(targetURL.lastPathComponent).tmp.\(UUID().uuidString)")
    try content.write(to: tmpURL, atomically: true, encoding: .utf8)
    let fm = FileManager.default
    if fm.fileExists(atPath: targetURL.path) {
        _ = try fm.replaceItemAt(targetURL, withItemAt: tmpURL)
    } else {
        try fm.moveItem(at: tmpURL, to: targetURL)
    }
}

func validatePostApply(jsonPath: String, jsPath: String, worldId: String) {
    let jsonRaw = loadTextFile(jsonPath)
    guard let data = jsonRaw.data(using: .utf8),
          (try? JSONSerialization.jsonObject(with: data)) != nil else {
        fail("Post-apply JSON validation failed", code: .writeFailure)
    }

    let jsRaw = loadTextFile(jsPath)
    let escapedWorld = regexEscape(worldId)
    let pattern = #"(?s)\#(escapedWorld)\s*:\s*\{.*?wikiContent:\s*`.*?`\s*\n\s*\}"#
    guard let regex = try? NSRegularExpression(pattern: pattern) else {
        fail("Post-apply JS validation regex failed", code: .writeFailure)
    }
    let count = regex.numberOfMatches(in: jsRaw, range: NSRange(location: 0, length: (jsRaw as NSString).length))
    guard count == 1 else {
        fail("Post-apply JS validation failed: world block count = \(count)", code: .writeFailure)
    }
}

func printUpdatePreview(label: String, old: String, new: String) {
    let preview = UpdatePreview(
        oldLength: old.count,
        newLength: new.count,
        diffPreview: diffPreview(old: old, new: new)
    )
    print("\n[\(label)]")
    print("old length: \(preview.oldLength)")
    print("new length: \(preview.newLength)")
    print(preview.diffPreview)
}

func run() {
    let options = parseCLI()
    validateInputs(options)

    let rawPDF = extractPDFText(from: options.pdfPath)
    let normalized = normalizeText(rawPDF)
    let baseHTML = buildHTML(from: normalized, worldId: options.worldId)

    let selectedKeywords: [String]
    if let cliKeywords = options.keywordsArg {
        selectedKeywords = parseKeywords(cliKeywords)
    } else {
        _ = parseKeywords(nil)
        let suggestions = keywordCandidates(from: normalized)
        selectedKeywords = promptForKeywords(withSuggestions: suggestions)
    }
    let finalHTML = wrapKeywordsInHTML(baseHTML, keywords: selectedKeywords)

    let (oldJSON, newJSON) = updateWorldJSON(
        jsonPath: options.jsonPath,
        worldId: options.worldId,
        newHTML: finalHTML
    )
    let (oldJS, newJS) = updateCreativeJS(
        jsPath: options.jsPath,
        worldId: options.worldId,
        newHTML: finalHTML
    )

    print("\nWorld: \(options.worldId)")
    print("Keywords selected: \(selectedKeywords.count)")
    if !selectedKeywords.isEmpty {
        for k in selectedKeywords {
            print("- \(k)")
        }
    }

    printUpdatePreview(label: "JSON update preview", old: oldJSON, new: newJSON)
    printUpdatePreview(label: "JS update preview", old: oldJS, new: newJS)

    if !options.apply {
        print("\nDry-run mode: no files were changed. Re-run with --apply to write changes.")
        exit(ExitCode.success.rawValue)
    }

    do {
        try writeAtomically(path: options.jsonPath, content: newJSON)
        try writeAtomically(path: options.jsPath, content: newJS)
    } catch {
        fail("Failed to write files atomically: \(error.localizedDescription)", code: .writeFailure)
    }

    validatePostApply(jsonPath: options.jsonPath, jsPath: options.jsPath, worldId: options.worldId)
    print("\nApply complete: both files updated and validated.")
    exit(ExitCode.success.rawValue)
}

run()
