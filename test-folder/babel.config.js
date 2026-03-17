module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { browsers: ['>0.2%', 'not dead', 'not op_mini all'] },
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
      },
    ],
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { corejs: false }],
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    },
  },
}
