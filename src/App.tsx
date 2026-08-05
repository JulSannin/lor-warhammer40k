import { motion } from 'motion/react'
import './App.css'

export default function App() {
  return (
    <main className="boot">
      <motion.div
        className="boot__inner"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <p className="boot__eyebrow">Этап 0 — каркас</p>
        <h1 className="boot__title">
          Весь лор
          <br />
          Warhammer 40,000
        </h1>
        <p className="boot__quote">
          «В мрачной тьме далёкого будущего есть только война».
        </p>
        <p className="boot__status">
          Сборка работает. Контент подключается на следующем этапе.
        </p>
      </motion.div>
    </main>
  )
}
