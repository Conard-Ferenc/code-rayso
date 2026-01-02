# Code Ray.so

**Code Ray.so** is a VS Code extension that allows you to instantly open your current code selection in [Ray.so](https://ray.so), a beautiful code image generator.

## Features

- **Instant URL Generation**: Generates a Ray.so URL based on your selected code.
- **Smart Defaults**: Automatically detects language and uses your editor's indentation settings.
- **Configurable**: Customize theme, background, dark mode, and padding via settings.

## Extension Settings

This extension contributes the following settings:

- `code-rayso.theme`: Set the color theme (e.g., `candy`, `breeze`, `midnight`, `sunset`).
- `code-rayso.background`: Enable or disable the background.
- `code-rayso.darkMode`: Enable or disable dark mode.
- `code-rayso.padding`: Set the padding around the code (default: 64).
- `code-rayso.lineNumbers`: Show or hide line numbers.
- `code-rayso.languageMap`: Custom mapping for language IDs.

## Usage

1. Select the code you want to share.

- Supports multi-selection: you can make multiple selections (multi-cursor); the extension will merge them in document order and generate a single Ray.so link.

2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3. Run `Use Ray.so to Open Code Snapshot`.
4. Alternatively, right-click the selection and choose `Use Ray.so to Open Code Snapshot` from the context menu.
