# AeroGuard-NS

**Push the flow. Guard the solve.**

[Landing page](https://aeroguard-ns.nomon-erdene-lkhagva.chatgpt.site) · [Specification](docs/SPECIFICATION.md) · [C++ API](include/aeroguard_ns.hpp)

An open-source specification and C++ API draft for a conservative reliability layer in high-vorticity computational fluid dynamics (CFD).

> **Stage: specification / API draft.** This repository does not contain an operational CFD middleware engine. The controller methods are declarations, the OpenFOAM adapter is a proposed interface, and no commercial solver integration or recovery-performance claim has been validated. The landing-page graph is illustrative.

## What is here

- [Technical specification](docs/SPECIFICATION.md): mesh-aware diagnostics, regularization, pressure–velocity coupling, MPI region tracking, and validation gates.
- [C++17 header](include/aeroguard_ns.hpp): data contracts and trial lifecycle; optional OpenFOAM adapter declarations.
- [Commercial strategy](docs/COMMERCIALIZATION.md): proposed enterprise model and pilot economics, not an offer of available services.
- [Development roadmap](docs/ROADMAP.md) and [contribution guide](CONTRIBUTING.md).
- A responsive landing page built with React and Vinext.

## Design goals

1. Detect emerging loss of numerical resolution using vorticity, axial strain, mesh metrics, and discrete energy balance.
2. Localize intervention across MPI partitions while preserving the host pressure solve.
3. Bound added dissipation and distinguish convergence from aerodynamic fidelity.
4. Keep numerical execution local; use Python for future policy and campaign tooling.

High vorticity alone is not proof of a singularity. The intervention thresholds are experimental policy values, not universal mathematical blowup thresholds. Recovery must be qualified against the host solver, mesh, flow regime and application quantities.

## Run the landing page

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run lint
```

Production is a static export; no application server, Server Actions, or data collection is deployed. Vercel deployment is configured in `vercel.json`: framework preset **Other**, build command `npm run build`, output directory `dist/client`, and install command `npm ci`. Import this GitHub repository in Vercel with Node.js 22, or deploy with:

```sh
npx vercel --prod
```

The `.openai/hosting.json` file is retained because the build scaffold imports it; no Sites credentials or server runtime are required by the deployed static page. Forks that choose Sites hosting must register their own Site before deploying there.

## Check the interface

Requires a C++17 compiler. No OpenFOAM SDK is needed for the standalone declarations:

```sh
c++ -std=c++17 -Wall -Wextra -Werror -pedantic \
  -x c++ -fsyntax-only include/aeroguard_ns.hpp
```

This checks syntax only. There are no controller implementations to link or solver simulations to execute. Defining `AEROGUARD_WITH_OPENFOAM` requires a version-pinned OpenFOAM build and a future implemented adapter.

## Integration status

| Target | Current status |
|---|---|
| OpenFOAM | Proposed functionObject and conservative stress-hook declarations |
| ANSYS Fluent | UDF integration requirements specified; not implemented |
| Cadence Fidelity | Product-specific OEM integration requirements specified; not implemented |
| Python management API | Planned |
| LES / kinetic coupling | Architecture only; qualification required |

Vendor names identify proposed integration targets. This project is independent and is not affiliated with or endorsed by OpenAI, OpenFOAM, ANSYS, Cadence, Siemens, or the FIA.

## Research context

The discussion was motivated by OpenAI's September 8, 2026 [Navier–Stokes announcement](https://openai.com/index/navier-stokes-solution/), [paper](https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf), and [Lean repository](https://github.com/openai/NavierStokesAndEuler). This project does not independently verify that proof, implement its construction, or claim that ordinary CFD crashes are physical singularities. No external paper or proof source is bundled.

## Contribute and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Original project source and documentation are released under the [MIT license](LICENSE). Third-party dependencies retain their own licenses. A permissive project license does not override OpenFOAM or proprietary SDK redistribution requirements.

## Dependency status

The pinned starter dependency tree has known npm advisories, including RSC server and development/image tooling. This release publishes static files only. Before enabling server features or exposing a development server, upgrade and re-audit the affected dependencies. The starter tools remain local/CI dependencies; this repository does not claim a clean dependency audit.
