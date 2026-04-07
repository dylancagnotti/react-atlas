import type { ComponentNode } from '../model/graph';

interface InspectorPanelProps {
  node: ComponentNode | null;
  parentName: string | null;
}

export function InspectorPanel({ node, parentName }: InspectorPanelProps) {
  return (
    <aside className="panel panel--inspector">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Inspector</span>
          <h2>{node ? node.name : 'Select a node'}</h2>
        </div>
      </div>

      {!node ? (
        <div className="empty-state">
          <p>Choose a component in the graph to inspect its mock render metadata.</p>
        </div>
      ) : (
        <div className="inspector">
          <dl className="inspector__stats">
            <div>
              <dt>Parent</dt>
              <dd>{parentName ?? 'Root'}</dd>
            </div>
            <div>
              <dt>Children</dt>
              <dd>{node.childIds.length}</dd>
            </div>
            <div>
              <dt>Render count</dt>
              <dd>{node.renderCount}</dd>
            </div>
            <div>
              <dt>Last render</dt>
              <dd>{node.lastRenderedAt ? new Date(node.lastRenderedAt).toLocaleTimeString() : 'Idle'}</dd>
            </div>
          </dl>

          <div className="inspector__section">
            <h3>Tags</h3>
            <div className="tag-row">
              {node.tags.length === 0 ? <span className="tag">standard</span> : null}
              {node.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="inspector__section">
            <h3>Props preview</h3>
            <dl className="props-list">
              {Object.entries(node.propsPreview).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </aside>
  );
}