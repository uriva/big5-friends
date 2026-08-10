"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Network, Sparkles, RefreshCw } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Node {
  id: string;
  name: string;
  avatarUrl?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  profile: Profile;
}

interface Link {
  source: string;
  target: string;
  similarity: number; // 0 to 100%
}

interface PersonalityForceGraphProps {
  members: Profile[];
  traitStatsMap: Record<
    string,
    Record<string, { wins: number; total: number; winRate: number }>
  >;
}

export function PersonalityForceGraph({
  members,
  traitStatsMap,
}: PersonalityForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredLink, setHoveredLink] = useState<{
    sourceName: string;
    targetName: string;
    similarity: number;
  } | null>(null);

  // Compute pairwise similarities (0 - 100%) between all members
  const links: Link[] = useMemo(() => {
    const linkList: Link[] = [];
    const traits = [
      "agreeableness",
      "openness",
      "conscientiousness",
      "extraversion",
      "neuroticism",
    ];

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const m1 = members[i];
        const m2 = members[j];

        let totalDiff = 0;
        let validTraits = 0;

        traits.forEach((tKey) => {
          const stats1 = traitStatsMap[tKey]?.[m1.id];
          const stats2 = traitStatsMap[tKey]?.[m2.id];

          const wr1 = stats1?.winRate ?? 50;
          const wr2 = stats2?.winRate ?? 50;

          totalDiff += Math.abs(wr1 - wr2);
          validTraits += 1;
        });

        const avgDiff = validTraits > 0 ? totalDiff / validTraits : 0;
        const similarity = Math.max(0, Math.min(100, Math.round(100 - avgDiff)));

        linkList.push({
          source: m1.id,
          target: m2.id,
          similarity,
        });
      }
    }

    return linkList;
  }, [members, traitStatsMap]);

  // Simulation state
  const nodesRef = useRef<Node[]>([]);
  const draggedNodeRef = useRef<Node | null>(null);

  // Initialize node positions
  useEffect(() => {
    const width = 600;
    const height = 400;
    const radius = 28;

    nodesRef.current = members.map((m, idx) => {
      const angle = (idx / Math.max(1, members.length)) * 2 * Math.PI;
      const dist = 120 + Math.random() * 20;
      return {
        id: m.id,
        name: m.name,
        avatarUrl: m.avatarUrl,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius,
        profile: m,
      };
    });
  }, [members]);

  // Force simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const width = canvas.width;
    const height = canvas.height;

    const simulate = () => {
      const nodes = nodesRef.current;

      // Force calculations
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // 1. Center attraction force
        const dxCenter = width / 2 - n1.x;
        const dyCenter = height / 2 - n1.y;
        n1.vx += dxCenter * 0.002;
        n1.vy += dyCenter * 0.002;

        // 2. Node-node repulsion force
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n1.radius + n2.radius + 60;

          if (dist < minDist) {
            const force = (minDist - dist) * 0.05;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // 3. Link spring force based on similarity
      links.forEach((link) => {
        const n1 = nodes.find((n) => n.id === link.source);
        const n2 = nodes.find((n) => n.id === link.target);
        if (!n1 || !n2) return;

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Higher similarity = shorter target distance (pull closer)
        const targetDist = 200 - (link.similarity / 100) * 120; // 80px to 200px
        const force = (dist - targetDist) * 0.02;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });

      // Update positions with friction & boundary damping
      nodes.forEach((n) => {
        if (draggedNodeRef.current === n) return;

        n.vx *= 0.85; // friction
        n.vy *= 0.85;

        n.x += n.vx;
        n.y += n.vy;

        // Keep inside bounds
        const pad = n.radius + 10;
        n.x = Math.max(pad, Math.min(width - pad, n.x));
        n.y = Math.max(pad, Math.min(height - pad, n.y));
      });

      // RENDER CANVAS
      ctx.clearRect(0, 0, width, height);

      // Draw background grid dots
      ctx.fillStyle = "rgba(51, 65, 85, 0.25)";
      for (let x = 20; x < width; x += 30) {
        for (let y = 20; y < height; y += 30) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Draw Links (Lines)
      links.forEach((link) => {
        const n1 = nodes.find((n) => n.id === link.source);
        const n2 = nodes.find((n) => n.id === link.target);
        if (!n1 || !n2) return;

        const isHovered =
          hoveredNode && (hoveredNode.id === n1.id || hoveredNode.id === n2.id);

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);

        // Line style based on similarity
        const alpha = isHovered
          ? 0.8
          : 0.15 + (link.similarity / 100) * 0.4;
        const lineWidth = 1 + (link.similarity / 100) * 3;

        ctx.strokeStyle =
          link.similarity >= 80
            ? `rgba(52, 211, 153, ${alpha})` // Emerald
            : link.similarity >= 60
            ? `rgba(99, 102, 241, ${alpha})` // Indigo
            : `rgba(148, 163, 184, ${alpha})`; // Muted

        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Draw similarity percentage pill in middle of line
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.arc(midX, midY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${link.similarity}%`, midX, midY);
      });

      // Draw Nodes (People)
      nodes.forEach((n) => {
        const isSelected = hoveredNode?.id === n.id;

        // Node Outer Glow Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
          ctx.fill();
        }

        // Node Circle Background
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.strokeStyle = isSelected ? "#818cf8" : "#475569";
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Initials inside node
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.name.charAt(0).toUpperCase(), n.x, n.y - 1);

        // Name Tag Label below node
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        const labelWidth = ctx.measureText(n.name).width + 16;
        ctx.fillRect(n.x - labelWidth / 2, n.y + n.radius + 4, labelWidth, 18);

        ctx.fillStyle = isSelected ? "#a5b4fc" : "#e2e8f0";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(n.name, n.x, n.y + n.radius + 13);
      });

      animId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [links, hoveredNode]);

  // Handle Mouse Hover & Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const clicked = nodesRef.current.find((n) => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius;
    });

    if (clicked) {
      draggedNodeRef.current = clicked;
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = mx;
      draggedNodeRef.current.y = my;
      return;
    }

    // Hover detection
    const hovered = nodesRef.current.find((n) => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius;
    });

    setHoveredNode(hovered || null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggedNodeRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Personality Similarity Force Graph</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Interactive network simulation. Friends with similar Big 5 profiles gravitate closer together!
            </p>
          </div>
        </div>
      </div>

      {/* Canvas Interactive Arena */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-[380px] cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Hover Information Badge */}
        {hoveredNode && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2 text-xs shadow-xl text-slate-200">
            <span className="font-bold text-indigo-400">{hoveredNode.name}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Drag node to move in force simulation
            </span>
          </div>
        )}
      </div>

      {/* Top Similarity Matches Grid */}
      <div className="pt-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Top Personality Matches in Group
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {links
            .slice()
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3)
            .map((link, idx) => {
              const p1 = members.find((m) => m.id === link.source)?.name || "Friend";
              const p2 = members.find((m) => m.id === link.target)?.name || "Friend";

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <span className="text-slate-300 font-semibold truncate">
                    {p1} & {p2}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] shrink-0 ml-2">
                    {link.similarity}% Match
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
