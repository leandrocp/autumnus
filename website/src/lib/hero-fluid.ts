import WebGLFluidEnhanced from "webgl-fluid-enhanced";

// Syntax-highlighting-inspired color palette
const COLOR_PALETTE = [
  "#f472b6", // pink — keywords
  "#a78bfa", // purple — strings
  "#38bdf8", // blue — functions
  "#34d399", // green — comments
  "#fbbf24", // amber — types
  "#fb923c", // orange — constants
  "#f87171", // red — operators
  "#818cf8", // indigo — attributes
];

export function mountHeroFluid(container: HTMLElement): WebGLFluidEnhanced {
  const fluid = new WebGLFluidEnhanced(container);

  fluid.setConfig({
    transparent: true,
    colorPalette: COLOR_PALETTE,
    colorful: true,
    colorUpdateSpeed: 4,
    densityDissipation: 0.985,
    velocityDissipation: 0.992,
    pressure: 0.8,
    curl: 18,
    splatRadius: 0.32,
    splatForce: 2600,
    shading: false,
    bloom: true,
    bloomIntensity: 0.18,
    bloomThreshold: 0.35,
    bloomSoftKnee: 0.7,
    sunrays: false,
    hover: true,
    brightness: 0.55,
    simResolution: 128,
    dyeResolution: 1024,
  });

  fluid.start();

  return fluid;
}
