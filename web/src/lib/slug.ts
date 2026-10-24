/** Convert a name to lower-kebab-case, e.g. "My Cool System" -> "my-cool-system". */
export function kebabCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
