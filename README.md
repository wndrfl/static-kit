# Static Kit

Static Kit is a host-agnostic toolkit for compiling CSS (SCSS), JavaScript, and
images. It is not WordPress-specific.

## Install

```bash
npm install -g @wndrfl/static-kit-cli
static install --dir ./static
static compile --dir ./static
```

Do not copy this GitHub tree into a project. `@wndrfl/static-kit-cli` stamps
the framework and owns compile, `template create`, and `component create`.

Configuration is `.staticrc`. Point `paths.dist` at nested `dist/` folders or
at a Shopify theme's flat `assets/` directory.

See the CLI's `ARCHITECTURE.md` for the contract.
