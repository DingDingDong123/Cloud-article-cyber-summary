# VT Intelligence / GTI — Complete Search Modifier Reference

This is the full modifier catalog. The main SKILL.md has the common subset; load this when you need a modifier that isn't there, or to confirm exact spelling. All numeric modifiers accept trailing `+` (≥) / `-` (≤). Dates accept absolute (`2024-08-21T16:59:22+`) or relative deltas (`30d+`). Quote values with spaces/dots/colons. `AND` binds tighter than `OR` — parenthesize OR-groups.

---

## File search modifiers (`entity:file`, default)

**Core / numeric:** `size` (bytes; `KB`/`MB` suffix ok), `type` (file-type literal — see list below), `positives`/`p`, `children_positives`/`cp`, `submissions`/`s`, `sources`, `subspan` (seconds between compile time and first submission).

**Temporal:** `fs` (first submission), `ls` (last submission), `la` (last analysis), `creation_date`/`generated`/`gen`/`pets`/`petimestamp` (PE compile timestamp), `lm`/`last_modification_date`.

**Submitter:** `submitter:CN` (ISO-3166 alpha-2, or `web`/`api`), `first_submitter:ua`.

**Names / content / metadata:** `name:"winshell.ocx"`, `metadata:"microsoft inc"` (exiftool/PE GUID/iTunes/dmg/office), `signature:"google inc"` (Authenticode/Apple codesign), `lang:farsi` / `lang:"es-ar"`, `itw:"www.google.com"` (in-the-wild URL substring), `comment:"#tag"`, `comment_author:javilinux`.

**Crowdsourced rules / IDS / Sigma:** `crowdsourced_yara_rule:Nanocore` (or `<ruleset_id>|<rule_name>`), `crowdsourced_ids:"<msg>"` or `crowdsourced_ids:48084`, `sigma_critical:1+`, `sigma_high:1+`, `sigma_medium:1+`, `sigma_low:1+`, `sigma_rule:<sha256>`.

**Static / structural:** `imphash:`, `vhash:`, `telfhash:`, `tlsh:`, `ssdeep:`, `authentihash:`, `permhash:` (APK/CRX), `peresource:<sha256>`, `sectionmd5:<md5>`, `section:".text"`, `segment:"__LINKEDIT"` (Mach-O), `imports:"crypt32.dll"`, `exports:"_FormMain"`, `similar-to:<hash>` (PE/PDF/Office/SWF/RTF structural similarity), `content:"str"` or `content:{CAFEBABE}` (VTGrep — can't sort, can't OR with itself), `main_icon_dhash:`, `main_icon_md5:`, `detectiteasy:"Compiler: Microsoft Visual C/C++ (2015 v.14.0)"`, `trid:"InstallShield setup"`, `malware_config:`, `androguard:"..."`.

**Detection engines:** `engines:zbot`, `<engine_name>:zbot` (e.g. `microsoft:trojan`), `min_engines_banker:5`, `min_engines_emotet:10`.

**ATT&CK / MBC:** `attack_technique:T1055`, `attack_tactic:TA0003`, `mbc:C0002`.

**Behavioral (sandboxed files):** `behaviour:`/`behavior:` (free-text over all dynamic fields), `behaviour_files:`, `behaviour_network:`, `behaviour_processes:`, `behaviour_registry:`, `behaviour_services:`, `behaviour_tags:`, `behaviour_command_executions:`, `behaviour_injected_processes:`, `behaviour_created_processes:`, `behaviour_signature:"linking/runtime-linking"`, `behash:<md5>`, `sandbox_name:VirusTotal` (also `vmray`, `zenbox`, `microsoft_sysinternals`, `tencent_habo`, `cape_sandbox`), `contacted_ip:162.158.0.0/15`.

**AI / code insight:** `codeinsight:keylogger`, `crowdsourced_ai_analysis:"is malicious"`, `crowdsourced_ai_verdict:benign`, `hispasec_ai_verdict:benign`, `nics_ai_analysis:"is malicious"`.

**GTI cross-cuts:** `gti_score:30+`, `gti_severity:high|medium|low|none`, `gti_verdict:malicious|suspicious|undetected|benign`, `threat_actor:"..."`, `related_actor:"..."`.

