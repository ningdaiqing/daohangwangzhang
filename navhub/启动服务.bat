@echo off
chcp 65001 >nul
title NavHub 启动器

cd /d "%~dp0"

echo ========================================
echo   NavHub · AI 产品导航站
echo   一键启动器
echo ========================================
echo.

REM 记录日志（主公报错时可贴给我）
set LOG=%~dp0navhub-start.log
echo [%date% %time%] 启动器开始 > "%LOG%"

REM === 检查 1: Node 是否安装 ===
where node >nul 2>nul
if errorlevel 1 (
  echo [X] 未检测到 Node.js
  echo     请安装 Node 18+： https://nodejs.org/zh-cn/
  echo [%date% %time%] [错误] 未安装 Node >> "%LOG%"
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do set NODE_VER=%%v
echo [√] Node %NODE_VER%

REM === 检查 2: npm 是否可用 ===
where npm >nul 2>nul
if errorlevel 1 (
  echo [X] 未检测到 npm
  echo [%date% %time%] [错误] 未安装 npm >> "%LOG%"
  pause
  exit /b 1
)
echo [√] npm

REM === 检查 3: 端口 3000 是否被占 ===
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo [X] 端口 3000 已被占用 (PID=%%p)
  echo     关闭占用进程： taskkill /PID %%p /F
  echo     或者改端口运行： npm run start -- -p 8080
  echo [%date% %time%] [错误] 3000 被占用 PID=%%p >> "%LOG%"
  pause
  exit /b 1
)
echo [√] 端口 3000 空闲

REM === 检查 4: 依赖是否安装 ===
if not exist "node_modules\next\package.json" (
  echo [·] 首次运行，正在安装依赖（用国内镜像）...
  echo [%date% %time%] 首次安装依赖 >> "%LOG%"
  call npm install --registry=https://registry.npmmirror.com >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo [X] 依赖安装失败，详情请看 %LOG%
    type "%LOG%" | findstr /B /C:"npm ERR" | head -20
    pause
    exit /b 1
  )
)
echo [√] 依赖就绪

REM === 检查 5: 是否需要 build ===
if not exist ".next\BUILD_ID" (
  echo [·] 首次运行，正在 build 生产产物（20-30 秒）...
  echo [%date% %time%] 首次 build >> "%LOG%"
  call npm run build >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo [X] build 失败，详情请看 %LOG%
    type "%LOG%" | findstr /B /C:"error" /C:"Error" /C:"Failed" | head -30
    pause
    exit /b 1
  )
  echo [√] build 完成
)

echo.
echo ========================================
echo   启动 NavHub
echo   访问: http://localhost:3000
echo   停止: Ctrl + C
echo   日志: %LOG%
echo ========================================
echo.
echo [%date% %time%] 启动 next start >> "%LOG%"

REM === 启动 ===
call npm run start

echo.
echo [%date% %time%] 服务已停止 >> "%LOG%"
echo 服务已停止，可以关闭此窗口。
pause