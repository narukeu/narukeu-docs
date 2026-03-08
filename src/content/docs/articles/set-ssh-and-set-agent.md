---
title: 在主机上设置 Linux 客户机 SSH 免密钥登录
---

## 1. 生成 SSH 密钥对

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

`ed25519` 是现代且安全的算法，而且比 RSA 要短。也可以用传统的 RSA。

然后建议最好设置一个口令。

## 2. 将公钥复制到 Linux 客户机

SSH 登录客户机，然后用 `nano` 编辑 `~/.ssh/authorized_keys` 文件，将公钥（`*.pub`）内容复制进去保存退出。

然后设置 `600` 权限。

## 3. 测试 SSH 免密钥登录

按照正常的 SSH 登录命令登录客户机，如果因为设置了口令而每次都需要输入口令，可以使用 SSH Agent 来管理密钥。

如在 Windows 上，先在服务中启用和启动 `OpenSSH Authentication Agent` 服务，然后在 PowerShell 中运行：

```powershell
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

### 3.1 在 macOS 上的配置

在 macOS 上，需要先配置一下 SSH Agent：

```bash
nano ~/.ssh/config
```

添加以下内容：

```plain
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

再运行：`ssh-add --apple-use-keychain ~/.ssh/id_ed25519` 来将密钥添加到 Keychain 中。

通过 `ssh-add -l` 来查看已添加的密钥列表，验证是否成功
