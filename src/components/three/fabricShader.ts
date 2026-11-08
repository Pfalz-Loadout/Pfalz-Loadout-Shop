/**
 * Gewebe-Makro im Materiallabor: Oxford-Bindung als Shader, reagiert auf
 * Licht (Mausposition). Wassertropfen perlen ab und rollen über die
 * Beschichtung – rein prozedural, keine Texturen.
 */
import * as THREE from 'three';

const frag = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLight;
uniform float uZoom;
uniform vec3 uColor;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

// Höhe der 2x2-Oxford-Bindung
float weave(vec2 p){
  vec2 cell = floor(p);
  vec2 f = fract(p);
  bool warp = mod(floor(cell.x*0.5) + floor(cell.y*0.5), 2.0) < 1.0;
  float along = warp ? f.y : f.x;
  float across = warp ? f.x : f.y;
  float bulge = sin(across * 3.14159);
  float dip = 0.72 + 0.28 * sin(along * 3.14159);
  float fiber = 0.05 * sin((along * 14.0 + across * 3.0) * 3.14159 + hash(cell) * 6.0);
  return bulge * dip + fiber;
}

// Tropfen: Position wandert langsam (abperlen), Radius variiert
vec3 drop(vec2 uv, float i){
  float t = uTime * (0.05 + hash(vec2(i, 2.0)) * 0.05);
  vec2 c = vec2(hash(vec2(i, 1.0)), fract(hash(vec2(i, 3.0)) - t));
  float r = 0.025 + hash(vec2(i, 4.0)) * 0.05;
  vec2 d = (uv - c) * vec2(uRes.x / uRes.y, 1.0);
  float l = length(d) / r;
  return vec3(d / r, l);
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uZoom;

  // Tropfen-Brechung
  vec2 refr = vec2(0.0);
  float wet = 0.0;
  float spec = 0.0;
  float edge = 0.0;
  for (int i = 0; i < 7; i++){
    vec3 d = drop(uv, float(i));
    if (d.z < 1.0){
      float h = sqrt(1.0 - d.z * d.z);
      refr += -d.xy * (1.0 - h) * 0.6;
      wet = max(wet, h);
      vec3 n = normalize(vec3(d.xy, h));
      vec3 L = normalize(vec3(uLight - uv, 0.6));
      spec = max(spec, pow(max(dot(reflect(-L, n), vec3(0,0,1)), 0.0), 60.0));
      edge = max(edge, smoothstep(0.8, 1.0, d.z));
    }
  }

  vec2 q = p + refr * 3.0;
  float e = 0.02;
  float h = weave(q);
  vec3 n = normalize(vec3(weave(q - vec2(e,0.0)) - weave(q + vec2(e,0.0)), weave(q - vec2(0.0,e)) - weave(q + vec2(0.0,e)), 0.12));
  vec3 L = normalize(vec3((uLight - uv) * vec2(aspect, 1.0) * 2.0, 0.9));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float sh = pow(max(dot(reflect(-L, n), vec3(0.0,0.0,1.0)), 0.0), 18.0) * 0.25; // PVC-Glanz
  vec3 col = uColor * (0.35 + diff * 0.85) * (0.75 + h * 0.35) + sh;

  // Tropfen: dunkler Rand, heller Kern, Glanzpunkt
  col = mix(col, col * 0.55, edge * 0.7);
  col += wet * 0.04 + spec * 1.2;

  // Vignette
  float vig = smoothstep(1.2, 0.3, length((uv - 0.5) * vec2(aspect, 1.0)));
  col *= 0.55 + 0.45 * vig;
  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}
`;

export function mountFabric(host: HTMLElement, opts: { color: string; lowPower: boolean }) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPower ? 1 : 1.5));
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const lin = new THREE.Color(opts.color); // Farbe linear für Shader
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uLight: { value: new THREE.Vector2(0.7, 0.75) },
    uZoom: { value: 26 },
    uColor: { value: new THREE.Vector3(lin.r, lin.g, lin.b) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: frag,
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const resize = () => {
    const r = host.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    uniforms.uRes.value.set(r.width, r.height);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  const target = new THREE.Vector2(0.7, 0.75);
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  };
  host.addEventListener('pointermove', onMove);

  let raf = 0;
  let vis = false;
  const t0 = performance.now();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    uniforms.uTime.value = (performance.now() - t0) / 1000;
    uniforms.uLight.value.lerp(target, 0.08);
    renderer.render(scene, cam);
  };
  const io = new IntersectionObserver(([e]) => {
    vis = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (vis) loop();
  });
  io.observe(host);

  return {
    /** Kamerafahrt bis auf Faserebene: 0 = Übersicht, 1 = Makro */
    setZoom: (z: number) => (uniforms.uZoom.value = 26 - z * 20),
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
