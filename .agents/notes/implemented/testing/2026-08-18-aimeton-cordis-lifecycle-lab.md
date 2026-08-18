# Agent Note: AIMETON Cordis lifecycle lab contract

Status: implemented

English | [中文](2026-08-18-aimeton-cordis-lifecycle-lab.zh.md)

## Problem

AIMETON is evaluating Cordis as a donor for dynamic runtime composition. Documentation claims that plugin effects unwind on unload, required-service loss deactivates dependents, providers can be replaced without process restart, and asynchronous disposal reaches cleanup completion. Those claims are useful only if they are measured against the vendored source at the pinned intake revision. The experiment must also distinguish lifecycle composition from security isolation: arbitrary JavaScript that receives an authoritative object reference may mutate it before failing.

## Decision

The AIMETON LAB-H branch keeps `vendor/cordis` unchanged and adds a focused repository script test at `scripts/aimeton-exp-h01a.spec.ts`. The test runs against the normal source-plane `@deepseek-ai/cordis` mapping and exercises three contracts:

1. one dependency-injected consumer survives repeated A → B → C capability provider replacement without changing consumer code; provider disposal removes the service, drives the consumer back to `PENDING`, and completes its registered cleanup before the next provider activates it;
2. a controlled asynchronous effect disposer must finish before `fiber.dispose()` resolves;
3. a deliberately failing plugin that closes over an external sovereign-state object can mutate that object before failure, proving Cordis lifecycle is not an authority, transaction, rollback, or sandbox boundary.

The third result is a required negative guarantee for AIMETON adoption. Sovereign Project/Mission/Truth/Authority/Cost/Time/Fencing state must therefore remain behind AIMETON-owned APIs, copy/value boundaries, grants, or stronger process/sandbox isolation. Ordinary Cordis plugins must not receive ambient mutable authoritative references.

The experiment lives under `scripts/` rather than a product package because it measures a donor runtime without shipping a new DeepSeek Harness capability. Vendored Cordis source remains byte-for-byte upstream at the pinned intake revision.

## Alternatives considered

**Modify `vendor/cordis` tests.** Rejected because LAB-H is measuring the donor, not creating a local Cordis fork. Editing vendored source or its native test inventory would weaken provenance and make later upstream comparison harder.

**Create an AIMETON production package inside DeepSeek Harness.** Rejected because EXP-H01A is research evidence, not an adopted component. A product package would falsely imply a runtime commitment before the adoption decision.

**Trust the Cordis tutorial and skip executable tests.** Rejected because documentation is M1/source evidence only. AIMETON needs an independent executable observation of cleanup, replacement, and the negative authority boundary.

## Consequences

- LAB-H gains reproducible executable evidence without modifying donor source.
- Provider replacement and disposal behavior can be re-run after any future upstream rebase to detect compatibility drift.
- A green negative-boundary test explicitly means “Cordis does not isolate ambient authoritative references”; it must never be interpreted as proving sandbox safety.
- The result supports adoption of lifecycle/effect patterns while keeping PluginAdmissionPolicy and sovereign state outside the ordinary plugin realm.
- This test is intentionally keyless and performs no provider calls, production writes, or paid operations.
