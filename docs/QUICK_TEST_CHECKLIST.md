# ✅ 快速测试检查清单

## 🚀 开始测试

打开浏览器访问: `docs/test-pages.html` 或 http://localhost:3000

---

## 📋 页面测试清单

### 1️⃣ 登录页面 `/login`
- [ ] 页面加载正常，无控制台错误
- [ ] Header和Footer正常显示
- [ ] 测试登录（admin / 3456）
- [ ] 验证空值和错误密码提示
- [ ] "Find Password"和"Sign Up"跳转正常
- [ ] 点击Logo跳转到彩蛋页面

**预期**: 登录成功后跳转到个人信息页面

---

### 2️⃣ 注册页面 `/registration`
- [ ] 所有输入框正常工作
- [ ] 邮箱格式验证
- [ ] 密码长度验证（6位以上）
- [ ] 密码匹配验证
- [ ] 注册成功跳转到登录页

**测试数据**: `testuser123 / test@example.com / test123456`

---

### 3️⃣ 个人信息页面 `/personal-info`
- [ ] 用户信息显示正确
- [ ] 编辑邮箱、手机、性别、介绍
- [ ] 头像上传功能
- [ ] 查看默认地址
- [ ] "Manage Addresses"跳转
- [ ] "Sign out"退出登录

---

### 4️⃣ 地址管理页面 `/address-management`
- [ ] 地址列表显示
- [ ] 添加新地址
- [ ] 邮编验证（6位数字）
- [ ] 删除地址（带确认）
- [ ] 设置默认地址
- [ ] 最多5个地址限制

**测试数据**: `12 West Coast Road / The Stellar #05-12 / 126821 / Singapore`

---

### 5️⃣ 忘记密码页面 `/forgot-password`
- [ ] 邮箱格式验证
- [ ] 发送验证码
- [ ] 输入验证码
- [ ] 跳转到确认页面

---

### 6️⃣ 密码重置确认页面 `/password-reset-confirmation`
- [ ] 显示确认信息
- [ ] "Back to Login"返回登录

---

### 7️⃣ 管理员登录页面 `/admin-login`
- [ ] 输入员工号和密码
- [ ] "Delete"清除表单
- [ ] 空值验证
- [ ] "Find Password"跳转

**测试数据**: `ADMIN001 / admin123`

---

### 8️⃣ 退出成功页面 `/logout-success`
- [ ] 显示退出成功信息
- [ ] sessionStorage已清除
- [ ] "Back to Login"返回登录

---

### 9️⃣ 彩蛋页面 `/easter-egg`
- [ ] 语言每5秒自动切换
- [ ] 10种语言显示正常
- [ ] 动画效果流畅

---

## 🔍 通用测试

### Header组件
- [ ] Logo、图标显示正常
- [ ] 搜索框、导航功能

### Footer组件
- [ ] Logo、社交媒体链接
- [ ] 联系信息和版权

---

## 🌐 兼容性测试（可选）
- [ ] Chrome浏览器
- [ ] Firefox浏览器
- [ ] Safari浏览器
- [ ] 移动端响应式

---

## 🐛 错误检查

### 控制台
- [ ] 无JavaScript错误
- [ ] 无CSS警告
- [ ] 无404资源错误
- [ ] 无CORS错误

### 网络
- [ ] API请求正常
- [ ] 图片加载成功

---

## 🔌 API测试（需要后端）

### 认证
- [ ] POST /api/login - 登录
- [ ] POST /api/register/new - 注册
- [ ] POST /api/logout - 登出

### 用户
- [ ] GET /api/user/profile - 获取用户信息
- [ ] PUT /api/user/profile - 更新用户信息

### 地址
- [ ] GET /api/address/list - 获取列表
- [ ] POST /api/address/add - 添加
- [ ] DELETE /api/address/delete/{id} - 删除
- [ ] PUT /api/address/set-default/{id} - 设置默认

---

## 📊 测试完成标准

### 基础测试（必须）
- [ ] 所有9个页面可访问
- [ ] 无控制台错误
- [ ] Header和Footer正常
- [ ] 基本导航正常

### 功能测试（推荐）
- [ ] 登录注册正常
- [ ] 个人信息编辑正常
- [ ] 地址管理正常

---

## 🎯 快速测试流程

### 5分钟快速测试
1. 打开 `docs/test-pages.html`
2. 点击"一键测试所有页面"
3. 快速浏览检查错误

### 15分钟标准测试
1. 登录页面 → 测试登录
2. 注册页面 → 测试注册
3. 个人信息 → 测试编辑
4. 地址管理 → 测试CRUD
5. 其他页面 → 快速检查

---

## 🛠️ 测试工具

### 浏览器开发者工具
```
打开: F12 或 Cmd+Option+I (Mac)
```

### 清除缓存
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 查看用户状态
```javascript
console.log(sessionStorage.getItem('user'));
```

### 移动端模拟
```
Chrome DevTools → Cmd+Shift+M
```

---

## 📝 测试报告

| 页面 | 状态 | 问题 |
|------|------|------|
| Login | ⏳ | |
| Registration | ⏳ | |
| Personal Info | ⏳ | |
| Address Management | ⏳ | |
| Others | ⏳ | |

**图例**: ✅ 通过 | ❌ 失败 | ⏳ 待测试

---

## ✅ 完成检查

- [ ] 所有9个页面已访问
- [ ] 核心功能已测试
- [ ] 无严重bug
- [ ] 控制台无重大错误
- [ ] Header/Footer正常
- [ ] 已记录测试结果

---

**祝测试顺利！** 🎉

使用 `docs/test-pages.html` 一键访问所有页面
