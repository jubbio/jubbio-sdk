import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true },
    { file: 'dist/index.esm.js', format: 'es', sourcemap: true }
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime', '@jubbio/auth'],
  plugins: [typescript({ tsconfig: './tsconfig.json' })]
};
