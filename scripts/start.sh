#!/bin/bash
echo "🚀 启动 CAProject-Frontend..."
[ ! -d "node_modules" ] && echo "📦 安装依赖..." && npm install
echo "访问: http://localhost:3000 | 停止: Ctrl+C"
npm start
