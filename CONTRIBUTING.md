# Contributing to AeroGuard-NS

This is a specification-stage project. Useful contributions include mathematical corrections, discretization reviews, reproducible validation cases and version-specific adapter designs.

1. Open an issue describing the problem, assumptions, solver/version and expected evidence.
2. For implementation work, include a small reproducible case and relevant conservation or accuracy checks.
3. Distinguish implemented behavior, proposed behavior and measured performance in documentation.
4. Keep examples synthetic or explicitly cleared for public redistribution. Do not contribute proprietary meshes, vendor SDK source, credentials or customer outputs.
5. Submit changes in a pull request. Contributions are under the repository's MIT license, subject to retained third-party notices.

## Checks

```sh
npm ci
npm run build
npm run lint
c++ -std=c++17 -Wall -Wextra -Werror -pedantic -x c++ -fsyntax-only include/aeroguard_ns.hpp
```

The header check validates declarations only. CFD tests will be added when executable numerical behavior exists. Avoid tests that merely repeat interface declarations.

## Numerical reporting

Report mesh/time refinement, reference data, uncertainty, intervention exposure and application quantities. A completed run is not evidence of accuracy. No universal blowup threshold or unsupported speedup claim belongs in the project.

## Third-party integration

The MIT license applies to original project material. It does not authorize redistribution of proprietary solver code or override GPL obligations. Keep adapter dependencies and notices explicit.

Lint covers project-owned code. Unmodified scaffold components under `components/ui` and its `hooks/use-mobile.ts` helper are excluded; they are not used by this landing page. Review and qualify any of those components before introducing them into a feature.
