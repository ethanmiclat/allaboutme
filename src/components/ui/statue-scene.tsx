"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, useGLTF } from "@react-three/drei";
import type { Group, Material } from "three";

/**
 * 3D statue slot for the trophy room. Renders a Blender-authored .glb (from
 * `public/assets/statues/`) on a small lit stage; while the file loads — or if
 * you just want to preview the stage before exporting — a gold placeholder
 * primitive stands in. Models should be authored roughly 2 units tall,
 * centered at the origin; `Center` normalizes placement either way.
 *
 * Lighting mimics the CSS `.trophy__spot` look: one warm key light from the
 * upper front plus soft ambient, no environment map (keeps everything
 * offline/self-contained). Idle rotation is disabled for reduced-motion users.
 */

const GOLD = { color: "#e0b64f", metalness: 1, roughness: 0.32 } as const;

const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MQ);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MQ).matches,
    () => false
  );
}

/** Drag / hover state shared between the wrapper span's pointer handlers
    (outside the canvas) and the Turntable frame loop (inside it). `invalidate`
    is r3f's on-demand render trigger, stored here so the outside-the-canvas
    hover handlers can wake a `frameloop="demand"` canvas. */
type ManualSpin = {
  extra: number;
  dragging: boolean;
  lastX: number;
  hovering: boolean;
  invalidate?: () => void;
};

/**
 * Slow turntable spin plus any manual rotation the user has dragged on.
 *
 * `alwaysSpin` (the focus view) idles on its own; otherwise (shelf tiles) the
 * statue only turns while hovered, so the canvas is otherwise completely idle.
 * Under `frameloop="demand"` a frame only renders when something asks for one —
 * so while there's motion to show we re-arm the loop with `invalidate()`, and
 * when the motion stops the loop naturally goes quiet (zero GPU cost). This is
 * what lets a shelf of many statues coexist without each one rendering forever.
 */
function Turntable({
  alwaysSpin,
  manual,
  children,
}: {
  alwaysSpin: boolean;
  manual: React.RefObject<ManualSpin>;
  children: React.ReactNode;
}) {
  const group = useRef<Group>(null);
  const base = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, delta) => {
    if (!group.current) return;
    const m = manual.current;
    const spinning = (alwaysSpin || m.hovering) && !m.dragging;
    if (spinning) base.current += delta * 0.35;
    group.current.rotation.y = base.current + m.extra;
    // Keep the on-demand loop alive only while there's motion to render.
    if (spinning || m.dragging) invalidate();
  });
  return <group ref={group}>{children}</group>;
}

/** Publishes r3f's `invalidate` up to the shared ref so the wrapper span's
    hover handlers (which live outside the canvas) can wake a demand loop. */
function InvalidateBridge({ manual }: { manual: React.RefObject<ManualSpin> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    manual.current.invalidate = invalidate;
  }, [invalidate, manual]);
  return null;
}

function StatueModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // useGLTF caches one scene object per URL, and a Three object can only be
  // mounted in one canvas at a time — clone it so duplicate statues (three
  // basketball players on one shelf) each get their own copy.
  const copy = useMemo(() => {
    const root = scene.clone(true);
    // The team-logo decals export as alpha-BLENDED materials, which three.js
    // draws in the sorted transparent pass with depth writes off — against the
    // crest right behind them that renders as nothing at all. These logos have
    // hard edges and no partial transparency to preserve, so alpha *testing*
    // is both more correct and immune to sort order: the cut-out pixels are
    // discarded outright and the decal joins the opaque pass.
    root.traverse((o) => {
      const mesh = o as unknown as {
        isMesh?: boolean;
        material?: Material & { alphaTest: number; depthWrite: boolean };
      };
      const mat = mesh.material;
      if (!mesh.isMesh || !mat?.transparent) return;
      mat.transparent = false;
      mat.alphaTest = 0.5;
      mat.depthWrite = true;
      mat.needsUpdate = true;
    });
    return root;
  }, [scene]);
  return (
    <Center>
      <primitive object={copy} />
    </Center>
  );
}

