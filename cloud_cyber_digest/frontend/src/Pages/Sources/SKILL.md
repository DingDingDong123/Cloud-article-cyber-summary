---
name: gti
description: "Use this skill whenever the user wants to search, hunt, or build queries against Google Threat Intelligence (GTI), VirusTotal Intelligence (VTI), or Mandiant threat intel — anything referencing gtidocs.virustotal.com, the VT/GTI v3 API, VT Intelligence search modifiers, Livehunt/Retrohunt YARA, the IoC Stream, threat-actor/malware-family/campaign/report/vulnerability collections, DTM (Digital Threat Monitoring), or ASM (Attack Surface Management). Triggers include: 'find malware samples that...', 'hunt for...', 'write a VT Intelligence query', 'build a GTI search', 'pivot from this hash/domain/IP', 'imphash/ssdeep/vhash search', 'Livehunt rule', 'Retrohunt job', 'show me APT/threat-actor IoCs', 'query the IoC stream', or any mention of x-apikey/intelligence/search. This skill BUILDS queries and API calls for the user to run themselves — it does NOT execute live API calls and assumes no API access. Do NOT use for unrelated SIEM/EDR query languages (Splunk SPL, KQL, Elastic) unless explicitly about GTI/VT/Mandiant."
---

# Google Threat Intelligence (GTI) Query Builder

## What this skill does

This skill turns a natural-language threat-hunting request into **ready-to-run GTI/VirusTotal queries and API calls**. You construct the query — you do **not** execute it. The user runs it themselves with their own API key.

Every answer you produce should give the user, as relevant:
1. The **VT Intelligence query string** (the `modifier:value` expression).
2. The **equivalent REST call** (curl, query URL-encoded) with the right endpoint and headers.
3. A one-line **explanation** of what each non-obvious modifier does and any quota/throttle caveat.

Do not invent modifiers or endpoints. If something isn't in this skill's references, say so rather than guessing — modifier names and endpoint paths must be exact for the query to work.

## Core facts (memorize these)

- **Base URL:** `https://www.virustotal.com/api/v3/`
- **Auth header:** `x-apikey: <KEY>` (required on every call).
- **`x-tool: <name>` header:** REQUIRED to get `gti_assessment` (Mandiant severity/verdict/score) back on IoC reports. Always include it and remind the user.
- **One query language, five corpora.** The same `modifier:value` DSL drives the UI search box and `GET /intelligence/search`. Pick the corpus with an `entity:` prefix: `entity:file` (default), `entity:url`, `entity:domain`, `entity:ip`, `entity:collection`.
- **Operators:** `AND` (also implicit between terms), `OR`, `NOT`, and parentheses. **`AND` binds tighter than `OR`** — always parenthesize OR-groups: `(type:doc OR type:docx) tag:macros`.
- **Ranges:** trailing `+` = "≥", `-` = "≤". Bare value = exact. e.g. `p:5+` (≥5 detections), `p:20-` (≤20), `size:1MB+`. Combine for a band: `p:20+ p:30-`.
- **Dates:** absolute `fs:2024-08-21T16:59:22+` or relative deltas `fs:30d+` (first-submitted within last 30 days).
- **Quoting:** wrap values with spaces/dots/colons in double quotes — `threat_actor:"Lazarus Group"`, `engines:"Trojan.Isbar"`.
- **URL-encode the whole `query=` value** in REST calls. In Python: `urllib.parse.quote(query, safe='')`.

## Decision tree — which endpoint

| User intent | Endpoint to build |
|---|---|
| "Find / hunt samples that match X" | `GET /intelligence/search?query=...&descriptors_only=true&limit=300` |
| "Tell me about this hash / URL / domain / IP" | `GET /files/{id}` · `/urls/{id}` · `/domains/{d}` · `/ip_addresses/{ip}` |
| "Pivot from this IoC to related infra" | `GET /{type}/{id}/{relationship}` (e.g. `/files/{sha256}/contacted_domains`) |
| "What's new for actor / ruleset / subscription" | `GET /ioc_stream?filter=...` |
| "Set up continuous hunting on new uploads" | `POST /intelligence/hunting_rulesets` (Livehunt) |
| "Scan history for a YARA rule" | `POST /intelligence/retrohunt_jobs` (Retrohunt) |
| "Show me actor / malware / campaign / CVE intel" | `entity:collection collection_type:...` via `/intelligence/search` or `/collections` |
| "Bulk daily indicator feed" | `GET /threat_lists/{list}/{YYYYMMDDhh}?type=...` |
| Dark-web / leak monitoring | DTM — **Lucene** syntax, `POST /dtm/docs/search` (see reference) |
| External attack-surface assets/issues | ASM — **`key:value`** syntax, `/asm/search/...` (see reference) |

Three query languages — never mix them: **VT Intelligence modifiers** for files/urls/domains/ips/collections, **Lucene** for DTM, **`key:value` with `!`** for ASM.

## Query-builder workflow

1. **Classify the corpus** (file / url / domain / ip / collection) and set the `entity:` prefix.
2. **Translate each constraint** to a modifier. For detail beyond the common ones below, load `references/search-modifiers.md`.
3. **Add GTI threat-intel cross-cuts** when attribution/severity matters: `gti_score:30+`, `gti_severity:high`, `gti_verdict:malicious`, `threat_actor:"..."`.
4. **Parenthesize OR-groups**, then assemble the full query string.
5. **Wrap it in the right endpoint** (decision tree above). For API/YARA/endpoint specifics, load `references/api-and-hunting.md`.
6. **Emit query + curl + caveats.** Default to `descriptors_only=true` and `limit=300` for searches; suggest `exclude_attributes=last_analysis_results,sigma_analysis_results,pe_info,signature_info,exiftool` to trim heavy IoC reports.

