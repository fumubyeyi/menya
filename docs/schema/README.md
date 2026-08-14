# Schema

- [database-schema.md](database-schema.md) — relational schema and ER diagram for Menya, derived from the `Menya.prototype` app's TypeScript data model.
- [openapi.yaml](openapi.yaml) — OpenAPI 3.1 spec for a real Menya API sitting in front of that schema: one resource with CRUD paths per table that a client would query or mutate independently, nested collections for the rest.

## Serving the OpenAPI spec

No live API exists yet — the prototype is client-only — but the spec on its
own is enough to mock the API, browse it as docs, or validate it after an
edit. All of this runs through the [Scalar](https://github.com/scalar/scalar)
CLI via `npx`, no install required.

### Interactive docs

Renders the spec as browsable, human-readable API docs (endpoints, request/
response schemas, examples):

```bash
npx @scalar/cli document serve docs/schema/openapi.yaml --watch
```

Prints a local URL to open. `--watch` reloads it whenever `openapi.yaml`
changes; drop the flag for a one-off preview.

### Mock server

Spins up a fake server that returns realistic example responses for every
route in the spec — useful for pointing a frontend at something before a
real backend exists:

```bash
npx @scalar/cli document mock docs/schema/openapi.yaml
```

Routes are served under the spec's `servers` base path (`/v1`), so hit e.g.
`http://127.0.0.1:<port>/v1/students`, not the bare root — the CLI prints
the exact base URL and port on startup.

### Validate

Confirms the spec is still well-formed after an edit (catches bad `$ref`s,
malformed YAML, missing required fields):

```bash
npx @scalar/cli document validate docs/schema/openapi.yaml
```
