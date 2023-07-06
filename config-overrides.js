module.exports = function override(config, env) {
  // config is webpack config
  config.module.rules.push(
    {
      test: /.*fs-extra.*/,
      use: 'null-loader'
    },
    {
      test: /.*fs-minipass.*/,
      use: 'null-loader'
    },
    {
      test: /.*readline-sync.*/,
      use: 'null-loader'
    },
    {
      test: /.*tar(\\|\/).*/,
      use: 'null-loader'
    },
    {
      test: /.*uglify.*/,
      use: 'null-loader'
    },
    {
      test: /.*gofsh.*.d\.ts$/,
      loader: 'null-loader'
    },
    {
      test: /.*tsconfig-paths\/lib\/filesystem\.js.*/,
      loader: 'null-loader'
    },
    {
      test: /.*tsconfig-paths\/lib\/match-path-async\.js.*/,
      loader: 'null-loader'
    }
  );
  return config;
};
