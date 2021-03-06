import * as fs from 'graceful-fs'
import * as svgicons2svgfont from 'svgicons2svgfont'

export interface FontInput {
  fileName: string,
  fontCode: string
}

export interface FontOptions {
  pwd: string,
  originalFileNames: string[],
  fontName: string,
  dist: string
}

export const createFontInput = (originalFileName: string): FontInput => {
  const splitedNames = originalFileName.split('_')
  return {
    fontCode: splitedNames[0],
    fileName: splitedNames[1]
  }
}

export default (options: FontOptions): Promise<{}> => {
  return new Promise<{}>((resolve, reject) => {
    const {
      originalFileNames, fontName, dist, pwd
    } = options

    const fontStream = svgicons2svgfont({
                        fontName, normalize: true, fontHeight: 1000,
                        log: (message: string) => {
                          if (message !== 'Font created') console.log(message)
                        }
                      })

    if (fs.existsSync(`${dist}/${fontName}Icon.svg`) === false) {
      fs.mkdirSync(dist)
    }

    fontStream.pipe(fs.createWriteStream(`${dist}/${fontName}Icon.svg`))
      .on('finish', () => {
        resolve()
      })
      .on('error', (err) => {
        reject(err)
      })

    originalFileNames.forEach((originalFileName) => {
      const {
        fileName, fontCode
      } = createFontInput(originalFileName)

      const glyph: any = fs.createReadStream(`${pwd}/${originalFileName}.svg`)
      glyph.metadata = {
        unicode: [fontCode],
        name: fileName
      }
      fontStream.write(glyph)
    })

    fontStream.end()
  })
}