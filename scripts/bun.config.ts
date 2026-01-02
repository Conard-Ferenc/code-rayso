export default {
  entrypoints: ['./src/extension.ts', './src/test/core.spec.ts'],
  outdir: './dist',
  target: 'node',
  format: 'cjs',
  splitting: false,
  sourcemap: 'linked',
  packages: 'external'
  // external: ['vscode']
} as Bun.BuildConfig
