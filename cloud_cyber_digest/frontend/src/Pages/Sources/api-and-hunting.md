# GTI v3 API, Hunting (YARA), DTM/ASM, Quotas & Worked Examples

Load this for endpoint paths, request bodies, the Livehunt/Retrohunt `vt` YARA module, IoC Stream filters, Threat Lists, STIX export, DTM (Lucene) and ASM (`key:value`) syntax, and copy-paste examples. Base URL `https://www.virustotal.com/api/v3`, auth `x-apikey:`; add `x-tool:` to receive `gti_assessment`.

---

## Endpoint catalog

### IoC enrichment
- `GET /files/{sha256|sha1|md5}` — file report.
- `POST /files/{sha256}/analyse` — rescan (consumes quota).
- `POST /files` (multipart `file=`) — upload ≤32 MB. For larger: `GET /files/upload_url` then `POST` to it (≤650 MB).
- `GET /files/{id}/download` (Premium) · `GET /files/{id}/download_url`.
- `GET|POST /files/{id}/comments` · `GET|POST /files/{id}/votes`.
- `GET /urls/{id}` — `{id}` = base64url(sha256(url)) or sha256 of URL. `POST /urls` (form `url=`) to submit.
- `GET /domains/{domain}` · `GET /ip_addresses/{ip}`.
- All four types: `GET /{type}/{id}/relationships/{relationship}` (descriptors) and `GET /{type}/{id}/{relationship}` (full objects).

### Lookup / bulk
- `GET /search?query=...&limit=...` — quick single-indicator/comment-tag lookup.
- `POST /ioc_summary` (body: list of IoC descriptors) — bulk summary.

### Advanced corpus search (Premium)
- `GET /intelligence/search?query=<URL-encoded>&limit=<n≤300>&cursor=<c>&descriptors_only=<bool>&order=<field>(+|-)&exclude_attributes=<csv>`
  - `descriptors_only=true` → IDs only (cheaper/faster).
  - `exclude_attributes=last_analysis_results,sigma_analysis_results,pe_info,signature_info,exiftool` → trim payload.
  - `content:` queries can't be sorted; `ssdeep:`/`tlsh:` throttled (~15/min).
- `GET /intelligence/search/snippets/{id}` — content-search snippet by ID.

### Livehunt
- `GET /intelligence/hunting_rulesets` (filter e.g. `filter=enabled:true name:foo tag:auto`).
- `POST /intelligence/hunting_rulesets` — body:
  ```json
  {"data":{"type":"hunting_ruleset","attributes":{
    "name":"foobar","enabled":true,"limit":100,
    "rules":"rule foobar { strings: $ = \"foobar\" condition: all of them }",
    "notification_emails":["sec@acme.com"],
    "match_object_type":"file"}}}
  ```
  `match_object_type` ∈ `file`|`url`|`domain`|`ip`. Ruleset text ≤ 1 MB.
- `GET|PATCH|DELETE /intelligence/hunting_rulesets/{id}`. `DELETE /intelligence/hunting_rulesets` (all, async).
- Legacy: `GET /intelligence/hunting_notifications`, `GET /intelligence/hunting_notification_files`, `GET|DELETE /intelligence/hunting_notifications/{id}`. (Prefer IoC Stream.)

### Retrohunt
- `POST /intelligence/retrohunt_jobs` — body:
  ```json
  {"data":{"type":"retrohunt_job","attributes":{
    "rules":"rule foo { strings: $a=\"abc\" condition: $a }",
    "notification_email":"sec@acme.com",
    "corpus":"main",
    "time_range":{"start":1700000000,"end":1707000000}}}}
  ```
  `corpus`: `main` (~12 mo; 3 mo standard) or `goodware` (~1M NSRL clean files, for FP testing). Max 10 concurrent jobs, 300 rules/job, 10k matches/job; ~2–3h runtime; files >100 MB skipped.
