import React from "react";
import { Composition, registerRoot } from "remotion";
import { DemoVideo } from "./Root";
import { TOTAL_FRAMES, FPS } from "./lib/tokens";

function RemotionRoot() {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
}

registerRoot(RemotionRoot);
