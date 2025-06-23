export function cleanMarkdown(text: string): string {
    // Enhanced input validation
    if (!text || typeof text !== "string") return "";
    if (!text.trim()) return "";

    let cleaned = text;

    // Phase 1: Remove block-level elements first (order matters!)
    cleaned = removeCodeBlocks(cleaned);
    cleaned = removeFootnoteDefinitions(cleaned);
    cleaned = removeReferenceStyleLinks(cleaned);
    cleaned = removeBlockquotes(cleaned); // Move blockquotes before headers to handle quoted headers
    cleaned = removeHeaders(cleaned);
    cleaned = removeHorizontalRules(cleaned);

    // Phase 2: Remove inline formatting
    cleaned = removeTextFormatting(cleaned);
    cleaned = removeInlineCode(cleaned);
    cleaned = removeLinksAndImages(cleaned);
    cleaned = removeFootnoteReferences(cleaned);

    // Phase 3: Remove structural elements
    cleaned = removeHtmlTags(cleaned);
    cleaned = removeTaskLists(cleaned);
    cleaned = removeListMarkers(cleaned);
    cleaned = removeEmojis(cleaned);

    // Phase 4: Handle tables and final cleanup
    cleaned = cleanTables(cleaned);
    cleaned = removeEscapeCharacters(cleaned); // Move escape character removal later to avoid interfering with other patterns
    cleaned = normalizeWhitespace(cleaned);

    return cleaned.trim();
}

/**
 * Remove all types of code blocks (fenced and indented)
 */
