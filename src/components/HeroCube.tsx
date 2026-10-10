'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroCube — 3D sculptural black cube mirroring the Resend hero aesthetic.
 * Pure canvas-based 3D projection with segmented faces, hairline graphite
 * edges (#292d30), subtle ambient lighting, and gentle mouse parallax.
 */
export function HeroCube() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 460);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 460);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = Math.min(canvas.parentElement.clientWidth, 480);
      height = canvas.height = Math.min(canvas.parentElement.clientWidth, 480);
    };
    window.addEventListener('resize', handleResize);

    // Cube rotation angles
    let rx = 0.55;
    let ry = -0.65;
    let rz = 0.15;
    let targetRx = rx;
    let targetRy = ry;

    // Mouse parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      targetRx = 0.55 + my * 0.4;
      targetRy = -0.65 + mx * 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Build segmented sub-cubes (3x3x3 grid like Resend's faceted cube)
    interface Cubelet {
      x: number;
      y: number;
      z: number;
      size: number;
      patternIndex: number;
    }

    const cubelets: Cubelet[] = [];
    const size = 38; // size of each small block
    const spacing = 43; // spacing between centers
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Keep hollow center and subtle offset like the sculpture in Resend
          if (x === 0 && y === 0 && z === 0) continue;
          cubelets.push({
            x: x * spacing,
            y: y * spacing,
            z: z * spacing,
            size: size / 2,
            patternIndex: (x + y + z + 9) % 3,
          });
        }
      }
    }

    // 3D Point projection helper
    function rotateAndProject(
      px: number,
      py: number,
      pz: number,
      rotX: number,
      rotY: number,
      rotZ: number,
      cx: number,
      cy: number,
      fov: number
    ) {
      // Rotate around Y
      let x1 = px * Math.cos(rotY) + pz * Math.sin(rotY);
      let y1 = py;
      let z1 = -px * Math.sin(rotY) + pz * Math.cos(rotY);

      // Rotate around X
      let x2 = x1;
      let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

      // Rotate around Z
      let x3 = x2 * Math.cos(rotZ) - y2 * Math.sin(rotZ);
      let y3 = x2 * Math.sin(rotZ) + y2 * Math.cos(rotZ);
      let z3 = z2;

      // Perspective projection
      const distance = 420;
      const scale = fov / (distance + z3);
      return {
        x: cx + x3 * scale,
        y: cy + y3 * scale,
        z: z3,
        scale,
      };
    }

    function render() {
      if (!ctx) return;
      // Smooth interpolation
      rx += (targetRx - rx) * 0.05 + 0.0012; // slow continuous idle rotation
      ry += (targetRy - ry) * 0.05 + 0.0022;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 400;

      // Collect all faces of each cubelet
      interface Face {
        vertices: { x: number; y: number }[];
        avgZ: number;
        normalZ: number;
        fill: string;
        stroke: string;
        pattern: number;
      }

      const faces: Face[] = [];

      cubelets.forEach((c) => {
        const hs = c.size;
        // 8 vertices for this cubelet
        const rawVerts = [
          [-hs, -hs, -hs],
          [hs, -hs, -hs],
          [hs, hs, -hs],
          [-hs, hs, -hs],
          [-hs, -hs, hs],
          [hs, -hs, hs],
          [hs, hs, hs],
          [-hs, hs, hs],
        ];

        const projected = rawVerts.map((v) =>
          rotateAndProject(
            c.x + v[0],
            c.y + v[1],
            c.z + v[2],
            rx,
            ry,
            rz,
            cx,
            cy,
            fov
          )
        );

        // 6 faces: front, back, top, bottom, left, right
        const faceIndices = [
          { idx: [4, 5, 6, 7], nx: 0, ny: 0, nz: 1 }, // front
          { idx: [1, 0, 3, 2], nx: 0, ny: 0, nz: -1 }, // back
          { idx: [0, 1, 5, 4], nx: 0, ny: -1, nz: 0 }, // top
          { idx: [7, 6, 2, 3], nx: 0, ny: 1, nz: 0 }, // bottom
          { idx: [0, 4, 7, 3], nx: -1, ny: 0, nz: 0 }, // left
          { idx: [5, 1, 2, 6], nx: 1, ny: 0, nz: 0 }, // right
        ];

        faceIndices.forEach((f) => {
          // Calculate rotated normal for shading & backface culling
          let norm = rotateAndProject(f.nx, f.ny, f.nz, rx, ry, rz, 0, 0, 100);
          if (norm.z < 0) return; // backface culling

          const avgZ =
            (projected[f.idx[0]].z +
              projected[f.idx[1]].z +
              projected[f.idx[2]].z +
              projected[f.idx[3]].z) /
            4;

          // Subtle lighting: shade of black/near-black with specular graphite
          const lightIntensity = Math.max(0.06, norm.z / 100);
          const val = Math.floor(10 + lightIntensity * 28);
          const fill = `rgb(${val}, ${val}, ${val + 1})`;
          const stroke = lightIntensity > 0.6 ? '#3a3f44' : '#222528';

          faces.push({
            vertices: f.idx.map((i) => ({ x: projected[i].x, y: projected[i].y })),
            avgZ,
            normalZ: norm.z,
            fill,
            stroke,
            pattern: c.patternIndex,
          });
        });
      });

      // Painter's algorithm: sort back-to-front
      faces.sort((a, b) => b.avgZ - a.avgZ);

      // Draw faces
      faces.forEach((face) => {
        ctx.beginPath();
        ctx.moveTo(face.vertices[0].x, face.vertices[0].y);
        for (let i = 1; i < face.vertices.length; i++) {
          ctx.lineTo(face.vertices[i].x, face.vertices[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = face.fill;
        ctx.fill();

        // 1px hairline border
        ctx.lineWidth = 1;
        ctx.strokeStyle = face.stroke;
        ctx.stroke();

        // Subtle micro-pattern dots on selected face for textural resemblance to Resend's textured faces
        if (face.pattern === 0 && face.normalZ > 50) {
          const midX = (face.vertices[0].x + face.vertices[2].x) / 2;
          const midY = (face.vertices[0].y + face.vertices[2].y) / 2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          ctx.arc(midX, midY, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Subtle radial ambient background glow behind the object */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '480px',
          maxHeight: '480px',
          display: 'block',
        }}
      />
    </div>
  );
}
