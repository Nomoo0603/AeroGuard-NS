# AeroGuard-NS technical specification

Version 0.1 — design draft, 2026-09-08.

## 1. Scope and product contract

AeroGuard-NS is a proposed conservative CFD reliability layer. It detects loss of resolution, chooses bounded interventions, and records conservation and fidelity evidence. It is not a singularity detector or a guarantee that a stabilized result is accurate.

The current repository contains declarations and design documentation only. The requirements below describe intended behavior, not implemented functionality.

### Components

| Component | Responsibility | Location |
|---|---|---|
| Solver adapter | Fields, gradients, actual face fluxes, stress, mesh and lifecycle hooks | Each solver process |
| Monitor | Vortex amplification, mesh resolution, discrete balances | Each MPI rank |
| Region tracker | Connected components, partition reconciliation, persistent history | Participating ranks |
| Controller | Time-step reduction, regularization, refinement/restart, qualified coupling | Collective decision |
| Conservation auditor | Continuity, energy, interface inventory and intervention budgets | Solver processes |
| Python management layer | Policy validation and campaign evidence | Outside solver iterations; planned |
| Optional enterprise service | Licensing, policy distribution and aggregate reports | On-premises or approved cloud; planned |

No cloud connectivity or Python callbacks belong in the numerical loop. A capability handshake must disable unsupported active modes. Monitoring support does not imply momentum modification or complete rollback support.

V1 targets fixed-mesh, constant-density, transient incompressible solvers. Compressible, moving-mesh, rotating-frame and kinetic adapters need separate validation.

## 2. Mathematical monitor

### Governing scope and units

For constant density and viscosity on a fixed mesh:

$$\nabla\cdot u=0,\qquad \partial_tu+(u\cdot\nabla)u=-\rho^{-1}\nabla p+\nu\nabla^2u+f.$$

All API quantities use SI units; force input $f$ is acceleration. Adapters must distinguish physical pressure from OpenFOAM's kinematic pressure.

Reconstruct gradients with the host's boundary and non-orthogonality treatment:

$$G_{ij}=\partial u_i/\partial x_j,\quad S=(G+G^T)/2,\quad W=(G-G^T)/2,\quad \omega=\nabla\times u.$$

$$Q=(W:W-S:S)/2,\qquad \hat\omega=\omega/|\omega|,$$

$$s_\omega=\hat\omega^T S\hat\omega,\qquad S_{axial}=s_\omega\hat\omega\otimes\hat\omega.$$

Orientation-based quantities are invalid below the declared vorticity floor. Positive axial strain measures vortex stretching. It is not sufficient to infer runaway behavior:

$$\frac{D}{Dt}\frac{|\omega|^2}{2}=\omega^T S\omega+\nu\omega\cdot\nabla^2\omega+\omega\cdot(\nabla\times f).$$

Compressible and non-inertial adapters must include their additional physical terms.

### Directional mesh resolution

For a polyhedral cell of volume $V_K$ and centroid $x_K$:

$$M_K=\frac{12}{V_K}\int_K(x-x_K)(x-x_K)^T\,dV,\quad P_\perp=I-\hat\omega\hat\omega^T,$$

$$h_{\perp,K}=\sqrt{\lambda_{max}(P_\perp M_KP_\perp)}.$$

Retain a separately qualified LES filter width $\Delta_K$. Cell-volume cube roots alone do not describe stretched meshes adequately.

On a face-connected patch, with volume-weighted averaging:

$$\ell_{\perp,K}=\sqrt{\frac{\langle|\omega|^2\rangle}{\langle\|(\nabla\omega)P_\perp\|_F^2\rangle+\langle|\omega|^2\rangle/L_{ref}^2}},\qquad N_{\perp,K}=\ell_{\perp,K}/h_{\perp,K}.$$

$L_{ref}$ is a fixed reference length. This is an operational variation scale, not a universal vortex radius. Incoherent axis directions, inadequate stencils or poor reconstruction invalidate the estimate. Patch averaging avoids relying on a core-center derivative that may vanish by symmetry.

### Transient growth

$$g_\omega=(\partial_t+u\cdot\nabla)\log\sqrt{|\omega|^2+\omega_0^2},$$

