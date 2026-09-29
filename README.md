# saada.github.io

My personal website for [saada.dev](saada.dev)

```sh
# local dev
bun run dev
# prod build
bun run build
```

Deployment is done using GH actions.

## Link cards

Every post in `blog/<slug>/` gets a 1200x630 link card for X, LinkedIn and friends. X shows only
the picture, so the card carries the headline itself.

1. Add `blog/<slug>/card.json` (a short headline; `<em>` marks the accent word):

   ```json
   { "headline": "A free guitar rig for <em>Omarchy</em>", "kicker": "GuitarMood: every pedal, live",
     "tags": ["Omarchy", "Open source"], "image": "images/card-hero.jpg", "focus": "0% 50%",
     "imageWidth": 600, "fade": 12, "brightness": 1.25 }
   ```

   Use `"fade": 55` (the default) for photos and a short fade for screenshots, so the text gets its own column.
2. The post needs the usual `og:*` and `twitter:*` meta tags (copy them from an existing post).
3. Run `bun run cards` (needs a local Chromium). It renders `images/og-card.png` and stamps
   `?v=<hash>` into `og:image` / `twitter:image`, so X fetches the new card instead of a cached one.

CI runs `bun run cards:check` and refuses to deploy a post without a current card.
