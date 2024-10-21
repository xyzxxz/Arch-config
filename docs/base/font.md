# 字体

Noto Sans

Twemoji



## Nerd Font 

Hack

Fira Code

## 中文字体

LXGW

文泉

## fontconfig

`~/.config/fontconfig/fonts.conf`

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>

  <!-- Default system-ui fonts -->
  <match target="pattern">
    <test name="family">
      <string>system-ui</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>sans-serif</string>
    </edit>
  </match>
  
  <!-- Default sans-serif fonts-->
  <match target="pattern">
    <test name="family">
      <string>sans-serif</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans CJK SC</string>
      <string>Noto Sans</string>
      <string>Twemoji</string>
    </edit>
  </match>
  
  <!-- Default serif fonts-->
  <match target="pattern">
    <test name="family">
      <string>serif</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Serif CJK SC</string>
      <string>Noto Serif</string>
      <string>Twemoji</string>
    </edit>
  </match>

  <!-- Default monospace fonts-->
  <match target="pattern">
    <test name="family">
      <string>monospace</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans Mono CJK SC</string>
      <string>Symbols Nerd Font</string>
      <string>Twemoji</string>
    </edit>
  </match>

  <match target="pattern">
    <test name="lang" compare="contains">
      <string>en</string>
    </test>
    <test name="family" compare="contains">
      <string>Noto Sans CJK</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Noto Sans</string>
    </edit>
  </match>

  <match target="pattern">
    <test name="prgname" compare="not_eq">
      <string>chrome</string>
    </test>
    <test name="family" compare="contains">
      <string>Noto Sans Mono CJK</string>
    </test>
    <edit name="family" mode="prepend" binding="strong">
      <string>Iosevka Term</string>
    </edit>
  </match>

</fontconfig>
```

🔗链接：[Linux fontconfig 的字体匹配机制](https://catcat.cc/post/2020-10-31/)
