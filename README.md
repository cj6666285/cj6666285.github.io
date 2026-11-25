# CJ LAB · 嵌入式软件与硬件项目记录

网站：https://cj6666285.github.io/

HTML、CSS 和原生 JavaScript，GitHub Pages 免费托管，无需构建。

## 页面结构

- 总览：个人介绍、3D 照片环形轮播、粒子背景、项目统计。
- 项目档案：嵌入式与电源专题、封面文章卡片、分类搜索、正文和多级目录。
- 关于：个人介绍及 GitHub 主页。

已移除独立的记录模板页面、开发日志栏目和首页三张模板入口卡片。不提供留言板，不需要配置数据库。

项目档案保留六份明确标注的文章框架预览，展示选定的文章排版，不计入真实项目数量。真实项目初始为空，添加后列表自动替换为真实文章。

## 日常更新改哪里

| 文件 | 内容 |
| --- | --- |
| data.js | 真实项目、专题封面、文章框架预览 |
| index.html | 首页文案、个人介绍、GitHub 和两个抖音链接 |
| fx.js | 轮播照片与动效参数 |
| assets/images/ | 照片、封面和正文配图 |
| styles.css | 颜色、字体和布局 |
| app.js | 分类、搜索、文章详情及页面切换 |

修改仓库 main 分支根目录下的文件并提交后，GitHub Pages 会自动重新部署。等待 Actions 中的 Pages 部署成功再刷新网站。

## 添加项目文章

编辑 data.js，将真实文章对象放入 projects 数组。也可以从 projectTemplates 复制结构后修改。最近的文章放在数组前面。

```javascript
{
  id: 'my-project', // 唯一 ID，英文与连字符
  title: '你的项目名称',
  category: '嵌入式', // 嵌入式或电源，也可配置自己的专题
  discipline: '软硬件', // 软件、硬件或软硬件，用于首页统计
  date: '2026-11-25',
  status: '进行中',
  cover: './assets/images/my-project.webp',
  tags: ['STM32', 'C', 'PCB'],
  summary: '项目目标、方案与当前进度。',
  repository: 'https://github.com/你的账号/项目仓库', // 可选
  sections: [
    {title: '一、项目概述', text: '填写真实需求。', items: ['目标一', '目标二']},
    {
      title: '二、硬件方案',
      image: './assets/images/my-schematic.webp', imageAlt: '项目原理图', caption: '版本说明。',
      children: [{title: '2.1 主控与供电', text: '填写选型依据。'}]
    },
    {title: '三、软件实现', code: '// 关键代码'},
    {title: '四、测试结果', table: {columns: ['测试项', '条件', '实测'], rows: [['输出电压', '填写条件', '填写结果']]}},
    {title: '五、复盘与资料', text: '填写结论与下一步。', links: [{label: '查看资料 ↗', url: 'https://github.com/你的账号/项目仓库'}]}
  ]
}
```

children 支持多级章节，目录自动生成，章节链接支持刷新定位。正文、标签、表格和代码均按纯文本显示。图片支持相对路径或 HTTPS，素材需随文章一起提交。不要将提示文字或示意图当成已完成项目。

## 照片轮播与粒子背景

保留三张照片自动旋转的 3D 圆环，以及 Canvas 粒子连线背景，无需 CDN。

- 默认每圈 24 秒，悬停或键盘聚焦照片时暂时停止。
- 左右箭头、编号、方向键或横向拖动切换照片。
- 点击照片查看大图，Esc 或关闭按钮返回。
- 暂停动效：同时暂停轮播与粒子，状态保存在当前标签页中。
- 系统开启“减少动态效果”时静态展示，可手动切换。
- 切换栏目、离开视口或标签页不可见时停止相应动画。

### 更换照片和调整动效

将图片放进 assets/images/，修改 fx.js 顶部 CONFIG.images 的 src、label、alt、width 和 height。当前为 gallery-01.webp、gallery-02.webp、gallery-03.webp。照片保持完整比例，建议长边不超过 1600 像素并使用 WebP。

CONFIG.cycleSeconds 控制旋转速度；CONFIG.particles.desktop / mobile 控制粒子数量，linkDistance / pointerDistance 控制连线与鼠标响应距离。

## 本地预览与发布

在本目录运行 python -m http.server 4173 --bind 127.0.0.1，访问 http://127.0.0.1:4173/ ，或直接打开 index.html。

当前从 main 分支根目录发布。更新时将本目录中的站点文件放在仓库根目录，保留 .nojekyll、fx.js 与 assets/。

若切换为 GitHub Actions 发布，可使用 .github/workflows/deploy.yml，并在 Settings → Pages 中选择 GitHub Actions。两种发布方式任选一种。
