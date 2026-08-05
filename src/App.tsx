import { useMemo, useState } from 'react'
import { GlobalTimeline } from './components/GlobalTimeline'
import { Rail } from './components/Rail'
import { SectionView } from './components/SectionView'
import { useScrollProgress } from './hooks/useScrollProgress'
import { useScrollSpy } from './hooks/useScrollSpy'
import { epigraph, sections } from './data'
import './App.css'

export default function App() {
  const [pinned, setPinned] = useState(false)
  const ids = useMemo(() => sections.map((s) => s.id), [])
  const activeId = useScrollSpy(ids)
  const progress = useScrollProgress()

  return (
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
            <p className="intro__epigraph">
              {epigraph.replace(/^\*|\*$/g, '')}
            </p>
          )}
          <p className="intro__meta">
            {sections.length} частей · от ~60 000 000 лет до н.э. до М42
          </p>
        </header>

        <GlobalTimeline sections={sections} />

        {sections.map((s) => (
          <SectionView key={s.id} section={s} />
        ))}

        <footer className="outro">
          <p>
            Warhammer 40,000 и все связанные названия, персонажи и изображения — собственность
            Games Workshop Ltd. Некоммерческий фанатский проект.
          </p>
        </footer>
      </main>
    </div>
  )
}