**Common `type:` values:** `peexe`, `pedll`, `pe`, `apk`, `elf`, `macho`, `dmg`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, `rtf`, `html`, `xml`, `script`, `javascript`, `vba`, `powershell`, `email`, `image`, `audio`, `video`, `compressed`, `zip`, `rar`, `7zip`, `iso`, `msi`, `lnk`, `swf`.

**Common file `tag:` values:** `macros`, `auto-open`, `peexe`, `pedll`, `android`, `signed`, `trusted`, `nsrl`, `via-tor`, `zero-filled`, `corrupt`, `exploit`, `cve-2022*` (wildcards ok), `honeypot`, `email-spam`, `attachment`, `js-embedded`, `flash-embedded`, `invalid-xref`, `contains-pe`, `overlay`, `64bits`, `assembly`, `native`, `efi`. Full list: `gtidocs.virustotal.com/docs/full-list-of-google-threat-intelligence-tag-modifier`.

**Wildcards (`*`) allowed on:** `attack_technique`, `attack_tactic`, `behaviour_network`/`behavior_network`, `capability_tab`, `name`/`filename`, `tag`.

**`have:<field>` values (entity must have data for that field):** `androguard`, `authentihash`, `behaviour`, `behaviour_files`, `behaviour_network`, `behaviour_processes`, `behaviour_registry`, `behaviour_services`, `behaviour_created_processes`, `behaviour_injected_processes`, `bundled_files`, `capability_tags`, `carbonblack_parents`, `ciphered_parents`, `comments`, `compressed_parents`, `contacted_domains`, `contacted_ips`, `contacted_urls`, `creation_date`, `crowdsourced_ids`, `crowdsourced_yara_rule`, `dropped_files`, `email_attachments`, `email_parents`, `embedded_domains`, `embedded_ips`, `embedded_urls`, `entry_point`/`ep`, `evtx`, `execution_parents`, `exports`, `imphash`, `imports`, `itw_domains`, `itw_urls`, `ja3_digests`, `lang`, `main_icon_dhash`, `main_icon_md5`, `malware_config`, `memdump`, `metadata`, `netguid`, `overlay_children`, `overlay_parents`, `packers`, `pcap_children`, `pcap_parents`, `pe_resource_children`, `pe_resource_parents`, `permhash`, `petimestamp`, `pets`, `screenshots`, `section`, `sectionmd5`, `sections`, `segments`, `sigcheck`, `sigma_rules`, `signatures`, `tags`, `tlsh`, `traffic`, `urls_for_embedded_js`.

---

## URL search modifiers (`entity:url`)

`url:bankofamerica` (wildcards), `hostname:` (wildcards), `path:"gate.php"` (wildcards), `exact_path:"/google/"`, `extension:jpg`, `port:8080`, `scheme:https`, `tld:ru`, `title:`, `meta:"..."`, `password:`, `username:anonymous`, `query_field:`, `query_value:`, `cookie:`, `cookie_value:`, `header:`, `header_value:`, `redirects_to:`, `response_code:`, `response_positives:`, `response_size:`, `max_url_positives:`, `tracker:`, `category:`, `asn:`/`autonomous_system_number:`, `aso:`/`as_owner:`, `ip:"200.61.38.216/24"`, `parent_domain:dropbox.com`, `main_icon_dhash:`, `targeted_brand:apple`, `reputation:`, `comment:`, `comment_author:`, `submitter:`, `first_submitter:`, `submissions:`/`s:`, `fs`, `ls`, `la`, `lm`/`last_modification_date`, `engines:`, `<engine_name>:`, `outgoing_link:` (wildcards), `have:`, plus GTI cross-cuts (`gti_score`, `gti_severity`, `gti_verdict`, `threat_actor`, `related_actor`).

**URL `tag:` values:** `downloads-pe`, `downloads-apk`, `downloads-elf`, `downloads-dmg`, `downloads-zip`, `downloads-pdf`, `downloads-doc`, `opendir`, `contains-pe`, `contains-zip`, `contains-msi`, `contains-apk`, `contains-dmg`, `ip`, `non-ascii`.

---

## Domain search modifiers (`entity:domain`)

