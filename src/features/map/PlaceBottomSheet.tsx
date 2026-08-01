// Roman Guides Companion — PlaceBottomSheet
// Concierge Map (sprint dedicato): non più un unico popup per tutte le
// categorie. Questo componente è ora solo uno smistatore — guarda il tier
// della categoria e mostra PremiumPlaceCard o UtilityPlaceCard. Nessuno dei
// due tocca il codice dell'altro: modificare Utility non rischia di
// rompere Premium, e viceversa.

import { BottomSheet } from '../../design-system/components/BottomSheet';
import { getCategoryMeta } from '../../config/categories.config';
import { usePlacesStore } from '../../store/usePlacesStore';
import { PremiumPlaceCard } from './PremiumPlaceCard';
import { UtilityPlaceCard } from './UtilityPlaceCard';

export function PlaceBottomSheet() {
  const selectedPlace = usePlacesStore((s) => s.selectedPlace);
  const selectPlace = usePlacesStore((s) => s.selectPlace);
  const userLocation = usePlacesStore((s) => s.userLocation);
  const savedPlaceIds = usePlacesStore((s) => s.savedPlaceIds);
  const toggleSaved = usePlacesStore((s) => s.toggleSaved);

  const isOpen = !!selectedPlace;
  const p = selectedPlace;
  const tier = p ? getCategoryMeta(p.category).tier : null;
  const isSaved = p ? savedPlaceIds.includes(p.id) : false;

  return (
    <BottomSheet isOpen={isOpen} onClose={() => selectPlace(null)}>
      {p && tier === 'premium' && (
        <PremiumPlaceCard place={p} userLocation={userLocation} isSaved={isSaved} onToggleSaved={() => toggleSaved(p.id)} />
      )}
      {p && tier === 'utility' && <UtilityPlaceCard place={p} userLocation={userLocation} />}
    </BottomSheet>
  );
}
