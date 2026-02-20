---
title: 找出使用 Systemd 的 Linux 系统关机缓慢或卡在关机界面的日志
---

`sudo journalctl -b -1 --no-pager | egrep -i "A stop job is running|timed out|timeout|stop|failed|dependency failed|killed process|shutdown"`

## 解释

用 `sudo` 提升权限以查看系统日志。

### `journalctl`

`-b -1` 意思是查看上一次启动的日志。`-b -2` 是倒数第二次，以此类推。如果没有指定数字，则查看当前启动的日志。

`--no-pager` 意思是不使用分页器，直接输出所有日志。

### `egrep`

`egrep` 是 `grep -E` 的简写，表示使用扩展正则表达式进行匹配。

`-i` 表示忽略大小写。

引号里的内容是要匹配的关键词或短语，多个关键词用 `|` 分隔，表示“或”的关系。
