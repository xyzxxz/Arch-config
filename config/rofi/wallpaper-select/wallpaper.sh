wallpaperPath="~/wallpaper/static/"

rofi -no-config \
    -show filebrowser \
    -theme ./selector.rasi \
    -filebrowser-command "swww img " \
    -filebrowser-directory ${wallpaperPath}
