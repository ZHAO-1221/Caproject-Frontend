# CA Project - 前端项目

> React 18 + TypeScript 电商平台前端

## 📋 项目说明

CA Project电商平台的前端项目，完全独立可运行。

---

## 🚀 快速开始

### 前置要求
- Node.js 14+
- npm 6+

### 三步启动
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm start

# 3. 访问应用
# http://localhost:3000
```

### 快速脚本
```bash
./start                         # 一键启动（推荐）
npm start                       # 或使用npm命令
npm run build                   # 生产构建
./scripts/package-for-sharing.sh # 打包分享
```

---

## 📁 项目结构

```
CAProject-Frontend/
├── src/                # 源代码
│   ├── pages/          # 9个页面组件
│   ├── components/     # 通用组件（Header, Footer）
│   ├── services/       # API服务层（4个）
│   └── styles/         # 样式文件（11个）
├── public/
│   └── images/         # 图片资源（12个）
├── scripts/            # 脚本工具
│   ├── start.sh        # 启动脚本
│   └── package-for-sharing.sh # 打包脚本
├── docs/               # 文档和测试
│   ├── QUICK_TEST_CHECKLIST.md # 测试清单
│   └── test-pages.html         # 测试工具
├── package.json        # 依赖配置
├── tsconfig.json       # TS配置
└── README.md           # 项目文档
```

---

## 🔧 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | UI框架 |
| TypeScript | 4.x | 类型安全 |
| React Router | 6.x | 路由管理 |
| Axios | 1.x | HTTP请求 |
| CRA | 5.x | 构建工具 |

---

## 🎨 页面路由

| 路径 | 页面 |
|------|------|
| `/login` | 登录页面 |
| `/registration` | 注册页面 |
| `/personal-info` | 个人信息 |
| `/address-management` | 地址管理 |
| `/forgot-password` | 忘记密码 |
| `/password-reset-confirmation` | 密码重置确认 |
| `/admin-login` | 管理员登录 |
| `/logout-success` | 退出成功 |
| `/easter-egg` | 彩蛋页面 |

---

## 📡 后端API配置

### 默认地址
`http://localhost:8080/api` （已配置代理）

### 修改API地址
编辑各个服务文件中的 `API_BASE_URL`：
- `src/services/authService.ts`
- `src/services/registrationService.ts`
- `src/services/userService.ts`
- `src/services/addressService.ts`

### 主要API端点

**认证**
- `POST /api/login` - 登录
- `POST /api/register/new` - 注册
- `POST /api/logout` - 登出

**用户信息**
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息

**地址管理**
- `GET /api/address/list` - 获取地址列表
- `POST /api/address/add` - 添加地址
- `DELETE /api/address/delete/{id}` - 删除地址
- `PUT /api/address/set-default/{id}` - 设置默认

---

## 🧪 测试

### 快速测试
1. 在浏览器打开 `docs/test-pages.html`
2. 点击测试所有页面
3. 参考 `docs/QUICK_TEST_CHECKLIST.md` 进行完整测试

### 测试账户
- 普通用户：`admin / 3456`
- 测试邮箱：`test@example.com`

---

## 📦 分享项目

### 一键打包
```bash
./scripts/package-for-sharing.sh
```
压缩包会生成在桌面，自动排除 `node_modules` 和 `build`。

### 接收方启动步骤
```bash
# 1. 解压
tar -xzf CAProject-Frontend-*.tar.gz
cd CAProject-Frontend

# 2. 安装并启动
npm install
npm start
```

---

## 🐛 常见问题

**Q: API请求失败？**  
A: 确保后端服务运行在 `http://localhost:8080`

**Q: 图片不显示？**  
A: 检查 `public/images/` 目录是否完整

**Q: 编译错误？**  
A: 删除 `node_modules` 和 `package-lock.json`，重新 `npm install`

**Q: CORS错误？**  
A: 确保后端已配置CORS允许跨域

**Q: 端口被占用？**  
A: 创建 `.env` 文件，添加 `PORT=3001`

---


## ⚠️ 注意事项

**前端可单独运行**（UI测试、页面开发），实际API调用需要后端服务：
1. 后端运行在 `http://localhost:8080`
2. 已配置CORS允许跨域
3. MySQL数据库已配置

**测试工具**: `docs/test-pages.html` | `docs/QUICK_TEST_CHECKLIST.md`

---

**项目完全独立，开箱即用！** 🚀
