module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      util: false,
      assert: false,
      constants: false,
      child_process: false,
      worker_threads: false
    };
    return config;
  }
};