const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// 路径定义
const THEME_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(THEME_DIR, 'dist');
const V2BOARD_DIR = path.resolve(THEME_DIR, '../v2board');

const TARGET_THEME_EZ = path.join(V2BOARD_DIR, 'public/theme/ez');
const TARGET_PUBLIC_STATIC = path.join(V2BOARD_DIR, 'public/static');

async function main() {
  console.log('🚀 [1/3] 开始构建 EZ-Theme 最新生产产物 (Clean Build)...');
  execSync('npm run build', { cwd: THEME_DIR, stdio: 'inherit' });

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist 目录未生成，构建失败！');
    process.exit(1);
  }

  const isClean = process.argv.includes('--clean');
  console.log(`📦 [2/3] 同步产物到 v2board (模式: ${isClean ? '彻底清空历史废弃资产 (Clean Mirror)' : '安全增量覆盖 (Safe Sync)'})...`);

  if (!fs.existsSync(V2BOARD_DIR)) {
    console.error(`❌ 未找到 v2board 项目目录: ${V2BOARD_DIR}`);
    process.exit(1);
  }

  // 1. 同步到 public/theme/ez
  if (isClean) {
    // 清理 theme/ez/static 目录下的废弃 chunk
    const targetStatic = path.join(TARGET_THEME_EZ, 'static');
    if (fs.existsSync(targetStatic)) {
      console.log('🧹 正在清空 public/theme/ez/static 历史废弃文件...');
      fs.emptyDirSync(targetStatic);
    }
    // 清理 public/static 目录下的废弃 js / css
    if (fs.existsSync(TARGET_PUBLIC_STATIC)) {
      console.log('🧹 正在清空 public/static 历史废弃 js 与 css...');
      const jsDir = path.join(TARGET_PUBLIC_STATIC, 'js');
      const cssDir = path.join(TARGET_PUBLIC_STATIC, 'css');
      if (fs.existsSync(jsDir)) fs.emptyDirSync(jsDir);
      if (fs.existsSync(cssDir)) fs.emptyDirSync(cssDir);
    }
  }

  // 复制 dist 内容到 public/theme/ez
  fs.copySync(DIST_DIR, TARGET_THEME_EZ, { overwrite: true });

  // 复制 dist/static 到 public/static
  const distStatic = path.join(DIST_DIR, 'static');
  if (fs.existsSync(distStatic)) {
    fs.copySync(distStatic, TARGET_PUBLIC_STATIC, { overwrite: true });
  }

  console.log('✅ [3/3] 同步完成！所有静态文件已精准就绪。');
  console.log('💡 提示:');
  if (isClean) {
    console.log('   已彻底清空所有历史冗余 chunk，当前仓库仅保留本次构建纯净文件。');
  } else {
    console.log('   当前为过渡保护模式。若老用户缓存已全部平滑过渡，下次只需运行:');
    console.log('   npm run deploy:clean 即可一键抹杀所有历史废弃资产，永久告别冗余！');
  }
}

main().catch(err => {
  console.error('❌ 执行出错:', err);
  process.exit(1);
});
