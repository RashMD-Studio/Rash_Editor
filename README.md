# 🎨 Pixel Studio | استودیو پیکسل

**A lightweight, browser-based image editor by Rash MD.**

استودیو پیکسل یک ویرایشگر تصویر تحت وب است که با HTML، CSS و JavaScript ساخته شده و ابزارهای مختلفی برای ویرایش تصاویر در اختیار شما قرار می‌دهد.

## ✨ Features

- 🖼️ باز کردن و ویرایش تصاویر
- 🧩 پشتیبانی از لایه‌ها و مدیریت آن‌ها
- 🖌️ ابزارهای نقاشی و پاک‌کن
- 🎨 فیلترها و جلوه‌های تصویری
- 🪄 ابزار ترمیم ناحیهٔ انتخاب‌شده برای حذف واترمارک
- ↩️ بازگشت و انجام دوبارهٔ تغییرات (Undo / Redo)
- ⌨️ میانبرهای صفحه‌کلید
- 💾 ذخیره و خروجی گرفتن از تصویر
- 🌐 اجرا در مرورگر بدون نیاز به نصب برنامه

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + O` | Open Image |
| `Ctrl + N` | New Document |
| `Ctrl + S` | Save / Export |
| `Ctrl + 0` | Fit to Screen |
| `Ctrl + +` | Zoom In |
| `Ctrl + -` | Zoom Out |
| `B` | Brush |
| `E` | Eraser |
| `T` | Text Tool |
| `C` | Crop Tool |
| `V` | Move Layer |
| `H` | Hand Tool |
| `[` / `]` | Decrease / Increase Brush Size |
| `Space + Drag` | Pan Canvas |

*برخی میانبرها ممکن است هنگام تایپ در فیلدهای ورودی یا باز بودن پنجره‌های خاص غیرفعال باشند.*

## 🚀 Getting Started

### Run Locally

1. مخزن را دانلود یا Clone کنید.
2. فایل `index.html` را در مرورگر باز کنید.
3. تصویر خود را وارد کنید و ویرایش را شروع کنید.

برای اجرای آنلاین، مخزن را از طریق **GitHub Pages** منتشر کنید.

## 🗂️ Project Structure

```text
pixel-studio/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── core.js
    ├── files.js
    ├── filters.js
    ├── history-view.js
    ├── layer-actions.js
    ├── layers-panel.js
    ├── pointer.js
    ├── render.js
    └── tools.js
```

## 🔒 Privacy

پردازش تصویر در نسخهٔ مرورگری به‌صورت محلی انجام می‌شود و این پروژه برای ویرایش معمول تصاویر به سرور پردازش خارجی نیاز ندارد. رفتار هر قابلیت به پیاده‌سازی همان نسخه بستگی دارد.


---

Made by **Rash MD**