`domain:` (wildcards), `tld:`, `depth:`, `category:`, `registrar:`, `popularity_rank:`, `reputation:`, `comment:`, `comment_author:`, `creation_date:`, `last_update_date:`, `last_modification_date`/`lm`, `main_icon_dhash:`, `whois:`, `jarm:`, `parent_domain:`, `domain_regex:"[b-y]{12}\\.(biz|pw|space|us)"`, `fuzzy_domain:www.santander.com`, `p`/`positives`, `engines:`, `<engine_name>:`, `have:`.

**DNS records:** `a`/`a_record`, `a_ttl`, `aaaa`/`aaaa_record`, `aaaa_ttl`, `caa`/`caa_record`, `cname`/`cname_record`, `cname_ttl`, `dname`/`dname_record`, `dname_ttl`, `mx`/`mx_record`, `mx_ttl`, `ns`/`ns_record`, `ns_ttl`, `soa`/`soa_record`, `txt`/`txt_record`, `txt_ttl`, generic `ttl`.

**SSL:** `ssl_issuer:`, `ssl_serial:`, `ssl_subject:`, `ssl_thumbprint:`, `ssl_not_before:`, `ssl_not_after:`.

**File cross-pivot counters:** `detected_communicating_files_count`, `communicating_files_max_detections`, `detected_downloaded_files_count`, `downloaded_files_max_detections`, `detected_referring_files_count`, `referring_files_max_detections`, `detected_urls_count`, `urls_max_detections`.

**Domain `tag:` values:** `dga`, `hex`, `non-ascii`, `dynamic-dns`, `nxdomain`. Plus GTI cross-cuts.

---

## IP address search modifiers (`entity:ip`)

`ip:"8.8.8.8/24"`, `asn:`/`autonomous_system_number:`, `aso:`/`autonomous_system_owner:`, `country:us`, `continent:eu`, `domain_resolutions_count:`, `reputation:`, `comment:`, `comment_author:`, `p`/`positives`, `engines:`, `<engine_name>:`, `jarm:`, `whois:`, `lm`/`last_modification_date`, `have:`. SSL set (`ssl_issuer`, `ssl_serial`, `ssl_subject`, `ssl_thumbprint`, `ssl_not_before`, `ssl_not_after`). Same file cross-pivot counters as domains. **IP `tag:` values:** `private`, `multicast`, `link-local`, `reserved`, `loopback`. Plus GTI cross-cuts.

---

## Collection / threat-intel object modifiers (`entity:collection`)

**`collection_type:` is REQUIRED and case-sensitive** — one of: `threat-actor`, `malware-family`, `software-toolkit`, `campaign`, `collection`, `report`, `vulnerability`.

**General:** `name`, `description`, `owner`, `publisher`, `publisher_priority`, `publisher_relevance`, `publisher_reliability`, `origin` (`Google Threat Intelligence`/`Crowdsourced`/`Partner`), `source_region`, `targeted_region`, `targeted_industry`, `targeted_industry_group`, `motivation`, `malware_role`, `operating_system`, `threat_actor`, `threat_actors:5+`, `suspected_threat_actor`, `merged_actor` (threat-actor only), `threat_category`, `threat_scape`, `software_toolkit`, `detection:Trojan`, `capability:"capture credentials"`, `tag`, `fs`/`first_seen`, `ls`/`last_seen`, `creation_date`, `last_modification_date`/`lm`, `references`, `sigma_rules`, `yara_rulesets`, `files`, `urls`, `domains`, `ips`/`ip_addresses`, `shared_with_me:true`, `have`/`has`.

**Report-only:** `report_type` (`OSINT Article`, `Actor Profile`, `Malware Profile`, `Industry Reporting`, `Threat Activity Report`, …).

**Vulnerability-only:** `risk_rating:high`, `cvss_3x_base_score`, `cvss_3x_temporal_score`, `cvss_2x_base_score`, `cvss_2x_temporal_score`, `available_mitigation`, `exploitation_state`, `exploitation_vector`, `exploitation_consequence`, `vulnerable_vendor`, `vulnerable_product`, `vulnerable_cpe`.

