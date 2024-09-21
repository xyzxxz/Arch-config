# 软件源

官方源比较慢，为了后续安装软件更快，更换国内源

我用的是[中科大](https://mirrors.ustc.edu.cn/help/archlinux.html)的源，编辑 `/etc/pacman.d/mirrorlist`，在文件的最顶端添加

```sh
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
```

## archlinuxcn

Arch Linux 中文社区仓库是由 Arch Linux 中文社区驱动的非官方用户仓库。包含中文用户常用软件、工具、字体/美化包等。

在 `/etc/pacman.conf` 文件末尾添加两行：

```sh
[archlinuxcn]
SigLevel = Optional TrustAll
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
```

然后安装 archlinuxcn-keyring 包以导入 GPG key。

```sh
sudo pacman -S archlinuxcn-keyring
```

[清华源地址](https://mirrors.tuna.tsinghua.edu.cn/help/archlinux/)

## aur

AUR 中的软件包是由其他用户编写的，这些 PKGBUILD 完全是非官方的，未经彻底审查。

paru 是新的AUR助手，感觉比 yay 更好用

安装[paru](https://github.com/Morganamilo/paru)

```sh
sudo pacman -S paru
```
