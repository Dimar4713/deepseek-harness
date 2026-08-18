# AIMETON LAB-H · EXP-H01A

This branch is an AIMETON research branch over the pristine fork baseline.

## Provenance

- AIMETON fork: `Dimar4713/deepseek-harness`
- upstream: `deepseek-ai/deepseek-harness`
- intake SHA: `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca`
- intake release: `dsh@0.1.0-rc.7`
- license: MIT
- upstream maturity: Developer Preview
- Commander tracking: `Dimar4713/aimeton-commander` Issue #30 (`CMD-019 / EXP-H01`)

The fork default branch `master` is kept as an upstream baseline. AIMETON modifications and experiments belong on `aimeton/*` branches.

## EXP-H01A hypothesis

Cordis-style dependency injection and reversible effects can provide dynamic capability replacement without restarting the Commander process, while AIMETON keeps Project/Mission/Truth/Authority state outside the replaceable plugin realm.

## Upstream mechanisms under test

At the intake revision, Cordis documents:

- plugin fibers with lifecycle `PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED`, plus `FAILED`;
- `ctx.effect()` resources with disposer-based cleanup;
- child plugins recursively disposed with their owner;
- service dependencies that can keep a plugin pending or deactivate it when a required service disappears;
- built-in registrations/listeners/tools as reversible effects;
- hot reload and explicit disposal without requiring process restart.

These are upstream claims to be measured, not AIMETON acceptance evidence yet.

## Measurements

1. plugin mount latency;
2. unload/dispose latency;
3. disposer completion and leak count;
4. dependency appearance/disappearance behavior;
5. repeated load/unload cycles without stale registrations;
6. failure isolation after plugin `apply()` error;
7. async disposer ordering hazards;
8. state preserved outside the plugin after replacement;
9. behavior under hot reload;
10. exact source/revision and runtime versions used for every result.

## Sovereign boundary

The experiment MUST NOT allow ordinary plugin replacement of:

- Project identity;
- authoritative Mission state;
- Truth Gate policy;
- AuthorityPolicy;
- Cost/Budget policy;
- trusted-time policy;
- Activity lease/fencing rules;
- plugin-admission/security policy.

The donor's `everything is a plugin` principle is therefore a research input, not the AIMETON target invariant.

## Acceptance

EXP-H01A is complete only when evidence demonstrates:

- a plugin can mount, expose a capability, unload and remove all registrations without process restart;
- the same capability can be replaced by another provider without changing the consumer;
- dependency loss produces deterministic safe lifecycle behavior;
- repeated replacement does not leak handlers/resources;
- plugin failure cannot corrupt an external sovereign-state fixture;
- limitations and failure modes are recorded;
- an adoption decision is made: `idea/pattern`, `bounded component`, `external-runtime`, or `reject`.

## Restrictions

- no paid provider calls;
- no production credentials;
- no production infrastructure writes;
- no direct merge from this LAB branch to `aimeton-commander`;
- no claim that Cordis is accepted as a Commander dependency until experiment evidence exists.