- `GET /intelligence/retrohunt_jobs` · `GET|DELETE /intelligence/retrohunt_jobs/{id}` · `POST /intelligence/retrohunt_jobs/{id}/abort` · `GET /intelligence/retrohunt_jobs/{id}/matching_files`.

### IoC Stream (unified Livehunt + Retrohunt + subscriptions)
- `GET /ioc_stream?filter=<...>&limit=<n>&cursor=<c>`. Space-separated filters:
  - `date:2023-02-07T10:00:00+` / `date:3d+`
  - `entity_type:file|url|domain|ip_address`
  - `origin:hunting` / `origin:subscriptions`
  - `source_type:hunting_ruleset|retrohunt_job|collection|threat_actor`
  - `source_id:<id>` · `source_name:"My Ruleset"` · `notification_tag:<tag>`
  - Notifications auto-delete after 30 days.
- `GET|DELETE /ioc_stream_notifications/{id}`.

### Collections & threat-intel objects
- `GET /collections?filter=<query>&order=<field>` — filter must include `collection_type:`. Pages at 40; use `/intelligence/search` for scale (300).
- `GET /collections/{id}` · `GET /collections/{id}/relationships/{rel}`.
- `POST /collections` (create) · `PATCH /collections/{id}` (also `…/archive`, `…/unarchive`) · `DELETE /collections/{id}`.
- `POST|DELETE /collections/{id}/{ioc_or_ttp_type}` — add/remove IoCs/TTPs.
- `GET /collections/{id}/download_report` (PDF/STIX/JSON).
- `POST|DELETE /collections/{id}/subscription` — feeds into IoC Stream.
- `GET|POST /collections/{id}/comments`.
- `GET /collections/{id}/mitre_tree` · `GET /collections/{id}/timeline/events`.

### Threat Profiles (preview)
- `GET|POST /threat_profiles` · `GET|PATCH|DELETE /threat_profiles/{id}`.
- `GET|POST /threat_profiles/{id}/recommendations` (+ `DELETE`).
- `POST|DELETE /threat_profiles/{id}/relationships/{rel}` · `GET /threat_profiles/{id}/timeline_associations`.

### Threat Lists (Enterprise / Enterprise Plus)
- `GET /threat_lists` — provisioned lists.
- `GET /threat_lists/{id}/latest`.
- `GET /threat_lists/{id}/{YYYYMMDDhh}?type=file|url|ip_address|domain` — hourly batch (T-2h availability, 7-day retention).
- The 14 lists: `cryptominer`, `first-stage-delivery-vectors`, `infostealer`, `iot`, `linux`, `malicious-network-infrastructure`, `malware`, `mobile`, `osx`, `phishing`, `ransomware`, `threat-actor`, `trending`, `vulnerability-weaponization`.

### Comments / Votes / Graphs / Saved Searches
- `GET /comments?filter=tag:apt29` · `POST|DELETE /comments/{id}` · `POST /comments/{id}/vote`.
- `GET /graphs?filter=...` + CRUD on `/graphs/{id}`.
- `GET|POST /saved_searches` (+ share/revoke).

### STIX export
- Append `?format=stix2.1` to threat-object endpoints → STIX 2.1 Bundle (`threat-actor`, `malware`, `campaign`, `grouping`, `report`, `vulnerability`, `identity`, `relationship`, `indicator` SDOs).

### Feeds (no quota consumption)
- `GET /feeds/files/{YYYYMMDDhhmm}` (minutely) · `GET /feeds/files/hourly/{YYYYMMDDhh}`.
- `GET /feeds/files/{batch_id}/{sha256}/download`.
- `GET /feeds/{domains|urls|ip_addresses}/...` · `GET /feeds/file-behaviours/...` (+ `…/evtx`, `…/html`, `…/memdump`, `…/pcap`).

### ZIP downloads (Premium)
- `POST /intelligence/zip_files` (list of hashes; password-protected) · `GET /intelligence/zip_files/{id}` (+ `…/download_url`, `…/download`).

