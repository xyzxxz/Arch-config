- [一些设置](#org682aa65)
  - [设置 UTF-8](#org5d1d474)
  - [tab缩进](#orgca8ddee)
- [包管理器 elpaca](#org2fa64f1)
- [Evil Mode](#org25a82f8)
- [撤销 undo-tree](#org2a4a718)
- [General 键绑定](#org1a855f0)
- [Hydra](#orgcd6699b)
- [编辑](#orgb73b508)
  - [多光标编辑](#org3d6d067)
  - [注释](#org1bcf79f)
  - [代码折叠](#org37e2d16)
- [Which-key](#org452917a)
- [字体](#org578ec13)
  - [调整字体大小](#orgbec5e38)
  - [表情 emoji](#orge0eb26d)
  - [All the Icons](#orgb44681d)
  - [Nerd Icons](#org522895f)
  - [Fonts](#org4a736dc)
- [UI](#org46b6a4b)
  - [关闭菜单栏，工具栏，滚动条](#org05d7874)
  - [显示行号](#org45872da)
  - [高亮当前行](#org2b04c86)
  - [Theme](#org84dfb5e)
    - [切换主题](#org28c705b)
  - [modeline](#org19904ba)
  - [透明度](#org11e2e24)
- [Dashboard](#org8556446)
- [Custom file](#org48d203c)
- [自动补全](#org8691a72)
  - [company](#org14921a4)
  - [代码片段 yasnippet](#org9617b63)
  - [无序排列](#orgd69885e)
- [Ivy, counsel](#orgc3f5acb)
  - [ivy-rich](#orgeecce17)
- [avy](#org1e47c3a)
- [Helpful](#org0f233fe)
- [窗口](#org730540e)
  - [快速切换](#orge21550d)
  - [调整大小](#orgb8bedae)
  - [居中窗口](#orge28c2af)
- [Rainbow](#org77ae833)
  - [rainbow mode](#org8a8d4c1)
  - [rainbow delimiters](#org68c533a)
- [Org](#orgee3ed32)
  - [生成目录](#org3edd2d7)
  - [美化 org](#orgb80611e)
  - [隐藏 modeline](#org02db299)
  - [LaTeX 预览](#org68d0d51)
  - [日程](#org2f845ff)
  - [Org Roam](#org3810aca)
  - [Hydra](#org8829159)
- [文件管理](#orgb7f581f)
  - [图标](#orgd0e5d21)
  - [预览](#org63ae5bb)
  - [ranger](#orgaff3674)
  - [treemacs](#orgdb15e64)
- [LSP](#orgff4fb9b)
- [Flycheck](#org4cdb764)
- [Projectile](#org8ea124e)
- [tree-sitter](#org84ff8a0)
- [Git](#org46c62b9)
- [中文输入](#org180382d)
- [语言支持](#orgab26632)
  - [前端](#org8cf2449)
    - [Web mode](#org15ca1c2)
    - [Emmet](#org466ee0d)
    - [css](#org8bae9fd)
    - [SCSS](#org7aee05d)
    - [js/ts](#org5b90c80)
    - [json](#org6316773)
    - [格式化](#orga03bc51)
    - [node\_ modules](#orge728fa9)
    - [Vue3](#org4778df5)
  - [C/C++](#orge14ca30)
  - [Haskell](#orgd170cf1)
  - [Julia](#org15e41cf)
  - [LaTeX](#orgc39034f)
  - [Lua](#orgd8ad6b9)
  - [Markdown](#orged482f8)
  - [OCaml](#org9b2baf4)
  - [Python](#org7850fae)
  - [Rust](#orgab749b8)
  - [other](#org0e8ac59)
- [AI](#org6d8ee73)
- [写博客](#orgd045409)
  - [hugo](#org561bdf8)
- [听歌](#org513912e)
- [邮件](#orgb9a5c6b)
- [浏览网页](#org85318cf)
- [一些有用的工具](#orgb5fe864)
  - [Delete the current file](#org0550d41)
  - [Rename the current file](#orgf85b728)
  - [代理](#org6850e54)
  - [模糊搜索 fzf](#orga0118ec)




<a id="org682aa65"></a>

# 一些设置

```emacs-lisp
(defalias 'yes-or-no-p 'y-or-n-p)
;; 减少 warning
(setq warning-minimum-level :emergency)

(setq make-backup-files nil) ; 关闭文件自动备份

(electric-pair-mode t)                       ; 自动补全括号

(show-paren-mode 1)
(add-hook 'prog-mode-hook #'show-paren-mode) ; 编程模式下，光标在括号上时高亮另一个括号

(setq show-paren-delay 0)
(setq show-paren-when-point-inside-paren t)

(delete-selection-mode t)                    ; 选中文本后输入文本会替换文本（更符合我们习惯了的其它编辑器的逻辑）
(setq custom-safe-themes t)            ; mark all themes as safe, since we can't persist now
(setq enable-local-variables :all)     ; fix =defvar= warnings

```


<a id="org5d1d474"></a>

## 设置 UTF-8

```emacs-lisp
(when (fboundp 'set-charset-priority)
  (set-charset-priority 'unicode))

(prefer-coding-system 'utf-8)
(setq locale-coding-system 'utf-8)
;; 打开文件自动更新
(require 'autorevert)
(global-auto-revert-mode)
(setq auto-revert-mode t
      auto-revert-use-notify nil
      auto-revert-stop-on-user-input nil)

(setq-default mouse-yank-at-point t)
```


<a id="orgca8ddee"></a>

## tab缩进

```emacs-lisp
(setq-default indent-tabs-mode t)
;; Making electric-indent behave sanely
(setq-default electric-indent-inhibit t)
```


<a id="org2fa64f1"></a>

# 包管理器 elpaca

安装 elpaca

```emacs-lisp
(defvar elpaca-installer-version 0.7)
(defvar elpaca-directory (expand-file-name "elpaca/" user-emacs-directory))
(defvar elpaca-builds-directory (expand-file-name "builds/" elpaca-directory))
(defvar elpaca-repos-directory (expand-file-name "repos/" elpaca-directory))
(defvar elpaca-order '(elpaca :repo "https://github.com/progfolio/elpaca.git"
                              :ref nil :depth 1
                              :files (:defaults "elpaca-test.el" (:exclude "extensions"))
                              :build (:not elpaca--activate-package)))
(let* ((repo  (expand-file-name "elpaca/" elpaca-repos-directory))
       (build (expand-file-name "elpaca/" elpaca-builds-directory))
       (order (cdr elpaca-order))
       (default-directory repo))
  (add-to-list 'load-path (if (file-exists-p build) build repo))
  (unless (file-exists-p repo)
    (make-directory repo t)
    (when (< emacs-major-version 28) (require 'subr-x))
    (condition-case-unless-debug err
        (if-let ((buffer (pop-to-buffer-same-window "*elpaca-bootstrap*"))
                 ((zerop (apply #'call-process `("git" nil ,buffer t "clone"
                                                 ,@(when-let ((depth (plist-get order :depth)))
                                                     (list (format "--depth=%d" depth) "--no-single-branch"))
                                                 ,(plist-get order :repo) ,repo))))
                 ((zerop (call-process "git" nil buffer t "checkout"
                                       (or (plist-get order :ref) "--"))))
                 (emacs (concat invocation-directory invocation-name))
                 ((zerop (call-process emacs nil buffer nil "-Q" "-L" "." "--batch"
                                       "--eval" "(byte-recompile-directory \".\" 0 'force)")))
                 ((require 'elpaca))
                 ((elpaca-generate-autoloads "elpaca" repo)))
            (progn (message "%s" (buffer-string)) (kill-buffer buffer))
          (error "%s" (with-current-buffer buffer (buffer-string))))
      ((error) (warn "%s" err) (delete-directory repo 'recursive))))
  (unless (require 'elpaca-autoloads nil t)
    (require 'elpaca)
    (elpaca-generate-autoloads "elpaca" repo)
    (load "./elpaca-autoloads")))
(add-hook 'after-init-hook #'elpaca-process-queues)
(elpaca `(,@elpaca-order))
```

添加 use-package 支持

```emacs-lisp
;; Install use-package support
(elpaca elpaca-use-package
  ;; Enable use-package :ensure support for Elpaca.
  (elpaca-use-package-mode))
;; Block until current queue processed.
(elpaca-wait)
```


<a id="org25a82f8"></a>

# Evil Mode

```emacs-lisp
(use-package evil
  :ensure t
  :init
  (setq evil-want-integration t
        evil-want-keybinding nil
        evil-vsplit-window-right t
        evil-split-window-below t)
  :config
  (evil-mode)

  (define-key evil-insert-state-map (kbd "C-g") 'evil-normal-state)
  (define-key evil-insert-state-map (kbd "C-h") 'evil-delete-backward-char-and-join)

  (evil-global-set-key 'motion "j" 'evil-next-visual-line)
  (evil-global-set-key 'motion "k" 'evil-previous-visual-line)

  (evil-set-initial-state 'message-buffer-mode 'normal)
  (evil-set-initial-state 'dashboard-mode 'normal))

(use-package evil-commentary
  :ensure t
  :after (evil)
  :config
  (evil-commentary-mode))

(use-package evil-surround
  :ensure t
  :after evil
  :config
  (global-evil-surround-mode 1))

(use-package evil-collection
  :after evil
  :ensure t
  :config
  (evil-collection-init))
```


<a id="org2a4a718"></a>

# 撤销 undo-tree

```emacs-lisp
(use-package undo-tree
  :ensure t
  :init
  (global-undo-tree-mode)
  (setq evil-undo-system 'undo-redo))
```


<a id="org1a855f0"></a>

# General 键绑定

```emacs-lisp
(use-package general
  :ensure t
  :config				
  (general-evil-setup t)	      

  (general-create-definer xyz/leader-keys
    :keymaps '(normal insert visual emacs)
    :prefix "SPC"
    :global-prefix "M-SPC")

(xyz/leader-keys
 "SPC" '(counsel-M-x :wk "M-x")
 "a" '(xyz-avy/body :wk "avy")
 "b" '(xyz-buffer/body :wk "buffer")
 "f" '(xyz-file/body :wk "file")
 "w" '(xyz-window/body :wk "font")))

```


<a id="orgcd6699b"></a>

# Hydra

定义更多的快捷键，解决键位不够的问题

```emacs-lisp
(use-package hydra
  :ensure t
  :after general
  :hook (emacs-lisp-mode . hydra-add-imenu)
  :init
  (setq hydra-is-helpful t))

(defhydra xyz-buffer (:color blue :columns 3)
  "
  Buffer
  Switch                 ^Kill          Split
  --------------------------------------------------
  _a_: ace-window        _k_: kill      _2_: below  
  _b_: switch buffer                    _3_: right
  _n_: next buffer
  _p_: prev buffer
  --------------------------------------------------
  "
  ("2" split-window-below)
  ("3" split-window-right)
  ("a" ace-window)
  ("b" counsel-switch-buffer)
  ("k" kill-this-buffer)
  ("n" next-buffer)
  ("p" previous-buffer))

(defhydra xyz-file (:color blue)
  "File"
  ("f" counsel-find-file "find")
  ("s" save-buffer "save")
  ("r" rename-file "rename")
  ("e" (find-file "~/.emacs.d/config.org") "emacs config"))

(defhydra xyz-window ()
  "window"
  ("h" windmove-left "<-")
  ("j" windmove-down "v")
  ("k" windmove-up "^")
  ("l" windmove-right "->")
  ("c" centered-window-mode "center")
  ("a" (lambda ()
         (interactive)
         (ace-window 1)
         (add-hook 'ace-window-end-once-hook
                   'xyz-window/body)) "ace1")
  ("v" (lambda ()
         (interactive)
         (split-window-right)
         (windmove-right)) "split r")
  ("x" (lambda ()
         (interactive)
         (split-window-below)
         (windmove-down)) "split b")
  ("s" (lambda ()
         (interactive)
         (ace-window 4)
         (add-hook 'ace-window-end-once-hook
                   'xyz-window/body)) "ace4")
  ("S" save-buffer "save")
  ("d" delete-window "delete")
  ("D" (lambda ()
         (interactive)
         (ace-window 16)
         (add-hook 'ace-window-end-once-hook
                   'xyz-window/body)) "ace16")
  ("o" delete-other-windows "delete other")
  ("-" text-scale-decrease "out")
  ("=" text-scale-increase "in"))
```


<a id="orgb73b508"></a>

# 编辑


<a id="org3d6d067"></a>

## 多光标编辑

```emacs-lisp
(use-package multiple-cursors		
  :ensure t)

(defhydra xyz-multiple-cursors (:hint nil)
  "
 Up^^             Down^^           Miscellaneous           % 2(mc/num-cursors) cursor%s(if (> (mc/num-cursors) 1) \"s\" \"\")
------------------------------------------------------------------
 [_p_]   Next     [_n_]   Next     [_l_] Edit lines  [_0_] Insert numbers
 [_P_]   Skip     [_N_]   Skip     [_a_] Mark all    [_A_] Insert letters
 [_M-p_] Unmark   [_M-n_] Unmark   [_s_] Search      [_q_] Quit
 [_|_] Align with input CHAR       [Click] Cursor at point"
  ("l" mc/edit-lines :exit t)
  ("a" mc/mark-all-like-this :exit t)
  ("n" mc/mark-next-like-this)
  ("N" mc/skip-to-next-like-this)
  ("M-n" mc/unmark-next-like-this)
  ("p" mc/mark-previous-like-this)
  ("P" mc/skip-to-previous-like-this)
  ("M-p" mc/unmark-previous-like-this)
  ("|" mc/vertical-align)
  ("s" mc/mark-all-in-region-regexp :exit t)
  ("0" mc/insert-numbers :exit t)
  ("A" mc/insert-letters :exit t)
  ("<mouse-1>" mc/add-cursor-on-click)
  ;; Help with click recognition in this hydra
  ("<down-mouse-1>" ignore)
  ("<drag-mouse-1>" ignore)
  ("q" nil))
```


<a id="org1bcf79f"></a>

## 注释

```emacs-lisp

```


<a id="org37e2d16"></a>

## 代码折叠


<a id="org452917a"></a>

# Which-key

```emacs-lisp
(use-package which-key
  :ensure t
  :config
  (which-key-mode)
  (which-key-setup-minibuffer))
```


<a id="org578ec13"></a>

# 字体

```emacs-lisp
(set-face-attribute 'default nil
                    :font "Hack Nerd Font"
                    :height 180
                    :weight 'medium)
(set-face-attribute 'variable-pitch nil
                    :font "Hack Nerd Font"
                    :height 180
                    :weight 'medium)
(set-face-attribute 'fixed-pitch nil
                    :font "Hack Nerd Font"
                    :height 180
                    :weight 'medium)
(set-face-attribute 'font-lock-comment-face nil
                    :slant 'italic)
(set-face-attribute 'font-lock-keyword-face nil
                    :slant 'italic)
(add-to-list 'default-frame-alist '(font . "Hack Nerd Font-20"))
```


<a id="orgbec5e38"></a>

## 调整字体大小

```emacs-lisp
(global-set-key (kbd "<C-wheel-up>") 'text-scale-increase)
(global-set-key (kbd "<C-wheel-down>") 'text-scale-decrease)
```


<a id="orge0eb26d"></a>

## 表情 emoji

```emacs-lisp
(use-package unicode-fonts
  :ensure t
  :config
  (unicode-fonts-setup))
```


<a id="orgb44681d"></a>

## All the Icons

```emacs-lisp
(use-package all-the-icons
  :ensure t
  :if (display-graphic-p))
```


<a id="org522895f"></a>

## Nerd Icons

```emacs-lisp
(use-package nerd-icons
  :ensure t)
```


<a id="org4a736dc"></a>

## Fonts

```emacs-lisp
(defun xyz-setup-fonts ()
  "Setup fonts."
  (interactive)
  (when (display-graphic-p)
    ;; Set default font
    (when (find-font (font-spec :name "Hack")
                     (set-face-attribute 'default nil
                                         :family "Hack"
                                         :height 180)))

    ;; Set mode-line font
    (when (find-font (font-spec :name "Hack Nerd Font")
                     (progn
                       (set-face-attribute 'mode-line nil :family "Hack Nerd Font" :height 180)
                       (when (facep 'mode-line-active)
                         (set-face-attribute 'mode-line-active nil :family "Hack Nerd Font" :height 180))
                       (set-face-attribute 'mode-line-inactive nil :family "Hack Nerd Font" :height 180)))))

  ;; Specify font for all unicode characters
  (when (find-font (font-spec :name "Segoe UI")
                   (set-fontset-font t 'symbol (font-spec :family "Segoe UI") nil 'prepend)))

  ;; Specify font for Chinese characters
  (when (find-font (font-spec :name "LXGW WenKai")
                   (progn
                     (setq face-font-rescale-alist `((,"LXGW WenKai" . 1.3)))
                     (set-fontset-font t 'han (font-spec :family "LXGW WenKai"))))))

(xyz-setup-fonts)
```


<a id="org46b6a4b"></a>

# UI


<a id="org05d7874"></a>

## 关闭菜单栏，工具栏，滚动条

```emacs-lisp
(menu-bar-mode -1)
(tool-bar-mode -1)
(scroll-bar-mode -1)
```


<a id="org45872da"></a>

## 显示行号

```emacs-lisp
(global-display-line-numbers-mode 1)
(global-visual-line-mode t)

;; 相对行号
(use-package linum-relative
  :ensure t
  :config
  (setq linum-relative-backend 'display-line-numbers-mode))
```


<a id="org2b04c86"></a>

## 高亮当前行

```emacs-lisp
(use-package hl-line
  :ensure nil
  :hook ((after-init . global-hl-line-mode)
         ((dashboard-mode eshell-mode shell-mode term-mode vterm-mode) .
          (lambda () (setq-local global-hl-line-mode nil)))))
```


<a id="org84dfb5e"></a>

## Theme

多换几种颜色，让眼睛舒服一些

```emacs-lisp
(use-package doom-themes
  :ensure t
  :config
  (setq doom-themes-enable-bold nil
        doom-themes-enable-italic t)
  (doom-themes-treemacs-config)
  (doom-themes-org-config))

(use-package solarized-theme
  :ensure t
  :config
  (setq solarized-use-variable-pitch nil
        solarized-high-contrast-mode-line t
        solarized-use-less-bold t
        solarized-use-more-italic t
        solarized-scale-markdown-headlines t))

(use-package nano-theme   ;; org-mode and markdown
  :ensure t)

(use-package color-theme-sanityinc-tomorrow
  :ensure t)

(use-package tron-legacy-theme
  :ensure t
  :config
  (setq tron-legacy-theme-vivid-cursor t))

(use-package kaolin-themes
  :ensure t
  :config
  (kaolin-treemacs-theme))

(use-package modus-themes
  :ensure t)

(load-theme 'doom-badger t)
```


<a id="org28c705b"></a>

### 切换主题

```emacs-lisp
(defvar xyz-light-themes '(solarized-light
                           nano-light
                           color-theme-sanityinc-tomorrow-day
                           kaolin-light
                           modus-operandi-tinted
                           modus-operandi-deuteranopia
                           doom-ayu-light
                           doom-earl-grey
                           doom-feather-light
                           doom-flatwhite ;; org-mode
                           doom-oksolar-light
                           doom-solarized-light))
(defvar xyz-dark-themes '(solarized-dark
                          nano-dark
                          color-theme-sanityinc-tomorrow-night
                          color-theme-sanityinc-tomorrow-eighties
                          tron-legacy
                          kaolin-aurora
                          kaolin-bubblegum
                          kaolin-eclipse
                          modus-vivendi-deuteranopia
                          doom-1337
                          doom-badger
                          doom-bluloco-dark
                          doom-city-lights
                          doom-dracula
                          doom-feather-dark
                          doom-moonlight
                          doom-palenight
                          doom-tokyo-night
                          doom-vibrant
                          doom-wilmersdorf))
```


<a id="org19904ba"></a>

## modeline

```emacs-lisp
(use-package doom-modeline
  :ensure t
  :init
  (doom-modeline-mode 1)
  :config
  (setq doom-modeline-height 35
        doom-modeline-icon t
        doom-modeline-major-mode-icon t ;; 用icon显示major-mode
        doom-modeline-major-mode-color-icon t
        doom-modeline-lsp-icon t
        doom-modeline-buffer-name t)
  (setq doom-modeline-enable-word-count t
        doom-modeline-continuous-word-count-modes '(markdown-mode gfm-mdoe org-mode)))
```


<a id="org11e2e24"></a>

## 透明度

```emacs-lisp
(add-to-list 'default-frame-alist '(alpha-background . 90))
```


<a id="org8556446"></a>

# Dashboard

```emacs-lisp
;; 关闭默认的欢迎界面
(setq inhibit-startup-screen t)

(use-package dashboard
  :ensure t
  :config
  (setq initial-buffer-choice (lambda () (get-buffer-create dashboard--buffer-name))) ;; Daemon

  (setq dashboard-banner-logo-title "Welcome to Emacs")
  (setq dashboard-startup-banner 'official) ;; 也可以自定义图片
  (setq dashboard-items '((recents  . 7)   ;; 显示最近的文件
                          (projects . 7)   ;; 显示最近的项目
                          (agenda   . 7))) ;; 显示最近的议程

  (add-hook 'elpaca-after-init-hook #'dashboard-insert-startupify-lists)
  (add-hook 'elpaca-after-init-hook #'dashboard-initialize)

  (setq dashboard-projects-backend 'projectile)
  (setq dashboard-projects-switch-function 'counsel-projectile-switch-project-by-name)

  (dashboard-setup-startup-hook)

  (setq dashboard-center-content t)

  (setq dashboard-display-icons-p t
        dashboard-icon-type 'nerd-icons
        dashboard-set-file-icons t))
```


<a id="org48d203c"></a>

# Custom file

```emacs-lisp
(setq custom-nw-file (expand-file-name "custom-nw.el" user-emacs-directory))
(setq custom-gui-file (expand-file-name "custom-gui.el" user-emacs-directory))

(if (display-graphic-p)
    (progn
      (setq custom-file custom-gui-file)
                                        ; (add-to-list 'default-frame-alist '(ns-appearance . dark)) ; macOS 下让窗口使用暗色主题
      ;; other settings
      )
  (progn
    (setq custom-file custom-nw-file)
    ;; other settings
    ))

(load custom-file)
```


<a id="org8691a72"></a>

# 自动补全


<a id="org14921a4"></a>

## company

```emacs-lisp
(use-package company
  :ensure t
  :init
  (global-company-mode)
  :config
  (setq company-require-match nil) ; 允许输入与候选字符不匹配的字符
  (setq company-minimum-prefix-length 1) ; 只需敲 1 个字母就开始进行自动补全
  (setq company-tooltip-align-annotations t)
  (setq company-idle-delay 0.0)
  (setq company-echo-delay 0)
  (setq company-show-numbers t) ;; 给选项编号 (按快捷键 M-1、M-2 等等来进行选择).
  (setq company-selection-wrap-around t)
  (setq company-transformers '(company-sort-by-occurrence))    ;; 根据选择的频率进行排序
  (setq company-backends '((company-dabbrev
                            company-keywords
                            company-files
                            company-capf :with company-yasnippet)))

  (define-key company-active-map (kbd "C-n") 'company-select-next)
  (define-key company-active-map (kbd "C-p") 'company-select-previous))

(use-package company-box
  :ensure t
  :after company
  :hook (company-mode . company-box-mode))
```


<a id="org9617b63"></a>

## 代码片段 yasnippet

```emacs-lisp
(use-package yasnippet
  :ensure t
  :hook
  ((prog-mode . yas-minor-mode)
   (text-mode . yas-minor-mode))
  :config
  (yas-reload-all)
  (defun company-mode/backend-with-yas (backend)
    (if (and (listp backend) (member 'company-yasnippet backend))
        backend
      (append (if (consp backend) backend (list backend))
              '(:with company-yasnippet))))
  (setq company-backends (mapcar #'company-mode/backend-with-yas company-backends))
  (define-key yas-minor-mode-map [(tab)] nil)
  (define-key yas-minor-mode-map (kbd "TAB") nil)
  (define-key yas-minor-mode-map (kbd "<tab>") nil)
  :bind
  (:map yas-minor-mode-map ("S-<tab>" . yas-expand)))

(use-package yasnippet-snippets
  :ensure t
  :after yasnippet)
```


<a id="orgd69885e"></a>

## 无序排列

```emacs-lisp
(use-package orderless
  :ensure t
  :config
  (setq completion-styles '(orderless basic)
        completion-category-overrides '((file (styles basic partial-completion)))))
;; 在 company 中禁用 orderless
;; We follow a suggestion by company maintainer u/hvis:
;; https://www.reddit.com/r/emacs/comments/nichkl/comment/gz1jr3s/
(defun company-completion-styles (capf-fn &rest args)
  (let ((completion-styles '(basic partial-completion)))
    (apply capf-fn args)))

(advice-add 'company-capf :around #'company-completion-styles)
```


<a id="orgc3f5acb"></a>

# Ivy, counsel

```emacs-lisp
(use-package counsel
  :ensure t)

(use-package ivy
  :ensure t
  :bind
  (("C-s" . 'swiper-isearch)
   ("M-x" . 'counsel-M-x)
   ("C-x C-f" . 'counsel-find-file)
   ("C-h f" . 'counsel-describe-function)
   ("C-h v" . 'counsel-describe-variable)
   ("C-x b" . 'ivy-switch-buffer))
  :config
  (ivy-mode 1)
  (counsel-mode 1))
```


<a id="orgeecce17"></a>

## ivy-rich

```emacs-lisp
(use-package ivy-rich
  :after ivy
  :ensure t
  :init
  (ivy-rich-mode 1))
```


<a id="org1e47c3a"></a>

# avy

使用基于字符的决策树跳转到可见文本

```emacs-lisp
(use-package avy
  :ensure t
  :hook
  (after-init . avy-setup-default)
  :config
  (setq avy-all-windows nil
        avy-all-windows-alt t
        avy-background t
        avy-style 'pre))

(use-package ivy-avy
  :ensure t)

(defhydra xyz-avy (:exit q :hint nil)
  "
 Line^^       Region^^        Goto
----------------------------------------------------------
 [_y_] yank   [_Y_] yank      [_c_] timed char  [_C_] char
 [_m_] move   [_M_] move      [_w_] word        [_W_] any word
 [_k_] kill   [_K_] kill      [_l_] line        [_L_] end of line"
  ("c" avy-goto-char-timer)
  ("C" avy-goto-char)
  ("w" avy-goto-word-1)
  ("W" avy-goto-word-0)
  ("l" avy-goto-line)
  ("L" avy-goto-end-of-line)
  ("m" avy-move-line)
  ("M" avy-move-region)
  ("k" avy-kill-whole-line)
  ("K" avy-kill-region)
  ("y" avy-copy-line)
  ("Y" avy-copy-region))
```


<a id="org0f233fe"></a>

# Helpful

```emacs-lisp
(use-package helpful
  :ensure t
  :demand t
  :config
  (setq counsel-describe-function-function #'helpful-callable
        counsel-describe-variable-function #'helpful-variable))
```


<a id="org730540e"></a>

# 窗口


<a id="orge21550d"></a>

## 快速切换

```emacs-lisp
(use-package ace-window
  :ensure t
  :bind (("C-x o" . 'ace-window)))

```


<a id="orgb8bedae"></a>

## 调整大小

```emacs-lisp
(use-package zoom
  :ensure t
  :init
  (zoom-mode t))
```


<a id="orge28c2af"></a>

## 居中窗口

```emacs-lisp
(use-package centered-window
  :ensure t
  :bind ("C-x c" . centered-window-mode))
```


<a id="org77ae833"></a>

# Rainbow


<a id="org8a8d4c1"></a>

## rainbow mode

```emacs-lisp
(use-package rainbow-mode
  :ensure t
  :hook
  ((org-mode prog-mode) . rainbow-mode))
```


<a id="org68c533a"></a>

## rainbow delimiters

```emacs-lisp
(use-package rainbow-delimiters
  :ensure t
  :hook
  (prog-mode . rainbow-delimiters-mode))
```


<a id="orgee3ed32"></a>

# Org

```emacs-lisp
(add-hook 'org-mode-hook #'(lambda ()
                             (electric-pair-local-mode -1)))

(use-package org-cliplink
  :ensure t)
```


<a id="org3edd2d7"></a>

## 生成目录

```emacs-lisp
(use-package toc-org
  :ensure t
  :commands toc-org-enable
  :init
  (add-hook 'org-mode-hook 'toc-org-enable))
```


<a id="orgb80611e"></a>

## 美化 org

```emacs-lisp
(use-package org-modern
  :ensure t
  :hook
  ((org-mode . org-modern-mode)
   (org-agenda-finalize . org-modern-agenda))
  :config
  (setq org-auto-align-tags nil
        org-tags-column 0
        org-hide-emphasis-markers t
        org-pretty-entities t
        org-agenda-tags-column 0))
```


<a id="org02db299"></a>

## 隐藏 modeline

```emacs-lisp
(use-package hide-mode-line
  :ensure t
  :hook
  (((treemacs-mode
     eshell-mode shell-mode
     term-mode vterm-mode) . turn-on-hide-mode-line-mode)
   (dired-mode . (lambda ()
                   (and (bound-and-true-p hide-mode-line-mode)
                        (turn-off-hide-mode-line-mode))))))
```


<a id="org68d0d51"></a>

## LaTeX 预览

```emacs-lisp
(use-package org-auctex
  :ensure (:type git :host github :repo
                 "karthink/org-auctex")
  :hook (org-mode . org-auctex-mode))
```


<a id="org2f845ff"></a>

## 日程

```emacs-lisp
 ;; Hydra for org agenda (graciously taken from Spacemacs)
(defhydra xyz-org-agenda (:pre (setq which-key-inhibit t)
                               :post (setq which-key-inhibit nil)
                               :hint none)
  "
Org agenda (_q_uit)

^Clock^      ^Visit entry^              ^Date^             ^Other^
^-----^----  ^-----------^------------  ^----^-----------  ^-----^---------
_ci_ in      _SPC_ in other window      _ds_ schedule      _gr_ reload
_co_ out     _TAB_ & go to location     _dd_ set deadline  _._  go to today
_cq_ cancel  _RET_ & del other windows  _dt_ timestamp     _gd_ go to date
_cj_ jump    _o_   link                 _+_  do later      ^^
^^           ^^                         _-_  do earlier    ^^
^^           ^^                         ^^                 ^^
^View^          ^Filter^                 ^Headline^         ^Toggle mode^
^----^--------  ^------^---------------  ^--------^-------  ^-----------^----
_vd_ day        _ft_ by tag              _ht_ set status    _tf_ follow
_vw_ week       _fr_ refine by tag       _hk_ kill          _tl_ log
_vt_ fortnight  _fc_ by category         _hr_ refile        _ta_ archive trees
_vm_ month      _fh_ by top headline     _hA_ archive       _tA_ archive files
_vy_ year       _fx_ by regexp           _h:_ set tags      _tr_ clock report
_vn_ next span  _fd_ delete all filters  _hp_ set priority  _td_ diaries
_vp_ prev span  ^^                       ^^                 ^^
_vr_ reset      ^^                       ^^                 ^^
^^              ^^                       ^^                 ^^
"
  ;; Entry
  ("hA" org-agenda-archive-default)
  ("hk" org-agenda-kill)
  ("hp" org-agenda-priority)
  ("hr" org-agenda-refile)
  ("h:" org-agenda-set-tags)
  ("ht" org-agenda-todo)
  ;; Visit entry
  ("o"   link-hint-open-link :exit t)
  ("<tab>" org-agenda-goto :exit t)
  ("TAB" org-agenda-goto :exit t)
  ("SPC" org-agenda-show-and-scroll-up)
  ("RET" org-agenda-switch-to :exit t)
  ;; Date
  ("dt" org-agenda-date-prompt)
  ("dd" org-agenda-deadline)
  ("+" org-agenda-do-date-later)
  ("-" org-agenda-do-date-earlier)
  ("ds" org-agenda-schedule)
  ;; View
  ("vd" org-agenda-day-view)
  ("vw" org-agenda-week-view)
  ("vt" org-agenda-fortnight-view)
  ("vm" org-agenda-month-view)
  ("vy" org-agenda-year-view)
  ("vn" org-agenda-later)
  ("vp" org-agenda-earlier)
  ("vr" org-agenda-reset-view)
  ;; Toggle mode
  ("ta" org-agenda-archives-mode)
  ("tA" (org-agenda-archives-mode 'files))
  ("tr" org-agenda-clockreport-mode)
  ("tf" org-agenda-follow-mode)
  ("tl" org-agenda-log-mode)
  ("td" org-agenda-toggle-diary)
  ;; Filter
  ("fc" org-agenda-filter-by-category)
  ("fx" org-agenda-filter-by-regexp)
  ("ft" org-agenda-filter-by-tag)
  ("fr" org-agenda-filter-by-tag-refine)
  ("fh" org-agenda-filter-by-top-headline)
  ("fd" org-agenda-filter-remove-all)
  ;; Clock
  ("cq" org-agenda-clock-cancel)
  ("cj" org-agenda-clock-goto :exit t)
  ("ci" org-agenda-clock-in :exit t)
  ("co" org-agenda-clock-out)
  ;; Other
  ("q" nil :exit t)
  ("gd" org-agenda-goto-date)
  ("." org-agenda-goto-today)
  ("gr" org-agenda-redo)) 
```


<a id="org3810aca"></a>

## Org Roam

```emacs-lisp
(use-package org-roam
  :ensure t
  :init
  (setq org-roam-v2-ack t)
  :config
  (setq org-roam-directory "~/Org/Roam")
  (org-roam-db-autosync-enable))

(use-package org-roam-ui
  :ensure t
  :bind ("C-c n u" . org-roam-ui-mode))
```


<a id="org8829159"></a>

## Hydra

```emacs-lisp
(defhydra xyz-org ()
  "org"
  ("a" org-agenda "agenda")
  ("l" org-latex-preview "latex preview")
  ("p" org-cliplink "cliplink")
  ("rf" org-roam-node-find "roam node find")
  ("rg" org-roam-graph "roam graph")
  ("ri" org-roam-node-insert "roam node insert"))
```


<a id="orgb7f581f"></a>

# 文件管理

```emacs-lisp
(setq dired-auto-revert-buffer t)

(defhydra xyz-dired (:hint nil :color pink)
  "
_+_ mkdir          _v_iew           _m_ark             _(_ details        _i_nsert-subdir    wdired
_C_opy             _O_ view other   _U_nmark all       _)_ omit-mode      _$_ hide-subdir    C-x C-q : edit
_D_elete           _o_pen other     _u_nmark           _l_ redisplay      _w_ kill-subdir    C-c C-c : commit
_R_ename           _M_ chmod        _t_oggle           _g_ revert buf     _e_ ediff          C-c ESC : abort
_Y_ rel symlink    _G_ chgrp        _E_xtension mark   _s_ort             _=_ pdiff
_S_ymlink          ^ ^              _F_ind marked      _._ toggle hydra   \\ flyspell
_r_sync            ^ ^              ^ ^                ^ ^                _?_ summary
_z_ compress-file  _A_ find regexp
_Z_ compress       _Q_ repl regexp

T - tag prefix
"
  ("\\" dired-do-ispell)
  ("(" dired-hide-details-mode)
  (")" dired-omit-mode)
  ("+" dired-create-directory)
  ("=" diredp-ediff)         ;; smart diff
  ("?" dired-summary)
  ("$" diredp-hide-subdir-nomove)
  ("A" dired-do-find-regexp)
  ("C" dired-do-copy)        ;; Copy all marked files
  ("D" dired-do-delete)
  ("E" dired-mark-extension)
  ("e" dired-ediff-files)
  ("F" dired-do-find-marked-files)
  ("G" dired-do-chgrp)
  ("g" revert-buffer)        ;; read all directories again (refresh)
  ("i" dired-maybe-insert-subdir)
  ("l" dired-do-redisplay)   ;; relist the marked or singel directory
  ("M" dired-do-chmod)
  ("m" dired-mark)
  ("O" dired-display-file)
  ("o" dired-find-file-other-window)
  ("Q" dired-do-find-regexp-and-replace)
  ("R" dired-do-rename)
  ("r" dired-do-rsynch)
  ("S" dired-do-symlink)
  ("s" dired-sort-toggle-or-edit)
  ("t" dired-toggle-marks)
  ("U" dired-unmark-all-marks)
  ("u" dired-unmark)
  ("v" dired-view-file)      ;; q to exit, s to search, = gets line #
  ("w" dired-kill-subdir)
  ("Y" dired-do-relsymlink)
  ("z" diredp-compress-this-file)
  ("Z" dired-do-compress)
  ("q" nil)
  ("." nil :color blue))

(define-key dired-mode-map "." 'hydra-dired/body)
```


<a id="orgd0e5d21"></a>

## 图标

```emacs-lisp
(use-package nerd-icons-dired  ;; 文件图标
  :ensure t
  :defer t
  :hook
  (dired-mode . nerd-icons-dired-mode))
```


<a id="org63ae5bb"></a>

## 预览

```emacs-lisp
(use-package dired-preview
  :ensure t
  :after dired)
```


<a id="orgaff3674"></a>

## ranger

```emacs-lisp
(use-package ranger
  :ensure t
  )
```


<a id="orgdb15e64"></a>

## treemacs

```emacs-lisp
(use-package treemacs
  :ensure t
  :defer t
  :config
  (setq treemacs-width 35)
  (treemacs-follow-mode t)
  :bind
  (:map global-map
        ("M-0"       . treemacs-select-window)
        ("C-x t 1"   . treemacs-delete-other-windows)
        ("C-x t t"   . treemacs)
        ("C-x t B"   . treemacs-bookmark)
        ("C-x t C-t" . treemacs-find-file)
        ("C-x t M-t" . treemacs-find-tag)))

(use-package treemacs-nerd-icons
  :ensure t
  :config
  (treemacs-load-theme "nerd-icons"))

(use-package treemacs-evil
  :ensure t
  :after (treemacs evil))

(use-package treemacs-projectile
  :ensure t
  :after (treemacs projectile))

(defhydra xyz-treemacs ()
  "treemacs"
  ("t" treemacs "tree")
  ("f" treemacs-find-file "find file")
  ("t" treemacs-find-tag "find tag"))
```


<a id="orgff4fb9b"></a>

# LSP

```emacs-lisp
(use-package lsp-mode
  :ensure t
  :commands (lsp lsp-deferred)
  :config
  (setq lsp-completion-provider :none)) ;; 阻止 lsp 重新设置 company-backend 而覆盖我们 yasnippet 的设置

(use-package lsp-ui
  :ensure t
  :after (lsp-mode)
  :commands lsp-ui-mode
  :config
  (define-key lsp-ui-mode-map [remap xref-find-definitions] #'lsp-ui-peek-find-definitions)
  (define-key lsp-ui-mode-map [remap xref-find-references] #'lsp-ui-peek-find-references)

  (setq lsp-ui-doc-position 'top
        lsp-ui-doc-side 'right)

  (setq lsp-modeline-diagnostics-enable t) ; 在modeline上显示错误统计
  ;; enable which-key
  (with-eval-after-load 'lsp-mode
    (add-hook 'lsp-mode-hook #'lsp-enable-which-key-integration))
  )

(use-package lsp-ivy
  :ensure t
  :after (lsp-mode ivy))

(use-package lsp-treemacs
  :after (treemacs lsp)
  :ensure t)

(defhydra xyz-lsp (:exit t :hint nil)
  "
 Buffer^^               Server^^                   Symbol
-------------------------------------------------------------------------------------
 [_f_] format           [_M-r_] restart            [_d_] declaration  [_i_] implementation  [_o_] documentation
 [_m_] imenu            [_S_]   shutdown           [_D_] definition   [_t_] type            [_r_] rename
 [_x_] execute action   [_M-s_] describe session   [_R_] references   [_s_] signature"
  ("d" lsp-find-declaration)
  ("D" lsp-ui-peek-find-definitions)
  ("R" lsp-ui-peek-find-references)
  ("i" lsp-ui-peek-find-implementation)
  ("t" lsp-find-type-definition)
  ("s" lsp-signature-help)
  ("o" lsp-describe-thing-at-point)
  ("r" lsp-rename)

  ("f" lsp-format-buffer)
  ("m" lsp-ui-imenu)
  ("x" lsp-execute-code-action)

  ("M-s" lsp-describe-session)
  ("M-r" lsp-restart-workspace)
  ("S" lsp-shutdown-workspace))
```


<a id="org4cdb764"></a>

# Flycheck

```emacs-lisp
(use-package flycheck
  :ensure t
  :defer t
  :config
  (setq truncate-lines nil)
  :hook
  (prog-mode . flycheck-mode))

(defhydra xyz-flycheck
  (:pre (flycheck-list-errors)
        :post (quit-windows-on "*Flycheck errors*")
        :hint nil)
  "Errors"
  ("f" flycheck-error-list-set-filter "Filter")
  ("j" flycheck-next-error "Next")
  ("k" flycheck-previous-error "Previous")
  ("gg" flycheck-first-error "First")
  ("G" (progn (goto-char (point-max)) (flycheck-previous-error)) "Last")
  ("q" nil))
```


<a id="org8ea124e"></a>

# Projectile

```emacs-lisp
(use-package projectile
  :ensure t
  :config
  (projectile-mode))

(use-package counsel-projectile
  :ensure t
  :after (counsel projectile)
  :bind
  ("C-c pf" . counsel-projectile-find-file)
  ("C-c pd" . counsel-projectile-find-dir)
  :init (counsel-projectile-mode))

(defhydra xyz-projectile (:color teal
                            :columns 4)
  "Projectile"
  ("f"   projectile-find-file                "Find File")
  ("r"   projectile-recentf                  "Recent Files")
  ("z"   projectile-cache-current-file       "Cache Current File")
  ("x"   projectile-remove-known-project     "Remove Known Project")

  ("d"   projectile-find-dir                 "Find Directory")
  ("b"   projectile-switch-to-buffer         "Switch to Buffer")
  ("c"   projectile-invalidate-cache         "Clear Cache")
  ("X"   projectile-cleanup-known-projects   "Cleanup Known Projects")

  ("o"   projectile-multi-occur              "Multi Occur")
  ("s"   projectile-switch-project           "Switch Project")
  ("k"   projectile-kill-buffers             "Kill Buffers")
  ("q"   nil "Cancel" :color blue))
```


<a id="org84ff8a0"></a>

# tree-sitter

```emacs-lisp
(use-package tree-sitter
  :ensure t
  :hook
  (tree-sitter-after-on . tree-sitter-hl-mode)
  :config
  (global-tree-sitter-mode))

(use-package tree-sitter-langs
  :ensure t)
```


<a id="org46c62b9"></a>

# Git

```emacs-lisp
(use-package magit
  :ensure t)
```


<a id="org180382d"></a>

# 中文输入

```emacs-lisp
(use-package posframe
  :ensure t)

(use-package rime
  :ensure t
  :config
  (setq rime-user-data-dir "~/.local/share/fcitx5/rime")
  (setq default-input-method "rime"
        rime-show-candidate 'posframe)
  (setq rime-posframe-properties
        (list :background-color "#333333"
              :foreground-color "#dcdccc"
              :font "LXGW WenKai-20"
              :internal-border-width 10))
  (setq rime-posframe-style 'vertical)
  :custom
  (default-input-method "rime"))
```


<a id="orgab26632"></a>

# 语言支持


<a id="org8cf2449"></a>

## 前端


<a id="org15ca1c2"></a>

### Web mode

```emacs-lisp
(use-package web-mode
  :ensure t
  :mode "\\.\\(html?\\|vue\\)$"
  :config
  (setq web-mode-markup-indent-offset 2
        web-mode-css-indent-offset 2
        web-mode-code-indent-offset 2))
```


<a id="org466ee0d"></a>

### Emmet

```emacs-lisp
(use-package emmet-mode
  :ensure t
  :config
  (add-hook 'css-mode-hook 'emmet-mode))
```


<a id="org8bae9fd"></a>

### css

```emacs-lisp
(use-package css-mode
  :init
  (setq css-indent-offset 2))
```


<a id="org7aee05d"></a>

### SCSS

```emacs-lisp
(use-package scss-mode
  :ensure t
  :init
  (setq scss-compile-at-save nil))
```


<a id="org5b90c80"></a>

### js/ts

```emacs-lisp
(use-package js2-mode
  :ensure t
  :mode (("\\.js\\'" . js2-mode)
         ("\\.jsx\\'" . js2-jsx-mode))
  :hook (js2-mode . js2-highlight-unused-variables-mode)
  :init
  (setq js-indent-level 2))

(use-package js2-refactor
  :ensure t
  :config
  (add-hook 'js2-mode-hook #'js2-refactor-mode)
  (setq js2-skip-preprocessor-directives t))

(use-package typescript-mode
  :ensure t
  :mode ("\\.ts[x]\\'" . typescript-mode))

(use-package prettier-js
  :ensure t)

(use-package tide
  :ensure t
  :after (company flycheck)
  :config
  (defun setup-tide-mdoe ()
    (interactive)
    (tide-setup)
    (setq flycheck-check-syntax-automatically '(save mode-enabled))
    (eldoc-mode +1)
    (tide-hl-identifier-mode +1))
  ;; aligns annotation to the right hand side
  (setq company-tooltip-align-annotations t)

  ;; formats the buffer before saving
  (add-hook 'before-save-hook 'tide-format-before-save)

  ;; if you use typescript-mode
  (add-hook 'typescript-mode-hook #'setup-tide-mode)
  ;; if you use treesitter based typescript-ts-mode (emacs 29+)
  (add-hook 'typescript-ts-mode-hook #'setup-tide-mode)

  ;; JS
  (add-hook 'js2-mode-hook #'setup-tide-mode)
  ;; configure javascript-tide checker to run after your default javascript checker
  (flycheck-add-next-checker 'javascript-eslint 'javascript-tide 'append))
```


<a id="org6316773"></a>

### json

```emacs-lisp
(use-package json-mode
  :ensure t
  :mode "\\.json\\'")
```


<a id="orga03bc51"></a>

### 格式化

```emacs-lisp
(when (executable-find "prettier")
  (use-package prettier
    :hook ((js-mode js2-mode css-mode web-mode) . prettier-mode)
    :init
    (setq prettier-pre-warm 'none)))
```


<a id="orge728fa9"></a>

### node\_ modules

```emacs-lisp
(use-package add-node-modules-path
  :hook ((web-mode js-mode js2-mode) . add-node-modules-path))
```


<a id="org4778df5"></a>

### Vue3

```emacs-lisp
(use-package mmm-mode :ensure t)

(use-package vue-mode
  :ensure t
  :delight "V"
  :hook (vue-mode . lsp-deferred)
  :mode "\\.vue\\'"
  :config
  (setq (vue-html-extra-indent 2)))
```


<a id="orge14ca30"></a>

## C/C++

```emacs-lisp
(setq-default c-basic-offset 4)

(use-package cc-mode
  :ensure nil)

(use-package ccls
  :ensure t
  :after projectile
  :hook ((c-mdoe c++-mode) . lsp-deferred)
  :config
  (setq ccls-args nil
        ccls-executable (executable-find "ccls")))

(use-package cmake-mode
  :hook (cmake-mode . lsp-deferred)
  :mode ("CMakeLists\\.txt\\'" "\\.cmake\\'"))

(use-package cmake-font-lock
  :hook (cmake-mode . cmake-font-lock-activate))

```


<a id="orgd170cf1"></a>

## Haskell

```emacs-lisp
(use-package haskell-mode
  :ensure t)

(use-package lsp-haskell
  :ensure t
  :config
  (add-hook 'haskell-mode-hook #'lsp)
  (add-hook 'haskell-literate-mode-hook #'lsp))
```


<a id="org15e41cf"></a>

## Julia

```emacs-lisp
(use-package julia-mode
  :ensure t)

(use-package lsp-julia
  :ensure t)
```


<a id="orgc39034f"></a>

## LaTeX

```emacs-lisp
(use-package auctex
  :ensure t
  :defer t
  :mode ("\\.tex\\'" . LaTeX-mode)
  :init
  (setq TeX-parse-self t
        TeX-auto-save t
        TeX-engine 'xelatex
        TeX-save-query nil))

;; 预览数学公式
(use-package math-preview
  :ensure t
  :custom (math-preview-command "/usr/bin/math-preview"))

(use-package lsp-latex
  :ensure t
  :if (executable-find "texlab")
  :hook (LaTeX-mode . (lambda ()
                        (require 'lsp-latex)
                        (lsp-deferred)))
  :custom
  (lsp-latex-build-on-save t))

(use-package bibtex
  :ensure nil
  :hook (bibtex-mode . lsp-deferred))
```


<a id="orgd8ad6b9"></a>

## Lua

```emacs-lisp
(use-package lua-mode
  :ensure t)
```


<a id="orged482f8"></a>

## Markdown

```emacs-lisp
(use-package markdown-mode
  :ensure t
  :defer t
  :commands (markdown-mode gfm-mode)
  :init
  (setq markdown-command "pandoc"))

(use-package pandoc-mode
  :ensure t
  :after markdown-mode
  :hook (markdown-mode . pandoc-mode))

;; 生成目录
(use-package markdown-toc
  :ensure t)

(defhydra xyz-markdown (:hint nil)
  "
Formatting        C-c C-s    _s_: bold          _e_: italic     _b_: blockquote   _p_: pre-formatted    _c_: code

Headings          C-c C-t    _h_: automatic     _1_: h1         _2_: h2           _3_: h3               _4_: h4

Lists             C-c C-x    _m_: insert item   

Demote/Promote    C-c C-x    _l_: promote       _r_: demote     _u_: move up      _d_: move down

Links, footnotes  C-c C-a    _L_: link          _U_: uri        _F_: footnote     _W_: wiki-link      _R_: reference

"


  ("s" markdown-insert-bold)
  ("e" markdown-insert-italic)
  ("b" markdown-insert-blockquote :color blue)
  ("p" markdown-insert-pre :color blue)
  ("c" markdown-insert-code)

  ("h" markdown-insert-header-dwim) 
  ("1" markdown-insert-header-atx-1)
  ("2" markdown-insert-header-atx-2)
  ("3" markdown-insert-header-atx-3)
  ("4" markdown-insert-header-atx-4)

  ("m" markdown-insert-list-item)

  ("l" markdown-promote)
  ("r" markdown-demote)
  ("d" markdown-move-down)
  ("u" markdown-move-up)  

  ("L" markdown-insert-link :color blue)
  ("U" markdown-insert-uri :color blue)
  ("F" markdown-insert-footnote :color blue)
  ("W" markdown-insert-wiki-link :color blue)
  ("R" markdown-insert-reference-link-dwim :color blue))

```


<a id="org9b2baf4"></a>

## OCaml

```emacs-lisp
(let ((opam-share (ignore-errors (car (process-lines "opam" "var" "share")))))
  (when (and opam-share (file-directory-p opam-share))
    ;; Register Merlin
    (add-to-list 'load-path (expand-file-name "emacs/site-lisp" opam-share))
    (autoload 'merlin-mode "merlin" nil t nil)
    ;; Automatically start it in OCaml buffers
    (add-hook 'tuareg-mode-hook 'merlin-mode t)
    (add-hook 'caml-mode-hook 'merlin-mode t)
    ;; Use opam switch to lookup ocamlmerlin binary
    (setq merlin-command 'opam)
    ;; To easily change opam switches within a given Emacs session, you can
    ;; install the minor mode https://github.com/ProofGeneral/opam-switch-mode
    ;; and use one of its "OPSW" menus.
    ))
```


<a id="org7850fae"></a>

## Python

```emacs-lisp
(setq python-indent-offset 4)

(use-package py-isort
  :ensure t
  :hook (before-save . py-isort-before-save))

(use-package anaconda-mode
  :ensure t
  :config
  (add-hook 'python-mode-hook 'anaconda-mode)
  (add-hook 'python-mode-hook 'anaconda-eldoc-mode))

(use-package lsp-pyright
  :ensure t
  :custom (lsp-pyright-langserver-command "pyright") ;; or basedpyright
  :hook (python-mode . (lambda ()
                          (require 'lsp-pyright)
                          (lsp))))  ; or lsp-deferred

```


<a id="orgab749b8"></a>

## Rust

```emacs-lisp
(use-package rust-mode
  :ensure t
  :config
  (add-hook 'rust-mode-hook
            (lambda () (setq indent-tabs-mode nil)))

  (setq rust-format-on-save t)
  (add-hook 'rust-mode-hook
            (lambda () (prettify-symbols-mode)))

  (add-hook 'rust-mode-hook #'lsp))
```


<a id="org0e8ac59"></a>

## other

```emacs-lisp
(use-package yaml-mode
  :ensure t
  :mode "\\.\\(yml\\|yaml\\)$")
```


<a id="org6d8ee73"></a>

# TODO AI


<a id="orgd045409"></a>

# 写博客


<a id="org561bdf8"></a>

## hugo

```emacs-lisp
(use-package ox-hugo
  :ensure t
  :after ox)
```


<a id="org513912e"></a>

# 听歌

```emacs-lisp

```


<a id="orgb9a5c6b"></a>

# TODO 邮件


<a id="org85318cf"></a>

# TODO 浏览网页


<a id="orgb5fe864"></a>

# 一些有用的工具


<a id="org0550d41"></a>

## Delete the current file

```emacs-lisp
(defun delete-this-file ()
  "Delete the current file, and kill the buffer."
  (interactive)
  (unless (buffer-file-name)
    (error "No file is currently being edited"))
  (when (yes-or-no-p (format "Really delete '%s'?"
                             (file-name-nondirectory buffer-file-name)))
    (delete-file (buffer-file-name))
    (kill-this-buffer)))
```


<a id="orgf85b728"></a>

## Rename the current file

```emacs-lisp
(defun rename-this-file-and-buffer (new-name)
  "Renames both current buffer and file it's visiting to NEW-NAME."
  (interactive "sNew name: ")
  (let ((name (buffer-name))
        (filename (buffer-file-name)))
    (unless filename
      (error "Buffer '%s' is not visiting a file!" name))
    (progn
      (when (file-exists-p filename)
        (rename-file filename new-name 1))
      (set-visited-file-name new-name)
      (rename-buffer new-name))))
```


<a id="org6850e54"></a>

## 代理

```emacs-lisp
(defun enable-proxy ()
  "Enable proxy.")

(defun disable-proxy ()
  "Disable proxy.")
```


<a id="orga0118ec"></a>

## 模糊搜索 fzf

```emacs-lisp
(use-package fzf
  :ensure t
  :config
  (setq fzf/args "-x --color bw --print-query --margin=1,0 --no-hscroll"
        fzf/executable "fzf"
        fzf/git-grep-args "-i --line-number %s"
        ;; command used for `fzf-grep-*` functions
        ;; example usage for ripgrep:
        ;; fzf/grep-command "rg --no-heading -nH"
        fzf/grep-command "grep -nrH"
        ;; If nil, the fzf buffer will appear at the top of the window
        fzf/position-bottom t
        fzf/window-height 35))
```

