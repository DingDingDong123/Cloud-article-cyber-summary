# Multi-Cloud Access & Security Audit Tool — Build Specification for Claude Code

**Deliverable type:** build spec / guidelines document (hand directly to Claude Code).
**Tool being built:** an internal, air-gapped audit tool that runs inside Jupyter notebooks, uses native CLIs (`gcloud`, `aws`, `az`) to audit ACCESS and SECURITY POSTURE across GCP, AWS, and Azure at the organization and project level (IAM, roles, permissions, service accounts/principals, policies, exposure), and emits four outputs: a full `.xlsx`, an anonymized `.xlsx`, an `.html` report, and a `.md` report.
**Cloud depth priority:** GCP (primary) → AWS (secondary) → Azure (tertiary).
**Hard constraint:** fully air-gapped. No cloud API calls beyond the audit CLIs themselves. Any AI runs locally on a desktop — no cloud LLM APIs, ever.
**Research basis:** assembled from three verified research waves (tools + CLI inventory; risk taxonomy + anonymization; report generation + Jupyter + local AI). Maintenance/version facts verified as of June 30, 2026; forward-looking items are flagged.

---

## How to read this spec

The sections are ordered for build sequence, not for narrative. A reasonable implementation order is: (1) build the shared `Finding` data model and HMAC pseudonymizer, (2) stand up the importable `cloudaudit/` package plus the three thin per-cloud notebooks (`gcp_audit.ipynb`, `aws_audit.ipynb`, `azure_audit.ipynb`) and the `nbstripout` hook, (3) implement the check registry and the GCP audit phases, then AWS, then Azure, each wrapped in capability probing, (4) add the four renderers, (5) add the local LLM last, scoped only to narrative prose. The "Suggested Build Phases" section at the end restates this as an actionable checklist.

**Notebook structure: three separate notebooks, one per cloud** (`gcp_audit.ipynb`, `aws_audit.ipynb`, `azure_audit.ipynb`). Each is a thin orchestration layer that imports the same shared `cloudaudit/` package and runs that cloud's audit phases. Splitting per cloud keeps each notebook focused, lets a user run only the cloud(s) they have credentials for, and isolates failures (an Azure permission gap never blocks the GCP run). The three notebooks still write into the **same** normalized findings model and the same renderers, so the single-source-of-truth invariant below holds across all three. An optional thin top-level notebook (or a `run_all` function) can invoke the three in sequence and emit one combined report.

Two design invariants run through everything:
- **Single source of truth.** All four outputs render from ONE normalized findings collection — shared across all three notebooks. They must never be generated independently.
- **Determinism for findings and severity.** What counts as a finding and how severe it is must be rule-based and reproducible. The LLM never touches that path.

---

## 1. Executive Summary

This tool fills a specific gap: there is no existing open-source tool that produces exactly this set of four outputs (full + anonymized xlsx, html, md) from a unified, air-gapped, notebook-driven multi-cloud access audit. The correct strategy is therefore not to build a new scanner engine from scratch, but to **orchestrate proven tools and native CLIs behind a single normalized findings model**, add the IAM access-graph and privilege-escalation analysis that those tools do piecemeal, and own the four-output packaging layer.

The highest-value detections, in priority order, are: public/anonymous access to data or keys; usable privilege-escalation paths; service accounts/principals holding owner-equivalent or wildcard-admin privilege; missing MFA on privileged identities; and stale credentials. This ordering is not arbitrary — valid-account abuse (MITRE T1078) was the single most common cloud-intrusion technique in 2025, so the checks that attack standing over-privilege, missing MFA, and stale credentials target the highest-frequency real-world vector.

Everything in the findings/severity path is deterministic and rule-driven. A local LLM is used only to turn already-computed findings into readable executive-summary prose (and optionally human-reviewed draft remediation text). This keeps the audit defensible and reproducible while still producing a polished narrative offline.

---

## 2. Existing Tools to Leverage

Verdicts use four categories: **use-as-is**, **wrap/call from our tool**, **reference for methodology only**, **not relevant**. Maintenance verified against GitHub release/commit dates as of June 30, 2026; the 12-month-no-release bar is the demotion threshold.

### Summary

