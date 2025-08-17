module.exports = {
  typescript: true,
  expandProps: 'end',
  icon: false,
  dimensions: false,
  svgProps: {
    strokeWidth: '2',
    stroke: 'currentColor',
  },
  replaceAttrValues: {
    '#303030': 'currentColor',
  },
  svgo: true,
  svgoConfig: {
    plugins: [
      'preset-default',
      { name: 'removeViewBox', active: false },
      { name: 'removeDimensions', active: true },
      {
        name: 'removeAttrs',
        params: {
          attrs: '(stroke|stroke-width|width|height)',
        },
      },
    ],
  },
};
