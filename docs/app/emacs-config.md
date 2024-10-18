
# 一些设置

``` emacs-lisp
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

## tab缩进

``` {.commonlisp org-language="emacs-lisp"}
(setq-default indent-tabs-mode t)
;; Making electric-indent behave sanely
(setq-default electric-indent-inhibit t)
```

# 包管理器 elpaca

安装 elpaca

``` {.commonlisp org-language="emacs-lisp"}
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

``` {.commonlisp org-language="emacs-lisp"}
  ;; Install use-package support
  (elpaca elpaca-use-package
    ;; Enable use-package :ensure support for Elpaca.
    (elpaca-use-package-mode))
;; Block until current queue processed.
  (elpaca-wait)
```

# Evil Mode

``` {.commonlisp org-language="emacs-lisp"}
(use-package evil
  :ensure t
  :init
  (setq evil-want-integration t
    evil-want-keybinding nil
    evil-vsplit-window-right t
    evil-split-window-below t)
  (evil-mode))

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
```

## evil-collection

``` {.commonlisp org-language="emacs-lisp"}
(use-package evil-collection
  :ensure t
  :after evil
  :config
  (evil-collection-init))
```

# 撤销 undo-tree

``` {.commonlisp org-language="emacs-lisp"}
(use-package undo-tree
  :ensure t
  :init
  (global-undo-tree-mode)
  (setq evil-undo-system 'undo-redo))
```

# General 键绑定

``` {.commonlisp org-language="emacs-lisp"}
(use-package general
  :ensure t
  :demand t
  :config             
  (general-evil-setup)          

  (general-define-key
   :states 'insert
   "C-g" 'evil-normal-state) ;; don't stretch for ESC

  (general-define-key
   :states '(normal visual motion)
   :keymaps 'override
   "SPC" 'xyz/body))
```

# Hydra

``` {.commonlisp org-language="emacs-lisp"}
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
  "
File
----------------------------------------
_f_: find       _r_: rename
_s_: save 
"
  ("f" counsel-find-file)
  ("s" save-buffer)
  ("r" rename-file))

(defhydra xyz-help (:color blue)
  "
Help
---------------------------------------
_c_: find command
_f_: find func
_k_: find key
_v_: find var 
"
  ("c" describe-command)
  ("f" describe-function)
  ("k" describe-key)
  ("v" describe-variable))

(defhydra xyz (:color blue :columns 4)
  "xyz hydra"
  ("SPC" counsel-M-x "M-x")
  ("a" xyz-avy/body "avy")
  ("b" xyz-buffer/body "buffer")
  ("f" xyz-file/body "file")
  ("h" xyz-help/body "help")
  ("o" xyz-org/body "org"))
```

# Which-key

``` {.commonlisp org-language="emacs-lisp"}
(use-package which-key
  :ensure t
  :config
  (which-key-mode)
  (which-key-setup-minibuffer))
```

# 字体

