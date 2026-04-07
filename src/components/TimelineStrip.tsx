import type { RenderEvent } from '../model/graph';

interface TimelineStripProps {
  events: RenderEvent[];
  activeEventId: string | null;
  selectedNodeId: string | null;
  onSelectEvent: (event: RenderEvent) => void;
  onTogglePlayback: () => void;
  isPlaying: boolean;
}

export function TimelineStrip({
  events,
  activeEventId,
  selectedNodeId,
  onSelectEvent,
  onTogglePlayback,
  isPlaying,
}: TimelineStripProps) {
  return (
    <section className="panel panel--timeline">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Activity</span>
          <h2>Recent render pulses</h2>
        </div>
        <button type="button" onClick={onTogglePlayback} className="timeline__toggle">
          {isPlaying ? 'Pause playback' : 'Resume playback'}
        </button>
      </div>

      <div className="timeline">
        {events.map((event) => {
          const isActive = event.id === activeEventId;
          const isSelected = event.componentId === selectedNodeId;

          return (
            <button
              key={event.id}
              type="button"
              className={[
                'timeline__event',
                isActive ? 'timeline__event--active' : '',
                isSelected ? 'timeline__event--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectEvent(event)}
            >
              <span className="timeline__trigger">{event.trigger}</span>
              <strong>{event.label}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}