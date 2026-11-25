# CJ LAB · 嵌入式软件与硬件项目记录

为 GitHub 用户 cj6666285 准备的个人项目记录网站框架。HTML、CSS 和原生 JavaScript，无需安装依赖、构建或购买服务器。

## 页面结构

- 总览：个人工作台介绍、项目统计与近期项目。
- 项目档案：专题大图入口、带封面的文章卡片、分类搜索、带多级目录的文章详情。
- 开发日志：按内容文件中的顺序展示记录，支持关联项目。
- 记录模板：软件项目、硬件项目、调试复盘，支持复制和下载 Markdown。
- 关于：个人介绍及 GitHub 主页。

真实项目和日志初始均为空。项目档案中的六份文章是明确标注的模板预览，不计入实际项目数量。首页的三个卡片是记录模板入口。网站没有后台或登录系统，公开内容通过 data.js 维护，所有访客看到相同内容。

## 添加项目

编辑 data.js，把项目对象放入 projects 数组。以下是字段示例，不是已有项目：

```javascript
window.LAB_DATA = {
  projects: [
    {
      id: 'your-project', // 唯一 ID，建议用英文和连字符
      title: '你的项目名称',
      category: '嵌入式', // 专题名称，例如嵌入式、电源；也兼容原有分类
      discipline: '软硬件', // 软件、硬件或软硬件，用于首页统计
      cover: './assets/images/你的封面.webp', // 上传自己的项目封面
      readMinutes: 8, // 可选，不填则根据文章内容估算
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
3. 在仓库选择 Add file → Upload files，上传本目录的 index.html、styles.css、app.js、data.js、fx.js、favicon.svg 文件和 assets 文件夹。文件必须位于仓库根目录，然后 Commit changes。
4. 打开仓库 Settings → Pages，Source 选择 Deploy from a branch，分支选择 main，目录选择 /(root)，点击 Save。
5. 等待 Actions 中 Pages 部署成功，网站地址为 https://cj6666285.github.io/ 。当前仅准备好了站点文件，不代表网站已上线。

以后修改并提交 data.js，GitHub Pages 会重新部署内容。没有数据库或浏览器私有记录，项目内容在仓库中保存并随部署公开。

### 可选：GitHub Actions 发布

如果通过 Git 推送本目录全部文件（含 .github），可在 Settings → Pages 把 Source 选择为 GitHub Actions。本目录的 deploy.yml 会把站点文件、assets 素材和 .nojekyll 发布，不会把 README 等说明文件带入产物。需要手动运行一次工作流，或提交一次 main 分支更新。网页上传发布与 Actions 发布任选一种。

## 自定义

- index.html：站点名称、首页文案、个人介绍和 GitHub 主页。
- styles.css：颜色、字体、布局与手机样式。
- data.js：公开项目和开发日志。
- app.js：详情渲染、搜索、模板内容与页面切换。

本站不包含特定工程资料，后续按自己的项目逐步填充。

## 照片环形轮播与粒子背景

首页使用三张自定义图片组成自动旋转的 3D 圆环，搭配全屏 Canvas 粒子与近距离连线。粒子可响应鼠标位置；手机端降低粒子数量。无需 CDN、第三方库或构建。

- 自动旋转：一圈默认 24 秒，鼠标悬停在照片上或键盘聚焦照片时暂时停止，方便查看。
- 手动操作：左右箭头、底部编号、画廊内方向键，或横向拖动照片。
- 点击照片：打开完整图片；按 Esc、点击关闭按钮或遮罩可关闭。
- 暂停动效：同时暂停轮播、粒子与氛围动效，状态保存在当前浏览器标签页中。
- 系统开启“减少动态效果”时显示静态照片与粒子背景，可手动切换图片。
- 切换到其他栏目或画廊离开视口时停止旋转；浏览器标签页不可见或查看大图时停止动画循环。

### 更换照片

将图片放进 `assets/images/`，编辑 `fx.js` 顶部 `CONFIG.images` 的 `src`、`label`、`alt`、`width` 和 `height`。初始照片为 `gallery-01.webp`、`gallery-02.webp`、`gallery-03.webp`。图片按完整比例显示，横图也不会强行裁掉边缘。

建议图片长边不超过 1600 像素、使用 WebP 格式。更改图片后需要一起提交素材和 `fx.js`。

### 调整动效

- `CONFIG.cycleSeconds`：每圈转动所需秒数，越大越慢。
- `CONFIG.particles.desktop` / `mobile`：电脑与手机的粒子数量。
- `CONFIG.particles.linkDistance`：粒子之间的连线距离。
- `CONFIG.particles.pointerDistance`：粒子与鼠标的响应范围。

项目与日志仍由 `data.js` 维护，社交按钮在 `index.html` 中修改。当前从 `main` 根目录发布的 Pages 配置会自动包含 `fx.js` 和 `assets/`；完整更新时一起上传这些文件。


## 项目文章框架（专题 → 文章列表 → 正文目录）

`data.js` 中的内容分为四块：

- `categories`：顶部专题入口的名称、描述、封面、图标和强调色。
- `projects`：自己的真实文章。首页和专题数量只统计这个数组。
- `projectTemplates`：可点击的框架预览，正文内也会标注“模板预览”。没有真实文章时才在列表中展示，添加真实文章后列表自动显示真实内容。
- `logs`：原有开发日志。

### 最快的添加方法

从 `projectTemplates` 中复制一整个对象到 `projects` 数组，再修改项目 ID、标题、分类、正文、配图和日期。不要移动模板或修改预览标记来充当实际完成的项目；真实内容直接保存到 `projects` 即可。

```javascript
{
  id: 'my-project',
  title: '你的项目文章标题',
  category: '电源',
  discipline: '软硬件',
  date: '2026-11-25',
  status: '进行中',
  readMinutes: 8,
  cover: './assets/images/my-project-cover.webp',
  coverAlt: '项目电路板实拍',
  tags: ['STM32', 'BUCK'],
  summary: '先用一段话说明目标、方案和当前验证到的结果。',
  sections: [
    { title: '一、需求与指标', text: '填写真实需求。', items: ['指标一', '指标二'] },
    {
      title: '二、硬件方案',
      image: './assets/images/my-schematic.webp',
      imageAlt: '项目原理图',
      caption: '原理图版本与说明，点击图片可打开原图。',
      children: [
        { title: '2.1 供电与主控', text: '写明器件选型与依据。' },
        { title: '2.2 采样与保护', text: '写明信号路径和保护条件。' }
      ]
    },
    { title: '三、软件设计', code: '// 放入关键代码' },
    {
      title: '四、测试结果',
      table: { columns: ['测试项', '条件', '实测'], rows: [['纹波', '填写测试条件', '填写实际结果']] }
    },
    {
      title: '五、交付资料',
      text: '填写源码、设计文件和使用说明。',
      links: [{ label: '下载资料 ↗', url: 'https://github.com/你的账号/项目仓库' }]
    }
  ]
}
```

`children` 支持嵌套章节，目录会自动生成。点击目录后地址会包含章节位置，刷新仍能定位到对应章节。电脑端目录随页面滚动保持可见；手机端移至正文上方。标签、正文、表格与代码均按纯文本显示，不解析手写 HTML。

`cover` 和正文 `image` 支持站内相对路径或 HTTPS 地址。建议将素材放进 `assets/images/` 并和文章一起上传。当前专题与模板封面使用技术示意图，后续可以直接替换成自己的原理图、PCB 或实拍照片。
