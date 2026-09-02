// Roman Guides Companion — BrandMark
// Piccolo marchio in cima a Home/Experiences/Guides/Saved (2026-08-17,
// evoluzione brand) — il logo reale (cerchio pennellato rosso + wordmark),
// non solo testo. Rome resta senza: è a mappa piena, una barra qui ridurrebbe
// l'area mappa — decisione esplicita del founder, non un'omissione.
//
// Un solo componente condiviso invece di quattro inserimenti indipendenti,
// così dimensione/spaziatura restano identiche sulle tab che lo mostrano.

import logoUrl from '../../assets/brand/roman-guides-logo.png';

export function BrandMark() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        paddingBottom: 10,
      }}
    >
      <img src={logoUrl} alt="Roman Guides" style={{ height: 96, width: 'auto' }} />
    </div>
  );
}
