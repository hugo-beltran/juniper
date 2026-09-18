/* Shapes of the published Juniper registry. These interfaces are the in-repo
 * mirror of the JSON Schema files in ./schema — the generator produces
 * output typed against them, and the schema is what consumers validate
 * against. Change both together. Documented for consumers in
 * docs/registry-schema.md. */

export const SCHEMA_VERSION = 1;

export type EntryType = "component" | "lib" | "theme";

export type ComponentCategory = "primitive" | "composite" | "layout" | "demo";

export type FileKind = "component" | "style" | "hook" | "util";

/* Hand-authored metadata, colocated as src/components/<name>/registry.json.
 * Everything else in a component entry is derived from source. */
export interface Sidecar {
  title: string;
  description: string;
  category: ComponentCategory;
  anatomy: AnatomyPart[];
  usage: string[];
  /** Slugs of reference docs that govern this component. */
  docs?: string[];
}

export interface AnatomyPart {
  part: string;
  description: string;
}

export interface RegistryFile {
  /** Repo-relative path, e.g. src/components/button/button.tsx */
  path: string;
  kind: FileKind;
  content: string;
}

export interface Dependencies {
  /** npm package names, resolved against package.json dependencies. */
  npm: string[];
  /** Names of other registry entries this one imports. */
  registry: string[];
}

interface EntryBase {
  $schema: string;
  schemaVersion: number;
  name: string;
  type: EntryType;
  title: string;
  description: string;
  url: string;
  files: RegistryFile[];
  /** --juni-* custom properties referenced by this entry's CSS. */
  palette: string[];
  dependencies: Dependencies;
  docs: string[];
}

export interface ComponentEntry extends EntryBase {
  type: "component";
  category: ComponentCategory;
  anatomy: AnatomyPart[];
  usage: string[];
}

export interface LibEntry extends EntryBase {
  type: "lib";
}

export interface ThemeEntry extends EntryBase {
  type: "theme";
}

export type RegistryEntry = ComponentEntry | LibEntry | ThemeEntry;

export interface IndexEntry {
  name: string;
  type: EntryType;
  title: string;
  description: string;
  category?: ComponentCategory;
  url: string;
}

export interface DocLink {
  slug: string;
  title: string;
  summary: string;
  url: string;
}

export interface RegistryIndex {
  $schema: string;
  schemaVersion: number;
  name: string;
  description: string;
  baseUrl: string;
  repository: string;
  llms: string;
  schema: { index: string; entry: string };
  docs: DocLink[];
  entries: IndexEntry[];
}
