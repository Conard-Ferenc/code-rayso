import { describe, expect, test } from 'bun:test'
import {
  autoIndent,
  createRaySoUrl,
  generateUrl,
  getLanguage,
  getSeparator,
  getSnapContent,
  searchParamsAppend,
  toBase64,
  _testableToBase64
} from '../core'

describe('Core Logic', () => {
  describe('getSeparator', () => {
    test('should return newline if first pos line < second pos line', () => {
      expect(
        getSeparator({ line: 1, character: 0 }, { line: 2, character: 0 })
      ).toBe('\n')
    })
    test('should return space if same line but first pos char < second pos char', () => {
      expect(
        getSeparator({ line: 1, character: 5 }, { line: 1, character: 10 })
      ).toBe(' ')
    })
    test('should return empty string otherwise (touching or overlapping)', () => {
      // Touching
      expect(
        getSeparator({ line: 1, character: 5 }, { line: 1, character: 5 })
      ).toBe('')
      // Overlapping (should not happen with sorted selections but logic should handle default)
      expect(
        getSeparator({ line: 2, character: 0 }, { line: 1, character: 0 })
      ).toBe('')
    })
  })

  describe('autoIndent', () => {
    test('should indent with spaces', () => {
      const input = '  line1\n  line2'
      const output = autoIndent(input, { indentSize: 2, insertSpaces: true })
      expect(output).toBe('line1\nline2')
    })

    test('should indent with tabs converted to spaces', () => {
      const input = '\tline1\n\tline2'
      const output = autoIndent(input, { indentSize: 2, insertSpaces: false })
      expect(output).toBe('line1\nline2')
    })

    test('should handle mixed indentation and min indent', () => {
      const input = '    line1\n      line2'
      const output = autoIndent(input, { indentSize: 2, insertSpaces: true })
      expect(output).toBe('line1\n  line2')
    })

    test('should return original if no non-whitespace found (indent === -1)', () => {
      const input = '   '
      const output = autoIndent(input, { indentSize: 2, insertSpaces: true })
      expect(output.trim()).toBe('')
    })

    test('should return joined lines if indent is 0', () => {
      const input = 'line1\n  line2'
      const output = autoIndent(input, { indentSize: 2, insertSpaces: true })
      expect(output).toBe('line1\n  line2')
    })

    test('should handle CRLF correctly', () => {
      // CRLF input with common indentation
      const input = '  line1\r\n\r\n  line2'
      const output = autoIndent(input, { indentSize: 2, insertSpaces: true })
      // Expected: remove common 2-space indent.
      // \r\n should be preserved or normalized to \n?
      // core.js currently joins with \n. So expecting \n.
      // And empty line in middle should result in empty line in output.
      // current broken logic might produce 'line1\n \nline2' or something if minIndent is wrong.
      // If minIndent is 2.
      // line 1: indent 2
      // line 2: \r\n -> empty. indent = length = 0? No, if empty string, search(\S) is -1 -> indent = 0.
      // wait, split('\n') on `\r\n\r\n`.
      // parts: `  line1\r`, `\r`, `  line2`.
      // part 2: `\r`. search(\S) -> -1. indent = length = 1.
      // minIndent becomes 1.
      // output: line1(slice 1) -> ` line1`.
      // Expected: `line1`.

      expect(output).toBe('line1\n\nline2')
    })
  })

  describe('getLanguage', () => {
    test('should use provided map', () => {
      expect(getLanguage('my-lang', { 'my-lang': 'mapped' })).toBe('mapped')
    })
    test('should use default map', () => {
      expect(getLanguage('jsonc')).toBe('json')
      expect(getLanguage('plaintext')).toBe('auto-detect')
    })
    test('should fall back to identity', () => {
      expect(getLanguage('unknown')).toBe('unknown')
    })
  })

  describe('toBase64', () => {
    test('should encode string using Buffer (node/bun)', () => {
      // 'hello' -> 'aGVsbG8=' -> 'aGVsbG8' (stripped)
      expect(toBase64('hello')).toBe('aGVsbG8')
      // 'subjects?_d' -> 'c3ViamVjdHM/X2Q=' -> 'c3ViamVjdHM_X2Q'
      // wait, standard base64 for 'subjects?_d' is 'c3ViamVjdHM/X2Q='.
      // URL safe: ? is not special in input? wait.
      // let's use a string that produces + and /
      // input: '>>>???' -> hex 3e3e3e3f3f3f -> b64 'Pj4+Pz8/'
      // URL safe: 'Pj4-Pz8_'

      const input = '>>>???'
      const expected = 'Pj4-Pz8_'
      expect(toBase64(input)).toBe(expected)
    })

    test('should have correct internal implementations', () => {
      const browser = _testableToBase64.browser
      const node = _testableToBase64.node

      // Browser algo: btoa('hello') -> 'aGVsbG8='
      expect(browser('hello')).toBe('aGVsbG8=')
      // Node algo: Buffer... -> 'aGVsbG8='
      expect(node('hello')).toBe('aGVsbG8=')
    })
  })

  describe('searchParamsAppend', () => {
    test('should append valid values', () => {
      const params = new URLSearchParams()
      searchParamsAppend(params, 'foo', 'bar')
      expect(params.get('foo')).toBe('bar')
    })
    test('should ignore undefined/null', () => {
      const params = new URLSearchParams()
      searchParamsAppend(params, 'foo', undefined)
      searchParamsAppend(params, 'bar', null)
      expect(params.toString()).toBe('')
    })
    test('should ignore empty string', () => {
      const params = new URLSearchParams()
      searchParamsAppend(params, 'foo', '') // String('') is ''
      expect(params.toString()).toBe('')
    })
  })

  describe('generateUrl', () => {
    test('should generate url with params', () => {
      const url = generateUrl({ code: 'hi', theme: 'candy' })
      expect(url).toContain('https://ray.so/#')
      expect(url).toContain('code=')
      expect(url).toContain('theme=candy')
    })
  })

  describe('getSnapContent', () => {
    test('should return full text if no selections', () => {
      expect(getSnapContent('full', [])).toBe('full')
    })
    test('should return full text if selections have no text', () => {
      expect(
        getSnapContent('full', [
          {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
            text: ''
          }
        ])
      ).toBe('full')
    })
    test('should merge selections', () => {
      const selections = [
        {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 5 },
          text: 'Hello'
        },
        {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 5 },
          text: 'World'
        }
      ]
      // getSeparator(hello.end, world.start) -> world.start.line (1) > hello.end.line (0) -> newline
      expect(getSnapContent('full', selections)).toBe('Hello\nWorld')
    })
    test('should strip leading newline if result starts with one', () => {
      // This relies on getSeparator returning newline initially?
      // Initial lastPosition is 0,0.
      // If first selection is at 1,0. getSeparator(0,0, 1,0) -> \n.
      // merge becomes "\nText". Then slice(1).
      const selections = [
        {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 5 },
          text: 'Text'
        }
      ]
      expect(getSnapContent('full', selections)).toBe('Text')
    })
  })

  describe('createRaySoUrl', () => {
    test('should integrate all components', () => {
      const content = '  const a = 1'
      const context = {
        fileName: 'test.ts',
        isUntitled: false,
        languageId: 'typescript'
      }
      const config = {
        theme: 'candy',
        background: true,
        padding: 32,
        languageId: 'typescript'
      } as const
      const workspaceConfiguration = {
        get(key: keyof typeof config, def?: any) {
          return config[key] ?? def
        }
      }
      const options = { indentSize: 2, insertSpaces: true }

      const url = createRaySoUrl(
        content,
        context,
        workspaceConfiguration,
        options
      )

      expect(url).toMatch(/^https:\/\/ray\.so\/#/)
      expect(url).toContain('theme=candy')
      expect(url).toContain('background=true')
      expect(url).toContain('padding=32')
      expect(url).toContain('language=typescript')
    })

    test('should handle untitled', () => {
      const context = {
        fileName: 'Untitled-1',
        isUntitled: true,
        languageId: 'plaintext'
      }
      const config = { get: () => undefined }
      const url = createRaySoUrl('code', context, config, {})
      expect(url).toContain('title=Uploaded+by+CodeRayso') // URLSearchParams encodes spaces
    })
  })
})
