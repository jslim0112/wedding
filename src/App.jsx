import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Story from './components/Story'
import Gallery from './components/Gallery'
import Details from './components/Details'
import Agenda from './components/Agenda'
import Rsvp from './components/Rsvp'
import { useRef } from 'react'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer'
import EntryGate from './components/EntryGate'

export default function App() {
  // The entry screen owns the tap; the player owns the audio element. This is
  // the wire between them - and it must stay a direct, synchronous call, or
  // the browser stops treating the music as something the guest asked for.
  const music = useRef(null)

  return (
    <>
      <Hero />

      {/* The route line: one hairline down the left edge of the document
          column, linking each section's station marker. Desktop only, and
          deliberately quiet. */}
      <main className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-[340px] bg-rail/50 lg:block"
        />

        <Countdown />
        <Gallery />
        <Details />
        <Agenda />
        <Rsvp />
      </main>

      <Footer />

      {/* Both are fixed to the viewport, so they sit outside the document flow
          and render nothing until a song is set in config.js. */}
      <MusicPlayer ref={music} />
      <EntryGate onOpen={() => music.current?.start()} />
    </>
  )
}
