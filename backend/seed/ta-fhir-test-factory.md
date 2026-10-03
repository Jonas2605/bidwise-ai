# Technical Approach — FHIR Interface Test Factory for EHR Modernization

## Approach overview
We will stand up a "test factory" that treats every FHIR R4 resource as a versioned fixture. Automated packs run on each sprint; failures open defects with ICD paragraph citations so developers can fix against the contract, not tribal knowledge.

## Phases
- **Phase 1 (30 days):** Baseline the Interface Control Document; freeze resource profiles for Patient, Encounter, Observation, and MedicationRequest.
- **Phase 2 (60 days):** Wire CI to the lower environments; publish a nightly interoperability scorecard to the PMO.
- **Phase 3 (steady state):** Defect aging SLA of 7 days; quarterly tabletop with the ISSO on compensating controls.

## Tools
Postman/Newman collections, a lightweight FHIR validator, Jira, and a Confluence evidence binder. No proprietary lock-in.

## Why this reduces proposal risk
This is the same factory used on VA EHR interface support (contract 36C10B21D0004), where first-pass success reached 98.4% after sprint 4.
