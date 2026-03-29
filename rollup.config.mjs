import fs from 'fs'
import typescript from '@rollup/plugin-typescript'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
const banner = fs.readFileSync('./src/meta.ts', 'utf8')
  .replace('{{version}}', pkg.version)

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/WME-Bootstrap.user.js',
    format: 'iife',
    banner,
  },
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
  ],
}
