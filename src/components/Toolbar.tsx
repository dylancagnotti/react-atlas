import type { FiltersState } from '../model/graph';

interface ToolbarProps {
  filters: FiltersState;
  selectedNodeName: string | null;
  onSearchChange: (value: string) => void;
  onToggleProviders: () => void;
  onToggleHostNodes: () => void;
  onToggleFocusMode: () => void;
  onFitToView: () => void;
}

export function Toolbar({
  filters,
  selectedNodeName,
  onSearchChange,
  onToggleProviders,
  onToggleHostNodes,
  onToggleFocusMode,
  onFitToView,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__title-group">
        <span className="eyebrow">Milestone 1</span>
        <h1>React Atlas</h1>
        <p>Spatial mockup of live component behavior before runtime instrumentation lands.</p>
      </div>

      <div className="toolbar__controls">
        <label className="toolbar__search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Filter components"
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <button type="button" onClick={onToggleProviders} className="toolbar__toggle">
          {filters.hideProviders ? 'Show providers' : 'Hide providers'}
        </button>

        <button type="button" onClick={onToggleHostNodes} className="toolbar__toggle">
          {filters.hideHostNodes ? 'Show host nodes' : 'Hide host nodes'}
        </button>

        <button
          type="button"
          onClick={onToggleFocusMode}
          className="toolbar__toggle"
          disabled={!selectedNodeName}
        >
          {filters.focusMode === 'subtree' ? 'Show whole graph' : 'Focus selected subtree'}
        </button>

        <button type="button" onClick={onFitToView} className="toolbar__toggle toolbar__toggle--strong">
          Fit view
        </button>
      </div>
    </div>
  );
}