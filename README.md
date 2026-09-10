# CS142 Projects 1–7

斯坦福大学 **CS142: Web Applications（Spring 2023）** 课程 Project 1–7 的个人实现，已完成全部七个项目。

本仓库记录了从 HTML/CSS、JavaScript 和 DOM 操作，到 React 单页应用，再到 Express、MongoDB 和用户会话的学习过程。各项目保留独立目录和依赖配置，由根目录的 Git 仓库统一管理。

## 项目概览

| 项目 | 主要内容 | 目录 |
| --- | --- | --- |
| Project 1 | HTML 与 CSS 页面布局及样式 | [project1](./project1/) |
| Project 2 | JavaScript 数组过滤与模板处理 | [project2](./project2/) |
| Project 3 | DOM 操作、日期选择器与表格模板 | [project3](./project3/) |
| Project 4 | React 组件、状态与页面交互 | [project4](./project4/) |
| Project 5 | 基于 React、React Router 和 Material UI 的照片分享单页应用 | [project5](./project5/) |
| Project 6 | Express API、MongoDB 数据持久化与前后端交互 | [project6](./project6/) |
| Project 7 | 用户注册、登录退出、会话管理、评论与照片上传 | [project7](./project7/) |

## 技术栈

- **前端**：HTML、CSS、JavaScript、React 17、React Router 5、Material UI。
- **后端与数据**：Node.js、Express、MongoDB、Mongoose。
- **构建与检查**：Webpack、Babel、ESLint、Mocha。

## 本地运行

### 环境准备

- Project 1–3 的页面可在浏览器中直接打开。
- 安装依赖、构建 React 项目及运行后端需要 Node.js 和 npm。
- Project 6–7 还需要本地 MongoDB 服务，默认使用 `27017` 端口。

依赖需要在各项目目录内分别安装，根目录没有统一的 npm 启动脚本。仓库保留了各项目的 `package-lock.json`，但没有指定统一的 Node.js 版本。

### Project 1：静态页面

直接使用浏览器打开 `project1/index1.html` 或 `project1/index2.html`。

### Project 2：JavaScript 练习

从仓库根目录执行：

```bash
cd project2
npm install
npm test
```

也可以使用浏览器打开 `project2/cs142-test-project2.html` 查看测试结果。

### Project 3：DOM 练习

使用浏览器分别打开：

- `project3/datepicker.html`：日期选择器。
- `project3/cs142-test-table.html`：表格模板测试。

如需运行代码检查，在 `project3` 目录执行 `npm install` 和 `npm run lint`。该项目的 `npm test` 仅提示打开页面，不会自动执行浏览器测试。

### Project 4–5：React 应用

以 Project 4 为例，从仓库根目录执行：

```bash
cd project4
npm install
npm run build
node webServer.js
```

启动后访问以下页面：

| 项目 | 页面地址 |
| --- | --- |
| Project 4 | `http://localhost:3000/getting-started.html`、`/p2.html`、`/p4.html`、`/p5.html` |
| Project 5 | `http://localhost:3000/photo-share.html` |

运行 Project 5 时，将上述目录改为 `project5`，其余命令相同。

开发时可在另一个终端进入对应项目目录，执行 `npm run build:w`，监听前端代码变更并重新构建。

### Project 6–7：带数据库的照片分享应用

先启动本地 MongoDB 服务，再从仓库根目录进入所需项目。以 Project 7 为例：

```bash
cd project7
npm install
npm run build
```

两个项目当前都连接到 `mongodb://127.0.0.1/cs142project6`。**初始化脚本会清空并重新填充用户、照片和版本信息集合；如数据库已有需要保留的数据，请先使用 MongoDB Database Tools 的 `mongodump` 备份并确认备份成功，再执行初始化。** 备份目录应放在仓库外，例如：

```bash
mongodump --uri="mongodb://127.0.0.1/cs142project6" --out="../../cs142-backup-$(date +%Y%m%d-%H%M%S)"
```

首次使用或确认需要重置示例数据时，在对应项目目录执行：

```bash
node loadDatabase.js
```

已有对应项目的数据时，无需每次启动都重新初始化。随后启动服务器：

```bash
node webServer.js
```

访问 `http://localhost:3000/photo-share.html`。运行 Project 6 时，将目录改为 `project6`，使用该目录下的初始化脚本和服务器。

Project 7 初始化用户的登录名为姓氏的小写形式，默认密码为 `weak`；也可以通过页面注册新用户。

Project 4–7 均使用 `3000` 端口，一次启动一个项目即可。Project 6 与 Project 7 共享数据库名称，切换项目并重新初始化时会覆盖原有数据。

## 测试与代码检查

Project 6–7 的 API 测试拥有独立依赖。准备好对应项目的示例数据库并保持服务器运行后，在另一个终端从仓库根目录执行（以 Project 7 为例）：

```bash
cd project7/test
npm install
npm test
```

Project 6 使用 `project6/test` 目录。API 测试可能写入数据，请在已备份的本地测试数据库上运行。

Project 2–7 均提供 `npm run lint`。其中 Project 4–7 的 lint 脚本包含 `|| exit 0`，应查看实际输出，不能仅通过退出码判断是否通过检查。

## 仓库说明

- `node_modules/` 和 `compiled/` 等依赖及构建产物不纳入版本控制，克隆后需要安装依赖并构建。
- `images/` 中的课程初始图片及测试资源保留在仓库中；Project 7 上传生成的 `U时间戳` 图片由 `.gitignore` 忽略。
- MongoDB 数据不会随源码一同提交，可通过各项目的 `loadDatabase.js` 初始化示例数据。
- 本仓库用于个人课程学习与实践，并非斯坦福大学官方仓库。课程提供的代码和资源保留原有声明。

## 许可证

本仓库中由 zengrunquan 创作的原创代码及修改采用 [ISC License](./LICENSE)，版权署名为 Copyright (c) 2026 zengrunquan。

课程提供的代码、图片及其他第三方资源保留其原有版权和授权声明，不因根目录的许可证而改变授权范围。上述 ISC 授权仅适用于本人有权授权的部分。
