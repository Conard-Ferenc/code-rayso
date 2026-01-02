# Code Ray.so

**Code Ray.so** 是一个 VS Code 扩展，允许您立即在 [Ray.so](https://ray.so) 中打开当前选中的代码，生成精美的代码图片。

## 功能

- **即时生成 URL**：根据选中的代码生成 Ray.so URL。
- **智能默认值**：自动检测语言并使用编辑器的缩进设置。
- **可配置**：可通过设置自定义主题、背景、暗黑模式和内边距。

## 扩展设置

此扩展提供以下设置：

- `code-rayso.theme`: 选择默认主题（例如：`candy`, `breeze`, `midnight`, `sunset`）。
- `code-rayso.background`: 是否启用背景。
- `code-rayso.darkMode`: 是否启用暗黑模式。
- `code-rayso.padding`: 填充距离（默认：64）。
- `code-rayso.lineNumbers`: 是否启用行号。
- `code-rayso.languageMap`: 语言标识映射。

## 使用方法

1. 选中您想要分享的代码。
   - 支持多段选择：在编辑器中可以使用多光标选择多段内容，扩展会按文档顺序合并这些选区并生成单个 Ray.so 链接。
2. 打开命令面板 (`Ctrl+Shift+P` 或 `Cmd+Shift+P`)。
3. 运行 `使用 Ray.so 打开代码快照`。
4. 或者，右键点击选区，在上下文菜单中选择 `使用 Ray.so 打开代码快照`。
