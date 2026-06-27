---
title: 传统 Bash 方框提示符
---

```bash
PS1='[\u@\h \W]\$ '
```

效果是：

```text
[luke@luke-macbook2025 ~]$ ls /usr
bin		libexec		sbin		standalone	X11R6
lib		local		share		X11
[luke@luke-macbook2025 ~]$
```

如果在 zsh 上则是：

```bash
PROMPT='[%n@%m %1~]%# '
```
