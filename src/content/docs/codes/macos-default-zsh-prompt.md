---
title: macOS 默认 zsh 提示符
---

取自：`https://github.com/apple-oss-distributions/zsh/blob/main/zshrc`

```bash
PS1="%n@%m %1~ %# "
```

效果是：

```text
luke@luke-macbook2025 ~ % ls /usr
bin		libexec		sbin		standalone	X11R6
lib		local		share		X11
luke@luke-macbook2025 ~ %
```
