// Roman Guides Companion — HomeScreen
// Rifinita su richiesta esplicita del founder (sprint "qualità premium"):
// header che invita a conoscere il team, rimossa la card installazione app,
// social con loghi veri (no emoji), sezione evergreen al posto del tip
// giornaliero, community come galleria più ricca, Practical Info
// semplificato, sconto aggiornato al 10% (ROME10).

import { useEffect, useState } from 'react';
import type { AppContent, Experience } from '../../data/types';
import { getAppContent } from '../../services/appContentService';
import { getExperiences } from '../../services/experiencesService';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { SectionHeader } from '../../design-system/components/SectionHeader';
import { InstagramIcon, FacebookIcon, TikTokIcon, YouTubeIcon } from '../../design-system/components/SocialIcons';
import { EmailCaptureBanner } from '../../design-system/components/EmailCaptureBanner';
import { LOCAL_TIPS, GET_AROUND_OPTIONS } from './homeConfig';
import { LINKS } from '../../config/links';

interface HomeScreenProps {
  onNavigate: (tab: 'home' | 'map' | 'experiences' | 'explore' | 'myrome') => void;
}

const COMMUNITY_BASE = 'https://romanguides.com/wp-content/uploads-webpc/uploads/App%20Roman%20Guides/';

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [sections, setSections] = useState<AppContent[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    setSections(getAppContent());
    setExperiences(getExperiences());
  }, []);

  const hero = sections.find((s) => s.id === 'hero');
  const recommend = sections.find((s) => s.id === 'tip_of_the_day');
  const getAround = sections.find((s) => s.id === 'get_around');
  const emergency = sections.find((s) => s.id === 'emergency');

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-app)' }}>
      {hero && (
        <div
          style={{
            position: 'relative',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'var(--space-6) var(--space-5) var(--space-6)',
            background: hero.imageUrl
              ? `linear-gradient(0deg, rgba(10,5,4,0.92) 0%, rgba(10,5,4,0.35) 45%, rgba(10,5,4,0.05) 70%), url(${hero.imageUrl}) center/cover`
              : 'linear-gradient(160deg, var(--red), var(--red-dk))',
            color: 'var(--white)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(1.9rem, 8vw, 2.3rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              margin: '0 0 var(--space-3)',
              textShadow: '0 2px 16px rgba(0,0,0,0.5)',
              maxWidth: '88%',
            }}
          >
            {hero.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.88)', marginBottom: 'var(--space-4)' }}>
            ★ {hero.body}
          </div>
          <Button href={LINKS.TEAM_VIDEO_URL} target="_blank" rel="noopener noreferrer" variant="gold">
            ▶ Meet Roman Guides
          </Button>
        </div>
      )}

      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          {[
            { label: 'Instagram', url: LINKS.INSTAGRAM, Icon: InstagramIcon },
            { label: 'Facebook', url: LINKS.FACEBOOK, Icon: FacebookIcon },
            { label: 'TikTok', url: LINKS.TIKTOK, Icon: TikTokIcon },
            { label: 'YouTube', url: LINKS.YOUTUBE, Icon: YouTubeIcon },
          ].map(({ label, url, Icon }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <Icon />
            </a>
          ))}
        </div>

        {recommend && (
          <>
            <SectionHeader eyebrow="Editor's Pick" title="Roman Guides Recommends" />
            <Card
              href={recommend.ctaUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              imageUrl={recommend.imageUrl}
              mediaAccentColor="var(--green)"
              mediaAccentColorEnd="var(--green-dk)"
              mediaHeight={190}
              style={{ marginBottom: 'var(--space-8)' }}
            >
              <Badge variant="green">Editor's Pick</Badge>
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: 'var(--space-2) 0 2px',
                }}
              >
                {recommend.title}
              </div>
              {recommend.subtitle && <div style={{ fontSize: '0.82rem', color: 'var(--stone)' }}>{recommend.subtitle}</div>}
            </Card>
          </>
        )}

        <SectionHeader eyebrow="Community" title="Tag us in your Rome moments" subtitle="Share your Rome memories with us. Use #RomanGuides on Instagram." />
        <div
          style={{
            height: 170,
            borderRadius: 'var(--radius-md)',
            background: `url(${COMMUNITY_BASE}community-1.jpeg) center/cover`,
            boxShadow: 'var(--shadow-card)',
            marginBottom: 'var(--space-2)',
          }}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-3)', paddingBottom: 2 }}>
          {['community-2.jpeg', 'community-3.jpeg', 'community-4.jpeg', 'community-5.jpeg', 'community-6.jpeg'].map((f) => (
            <div
              key={f}
              style={{
                flexShrink: 0,
                width: 90,
                height: 90,
                borderRadius: 'var(--radius-sm)',
                background: `url(${COMMUNITY_BASE}${f}) center/cover`,
                boxShadow: 'var(--shadow-card)',
              }}
            />
          ))}
        </div>
        <Card showMedia={false} style={{ marginBottom: 'var(--space-8)' }}>
          <Button variant="ghost" fullWidth href={LINKS.INSTAGRAM} target="_blank" rel="noopener noreferrer">
            Tag @RomanGuides · #RomanGuides
          </Button>
        </Card>

        <SectionHeader eyebrow="Watch & discover" title="Latest videos" />
        <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', marginBottom: 'var(--space-8)', paddingBottom: 4, marginTop: 'var(--space-3)' }}>
          {experiences.filter((exp) => exp.videoUrl).map((exp) => (
            <a
              key={exp.id}
              href={exp.videoUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flexShrink: 0, width: 140, textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  width: 140,
                  height: 185,
                  borderRadius: 'var(--radius-md)',
                  background: exp.imageUrl
                    ? `url(${exp.imageUrl}) center/cover`
                    : 'linear-gradient(160deg, #1a1a1a, #3a3a3a)',
                  marginBottom: 'var(--space-2)',
                  position: 'relative',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.92)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderLeft: '13px solid var(--red)',
                      marginLeft: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 8,
                    fontSize: '0.65rem',
                    color: '#fff',
                    background: 'rgba(0,0,0,0.55)',
                    padding: '2px 6px',
                    borderRadius: 6,
                  }}
                >
                  {exp.videoDuration}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3 }}>{exp.name}</div>
            </a>
          ))}
        </div>

        <SectionHeader eyebrow="Around you" title="Local tips" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          {LOCAL_TIPS.map((tipItem) =>
            tipItem.action.type === 'tab' ? (
              <button
                key={tipItem.label}
                onClick={() => onNavigate(tipItem.action.type === 'tab' ? tipItem.action.tab : 'home')}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-2)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{tipItem.emoji}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>{tipItem.label}</div>
              </button>
            ) : (
              <a
                key={tipItem.label}
                href={tipItem.action.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-2)',
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{tipItem.emoji}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>{tipItem.label}</div>
              </a>
            )
          )}
        </div>

        <SectionHeader eyebrow="Before you go" title="Practical info" />
        <div style={{ marginTop: 'var(--space-3)' }}>
          {getAround && (
            <Card showMedia={false} style={{ marginBottom: 'var(--space-3)' }}>
              <Badge variant="black">Get Around</Badge>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, margin: 'var(--space-2) 0' }}>
                {getAround.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                {getAround.body}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {GET_AROUND_OPTIONS.map((opt) => (
                  <a
                    key={opt.label}
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '8px 6px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--line)',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                    }}
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </a>
                ))}
              </div>
            </Card>
          )}

          <EmailCaptureBanner />

          {emergency && (
            <Card showMedia={false}>
              <Badge variant="green">Emergency</Badge>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', fontWeight: 700, margin: 'var(--space-2) 0' }}>
                {emergency.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--stone)', lineHeight: 1.5, marginBottom: 'var(--space-3)' }}>
                {emergency.body}
              </div>
              {emergency.ctaLabel && (
                <Button href={emergency.ctaUrl || '#'} variant="gold">
                  {emergency.ctaLabel}
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
