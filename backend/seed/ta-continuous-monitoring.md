# Technical Approach — Continuous Monitoring for a Civilian Agency SOC

## Understanding of the requirement
The government requires a 24x7 monitoring capability aligned to NIST 800-137 and CDM Phase 3 (what is happening on the network). We will operate a hybrid SOC: Aether analysts in a CONUS facility plus customer-furnished SIEM licenses.

## Methodology
1. **Discover.** Inventory log sources against the agency's CDM dashboard; gap-close high-value systems first (domain controllers, email gateways, EDR).
2. **Detect.** Tune correlation rules weekly. Prioritize ATT&CK techniques T1059, T1078, and T1021 based on the agency threat model.
3. **Respond.** Follow IR playbooks mapped to NIST 800-61. Priority-1 events page the on-call lead within 15 minutes.
4. **Report.** Monthly ATO evidence binders: AU-2, AU-6, SI-4, IR-4, IR-6.

## Staffing
Maya Chen (SOC Lead) plus two 8-hour analyst shifts and one weekend rover. Surge staff from our Secret-cleared bench within 10 business days.

## Quality and risk
We use a RACI with the government ISSO. The primary risk is incomplete log onboarding; we mitigate with a 30-day source-of-truth workshop and a written waiver log.