function removeCodeBlocks(text: string): string {
    if (!text) return "";

    return (
        text
            // Fenced code blocks with language specifiers
            .replace(/```[\w-]*\n?[\s\S]*?```/g, "")
            .replace(/~~~~[\w-]*\n?[\s\S]*?~~~~/g, "")
            .replace(/~~~[\w-]*\n?[\s\S]*?~~~/g, "")
            // Indented code blocks (4+ spaces or tab at start of line)
            .replace(/^(?: {4,}|\t+).*$/gm, "")
            // Remove any lingering triple backticks
            .replace(/```/g, "")
    );
}

/**
 * Remove footnote definitions (complete lines like [^1]: definition)
 */
function removeFootnoteDefinitions(text: string): string {
    if (!text) return "";
    return text.replace(/^\[\^[^\]]+\]:\s*.*$/gm, "");
}

/**
 * Remove reference-style link definitions (e.g., [id]: url "title")
 */
function removeReferenceStyleLinks(text: string): string {
    if (!text) return "";
    return text.replace(
        /^\s*\[[^\]]+\]:\s*<?[^>\s]+>?(?:\s+["'(].*?["')])?\s*$/gm,
        ""
    );
}

/**
 * Remove blockquotes (> text) including nested and indented ones
 */
function removeBlockquotes(text: string): string {
    if (!text) return "";

    return (
        text
            // Handle multiple levels of blockquotes with proper spacing
            .replace(/^(\s*)>+(\s*)/gm, "$1")
            // Clean up any remaining > characters at start of lines
            .replace(/^\s*>\s*/gm, "")
            // Handle cases where > appears after indentation
            .replace(/^(\s+)>\s*/gm, "$1")
    );
}

/**
 * Remove markdown headers (both # style and alternate syntax)
 */
function removeHeaders(text: string): string {
    if (!text) return "";

    return (
        text
            // Remove alternate heading syntax (e.g., Heading 1\n=========)
            .replace(/^(.*?)\r?\n[=-]{2,}\s*$/gm, "$1")
            // Remove standard heading syntax (# ## ### etc.) with optional trailing #
            .replace(/^#{1,6}\s+(.*?)(?:\s+#{1,6})?\s*$/gm, "$1")
            // Clean up any remaining # at start of lines
            .replace(/^#+\s*/gm, "")
    );
}

/**
 * Remove horizontal rules (--- or ***)
 */
function removeHorizontalRules(text: string): string {
    if (!text) return "";
    return text.replace(/^\s*[-*_]{3,}\s*$/gm, "");
}

/**
 * Remove all text formatting (bold, italic, strikethrough)
 */
function removeTextFormatting(text: string): string {
    if (!text) return "";

    return (
        text
            // Handle triple asterisks/underscores (bold + italic) first
            .replace(/(\*{3}|_{3})([^*_]+)\1/g, "$2")
            // Handle double asterisks/underscores (bold)
            .replace(/(\*{2}|_{2})([^*_]+)\1/g, "$2")
            // Handle single asterisks/underscores (italic)
            .replace(/(\*|_)([^*_\n]+)\1/g, "$2")
            // Handle strikethrough
            .replace(/~~([^~\n]+)~~/g, "$1")
            // Clean up any remaining formatting characters
            .replace(/[*_~]{1,3}/g, "")
    );
}

/**
 * Remove inline code formatting (`code`)
 */
function removeInlineCode(text: string): string {
    if (!text) return "";
    return text.replace(/`+([^`\n]*)`+/g, "$1");
}

/**
 * Remove links and images, keeping only the display text
 */
function removeLinksAndImages(text: string): string {
    if (!text) return "";

    return (
        text
            // Remove images ![alt](url "title") -> alt text
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
            // Remove reference-style images ![alt][ref] -> alt text
            .replace(/!\[([^\]]*)\]\[[^\]]*\]/g, "$1")
            // Remove links [text](url "title") -> text
            .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
            // Remove reference-style links [text][ref] -> text
            .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
            // Remove bare URLs
            .replace(/https?:\/\/[^\s<>"`{}|\\^~[\]]+/g, "")
    );
}

/**
 * Remove footnote references [^1]
 */
function removeFootnoteReferences(text: string): string {
    if (!text) return "";
    return text.replace(/\[\^[^\]]+\]/g, "");
}

/**
 * Remove HTML tags but preserve content
 */
function removeHtmlTags(text: string): string {
    if (!text) return "";
    return text.replace(/<\/?[^>]*>/g, "");
}

/**
 * Remove task lists (* [ ], - [ ], + [x], etc.), keeping a hyphen for structure
 */
function removeTaskLists(text: string): string {
    if (!text) return "";

    return text.replace(/^(\s*)[-*+]\s*\[[x\s]\]\s*/gim, "$1- ");
}

/**
 * Remove list markers (bullets only, preserve numbers)
 */
function removeListMarkers(text: string): string {
    if (!text) return "";

    return (
        text
            // Remove bullet points but keep a hyphen for list structure
            .replace(/^(\s*)[-*+]\s+/gm, "$1- ")
            // Convert numbered lists to clean format (keep numbers, remove extra formatting)
            .replace(/^(\s*)(\d+)\.\s+/gm, "$1$2. ")
    );
}

/**
 * Clean markdown tables and convert to readable text
 */
function cleanTables(text: string): string {
    if (!text) return "";

    return (
        text
            // First remove table separator lines (|---|---|\n), consuming the newline
            .replace(/^\s*\|[\s:|-]+\|\s*$/gm, "")
            // Then convert table rows to text, handling edge cases
            .replace(/^\s*\|(.+)\|\s*$/gm, (match: string, content: string) => {
                if (!content || !content.trim()) return "";

                const cells = content
                    .split("|")
                    .map((cell: string) => cell.trim())
                    .filter((cell: string) => cell.length > 0);

                return cells.length > 0 ? cells.join(" ") : "";
            })
            // Remove any remaining standalone | characters
            .replace(/^\s*\|\s*$/gm, "")
    );
}

/**
 * Remove escape characters and backslashes (done last to avoid interfering with other patterns)
 */
function removeEscapeCharacters(text: string): string {
    if (!text) return "";

    return (
        text
            // Handle escaped markdown characters (preserve the character, remove the escape)
            .replace(/\\([*_`#\[\]()~\\|{}.!+-])/g, "$1")
            // Handle multiple backslashes
            .replace(/\\{2,}/g, "")
            // Handle remaining single backslashes at end of lines
            .replace(/\\$/gm, "")
            // Handle any remaining backslashes followed by characters
            .replace(/\\(.)/g, "$1")
    );
}

/**
 * Normalize whitespace and clean up extra spacing
 */
function normalizeWhitespace(text: string): string {
    if (!text) return "";

    return (
        text
            // Remove trailing spaces from lines
            .replace(/[ \t]+$/gm, "")
            // Replace multiple spaces with single space
            .replace(/ {2,}/g, " ")
            // Clean up multiple empty lines
            .replace(/\n\s*\n\s*\n/g, "\n\n")
            .replace(/\n{3,}/g, "\n\n")
            // Remove lines that are only whitespace
            .replace(/^\s+$/gm, "")
            // Final cleanup - ensure consistent line breaks
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
    );
}

/**
 * Remove emojis, emoticons, and emoji shortcodes
 */
function removeEmojis(text: string): string {
    if (!text) return "";

    return (
        text
            // Remove Unicode emojis (comprehensive range)
            // Basic emoticons and symbols
            .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Misc Symbols and Pictographs
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Transport and Map
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // Regional country flags
            .replace(/[\u{2600}-\u{26FF}]/gu, "") // Miscellaneous symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, "") // Dingbats
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // Supplemental Symbols and Pictographs
            .replace(/[\u{1F018}-\u{1F270}]/gu, "") // Various symbols
            .replace(/[\u{238C}-\u{2454}]/gu, "") // Misc symbols
            .replace(/[\u{20D0}-\u{20FF}]/gu, "") // Combining Diacritical Marks for Symbols

            // Remove emoji skin tone modifiers
            .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "")

            // Remove Zero Width Joiner sequences (complex emojis)
            .replace(/[\u{200D}]/gu, "")

            // Remove variation selectors (emoji presentation)
            .replace(/[\u{FE0E}\u{FE0F}]/gu, "")

            // Remove common ASCII emoticons
            .replace(/[:-;][)(\][]]/g, "")
            .replace(/[)(\][][:;-]/g, "")
            .replace(/[:-;][DPpOo]/g, "")
            .replace(/\\o\//g, "")
            .replace(/<3/g, "")
            .replace(/[xX][Dd]/g, "")

            // Remove emoji shortcodes (like :smile:, :heart:, etc.)
            .replace(/:[\w+-]+:/g, "")

            // Clean up any double spaces left by emoji removal
            .replace(/  +/g, " ")
    );
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export function copyToClipboard(text: string): Promise<boolean> {
    if (!text || typeof text !== "string") {
        return Promise.resolve(false);
    }

    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard
            .writeText(text)
            .then(() => true)
            .catch(() => false);
    } else {
        // Fallback for older browsers
        return new Promise((resolve) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand("copy");
                textArea.remove();
                resolve(successful);
            } catch (err) {
                console.error("Copy to clipboard failed:", err);
                resolve(false);
            }
        });
    }
}