// Roman Guides Companion — MyRomeScreen (tab "Saved")
// Ridotta alla sola shortlist (Empty and Error States addendum, stato 03):
// titolo, conteggio, lista ordinata per distanza, stato vuoto. Meet the
// Guides / Our Story / testimonial / link recensioni si sono spostati nel
// tab Experiences, che ora racconta anche chi siamo — vedi ExperiencesScreen.tsx.

import { usePlacesStore } from '../../store/usePlacesStore';
import { SavedPlacesList } from './SavedPlacesList';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import type { TabKey } from '../../design-system/components/TabBar';

interface MyRomeScreenProps {
  onNavigate: (tab: TabKey) => void;
}

export function MyRomeScreen({ onNavigate }: MyRomeScreenProps) {
  const savedCount = usePlacesStore((s) => s.savedPlaceIds.length);

  return (
    <div style={{ padding: 'var(--space-5) var(--space-4)', height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <SectionHeader title="Saved" subtitle={savedCount === 0 ? 'Nothing yet' : `${savedCount} place${savedCount === 1 ? '' : 's'}`} />
      <SavedPlacesList onSelect={() => onNavigate('rome')} onBrowseMap={() => onNavigate('rome')} />
    </div>
  );
}
