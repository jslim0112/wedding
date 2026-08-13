import { config } from '../config'
import { publicUrl } from './supabase'

/**
 * The song's URL, or '' when no song is set up yet - which both the entry
 * screen and the player read as "there is no music, render nothing".
 *
 * A full `src` wins if one is given; otherwise the file name in `path` is
 * resolved against the public Storage bucket. Lives here rather than in the
 * player because two components need the same answer.
 */
export function musicSrc() {
  const { music } = config
  return music.src || publicUrl(music.bucket, music.path)
}
