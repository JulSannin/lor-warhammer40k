import { useMemo, useState } from 'react'
import { GlobalTimeline } from './components/GlobalTimeline'
import { LightboxProvider } from './components/Lightbox'
import { Rail } from './components/Rail'
import { SectionView } from './components/SectionView'
import { useProgressiveMount } from './hooks/useProgressiveMount'
import { useReadingProgress } from './hooks/useReadingProgress'
import { useScrollSpy } from './hooks/useScrollSpy'
import { allImages, epigraph, sections } from './data'
import './App.css'

export default function App() {
  const [pinned, setPinned] = useState(false)

  const keys = useMemo(() => sections.map((s) => ({ id: s.id, anchor: s.anchor })), [])
  const { count, sentinelRef } = useProgressiveMount(keys)

  const visible = useMemo(() => sections.slice(0, count), [count])
  const visibleIds = useMemo(() => visible.map((s) => s.id), [visible])

  const activeId = useScrollSpy(visibleIds)
  const progress = useReadingProgress(visibleIds, sections.length)

  const next = sections[count] ?? null

  return (
    <LightboxProvider images={allImages}>
      <div className={`app${pinned ? ' app--pinned' : ''}`}>
        <Rail
          sections={sections}
          activeId={activeId}
          progress={progress}
          pinned={pinned}
          onPinnedChange={setPinned}
        />

        <main className="app__content">
          <header className="intro">
            <p className="intro__eyebrow">В мрачной тьме далёкого будущего</p>
            <h1 className="intro__title">
              Весь лор
              <br />
              Warhammer 40,000
            </h1>
            {epigraph && (
              <p className="intro__epigraph">{epigraph.replace(/^\*|\*$/g, '')}</p>
            )}
            <p className="intro__meta">
              {sections.length} частей · {allImages.length} изображений · от ~60 000 000 лет
              до н.э. до М42
            </p>
          </header>

          <GlobalTimeline sections={sections} />

          {visible.map((s) => (
            <SectionView key={s.id} section={s} />
          ))}

          {next && (
            <div className="next" ref={sentinelRef} aria-hidden="true">
              <span className="next__label">Дальше</span>
              <span className="next__title">
                {next.part ? `${next.part}. ` : ''}
                {next.navLabel}
              </span>
              <span className="next__bar" />
            </div>
          )}

          {!next && (
            <footer className="outro">
              <p>
                Warhammer 40,000 и все связанные названия, персонажи и изображения —
                собственность Games Workshop Ltd. Некоммерческий фанатский проект.
              </p>
            </footer>
          )}
        </main>
      </div>
    </LightboxProvider>
  )
}
