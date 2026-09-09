#ifndef AEROGUARD_NS_HPP
#define AEROGUARD_NS_HPP

// API design draft, C++17. Declarations only; not a solver implementation.
// SI units. No MPI initialization/finalization, Python, or network I/O here.
#include <array>
#include <cstddef>
#include <cstdint>
#include <memory>
#include <vector>

namespace aeroguard {

using GlobalId = std::uint64_t;
using RegionId = std::uint64_t;
using Epoch = std::uint64_t;
using Vec3 = std::array<double, 3>;

template<class T> struct View {
    T* data = nullptr;
    std::size_t size = 0;
};

enum class Status : std::uint8_t {
    ok, invalidInput, unsupported, staleEpoch, capacityExceeded,
    couplingFailed, retryRequired, checkpointRequired
};
enum class Phase : std::uint8_t {
    observe, watch, regularize, recover, stopped
};
enum class Action : std::uint8_t {
    none, reduceStep, regularize, refineAndRestart,
    kineticCoupling, rollback, checkpointAndStop
};
enum class RunMode : std::uint8_t { shadow, active };
enum class TimeMode : std::uint8_t { physicalTransient, steadyIteration };
enum class Capability : std::uint64_t {
    monitor = 1ull << 0, adaptiveStep = 1ull << 1,
    conservativeStress = 1ull << 2, fullRollback = 1ull << 3,
    topologyMapping = 1ull << 4, interfaceFlux = 1ull << 5,
    pressureResponse = 1ull << 6
};

struct StepKey {
    std::uint64_t step = 0;
    std::uint32_t attempt = 0;
    Epoch meshEpoch = 0;
    Epoch partitionEpoch = 0;
    double time = 0.0;
    double dt = 0.0; // Physical seconds; not a SIMPLE iteration surrogate.
    TimeMode timeMode = TimeMode::physicalTransient;
};

struct Aabb {
    Vec3 lower{};
    Vec3 upper{};
    bool valid = false; // Empty ranks must not contribute zero bounds.
};

struct CellSignal {
    GlobalId cell = 0;
    double omega = 0.0;                 // s^-1
    double axialStrain = 0.0;           // s^-1
    double qCriterion = 0.0;            // s^-2
    double materialLogOmegaGrowth = 0.0;// s^-1, physicalTransient only
    double transverseWidth = 0.0;       // m
    double transverseMeshSize = 0.0;    // m
    double energyResidual = 0.0;        // W/m^3, signed unexplained production
    double energyScale = 0.0;           // W/m^3, positive
    double continuityDefect = 0.0;      // normalized, nonnegative
    double courant = 0.0;
    std::uint32_t validityFlags = 0;    // Versioned bit definitions in schema.
};

// Local membership is authoritative. Boxes are discovery/telemetry metadata.
struct RegionShard {
    RegionId id = 0;                    // Persistent within the run UUID.
    GlobalId componentLabel = 0;        // Minimum cell ID, current component.
    Epoch meshEpoch = 0;
    Epoch partitionEpoch = 0;
    std::int32_t coordinatorRank = -1;   // Rank in adapter communicator.
    std::int32_t localRank = -1;
    Aabb localBox{};
    Aabb globalBox{};
    std::vector<GlobalId> ownedCells;
    std::vector<GlobalId> interfaceFaces;
    std::vector<std::int32_t> participantRanks;
    std::vector<RegionId> parents;       // Split/merge lineage.
    std::uint64_t globalOwnedCellCount = 0;
    double globalVolume = 0.0;
    double peakOmega = 0.0;
    double addedEnergyJ = 0.0;
    double lastSeenTime = 0.0;
    Phase phase = Phase::observe;
};

struct MonitorPolicy {
    RunMode mode = RunMode::shadow;
    double omegaReference = 0.0;        // Required, frozen qualified baseline.
    double omegaRatioOn = 4.0;          // Experimental starting values only.
    double axialFractionOn = 0.10;
    double growthPerTurnOn = 0.10;
    double minCoreCells = 4.0;
    double energyResidualOn = 0.01;
    double courantTarget = 0.5;
    double rotationStepTarget = 0.2;
    double strainStepTarget = 0.1;
    double offRatio = 0.5;
    std::uint32_t onSamples = 3;
    std::uint32_t offSamples = 10;
    std::uint32_t minBufferLayers = 3;
    std::uint32_t maxRetries = 2;
    double nuAddedCap = 0.0;            // m^2/s; required before active use.
    double maxAddedEnergyJ = 0.0;       // Required before active use.
    double maxAffectedVolumeFraction = 0.01;
    double massTolerance = 0.0;         // Required case-specific tolerance.
    double energyTolerance = 0.0;
};

struct Decision {
    Action action = Action::none;
    double dtScale = 1.0;
    std::uint64_t reasonBits = 0;
};

struct TrialReport {
    bool finite = false;
    bool pressureConverged = false;
    bool fidelityBudgetPassed = false;
    double massDefect = 0.0;
    double energyDefect = 0.0;
    double addedEnergyJ = 0.0;
    double affectedVolumeFraction = 0.0;
};

// Integral over one host macro-step. Orientation: outward from FV region.
// Both solvers consume this same ledger with opposite signs.
struct InterfaceTransfer {
    GlobalId face = 0;
    Epoch meshEpoch = 0;
    double massKg = 0.0;
    Vec3 momentumKgMPerS{};
    double totalEnergyJ = 0.0;
    double massStdErrorKg = 0.0;        // DSMC sampling uncertainty.
};

// Implemented with OpenFOAM Pstream or vendor-supported parallel primitives.
// All ranks call collective methods in identical order, including empty ranks.
// Never pass raw RegionShard bytes to MPI (it owns vectors).
class DistributedRegions {
public:
    virtual ~DistributedRegions() = default;
    virtual Status rebuild(const StepKey&, View<const CellSignal>) noexcept = 0;
    virtual View<const RegionShard> localShards() const noexcept = 0;
    virtual Status agree(const Decision& local, Decision& global) noexcept = 0;
};

class Controller {
public:
    Controller(const MonitorPolicy&, DistributedRegions&);
    ~Controller();
    Controller(const Controller&) = delete;
    Controller& operator=(const Controller&) = delete;

