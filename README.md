# 曼波大王 · 嵌入式软件与硬件项目记录

网站：https://cj6666285.github.io/

HTML、CSS 和原生 JavaScript，GitHub Pages 免费托管，无需构建。Markdown 解析器随站点保存，不依赖外部 CDN。

## 页面结构

- 总览：“曼波大王个人网站”标题、个人介绍、3D 照片环形轮播、粒子背景、两行滚动兴趣标签。
- 主页背景：六张插画按 06→05→04→03→02→01 倒序循环，每 2 秒切换；主页的背景编号和播放按钮可查看状态、暂停或手动切图。首次下载期间显示加载状态，图片就绪后按两秒间隔轮播。
- 项目档案：嵌入式与电源专题、封面文章卡片、分类搜索、正文和多级目录。
- 关于：个人介绍，以及两个抖音、GitHub、QQ、微信、闲鱼的图标卡片。

已移除独立的记录模板页面、开发日志栏目和首页三张模板入口卡片。不提供留言板，不需要配置数据库。

项目档案已收录“26年电赛H题”功能与算法说明、“二十一届智能车飞檐走壁”算法记录。六份文章框架预览继续保留，可通过原有详情链接访问；列表展示真实文章，框架预览不计入真实项目数量。

## 日常更新改哪里

| 文件 | 内容 |
| --- | --- |
| projects/ | Markdown 文章和每个项目自己的图片文件夹 |
| projects/index.json | 要展示的文章路径清单，添加一篇登记一行 |
| data.js | 专题名称、封面和外观配置 |
| index.html | 首页文案、个人介绍、GitHub 和两个抖音链接 |
| fx.js | 轮播照片与动效参数 |
| backgrounds.js | 主页背景切换间隔（顶部 intervalMs，单位毫秒） |
| assets/images/home-background-01.webp ～ 06.webp | 六张主页背景，按编号倒序切换 |
| assets/images/ | 照片、封面和正文配图 |
| styles.css | 颜色、字体和布局 |
| app.js | 分类、搜索、文章详情及页面切换 |

修改仓库 main 分支根目录下的文件并提交后，GitHub Pages 会自动重新部署。等待 Actions 中的 Pages 部署成功再刷新网站。

文章随 HTML 附带一份已发布内容，网络慢或 Markdown 请求超时时仍可阅读；网页会在后台读取最新 Markdown 并更新。发布前可运行 `python scripts/update-project-snapshot.py`，刷新这份备用内容。直接修改 GitHub 上的 Markdown 也会由后台请求读取，但建议同步更新备用内容以保证弱网访问。

## 添加项目：一篇 Markdown ＋ 一个照片文件夹

文章已改为 Markdown。日常发布不需要编辑 app.js 或往 data.js 写文章对象。

```text
projects/
├─ index.json
├─ _template/          # 可复制的完整示例，默认草稿、不展示
│  ├─ index.md
│  └─ images/
│     ├─ board.svg
│     └─ test.svg
└─ stm32-car/          # 你新建的项目，文件夹名不要与其他项目重复
   ├─ index.md
   └─ images/
      ├─ board.jpg
      └─ test.jpg
```

### 第一步：复制示例，写文章、放照片

将 projects/_template 复制为 projects/stm32-car。编辑 index.md 开头的信息：

```yaml
---
title: "STM32 智能小车"
category: "嵌入式"
date: "2026-11-26"
status: "进行中"
discipline: "软硬件"
tags: ["STM32", "电机控制"]
summary: "介绍自己的设计目标、实现方案与当前进度。"
cover: "./images/board.jpg"
draft: false
preview: false
---
```

再在下面写正文：

```markdown
## 一、项目介绍

这里写项目背景、目标和功能。

## 二、硬件设计

![主控板实拍](./images/board.jpg)

*第一版主控板。*

### 2.1 器件选型

这里写选型依据。

## 三、运行测试

![测试照片](./images/test.jpg)
```

照片可以插入多张，JPG、PNG、WebP 均可。图片路径以当前 index.md 所在文件夹为起点；请勿写电脑盘符。文件名与大小写要一致，推荐英文文件名，不使用空格。带空格的路径可写成 `![照片](<./images/my photo.jpg>)`。图片支持点击打开原图。

### 第二步：登记文章路径

编辑 projects/index.json，将新文章加到数组最前面。例如：

```json
[
  "stm32-car/index.md",
  "preview-firmware/index.md",
  "preview-buck/index.md",
  "preview-adc/index.md",
  "preview-pcb/index.md",
  "preview-dcdc/index.md",
  "preview-control/index.md"
]
```

