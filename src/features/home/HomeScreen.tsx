// Roman Guides Companion — HomeScreen
// Ridisegnata attorno a tre principi di brand (sessione "direzione
// editoriale"): il serif porta peso editoriale invece di limitarsi a
// decorare i titoli; il tratto di pennello del logo è una firma usata con
// parsimonia, sempre legata a qualcosa di vero (qui: il ritratto della
// guida); le persone vengono prima dei bottoni — la guida del giorno
// appare prima di qualsiasi contenuto promozionale. Il blocco funzionale
// (trasporti, emergenze, tips pratici) resta in fondo, volutamente
// silenzioso: righe sottili, non card colorate, per non competere con la
// parte umana della pagina.

import { useEffect, useState } from 'react';
import type { AppContent, Guide } from '../../data/types';
import { getAppContent } from '../../services/appContentService';
import { getGuides } from '../../services/guidesService';
import { BrushRing } from '../../design-system/components/BrushRing';
import { ICON_REGISTRY, ArrowRightIcon, PhoneIcon, MessageIcon } from '../../design-system/components/Icons';
import { LOCAL_TIPS, GET_AROUND_OPTIONS } from './homeConfig';

interface HomeScreenProps {
  onNavigate: (tab: 'home' | 'map' | 'experiences' | 'explore' | 'myrome') => void;
}

