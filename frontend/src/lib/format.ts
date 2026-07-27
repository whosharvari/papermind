/** "sentence-transformers/all-MiniLM-L6-v2" -> "all-MiniLM-L6-v2" */
export function shortModelName(fullName: string): string {
  const lastSegment = fullName.split("/").pop();
  return lastSegment && lastSegment.length > 0 ? lastSegment : fullName;
}