| Tool | Cloud(s) | CLI-native? | Maintained (verified) | License | Verdict |
|---|---|---|---|---|---|
| Prowler | AWS/Azure/GCP/K8s + | Yes (Python) | Yes — commits Jun 26 2026 | Apache-2.0 | **Wrap/call** |
| Steampipe | AWS/Azure/GCP + | Yes (SQL binary) | Yes — v2.4.2 Apr 22 2026 | AGPLv3 core / Apache-2.0 plugins | **Wrap/call** |
| Powerpipe | Multi (benchmarks) | Yes | Yes — commits Jun 2026 | AGPLv3 | Reference only |
| ScoutSuite | AWS/Azure/GCP + | Yes (Python) | **STALE — v5.14.0 May 2024** | Custom copyleft | Reference only |
| Cloud Custodian | AWS/Azure/GCP/K8s | Yes (Python) | Yes — CNCF, active 2026 | Apache-2.0 | Reference only |
| CloudSploit | AWS/Azure/GCP + | Yes (Node) | **STALE — v3.10.0 Nov 2024** | GPL-3.0 | Reference only |
| Forseti Security | GCP | Server | **NO — archived Jun 2023** | Apache-2.0 | Not relevant |
| GCP Security Command Center | GCP | Yes (`gcloud scc`) | Yes (Google-managed) | Proprietary | **Wrap/call** |
| GCP IAM Recommender | GCP | Yes (`gcloud recommender`) | Yes (Google-managed) | Proprietary | **Wrap/call** |
| Cloud Asset Inventory / Policy Analyzer | GCP | Yes (`gcloud asset`) | Yes (Google-managed) | Proprietary | **Use-as-is** |
| Rhino GCP-IAM-Privesc | GCP | Python scripts | Research artifact | Repo license | Reference only |
| AWS IAM Access Analyzer | AWS | Yes (`aws accessanalyzer`) | Yes (AWS-managed) | Proprietary | **Wrap/call** |
| AWS Security Hub | AWS | Yes (`aws securityhub`) | Yes (AWS-managed) | Proprietary | **Wrap/call** |
| AWS Trusted Advisor | AWS | Partial (Support API) | Yes (support-tier gated) | Proprietary | Reference only |
| PMapper | AWS | Yes (Python lib) | Maintained (slow) | AGPLv3 | **Wrap/call** |
| Cloudsplaining | AWS | Yes (Python) | Maintained — v0.8.2 | BSD-3 (Salesforce OSS) | **Wrap/call** |
| Repokid | AWS | Server (DynamoDB) | Questionable; Lyft fork archived | Apache-2.0 | Not relevant |
| Microsoft Defender for Cloud | Azure | Yes (`az security`) | Yes (MS-managed) | Proprietary | **Wrap/call** |
| Azure Resource Graph | Azure | Yes (`az graph`) | Yes (MS-managed) | Proprietary | **Use-as-is** |
| AzureHound | Azure/Entra | Yes (Go binary) | Yes — v2.12.x 2026 | Apache-2.0 | Reference only |
| PSRule for Azure | Azure | Yes (PowerShell) | Yes — active 2024–2026 | MIT | Reference only |

### Notes per cloud

