import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Story from './components/Story'
import Gallery from './components/Gallery'
import Details from './components/Details'
import Rsvp from './components/Rsvp'
import Footer from './components/Footer'

export default function App() {
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
        <Story />
        <Gallery />
        <Details />
        <Rsvp />
      </main>

      <Footer />
    </>
  )
}