$$A_\omega=|\omega|/\omega_{ref},\quad A_s=\frac{\max(s_\omega,0)}{\sqrt{2S:S}+\omega_0},\quad A_g=\frac{\max(g_\omega,0)}{|\omega|+\omega_0}.$$

Freeze zone-specific $\omega_{ref}$ from an accepted baseline. Do not allow a growing risk signal to normalize itself away. Compute physical growth from accepted transient history, not rejected trial states or SIMPLE iteration counts.

Track peak vorticity, transverse scale and axial extent over physical time. Shrinking width and increasing slenderness provide supporting evidence only.

### Energy balance

For a scalar eddy-viscosity model:

$$e=\tfrac12\rho|u|^2,\qquad T=2\rho(\nu+\nu_t)S.$$

Use the actual stress for other closures and handle isotropic turbulence pressure consistently.

$$\partial_te+\nabla\cdot[(e+p)u-Tu]+T:\nabla u-\rho f\cdot u=0.$$

Construct a discrete residual using actual host operators:

$$R_{E,K}=D_te_K+\frac{1}{V_K}\sum_{f\in\partial K}F_{E,f}+D_K-P_K.$$

$D_K$ is stress dissipation and $P_K$ is body-force power. All terms have units W/m³. Retain the signed residual and its absolute magnitude. Normalize positive unexplained production:

$$\eta_{E,K}=\frac{\max(R_{E,K},0)}{|D_te_K|+V_K^{-1}\sum_f|F_{E,f}|+|D_K|+|P_K|+E_0/T_0}.$$

Local energy growth may be physical because of pressure work and advection. A small residual does not exclude strong vortex growth. If compatible face energy transfers are unavailable, label the residual approximate and disable energy-certified recovery.

### Experimental policy

| Indicator | Initial activation value |
|---|---:|
| Relative vorticity | $A_\omega>4$ |
| Rotation classification | $Q>0$ |
| Axial stretching | $A_s>0.10$ |
| Growth per rotation timescale | $A_g>0.10$ |
| Resolution | $N_\perp<4$ |
| Positive energy defect | $\eta_E>0.01$ |

The vortex flag is the conjunction of the first five conditions. Energy, continuity and algebraic failure are independent channels; they do not require a vortex flag. These numbers are starting points for qualification and are not mathematical singularity thresholds.

Ordinary activation requires three accepted samples. Exit requires ten accepted samples below half the activation levels and a minimum physical dwell time. Non-finite fields, invalid cells and pressure-solver failures bypass persistence.

```text
OBSERVE → WATCH → REGULARIZE → RECOVER → OBSERVE
                    ↓
             ROLLBACK / STOP
```

For steady SIMPLE, disable physical growth and blowup interpretation. Use residual trends, boundedness, continuity and spatial resolution; adjust relaxation or restart policies.

## 3. Conservative recovery

### Temporal response

For transient integration, start qualification with:

$$\Delta t_{new}=\min(\Delta t_{proposed},0.2/(\max|\omega|+\omega_0),0.1/(\max s_\omega^++\omega_0),\Delta t_{CFL}).$$

Start with convective CFL ≤ 0.5; retain stricter host acoustic, diffusion, chemistry and mesh-motion limits. Time-step reduction cannot repair insufficient spatial resolution.

### Region and buffer

Use face-connected flagged cells as cores. Reconcile across processor and periodic boundaries, then dilate through the stencil plus expected movement before the next update. Begin with at least three buffer layers and validate sensitivity. Preserve walls and hybrid-model shielding. Bounding boxes are metadata, not intervention masks.

For distance $d_K$ from the core and buffer width $b$:

$$z_K=\operatorname{clip}(1-d_K/b,0,1),\quad\alpha_K^{target}=3z_K^2-2z_K^3,$$

$$\alpha_K^{n+1}=\alpha_K^n+(1-e^{-\Delta t/\tau_{ramp}})(\alpha_K^{target}-\alpha_K^n).$$

Freeze activation and viscosity through each momentum/pressure correction cycle.

### Stress insertion

Within a qualified LES region, select a pinned SGS target such as WALE:

