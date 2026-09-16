# Menya Tutoring Software — Logo Colours

## About Menya

**Menya** — Kinyarwanda for *know* — is tutoring software for nonprofit programs:
a shared system of record for the organisations that pair underserved K–12
students with volunteer tutors for STEM subjects, mostly math.

It connects students with dedicated tutors, tracks every session, and follows
their progress well past graduation. It's **infrastructure, not a course** — the
layer a program runs on.

The logo should look like a trustworthy system of record: calm, precise, built to
last — think an accounting ledger or a university press imprint, not a colourful
kids' learning app. One small warm touch (the amber) keeps it from feeling cold.

## Four colours for the mark

| Colour | Hex | Role |
| --- | --- | --- |
| Slate | `#2F4F4F` | The primary weight — the mark's main colour on light grounds. |
| Slate Gray | `#708090` | Secondary tone — supporting shapes, a lighter second value. |
| Gunmetal | `#353E43` | Deep neutral — one-colour mark, and the wordmark beside it. |
| Amber | `#F0981E` | The single warm accent — one small "spark", never more. |

On dark grounds the mark reverses to near-white `#E3E9EC` with `#8B9BA6`
supporting; amber stays `#F0981E`.

## The mark as shipped

[`resources/logo.svg`](../resources/logo.svg) is a raster export rather than
vector shapes in the four colours above, and its pixels have drifted off-spec.
Sampling it gives, approximately:

| Sampled | Nearest spec colour | Note |
| --- | --- | --- |
| `#F0A030`, ramping through `#F0B040` to `#F0D040` | Amber `#F0981E` | The hexagon is a warm gradient, not one flat amber. |
| `#304040` | Gunmetal `#353E43` | The figure — slightly greener than spec. |
| `#D0E0F0` | — | A pale blue highlight with no equivalent in the palette. |
| `#50B090` | — | A small mint accent — a hue the palette doesn't contain at all. |

The four colours above stay authoritative: build UI from those, not from values
pulled out of the current artwork. Closing the gap means re-exporting the mark
to spec — flat amber, no mint or pale blue — not widening the palette to match
what the export happens to contain.
