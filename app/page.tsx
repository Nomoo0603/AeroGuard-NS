import {
  ArrowUpRight,
  ArrowRight,
  GitBranch,
  Activity,
  Layers3,
  ShieldCheck,
  Terminal,
  MoveUpRight,
} from 'lucide-react';

const repo = 'https://github.com/Nomoo0603/AeroGuard-NS';
const spec = `${repo}/blob/main/docs/SPECIFICATION.md`;

function SignalDiagram() {
  return (
    <figure className="signal-panel" aria-labelledby="diagram-title">
      <div className="panel-top">
        <span>
          <i /> SYSTEM DESIGN / 001
        </span>
        <span>CONCEPTUAL</span>
      </div>
      <div className="signal-heading">
        <span id="diagram-title">Intervene before the run is lost.</span>
        <span className="axis-label">RISK →</span>
      </div>
      <svg
        className="signal-chart"
        viewBox="0 0 560 290"
        aria-label="Conceptual risk diagram: an increasing risk signal enters an intervention zone, then a proposed recovery path returns below the threshold. This is not measured performance."
      >
        <defs>
          <linearGradient id="zone" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#d2ff5a" stopOpacity=".10" />
            <stop offset="1" stopColor="#d2ff5a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 100, 160, 220, 280].map((y) => (
          <line
            key={`h${y}`}
            x1="20"
            y1={y}
            x2="540"
            y2={y}
            stroke="#25374b"
            strokeWidth="1"
          />
        ))}
        {[20, 100, 180, 260, 340, 420, 500, 540].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            y1="20"
            x2={x}
            y2="280"
            stroke="#25374b"
            strokeWidth="1"
          />
        ))}
        <rect x="255" y="20" width="140" height="260" fill="url(#zone)" />
        <line
          x1="20"
          y1="110"
          x2="540"
          y2="110"
          stroke="#92a5b8"
          strokeDasharray="5 6"
        />
        <path
          d="M20 234 C70 234 92 225 130 220 S200 195 230 175 S285 125 310 85 S355 20 383 8"
          fill="none"
          stroke="#f5a66c"
          strokeWidth="2"
          strokeDasharray="5 6"
        />
        <path
          d="M20 234 C70 234 92 225 130 220 S200 195 230 175 S269 123 286 112 S319 117 340 143 S395 193 432 203 S501 217 540 214"
          fill="none"
          stroke="#d2ff5a"
          strokeWidth="3"
        />
        <circle
          cx="286"
          cy="112"
          r="9"
          fill="#142b31"
          stroke="#d2ff5a"
          strokeWidth="2"
        />
        <circle cx="286" cy="112" r="3" fill="#d2ff5a" />
        <text x="30" y="98" fill="#a2b3c6" fontSize="13" fontFamily="monospace">
          policy threshold
        </text>
        <text
          x="370"
          y="46"
          fill="#f5a66c"
          fontSize="13"
          fontFamily="monospace"
        >
          unmitigated risk
        </text>
        <text
          x="367"
          y="249"
          fill="#d2ff5a"
          fontSize="13"
          fontFamily="monospace"
        >
          proposed recovery
        </text>
      </svg>
      <div className="diagram-flow">
        <span>01 OBSERVE</span>
        <ArrowRight size={14} />
        <span className="active-flow">02 INTERVENE</span>
        <ArrowRight size={14} />
        <span>03 VERIFY</span>
      </div>
      <figcaption>
        Illustrative behavior only. No benchmark or recovery claim.
      </figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header wrap">
        <a className="wordmark" href="#main" aria-label="AeroGuard-NS home">
          <Activity size={25} strokeWidth={1.8} />
          <span>
            AeroGuard<span className="wordmark-suffix">—NS</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#architecture">Architecture</a>
          <a href="#roadmap">Roadmap</a>
          <a className="nav-github" href={repo}>
            GitHub <ArrowUpRight size={16} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> OPEN SOURCE · SPECIFICATION v0.1
            </p>
            <h1>
              Push the flow.
              <br />
              <span>Guard the solve.</span>
            </h1>
            <p className="hero-description">
              A conservative reliability layer for high-vorticity CFD. Detect
              loss of resolution, bound the intervention, and make every
              recovery auditable.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={repo}>
                <GitBranch size={19} /> Explore the source{' '}
                <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href={spec}>
                Read the specification <ArrowRight size={18} />
              </a>
            </div>
            <p className="stage-note">
              Early-stage architecture & C++ API draft.
              <br />
              Solver integrations and performance validation are planned.
            </p>
          </div>
          <SignalDiagram />
        </section>
        <div className="compatibility wrap">
          <span className="eyebrow">DESIGNED TO INTEGRATE WITH</span>
          <div>
            <span>
              OpenFOAM<span className="registered">®</span>
            </span>
            <span>ANSYS Fluent</span>
            <span>Cadence Fidelity</span>
          </div>
          <p>Proposed adapters. No vendor affiliation or endorsement.</p>
        </div>
        <section id="architecture" className="section wrap">
          <div className="section-heading">
            <p className="eyebrow">01 / THE ARCHITECTURE</p>
            <h2>
              Convergence is only
              <br />
              half the problem.
            </h2>
            <p>
              A run that finishes still needs to be right. AeroGuard is designed
              to keep numerical recovery accountable to conservation and
              aerodynamic accuracy.
            </p>
          </div>
          <div className="principles">
            <article>
              <div className="card-label">
                <Activity />
                <span>01</span>
              </div>
              <h3>Observe the physics</h3>
              <p>
                Combine vorticity, axial strain, mesh resolution, and local
                energy balance. High vorticity alone is never proof of a
                singularity.
              </p>
              <div className="formula">
                ω = ∇ × u <span>·</span> s<sub>ω</sub> = ω̂ᵀ S ω̂
              </div>
            </article>
            <article>
              <div className="card-label">
                <Layers3 />
                <span>02</span>
              </div>
              <h3>Localize the response</h3>
              <p>
                Track connected regions across MPI boundaries. Apply bounded
                stress corrections while preserving the global pressure solve.
              </p>
              <div className="formula">observe → watch → regularize</div>
            </article>
            <article>
              <div className="card-label">
                <ShieldCheck />
                <span>03</span>
              </div>
              <h3>Account for the change</h3>
              <p>
                Log added dissipation and affected volume. Accept, flag for
                review, or reject each result against an explicit fidelity
                budget.
              </p>
              <div className="formula">conservation + fidelity → accept</div>
            </article>
          </div>
        </section>
        <section className="engineering-section">
          <div className="engineering wrap">
            <div>
              <p className="eyebrow">02 / BUILT FOR THE SOLVER LOOP</p>
              <h2>
                Small interface.
                <br />
                Explicit guarantees.
              </h2>
              <p>
                C++ at the numerical boundary. Python for policies and campaign
                analysis. No cloud dependency in the proposed solver loop.
              </p>
              <a
                className="text-link"
                href={`${repo}/blob/main/include/aeroguard_ns.hpp`}
              >
                Inspect the C++ header <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="code-panel">
              <div className="panel-top">
                <span>
                  <Terminal size={15} /> aeroguard_ns.hpp
                </span>
                <span>API DRAFT</span>
              </div>
              <pre>
                <code>
                  <span className="code-muted">
                    {'// Trial lifecycle — declarations only'}
                  </span>
                  {'\n'}
                  <span className="code-blue">Status</span> beginTrial(step,
                  signals, decision);{'\n'}
                  <span className="code-blue">Status</span>{' '}
                  regularization(alpha, nuAdded);{'\n'}
                  <span className="code-blue">Status</span> assess(report,
                  decision);{'\n\n'}
                  <span className="code-muted">
                    {'// Commit only after all gates pass.'}
                  </span>
                  {'\n'}
                  <span className="code-blue">Status</span> commit();{'\n'}
                  <span className="code-blue">Status</span> rollback();
                </code>
              </pre>
              <div className="code-footer">
                <span>C++17</span>
                <span>MPI-aware design</span>
                <span>MIT licensed</span>
              </div>
            </div>
          </div>
        </section>
        <section id="roadmap" className="section wrap roadmap">
          <div className="section-heading">
            <p className="eyebrow">03 / OPEN DEVELOPMENT</p>
            <h2>
              A clear path
              <br />
              from spec to solver.
            </h2>
            <p>
              Start with inspectable interfaces. Earn production claims through
              reproducible validation.
            </p>
            <a className="text-link" href={`${repo}/blob/main/CONTRIBUTING.md`}>
              Help build AeroGuard <ArrowUpRight size={18} />
            </a>
          </div>
          <ol className="roadmap-list">
            <li>
              <span className="roadmap-number">01</span>
              <div>
                <span className="phase-tag current">AVAILABLE NOW</span>
                <h3>Architecture & API</h3>
                <p>
                  Mathematical monitor design, recovery contracts, MPI region
                  structures, and a C++ header draft.
                </p>
              </div>
            </li>
            <li>
              <span className="roadmap-number">02</span>
              <div>
                <span className="phase-tag">PLANNED</span>
                <h3>Reference implementation</h3>
                <p>
                  OpenFOAM shadow-mode monitoring, reproducible fixtures, and
                  conservation-aware trial control.
                </p>
              </div>
            </li>
            <li>
              <span className="roadmap-number">03</span>
              <div>
                <span className="phase-tag">REQUIRES QUALIFICATION</span>
                <h3>Industrial integration</h3>
                <p>
                  Validated recovery policies, version-specific vendor adapters,
                  and customer benchmark campaigns.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="closing wrap">
          <p className="eyebrow">FOR CFD METHODS TEAMS & SOLVER DEVELOPERS</p>
          <h2>
            Make difficult flows
            <br />
            an open engineering problem.
          </h2>
          <a className="button button-primary" href={repo}>
            Build with us on GitHub <MoveUpRight size={20} />
          </a>
          <p>
            Inspect the design. Challenge the assumptions. Contribute the
            evidence.
          </p>
        </section>
      </main>
      <footer className="site-footer wrap">
        <a className="wordmark" href="#main">
          <Activity size={20} />
          <span>AeroGuard—NS</span>
        </a>
        <span>Independent project · MIT license · © 2026</span>
        <div>
          <a href={`${repo}/blob/main/LICENSE`}>License</a>
          <a href={spec}>Specification</a>
          <a href={repo}>GitHub ↗</a>
        </div>
      </footer>
    </>
  );
}
