# 极简体重

一款简洁高效的体重记录应用，专为移动端优化设计。

## 功能特点

- 记录并跟踪每日体重变化
- 直观的体重趋势图表
- 累计减重数据统计
- 支持添加、编辑和删除体重记录
- 完全离线工作，所有数据存储在本地
- 支持PWA，可添加到主屏幕

## 技术栈

- HTML5 + CSS3
- JavaScript (ES6+)
- Alpine.js - 轻量级响应式框架
- Tailwind CSS - 原子化CSS框架
- Chart.js - 数据可视化图表
- Hammer.js - 触摸手势支持
- PWA - 渐进式Web应用

## 使用方法

1. 点击底部"+"按钮添加新的体重记录
2. 点击已有记录可编辑或删除
3. 查看图表了解体重变化趋势
4. 通过设置按钮自定义应用行为

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/tizhong-webapp.git

# 进入项目目录
cd tizhong-webapp

# 使用任意HTTP服务器启动项目
# 例如使用Python的内置HTTP服务器
python -m http.server 8080
```

然后在浏览器中访问 `http://localhost:8080`

## 隐私说明

所有数据仅存储在您的设备上，不会上传到任何服务器。
