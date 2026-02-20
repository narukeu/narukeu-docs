---
title: 使用 Systemd 服务防止 USB 硬盘自动休眠
---

## 问题

由于很多 USB 移动硬盘的节能策略，长时间不读写就会休眠，再次访问时会有几秒钟的延迟甚至访问失败。这对于用作`迷你主机服务器 +  USB 硬盘`的场景是不有好的。

## 为什么将这个做成 Systemd 服务？

最简单的方案是 `crontab` 定时任务。但是 `systemd` 具备以下有点：

- `systemd` 现在是绝大多数发行版的默认 `init`，用起来比较习惯
- `systemd` 可以做成服务开机自启，比较省心
- 而且使用 `systemd` 做成服务的话排错也比较容易。

## 第一步：创建防休眠脚本

这个脚本会循环执行，检查目标文件是否存在，然后读取它。它包含了基础的错误处理和日志记录。

我们假设需要读取的硬盘已经被挂载到了 `/srv` 下面。

`/usr/local/bin/keepalive.sh`：

```bash
#!/bin/bash

# 设置挂载目录
mountDir="/srv"

# 日志函数
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [USB-Keepalive] $1" | logger -t usb-keepalive
}

# 主循环函数
main_loop() {
    log_message "INFO: Starting USB keepalive service"

    while true; do
        # 检查挂载目录是否存在
        if [ ! -d "$mountDir" ]; then
            log_message "ERROR: Target directory $mountDir does not exist. Sleeping."
            sleep 180
            continue
        fi

        # 确保 .keepalive 文件存在
        if [ ! -f "$mountDir/.keepalive" ]; then
            echo "keepalive" > "$mountDir/.keepalive"
        fi

        # 尝试读取文件并同步，以确保产生 I/O
        if cat "$mountDir/.keepalive" > /dev/null 2>&1 && sync; then
            log_message "DEBUG: Successfully accessed $mountDir/.keepalive"
        else
            log_message "WARNING: Failed to access $mountDir/.keepalive"
        fi

        # 等待3分钟
        sleep 180
    done
}

main_loop
```

### 然后赋予它可执行权限：

```bash
sudo chmod +x /usr/local/bin/keepalive.sh
```

## 第二步：创建 Systemd 服务单元

这个服务文件告诉 `systemd` 如何管理我们的脚本。

创建服务文件 `/etc/systemd/system/usb-keepalive.service`：

```
[Unit]
Description=USB Disk Keepalive Service
After=local-fs.target

[Service]
Type=simple
ExecStart=/usr/local/bin/keepalive.sh
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
```

- `Restart=always`: 保证服务始终运行。
- `RestartSec=10`: 如果服务失败，10秒后重启。

## 第三步：启动服务

执行以下命令来重载配置、启用并立即启动服务：

```bash
# 重新加载 systemd 管理器配置
sudo systemctl daemon-reload

# 设置服务开机自启动并立即启动
sudo systemctl enable --now usb-keepalive.service
```

## 额外：管理服务

你可以用以下命令来检查和管理你的服务：

### 查看状态

```bash
sudo systemctl status usb-keepalive.service
```

### 查看实时日志

```bash
sudo journalctl -u usb-keepalive.service -f
```

### 停止服务

```bash
sudo systemctl stop usb-keepalive.service
```

### 启动服务

```bash
sudo systemctl start usb-keepalive.service
```