## Most-used modifiers (quick set)

Files (`entity:file`, default): `size`, `type` (`peexe`,`pedll`,`apk`,`elf`,`macho`,`pdf`,`doc`,`docx`,`xls`,`xlsx`), `p`/`positives`, `fs`/`ls`/`la`, `generated` (PE compile time), `tag:` (`macros`,`powershell`,`exploit`,`signed`,`cve-2024*`), `name:`, `imphash:`, `vhash:`, `ssdeep:`, `tlsh:`, `telfhash:`, `similar-to:`, `content:` (binary/string grep), `engines:<sig>`, `<engine>:<sig>` (e.g. `microsoft:trojan`), `behaviour_network:`, `behaviour_files:`, `contacted_ip:`, `attack_technique:T1055`, `submitter:`.

URLs (`entity:url`): `url:`, `hostname:`, `path:`, `tld:`, `ip:`, `asn:`, `tag:` (`downloads-pe`,`opendir`,`contains-apk`), `main_icon_dhash:`, `parent_domain:`, `targeted_brand:`, `engines:`.

Domains (`entity:domain`): `domain:` (wildcards), `tld:`, `category:`, `registrar:`, `ssl_subject:`, `jarm:`, `popularity_rank:`, `tag:` (`dga`,`dynamic-dns`), `fuzzy_domain:`, `domain_regex:`, the DNS-record family (`a_record`,`ns_record`,`mx_record`,`cname_record`,`txt_record`).

IPs (`entity:ip`): `ip:"8.8.8.8/24"`, `asn:`, `aso:`, `country:`, `continent:`, `jarm:`, `ssl_subject:`, the `detected_*_files_count` / `*_max_detections` pivot counters.

Collections (`entity:collection`): **`collection_type:` is required** — one of `threat-actor`, `malware-family`, `software-toolkit`, `campaign`, `collection`, `report`, `vulnerability`. Then `name:`, `threat_actor:`, `malware_family:`, `motivation:Espionage`, `targeted_industry:`, `source_region:`, `report_type:`, `cvss_3x_base_score:9+`, `vulnerable_vendor:`. Facet values are **case-sensitive** — match the reference exactly.

GTI cross-cuts (all entities): `gti_score:0-100`, `gti_severity:high|medium|low|none`, `gti_verdict:malicious|suspicious|undetected|benign`, `threat_actor:"..."` / `related_actor:"..."`.

## A few worked examples

Recent low-detection Cobalt Strike attributed to APT41:
```
entity:file engines:CobaltStrike fs:30d+ p:5- threat_actor:APT41
```
```bash
curl -G "https://www.virustotal.com/api/v3/intelligence/search" \
  --data-urlencode 'query=entity:file engines:CobaltStrike fs:30d+ p:5- threat_actor:APT41' \
  --data 'limit=300' --data 'descriptors_only=true' \
  -H "x-apikey: $GTI_API_KEY" -H "x-tool: my-skill"
```

Office docs with macros, recent, mid-detection:
```
(type:doc OR type:docx OR type:xls OR type:xlsx) tag:macros p:5+ generated:30d+
```

imphash cluster pivot:
```
entity:file imphash:7fa974366048f9c551ef45714595665e p:5+
```

High-CVSS Adobe vulnerabilities:
```
entity:collection collection_type:vulnerability cvss_3x_base_score:9+ vulnerable_vendor:Adobe
```

File → contacted domains (relationship pivot):
```bash
curl "https://www.virustotal.com/api/v3/files/<sha256>/contacted_domains?limit=40" \
  -H "x-apikey: $GTI_API_KEY"
```

More patterns (subnet pivots, favicon clustering, Livehunt/Retrohunt bodies, IoC Stream filters, Threat List batches, STIX export) live in `references/api-and-hunting.md`.

## Caveats to surface to the user

- **Free Public API:** 4 requests/min, 500/day. Premium/Intelligence quotas are contract-specific; daily resets at 00:00 UTC, monthly on the 1st. HTTP **429** = quota/rate exceeded.
- **`content:` (VTGrep), `similar-to:`, `ssdeep:`, `tlsh:`** can't be sorted; fuzzy-hash searches are throttled (~15 searches/min). Files from the last 24–48h aren't yet indexed for content search — use Livehunt for the freshest results.
- **Bare hash searches can't be combined with operators** — script it and post-filter for boolean logic over hash lists.
- **`/intelligence/search` pages at 300; `/collections` at 40** — prefer search for scale.
- **Livehunt/Retrohunt** ignore files >100 MB. Retrohunt: `main` corpus ≈ 12 months (3 for standard), max 300 rules/job, max 10k matches/job, max 10 concurrent jobs, ~2–3h runtime.
- **Premium-only** surfaces: `/intelligence/*`, `/threat_lists/*`, threat-actor/campaign collections, `gti_assessment` fields. Building the query is free; running it needs entitlement.

## Reference files (load on demand)

- `references/search-modifiers.md` — the **complete** modifier tables for file/url/domain/ip/collection/report searches, every `tag:` and `have:` value, and the full relationship lists for pivoting.
- `references/api-and-hunting.md` — the **full v3 endpoint catalog**, the Livehunt/Retrohunt YARA `vt` module schema and enums, IoC Stream filters, Threat Lists, STIX export, DTM (Lucene) and ASM (`key:value`) syntax, quota/consumption rules, and ~20 copy-paste worked examples.
