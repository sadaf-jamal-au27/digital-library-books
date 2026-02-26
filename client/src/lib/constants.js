// Categories: DevOps & tech topics first, then general (order preserved in filters)
export const DEVOPS_CATEGORIES = [
  'DevOps',
  'AWS',
  'GCP',
  'Azure',
  'Terraform',
  'CI/CD',
  'Docker',
  'Kubernetes',
  'GitHub',
  'Python',
  'Bash',
  'Programming',
  'AI',
  'LLM',
  'Scripting',
  'Cloud',
  'SRE',
];

// All categories (DevOps first + general) – used for Upload/Edit dropdowns so options always visible
export const ALL_CATEGORIES = [
  ...DEVOPS_CATEGORIES,
  'Fiction',
  'Romance',
  'Fantasy',
  'Thriller',
  'Mystery',
  'Science Fiction',
  'History',
  'Self-Help',
  'Business',
  'Biography',
];

// Book types: technical/development/AI first, then general
export const BOOK_TYPES = [
  'Technical',
  'Programming',
  'Development',
  'AI',
  'LLM',
  'Novel',
  'Non-Fiction',
  'Reference',
  'Tutorial',
  'eBook',
  'PDF',
];

// Legacy: keep for any code that still references topic "types"
export const DEVOPS_TOPIC_TYPES = [
  'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD', 'Docker', 'Kubernetes', 'GitHub', 'Python', 'Bash',
];

export function orderedCategories(apiCategories = []) {
  const set = new Set(apiCategories);
  const ordered = DEVOPS_CATEGORIES.filter((c) => set.has(c));
  const rest = apiCategories.filter((c) => !DEVOPS_CATEGORIES.includes(c)).sort();
  return [...ordered, ...rest];
}

export function orderedTypes(apiTypes = []) {
  const set = new Set(apiTypes);
  const ordered = BOOK_TYPES.filter((t) => set.has(t));
  const rest = apiTypes.filter((t) => !BOOK_TYPES.includes(t)).sort();
  return [...ordered, ...rest];
}
