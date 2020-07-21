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
      test: /.*tar(\\|\/).*/,
      use: 'null-loader'
    },
    {
      test: /.*uglify.*/,
      use: 'null-loader'
    }
  );
  return config;
};
