# 发布指引

## 前置要求

- Node.js >= 20.0.0
- npm 账号已登录且开启双因素认证（2FA）
- Granular Access Token（带 Bypass 2FA 权限）

## 发布步骤

### 1. 构建项目

```bash
npm run build
```

### 2. 创建访问令牌

1. 访问 https://www.npmjs.com/settings/<your-username>/tokens
2. 点击 "New Access Token"
3. 选择 "Granular Access Token"
4. 配置权限：
   - 选择 `Automation` 或 `Publish`
   - **务必勾选 "Bypass 2FA"**
5. 复制生成的 token（仅显示一次）

### 3. 发布到 npm

```bash
npm config set //registry.npmjs.org/:_authToken <your-token>
npm publish --access public
npm config delete //registry.npmjs.org/:_authToken
```

或一次性执行：

```bash
npm config set //registry.npmjs.org/:_authToken <token> && npm publish --access public && npm config delete //registry.npmjs.org/:_authToken
```

### 4. 验证发布

```bash
npm view @jaluson/cc-use
npm search @jaluson/cc-use
```

## 安装使用

```bash
npm install -g @jaluson/cc-use
cc-use --version
```

## 常见问题

### E403: Two-factor authentication required

需要使用带 "Bypass 2FA" 权限的 Granular Access Token。

### E403: Cannot publish over previously published versions

版本号已存在，需要更新 `package.json` 中的版本号。

### 安装时 404 但搜索能找到

这是 npm registry CDN 延迟，等待几分钟后再试。或直接从 tarball 安装：

```bash
npm install -g https://registry.npmjs.org/@jaluson/cc-use/-/cc-use-x.x.x.tgz
```

## 版本发布

更新版本号：

```bash
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

然后重新构建和发布。
