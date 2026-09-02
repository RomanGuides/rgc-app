// Roman Guides Companion — GuidePhoto
// Cerchio con la foto della guida, o un cerchio rosso con l'iniziale del nome
// quando `avatar` è la stringa vuota (vedi il commento sul campo in
// data/types.ts). Usato a 52px nella lista di GuidesScreen e a 112px in
// GuideDetailScreen.
//
// Viveva in experiences/ExperiencesScreen.tsx, che lo esportava per
// GuideDetailScreen: quando le guide sono diventate una tab a sé (2026-09-01)
// ExperiencesScreen ha smesso di usarlo, e continuare a esportarlo da lì
// avrebbe lasciato una feature dipendente da un export che il suo
// proprietario non usa più. Spostato qui senza modifiche di logica.

export function GuidePhoto({ avatar, name, size = 52 }: { avatar: string; name: string; size?: number }) {
  const isRealUrl = avatar.startsWith('http');
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: isRealUrl ? `url(${avatar}) center/cover` : 'linear-gradient(160deg, var(--red), var(--red-dk))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'var(--display)',
        fontWeight: 700,
        fontSize: size * 0.38,
      }}
    >
      {!isRealUrl && name.charAt(0)}
    </div>
  );
}