### Quota / account (free)
- `GET /users/{id_or_apikey}` · `GET /users/{id}/overall_quotas` · `GET /users/{id}/api_usage?start_date=...&end_date=...` · `GET /users/{id}/api_quota_group` · `GET /groups/{id}`.

---

## Livehunt / Retrohunt YARA — the `vt` module

YARA-X under the hood. Allowed standard modules: `pe`, `elf`, `dotnet`, `lnk`, `macho`, `math`, `magic`, `hash`, `string`, `time`. `include` is disallowed; rules with performance warnings are rejected. Files >100 MB are not scanned. The `vt` module always reflects the **last** submission that triggered the match.

### `vt.metadata.*` (file-level)
`analysis_stats.{malicious,suspicious,undetected,harmless,timeout,confirmed_timeout,failure,type_unsupported}`, `exiftool`, `first_submission_date`, `file_name`, `file_size`, `file_type` (enum `vt.FileType.*`), `file_type_tags`, `imphash`, `new_file`, `magic`, `main_icon.dhash`, `main_icon.raw_md5`, `malware_families[]`, `md5`/`sha1`/`sha256`, `signatures` (engine→sig dict), `ssdeep`, `subfile`, `submitter.city`, `submitter.country`, `tags[]`, `telfhash`, `tlsh`, `times_submitted`, `unique_sources`, `vhash`, `itw.{url,domain,ip}`.

### `vt.behaviour.*` (sandbox aggregate)
`calls_highlighted[]`, `text_highlighted[]`, `text_decoded[]`, `traits[]` (enum `vt.BehaviourTrait.*`), `verdicts[]` (enum `vt.BehaviourVerdict.*`), `mitre_attack_techniques[].id`, `files_dropped[].{path,sha256,type,process_name,process_id}`, `files_copied[].{source,destination}`, `files_deleted[]`, `files_opened[]`, `files_written[]`, `files_attribute_changed[]`, `dns_lookups[].{hostname,resolved_ips}`, `hosts_file`, `ip_traffic[].{destination_ip,destination_port,transport_layer_protocol}` (enum `vt.Net.Protocol.*`), `http_conversations[].{url,request_method(enum vt.Http.Method.*),request_headers,response_headers,response_status_code,response_body_filetype}`, `mbc[].{id,method,objective,behavior}`, `smtp_conversations[]`, `tls[].{issuer,ja3,ja3s,serial_number,sni,thumbprint,subject,version}`, `command_executions[]`, `modules_loaded[]`, `mutexes_created[]`/`mutexes_opened[]`, `processes_created[]`/`processes_injected[]`/`processes_killed[]`/`processes_terminated[]`, `signals_hooked[]`/`signals_observed[]`, `services_{bound,created,opened,started,stopped}[]`, `registry_keys_deleted[]`/`registry_keys_opened[]`/`registry_keys_set[].{key,value}`, plus Android (`shared_preferences_*`, `system_property_*`) and Windows (`windows_hidden[]`, `windows_searched[]`).

### `vt.net.url.*`
`raw`, `path`, `query`, `hostname`, `new_url`, `first_submission_date`, `params` (dict), `port`, `trackers[].{name,id,url}`, `response_headers`, `number_of_response_headers`, `response_code`, `cookies`, `favicon.{raw_md5,dhash}`, `outgoing_links[]`, `redirects[]`, `html_title`, `html_meta_tags`, `tags`, `analysis_stats`, `categories`, `signatures`, `downloaded_file.{new_for_vt,new_for_url,new_for_domain,new_for_ip,sha256,file_type,analysis_stats,signatures}`, `communicating_file.*`, `submitter.{city,country}`.

