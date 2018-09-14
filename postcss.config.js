module.exports = (ctx) => ({
    map: { inline: false },
    plugins: {
      "autoprefixer": {},
      "doiuse" : {
        browsers: ['ie >= 11', '> 2%'], // an autoprefixer-like array of browsers.
        ignore: ['user-select-none'], // an optional array of features to ignore
        onFeatureUsage: function(usageInfo) { } // a callback for usages of features not supported by the selected browsers
      },
      "cssnano": { "safe": true },
    }
  })