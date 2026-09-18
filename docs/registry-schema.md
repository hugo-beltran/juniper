# Registry schema

> The custom Juniper registry: a JSON index plus per-entry JSON files with inlined source, palette dependencies and anatomy notes, generated from the repository at every deploy. This page documents the published paths, the schema, how an agent consumes it and how a component is registered.

The registry is LLM-first and speaks its own schema. It is not a shadcn
registry and has no CLI; consumers are agents or a plain fetch.

## 1. Published paths

All paths are relative to the site base, `https://hugo-beltran.github.io/juniper/`.
They are a contract: consumers store these URLs, so they MUST NOT be renamed
or moved. New paths are added beside them.

| Path | Content |
| --- | --- |
| `llms.txt` | Crawl entry point: links every doc and entry with a one-line description |
| `docs/<slug>.md` | Normative reference docs, verbatim copies of `docs/` in the repo |
| `registry/index.json` | Every entry with type, category and URL. Fetch this first |
| `registry/components/<name>.json` | One component entry |
| `registry/lib/<name>.json` | One shared helper (`cn`, `blobatar-palette`) |
| `registry/theme.json` | The theme and global stylesheets, and every `--juni-*` property |
| `registry/schema/index.schema.json` | JSON Schema, draft 2020-12, for the index |
| `registry/schema/entry.schema.json` | JSON Schema, draft 2020-12, for entries |

Every JSON file carries a `$schema` URL and `schemaVersion: 1`. All URLs in
the files are absolute. Responses are served with `Access-Control-Allow-Origin: *`.

## 2. Index

```json
{
  "$schema": ".../registry/schema/index.schema.json",
  "schemaVersion": 1,
  "name": "juniper",
  "description": "…",
  "baseUrl": "https://hugo-beltran.github.io/juniper/",
  "repository": "https://github.com/hugo-beltran/juniper",
  "llms": ".../llms.txt",
  "schema": { "index": "…", "entry": "…" },
  "docs": [{ "slug": "theming", "title": "Theming rules", "summary": "…", "url": "…" }],
  "entries": [
    { "name": "button", "type": "component", "category": "primitive",
      "title": "Button", "description": "…", "url": ".../registry/components/button.json" }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `baseUrl` | Absolute prefix every published path hangs off, with trailing slash |
| `docs[]` | Reference docs in reading order; `summary` is the doc's blockquote |
| `entries[]` | Every entry; `category` is present only for components |

## 3. Entry

```json
{
  "$schema": ".../registry/schema/entry.schema.json",
  "schemaVersion": 1,
  "name": "button",
  "type": "component",
  "title": "Button",
  "description": "…",
  "category": "primitive",
  "url": ".../registry/components/button.json",
  "anatomy": [{ "part": "Button", "description": "…" }],
  "usage": ["…"],
  "files": [
    { "path": "src/components/button/button.module.css", "kind": "style", "content": "…" },
    { "path": "src/components/button/button.tsx", "kind": "component", "content": "…" }
  ],
  "palette": ["--juni-bark-200", "--juni-needle-400", "…"],
  "dependencies": {
    "npm": ["class-variance-authority", "react-aria-components"],
    "registry": ["cn"]
  },
  "docs": ["component-architecture", "theming"]
}
```

| Field | Source | Meaning |
| --- | --- | --- |
| `name` | directory | Kebab-case identifier, the directory under `src/components/` |
| `type` | generator | `component`, `lib` or `theme` |
| `title`, `description` | sidecar | Human and agent-facing naming |
| `category` | sidecar | `primitive` (one react-aria primitive, reusable anywhere), `composite` (assembled from primitives, reusable), `layout` (a surface or container), `demo` (a reference composition for the demo app; copy its patterns, not the component). Components only |
| `anatomy[]` | sidecar | Named parts with a sentence each. Components only |
| `usage[]` | sidecar | Rules and guidance, one sentence each. Components only |
| `files[]` | derived | Every `.ts`, `.tsx` and `.css` file in the directory with full `content`. `kind`: `component` (.tsx), `style` (.css), `hook` (use-*.ts), `util` (other .ts) |
| `palette[]` | derived | Sorted `--juni-*` properties referenced by the entry's CSS. For `theme`, every property it defines |
| `dependencies.npm[]` | derived | Package names imported by the entry's source, validated against `package.json` |
| `dependencies.registry[]` | derived | Other entries imported through `@/components/…` or `@/lib/…` |
| `docs[]` | sidecar | Slugs of the reference docs that govern the entry |

3.1. **Derived fields are never hand-typed.** File lists, palette steps and
dependencies are read from source at build time so they cannot drift from
the code. The sidecar carries only what source cannot express.

3.2. **Source is inlined.** A single fetch of an entry yields every file
needed to reproduce it. Files are not published at separate URLs because
GitHub Pages serves `.ts` and `.tsx` with media types many fetch tools
refuse.

## 4. Consuming the registry as an agent

1. Fetch `llms.txt` or `registry/index.json`.
2. Read the docs listed under `docs[]`; they are normative and short.
3. Pick an entry and fetch its `url`.
4. Fetch `registry/theme.json` and confirm the entry's `palette[]` is a
   subset of the theme's `palette[]`. Install the theme's files first.
5. Fetch each name in `dependencies.registry[]` and repeat.
6. Install `dependencies.npm[]`, write `files[]` to the listed paths (or
   your project's equivalent), and import through your own barrel.
7. Apply the `usage[]` rules; they encode the decisions the source alone
   does not show.

## 5. Registering a component

Every directory exported from `src/components/index.ts` MUST carry a
`registry.json` sidecar. The build fails otherwise.

```json
{
  "title": "Button",
  "description": "One or two sentences: what it is and what makes it Juniper's.",
  "category": "primitive",
  "anatomy": [
    { "part": "Button", "description": "The single root element…" }
  ],
  "usage": [
    "Use onPress and isDisabled, not onClick and disabled.",
    "…"
  ],
  "docs": ["component-architecture", "theming"]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Display name |
| `description` | yes | Used in the index and `llms.txt` |
| `category` | yes | See §3 |
| `anatomy` | yes | One item per named part; a single-element component lists its root |
| `usage` | yes | Rules a consumer must follow; write them as sentences an agent can quote |
| `docs` | no | Governing doc slugs; defaults to none |

Do not put file lists, palette steps or dependencies in the sidecar. The
generator ignores unknown fields today and MAY reject them in a future
`schemaVersion`.

## 6. Generation and validation

The generator lives in `scripts/registry/` and runs as a Vite plugin during
`vite build`. It reads the barrel, the sidecars, the component directories,
`src/lib`, `src/styles` and `docs/`, derives the fields above, runs the
conformance checks listed in [Theming rules](./theming.md), and emits the
files into `dist/` beside the app. The URL prefix is Vite's `base` joined to
the site origin, so a base change re-points every URL consistently.

To validate published files against the schema:

```bash
npx -p ajv-cli -p ajv-formats ajv validate --spec=draft2020 -c ajv-formats \
  -s registry/schema/entry.schema.json -d "registry/components/*.json"
```

## 7. Versioning

`schemaVersion` is bumped only for breaking shape changes (a removed or
retyped field). Additive fields ship without a bump. Consumers SHOULD
tolerate unknown fields.
