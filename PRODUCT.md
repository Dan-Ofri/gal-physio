# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Patients across a broad age/background mix in and around Tel Aviv-Yafo — athletes and teens through older adults — needing pain treatment, post-injury/post-surgical orthopedic rehab, sports rehab and performance work, or preventive physiotherapy. Confirmed with the site owner as a broad mix, not a single niche.

## Product Purpose

The site presents Gal Ofri, a licensed physiotherapist (B.P.T) in Tel Aviv, and exists to drive visitors to book an initial consultation — by phone, WhatsApp, or the contact form.

## Positioning

Undecided — not yet confirmed with the practitioner. The existing copy leans on Gal's personal history as a former competitive gymnast who went through injury and rehab herself, and a stated "whole person" philosophy (habits, mind, and the body's own capacity to heal) alongside personalized, ongoing care. The site owner explicitly did not confirm this as the actual competitive differentiator vs. other Tel Aviv clinics — confirm with Gal before treating it as the lead positioning claim.

Price positioning is also unconfirmed — the site's JSON-LD (`SEO.astro`) previously carried a guessed `priceRange: "$$"`; removed until Gal confirms an actual value (this is a public-facing claim Google can surface, not just internal copy).

## Operating Context

Physical clinic at Bloch 38, Tel Aviv-Yafo. Hours: Mon–Thu 08:00–19:00, Fri 08:00–14:00. Contact channels: phone, WhatsApp, on-site contact form, Instagram.

**Mobile is the primary device.** The site owner confirmed most visitors arrive on a phone. Mobile is not a secondary breakpoint to check after desktop — it is the primary experience every design/UX decision should be evaluated against first (layout, tap targets, load performance, copy length, form usability, animation cost on lower-end devices).

## Capabilities and Constraints

Static site (Astro), no backend/CMS — content updates require code changes. No online booking; conversion happens through manual contact (phone/WhatsApp/form).

**The contact form is not live yet** — it posts to Web3Forms but with a placeholder access key, so real submissions currently fail (see `CLAUDE.md` → Known issues). Until a real key is configured, phone and WhatsApp are the only contact channels that actually reach Gal.

## Brand Commitments

Name: גל עופרי פיזיותרפיה (Gal Ofri Physiotherapy). Language: Hebrew only, RTL. Voice: warm, personal, professional but not clinically cold — first-person ("נעים מאוד, אני גל..."). Visual identity: **bright tangerine on warm graphite** (`src/styles/global.css` design tokens). Rebuilt Sep 2026 at the practitioner's request — she rejected the previous peach-orange scale as "orange-brown-red". The cause was structural: the deep steps of the orange scale were carrying headings, links and the CTA, and an orange dark enough to sit under white text at 4.5:1 is necessarily rust. The fix separated the roles rather than re-tuning the hue — graphite (`#1c1917`) carries every job that needs contrast, and orange stays bright because it no longer has to be readable. The load-bearing rule is **orange never carries small text and never carries meaning alone**; breaking it walks the identity straight back to the brown she rejected. Not to be reopened without an explicit request.

## Evidence on Hand

Real photos of Gal and the clinic (being integrated, `src/assets/`). Service content: orthopedic rehab, sports rehab & performance, preventive physiotherapy. Policy pages: accessibility, privacy, cancellation. No patient testimonials/reviews are documented on the site currently — do not fabricate any.

## Product Principles

- Care framed around the whole person, not just the symptom — keep this tone consistent in new copy.
- Ongoing personal guidance through a rehab process, not a one-off treatment.
- Broad audience, not a single niche — avoid narrowing the voice to speak only to athletes or only to older patients.
- **Mobile-first, in every sense** — most visitors are on a phone. Any new UI, layout, or interaction should be designed and reviewed on a mobile viewport first, then checked on desktop, not the other way around.

## Accessibility & Inclusion

Standard WCAG AA is sufficient — confirmed with the site owner, no elevated requirement at this time.
