export function formatStaticFilename(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-')
}