const COMMUNITY_BASE = 'https://romanguides.com/wp-content/uploads-webpc/uploads/App%20Roman%20Guides/';

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [sections, setSections] = useState<AppContent[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    setSections(getAppContent());
    setGuides(getGuides());
  }, []);

  const hero = sections.find((s) => s.id === 'hero');
  const recommend = sections.find((s) => s.id === 'tip_of_the_day');
  const getAround = sections.find((s) => s.id === 'get_around');
  const emergency = sections.find((s) => s.id === 'emergency');

  // Guida del giorno: rotazione stabile sul giorno del mese, così cambia
  // ma resta la stessa per tutta la giornata di un dato utente.
  const todayGuide = guides.length > 0 ? guides[new Date().getDate() % guides.length] : undefined;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      {hero && (
        <div
          style={{
            position: 'relative',
            minHeight: 340,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'var(--space-6) var(--space-5) var(--space-5)',
            background: hero.imageUrl
              ? `linear-gradient(0deg, rgba(10,5,4,0.88) 0%, rgba(10,5,4,0.2) 55%, rgba(10,5,4,0.02) 75%), url(${hero.imageUrl}) center/cover`
              : 'linear-gradient(160deg, var(--red), var(--red-dk))',
            color: 'var(--white)',
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 8,
            }}
          >
            Roman Guides
          </div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(1.6rem, 7.5vw, 1.9rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
              maxWidth: '92%',
            }}
          >
            {hero.title}
          </div>
        </div>
      )}

      {todayGuide && (
        <div style={{ padding: 'var(--space-6) var(--space-5) 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
              <BrushRing size={84} strokeWidth={2.4} />
              <img
                src={todayGuide.avatar}
                alt={todayGuide.name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  position: 'relative',
                  zIndex: 1,
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                {todayGuide.name}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--stone)' }}>Your guide today</div>
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontStyle: 'italic',
              fontSize: '1.05rem',
              lineHeight: 1.45,
              color: 'var(--ink)',
              margin: '16px 0 6px',
              paddingLeft: 14,
              borderLeft: '2px solid var(--red)',
            }}
          >
            {todayGuide.quote}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--stone)', paddingLeft: 16, marginBottom: 8 }}>
            — {todayGuide.name}, Roman Guides
          </div>
          <a
            href={todayGuide.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--red)',
              textDecoration: 'none',
              marginLeft: 16,
            }}
          >
            <MessageIcon width={16} height={16} />
            Message {todayGuide.name}
          </a>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 'var(--space-8) var(--space-5) var(--space-3)',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <div style={{ position: 'relative', width: 26, height: 26, flexShrink: 0 }}>
          <BrushRing size={26} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      {recommend && (
        <div style={{ padding: '0 var(--space-5)' }}>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: 'var(--red)',
              marginBottom: 8,
            }}
          >
            Tonight's recommendation
          </div>
          {recommend.imageUrl && (
            <div
              style={{
                height: 210,
                borderRadius: 'var(--radius-lg)',
                marginBottom: 14,
                background: `linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.02)), url(${recommend.imageUrl}) center/cover`,
              }}
            />
          )}
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25, margin: '0 0 6px' }}>
            {recommend.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--stone)', lineHeight: 1.55, marginBottom: 14 }}>
            {recommend.subtitle || recommend.body}
          </div>
          {recommend.ctaUrl && (
            <a
              href={recommend.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--red)',
                textDecoration: 'none',
                marginBottom: 'var(--space-8)',
              }}
            >
              {recommend.ctaLabel || 'Discover more'}
              <ArrowRightIcon width={14} height={14} />
            </a>
          )}
        </div>
      )}

      <div style={{ padding: '0 var(--space-5)' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
          Stories from the road
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--stone)', marginBottom: 14 }}>
          Moments shared by travellers who joined us. #RomanGuides
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {['community-1.jpeg', 'community-2.jpeg', 'community-3.jpeg', 'community-4.jpeg'].map((f) => (
            <div
              key={f}
              style={{
                flexShrink: 0,
                width: 120,
                height: 150,
                borderRadius: 'var(--radius-md)',
                background: `url(${COMMUNITY_BASE}${f}) center/cover`,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: 'var(--space-8) var(--space-5) var(--space-6)', borderTop: '1px solid var(--line)', marginTop: 'var(--space-8)' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: 12 }}>
          Practical, when you need it
        </div>

        {LOCAL_TIPS.map((tip) => {
          const Icon = ICON_REGISTRY[tip.icon];
          const content = (
            <>
              <Icon width={17} height={17} style={{ color: 'var(--stone)', flexShrink: 0 }} />
              <span>{tip.label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--line)' }}>
                <ArrowRightIcon width={14} height={14} style={{ display: 'block' }} />
              </span>
            </>
          );
          const rowStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 0',
            borderBottom: '1px solid var(--line)',
            fontSize: '0.82rem',
            color: 'var(--ink)',
            textDecoration: 'none',
          } as const;
          return tip.action.type === 'tab' ? (
            <button
              key={tip.label}
              onClick={() => onNavigate(tip.action.type === 'tab' ? tip.action.tab : 'home')}
              style={{ ...rowStyle, background: 'none', border: 'none', borderBottom: '1px solid var(--line)', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {content}
            </button>
          ) : (
            <a key={tip.label} href={tip.action.url} target="_blank" rel="noopener noreferrer" style={rowStyle}>
              {content}
            </a>
          );
        })}

        {getAround &&
          GET_AROUND_OPTIONS.map((opt) => {
            const Icon = ICON_REGISTRY[opt.icon];
            return (
              <a
                key={opt.label}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: '1px solid var(--line)',
                  fontSize: '0.82rem',
                  color: 'var(--ink)',
                  textDecoration: 'none',
                }}
              >
                <Icon width={17} height={17} style={{ color: 'var(--stone)', flexShrink: 0 }} />
                <span>{opt.label}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--line)' }}>
                  <ArrowRightIcon width={14} height={14} style={{ display: 'block' }} />
                </span>
              </a>
            );
          })}

        {emergency && (
          <a
            href={emergency.ctaUrl || 'tel:112'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 0',
              fontSize: '0.82rem',
              color: 'var(--ink)',
              textDecoration: 'none',
            }}
          >
            <PhoneIcon width={17} height={17} style={{ color: 'var(--stone)', flexShrink: 0 }} />
            <span>{emergency.title}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--line)' }}>
              <ArrowRightIcon width={14} height={14} style={{ display: 'block' }} />
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
