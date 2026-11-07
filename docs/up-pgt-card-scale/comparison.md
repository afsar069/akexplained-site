# UP PGT card scale compared with the site

Current-run browser captures at 390px and 1440px are in this directory. `before-metrics.json` records the published UP PGT page beside the PGT and NET hubs; `checks.json` records the revised page.

| Element | Published UP PGT | PGT / NET reference | Revised UP PGT |
| --- | ---: | ---: | ---: |
| Hero title, desktop | 36.8px | 36.8px | 36.8px |
| Featured title, desktop | 32px | 32px PGT | 32px |
| Featured title, phone | 22.4px | 25.6px PGT | 25.6px |
| Resource title | 24.8px desktop, 20px phone | 16.96px | 16.96px |
| Resource helper | 15.68px | 14.72px | 14.72px |
| Resource status | 14.4px | 14.72px PGT | 14.72px |
| Resource icon | 52px desktop, 40px phone | 34px PGT | 34px |

The content edge is 294px on a 1440px desktop viewport, matching the PGT hub's shared 22px content inset beside the 272px sidebar. Phone content has the same 22px side inset. The four resource cards now use the PGT card's 114px desktop minimum height, 104px phone minimum height, 8px radius, 16px desktop gap, and 18px × 22px desktop padding. The selected five-card hierarchy and faded hero remain. No horizontal overflow or browser errors appeared at 320, 390, 768, 1024, or 1440px.
