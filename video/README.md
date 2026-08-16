# Dark Pattern Trap Killer — Demo Video

Remotion project for the hackathon pitch video.

## Setup

```bash
cd video
npm install
```

## Preview in browser (Remotion Studio)

```bash
npm start
# Opens http://localhost:3000 with frame-by-frame scrubbing
```

## Render to MP4 (1920×1080)

```bash
npm run render
# Output: out/demo.mp4
```

## Render half-res preview (faster)

```bash
npm run render-preview
# Output: out/demo-preview.mp4  (960×540)
```

## Video structure

| Scene | Time     | Description              |
|-------|----------|--------------------------|
| 1     | 0:00–0:08| The Hook — cancellation maze |
| 2     | 0:08–0:18| Product introduction      |
| 3     | 0:18–0:27| User gives agent a goal   |
| 4     | 0:27–0:37| Perception stage          |
| 5     | 0:37–0:49| Dark pattern detection    |
| 6     | 0:49–0:59| Planning stage            |
| 7     | 0:59–1:09| Action stage              |
| 8     | 1:09–1:20| Human approval            |
| 9     | 1:20–1:32| Verification              |
| 10    | 1:32–1:40| Complete pipeline         |
| 11    | 1:40–1:50| Why it matters            |
| 12    | 1:50–2:00| Final product shot        |

**Total:** 120 seconds · 30 fps · 3600 frames · 1920×1080

## File structure

```
src/
  index.tsx          ← Remotion root (registers composition)
  Root.tsx           ← Sequences all 12 scenes
  lib/
    tokens.ts        ← Design tokens, colors, timing
    anim.ts          ← Animation helpers (spring, fade, slide)
  components/
    BrowserChrome.tsx
    AgentConsole.tsx
    PipelineBar.tsx
    SceneWrapper.tsx
  scenes/
    Scene1Hook.tsx
    Scene2Product.tsx
    Scene3Goal.tsx
    Scene4Perception.tsx
    Scene5Detection.tsx
    Scene6Planning.tsx
    Scene7Action.tsx
    Scene8Approval.tsx
    Scene9Verification.tsx
    Scene10Pipeline.tsx
    Scene11WhyItMatters.tsx
    Scene12Final.tsx
```
