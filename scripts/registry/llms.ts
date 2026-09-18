import type { DocLink, RegistryEntry } from "./types.ts";

/* llms.txt — the crawl entry point (https://llmstxt.org): an H1, a
 * blockquote summary, then H2 sections of `- [title](url): description`
 * links. Absolute URLs so the file is self-sufficient wherever it is read. */

export interface LlmsInput {
  baseUrl: string;
  repository: string;
  docs: DocLink[];
  entries: RegistryEntry[];
}

export function renderLlmsTxt({
  baseUrl,
  repository,
  docs,
  entries,
}: LlmsInput): string {
  const components = entries.filter((e) => e.type === "component");
  const libs = entries.filter((e) => e.type === "lib");
  const theme = entries.find((e) => e.type === "theme");

  const link = (title: string, url: string, description: string) =>
    `- [${title}](${url}): ${description}`;

  const lines = [
    "# Juniper",
    "",
    "> Juniper is a design-system contract, not a code package: a warm-neutral, forest-toned identity built on oklch `--juni-*` palette ramps with a light/dark axis, and a component architecture of react-aria-components primitives, CVA variants and colocated CSS modules. This surface publishes the normative reference docs and a machine-readable component registry so any project or LLM agent can adopt the contract without access to the Juniper repository.",
    "",
    "The reference docs are normative: MUST, SHOULD and MAY carry their RFC 2119 meaning. The registry is generated from the Juniper source at every deploy; each component entry inlines its full source files and lists the palette steps it depends on. Start with the registry index, then fetch entries by URL.",
    "",
    "## Reference docs",
    "",
    ...docs.map((d) => link(d.title, d.url, d.summary)),
    "",
    "## Registry",
    "",
    link(
      "Registry index",
      `${baseUrl}registry/index.json`,
      "Every published entry with its type, category and URL. Fetch this first.",
    ),
    link(
      "Index schema",
      `${baseUrl}registry/schema/index.schema.json`,
      "JSON Schema (draft 2020-12) for the registry index.",
    ),
    link(
      "Entry schema",
      `${baseUrl}registry/schema/entry.schema.json`,
      "JSON Schema (draft 2020-12) for component, lib and theme entries.",
    ),
    ...(theme ? [link(theme.title, theme.url, theme.description)] : []),
    "",
    "## Components",
    "",
    ...components.map((c) =>
      link(
        c.title,
        c.url,
        `${"category" in c ? `${c.category} — ` : ""}${c.description}`,
      ),
    ),
    "",
    "## Lib",
    "",
    ...libs.map((l) => link(l.title, l.url, l.description)),
    "",
    "## Optional",
    "",
    link(
      "Repository",
      repository,
      "Juniper source on GitHub. Not required — every file the contract needs is inlined in the registry.",
    ),
    link(
      "Demo app",
      baseUrl,
      "The Juniper dashboard, built from the same components the registry publishes.",
    ),
    "",
  ];
  return lines.join("\n");
}
