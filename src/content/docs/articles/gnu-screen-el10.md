---
title: 解决 RHEL 运行 GNU Screen 出现 `Directory '/run/screen' must have mode 777. 的问题`
---

我们不能直接：

```bash
sudo mkdir /run/screen
sudo chmod -R 777 /run/screen
```

因为 `/run` 是一个 `tmpfs`，我们需要持久化地使配置生效。

所以，我们通过 `systemd-tmpfiles` 来解决这个问题。

## 1. 创建配置文件

```bash
sudo vi /etc/tmpfiles.d/screen.conf
```

## 2. 写入规则

```text
# 类型  路径          权限  用户  组    过期时间
d     /run/screen   0777  root  root  -
```

## 3. 应用

```bash
sudo systemd-tmpfiles --create /etc/tmpfiles.d/screen.conf
```