### `vt.net.domain.*`
`raw`, `root`, `new_domain`, `first_resolution`, `new_resolution`, `whois` (dict), `whois_raw`, `first_whois`, `new_whois`, `https_certificate.{thumbprint,subject,validity.not_after,validity.not_before,subject_alternative_name,signature,serial_number,issuer}`, `jarm`, `dns_records[].{value,type,dns_class,ttl}`, `favicon.{raw_md5,dhash}`, `tags`, `analysis_stats`, `categories`, `popularity_ranks[]`, `root_popularity_ranks[]`, `signatures`, `downloaded_file.*`, `communicating_file.*`. Method: `vt.net.domain.permutation_of("...", flags)` with `vt.Domain.Permutation.{TYPO,HOMOGLYPH,HYPHENATION,SUBDOMAIN,BITSQUATTING}`.

### `vt.net.ip.*`
`raw`, `new_ip`, `whois`, `whois_raw`, `new_whois`, `reverse_lookup`, `jarm`, `https_certificate.*`, `analysis_stats`, `signatures`, `downloaded_file.*`, `communicating_file.*`, `ip_as_owner`, `ip_asn`, `ip_country`, `ip_as_int`. Method: `vt.net.ip.in_range("CIDR")` (IPv4 + IPv6).

### Enums
- `vt.FileType.*`: `PE_EXE`, `PE_DLL`, `ELF`, `MACH_O`, `ANDROID`, `IPHONE`, `PDF`, `DOC`, `DOCX`, `XLS`, `XLSX`, `PPT`, `PPTX`, `RTF`, `HTML`, `JAVASCRIPT`, `JAVA_BYTECODE`, `JAR`, `ZIP`, `RAR`, `SEVENZIP`, `ISOIMAGE`, `DMG`, `MSI`, `LNK`, `ROM`, `SVG`, `SWF`, `PNG`, `JPEG`, `GIF`, `EMAIL`, `OUTLOOK`, `TEXT`, `XML`, … (full at `gtidocs.virustotal.com/docs/hunting-reference`).
- `vt.BehaviourTrait.*`: `PERSISTENCE`, `SELF_DELETE`, `DETECT_DEBUG_ENVIRONMENT`, `LONG_SLEEPS`, `CHECKS_GPS`, `INSTALLS_BROWSER_EXTENSION`, `HOSTS_MODIFIER`, `MACRO_DOWNLOAD_URL`, `MACRO_POWERSHELL`, `SUSPICIOUS_DNS`, `SUSPICIOUS_UDP`, `OBFUSCATED`, `EXECUTES_DROPPED_FILE`, `IRC_COMMUNICATION`, `FTP_COMMUNICATION`, `SMTP_COMMUNICATION`, `SSH_COMMUNICATION`, `TELNET_COMMUNICATION`, `MYSQL_COMMUNICATION`, `CRYPTO`, `TUNNELING`, `TELEPHONY`, `SUDO`, `CLIPBOARD`, …
- `vt.BehaviourVerdict.*`: `ADWARE`, `BANKER`, `CLEAN`, `EVADER`, `EXPLOIT`, `GREYWARE`, `MALWARE`, `PHISHING`, `RANSOM`, `RAT`, `SPREADER`, `TROJAN`, `UNKNOWN_VERDICT`.
- `vt.GtiVerdict.*`: `VERDICT_BENIGN`, `VERDICT_UNDETECTED`, `VERDICT_SUSPICIOUS`, `VERDICT_MALICIOUS`.
- `vt.GtiSeverity.*`: `SEVERITY_NONE`, `SEVERITY_LOW`, `SEVERITY_MEDIUM`, `SEVERITY_HIGH`.
- `vt.Http.Method.*`: `GET`, `HEAD`, `PATCH`, `POST`, `PUT`, `DELETE`, `TRACE`, `OPTIONS`, `CONNECT`.
- `vt.Net.Protocol.*`: `ICMP`, `IGMP`, `TCP`, `UDP`, `ESP`, `AH`, `L2TP`, `SCTP`. (Note: the official reference has a typo `vt.Net.Protoco.SCTP` in one example — use exactly what the docs example shows, since YARA-X verifies the literal.)

