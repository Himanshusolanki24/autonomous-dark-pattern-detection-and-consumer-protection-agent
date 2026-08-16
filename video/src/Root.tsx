import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Product } from "./scenes/Scene2Product";
import { Scene3Goal } from "./scenes/Scene3Goal";
import { Scene4Perception } from "./scenes/Scene4Perception";
import { Scene5Detection } from "./scenes/Scene5Detection";
import { Scene6Planning } from "./scenes/Scene6Planning";
import { Scene7Action } from "./scenes/Scene7Action";
import { Scene8Approval } from "./scenes/Scene8Approval";
import { Scene9Verification } from "./scenes/Scene9Verification";
import { Scene10Pipeline } from "./scenes/Scene10Pipeline";
import { Scene11WhyItMatters } from "./scenes/Scene11WhyItMatters";
import { Scene12Final } from "./scenes/Scene12Final";
import { SCENE_STARTS, SCENE_DURATIONS } from "./lib/tokens";

export function DemoVideo() {
  return (
    <AbsoluteFill style={{ background: "#f7f7f8" }}>
      <Sequence from={SCENE_STARTS.s1} durationInFrames={SCENE_DURATIONS.s1}>
        <Scene1Hook />
      </Sequence>

      <Sequence from={SCENE_STARTS.s2} durationInFrames={SCENE_DURATIONS.s2}>
        <Scene2Product />
      </Sequence>

      <Sequence from={SCENE_STARTS.s3} durationInFrames={SCENE_DURATIONS.s3}>
        <Scene3Goal />
      </Sequence>

      <Sequence from={SCENE_STARTS.s4} durationInFrames={SCENE_DURATIONS.s4}>
        <Scene4Perception />
      </Sequence>

      <Sequence from={SCENE_STARTS.s5} durationInFrames={SCENE_DURATIONS.s5}>
        <Scene5Detection />
      </Sequence>

      <Sequence from={SCENE_STARTS.s6} durationInFrames={SCENE_DURATIONS.s6}>
        <Scene6Planning />
      </Sequence>

      <Sequence from={SCENE_STARTS.s7} durationInFrames={SCENE_DURATIONS.s7}>
        <Scene7Action />
      </Sequence>

      <Sequence from={SCENE_STARTS.s8} durationInFrames={SCENE_DURATIONS.s8}>
        <Scene8Approval />
      </Sequence>

      <Sequence from={SCENE_STARTS.s9} durationInFrames={SCENE_DURATIONS.s9}>
        <Scene9Verification />
      </Sequence>

      <Sequence from={SCENE_STARTS.s10} durationInFrames={SCENE_DURATIONS.s10}>
        <Scene10Pipeline />
      </Sequence>

      <Sequence from={SCENE_STARTS.s11} durationInFrames={SCENE_DURATIONS.s11}>
        <Scene11WhyItMatters />
      </Sequence>

      <Sequence from={SCENE_STARTS.s12} durationInFrames={SCENE_DURATIONS.s12}>
        <Scene12Final />
      </Sequence>
    </AbsoluteFill>
  );
}