$$\nu_{add}=\alpha\min[\nu_{cap},\max(0,\nu_{target}-\nu_{t,base})],\quad T_{add}=2\rho\nu_{add}S.$$

Avoid adding a second complete closure. If more damping is required than the SGS target provides, identify and qualify it as an additional numerical model.

$$E_{add}(t)=\int_0^t\sum_K2\rho\nu_{add,K}(S_K:S_K)V_K\,dt.$$

Budget affected volume, duration, cumulative dissipation, viscosity and retries. In compressible formulations, include stress work consistently in total energy.

RANS-to-LES switching requires transient integration, appropriate mesh resolution, incoming fluctuations, turbulence-state initialization, development buffers and wall treatment. A viscosity change alone is not a valid conversion. If eligibility fails, stay within the qualified model or checkpoint for a remeshed/transient workflow.

### PISO / SIMPLE / PIMPLE contract

Keep all cells in the host pressure domain for the stress path:

$$A(\nu+\nu_{t,base}+\nu_{add})u=H-\nabla p.$$

1. Insert the full conservative symmetric stress before momentum assembly, including variable-viscosity effects.
2. Recompute momentum inverse diagonals and predictor face fluxes.
3. Assemble the pressure correction from those updated coefficients.
4. Apply host Rhie–Chow, non-orthogonal and boundary corrections consistently.
5. Correct both cell velocity and face flux.
6. Evaluate continuity, energy, convergence and intervention budgets collectively.
7. Commit only after all ranks pass.

Never clamp velocity after pressure correction. In PIMPLE, reassemble consistently when coefficients change between outer iterations.

Restore velocity, pressure, face fluxes, all old-time fields, turbulence state, mesh state, controller history and auxiliary solver state on rollback. If complete rollback is unavailable, use checkpoint/restart. Limit retries; do not repeatedly restart an irrecoverable case.

## 4. Kinetic coupling: separately qualified extension

LBM is a discrete distribution-function method, not generally molecular particle tracking. Hydrodynamic LBM remains subject to continuum limits, mesh/lattice adequacy and turbulence closure.

DSMC is for rarefied/non-equilibrium gas flow. Gate it on continuum validity, for example:

$$Kn_{GLL}=\lambda\max(|\nabla\rho|/\rho,|\nabla T|/T,\|\nabla u\|/c_{th}).$$

Combine this with geometry-scale Knudsen numbers and model-specific evidence; do not use vorticity as the sole trigger.

### Coupling protocol

1. Build a conservative FV-to-kinetic volume mapping and buffer.
2. Initialize density, velocity, temperature and compatible non-equilibrium stress.
3. Warm up the patch before granting interface-transfer authority.
4. Subcycle within each FV macro-step.
5. Exchange integrated mass, momentum and total-energy transfers.
6. Iterate interface state and pressure response until tolerances pass.
7. Commit both states atomically.

Each interface face has one ledger, used with opposite signs:

$$\mathcal F_f=(\int\dot m_fdt,\int\dot{\boldsymbol P}_fdt,\int\dot E_fdt).$$

Count overlap inventory once. Expose the kinetic interface mass-transfer response to pressure for a condensed interface pressure system, or iterate a conservative surrogate representation to consistency. Arbitrary prescribed patch boundaries are insufficient.

Include kinetic patch mass accumulation for weakly compressible LBM and DSMC. Reject when conservation fails, sampling uncertainty exceeds budget or the patch leaves its validated regime. Without vendor pressure/flux hooks, kinetic replacement is unsupported.

## 5. Software and MPI contracts

See [`include/aeroguard_ns.hpp`](../include/aeroguard_ns.hpp).

- Use C++17 internally. Cross proprietary SDK boundaries through a versioned C ABI with opaque handles and explicit buffers; the C ABI is not implemented here.
- Catch internal errors at `noexcept` boundaries and convert to collective status decisions.
- `beginTrial` uses accepted host state; `assess` produces a collective verdict; host and controller commit or restore together.
- Field views are non-owning and valid only for the documented call lifetime. Caller allocates outputs. Reject stale mesh or partition epochs.
- Define and version `validityFlags` and diagnostic schemas before implementing active behavior. Zero validity means no trusted diagnostic.
- Positive caps and acceptance tolerances must be configured before active mode. Default shadow mode performs no field mutation.

