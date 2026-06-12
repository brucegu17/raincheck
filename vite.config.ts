import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 课堂分发场景：build 后产物是 dist/index.html 单文件，可双击离线运行。
// GitHub Pages 部署在子路径 https://brucegu17.github.io/raincheck/，base 必须匹配。
// 本地预览或单文件分发：用相对路径，运行环境不依赖路径前缀。
const isPages = process.env.GITHUB_PAGES === 'true';
export default defineConfig({
  base: isPages ? '/raincheck/' : './',
  plugins: [vue(), viteSingleFile()],
  server: {
    port: 5273,        // 默认 5173 被占用，改这里
    strictPort: false, // 5273 也被占时自动顺延
    open: true         // 启动后自动打开浏览器
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
