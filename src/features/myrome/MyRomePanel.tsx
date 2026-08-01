// Roman Guides Companion — MyRomePanel
// Overlay (bottom sheet) sulla mappa — usa SavedPlacesList per il contenuto.

import { BottomSheet } from '../../design-system/components/BottomSheet';
import { SavedPlacesList } from './SavedPlacesList';

interface MyRomePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyRomePanel({ isOpen, onClose }: MyRomePanelProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: 12 }}>
        ❤️ My Rome
      </div>
      <SavedPlacesList onSelect={onClose} />
    </BottomSheet>
  );
}
