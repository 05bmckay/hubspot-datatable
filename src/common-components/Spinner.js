import React, { useEffect, useRef, useState } from "react";
import { Text } from "@hubspot/ui-extensions";
import { SPINNERS } from "./spinners.js";

const DEFAULT_NAME = "braille";

/**
 * <Spinner /> — animated unicode (braille) loading indicator built on the
 * HubSpot `Text` primitive. No custom HTML/CSS, just frame-swapped text.
 *
 * Props:
 *   name      — preset name (see SPINNER_NAMES). Default "braille".
 *   frames    — custom frames array (overrides preset).
 *   interval  — ms between frames (overrides preset, default 80).
 *   label     — string suffix rendered after the frame, e.g. "Loading…".
 *   children  — alternative to `label`. Rendered next to the spinner.
 *   paused    — when true, freezes the animation on the current frame.
 *   gap       — characters between frame and label (default " ").
 *   ...rest   — forwarded to the underlying `Text` (variant, format, …).
 */
export const Spinner = ({
  name = DEFAULT_NAME,
  frames,
  interval,
  label,
  children,
  paused = false,
  gap = " ",
  ...rest
}) => {
  const preset = SPINNERS[name] || SPINNERS[DEFAULT_NAME];
  const resolvedFrames = Array.isArray(frames) && frames.length > 0 ? frames : preset.frames;
  const resolvedInterval = Number.isFinite(interval) ? interval : preset.interval;

  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    if (paused || resolvedFrames.length <= 1) return undefined;
    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % resolvedFrames.length;
      setIndex(indexRef.current);
    }, Math.max(16, resolvedInterval));
    return () => clearInterval(id);
  }, [paused, resolvedFrames, resolvedInterval]);

  // Reset to first frame whenever the source frames change.
  useEffect(() => {
    indexRef.current = 0;
    setIndex(0);
  }, [resolvedFrames]);

  const frame = resolvedFrames[index % resolvedFrames.length];
  const suffix = children != null ? children : label;

  if (suffix == null || suffix === "") {
    return React.createElement(Text, rest, frame);
  }

  return React.createElement(
    Text,
    rest,
    frame,
    gap,
    suffix
  );
};
