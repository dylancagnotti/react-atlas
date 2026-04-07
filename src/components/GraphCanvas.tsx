import { useEffect, useMemo, useRef } from 'react';
import type { ComponentNode, GraphEdge, RenderEvent } from '../model/graph';

interface GraphCanvasProps {
  nodes: ComponentNode[];
  edges: GraphEdge[];
  activeNodeIds: Set<string>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  viewport: { x: number; y: number; scale: number };
  onViewportChange: (viewport: { x: number; y: number; scale: number }) => void;
  timelineEvents: RenderEvent[];
}

const GRAPH_WIDTH = 900;
const GRAPH_HEIGHT = 900;

export function GraphCanvas({
  nodes,
  edges,
  activeNodeIds,
  selectedNodeId,
  onSelectNode,
  viewport,
  onViewportChange,
  timelineEvents,
}: GraphCanvasProps) {
  const dragState = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<string, ComponentNode>,
    [nodes],
  );

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return undefined;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const direction = event.deltaY > 0 ? -1 : 1;
      const nextScale = Math.min(1.85, Math.max(0.55, viewport.scale + direction * 0.08));

      onViewportChange({
        ...viewport,
        scale: Number(nextScale.toFixed(2)),
      });
    };

    svgElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      svgElement.removeEventListener('wheel', handleWheel);
    };
  }, [onViewportChange, viewport]);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    dragState.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: viewport.x,
      startY: viewport.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState.current) {
      return;
    }

    const deltaX = event.clientX - dragState.current.pointerX;
    const deltaY = event.clientY - dragState.current.pointerY;
    onViewportChange({
      ...viewport,
      x: dragState.current.startX + deltaX,
      y: dragState.current.startY + deltaY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="panel panel--canvas">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Graph</span>
          <h2>Runtime map</h2>
        </div>
        <div className="panel__meta">{timelineEvents.length} recent events</div>
      </div>

      <svg
        ref={svgRef}
        className="graph-canvas"
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label="Mock React component graph"
      >
        <defs>
          <linearGradient id="edge-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(80, 110, 255, 0.18)" />
            <stop offset="100%" stopColor="rgba(55, 210, 179, 0.42)" />
          </linearGradient>
        </defs>

        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
          {edges.map((edge) => {
            const source = nodeMap[edge.source];
            const target = nodeMap[edge.target];

            if (!source || !target) {
              return null;
            }

            return (
              <path
                key={edge.id}
                d={`M ${source.x} ${source.y + 28} C ${source.x} ${source.y + 92}, ${target.x} ${target.y - 92}, ${target.x} ${target.y - 28}`}
                className="graph-edge"
              />
            );
          })}

          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isActive = activeNodeIds.has(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
                className={[
                  'graph-node',
                  isSelected ? 'graph-node--selected' : '',
                  isActive ? 'graph-node--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectNode(node.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectNode(node.id);
                  }
                }}
              >
                <rect x={-74} y={-28} rx={18} ry={18} width={148} height={56} />
                <text x="0" y="-2" textAnchor="middle" className="graph-node__label">
                  {node.name}
                </text>
                <text x="0" y="18" textAnchor="middle" className="graph-node__meta">
                  {node.renderCount} renders
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </section>
  );
}