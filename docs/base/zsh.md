# Zsh

oh-my-zsh 我没怎么用过，我用到的插件较少，而且oh-my-zsh会拖慢 zsh 的速度

更改默认 shell

```sh
chsh -l # 查看安装了哪些 Shell
sudo chsh -s /usr/bin/zsh root
```

## 美化

starship

## 插件

```sh
sudo pacman -S zsh zsh-autosuggestions zsh-syntax-highlighting zsh-completions
```

让插件生效，在 `~/.zshrc` 中添加：

```zsh
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```
