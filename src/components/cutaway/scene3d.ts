/**
 * Low-poly 3D cutaway of the same house shown in the drawing. Loaded with a
 * dynamic import only after the visitor asks for it, so three.js is never in
 * the initial bundle. Returns a handle that disposes every GPU resource.
 */
import * as THREE from "three";

export interface SceneOptions {
  autoRotate: boolean;
}

export interface SceneHandle {
  dispose: () => void;
  /** Rotate by a step (radians) — used by keyboard controls. */
  rotate: (dTheta: number, dPhi: number) => void;
  zoom: (factor: number) => void;
}

const COLOURS = {
  line: 0x0f1e33,
  wall: 0x9fb3cf,
  furnace: 0xc26a32,
  duct: 0xa9541f,
  condenser: 0x3d5f8f,
  lineSet: 0x1f3a63,
  heater: 0xe8a877,
  pipe: 0x8f4318,
  ground: 0xd8ccb6,
};

export function mountScene(host: HTMLElement, opts: SceneOptions): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);

  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  const house = new THREE.Group();
  scene.add(house);

  const edgeMat = new THREE.LineBasicMaterial({ color: COLOURS.line });
  const glassMat = new THREE.MeshBasicMaterial({
    color: COLOURS.wall,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  /** Translucent box with crisp outline edges. */
  function shell(w: number, h: number, d: number, x: number, y: number, z: number) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, glassMat);
    mesh.position.set(x, y, z);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    edges.position.copy(mesh.position);
    house.add(mesh, edges);
  }

  function solid(geo: THREE.BufferGeometry, color: number, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
    mesh.position.set(x, y, z);
    house.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), edgeMat);
    edges.position.copy(mesh.position);
    house.add(edges);
    return mesh;
  }

  function tube(points: Array<[number, number, number]>, radius: number, color: number) {
    const curve = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < points.length - 1; i++) {
      curve.add(new THREE.LineCurve3(new THREE.Vector3(...points[i]), new THREE.Vector3(...points[i + 1])));
    }
    const geo = new THREE.TubeGeometry(curve, points.length * 8, radius, 8, false);
    house.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color })));
  }

  // House volumes: basement, two storeys (width 8, depth 6).
  shell(8, 2.4, 6, 0, -1.2, 0);
  shell(8, 2.6, 6, 0, 1.3, 0);
  shell(8, 2.4, 6, 0, 3.8, 0);

  // Pitched roof as an extruded triangle.
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-4.4, 0);
  roofShape.lineTo(0, 2.6);
  roofShape.lineTo(4.4, 0);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 6.4, bevelEnabled: false });
  roofGeo.translate(0, 5, -3.2);
  house.add(new THREE.Mesh(roofGeo, glassMat));
  house.add(new THREE.LineSegments(new THREE.EdgesGeometry(roofGeo), edgeMat));

  // Ground plane around the house.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 18),
    new THREE.MeshBasicMaterial({ color: COLOURS.ground, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.01;
  house.add(ground);

  // Equipment.
  solid(new THREE.BoxGeometry(1, 1.6, 0.9), COLOURS.furnace, -1.6, -1.6, 0); // furnace
  solid(new THREE.BoxGeometry(1, 0.4, 0.9), COLOURS.condenser, -1.6, -0.6, 0); // indoor coil
  solid(new THREE.CylinderGeometry(0.45, 0.45, 1.5, 16), COLOURS.heater, 1.4, -1.65, 0.6); // water heater
  solid(new THREE.BoxGeometry(1.2, 1, 1.2), COLOURS.condenser, 5.6, 0.5, 1); // outdoor condenser
  solid(new THREE.BoxGeometry(1.6, 0.1, 1.6), COLOURS.ground, 5.6, 0.05, 1); // pad

  // Supply trunk and risers, return.
  solid(new THREE.BoxGeometry(5, 0.3, 0.5), COLOURS.duct, 1, -0.25, 0);
  solid(new THREE.BoxGeometry(0.3, 2.9, 0.3), COLOURS.duct, 0.4, 1.3, -0.6);
  solid(new THREE.BoxGeometry(0.3, 0.6, 0.3), COLOURS.duct, 3.2, 0.2, 0);
  tube(
    [
      [-3.8, 0.4, 0],
      [-3.8, -0.3, 0],
      [-2.6, -0.3, 0],
      [-2.6, -1.6, 0],
      [-2.1, -1.6, 0],
    ],
    0.16,
    COLOURS.lineSet,
  );

  // Refrigerant line set from the condenser to the indoor coil.
  tube(
    [
      [5, 0.4, 1],
      [4, 0.4, 1],
      [4, -0.6, 1],
      [-1.1, -0.6, 1],
      [-1.1, -0.6, 0],
    ],
    0.06,
    COLOURS.lineSet,
  );

  // Hot-water line to the kitchen and bathroom.
  tube(
    [
      [1.4, -0.9, 0.6],
      [1.4, -0.5, 0.6],
      [3.4, -0.5, 1.6],
      [3.4, 4, 1.6],
    ],
    0.05,
    COLOURS.pipe,
  );

  house.position.y = -1.2;

  // Simple orbit camera.
  let theta = 0.75;
  let phi = 1.15;
  let radius = 19;
  const target = new THREE.Vector3(0.6, 0.4, 0);

  function placeCamera() {
    phi = Math.min(Math.max(phi, 0.25), 1.5);
    radius = Math.min(Math.max(radius, 9), 34);
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    );
    camera.lookAt(target);
  }

  function render() {
    placeCamera();
    renderer.render(scene, camera);
  }

  function resize() {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    render();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let userMoved = false;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    userMoved = true;
    lastX = e.clientX;
    lastY = e.clientY;
    host.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    theta -= (e.clientX - lastX) * 0.008;
    phi -= (e.clientY - lastY) * 0.008;
    lastX = e.clientX;
    lastY = e.clientY;
    render();
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    radius *= e.deltaY > 0 ? 1.08 : 0.92;
    userMoved = true;
    render();
  };
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("wheel", onWheel, { passive: false });

  let raf = 0;
  if (opts.autoRotate) {
    const tick = () => {
      if (!userMoved) {
        theta += 0.0025;
        render();
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
  }

  return {
    rotate(dTheta, dPhi) {
      userMoved = true;
      theta += dTheta;
      phi += dPhi;
      render();
    },
    zoom(factor) {
      userMoved = true;
      radius *= factor;
      render();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("wheel", onWheel);
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const m = obj.material as THREE.Material | THREE.Material[];
          (Array.isArray(m) ? m : [m]).forEach((mat) => materials.add(mat));
        }
      });
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
