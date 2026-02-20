---
title: 在只有无线网卡的笔记本上通过 Archiso 安装 Arch Linux
---

一台联想小新 2021 款笔记本。

于是我先在终端输入：

```bash
iwctl
```

进入 REPL。

然后输入：

```bash
device list
```

但是这里我发现 `wlan0` 设备的 Powered 为 `off`，证明不可用。

于是我尝试：

```bash
device wlan0 set-property Powered on
```

提示操作失败。

查资料发现是被软性屏蔽导致的，所以我尝试：

```bash
rfkill list
```

发现 WiFi 设备果然被软性屏蔽了，
于是我尝试：

```bash
rfkill unblock all
```

解除。

然后重新执行进入 `iwctl`：

然后输入

```bash
# 扫描无线网
station wlan0 scan

# 列出扫描到的无线网络
station wlan0 get-networks

# 连接无线网
station wlan0 connect "XXX"
```
