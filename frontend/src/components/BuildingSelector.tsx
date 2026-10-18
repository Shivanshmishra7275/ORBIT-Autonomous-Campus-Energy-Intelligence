import type { Building } from '../types/contracts';

interface Props {
  buildings: Building[];
  selectedId: string;
  onSelect: (buildingId: string) => void;
  loading?: boolean;
}

export function BuildingSelector({ buildings, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="skeleton-list" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-item" />
        ))}
      </div>
    );
  }

  const getBuildingEmoji = (id: string) => {
    if (id.startsWith('ENG')) return '🔬';
    if (id.startsWith('LIB')) return '📚';
    if (id.startsWith('HST')) return '🏢';
    if (id.startsWith('ADM')) return '🏛️';
    return '⚡';
  };

  return (
    <div className="building-list" role="radiogroup" aria-label="Campus Building Selection">
      {buildings.map((building) => {
        const isSelected = building.building_id === selectedId;
        return (
          <button
            key={building.building_id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`building-item ${isSelected ? 'active' : ''}`}
            onClick={() => onSelect(building.building_id)}
          >
            <div className="building-icon" aria-hidden="true">
              {getBuildingEmoji(building.building_id)}
            </div>

            <div className="building-meta">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <span className="building-name">{building.name}</span>
                <span className="building-id">{building.building_id}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                <span>{building.occupancy_profile}</span>
                <span>•</span>
                <span>{building.operating_hours.start}–{building.operating_hours.end}</span>
              </div>
            </div>

            <div className="building-check" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