**Case-sensitive value vocabularies:**
- `motivation`: `Attack / Destruction`, `Espionage`, `Financial Gain`, `Hacktivism`, `Influence`, `Surveillance`, `Opportunistic`.
- `malware_role`: `Backdoor`, `Ransomware`, `Dropper`, `Keylogger`, `Credential Stealer`, `Remote Control and Administration Tool`, …
- `operating_system`: `Android`, `BSD`, `FreeBSD`, `Linux`, `Mac`, `Unix`, `VMkernel`, `Windows`, `ios`.
- `targeted_industry`: `Defense`, `Aerospace`, `Bank`, `Government`, … (Mandiant taxonomy).
- `source_region`/`targeted_region`: ISO code or `Africa`/`America`/`Asia`/`Europe`/`Oceania` + sub-regions.

**Sort (`order=` on `/collections` and `/intelligence/search`):** `relevance-`, `creation_date-`, `last_modification_date-`, `lookups_trend-`, `submissions_trend-`.

---

## Reports search bar modifiers

On the dedicated Reports bar these need no `entity:`; on the top bar prefix with `entity:collection collection_type:report`. Modifiers: `name`, `description`, free-text, `creation_date`, `last_modification_date`, `origin:"Google Threat Intelligence"`/`origin:Crowdsourced`, `publisher`, `owner`, `report_type:"Industry Reporting"`, `source_region`, `targeted_region`, `targeted_industry`, `targeted_industry_group`, `operating_system`, `malware_role`, `motivation`, `threat_actor:APT41` (case-sensitive), `malware_family:CobaltStrike`, `software_toolkit:COBALTSTRIKE`, `files`, `urls`, `domains`, `ip_addresses`.

---

## Relationships (for pivoting via `GET /{type}/{id}/{relationship}`)

Use `…/relationships/{relationship}` for descriptors-only (cheaper), or `…/{relationship}` for full objects. Can also inline several with `?relationships=a,b` on the main report call.

**Files:** `analyses`, `behaviours`, `bundled_files`, `carbonblack_children`, `carbonblack_parents`, `collections`, `comments`, `compressed_parents`, `contacted_domains`, `contacted_ips`, `contacted_urls`, `dropped_files`, `email_attachments`, `email_parents`, `embedded_domains`, `embedded_ips`, `embedded_urls`, `execution_parents`, `graphs`, `itw_domains`, `itw_ips`, `itw_urls`, `memory_pattern_domains`, `memory_pattern_ips`, `memory_pattern_urls`, `overlay_children`, `overlay_parents`, `pcap_children`, `pcap_parents`, `pe_resource_children`, `pe_resource_parents`, `related_threat_actors`, `screenshots`, `sigma_analysis`, `similar_files`, `submissions`, `urls_for_embedded_js`, `user_votes`, `votes`.

**Domains:** `caa_records`, `cname_records`, `collections`, `comments`, `communicating_files`, `downloaded_files`, `graphs`, `historical_ssl_certificates`, `historical_whois`, `immediate_parent`, `mx_records`, `ns_records`, `parent`, `referrer_files`, `related_comments`, `related_threat_actors`, `resolutions`, `siblings`, `soa_records`, `subdomains`, `urls`, `user_votes`, `votes`.

**IP addresses:** `collections`, `comments`, `communicating_files`, `downloaded_files`, `graphs`, `historical_ssl_certificates`, `historical_whois`, `referrer_files`, `related_comments`, `related_threat_actors`, `resolutions`, `urls`, `user_votes`, `votes`.

**URLs:** `analyses`, `collections`, `comments`, `communicating_files`, `contacted_domains`, `contacted_ips`, `downloaded_files`, `embedded_js_files`, `graphs`, `last_serving_ip_address`, `network_location`, `redirecting_urls`, `redirects_to`, `referrer_files`, `referrer_urls`, `related_comments`, `related_threat_actors`, `submissions`, `urls_related_by_tracker_id`, `user_votes`, `votes`.

**Collections:** `files`, `urls`, `domains`, `ip_addresses`, `attack_techniques`, `references`, `threat_actors`, `malware_families`, `campaigns`, `hunting_rulesets`. Plus `…/mitre_tree` and `…/timeline/events`.
