#!/bin/bash

echo "📦 打包 CAProject-Frontend..."
echo ""

TIMESTAMP=$(date +%Y%m%d-%H%M)
OUTPUT_DIR=~/Desktop
FILENAME="CAProject-Frontend-${TIMESTAMP}.tar.gz"

echo "源目录: $(pwd)"
echo "输出: ${OUTPUT_DIR}/${FILENAME}"
echo ""

# 清理
rm -rf build/ 2>/dev/null

# 打包
cd ..
tar -czf "${OUTPUT_DIR}/${FILENAME}" \
  --exclude='CAProject-Frontend/node_modules' \
  --exclude='CAProject-Frontend/build' \
  --exclude='CAProject-Frontend/.git' \
  --exclude='CAProject-Frontend/.DS_Store' \
  CAProject-Frontend/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 打包成功！"
    echo ""
    ls -lh "${OUTPUT_DIR}/${FILENAME}"
    echo ""
    echo "📍 位置: ${OUTPUT_DIR}/${FILENAME}"
    echo ""
    echo "接收方使用："
    echo "  tar -xzf ${FILENAME}"
    echo "  cd CAProject-Frontend"
    echo "  npm install && npm start"
    echo ""
else
    echo "❌ 打包失败！"
    exit 1
fi
