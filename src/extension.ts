import type { ExtensionContext } from 'vscode'
import { commands, env, Uri, window, workspace } from 'vscode'
import type { SimpleSelectionWithText } from './core'
import { createRaySoUrl, getSnapContent } from './core'

export function activate(context: ExtensionContext) {
  const disposable = commands.registerCommand(
    'code-rayso.openCodeSnapFromRayso',
    () => {
      const activeEditor = window.activeTextEditor
      if (!activeEditor) {
        window.showErrorMessage('No active editor to get text')
        return
      }

      const {
        document: { fileName, languageId, isUntitled, getText },
        options,
        selections
      } = activeEditor

      const fullText = getText()
      const selectionLists: SimpleSelectionWithText[] = selections.map(
        (selection) => ({
          start: selection.start,
          end: selection.end,
          text: getText(selection)
        })
      )

      // Logic extraction: Core handles decision between full text or merged selection
      const snapContent = getSnapContent(fullText, selectionLists)

      if (!snapContent) return

      const url = createRaySoUrl(
        snapContent,
        { fileName, isUntitled, languageId },
        workspace.getConfiguration('code-rayso'),
        options
      )

      env.openExternal(Uri.parse(url)).then((reason) => {
        if (reason) window.showInformationMessage('Successfully opened Ray.so')
        else window.showErrorMessage('Cancel open Ray.so')
      })
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