### Distributed regions

Use persistent global cell/face IDs with refinement/coarsening lineage. Reconcile connected-component labels over processor faces. Minimum cell ID labels the current component; persistent region identity follows overlap and predicted motion, with split/merge parents recorded.

Reduce bounds by MIN/MAX, counts/volume by SUM and peaks by MAX. Count owned cells only; empty boxes are explicitly invalid. Apply periodic transforms before matching. Use a participant coordinator, not a mandatory rank-zero global gather.

Serialize fields explicitly; structures containing vectors cannot be transmitted as raw bytes. Include schema version, payload length and epoch. Use the host's MPI runtime and supported primitives; never initialize a competing MPI implementation. Every rank follows identical collective ordering, including ranks without active cells. Rebuild membership only at accepted step boundaries. Rank failure uses the host's supported checkpoint/restart behavior.

### Adapter matrix

| Adapter | Monitoring | Active control |
|---|---|---|
| OpenFOAM | Custom functionObject | Version-pinned conservative stress assembly and lifecycle hooks |
| Fluent | Compiled UDF diagnostics and user memory | Qualified time-step/viscosity hooks; conservative assembly and rollback verified per configuration |
| Fidelity | Selected product's field/residual interfaces | OEM-supported product/version-specific integration |

OpenFOAM Foundation and OpenCFD require separate builds. Function objects are not a substitute for in-flight assembly control. Fluent adjustment/end-of-step callbacks have distinct timing. A generic public Fidelity pressure-coupling API is not assumed.

Python is reserved for validated, immutable policy packages and event/campaign analysis. Activate policy changes only at accepted boundaries and record a hash. No per-cell Python or cloud dependency is permitted.

## 6. Production qualification

Result statuses: **accepted**, **recovered—review required**, or **rejected**. Convergence alone cannot produce accepted status.

Test manufactured fields, resolved high-vorticity flows, under-resolved turbulence, mesh/time refinement, MPI decomposition changes, restarts, topology mapping, interface conservation and representative industrial cases. Assess lift/drag, moments, pressure spectra, efficiency or stall metrics against accepted references and uncertainty bounds.

Compare with the customer's best existing bounded schemes, adaptation and restart workflow. Use held-out geometries and operating points.

Proposed targets, not measurements:

- Monitoring overhead median ≤2%, 95th percentile ≤5% on a declared suite.
- No field mutation in shadow mode.
- Explicit caps on affected volume, duration, dissipation and retry count.
- Recovery success counted only if application fidelity passes.
- Separate cost/error budgets for LES and kinetic coupling.

Pin solver, compiler, MPI, adapter and policy versions. Record time, cell/region IDs, mesh/partition epoch, trigger values, intervention, integrated energy cost, convergence and application gates, rejection reason, and checkpoint provenance. Keep all geometry/data local by default.

## 7. Sources and interpretation

- [OpenAI announcement](https://openai.com/index/navier-stokes-solution/), [166-page paper](https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf), [Lean repository](https://github.com/openai/NavierStokesAndEuler): research motivation, not a universal CFD threshold or an independently verified result of this project.
- [Clay problem statement](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf).
- [OpenFOAM function objects](https://doc.openfoam.com/2212/tools/post-processing/function-objects/) and [fvOptions](https://doc.openfoam.com/2306/fundamentals/case-structure/fvoptions/).
- [Fluent UDF lifecycle](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_udf/flu_udf_GeneralSolverDEFINE.html), [SGS models](https://ansyshelp.ansys.com/public/Views/Secured/corp/v261/en/flu_th/flu_th_sec_les_sgs_models.html), [Embedded LES](https://ansyshelp.ansys.com/public/Views/Secured/corp/v252/en/flu_ug/flu_ug_eles_setup.html).
- [Cadence CFD portfolio](https://www.cadence.com/en_US/home/tools/system-analysis/computational-fluid-dynamics.html).
- [SPARTA documentation](https://sparta.github.io/doc/Section_intro.html).

The mathematical monitor and intervention rules are proposed engineering designs. They require implementation and empirical qualification; no singularity-detection theorem is claimed.
