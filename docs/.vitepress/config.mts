import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Arch 配置",
  description: "配置arch linux的过程",
  base: '/Arch-config/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '配置', link: '/base/mirrorslist' },
      { text: 'Emacs', link: '/app/emacs-config.md'}
    ],

    sidebar: [
      {
	text: '基础配置',
	items: [
	  { text: '软件源', link: '/base/mirrorslist' },
	  { text: '字体', link: '/base/font'},
	  { text: '终端 kitty', link: '/base/kitty' },
	  { text: 'git', link: '/base/git' },
	  { text: 'zsh', link: '/base/zsh' },
	  { text: '科学上网', link: '/base/v2raya' },
	  { text: 'neovim', link: '/base/neovim' },
	  { text: '输入法 fcitx5', link: '/base/fcitx5' }
	]
      },
      {
	text: '桌面环境',
	items: [
	  { text: 'Hyprland', link: '/desktop/hyprland' },
	  { text: '桌面组件 ags', link: '/desktop/ags' },
	  { text: '其他', link: '/desktop/other' },
	  { text: 'wayland桌面的一些问题', link: '/desktop/problems' }
	]
      },
      {
	text: '安装软件',
	items: [
	  { text: '浏览器', link: '/app/browser' },
	  { text: 'emacs', link: '/app/emacs-config.md' },
	  { text: 'vscode', link: '/app/vscode' },
	  { text: '终端工具', link: '/app/terminal-tools' },
	  { text: '开发', link: '/app/coding' }
	]
      },
      {
	text: '下一步',
	items: [
	  { text: 'sddm', link: '/next-step/sddm' },
	  { text: 'grub', link: '/next-step/grub' }
	]
      },
      {
	text: '遇到的问题',
	items: [
	  { text: '声音', link: '/problems/volume' },
	  { text: '网络', link: '/problems/network' }
	]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xyzxxz/Arch-config' }
    ]
  }
})
