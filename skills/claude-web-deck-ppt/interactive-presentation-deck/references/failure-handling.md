# Failure handling

When constraints conflict, preserve the audience's understanding first, then visual polish, then optional flourish.

## Common conflicts

- **Too much copy**: shorten, move nuance to notes, or split into reveal states. Never solve it by making body text tiny.
- **Busy image behind text**: move the copy to a bounded region, change `objectPosition`, add a scrim, or regenerate with copy-safe negative space.
- **Image does not fit the scene**: change the scene composition before distorting the asset.
- **Mobile overflow**: switch from columns to a sequence or stacked scene; do not hide essential content.
- **Overlap warning**: remove arbitrary absolute positioning; if overlap is intentional, declare the layer pair and inspect it at full size.
- **Source density**: keep short source labels visible and move long citations to notes or a research trail.
- **Color conflict**: use labels, position, pattern, and shape before adding more colors.
- **Interaction ambiguity**: make the state transition explicit; do not let click, Space, and a control cause multiple actions.
- **Performance budget exceeded**: resize or recompress artwork, lazy-load later scenes, or reduce decorative assets before sacrificing readable content.

## Safe fallback order

1. preserve the central claim
2. preserve the audience's ability to navigate
3. preserve readable typography
4. preserve source/citation clarity
5. simplify the visual treatment
6. report the remaining tradeoff briefly

Never silently ship a clipped, unreadable, or misleading scene just because it matches the first visual idea.
