interface PageTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

const MIN_SNIPPET_LENGTH = 8;
const SNIPPET_LENGTH = 60;

// Best-effort: chunk text was re-flowed by the backend's chunker, so it won't
// match a page's text layer byte-for-byte. We anchor on a short normalized
// prefix and accept the first substring hit rather than trying to align the
// whole passage.
export function findTextMatch(items: PageTextItem[], query: string): number[] | null {
  const snippet = query.replace(/\s+/g, " ").trim().slice(0, SNIPPET_LENGTH).toLowerCase();
  if (snippet.length < MIN_SNIPPET_LENGTH) return null;

  let text = "";
  const ranges: { start: number; end: number }[] = [];
  for (const item of items) {
    const start = text.length;
    text += item.str;
    ranges.push({ start, end: text.length });
    text += " ";
  }

  const matchStart = text.toLowerCase().indexOf(snippet);
  if (matchStart === -1) return null;
  const matchEnd = matchStart + snippet.length;

  const itemIndices = ranges
    .map((range, index) => ({ ...range, index }))
    .filter((range) => range.start < matchEnd && range.end > matchStart)
    .map((range) => range.index);

  return itemIndices.length > 0 ? itemIndices : null;
}
