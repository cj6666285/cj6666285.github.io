# CJ LAB · 嵌入式软件与硬件项目记录

为 GitHub 用户 cj6666285 准备的个人项目记录网站框架。HTML、CSS 和原生 JavaScript，无需安装依赖、构建或购买服务器。

## 页面结构

- 总览：个人工作台介绍、项目统计与近期项目。
- 项目档案：软件、硬件、软硬件分类，关键词搜索与项目详情。
- 开发日志：按内容文件中的顺序展示记录，支持关联项目。
- 记录模板：软件项目、硬件项目、调试复盘，支持复制和下载 Markdown。
- 关于：个人介绍及 GitHub 主页。

项目和日志初始均为空；首页的三个卡片是记录模板入口，不代表已完成的项目。网站没有后台或登录系统，公开内容通过 data.js 维护，所有访客看到相同内容。

## 添加项目

编辑 data.js，把项目对象放入 projects 数组。以下是字段示例，不是已有项目：

```javascript
window.LAB_DATA = {
  projects: [
    {
      id: 'your-project', // 唯一 ID，建议用英文和连字符
      title: '你的项目名称',
      category: '软硬件', // 软件、硬件或软硬件
      status: '进行中',
      summary: '用一句话说明项目目标。',
      tags: ['STM32', 'C', 'PCB'],
      updated: '2026-11-24',
      repository: 'https://github.com/你的账号/你的仓库', // 可省略
      // designUrl: 'https://example.com/你的设计文件',
      sections: [
        {title: '项目概述', text: '目标、背景与功能说明。'},
        {title: '软硬件方案', items: ['芯片与接口', '软件架构', '关键设计选择']},
        {title: '测试与调试', text: '记录测试条件、实测结果与问题。'},
        {title: '关键代码', code: '// 在这里放代码片段'},
        {title: '复盘与计划', text: '写下收获和下一步。'}
      ]
    }
  ],
  logs: [
    {
      id: 'first-log',
      title: '一次调试记录',
      date: '2026-11-24',
      tags: ['调试', 'UART'],
      projectId: 'your-project', // 可省略；对应项目 id
      body: '现象：\n\n分析：\n\n实验：\n\n结论：'
    }
  ]
};
```

把最近的项目与日志放在数组前面。不要将实际密码或密钥写入公开内容。描述按纯文本显示，支持换行；章节可用 items 列表和 code 代码块。

## 本地预览

在 learning-site 目录打开终端运行：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

访问 http://127.0.0.1:4173/ 。也可以双击 index.html；如果剪贴板权限不可用，复制模板按钮会自动改为下载。

## 免费发布到 GitHub Pages

1. 登录 GitHub，确认当前账号为 cj6666285。
2. 打开 https://github.com/new?name=cj6666285.github.io ，创建公开仓库 cj6666285.github.io，勾选添加 README。
3. 在仓库选择 Add file → Upload files，上传本目录的 index.html、styles.css、app.js、data.js、favicon.svg 五个文件。文件必须位于仓库根目录，然后 Commit changes。
4. 打开仓库 Settings → Pages，Source 选择 Deploy from a branch，分支选择 main，目录选择 /(root)，点击 Save。
5. 等待 Actions 中 Pages 部署成功，网站地址为 https://cj6666285.github.io/ 。当前仅准备好了站点文件，不代表网站已上线。

以后修改并提交 data.js，GitHub Pages 会重新部署内容。没有数据库或浏览器私有记录，项目内容在仓库中保存并随部署公开。

### 可选：GitHub Actions 发布

如果通过 Git 推送本目录全部文件（含 .github），可在 Settings → Pages 把 Source 选择为 GitHub Actions。本目录的 deploy.yml 会把上述五个文件和 .nojekyll 发布，不会把 README 等说明文件带入产物。需要手动运行一次工作流，或提交一次 main 分支更新。网页上传发布与 Actions 发布任选一种。

## 自定义

- index.html：站点名称、首页文案、个人介绍和 GitHub 主页。
- styles.css：颜色、字体、布局与手机样式。
- data.js：公开项目和开发日志。
- app.js：详情渲染、搜索、模板内容与页面切换。

本站不包含特定工程资料，后续按自己的项目逐步填充。
