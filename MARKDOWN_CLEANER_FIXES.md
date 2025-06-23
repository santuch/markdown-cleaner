# 🔧 Markdown Cleaner - Issues & Fixes Plan

## 🐛 **Issues Identified from Test Output**

### 1. **Task Lists Not Properly Cleaned**

**Problem:** `- [ ] Uncompleted task` → `[ ] Uncompleted task` (still shows brackets)
**Current Regex:** `/^[\s]*-\s*\[[x\s]\]\s+/gim`
**Issue:** Only removes the `-` but leaves `[ ]` and `[x]`
**Fix:** Update regex to remove the entire checkbox pattern

### 2. **Table Cleaning Issues**

**Problem:** Table headers disappear completely
**Current Output:**

```
Name Age City

John 25 NYC
Jane 30 LA
```

**Issue:** Table header row and separator rows not handled properly
**Fix:** Improve table detection and keep header information

### 3. **Escape Characters Not Fully Cleaned**

**Problem:** `\\*not italic\\*` → `\\not italic\\` (double backslashes remain)
**Current Regex:** `/\\([*_`#\[\]()~])/g`
**Issue:** Only handles single backslash escapes
**Fix:** Handle multiple backslashes

### 4. **Code Block Remnants**

**Problem:** Code blocks leave artifacts like `` `javascript``
**Current Output:**

```
``javascript
function example() {
  return "code block";
}
``
```

**Issue:** Code block regex not catching all variants
**Fix:** Improve code block detection

### 5. **Footnote Definition Cleanup**

**Problem:** `: This is the footnote definition.` (colon remains)
**Current Regex:** `/^\[\^\d+\]:\s*.+$/gm`
**Issue:** Removes footnote marker but leaves colon and content
**Fix:** Better footnote definition handling

### 6. **Blockquote Cleanup**

**Problem:** Need to preserve content but remove `>` markers
**Current:** Works but could be improved for nested blockquotes

---

## 🎯 **Fix Implementation Plan**

### Fix 1: Task Lists

**Before:** `/^[\s]*-\s*\[[x\s]\]\s+/gim`
**After:** `/^[\s]*-?\s*\[[x\s]\]\s*/gim`

### Fix 2: Tables

**Before:** Simple split and join
**After:** Better table detection with header preservation option

### Fix 3: Escape Characters

**Before:** `/\\([*_`#\[\]()~])/g`**After:**`/\\+([*_`#\[\]()~])/g` (handle multiple backslashes)

### Fix 4: Code Blocks

**Before:** Multiple separate regexes
**After:** Single comprehensive regex with better boundary detection

### Fix 5: Footnote Definitions

**Before:** `/^\[\^\d+\]:\s*.+$/gm`
**After:** Complete removal including content

### Fix 6: Order of Operations

**Current:** Some cleanups interfere with others
**After:** Optimize order for better results

---

## 🧪 **Test Cases to Verify**

1. **Task Lists:**

    - `- [ ] Task` → `Task`
    - `- [x] Done` → `Done`

2. **Tables:**

    - Keep meaningful structure
    - Remove separator lines
    - Preserve data readability

3. **Escape Characters:**

    - `\\*text\\*` → `*text*`
    - `\\\`code\\\`` → `` `code` ``

4. **Code Blocks:**

    - Complete removal without artifacts
    - Handle nested code blocks

5. **Footnotes:**
    - `Text[^1]` → `Text`
    - `[^1]: Definition` → Complete removal

---

## ✅ **Success Criteria**

The cleaned output should be:

-   Completely free of markdown syntax
-   Readable plain text
-   No formatting artifacts
-   Preserves actual content meaning
