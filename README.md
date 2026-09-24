# ABC Score Library

English | [日本語](README.ja.md)

A web app for viewing, playing, and editing sheet music written in ABC notation, and for downloading it as MIDI, WAV, or ABC.
It includes 30 public-domain songs, such as Japanese school songs (shōka), national anthems, and well-known classical melodies.
The site is shown in Japanese when the browser's preferred language is Japanese, and in English otherwise.

- Score rendering and playback: [abcjs](https://github.com/paulrosen/abcjs)
- Editor: parts of [abcjs-editor](https://github.com/abcjs-music/abcjs-editor), adapted
- Framework: Vite + Vue 3 + TypeScript (a static site with no server)

## Features

- Browse and search songs by title, composer or lyricist, and category
- View a score and play it back (loop, tempo change, playback cursor); click a note to hear it
- Transpose by up to ±6 semitones; this applies to the score, playback, MIDI, and WAV
- Download as MIDI, WAV, or ABC, and print
- ABC editor with syntax highlighting, live rendering, error display, `.abc` file loading, and autosave
- Japanese and English display, chosen from the browser's preferred language (`src/i18n.ts`)
- A license page with the full license texts of the open-source software used and the rights information for each song

## Development

```bash
npm install
npm run dev       # development server
npm test          # validate the songs (parsing, bar lengths, lyric syllable counts, public-domain rule, MIDI generation)
npm run build     # build the static site into dist/ (also generates THIRD_PARTY_LICENSES.txt)
npm run preview   # preview the build
```

Deploy `dist/` as-is to GitHub Pages, Netlify, or any static host.
The build uses relative paths and hash-based routing (for example `#/song/furusato`), so it also works from a subdirectory without extra configuration.

## Adding a song

1. Create `src/songs/<category>/<id>.abc`, where the category is `school`, `anthems`, or `classical-folk`.
2. Add an entry with the same `id` to `SONGS` in `src/songs/meta.ts`, with the creators, their years of death, the year of publication, and so on. Give titles, names, and notes in both Japanese and English (`{ ja, en }`); in English, the score's title and credit lines are generated from this data.
3. Run `npm test`. The test fails if any named creator died after 1967.

Why 1967: under Japanese copyright law, protection lasts 70 years after the author's death. The 2018 extension from 50 to 70 years was not retroactive, so works by authors who died in 1967 or earlier are already in the public domain.
Anonymous works, traditional songs, and works published under an organization's name are judged by their year of publication.

Write lyrics on a `w:` line directly below the line of notes they belong to.
The test fails if the number of syllables does not match the number of notes on that line (rests excluded).

## License

- Source code: MIT License ([LICENSE](LICENSE))
- ABC files of the included songs: CC0 1.0
- Third-party software and data: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) (in Japanese)
