---
title: 创建 `.bashrc.d` 文件夹，使得 bash 能够从这里读取模块化配置
---

在 `~/.bashrc` 末尾添加：

```bash
if [ -d "$HOME/.bashrc.d" ]; then
  for file in "$HOME"/.bashrc.d/*; do
    [ -f "$file" ] && . "$file"
  done
fi
```
