import { config } from '../config'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Photo from './ui/Photo'

export default function Story() {
  const { story } = config

  return (
    <Section id="story" label="Our story" title={story.title}>
      <Reveal className="space-y-5">
        {story.paragraphs.map((paragraph, i) => (
          <p key={i} className="text-[1.02rem] leading-relaxed text-kopi">
            {paragraph}
          </p>
        ))}
      </Reveal>

      <Reveal className="mt-10 grid grid-cols-2 gap-3" delay={80}>
        {story.photos.map((photo, i) => (
          <div key={i} className="aspect-[3/4] overflow-hidden border border-rail">
            <Photo photo={photo} />
          </div>
        ))}
      </Reveal>
    </Section>
  )
}