### Example Livehunt rule (drops a named file + multi-AV malicious)
```yara
import "vt"
rule drops_foo_exe {
  condition:
    for any f in vt.behaviour.files_dropped : ( f.path contains "foo.exe" )
    and vt.metadata.analysis_stats.malicious > 2
}
```

---

## DTM (Digital Threat Monitoring) — Lucene syntax

DTM uses **Lucene / Elasticsearch query-string**, NOT VTI modifiers. Auth: exchange your `x-apikey` for a Bearer token via `GET /api/v3/dtm/auth/token`.

- Endpoints: `GET /dtm/alerts`, `GET|PATCH /dtm/alerts/{id}`, `POST /dtm/alerts/bulk` / `bulk-apply`, `GET /dtm/alerts/{id}/audit`, `GET|POST|PATCH|PUT|DELETE /dtm/monitors[/{id}]`, `GET /dtm/domains`, `GET /dtm/settings/email`, `POST /dtm/docs/search` (body uses Lucene).
- Field syntax: `field:term`, `field:"phrase"`, `field:(alice OR bob)`, `+must -mustnot`, fuzzy `term~2`, proximity `"hello world"~2`, ranges `timestamp:["2024-06-03T19:01:53.442Z" TO "2024-08-03T19:01:53.442Z"]`. Wrap terms with `.`/`,`/`-` in quotes.
- Monitor operators: `must_equal`/`must_not_equal`, `must_contain`/`must_not_contain`, `must_start_with`/`must_not_start_with`, `must_end_with`/`must_not_end_with`.
- Examples:
  - `body:"exitq" AND (bank OR credit)`
  - `cve:"CVE-2020-15674" AND timestamp:["2024-06-03T00:00:00.000Z" TO "2024-08-03T00:00:00.000Z"]`
  - `identity_name:purplefox422 AND service_name:raidforums.com`
  - `identity_name:"john smith" AND doc_type:paste +password`

---

## ASM (Attack Surface Management) — `key:value` syntax

Flat `key:value`; implicit **AND** across different keys, implicit **OR** within the same key, `!` for NOT (`type:!uri`). Default field is the entity/issue/technology `name`. Endpoints under `/api/v3/asm/...` (`projects`, `search/entities/{q}`, `search/issues/{q}`, `search/technologies/{q}`, `entities/{uid}[/raw]`, `issues/{id}`, `issues/{id}/status`, `library/...`, `time-series/...`, `notes/...`, `tags/...`).

- Common keys: `collection:`, `type:` (`Domain`, `IpAddress`, `Uri`, `NetworkService`, `SslCertificate`, `AwsEC2Instance`, `AwsS3Bucket`, `AzureVirtualMachine`, `GcpComputeEngineInstance`, `GcpStorageBucket`, `GithubAccount`, `GithubRepository`, `EmailAddress`, `Nameserver`, `NetBlock`, …), `name:`, `hidden:`, `tag:`, `country:`, `uid:`, `scoped:`, `cloud:`, `cloud_provider:`, `network:`, `technology:jquery`, `http_code:`, `http_title:`, `http_forms:`, `port_tcp:`, `port_udp:`, `port_count_lte:`/`port_count_gte:`, `issue_count_lte:`/`issue_count_gte:`, `vuln:cve`, `vuln_count_lte:`/`vuln_count_gte:`, `critical_or_high:`, `resolves_to:`, date keys `first_seen_after:`/`last_seen_after:`/`last_seen_before:` (`YYYY-MM-DD`).
- Issues keys: `severity:1..5`, `severity_lte:`/`severity_gte:`, `status_new:open|closed`, `status_detailed:` (`open_triaged`, `open_in_progress`, `closed_mitigated`, `closed_resolved`, `closed_false_positive`, `closed_risk_accepted`, …), `entity_type:`, `entity_uid:`, `entity_name:`.

---

## Quota & consumption rules

