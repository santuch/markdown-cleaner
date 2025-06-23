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
    cleaned = removeEmojis(cleaned); // Remove emojis BEFORE list processing
    cleaned = removeEscapeCharacters(cleaned); // Move escape character removal BEFORE list processing

    // Phase 3: Remove structural elements
    cleaned = removeHtmlTags(cleaned);
    cleaned = removeTaskLists(cleaned);
    cleaned = removeListMarkers(cleaned); // Convert * to - AFTER escape removal

    // Phase 4: Handle tables and final cleanup
    cleaned = cleanTables(cleaned);
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

    // Process line by line to avoid affecting list markers
    const lines = text.split("\n");
    const processedLines = lines.map((line) => {
        const listMatch = line.match(/^(\s*[*+-]|\s*\d+\.)\s+/);

        let prefix = "";
        let content = line;

        if (listMatch) {
            prefix = listMatch[0];
            content = line.substring(prefix.length);
        }

        // Process content for text formatting
        const processedContent = content
            // Handle triple asterisks/underscores (bold + italic) first
            .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
            .replace(/___([^_]+)___/g, "$1")
            // Handle double asterisks/underscores (bold)
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/__([^_]+)__/g, "$1")
            // Handle single asterisks/underscores (italic)
            .replace(/\*([^*\n]+)\*/g, "$1")
            .replace(/_([^_\n]+)_/g, "$1")
            // Handle strikethrough
            .replace(/~~([^~\n]+)~~/g, "$1");

        return prefix + processedContent;
    });

    return processedLines.join("\n");
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
            // Convert links [text](url "title") -> text (url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 $2")
            // Remove reference-style links [text][ref] -> text
            .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
        // Keep bare URLs
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

    return text.replace(/^(\s*)[-*+]\s*\[[x\s]\][ \t]*/gim, "$1- ");
}

/**
 * Remove list markers (bullets only, preserve numbers)
 */
function removeListMarkers(text: string): string {
    if (!text) return "";

    return (
        text
            // Convert all bullet points (* + •) to consistent hyphen format with single space
            .replace(/^(\s*)[*+•][ \t]*/gm, "$1- ")
            // Keep existing hyphens as-is but normalize to single space
            .replace(/^(\s*)-[ \t]*/gm, "$1- ")
            // Convert numbered lists to clean format with single space
            .replace(/^(\s*)(\d+)\.[ \t]*/gm, "$1$2. ")
    );
}

/**
 * Clean markdown tables and convert to readable text
 */
function cleanTables(text: string): string {
    if (!text) return "";

    // Process tables as complete blocks
    return text.replace(/(\|[^\n]*\|\n)*\|[^\n]*\|/g, (tableMatch: string) => {
        const lines = tableMatch.split("\n").filter((line) => line.trim());
        const processedRows: string[] = [];

        for (const line of lines) {
            // Skip separator lines (like |---|---|)
            if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) {
                continue;
            }

            // Process table rows
            if (/^\s*\|(.+)\|\s*$/.test(line)) {
                const content = line.replace(/^\s*\||\|\s*$/g, "");
                const cells = content
                    .split("|")
                    .map((cell) => cell.trim())
                    .filter((cell) => cell.length > 0);

                if (cells.length > 0) {
                    processedRows.push(cells.join(" "));
                }
            }
        }

        return processedRows.join("\n");
    });
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

    let processed = text;

    // Add newlines after headers for separation
    processed = processed.replace(
        /^(H\d|Markdown Demo|1\. Headers|2\. Emphasis|3\. Lists|4\. Links and Images|5\. Code|6\. Blockquote|7\. Table|8\. Task List|Unordered:|Ordered:)$/gm,
        "$1\n"
    );

    // General whitespace cleanup
    processed = processed
        // Remove trailing spaces from lines
        .replace(/[ \t]+$/gm, "")
        // Replace multiple spaces with single space (but preserve line-start indentation)
        .replace(/(?<!^[\s]*) {2,}/gm, " ")
        // Ensure proper indentation for nested lists (3 spaces per level)
        .replace(/^(\s*)- /gm, (match, p1) => {
            const level = Math.floor(p1.length / 2); // Approximation of nesting level
            return "   ".repeat(level) + "- ";
        })
        // Remove lines that are only whitespace
        .replace(/^\s+$/gm, "")
        // Collapse 3 or more newlines into a max of 2
        .replace(/\n{3,}/g, "\n\n")
        // Final cleanup - ensure consistent line breaks
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    return processed;
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

            // Remove common ASCII emoticons (avoid removing list markers)
            .replace(/[:-;][)(\][]]/g, "")
            .replace(/[)(\][][:;-]/g, "")
            .replace(/[:-;][DPpOo]/g, "")
            .replace(/\\o\//g, "")
            .replace(/<3/g, "")
            .replace(/[xX][Dd]/g, "")

            // Remove emoji shortcodes (like :smile:, :heart:, etc.)
            .replace(/:[\w+-]+:/g, "")

            // Clean up any whitespace left by emoji removal
            .replace(/[ \t]{2,}/g, " ") // Replace multiple spaces/tabs with single space (NOT newlines)
            .replace(/^\s+(?=\S)/gm, "") // Remove leading spaces from lines (but keep indented lines)
            .replace(/[ \t]+$/gm, "") // Remove trailing spaces from lines
            .replace(/[ \t]+([,.!?;:])/g, "$1") // Remove spaces before punctuation
            .replace(/([,.!?;:])[ \t]{2,}/g, "$1 ") // Normalize spaces after punctuation

            // Fix spacing issues in list items after emoji removal
            .replace(/^(\s*[*+-])\s+/gm, "$1 ")
            .replace(/^(\s*\d+\.)\s+/gm, "$1 ")
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
