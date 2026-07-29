import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Obtener el Git commit hash de forma síncrona
let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.warn('No se pudo obtener el commit hash de Git, usando timestamp como versión.');
  commitHash = 'v-' + Date.now();
}

const buildTime = new Date().toISOString();

// Generar dinámicamente el archivo version.json en la carpeta public
try {
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(publicDir, 'version.json'),
    JSON.stringify({
      version: commitHash,
      releaseDate: buildTime,
      description: "Actualización automática basada en Git commit."
    }, null, 2)
  );
  console.log(`[Vite Build Config] Generado version.json con versión: ${commitHash}`);
} catch (e) {
  console.error('Error al escribir version.json:', e);
}

export default defineConfig({
  plugins: [react()],
  base: '/Baroid-Home/',
  server: {
    port: 3000,
    open: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(commitHash)
  }
});
