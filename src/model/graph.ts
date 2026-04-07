export type GraphTag = 'provider' | 'memoized' | 'host' | 'route' | 'suspense';

export interface ComponentNode {
  id: string;
  name: string;
  parentId: string | null;
  childIds: string[];
  depth: number;
  renderCount: number;
  lastRenderedAt: number | null;
  propsPreview: Record<string, string>;
  tags: GraphTag[];
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface RenderEvent {
  id: string;
  componentId: string;
  timestamp: number;
  commitId: number;
  trigger: 'interaction' | 'context' | 'state' | 'props';
  label: string;
}

export interface GraphData {
  nodes: Record<string, ComponentNode>;
  edges: GraphEdge[];
  rootIds: string[];
}

export interface FiltersState {
  search: string;
  hideProviders: boolean;
  hideHostNodes: boolean;
  focusMode: 'all' | 'subtree';
}

export interface PlaybackState {
  isPlaying: boolean;
  activeEventId: string | null;
}

export const RECENT_EVENT_WINDOW_MS = 3600;

export function isNodeVisible(node: ComponentNode, filters: FiltersState): boolean {
  if (filters.hideProviders && node.tags.includes('provider')) {
    return false;
  }

  if (filters.hideHostNodes && node.tags.includes('host')) {
    return false;
  }

  if (!filters.search.trim()) {
    return true;
  }

  return node.name.toLowerCase().includes(filters.search.trim().toLowerCase());
}

export function collectSubtree(nodeId: string, nodes: Record<string, ComponentNode>): Set<string> {
  const ids = new Set<string>();
  const visit = (currentId: string) => {
    if (ids.has(currentId)) {
      return;
    }

    ids.add(currentId);

    const currentNode = nodes[currentId];
    if (!currentNode) {
      return;
    }

    currentNode.childIds.forEach(visit);
  };

  visit(nodeId);
  return ids;
}