保留你需要的原有路径，每行之间有逗号，最后一行不加逗号。清单路径相对于 projects/，不需要再次写 projects/。网站无法直接枚举 GitHub Pages 的文件夹，因此新文章需要在这里登记一次；之后只修改文章与照片即可。

### 第三步：上传到 GitHub

在仓库 https://github.com/cj6666285/cj6666285.github.io 中选择 Add file → Upload files，将新项目文件夹上传到 projects/，并提交更新后的 projects/index.json。等待 Pages 部署成功，刷新网站。

更新已有项目时，直接编辑对应 index.md，替换或增加 images/ 里的图片，无需重复登记。删除文章时先从 index.json 移除路径。清单顺序就是列表顺序，较新的项目放前面。

### 配置与 Markdown 支持

- title、category 必填；category 默认可选“嵌入式”“电源”，新分类也会自动加入筛选。
- draft: true 为草稿，网站不展示；发布前改成 false。
- preview: true 为框架示例，不计入真实项目数量；自己的文章用 false。存在真实文章时，列表自动显示真实文章，保留原有示例直达链接。
- cover 是列表封面，路径相对当前文章。repository 和 designUrl 可选，填写 HTTPS 链接后显示源码、设计文件按钮。
- 开头配置支持上述单行字段格式，字符串建议用双引号，tags 使用双引号数组。日期使用 YYYY-MM-DD；不支持复杂 YAML 嵌套写法。
- 正文支持标题、多级章节、段落、粗体、斜体、列表、引用、分隔线、代码块、表格、链接、多张图片。正文标题自动生成右侧目录，刷新章节链接仍可定位。正文通常从二级标题 `##` 开始。
- 使用标准 Markdown，手写 HTML 会被过滤。不支持 Mermaid、数学公式和视频嵌入。
- 文章或清单读取失败时，项目页会显示错误和重试按钮；个别文章有误时其他文章仍能显示。

## 照片轮播与粒子背景

六张照片自动旋转的 3D 圆环，以及 Canvas 粒子连线背景，无需 CDN。

- 默认每圈 24 秒，悬停或键盘聚焦照片时暂时停止。
- 左右箭头、编号、方向键或横向拖动切换照片。
- 点击照片查看大图，Esc 或关闭按钮返回。
- 暂停动效：同时暂停轮播与粒子，状态保存在当前标签页中。
- 系统开启“减少动态效果”时静态展示，可手动切换。
- 切换栏目、离开视口或标签页不可见时停止相应动画。

六张轮播图会一起请求加载，避免 3D 变换中的图片因延迟加载而暂时空白。加载时显示提示，失败时点击卡片可重试。关闭按钮使用居中的 SVG 图标。

首页的旧技术条、项目统计和引言区块已替换为滚动标签。标签在 index.html 的 interest-marquee 中修改，同一行有两份相同内容以实现连续滚动；更新时两份一起修改。暂停动效也会暂停标签，系统开启“减少动态效果”时可手动横向浏览。

### 更换照片和调整动效

将图片放进 assets/images/，修改 fx.js 顶部 CONFIG.images 的 src、label、alt、width 和 height。当前为 gallery-01.webp 至 gallery-06.webp。照片保持完整比例，建议长边不超过 1600 像素并使用 WebP。编号按钮会根据照片数量自动生成。

### 社交卡片与联系方式

关于页采用两张抖音大卡片和 GitHub、QQ、微信三张小卡片，图标为内嵌 SVG。平台链接在 index.html 中修改，页眉也有相同入口。QQ 和微信通过原生弹窗展示二维码，支持保存；QQ 另提供复制号码和打开 QQ 的入口，直接打开需要设备已安装 QQ。

二维码图片位于 assets/images/qq-qr.png、wechat-qr.png，已保留二维码四周留白。号码与弹窗说明在 app.js 的 contacts 中维护；更换 QQ 号码时还需同步复制按钮和 index.html 中的打开 QQ 链接。

CONFIG.cycleSeconds 控制旋转速度；CONFIG.particles.desktop / mobile 控制粒子数量，linkDistance / pointerDistance 控制连线与鼠标响应距离。

## 本地预览与发布

在本目录运行 python -m http.server 4173 --bind 127.0.0.1，访问 http://127.0.0.1:4173/ 。Markdown 通过 HTTP 读取，不要双击 index.html 预览文章。

当前从 main 分支根目录发布。更新时将本目录中的站点文件放在仓库根目录，保留 .nojekyll、markdown.js、fx.js、assets/ 与 projects/。

若切换为 GitHub Actions 发布，可使用 .github/workflows/deploy.yml，并在 Settings → Pages 中选择 GitHub Actions。两种发布方式任选一种。
