/** A language can be deleted only while no vocab and no folder uses it. */
export function isLanguageInUse(usage: { vocabCount: number; folderCount: number }): boolean {
  return usage.vocabCount > 0 || usage.folderCount > 0;
}
