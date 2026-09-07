export default {
  apps: [{
    name: "clinica-lena",
    script: "./index.js",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "300M",
    env: {
      NODE_ENV: "production"
    },
    // logs
    out_file: "./logs/out.log",
    error_file: "./logs/err.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss"
  }]
};