**Multi-cloud.** Prowler (https://github.com/prowler-cloud/prowler) is the posture-scan workhorse: 1,700+ checks across 70+ frameworks, all three clouds, native HTML/CSV/JSON output, Apache-2.0, actively maintained. Wrap it for CIS/best-practice posture and ingest its JSON; do not reimplement its checks. Steampipe (https://github.com/turbot/steampipe) exposes cloud APIs as SQL — the closest architectural match to a notebook-driven audit; call `steampipe query "<SQL>" --output json` and load into pandas. **License caution:** Steampipe's CLI/FDW core is AGPLv3 (plugins/mods are Apache-2.0); invoking the unmodified binary as a separate process is fine, but do not vendor or modify it. The same AGPLv3 caution applies to Powerpipe and PMapper. ScoutSuite and CloudSploit are both stale (no release in 12+ months) — methodology references only.

**GCP (primary).** Forseti is archived (June 2023) — do not build on it; its "effective permissions" concept now maps to Policy Analyzer (`gcloud asset analyze-iam-policy`). The backbone of the GCP audit is Cloud Asset Inventory + Policy Analyzer (use-as-is). Layer SCC findings and IAM Recommender where the tier/permissions allow (wrap/call). Port the Rhino Security Labs GCP privesc permission catalog into our own scanner (methodology only — capture detection logic, not exploit scripts).

**AWS (secondary).** Use IAM Access Analyzer (external + unused access) and Security Hub (where enabled) as finding sources. For IAM risk analytics, wrap PMapper (privilege-escalation graph, importable Python library) and Cloudsplaining (least-privilege policy analysis, HTML/JSON). Trusted Advisor's programmatic access is gated behind a Business/Enterprise support plan — methodology reference only. Repokid is a heavy remediation service, not relevant to a read-only audit.

**Azure (tertiary).** Azure Resource Graph is the backbone (use-as-is): one KQL query over `authorizationresources` returns tenant-wide role assignments, far more efficient than per-subscription loops. Wrap Defender for Cloud secure-score/assessments where enabled. AzureHound's attack-path edge logic is a good design reference, but source the data from ARG rather than standing up Neo4j. PSRule is PowerShell/IaC-oriented — reference only.

---

## 3. CLI Command Reference (per cloud)

All commands should be invoked as argument lists with `shell=False` (see Section 7). GCP is covered in the most depth.

### 3.1 GCP

**Discovery / hierarchy**
```
gcloud organizations list
gcloud organizations describe ORG_NAME --format="value(name.segment(1))"
gcloud resource-manager folders list --organization=ORG_ID
gcloud projects list
gcloud asset search-all-resources --scope=organizations/ORG_ID \
  --asset-types="cloudresourcemanager.googleapis.com/Project" \
  --format='value(name.basename())'
```

**IAM policy / access enumeration**
```
gcloud organizations get-iam-policy ORG_ID
gcloud resource-manager folders get-iam-policy FOLDER_ID
gcloud projects get-iam-policy PROJECT_ID --flatten='bindings[].members'
gcloud asset search-all-iam-policies --scope=organizations/ORG_ID
gcloud iam roles list --project PROJECT_ID
gcloud iam roles list --filter='etag:AA=='          # custom roles only
gcloud iam service-accounts list --project PROJECT_ID
gcloud iam service-accounts get-iam-policy SA_EMAIL  # who can impersonate
gcloud iam service-accounts keys list --iam-account SA_EMAIL  # key age
```

**Effective-access analysis (Policy Analyzer)**
```
gcloud asset analyze-iam-policy --organization=ORG_ID --identity='user:user@example.com'
gcloud asset analyze-iam-policy --project=PROJECT_ID \
  --full-resource-name=FULL_RESOURCE_NAME \
  --permissions='compute.instances.get,compute.instances.start'
gcloud asset analyze-iam-policy-longrunning --organization=ORG_ID \
  --identity='user:...' --gcs-output-path=gs://BUCKET/analysis.json
```

**Inventory / recommendations / org policy / SCC**
```
gcloud asset list --organization=ORG_ID
gcloud asset export --organization=ORG_ID --content-type=resource \
  --bigquery-table=projects/P/datasets/D/tables/T --per-asset-type
gcloud recommender recommendations list --project=PROJECT_ID --location=global \
  --recommender=google.iam.policy.Recommender --format=json
gcloud resource-manager org-policies list --organization ORG_ID --show-unset
gcloud scc findings list organizations/ORG_ID --location=global
```

**Scope / auth (GCP).** Roles are hierarchical (org → folder → project inheritance). Recommended single grant at the org node: `roles/iam.securityReviewer` + `roles/cloudasset.viewer` + `roles/recommender.iamViewer` + `roles/resourcemanager.organizationViewer`, with the Cloud Asset and Recommender APIs enabled in the runner project. A greyed-out console "VIEW ACCESS" is the classic symptom of missing `cloudasset.assets.searchAllIamPolicies / searchAllResources / analyzeIamPolicy` on an ancestor.

**Rate limits / pagination (GCP).** Policy Analyzer is the key constraint: each organization gets up to **20 analysis queries per day free** (covers both allow-policy and org-policy analysis); higher volume requires an org-level SCC Premium/Enterprise activation. Prefer `search-all-iam-policies` for breadth; reserve `analyze-iam-policy` for targeted questions, or use the long-running variant with GCS export. `gcloud asset query` (QueryAssets) is SCC Premium-only and returns `UNAUTHENTICATED` otherwise. For very large inventories, prefer `gcloud asset export` to BigQuery over interactive search.

### 3.2 AWS

```
aws sts get-caller-identity
aws organizations list-accounts --query 'Accounts[?Status==`ACTIVE`].Id' --output text
aws iam get-account-authorization-details        # full snapshot per account
aws iam list-users ; aws iam list-roles ; aws iam list-policies --scope Local
aws iam generate-credential-report ; aws iam get-credential-report   # CSV (base64)
aws iam list-access-keys --user-name USER         # per-key CreateDate / Status
aws accessanalyzer list-analyzers
aws accessanalyzer list-findings --analyzer-arn ARN         # external access
aws accessanalyzer list-findings-v2 --analyzer-arn ARN      # unused access
aws iam generate-organizations-access-report --entity-path o-xxxx/r-xxxx  # mgmt acct only
aws s3api get-public-access-block --bucket B
aws s3control get-public-access-block --account-id ACCT
aws s3api get-bucket-policy-status --bucket B     # PolicyStatus.IsPublic
aws securityhub get-findings
```

**Scope / auth (AWS).** Account-centric — there is no single org-wide IAM-contents call. Standard pattern: a central security/audit account assumes a read-only role (`OrganizationAccountAccessRole` or a dedicated audit role) in each member account, then calls `get-account-authorization-details` per account. Per-account read needs `arn:aws:iam::aws:policy/SecurityAudit` (covers `iam:GetAccountAuthorizationDetails`) or `ReadOnlyAccess`; PMapper needs `ReadOnlyAccess`; Cloudsplaining needs `iam:GetAccountAuthorizationDetails`. Org-level calls (`organizations list-accounts`, `generate-organizations-access-report`) must run from the management account or a delegated admin.

**Rate limits / pagination (AWS).** IAM/STS share an account-level rate quota (`Throttling: Rate exceeded`). SDKs back off automatically — do not stack your own retries on top, and do not retry within the same one-second window. Use `MaxItems` and handle pagination (`Marker`/`--starting-token`). For many accounts, iterate serially (e.g., one account per interval), reuse `AssumeRole` credentials rather than re-assuming per call, and use regional STS endpoints (separate quotas).

### 3.3 Azure

```
az account management-group list
az account list
az role assignment list --all --include-inherited --include-groups --scope /subscriptions/SUB_ID
az role assignment list --scope /providers/Microsoft.Management/managementGroups/MG_ID
az role definition list
az graph query -q "authorizationresources \
  | where type =~ 'microsoft.authorization/roleassignments' \
  | extend roleDefinitionId = properties.roleDefinitionId, \
           principalId = properties.principalId, \
           principalType = properties.principalType, scope = properties.scope"
az ad sp list --all
az ad sp credential list --id APP_ID               # SP secret/cert expiry (metadata only)
az ad user list
az policy assignment list
az security assessment list ; az security secure-scores list
```

**Scope / auth (Azure).** Two separate planes: Azure RBAC (resources/subscriptions/management groups) and Microsoft Entra (directory). RBAC read needs `Microsoft.Authorization/roleAssignments/read` (in the **Reader** role) — you do not need User Access Administrator just to read. **Critical org-wide gotcha:** `az role assignment list` and ARG only return what you have read access to; to see the entire tenant a **Global Administrator must "elevate access"** to get User Access Administrator at root scope `/` (`az rest --method post --url "/providers/Microsoft.Authorization/elevateAccess?api-version=2016-07-01"`), then sign out/in — and remove it afterward (the action is logged). Entra reads (`az ad sp list`, `az ad user list`) from an automation service principal need a Microsoft Graph permission such as `Directory.Read.All` — separate from Azure RBAC. Management-group `--scope` must be the fully qualified ARM ID `/providers/Microsoft.Management/managementGroups/{id}`.

**Rate limits / pagination (Azure).** ARG is throttled per user; honor `x-ms-user-quota-remaining` / `x-ms-user-quota-resets-after` and page via `--first` (max 1000) + `--skip`/`--skip-token`. Use `AuthorizationScopeFilter` to control inheritance. Prefer one `authorizationresources` query at directory scope over per-subscription fan-out. Microsoft Graph (`az ad ...`) is throttled separately; for large directories use advanced-query (`$count` + `ConsistencyLevel: eventual`) and page through. Note: `--include-inherited` has a documented gap for some management-group-inherited assignments — probe at multiple scopes.

---

## 4. Risk / Finding Taxonomy

Every finding ties to a named standard. Current benchmark versions (verified): CIS GCP Foundation **v5.0.0** (May 9 2026), CIS AWS Foundations **v7.0.0** on the CIS site / **v5.0.0** supported in AWS Security Hub CSPM, CIS Azure Foundations **v3.0.0** (Feb 2025).

### 4.1 CIS IAM/access controls (condensed)

**GCP — CIS v5.0.0 Section 1 (IAM), 18 controls.** v5.0.0 inserted a Super-Admin sub-section (1.1.1 Super Admin email not tied to a single user; 1.1.2 Super Admin not used for day-to-day administration), shifting later numbers up by one vs v4.0.0. Key verified controls: 1.2 corporate login credentials (no personal Gmail); 1.3 MFA for all non-service accounts; 1.5 only GCP-managed SA keys; 1.6 SA has no admin privileges; 1.7 no Service Account User / Token Creator at project level; 1.8 user-managed SA keys rotated ≤90 days; 1.10 KMS keys not anonymously/publicly accessible; 1.11 KMS key rotation ≤90 days; 1.17 essential contacts configured; 1.18 no secrets in Cloud Functions env vars (use Secret Manager). Public-access controls for Storage (5.1) and BigQuery (7.1) live in other sections but should be treated as IAM-adjacent. Staleness threshold across GCP IAM: 90 days. (Caveat: v5.0.0 IDs 1.4, 1.9, 1.12–1.16 are inferred from the +1 renumbering shift; confirm exact titles against the gated CIS v5.0.0 PDF if build-critical.)

**AWS — CIS Section 1 (IAM).** No root access key; MFA (and hardware MFA) on root; eliminate root for daily tasks; password policy min length 14; [IAM.3] access keys rotated ≤90 days; deactivate credentials unused ≥45 days; one active access key per user; [IAM.1] no policy allows full `*` admin; [IAM.2] no policies attached directly to users; MFA for all console users. Thresholds: keys 90 days (rotation), credentials 45 days (unused).

**Azure — CIS v3.0.0 Section 1 (IAM/Entra).** MFA for privileged then all roles; 2–4 Global Administrators; review guest users monthly; restrict group creation; restrict app/user consent to verified publishers; "Subscription entering/leaving AAD directory" set to "Permit no one"; use Conditional Access + PIM for just-in-time admin.

### 4.2 MITRE ATT&CK Cloud mapping

This is a posture (state) audit — it detects the standing preconditions and artifacts that enable techniques, not runtime behavior. Findings should read "principal *can*…", not "principal *did*…".

| Technique | Name | What the audit detects |
|---|---|---|
| T1078 / T1078.004 | Valid Accounts / Cloud Accounts | Over-privileged or stale accounts still enabled; accounts without MFA |
| T1098 | Account Manipulation | Principals that can modify IAM (grant themselves access) |
| T1098.001 | Additional Cloud Credentials | Principals/SAs able to create keys; surplus user-managed keys |
| T1098.003 | Additional Cloud Roles | Principals able to add roles to themselves/apps |
| T1136 | Create Account | Principals able to create new IAM users/SAs for persistence |
| T1556 | Modify Authentication Process | Ability to alter Conditional Access/MFA/federation trust |
| T1562.008 | Disable/Modify Cloud Logging | Principals able to disable audit logging |
| T1548 | Abuse Elevation Control | Misconfigured AssumeRole trust; SA impersonation / actAs paths |
| T1552.004 | Unsecured Credentials: Private Keys | Long-lived SA keys, secrets in env vars/policy |

### 4.3 High-risk pattern catalog

Privilege-escalation rows are grounded in Rhino Security Labs GCP/AWS privesc research and Cloudsplaining's five risk categories (Data Exfiltration, Infrastructure Modification, Resource Exposure, Privilege Escalation, Credentials Exposure).

| # | Pattern | Cloud(s) | Mapping | Severity |
|---|---|---|---|---|
| 1 | Public/anonymous data/key access (`allUsers`/`allAuthenticatedUsers`, public S3/blob/KMS) | All | GCP CIS 5.1/1.10; AWS S3.1/S3.8 | Critical |
| 2 | Wildcard `*:*` / full-admin policy | AWS (primary) | AWS CIS IAM.1; Cloudsplaining | Critical |
| 3 | SA/principal with owner-equivalent/admin role | All | GCP CIS 1.6; T1078.004 | Critical |
| 4 | Usable privilege-escalation path | GCP, AWS | Rhino research; T1098/T1548 | Critical |
| 5 | Cross-account/tenant trust misconfig | AWS, Azure | T1199/T1078 | Critical/High |
| 6 | Broad role assignment at org/MG/folder scope | All | GCP CIS 1.6/1.7; Azure RBAC | High |
| 7 | Missing MFA on privileged identity | All | AWS CIS 1.4/1.5; GCP 1.3 | High (Critical for root/Global-Admin) |
| 8 | Root/Super-Admin used daily or holding keys | All | AWS CIS 1.3/1.6; GCP 1.1.2 | High (Critical if root key exists) |
| 9 | Stale/unused credentials past threshold | All | AWS 90d/45d; GCP 1.8 | High (90d) / Medium (45d) |
| 10 | Surplus/long-lived user-managed SA keys | GCP, AWS | GCP 1.5/1.8; T1098.001 | High |
| 11 | Orphaned/unused service accounts still enabled | All | T1078.004 | Medium |
| 12 | Disabled/legacy auth (no Conditional Access) | Azure | Azure CIS; T1556 | High/Medium |
| 13 | Principal can disable logging/defenses | All | AWS CIS CloudTrail; T1562.008 | High |
| 14 | Can modify resource-based policies | AWS | Cloudsplaining Resource Exposure | High |
| 15 | Unconstrained data-exfiltration permissions | AWS | Cloudsplaining Data Exfiltration | Medium (→High if public) |
| 16 | Secrets in plaintext (env vars/policy) | GCP, AWS | GCP CIS 1.18; T1552 | Medium |
| 17 | Weak password policy | AWS, Azure | AWS CIS 1.7 | Medium |
| 18 | Policies attached to users not groups | AWS | AWS CIS IAM.2 | Low |
| 19 | Missing security/essential contacts | AWS, GCP | AWS 1.1; GCP 1.17 | Low |

### 4.4 Severity model (deterministic, rule-based)

Severity reflects exploitability + blast radius of the standing misconfiguration, mirroring how Prowler, AWS Security Hub ASFF, and GCP SCC assign severity (public exposure / direct-exploitation = Critical; "could result in future compromise" = Low/Medium).

- **Critical — remediate immediately.** Public access to data/keys; a usable privesc path to owner/admin; an owner-equivalent/`*:*` principal that is also reachable (internet-exposed or external); root/Global-Admin access key exists or root/Global-Admin lacks MFA; cross-tenant trust granting privileged access to an external/unknown principal.
- **High — remediate this sprint.** Broad over-permissioning at org/MG/folder scope; missing MFA on a privileged (non-root) identity; credential/key past 90 days or surplus long-lived SA keys; principal able to disable logging or modify resource policies; legacy/disabled strong auth on a privileged scope.
- **Medium — next maintenance window.** Orphaned/unused SAs still enabled; credentials unused 45+ days; unconstrained exfil permissions with no public link; secrets in env vars; weak password policy; non-privileged accounts missing MFA.
- **Low — track and batch-fix.** Policies on users not groups; missing security contacts; cosmetic least-privilege drift with no exploit path.

**Implementation notes.** Store severity as a lowercase enum (`critical|high|medium|low`) to match Prowler/ASFF. Keep a separate `blast_radius`/`reachability` flag (mirrors ASFF's separate `Criticality` field) so org-scope or internet-reachable findings can auto-promote one tier — do NOT bake asset criticality into base severity. Severity assignment must be a deterministic lookup keyed by pattern ID + scope, never model-inferred.

---

## 5. Anonymization Design

**Scheme: deterministic HMAC-SHA256 pseudonymization with a per-run secret.** Pseudonymize, do not redact — redaction destroys the referential structure (you lose that 12 findings belong to the same principal). Use keyed HMAC, not a plain hash, because identifiers here are low-entropy (emails, 12-digit account IDs, GUIDs) and a plain `sha256(email)` is brute-forceable/rainbow-table-able; HMAC with a secret defeats that. Generate a fresh 256-bit key per run with `secrets.token_bytes(32)`, hold it in memory only, discard on exit. Within a run, correlation is perfect; across runs the same identity maps to different pseudonyms, so two leaked anonymized reports can't be cross-correlated and the mapping is unrecoverable once the process exits.

```python
import hmac, hashlib, secrets

_SECRET = secrets.token_bytes(32)  # per-run, in-memory only; never written to disk

def pseudonymize(value: str, principal_type: str = "id") -> str:
    if not value:
        return value
    digest = hmac.new(_SECRET, value.strip().lower().encode("utf-8"),
                      hashlib.sha256).hexdigest()
    prefix = {"user": "User", "serviceaccount": "SA", "group": "Group",
              "role": "Role", "account": "Acct", "project": "Proj"}.get(
                  principal_type.lower(), "ID")
    return f"{prefix}_{digest[:8]}"   # e.g., User_a47f3c91
```

Normalize before hashing (trim + lowercase) so variants of one identity collapse. Carry principal *type* as a non-secret prefix so analysts keep "this is a service account with 12 critical findings" without the email. Optionally pseudonymize the email domain/tenant separately and consistently so tenant grouping survives.

**What MUST be anonymized vs what stays visible.**

| MUST anonymize | CAN stay visible |
|---|---|
| Emails, AWS account IDs, GCP project IDs, Azure subscription IDs | Role/permission names |
| ARNs, Azure object IDs, GCP member identifiers | Severity, risk category |
| Resource names containing identifying info | Counts/aggregates ("12 critical") |
| SA key IDs, email local-parts | CIS control ID / MITRE technique ID |
| Email domain/tenant (pseudonymize consistently if grouping needed) | Principal type; relative structure |

Referential-integrity rule: every join-key column (principal, account, project, resource) goes through the *same* `pseudonymize()` with the *same* per-run secret, so anonymized-workbook joins still resolve.

**Before/after (one finding row).**

| Field | BEFORE | AFTER |
|---|---|---|
| Principal | `serviceAccount:etl-prod@acme-data-457821.iam.gserviceaccount.com` | `SA_a47f3c91` |
| Account/Project | `acme-data-457821` | `Proj_5d2e8b10` |
| Role | `roles/owner` | `roles/owner` |
| Finding | SA has owner-equivalent role at project level | SA has owner-equivalent role at project level |
| CIS / MITRE | GCP CIS 1.6 / T1078.004, T1098 | GCP CIS 1.6 / T1078.004, T1098 |
| Severity | Critical | Critical |
| Related path | Can impersonate `serviceAccount:deploy@acme-data-457821...` | Can impersonate `SA_b91d04f7` |

Severity, role, category, mapping, principal type, and the escalation-path structure all survive; `SA_a47f3c91` reads identically on every sheet.

**Library choice:** Python stdlib `hmac` + `hashlib` + `secrets` for the core anonymizer (zero dependencies, fully offline). Microsoft Presidio is a documented optional future add-on for *free-text* column scanning only (it pulls in spaCy/transformers and would need offline-bundled models). AWS Macie / GCP DLP: methodology reference only — they require cloud calls and violate the air-gap.

**Compliance note (brief):** teams anonymize before sharing for need-to-know/data-minimization, blast-radius reduction if the report leaks, and purpose limitation. Caveat to surface: pseudonymized data is still personal data under GDPR if the key is retained — which is exactly why the default discards the key at run end. Apply the same controls to the full xlsx (and any retained key) as to personal data.

---

## 6. Report Generation Architecture

### 6.1 Shared data model (the central invariant)

All four outputs render from ONE normalized findings collection — a list of typed `Finding` records (Pydantic v2 for validation, or `@dataclass` if zero-dependency is preferred), converted to a DataFrame for rendering (`pd.DataFrame([f.model_dump() for f in findings])`). The anonymized xlsx is the *same* model passed through `pseudonymize()` on the identifying columns, then rendered by the identical code.

Recommended schema (one row per finding):

`finding_id`, `check_id`, `cloud` (gcp/aws/azure), `account_scope`, `account_id`, `principal`, `principal_type`, `resource`, `resource_type`, `severity` (critical/high/medium/low/info), `risk_category`, `cis_id`, `mitre_id`, `title`, `description`, `evidence`, `recommendation`, `detected_at`, `source_command`.

`evidence` and `source_command` give an audit trail (what command ran, what output triggered the finding). Validation should enforce the severity enum and required fields.

### 6.2 Excel — engine: xlsxwriter

The tool always generates fresh workbooks (never re-opens a prior one), and the value is in severity color-coding, autofilters, frozen headers, and multi-sheet structure — all xlsxwriter strengths. xlsxwriter is write-only but has first-class `conditional_format()`, `add_table()`, `autofilter()`, `freeze_panes()`, `set_column()`. Pattern: `pd.ExcelWriter(path, engine="xlsxwriter")`, `df.to_excel(writer, sheet_name=...)`, then reach into `writer.book`/`writer.sheets[...]` for formatting. Severity coloring via `workbook.add_format({'bg_color': '#f01e2c', 'font_color': 'white'})` applied through `conditional_format`. Keep openpyxl installed (it's the pandas fallback and the `Styler.to_excel` engine), but target xlsxwriter for the primary report. Do not enable xlsxwriter `constant_memory` mode if you use `add_table()`/merged ranges.

### 6.3 HTML — single self-contained Jinja2 template, embedded CSS, no CDN/JS

For an air-gapped environment the HTML must be one self-contained file with all CSS inlined in a `<head><style>` block and zero external resource references. Use a Jinja2 template for page structure (title, exec summary, per-cloud sections, severity rollup) and render the findings tables into it. Best single-source-of-truth approach: generate each table with pandas `Styler` applying the *same* severity-color function used for Excel, and inject the resulting `<table>` fragment via `{{ table_html | safe }}`. (`Styler.to_html(doctype_html=True)` can also emit a complete standalone document if you want Styler to own the whole page.) Either way the output opens correctly with no network access.

### 6.4 Markdown — `to_markdown()` (tabulate) + templated prose wrapper

Use `DataFrame.to_markdown(tablefmt="github")` for findings tables — note this **requires the `tabulate` package** (add it as an explicit dependency) — wrapped by a small Jinja2/hand-written Markdown template for the exec summary, severity counts, and per-cloud headings. **Mandatory pre-processing:** escape or replace `|` and newline characters in cell values (ARNs, role names, recommendations) before emitting, or those rows break the GFM pipe table.

---

## 7. Jupyter Safety Notes

### 7.1 Subprocess + credential handling

- Always pass args as a list with `shell=False` (default): `subprocess.run(["gcloud", "projects", "get-iam-policy", project_id, "--format=json"], capture_output=True, text=True, timeout=...)`. This is the primary defense against injection from discovered names (project IDs, principals) flowing into commands.
- Capture output explicitly; check `returncode` (or `check=True`). Always set a `timeout` (without `shell=True`, so a hung CLI can actually be killed rather than orphaned).
- Validate/allowlist discovered flags even with list syntax (argument injection like `--config=` is still possible).
- **Credential leak risk:** `.ipynb` files persist cell outputs to disk as JSON. Never print credentials, tokens, or raw credential reports into cell output. Process sensitive output (e.g., `aws iam get-credential-report`) in the module, in memory, and surface only derived, non-sensitive findings.

### 7.2 Output scrubbing — nbstripout (mandatory)

`.ipynb` saves outputs, so make `nbstripout` a mandatory pre-commit hook (it strips outputs as a git filter while leaving the working copy intact). `.pre-commit-config.yaml`:
```
repos:
  - repo: https://github.com/kynan/nbstripout
    rev: 0.9.1
    hooks:
      - id: nbstripout
```
then `pre-commit install`. For sensitive-data notebooks, installing nbstripout globally across repos is also recommended. One-shot equivalent: `jupyter nbconvert --ClearOutputPreprocessor.enabled=True --to notebook`.

### 7.3 Architecture — three thin per-cloud notebooks + one importable package

Put all real logic in a single importable, `pytest`-testable package (`cloudaudit/`: discovery, CLI wrappers, check registry, risk rules, pseudonymizer, renderers). On top of it sit **three separate, thin notebooks — one per cloud**:

- `gcp_audit.ipynb` — runs the GCP discovery → posture phases (Section 9.1).
- `aws_audit.ipynb` — runs the AWS phases.
- `azure_audit.ipynb` — runs the Azure phases.

Each notebook only imports `cloudaudit`, calls a few orchestration functions for its cloud, and shows high-level status; it does not contain audit logic. Why three notebooks rather than one: a user can run only the cloud(s) they hold credentials for; a credential/permission failure in one cloud can't abort the others; and each notebook stays short and readable (which also minimizes what `nbstripout` has to scrub). All three append to the **same** normalized findings model and call the **same** renderers, preserving the single-source-of-truth invariant. Provide an optional thin `run_all.ipynb` (or a `cloudaudit.run_all()` entry point) that executes the three in sequence — e.g., via `papermill` or by importing each cloud's orchestration function — and emits one combined cross-cloud report in addition to the per-cloud outputs.

The package being shared (not duplicated per notebook) is what makes this safe: the `Finding` schema, severity rules, pseudonymizer, and renderers live in exactly one place. Use `%load_ext autoreload` during development so edits to `cloudaudit` reload without restarting each notebook's kernel.

---

## 8. Local AI Recommendation

**Verdict: yes, but only for narrative/executive-summary prose (and optionally human-reviewed draft remediation text). Findings, severity, and classification stay 100% deterministic and rule-based. Never let the LLM decide severity or auto-classify findings.**

- **Good fit — exec-summary prose.** The facts already exist and are correct; the model only rephrases the computed findings (counts by severity, top risks). A hallucinated adjective doesn't change a finding's truth. Constrain the input to the already-computed structured findings; instruct it to summarize, not infer.
- **Use with care — remediation text.** Acceptable only with human review before it ships: LLMs fabricate steps, miscite controls, and even invent non-existent package names. Do de-duplication deterministically (group by `finding_id`/resource), not via the model.
- **Human-assist only — ambiguous classification.** Never auto-decide severity. The model may surface candidate reasons, but the severity must come from the deterministic rule matrix so the result is repeatable and audit-defensible.
- **Is it needed at all?** No, not for correctness — the findings pipeline is deterministic CLI output matched against rules. The LLM is a quality-of-life enhancement on the exec summary only; the tool is fully functional with templated prose if the team prefers zero AI.

**Model + hardware (if used).** An 8B-class instruct model at Q4_K_M via Ollama, fully offline. `llama3.1:8b-instruct-q4_K_M` is 4.9 GB (128K context); Qwen2.5 7B is a strong alternative; Phi-4-mini/3B for fully CPU-bound machines. Ollama's no-GPU floor is ~8 GB RAM, 10 GB disk, AVX2 CPU; sizing rule ~0.6 GB per billion params at q4_K_M. CPU-only throughput ~5–15 tok/s for a 7B model — a non-issue since the LLM only writes a few summary paragraphs per run. Use Q4_K_M (avoid aggressive Q2). Ollama keeps all data on the host — consistent with the air-gap.

---

## 9. Notebook Check-List + Dynamic Design Guidance

This section is the practical heart of the build: what the notebook actually checks, and how it stays dynamic instead of hardcoded.

### 9.1 What the notebook should CHECK — ordered, per cloud (GCP first)

Run the same seven-phase pipeline per cloud, each phase gated by capability detection.

**GCP (primary)**
1. **Discovery / hierarchy** — `organizations list` → `folders list` → `projects list`; resolve org ID. Iterate over whatever hierarchy is returned.
2. **IAM enumeration** — org/folder/project `get-iam-policy` (use `--flatten='bindings[].members'`); enumerate service accounts and custom roles. At scale, prefer `asset search-all-iam-policies` org-scoped.
3. **Access analysis** — flatten to (member, role, scope); flag primitive roles (Owner/Editor/Viewer) on principals and SAs; map inherited permissions down the hierarchy.
4. **Exposure / public access** — search resources for `allUsers`/`allAuthenticatedUsers`; public buckets, public IPs, public KMS keys.
5. **Credential hygiene** — SA user-managed keys and key age; flag user-managed keys; check `iam.disableServiceAccountKeyCreation` org policy.
6. **Privilege-escalation paths** — flag the documented privesc permissions: `resourcemanager.projects/organizations.setIamPolicy` (most direct), `iam.serviceAccounts.actAs` (GCP's `PassRole` equivalent), `getAccessToken`, `serviceAccountKeys.create`, `signBlob`/`signJwt`, `roles.update`/`create`, `deploymentmanager.deployments.create`, `cloudfunctions.functions.setIamPolicy`. Map actAs/tokenCreator chains across SAs (Rhino taxonomy). Default Compute Engine SA with Editor is a flagged risk.
7. **Posture** — audit logging configured, log sinks, org-policy constraints; emit findings mapped to CIS/MITRE. Degrade gracefully if SCC Premium is unavailable.

**AWS (secondary)** — same seven phases: `organizations list-accounts` (iterate per account) → `get-account-authorization-details` + list users/roles/groups/policies → Access Analyzer `list-findings` (external) and `list-findings-v2` (unused) → `get-public-access-block` + `get-bucket-policy-status` (IsPublic) → `list-access-keys` (CreateDate/Status) + `get-credential-report` → privesc (`iam:PassRole`, `iam:CreatePolicyVersion`, `iam:AttachUserPolicy`, `sts:AssumeRole` misconfig, wildcard policies) → posture (CloudTrail, root MFA). Note: the credential report captures only the first two keys per user — combine with `list-access-keys`.

**Azure (tertiary)** — `management-group list` + `account list` (iterate) → `role assignment list` (scope to MG/subscription) + role definitions + `ad user/group/sp list` → flatten assignments, flag Owner/Contributor at broad scope (probe multiple scopes due to the inherited-assignment gap) → public exposure → `ad sp credential list` for secret/cert expiry → privesc (role-assignment-write, custom-role abuse, SP over-permission) → posture (Defender for Cloud / Azure Policy compliance).

### 9.2 How to be MAXIMALLY DYNAMIC

1. **Auto-discover the hierarchy and iterate over whatever exists.** Never hardcode org/account/project IDs. Enumerate at runtime and loop over the discovered set. Where permitted, a single org-scoped Cloud Asset query (GCP) or ARG `authorizationresources` query (Azure) replaces per-project iteration.
2. **Capability detection / permission probing — skip, don't fail.** Before each phase, probe whether the caller has the needed permission and whether the API/tier exists. Wrap every CLI call so `PERMISSION_DENIED`/non-zero returns convert to a recorded "skipped: insufficient permission" status, not a crash. Degrade gracefully when premium tiers are absent (SCC Premium, Access Analyzer not enabled).
3. **Data-driven check registry (plugin/registry pattern) — no hardcoded if-blocks.** A module-level `CHECK_REGISTRY` plus a `@register_check(...)` decorator: each check declares `check_id`, target cloud, required permissions, the CLI command(s), the rule that turns output into findings, and its severity/CIS/MITRE metadata. The runner iterates the registry; adding a check is a new decorated function — core logic never changes (Open/Closed).
4. **Resilient multi-account/multi-project loops.** One project's failure (permission/throttle/timeout) is caught and recorded without aborting the run; all findings aggregate into the single normalized model.
5. **Graceful degradation as first-class output.** Every skipped check/cloud/tier appears in the report as an explicit "not assessed — reason" row, so absence of a finding is never confused with a pass. This keeps coverage honest.

---

## 10. Suggested Build Phases for Claude Code

1. **Foundation.** Define the `Finding` schema (Section 6.1) and the HMAC pseudonymizer (Section 5). Stand up the `cloudaudit/` importable package plus the three thin per-cloud notebooks (`gcp_audit.ipynb`, `aws_audit.ipynb`, `azure_audit.ipynb`) and the `nbstripout` pre-commit hook. Write `pytest` tests for the pseudonymizer (same identity → same token within a run; different across runs; cross-sheet joins resolve).
2. **Check registry + capability probing.** Build the `@register_check` registry and the CLI-wrapper layer (`shell=False`, timeouts, permission-denied → skip).
3. **GCP audit phases 1–7**, then AWS, then Azure — each check a registry entry. Prioritize the Critical-producing checks first: public access → privesc paths → owner/admin SAs → wildcard policies.
4. **Renderers.** xlsxwriter (severity conditional formatting, autofilter, freeze panes, per-cloud sheets) → self-contained Jinja2 HTML → `to_markdown` MD. All four render from the single model; the anonymized xlsx is the model through `pseudonymize()`.
5. **Local LLM (last, optional).** Ollama + 8B Q4_K_M, wired only to exec-summary prose (and optionally human-reviewed remediation drafts). Never into severity/classification.

---

## Validation Checklist

- Every tool claim carries a source/verdict; stale tools (ScoutSuite, CloudSploit) and archived tools (Forseti) are flagged.
- CLI commands reflect current official syntax with scope/auth and rate-limit notes per cloud.
- Anonymization is concrete: keyed HMAC-SHA256, per-run secret, stdlib, with a worked before/after row.
- Local AI gives a clear yes/scoped-where answer, not a hedge.
- The four outputs share one data model (no drift).
- The notebook check-list and dynamic-design patterns are concrete and registry-driven.

## Caveats

- GCP CIS v5.0.0 IDs 1.4, 1.9, 1.12–1.16 are inferred from the v4→v5 +1 renumbering; confirm against the gated CIS v5.0.0 PDF if exact wording is build-critical. AWS version naming is split (CIS site lists 7.0.0; Security Hub supports up to 5.0.0) — pin to the version your auditors require.
- Maintenance verdicts are time-sensitive (verified June 30, 2026). Re-verify before implementation; demote any "wrap/call" tool that crosses 12 months with no release.
- AGPLv3 (Steampipe/Powerpipe/PMapper) obligations attach on distribution/modification, not on running an unmodified binary as a separate process — get a legal read before bundling any of them into a shipped artifact.
- Some 2026 Ollama throughput/hardware figures come from community blogs (approximate); the vendor-confirmed facts (no-GPU floor, the 4.9 GB Llama 3.1 8B Q4_K_M size) are reliable.
- This is a posture/state audit: ATT&CK mappings indicate the capability a misconfiguration enables, not active exploitation. Word findings as "principal can…", not "did…".
- HMAC pseudonymization is reversible by anyone holding the key; the default ephemeral-key design is what makes the shared report low-risk. Treat the full xlsx and any retained key as personal data.
