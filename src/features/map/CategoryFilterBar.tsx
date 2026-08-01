// Roman Guides Companion — CategoryFilterBar
// Porting del pattern validato nello Spike: chip categoria multi-selezione.

import { Chip } from '../../design-system/components/Chip';
import { CATEGORY_META } from '../../config/categories.config';
import { usePlacesStore } from '../../store/usePlacesStore';
import type { PlaceCategory } from '../../data/types';

export function CategoryFilterBar() {
  const activeCategories = usePlacesStore((s) => s.activeCategories);
  const toggleCategory = usePlacesStore((s) => s.toggleCategory);

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        padding: '8px 12px',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
      }}
    >
      {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((cat) => {
        const meta = CATEGORY_META[cat];
        return (
          <Chip
            key={cat}
            active={activeCategories.has(cat)}
            onClick={() => toggleCategory(cat)}
            activeColor="var(--ink)"
          >
            {meta.emoji} {meta.label}
          </Chip>
        );
      })}
    </div>
  );
}
