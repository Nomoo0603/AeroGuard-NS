# Development roadmap

No schedule or production support commitment is implied.

## Available

- Technical architecture and mathematical monitor specification.
- C++17 declarations, MPI region structures and trial lifecycle.
- MIT-licensed landing page and documentation.

## Milestone 1: reference diagnostics

- Version the field schema and define validity flags.
- Implement vorticity, strain and mesh metrics against manufactured fields.
- Pin an OpenFOAM release and add a shadow-only functionObject.
- Test MPI region identity across partition changes and periodic interfaces.
- Establish honest overhead and false-positive baselines.

Exit: reproducible diagnostics without field mutation.

## Milestone 2: conservative recovery

- Implement controller state persistence and full host rollback.
- Insert bounded stress before momentum assembly.
- Validate energy and pressure/flux consistency.
- Compare against existing solver recovery on held-out cases.

Exit: measured recovery benefit with application fidelity gates.

## Milestone 3: industrial adapters

- Pursue product-specific Fluent and Cadence integration access.
- Qualify compressible, rotating and moving-mesh variants separately.
- Establish signed releases, dependency review and support boundaries.

## Research extension: kinetic coupling

LBM/DSMC coupling is separately funded research. Require conservative mapping, pressure response, sampling-error bounds, regime eligibility and joint rollback before industrial use.
