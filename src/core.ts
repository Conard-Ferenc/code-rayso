export interface SimplePosition {
  line: number
  character: number
}

export interface SimpleSelectionWithText {
  start: SimplePosition
  end: SimplePosition
  text: string
}

export interface SimpleTextEditorOptions {
  indentSize?: number | string
  insertSpaces?: boolean | string
}

export const getSeparator = (ahead: SimplePosition, behind: SimplePosition) => {
  if (ahead.line < behind.line) return '\n'
  if (ahead.character < behind.character) return ' '
  return ''
}

export const autoIndent = (
  str: string,
  { indentSize, insertSpaces }: SimpleTextEditorOptions
) => {
  const numIndentSize = Math.max(Number(indentSize), 1)
  const indentFormater = insertSpaces
    ? String
    : (str: string) =>
        '\t'
          .repeat(Math.floor(str.length / numIndentSize))
          .concat(' '.repeat(str.length % numIndentSize))
  const lines = str
    .split(/\r?\n/)
    .map((line) =>
      line.replace(/^[ \t]+/g, (match) =>
        indentFormater(match.replaceAll('\t', ' '.repeat(numIndentSize)))
      )
    )

  let minIndent = Number.MAX_SAFE_INTEGER
  for (const line of lines) {
    let indent = line.search(/\S/)
    if (indent === 0) return lines.join('\n')
    if (indent === -1) {
      if (line.trim() === '') continue
      indent = line.length
    }
    if (indent < minIndent) minIndent = indent
  }

  if (minIndent === Number.MAX_SAFE_INTEGER) minIndent = 0
  return lines.map((line) => line.slice(minIndent)).join('\n')
}

const defaultLanguageMap: Record<string, string> = {
  plaintext: 'auto-detect',
  jsonc: 'json',
  jsonl: 'json'
}

export const getLanguage = (
  languageId: string = 'plaintext',
  languageMap: Record<string, string> = {}
) => languageMap[languageId] ?? defaultLanguageMap[languageId] ?? languageId

const _toBase64Browser = (str: string) =>
  btoa(
    Array.from(new TextEncoder().encode(str), (cp) =>
      String.fromCodePoint(cp)
    ).join('')
  )

const _toBase64Node = (str: string) => Buffer.from(str).toString('base64')

export const _testableToBase64 = {
  browser: _toBase64Browser,
  node: _toBase64Node
}

const encodeBase64 =
  typeof Buffer === 'undefined' ? _toBase64Browser : _toBase64Node

export const toBase64 = (str: string) => {
  return encodeBase64(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
export const searchParamsAppend = (
  params: URLSearchParams,
  key: string,
  value: any
) => {
  if (typeof value === 'undefined' || value === null) return
  const _value = String(value)
  if (!_value) return
  params.append(key, _value)
}

export interface RaysoParams {
  code: string
  title?: string
  theme?: string
  background?: boolean
  darkMode?: boolean
  lineNumbers?: boolean
  padding?: number
  language?: string
}

export const generateUrl = ({ code, ...rest }: RaysoParams): string => {
  const params = new URLSearchParams({ code: toBase64(code) })
  for (const key in rest) {
    searchParamsAppend(params, key, rest[<keyof typeof rest>key])
  }
  return `https://ray.so/#${params}`
}

export interface EditorContext {
  fileName: string
  isUntitled: boolean
  languageId: string
}

export interface WorkspaceConfiguration {
  get(key: string, def?: any): any
}

export const createRaySoUrl = (
  content: string,
  editorContext: EditorContext,
  configuration: WorkspaceConfiguration,
  editorOptions: SimpleTextEditorOptions
) => {
  const { fileName, isUntitled, languageId } = editorContext

  return generateUrl({
    title: isUntitled ? 'Uploaded by CodeRayso' : fileName,
    theme: configuration.get('theme'),
    background: configuration.get('background'),
    darkMode: configuration.get('darkMode'),
    lineNumbers: configuration.get('lineNumbers'),
    padding: configuration.get('padding', 64),
    code: autoIndent(content, {
      indentSize: editorOptions.indentSize,
      insertSpaces: editorOptions.insertSpaces
    }),
    language: getLanguage(languageId, configuration.get('languageMap'))
  })
}

export const getSnapContent = (
  fullText: string,
  selections: SimpleSelectionWithText[]
) => {
  if (!selections.length) return fullText

  const selectionsWithText = selections.filter((s) => s.text.length > 0)

  if (selectionsWithText.length === 0) return fullText

  const selectedMerge = selectionsWithText
    .toSorted((a, b) => {
      if (a.start.line !== b.start.line) return a.start.line - b.start.line
      return a.start.character - b.start.character
    })
    .reduce(
      ({ lastPosition, merge }, { end, start, text }) => {
        return {
          merge: merge.concat(getSeparator(lastPosition, start), text),
          lastPosition: end
        }
      },
      { merge: '', lastPosition: { line: 0, character: 0 } as SimplePosition }
    )

  return selectedMerge.merge.startsWith('\n')
    ? selectedMerge.merge.slice(1)
    : selectedMerge.merge
}
