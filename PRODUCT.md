# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Patients across a broad age/background mix in and around Tel Aviv-Yafo — athletes and teens through older adults — needing pain treatment, post-injury/post-surgical orthopedic rehab, sports rehab and performance work, or preventive physiotherapy. Confirmed with the site owner as a broad mix, not a single niche.

## Product Purpose

The site presents Gal Ofri, a licensed physiotherapist (B.P.T) in Tel Aviv, and exists to drive visitors to book an initial consultation — by phone, WhatsApp, or the contact form.

## Positioning

Confirmed by Gal in Oct 2026. The existing copy (her history as a former competitive gymnast who went through injury and rehab herself, the "whole person" philosophy, personalized ongoing care) is broadly right. What she added, and what new copy should lean on, is **function and self-efficacy**: the work is aimed at what the patient can do in daily life, and at their sense that they are capable of doing it themselves, not at the painful spot alone and not at keeping them in treatment. Her approved About quote says exactly this ("המטרה שלי אינה שתישארו אצלי לעולם…"), and step 3 of the first-visit section ("כלים להמשך") carries it too.

Price: 350–400 ₪ per session, confirmed by Gal in Oct 2026. Published in the FAQ and as the JSON-LD `priceRange`, both from `SITE.price` in `src/data/site.ts`.

Session length: the first visit is always an hour, follow-ups 45–60 minutes. Treatment is offered in Hebrew and English. Gal holds a formal dry-needling certification; it is a secondary skill, and where it appears on the homepage is still her decision.

## Operating Context

Physical clinic at Bloch 38, Tel Aviv-Yafo, **and home visits** at the patient's home (confirmed Oct 2026; service area not yet stated). Gal's written procedures for both, approved by her, are the source for the cancellation policy (24h free, later cancellation charged 50%, illness never charged, same for clinic and home) and payment methods (cash, bank transfer, PayBox). Hours: Sun–Thu 08:00–19:00, Fri 08:00–14:00 (`SITE.openingHours` is the source). Contact channels: phone, WhatsApp, on-site contact form, Instagram.

**Mobile is the primary device.** The site owner confirmed most visitors arrive on a phone. Mobile is not a secondary breakpoint to check after desktop — it is the primary experience every design/UX decision should be evaluated against first (layout, tap targets, load performance, copy length, form usability, animation cost on lower-end devices).

## Capabilities and Constraints

Static site (Astro), no backend/CMS — content updates require code changes. No online booking; conversion happens through manual contact (phone/WhatsApp/form).

The contact form posts to Web3Forms and has worked end to end since Sep 2026 (see `CLAUDE.md` → Known issues). The success message promises a reply within 3 business days, which is Gal's own figure.

## Brand Commitments

Name: גל עופרי פיזיותרפיה (Gal Ofri Physiotherapy). Language: Hebrew only, RTL. Voice: warm, personal, professional but not clinically cold — first-person ("נעים מאוד, אני גל..."). Visual identity: **bright tangerine on warm graphite** (`src/styles/global.css` design tokens). Rebuilt Sep 2026 at the practitioner's request — she rejected the previous peach-orange scale as "orange-brown-red". The cause was structural: the deep steps of the orange scale were carrying headings, links and the CTA, and an orange dark enough to sit under white text at 4.5:1 is necessarily rust. The fix separated the roles rather than re-tuning the hue — graphite (`#1c1917`) carries every job that needs contrast, and orange stays bright because it no longer has to be readable. The load-bearing rule is **orange never carries small text and never carries meaning alone**; breaking it walks the identity straight back to the brown she rejected. Not to be reopened without an explicit request.

## Evidence on Hand

Real photos of Gal and the clinic from the October 2026 shoot (`src/assets/photos/`). Service content: orthopedic rehab, sports rehab & performance, preventive physiotherapy. Policy pages: accessibility, privacy, cancellation, plus an FAQ. Testimonials are three real Google reviews, quoted verbatim in `Testimonials.astro`; never fabricate or edit one.

## Product Principles

- Care framed around the whole person, not just the symptom — keep this tone consistent in new copy.
- Ongoing personal guidance through a rehab process, not a one-off treatment.
- Broad audience, not a single niche — avoid narrowing the voice to speak only to athletes or only to older patients.
- **Mobile-first, in every sense** — most visitors are on a phone. Any new UI, layout, or interaction should be designed and reviewed on a mobile viewport first, then checked on desktop, not the other way around.

## Accessibility & Inclusion

Standard WCAG AA is sufficient — confirmed with the site owner, no elevated requirement at this time.