    // Once per trial, from the last accepted host state; collectively called.
    Status beginTrial(const StepKey&, View<const CellSignal>, Decision&) noexcept;
    // Owned-cell ordering supplied by adapter; fills caller-owned SI fields.
    // Hold fields fixed throughout momentum/pressure correctors.
    Status regularization(View<double> alpha, View<double> nuAdded) const noexcept;
    // Collective verdict. Commit only when every rank and host gate passes.
    Status assess(const TrialReport&, Decision&) noexcept;
    Status commit() noexcept;
    Status rollback() noexcept; // Host separately restores ALL solver histories.
    // Invoke only at an accepted step boundary; rebuild mapped histories.
    Status meshChanged(const StepKey&, View<const GlobalId> newOwnedIds) noexcept;
    Status saveState(std::vector<std::byte>&) const noexcept;
    Status restoreState(View<const std::byte>) noexcept;
private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace aeroguard

// Optional OpenCFD adapter declaration. Build against a pinned release.
// Separate builds are required for Foundation and OpenCFD distributions.
#if defined(AEROGUARD_WITH_OPENFOAM)
#include "fvMeshFunctionObject.H"
#include "fvMatrices.H"
#include "volFields.H"

namespace Foam {
namespace functionObjects {

class aeroGuardNS final : public fvMeshFunctionObject {
public:
    TypeName("aeroGuardNS");
    aeroGuardNS(const word&, const Time&, const dictionary&);
    ~aeroGuardNS() override;
    bool read(const dictionary&) override;
    bool execute() override; // Monitoring only; cannot rescue an in-flight solve.
    bool write() override;
private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace functionObjects

// Custom transient incompressible solver calls before assembling UEqn.
// Term on LHS: -div(2*nuAdded*dev(symm(grad(U)))); includes transpose stress.
// Adapter implementation must use the host's conservative face operators.
tmp<fvVectorMatrix> aeroGuardStressLhs(
    volVectorField& U, const volScalarField& nuAdded);

} // namespace Foam
#endif
#endif
