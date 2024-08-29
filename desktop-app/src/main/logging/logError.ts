import fs from 'fs'

const log = (txt: string) => {
  const filePath = './error-logs.txt'
  const textToAppend = `\n${txt}\n`

  // Append text to the file
  fs.appendFile(filePath, textToAppend, (err) => {
    if (err) {
      console.error('Error appending text to file:', err)
    } else {
      console.log('Text appended to file successfully!')
    }
  })
}

export default log
