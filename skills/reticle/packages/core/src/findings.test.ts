import { describe, expect, it } from 'vitest';
import {
  ABSENCE_DERIVED_CONTRADICTIONS,
  ContradictionKind,
  CrawlAnomalyKind,
  FindingTier,
  isAbsenceDerived,
  tierOfFinding,
} from './findings.js';

/**
 * How much authority a finding carries, derived from its kind.
 *
 * The distinction is already load-bearing — an OBSERVED contradiction outranks a passing assertion
 * and answers `no`, an ABSENCE_DERIVED one downgrades to `unknown` — but until now it was only ever
 * computed at the point of use. Naming it is what lets a finding SAY which of the two it is, so an
 * agent handed three of them can tell which one decided the verdict and which is a note about when
 * Reticle stopped looking.
 */

describe('tierOfFinding', () => {
  it('calls a positively observed contradiction OBSERVED', () => {
    expect(tierOfFinding(ContradictionKind.SIGNAL_CONTRADICTED)).toBe(FindingTier.OBSERVED);
    expect(tierOfFinding(ContradictionKind.UI_ADVANCED_REQUEST_FAILED)).toBe(FindingTier.OBSERVED);
  });

  it('calls a contradiction inferred from absence ABSENCE_DERIVED', () => {
    for (const kind of ABSENCE_DERIVED_CONTRADICTIONS) {
      expect(tierOfFinding(kind), kind).toBe(FindingTier.ABSENCE_DERIVED);
    }
  });

  it('agrees with isAbsenceDerived, because it is the same question asked twice', () => {
    for (const kind of Object.values(ContradictionKind)) {
      const expected = isAbsenceDerived(kind) ? FindingTier.ABSENCE_DERIVED : FindingTier.OBSERVED;
      expect(tierOfFinding(kind), kind).toBe(expected);
    }
  });

  it('defaults a kind it has never heard of to OBSERVED', () => {
    // The property the extension seams rest on. A rule registered by a consumer emits kinds that are
    // deliberately NOT in this package's vocabulary — that is what stops somebody's private finding
    // names shipping in the free product by accident. Those findings still have to be tierable, and
    // OBSERVED is the honest default: an unrecognised kind has made no claim about a window Reticle
    // chose the end of, so downgrading it to "we may have looked too early" would be inventing a
    // caveat on its behalf.
    expect(tierOfFinding('some-downstream-rule-fired')).toBe(FindingTier.OBSERVED);
    expect(tierOfFinding('')).toBe(FindingTier.OBSERVED);
  });

  it('tiers a single-channel crawl anomaly too', () => {
    // Crawl anomalies flow into the same reports as contradictions, so a lookup that only understood
    // one of the two vocabularies would answer for half the findings and silently default the rest.
    expect(tierOfFinding(CrawlAnomalyKind.CONSOLE_ERROR)).toBe(FindingTier.OBSERVED);
    expect(tierOfFinding(CrawlAnomalyKind.FAILED_REQUEST)).toBe(FindingTier.OBSERVED);
  });
});
