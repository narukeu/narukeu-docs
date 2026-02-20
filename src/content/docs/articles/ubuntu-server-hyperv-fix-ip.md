---
title: 固定在 Hyper-V 中 Ubuntu Server 虚拟机的 IP 地址
---

## 1. 准备工作

Powershell 下输入 ipconfig，获取虚拟机所在网关（Default Switch）的信息，例如：

```plain
以太网适配器 vEthernet (Default Switch):

   连接特定的 DNS 后缀 . . . . . . . :
   本地链接 IPv6 地址. . . . . . . . : fe80::dfd0:f7f0:2421:b64e%27
   IPv4 地址 . . . . . . . . . . . . : 172.23.192.1
   子网掩码  . . . . . . . . . . . . : 255.255.240.0
   默认网关. . . . . . . . . . . . . :
```

## 2. 修改配置

Ubuntu Server 新版本用 netplan，因此需要修改 netplan 的配置文件，例如：

先通过 `sudo -s` 切换到 root，然后输入：

```bash
nano /etc/netplan/50-cloud-init.yaml
```

修改之前可以备份一下。

将内容修改为如下：

```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        # 使用虚拟机所在网段作为静态 IP 地址
        # / 后面是子网掩码位数，255.255.240.0 是 20
        - 172.23.204.145/20
      routes:
        - to: default
          ## 使用虚拟机所在网关作为默认网关
          via: 172.23.192.1
      nameservers:
        addresses:
          # 用 Hyper-V 虚拟交换机的默认网关作为 DNS 服务器
          - 172.23.192.1
```

然后输入：

```bash
netplan try
```

确认没有问题后，输入：

```bash
netplan apply
```
