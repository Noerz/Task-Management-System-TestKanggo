module.exports = {
  apps: [
    {
      name: 'task-manager-backend',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork', // Set to 'cluster' and instances to 'max' for multi-core scaling
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000
      }
    }
  ]
};