``` {.commonlisp org-language="emacs-lisp"}
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

## 调整字体大小

``` {.commonlisp org-language="emacs-lisp"}
(global-set-key (kbd "<C-wheel-up>") 'text-scale-increase)
(global-set-key (kbd "<C-wheel-down>") 'text-scale-decrease)
```

## 表情 emoji

``` {.commonlisp org-language="emacs-lisp"}
(use-package unicode-fonts
  :ensure t
  :config
  (unicode-fonts-setup))
```

## All the Icons

``` {.commonlisp org-language="emacs-lisp"}
(use-package all-the-icons
  :ensure t
  :if (display-graphic-p))
```

## Nerd Icons

``` {.commonlisp org-language="emacs-lisp"}
(use-package nerd-icons
  :ensure t)
```

## Fonts

``` {.commonlisp org-language="emacs-lisp"}
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

# UI

## 关闭菜单栏，工具栏，滚动条

``` {.commonlisp org-language="emacs-lisp"}
(menu-bar-mode -1)
(tool-bar-mode -1)
(scroll-bar-mode -1)
```

## 显示行号

``` {.commonlisp org-language="emacs-lisp"}
(global-display-line-numbers-mode 1)
(global-visual-line-mode t)
```

## 高亮当前行

``` {.commonlisp org-language="emacs-lisp"}
(use-package hl-line
  :ensure nil
  :hook ((after-init . global-hl-line-mode)
     ((dashboard-mode eshell-mode shell-mode term-mode vterm-mode) .
      (lambda () (setq-local global-hl-line-mode nil)))))
```

## Theme

``` {.commonlisp org-language="emacs-lisp"}
(use-package doom-themes
  :ensure t
  :config
  (setq doom-themes-enable-bold nil
    doom-themes-enable-italic t)
  (load-theme 'doom-badger t)
  (doom-themes-org-config))
```

### [TODO]{.todo .TODO} 切换主题 {#切换主题}

``` {.commonlisp org-language="emacs-lisp"}

```

## modeline

``` {.commonlisp org-language="emacs-lisp"}
(use-package doom-modeline
  :ensure t
  :init
  (doom-modeline-mode 1)
  :config
  (setq doom-modeline-height 25
    doom-modeline-icon t
    doom-modeline-major-mode-icon t ;; 用icon显示major-mode
    doom-modeline-major-mode-color-icon t
    doom-modeline-lsp-icon t
    doom-modeline-buffer-name t))
```

## 透明度

``` {.commonlisp org-language="emacs-lisp"}
(add-to-list 'default-frame-alist '(alpha-background . 90))
```

# Dashboard

``` {.commonlisp org-language="emacs-lisp"}
;; 关闭默认的欢迎界面
(setq inhibit-startup-screen t)

(use-package dashboard
  :ensure t
  :hook
  (dashboard-mode . (lambda () (setq-local frame-title-format nil)))
  :config
  (setq dashboard-banner-logo-title "Welcome to Emacs")
  (setq dashboard-startup-banner 'official) ;; 也可以自定义图片
  (setq dashboard-items '((recents  . 7)   ;; 显示多少个最近文件
              (bookmarks . 5)  ;; 显示多少个最近书签
              (projects . 7))) ;; 显示多少个最近项目
  (dashboard-setup-startup-hook)
  (setq dashboard-center-content t
    dashboard-vertically-center-content t)
  (setq dashboard-set-file-icons t)
  (setq dashboard-display-icons-p t)
  (setq dashboard-icon-type 'nerd-icons))
```

# Custom file

``` {.commonlisp org-language="emacs-lisp"}
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

# 自动补全

## company

``` {.commonlisp org-language="emacs-lisp"}
(use-package company
  :ensure t
  :init
  (global-company-mode)
  :config
  (setq company-minimum-prefix-length 1) ; 只需敲 1 个字母就开始进行自动补全
  (setq company-tooltip-align-annotations t)
  (setq company-idle-delay 0.0)
  (setq company-echo-delay 0)
  (setq company-show-numbers t) ;; 给选项编号 (按快捷键 M-1、M-2 等等来进行选择).
  (setq company-selection-wrap-around t)
  (setq company-transformers '(company-sort-by-occurrence)) ;; 根据选择的频率进行排序
  (define-key company-active-map (kbd "C-n") 'company-select-next)
  (define-key company-active-map (kbd "C-p") 'company-select-previous))

(use-package company-box
  :ensure t
  :after company
  :hook (company-mode . company-box-mode))
```

## 代码片段 yasnippet

``` {.commonlisp org-language="emacs-lisp"}
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

## 无序排列

``` {.commonlisp org-language="emacs-lisp"}
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

# Ivy, counsel

``` {.commonlisp org-language="emacs-lisp"}
(use-package counsel
  :ensure t)

(use-package ivy
  :ensure t
  :bind
  (("C-s" . 'swiper)
   ("C-x b" . 'ivy-switch-buffer)
   ("C-c v" . 'ivy-push-view)
   ("C-c s" . 'ivy-switch-view)
   ("C-c V" . 'ivy-pop-view)
   ("C-x C-@" . 'counsel-mark-ring); 在某些终端上 C-x C-SPC 会被映射为 C-x C-@，比如在 macOS 上，所以要手动设置
   ("C-x C-SPC" . 'counsel-mark-ring)
   :map minibuffer-local-map
   ("C-r" . counsel-minibuffer-history)
   ("M-x" . counsel-M-x)
   ("C-x C-f" . counsel-find-file))
  :config
  (ivy-mode 1)
  (counsel-mode 1))
```

## ivy-rich

``` {.commonlisp org-language="emacs-lisp"}
(use-package ivy-rich
  :after ivy
  :ensure t
  :init
  (ivy-rich-mode 1))
```

## ivy-hydra

``` {.commonlisp org-language="emacs-lisp"}
(use-package ivy-hydra
  :ensure t)
```

# avy

``` {.commonlisp org-language="emacs-lisp"}
(use-package avy
  :ensure t
  :bind
  (("C-:" . avy-goto-char)
   ("C-'" . avy-goto-char-2)
   ("M-g l" . avy-goto-line)
   ("M-g w" . avy-goto-word-1)
   ("M-g e" . avy-goto-word-0))
  :hook
  (after-init . avy-setup-default)
  :config
  (setq avy-all-windows nil
    avy-all-windows-alt t
    avy-background t
    avy-style 'pre))

(use-package ivy-avy
  :ensure t)
```

## Hydra

``` {.commonlisp org-language="emacs-lisp"}
(defhydra xyz-avy ()
  "avy"
  ("c" avy-goto-char "goto-char")
  ("l" avy-goto-line "goto-line"))
```

# Helpful

``` {.commonlisp org-language="emacs-lisp"}
(use-package helpful
  :ensure t
  :demand t)
```

# 窗口跳转

``` {.commonlisp org-language="emacs-lisp"}
(use-package ace-window
  :ensure t
  :bind (("C-x o" . 'ace-window)))
```

# Rainbow

## rainbow mode

``` {.commonlisp org-language="emacs-lisp"}
(use-package rainbow-mode
  :ensure t
  :hook
  ((org-mode prog-mode) . rainbow-mode))
```

## rainbow delimiters

``` {.commonlisp org-language="emacs-lisp"}
(use-package rainbow-delimiters
  :ensure t
  :hook
  (prog-mode . rainbow-delimiters-mode))
```

# Org

``` {.commonlisp org-language="emacs-lisp"}
(add-hook 'org-mode-hook #'(lambda ()
                 (electric-pair-local-mode -1)))
```

## 生成目录

``` {.commonlisp org-language="emacs-lisp"}
(use-package toc-org
  :ensure t
  :commands toc-org-enable
  :init
  (add-hook 'org-mode-hook 'toc-org-enable))
```

## 美化 org

``` {.commonlisp org-language="emacs-lisp"}
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

### heading的样式

``` {.commonlisp org-language="emacs-lisp"}
(use-package org-bullets
  :ensure t
  :hook 
  (org-mode . org-bullets-mode)
  :custom

  (org-ellipsis "⤵"))
```

### 隐藏 modeline

``` {.commonlisp org-language="emacs-lisp"}
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

## LaTeX 预览

``` {.commonlisp org-language="emacs-lisp"}
(use-package org-auctex
  :ensure (:type git :host github :repo
         "karthink/org-auctex")
  :hook (org-mode . org-auctex-mode))
```

## [TODO]{.todo .TODO} 待办 {#待办}

## [TODO]{.todo .TODO} 日程 {#日程}

## Org Roam

``` {.commonlisp org-language="emacs-lisp"}
(use-package org-roam
  :ensure t)

(use-package org-roam-ui
  :ensure t
  :bind ("C-c n u" . org-roam-ui-mode))
```

## Hydra

``` {.commonlisp org-language="emacs-lisp"}
(defhydra xyz-org ()
  "org"
  ("a" org-agenda "agenda")
  ("b" org-bullets-mode "bullets mode")
  ("l" org-latex-preview "latex preview"))
```

# LSP

``` {.commonlisp org-language="emacs-lisp"}
(use-package lsp-mode
  :ensure t
  :commands
  (lsp lsp-deferred)
  :config
  (setq lsp-completion-provider :none)) ;; 阻止 lsp 重新设置 company-backend 而覆盖我们 yasnippet 的设置

(use-package lsp-ui
  :ensure t
  :after (lsp-mode)
  :commands lsp-ui-mode
  :config
  (define-key lsp-ui-mode-map [remap xref-find-definitions] #'lsp-ui-peek-find-definitions)
  (define-key lsp-ui-mode-map [remap xref-find-references] #'lsp-ui-peek-find-references)
  (setq lsp-ui-doc-position 'top))

(use-package lsp-ivy
  :after (lsp-mode))

(use-package lsp-treemacs
  :after (treemacs lsp))
```

# Flycheck

``` {.commonlisp org-language="emacs-lisp"}
(use-package flycheck
  :ensure t
  :defer t
  :config
  (setq truncate-lines nil)
  :hook
  (prog-mode . flycheck-mode))
```

# Projectile

``` {.commonlisp org-language="emacs-lisp"}
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
```

# 文件管理 Dired

``` {.commonlisp org-language="emacs-lisp"}
(use-package nerd-icons-dired  ;; 文件图标
  :ensure t
  :defer t
  :hook
  (dired-mode . nerd-icons-dired-mode))
```

## 预览

``` {.commonlisp org-language="emacs-lisp"}
(use-package dired-preview
  :ensure t
  :after dired)
```

# treemacs

``` {.commonlisp org-language="emacs-lisp"}
(use-package treemacs
  :ensure t
  :defer t
  :config
  (treemacs-tag-follow-mode)
  (setq treemacs-width 30)
  :bind
  (:map global-map
    ("M-0"       . treemacs-select-window)
    ("C-x t 1"   . treemacs-delete-other-windows)
    ("C-x t t"   . treemacs)
    ("C-x t B"   . treemacs-bookmark)
    ;; ("C-x t C-t" . treemacs-find-file)
    ("C-x t M-t" . treemacs-find-tag)))

(use-package treemacs-nerd-icons
  :ensure t
  :config
  (treemacs-load-theme "nerd-icons"))

(use-package treemacs-projectile
  :ensure t
  :after (treemacs projectile))
```

# tree-sitter

``` {.commonlisp org-language="emacs-lisp"}
(use-package tree-sitter
  :ensure t
  :hook
  (tree-sitter-after-on . tree-sitter-hl-mode)
  :config
  (global-tree-sitter-mode))

(use-package tree-sitter-langs
  :ensure t)
```

# Git

``` {.commonlisp org-language="emacs-lisp"}
(use-package magit
  :ensure t)
```

# 中文输入

``` {.commonlisp org-language="emacs-lisp"}
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

# 语言支持

## C/C++

``` {.commonlisp org-language="emacs-lisp"}
(setq-default c-basic-offset 4)

(use-package cc-mode
  :ensure nil)
```

## Python

``` {.commonlisp org-language="emacs-lisp"}
(setq python-indent-offset 4)
```

## 前端

### Web mode

``` {.commonlisp org-language="emacs-lisp"}
(use-package web-mode
  :ensure t
  :mode "\\.\\(html?\\|vue\\)$"
  :config
  (setq web-mode-markup-indent-offset 2
    web-mode-css-indent-offset 2
    web-mode-code-indent-offset 2))
```

### Emmet

``` {.commonlisp org-language="emacs-lisp"}
(use-package emmet-mode
  :ensure t)
```

### css

``` {.commonlisp org-language="emacs-lisp"}
(use-package css-mode
  :init
  (setq css-indent-offset 2))
```

### SCSS

``` {.commonlisp org-language="emacs-lisp"}
(use-package scss-mode
  :ensure t
  :init
  (setq scss-compile-at-save nil))
```

### js/ts

``` {.commonlisp org-language="emacs-lisp"}
(use-package js2-mode
  :ensure t
  :mode (("\\.js\\'" . js2-mode)
     ("\\.jsx\\'" . js2-jsx-mode))
  :hook (js2-mode . js2-highlight-unused-variables-mode)
  :init
  (setq js-indent-level 2))

(use-package typescript-mode
  :ensure t
  :mode ("\\.ts[x]\\'" . typescript-mode))
```

### 格式化

``` {.commonlisp org-language="emacs-lisp"}
(when (executable-find "prettier")
  (use-package prettier
    :hook ((js-mode js2-mode css-mode web-mode) . prettier-mode)
    :init
    (setq prettier-pre-warm 'none)))
```

### node\_ modules

``` {.commonlisp org-language="emacs-lisp"}
(use-package add-node-modules-path
  :hook ((web-mode js-mode js2-mode) . add-node-modules-path))
```

## LaTeX

``` {.commonlisp org-language="emacs-lisp"}
(use-package auctex
  :ensure t
  :defer t
  :mode ("\\.tex\\'" . LaTeX-mode)
  :init
  (setq TeX-parse-self t
    TeX-auto-save t
    TeX-engine 'xelatex
    TeX-save-query nil))
```

## Markdown

``` {.commonlisp org-language="emacs-lisp"}
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
```

## Haskell

``` {.commonlisp org-language="emacs-lisp"}
(use-package haskell-mode
  :ensure t)
```

## Lua

``` {.commonlisp org-language="emacs-lisp"}
(use-package lua-mode
  :ensure t)
```

## Rust

# [TODO]{.todo .TODO} 写博客 {#写博客}

# [TODO]{.todo .TODO} 听歌 {#听歌}

# [TODO]{.todo .TODO} 邮件 {#邮件}

# [TODO]{.todo .TODO} 浏览网页 {#浏览网页}

# 一些有用的工具

## Delete the current file

``` {.commonlisp org-language="emacs-lisp"}
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

## Rename the current file

``` {.commonlisp org-language="emacs-lisp"}
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

## 代理

``` {.commonlisp org-language="emacs-lisp"}
(defun enable-proxy ()
  "Enable proxy.")

(defun disable-proxy ()
  "Disable proxy.")
```
