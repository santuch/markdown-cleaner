"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash2, FileText, Sparkles, ArrowRight } from "lucide-react";
import { cleanMarkdown, copyToClipboard } from "@/lib/markdown-cleaner";

export default function Home() {
    const [input, setInput] = useState("");
    const [copied, setCopied] = useState(false);

    const cleanedText = cleanMarkdown(input);

    const handleCopy = async () => {
        const success = await copyToClipboard(cleanedText);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClear = () => {
        setInput("");
    };

    const sampleMarkdown = `# Complete ChatGPT Response Test

Here's a **bold** statement with _italic_ text and some \`inline code\`. Also ***bold and italic*** text and ~~strikethrough~~.

## Features:
- Item 1 with [link](https://example.com)
- Item 2 with **formatting**
- Item 3 with \`code\`

### Task Lists:
- [ ] Uncompleted task
- [x] Completed task

### Tables:
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |

> This is a blockquote with **bold** text.

**HTML tags:** <b>Bold</b> and <i>italic</i> and <code>code</code>.

**Escaped:** \\\\*not italic\\\\* and \\\`not code\\\`

\`\`\`javascript
function example() {
  return "code block";
}
\`\`\`

Text with footnote[^1] reference.

[^1]: This is the footnote definition.

---

This tests **all** markdown elements!`;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Markdown Cleaner
                                </h1>
                                <p className="text-sm text-slate-600">
                                    Transform messy markdown into clean,
                                    readable text
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInput(sampleMarkdown)}
                            className="hidden sm:flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Try Sample
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Paste Your Markdown
                        </h2>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInput(sampleMarkdown)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                            >
                                <Sparkles className="h-4 w-4" />
                                Try Sample
                            </Button>
                            <div className="text-sm text-slate-500">
                                {input.length.toLocaleString()} characters
                            </div>
                        </div>
                    </div>

                    <Card className="shadow-lg border-slate-200/60">
                        <CardContent className="p-0">
                            <Textarea
                                placeholder="Paste your Markdown content here... 

Try pasting a ChatGPT response with formatting like:
# Headers, **bold text**, *italic*, `code`, [links](url), lists, tables, etc.

The cleaned version will appear below automatically!"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="min-h-[300px] border-0 resize-none focus-visible:ring-0 font-mono text-sm rounded-lg placeholder:text-slate-400 placeholder:leading-relaxed"
                            />
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            disabled={!input}
                            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear Input
                        </Button>
                    </div>
                </div>

                {/* Divider with Arrow */}
                {input && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1"></div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-slate-600">
                                    Cleaned
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1"></div>
                        </div>
                    </div>
                )}

                {/* Output Section */}
                {cleanedText && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Clean Text Output
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-slate-500">
                                    {cleanedText.length.toLocaleString()}{" "}
                                    characters
                                </div>
                                <Button
                                    onClick={handleCopy}
                                    disabled={!cleanedText}
                                    className={`flex items-center gap-2 px-6 transition-all duration-200 ${
                                        copied
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    <Copy className="h-4 w-4" />
                                    {copied ? "Copied!" : "Copy Text"}
                                </Button>
                            </div>
                        </div>

                        <Card className="shadow-lg border-slate-200/60 bg-green-50/30">
                            <CardContent className="p-6">
                                <div className="bg-white rounded-lg border border-green-200/50 p-6">
                                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                                        {cleanedText}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Empty State */}
                {!input && (
                    <div className="mt-16 text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Ready to clean your markdown
                        </h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                            Paste any markdown content above and get clean,
                            readable text instantly. Perfect for ChatGPT
                            responses!
                        </p>
                        <Button
                            onClick={() => setInput(sampleMarkdown)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Try Sample Content
                        </Button>
                    </div>
                )}
                {/* Features Section */}
                <div className="mt-16 pt-8 border-t border-slate-200">
                    <div className="text-center mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            What gets cleaned?
                        </h3>
                        <p className="text-slate-600">
                            We remove all these markdown elements to give you
                            clean, readable text
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Headers", example: "# ## ###" },
                            {
                                label: "Formatting",
                                example: "**bold** *italic*",
                            },
                            { label: "Code", example: "`code` ```blocks```" },
                            {
                                label: "Links & Lists",
                                example: "[links](url) • lists",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white p-4 rounded-lg border border-slate-200 text-center"
                            >
                                <div className="font-medium text-slate-900 mb-1">
                                    {item.label}
                                </div>
                                <div className="text-sm text-slate-500 font-mono">
                                    {item.example}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
