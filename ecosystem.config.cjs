// PM2 production process manager config for BPA Web (Next.js standalone).
// Runs the standalone server output directly; env vars come from the
// .env.production.local symlink inside .next/standalone (-> /srv/config/bpa/web.env).
//
// Usage:
//   pm2 start ecosystem.config.cjs
//   pm2 logs bpa-web
//   pm2 reload bpa-web

module.exports = {
  apps: [
    {
      name: 'bpa-web',
      script: 'server.js',
      cwd: __dirname + '/.next/standalone',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
      },
      out_file: __dirname + '/logs/bpa-web.out.log',
      error_file: __dirname + '/logs/bpa-web.error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
