import { useEffect, useMemo, useState } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { TimelineStrip } from './components/TimelineStrip';
import { Toolbar } from './components/Toolbar';
import { seedGraph, seedRenderEvents } from './data/mockGraph';
import { collectSubtree, isNodeVisible, type ComponentNode, type FiltersState, type GraphData, type PlaybackState } from './model/graph';

const INITIAL_VIEWPORT = { x: 20, y: 0, scale: 0.92 };

function App() {
  const [graph, setGraph] = useState<GraphData>(() => seedGraph());
  const [events] = useState(() => seedRenderEvents());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('results-panel');
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    hideProviders: false,
    hideHostNodes: true,
    focusMode: 'all',
  });
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: true,
    activeEventId: null,
  });
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    if (!playback.isPlaying) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setEventIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % events.length;
        const nextEvent = events[nextIndex];

        setPlayback((currentPlayback) => ({
          ...currentPlayback,
          activeEventId: nextEvent.id,
        }));

        setGraph((currentGraph) => {
          const target = currentGraph.nodes[nextEvent.componentId];
          if (!target) {
            return currentGraph;
          }

          return {
            ...currentGraph,
            nodes: {
              ...currentGraph.nodes,
              [target.id]: {
                ...target,
                renderCount: target.renderCount + 1,
                lastRenderedAt: nextEvent.timestamp,
              },
            },
          };
        });

        return nextIndex;
      });
    }, 1100);

    return () => window.clearInterval(interval);
  }, [events, playback.isPlaying]);

  const subtreeIds = useMemo(() => {
    if (filters.focusMode !== 'subtree' || !selectedNodeId) {
      return null;
    }

    return collectSubtree(selectedNodeId, graph.nodes);
  }, [filters.focusMode, graph.nodes, selectedNodeId]);

  const visibleNodes = useMemo(() => {
    return Object.values(graph.nodes).filter((node) => {
      if (!isNodeVisible(node, filters)) {
        return false;
      }

      if (subtreeIds && !subtreeIds.has(node.id)) {
        return false;
      }

      return true;
    });
  }, [filters, graph.nodes, subtreeIds]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return graph.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  }, [graph.edges, visibleNodeIds]);

  const selectedNode = selectedNodeId ? graph.nodes[selectedNodeId] ?? null : null;
  const selectedParentName = selectedNode?.parentId ? graph.nodes[selectedNode.parentId]?.name ?? null : null;

  const activeNodeIds = useMemo(() => {
    const ids = new Set<string>();
    const activeEvent = events[eventIndex];
    if (activeEvent) {
      ids.add(activeEvent.componentId);
      const activeNode = graph.nodes[activeEvent.componentId];
      if (activeNode?.parentId) {
        ids.add(activeNode.parentId);
      }
    }

    if (selectedNodeId) {
      ids.add(selectedNodeId);
    }

    return ids;
  }, [eventIndex, events, graph.nodes, selectedNodeId]);

  const recentEvents = useMemo(() => {
    return [...events].slice(-8).reverse();
  }, [events]);

  const fitToView = () => {
    setViewport(INITIAL_VIEWPORT);
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleSelectEvent = (event: (typeof events)[number]) => {
    setSelectedNodeId(event.componentId);
    setPlayback((currentPlayback) => ({
      ...currentPlayback,
      activeEventId: event.id,
    }));

    const targetNode = graph.nodes[event.componentId];
    if (targetNode) {
      setViewport({
        x: Math.round(420 - targetNode.x * 0.75),
        y: Math.round(250 - targetNode.y * 0.75),
        scale: 0.9,
      });
    }
  };

  return (
    <div className="app-shell">
      <Toolbar
        filters={filters}
        selectedNodeName={selectedNode?.name ?? null}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        onToggleProviders={() =>
          setFilters((current) => ({
            ...current,
            hideProviders: !current.hideProviders,
          }))
        }
        onToggleHostNodes={() =>
          setFilters((current) => ({
            ...current,
            hideHostNodes: !current.hideHostNodes,
          }))
        }
        onToggleFocusMode={() =>
          setFilters((current) => ({
            ...current,
            focusMode: current.focusMode === 'all' ? 'subtree' : 'all',
          }))
        }
        onFitToView={fitToView}
      />

      <div className="workspace-grid">
        <GraphCanvas
          nodes={visibleNodes}
          edges={visibleEdges}
          activeNodeIds={activeNodeIds}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          viewport={viewport}
          onViewportChange={setViewport}
          timelineEvents={recentEvents}
        />
        <InspectorPanel node={selectedNode} parentName={selectedParentName} />
      </div>

      <TimelineStrip
        events={recentEvents}
        activeEventId={playback.activeEventId}
        selectedNodeId={selectedNodeId}
        onSelectEvent={handleSelectEvent}
        onTogglePlayback={() =>
          setPlayback((currentPlayback) => ({
            ...currentPlayback,
            isPlaying: !currentPlayback.isPlaying,
          }))
        }
        isPlaying={playback.isPlaying}
      />
    </div>
  );
}

export default App;