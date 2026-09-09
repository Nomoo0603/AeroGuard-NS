# Commercial strategy — proposal

The project is open source under MIT. Enterprise offerings described here are planning hypotheses, not currently available products, vendor partnerships or measured customer outcomes.

## Value and buyers

Sell reduced **cost per accepted aerodynamic result**: avoidable failed-job compute, recovery effort and time-to-decision, with explicit accuracy gates.

| Buyer | Champion | Economic rationale |
|---|---|---|
| F1 aero department | CFD methods lead | More accepted results inside the applicable allocation |
| Aerospace OEM | CFD verification lead | Fewer failed campaigns and auditable modeling changes |
| Turbomachinery team | Aerothermal methods lead | Reliable exploration near difficult regimes |
| Cadence, Siemens, ANSYS | Solver architecture lead | Embedded reliability and reduced support escalation |

## Proposed packaging (USD)

| Offer | Price hypothesis | Scope |
|---|---:|---|
| 8–12 week qualification pilot | $30k–$60k | One solver release/use case, historical replay and paired trials |
| Monitor | $25k–$60k/year | Qualified package, diagnostics, evidence and support |
| Recovery | $100k–$200k/year | Qualified intervention and campaign policies |
| Enterprise | $250k–$600k/year | Multiple sites/adapters, air-gapped deployment, release qualification and SLA |
| Additional integration | $75k–$250k one-time | Defined adapter/platform acceptance matrix |
| OEM integration | $200k–$600k non-recurring | SDK work, qualification and joint release engineering |

For MIT-covered source, customers retain the license's free-use rights. Commercial fees purchase supported builds, qualification, maintenance, services and separately contracted capabilities—not revocation of those rights. Default to site/concurrent-job packaging; avoid per-cell/event charges.

For OEMs, propose annual minimums credited against 8–15% of attributable AeroGuard add-on net revenue. Define attribution, bundling, discounts, reporting and support ownership; do not levy against all solver revenue. Redistribution terms must account for third-party SDK and dependency licenses.

## Economic qualification

Let H be annual baseline compute hours, f avoidable waste fraction, r the fraction eliminated and o incremental AeroGuard compute divided by H:

$$H_{saved}=H(fr-o).$$

Illustration: 50 million hours × (0.18 × 0.50 − 0.015) = 3.75 million net hours. At an assumed marginal $0.12/hour, that is $450,000. These are assumptions, not benchmarks. Include retries, finer meshes and auxiliary solvers in overhead. Fixed capacity can create throughput value without equivalent cash savings.

## Go-to-market

1. Classify historical failures and exclude hardware/license outages.
2. Replay successful and failed cases in shadow mode; quantify false alerts and lead time.
3. Run paired trials against the customer's best built-in stabilization/restart workflow.
4. Validate held-out geometries and application fidelity tolerances.
5. Convert only when measured economics support the fee.
6. Approach OEMs with reproducible cases and a release qualification suite.

## Objection handling

| Objection | Response and evidence |
|---|---|
| FIA ATR compliance | Export complete resource records; claim no certification or compute exemption. Verify applicable revision and team guidance. |
| Spare GPU offload | Respect nominated-resource rules; no assumed offload exemption. |
| Damping destroys vortex physics | Cap and report dissipation/exposure; compare aerodynamic quantities, spectra and refinement. |
| Convergence hides errors | Separate acceptance, review-required and rejected results. |
| Existing stabilization is enough | Demonstrate incremental benefit against the best current workflow. |
| MPI cost exceeds savings | Measure scaling, memory and communication; report net saved compute. |
| Confidential geometry | On-premises operation, no mandatory telemetry, signed artifacts and egress tests. |
| Plugin failure harms a large job | Collective failure decisions, fault injection, complete restart evidence. |
| Adjoint inconsistency | Differentiate the policy/model or validate a fixed-policy sensitivity contract. |
| Release drift | Pin solver, compiler, MPI, adapter and policy; qualify each release. |

The reviewed [FIA 2026 Section F Issue 06](https://www.fia.com/system/files/documents/fia_2026_f1_regulations_-_section_f_operational_-_iss_06_-_2026-02-27.pdf), F4.4.3–F4.4.4, specifies nominated resources and includes message-passing time in solver accounting. Do not treat this dated source as assurance of current deployment compliance.