- **Free Public API:** 4 requests/min, 500/day. HTTP **429** on quota/rate exceeded (v3).
- **Premium/Intelligence:** contract-specific (not publicly numeric).
- **Resets:** daily 00:00 UTC; monthly 00:00 UTC on the 1st.
- **Consumption:** 1 unit per IoC report (`/files/{id}`, etc.); `/intelligence/search` = 1 per request + 1 per cursor page; 1 per item in multi-hash search. **Zero** for `/users/.../overall_quotas`, `/users/.../api_usage`, all `/feeds/...`, and `POST /files` of a never-seen sample.
- **Throttles:** fuzzy-hash (`ssdeep:`/`tlsh:`) ≈ 15 searches/min regardless of plan; `content:` (VTGrep) can't sort and files from the last 24–48h aren't yet indexed.

---

## Worked examples (copy-paste)

**Subnet pivot (suspicious IPs in a /16):**
```
entity:ip ip:"172.31.0.0/16" (urls_max_detections:5+ OR reputation:-20- OR p:5+ OR downloaded_files_max_detections:5+ OR referring_files_max_detections:10+ OR (detected_communicating_files_count:2+ AND communicating_files_max_detections:5+)) last_modification_date:7d+
```

**Phishing kits sharing a favicon dhash:**
```
entity:url main_icon_dhash:"cc8cccccaae070b2" NOT hostname:"dropbox.com" NOT hostname:"dropboxforum.com"
```

**Argentinian phishing domains:**
```
entity:domain engines:phishing tld:ar
```

**2024-CVE-tagged samples, mid-detection band:**
```
entity:file tag:"cve-2024*" p:5+ p:20-
```

**PE talking to port 445, exploit-tagged:**
```
entity:file behaviour_network:":445" type:peexe tag:exploit
```

**Linux ELF cryptominers, last 7 days, GTI-malicious:**
```
entity:file type:elf engines:miner fs:7d+ gti_verdict:malicious
```

**Mandiant healthcare industry reports, 2025:**
```
entity:collection collection_type:report report_type:"Industry Reporting" creation_date:2025-01-01+ creation_date:2026-01-01- (name:"Healthcare" OR description:healthcare)
```

**Subscribe to a threat actor (push IoCs to IoC Stream):**
```bash
curl -X POST "https://www.virustotal.com/api/v3/collections/<actor_id>/subscription" \
  -H "x-apikey: $GTI_API_KEY"
```

**IoC Stream — last 24h, URL entities, from collection subscriptions:**
```bash
curl -G "https://www.virustotal.com/api/v3/ioc_stream" \
  --data-urlencode 'filter=date:1d+ entity_type:url source_type:collection' \
  --data 'limit=300' \
  -H "x-apikey: $GTI_API_KEY"
```

**Threat List batch (phishing IPs, 2025-02-20 08:00 UTC):**
```bash
curl "https://www.virustotal.com/api/v3/threat_lists/phishing/2025022008?type=ip_address" \
  -H "x-apikey: $GTI_API_KEY"
```

**STIX export of a threat actor:**
```bash
curl "https://www.virustotal.com/api/v3/collections/<actor_id>?format=stix2.1" \
  -H "x-apikey: $GTI_API_KEY"
```

**Python pattern (URL-encode + paginate via cursor):**
```python
import requests, urllib.parse
BASE = "https://www.virustotal.com/api/v3/intelligence/search"
H = {"x-apikey": KEY, "x-tool": "my-skill"}
q = 'entity:file engines:CobaltStrike fs:30d+ p:5- threat_actor:APT41'
params = {"query": q, "limit": 300, "descriptors_only": "true"}
cursor = None
while True:
    if cursor: params["cursor"] = cursor
    r = requests.get(BASE, headers=H, params=params).json()
    for d in r.get("data", []): print(d["id"])
    cursor = r.get("meta", {}).get("cursor")
    if not cursor: break
```
