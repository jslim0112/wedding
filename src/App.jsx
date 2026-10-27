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
import Balloons from './components/Balloons'
import MarginDoodles from './components/MarginDoodles'
import { releaseBalloons } from './lib/balloons'

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
        <MarginDoodles />

        <Countdown />
        <Gallery />
        <Details />
        <Agenda />
        <Rsvp />
      </main>

      <Footer />

      {/* All three are fixed to the viewport, so they sit outside the document
          flow. The player and the gate render nothing until a song is set in
          config.js. Opening the gate starts the song and lets the opening
          bouquet go - the song first, while the tap is still live. */}
      <Balloons />
      <MusicPlayer ref={music} />
      <EntryGate
        onOpen={() => {
          music.current?.start()
          releaseBalloons()
        }}
      />
    </>
  )
}
