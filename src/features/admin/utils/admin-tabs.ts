// Add a tab here only when its page exists, so no link leads to a 404.
// The nav and the page header both read this list, so each page has one source for its title and description.
export const ADMIN_TABS = [
  { path: '/admin', labelKey: 'nav.overview', descriptionKey: 'overview.description' },
  { path: '/admin/users', labelKey: 'nav.users', descriptionKey: 'users.description' },
  { path: '/admin/plans', labelKey: 'nav.plans', descriptionKey: 'plans.description' },
  { path: '/admin/languages', labelKey: 'nav.languages', descriptionKey: 'languages.description' },
  { path: '/admin/word-types', labelKey: 'nav.wordTypes', descriptionKey: 'wordTypes.description' },
  { path: '/admin/broadcasts', labelKey: 'nav.broadcasts', descriptionKey: 'broadcasts.description' },
  { path: '/admin/system', labelKey: 'nav.system', descriptionKey: 'system.description' },
] as const;