/** Gold stand-in shown while the .glb loads (or before one exists). */
function PlaceholderStatue() {
  return (
    <Center>
      <group>
        {/* plinth */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 0.3, 32]} />
          <meshStandardMaterial {...GOLD} roughness={0.45} />
        </mesh>
        {/* figure: simple obelisk-ish form so the slot reads as "statue here" */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.42, 1.4, 0.42]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial {...GOLD} roughness={0.25} />
        </mesh>
      </group>
    </Center>
  );
}

export default function StatueScene({
  model,
  interactive = false,
}: {
  model: string;
  /** Let the viewer drag horizontally to turn the statue themselves. */
  interactive?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const manual = useRef<ManualSpin>({
    extra: 0,
    dragging: false,
    lastX: 0,
    hovering: false,
  });

  // The focus view idles on its own and needs a live loop for drag response;
  // shelf tiles render on demand (static until hovered), so a wall of statues
  // isn't 14 canvases all rendering every frame — the source of the page's
  // half-framerate. Reduced motion drops idle spin but keeps drag responsive.
  const alwaysSpin = interactive && !reducedMotion;
  const frameloop = interactive ? "always" : "demand";

  const dragHandlers = interactive
    ? {
        onPointerDown: (e: React.PointerEvent<HTMLSpanElement>) => {
          manual.current.dragging = true;
          manual.current.lastX = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove: (e: React.PointerEvent<HTMLSpanElement>) => {
          if (!manual.current.dragging) return;
          manual.current.extra += (e.clientX - manual.current.lastX) * 0.012;
          manual.current.lastX = e.clientX;
        },
        onPointerUp: () => {
          manual.current.dragging = false;
        },
        onPointerCancel: () => {
          manual.current.dragging = false;
        },
      }
    : undefined;

  // Shelf tiles: turn only while hovered (mouse). Waking the demand loop needs
  // one invalidate; the Turntable then re-arms itself until the spin settles.
  const hoverHandlers =
    !interactive && !reducedMotion
      ? {
          onPointerEnter: (e: React.PointerEvent<HTMLSpanElement>) => {
            if (e.pointerType !== "mouse") return;
            manual.current.hovering = true;
            manual.current.invalidate?.();
          },
          onPointerLeave: () => {
            manual.current.hovering = false;
          },
        }
      : undefined;

  return (
    <span
      className="trophy__canvas"
      aria-hidden="true"
      {...dragHandlers}
      {...hoverHandlers}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.6, 3.4], fov: 40 }}
        frameloop={frameloop}
        gl={{ alpha: true, antialias: true }}
        // Gold needs headroom before it clips; the shelf is a dark stage.
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05;
        }}
      >
        {/* Bright warm key from the upper front (the "spotlight"), plus fills
            from below and behind so no facet of the figure falls to black. */}
        <ambientLight intensity={0.85} color="#ffe9bf" />
        <directionalLight position={[1.5, 3, 2.5]} intensity={2.1} color="#ffdd9c" />
        <directionalLight position={[-2.4, 1.2, 1.8]} intensity={1.0} color="#ffcf85" />
        <directionalLight position={[0, -1.5, 2]} intensity={0.5} color="#ffc072" />
        <directionalLight position={[0, 1.5, -2.5]} intensity={0.7} color="#ffe0a4" />

        {/* A procedural environment (no external HDR — the page must stay
            self-contained): metal reflects its surroundings, so without this
            the statues read as dark silhouettes no matter how bright the
            lights are. */}
        <Environment resolution={64}>
          <Lightformer
            intensity={2.0}
            color="#ffe6b4"
            position={[0, 2.5, 2]}
            scale={[8, 8, 1]}
          />
          <Lightformer
            intensity={1.1}
            color="#ffb85e"
            position={[-3, 0.5, 1.5]}
            scale={[5, 5, 1]}
          />
          <Lightformer
            intensity={0.8}
            color="#ffd28a"
            position={[3, 0, -1.5]}
            scale={[5, 5, 1]}
          />
        </Environment>

        <InvalidateBridge manual={manual} />
        <Turntable alwaysSpin={alwaysSpin} manual={manual}>
          <Suspense fallback={<PlaceholderStatue />}>
            <StatueModel url={model} />
          </Suspense>
        </Turntable>
      </Canvas>
    </span>
  );
}
