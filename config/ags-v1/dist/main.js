// .config/ags/libs/session.ts
import GLib from "gi://GLib?version=2.0";
Object.assign(globalThis, {
  OPTIONS: `${GLib.get_user_cache_dir()}/ags/options.json`,
  TMP: `${GLib.get_user_config_dir()}/ags/dist`,
  USER: GLib.get_user_name()
});
Utils.ensureDirectory(TMP);
App.addIcons(`${App.configDir} / assets`);

// .config/ags/libs/option.ts
import { Variable as Variable2 } from "resource:///com/github/Aylur/ags/variable.js";

class Opt extends Variable2 {
  static {
    Service.register(this);
  }
  constructor(initial, { persistent = false } = {}) {
    super(initial);
    this.initial = initial;
    this.persistent = persistent;
  }
  initial;
  id = "";
  persistent;
  toString() {
    return `${this.value}`;
  }
  toJSON() {
    return `opt:${this.value}`;
  }
  getValue = () => {
    return super.getValue();
  };
  init(cacheFile) {
    const cacheV = JSON.parse(Utils.readFile(cacheFile) || "{}")[this.id];
    if (cacheV !== undefined)
      this.value = cacheV;
    this.connect("changed", () => {
      const cache = JSON.parse(Utils.readFile(cacheFile) || "{}");
      cache[this.id] = this.value;
      Utils.writeFileSync(JSON.stringify(cache, null, 2), cacheFile);
    });
  }
  reset() {
    if (this.persistent)
      return;
    if (JSON.stringify(this.value) !== JSON.stringify(this.initial)) {
      this.value = this.initial;
      return this.id;
    }
  }
}
var opt = (initial, opts) => new Opt(initial, opts);
function getOptions(object, path = "") {
  return Object.keys(object).flatMap((key) => {
    const obj = object[key];
    const id = path ? path + "." + key : key;
    if (obj instanceof Variable2) {
      obj.id = id;
      return obj;
    }
    if (typeof obj === "object")
      return getOptions(obj, id);
    return [];
  });
}
function mkOptions(cacheFile, object) {
  for (const opt2 of getOptions(object))
    opt2.init(cacheFile);
  Utils.ensureDirectory(cacheFile.split("/").slice(0, -1).join("/"));
  const configFile = `${TMP}/config.json`;
  const values = getOptions(object).reduce((obj, { id, value }) => ({ [id]: value, ...obj }), {});
  Utils.writeFileSync(JSON.stringify(values, null, 2), configFile);
  Utils.monitorFile(configFile, () => {
    const cache = JSON.parse(Utils.readFile(configFile) || "{}");
    for (const opt2 of getOptions(object)) {
      if (JSON.stringify(cache[opt2.id]) !== JSON.stringify(opt2.value))
        opt2.value = cache[opt2.id];
    }
  });
  function sleep(ms = 0) {
    return new Promise((r) => setTimeout(r, ms));
  }
  async function reset([opt2, ...list] = getOptions(object), id = opt2?.reset()) {
    if (!opt2)
      return sleep().then(() => []);
    return id ? [id, ...await sleep(50).then(() => reset(list))] : await sleep().then(() => reset(list));
  }
  return Object.assign(object, {
    configFile,
    array: () => getOptions(object),
    async reset() {
      return (await reset()).join("\n");
    },
    handler(deps, callback) {
      for (const opt2 of getOptions(object)) {
        if (deps.some((i) => opt2.id.startsWith(i)))
          opt2.connect("changed", callback);
      }
    }
  });
}

// .config/ags/libs/variables.ts
import GLib2 from "gi://GLib";
var clock = Variable(GLib2.DateTime.new_now_local(), {
  poll: [1000, () => GLib2.DateTime.new_now_local()]
});
var uptime = Variable(0, {
  poll: [
    60000,
    "cat /proc/uptime",
    (line) => Number.parseInt(line.split(".")[0]) / 60
  ]
});
var distro = {
  id: GLib2.get_os_info("ID"),
  logo: GLib2.get_os_info("LOGO")
};

// .config/ags/libs/icons.ts
var substitutes = {
  "transmission-gtk": "transmission",
  "blueberry.py": "blueberry",
  Caprine: "facebook-messenger",
  "com.raggesilver.BlackBox-symbolic": "terminal-symbolic",
  "org.wezfurlong.wezterm-symbolic": "terminal-symbolic",
  "audio-headset-bluetooth": "audio-headphones-symbolic",
  "audio-card-analog-usb": "audio-speakers-symbolic",
  "audio-card-analog-pci": "audio-card-symbolic",
  "preferences-system": "emblem-system-symbolic",
  "com.github.Aylur.ags-symbolic": "controls-symbolic",
  "com.github.Aylur.ags": "controls-symbolic"
};
var icons_default = {
  missing: "image-missing-symbolic",
  nix: {
    nix: "nix-snowflake-symbolic"
  },
  app: {
    terminal: "terminal-symbolic"
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic"
  },
  ui: {
    close: "window-close-symbolic",
    colorpicker: "color-select-symbolic",
    info: "info-symbolic",
    link: "external-link-symbolic",
    lock: "system-lock-screen-symbolic",
    menu: "open-menu-symbolic",
    refresh: "view-refresh-symbolic",
    search: "system-search-symbolic",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme-symbolic",
    tick: "object-select-symbolic",
    time: "hourglass-symbolic",
    toolbars: "toolbars-symbolic",
    warning: "dialog-warning-symbolic",
    avatar: "avatar-default-symbolic",
    arrow: {
      right: "pan-end-symbolic",
      left: "pan-start-symbolic",
      down: "pan-down-symbolic",
      up: "pan-up-symbolic"
    }
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic"
    },
    volume: {
      mute: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic"
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic"
    },
    mixer: "mixer-symbolic"
  },
  network: {
    wifi: {}
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic"
  },
  asusctl: {
    profile: {
      Balanced: "power-profile-balanced-symbolic",
      Quiet: "power-profile-power-saver-symbolic",
      Performance: "power-profile-performance-symbolic"
    },
    mode: {
      Integrated: "processor-symbolic",
      Hybrid: "controller-symbolic"
    }
  },
  battery: {
    percent: [
      "battery-000-symbolic",
      "battery-010-symbolic",
      "battery-020-symbolic",
      "battery-030-symbolic",
      "battery-040-symbolic",
      "battery-050-symbolic",
      "battery-060-symbolic",
      "battery-070-symbolic",
      "battery-080-symbolic",
      "battery-090-symbolic",
      "battery-100-symbolic"
    ],
    warning: "battery-empty-symbolic"
  },
  bluetooth: {
    activated: "network-bluetooth-activated-symbolic",
    inactivated: "network-bluetooth-inactivated-symbolic"
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic"
  },
  powermenu: {
    sleep: "weather-clear-night-symbolic",
    reboot: "system-reboot-symbolic",
    logout: "system-log-out-symbolic",
    shutdown: "system-shutdown-symbolic"
  },
  recorder: {
    recording: "media-record-symbolic"
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic"
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic"
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic"
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic"
    },
    playing: "media-playback-pause-symbolic",
    paused: "media-playback-start-symbolic",
    stopped: "media-playback-start-symbolic",
    prev: "media-skip-backward-symbolic",
    next: "media-skip-forward-symbolic"
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic"
  },
  color: {
    dark: "dark-mode-symbolic",
    light: "light-mode-symbolic"
  }
};

// .config/ags/libs/utils.ts
import Gdk from "gi://Gdk";
import GLib3 from "gi://GLib?version=2.0";
function icon(name, fallback = icons_default.missing) {
  if (!name)
    return fallback || "";
  if (GLib3.file_test(name, GLib3.FileTest.EXISTS))
    return name;
  const icon2 = substitutes[name] || name;
  if (Utils.lookUpIcon(icon2))
    return icon2;
  print(`no icon substitute "${icon2}" for "${name}", fallback: "${fallback}"`);
  return fallback;
}
async function bash(strings, ...values) {
  const cmd = typeof strings === "string" ? strings : strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");
  return Utils.execAsync(["bash", "-c", cmd]).catch((err) => {
    console.error(cmd, err);
    return "";
  });
}
async function sh(cmd) {
  return Utils.execAsync(cmd).catch((err) => {
    console.error(typeof cmd === "string" ? cmd : cmd.join(" "), err);
    return "";
  });
}
function range(length, start = 1) {
  return Array.from({ length }, (_, i) => i + start);
}
function dependencies(...bins) {
  const missing = bins.filter((bin) => Utils.exec({
    cmd: `which ${bin}`,
    out: () => false,
    err: () => true
  }));
  if (missing.length > 0) {
    console.warn(Error(`missing dependencies: ${missing.join(", ")}`));
    Utils.notify(`missing dependencies: ${missing.join(", ")}`);
  }
  return missing.length === 0;
}
function createSurfaceFromWidget(widget) {
  const cairo = imports.gi.cairo;
  const alloc = widget.get_allocation();
  const surface = new cairo.ImageSurface(cairo.Format.ARGB32, alloc.width, alloc.height);
  const cr = new cairo.Context(surface);
  cr.setSourceRGBA(255, 255, 255, 0);
  cr.rectangle(0, 0, alloc.width, alloc.height);
  cr.fill();
  widget.draw(cr);
  return surface;
}

// .config/ags/options.ts
var options = mkOptions(OPTIONS, {
  autotheme: opt(false),
  wallpaper: {
    resolution: opt(1920),
    market: opt("random")
  },
  theme: {
    dark: {
      primary: {
        bg: opt("#51a4e7"),
        fg: opt("#141414")
      },
      error: {
        bg: opt("#e55f86"),
        fg: opt("#141414")
      },
      bg: opt("#171717"),
      fg: opt("#eeeeee"),
      widget: opt("#eeeeee"),
      border: opt("#eeeeee")
    },
    light: {
      primary: {
        bg: opt("#426ede"),
        fg: opt("#eeeeee")
      },
      error: {
        bg: opt("#b13558"),
        fg: opt("#eeeeee")
      },
      bg: opt("#fffffa"),
      fg: opt("#080808"),
      widget: opt("#080808"),
      border: opt("#080808")
    },
    blur: opt(4),
    scheme: opt("dark"),
    widget: { opacity: opt(94) },
    border: {
      width: opt(1),
      opacity: opt(96)
    },
    shadows: opt(true),
    padding: opt(7),
    spacing: opt(12),
    radius: opt(11)
  },
  transition: opt(200),
  font: {
    size: opt(13),
    name: opt("Hack Nerd Font")
  },
  bar: {
    flatButtons: opt(true),
    position: opt("top"),
    corners: opt(50),
    transparent: opt(false),
    layout: {
      start: opt([
        "workspaces",
        "systray"
      ]),
      center: opt([
        "clock"
      ]),
      end: opt([
        "expander",
        "system",
        "battery"
      ])
    },
    launcher: {
      icon: {
        colored: opt(true),
        icon: opt(icon(distro.logo, icons_default.ui.search))
      },
      label: {
        colored: opt(false),
        label: opt(" Applications")
      },
      action: opt(() => App.toggleWindow("launcher"))
    },
    clock: {
      format: opt("%Y\u5E74%m\u6708%d\u65E5 %A %H:%M"),
      action: opt(() => App.toggleWindow("calendar"))
    },
    battery: {
      bar: opt("regular"),
      charging: opt("#00D787"),
      percentage: opt(true),
      blocks: opt(7),
      width: opt(50),
      low: opt(30)
    },
    workspaces: {
      workspaces: opt(6)
    },
    taskbar: {
      iconSize: opt(0),
      monochrome: opt(true),
      exclusive: opt(false)
    },
    messages: {
      action: opt(() => App.toggleWindow("datemenu"))
    },
    systray: {
      ignore: opt([
        "KDE Connect Indicator",
        "spotify-client"
      ])
    },
    media: {
      monochrome: opt(true),
      preferred: opt("spotify"),
      direction: opt("right"),
      format: opt("{artists} - {title}"),
      length: opt(40)
    },
    powermenu: {
      monochrome: opt(false),
      action: opt(() => App.toggleWindow("powermenu"))
    }
  },
  launcher: {
    width: opt(0),
    margin: opt(80),
    nix: {
      pkgs: opt("nixpkgs/nixos-unstable"),
      max: opt(8)
    },
    sh: {
      max: opt(16)
    },
    apps: {
      iconSize: opt(62),
      max: opt(6),
      favorites: opt([
        [
          "firefox",
          "wezterm",
          "org.gnome.Nautilus",
          "org.gnome.Calendar",
          "spotify"
        ]
      ])
    }
  },
  overview: {
    scale: opt(9),
    workspaces: opt(6),
    monochromeIcon: opt(true)
  },
  powermenu: {
    sleep: opt("systemctl suspend"),
    reboot: opt("systemctl reboot"),
    logout: opt("pkill Hyprland"),
    shutdown: opt("shutdown now"),
    layout: opt("line"),
    labels: opt(true)
  },
  quicksettings: {
    avatar: {
      image: opt(`/var/lib/AccountsService/icons/${Utils.USER}`),
      size: opt(70)
    },
    width: opt(380),
    position: opt("right"),
    networkSettings: opt("gtk-launch gnome-control-center"),
    media: {
      monochromeIcon: opt(true),
      coverSize: opt(100)
    }
  },
  datemenu: {
    position: opt("center"),
    weather: {
      interval: opt(60000),
      unit: opt("metric"),
      key: opt(JSON.parse(Utils.readFile(`${App.configDir}/.weather`) || "{}")?.key || ""),
      cities: opt(JSON.parse(Utils.readFile(`${App.configDir}/.weather`) || "{}")?.cities || [])
    }
  },
  osd: {
    progress: {
      vertical: opt(true),
      pack: {
        h: opt("end"),
        v: opt("center")
      }
    },
    microphone: {
      pack: {
        h: opt("center"),
        v: opt("end")
      }
    }
  },
  notifications: {
    position: opt(["top", "right"]),
    blacklist: opt(["Spotify"]),
    width: opt(440)
  },
  hyprland: {
    gaps: opt(2),
    inactiveBorder: opt("#282828"),
    gapsWhenOnly: opt(false)
  }
});
globalThis["options"] = options;
var options_default = options;

// .config/ags/styles/style.ts
var deps = [
  "font",
  "theme",
  "bar.corners",
  "bar.flatButtons",
  "bar.position",
  "bar.battery.charging",
  "bar.battery.blocks"
];
var {
  dark,
  light,
  blur,
  scheme,
  padding,
  spacing,
  radius,
  shadows,
  widget,
  border
} = options_default.theme;
var popoverPaddingMultiplier = 1.6;
var t = (dark2, light2) => scheme.value === "dark" ? `${dark2}` : `${light2}`;
var $ = (name, value) => `\$${name}: ${value};`;
var variables = () => [
  $("bg", blur.value ? `transparentize(${t(dark.bg, light.bg)}, ${blur.value / 100})` : t(dark.bg, light.bg)),
  $("fg", t(dark.fg, light.fg)),
  $("primary-bg", t(dark.primary.bg, light.primary.bg)),
  $("primary-fg", t(dark.primary.fg, light.primary.fg)),
  $("error-bg", t(dark.error.bg, light.error.bg)),
  $("error-fg", t(dark.error.fg, light.error.fg)),
  $("scheme", scheme),
  $("padding", `${padding}pt`),
  $("spacing", `${spacing}pt`),
  $("radius", `${radius}px`),
  $("transition", `${options_default.transition}ms`),
  $("shadows", `${shadows}`),
  $("widget-bg", `transparentize(${t(dark.widget, light.widget)}, ${widget.opacity.value / 100})`),
  $("hover-bg", `transparentize(${t(dark.widget, light.widget)}, ${widget.opacity.value * 0.9 / 100})`),
  $("hover-fg", `lighten(${t(dark.fg, light.fg)}, 8%)`),
  $("border-width", `${border.width}px`),
  $("border-color", `transparentize(${t(dark.border, light.border)}, ${border.opacity.value / 100})`),
  $("border", "$border-width solid $border-color"),
  $("active-gradient", `linear-gradient(to right, ${t(dark.primary.bg, light.primary.bg)}, darken(${t(dark.primary.bg, light.primary.bg)}, 4%))`),
  $("shadow-color", t("rgba(0,0,0,.6)", "rgba(0,0,0,.4)")),
  $("text-shadow", t("2pt 2pt 2pt $shadow-color", "none")),
  $("box-shadow", t("2pt 2pt 2pt 0 $shadow-color, inset 0 0 0 $border-width $border-color", "none")),
  $("popover-border-color", `transparentize(${t(dark.border, light.border)}, ${Math.max((border.opacity.value - 1) / 100, 0)})`),
  $("popover-padding", `\$padding * ${popoverPaddingMultiplier}`),
  $("popover-radius", radius.value === 0 ? "0" : "$radius + $popover-padding"),
  $("font-size", `${options_default.font.size}pt`),
  $("font-name", options_default.font.name),
  $("charging-bg", options_default.bar.battery.charging),
  $("bar-battery-blocks", options_default.bar.battery.blocks),
  $("bar-position", options_default.bar.position),
  $("hyprland-gaps-multiplier", options_default.hyprland.gaps),
  $("screen-corner-multiplier", `${options_default.bar.corners.value * 0.01}`)
];
async function resetCss() {
  if (!dependencies("sass", "fd"))
    return;
  try {
    const vars = `${TMP}/variables.scss`;
    const scss = `${TMP}/main.scss`;
    const css = `${TMP}/main.css`;
    const fd = await bash(`fd ".scss"  ~/.config/ags/styles/`);
    const files = fd.split(/\s+/);
    const imports2 = [vars, ...files].map((f) => `@import '${f}';`);
    await Utils.writeFile(variables().join("\n"), vars);
    await Utils.writeFile(imports2.join("\n"), scss);
    await bash`sass ${scss} ${css}`;
    App.applyCss(css, true);
  } catch (error) {
    error instanceof Error ? logError(error) : console.error(error);
  }
}
Utils.monitorFile(`${App.configDir}/styles`, resetCss);
options_default.handler(deps, resetCss);
await resetCss();

// .config/ags/services/wallpaper.ts
var WP = `${Utils.HOME}/.config/background`;
var Cache = `${Utils.HOME}/Pictures/Wallpapers/Bing`;

class Wallpaper extends Service {
  static {
    Service.register(this, {}, {
      wallpaper: ["string"]
    });
  }
  #blockMonitor = false;
  #wallpaper() {
    if (!dependencies("swww"))
      return;
    sh("hyprctl cursorpos").then((pos) => {
      sh([
        "swww",
        "img",
        "--invert-y",
        "--transition-type",
        "grow",
        "--transition-pos",
        pos.replace(" ", ""),
        WP
      ]).then(() => {
        this.changed("wallpaper");
      });
    });
  }
  async#setWallpaper(path) {
    this.#blockMonitor = true;
    await sh(`cp ${path} ${WP}`);
    this.#wallpaper();
    this.#blockMonitor = false;
  }
  async#fetchBing() {
    const res = await Utils.fetch("https://bing.biturl.top/", {
      params: {
        resolution: options_default.wallpaper.resolution.value,
        format: "json",
        image_format: "jpg",
        index: "random",
        mkt: options_default.wallpaper.market.value
      }
    }).then((res2) => res2.text());
    if (!res.startsWith("{"))
      return console.warn("bing api", res);
    const { url } = JSON.parse(res);
    const file = `${Cache}/${url.replace("https://www.bing.com/th?id=", "")}`;
    if (dependencies("curl")) {
      Utils.ensureDirectory(Cache);
      await sh(`curl "${url}" --output ${file}`);
      this.#setWallpaper(file);
    }
  }
  random = () => {
    this.#fetchBing();
  };
  set = (path) => {
    this.#setWallpaper(path);
  };
  get wallpaper() {
    return WP;
  }
  constructor() {
    super();
    if (!dependencies("swww"))
      return this;
    Utils.monitorFile(WP, () => {
      if (!this.#blockMonitor)
        this.#wallpaper();
    });
    Utils.execAsync("swww-daemon").then(this.#wallpaper).catch(() => null);
  }
}
var wallpaper_default = new Wallpaper;

// .config/ags/libs/matugen.ts
function init() {
  wallpaper_default.connect("changed", () => matugen());
  options_default.autotheme.connect("changed", () => matugen());
}
function animate(...setters) {
  const delay = options_default.transition.value / 2;
  setters.forEach((fn, i) => Utils.timeout(delay * i, fn));
}
async function matugen(type = "image", arg = wallpaper_default.wallpaper) {
  if (!options_default.autotheme.value || !dependencies("matugen"))
    return;
  const colors = await sh(`matugen --dry-run -j hex ${type} ${arg}`);
  const c = JSON.parse(colors).colors;
  const { dark: dark2, light: light2 } = options_default.theme;
  animate(() => {
    dark2.widget.value = c.dark.on_surface;
    light2.widget.value = c.light.on_surface;
  }, () => {
    dark2.border.value = c.dark.outline;
    light2.border.value = c.light.outline;
  }, () => {
    dark2.bg.value = c.dark.surface;
    light2.bg.value = c.light.surface;
  }, () => {
    dark2.fg.value = c.dark.on_surface;
    light2.fg.value = c.light.on_surface;
  }, () => {
    dark2.primary.bg.value = c.dark.primary;
    light2.primary.bg.value = c.light.primary;
    options_default.bar.battery.charging.value = options_default.theme.scheme.value === "dark" ? c.dark.primary : c.light.primary;
  }, () => {
    dark2.primary.fg.value = c.dark.on_primary;
    light2.primary.fg.value = c.light.on_primary;
  }, () => {
    dark2.error.bg.value = c.dark.error;
    light2.error.bg.value = c.light.error;
  }, () => {
    dark2.error.fg.value = c.dark.on_error;
    light2.error.fg.value = c.light.on_error;
  });
}

// .config/ags/libs/hyprland.ts
var { messageAsync } = await Service.import("hyprland");
var {
  hyprland,
  theme: {
    spacing: spacing2,
    radius: radius2,
    border: { width },
    blur: blur2,
    shadows: shadows2,
    dark: {
      primary: { bg: darkActive }
    },
    light: {
      primary: { bg: lightActive }
    },
    scheme: scheme2
  }
} = options_default;
var deps2 = [
  "hyprland",
  spacing2.id,
  radius2.id,
  blur2.id,
  width.id,
  shadows2.id,
  darkActive.id,
  lightActive.id,
  scheme2.id
];
function primary() {
  return scheme2.value === "dark" ? darkActive.value : lightActive.value;
}
function rgba(color) {
  return `rgba(${color}ff)`.replace("#", "");
}
function sendBatch(batch) {
  const cmd = batch.filter((x) => !!x).map((x) => `keyword ${x}`).join("; ");
  return messageAsync(`[[BATCH]]/${cmd}`);
}
async function setupHyprland() {
  const wm_gaps = Math.floor(hyprland.gaps.value * spacing2.value);
  sendBatch([
    `general:border_size ${width}`,
    `general:gaps_out ${wm_gaps}`,
    `general:gaps_in ${Math.floor(wm_gaps / 2)}`,
    `general:col.active_border ${rgba(primary())}`,
    `general:col.inactive_border ${rgba(hyprland.inactiveBorder.value)}`,
    `decoration:rounding ${radius2}`,
    `decoration:drop_shadow ${shadows2.value ? "yes" : "no"}`,
    `dwindle:no_gaps_when_only ${hyprland.gapsWhenOnly.value ? 0 : 1}`,
    `master:no_gaps_when_only ${hyprland.gapsWhenOnly.value ? 0 : 1}`
  ]);
  await sendBatch(App.windows.map(({ name }) => `layerrule unset, ${name}`));
  if (blur2.value > 0) {
    sendBatch(App.windows.flatMap(({ name }) => [
      `layerrule unset, ${name}`,
      `layerrule blur, ${name}`,
      `layerrule ignorealpha ${0.29}, ${name}`
    ]));
  }
}
function init2() {
  options_default.handler(deps2, setupHyprland);
  setupHyprland();
}

// .config/ags/libs/tmux.ts
async function tmux() {
  const { scheme: scheme3, dark: dark2, light: light2 } = options_default.theme;
  const hex = scheme3.value === "dark" ? dark2.primary.bg.value : light2.primary.bg.value;
  if (await sh("which tmux").catch(() => false))
    sh(`tmux set @main_accent "${hex}"`);
}
function init3() {
  options_default.theme.dark.primary.bg.connect("changed", tmux);
  options_default.theme.light.primary.bg.connect("changed", tmux);
}

// .config/ags/libs/gtk.ts
import Gio from "gi://Gio";
var settings = new Gio.Settings({
  schema: "org.gnome.desktop.interface"
});
function gtk() {
  const scheme3 = options_default.theme.scheme.value;
  settings.set_string("color-scheme", `prefer-${scheme3}`);
}
function init4() {
  options_default.theme.scheme.connect("changed", gtk);
  gtk();
}

// .config/ags/libs/init.ts
function init5() {
  try {
    init4();
    init3();
    init();
    init2();
  } catch (error) {
    logError(error);
  }
}

// .config/ags/widgets/bar/buttons/BatteryBar.ts
var battery = await Service.import("battery");
var BatteryBar_default = () => Widget.Box({
  children: [
    Widget.Icon().hook(battery, (self) => {
      self.icon = icons_default.battery.percent[Math.floor(battery.percent / 10)];
    }),
    Widget.Label({
      label: battery.bind("percent").as((v) => `${v}%`)
    })
  ]
});

// .config/ags/widgets/bar/PanelButton.ts
var PanelButton_default = ({
  window = "",
  flat,
  child,
  setup,
  ...rest
}) => Widget.Button({
  child: Widget.Box({ child }),
  setup: (self) => {
    let open = false;
    self.toggleClassName("panel-button");
    self.toggleClassName(window);
    self.hook(options_default.bar.flatButtons, () => {
      self.toggleClassName("flat", flat ?? options_default.bar.flatButtons.value);
    });
    self.hook(App, (_, win, visible) => {
      if (win !== window)
        return;
      if (open && !visible) {
        open = false;
        self.toggleClassName("active", false);
      }
      if (visible) {
        open = true;
        self.toggleClassName("active");
      }
    });
    if (setup)
      setup(self);
  },
  ...rest
});

// .config/ags/widgets/bar/buttons/Clock.ts
var { format, action } = options_default.bar.clock;
var Clock_default = () => PanelButton_default({
  child: Widget.Label({
    justification: "center",
    label: Utils.derive([clock, format], (c, f) => c.format(f) || "").bind()
  }),
  on_clicked: () => App.toggleWindow("calendar")
});

// .config/ags/widgets/bar/buttons/ColorPicker.ts
var ColorPicker_default = () => PanelButton_default({});

// .config/ags/widgets/bar/buttons/SysTray.ts
import Gdk2 from "gi://Gdk";
var systemtray = await Service.import("systemtray");
var { ignore } = options_default.bar.systray;
var SysTrayItem = (item) => PanelButton_default({
  child: Widget.Icon({ icon: item.bind("icon") }),
  on_primary_click: (_, event) => item.activate(event),
  on_secondary_click: (btn, event) => item.menu.popup_at_widget(btn, Gdk2.Gravity.SOUTH_EAST, Gdk2.Gravity.NORTH, null)
});
var SysTray_default = () => Widget.Box({
  setup: (self) => self.hook(systemtray, (self2) => {
    self2.children = systemtray.items.filter(({ id }) => !ignore.value.includes(id)).map(SysTrayItem);
  })
});

// .config/ags/services/brightness.ts
var get = (args) => Number(Utils.exec(`brightnessctl ${args}`));

class Brightness extends Service {
  static {
    Service.register(this, {
      "screen-changed": ["float"]
    }, {
      "screen-value": ["float", "rw"]
    });
  }
  #interface = Utils.exec("sh -c 'ls -w1 /sys/class/backlight | head -1'");
  #screenMax = get("max");
  #screen_value = 0;
  get screen_value() {
    return this.#screen_value;
  }
  set screen_value(percent) {
    if (percent < 0) {
      percent = 0;
    }
    if (percent > 1) {
      percent = 1;
    }
    sh(`brightnessctl set ${Math.floor(percent * 100)}% -q`);
  }
  constructor() {
    super();
    const screenPath = `/sys/class/backlight/${this.#interface}/brightness`;
    Utils.monitorFile(screenPath, () => this.#onChange());
    this.#onChange();
  }
  #onChange() {
    this.#screen_value = Math.round(get("get") / this.#screenMax * 100);
    this.emit("changed");
    this.notify("screen-value");
    this.emit("screen-changed", this.#screen_value);
  }
  connect(event = "screen-changed", callback) {
    return super.connect(event, callback);
  }
}
var brightness_default = new Brightness;

// .config/ags/widgets/bar/buttons/SystemIndicators.ts
var audio = await Service.import("audio");
var network = await Service.import("network");
var AudioIndicator = () => Widget.Box({
  children: [
    Widget.Icon().hook(audio.speaker, (self) => {
      const vol = audio.speaker.is_muted ? 0 : audio.speaker.volume;
      const { mute, low, medium, high } = icons_default.audio.volume;
      const cons = [[60, high], [30, medium], [1, low], [0, mute]];
      self.icon = cons.find(([n]) => n <= vol * 100)?.[1] || "";
    }),
    Widget.Label({
      label: Math.floor(audio.speaker.volume * 100).toString() + "%"
    })
  ]
});
var NetworkIndicator = () => PanelButton_default({
  child: Widget.Box({
    children: [
      Widget.Icon().hook(network, (self) => {
        const icon2 = network[network.primary || "wifi"]?.icon_name;
        self.icon = icon2 || "";
      }),
      Widget.Label({
        label: network.wifi.ssid
      })
    ]
  })
});
var BrightnessIndicator = () => Widget.Box({
  children: [
    Widget.Icon(),
    Widget.Label({
      label: brightness_default.bind("screen-value").as((v) => `${v}%`)
    })
  ]
});
var SystemIndicators_default = () => Widget.Box({
  children: [AudioIndicator(), NetworkIndicator(), BrightnessIndicator()]
});

// .config/ags/widgets/bar/buttons/Workspaces.ts
var hyprland2 = await Service.import("hyprland");
var { workspaces } = options_default.bar.workspaces;
var dispatch = (arg) => {
  sh(`hyprctl dispatch workspace ${arg}`);
};
var Workspaces = (ws) => Widget.Box({
  children: range(ws || 10).map((i) => Widget.Label({
    attribute: i,
    vpack: "center",
    label: `${i}`,
    setup: (self) => self.hook(hyprland2, () => {
      self.toggleClassName("active", hyprland2.active.workspace.id === i);
      self.toggleClassName("occupied", (hyprland2.getWorkspace(i)?.windows || 0) > 0);
    })
  })),
  setup: (box) => {
    if (ws === 0) {
      box.hook(hyprland2.active.workspace, () => box.children.map((btn) => {
        btn.visible = hyprland2.workspaces.some((ws2) => ws2.id === btn.attribute);
      }));
    }
  }
});
var Workspaces_default = () => PanelButton_default({
  class_name: "workspaces",
  on_scroll_up: () => dispatch("m+1"),
  on_scroll_down: () => dispatch("m-1"),
  on_clicked: () => App.toggleWindow("overview"),
  child: workspaces.bind().as(Workspaces)
});

// .config/ags/widgets/bar/Bar.ts
var { start, center, end } = options_default.bar.layout;
var { transparent, position } = options_default.bar;
var widget2 = {
  battery: BatteryBar_default,
  clock: Clock_default,
  colorpicker: ColorPicker_default,
  systray: SysTray_default,
  system: SystemIndicators_default,
  workspaces: Workspaces_default,
  expander: () => Widget.Box({ expand: true })
};
var Bar_default = () => Widget.Window({
  class_name: "bar",
  name: "bar",
  exclusivity: "exclusive",
  anchor: position.bind().as((pos) => [pos, "right", "left"]),
  child: Widget.CenterBox({
    css: "min-width: 2px; min-height: 2px;",
    startWidget: Widget.Box({
      hexpand: true,
      children: start.bind().as((s) => s.map((w) => widget2[w]()))
    }),
    centerWidget: Widget.Box({
      hpack: "center",
      children: center.bind().as((c) => c.map((w) => widget2[w]()))
    }),
    endWidget: Widget.Box({
      hexpand: true,
      children: end.bind().as((e) => e.map((w) => widget2[w]()))
    })
  }),
  setup: (self) => self.hook(transparent, () => {
    self.toggleClassName("transparent", transparent.value);
  })
});

// .config/ags/node_modules/tyme4ts/dist/lib/index.mjs
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => (key in obj) ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class AbstractCulture {
  toString() {
    return this.getName();
  }
  equals(o) {
    return o && o.toString() === this.toString();
  }
  indexOf(index, size) {
    let i = index % size;
    if (i < 0) {
      i += size;
    }
    return i;
  }
}

class AbstractTyme extends AbstractCulture {
}

class AbstractCultureDay extends AbstractCulture {
  constructor(culture, dayIndex) {
    super();
    __publicField(this, "culture");
    __publicField(this, "dayIndex");
    this.culture = culture;
    this.dayIndex = dayIndex;
  }
  getDayIndex() {
    return this.dayIndex;
  }
  getCulture() {
    return this.culture;
  }
  getName() {
    return this.culture.getName();
  }
  toString() {
    return `${this.culture.toString()}\u7B2C${this.getDayIndex() + 1}\u5929`;
  }
}

class LoopTyme extends AbstractTyme {
  constructor(names, indexOrName) {
    super();
    __publicField(this, "names");
    __publicField(this, "index");
    this.names = names;
    this.index = this.indexOfBy(indexOrName);
  }
  indexOfBy(indexOrName) {
    if (typeof indexOrName === "number") {
      return this.indexOf(indexOrName, this.getSize());
    } else {
      for (let i = 0, j = this.getSize();i < j; i++) {
        if (this.names[i] === indexOrName) {
          return i;
        }
      }
      throw new Error(`illegal name ${indexOrName}`);
    }
  }
  getName() {
    return this.names[this.index];
  }
  getIndex() {
    return this.index;
  }
  getSize() {
    return this.names.length;
  }
  nextIndex(n) {
    return this.indexOfBy(this.index + n);
  }
}
var _Animal = class _Animal2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Animal2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Animal2(index);
  }
  static fromName(name) {
    return new _Animal2(name);
  }
  next(n) {
    return _Animal2.fromIndex(this.nextIndex(n));
  }
  getTwentyEightStar() {
    return TwentyEightStar.fromIndex(this.index);
  }
};
__publicField(_Animal, "NAMES", ["\u86DF", "\u9F99", "\u8C89", "\u5154", "\u72D0", "\u864E", "\u8C79", "\u736C", "\u725B", "\u8760", "\u9F20", "\u71D5", "\u732A", "\u735D", "\u72FC", "\u72D7", "\u5F58", "\u9E21", "\u4E4C", "\u7334", "\u733F", "\u72B4", "\u7F8A", "\u7350", "\u9A6C", "\u9E7F", "\u86C7", "\u8693"]);
var Animal = _Animal;
var _TwentyEightStar = class _TwentyEightStar2 extends LoopTyme {
  constructor(indexOfName) {
    super(_TwentyEightStar2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _TwentyEightStar2(index);
  }
  static fromName(name) {
    return new _TwentyEightStar2(name);
  }
  next(n) {
    return _TwentyEightStar2.fromIndex(this.nextIndex(n));
  }
  getSevenStar() {
    return SevenStar.fromIndex(this.index % 7 + 4);
  }
  getLand() {
    return Land.fromIndex([4, 4, 4, 2, 2, 2, 7, 7, 7, 0, 0, 0, 0, 5, 5, 5, 6, 6, 6, 1, 1, 1, 8, 8, 8, 3, 3, 3][this.index]);
  }
  getZone() {
    return Zone.fromIndex(~~(this.index / 7));
  }
  getAnimal() {
    return Animal.fromIndex(this.index);
  }
  getLuck() {
    return Luck.fromIndex([0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0][this.index]);
  }
};
__publicField(_TwentyEightStar, "NAMES", ["\u89D2", "\u4EA2", "\u6C10", "\u623F", "\u5FC3", "\u5C3E", "\u7B95", "\u6597", "\u725B", "\u5973", "\u865A", "\u5371", "\u5BA4", "\u58C1", "\u594E", "\u5A04", "\u80C3", "\u6634", "\u6BD5", "\u89DC", "\u53C2", "\u4E95", "\u9B3C", "\u67F3", "\u661F", "\u5F20", "\u7FFC", "\u8F78"]);
var TwentyEightStar = _TwentyEightStar;
var _SevenStar = class _SevenStar2 extends LoopTyme {
  constructor(indexOfName) {
    super(_SevenStar2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _SevenStar2(index);
  }
  static fromName(name) {
    return new _SevenStar2(name);
  }
  next(n) {
    return _SevenStar2.fromIndex(this.nextIndex(n));
  }
  getWeek() {
    return Week.fromIndex(this.index);
  }
};
__publicField(_SevenStar, "NAMES", ["\u65E5", "\u6708", "\u706B", "\u6C34", "\u6728", "\u91D1", "\u571F"]);
var SevenStar = _SevenStar;
var _Week = class _Week2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Week2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Week2(index);
  }
  static fromName(name) {
    return new _Week2(name);
  }
  next(n) {
    return _Week2.fromIndex(this.nextIndex(n));
  }
  getSevenStar() {
    return SevenStar.fromIndex(this.index);
  }
};
__publicField(_Week, "NAMES", ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"]);
var Week = _Week;
var _Land = class _Land2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Land2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Land2(index);
  }
  static fromName(name) {
    return new _Land2(name);
  }
  next(n) {
    return _Land2.fromIndex(this.nextIndex(n));
  }
  getDirection() {
    return Direction.fromIndex(this.index);
  }
};
__publicField(_Land, "NAMES", ["\u7384\u5929", "\u6731\u5929", "\u82CD\u5929", "\u9633\u5929", "\u94A7\u5929", "\u5E7D\u5929", "\u98A2\u5929", "\u53D8\u5929", "\u708E\u5929"]);
var Land = _Land;
var _Direction = class _Direction2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Direction2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Direction2(index);
  }
  static fromName(name) {
    return new _Direction2(name);
  }
  next(n) {
    return _Direction2.fromIndex(this.nextIndex(n));
  }
  getLand() {
    return Land.fromIndex(this.index);
  }
  getElement() {
    return Element.fromIndex([4, 2, 0, 0, 2, 3, 3, 2, 1][this.index]);
  }
};
__publicField(_Direction, "NAMES", ["\u5317", "\u897F\u5357", "\u4E1C", "\u4E1C\u5357", "\u4E2D", "\u897F\u5317", "\u897F", "\u4E1C\u5317", "\u5357"]);
var Direction = _Direction;
var _Zone = class _Zone2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Zone2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Zone2(index);
  }
  static fromName(name) {
    return new _Zone2(name);
  }
  next(n) {
    return _Zone2.fromIndex(this.nextIndex(n));
  }
  getDirection() {
    return Direction.fromName(this.getName());
  }
  getBeast() {
    return Beast.fromIndex(this.getIndex());
  }
};
__publicField(_Zone, "NAMES", ["\u4E1C", "\u5317", "\u897F", "\u5357"]);
var Zone = _Zone;
var _Beast = class _Beast2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Beast2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Beast2(index);
  }
  static fromName(name) {
    return new _Beast2(name);
  }
  next(n) {
    return _Beast2.fromIndex(this.nextIndex(n));
  }
  getZone() {
    return Zone.fromIndex(this.index);
  }
};
__publicField(_Beast, "NAMES", ["\u9752\u9F99", "\u7384\u6B66", "\u767D\u864E", "\u6731\u96C0"]);
var Beast = _Beast;
var _Luck = class _Luck2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Luck2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Luck2(index);
  }
  static fromName(name) {
    return new _Luck2(name);
  }
  next(n) {
    return _Luck2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Luck, "NAMES", ["\u5409", "\u51F6"]);
var Luck = _Luck;
var _Constellation = class _Constellation2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Constellation2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Constellation2(index);
  }
  static fromName(name) {
    return new _Constellation2(name);
  }
  next(n) {
    return _Constellation2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Constellation, "NAMES", ["\u767D\u7F8A", "\u91D1\u725B", "\u53CC\u5B50", "\u5DE8\u87F9", "\u72EE\u5B50", "\u5904\u5973", "\u5929\u79E4", "\u5929\u874E", "\u5C04\u624B", "\u6469\u7FAF", "\u6C34\u74F6", "\u53CC\u9C7C"]);
var Constellation = _Constellation;
var _Duty = class _Duty2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Duty2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Duty2(index);
  }
  static fromName(name) {
    return new _Duty2(name);
  }
  next(n) {
    return _Duty2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Duty, "NAMES", ["\u5EFA", "\u9664", "\u6EE1", "\u5E73", "\u5B9A", "\u6267", "\u7834", "\u5371", "\u6210", "\u6536", "\u5F00", "\u95ED"]);
var Duty = _Duty;
var _Element = class _Element2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Element2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Element2(index);
  }
  static fromName(name) {
    return new _Element2(name);
  }
  next(n) {
    return _Element2.fromIndex(this.nextIndex(n));
  }
  getReinforce() {
    return this.next(1);
  }
  getRestrain() {
    return this.next(2);
  }
  getReinforced() {
    return this.next(-1);
  }
  getRestrained() {
    return this.next(-2);
  }
  getDirection() {
    return Direction.fromIndex([2, 8, 4, 6, 0][this.index]);
  }
};
__publicField(_Element, "NAMES", ["\u6728", "\u706B", "\u571F", "\u91D1", "\u6C34"]);
var Element = _Element;
var _God = class _God2 extends LoopTyme {
  constructor(indexOfName) {
    super(_God2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _God2(index);
  }
  static fromName(name) {
    return new _God2(name);
  }
  next(n) {
    return _God2.fromIndex(this.nextIndex(n));
  }
  getLuck() {
    return Luck.fromIndex(this.index < 60 ? 0 : 1);
  }
  static getDayGods(month, day) {
    const l = [];
    let index = day.getIndex().toString(16).toUpperCase();
    if (index.length < 2) {
      index = "0" + index;
    }
    const matcher = new RegExp(`;${index}(.[^;]*)`, "g").exec(_God2.dayGods[month.getEarthBranch().next(-2).getIndex()]);
    if (matcher) {
      const data = matcher[1];
      for (let i = 0, j = data.length;i < j; i += 2) {
        l.push(_God2.fromIndex(parseInt(data.substring(i, i + 2), 16)));
      }
    }
    return l;
  }
};
__publicField(_God, "NAMES", ["\u5929\u6069", "\u9E23\u5420", "\u6BCD\u4ED3", "\u4E0D\u5C06", "\u56DB\u76F8", "\u9E23\u5420\u5BF9", "\u4E94\u5408", "\u4E09\u5408", "\u9664\u795E", "\u6708\u5FB7", "\u6708\u7A7A", "\u6708\u5FB7\u5408", "\u6708\u6069", "\u65F6\u9634", "\u4E94\u5BCC", "\u751F\u6C14", "\u91D1\u532E", "\u76F8\u65E5", "\u9634\u5FB7", "\u516D\u5408", "\u76CA\u540E", "\u9752\u9F99", "\u7EED\u4E16", "\u660E\u5802", "\u738B\u65E5", "\u8981\u5B89", "\u5B98\u65E5", "\u5409\u671F", "\u798F\u5FB7", "\u516D\u4EEA", "\u91D1\u5802", "\u5B9D\u5149", "\u6C11\u65E5", "\u4E34\u65E5", "\u5929\u9A6C", "\u656C\u5B89", "\u666E\u62A4", "\u9A7F\u9A6C", "\u5929\u540E", "\u9633\u5FB7", "\u5929\u559C", "\u5929\u533B", "\u53F8\u547D", "\u5723\u5FC3", "\u7389\u5B87", "\u5B88\u65E5", "\u65F6\u5FB7", "\u89E3\u795E", "\u65F6\u9633", "\u5929\u4ED3", "\u5929\u5DEB", "\u7389\u5802", "\u798F\u751F", "\u5929\u5FB7", "\u5929\u5FB7\u5408", "\u5929\u613F", "\u5929\u8D66", "\u5929\u7B26", "\u9634\u795E", "\u89E3\u9664", "\u4E94\u865A", "\u4E94\u79BB", "\u91CD\u65E5", "\u590D\u65E5", "\u8840\u652F", "\u5929\u8D3C", "\u571F\u7B26", "\u6E38\u7978", "\u767D\u864E", "\u5C0F\u8017", "\u81F4\u6B7B", "\u6CB3\u9B41", "\u52AB\u715E", "\u6708\u715E", "\u6708\u5EFA", "\u5F80\u4EA1", "\u5927\u65F6", "\u5927\u8D25", "\u54B8\u6C60", "\u538C\u5BF9", "\u62DB\u6447", "\u4E5D\u574E", "\u4E5D\u7126", "\u5929\u7F61", "\u6B7B\u795E", "\u6708\u5BB3", "\u6B7B\u6C14", "\u6708\u7834", "\u5927\u8017", "\u5929\u7262", "\u5143\u6B66", "\u6708\u538C", "\u6708\u865A", "\u5F52\u5FCC", "\u5C0F\u65F6", "\u5929\u5211", "\u6731\u96C0", "\u4E5D\u7A7A", "\u5929\u540F", "\u5730\u706B", "\u56DB\u51FB", "\u5927\u715E", "\u52FE\u9648", "\u516B\u4E13", "\u707E\u715E", "\u5929\u706B", "\u8840\u5FCC", "\u571F\u5E9C", "\u6708\u5211", "\u89E6\u6C34\u9F99", "\u5730\u56CA", "\u516B\u98CE", "\u56DB\u5E9F", "\u56DB\u5FCC", "\u56DB\u7A77", "\u4E94\u5893", "\u9634\u9519", "\u56DB\u8017", "\u9633\u9519", "\u5B64\u8FB0", "\u5C0F\u4F1A", "\u5927\u4F1A", "\u516B\u9F99", "\u4E03\u9E1F", "\u4E5D\u864E", "\u516D\u86C7", "\u5929\u72D7", "\u884C\u72E0", "\u4E86\u623E", "\u5C81\u8584", "\u9010\u9635", "\u4E09\u4E27", "\u4E09\u9634", "\u9634\u9053\u51B2\u9633", "\u9634\u4F4D", "\u9634\u9633\u4EA4\u7834", "\u9634\u9633\u4FF1\u9519", "\u9634\u9633\u51FB\u51B2", "\u9B3C\u54ED", "\u5355\u9634", "\u7EDD\u9634", "\u7EAF\u9633", "\u9633\u9519\u9634\u51B2", "\u4E03\u7B26", "\u6210\u65E5", "\u5B64\u9633", "\u7EDD\u9633", "\u7EAF\u9634", "\u5927\u9000", "\u56DB\u79BB", "\u9633\u7834\u9634\u51B2"]);
__publicField(_God, "dayGods", [
  ";000002300F14156869717A3F;01001617495C40413C425D6A;0209000C041831031906054A5E6B4B5F;033500041A1B032C06054C4D4E60;04002D321C1D1E104F50615152;05111F53546C55433C3E;062E200721220D01566E44;070B2333242F45;08360A2526242F080157583D59;091234080162463C3D5A;0A270728292A5B6364653F79;0B0237130E2B4748727A3E66;0C09020C04300F0314150568696D;0D3504031617495C40413C6F425D6A;0E38183119064A5E6B4B5F;0F001A1B032C064C4D4E60;10002D321C1D1E104F50615152;110B00111F53546C55433C3E;12360A002E200721220D015644;13002333456D;142526242F080157583F3D59;15001234080162463C3D5A;16090004270728292A5B636465;17350204130E032B47483E66;1802300F14156869;19031617495C40413C425D6A;1A1831031906054A5E6B4B5F;1B0B1A1B032C06054C4D4E;1C360A2D321C1D1E104F50615152;1D111F53546C55433C3E;1E2E200721220D01563F44;1F23334573;20090C042526242F080157583D;2135041234080162463C3D5A;22270728292A5B636465;2302130E032B47483E66;2402300F0314150568696E;250B031617495C40413C425D6A;26360A18311906054A5E6B4B5F;271A1B2C06054C4D4E60;282D321C1D1E104F506151523F;29111F53546C55433C3E;2A090C042E200721220D015644;2B350423334567;2C2526242F0857583D59;2D001234080162463C3D5A;2E00270728292A5B63646574;2F0B0002130E032B47483E66;30360A0002300F141505686975;31001617495C40413C425D6A676D;3218311906054A5E6B4B3F675F76;331A1B2C06054C4D4E60;34090C042D321C1D1E104F50615152;353504111F53546C55433C6F3E;362E200721220D5644;3723334567;382526242F08015758703D6759;390B123408016246703C3D5A84;3A360A270728292A5B636465;3B02130E2B47483E66;",
  ";00090002272A536C4C4D4E41717A;0100300F3103233C6151523F66;020004180E032406150543405D;03000C041A1D340617054A5E6B4F50;04002D1B555F;050B112526321C2B3C42654B3E60;060A2E2014100547546246;0712070D161F566A;0822192F0148453D44;092C083301575868695B633C3D;0A0937131E495C6459;0B020721282903727A3F3E5A;0C020427032A05536C4C4D4E416D;0D0C04300F03233C6F61515266;0E38180E24061543405D;0F0B001A1D3406174A5E6B4F5078;100A002D1B555F;1100112526321C2B3C42654B3E60;12002E2014100147546246;130012070D161F566A6D;140922192F080148453D44;152C083301575868695B633C3F3D44;160413031E495C6459;17020C0407212829033E5A;1802272A536C4C4D4E41;190B300F3103233C61515266;1A0A180E032406150543405D;1B1A1D340617014A5E6B4F50;1C2D1B555F;1D112526321C2B3C42654B3E60;1E092E2014100147546246;1F12070D161F56736E6A3F;200422192F080148453D44;210C042C083301575868695B633C3D;22131E495C6459;230B0207212829033E5A;240A0227032A05536C4C4D4E41;25300F31233C61515266;26180E2406150543405D;271A1D340617054A5E6B4F50;28092D1B555F;29112526321C2B3C42654B3F3E60;2A042E2014100147546246;2B0C0412070D161F566A67;2C22192F0848453D44;2D0B002C083301575868695B633C3D85;2E0A0013031E495C6459;2F0002072128293E5A;300002272A05536C4C4D4E4175;3100300F31233C6151526E676D66;3209180E2406150543405D;331A1D340617054A5E6B4F503F76;34042D1B555F;350C04112526321C2B3C6F42654B3E60;362E20141047546246;370B12070D161F566A67;380A22192F08014845703D6744;392C083301575868695B63703C3D74;3A131E495C6459;3B02072128293E5A;",
  ";00000207282931032B717A6E5D59;01000314473C5A;020A000427182526300F1D16062A054F506A;03360B00041A1906055562464066;04002D2C154A5E6B6C733F788B;0512111B0E1E17483C3E;060C2E20321C016869655F;0753544960;08350907210D230810015B63564B3D77;091324081F014C4D4E453C423D;0A2203342F57586461515244;0B02032C4341727A3E;0C0A020407282931032B055D6D59;0D360B040314473C6F5A;0E3827182526300F1D16062A4F506A3F;0F001A19065562464066;10000C2D2C154A5E6B6C86;110012111B0E1E17483C3E;123509002E20321C0168696E655F;13005354495C6D60;1407210D230810015B63564B3D7F;1537130324081F014C4D4E453C423D;160A042203342F57586461515244;17360B0204033343413E;1802072829312B5D3F59;190314473C5A;1A0C27182526300F1D16062A054F506A;1B1A1906055562464066;1C35092D2C154A5E6B6C;1D12111B0E1E17483C3E;1E2E20321C016869655F;1F5354495C60;200A0407210D230810015B63564B3D80;21360B04130324081F014C4D4E453C423D;2222342F5758646151523F44;2302033343413E;24020C072829312B055D59;2514473C5A;26120927182526300F1D16062A054F506A;271A1906055562464066;282D2C154A5E6B6C76;2912111B0E1E17483C3E;2A0A042E20321C016869655F;2B360B045354495C6760;2C07210D2308105B63564B3F3D77;2D00130324081F014C4D4E453C423D;2E000C22342F57586461515244;2F00023343413E;3035090002072829312B05755D59;310014473C676D5A;3227182526300F1D16062A054F506A67;331A1906055562464066;340A042D2C154A5E6B6C;35360B0412111B0E1E17483C6F3E;362E20321C6869653F5F;375354495C6760;380C07210D230810015B6356704B3D677774;391324081F014C4D4E45703C423D;3A350922342F57586461515244;3B023343413E;",
  ";000A00220362463C44;010B00072128291D334F50645D;02360002230605534855423F59;03000212300F24060568695A;0400042E27342A495C403C8C;050C04184A5E6B3E66788D76;06091A1B2B15014C4D4E;07352D321C14175B636151526577;0811130E16080147546C433C6A3D5F;0920070D190801563D60;0A0A032C2F104541;0B0B252631031E1F57584B3E;0C362203056246717B3C3F6D44;0D072128291D334F50645D;0E020423065348554259;0F00020C0412300F240668696E5A;1009002E12342A495C403C;113500184A5E6B3E66;12001A1B2B15014C4D4E;13002D321C14175B63615152656D77;140A11130E0316080147546C433C6F6A3D5F;150B20070D03190801563D60;1636032C2F104541733F;17252631031E1F5758727B4B3E;1804220362463C44;190C04072128291D334F50645D;1A09022306055348554259;1B3502120D0F24060568695A;1C2E27342A495C403C;1D184A5E6B3E66;1E0A381A1B2B15014C4D4E;1F0B2D321C14175B63615152657F;20363711130E0316080147546C433C6A3F3D5F;2120070D03190801563D60;2204032C2F104541;230C042526311E1F57584B3E;2409220562463C44;2535072128291D334F50645D;26022306055348554259;270212300F24060568695A;280A2E27342A495C403C6F;290B184A5E6B3E66;2A361A1B2B15014C4D4E3F81;2B2D321C14175B6361515265678074;2C0411130E03160847546C433C6A3D5F;2D000C0420070D190801566E3D60;2E09002C2F104541;2F35002526311E1F57584B3E;300022056246703C44;3100072128291D334F50645D676D;320A02230605534855426759;330B02120D0F2406056869755A;34362E27342A495C403C3F;35184A5E6B3E6676;36041A1B2B154C4D4E81;370C042D321C14175B6361515265677774;380911130E16080147546C433C6A3D675F;393520070D190801563D60;3A2C2F104541;3B2526311E1F5758704B3E87;",
  ";00001D2F10575868694F503C;0100122B1F495C5564;0209000207222829140605655D44;03000216063305474C4D4E51526A4B3F;04000C042E300F193C6159;0504182C43403E5A;06271A1E2A014A5E6B6C5B6342;070B2D1B1366;080A112526321C0815013C3D;0920032308170153546246413D;0A07210D310324565F;0B0E033448453E60;0C091D2F1005575868694F50717B3C6D;0D122B1F495C553F;0E020C04072228291406655D44;0F000204160633474C4D4E51526A4B;10002E300F193C6159;110B00182C43403E5A;120A00271A1E2A014A5E6B6C5B6342;13002D1B13036D66;14112526321C030815013C6F3D;1520032308170153546246413D;160907210D31032456735F;170E344845727B3F3E60;180C041D2F10575868694F503C;1904122B1F495C5564;1A0207222829140605655D44;1B0B0216063305474C4D4E51526A4B;1C0A2E300F193C6159;1D182C43403E5A;1E38271A1E2A014A5E6B6C5B6342;1F2D1B130366;2009112526321C030815013C3D;21202308170153546246413F3D;220C0407210D3103565F;23040E3448453E60;241D2F1005575868694F503C;250B122B1F495C5564;260A0207222829140605655D44;270216063305474C4D4E51526A4B;282E300F193C6F616E59;29182C43403E5A;2A09271A1E2A014A5E6B6C5B63427988;2B372D1B133F6766;2C0C04112526321C0308153C3D;2D0004202308170153546246413D;2E0007210D3124565F;2F0B000E3448453E60;300A001D2F1005575868694F50703C89;3100122B1F495C5564676D;320207222829140605655D6744;330216063305474C4D4E7551526A4B;34092E300F193C6159;35182C43403F3E5A;360904271A1E2A4A5E6B6C5B634278;37042D1B136766;38112526321C0815013C3D67;390B202308170153546246413D;3A0A07210D3124566E5F;3B0E03344845703E60;",
  ";003509001E2F554C4D4E453C51525D5F;010057586C646160;0200020E06100543;0300020721282923061F0565;0400042E2224533C7344;05360B04182526300F34335B633F3E74;060A1A13016246404B59;070C2D2B4A5E6B5A;0827111B0314082A0148413C3D;0920321C310316080148413C3D;0A35090319154754495C42;0B12070D1D2C174F50563E;0C1E2F05554C4D4E45717B3C51525D6D5F;0D57586C646160;0E02040E061043;0F360B0002040721282923061F653F;100A002E2224533C44;11000C182526300F34335B633E;12001A1303016246404B59;13002D032B4A5E6B6D5A;14350927111B0314082A0148413C6F3D;1520321C310316080168696A3D66;1619154754495C426E;1712070D1D2C174F5056727B3E;18041E2F554C4D4E453C51525D5F;19360B0457586C64613F60;1A0A020E06100543;1B020C0721282923061F0565;1C2E2224533C44;1D182526300F34335B633E;1E3509381A1303016246404B59;1F2D032B4A5E6B5A;2027111B14082A0148413C3D;2120321C3116080168696A3D66;22040319154754495C42;23360B0412070D1D2C174F50563F3E;240A1E2F05554C4D4E453C51525D5F;250C57586C646160;26020E06100543;27020721282923061F0565;2835092E2224533C6F44;29182526300F34335B633E;2A1A13016246404B5982;2B2D2B4A5E6B675A76;2C0427111B0314082A48413C3D;2D360B000420321C3116080168696A3F3D66;2E0A0019154754495C42;2F000C12070D1D2C174F50563E;30001E2F05554C4D4E45703C51525D5F;310057586C6461676D608E;323509020E0610054367;33020721282923061F057565;342E2224533C6E44;35182526300F34335B633E7974;3637041A13036246404B5982;37360B042D2B4A5E6B3F675A76;380A27111B14082A0148413C3D67;390C20321C3116080168696A3D66;3A0319154754495C42;3B12070D1D2C174F5056703E;",
  ";0000302007210D341556;01000217455D;020A0025262B2F060557586C5F;030B001406056246603C8F;0436000207282916105B6364656A;0537130E191F47483E;0622300F2C0168693F44;07021E33495C40413C;08090C04184A5E423D59;093504121A1B0308014C4D4E51524B3D5A;0A02272D321C1D232A4F507E61;0B1124535455433E66;0C0A2E2007210D341505566D;0D0B0217455D;0E3625262B2F0657586C;0F00140662463C4260;10000207282916105B6364656A3F79;1100130E191F47483E;1209350C0422300F032C01686944;1335000204031E33495C40413C6D;1418310308014A5E6B3D59;15121A1B0308014C4D4E51524B3D5A;160A02272D321C1D232A4F507E61;170B1124535455433C6F6E3E66;18362E2007210D341556;190217455D;1A25262B060557586C3F5F;1B14060562463C4260;1C09020C0407282916105B6364656A;1D3504130E03191F47483E;1E22300F032C01686944;1F02031E495C40413C;200A183108014A5E6B3D59;210B121A1B08014C4D4E51524B3D5A;223602272D321C1D232A4F507E61;231124535455433C3E66;242E2007210D34150556717C3F;25021745735D;26090C0425262B2F060557586C5F;27350414060562463C4260;280207282916105B6364656A74;29130E03191F47483E;2A0A22300F2C01686944;2B0B021E33495C40413C6F67;2C36381831034A5E6B3D59;2D00121A1B08014C4D4E51524B3D5A;2E0002272D321C1D232A4F507E613F;2F00112453545543727C3C3E66;3009000C042E2007210D34150556;313500020417455D676D;3225262B2F060557586C70675F;331406056246703C426084;340A0207282916105B6364656A;350B130E191F47486E3E;363622300F032C7544;37021E33495C40413C67;38183108014A5E6B3F3D675976;39121A1B08014C4D4E51524B3D5A;3A09020C04272D321C1D232A4F507E61;3B35041124535455433C3E66;",
  ";000A002E27202C2A475462464B;010B0002070D1E5666;02002F06150548456E5D;0300061705575868695B633C;040002130323495C645F;0507212829249060;0609341001534C4D4E415152;070212300F31031F3C61423F;080418220E032B080143403D44;090C041A1D14080833014A5E6B6C4F503D;0A0A022D1B16556A59;0B0B112526321C193C653E5A;0C2E27202C2A05475462464B6D;0D02070D1E5666;0E2F061548455D;0F000617575868695B633C85;10090002371323495C645F;11000721282903243F3E60;12000403341001534C4D4E415152;1300020C0412300F31031F3C61426D;140A18220E032B080143403D44;150B1A1D140833014A5E6B6C4F503D;16022D1B16556A59;17112526321C193C6F653E5A;182E27202C2A475462464B;1902070D1E5666;1A092F06150548455D;1B061705575868695B633C3F79;1C0204130323495C645F;1D0C040721282903243E60;1E0A03341001534C4D4E415152;1F0B0227300F311F3C6142;2018220E2B080143406E3D44;211A1D140833014A5E6B6C4F503D;22022D1B16556A59;23112526321C193C653E5A;24092E27202C2A0547546246717C4B;2502070D1E56733F66;26042F06150548455D;270C04061705575868695B633C;280A02130323495C645F;290B07212829243E60;2A341001534C4D4E415152;2B0212300F311F3C6F614267;2C3818220E032B0843403D44;2D001A1D140833014A5E6B5B4F503D78;2E0900022D1B16556A59;2F00112526321C19727C3C653F3E5A;3000042E27202C2A05475462464B;3100020C04070D1E56676D66;320A2F0615054845705D67;330B061705575868695B63703C74;34021323495C645F;3507212829243E60;36033410534C4D4E41755152;370212300F311F3C614267;380918220E2B080143403D6744;391A1D140833014A5E6B6C4F503F3D76;3A02042D1B16556A59;3B0C04112526321C193C653E5A;",
  ";00002E20391C246869655D59;010002345354495C5A;023509002707210D062A055B6356515277;0300132B06054C4D4E453C66;04000203142F1557586473614B3F;0512161743416A3E;060C072829310319015F;07360B02032C476C3C6E60;080A04182526300F1D1E0810014F503D;09041A081F01556246403D;0A022D224A5E6B4486;0B111B0E2333483C423E;0C35092E20321C24056869655D6D59;0D02345354495C5A;0E2707210D062A5B635651523F77;0F00132B064C4D4E453C66;1000020C03142F15575864614B;11360B001203161743416A3E;120A0004072829310319015F;13000204032C476C3C6D60;14182526300F1D1E0810014F503D;151A081F01556246403D;163509022D224A5E6B44;17111B0E2333483C6F423E;182E20321C246869655D3F59;1902345354495C5A;1A0C2707210D062A055B635651527F;1B360B3713032B06054C4D4E453C66;1C0A020403142F15575864614B;1D041203161743416A3E;1E0728293119015F;1F022C476C3C60;203509182526300F1D1E08104F503D;211A081F01556246403D;22022D224A5E6B3F447891;23111B0E2333483C423E;240C2E20321C24056869717C655D59;25360B021C5354495C6E5A;260A042707210D062A055B6356515280;270413032B06054C4D4E453C66;2802142F15575864614B;2912161743416A3E;2A35090728293119015F;2B022C476C3C6F6760;2C38182526300F1D1E08104F503F3D;2D001A081F01556246403D;2E0002092D224A5E6B4476;2F360B00111B0E233348727C3C423E;300A00042E20321C24056869655D59;31000204345354495C676D5A;322707210D062A055B6356705152677774;33132B06054C4D4E45703C66;34350902142F15575864614B;3512161743416A3E;36072829310319753F5F;37022C476C3C6760;380C182526300F1D1E0810014F503D67;39360B1A081F01556246403D;3A0A02042D224A5E6B44;3B04111B0E2333483C423E;",
  ";00090038041A221B194C4D4E44;0135000C042D321C2C335B6361655D77;02002E11130E1E06054754433C59;03001220070D0605565A;0400272F2A454142;050B252631032357583E66;06360A0324150162463C;07072128291D34174F50644B;080208015348553F3D5F;0902300F2B080168693D60;0A09041410495C403C6F;0B35090418161F4A5E6B6C5152403E;0C1A221B19054C4D4E6D44;0D2D321C2C335B6361655D77;0E2E11130E1E064754433C6E59;0F0B351220070D0306565A;10360A0027032F2A454142;1100252631032357583E66;12000324150162463C3F;1300072128291D34174F50644B6D;1409020408015348553D5F;1535020C04300F2B080168693D60;161410495C403C;1718161F4A5E6B6C51526A3E;181A221B194C4D4E4481;190B0A2E11130E031E06054754433C59;1A360A2E11130E031E06054754433C59;1B1220070D030605565A;1C27032F2A454173423F;1D252631032357583E66;1E090424150162463C;1F350C04072128291D34174F50644B;200208015348553D5F;2102300F2B080168693D60;221410495C403C92;230B18161F4A5E6B6C51526A3E7893;24360A1A221B19054C4D4E44;252D321C2C335B6361655D7F;26372E11130E031E06054754433C3F59;271220070D030605565A;280904272F2A454142;29350C042526312357583E66;2A2415016246703C;2B072128291D34174F50644B67;2C02085348556E3D5F;2D090002300F2B080168693D60;2E360A001410495C403C;2F0018161F4A5E6B6C51526A3E;30001A221B19054C4D4E717D3F4481;31002D321C2C335B6361655D676D8074;3209042E11130E1E06054754433C6F6759;33350C042720070D0605565A;34272F2A454142;35252631235758703E6687;36241562463C;370B072128291D34174F50644B67;38360A023A015348553D675F;3902300F2B08016869753D60;3A1410495C403C3F;3B18161F4A5E6B6C727D51526A3E76;",
  ";0000380C041A23104A5E6B5B63;010004122D1B13241F838A;020A002E11252622321C3406053C5D44;030B00200306330553544641;040007210D312B5659;050E031448453E5A;060E1D162F2A01575868694F503C6A;0719495C556466;0809020728292C081501515242653D;09021E081701474C4D4E3F3D;0A0C04300F3C6F614B5F;0B041843403E60;0C0A1A2310054A5E6B5B636D;0D0B122D1B1303241F838A94;0E2E11252622321C34063C5D44;0F002003063353546C624641;100007210D31032B5659;11000E031448453E5A;120900271D162F2A01575868694F503C6A;130019495C55643F6D66;14020C040728292C081501515242653D;1502041E081701474C4D4E3D;160A300F3C614B5F;170B1843403E60;181A23104A456B5B6378;19122D1B1303241F9583;1A2E11252622321C033406053C5D44;1B200306330553546C6246416E;1C0907210D31032B567359;1D0E1448453F3E5A;1E0C04271D163B2A01575868694F503C6A;1F0419495C556466;200A020728292C081501515242653D;210B021E081701474C4D4E3D;22300F3C614B5F;231843403E60;241A2310054A5E425B63;25122D1B1303241F;26092E11252622321C033406053C5D44;272006330553546C6246413F;280C0407210D312B5659;29040E1448453E5A;2A0A271D162F2A01575868694F50703C6A89;2B0B19495C55646766;2C020728292C0815515242653D;2D00021E081701474C4D4E3D;2E00300F3C614B5F;2F001843403E60;3009001A2310054A5E6B5B63717D7988;310037122D1B13241F3F676D;320C042E11252622321C3406053C6F5D6744;33042006330553546C624641;340A07210D312B5659;350B0E03144845703E5A;36271D162F2A575868694F503C6A;3719495C55646766;38020728292C081501515242653D67;39021E081701474C4D4E756E3D;3A09300F3C614B5F;3B184340727D3F3E60;",
  ";000A003837041A1316624640425D6A5F;01360B00042D194A5E6B4B60;020009111B032C06100548413C;030020321C310310061F056869;0400224754495C7344;05070D1D334F505651523F3E;063509232F01554C4D4E453C59;070C24575864615A;0802270E34082A01433D;09020721282908016E653D66;0A0A042B15536C3C6F;0B360B0412182526300F14175B633E;0C1A13031605624640425D6A6D5F;0D2D03194A5E6B4B60;0E2E111B33061048413C;0F0020321C31031E061F68693F;1035090022034754495C44;11000C070D1D334F505651523E;1200232F01554C4D4E453C59;130024575864616D5A;140A0204270E0F082A01433D;15360B0204072128290801653D66;162B15536C3C;17121825260D0F14175B633E;181A1316624640425D6A5F82;192D03194A5E6B4B3F60;1A35092E111B032C061048413C;1B0C20321C31031E061F056869;1C224754495C44;1D07121D334F505651523E;1E0A04232F01554C4D4E453C59;1F360B0424575864615A;2002270E34082A01433D;2102072128290801653D66;222B15536C3C;2312182526300F14175B633F3E;2435091A13031605624640425D6A5F;250C2D03194A5E6B4B60;262E111B2C06100548413C;2720321C311E061F056869;280A04224746495C44;29360B04070D1D334F505651523E;2A232F01554C4D4E45703C59;2B2457586461675A96;2C02270E34082A433D;2D0002072128290801653F3D66;2E3509002B15536C3C;2F000C12182526300F14175B633E;30001A1316624640717D425D6A5F82;31002D194A5E6B4B676D6076;320A042E111B2C06100548413C6F67;33360B0420321C311E061F0568696E;3422034754495C44;35070D1D334F50567051523E;36232F554C4D4E453C59;3724575864613F675A;38350902270E34082A01433D67;39020C07212829080175653D66;3A2B15536C3C;3B12182526300F14175B63727D3E7974;"
]);
var God = _God;
var _Phase = class _Phase2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Phase2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Phase2(index);
  }
  static fromName(name) {
    return new _Phase2(name);
  }
  next(n) {
    return _Phase2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Phase, "NAMES", ["\u6714\u6708", "\u65E2\u6714\u6708", "\u86FE\u7709\u65B0\u6708", "\u86FE\u7709\u65B0\u6708", "\u86FE\u7709\u6708", "\u5915\u6708", "\u4E0A\u5F26\u6708", "\u4E0A\u5F26\u6708", "\u4E5D\u591C\u6708", "\u5BB5\u6708", "\u5BB5\u6708", "\u5BB5\u6708", "\u6E10\u76C8\u51F8\u6708", "\u5C0F\u671B\u6708", "\u671B\u6708", "\u65E2\u671B\u6708", "\u7ACB\u5F85\u6708", "\u5C45\u5F85\u6708", "\u5BDD\u5F85\u6708", "\u66F4\u5F85\u6708", "\u6E10\u4E8F\u51F8\u6708", "\u4E0B\u5F26\u6708", "\u4E0B\u5F26\u6708", "\u6709\u660E\u6708", "\u6709\u660E\u6708", "\u86FE\u7709\u6B8B\u6708", "\u86FE\u7709\u6B8B\u6708", "\u6B8B\u6708", "\u6653\u6708", "\u6666\u6708"]);
var Phase = _Phase;
var _Sixty = class _Sixty2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Sixty2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Sixty2(index);
  }
  static fromName(name) {
    return new _Sixty2(name);
  }
  next(n) {
    return _Sixty2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Sixty, "NAMES", ["\u4E0A\u5143", "\u4E2D\u5143", "\u4E0B\u5143"]);
var Sixty = _Sixty;
var _Sound = class _Sound2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Sound2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Sound2(index);
  }
  static fromName(name) {
    return new _Sound2(name);
  }
  next(n) {
    return _Sound2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Sound, "NAMES", ["\u6D77\u4E2D\u91D1", "\u7089\u4E2D\u706B", "\u5927\u6797\u6728", "\u8DEF\u65C1\u571F", "\u5251\u950B\u91D1", "\u5C71\u5934\u706B", "\u6DA7\u4E0B\u6C34", "\u57CE\u5934\u571F", "\u767D\u8721\u91D1", "\u6768\u67F3\u6728", "\u6CC9\u4E2D\u6C34", "\u5C4B\u4E0A\u571F", "\u9739\u96F3\u706B", "\u677E\u67CF\u6728", "\u957F\u6D41\u6C34", "\u6C99\u4E2D\u91D1", "\u5C71\u4E0B\u706B", "\u5E73\u5730\u6728", "\u58C1\u4E0A\u571F", "\u91D1\u7B94\u91D1", "\u8986\u706F\u706B", "\u5929\u6CB3\u6C34", "\u5927\u9A7F\u571F", "\u9497\u948F\u91D1", "\u6851\u67D8\u6728", "\u5927\u6EAA\u6C34", "\u6C99\u4E2D\u571F", "\u5929\u4E0A\u706B", "\u77F3\u69B4\u6728", "\u5927\u6D77\u6C34"]);
var Sound = _Sound;
var _Taboo = class _Taboo2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Taboo2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Taboo2(index);
  }
  static fromName(name) {
    return new _Taboo2(name);
  }
  next(n) {
    return _Taboo2.fromIndex(this.nextIndex(n));
  }
  static _getTaboos(data, supIndex, subIndex, index) {
    const l = [];
    const d = data[supIndex].split(";", -1)[subIndex].split(",", -1)[index];
    for (let i = 0, j = d.length;i < j; i += 2) {
      l.push(_Taboo2.fromIndex(parseInt(d.substring(i, i + 2), 16)));
    }
    return l;
  }
  static getDayRecommends(month, day) {
    return _Taboo2._getTaboos(_Taboo2.dayTaboo, month.getEarthBranch().getIndex(), day.getIndex(), 0);
  }
  static getDayAvoids(month, day) {
    return _Taboo2._getTaboos(_Taboo2.dayTaboo, month.getEarthBranch().getIndex(), day.getIndex(), 1);
  }
  static getHourRecommends(day, hour) {
    return _Taboo2._getTaboos(_Taboo2.hourTaboo, hour.getEarthBranch().getIndex(), day.getIndex(), 0);
  }
  static getHourAvoids(day, hour) {
    return _Taboo2._getTaboos(_Taboo2.hourTaboo, hour.getEarthBranch().getIndex(), day.getIndex(), 1);
  }
};
__publicField(_Taboo, "NAMES", ["\u796D\u7940", "\u7948\u798F", "\u6C42\u55E3", "\u5F00\u5149", "\u5851\u7ED8", "\u9F50\u91AE", "\u658B\u91AE", "\u6C90\u6D74", "\u916C\u795E", "\u9020\u5E99", "\u7940\u7076", "\u711A\u9999", "\u8C22\u571F", "\u51FA\u706B", "\u96D5\u523B", "\u5AC1\u5A36", "\u8BA2\u5A5A", "\u7EB3\u91C7", "\u95EE\u540D", "\u7EB3\u5A7F", "\u5F52\u5B81", "\u5B89\u5E8A", "\u5408\u5E10", "\u51A0\u7B04", "\u8BA2\u76DF", "\u8FDB\u4EBA\u53E3", "\u88C1\u8863", "\u633D\u9762", "\u5F00\u5BB9", "\u4FEE\u575F", "\u542F\u94BB", "\u7834\u571F", "\u5B89\u846C", "\u7ACB\u7891", "\u6210\u670D", "\u9664\u670D", "\u5F00\u751F\u575F", "\u5408\u5BFF\u6728", "\u5165\u6B93", "\u79FB\u67E9", "\u666E\u6E21", "\u5165\u5B85", "\u5B89\u9999", "\u5B89\u95E8", "\u4FEE\u9020", "\u8D77\u57FA", "\u52A8\u571F", "\u4E0A\u6881", "\u7AD6\u67F1", "\u5F00\u4E95\u5F00\u6C60", "\u4F5C\u9642\u653E\u6C34", "\u62C6\u5378", "\u7834\u5C4B", "\u574F\u57A3", "\u8865\u57A3", "\u4F10\u6728\u505A\u6881", "\u4F5C\u7076", "\u89E3\u9664", "\u5F00\u67F1\u773C", "\u7A7F\u5C4F\u6247\u67B6", "\u76D6\u5C4B\u5408\u810A", "\u5F00\u5395", "\u9020\u4ED3", "\u585E\u7A74", "\u5E73\u6CBB\u9053\u6D82", "\u9020\u6865", "\u4F5C\u5395", "\u7B51\u5824", "\u5F00\u6C60", "\u4F10\u6728", "\u5F00\u6E20", "\u6398\u4E95", "\u626B\u820D", "\u653E\u6C34", "\u9020\u5C4B", "\u5408\u810A", "\u9020\u755C\u7A20", "\u4FEE\u95E8", "\u5B9A\u78C9", "\u4F5C\u6881", "\u4FEE\u9970\u57A3\u5899", "\u67B6\u9A6C", "\u5F00\u5E02", "\u6302\u533E", "\u7EB3\u8D22", "\u6C42\u8D22", "\u5F00\u4ED3", "\u4E70\u8F66", "\u7F6E\u4EA7", "\u96C7\u5EB8", "\u51FA\u8D27\u8D22", "\u5B89\u673A\u68B0", "\u9020\u8F66\u5668", "\u7ECF\u7EDC", "\u915D\u917F", "\u4F5C\u67D3", "\u9F13\u94F8", "\u9020\u8239", "\u5272\u871C", "\u683D\u79CD", "\u53D6\u6E14", "\u7ED3\u7F51", "\u7267\u517B", "\u5B89\u7893\u78D1", "\u4E60\u827A", "\u5165\u5B66", "\u7406\u53D1", "\u63A2\u75C5", "\u89C1\u8D35", "\u4E58\u8239", "\u6E21\u6C34", "\u9488\u7078", "\u51FA\u884C", "\u79FB\u5F99", "\u5206\u5C45", "\u5243\u5934", "\u6574\u624B\u8DB3\u7532", "\u7EB3\u755C", "\u6355\u6349", "\u754B\u730E", "\u6559\u725B\u9A6C", "\u4F1A\u4EB2\u53CB", "\u8D74\u4EFB", "\u6C42\u533B", "\u6CBB\u75C5", "\u8BCD\u8BBC", "\u8D77\u57FA\u52A8\u571F", "\u7834\u5C4B\u574F\u57A3", "\u76D6\u5C4B", "\u9020\u4ED3\u5E93", "\u7ACB\u5238\u4EA4\u6613", "\u4EA4\u6613", "\u7ACB\u5238", "\u5B89\u673A", "\u4F1A\u53CB", "\u6C42\u533B\u7597\u75C5", "\u8BF8\u4E8B\u4E0D\u5B9C", "\u9980\u4E8B\u52FF\u53D6", "\u884C\u4E27", "\u65AD\u8681", "\u5F52\u5CAB"]);
__publicField(_Taboo, "dayTaboo", [
  "8319000776262322200C1E1D,06292C2E1F;0F11185C0001092A0D7014692983847B7C2C2E302F802D2B,06454F208A;111852838470795B302F404533802D152B39201E23221D212726,0F2E1F010D29;004023222089,0F29111847;11180001032A0D70795B2C2E302F802D4E152B33714161201F26,52095847;0F17000102061979454F3A15477677,241F8A20;34357C89,7129;1551000403706A454F3A3D771F262322271E1D21,382B415220;0F000102037039297175261F1D21,454F2E156341;00076A54196348767765,7920297115528A0D382B;11180001020439332C2E302F2B5844477515634C1F2721,0F520D19267A29717020;297170192C2E2D2F2B3E363F4C,0F5215632001034720;4C78,297172380D2A2E0F474841;18115C0001702A2C2E2F5283847129795B6375802D154C,1F208A24;1811795B032C2E302F802D4163754C27261E1D2120,010D0F29521F;00401D232289,71290F4720;0F170001020E032A70692C2E302F802D2B0D7129474C201F2322,5211183809615D;0F1811000102062A0D2C2D804B2B672E2F7129,70471F8A20;0007343589,0F71296B7080;175447440D15838477656A49,2B2E1F8A2022;11187129705B79000106032A0D397B6F7C802D2C2B61756627261E0C1D21,0F2E154147;0007385476771548,52061F20;0106111839513A2C2E2D2F8C804B4723221F63,71522920;1118000717161A2C2E3371292B56433D6375363F,0F010347208A;161A7889,292E1F0F3861;11180F00012A0D70795D7B7C39332D2C2E4E4863664C,064F478A20;5452838479195D00012A0D7B7C2C2E3348156366242526201E,0F7129;00262789,292C2E1F2B2F;040318111A17332C15290D200C7A,47450638;0004031A170F11332C2E302F1571292A657677451949,70201D52;007B343589,88;00010670175B71292A152322271E,03637C2B38;04067033392C7161262322271E1D210C,;000715547776,521F;181100012C2E2F1F,0F38;70076A363F,2920;7889,292E1F;0F707B7C00012F75,5220;528403395B2F1E20,0F01;4089,88;02060418110D332C2E415B637566262322271F20,520F;0F181100012C2E7129,5220;7C343589,88;0001020603691817452C2E2D498344,412B6A096338;393589,88;076A48,45752F29384C0F204F612B;000301394F2E154763751F27,0F707A802629710D1920;4F2C2E2B383F443D433663,0F01478A2015;201E27262322,89;0F000102700D335283845329711563,38048A7D4520;6A0339332C20528384531563,29713801000F0C47806B;005089,88;291503000D332E53261F2075,0F5238584F45;003989,88;3435000789,88;150001021745512E443D65262322,2B63387C;394889,88;00036A7415384878,45751F20240F522E834F;00010203332C2E2F1558631F,0F1920707A29712646;0717363F1A2C4F3A67433D8B,71290F010347;",
  "0007010618111A332D302F15262322271E530270164C,560F7129;003989,88;073918111A17332C2E71292322271F1E20481D45548384,38002F70;700F181126151E20001A7919,;5040262789,0F712903;7911192C2E302F00030401060F1571292A75,707C2052;0079701811072C2E01060F33152627200C7A1A302F4576631F2B,80523829;39343589,88;040370181123220F1326271E2021,2915;262322271E202189,1F45;0001060403232226380F767754,56802015;0070071A010618110F5B52846775,632620;00010607155B5C26271E2021165D83,38470F29;3948007889,;528384530339454F0D297115332E2F637520,0F007058;5283845444360F11756415,2C2F29016B472E2B2038;0039504089,;0F0001022E792D3E75663D19,472063703852292B;0F000102032971152C2E19,4720637038522B;343589,88;0F52838403700D332C29712E1F27201E2322,15450175;00261F23221E201D2189,;003989,88;52838454754C2971150301022E,0F63206A0938268A41;151A83842627202322,580F7003632E1F297C;00394C786F89,0F2E4420;0704031118528384542D2E4E49201F1E1D2127,292B000C;0F706A151E201D528384544466,47010C2E292F2C38;394089,71294709636F7C44;0F0003450D3329712C2E2F1575,528A63705A20587D7C;0F111829711500010370390D332E750C201F,4552832F382B80;0034353989,522E1F;0F1118032A0D545283841A802D2C2E2B71296366774744201F26232221,010900150C;0006261F1E201D212322,0F29381118;0006547677,0F5229151F20;111800010206071979697C67474475664C,0F16298A20;000102071283542627201D210C4C78,29580F2E6352032E1F;00784C793989,0F29702E1F208A;0F03390D332C1929711563261D2E2322,382000521118750C706B;702D155483840F63262720,53292F017D4F38442B2E1F47;4089,030F565A61206B;0F181179005B712980152D4E2A0D533358,5270208A;0776776A742623221F200C211D1E,11180F2F5206802B;00343589,060F52;07565A5283845463756677261F20,010F152961;0007363F8B3989,09292C208A0F;0F11181200171A7919547638,5215201D;181179000607040D03302F5283844F3A45512B1533664C47,090F702E208A;838454151A4C200C1E23221D212726,030F522E1F;0039787989,1F2E20;111871545283842979397B7C69152B2A0D33485324251F1D1E26,6B00702F800C20;0F18110001027939706954528384685D15565A75201E1D26,29032E;00170F79191A6540,712909387C20;00676589,0F20;0F00071A706A717677492923221E202726,80522E1F;343589,0F5220;111800020D041A796933483E5347446563751F1D212026,010F09150C;262322271E201D21,52450F4F;0038262389,5215;040307177938494C,0F262070;",
  "0F00030102705283842E544779,2920454F754C38;00010275261E0C2322,6303706F0F292E1F;033945302F838475262720,297071000F2E1F38;000102030F7039453319152E2D2F63751F0C1E20,71290D3847;7917155B0001025D,0F522E3820;38394089,0001202B;0F00175058,5D6B80382E;110F0001702C2E7129201F,5206;0007396A48343589,0F20;111800012A0D2C705271292E201F,15386179;3F656477,0F2B712920;11000170792C2E7129,0F52201F;110F00017052792E1F1E,71290D2B20;0001020626232227201E,0F2E03801F;1179302F842627201E,0071292E1F;0001067052842E71291F20,030F384775;79026A17657603,522E201F;004089,0F014720;010206110F452C2E7129095B5226232227201F0C,58804B036B2B38;69687011180F791966762627201E,0352292E80;00077B7C4834353989,295220;00170F332C2E2D2F802952443F26232227201F,15637C38;006526232227201F,89;0403010218111A17332C2E2D2B15713E6575,4538206429;0007030401021811171A0F2E2322271F1E706749528483,202F2938;000102081A158483262322270C1E,700F292E;1A162623227954,0001710F29;00061A161718110F292A0C26271F21797001022F49,47;1516291211020056,063820;3840,0001202B89;0403080618111A16332E2F152A09537919702C5445490D75072B,80632038;0001081811171A160F1571292A26271E20396476452B0D,632E5238;7B34,88;010206040318110F2E292A27200C70072C302F541F392B49,3815;64262322271F2021,0F2F2938;0002070818111A16175B153E445D5452848365647576,2038454F;000701020618111A1752848354230C7027,26203829;000102261E2027,03476F700F2971382E;15391A302F83845475662627201E,0F702E46290047;0F150370002E0D3979528384532971331F1E20,477D;0F0302791566046F,29710D722A38528384202E45;383940,6370018A75202B454F66;3907,88;0F000170390D332E2971152F63751F1E20,52846A38;00397C343548,89;000102030D70332C2E29712F534426201F1E,0F3815;6526232227201F,88;7100030170391959152E2D2F2B,0F201F4F75668A38;0F030102392E15634447001F1E,293845200D7075;00161A5D454F153826201E27,7D0D29;1A454F548384,88;0F00010203700D332E2F1929711552838453261F201E2322,;0F171170792F5B1566770001032C2B802D,29387C2071;50400089,88;5C11180001027170520D2984832B15200C,03802E3863;2E260F27201F,523815292F1A;7B7C343589,520F;00060724232227261F2025,520F157929382F;003F651F0C2027232289,0F29;00076A386563,0F7D8A2066454F52754C;",
  "00077663,0F29713820;000304080618110F1A2E2D0D3371292A2C302F7566010239454E802B,6320;181117332C2E1526232227201F1E3E,38030F5229;0103040818111A155284262322271E20217A79708330,38472E63;00483F,6338200F;03041A174533302F56795B3E808339528454,700F2920;17262322274050,80387C6B;000F01111A1615292A2627200C2C670279538384543E49,6345;00010618111A16332C2E2F2D27200C07483A450D,15528438;34357B7C,88;002E2F18110F5B3315292A26271F20210C7A70710102393E19,035A;000304111A33152D2E302F71292A5284530770022B,0F634520;1A16170F13152654,3852204F;0018112C2E01040607332D292A09270C2322696870302F47023945,38205280;18111A16175B3315262322271F1E201D215D838454433E363F754551,00030F29;00700F1715262720,472E3863;3F88,2B38200F;030402111A16175B4F3A2B153E0079015D54528483696A51,7006200F;000F1320,63803829;0079181A165B332F2B262322271E2021030469702D4E49712930845D,454F;00030401061A16170F332E71292627200C02696A45514F0D2C2D4E497A,2B;007C343589,88;0F00701784831952712C2E1526271F,03380620;52848353000103297115332E2F19,0F8A514F6A66207545;6A170F19,5845754C201F4F3824;0F000301020D297115332E1F0C,16522026;1545332C2E2F84836375662620,0F0003700D71292B;000102060F17705283797823221E2027,2E7129;3F74397677658988,0F384720;5452848303152F802C2D,2E1F208A7A700F29710C7D;00010F17505840,565A803852838463;0F00030102700D19297115332C2B535448,2E45208A;0F03000102700D29713963451F0C20,528338542F158061;34357B7C89,030F;118384155B20272E1F21,0F0338;0001020607036A5D397C2163664744,0F4E25208A;5483846376656419786A,29803020;0F18110001702C2E71291F0D2B152F2127,52831620;1784832C2E5B26201F,0F010D29;00797084831754,0F2E472D4E1F;000739483F66,0F208A2B;54528384036F796A153E65,712963;0F17795B54838458,52807C38;0F5C111800015B712952841F20,756A25;01067071292C2E1F20,1103150F52;343589,0F715229;0F170070792C2E261F,0403412322;03027011170D332D2C2E2F716152838454,010F201F;6A170F1963766F,5452201F;030102703945802D2C512B7129092322270C7566,112E5283;1A5D453A332C2E2F4B25262322271F201E1D21,000F7047;007984831A160F1719,632E20471D6B;483F89,88;040318111A16175B795452848315302F6563395D,38702920;000F1323222627,2E38290315;010203040618110F3315292A271D200C6339171A712C2E30491E21,7A;0039262322271E201D210C0748766465776A,150F3829;3435,88;007018111A1617192E15382627201F656477,4F09;00030418111617332E2D2F292A52845407020D302B,090F4520;",
  "528384530003010215392C20,1112180F29560D2E1F7545;004D64547589,0F29;2A0D11180F52848353037039156358332C2E,38200026;00702C2E164C157126271F1E202425363F,29386A032B;005089,032C2E1F;0F00010206030D7129302F79802D7C2B5C4744,11701D20528438;000403110F527079156523221E2027,0129802E1F6B;00384089,15296763;000102060775261F20,71290F7015;1100010206702D804E2B2620,0F52540D;0007397B7C343589,01065220;0776776564,000F293820;00010206111803302F565A802D4E2B881F261E0C,0D0F52;00763989,0F20;110F70528475660D7129,012E1F2026;0001020617385483,030F47202B6B;0039787089,2E1F8A034F206B;0706397B7C794C636A48,520F71294720;02703918110F7919155283756626232227201E,012C2E1F0C;00384089,0F202E157C;5C0001020652835B0E03804B2D4E2B752024210C,292E565A;000103020611187B7C2D4E616439201E0C26,522E4744;000734357B7C3989,0F52832920;88,;0004031811171A5B332C2E155D52,0D292045;0089,090F15;18110F197983842E230C271F1E7A70525463,26202915;00011A1615262322271F1E200C214C,472B0F11;00190F153917701A48,472E1F2003;11037B7C2E2F7129,0F5220;007952151E20,0F2E1F;00384740,0F20;0006522E261F20,0F7129;0F11000170717B,522E1F;007B7C3989,88;076564,0F2920;,88;393589,88;0F03700D33195284835329711563,01260038206B;0F70161715232238838426271F20,7D0352;70504C7889,88;0001030239450D297115332C2E4C,0F54207052843863;110F03706A795215636626271E,0C012F38062C292B;0040395089,88;000103392E54837548,19700F58157A2038;00010203390D3329152C2B751E20,2E1F544753524583;0039343589,88;3F4889,88;000102033911170D3319152E2F0947442627201F,;393489,88;0F0102037039330D5284832971152E1F0C,0026206B;001A1715838444363F261F1E200C2322,0F476B520363;0070784889,0345201F;000102031118396375664819,1D413870208029;0370833F0F6A5215,010D582E1F202C2F5829;00387765504089,0F157C;070039201F0C2789,06030F292F;003926271E20747677642322480C06,2E1F;00073934357B7C89,0F52;073F7765644889,0120;",
  "0F110001702E2F71291F20,06;110001527B7C2E75,0F20;0F11707129,2E1F20;1811002E1F8384,0F20;0F1A0070153871291F20,7A76;3F6589,88;0F1811700001062E2F1F20,7129;18117915384C,5220;07404826271F1E2089,88;0F00010203700D332E2F192971152B52838453631F20,;00037039041A26271F1E202322,0F2F2C335129452E0D3A;0039343589,88;0F0001020370332E2F0D19297115637566302B2C3979,;528384000103451915332C2E631F2720,29716A0D0F70;653989,88;0F00010203528384157033,752971206B452F2B262E;0F000102700D332C2E297115383F631F20,034756;394889,88;528384530370331929272E2B2F631F1D20,0F156B38;1979,3F2F2E45207D;074048261F202322,0F71454F15000180;0F000102030D70332E3919528384532971152B2F201F0C,;0001020339161745514F2C190F1A152E2D2F304979,;3435073989,88;11180F5C000102030D332C2E195329711563261F202322,5284;5283840001032E1570637566302F391F,0F47297120;39701117302F713819297566,004551152C2E201D1F;0001020370528384631575712D2E4E3E581F1E1D,292C2B45262080;0F83843D363F776424,15462F2C5203297115;3F8B657789,0F2029702E7D;11180F0001020339700D29716375662E1F2620,38155680;03111A171538193E3F,0F632C2E70454F200C;110F1A6A702C2E1952838453712F6375,4520150001;5283845300010670802D2C2E4E155B201F1E232221,380F71296A;0F1118000102030D70332E2C192971153953631F0C262720,52846125;000739343589,0320;18110F3900010203700D3329711563752E1F0C201D,38525D;000102031811392E2D19528384543E4463751F20,152F1A290F;00657689,6B0F52;0001020311180F702E1F7952838468332D6749443E46630C1E1D21,292B20;0F1700707129385C363F3D1F1E232226,80412B202F;00398B7989,0F20;0F111800017C5C2C2E7129,5270153820;0F1118795B65170002195D,52382E8A20;0007711F204840,010F291538;000106025B75712904032D302F382B2A0D801E20,2E1F0F0F;0F1118060300017B7C792E39767566261F20,71298051;000739343589,8A20;074889,06520F38;5283845B79037B7C802D2C2E4E302F2B38493D4463664C1F2021,0F0D7129;63767789,522E0006206B;0F00010206181139702E1F686F6A792D2C304E153375664923221D21,52296B0D80;89,;3F8B6589,1F20;0370110F45510D3371290941614C522623222720,;1966583F6589,88;03700F,79192C2E2D715275262322271F201D2179;0F11700001522E71291F20,2B;0F117B7C2C2E71291F20,5203;00343589,88;",
  "00343589,7129565A;00060403702C2E4C154947443D651F,0D29;528384530339332E152C2F58631F20,380D000F29;006589,29704720;0F1118175C000301027039450D29332C2E2F15631F,8A5820;0F161A17452F0D33712C2E2B5443633F,150170208A03;70786289,06802E1F;0F0001020370390D332C1929712E157563548384534C,20248A;5B000102073911522C302F3A678C363F33490D482425200C1E2322,0F15382E1F61;00076A74504089,5229702C7D;0F110001708471292E1F20,0338805156;111817000106702C2E71292A0D33802D302F4E2B44,0F522520;0007343589,290F71;0F5B8370000102060403161A494447,386A418A20;11177B7C52842C2E5B1F20,060071292F0F;003889,52201F1D47;000102062A397129797B7C2E1F2425,162F5D2026;0F172C2E387129363F7566512D4E4461,0103475220;008354,06462F2E1F;0F181117795B5C007054292A0D690403332D2C2E66632B3D,8A454F38;030270170F45513A2C71295283842A0D532D24252623222720,155A382E1F;00076A0F3874485040,06707C25;5B71297000010611182A0D39792C2E332D4E80151F202621,52454F38;00077665776489,52830F208A;34357B7C7789,0F29;0F705B0004037C5D15653F1F26,522B4738;181179190E332C2E2D52637566262322271F20,;0076645089,88;0F1100017B7C702E7129,522B;1A38712975,0F20;0026271E20,2F2E1F;18117001061579,712920;0F11707B7C5271291E20,2E1F;0F00074850,8A20;0F1811705200012E71291F20,38;18117000012C2E7129,5220;88,;0F18110001261F20,0352;037B7C2E2F261F20,0F;006389,88;0F030001027039452971150D332C2F6327,20528384;020F11161A17454F2C2E2D302F2B38434C,20700163;003989,88;0F00010D0302703352838453297115632E,208A454F;03027039450D332C2F2D2971528384636626202322,5815;006A5040077448,702B2C0F2F29;0F00030102700D332E2C192971155383846375261F1E20,;0001020370450D332C2E2D152971,0F52838A201D;343589,88;52838454443D65002C2E15495D1F,0F417D712B3863;528384546315332C2E2F26201F2322,0F0D45002971756B;003889,88;393589,88;2C2E2D2B156343364C,0F4729710D708A20036A19;00788B89,0671292E;11180F000152548471702C2E2D4E303348492A156144474C63,8A201F384506;0F0300017039712952542D2C302F80380D2A363F3349483E616320,1118150C1F2E;0F006A385040740717,1F7063;0F1118000102030D70332C2E192971158384535426201E2322,471F;77766564000789,0F52201E8A;",
  "110001392E1F20,0F7129;00343589,88;0F1152702E2F71291F20,0001;0F1152702E2F71291F20,7A;00385476,521F;0F528400012E7129,0920;363F6526232227201E89,88;0F11700001397129,2E20;0F0001067C1F20,5229;0F705215261E20,012E1F;0F001A651707,565A58202E1F4763;297115030102195283840D332C2E,0F1F5863201D8A;0039077426271F1E20,0F29713852832B63;343589,88;0F03706A4F0D332C528384532E29711563,45007500;0F0370010239332E2C19528384532971156375262720,;003854637519,205D1D1F52151E21;0001020352666A,0F7020262938172F;00261F2322271E200C89,;007083624C,0F38202E7D4F45471F71;0F000102030D332C2E195283845329716375261E2322,;0F033915666A52261E272048,382E2F6329712C01;003989,88;00010203450D3329152C2E2F5375,0F638A6A1D8A38;39006A26201F,0F520D38580629712B;343589,88;528384542E03700F111869565A7566631F1E2021,297138000C;0F1118000102030D70332C2E195283845329711563261F0C20,47457525;00173883546365756619,466115201F701D475224;0F18000102111A1703154F2C2E382D2F807566,7163708A1F207D;5D0007363F232227261E21,037C0F471F20;0F00701A17830E544C5C78,7129632E1F38208A452F;2C2E5B000739337C38802D44484C2425201F1E272621,52297015;0F11185C0370332D152322528384636626271E,2F292C2E1F000106;000F7765,2E1F7C46;111879690001020370396A2E2D528384543E637566,0F380D580F2920;00013974150726271F1E200C,0F06520D297170382B45;34353989,0F20;0F528471295B795D2B155333565A446375661F201E272621,00016B0C41;0F181100010603797B7C802D302F2B6743441F202322,2952477D25;11180F71297000010604032A0D793969302F33802D636675,201F52565A1E;11180F000704030D7C684580302F153867534775,702041;00262322271F1E203F8B65,52290F0380;002C7080305C784C62,2E1F4720;000704036939487C4466,0F70112938;54528384700001020339482D301571565A363F637566,06292B201F8A;005040,522E1F0F2C20;18110001032A0D845B7129302F791533536678,0F208A1F1D;076A7626271F1E20,0D0F29382F2E;7B7C343589,0F70;11180F71297052838454792A0D33802D153853201F1E212627,012F564766;0001067011185B0D332C2E2D712909262322271F200C,0F526325;00195475667689,5229152E20;0004037B7C0F79494766754667,80293869208A;003F657789,7152290F032B;525400045B17791A565D754C7866,2E1F207C;71297C790001062A0F802D,5215705D;0470170F191A134C8384662426232227201E,;00170F7665776489,;074889,88;",
  "0F0001020D700339332C192A83842971152E1F0C20262322,0652563861;1F2027260076232289,0F295283;34357C89,0111180F2920;0F030001022A0D3945297115528384637020,476A382E1F44;5B11180001020328700D332C2E195283847115632F751F2720,290F4766;0F0001021A175D2C19152E302F7183846379,8A20704F754541;0F11180300706A2E1549466319,292F26806B382B207545;00704F0D332C2E2D15363F261F20274C,0F2906036F47;0F11180001027039302971542F7526201E,63472E151F58;390001022C2E302F1575804B2D261F20,0D0F0319707D5229717A;076A79040363660F5D363F,52292E1F20382F155601;006A38075040,0F630141202B454F;0F1118000106287129705B032C2E302F802D4E2B201F,5284583841;002876396577261F20,5283290F;07343589,0652;181100012A0D52842953411E20,2E1F0F4715;0F0001062871292E7C528384032C5C2A15767765,11185D8A206B;0F181138171A7975665B52845415,47701F8A20;0F181100062839707952542C2E302F03565A7566441F1E,0D29802B20;0F280001363F8B4326232220,2E1F47032F7D;0F17000728705448757A,522E1F15562F;00076A74173926271F1E20,0F7029522B;04170F79195D1A637566363F76,01522E8A20;700718111A302F717566,0F2B2E20;11180F000128032A0D7129302C2E2F2D802B09411F1E20,52845438;0076777566262322271F201E,0F11185229;34357C89,8A20;010670170F0E3A294152838454262322271F201E,2E181544;01023918112E2D493E52756624262322271F20,;04033918110F0D2C2E7129332D2B72528384547566,;017018110F1A2E15495247838463462322271F,;0F000106387129,2E1F;0F707500261E20,382E1F;181100012C2E2F1F20,0F52;181170792C2F7129,5220;07504089,0F01;0F0001062E7129,5220;7665261F20,0F29;077C343589,88;0F18117052000171291E20,2E1F;0F181100017B7C2E71291F20,036F;181100015B3875,2E20;0F000102702E15471F1E,294F2B452C2F2680;0F000102700D332C712E15261F201E,80036A614738;0001020370392F80712B546675201E26,1F58472E15;0039076A7426271F2048,0F79197029717A38;04031975363F6366,0F5401202C5283842E2F;3807504089,88;00020370454F0D3933192C2E2D156375261F202322,0F71;003F261F202789,88;343589,88;002627651E20232289,88;0F0D33000103452E528384297115752620,63386F70;0003391983845475,2E1F0F6A702971722A0D;0F00010203703915632719792322,8026204529715875;002E4344793F26271F20,03702C2F292B381A;001A2B5448701938754C,152E202425;0039332C2E2D2F152B4644261F1E,0F7019382971637A;11180370392A0D3329712C2F156375795B5D,450C8A00382E1F2001;5040000738,0F7D7C584F012063452B;",
  "000150402627,0F292F2B;0079110F0304062A528423222627207A19701A2C2E2F5D83,2945;001779332D2322271E2007760304,38290F;0007343589,71297063;0004037039180F332D152952262322271F0C533A83,41178047;0079192E2F030417332D1552847A5D,4E20;001A170F1379232227761926,712938;88,26205283;001A170F5B332E2D7129261E203E5D,15035283;007022230726,2E17712952302F;00077A7089,88;88,;07262723221F40,0F712952;0F000102070D70332C2E19528384297115637526201E2322,;03392D2E332F211D201F1E27,0F7015380029710D1958;343589,88;0F0102700D332C2E2F0319528384531529716345261F2322,;5283845300031929150D332C2E63,0F217045208A7175;006A79190F6F2627,6B4620453829;00211D1E232289,;0F7045332C2E71201F1D21,47011552295303;00704889,88;0F00040370396A742E15444948,458A384F20;5283845303702971150D2F,388A6A6D0F20;0007504089,88;0F00010203700D332C2E1929711552838453637526202322,;393589,88;007C343589,88;0F11180003706A4F0D332C2E192971155363751F20262322,5247464161;528384545363000103332E15,0F1F197029710D757D20;0F006A1938271779,565A4575522F801F1E63;001D23221E2789,52290F2E1F20;0F175B3975660745514F2B4825201E211D,010352292E;007007482089,2E1F5847;0F110039702C2E522F1574487B7C2D4E804B,098A20453861;111852838453546319297115030D332B2C,060F8A2E38201F;0007504089,0F291570;030102062C2E543E3D636679,380D1946297100;0339332C2E302B66201D1F27,0D2971010015520F6B;34357B7C89,7129;0F111800010203700D332C2E192971152F4B49471F270C2322,52562B20;0F111800010203391929710D1552838453,2075708A45630941;00177689,0F52804F25;00396577647969271E2322,52012E1F262061;1707702C2E71291F20,0F52000106111D;0070,0F292C2E791F;0F18110001702C2E7129,6F454F098A20;705283845B0D2F71,0F202E41;0007504089,060F71702F29;0F5C5B0001032A0D7052842C2E71291F20,1118517D46;07762623221F1E20,000F1552296B2F;89,6B;181100012A0D2C2E2F2B2D304E447129841F,0F0941613820;03020E0F18110D332C2E2D2F4971293E615244756653,8A2025;000F76,032E1F522C292B;0028397976771E232227,0F522E474420;7039170F45513A2C2E7129242526271F201D,0001035215;0001027007834878,2E388A201D;703911170E2C2E2D2F4B15712952633D,092B8A20;03047039171A533852443D363F,;",
  "111879076A1A171523221E272024,5229700F1D012E292B0C2F;390050404C89,0F5283296920;261F1E20232289,52290058363F;0F0001020370332C2E2F1575261F,2971476A45835238;0007343589,0F292F7020;00021719792B155D5466774962,010611180F2920;0F1118528384530001035C702971152B332C2E63201F1E23222621,6B75452D4F80;00177179546A76,0F52443D1F;0001020603700F7B7C2E1F692D48302F565A586366240C21,2B151A2920;0F1A1716007015713F261F2720,5263587D2B4703;005C702C2F802B154C78,5A562E1F208A454663;00037039454F0D332971152C4C48,090F476341382E;11185283847975661271393D692D15565A201E262322,292F060D0C;004089,0F52;767789,5283002920;0F111800010206032A0D097170292D302F1575761320,521F4725;000739343589,520F;181179838454637566,0F52290120;5C0F1811790070528471291F20,2F03805125;003854767789,2E1F5220;0F18110001707B7C0D7129,52565A152B20;170007386A7448363F261F1E,030F79636F20;11180F000102587B7C5283847971302F804B2B497675,09612E1F20;705C4C39171A4F0E7971295B5248,0F2E1F1D;076A171552847983546578,712970010F;004C504089,0F521547;7665262322271F201E21,0F00298071;00010206090D5B7952838454685D7B7C443D77656366201F1E,030F47454F;343589,88;790F181113332C2E2D302F1554,70012038;00040301067018111A0F332C15292A261E200C7A7919712F5D52838454,5617454F;003826232277,632E2052;000106073018110F3329271E0C7A0D75,38262015;0F005B261F20,2E2F;384C,8A20;076A696819,0F29;036F791E20,522E1F;00654C89,;262322271F1E20,7129;0F18117000012E71291F20,527A;0039343589,;1811795B5466,0120;0F1811705200012E71291F20,062B;003F89,88;000102035270392E2D5863,0F381D2B29212015;00391A6A15384C4943363F7448,0F0379472B63;00701A17794C0F302F715475,2E454F8A2024;000102037039714515750D33,201D381F092E0F11;5283845479036A2627201E,0F380D70297115012F;4C4089,88;261F201E232289,;002627241F1E20232289,;0039343589,88;0F0211195465756679,2F384570202B6A;0F0052037029710D332C15,7545584F8A201D21;0F003854,20521D21;0F0001020370390D1952838453542971631F0C,1520;0F0001022E154826271F1E203874362322,0363;0001020370392F2971152B54754C,458A1F0F2046;000370396A450D332F4B154C,0F208A7D41381F2E;",
  "00790F072C2E0103047018111A262322271E7A302F5448637545,29381556;6A79363F65,0F292B71;000118111A332C2E2D1571292A23222627200C7A791970302F5D5283845456,387C454F;000118111A332C2E2D1571292A2627200C7A1979,387C;00040318110F1519262322271E2021,52831F38;0039343589,88;00390103040618111A17332C2E262322271E157A7071302F45631F2075,807C;000118111A16175B154C26271E200C232279302F5D528384547543,0F297C7A;074889,88;88,;010670181126271F202165,2938;000770171989,0F2E2038;000106040318111A170F33292A26276A201D0C7A71077C1F1E74694F,52;88,;5283845354037029711575262720,631F58000F2E3801;0F0001020370390D3319297115632E2C752620212322,;0339332C2E1575201E26,0F520D631F29712A724738;343589,88;0F00030D70332C2E3952838453542971156375,6B20;00010203396A79637566201D211E,29387D71707A;00076527262322,1552835A201D0F38;3989,;1500443626271F1E,29710F47380D195203;000789,;0F0370390D332C192E2971637547202322,5815;031A2B7915656A,0F177001204529710D632E2F;0F03700D332C2E2971152F52838463,01004547380C;0F000102030D7033528384534529711520,634758;006A6F391974,0F2E614447702C292F71201F3852;34357B7C89,0F20;11180F00010E715229702E79692C2D2B15093954444C66,2F565A8061;000102033945332C6375201D21,0F1929710D70;07487677393F89,0F2952151F1D;0F17000102060370392E52838453331F,452F2C266A79292B2038;161A0F1526271F4C,5861034738;3950177089,522E1F0F20;11180F0001020370391952845329712B632E7B7C792D2C8020,385D15;00046A7966444C7765,010C202F38520F70292E;70545283842E71291A7933192A5D5A5040,090C384F45208A1D6B;0F11180006032A0D70332E011954838471152C202322,58477D63;0F111800037039450D2971332C632026,1F2E2B385283;003934357B7C89,0F20;00481F2023221E27262189,0F292C2E;18117900012C2E5B1F20,0F710D5229;000776776548,0F1118152E1F20;5254700001020612692D4E584647336375662E1F1E,71290D2620;006A583F232227261F20,0F29154703;00077089,522E1F8A20;0F5C707971292C2E0E032A0D6A804B2D8C2B3348634C,521109154620;04795B3F651A5D,0F52010620;117154528384292C2E302D4E092A0D50407970443D,56804100;18115452840001712970802D2C2E302F2B2A0D78791F,0F20475861;0F1811000104037115454F7677657B7C392023222726210C,52092E1F;34350089,0F20;0F111800171A454F514E3A3871157765443D23221E262720,80612E1F;111800010206037939695483845D2D2E4E446375661F262120,0F52290D71;767779392623222789,152B1F1D20;000102060717706A33392D2E4E674447482322271E210C,71292B4F20;0F171511793F76584C,0347200C1D;000789,88;"
]);
__publicField(_Taboo, "hourTaboo", [
  "0F520120,6D61;0F7083520115000255,80262F;707A000855,0102;0100380806,707A2E2C;0F8352150255,70717A7D01002C0306;0F707A0120002C0855,88;,88;0F71832952202C,7A7D0102;0F70835201150255,2E2C;0F295220380255,707A01000306;0F83295201200255,70717A7D2C;0F707A0120002C0855,80262F;707A000855,0102;0F708352150255,2E01002C0806;0F522055,707A01000306;0F700120002C380855,;0F835201150255,70717A7D802C262F;0F70718329527A202C55,0102;,88;0F702952200255,7A7D01000306;0F7083527A01150255,;0F70012000380255,80262F;000855,70717A7D012C02;0F7071527A2055,2E2C;0F522055,707A01000306;0F7001200255,;0F7071297A0115202C55,80262F;0F71832952002C380806,707A0102;0F70835201150255,7A2E2C;0F200255,707A01000306;,88;0F700120002C0855,7A7D80262F;0F7083527A1555,0102;0100380806,2E2C;0F20190255,70717A7D01002C0306;0F707A0120002C0855,88;0F520120,707A6D80262F61;0F7083521555,0102;0F7071297A0115200255,2E2C;0F2952200255,707A01000306;0F835201150255,70717A7D2C;0F7001200255,80262F;,88;,7A2E7D2C;0F712915202C55,707A01000306;0F7029018020002C38,;0F835201150255,70717A7D802C262F;0F70718329527A202C55,0102;0F71832952012002,2E6D2C61;0F7029527A200255,01000806;0F71290115202C,707A55;01002C380806,707A80262F;0F8352150055,70717A7D012C02;0F715220,707A2E2C55;,88;0F7001200255,7A7D;0F835201150255,707A80262F;0F7183295220002C380806,707A010255;0F718329522002,707A2E2C55;0F2952200255,707A01000306",
  "0F700120000255,;0F70290120000855,6D61;0F707129527A15802C381955,01000806;0F7101200019020655,707A2C;0F200855,707A2E01002C0306;0F7183520115802C0255,707A;0F700120000255,;,88;0F70297A01202C380955,;0F8352150255,707A01002C0306;0F0120000855,707A2E2C;0F7071297A01158020002C0855,;0F7083520115000255,;0F70717A01201955,6D61;0F7071295215802C3855,01000806;0F0120000206,707A2C;0F290120000855,707A2E2C;0F7083527A0115202C0255,;0100380806,2E2C;,88;0F707129527A011580202C380255,;0F7083520115000255,;0F71202C1955,707A;0F707129527A1556802C1955,;0F202C4B,707A01000306;0F71201955,707A6D61;0F70202C55,01000806;0F0120000206,707A2C;0F7101201955,707A2E2C;0F7129521556802C0255,707A01000306;01002C380806,;,88;0F7129527A0115802C380255,;0F83520115000255,707A2C;0F202C0855,707A01000306;0F7129521556802C1955,707A;0F700120002C0855,;202C,6D61;0F71295215802C3802,01000806;0F2002,707A01002C0306;0F29012002,707A2E2C;0F708329527A0115202C0255,;01002C380806,;,88;0F71295215802C380855,707A01000306;0F83520115000255,707A;0F0120000855,707A2E2C;0F707129527A1556802C1955,;0F7083520115000255,;,707A01000306;0F707129527A15802C3855,01000806;0F290120000855,707A2C;0F71201955,707A2E2C;0F7183520115802C02,707A55;0F202C0855,707A01000306;,88;0F0120002C086C,707A55;0F83520115000255,707A2C;0F2901202C3809,707A55;0F7129521556802C196C,707A0100030655",
  "0F70297A0120000855,80262F;0F832952202C,0102;0F71832952012002,7A2E7D2C;0F712915202C55,707A01000306;0F718329520120002C380802066C,707A;707A01000855,80262F;0F7083527A1555,0102;0F7001200255,2E2C;,88;0F7071297A15202C55,01000806;0F7083527A0115000255,80262F;0F83521555,70717A7D012C02;0F70718329527A200255,2E01002C0806;0F52,0120002C080306;0F7183295201202C02,7A7D;0F708352150255,01800026082F06;0F7071297A20002C38080655,0102;0F0120000855,707A2E2C;0F708352150255,0120002C080306;0F832952202C02,01000806;,88;0F7071297A15202C55,0102;0F708352011500380255,2E2C;0F202C4B,01000806;0F71832952202C0255,707A;0F7083527A01150255,80262F;0F71832952202C,7A7D016D02;0F712915202C,01800026082F06;0F71292055,707A01000306;,707A01000806;0F7083527A0115000255,80262F;0F71832952202C,0102;,88;0F712915202C,707A01000306;0F835201150255,707A;0F70835201150255,80262F;0F70717A201955,0102;0F7001200255,2E2C;,707A01000306;0F7071297A15202C55,01000806;0F70297A012000380855,80262F;0F2920,70717A7D016D2C02;0F708352150255,2E01002C0806;,707A01000306;,88;0F7083527A01150255,2E2C;0F8352150038,707A010255;0F83520115000255,70717A7D2C;,707A01000306;0F5220,01000806;0F70297A0120000855,80262F;0F712915202C,016D000806;0F70718329527A01200038080206,2E2C;0F832952202C02,707A01000306;0F835201150255,707A;0F7083527A01150255,80262F;,88;0F7071297A011520002C55,;0F708352150255,01000806;0F8352150255,70717A7D01002C0806",
  "0F71832952202C02,707A;0F7029527A0120000255,;0F7071527A202C55,88;0F71295215802C3802,707A01000306;55,707A01000806;0F292055,707A2E2C;0F708329527A202C0255,01000806;0F708352150255,01000806;0F202C0855,707A01000306;,88;0F8329520115200255,707A2C;0F7083527A01150255,;0F7129521556802C1955,707A;2C3808,707A01000306;70297A0120002C0855,88;29202C,6D61;0F708329527A202C0255,01000806;0F71522055,707A2E01002C0806;0F7129521556802C0855,707A01000306;0F7083520115000255,;0F71290120002C080206,88;,88;0F0120004B,707A2C;0F8352150255,707A2E01002C0306;71295201155680002C0855,707A;0F70290120002C06,;0F832952202C0255,01000806;71295215802C38,01000806;0F7071832952202C0255,01000806;0F70718329520120002C080255,;0F70718329527A202C0255,;0F7083527A01150255,;0F70717A01200008190655,88;,88;0F8329520115200255,707A2C;0F708329527A0115202C0255,;0F707129527A011556802C026C,;2C38,01000806;0F202C0855,707A01000306;0F70712952011580202C380255,;0F718329522002,707A01002C0806;0F295201200255,707A2E2C;0F707129527A011556802C026C,;0F8352150255,707A01000306;0F70297A01202C0255,88;,88;0F8352150255,707A01002C0806;0F8352150255,707A2E01002C0806;0F712952155680202C0255,707A01000306;0F7029012000080255,;0F70718329527A202C0255,88;0F707129527A0180202C0255,;,707A01000806;0F832952202C02,707A01000306;707129527A01155680002C0855,;0F70832952011520002C0255,;0F832952202C02,01000806;,88;0F8352150255,707A01002C0306;0F83520115000255,707A2E2C",
  "0F83521555,70717A7D016D2C02;,2E2C;0F5220,707A01000306;0F0120000206,707A;0F835201150255,707A80262F;0F70717A202C381955,01000806;0F0120000206,70717A7D2C;0F7129202C1955,707A01000306;0F7083527A0115000255,;0F7083520115000255,80262F;,88;0F70717A0120003808190655,2E2C;0F8352150255,707A01000306;,2E2C;0F7083527A01150255,80262F;0F70200006,7A7D016D02;0F7071297A01152055,2E6D2C41;2C38,01000806;0F290120000855,70717A7D2C;0F70835201150255,80262F;0F702920002C,0102;0F0120004B,2E2C;,88;0F70717A0120002C3808190655,;0F7083520115000255,80262F;,0102;0F7071527A01200655,2E2C;0F702002,7A7D01000306;0F7129011520002C,6D41;0F70835215380255,01800026082F06;0F200006,70717A7D016D2C02;,2E2C;0F83521502,707A0100030655;0F7083520115000255,7A7D;,88;0F70717A20002C3808190655,016D02;0F835201150255,70717A7D2C;0F7129202C1955,707A01000306;0F520120006C,707A55;0F7083520115000255,7A7D80262F;0F712915202C,707A016D02;0F70717A20381955,2E01002C0806;0F29202C02,707A01000306;0F83295201202C02,707A;0F70835201150255,80262F;0F7083521555,7A7D016D02;,88;0F71202C38081955,707A01000306;0F83520115000255,70717A7D2C;0F70835201150255,80262F;0F70527A2055,016D02;0F0120000206,707A2E2C;0F712915202C,707A016D00034106;2C38,707A01000806;0F83520115000255,70717A7D802C262F;0F832952202C,0102;0F7083527A01150255,2E2C;0F708352150255,7A7D01000306;,88;01002C380806,80262F",
  "0F8329520102,707A202C03;0F7183520115802C0255,707A;0F29522055,707A01000306;0F70718329527A01202C0255,88;0F707129527A15803855,202C03;0F71832952200255,707A2C03;0F71832952012002,707A2E2C;0F7129521556802C0855,707A01000306;0F700120000255,;0F70010255,202C03;0F707129520115800038,202C03;,88;0F29522055,707A2E01002C0306;0F707183527A0115802C0255,;0F70297A55,202C03;0F7071297A0255,202C03;0F718329520120002C080206,;0F29200855,707A01000306;55,707A2E01002C0806;0F7071295201155680000855,202C03;0F01004B,202C03;0F835201150255,707A;0F7129521580202C3855,707A01000306;,88;0F70297A55,202C03;0F707183520115800255,202C03;0F7183295201002C38080206,;0F29200855,707A01000306;0F70297A202C02,01000806;0F70297A01000855,202C03;0F712920,707A2E01002C080306;0F7129521556802C55,707A;0F8352150255,707A01000306;0F8352011502,707A55;0F29526C,707A202C0355;,88;0F718329522002,707A2E2C;0F71835215802C0255,707A01000306;0F70202C55,01000806;0F707A01000855,202C03;0F707129520115800038,202C03;0F290180202C380955,707A6D61;0F7029527A2055,01000806;0F707129527A1556802C0255,;0F71520106,707A202C03;0F70835201150255,202C03;0F718329520120002C080206,;,88;0F200255,707A2E01002C0806;0F70718352011580000255,202C03;0F715201066C,707A202C03;0F290180202C380955,707A;0F71295215802C3855,707A01000306;0F70717A20190255,016D00086106;0F712952,0120002C080306;0F70718329527A0255,202C03;0F7183295201002C38080206,707A;0F8352150255,707A01000306;0F70202C55,01000806;,88",
  ",88;0F832952200255,70717A7D01002C0306;0F70835201150255,88;0F7083527A01150255,2E2C;0F70202C55,7A7D0102;0F7029527A012055,2E2C;0F2920380855,707A01000306;0F83520115000255,70717A7D2C;0F7083527A01150255,80262F;0F52202C,016D02;0F70835201150255,7A2E7D2C;0F71832952202C0255,707A01000306;,88;0F835201150255,70717A7D802C262F;0F712952202C,0102;0F70527A012055,2E2C;700855,7A7D01000306;0F7071297A011520002C55,;0F8352011500380255,707A80262F;0F7083521555,010002;0F71290120,707A2E2C;0F71832952202C02,707A0100030655;0F7083527A01150255,;0F7001200255,2E2C;,88;0F707A01200255,2E2C;0F83521502,707A0100030655;0F0120002C086C,707A55;0F7083527A01150255,80262F;0F712915202C,016D02;0F2901203809,707A2E2C;0F708352150255,01000806;0F7183295201202C02,88;0F7083527A01150255,80262F;0F7083527A1555,0102;0F7071297A01152055,2E2C;,88;0F707A01200255,;0F70835201150255,80262F;0F52202C,016D02;0F71522055,707A2E2C;0F712915202C02,707A01000306;0F718329520120002C3802,6D41;0F7083527A150255,01800026082F06;0F71832952202C,0102;0F70527A012055,2E2C;0855,707A01000306;707A01000855,;,88;0F522055,70717A7D012C02;0F835201150255,707A2E2C;0F71832952202C02,707A01000306;0F707183295201202C0255,7A7D;0F7083527A01150255,80262F;0F71832952002C380806,016D0241;0F70200255,2E01002C0806;0855,707A01000306;0F700120002C0855,;0F70835201150255,7A7D80262F;0F712915202C,016D02",
  "0F290120002C0855,707A;,88;0F7071295201155680002C0206,;0F70832952011520002C0255,;0F70297A01202C0255,88;0F70712901158020002C380855,;0F8352150255,707A01000306;0F71201955,707A2E6D2C61;0F70297A0120002C0206,;0F710120002C3808190655,707A;0F290120002C0855,707A;0F71835215802C380255,707A01000306;,707A2E2C;,88;0F7071295201155680002C0855,;0F7083520115000255,;0F7120081955,707A01000306;0F7071295201158020002C380206,;0F0120004B,707A2C;0F71201955,707A;0F707129521556802C55,01000806;2C3808,707A0100030655;0F71201955,707A;0F70832952011520002C0255,;0F01200255,707A2C;,88;0F7129521556802C0855,707A01000306;0F70290120002C,;0F2901202C,88;0F71295201158020002C380206,707A;0F01200255,707A2C;0F71201955,707A2E016D002C036106;0F7129521556802C02,01000806;0F8329520120002C02,;0F70297A01202C0255,88;0F7083520115000255,;0F202C0855,707A01000306;,88;0F7071297A0120002C19020655,;0F83520115000255,707A;0F70297A01202C0255,88;0F71295215802C3802,707A01000306;0F835201150255,707A2C;0F71201955,707A2E2C;0F70712952155680202C0255,01000806;0F70290120000855,;0F202C0855,707A01000306;0F70718352011580002C380255,;0F7129202C1955,707A;,88;0F707129520115568020002C0255,;0F8352150255,707A01000306;0F70717A201955,2E2C;0F70290120002C0206,;0F01200255,707A2C;0F290120000855,707A2E6D2C61;0F707129521556802C55,01000806;01002C380806,;0F71201955,707A;0F718352011580002C380255,707A",
  "0F708352150255,01000806;0F707A010255,202C03;,88;2920002C0806,0102;0F7083527A01150255,2E2C;0F200255,707A01000306;0F7029527A0155,202C03;0F7083527A011500380255,80262F;0F83295220,70717A7D016D2C02;0F70717A201955,2E01002C0806;0F70527A2055,01000806;707A55,0120002C080306;0F70835201150255,80262F;002C380806,707A010255;,88;0F2002,707A0100030655;0F7029527A010255,202C03;0F0120002C4B02,80262F;0F7071297A15202C55,0102;0F70717A0120003808190655,2E2C;0F8329522002,70717A7D01002C0806;707A55,0120002C080306;0F7083527A01150255,80262F;29202C,7A7D016D02;0F7083520115000255,2E2C;0F71202C38081955,707A01000306;,88;0F70835201150255,80262F;0F7083521555,0102;0F7083527A01150255,2E2C;0F7071297A15202C55,01000806;0F700255,0120002C080306;0F835201150255,70717A7D6D802C262F61;,016D0002;0F70297A0120000855,2E2C;0F70200255,7A7D01000306;0F708329527A01150255,202C03;0F7083527A011500380255,80262F;,88;0F70717A201955,2E2C;0F708352150255,01000806;0F708352150255,0120002C080306;0F7083527A01150255,80262F;0F70717A2000381955,0102;0F290120000855,70717A7D2C;0F70202C55,01000806;0F70527A0155,202C03;0F70835201150255,7A7D80262F;0F7083521555,0102;0F70717A0120003808190655,2E2C;,88;0F7055,0120002C080306;0F70835201150255,80262F;0F7083521555,7A7D016D02;0F70297A0120000855,2E2C;0F71202C38081955,707A01000306;0F29522055,70717A7D2C03;0F708352150255,01800026082F06;0F522055,707A0102;0F71201955,707A2E2C",
  "71295215802C380855,707A01000306;0F835201150255,707A2C;0F832952011520000255,707A2E2C;,88;0F708352150255,01000806;0F8352150255,707A01000306;0F70718329527A202C0255,;0F292055,707A2C;0F83295201200255,707A2E2C;0F707129527A011556802C55,6D41;707A55,01000806;,707A55;0F70297A0120002C0855,;0F7083520115000255,;,707A2E01002C0806;,88;0F718329520120002C080206,;0F835201150255,707A;0F83295201202C02,707A55;,707A55;0855,707A2E01002C0306;0F707129527A1556802C55,6D41;0F7029202C55,01000806;0F700120002C0855,88;0F707129527A15802C3855,01000806;0F708352150255,01000806;0F71832952012002,707A2E2C;,88;0F7083520115000255,;0F835201150255,707A;71295215802C380855,707A01000306;,707A2C;0F0120000855,707A2E2C;0F7029012000080255,6D41;0F707152202C,01000806;0F71832952202C02,01000806;0F70718329527A01202C0255,;0F708329527A0115202C0255,;0F8329520120000255,707A2E2C;,88;0F8352150255,707A01000306;0F70835201150255,88;0F707A0120002C0855,;0F700120002C080255,;,707A2E01002C0806;0F71832952202C02,01000806;0F718329522C3802,01000806;0F2952202C55,707A;0F707129527A0115802C380255,;0F2901802000,707A2C;0855,707A2E01002C0306;,88;0F70832952011520002C0255,;0F7083520115000255,;0F707129527A15802C380255,01000806;0F718329522002,707A01002C0806;0F7183295201200002,707A2E2C;0F702901202C0255,6D41;2C38,01000806;0F7071297A2055,88",
  "0F7071201955,7A7D;0F71290115202C,707A80262F;0F70835215003855,016D02;0F835201150255,70717A7D2C;,88;0F520120,707A55;0F835201150255,707A80262F;0F71291520002C,016D02;0100380806,707A2E2C55;0F71201955,707A01000306;0F71295201202C,6D61;0F5220,01800026082F06;0F7071201955,7A7D016D02;0F7129011520,707A2E2C;2C3808,707A01000306;0F0120004B,70717A7D2C;,88;0F5220,016D02;0F70835201150255,7A2E7D2C;0F712915202C,707A01000306;0F70717A0120002C3808190655,;0F7083527A01150255,80262F;0F70200006,016D0261;0F5220,2E01002C0806;0F71201955,707A01000306;0F7129011520002C,707A;0F708352011500380255,80262F;0F83521555,70717A7D016D2C02;,88;0F5220,707A01000306;0F70835201150255,7A7D;0F835201150255,707A80262F;002C380806,016D02;0F201955,70717A7D2C;0F2002,707A016D00036106;0F5220,01000806;0F835201150255,707A80262F;0F71291520002C,016D02;0F708352011500380255,2E2C;0F8352150255,70717A7D01002C0306;,88;0F7083527A01150255,80262F;0F7083527A1555,016D02;0F7129011520,707A2E2C;2C3808,707A01000306;0F71201955,707A;0F7083520115000255,80262F;0F5220,016D0002;0F7071201955,7A2E7D2C;0F712915202C,707A01000306;0F7083527A011500380255,;0F835201150255,70717A7D802C262F;,88;0F7071520120002C06,;0F29202C55,707A01000306;0F7129011520002C,707A;0F8352011500380255,707A80262F;0F71201955,707A0102;0F700120000206,6D61;0F5220,01000806",
  "0F7183295201202C02,707A55;0F7029527A0120002C0255,;0F83520115000255,707A2C03;0F83520115000255,707A2E2C;0F7129521556802C1955,707A01000306;,88;0F7129202C196C,707A55;0F7183520115803802,707A202C0355;0F29522055,707A2C;0F71832952200255,707A2E01002C0306;0F718329520120002C080206,;0F290120000855,707A;0F700255,0120002C080306;707129527A011580002C380855,;0F204B,707A01002C0306;0F835201150255,707A;0F7071297A202C1955,;,88;0F707A01200255,88;0F71835215802C380255,707A01000306;0F7183295201202C02,;0F290120000855,707A2E2C;0F7071295201155680000855,202C03;01000855,707A;0F70717A201955,01000806;0F7129520115802C3855,707A;0F8329520115200255,707A2C;0F835201150255,707A2E2C03;0F707129527A1580202C55,;,88;0F70718329527A202C0255,88;0F70718352011580002C380255,;0F01200255,707A2C03;01000855,707A2E2C;0F7129521556802C1955,707A01000306;01002C380806,707A6D41;0F7071297A202C1955,01000806;0F707129527A15803855,202C03;0F01200255,707A2C;0F8352150255,707A01000306;0F71832952202C02,;,88;0F707A010255,202C03;707129527A011580002C380855,;0F29202C3809,707A01000306;0F71201955,707A;0F7071297A202C1955,;0100380806,6D202C0341;0F7029527A2055,01000806;0F71295215802C3855,707A01000306;0F835201150255,707A2C;0F832952011520000255,707A2E2C;0F7071295201155680000855,202C03;,88;0F29202C380955,707A01000306;0F7183520115802C380255,707A;29202C,707A;0F71292055,707A2E2C03;0F707129527A1556802C55,;0F71832952202C02,707A016D00034106"
]);
var Taboo = _Taboo;
var _Ten = class _Ten2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Ten2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Ten2(index);
  }
  static fromName(name) {
    return new _Ten2(name);
  }
  next(n) {
    return _Ten2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Ten, "NAMES", ["\u7532\u5B50", "\u7532\u620C", "\u7532\u7533", "\u7532\u5348", "\u7532\u8FB0", "\u7532\u5BC5"]);
var Ten = _Ten;
var _Terrain = class _Terrain2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Terrain2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Terrain2(index);
  }
  static fromName(name) {
    return new _Terrain2(name);
  }
  next(n) {
    return _Terrain2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Terrain, "NAMES", ["\u957F\u751F", "\u6C90\u6D74", "\u51A0\u5E26", "\u4E34\u5B98", "\u5E1D\u65FA", "\u8870", "\u75C5", "\u6B7B", "\u5893", "\u7EDD", "\u80CE", "\u517B"]);
var Terrain = _Terrain;
var _Twenty = class _Twenty2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Twenty2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Twenty2(index);
  }
  static fromName(name) {
    return new _Twenty2(name);
  }
  next(n) {
    return _Twenty2.fromIndex(this.nextIndex(n));
  }
  getSixty() {
    return Sixty.fromIndex(~~(this.index / 3));
  }
};
__publicField(_Twenty, "NAMES", ["\u4E00\u8FD0", "\u4E8C\u8FD0", "\u4E09\u8FD0", "\u56DB\u8FD0", "\u4E94\u8FD0", "\u516D\u8FD0", "\u4E03\u8FD0", "\u516B\u8FD0", "\u4E5D\u8FD0"]);
var Twenty = _Twenty;
var _Zodiac = class _Zodiac2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Zodiac2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Zodiac2(index);
  }
  static fromName(name) {
    return new _Zodiac2(name);
  }
  next(n) {
    return _Zodiac2.fromIndex(this.nextIndex(n));
  }
  getEarthBranch() {
    return EarthBranch.fromIndex(this.index);
  }
};
__publicField(_Zodiac, "NAMES", ["\u9F20", "\u725B", "\u864E", "\u5154", "\u9F99", "\u86C7", "\u9A6C", "\u7F8A", "\u7334", "\u9E21", "\u72D7", "\u732A"]);
var Zodiac = _Zodiac;
var _EarthBranch = class _EarthBranch2 extends LoopTyme {
  constructor(indexOfName) {
    super(_EarthBranch2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _EarthBranch2(index);
  }
  static fromName(name) {
    return new _EarthBranch2(name);
  }
  next(n) {
    return _EarthBranch2.fromIndex(this.nextIndex(n));
  }
  getElement() {
    return Element.fromIndex([4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4][this.index]);
  }
  getYinYang() {
    return this.index % 2 === 0 ? 1 : 0;
  }
  getHideHeavenStemMain() {
    return HeavenStem.fromIndex([9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8][this.index]);
  }
  getHideHeavenStemMiddle() {
    const n = [-1, 9, 2, -1, 1, 6, 5, 3, 8, -1, 7, 0][this.index];
    return n === -1 ? null : HeavenStem.fromIndex(n);
  }
  getHideHeavenStemResidual() {
    const n = [-1, 7, 4, -1, 9, 4, -1, 1, 4, -1, 3, -1][this.index];
    return n === -1 ? null : HeavenStem.fromIndex(n);
  }
  getZodiac() {
    return Zodiac.fromIndex(this.index);
  }
  getDirection() {
    return Direction.fromIndex([0, 4, 2, 2, 4, 8, 8, 4, 6, 6, 4, 0][this.index]);
  }
  getOpposite() {
    return this.next(6);
  }
  getOminous() {
    return Direction.fromIndex([8, 2, 0, 6][this.index % 4]);
  }
  getPengZuEarthBranch() {
    return PengZuEarthBranch.fromIndex(this.index);
  }
  getCombine() {
    return _EarthBranch2.fromIndex(1 - this.index);
  }
  getHarm() {
    return _EarthBranch2.fromIndex(19 - this.index);
  }
  combine(target) {
    return this.getCombine().equals(target) ? Element.fromIndex([2, 2, 0, 1, 3, 4, 2, 2, 4, 3, 1, 0][this.index]) : null;
  }
};
__publicField(_EarthBranch, "NAMES", ["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"]);
var EarthBranch = _EarthBranch;
var _HeavenStem = class _HeavenStem2 extends LoopTyme {
  constructor(indexOfName) {
    super(_HeavenStem2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _HeavenStem2(index);
  }
  static fromName(name) {
    return new _HeavenStem2(name);
  }
  next(n) {
    return _HeavenStem2.fromIndex(this.nextIndex(n));
  }
  getElement() {
    return Element.fromIndex(~~(this.index / 2));
  }
  getYinYang() {
    return this.index % 2 === 0 ? 1 : 0;
  }
  getTenStar(target) {
    const targetIndex = target.getIndex();
    let offset = targetIndex - this.index;
    if (this.index % 2 !== 0 && targetIndex % 2 === 0) {
      offset += 2;
    }
    return TenStar.fromIndex(offset);
  }
  getDirection() {
    return this.getElement().getDirection();
  }
  getJoyDirection() {
    return Direction.fromIndex([7, 5, 1, 8, 3][this.index % 5]);
  }
  getYangDirection() {
    return Direction.fromIndex([1, 1, 6, 5, 7, 0, 8, 7, 2, 3][this.index]);
  }
  getYinDirection() {
    return Direction.fromIndex([7, 0, 5, 6, 1, 1, 7, 8, 3, 2][this.index]);
  }
  getWealthDirection() {
    return Direction.fromIndex([7, 1, 0, 2, 8][~~(this.index / 2)]);
  }
  getMascotDirection() {
    return Direction.fromIndex([3, 3, 2, 2, 0, 8, 1, 1, 5, 6][this.index]);
  }
  getPengZuHeavenStem() {
    return PengZuHeavenStem.fromIndex(this.index);
  }
  getTerrain(earthBranch) {
    const earthBranchIndex = earthBranch.getIndex();
    return Terrain.fromIndex([1, 6, 10, 9, 10, 9, 7, 0, 4, 3][this.index] + (this.getYinYang() == 1 ? earthBranchIndex : -earthBranchIndex));
  }
  getCombine() {
    return this.next(5);
  }
  combine(target) {
    return this.getCombine().equals(target) ? Element.fromIndex(this.index + 2) : null;
  }
};
__publicField(_HeavenStem, "NAMES", ["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"]);
var HeavenStem = _HeavenStem;
var _PengZuHeavenStem = class _PengZuHeavenStem2 extends LoopTyme {
  constructor(indexOfName) {
    super(_PengZuHeavenStem2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _PengZuHeavenStem2(index);
  }
  static fromName(name) {
    return new _PengZuHeavenStem2(name);
  }
  next(n) {
    return _PengZuHeavenStem2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_PengZuHeavenStem, "NAMES", ["\u7532\u4E0D\u5F00\u4ED3\u8D22\u7269\u8017\u6563", "\u4E59\u4E0D\u683D\u690D\u5343\u682A\u4E0D\u957F", "\u4E19\u4E0D\u4FEE\u7076\u5FC5\u89C1\u707E\u6B83", "\u4E01\u4E0D\u5243\u5934\u5934\u5FC5\u751F\u75AE", "\u620A\u4E0D\u53D7\u7530\u7530\u4E3B\u4E0D\u7965", "\u5DF1\u4E0D\u7834\u5238\u4E8C\u6BD4\u5E76\u4EA1", "\u5E9A\u4E0D\u7ECF\u7EDC\u7EC7\u673A\u865A\u5F20", "\u8F9B\u4E0D\u5408\u9171\u4E3B\u4EBA\u4E0D\u5C1D", "\u58EC\u4E0D\u6CF1\u6C34\u66F4\u96BE\u63D0\u9632", "\u7678\u4E0D\u8BCD\u8BBC\u7406\u5F31\u654C\u5F3A"]);
var PengZuHeavenStem = _PengZuHeavenStem;
var _PengZuEarthBranch = class _PengZuEarthBranch2 extends LoopTyme {
  constructor(indexOfName) {
    super(_PengZuEarthBranch2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _PengZuEarthBranch2(index);
  }
  static fromName(name) {
    return new _PengZuEarthBranch2(name);
  }
  next(n) {
    return _PengZuEarthBranch2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_PengZuEarthBranch, "NAMES", ["\u5B50\u4E0D\u95EE\u535C\u81EA\u60F9\u7978\u6B83", "\u4E11\u4E0D\u51A0\u5E26\u4E3B\u4E0D\u8FD8\u4E61", "\u5BC5\u4E0D\u796D\u7940\u795E\u9B3C\u4E0D\u5C1D", "\u536F\u4E0D\u7A7F\u4E95\u6C34\u6CC9\u4E0D\u9999", "\u8FB0\u4E0D\u54ED\u6CE3\u5FC5\u4E3B\u91CD\u4E27", "\u5DF3\u4E0D\u8FDC\u884C\u8D22\u7269\u4F0F\u85CF", "\u5348\u4E0D\u82EB\u76D6\u5C4B\u4E3B\u66F4\u5F20", "\u672A\u4E0D\u670D\u836F\u6BD2\u6C14\u5165\u80A0", "\u7533\u4E0D\u5B89\u5E8A\u9B3C\u795F\u5165\u623F", "\u9149\u4E0D\u4F1A\u5BA2\u9189\u5750\u98A0\u72C2", "\u620C\u4E0D\u5403\u72AC\u4F5C\u602A\u4E0A\u5E8A", "\u4EA5\u4E0D\u5AC1\u5A36\u4E0D\u5229\u65B0\u90CE"]);
var PengZuEarthBranch = _PengZuEarthBranch;

class PengZu extends AbstractCulture {
  constructor(sixtyCycle) {
    super();
    __publicField(this, "pengZuHeavenStem");
    __publicField(this, "pengZuEarthBranch");
    this.pengZuHeavenStem = PengZuHeavenStem.fromIndex(sixtyCycle.getHeavenStem().getIndex());
    this.pengZuEarthBranch = PengZuEarthBranch.fromIndex(sixtyCycle.getEarthBranch().getIndex());
  }
  static fromSixtyCycle(sixtyCycle) {
    return new PengZu(sixtyCycle);
  }
  getName() {
    return `${this.pengZuHeavenStem.getName()} ${this.pengZuEarthBranch.getName()}`;
  }
  getPengZuHeavenStem() {
    return this.pengZuHeavenStem;
  }
  getPengZuEarthBranch() {
    return this.pengZuEarthBranch;
  }
}
var _TenStar = class _TenStar2 extends LoopTyme {
  constructor(indexOfName) {
    super(_TenStar2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _TenStar2(index);
  }
  static fromName(name) {
    return new _TenStar2(name);
  }
  next(n) {
    return _TenStar2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_TenStar, "NAMES", ["\u6BD4\u80A9", "\u52AB\u8D22", "\u98DF\u795E", "\u4F24\u5B98", "\u504F\u8D22", "\u6B63\u8D22", "\u4E03\u6740", "\u6B63\u5B98", "\u504F\u5370", "\u6B63\u5370"]);
var TenStar = _TenStar;
var _SixStar = class _SixStar2 extends LoopTyme {
  constructor(indexOfName) {
    super(_SixStar2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _SixStar2(index);
  }
  static fromName(name) {
    return new _SixStar2(name);
  }
  next(n) {
    return _SixStar2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_SixStar, "NAMES", ["\u5148\u80DC", "\u53CB\u5F15", "\u5148\u8D1F", "\u4F5B\u706D", "\u5927\u5B89", "\u8D64\u53E3"]);
var SixStar = _SixStar;
var _MinorRen = class _MinorRen2 extends LoopTyme {
  constructor(indexOfName) {
    super(_MinorRen2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _MinorRen2(index);
  }
  static fromName(name) {
    return new _MinorRen2(name);
  }
  next(n) {
    return _MinorRen2.fromIndex(this.nextIndex(n));
  }
  getLuck() {
    return Luck.fromIndex(this.index % 2);
  }
  getElement() {
    return Element.fromIndex([0, 4, 1, 3, 0, 2][this.index]);
  }
};
__publicField(_MinorRen, "NAMES", ["\u5927\u5B89", "\u7559\u8FDE", "\u901F\u559C", "\u8D64\u53E3", "\u5C0F\u5409", "\u7A7A\u4EA1"]);
var MinorRen = _MinorRen;
var _SixtyCycle = class _SixtyCycle2 extends LoopTyme {
  constructor(indexOfName) {
    super(_SixtyCycle2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _SixtyCycle2(index);
  }
  static fromName(name) {
    return new _SixtyCycle2(name);
  }
  next(n) {
    return _SixtyCycle2.fromIndex(this.nextIndex(n));
  }
  getHeavenStem() {
    return HeavenStem.fromIndex(this.index % HeavenStem.NAMES.length);
  }
  getEarthBranch() {
    return EarthBranch.fromIndex(this.index % EarthBranch.NAMES.length);
  }
  getSound() {
    return Sound.fromIndex(~~(this.index / 2));
  }
  getPengZu() {
    return PengZu.fromSixtyCycle(this);
  }
  getTen() {
    return Ten.fromIndex(~~((this.getHeavenStem().getIndex() - this.getEarthBranch().getIndex()) / 2));
  }
  getExtraEarthBranches() {
    const l = [];
    l[0] = EarthBranch.fromIndex(10 + this.getEarthBranch().getIndex() - this.getHeavenStem().getIndex());
    l[1] = l[0].next(1);
    return l;
  }
};
__publicField(_SixtyCycle, "NAMES", ["\u7532\u5B50", "\u4E59\u4E11", "\u4E19\u5BC5", "\u4E01\u536F", "\u620A\u8FB0", "\u5DF1\u5DF3", "\u5E9A\u5348", "\u8F9B\u672A", "\u58EC\u7533", "\u7678\u9149", "\u7532\u620C", "\u4E59\u4EA5", "\u4E19\u5B50", "\u4E01\u4E11", "\u620A\u5BC5", "\u5DF1\u536F", "\u5E9A\u8FB0", "\u8F9B\u5DF3", "\u58EC\u5348", "\u7678\u672A", "\u7532\u7533", "\u4E59\u9149", "\u4E19\u620C", "\u4E01\u4EA5", "\u620A\u5B50", "\u5DF1\u4E11", "\u5E9A\u5BC5", "\u8F9B\u536F", "\u58EC\u8FB0", "\u7678\u5DF3", "\u7532\u5348", "\u4E59\u672A", "\u4E19\u7533", "\u4E01\u9149", "\u620A\u620C", "\u5DF1\u4EA5", "\u5E9A\u5B50", "\u8F9B\u4E11", "\u58EC\u5BC5", "\u7678\u536F", "\u7532\u8FB0", "\u4E59\u5DF3", "\u4E19\u5348", "\u4E01\u672A", "\u620A\u7533", "\u5DF1\u9149", "\u5E9A\u620C", "\u8F9B\u4EA5", "\u58EC\u5B50", "\u7678\u4E11", "\u7532\u5BC5", "\u4E59\u536F", "\u4E19\u8FB0", "\u4E01\u5DF3", "\u620A\u5348", "\u5DF1\u672A", "\u5E9A\u7533", "\u8F9B\u9149", "\u58EC\u620C", "\u7678\u4EA5"]);
var SixtyCycle = _SixtyCycle;
var _Dog = class _Dog2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Dog2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Dog2(index);
  }
  static fromName(name) {
    return new _Dog2(name);
  }
  next(n) {
    return _Dog2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Dog, "NAMES", ["\u521D\u4F0F", "\u4E2D\u4F0F", "\u672B\u4F0F"]);
var Dog = _Dog;

class DogDay extends AbstractCultureDay {
  constructor(dog, dayIndex) {
    super(dog, dayIndex);
  }
  getDog() {
    return this.culture;
  }
}
var _PlumRain = class _PlumRain2 extends LoopTyme {
  constructor(indexOfName) {
    super(_PlumRain2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _PlumRain2(index);
  }
  static fromName(name) {
    return new _PlumRain2(name);
  }
  next(n) {
    return _PlumRain2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_PlumRain, "NAMES", ["\u5165\u6885", "\u51FA\u6885"]);
var PlumRain = _PlumRain;

class PlumRainDay extends AbstractCultureDay {
  constructor(plumRain, dayIndex) {
    super(plumRain, dayIndex);
  }
  getPlumRain() {
    return this.culture;
  }
  toString() {
    return this.getPlumRain().getIndex() == 0 ? super.toString() : this.culture.getName();
  }
}
var _FetusHeavenStem = class _FetusHeavenStem2 extends LoopTyme {
  constructor(index) {
    super(_FetusHeavenStem2.NAMES, index);
  }
  next(n) {
    return new _FetusHeavenStem2(this.nextIndex(n));
  }
};
__publicField(_FetusHeavenStem, "NAMES", ["\u95E8", "\u7893\u78E8", "\u53A8\u7076", "\u4ED3\u5E93", "\u623F\u5E8A"]);
var FetusHeavenStem = _FetusHeavenStem;
var _FetusEarthBranch = class _FetusEarthBranch2 extends LoopTyme {
  constructor(index) {
    super(_FetusEarthBranch2.NAMES, index);
  }
  next(n) {
    return new _FetusEarthBranch2(this.nextIndex(n));
  }
};
__publicField(_FetusEarthBranch, "NAMES", ["\u7893", "\u5395", "\u7089", "\u95E8", "\u6816", "\u5E8A"]);
var FetusEarthBranch = _FetusEarthBranch;

class FetusDay extends AbstractCulture {
  constructor(lunarDay) {
    super();
    __publicField(this, "fetusHeavenStem");
    __publicField(this, "fetusEarthBranch");
    __publicField(this, "side");
    __publicField(this, "direction");
    const sixtyCycle = lunarDay.getSixtyCycle();
    this.fetusHeavenStem = new FetusHeavenStem(sixtyCycle.getHeavenStem().getIndex() % 5);
    this.fetusEarthBranch = new FetusEarthBranch(sixtyCycle.getEarthBranch().getIndex() % 6);
    const index = [3, 3, 8, 8, 8, 8, 8, 1, 1, 1, 1, 1, 1, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0, -9, -9, -9, -9, -9, -5, -5, -1, -1, -1, -3, -7, -7, -7, -7, -5, 7, 7, 7, 7, 7, 7, 2, 2, 2, 2, 2, 3, 3, 3, 3][sixtyCycle.getIndex()];
    this.side = index < 0 ? 0 : 1;
    this.direction = Direction.fromIndex(index);
  }
  static fromLunarDay(lunarDay) {
    return new FetusDay(lunarDay);
  }
  getName() {
    let s = this.fetusHeavenStem.getName() + this.fetusEarthBranch.getName();
    if (s === "\u95E8\u95E8") {
      s = "\u5360\u5927\u95E8";
    } else if (s === "\u7893\u78E8\u7893") {
      s = "\u5360\u7893\u78E8";
    } else if (s === "\u623F\u5E8A\u5E8A") {
      s = "\u5360\u623F\u5E8A";
    } else if (s.indexOf("\u95E8") === 0) {
      s = "\u5360" + s;
    }
    s += " ";
    const directionName = this.direction.getName();
    if (this.side == 0) {
      s += "\u623F\u5185";
    } else {
      s += "\u5916";
    }
    if (this.side == 1 && "\u5317\u5357\u897F\u4E1C".indexOf(directionName) > -1) {
      s += "\u6B63";
    }
    s += directionName;
    return s;
  }
  getSide() {
    return this.side;
  }
  getDirection() {
    return this.direction;
  }
  getFetusHeavenStem() {
    return this.fetusHeavenStem;
  }
  getFetusEarthBranch() {
    return this.fetusEarthBranch;
  }
}
var _Nine = class _Nine2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Nine2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Nine2(index);
  }
  static fromName(name) {
    return new _Nine2(name);
  }
  next(n) {
    return _Nine2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Nine, "NAMES", ["\u4E00\u4E5D", "\u4E8C\u4E5D", "\u4E09\u4E5D", "\u56DB\u4E5D", "\u4E94\u4E5D", "\u516D\u4E5D", "\u4E03\u4E5D", "\u516B\u4E5D", "\u4E5D\u4E5D"]);
var Nine = _Nine;

class NineDay extends AbstractCultureDay {
  constructor(nine, dayIndex) {
    super(nine, dayIndex);
  }
  getNine() {
    return this.culture;
  }
}
var _Phenology = class _Phenology2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Phenology2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Phenology2(index);
  }
  static fromName(name) {
    return new _Phenology2(name);
  }
  next(n) {
    return _Phenology2.fromIndex(this.nextIndex(n));
  }
  getThreePhenology() {
    return ThreePhenology.fromIndex(this.index % 3);
  }
};
__publicField(_Phenology, "NAMES", ["\u86AF\u8693\u7ED3", "\u9E8B\u89D2\u89E3", "\u6C34\u6CC9\u52A8", "\u96C1\u5317\u4E61", "\u9E4A\u59CB\u5DE2", "\u96C9\u59CB\u96CA", "\u9E21\u59CB\u4E73", "\u5F81\u9E1F\u5389\u75BE", "\u6C34\u6CFD\u8179\u575A", "\u4E1C\u98CE\u89E3\u51BB", "\u86F0\u866B\u59CB\u632F", "\u9C7C\u965F\u8D1F\u51B0", "\u736D\u796D\u9C7C", "\u5019\u96C1\u5317", "\u8349\u6728\u840C\u52A8", "\u6843\u59CB\u534E", "\u4ED3\u5E9A\u9E23", "\u9E70\u5316\u4E3A\u9E20", "\u7384\u9E1F\u81F3", "\u96F7\u4E43\u53D1\u58F0", "\u59CB\u7535", "\u6850\u59CB\u534E", "\u7530\u9F20\u5316\u4E3A\u9D3D", "\u8679\u59CB\u89C1", "\u840D\u59CB\u751F", "\u9E23\u9E20\u62C2\u5947\u7FBD", "\u6234\u80DC\u964D\u4E8E\u6851", "\u877C\u8748\u9E23", "\u86AF\u8693\u51FA", "\u738B\u74DC\u751F", "\u82E6\u83DC\u79C0", "\u9761\u8349\u6B7B", "\u9EA6\u79CB\u81F3", "\u87B3\u8782\u751F", "\u9D59\u59CB\u9E23", "\u53CD\u820C\u65E0\u58F0", "\u9E7F\u89D2\u89E3", "\u8729\u59CB\u9E23", "\u534A\u590F\u751F", "\u6E29\u98CE\u81F3", "\u87CB\u87C0\u5C45\u58C1", "\u9E70\u59CB\u631A", "\u8150\u8349\u4E3A\u8424", "\u571F\u6DA6\u6EBD\u6691", "\u5927\u96E8\u884C\u65F6", "\u51C9\u98CE\u81F3", "\u767D\u9732\u964D", "\u5BD2\u8749\u9E23", "\u9E70\u4E43\u796D\u9E1F", "\u5929\u5730\u59CB\u8083", "\u79BE\u4E43\u767B", "\u9E3F\u96C1\u6765", "\u7384\u9E1F\u5F52", "\u7FA4\u9E1F\u517B\u7F9E", "\u96F7\u59CB\u6536\u58F0", "\u86F0\u866B\u576F\u6237", "\u6C34\u59CB\u6DB8", "\u9E3F\u96C1\u6765\u5BBE", "\u96C0\u5165\u5927\u6C34\u4E3A\u86E4", "\u83CA\u6709\u9EC4\u82B1", "\u8C7A\u4E43\u796D\u517D", "\u8349\u6728\u9EC4\u843D", "\u86F0\u866B\u54B8\u4FEF", "\u6C34\u59CB\u51B0", "\u5730\u59CB\u51BB", "\u96C9\u5165\u5927\u6C34\u4E3A\u8703", "\u8679\u85CF\u4E0D\u89C1", "\u5929\u6C14\u4E0A\u5347\u5730\u6C14\u4E0B\u964D", "\u95ED\u585E\u800C\u6210\u51AC", "\u9E56\u9D20\u4E0D\u9E23", "\u864E\u59CB\u4EA4", "\u8354\u633A\u51FA"]);
var Phenology = _Phenology;
var _ThreePhenology = class _ThreePhenology2 extends LoopTyme {
  constructor(indexOfName) {
    super(_ThreePhenology2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _ThreePhenology2(index);
  }
  static fromName(name) {
    return new _ThreePhenology2(name);
  }
  next(n) {
    return _ThreePhenology2.fromIndex(this.nextIndex(n));
  }
  getThreePhenology() {
    return _ThreePhenology2.fromIndex(this.index % 3);
  }
};
__publicField(_ThreePhenology, "NAMES", ["\u521D\u5019", "\u4E8C\u5019", "\u4E09\u5019"]);
var ThreePhenology = _ThreePhenology;
var _Dipper = class _Dipper2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Dipper2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Dipper2(index);
  }
  static fromName(name) {
    return new _Dipper2(name);
  }
  next(n) {
    return _Dipper2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_Dipper, "NAMES", ["\u5929\u67A2", "\u5929\u7487", "\u5929\u7391", "\u5929\u6743", "\u7389\u8861", "\u5F00\u9633", "\u6447\u5149", "\u6D1E\u660E", "\u9690\u5143"]);
var Dipper = _Dipper;

class PhenologyDay extends AbstractCultureDay {
  constructor(phenology, dayIndex) {
    super(phenology, dayIndex);
  }
  getPhenology() {
    return this.culture;
  }
}
var _NineStar = class _NineStar2 extends LoopTyme {
  constructor(indexOfName) {
    super(_NineStar2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _NineStar2(index);
  }
  static fromName(name) {
    return new _NineStar2(name);
  }
  next(n) {
    return _NineStar2.fromIndex(this.nextIndex(n));
  }
  getColor() {
    return ["\u767D", "\u9ED2", "\u78A7", "\u7EFF", "\u9EC4", "\u767D", "\u8D64", "\u767D", "\u7D2B"][this.index];
  }
  getElement() {
    return Element.fromIndex([4, 2, 0, 0, 2, 3, 3, 2, 1][this.index]);
  }
  getDipper() {
    return Dipper.fromIndex(this.index);
  }
  getDirection() {
    return Direction.fromIndex(this.index);
  }
  toString() {
    return this.getName() + this.getColor() + this.getElement();
  }
};
__publicField(_NineStar, "NAMES", ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D"]);
var NineStar = _NineStar;
var _TwelveStar = class _TwelveStar2 extends LoopTyme {
  constructor(indexOfName) {
    super(_TwelveStar2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _TwelveStar2(index);
  }
  static fromName(name) {
    return new _TwelveStar2(name);
  }
  next(n) {
    return _TwelveStar2.fromIndex(this.nextIndex(n));
  }
  getEcliptic() {
    return Ecliptic.fromIndex([0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1][this.index]);
  }
};
__publicField(_TwelveStar, "NAMES", ["\u9752\u9F99", "\u660E\u5802", "\u5929\u5211", "\u6731\u96C0", "\u91D1\u532E", "\u5929\u5FB7", "\u767D\u864E", "\u7389\u5802", "\u5929\u7262", "\u7384\u6B66", "\u53F8\u547D", "\u52FE\u9648"]);
var TwelveStar = _TwelveStar;
var _Ecliptic = class _Ecliptic2 extends LoopTyme {
  constructor(indexOfName) {
    super(_Ecliptic2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _Ecliptic2(index);
  }
  static fromName(name) {
    return new _Ecliptic2(name);
  }
  next(n) {
    return _Ecliptic2.fromIndex(this.nextIndex(n));
  }
  getLuck() {
    return Luck.fromIndex(this.index);
  }
};
__publicField(_Ecliptic, "NAMES", ["\u9EC4\u9053", "\u9ED1\u9053"]);
var Ecliptic = _Ecliptic;
var _LunarYear = class _LunarYear2 extends AbstractTyme {
  constructor(year) {
    super();
    __publicField(this, "year");
    _LunarYear2.init();
    if (year < -1 || year > 9999) {
      throw new Error(`illegal lunar year: ${year}`);
    }
    this.year = year;
  }
  static init() {
    if (_LunarYear2.isInit) {
      return;
    }
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_@";
    const months = "080b0r0j0j0j0C0j0j0C0j0j0j0C0j0C0j0C0F0j0V0V0V0u0j0j0C0j0j0j0j0V0C0j1v0u0C0V1v0C0b080u110u0C0j0C1v9K1v2z0j1vmZbl1veN3s1v0V0C2S1v0V0C2S2o0C0j1Z1c2S1v0j1c0j2z1v0j1c0j392H0b2_2S0C0V0j1c0j2z0C0C0j0j1c0j0N250j0C0j0b081n080b0C0C0C1c0j0N,0r1v1c1v0V0V0F0V0j0C0j0C0j0V0j0u1O0j0C0V0j0j0j0V0b080u0r0u080b0j0j0C0V0C0V0j0b080V0u080b0j0j0u0j1v0u080b1c0j080b0j0V0j0j0V0C0N1v0j1c0j0j1v2g1v420j1c0j2z1v0j1v5Q9z1v4l0j1vfn1v420j9z4l1v1v2S1c0j1v2S3s1v0V0C2S1v1v2S1c0j1v2S2_0b0j2_2z0j1c0j,0z0j0j0j0C0j0j0C0j0j0j0C0j0C0j0j0j0j0m0j0C0j0j0C0j0j0j0j0b0V0j0j0C0j0j0j0j0V0j0j0j0V0b0V0V0C0V0C0j0j0b080u110u0V0C0j0N0j0b080b080b0j0r0b0r0b0j0j0j0j0C0j0b0r0C0j0b0j0C0C0j0j0j0j0j0j0j0j0j0b110j0b0j0j0j0C0j0C0j0j0j0j0b080b080b0V080b080b0j0j0j0j0j0j0V0j0j0u1v0j0j0j0C0j0j0j0V0C0N1c0j0C0C0j0j0j1n080b0j0V0C0j0C0C2g0j1c0j0j1v2g1v0j0j1v7N0j1c0j3L0j0j1v5Q1Z5Q1v4lfn1v420j1v5Q1Z5Q1v4l1v2z1v,0H140r0N0r140r0u0r0V171c11140C0j0u110j0u0j1v0j0C0j0j0j0b080V0u080b0C1v0j0j0j0C0j0b080V0j0j0b080b0j0j0j0j0b080b0C080j0b080b0j0j0j0j0j0j0b080j0b080C0b080b080b080b0j0j0j0j080b0j0C0j0j0j0b0j0j080C0b0j0j0j0j0j0j0b08080b0j0C0j0j0j0b0j0j0K0b0j0C0j0j0j0b080b080j0C0b0j080b080b0j0j0j0j080b0j0b0r0j0j0j0b0j0C0r0b0j0j0j0j0j0j0j0b080j0b0r0C0j0b0j0j0j0r0b0j0C0j0j0j0u0r0b0C0j080b0j0j0j0j0j0j0j1c0j0b0j0j0j0C0j0j0j0j0j0j0j0b080j1c0u0j0j0j0C0j1c0j0u0j1c0j0j0j0j0j0j0j0j1c0j0u1v0j0j0V0j0j2g0j0j0j0C1v0C1G0j0j0V0C1Z1O0j0V0j0j2g1v0j0j0V0C2g5x1v4l1v421O7N0V0C4l1v2S1c0j1v2S2_,050b080C0j0j0j0C0j0j0C0j0j0j0C0j0C0j0C030j0j0j0j0j0j0j0j0j0C0j0b080u0V080b0j0j0V0j0j0j0j0j0j0j0j0j0V0N0j0C0C0j0j0j0j0j0j0j0j1c0j0u0j1v0j0j0j0j0j0b080b080j0j0j0b080b080b080b080b0j0j0j080b0j0b080j0j0j0j0b080b0j0j0r0b080b0b080j0j0j0j0b080b080j0b080j0b080b080b080b080b0j0j0r0b0j0b080j0j0j0j0b080b0j0j0C080b0b080j0j0j0j0j0j0j0b080u080j0j0b0j0j0j0C0j0b080j0j0j0j0b080b080b080b0C080b080b080b0j0j0j0j0j0j0b0C080j0j0b0j0j0j0C0j0b080j0j0C0b080b080j0b0j0j0C080b0j0j0j0j0j0j0b0j0j080C0b0j080b0j0j0j0j0j0j0j0C0j0j0j0b0j0j0C080b0j0j0j0j0j0j0b080b080b0K0b080b080b0j0j0j0j0j0j0j0C0j0j0u0j0j0V0j080b0j0C0j0j0j0b0j0r0C0b0j0j0j0j0j0j0j0j0j0C0j0b080b080b0j0C0C0j0C0j0j0j0u110u0j0j0j0j0j0j0j0j0C0j0j0u0j1c0j0j0j0j0j0j0j0j0V0C0u0j0C0C0V0C1Z0j0j0j0C0j0j0j1v0u0j1c0j0j0j0C0j0j2g0j1c1v0C1Z0V0j4l0j0V0j0j2g0j1v0j1v2S1c7N1v,0w0j1c0j0V0j0j0V0V0V0j0m0V0j0C1c140j0j0j0C0V0C0j1v0j0N0j0C0j0j0j0V0j0j1v0N0j0j0V0j0j0j0j0j0j080b0j0j0j0j0j0j0j080b0j0C0j0j0j0b0j0j080u080b0j0j0j0j0j0j0b080b080b080C0b0j080b080b0j0j0j0j080b0j0C0j0j0j0b0j0j080u080b0j0j0j0j0j0j0b080b080b080b0r0b0j080b080b0j0j0j0j080b0j0b0r0j0j0b080b0j0j080b0j080b0j080b080b0j0j0j0j0j0b080b0r0C0b080b0j0j0j0j080b0b080b080j0j0j0b080b080b080b0j0j0j0j080b0j0b080j0j0j0j0b080b0j0j0r0b080b0j0j0j0j0j0b080b080j0b0r0b080j0b080b0j0j0j0j080b0j0b080j0j0j0j0b080b0j080b0r0b0j080b080b0j0j0j0j0j0b080b0r0C0b080b0j0j0j0j0j0j0b080j0j0j0b080b080b080b0j0j0j0r0b0j0b080j0j0j0j0b080b0r0b0r0b0j080b080b0j0j0j0j0j0j0b0r0j0j0j0b0j0j0j0j080b0j0b080j0j0j0j0b080b080b0j0r0b0j080b0j0j0j0j0j0j0j0b0r0C0b0j0j0j0j0j0j0j080b0j0C0j0j0j0b0j0C0r0b0j0j0j0j0j0j0b080b080u0r0b0j080b0j0j0j0j0j0j0j0b0r0C0u0j0j0j0C0j080b0j0C0j0j0j0u110b0j0j0j0j0j0j0j0j0j0C0j0b080b0j0j0C0C0j0C0j0j0j0b0j1c0j080b0j0j0j0j0j0j0V0j0j0u0j1c0j0j0j0C0j0j2g0j0j0j0C0j0j0V0j0b080b1c0C0V0j0j2g0j0j0V0j0j1c0j1Z0j0j0C0C0j1v,160j0j0V0j1c0j0C0j0C0j1f0j0V0C0j0j0C0j0j0j1G080b080u0V080b0j0j0V0j1v0j0u0j1c0j0j0j0C0j0j0j0C0C0j1D0b0j080b0j0j0j0j0C0j0b0r0C0j0b0j0C0C0j0j0j0j0j0j0j0j0j0b0r0b0r0j0b0j0j0j0C0j0b0r0j0j0j0b080b080j0b0C0j080b080b0j0j0j0j0j0j0b0C080j0j0b0j0j0j0C0j0b080j0j0j0j0b080b080j0b0C0r0j0b0j0j0j0j0j0j0b0C080j0j0b0j0j0j0C0j0j0j0j0C0j0j0b080b0j0j0C080b0j0j0j0j0j0j0b080b080b080C0b080b080b080b0j0j0j0j0j0b080C0j0j0b080b0j0j0C080b0j0j0j0j0j0j0b080j0b0C080j0j0b0j0j0j0j0j0j0b080j0b080C0b080b080b080b0j0j0j0j080b0j0C0j0j0b080b0j0j0C080b0j0j0j0j0j0j0b080j0b080u080j0j0b0j0j0j0j0j0j0b080C0j0j0b080b0j0j0C0j0j080b0j0j0j0j0j0b080b0C0r0b080b0j0j0j0j0j0j0b080j0b080u080b080b080b0j0j0j0C0j0b080j0j0j0j0b0j0j0j0C0j0j080b0j0j0j0j0j0b080b0C0r0b080b0j0j0j0j0j0j0b080j0b0r0b080b080b080b0j0j0j0r0b0j0b0r0j0j0j0b0j0j0j0r0b0j080b0j0j0j0j0j0j0j0b0r0C0b0j0j0j0j0j0j0j0b080j0C0u080b080b0j0j0j0r0b0j0C0C0j0b0j110b0j080b0j0j0j0j0j0j0u0r0C0b0j0j0j0j0j0j0j0j0j0C0j0j0j0b0j1c0j0C0j0j0j0b0j0814080b080b0j0j0j0j0j0j1c0j0u0j0j0V0j0j0j0j0j0j0j0u110u0j0j0j,020b0r0C0j0j0j0C0j0j0V0j0j0j0j0j0C0j1f0j0C0j0V1G0j0j0j0j0V0C0j0C1v0u0j0j0j0V0j0j0C0j0j0j1v0N0C0V0j0j0j0K0C250b0C0V0j0j0V0j0j2g0C0V0j0j0C0j0j0b081v0N0j0j0V0V0j0j0u0j1c0j080b0j0j0j0j0j0j0V0j0j0u0j0j0V0j0j0j0C0j0b080b080V0b0j080b0j0j0j0j0j0j0j0b0r0C0j0b0j0j0j0C0j080b0j0j0j0j0j0j0u0r0C0u0j0j0j0j0j0j0b080j0C0j0b080b080b0j0C0j080b0j0j0j0j0j0j0b080b110b0j0j0j0j0j0j0j0j0j0b0r0j0j0j0b0j0j0j0r0b0j0b080j0j0j0j0b080b080b080b0r0b0j080b080b0j0j0j0j0j0j0b0r0C0b080b0j0j0j0j080b0j0b080j0j0j0j0b080b080b0j0j0j0r0b0j0j0j0j0j0j0b080b0j080C0b0j080b080b0j0j0j0j080b0j0b0r0C0b080b0j0j0j0j080b0j0j0j0j0j0b080b080b080b0j0j080b0r0b0j0j0j0j0j0j0b0j0j080C0b0j080b080b0j0j0j0j0j0b080C0j0j0b080b0j0j0C0j0b080j0j0j0j0b080b080b080b0C0C080b0j0j0j0j0j0j0b0C0C080b080b080b0j0j0j0j0j0j0b0C080j0j0b0j0j0j0C0j0b080j0b080j0j0b080b080b080b0C0r0b0j0j0j0j0j0j0b080b0r0b0r0b0j080b080b0j0j0j0j0j0j0b0r0C0j0b0j0j0j0j0j0j0b080j0C0j0b080j0b0j0j0K0b0j0C0j0j0j0b080b0j0K0b0j080b0j0j0j0j0j0j0V0j0j0b0j0j0j0C0j0j0j0j,0l0C0K0N0r0N0j0r1G0V0m0j0V1c0C0j0j0j0j1O0N110u0j0j0j0C0j0j0V0C0j0u110u0j0j0j0C0j0j0j0C0C0j250j1c2S1v1v0j5x2g0j1c0j0j1c2z0j1c0j0j1c0j0N1v0V0C1v0C0b0C0V0j0j0C0j0C1v0u0j0C0C0j0j0j0C0j0j0j0u110u0j0j0j0C0j0C0C0C0b080b0j0C0j080b0j0C0j0j0j0u110u0j0j0j0C0j0j0j0C0j0j0j0u0C0r0u0j0j0j0j0j0j0b0r0b0V080b080b0j0C0j0j0j0V0j0j0b0j0j0j0C0j0j0j0j0j0j0j0b080j0b0C0r0j0b0j0j0j0C0j0b0r0b0r0j0b080b080b0j0C0j0j0j0j0j0j0j0j0b0j0C0r0b0j0j0j0j0j0j0b080b080j0b0r0b0r0j0b0j0j0j0j080b0j0b0r0j0j0j0b080b080b0j0j0j0j080b0j0j0j0j0j0j0b0j0j0j0r0b0j0j0j0j0j0j0b080b080b080b0r0C0b080b0j0j0j0j0j0b080b0r0C0b080b080b080b0j0j0j0j080b0j0C0j0j0j0b0j0j0C080b0j0j0j0j0j0j0b080j0b0C080j0j0b0j0j0j0j0j0j0b0r0b080j0j0b080b080b0j0j0j0j0j0j0b080j0j0j0j0b0j0j0j0r0b0j0b080j0j0j0j0j0b080b080b0C0r0b0j0j0j0j0j0j0b080b080j0C0b0j080b080b0j0j0j0j0j0j,0a0j0j0j0j0C0j0j0C0j0C0C0j0j0j0j0j0j0j0m0C0j0j0j0j0u080j0j0j1n0j0j0j0j0C0j0j0j0V0j0j0j1c0u0j0C0V0j0j0V0j0j1v0N0C0V2o1v1O2S2o141v0j1v4l0j1c0j1v2S2o0C0u1v0j0C0C2S1v0j1c0j0j1v0N251c0j1v0b1c1v1n1v0j0j0V0j0j1v0N1v0C0V0j0j1v0b0C0j0j0V1c0j0u0j1c0j0j0j0j0j0j0j0j1c0j0u0j0j0V0j0j0j0j0j0j0b080u110u0j0j0j0j0j0j1c0j0b0j080b0j0C0j0j0j0V0j0j0u0C0V0j0j0j0C0j0b080j1c0j0b0j0j0j0C0j0C0j0j0j0b080b080b0j0C0j080b0j0j0j0j0j0j0j0b0C0r0u0j0j0j0j0j0j0b080j0b0r0C0j0b0j0j0j0r0b0j0b0r0j0j0j0b080b080b0j0r0b0j080b0j0j0j0j0j0j0b0j0r0C0b0j0j0j0j0j0j0b080j0j0C0j0j0b080b0j0j0j0j0j0j0j0j0j0j0b080b080b080b0C0j0j080b0j0j0j0j0j0j0b0j0j0C080b0j0j0j0j0j0j0j0j0b0C080j0j0b0j0j0j0j0j,0n0Q0j1c14010q0V1c171k0u0r140V0j0j1c0C0N1O0j0V0j0j0j1c0j0u110u0C0j0C0V0C0j0j0b671v0j1v5Q1O2S2o2S1v4l1v0j1v2S2o0C1Z0j0C0C1O141v0j1c0j2z1O0j0V0j0j1v0b2H390j1c0j0V0C2z0j1c0j1v2g0C0V0j1O0b0j0j0V0C1c0j0u0j1c0j0j0j0j0j0j0j0j1c0N0j0j0V0j0j0C0j0j0b081v0u0j0j0j0C0j1c0N0j0j0C0j0j0j0C0j0j0j0u0C0r0u0j0j0j0C0j0b080j1c0j0b0j0C0C0j0C0C0j0b080b080u0C0j080b0j0C0j0j0j0u110u0j0j0j0j0j0j0j0j0C0C0j0b0j0j0j0C0j0C0C0j0b080b080b0j0C0j080b0j0C0j0j0j0b0j110b0j0j0j0j0j,0B0j0V0j0j0C0j0j0j0C0j0C0j0j0C0j0m0j0j0j0j0C0j0C0j0j0u0j1c0j0j0C0C0j0j0j0j0j0j0j0j0u110N0j0j0V0C0V0j0b081n080b0CrU1O5e2SbX2_1Z0V2o141v0j0C0C0j2z1v0j1c0j7N1O420j1c0j1v2S1c0j1v2S2_0b0j0V0j0j1v0N1v0j0j1c0j1v140j0V0j0j0C0C0b080u1v0C0V0u110u0j0j0j0C0j0j0j0C0C0N0C0V0j0j0C0j0j0b080u110u0C0j0C0u0r0C0u080b0j0j0C0j0j0j".split(",", -1);
    for (let i = 0;i < 12; i++) {
      let n = 0;
      const m = months[i];
      const size = ~~(m.length / 2);
      const l = [];
      for (let y = 0;y < size; y++) {
        const z = y * 2;
        const s = m.substring(z, z + 2);
        let t2 = 0;
        let c = 1;
        for (let x = 1;x > -1; x--) {
          t2 += c * chars.indexOf(s.charAt(x));
          c *= 64;
        }
        n += t2;
        l.push(n);
      }
      _LunarYear2.LEAP[`${i + 1}`] = l;
    }
    _LunarYear2.isInit = true;
  }
  static fromYear(year) {
    return new _LunarYear2(year);
  }
  getYear() {
    return this.year;
  }
  getDayCount() {
    let n = 0;
    const months = this.getMonths();
    for (let i = 0, j = months.length;i < j; i++) {
      n += months[i].getDayCount();
    }
    return n;
  }
  getMonthCount() {
    return this.getLeapMonth() > 0 ? 13 : 12;
  }
  getName() {
    return `\u519C\u5386${this.getSixtyCycle().getName()}\u5E74`;
  }
  next(n) {
    return _LunarYear2.fromYear(this.year + n);
  }
  getLeapMonth() {
    if (this.year === -1) {
      return 11;
    }
    for (const m in _LunarYear2.LEAP) {
      if (_LunarYear2.LEAP[m].indexOf(this.year) > -1) {
        return parseInt(m, 10);
      }
    }
    return 0;
  }
  getSixtyCycle() {
    return SixtyCycle.fromIndex(this.year - 4);
  }
  getTwenty() {
    return Twenty.fromIndex(Math.floor((this.year - 1864) / 20));
  }
  getNineStar() {
    return NineStar.fromIndex(63 + this.getTwenty().getSixty().getIndex() * 3 - this.getSixtyCycle().getIndex());
  }
  getJupiterDirection() {
    return Direction.fromIndex([0, 7, 7, 2, 3, 3, 8, 1, 1, 6, 0, 0][this.getSixtyCycle().getEarthBranch().getIndex()]);
  }
  getMonths() {
    const l = [];
    let m = LunarMonth.fromYm(this.year, 1);
    while (m.getYear() === this.year) {
      l.push(m);
      m = m.next(1);
    }
    return l;
  }
};
__publicField(_LunarYear, "isInit", false);
__publicField(_LunarYear, "LEAP", {});
var LunarYear = _LunarYear;
var _LunarSeason = class _LunarSeason2 extends LoopTyme {
  constructor(indexOfName) {
    super(_LunarSeason2.NAMES, indexOfName);
  }
  static fromIndex(index) {
    return new _LunarSeason2(index);
  }
  static fromName(name) {
    return new _LunarSeason2(name);
  }
  next(n) {
    return _LunarSeason2.fromIndex(this.nextIndex(n));
  }
};
__publicField(_LunarSeason, "NAMES", ["\u5B5F\u6625", "\u4EF2\u6625", "\u5B63\u6625", "\u5B5F\u590F", "\u4EF2\u590F", "\u5B63\u590F", "\u5B5F\u79CB", "\u4EF2\u79CB", "\u5B63\u79CB", "\u5B5F\u51AC", "\u4EF2\u51AC", "\u5B63\u51AC"]);
var LunarSeason = _LunarSeason;
var _FetusMonth = class _FetusMonth2 extends LoopTyme {
  constructor(indexOfName) {
    super(_FetusMonth2.NAMES, indexOfName);
  }
  static fromLunarMonth(lunarMonth) {
    return lunarMonth.isLeap() ? null : new _FetusMonth2(lunarMonth.getMonth() - 1);
  }
  next(n) {
    return new _FetusMonth2(this.nextIndex(n));
  }
};
__publicField(_FetusMonth, "NAMES", ["\u5360\u623F\u5E8A", "\u5360\u6237\u7A97", "\u5360\u95E8\u5802", "\u5360\u53A8\u7076", "\u5360\u623F\u5E8A", "\u5360\u5E8A\u4ED3", "\u5360\u7893\u78E8", "\u5360\u5395\u6237", "\u5360\u95E8\u623F", "\u5360\u623F\u5E8A", "\u5360\u7076\u7089", "\u5360\u623F\u5E8A"]);
var FetusMonth = _FetusMonth;
var _LunarMonth = class _LunarMonth2 extends AbstractTyme {
  constructor(year, month, cache) {
    super();
    __publicField(this, "year");
    __publicField(this, "month");
    __publicField(this, "leap");
    __publicField(this, "dayCount");
    __publicField(this, "indexInYear");
    __publicField(this, "firstJulianDay");
    if (cache) {
      const m = cache[1];
      this.year = LunarYear.fromYear(cache[0]);
      this.month = Math.abs(m);
      this.leap = m < 0;
      this.dayCount = cache[2];
      this.indexInYear = cache[3];
      this.firstJulianDay = JulianDay.fromJulianDay(cache[4]);
    } else {
      const currentYear = LunarYear.fromYear(year);
      const currentLeapMonth = currentYear.getLeapMonth();
      if (month === 0 || month > 12 || month < -12) {
        throw new Error(`illegal lunar month: ${month}`);
      }
      const leap = month < 0;
      const m = Math.abs(month);
      if (leap && m != currentLeapMonth) {
        throw new Error(`illegal leap month ${m} in lunar year ${year}`);
      }
      const dongZhi = SolarTerm.fromIndex(year, 0);
      const dongZhiJd = dongZhi.getCursoryJulianDay();
      let w = ShouXingUtil.calcShuo(dongZhiJd);
      if (w > dongZhiJd) {
        w -= 29.53;
      }
      let offset = 2;
      if (year > 8 && year < 24) {
        offset = 1;
      } else if (LunarYear.fromYear(year - 1).getLeapMonth() > 10 && year != 239 && year != 240) {
        offset = 3;
      }
      let index = m - 1;
      if (leap || currentLeapMonth > 0 && m > currentLeapMonth) {
        index += 1;
      }
      this.indexInYear = index;
      w += 29.5306 * (offset + index);
      const firstDay = ShouXingUtil.calcShuo(w);
      this.firstJulianDay = JulianDay.fromJulianDay(JulianDay.J2000 + firstDay);
      this.dayCount = ~~(ShouXingUtil.calcShuo(w + 29.5306) - firstDay);
      this.year = currentYear;
      this.month = m;
      this.leap = leap;
    }
  }
  static fromYm(year, month) {
    let m;
    const key = `${year}${month}`;
    let cache = _LunarMonth2.cache[key];
    if (cache) {
      m = new _LunarMonth2(0, 0, cache);
    } else {
      m = new _LunarMonth2(year, month);
      _LunarMonth2.cache[key] = [m.getYear(), m.getMonthWithLeap(), m.getDayCount(), m.getIndexInYear(), m.getFirstJulianDay().getDay()];
    }
    return m;
  }
  getLunarYear() {
    return this.year;
  }
  getYear() {
    return this.year.getYear();
  }
  getMonth() {
    return this.month;
  }
  getMonthWithLeap() {
    return this.leap ? -this.month : this.month;
  }
  getDayCount() {
    return this.dayCount;
  }
  getIndexInYear() {
    return this.indexInYear;
  }
  getSeason() {
    return LunarSeason.fromIndex(this.month - 1);
  }
  getFirstJulianDay() {
    return this.firstJulianDay;
  }
  isLeap() {
    return this.leap;
  }
  getWeekCount(start2) {
    return Math.ceil((this.indexOf(this.firstJulianDay.getWeek().getIndex() - start2, 7) + this.getDayCount()) / 7);
  }
  getName() {
    return (this.leap ? "\u95F0" : "") + _LunarMonth2.NAMES[this.month - 1];
  }
  toString() {
    return this.year.toString() + this.getName();
  }
  next(n) {
    if (n === 0) {
      return _LunarMonth2.fromYm(this.getYear(), this.getMonthWithLeap());
    }
    let m = this.indexInYear + 1 + n;
    let y = this.year;
    let leapMonth = y.getLeapMonth();
    if (n > 0) {
      let monthCount = leapMonth > 0 ? 13 : 12;
      while (m > monthCount) {
        m -= monthCount;
        y = y.next(1);
        leapMonth = y.getLeapMonth();
        monthCount = leapMonth > 0 ? 13 : 12;
      }
    } else {
      while (m <= 0) {
        y = y.next(-1);
        leapMonth = y.getLeapMonth();
        m += leapMonth > 0 ? 13 : 12;
      }
    }
    let leap = false;
    if (leapMonth > 0) {
      if (m === leapMonth + 1) {
        leap = true;
      }
      if (m > leapMonth) {
        m--;
      }
    }
    return _LunarMonth2.fromYm(y.getYear(), leap ? -m : m);
  }
  getDays() {
    const y = this.getYear();
    const m = this.getMonthWithLeap();
    const l = [];
    for (let i = 1, j = this.getDayCount();i <= j; i++) {
      l.push(LunarDay.fromYmd(y, m, i));
    }
    return l;
  }
  getWeeks(start2) {
    const y = this.getYear();
    const m = this.getMonthWithLeap();
    const l = [];
    for (let i = 0, j = this.getWeekCount(start2);i < j; i++) {
      l.push(LunarWeek.fromYm(y, m, i, start2));
    }
    return l;
  }
  getSixtyCycle() {
    return SixtyCycle.fromName(HeavenStem.fromIndex((this.year.getSixtyCycle().getHeavenStem().getIndex() + 1) * 2 + this.indexInYear).getName() + EarthBranch.fromIndex(this.indexInYear + 2).getName());
  }
  getNineStar() {
    return NineStar.fromIndex(27 - this.year.getSixtyCycle().getEarthBranch().getIndex() % 3 * 3 - this.getSixtyCycle().getEarthBranch().getIndex());
  }
  getJupiterDirection() {
    const sixtyCycle = this.getSixtyCycle();
    const n = [7, -1, 1, 3][sixtyCycle.getEarthBranch().next(-2).getIndex() % 4];
    return n === -1 ? sixtyCycle.getHeavenStem().getDirection() : Direction.fromIndex(n);
  }
  getFetus() {
    return FetusMonth.fromLunarMonth(this);
  }
  getMinorRen() {
    return MinorRen.fromIndex((this.month - 1) % 6);
  }
};
__publicField(_LunarMonth, "cache", {});
__publicField(_LunarMonth, "NAMES", ["\u6B63\u6708", "\u4E8C\u6708", "\u4E09\u6708", "\u56DB\u6708", "\u4E94\u6708", "\u516D\u6708", "\u4E03\u6708", "\u516B\u6708", "\u4E5D\u6708", "\u5341\u6708", "\u5341\u4E00\u6708", "\u5341\u4E8C\u6708"]);
var LunarMonth = _LunarMonth;
var _LunarWeek = class _LunarWeek2 extends AbstractTyme {
  constructor(year, month, index, start2) {
    super();
    __publicField(this, "month");
    __publicField(this, "index");
    __publicField(this, "start");
    if (index < 0 || index > 5) {
      throw new Error(`illegal lunar week index: ${index}`);
    }
    if (start2 < 0 || start2 > 6) {
      throw new Error(`illegal lunar week start: ${start2}`);
    }
    const m = LunarMonth.fromYm(year, month);
    if (index >= m.getWeekCount(start2)) {
      throw new Error(`illegal lunar week index: ${index} in month: ${m.toString()}`);
    }
    this.month = m;
    this.index = index;
    this.start = Week.fromIndex(start2);
  }
  static fromYm(year, month, index, start2) {
    return new _LunarWeek2(year, month, index, start2);
  }
  getLunarMonth() {
    return this.month;
  }
  getYear() {
    return this.month.getYear();
  }
  getMonth() {
    return this.month.getMonthWithLeap();
  }
  getIndex() {
    return this.index;
  }
  getStart() {
    return this.start;
  }
  getName() {
    return _LunarWeek2.NAMES[this.index];
  }
  toString() {
    return this.month.toString() + this.getName();
  }
  next(n) {
    const startIndex = this.start.getIndex();
    if (n === 0) {
      return _LunarWeek2.fromYm(this.getYear(), this.getMonth(), this.index, startIndex);
    }
    let d = this.index + n;
    let m = this.month;
    if (n > 0) {
      let weekCount = m.getWeekCount(startIndex);
      while (d >= weekCount) {
        d -= weekCount;
        m = m.next(1);
        if (!LunarDay.fromYmd(m.getYear(), m.getMonthWithLeap(), 1).getWeek().equals(this.start)) {
          d += 1;
        }
        weekCount = m.getWeekCount(startIndex);
      }
    } else {
      while (d < 0) {
        if (!LunarDay.fromYmd(m.getYear(), m.getMonthWithLeap(), 1).getWeek().equals(this.start)) {
          d -= 1;
        }
        m = m.next(-1);
        d += m.getWeekCount(startIndex);
      }
    }
    return _LunarWeek2.fromYm(m.getYear(), m.getMonthWithLeap(), d, startIndex);
  }
  getFirstDay() {
    const firstDay = LunarDay.fromYmd(this.getYear(), this.getMonth(), 1);
    return firstDay.next(this.index * 7 - this.indexOf(firstDay.getWeek().getIndex() - this.start.getIndex(), 7));
  }
  getDays() {
    const l = [];
    const d = this.getFirstDay();
    l.push(d);
    for (let i = 1;i < 7; i++) {
      l.push(d.next(i));
    }
    return l;
  }
  equals(o) {
    return o && o.getFirstDay().equals(this.getFirstDay());
  }
};
__publicField(_LunarWeek, "NAMES", ["\u7B2C\u4E00\u5468", "\u7B2C\u4E8C\u5468", "\u7B2C\u4E09\u5468", "\u7B2C\u56DB\u5468", "\u7B2C\u4E94\u5468", "\u7B2C\u516D\u5468"]);
var LunarWeek = _LunarWeek;
var _LunarDay = class _LunarDay2 extends AbstractTyme {
  constructor(year, month, day) {
    super();
    __publicField(this, "month");
    __publicField(this, "day");
    const m = LunarMonth.fromYm(year, month);
    if (day < 1 || day > m.getDayCount()) {
      throw new Error(`illegal day ${day} in ${m.toString()}`);
    }
    this.month = m;
    this.day = day;
  }
  static fromYmd(year, month, day) {
    return new _LunarDay2(year, month, day);
  }
  getLunarMonth() {
    return this.month;
  }
  getYear() {
    return this.month.getYear();
  }
  getMonth() {
    return this.month.getMonthWithLeap();
  }
  getDay() {
    return this.day;
  }
  getName() {
    return _LunarDay2.NAMES[this.day - 1];
  }
  toString() {
    return this.month.toString() + this.getName();
  }
  next(n) {
    return n !== 0 ? this.getSolarDay().next(n).getLunarDay() : _LunarDay2.fromYmd(this.getYear(), this.getMonth(), this.day);
  }
  isBefore(target) {
    const aYear = this.getYear();
    const bYear = target.getYear();
    if (aYear !== bYear) {
      return aYear < bYear;
    }
    const aMonth = this.getMonth();
    const bMonth = target.getMonth();
    if (aMonth !== bMonth) {
      return Math.abs(aMonth) < Math.abs(bMonth);
    }
    return this.day < target.getDay();
  }
  isAfter(target) {
    const aYear = this.getYear();
    const bYear = target.getYear();
    if (aYear !== bYear) {
      return aYear > bYear;
    }
    const aMonth = this.getMonth();
    const bMonth = target.getMonth();
    if (aMonth != bMonth) {
      return Math.abs(aMonth) >= Math.abs(bMonth);
    }
    return this.day > target.getDay();
  }
  getWeek() {
    return this.getSolarDay().getWeek();
  }
  getYearSixtyCycle() {
    const solarDay = this.getSolarDay();
    const solarYear = solarDay.getYear();
    const springSolarDay = SolarTerm.fromIndex(solarYear, 3).getJulianDay().getSolarDay();
    const lunarYear = this.month.getLunarYear();
    const year = lunarYear.getYear();
    let sixtyCycle = lunarYear.getSixtyCycle();
    if (year === solarYear) {
      if (solarDay.isBefore(springSolarDay)) {
        sixtyCycle = sixtyCycle.next(-1);
      }
    } else if (year < solarYear) {
      if (!solarDay.isBefore(springSolarDay)) {
        sixtyCycle = sixtyCycle.next(1);
      }
    }
    return sixtyCycle;
  }
  getMonthSixtyCycle() {
    const solarDay = this.getSolarDay();
    const year = solarDay.getYear();
    const term = solarDay.getTerm();
    let index = term.getIndex() - 3;
    if (index < 0 && term.getJulianDay().getSolarDay().isAfter(SolarTerm.fromIndex(year, 3).getJulianDay().getSolarDay())) {
      index += 24;
    }
    return LunarMonth.fromYm(year, 1).getSixtyCycle().next(Math.floor(index / 2));
  }
  getSixtyCycle() {
    const offset = ~~this.month.getFirstJulianDay().next(this.day - 12).getDay();
    return SixtyCycle.fromName(HeavenStem.fromIndex(offset).getName() + EarthBranch.fromIndex(offset).getName());
  }
  getDuty() {
    return Duty.fromIndex(this.getSixtyCycle().getEarthBranch().getIndex() - this.getMonthSixtyCycle().getEarthBranch().getIndex());
  }
  getTwelveStar() {
    return TwelveStar.fromIndex(this.getSixtyCycle().getEarthBranch().getIndex() + (8 - this.getMonthSixtyCycle().getEarthBranch().getIndex() % 6) * 2);
  }
  getNineStar() {
    const solar = this.getSolarDay();
    const dongZhi = SolarTerm.fromIndex(solar.getYear(), 0);
    const xiaZhi = dongZhi.next(12);
    const dongZhi2 = dongZhi.next(24);
    const dongZhiSolar = dongZhi.getJulianDay().getSolarDay();
    const xiaZhiSolar = xiaZhi.getJulianDay().getSolarDay();
    const dongZhiSolar2 = dongZhi2.getJulianDay().getSolarDay();
    const dongZhiIndex = dongZhiSolar.getLunarDay().getSixtyCycle().getIndex();
    const xiaZhiIndex = xiaZhiSolar.getLunarDay().getSixtyCycle().getIndex();
    const dongZhiIndex2 = dongZhiSolar2.getLunarDay().getSixtyCycle().getIndex();
    const solarShunBai = dongZhiSolar.next(dongZhiIndex > 29 ? 60 - dongZhiIndex : -dongZhiIndex);
    const solarShunBai2 = dongZhiSolar2.next(dongZhiIndex2 > 29 ? 60 - dongZhiIndex2 : -dongZhiIndex2);
    const solarNiZi = xiaZhiSolar.next(xiaZhiIndex > 29 ? 60 - xiaZhiIndex : -xiaZhiIndex);
    let offset = 0;
    if (!solar.isBefore(solarShunBai) && solar.isBefore(solarNiZi)) {
      offset = solar.subtract(solarShunBai);
    } else if (!solar.isBefore(solarNiZi) && solar.isBefore(solarShunBai2)) {
      offset = 8 - solar.subtract(solarNiZi);
    } else if (!solar.isBefore(solarShunBai2)) {
      offset = solar.subtract(solarShunBai2);
    } else if (solar.isBefore(solarShunBai)) {
      offset = 8 + solarShunBai.subtract(solar);
    }
    return NineStar.fromIndex(offset);
  }
  getJupiterDirection() {
    const index = this.getSixtyCycle().getIndex();
    return index % 12 < 6 ? Element.fromIndex(~~(index / 12)).getDirection() : this.month.getLunarYear().getJupiterDirection();
  }
  getFetusDay() {
    return FetusDay.fromLunarDay(this);
  }
  getPhase() {
    return Phase.fromIndex(this.day - 1);
  }
  getSolarDay() {
    return this.month.getFirstJulianDay().next(this.day - 1).getSolarDay();
  }
  getTwentyEightStar() {
    return TwentyEightStar.fromIndex([10, 18, 26, 6, 14, 22, 2][this.getSolarDay().getWeek().getIndex()]).next(-7 * this.getSixtyCycle().getEarthBranch().getIndex());
  }
  getFestival() {
    return LunarFestival.fromYmd(this.getYear(), this.getMonth(), this.day);
  }
  getSixStar() {
    return SixStar.fromIndex((this.month.getMonth() + this.day - 2) % 6);
  }
  getGods() {
    return God.getDayGods(this.getMonthSixtyCycle(), this.getSixtyCycle());
  }
  getRecommends() {
    return Taboo.getDayRecommends(this.getMonthSixtyCycle(), this.getSixtyCycle());
  }
  getAvoids() {
    return Taboo.getDayAvoids(this.getMonthSixtyCycle(), this.getSixtyCycle());
  }
  getHours() {
    const l = [];
    const y = this.getYear();
    const m = this.getMonth();
    l.push(LunarHour.fromYmdHms(y, m, this.day, 0, 0, 0));
    for (let i = 0;i < 24; i += 2) {
      l.push(LunarHour.fromYmdHms(y, m, this.day, i + 1, 0, 0));
    }
    return l;
  }
  getMinorRen() {
    return this.getLunarMonth().getMinorRen().next(this.day - 1);
  }
};
__publicField(_LunarDay, "NAMES", ["\u521D\u4E00", "\u521D\u4E8C", "\u521D\u4E09", "\u521D\u56DB", "\u521D\u4E94", "\u521D\u516D", "\u521D\u4E03", "\u521D\u516B", "\u521D\u4E5D", "\u521D\u5341", "\u5341\u4E00", "\u5341\u4E8C", "\u5341\u4E09", "\u5341\u56DB", "\u5341\u4E94", "\u5341\u516D", "\u5341\u4E03", "\u5341\u516B", "\u5341\u4E5D", "\u4E8C\u5341", "\u5EFF\u4E00", "\u5EFF\u4E8C", "\u5EFF\u4E09", "\u5EFF\u56DB", "\u5EFF\u4E94", "\u5EFF\u516D", "\u5EFF\u4E03", "\u5EFF\u516B", "\u5EFF\u4E5D", "\u4E09\u5341"]);
var LunarDay = _LunarDay;

class DefaultEightCharProvider {
  getEightChar(hour) {
    return new EightChar(hour.getYearSixtyCycle(), hour.getMonthSixtyCycle(), hour.getDaySixtyCycle(), hour.getSixtyCycle());
  }
}
var _LunarHour = class _LunarHour2 extends AbstractTyme {
  constructor(year, month, day, hour, minute, second) {
    super();
    __publicField(this, "day");
    __publicField(this, "hour");
    __publicField(this, "minute");
    __publicField(this, "second");
    if (hour < 0 || hour > 23) {
      throw new Error(`illegal hour: ${hour}`);
    }
    if (minute < 0 || minute > 59) {
      throw new Error(`illegal minute: ${minute}`);
    }
    if (second < 0 || second > 59) {
      throw new Error(`illegal second: ${second}`);
    }
    this.day = LunarDay.fromYmd(year, month, day);
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }
  static fromYmdHms(year, month, day, hour, minute, second) {
    return new _LunarHour2(year, month, day, hour, minute, second);
  }
  getLunarDay() {
    return this.day;
  }
  getYear() {
    return this.day.getYear();
  }
  getMonth() {
    return this.day.getMonth();
  }
  getDay() {
    return this.day.getDay();
  }
  getHour() {
    return this.hour;
  }
  getMinute() {
    return this.minute;
  }
  getSecond() {
    return this.second;
  }
  getName() {
    return EarthBranch.fromIndex(this.getIndexInDay()).getName() + "\u65F6";
  }
  toString() {
    return `${this.day.toString()}${this.getSixtyCycle().getName()}\u65F6`;
  }
  getIndexInDay() {
    return ~~((this.hour + 1) / 2);
  }
  next(n) {
    if (n == 0) {
      return _LunarHour2.fromYmdHms(this.getYear(), this.getMonth(), this.getDay(), this.hour, this.minute, this.second);
    }
    const h = this.hour + n * 2;
    const diff = h < 0 ? -1 : 1;
    let hour = Math.abs(h);
    let days = ~~(hour / 24) * diff;
    hour = hour % 24 * diff;
    if (hour < 0) {
      hour += 24;
      days--;
    }
    const d = this.day.next(days);
    return _LunarHour2.fromYmdHms(d.getYear(), d.getMonth(), d.getDay(), hour, this.minute, this.second);
  }
  isBefore(target) {
    if (!this.day.equals(target.getLunarDay())) {
      return this.day.isBefore(target.getLunarDay());
    }
    if (this.hour !== target.getHour()) {
      return this.hour < target.getHour();
    }
    return this.minute !== target.getMinute() ? this.minute < target.getMinute() : this.second < target.getSecond();
  }
  isAfter(target) {
    if (!this.day.equals(target.getLunarDay())) {
      return this.day.isAfter(target.getLunarDay());
    }
    if (this.hour !== target.getHour()) {
      return this.hour > target.getHour();
    }
    return this.minute !== target.getMinute() ? this.minute > target.getMinute() : this.second > target.getSecond();
  }
  getYearSixtyCycle() {
    const solarTime = this.getSolarTime();
    const solarYear = this.day.getSolarDay().getYear();
    const springSolarTime = SolarTerm.fromIndex(solarYear, 3).getJulianDay().getSolarTime();
    const lunarYear = this.day.getLunarMonth().getLunarYear();
    const year = lunarYear.getYear();
    let sixtyCycle = lunarYear.getSixtyCycle();
    if (year === solarYear) {
      if (solarTime.isBefore(springSolarTime)) {
        sixtyCycle = sixtyCycle.next(-1);
      }
    } else if (year < solarYear) {
      if (!solarTime.isBefore(springSolarTime)) {
        sixtyCycle = sixtyCycle.next(1);
      }
    }
    return sixtyCycle;
  }
  getMonthSixtyCycle() {
    const solarTime = this.getSolarTime();
    const year = solarTime.getYear();
    const term = solarTime.getTerm();
    let index = term.getIndex() - 3;
    if (index < 0 && term.getJulianDay().getSolarTime().isAfter(SolarTerm.fromIndex(year, 3).getJulianDay().getSolarTime())) {
      index += 24;
    }
    return LunarMonth.fromYm(year, 1).getSixtyCycle().next(Math.floor(index / 2));
  }
  getDaySixtyCycle() {
    const d = this.day.getSixtyCycle();
    return this.hour < 23 ? d : d.next(1);
  }
  getSixtyCycle() {
    const earthBranchIndex = this.getIndexInDay() % 12;
    const heavenStemIndex = this.getDaySixtyCycle().getHeavenStem().getIndex() % 5 * 2 + earthBranchIndex;
    return SixtyCycle.fromName(HeavenStem.fromIndex(heavenStemIndex).getName() + EarthBranch.fromIndex(earthBranchIndex).getName());
  }
  getTwelveStar() {
    return TwelveStar.fromIndex(this.getSixtyCycle().getEarthBranch().getIndex() + (8 - this.getDaySixtyCycle().getEarthBranch().getIndex() % 6) * 2);
  }
  getNineStar() {
    const solar = this.day.getSolarDay();
    const dongZhi = SolarTerm.fromIndex(solar.getYear(), 0);
    const xiaZhi = dongZhi.next(12);
    const asc = !solar.isBefore(dongZhi.getJulianDay().getSolarDay()) && solar.isBefore(xiaZhi.getJulianDay().getSolarDay());
    let start2 = [8, 5, 2][this.day.getSixtyCycle().getEarthBranch().getIndex() % 3];
    if (asc) {
      start2 = 8 - start2;
    }
    const earthBranchIndex = this.getIndexInDay() % 12;
    return NineStar.fromIndex(start2 + (asc ? earthBranchIndex : -earthBranchIndex));
  }
  getSolarTime() {
    const d = this.day.getSolarDay();
    return SolarTime.fromYmdHms(d.getYear(), d.getMonth(), d.getDay(), this.hour, this.minute, this.second);
  }
  getEightChar() {
    return _LunarHour2.provider.getEightChar(this);
  }
  getRecommends() {
    return Taboo.getHourRecommends(this.getDaySixtyCycle(), this.getSixtyCycle());
  }
  getAvoids() {
    return Taboo.getHourAvoids(this.getDaySixtyCycle(), this.getSixtyCycle());
  }
  getMinorRen() {
    return this.getLunarDay().getMinorRen().next(this.getIndexInDay());
  }
};
__publicField(_LunarHour, "provider", new DefaultEightCharProvider);
var LunarHour = _LunarHour;
var _JulianDay = class _JulianDay2 extends AbstractTyme {
  constructor(day) {
    super();
    __publicField(this, "day");
    this.day = day;
  }
  static fromJulianDay(day) {
    return new _JulianDay2(day);
  }
  static fromYmdHms(year, month, day, hour, minute, second) {
    const d = day + ((second / 60 + minute) / 60 + hour) / 24;
    let n = 0;
    const g = year * 372 + month * 31 + ~~d >= 588829;
    if (month <= 2) {
      month += 12;
      year--;
    }
    if (g) {
      n = ~~(year / 100);
      n = 2 - n + ~~(n / 4);
    }
    return _JulianDay2.fromJulianDay(~~(365.25 * (year + 4716)) + ~~(30.6001 * (month + 1)) + d + n - 1524.5);
  }
  getDay() {
    return this.day;
  }
  getName() {
    return `${this.day}`;
  }
  next(n) {
    return _JulianDay2.fromJulianDay(this.day + n);
  }
  getSolarDay() {
    return this.getSolarTime().getSolarDay();
  }
  getSolarTime() {
    let d = ~~(this.day + 0.5);
    let f = this.day + 0.5 - d;
    if (d >= 2299161) {
      const c = ~~((d - 1867216.25) / 36524.25);
      d += 1 + c - ~~(c / 4);
    }
    d += 1524;
    let year = ~~((d - 122.1) / 365.25);
    d -= ~~(365.25 * year);
    let month = ~~(d / 30.601);
    d -= ~~(30.601 * month);
    let day = d;
    if (month > 13) {
      month -= 13;
      year -= 4715;
    } else {
      month -= 1;
      year -= 4716;
    }
    f *= 24;
    let hour = ~~f;
    f -= hour;
    f *= 60;
    let minute = ~~f;
    f -= minute;
    f *= 60;
    let second = Math.round(f);
    if (second > 59) {
      second -= 60;
      minute++;
    }
    if (minute > 59) {
      minute -= 60;
      hour++;
    }
    if (hour > 23) {
      hour -= 24;
      day += 1;
    }
    return SolarTime.fromYmdHms(year, month, day, hour, minute, second);
  }
  getWeek() {
    return Week.fromIndex(~~(this.day + 0.5) + 7000001);
  }
  subtract(target) {
    return this.day - target.getDay();
  }
};
__publicField(_JulianDay, "J2000", 2451545);
var JulianDay = _JulianDay;
var _ShouXingUtil = class _ShouXingUtil2 {
  static decode(s) {
    const o = "0000000000";
    const o2 = o + o;
    s = s.replace(/J/g, "00");
    s = s.replace(/I/g, "000");
    s = s.replace(/H/g, "0000");
    s = s.replace(/G/g, "00000");
    s = s.replace(/t/g, "02");
    s = s.replace(/s/g, "002");
    s = s.replace(/r/g, "0002");
    s = s.replace(/q/g, "00002");
    s = s.replace(/p/g, "000002");
    s = s.replace(/o/g, "0000002");
    s = s.replace(/n/g, "00000002");
    s = s.replace(/m/g, "000000002");
    s = s.replace(/l/g, "0000000002");
    s = s.replace(/k/g, "01");
    s = s.replace(/j/g, "0101");
    s = s.replace(/i/g, "001");
    s = s.replace(/h/g, "001001");
    s = s.replace(/g/g, "0001");
    s = s.replace(/f/g, "00001");
    s = s.replace(/e/g, "000001");
    s = s.replace(/d/g, "0000001");
    s = s.replace(/c/g, "00000001");
    s = s.replace(/b/g, "000000001");
    s = s.replace(/a/g, "0000000001");
    s = s.replace(/A/g, o2 + o2 + o2);
    s = s.replace(/B/g, o2 + o2 + o);
    s = s.replace(/C/g, o2 + o2);
    s = s.replace(/D/g, o2 + o);
    s = s.replace(/E/g, o2);
    s = s.replace(/F/g, o);
    return s;
  }
  static nutationLon2(t2) {
    let a = -1.742 * t2, t22 = t2 * t2, dl = 0;
    for (let i = 0, j = _ShouXingUtil2.NUT_B.length;i < j; i += 5) {
      dl += (_ShouXingUtil2.NUT_B[i + 3] + a) * Math.sin(_ShouXingUtil2.NUT_B[i] + _ShouXingUtil2.NUT_B[i + 1] * t2 + _ShouXingUtil2.NUT_B[i + 2] * t22);
      a = 0;
    }
    return dl / 100 / _ShouXingUtil2.SECOND_PER_RAD;
  }
  static eLon(t2, n) {
    t2 /= 10;
    let v = 0, tn = 1;
    let n1, n2;
    let m;
    let c;
    let pn = 1;
    let n0, m0 = _ShouXingUtil2.XL0[pn + 1] - _ShouXingUtil2.XL0[pn];
    for (let i = 0;i < 6; i++, tn *= t2) {
      n1 = ~~_ShouXingUtil2.XL0[pn + i];
      n2 = ~~_ShouXingUtil2.XL0[pn + 1 + i];
      n0 = n2 - n1;
      if (n0 === 0) {
        continue;
      }
      if (n < 0) {
        m = n2;
      } else {
        m = ~~(3 * n * n0 / m0 + 0.5 + n1);
        if (i != 0) {
          m += 3;
        }
        if (m > n2) {
          m = n2;
        }
      }
      c = 0;
      for (let j = n1;j < m; j += 3) {
        c += _ShouXingUtil2.XL0[j] * Math.cos(_ShouXingUtil2.XL0[j + 1] + t2 * _ShouXingUtil2.XL0[j + 2]);
      }
      v += c * tn;
    }
    v /= _ShouXingUtil2.XL0[0];
    let t22 = t2 * t2;
    v += (-0.0728 - 2.7702 * t2 - 1.1019 * t22 - 0.0996 * t22 * t2) / _ShouXingUtil2.SECOND_PER_RAD;
    return v;
  }
  static mLon(t2, n) {
    let ob = _ShouXingUtil2.XL1;
    let obl = ob[0].length;
    let tn = 1;
    let v = 0;
    let j;
    let c;
    let t22 = t2 * t2, t3 = t22 * t2, t4 = t3 * t2, t5 = t4 * t2, tx = t2 - 10;
    v += (3.81034409 + 8399.684730072 * t2 - 0.00003319 * t22 + 0.0000000311 * t3 - 0.0000000002033 * t4) * _ShouXingUtil2.SECOND_PER_RAD;
    v += 5028.792262 * t2 + 1.1124406 * t22 + 0.00007699 * t3 - 0.000023479 * t4 - 0.0000000178 * t5;
    if (tx > 0) {
      v += -0.866 + 1.43 * tx + 0.054 * tx * tx;
    }
    t22 /= 1e4;
    t3 /= 1e8;
    t4 /= 1e8;
    n *= 6;
    if (n < 0) {
      n = obl;
    }
    for (let i = 0, x = ob.length;i < x; i++, tn *= t2) {
      let f = ob[i];
      let l = f.length;
      let m = ~~(n * l / obl + 0.5);
      if (i > 0) {
        m += 6;
      }
      if (m >= l) {
        m = l;
      }
      for (j = 0, c = 0;j < m; j += 6) {
        c += f[j] * Math.cos(f[j + 1] + t2 * f[j + 2] + t22 * f[j + 3] + t3 * f[j + 4] + t4 * f[j + 5]);
      }
      v += c * tn;
    }
    v /= _ShouXingUtil2.SECOND_PER_RAD;
    return v;
  }
  static gxcSunLon(t2) {
    let t22 = t2 * t2;
    let v = -0.043126 + 628.301955 * t2 - 0.000002732 * t22;
    let e = 0.016708634 - 0.000042037 * t2 - 0.0000001267 * t22;
    return -20.49552 * (1 + e * Math.cos(v)) / _ShouXingUtil2.SECOND_PER_RAD;
  }
  static ev(t2) {
    let f = 628.307585 * t2;
    return 628.332 + 21 * Math.sin(1.527 + f) + 0.44 * Math.sin(1.48 + f * 2) + 0.129 * Math.sin(5.82 + f) * t2 + 0.00055 * Math.sin(4.21 + f) * t2 * t2;
  }
  static saLon(t2, n) {
    return _ShouXingUtil2.eLon(t2, n) + _ShouXingUtil2.nutationLon2(t2) + _ShouXingUtil2.gxcSunLon(t2) + Math.PI;
  }
  static dtExt(y, jsd) {
    let dy = (y - 1820) / 100;
    return -20 + jsd * dy * dy;
  }
  static dtCalc(y) {
    const size = _ShouXingUtil2.DT_AT.length;
    let y0 = _ShouXingUtil2.DT_AT[size - 2];
    let t0 = _ShouXingUtil2.DT_AT[size - 1];
    if (y >= y0) {
      let jsd = 31;
      if (y > y0 + 100) {
        return _ShouXingUtil2.dtExt(y, jsd);
      }
      return _ShouXingUtil2.dtExt(y, jsd) - (_ShouXingUtil2.dtExt(y0, jsd) - t0) * (y0 + 100 - y) / 100;
    }
    let i;
    for (i = 0;i < size; i += 5) {
      if (y < _ShouXingUtil2.DT_AT[i + 5]) {
        break;
      }
    }
    let t1 = (y - _ShouXingUtil2.DT_AT[i]) / (_ShouXingUtil2.DT_AT[i + 5] - _ShouXingUtil2.DT_AT[i]) * 10, t2 = t1 * t1, t3 = t2 * t1;
    return _ShouXingUtil2.DT_AT[i + 1] + _ShouXingUtil2.DT_AT[i + 2] * t1 + _ShouXingUtil2.DT_AT[i + 3] * t2 + _ShouXingUtil2.DT_AT[i + 4] * t3;
  }
  static dtT(t2) {
    return _ShouXingUtil2.dtCalc(t2 / 365.2425 + 2000) / _ShouXingUtil2.SECOND_PER_DAY;
  }
  static mv(t2) {
    let v = 8399.71 - 914 * Math.sin(0.7848 + 8328.691425 * t2 + 0.0001523 * t2 * t2);
    v -= 179 * Math.sin(2.543 + 15542.7543 * t2) + 160 * Math.sin(0.1874 + 7214.0629 * t2) + 62 * Math.sin(3.14 + 16657.3828 * t2) + 34 * Math.sin(4.827 + 16866.9323 * t2) + 22 * Math.sin(4.9 + 23871.4457 * t2) + 12 * Math.sin(2.59 + 14914.4523 * t2) + 7 * Math.sin(0.23 + 6585.7609 * t2) + 5 * Math.sin(0.9 + 25195.624 * t2) + 5 * Math.sin(2.32 - 7700.3895 * t2) + 5 * Math.sin(3.88 + 8956.9934 * t2) + 5 * Math.sin(0.49 + 7771.3771 * t2);
    return v;
  }
  static saLonT(w) {
    let t2, v = 628.3319653318;
    t2 = (w - 1.75347 - Math.PI) / v;
    v = _ShouXingUtil2.ev(t2);
    t2 += (w - _ShouXingUtil2.saLon(t2, 10)) / v;
    v = _ShouXingUtil2.ev(t2);
    t2 += (w - _ShouXingUtil2.saLon(t2, -1)) / v;
    return t2;
  }
  static msaLon(t2, mn, sn) {
    return _ShouXingUtil2.mLon(t2, mn) + -0.0000034 - (_ShouXingUtil2.eLon(t2, sn) + _ShouXingUtil2.gxcSunLon(t2) + Math.PI);
  }
  static msaLonT(w) {
    let t2, v = 7771.37714500204;
    t2 = (w + 1.08472) / v;
    t2 += (w - _ShouXingUtil2.msaLon(t2, 3, 3)) / v;
    v = _ShouXingUtil2.mv(t2) - _ShouXingUtil2.ev(t2);
    t2 += (w - _ShouXingUtil2.msaLon(t2, 20, 10)) / v;
    t2 += (w - _ShouXingUtil2.msaLon(t2, -1, 60)) / v;
    return t2;
  }
  static saLonT2(w) {
    const v = 628.3319653318;
    let t2 = (w - 1.75347 - Math.PI) / v;
    t2 -= (0.000005297 * t2 * t2 + 0.0334166 * Math.cos(4.669257 + 628.307585 * t2) + 0.0002061 * Math.cos(2.67823 + 628.307585 * t2) * t2) / v;
    t2 += (w - _ShouXingUtil2.eLon(t2, 8) - Math.PI + (20.5 + 17.2 * Math.sin(2.1824 - 33.75705 * t2)) / _ShouXingUtil2.SECOND_PER_RAD) / v;
    return t2;
  }
  static msaLonT2(w) {
    let t2, v = 7771.37714500204;
    t2 = (w + 1.08472) / v;
    let l, t22 = t2 * t2;
    t2 -= (-0.00003309 * t22 + 0.10976 * Math.cos(0.784758 + 8328.6914246 * t2 + 0.000152292 * t22) + 0.02224 * Math.cos(0.1874 + 7214.0628654 * t2 - 0.00021848 * t22) - 0.03342 * Math.cos(4.669257 + 628.307585 * t2)) / v;
    t22 = t2 * t2;
    l = _ShouXingUtil2.mLon(t2, 20) - (4.8950632 + 628.3319653318 * t2 + 0.000005297 * t22 + 0.0334166 * Math.cos(4.669257 + 628.307585 * t2) + 0.0002061 * Math.cos(2.67823 + 628.307585 * t2) * t2 + 0.000349 * Math.cos(4.6261 + 1256.61517 * t2) - 20.5 / _ShouXingUtil2.SECOND_PER_RAD);
    v = 7771.38 - 914 * Math.sin(0.7848 + 8328.691425 * t2 + 0.0001523 * t22) - 179 * Math.sin(2.543 + 15542.7543 * t2) - 160 * Math.sin(0.1874 + 7214.0629 * t2);
    t2 += (w - l) / v;
    return t2;
  }
  static qiHigh(w) {
    let t2 = _ShouXingUtil2.saLonT2(w) * 36525;
    t2 = t2 - _ShouXingUtil2.dtT(t2) + _ShouXingUtil2.ONE_THIRD;
    const v = (t2 + 0.5) % 1 * _ShouXingUtil2.SECOND_PER_DAY;
    if (v < 1200 || v > _ShouXingUtil2.SECOND_PER_DAY - 1200) {
      t2 = _ShouXingUtil2.saLonT(w) * 36525 - _ShouXingUtil2.dtT(t2) + _ShouXingUtil2.ONE_THIRD;
    }
    return t2;
  }
  static shuoHigh(w) {
    let t2 = _ShouXingUtil2.msaLonT2(w) * 36525;
    t2 = t2 - _ShouXingUtil2.dtT(t2) + _ShouXingUtil2.ONE_THIRD;
    let v = (t2 + 0.5) % 1 * _ShouXingUtil2.SECOND_PER_DAY;
    if (v < 1800 || v > _ShouXingUtil2.SECOND_PER_DAY - 1800) {
      t2 = _ShouXingUtil2.msaLonT(w) * 36525 - _ShouXingUtil2.dtT(t2) + _ShouXingUtil2.ONE_THIRD;
    }
    return t2;
  }
  static qiLow(w) {
    const v = 628.3319653318;
    let t2 = (w - 4.895062166) / v;
    t2 -= (53 * t2 * t2 + 334116 * Math.cos(4.67 + 628.307585 * t2) + 2061 * Math.cos(2.678 + 628.3076 * t2) * t2) / v / 1e7;
    const n = 48950621.66 + 6283319653.318 * t2 + 53 * t2 * t2 + 334166 * Math.cos(4.669257 + 628.307585 * t2) + 3489 * Math.cos(4.6261 + 1256.61517 * t2) + 2060.6 * Math.cos(2.67823 + 628.307585 * t2) * t2 - 994 - 834 * Math.sin(2.1824 - 33.75705 * t2);
    t2 -= (n / 1e7 - w) / 628.332 + (32 * (t2 + 1.8) * (t2 + 1.8) - 20) / _ShouXingUtil2.SECOND_PER_DAY / 36525;
    return t2 * 36525 + _ShouXingUtil2.ONE_THIRD;
  }
  static shuoLow(w) {
    let v = 7771.37714500204;
    let t2 = (w + 1.08472) / v;
    t2 -= (-0.0000331 * t2 * t2 + 0.10976 * Math.cos(0.785 + 8328.6914 * t2) + 0.02224 * Math.cos(0.187 + 7214.0629 * t2) - 0.03342 * Math.cos(4.669 + 628.3076 * t2)) / v + (32 * (t2 + 1.8) * (t2 + 1.8) - 20) / _ShouXingUtil2.SECOND_PER_DAY / 36525;
    return t2 * 36525 + _ShouXingUtil2.ONE_THIRD;
  }
  static calcShuo(jd) {
    let size = _ShouXingUtil2.SHUO_KB.length;
    let d = 0;
    let pc = 14, i;
    jd += 2451545;
    let f1 = _ShouXingUtil2.SHUO_KB[0] - pc, f2 = _ShouXingUtil2.SHUO_KB[size - 1] - pc, f3 = 2436935;
    if (jd < f1 || jd >= f3) {
      d = Math.floor(_ShouXingUtil2.shuoHigh(Math.floor((jd + pc - 2451551) / 29.5306) * _ShouXingUtil2.PI_2) + 0.5);
    } else if (jd >= f1 && jd < f2) {
      for (i = 0;i < size; i += 2) {
        if (jd + pc < _ShouXingUtil2.SHUO_KB[i + 2]) {
          break;
        }
      }
      d = _ShouXingUtil2.SHUO_KB[i] + _ShouXingUtil2.SHUO_KB[i + 1] * Math.floor((jd + pc - _ShouXingUtil2.SHUO_KB[i]) / _ShouXingUtil2.SHUO_KB[i + 1]);
      d = Math.floor(d + 0.5);
      if (d === 1683460) {
        d++;
      }
      d -= 2451545;
    } else if (jd >= f2 && jd < f3) {
      d = Math.floor(_ShouXingUtil2.shuoLow(Math.floor((jd + pc - 2451551) / 29.5306) * _ShouXingUtil2.PI_2) + 0.5);
      let from = Math.floor((jd - f2) / 29.5306);
      let n = _ShouXingUtil2.SB.substring(from, from + 1);
      if (n === "1") {
        d += 1;
      } else if (n === "2") {
        d -= 1;
      }
    }
    return d;
  }
  static calcQi(jd) {
    let size = _ShouXingUtil2.QI_KB.length;
    let d = 0;
    let pc = 7, i;
    jd += 2451545;
    let f1 = _ShouXingUtil2.QI_KB[0] - pc, f2 = _ShouXingUtil2.QI_KB[size - 1] - pc, f3 = 2436935;
    if (jd < f1 || jd >= f3) {
      d = Math.floor(_ShouXingUtil2.qiHigh(Math.floor((jd + pc - 2451259) / 365.2422 * 24) * Math.PI / 12) + 0.5);
    } else if (jd >= f1 && jd < f2) {
      for (i = 0;i < size; i += 2) {
        if (jd + pc < _ShouXingUtil2.QI_KB[i + 2]) {
          break;
        }
      }
      d = _ShouXingUtil2.QI_KB[i] + _ShouXingUtil2.QI_KB[i + 1] * Math.floor((jd + pc - _ShouXingUtil2.QI_KB[i]) / _ShouXingUtil2.QI_KB[i + 1]);
      d = Math.floor(d + 0.5);
      if (d === 1683460) {
        d++;
      }
      d -= 2451545;
    } else if (jd >= f2 && jd < f3) {
      d = Math.floor(_ShouXingUtil2.qiLow(Math.floor((jd + pc - 2451259) / 365.2422 * 24) * Math.PI / 12) + 0.5);
      let from = Math.floor((jd - f2) / 365.2422 * 24);
      let n = _ShouXingUtil2.QB.substring(from, from + 1);
      if (n === "1") {
        d += 1;
      } else if (n === "2") {
        d -= 1;
      }
    }
    return d;
  }
  static qiAccurate(w) {
    const t2 = _ShouXingUtil2.saLonT(w) * 36525;
    return t2 - _ShouXingUtil2.dtT(t2) + _ShouXingUtil2.ONE_THIRD;
  }
  static qiAccurate2(jd) {
    const d = Math.PI / 12;
    const w = Math.floor((jd + 293) / 365.2422 * 24) * d;
    const a = _ShouXingUtil2.qiAccurate(w);
    if (a - jd > 5) {
      return _ShouXingUtil2.qiAccurate(w - d);
    }
    return a - jd < -5 ? _ShouXingUtil2.qiAccurate(w + d) : a;
  }
};
__publicField(_ShouXingUtil, "PI_2", 2 * Math.PI);
__publicField(_ShouXingUtil, "ONE_THIRD", 1 / 3);
__publicField(_ShouXingUtil, "SECOND_PER_DAY", 86400);
__publicField(_ShouXingUtil, "SECOND_PER_RAD", 648000 / Math.PI);
__publicField(_ShouXingUtil, "NUT_B", [
  2.1824,
  -33.75705,
  0.000036,
  -1720,
  920,
  3.5069,
  1256.66393,
  0.000011,
  -132,
  57,
  1.3375,
  16799.4182,
  -0.000051,
  -23,
  10,
  4.3649,
  -67.5141,
  0.000072,
  21,
  -9,
  0.04,
  -628.302,
  0,
  -14,
  0,
  2.36,
  8328.691,
  0,
  7,
  0,
  3.46,
  1884.966,
  0,
  -5,
  2,
  5.44,
  16833.175,
  0,
  -4,
  2,
  3.69,
  25128.11,
  0,
  -3,
  0,
  3.55,
  628.362,
  0,
  2,
  0
]);
__publicField(_ShouXingUtil, "DT_AT", [
  -4000,
  108371.7,
  -13036.8,
  392,
  0,
  -500,
  17201,
  -627.82,
  16.17,
  -0.3413,
  -150,
  12200.6,
  -346.41,
  5.403,
  -0.1593,
  150,
  9113.8,
  -328.13,
  -1.647,
  0.0377,
  500,
  5707.5,
  -391.41,
  0.915,
  0.3145,
  900,
  2203.4,
  -283.45,
  13.034,
  -0.1778,
  1300,
  490.1,
  -57.35,
  2.085,
  -0.0072,
  1600,
  120,
  -9.81,
  -1.532,
  0.1403,
  1700,
  10.2,
  -0.91,
  0.51,
  -0.037,
  1800,
  13.4,
  -0.72,
  0.202,
  -0.0193,
  1830,
  7.8,
  -1.81,
  0.416,
  -0.0247,
  1860,
  8.3,
  -0.13,
  -0.406,
  0.0292,
  1880,
  -5.4,
  0.32,
  -0.183,
  0.0173,
  1900,
  -2.3,
  2.06,
  0.169,
  -0.0135,
  1920,
  21.2,
  1.69,
  -0.304,
  0.0167,
  1940,
  24.2,
  1.22,
  -0.064,
  0.0031,
  1960,
  33.2,
  0.51,
  0.231,
  -0.0109,
  1980,
  51,
  1.29,
  -0.026,
  0.0032,
  2000,
  63.87,
  0.1,
  0,
  0,
  2005,
  64.7,
  0.21,
  0,
  0,
  2012,
  66.8,
  0.22,
  0,
  0,
  2018,
  69,
  0.36,
  0,
  0,
  2028,
  72.6
]);
__publicField(_ShouXingUtil, "XL0", [
  10000000000,
  20,
  578,
  920,
  1100,
  1124,
  1136,
  1148,
  1217,
  1226,
  1229,
  1229,
  1229,
  1229,
  1937,
  2363,
  2618,
  2633,
  2660,
  2666,
  17534704567,
  0,
  0,
  334165646,
  4.669256804,
  6283.075849991,
  3489428,
  4.6261024,
  12566.1517,
  349706,
  2.744118,
  5753.384885,
  341757,
  2.828866,
  3.523118,
  313590,
  3.62767,
  77713.771468,
  267622,
  4.418084,
  7860.419392,
  234269,
  6.135162,
  3930.209696,
  132429,
  0.742464,
  11506.76977,
  127317,
  2.037097,
  529.690965,
  119917,
  1.109629,
  1577.343542,
  99025,
  5.23268,
  5884.92685,
  90186,
  2.04505,
  26.29832,
  85722,
  3.50849,
  398.149,
  77979,
  1.17883,
  5223.69392,
  75314,
  2.53339,
  5507.55324,
  50526,
  4.58293,
  18849.22755,
  49238,
  4.20507,
  775.52261,
  35666,
  2.91954,
  0.06731,
  31709,
  5.84902,
  11790.62909,
  28413,
  1.89869,
  796.29801,
  27104,
  0.31489,
  10977.0788,
  24281,
  0.34481,
  5486.77784,
  20616,
  4.80647,
  2544.31442,
  20539,
  1.86948,
  5573.1428,
  20226,
  2.45768,
  6069.77675,
  15552,
  0.83306,
  213.2991,
  13221,
  3.41118,
  2942.46342,
  12618,
  1.08303,
  20.7754,
  11513,
  0.64545,
  0.98032,
  10285,
  0.636,
  4694.00295,
  10190,
  0.97569,
  15720.83878,
  10172,
  4.2668,
  7.11355,
  9921,
  6.2099,
  2146.1654,
  9761,
  0.681,
  155.4204,
  8580,
  5.9832,
  161000.6857,
  8513,
  1.2987,
  6275.9623,
  8471,
  3.6708,
  71430.6956,
  7964,
  1.8079,
  17260.1547,
  7876,
  3.037,
  12036.4607,
  7465,
  1.7551,
  5088.6288,
  7387,
  3.5032,
  3154.6871,
  7355,
  4.6793,
  801.8209,
  6963,
  0.833,
  9437.7629,
  6245,
  3.9776,
  8827.3903,
  6115,
  1.8184,
  7084.8968,
  5696,
  2.7843,
  6286.599,
  5612,
  4.3869,
  14143.4952,
  5558,
  3.4701,
  6279.5527,
  5199,
  0.1891,
  12139.5535,
  5161,
  1.3328,
  1748.0164,
  5115,
  0.2831,
  5856.4777,
  4900,
  0.4874,
  1194.447,
  4104,
  5.3682,
  8429.2413,
  4094,
  2.3985,
  19651.0485,
  3920,
  6.1683,
  10447.3878,
  3677,
  6.0413,
  10213.2855,
  3660,
  2.5696,
  1059.3819,
  3595,
  1.7088,
  2352.8662,
  3557,
  1.776,
  6812.7668,
  3329,
  0.5931,
  17789.8456,
  3041,
  0.4429,
  83996.8473,
  3005,
  2.7398,
  1349.8674,
  2535,
  3.1647,
  4690.4798,
  2474,
  0.2148,
  3.5904,
  2366,
  0.4847,
  8031.0923,
  2357,
  2.0653,
  3340.6124,
  2282,
  5.222,
  4705.7323,
  2189,
  5.5559,
  553.5694,
  2142,
  1.4256,
  16730.4637,
  2109,
  4.1483,
  951.7184,
  2030,
  0.3713,
  283.8593,
  1992,
  5.2221,
  12168.0027,
  1986,
  5.7747,
  6309.3742,
  1912,
  3.8222,
  23581.2582,
  1889,
  5.3863,
  149854.4001,
  1790,
  2.2149,
  13367.9726,
  1748,
  4.5605,
  135.0651,
  1622,
  5.9884,
  11769.8537,
  1508,
  4.1957,
  6256.7775,
  1442,
  4.1932,
  242.7286,
  1435,
  3.7236,
  38.0277,
  1397,
  4.4014,
  6681.2249,
  1362,
  1.8893,
  7632.9433,
  1250,
  1.1305,
  5.5229,
  1205,
  2.6223,
  955.5997,
  1200,
  1.0035,
  632.7837,
  1129,
  0.1774,
  4164.312,
  1083,
  0.3273,
  103.0928,
  1052,
  0.9387,
  11926.2544,
  1050,
  5.3591,
  1592.596,
  1033,
  6.1998,
  6438.4962,
  1001,
  6.0291,
  5746.2713,
  980,
  0.999,
  11371.705,
  980,
  5.244,
  27511.468,
  938,
  2.624,
  5760.498,
  923,
  0.483,
  522.577,
  922,
  4.571,
  4292.331,
  905,
  5.337,
  6386.169,
  862,
  4.165,
  7058.598,
  841,
  3.299,
  7234.794,
  836,
  4.539,
  25132.303,
  813,
  6.112,
  4732.031,
  812,
  6.271,
  426.598,
  801,
  5.821,
  28.449,
  787,
  0.996,
  5643.179,
  776,
  2.957,
  23013.54,
  769,
  3.121,
  7238.676,
  758,
  3.974,
  11499.656,
  735,
  4.386,
  316.392,
  731,
  0.607,
  11513.883,
  719,
  3.998,
  74.782,
  706,
  0.323,
  263.084,
  676,
  5.911,
  90955.552,
  663,
  3.665,
  17298.182,
  653,
  5.791,
  18073.705,
  630,
  4.717,
  6836.645,
  615,
  1.458,
  233141.314,
  612,
  1.075,
  19804.827,
  596,
  3.321,
  6283.009,
  596,
  2.876,
  6283.143,
  555,
  2.452,
  12352.853,
  541,
  5.392,
  419.485,
  531,
  0.382,
  31441.678,
  519,
  4.065,
  6208.294,
  513,
  2.361,
  10973.556,
  494,
  5.737,
  9917.697,
  450,
  3.272,
  11015.106,
  449,
  3.653,
  206.186,
  447,
  2.064,
  7079.374,
  435,
  4.423,
  5216.58,
  421,
  1.906,
  245.832,
  413,
  0.921,
  3738.761,
  402,
  0.84,
  20.355,
  387,
  1.826,
  11856.219,
  379,
  2.344,
  3.881,
  374,
  2.954,
  3128.389,
  370,
  5.031,
  536.805,
  365,
  1.018,
  16200.773,
  365,
  1.083,
  88860.057,
  352,
  5.978,
  3894.182,
  352,
  2.056,
  244287.6,
  351,
  3.713,
  6290.189,
  340,
  1.106,
  14712.317,
  339,
  0.978,
  8635.942,
  339,
  3.202,
  5120.601,
  333,
  0.837,
  6496.375,
  325,
  3.479,
  6133.513,
  316,
  5.089,
  21228.392,
  316,
  1.328,
  10873.986,
  309,
  3.646,
  10.637,
  303,
  1.802,
  35371.887,
  296,
  3.397,
  9225.539,
  288,
  6.026,
  154717.61,
  281,
  2.585,
  14314.168,
  262,
  3.856,
  266.607,
  262,
  2.579,
  22483.849,
  257,
  1.561,
  23543.231,
  255,
  3.949,
  1990.745,
  251,
  3.744,
  10575.407,
  240,
  1.161,
  10984.192,
  238,
  0.106,
  7.046,
  236,
  4.272,
  6040.347,
  234,
  3.577,
  10969.965,
  211,
  3.714,
  65147.62,
  210,
  0.754,
  13521.751,
  207,
  4.228,
  5650.292,
  202,
  0.814,
  170.673,
  201,
  4.629,
  6037.244,
  200,
  0.381,
  6172.87,
  199,
  3.933,
  6206.81,
  199,
  5.197,
  6262.3,
  197,
  1.046,
  18209.33,
  195,
  1.07,
  5230.807,
  195,
  4.869,
  36.028,
  194,
  4.313,
  6244.943,
  192,
  1.229,
  709.933,
  192,
  5.595,
  6282.096,
  192,
  0.602,
  6284.056,
  189,
  3.744,
  23.878,
  188,
  1.904,
  15.252,
  188,
  0.867,
  22003.915,
  182,
  3.681,
  15110.466,
  181,
  0.491,
  1.484,
  179,
  3.222,
  39302.097,
  179,
  1.259,
  12559.038,
  62833196674749,
  0,
  0,
  20605886,
  2.67823456,
  6283.07584999,
  430343,
  2.635127,
  12566.1517,
  42526,
  1.59047,
  3.52312,
  11926,
  5.79557,
  26.29832,
  10898,
  2.96618,
  1577.34354,
  9348,
  2.5921,
  18849.2275,
  7212,
  1.1385,
  529.691,
  6777,
  1.8747,
  398.149,
  6733,
  4.4092,
  5507.5532,
  5903,
  2.888,
  5223.6939,
  5598,
  2.1747,
  155.4204,
  4541,
  0.398,
  796.298,
  3637,
  0.4662,
  775.5226,
  2896,
  2.6471,
  7.1135,
  2084,
  5.3414,
  0.9803,
  1910,
  1.8463,
  5486.7778,
  1851,
  4.9686,
  213.2991,
  1729,
  2.9912,
  6275.9623,
  1623,
  0.0322,
  2544.3144,
  1583,
  1.4305,
  2146.1654,
  1462,
  1.2053,
  10977.0788,
  1246,
  2.8343,
  1748.0164,
  1188,
  3.258,
  5088.6288,
  1181,
  5.2738,
  1194.447,
  1151,
  2.075,
  4694.003,
  1064,
  0.7661,
  553.5694,
  997,
  1.303,
  6286.599,
  972,
  4.239,
  1349.867,
  945,
  2.7,
  242.729,
  858,
  5.645,
  951.718,
  758,
  5.301,
  2352.866,
  639,
  2.65,
  9437.763,
  610,
  4.666,
  4690.48,
  583,
  1.766,
  1059.382,
  531,
  0.909,
  3154.687,
  522,
  5.661,
  71430.696,
  520,
  1.854,
  801.821,
  504,
  1.425,
  6438.496,
  433,
  0.241,
  6812.767,
  426,
  0.774,
  10447.388,
  413,
  5.24,
  7084.897,
  374,
  2.001,
  8031.092,
  356,
  2.429,
  14143.495,
  350,
  4.8,
  6279.553,
  337,
  0.888,
  12036.461,
  337,
  3.862,
  1592.596,
  325,
  3.4,
  7632.943,
  322,
  0.616,
  8429.241,
  318,
  3.188,
  4705.732,
  297,
  6.07,
  4292.331,
  295,
  1.431,
  5746.271,
  290,
  2.325,
  20.355,
  275,
  0.935,
  5760.498,
  270,
  4.804,
  7234.794,
  253,
  6.223,
  6836.645,
  228,
  5.003,
  17789.846,
  225,
  5.672,
  11499.656,
  215,
  5.202,
  11513.883,
  208,
  3.955,
  10213.286,
  208,
  2.268,
  522.577,
  206,
  2.224,
  5856.478,
  206,
  2.55,
  25132.303,
  203,
  0.91,
  6256.778,
  189,
  0.532,
  3340.612,
  188,
  4.735,
  83996.847,
  179,
  1.474,
  4164.312,
  178,
  3.025,
  5.523,
  177,
  3.026,
  5753.385,
  159,
  4.637,
  3.286,
  157,
  6.124,
  5216.58,
  155,
  3.077,
  6681.225,
  154,
  4.2,
  13367.973,
  143,
  1.191,
  3894.182,
  138,
  3.093,
  135.065,
  136,
  4.245,
  426.598,
  134,
  5.765,
  6040.347,
  128,
  3.085,
  5643.179,
  127,
  2.092,
  6290.189,
  125,
  3.077,
  11926.254,
  125,
  3.445,
  536.805,
  114,
  3.244,
  12168.003,
  112,
  2.318,
  16730.464,
  111,
  3.901,
  11506.77,
  111,
  5.32,
  23.878,
  105,
  3.75,
  7860.419,
  103,
  2.447,
  1990.745,
  96,
  0.82,
  3.88,
  96,
  4.08,
  6127.66,
  91,
  5.42,
  206.19,
  91,
  0.42,
  7079.37,
  88,
  5.17,
  11790.63,
  81,
  0.34,
  9917.7,
  80,
  3.89,
  10973.56,
  78,
  2.4,
  1589.07,
  78,
  2.58,
  11371.7,
  77,
  3.98,
  955.6,
  77,
  3.36,
  36.03,
  76,
  1.3,
  103.09,
  75,
  5.18,
  10969.97,
  75,
  4.96,
  6496.37,
  73,
  5.21,
  38.03,
  72,
  2.65,
  6309.37,
  70,
  5.61,
  3738.76,
  69,
  2.6,
  3496.03,
  69,
  0.39,
  15.25,
  69,
  2.78,
  20.78,
  65,
  1.13,
  7058.6,
  64,
  4.28,
  28.45,
  61,
  5.63,
  10984.19,
  60,
  0.73,
  419.48,
  60,
  5.28,
  10575.41,
  58,
  5.55,
  17298.18,
  58,
  3.19,
  4732.03,
  5291887,
  0,
  0,
  871984,
  1.072097,
  6283.07585,
  30913,
  0.86729,
  12566.1517,
  2734,
  0.053,
  3.5231,
  1633,
  5.1883,
  26.2983,
  1575,
  3.6846,
  155.4204,
  954,
  0.757,
  18849.228,
  894,
  2.057,
  77713.771,
  695,
  0.827,
  775.523,
  506,
  4.663,
  1577.344,
  406,
  1.031,
  7.114,
  381,
  3.441,
  5573.143,
  346,
  5.141,
  796.298,
  317,
  6.053,
  5507.553,
  302,
  1.192,
  242.729,
  289,
  6.117,
  529.691,
  271,
  0.306,
  398.149,
  254,
  2.28,
  553.569,
  237,
  4.381,
  5223.694,
  208,
  3.754,
  0.98,
  168,
  0.902,
  951.718,
  153,
  5.759,
  1349.867,
  145,
  4.364,
  1748.016,
  134,
  3.721,
  1194.447,
  125,
  2.948,
  6438.496,
  122,
  2.973,
  2146.165,
  110,
  1.271,
  161000.686,
  104,
  0.604,
  3154.687,
  100,
  5.986,
  6286.599,
  92,
  4.8,
  5088.63,
  89,
  5.23,
  7084.9,
  83,
  3.31,
  213.3,
  76,
  3.42,
  5486.78,
  71,
  6.19,
  4690.48,
  68,
  3.43,
  4694,
  65,
  1.6,
  2544.31,
  64,
  1.98,
  801.82,
  61,
  2.48,
  10977.08,
  50,
  1.44,
  6836.65,
  49,
  2.34,
  1592.6,
  46,
  1.31,
  4292.33,
  46,
  3.81,
  149854.4,
  43,
  0.04,
  7234.79,
  40,
  4.94,
  7632.94,
  39,
  1.57,
  71430.7,
  38,
  3.17,
  6309.37,
  35,
  0.99,
  6040.35,
  35,
  0.67,
  1059.38,
  31,
  3.18,
  2352.87,
  31,
  3.55,
  8031.09,
  30,
  1.92,
  10447.39,
  30,
  2.52,
  6127.66,
  28,
  4.42,
  9437.76,
  28,
  2.71,
  3894.18,
  27,
  0.67,
  25132.3,
  26,
  5.27,
  6812.77,
  25,
  0.55,
  6279.55,
  23,
  1.38,
  4705.73,
  22,
  0.64,
  6256.78,
  20,
  6.07,
  640.88,
  28923,
  5.84384,
  6283.07585,
  3496,
  0,
  0,
  1682,
  5.4877,
  12566.1517,
  296,
  5.196,
  155.42,
  129,
  4.722,
  3.523,
  71,
  5.3,
  18849.23,
  64,
  5.97,
  242.73,
  40,
  3.79,
  553.57,
  11408,
  3.14159,
  0,
  772,
  4.134,
  6283.076,
  77,
  3.84,
  12566.15,
  42,
  0.42,
  155.42,
  88,
  3.14,
  0,
  17,
  2.77,
  6283.08,
  5,
  2.01,
  155.42,
  3,
  2.21,
  12566.15,
  27962,
  3.1987,
  84334.66158,
  10164,
  5.42249,
  5507.55324,
  8045,
  3.8801,
  5223.6939,
  4381,
  3.7044,
  2352.8662,
  3193,
  4.0003,
  1577.3435,
  2272,
  3.9847,
  1047.7473,
  1814,
  4.9837,
  6283.0758,
  1639,
  3.5646,
  5856.4777,
  1444,
  3.7028,
  9437.7629,
  1430,
  3.4112,
  10213.2855,
  1125,
  4.8282,
  14143.4952,
  1090,
  2.0857,
  6812.7668,
  1037,
  4.0566,
  71092.8814,
  971,
  3.473,
  4694.003,
  915,
  1.142,
  6620.89,
  878,
  4.44,
  5753.385,
  837,
  4.993,
  7084.897,
  770,
  5.554,
  167621.576,
  719,
  3.602,
  529.691,
  692,
  4.326,
  6275.962,
  558,
  4.41,
  7860.419,
  529,
  2.484,
  4705.732,
  521,
  6.25,
  18073.705,
  903,
  3.897,
  5507.553,
  618,
  1.73,
  5223.694,
  380,
  5.244,
  2352.866,
  166,
  1.627,
  84334.662,
  10001398880,
  0,
  0,
  167069963,
  3.098463508,
  6283.075849991,
  1395602,
  3.0552461,
  12566.1517,
  308372,
  5.198467,
  77713.771468,
  162846,
  1.173877,
  5753.384885,
  157557,
  2.846852,
  7860.419392,
  92480,
  5.45292,
  11506.76977,
  54244,
  4.56409,
  3930.2097,
  47211,
  3.661,
  5884.92685,
  34598,
  0.96369,
  5507.55324,
  32878,
  5.89984,
  5223.69392,
  30678,
  0.29867,
  5573.1428,
  24319,
  4.2735,
  11790.62909,
  21183,
  5.84715,
  1577.34354,
  18575,
  5.02194,
  10977.0788,
  17484,
  3.01194,
  18849.22755,
  10984,
  5.05511,
  5486.77784,
  9832,
  0.8868,
  6069.7768,
  8650,
  5.6896,
  15720.8388,
  8583,
  1.2708,
  161000.6857,
  6490,
  0.2725,
  17260.1547,
  6292,
  0.9218,
  529.691,
  5706,
  2.0137,
  83996.8473,
  5574,
  5.2416,
  71430.6956,
  4938,
  3.245,
  2544.3144,
  4696,
  2.5781,
  775.5226,
  4466,
  5.5372,
  9437.7629,
  4252,
  6.0111,
  6275.9623,
  3897,
  5.3607,
  4694.003,
  3825,
  2.3926,
  8827.3903,
  3749,
  0.8295,
  19651.0485,
  3696,
  4.9011,
  12139.5535,
  3566,
  1.6747,
  12036.4607,
  3454,
  1.8427,
  2942.4634,
  3319,
  0.2437,
  7084.8968,
  3192,
  0.1837,
  5088.6288,
  3185,
  1.7778,
  398.149,
  2846,
  1.2134,
  6286.599,
  2779,
  1.8993,
  6279.5527,
  2628,
  4.589,
  10447.3878,
  2460,
  3.7866,
  8429.2413,
  2393,
  4.996,
  5856.4777,
  2359,
  0.2687,
  796.298,
  2329,
  2.8078,
  14143.4952,
  2210,
  1.95,
  3154.6871,
  2035,
  4.6527,
  2146.1654,
  1951,
  5.3823,
  2352.8662,
  1883,
  0.6731,
  149854.4001,
  1833,
  2.2535,
  23581.2582,
  1796,
  0.1987,
  6812.7668,
  1731,
  6.152,
  16730.4637,
  1717,
  4.4332,
  10213.2855,
  1619,
  5.2316,
  17789.8456,
  1381,
  5.1896,
  8031.0923,
  1364,
  3.6852,
  4705.7323,
  1314,
  0.6529,
  13367.9726,
  1041,
  4.3329,
  11769.8537,
  1017,
  1.5939,
  4690.4798,
  998,
  4.201,
  6309.374,
  966,
  3.676,
  27511.468,
  874,
  6.064,
  1748.016,
  779,
  3.674,
  12168.003,
  771,
  0.312,
  7632.943,
  756,
  2.626,
  6256.778,
  746,
  5.648,
  11926.254,
  693,
  2.924,
  6681.225,
  680,
  1.423,
  23013.54,
  674,
  0.563,
  3340.612,
  663,
  5.661,
  11371.705,
  659,
  3.136,
  801.821,
  648,
  2.65,
  19804.827,
  615,
  3.029,
  233141.314,
  612,
  5.134,
  1194.447,
  563,
  4.341,
  90955.552,
  552,
  2.091,
  17298.182,
  534,
  5.1,
  31441.678,
  531,
  2.407,
  11499.656,
  523,
  4.624,
  6438.496,
  513,
  5.324,
  11513.883,
  477,
  0.256,
  11856.219,
  461,
  1.722,
  7234.794,
  458,
  3.766,
  6386.169,
  458,
  4.466,
  5746.271,
  423,
  1.055,
  5760.498,
  422,
  1.557,
  7238.676,
  415,
  2.599,
  7058.598,
  401,
  3.03,
  1059.382,
  397,
  1.201,
  1349.867,
  379,
  4.907,
  4164.312,
  360,
  5.707,
  5643.179,
  352,
  3.626,
  244287.6,
  348,
  0.761,
  10973.556,
  342,
  3.001,
  4292.331,
  336,
  4.546,
  4732.031,
  334,
  3.138,
  6836.645,
  324,
  4.164,
  9917.697,
  316,
  1.691,
  11015.106,
  307,
  0.238,
  35371.887,
  298,
  1.306,
  6283.143,
  298,
  1.75,
  6283.009,
  293,
  5.738,
  16200.773,
  286,
  5.928,
  14712.317,
  281,
  3.515,
  21228.392,
  280,
  5.663,
  8635.942,
  277,
  0.513,
  26.298,
  268,
  4.207,
  18073.705,
  266,
  0.9,
  12352.853,
  260,
  2.962,
  25132.303,
  255,
  2.477,
  6208.294,
  242,
  2.8,
  709.933,
  231,
  1.054,
  22483.849,
  229,
  1.07,
  14314.168,
  216,
  1.314,
  154717.61,
  215,
  6.038,
  10873.986,
  200,
  0.561,
  7079.374,
  198,
  2.614,
  951.718,
  197,
  4.369,
  167283.762,
  186,
  2.861,
  5216.58,
  183,
  1.66,
  39302.097,
  183,
  5.912,
  3738.761,
  175,
  2.145,
  6290.189,
  173,
  2.168,
  10575.407,
  171,
  3.702,
  1592.596,
  171,
  1.343,
  3128.389,
  164,
  5.55,
  6496.375,
  164,
  5.856,
  10984.192,
  161,
  1.998,
  10969.965,
  161,
  1.909,
  6133.513,
  157,
  4.955,
  25158.602,
  154,
  6.216,
  23543.231,
  153,
  5.357,
  13521.751,
  150,
  5.77,
  18209.33,
  150,
  5.439,
  155.42,
  139,
  1.778,
  9225.539,
  139,
  1.626,
  5120.601,
  128,
  2.46,
  13916.019,
  123,
  0.717,
  143571.324,
  122,
  2.654,
  88860.057,
  121,
  4.414,
  3894.182,
  121,
  1.192,
  3.523,
  120,
  4.03,
  553.569,
  119,
  1.513,
  17654.781,
  117,
  3.117,
  14945.316,
  113,
  2.698,
  6040.347,
  110,
  3.085,
  43232.307,
  109,
  0.998,
  955.6,
  108,
  2.939,
  17256.632,
  107,
  5.285,
  65147.62,
  103,
  0.139,
  11712.955,
  103,
  5.85,
  213.299,
  102,
  3.046,
  6037.244,
  101,
  2.842,
  8662.24,
  100,
  3.626,
  6262.3,
  98,
  2.36,
  6206.81,
  98,
  5.11,
  6172.87,
  98,
  2,
  15110.47,
  97,
  2.67,
  5650.29,
  97,
  2.75,
  6244.94,
  96,
  4.02,
  6282.1,
  96,
  5.31,
  6284.06,
  92,
  0.1,
  29088.81,
  85,
  3.26,
  20426.57,
  84,
  2.6,
  28766.92,
  81,
  3.58,
  10177.26,
  80,
  5.81,
  5230.81,
  78,
  2.53,
  16496.36,
  77,
  4.06,
  6127.66,
  73,
  0.04,
  5481.25,
  72,
  5.96,
  12559.04,
  72,
  5.92,
  4136.91,
  71,
  5.49,
  22003.91,
  70,
  3.41,
  7.11,
  69,
  0.62,
  11403.68,
  69,
  3.9,
  1589.07,
  69,
  1.96,
  12416.59,
  69,
  4.51,
  426.6,
  67,
  1.61,
  11087.29,
  66,
  4.5,
  47162.52,
  66,
  5.08,
  283.86,
  66,
  4.32,
  16858.48,
  65,
  1.04,
  6062.66,
  64,
  1.59,
  18319.54,
  63,
  5.7,
  45892.73,
  63,
  4.6,
  66567.49,
  63,
  3.82,
  13517.87,
  62,
  2.62,
  11190.38,
  61,
  1.54,
  33019.02,
  60,
  5.58,
  10344.3,
  60,
  5.38,
  316428.23,
  60,
  5.78,
  632.78,
  59,
  6.12,
  9623.69,
  57,
  0.16,
  17267.27,
  57,
  3.86,
  6076.89,
  57,
  1.98,
  7668.64,
  56,
  4.78,
  20199.09,
  55,
  4.56,
  18875.53,
  55,
  3.51,
  17253.04,
  54,
  3.07,
  226858.24,
  54,
  4.83,
  18422.63,
  53,
  5.02,
  12132.44,
  52,
  3.63,
  5333.9,
  52,
  0.97,
  155427.54,
  51,
  3.36,
  20597.24,
  50,
  0.99,
  11609.86,
  50,
  2.21,
  1990.75,
  48,
  1.62,
  12146.67,
  48,
  1.17,
  12569.67,
  47,
  4.62,
  5436.99,
  47,
  1.81,
  12562.63,
  47,
  0.59,
  21954.16,
  47,
  0.76,
  7342.46,
  46,
  0.27,
  4590.91,
  46,
  3.77,
  156137.48,
  45,
  5.66,
  10454.5,
  44,
  5.84,
  3496.03,
  43,
  0.24,
  17996.03,
  41,
  5.93,
  51092.73,
  41,
  4.21,
  12592.45,
  40,
  5.14,
  1551.05,
  40,
  5.28,
  15671.08,
  39,
  3.69,
  18052.93,
  39,
  4.94,
  24356.78,
  38,
  2.72,
  11933.37,
  38,
  5.23,
  7477.52,
  38,
  4.99,
  9779.11,
  37,
  3.7,
  9388.01,
  37,
  4.44,
  4535.06,
  36,
  2.16,
  28237.23,
  36,
  2.54,
  242.73,
  36,
  0.22,
  5429.88,
  35,
  6.15,
  19800.95,
  35,
  2.92,
  36949.23,
  34,
  5.63,
  2379.16,
  34,
  5.73,
  16460.33,
  34,
  5.11,
  5849.36,
  33,
  6.19,
  6268.85,
  10301861,
  1.1074897,
  6283.07584999,
  172124,
  1.064423,
  12566.1517,
  70222,
  3.14159,
  0,
  3235,
  1.0217,
  18849.2275,
  3080,
  2.8435,
  5507.5532,
  2497,
  1.3191,
  5223.6939,
  1849,
  1.4243,
  1577.3435,
  1008,
  5.9138,
  10977.0788,
  865,
  1.42,
  6275.962,
  863,
  0.271,
  5486.778,
  507,
  1.686,
  5088.629,
  499,
  6.014,
  6286.599,
  467,
  5.987,
  529.691,
  440,
  0.518,
  4694.003,
  410,
  1.084,
  9437.763,
  387,
  4.75,
  2544.314,
  375,
  5.071,
  796.298,
  352,
  0.023,
  83996.847,
  344,
  0.949,
  71430.696,
  341,
  5.412,
  775.523,
  322,
  6.156,
  2146.165,
  286,
  5.484,
  10447.388,
  284,
  3.42,
  2352.866,
  255,
  6.132,
  6438.496,
  252,
  0.243,
  398.149,
  243,
  3.092,
  4690.48,
  225,
  3.689,
  7084.897,
  220,
  4.952,
  6812.767,
  219,
  0.42,
  8031.092,
  209,
  1.282,
  1748.016,
  193,
  5.314,
  8429.241,
  185,
  1.82,
  7632.943,
  175,
  3.229,
  6279.553,
  173,
  1.537,
  4705.732,
  158,
  4.097,
  11499.656,
  158,
  5.539,
  3154.687,
  150,
  3.633,
  11513.883,
  148,
  3.222,
  7234.794,
  147,
  3.653,
  1194.447,
  144,
  0.817,
  14143.495,
  135,
  6.151,
  5746.271,
  134,
  4.644,
  6836.645,
  128,
  2.693,
  1349.867,
  123,
  5.65,
  5760.498,
  118,
  2.577,
  13367.973,
  113,
  3.357,
  17789.846,
  110,
  4.497,
  4292.331,
  108,
  5.828,
  12036.461,
  102,
  5.621,
  6256.778,
  99,
  1.14,
  1059.38,
  98,
  0.66,
  5856.48,
  93,
  2.32,
  10213.29,
  92,
  0.77,
  16730.46,
  88,
  1.5,
  11926.25,
  86,
  1.42,
  5753.38,
  85,
  0.66,
  155.42,
  81,
  1.64,
  6681.22,
  80,
  4.11,
  951.72,
  66,
  4.55,
  5216.58,
  65,
  0.98,
  25132.3,
  64,
  4.19,
  6040.35,
  64,
  0.52,
  6290.19,
  63,
  1.51,
  5643.18,
  59,
  6.18,
  4164.31,
  57,
  2.3,
  10973.56,
  55,
  2.32,
  11506.77,
  55,
  2.2,
  1592.6,
  55,
  5.27,
  3340.61,
  54,
  5.54,
  553.57,
  53,
  5.04,
  9917.7,
  53,
  0.92,
  11371.7,
  52,
  3.98,
  17298.18,
  52,
  3.6,
  10969.97,
  49,
  5.91,
  3894.18,
  49,
  2.51,
  6127.66,
  48,
  1.67,
  12168,
  46,
  0.31,
  801.82,
  42,
  3.7,
  10575.41,
  42,
  4.05,
  10984.19,
  40,
  2.17,
  7860.42,
  40,
  4.17,
  26.3,
  38,
  5.82,
  7058.6,
  37,
  3.39,
  6496.37,
  36,
  1.08,
  6309.37,
  36,
  5.34,
  7079.37,
  34,
  3.62,
  11790.63,
  32,
  0.32,
  16200.77,
  31,
  4.24,
  3738.76,
  29,
  4.55,
  11856.22,
  29,
  1.26,
  8635.94,
  27,
  3.45,
  5884.93,
  26,
  5.08,
  10177.26,
  26,
  5.38,
  21228.39,
  24,
  2.26,
  11712.96,
  24,
  1.05,
  242.73,
  24,
  5.59,
  6069.78,
  23,
  3.63,
  6284.06,
  23,
  1.64,
  4732.03,
  22,
  3.46,
  213.3,
  21,
  1.05,
  3496.03,
  21,
  3.92,
  13916.02,
  21,
  4.01,
  5230.81,
  20,
  5.16,
  12352.85,
  20,
  0.69,
  1990.75,
  19,
  2.73,
  6062.66,
  19,
  5.01,
  11015.11,
  18,
  6.04,
  6283.01,
  18,
  2.85,
  7238.68,
  18,
  5.6,
  6283.14,
  18,
  5.16,
  17253.04,
  18,
  2.54,
  14314.17,
  17,
  1.58,
  7.11,
  17,
  0.98,
  3930.21,
  17,
  4.75,
  17267.27,
  16,
  2.19,
  6076.89,
  16,
  2.19,
  18073.7,
  16,
  6.12,
  3.52,
  16,
  4.61,
  9623.69,
  16,
  3.4,
  16496.36,
  15,
  0.19,
  9779.11,
  15,
  5.3,
  13517.87,
  15,
  4.26,
  3128.39,
  15,
  0.81,
  709.93,
  14,
  0.5,
  25158.6,
  14,
  4.38,
  4136.91,
  13,
  0.98,
  65147.62,
  13,
  3.31,
  154717.61,
  13,
  2.11,
  1589.07,
  13,
  1.92,
  22483.85,
  12,
  6.03,
  9225.54,
  12,
  1.53,
  12559.04,
  12,
  5.82,
  6282.1,
  12,
  5.61,
  5642.2,
  12,
  2.38,
  167283.76,
  12,
  0.39,
  12132.44,
  12,
  3.98,
  4686.89,
  12,
  5.81,
  12569.67,
  12,
  0.56,
  5849.36,
  11,
  0.45,
  6172.87,
  11,
  5.8,
  16858.48,
  11,
  6.22,
  12146.67,
  11,
  2.27,
  5429.88,
  435939,
  5.784551,
  6283.07585,
  12363,
  5.57935,
  12566.1517,
  1234,
  3.1416,
  0,
  879,
  3.628,
  77713.771,
  569,
  1.87,
  5573.143,
  330,
  5.47,
  18849.228,
  147,
  4.48,
  5507.553,
  110,
  2.842,
  161000.686,
  101,
  2.815,
  5223.694,
  85,
  3.11,
  1577.34,
  65,
  5.47,
  775.52,
  61,
  1.38,
  6438.5,
  50,
  4.42,
  6286.6,
  47,
  3.66,
  7084.9,
  46,
  5.39,
  149854.4,
  42,
  0.9,
  10977.08,
  40,
  3.2,
  5088.63,
  35,
  1.81,
  5486.78,
  32,
  5.35,
  3154.69,
  30,
  3.52,
  796.3,
  29,
  4.62,
  4690.48,
  28,
  1.84,
  4694,
  27,
  3.14,
  71430.7,
  27,
  6.17,
  6836.65,
  26,
  1.42,
  2146.17,
  25,
  2.81,
  1748.02,
  24,
  2.18,
  155.42,
  23,
  4.76,
  7234.79,
  21,
  3.38,
  7632.94,
  21,
  0.22,
  4705.73,
  20,
  4.22,
  1349.87,
  20,
  2.01,
  1194.45,
  20,
  4.58,
  529.69,
  19,
  1.59,
  6309.37,
  18,
  5.7,
  6040.35,
  18,
  6.03,
  4292.33,
  17,
  2.9,
  9437.76,
  17,
  2,
  8031.09,
  17,
  5.78,
  83996.85,
  16,
  0.05,
  2544.31,
  15,
  0.95,
  6127.66,
  14,
  0.36,
  10447.39,
  14,
  1.48,
  2352.87,
  13,
  0.77,
  553.57,
  13,
  5.48,
  951.72,
  13,
  5.27,
  6279.55,
  13,
  3.76,
  6812.77,
  11,
  5.41,
  6256.78,
  10,
  0.68,
  1592.6,
  10,
  4.95,
  398.15,
  10,
  1.15,
  3894.18,
  10,
  5.2,
  244287.6,
  10,
  1.94,
  11856.22,
  9,
  5.39,
  25132.3,
  8,
  6.18,
  1059.38,
  8,
  0.69,
  8429.24,
  8,
  5.85,
  242.73,
  7,
  5.26,
  14143.5,
  7,
  0.52,
  801.82,
  6,
  2.24,
  8635.94,
  6,
  4,
  13367.97,
  6,
  2.77,
  90955.55,
  6,
  5.17,
  7058.6,
  5,
  1.46,
  233141.31,
  5,
  4.13,
  7860.42,
  5,
  3.91,
  26.3,
  5,
  3.89,
  12036.46,
  5,
  5.58,
  6290.19,
  5,
  5.54,
  1990.75,
  5,
  0.83,
  11506.77,
  5,
  6.22,
  6681.22,
  4,
  5.26,
  10575.41,
  4,
  1.91,
  7477.52,
  4,
  0.43,
  10213.29,
  4,
  1.09,
  709.93,
  4,
  5.09,
  11015.11,
  4,
  4.22,
  88860.06,
  4,
  3.57,
  7079.37,
  4,
  1.98,
  6284.06,
  4,
  3.93,
  10973.56,
  4,
  6.18,
  9917.7,
  4,
  0.36,
  10177.26,
  4,
  2.75,
  3738.76,
  4,
  3.33,
  5643.18,
  4,
  5.36,
  25158.6,
  14459,
  4.27319,
  6283.07585,
  673,
  3.917,
  12566.152,
  77,
  0,
  0,
  25,
  3.73,
  18849.23,
  4,
  2.8,
  6286.6,
  386,
  2.564,
  6283.076,
  31,
  2.27,
  12566.15,
  5,
  3.44,
  5573.14,
  2,
  2.05,
  18849.23,
  1,
  2.06,
  77713.77,
  1,
  4.41,
  161000.69,
  1,
  3.82,
  149854.4,
  1,
  4.08,
  6127.66,
  1,
  5.26,
  6438.5,
  9,
  1.22,
  6283.08,
  1,
  0.66,
  12566.15
]);
__publicField(_ShouXingUtil, "XL1", [
  [22639.586, 0.78475822, 8328.691424623, 1.5229241, 25.0719, -0.123598, 4586.438, 0.1873974, 7214.06286536, -2.184756, -18.86, 0.0828, 2369.914, 2.542952, 15542.75428998, -0.661832, 6.212, -0.0408, 769.026, 3.140313, 16657.38284925, 3.04585, 50.144, -0.2472, 666.418, 1.527671, 628.30195521, -0.02664, 0.062, -0.0054, 411.596, 4.826607, 16866.932315, -1.28012, -1.07, -0.0059, 211.656, 4.115028, -1114.6285593, -3.70768, -43.93, 0.2064, 205.436, 0.230523, 6585.7609101, -2.15812, -18.92, 0.0882, 191.956, 4.898507, 23871.4457146, 0.86109, 31.28, -0.164, 164.729, 2.586078, 14914.4523348, -0.6352, 6.15, -0.035, 147.321, 5.4553, -7700.3894694, -1.5496, -25.01, 0.118, 124.988, 0.48608, 7771.377145, -0.3309, 3.11, -0.02, 109.38, 3.88323, 8956.9933798, 1.4963, 25.13, -0.129, 55.177, 5.57033, -1324.178025, 0.6183, 7.3, -0.035, 45.1, 0.89898, 25195.62374, 0.2428, 24, -0.129, 39.533, 3.81213, -8538.24089, 2.803, 26.1, -0.118, 38.43, 4.30115, 22756.817155, -2.8466, -12.6, 0.042, 36.124, 5.49587, 24986.074274, 4.5688, 75.2, -0.371, 30.773, 1.94559, 14428.125731, -4.3695, -37.7, 0.166, 28.397, 3.28586, 7842.364821, -2.2114, -18.8, 0.077, 24.358, 5.64142, 16171.056245, -0.6885, 6.3, -0.046, 18.585, 4.41371, -557.31428, -1.8538, -22, 0.1, 17.954, 3.58454, 8399.6791, -0.3576, 3.2, -0.03, 14.53, 4.9416, 23243.143759, 0.888, 31.2, -0.16, 14.38, 0.9709, 32200.137139, 2.384, 56.4, -0.29, 14.251, 5.7641, -2.3012, 1.523, 25.1, -0.12, 13.899, 0.3735, 31085.50858, -1.324, 12.4, -0.08, 13.194, 1.7595, -9443.319984, -5.231, -69, 0.33, 9.679, 3.0997, -16029.080894, -3.072, -50.1, 0.24, 9.366, 0.3016, 24080.99518, -3.465, -19.9, 0.08, 8.606, 4.1582, -1742.930514, -3.681, -44, 0.21, 8.453, 2.8416, 16100.06857, 1.192, 28.2, -0.14, 8.05, 2.6292, 14286.15038, -0.609, 6.1, -0.03, 7.63, 6.2388, 17285.684804, 3.019, 50.2, -0.25, 7.447, 1.4845, 1256.60391, -0.053, 0.1, -0.01, 7.371, 0.2736, 5957.458955, -2.131, -19, 0.09, 7.063, 5.6715, 33.757047, -0.308, -3.6, 0.02, 6.383, 4.7843, 7004.5134, 2.141, 32.4, -0.16, 5.742, 2.6572, 32409.686605, -1.942, 5, -0.05, 4.374, 4.3443, 22128.5152, -2.82, -13, 0.05, 3.998, 3.2545, 33524.31516, 1.766, 49, -0.25, 3.21, 2.2443, 14985.44001, -2.516, -16, 0.06, 2.915, 1.7138, 24499.74767, 0.834, 31, -0.17, 2.732, 1.9887, 13799.82378, -4.343, -38, 0.17, 2.568, 5.4122, -7072.08751, -1.576, -25, 0.11, 2.521, 3.2427, 8470.66678, -2.238, -19, 0.07, 2.489, 4.0719, -486.3266, -3.734, -44, 0.2, 2.146, 5.6135, -1952.47998, 0.645, 7, -0.03, 1.978, 2.7291, 39414.2, 0.199, 37, -0.21, 1.934, 1.5682, 33314.7657, 6.092, 100, -0.5, 1.871, 0.4166, 30457.20662, -1.297, 12, -0.1, 1.753, 2.0582, -8886.0057, -3.38, -47, 0.2, 1.437, 2.386, -695.87607, 0.59, 7, 0, 1.373, 3.026, -209.54947, 4.33, 51, -0.2, 1.262, 5.94, 16728.37052, 1.17, 28, -0.1, 1.224, 6.172, 6656.74859, -4.04, -41, 0.2, 1.187, 5.873, 6099.43431, -5.89, -63, 0.3, 1.177, 1.014, 31571.83518, 2.41, 56, -0.3, 1.162, 3.84, 9585.29534, 1.47, 25, -0.1, 1.143, 5.639, 8364.73984, -2.18, -19, 0.1, 1.078, 1.229, 70.98768, -1.88, -22, 0.1, 1.059, 3.326, 40528.82856, 3.91, 81, -0.4, 0.99, 5.013, 40738.37803, -0.42, 30, -0.2, 0.948, 5.687, -17772.01141, -6.75, -94, 0.5, 0.876, 0.298, -0.35232, 0, 0, 0, 0.822, 2.994, 393.02097, 0, 0, 0, 0.788, 1.836, 8326.39022, 3.05, 50, -0.2, 0.752, 4.985, 22614.8418, 0.91, 31, -0.2, 0.74, 2.875, 8330.99262, 0, 0, 0, 0.669, 0.744, -24357.77232, -4.6, -75, 0.4, 0.644, 1.314, 8393.12577, -2.18, -19, 0.1, 0.639, 5.888, 575.33849, 0, 0, 0, 0.635, 1.116, 23385.11911, -2.87, -13, 0, 0.584, 5.197, 24428.75999, 2.71, 53, -0.3, 0.583, 3.513, -9095.55517, 0.95, 4, 0, 0.572, 6.059, 29970.88002, -5.03, -32, 0.1, 0.565, 2.96, 0.32863, 1.52, 25, -0.1, 0.561, 4.001, -17981.56087, -2.43, -43, 0.2, 0.557, 0.529, 7143.07519, -0.3, 3, 0, 0.546, 2.311, 25614.37623, 4.54, 75, -0.4, 0.536, 4.229, 15752.30376, -4.99, -45, 0.2, 0.493, 3.316, -8294.9344, -1.83, -29, 0.1, 0.491, 1.744, 8362.4485, 1.21, 21, -0.1, 0.478, 1.803, -10071.6219, -5.2, -69, 0.3, 0.454, 0.857, 15333.2048, 3.66, 57, -0.3, 0.445, 2.071, 8311.7707, -2.18, -19, 0.1, 0.426, 0.345, 23452.6932, -3.44, -20, 0.1, 0.42, 4.941, 33733.8646, -2.56, -2, 0, 0.413, 1.642, 17495.2343, -1.31, -1, 0, 0.404, 1.458, 23314.1314, -0.99, 9, -0.1, 0.395, 2.132, 38299.5714, -3.51, -6, 0, 0.382, 2.7, 31781.3846, -1.92, 5, 0, 0.375, 4.827, 6376.2114, 2.17, 32, -0.2, 0.361, 3.867, 16833.1753, -0.97, 3, 0, 0.358, 5.044, 15056.4277, -4.4, -38, 0.2, 0.35, 5.157, -8257.7037, -3.4, -47, 0.2, 0.344, 4.233, 157.7344, 0, 0, 0, 0.34, 2.672, 13657.8484, -0.58, 6, 0, 0.329, 5.61, 41853.0066, 3.29, 74, -0.4, 0.325, 5.895, -39.8149, 0, 0, 0, 0.309, 4.387, 21500.2132, -2.79, -13, 0.1, 0.302, 1.278, 786.0419, 0, 0, 0, 0.302, 5.341, -24567.3218, -0.27, -24, 0.1, 0.301, 1.045, 5889.8848, -1.57, -12, 0, 0.294, 4.201, -2371.2325, -3.65, -44, 0.2, 0.293, 3.704, 21642.1886, -6.55, -57, 0.2, 0.29, 4.069, 32828.4391, 2.36, 56, -0.3, 0.289, 3.472, 31713.8105, -1.35, 12, -0.1, 0.285, 5.407, -33.7814, 0.31, 4, 0, 0.283, 5.998, -16.9207, -3.71, -44, 0.2, 0.283, 2.772, 38785.898, 0.23, 37, -0.2, 0.274, 5.343, 15613.742, -2.54, -16, 0.1, 0.263, 3.997, 25823.9257, 0.22, 24, -0.1, 0.254, 0.6, 24638.3095, -1.61, 2, 0, 0.253, 1.344, 6447.1991, 0.29, 10, -0.1, 0.25, 0.887, 141.9754, -3.76, -44, 0.2, 0.247, 0.317, 5329.157, -2.1, -19, 0.1, 0.245, 0.141, 36.0484, -3.71, -44, 0.2, 0.231, 2.287, 14357.1381, -2.49, -16, 0.1, 0.227, 5.158, 2.6298, 0, 0, 0, 0.219, 5.085, 47742.8914, 1.72, 63, -0.3, 0.211, 2.145, 6638.7244, -2.18, -19, 0.1, 0.201, 4.415, 39623.7495, -4.13, -14, 0, 0.194, 2.091, 588.4927, 0, 0, 0, 0.193, 3.057, -15400.7789, -3.1, -50, 0, 0.186, 5.598, 16799.3582, -0.72, 6, 0, 0.185, 3.886, 1150.677, 0, 0, 0, 0.183, 1.619, 7178.0144, 1.52, 25, 0, 0.181, 2.635, 8328.3391, 1.52, 25, 0, 0.181, 2.077, 8329.0437, 1.52, 25, 0, 0.179, 3.215, -9652.8694, -0.9, -18, 0, 0.176, 1.716, -8815.018, -5.26, -69, 0, 0.175, 5.673, 550.7553, 0, 0, 0, 0.17, 2.06, 31295.058, -5.6, -39, 0, 0.167, 1.239, 7211.7617, -0.7, 6, 0, 0.165, 4.499, 14967.4158, -0.7, 6, 0, 0.164, 3.595, 15540.4531, 0.9, 31, 0, 0.164, 4.237, 522.3694, 0, 0, 0, 0.163, 4.633, 15545.0555, -2.2, -19, 0, 0.161, 0.478, 6428.0209, -2.2, -19, 0, 0.158, 2.03, 13171.5218, -4.3, -38, 0, 0.157, 2.28, 7216.3641, -3.7, -44, 0, 0.154, 5.65, 7935.6705, 1.5, 25, 0, 0.152, 0.46, 29828.9047, -1.3, 12, 0, 0.151, 1.19, -0.7113, 0, 0, 0, 0.15, 1.42, 23942.4334, -1, 9, 0, 0.144, 2.75, 7753.3529, 1.5, 25, 0, 0.137, 2.08, 7213.7105, -2.2, -19, 0, 0.137, 1.44, 7214.4152, -2.2, -19, 0, 0.136, 4.46, -1185.6162, -1.8, -22, 0, 0.136, 3.03, 8000.1048, -2.2, -19, 0, 0.134, 2.83, 14756.7124, -0.7, 6, 0, 0.131, 5.05, 6821.0419, -2.2, -19, 0, 0.128, 5.99, -17214.6971, -4.9, -72, 0, 0.127, 5.35, 8721.7124, 1.5, 25, 0, 0.126, 4.49, 46628.2629, -2, 19, 0, 0.125, 5.94, 7149.6285, 1.5, 25, 0, 0.124, 1.09, 49067.0695, 1.1, 55, 0, 0.121, 2.88, 15471.7666, 1.2, 28, 0, 0.111, 3.92, 41643.4571, 7.6, 125, -1, 0.11, 1.96, 8904.0299, 1.5, 25, 0, 0.106, 3.3, -18.0489, -2.2, -19, 0, 0.105, 2.3, -4.931, 1.5, 25, 0, 0.104, 2.22, -6.559, -1.9, -22, 0, 0.101, 1.44, 1884.9059, -0.1, 0, 0, 0.1, 5.92, 5471.1324, -5.9, -63, 0, 0.099, 1.12, 15149.7333, -0.7, 6, 0, 0.096, 4.73, 15508.9972, -0.4, 10, 0, 0.095, 5.18, 7230.9835, 1.5, 25, 0, 0.093, 3.37, 39900.5266, 3.9, 81, 0, 0.092, 2.01, 25057.0619, 2.7, 53, 0, 0.092, 1.21, -79.6298, 0, 0, 0, 0.092, 1.65, -26310.2523, -4, -68, 0, 0.091, 1.01, 42062.5561, -1, 23, 0, 0.09, 6.1, 29342.5781, -5, -32, 0, 0.09, 4.43, 15542.402, -0.7, 6, 0, 0.09, 3.8, 15543.1066, -0.7, 6, 0, 0.089, 4.15, 6063.3859, -2.2, -19, 0, 0.086, 4.03, 52.9691, 0, 0, 0, 0.085, 0.49, 47952.4409, -2.6, 11, 0, 0.085, 1.6, 7632.8154, 2.1, 32, 0, 0.084, 0.22, 14392.0773, -0.7, 6, 0, 0.083, 6.22, 6028.4466, -4, -41, 0, 0.083, 0.63, -7909.9389, 2.8, 26, 0, 0.083, 5.2, -77.5523, 0, 0, 0, 0.082, 2.74, 8786.1467, -2.2, -19, 0, 0.08, 2.43, 9166.5428, -2.8, -26, 0, 0.08, 3.7, -25405.1732, 4.1, 27, 0, 0.078, 5.68, 48857.52, 5.4, 106, -1, 0.077, 1.85, 8315.5735, -2.2, -19, 0, 0.075, 5.46, -18191.1103, 1.9, 8, 0, 0.075, 1.41, -16238.6304, 1.3, 1, 0, 0.074, 5.06, 40110.0761, -0.4, 30, 0, 0.072, 2.1, 64.4343, -3.7, -44, 0, 0.071, 2.17, 37671.2695, -3.5, -6, 0, 0.069, 1.71, 16693.4313, -0.7, 6, 0, 0.069, 3.33, -26100.7028, -8.3, -119, 1, 0.068, 1.09, 8329.4028, 1.5, 25, 0, 0.068, 3.62, 8327.9801, 1.5, 25, 0, 0.068, 2.41, 16833.1509, -1, 3, 0, 0.067, 3.4, 24709.2971, -3.5, -20, 0, 0.067, 1.65, 8346.7156, -0.3, 3, 0, 0.066, 2.61, 22547.2677, 1.5, 39, 0, 0.066, 3.5, 15576.5113, -1, 3, 0, 0.065, 5.76, 33037.9886, -2, 5, 0, 0.065, 4.58, 8322.1325, -0.3, 3, 0, 0.065, 6.2, 17913.9868, 3, 50, 0, 0.065, 1.5, 22685.8295, -1, 9, 0, 0.065, 2.37, 7180.3058, -1.9, -15, 0, 0.064, 1.06, 30943.5332, 2.4, 56, 0, 0.064, 1.89, 8288.8765, 1.5, 25, 0, 0.064, 4.7, 6.0335, 0.3, 4, 0, 0.063, 2.83, 8368.5063, 1.5, 25, 0, 0.063, 5.66, -2580.7819, 0.7, 7, 0, 0.062, 3.78, 7056.3285, -2.2, -19, 0, 0.061, 1.49, 8294.91, 1.8, 29, 0, 0.061, 0.12, -10281.1714, -0.9, -18, 0, 0.061, 3.06, -8362.4729, -1.2, -21, 0, 0.061, 4.43, 8170.9571, 1.5, 25, 0, 0.059, 5.78, -13.1179, -3.7, -44, 0, 0.059, 5.97, 6625.5702, -2.2, -19, 0, 0.058, 5.01, -0.508, -0.3, 0, 0, 0.058, 2.73, 7161.0938, -2.2, -19, 0, 0.057, 0.19, 7214.0629, -2.2, -19, 0, 0.057, 4, 22199.5029, -4.7, -35, 0, 0.057, 5.38, 8119.142, 5.8, 76, 0, 0.056, 1.07, 7542.6495, 1.5, 25, 0, 0.056, 0.28, 8486.4258, 1.5, 25, 0, 0.054, 4.19, 16655.0816, 4.6, 75, 0, 0.053, 0.72, 7267.032, -2.2, -19, 0, 0.053, 3.12, 12.6192, 0.6, 7, 0, 0.052, 2.99, -32896.013, -1.8, -49, 0, 0.052, 3.46, 1097.708, 0, 0, 0, 0.051, 5.37, -6443.786, -1.6, -25, 0, 0.051, 1.35, 7789.401, -2.2, -19, 0, 0.051, 5.83, 40042.502, 0.2, 38, 0, 0.051, 3.63, 9114.733, 1.5, 25, 0, 0.05, 1.51, 8504.484, -2.5, -22, 0, 0.05, 5.23, 16659.684, 1.5, 25, 0, 0.05, 1.15, 7247.82, -2.5, -23, 0, 0.047, 0.25, -1290.421, 0.3, 0, 0, 0.047, 4.67, -32686.464, -6.1, -100, 0, 0.047, 3.49, 548.678, 0, 0, 0, 0.047, 2.37, 6663.308, -2.2, -19, 0, 0.046, 0.98, 1572.084, 0, 0, 0, 0.046, 2.04, 14954.262, -0.7, 6, 0, 0.046, 3.72, 6691.693, -2.2, -19, 0, 0.045, 6.19, -235.287, 0, 0, 0, 0.044, 2.96, 32967.001, -0.1, 27, 0, 0.044, 3.82, -1671.943, -5.6, -66, 0, 0.043, 5.82, 1179.063, 0, 0, 0, 0.043, 0.07, 34152.617, 1.7, 49, 0, 0.043, 3.71, 6514.773, -0.3, 0, 0, 0.043, 5.62, 15.732, -2.5, -23, 0, 0.043, 5.8, 8351.233, -2.2, -19, 0, 0.042, 0.27, 7740.199, 1.5, 25, 0, 0.042, 6.14, 15385.02, -0.7, 6, 0, 0.042, 6.13, 7285.051, -4.1, -41, 0, 0.041, 1.27, 32757.451, 4.2, 78, 0, 0.041, 4.46, 8275.722, 1.5, 25, 0, 0.04, 0.23, 8381.661, 1.5, 25, 0, 0.04, 5.87, -766.864, 2.5, 29, 0, 0.04, 1.66, 254.431, 0, 0, 0, 0.04, 0.4, 9027.981, -0.4, 0, 0, 0.04, 2.96, 7777.936, 1.5, 25, 0, 0.039, 4.67, 33943.068, 6.1, 100, 0, 0.039, 3.52, 8326.062, 1.5, 25, 0, 0.039, 3.75, 21013.887, -6.5, -57, 0, 0.039, 5.6, 606.978, 0, 0, 0, 0.039, 1.19, 8331.321, 1.5, 25, 0, 0.039, 2.84, 7211.433, -2.2, -19, 0, 0.038, 0.67, 7216.693, -2.2, -19, 0, 0.038, 6.22, 25161.867, 0.6, 28, 0, 0.038, 4.4, 7806.322, 1.5, 25, 0, 0.038, 4.16, 9179.168, -2.2, -19, 0, 0.037, 4.73, 14991.999, -0.7, 6, 0, 0.036, 0.35, 67.514, -0.6, -7, 0, 0.036, 3.7, 25266.611, -1.6, 0, 0, 0.036, 5.39, 16328.796, -0.7, 6, 0, 0.035, 1.44, 7174.248, -2.2, -19, 0, 0.035, 5, 15684.73, -4.4, -38, 0, 0.035, 0.39, -15.419, -2.2, -19, 0, 0.035, 6.07, 15020.385, -0.7, 6, 0, 0.034, 6.01, 7371.797, -2.2, -19, 0, 0.034, 0.96, -16623.626, -3.4, -54, 0, 0.033, 6.24, 9479.368, 1.5, 25, 0, 0.033, 3.21, 23661.896, 5.2, 82, 0, 0.033, 4.06, 8311.418, -2.2, -19, 0, 0.033, 2.4, 1965.105, 0, 0, 0, 0.033, 5.17, 15489.785, -0.7, 6, 0, 0.033, 5.03, 21986.54, 0.9, 31, 0, 0.033, 4.1, 16691.14, 2.7, 46, 0, 0.033, 5.13, 47114.589, 1.7, 63, 0, 0.033, 4.45, 8917.184, 1.5, 25, 0, 0.033, 4.23, 2.078, 0, 0, 0, 0.032, 2.33, 75.251, 1.5, 25, 0, 0.032, 2.1, 7253.878, -2.2, -19, 0, 0.032, 3.11, -0.224, 1.5, 25, 0, 0.032, 4.43, 16640.462, -0.7, 6, 0, 0.032, 5.68, 8328.363, 0, 0, 0, 0.031, 5.32, 8329.02, 3, 50, 0, 0.031, 3.7, 16118.093, -0.7, 6, 0, 0.03, 3.67, 16721.817, -0.7, 6, 0, 0.03, 5.27, -1881.492, -1.2, -15, 0, 0.03, 5.72, 8157.839, -2.2, -19, 0, 0.029, 5.73, -18400.313, -6.7, -94, 0, 0.029, 2.76, 16, -2.2, -19, 0, 0.029, 1.75, 8879.447, 1.5, 25, 0, 0.029, 0.32, 8851.061, 1.5, 25, 0, 0.029, 0.9, 14704.903, 3.7, 57, 0, 0.028, 2.9, 15595.723, -0.7, 6, 0, 0.028, 5.88, 16864.631, 0.2, 24, 0, 0.028, 0.63, 16869.234, -2.8, -26, 0, 0.028, 4.04, -18609.863, -2.4, -43, 0, 0.027, 5.83, 6727.736, -5.9, -63, 0, 0.027, 6.12, 418.752, 4.3, 51, 0, 0.027, 0.14, 41157.131, 3.9, 81, 0, 0.026, 3.8, 15.542, 0, 0, 0, 0.026, 1.68, 50181.698, 4.8, 99, -1, 0.026, 0.32, 315.469, 0, 0, 0, 0.025, 5.67, 19.188, 0.3, 0, 0, 0.025, 3.16, 62.133, -2.2, -19, 0, 0.025, 3.76, 15502.939, -0.7, 6, 0, 0.025, 4.53, 45999.961, -2, 19, 0, 0.024, 3.21, 837.851, -4.4, -51, 0, 0.024, 2.82, 38157.596, 0.3, 37, 0, 0.024, 5.21, 15540.124, -0.7, 6, 0, 0.024, 0.26, 14218.576, 0, 13, 0, 0.024, 3.01, 15545.384, -0.7, 6, 0, 0.024, 1.16, -17424.247, -0.6, -21, 0, 0.023, 2.34, -67.574, 0.6, 7, 0, 0.023, 2.44, 18.024, -1.9, -22, 0, 0.023, 3.7, 469.4, 0, 0, 0, 0.023, 0.72, 7136.511, -2.2, -19, 0, 0.023, 4.5, 15582.569, -0.7, 6, 0, 0.023, 2.8, -16586.395, -4.9, -72, 0, 0.023, 1.51, 80.182, 0, 0, 0, 0.023, 1.09, 5261.583, -1.5, -12, 0, 0.023, 0.56, 54956.954, -0.5, 44, 0, 0.023, 4.01, 8550.86, -2.2, -19, 0, 0.023, 4.46, 38995.448, -4.1, -14, 0, 0.023, 3.82, 2358.126, 0, 0, 0, 0.022, 3.77, 32271.125, 0.5, 34, 0, 0.022, 0.82, 15935.775, -0.7, 6, 0, 0.022, 1.07, 24013.421, -2.9, -13, 0, 0.022, 0.4, 8940.078, -2.2, -19, 0, 0.022, 2.06, 15700.489, -0.7, 6, 0, 0.022, 4.27, 15124.002, -5, -45, 0, 0.021, 1.16, 56071.583, 3.2, 88, 0, 0.021, 5.58, 9572.189, -2.2, -19, 0, 0.02, 1.7, -17.273, -3.7, -44, 0, 0.02, 3.05, 214.617, 0, 0, 0, 0.02, 4.41, 8391.048, -2.2, -19, 0, 0.02, 5.95, 23869.145, 2.4, 56, 0, 0.02, 0.42, 40947.927, -4.7, -21, 0, 0.019, 1.39, 5818.897, 0.3, 10, 0, 0.019, 0.71, 23873.747, -0.7, 6, 0, 0.019, 2.81, 7291.615, -2.2, -19, 0, 0.019, 5.09, 8428.018, -2.2, -19, 0, 0.019, 4.14, 6518.187, -1.6, -12, 0, 0.019, 3.85, 21.33, 0, 0, 0, 0.018, 0.66, 14445.046, -0.7, 6, 0, 0.018, 1.65, 0.966, -4, -48, 0, 0.018, 5.64, -17143.709, -6.8, -94, 0, 0.018, 6.01, 7736.432, -2.2, -19, 0, 0.018, 2.74, 31153.083, -1.9, 5, 0, 0.018, 4.58, 6116.355, -2.2, -19, 0, 0.018, 2.28, 46.401, 0.3, 0, 0, 0.018, 3.8, 10213.597, 1.4, 25, 0, 0.018, 2.84, 56281.132, -1.1, 36, 0, 0.018, 3.53, 8249.062, 1.5, 25, 0, 0.017, 4.43, 20871.911, -3, -13, 0, 0.017, 4.44, 627.596, 0, 0, 0, 0.017, 1.85, 628.308, 0, 0, 0, 0.017, 1.19, 8408.321, 2, 25, 0, 0.017, 1.95, 7214.056, -2, -19, 0, 0.017, 1.57, 7214.07, -2, -19, 0, 0.017, 1.65, 13870.811, -6, -60, 0, 0.017, 0.3, 22.542, -4, -44, 0, 0.017, 2.62, -119.445, 0, 0, 0, 0.016, 4.87, 5747.909, 2, 32, 0, 0.016, 4.45, 14339.108, -1, 6, 0, 0.016, 1.83, 41366.68, 0, 30, 0, 0.016, 4.53, 16309.618, -3, -23, 0, 0.016, 2.54, 15542.754, -1, 6, 0, 0.016, 6.05, 1203.646, 0, 0, 0, 0.015, 5.2, 2751.147, 0, 0, 0, 0.015, 1.8, -10699.924, -5, -69, 0, 0.015, 0.4, 22824.391, -3, -20, 0, 0.015, 2.1, 30666.756, -6, -39, 0, 0.015, 2.1, 6010.417, -2, -19, 0, 0.015, 0.7, -23729.47, -5, -75, 0, 0.015, 1.4, 14363.691, -1, 6, 0, 0.015, 5.8, 16900.689, -2, 0, 0, 0.015, 5.2, 23800.458, 3, 53, 0, 0.015, 5.3, 6035, -2, -19, 0, 0.015, 1.2, 8251.139, 2, 25, 0, 0.015, 3.6, -8.86, 0, 0, 0, 0.015, 0.8, 882.739, 0, 0, 0, 0.015, 3, 1021.329, 0, 0, 0, 0.015, 0.6, 23296.107, 1, 31, 0, 0.014, 5.4, 7227.181, 2, 25, 0, 0.014, 0.1, 7213.352, -2, -19, 0, 0.014, 4, 15506.706, 3, 50, 0, 0.014, 3.4, 7214.774, -2, -19, 0, 0.014, 4.6, 6665.385, -2, -19, 0, 0.014, 0.1, -8.636, -2, -22, 0, 0.014, 3.1, 15465.202, -1, 6, 0, 0.014, 4.9, 508.863, 0, 0, 0, 0.014, 3.5, 8406.244, 2, 25, 0, 0.014, 1.3, 13313.497, -8, -82, 0, 0.014, 2.8, 49276.619, -3, 0, 0, 0.014, 0.1, 30528.194, -3, -10, 0, 0.013, 1.7, 25128.05, 1, 31, 0, 0.013, 2.9, 14128.405, -1, 6, 0, 0.013, 3.4, 57395.761, 3, 80, 0, 0.013, 2.7, 13029.546, -1, 6, 0, 0.013, 3.9, 7802.556, -2, -19, 0, 0.013, 1.6, 8258.802, -2, -19, 0, 0.013, 2.2, 8417.709, -2, -19, 0, 0.013, 0.7, 9965.21, -2, -19, 0, 0.013, 3.4, 50391.247, 0, 48, 0, 0.013, 3, 7134.433, -2, -19, 0, 0.013, 2.9, 30599.182, -5, -31, 0, 0.013, 3.6, -9723.857, 1, 0, 0, 0.013, 4.8, 7607.084, -2, -19, 0, 0.012, 0.8, 23837.689, 1, 35, 0, 0.012, 3.6, 4.409, -4, -44, 0, 0.012, 5, 16657.031, 3, 50, 0, 0.012, 4.4, 16657.735, 3, 50, 0, 0.012, 1.1, 15578.803, -4, -38, 0, 0.012, 6, -11.49, 0, 0, 0, 0.012, 1.9, 8164.398, 0, 0, 0, 0.012, 2.4, 31852.372, -4, -17, 0, 0.012, 2.4, 6607.085, -2, -19, 0, 0.012, 4.2, 8359.87, 0, 0, 0, 0.012, 0.5, 5799.713, -2, -19, 0, 0.012, 2.7, 7220.622, 0, 0, 0, 0.012, 4.3, -139.72, 0, 0, 0, 0.012, 2.3, 13728.836, -2, -16, 0, 0.011, 3.6, 14912.146, 1, 31, 0, 0.011, 4.7, 14916.748, -2, -19, 0],
  [1.6768, 4.66926, 628.301955, -0.0266, 0.1, -0.005, 0.51642, 3.3721, 6585.76091, -2.158, -18.9, 0.09, 0.41383, 5.7277, 14914.452335, -0.635, 6.2, -0.04, 0.37115, 3.9695, 7700.389469, 1.55, 25, -0.12, 0.2756, 0.7416, 8956.99338, 1.496, 25.1, -0.13, 0.24599, 4.2253, -2.3012, 1.523, 25.1, -0.12, 0.07118, 0.1443, 7842.36482, -2.211, -19, 0.08, 0.06128, 2.4998, 16171.05625, -0.688, 6, 0, 0.04516, 0.443, 8399.6791, -0.36, 3, 0, 0.04048, 5.771, 14286.15038, -0.61, 6, 0, 0.03747, 4.626, 1256.60391, -0.05, 0, 0, 0.03707, 3.415, 5957.45895, -2.13, -19, 0.1, 0.03649, 1.8, 23243.14376, 0.89, 31, -0.2, 0.02438, 0.042, 16029.08089, 3.07, 50, -0.2, 0.02165, 1.017, -1742.93051, -3.68, -44, 0.2, 0.01923, 3.097, 17285.6848, 3.02, 50, -0.3, 0.01692, 1.28, 0.3286, 1.52, 25, -0.1, 0.01361, 0.298, 8326.3902, 3.05, 50, -0.2, 0.01293, 4.013, 7072.0875, 1.58, 25, -0.1, 0.01276, 4.413, 8330.9926, 0, 0, 0, 0.0127, 0.101, 8470.6668, -2.24, -19, 0.1, 0.01097, 1.203, 22128.5152, -2.82, -13, 0, 0.01088, 2.545, 15542.7543, -0.66, 6, 0, 0.00835, 0.19, 7214.0629, -2.18, -19, 0.1, 0.00734, 4.855, 24499.7477, 0.83, 31, -0.2, 0.00686, 5.13, 13799.8238, -4.34, -38, 0.2, 0.00631, 0.93, -486.3266, -3.73, -44, 0, 0.00585, 0.699, 9585.2953, 1.5, 25, 0, 0.00566, 4.073, 8328.3391, 1.5, 25, 0, 0.00566, 0.638, 8329.0437, 1.5, 25, 0, 0.00539, 2.472, -1952.48, 0.6, 7, 0, 0.00509, 2.88, -0.7113, 0, 0, 0, 0.00469, 3.56, 30457.2066, -1.3, 12, 0, 0.00387, 0.78, -0.3523, 0, 0, 0, 0.00378, 1.84, 22614.8418, 0.9, 31, 0, 0.00362, 5.53, -695.8761, 0.6, 7, 0, 0.00317, 2.8, 16728.3705, 1.2, 28, 0, 0.00303, 6.07, 157.7344, 0, 0, 0, 0.003, 2.53, 33.757, -0.3, -4, 0, 0.00295, 4.16, 31571.8352, 2.4, 56, 0, 0.00289, 5.98, 7211.7617, -0.7, 6, 0, 0.00285, 2.06, 15540.4531, 0.9, 31, 0, 0.00283, 2.65, 2.6298, 0, 0, 0, 0.00282, 6.17, 15545.0555, -2.2, -19, 0, 0.00278, 1.23, -39.8149, 0, 0, 0, 0.00272, 3.82, 7216.3641, -3.7, -44, 0, 0.0027, 4.37, 70.9877, -1.9, -22, 0, 0.00256, 5.81, 13657.8484, -0.6, 6, 0, 0.00244, 5.64, -0.2237, 1.5, 25, 0, 0.0024, 2.96, 8311.7707, -2.2, -19, 0, 0.00239, 0.87, -33.7814, 0.3, 4, 0, 0.00216, 2.31, 15.9995, -2.2, -19, 0, 0.00186, 3.46, 5329.157, -2.1, -19, 0, 0.00169, 2.4, 24357.772, 4.6, 75, 0, 0.00161, 5.8, 8329.403, 1.5, 25, 0, 0.00161, 5.2, 8327.98, 1.5, 25, 0, 0.0016, 4.26, 23385.119, -2.9, -13, 0, 0.00156, 1.26, 550.755, 0, 0, 0, 0.00155, 1.25, 21500.213, -2.8, -13, 0, 0.00152, 0.6, -16.921, -3.7, -44, 0, 0.0015, 2.71, -79.63, 0, 0, 0, 0.0015, 5.29, 15.542, 0, 0, 0, 0.00148, 1.06, -2371.232, -3.7, -44, 0, 0.00141, 0.77, 8328.691, 1.5, 25, 0, 0.00141, 3.67, 7143.075, -0.3, 0, 0, 0.00138, 5.45, 25614.376, 4.5, 75, 0, 0.00129, 4.9, 23871.446, 0.9, 31, 0, 0.00126, 4.03, 141.975, -3.8, -44, 0, 0.00124, 6.01, 522.369, 0, 0, 0, 0.0012, 4.94, -10071.622, -5.2, -69, 0, 0.00118, 5.07, -15.419, -2.2, -19, 0, 0.00107, 3.49, 23452.693, -3.4, -20, 0, 0.00104, 4.78, 17495.234, -1.3, 0, 0, 0.00103, 1.44, -18.049, -2.2, -19, 0, 0.00102, 5.63, 15542.402, -0.7, 6, 0, 0.00102, 2.59, 15543.107, -0.7, 6, 0, 0.001, 4.11, -6.559, -1.9, -22, 0, 0.00097, 0.08, 15400.779, 3.1, 50, 0, 0.00096, 5.84, 31781.385, -1.9, 5, 0, 0.00094, 1.08, 8328.363, 0, 0, 0, 0.00094, 2.46, 16799.358, -0.7, 6, 0, 0.00094, 1.69, 6376.211, 2.2, 32, 0, 0.00093, 3.64, 8329.02, 3, 50, 0, 0.00093, 2.65, 16655.082, 4.6, 75, 0, 0.0009, 1.9, 15056.428, -4.4, -38, 0, 0.00089, 1.59, 52.969, 0, 0, 0, 0.00088, 2.02, -8257.704, -3.4, -47, 0, 0.00088, 3.02, 7213.711, -2.2, -19, 0, 0.00087, 0.5, 7214.415, -2.2, -19, 0, 0.00087, 0.49, 16659.684, 1.5, 25, 0, 0.00082, 5.64, -4.931, 1.5, 25, 0, 0.00079, 5.17, 13171.522, -4.3, -38, 0, 0.00076, 3.6, 29828.905, -1.3, 12, 0, 0.00076, 4.08, 24567.322, 0.3, 24, 0, 0.00076, 4.58, 1884.906, -0.1, 0, 0, 0.00073, 0.33, 31713.811, -1.4, 12, 0, 0.00073, 0.93, 32828.439, 2.4, 56, 0, 0.00071, 5.91, 38785.898, 0.2, 37, 0, 0.00069, 2.2, 15613.742, -2.5, -16, 0, 0.00066, 3.87, 15.732, -2.5, -23, 0, 0.00066, 0.86, 25823.926, 0.2, 24, 0, 0.00065, 2.52, 8170.957, 1.5, 25, 0, 0.00063, 0.18, 8322.132, -0.3, 0, 0, 0.0006, 5.84, 8326.062, 1.5, 25, 0, 0.0006, 5.15, 8331.321, 1.5, 25, 0, 0.0006, 2.18, 8486.426, 1.5, 25, 0, 0.00058, 2.3, -1.731, -4, -44, 0, 0.00058, 5.43, 14357.138, -2, -16, 0, 0.00057, 3.09, 8294.91, 2, 29, 0, 0.00057, 4.67, -8362.473, -1, -21, 0, 0.00056, 4.15, 16833.151, -1, 0, 0, 0.00054, 1.93, 7056.329, -2, -19, 0, 0.00054, 5.27, 8315.574, -2, -19, 0, 0.00052, 5.6, 8311.418, -2, -19, 0, 0.00052, 2.7, -77.552, 0, 0, 0, 0.00051, 4.3, 7230.984, 2, 25, 0, 0.0005, 0.4, -0.508, 0, 0, 0, 0.00049, 5.4, 7211.433, -2, -19, 0, 0.00049, 4.4, 7216.693, -2, -19, 0, 0.00049, 4.3, 16864.631, 0, 24, 0, 0.00049, 2.2, 16869.234, -3, -26, 0, 0.00047, 6.1, 627.596, 0, 0, 0, 0.00047, 5, 12.619, 1, 7, 0, 0.00045, 4.9, -8815.018, -5, -69, 0, 0.00044, 1.6, 62.133, -2, -19, 0, 0.00042, 2.9, -13.118, -4, -44, 0, 0.00042, 4.1, -119.445, 0, 0, 0, 0.00041, 4.3, 22756.817, -3, -13, 0, 0.00041, 3.6, 8288.877, 2, 25, 0, 0.0004, 0.5, 6663.308, -2, -19, 0, 0.0004, 1.1, 8368.506, 2, 25, 0, 0.00039, 4.1, 6443.786, 2, 25, 0, 0.00039, 3.1, 16657.383, 3, 50, 0, 0.00038, 0.1, 16657.031, 3, 50, 0, 0.00038, 3, 16657.735, 3, 50, 0, 0.00038, 4.6, 23942.433, -1, 9, 0, 0.00037, 4.3, 15385.02, -1, 6, 0, 0.00037, 5, 548.678, 0, 0, 0, 0.00036, 1.8, 7213.352, -2, -19, 0, 0.00036, 1.7, 7214.774, -2, -19, 0, 0.00035, 1.1, 7777.936, 2, 25, 0, 0.00035, 1.6, -8.86, 0, 0, 0, 0.00035, 4.4, 23869.145, 2, 56, 0, 0.00035, 2, 6691.693, -2, -19, 0, 0.00034, 1.3, -1185.616, -2, -22, 0, 0.00034, 2.2, 23873.747, -1, 6, 0, 0.00033, 2, -235.287, 0, 0, 0, 0.00033, 3.1, 17913.987, 3, 50, 0, 0.00033, 1, 8351.233, -2, -19, 0],
  [0.00487, 4.6693, 628.30196, -0.027, 0, -0.01, 0.00228, 2.6746, -2.3012, 1.523, 25, -0.12, 0.0015, 3.372, 6585.76091, -2.16, -19, 0.1, 0.0012, 5.728, 14914.45233, -0.64, 6, 0, 0.00108, 3.969, 7700.38947, 1.55, 25, -0.1, 0.0008, 0.742, 8956.99338, 1.5, 25, -0.1, 0.000254, 6.002, 0.3286, 1.52, 25, -0.1, 0.00021, 0.144, 7842.3648, -2.21, -19, 0, 0.00018, 2.5, 16171.0562, -0.7, 6, 0, 0.00013, 0.44, 8399.6791, -0.4, 3, 0, 0.000126, 5.03, 8326.3902, 3, 50, 0, 0.00012, 5.77, 14286.1504, -0.6, 6, 0, 0.000118, 5.96, 8330.9926, 0, 0, 0, 0.00011, 1.8, 23243.1438, 0.9, 31, 0, 0.00011, 3.42, 5957.459, -2.1, -19, 0, 0.00011, 4.63, 1256.6039, -0.1, 0, 0, 0.000099, 4.7, -0.7113, 0, 0, 0, 0.00007, 0.04, 16029.0809, 3.1, 50, 0, 0.00007, 5.14, 8328.3391, 1.5, 25, 0, 0.00007, 5.85, 8329.0437, 1.5, 25, 0, 0.00006, 1.02, -1742.9305, -3.7, -44, 0, 0.00006, 3.1, 17285.6848, 3, 50, 0, 0.000054, 5.69, -0.352, 0, 0, 0, 0.000043, 0.52, 15.542, 0, 0, 0, 0.000041, 2.03, 2.63, 0, 0, 0, 0.00004, 0.1, 8470.667, -2.2, -19, 0, 0.00004, 4.01, 7072.088, 1.6, 25, 0, 0.000036, 2.93, -8.86, -0.3, 0, 0, 0.00003, 1.2, 22128.515, -2.8, -13, 0, 0.00003, 2.54, 15542.754, -0.7, 6, 0, 0.000027, 4.43, 7211.762, -0.7, 6, 0, 0.000026, 0.51, 15540.453, 0.9, 31, 0, 0.000026, 1.44, 15545.055, -2.2, -19, 0, 0.000025, 5.37, 7216.364, -3.7, -44, 0],
  [0.000012, 1.041, -2.3012, 1.52, 25, -0.1, 0.0000017, 0.31, -0.711, 0, 0, 0]
]);
__publicField(_ShouXingUtil, "QI_KB", [
  1640650.479938,
  15.218425,
  1642476.703182,
  15.21874996,
  1683430.515601,
  15.218750011,
  1752157.640664,
  15.218749978,
  1807675.003759,
  15.218620279,
  1883627.765182,
  15.218612292,
  1907369.1281,
  15.218449176,
  1936603.140413,
  15.218425,
  1939145.52418,
  15.218466998,
  1947180.7983,
  15.218524844,
  1964362.041824,
  15.218533526,
  1987372.340971,
  15.218513908,
  1999653.819126,
  15.218530782,
  2007445.469786,
  15.218535181,
  2021324.917146,
  15.218526248,
  2047257.232342,
  15.218519654,
  2070282.898213,
  15.218425,
  2073204.87285,
  15.218515221,
  2080144.500926,
  15.218530782,
  2086703.688963,
  15.218523776,
  2110033.182763,
  15.218425,
  2111190.300888,
  15.218425,
  2113731.271005,
  15.218515671,
  2120670.840263,
  15.218425,
  2123973.309063,
  15.218425,
  2125068.997336,
  15.218477932,
  2136026.312633,
  15.218472436,
  2156099.495538,
  15.218425,
  2159021.324663,
  15.218425,
  2162308.575254,
  15.218461742,
  2178485.706538,
  15.218425,
  2178759.662849,
  15.218445786,
  2185334.0208,
  15.218425,
  2187525.481425,
  15.218425,
  2188621.191481,
  15.218437494,
  2322147.76
]);
__publicField(_ShouXingUtil, "QB", _ShouXingUtil.decode("FrcFs22AFsckF2tsDtFqEtF1posFdFgiFseFtmelpsEfhkF2anmelpFlF1ikrotcnEqEq2FfqmcDsrFor22FgFrcgDscFs22FgEeFtE2sfFs22sCoEsaF2tsD1FpeE2eFsssEciFsFnmelpFcFhkF2tcnEqEpFgkrotcnEqrEtFermcDsrE222FgBmcmr22DaEfnaF222sD1FpeForeF2tssEfiFpEoeFssD1iFstEqFppDgFstcnEqEpFg11FscnEqrAoAF2ClAEsDmDtCtBaDlAFbAEpAAAAAD2FgBiBqoBbnBaBoAAAAAAAEgDqAdBqAFrBaBoACdAAf1AACgAAAeBbCamDgEifAE2AABa1C1BgFdiAAACoCeE1ADiEifDaAEqAAFe1AcFbcAAAAAF1iFaAAACpACmFmAAAAAAAACrDaAAADG0"));
__publicField(_ShouXingUtil, "SHUO_KB", [1457698.231017, 29.53067166, 1546082.512234, 29.53085106, 1640640.7353, 29.5306, 1642472.151543, 29.53085439, 1683430.5093, 29.53086148, 1752148.041079, 29.53085097, 1807665.420323, 29.53059851, 1883618.1141, 29.5306, 1907360.7047, 29.5306, 1936596.2249, 29.5306, 1939135.6753, 29.5306, 1947168]);
__publicField(_ShouXingUtil, "SB", _ShouXingUtil.decode("EqoFscDcrFpmEsF2DfFideFelFpFfFfFiaipqti1ksttikptikqckstekqttgkqttgkqteksttikptikq2fjstgjqttjkqttgkqtekstfkptikq2tijstgjiFkirFsAeACoFsiDaDiADc1AFbBfgdfikijFifegF1FhaikgFag1E2btaieeibggiffdeigFfqDfaiBkF1kEaikhkigeidhhdiegcFfakF1ggkidbiaedksaFffckekidhhdhdikcikiakicjF1deedFhFccgicdekgiFbiaikcfi1kbFibefgEgFdcFkFeFkdcfkF1kfkcickEiFkDacFiEfbiaejcFfffkhkdgkaiei1ehigikhdFikfckF1dhhdikcfgjikhfjicjicgiehdikcikggcifgiejF1jkieFhegikggcikFegiegkfjebhigikggcikdgkaFkijcfkcikfkcifikiggkaeeigefkcdfcfkhkdgkegieidhijcFfakhfgeidieidiegikhfkfckfcjbdehdikggikgkfkicjicjF1dbidikFiggcifgiejkiegkigcdiegfggcikdbgfgefjF1kfegikggcikdgFkeeijcfkcikfkekcikdgkabhkFikaffcfkhkdgkegbiaekfkiakicjhfgqdq2fkiakgkfkhfkfcjiekgFebicggbedF1jikejbbbiakgbgkacgiejkijjgigfiakggfggcibFifjefjF1kfekdgjcibFeFkijcfkfhkfkeaieigekgbhkfikidfcjeaibgekgdkiffiffkiakF1jhbakgdki1dj1ikfkicjicjieeFkgdkicggkighdF1jfgkgfgbdkicggfggkidFkiekgijkeigfiskiggfaidheigF1jekijcikickiggkidhhdbgcfkFikikhkigeidieFikggikhkffaffijhidhhakgdkhkijF1kiakF1kfheakgdkifiggkigicjiejkieedikgdfcggkigieeiejfgkgkigbgikicggkiaideeijkefjeijikhkiggkiaidheigcikaikffikijgkiahi1hhdikgjfifaakekighie1hiaikggikhkffakicjhiahaikggikhkijF1kfejfeFhidikggiffiggkigicjiekgieeigikggiffiggkidheigkgfjkeigiegikifiggkidhedeijcfkFikikhkiggkidhh1ehigcikaffkhkiggkidhh1hhigikekfiFkFikcidhh1hitcikggikhkfkicjicghiediaikggikhkijbjfejfeFhaikggifikiggkigiejkikgkgieeigikggiffiggkigieeigekijcijikggifikiggkideedeijkefkfckikhkiggkidhh1ehijcikaffkhkiggkidhh1hhigikhkikFikfckcidhh1hiaikgjikhfjicjicgiehdikcikggifikigiejfejkieFhegikggifikiggfghigkfjeijkhigikggifikiggkigieeijcijcikfksikifikiggkidehdeijcfdckikhkiggkhghh1ehijikifffffkhsFngErD1pAfBoDd1BlEtFqA2AqoEpDqElAEsEeB2BmADlDkqBtC1FnEpDqnEmFsFsAFnllBbFmDsDiCtDmAB2BmtCgpEplCpAEiBiEoFqFtEqsDcCnFtADnFlEgdkEgmEtEsCtDmADqFtAFrAtEcCqAE1BoFqC1F1DrFtBmFtAC2ACnFaoCgADcADcCcFfoFtDlAFgmFqBq2bpEoAEmkqnEeCtAE1bAEqgDfFfCrgEcBrACfAAABqAAB1AAClEnFeCtCgAADqDoBmtAAACbFiAAADsEtBqAB2FsDqpFqEmFsCeDtFlCeDtoEpClEqAAFrAFoCgFmFsFqEnAEcCqFeCtFtEnAEeFtAAEkFnErAABbFkADnAAeCtFeAfBoAEpFtAABtFqAApDcCGJ"));
var ShouXingUtil = _ShouXingUtil;
var _SolarTerm = class _SolarTerm2 extends LoopTyme {
  constructor(year, indexOrName, cursoryJulianDay) {
    super(_SolarTerm2.NAMES, indexOrName);
    __publicField(this, "cursoryJulianDay");
    if (cursoryJulianDay) {
      this.cursoryJulianDay = cursoryJulianDay;
    } else {
      this.cursoryJulianDay = 0;
      this.initByYear(year, typeof indexOrName === "number" ? indexOrName : this.index);
    }
  }
  initByYear(year, offset) {
    const jd = Math.floor((year - 2000) * 365.2422 + 180);
    let w = Math.floor((jd - 355 + 183) / 365.2422) * 365.2422 + 355;
    if (ShouXingUtil.calcQi(w) > jd) {
      w -= 365.2422;
    }
    this.cursoryJulianDay = ShouXingUtil.calcQi(w + 15.2184 * offset);
  }
  static fromIndex(year, index) {
    return new _SolarTerm2(year, index);
  }
  static fromName(year, name) {
    return new _SolarTerm2(year, name);
  }
  next(n) {
    return new _SolarTerm2(0, this.nextIndex(n), this.cursoryJulianDay + 15.2184 * n);
  }
  isJie() {
    return this.index % 2 === 1;
  }
  isQi() {
    return this.index % 2 === 0;
  }
  getJulianDay() {
    return JulianDay.fromJulianDay(ShouXingUtil.qiAccurate2(this.cursoryJulianDay) + JulianDay.J2000);
  }
  getCursoryJulianDay() {
    return this.cursoryJulianDay;
  }
};
__publicField(_SolarTerm, "NAMES", ["\u51AC\u81F3", "\u5C0F\u5BD2", "\u5927\u5BD2", "\u7ACB\u6625", "\u96E8\u6C34", "\u60CA\u86F0", "\u6625\u5206", "\u6E05\u660E", "\u8C37\u96E8", "\u7ACB\u590F", "\u5C0F\u6EE1", "\u8292\u79CD", "\u590F\u81F3", "\u5C0F\u6691", "\u5927\u6691", "\u7ACB\u79CB", "\u5904\u6691", "\u767D\u9732", "\u79CB\u5206", "\u5BD2\u9732", "\u971C\u964D", "\u7ACB\u51AC", "\u5C0F\u96EA", "\u5927\u96EA"]);
var SolarTerm = _SolarTerm;

class SolarTermDay extends AbstractCultureDay {
  constructor(solarTerm, dayIndex) {
    super(solarTerm, dayIndex);
  }
  getSolarTerm() {
    return this.culture;
  }
}

class SolarYear extends AbstractTyme {
  constructor(year) {
    super();
    __publicField(this, "year");
    if (year < 1 || year > 9999) {
      throw new Error(`illegal solar year: ${year}`);
    }
    this.year = year;
  }
  static fromYear(year) {
    return new SolarYear(year);
  }
  getYear() {
    return this.year;
  }
  getDayCount() {
    if (this.year === 1582) {
      return 355;
    }
    return this.isLeap() ? 366 : 365;
  }
  isLeap() {
    if (this.year < 1600) {
      return this.year % 4 === 0;
    }
    return this.year % 4 === 0 && this.year % 100 !== 0 || this.year % 400 === 0;
  }
  getName() {
    return `${this.year}\u5E74`;
  }
  next(n) {
    return SolarYear.fromYear(this.year + n);
  }
  getMonths() {
    const l = [];
    for (let i = 1;i < 13; i++) {
      l.push(SolarMonth.fromYm(this.year, i));
    }
    return l;
  }
  getSeasons() {
    const l = [];
    for (let i = 0;i < 4; i++) {
      l.push(SolarSeason.fromIndex(this.year, i));
    }
    return l;
  }
  getHalfYears() {
    const l = [];
    for (let i = 0;i < 2; i++) {
      l.push(SolarHalfYear.fromIndex(this.year, i));
    }
    return l;
  }
}
var _SolarHalfYear = class _SolarHalfYear2 extends AbstractTyme {
  constructor(year, index) {
    super();
    __publicField(this, "year");
    __publicField(this, "index");
    if (index < 0 || index > 1) {
      throw new Error(`illegal solar half year index: ${index}`);
    }
    this.year = SolarYear.fromYear(year);
    this.index = index;
  }
  static fromIndex(year, index) {
    return new _SolarHalfYear2(year, index);
  }
  getSolarYear() {
    return this.year;
  }
  getYear() {
    return this.year.getYear();
  }
  getIndex() {
    return this.index;
  }
  getName() {
    return _SolarHalfYear2.NAMES[this.index];
  }
  toString() {
    return this.year.toString() + this.getName();
  }
  next(n) {
    let i = this.index;
    let y = this.getYear();
    if (n != 0) {
      i += n;
      y += ~~(i / 2);
      i %= 2;
      if (i < 0) {
        i += 2;
        y -= 1;
      }
    }
    return _SolarHalfYear2.fromIndex(y, i);
  }
  getMonths() {
    const l = [];
    const y = this.year.getYear();
    for (let i = 1;i < 7; i++) {
      l.push(SolarMonth.fromYm(y, this.index * 6 + i));
    }
    return l;
  }
  getSeasons() {
    const l = [];
    const y = this.year.getYear();
    for (let i = 0;i < 2; i++) {
      l.push(SolarSeason.fromIndex(y, this.index * 2 + i));
    }
    return l;
  }
};
__publicField(_SolarHalfYear, "NAMES", ["\u4E0A\u534A\u5E74", "\u4E0B\u534A\u5E74"]);
var SolarHalfYear = _SolarHalfYear;
var _SolarSeason = class _SolarSeason2 extends AbstractTyme {
  constructor(year, index) {
    super();
    __publicField(this, "year");
    __publicField(this, "index");
    if (index < 0 || index > 3) {
      throw new Error(`illegal solar season index: ${index}`);
    }
    this.year = SolarYear.fromYear(year);
    this.index = index;
  }
  static fromIndex(year, index) {
    return new _SolarSeason2(year, index);
  }
  getSolarYear() {
    return this.year;
  }
  getYear() {
    return this.year.getYear();
  }
  getIndex() {
    return this.index;
  }
  getName() {
    return _SolarSeason2.NAMES[this.index];
  }
  toString() {
    return this.year.toString() + this.getName();
  }
  next(n) {
    let i = this.index;
    let y = this.year.getYear();
    if (n != 0) {
      i += n;
      y += ~~(i / 4);
      i %= 4;
      if (i < 0) {
        i += 4;
        y -= 1;
      }
    }
    return _SolarSeason2.fromIndex(y, i);
  }
  getMonths() {
    const l = [];
    const y = this.year.getYear();
    for (let i = 1;i < 4; i++) {
      l.push(SolarMonth.fromYm(y, this.index * 3 + i));
    }
    return l;
  }
};
__publicField(_SolarSeason, "NAMES", ["\u4E00\u5B63\u5EA6", "\u4E8C\u5B63\u5EA6", "\u4E09\u5B63\u5EA6", "\u56DB\u5B63\u5EA6"]);
var SolarSeason = _SolarSeason;
var _SolarMonth = class _SolarMonth2 extends AbstractTyme {
  constructor(year, month) {
    super();
    __publicField(this, "year");
    __publicField(this, "month");
    if (month < 1 || month > 12) {
      throw new Error(`illegal solar month: ${month}`);
    }
    this.year = SolarYear.fromYear(year);
    this.month = month;
  }
  static fromYm(year, month) {
    return new _SolarMonth2(year, month);
  }
  getSolarYear() {
    return this.year;
  }
  getYear() {
    return this.year.getYear();
  }
  getMonth() {
    return this.month;
  }
  getDayCount() {
    if (this.getYear() === 1582 && this.month === 10) {
      return 21;
    }
    let d = _SolarMonth2.DAYS[this.getIndexInYear()];
    if (this.month === 2 && this.year.isLeap()) {
      d++;
    }
    return d;
  }
  getIndexInYear() {
    return this.month - 1;
  }
  getSeason() {
    return SolarSeason.fromIndex(this.getYear(), ~~(this.getIndexInYear() / 3));
  }
  getWeekCount(start2) {
    return Math.ceil((this.indexOf(SolarDay.fromYmd(this.getYear(), this.month, 1).getWeek().getIndex() - start2, 7) + this.getDayCount()) / 7);
  }
  getName() {
    return _SolarMonth2.NAMES[this.getIndexInYear()];
  }
  toString() {
    return this.year.toString() + this.getName();
  }
  next(n) {
    let m = this.month;
    let y = this.getYear();
    if (n != 0) {
      m += n;
      y += ~~(m / 12);
      m %= 12;
      if (m < 1) {
        m += 12;
        y--;
      }
    }
    return _SolarMonth2.fromYm(y, m);
  }
  getWeeks(start2) {
    const l = [];
    const y = this.getYear();
    for (let i = 0, j = this.getWeekCount(start2);i < j; i++) {
      l.push(SolarWeek.fromYm(y, this.month, i, start2));
    }
    return l;
  }
  getDays() {
    const l = [];
    const y = this.getYear();
    for (let i = 1, j = this.getDayCount();i <= j; i++) {
      l.push(SolarDay.fromYmd(y, this.month, i));
    }
    return l;
  }
};
__publicField(_SolarMonth, "NAMES", ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"]);
__publicField(_SolarMonth, "DAYS", [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
var SolarMonth = _SolarMonth;
var _SolarWeek = class _SolarWeek2 extends AbstractTyme {
  constructor(year, month, index, start2) {
    super();
    __publicField(this, "month");
    __publicField(this, "index");
    __publicField(this, "start");
    if (index < 0 || index > 5) {
      throw new Error(`illegal solar week index: ${index}`);
    }
    if (start2 < 0 || start2 > 6) {
      throw new Error(`illegal solar week start: ${start2}`);
    }
    const m = SolarMonth.fromYm(year, month);
    if (index >= m.getWeekCount(start2)) {
      throw new Error(`illegal solar week index: ${index} in month: ${m.toString()}`);
    }
    this.month = m;
    this.index = index;
    this.start = Week.fromIndex(start2);
  }
  static fromYm(year, month, index, start2) {
    return new _SolarWeek2(year, month, index, start2);
  }
  getSolarMonth() {
    return this.month;
  }
  getYear() {
    return this.month.getYear();
  }
  getMonth() {
    return this.month.getMonth();
  }
  getIndex() {
    return this.index;
  }
  getIndexInYear() {
    let i = 0;
    const firstDay = this.getFirstDay();
    let w = _SolarWeek2.fromYm(this.getYear(), 1, 0, this.start.getIndex());
    while (!w.getFirstDay().equals(firstDay)) {
      w = w.next(1);
      i++;
    }
    return i;
  }
  getStart() {
    return this.start;
  }
  getName() {
    return _SolarWeek2.NAMES[this.index];
  }
  toString() {
    return this.month.toString() + this.getName();
  }
  next(n) {
    const startIndex = this.start.getIndex();
    let d = this.index;
    let m = this.month;
    if (n > 0) {
      d += n;
      let weekCount = m.getWeekCount(startIndex);
      while (d >= weekCount) {
        d -= weekCount;
        m = m.next(1);
        if (!SolarDay.fromYmd(m.getYear(), m.getMonth(), 1).getWeek().equals(this.start)) {
          d += 1;
        }
        weekCount = m.getWeekCount(startIndex);
      }
    } else if (n < 0) {
      d += n;
      while (d < 0) {
        if (!SolarDay.fromYmd(m.getYear(), m.getMonth(), 1).getWeek().equals(this.start)) {
          d -= 1;
        }
        m = m.next(-1);
        d += m.getWeekCount(startIndex);
      }
    }
    return _SolarWeek2.fromYm(m.getYear(), m.getMonth(), d, startIndex);
  }
  getFirstDay() {
    const firstDay = SolarDay.fromYmd(this.getYear(), this.getMonth(), 1);
    return firstDay.next(this.index * 7 - this.indexOf(firstDay.getWeek().getIndex() - this.start.getIndex(), 7));
  }
  getDays() {
    const l = [];
    const d = this.getFirstDay();
    l.push(d);
    for (let i = 1;i < 7; i++) {
      l.push(d.next(i));
    }
    return l;
  }
  equals(o) {
    return o && o.getFirstDay().equals(this.getFirstDay());
  }
};
__publicField(_SolarWeek, "NAMES", ["\u7B2C\u4E00\u5468", "\u7B2C\u4E8C\u5468", "\u7B2C\u4E09\u5468", "\u7B2C\u56DB\u5468", "\u7B2C\u4E94\u5468", "\u7B2C\u516D\u5468"]);
var SolarWeek = _SolarWeek;
var _SolarDay = class _SolarDay2 extends AbstractTyme {
  constructor(year, month, day) {
    super();
    __publicField(this, "month");
    __publicField(this, "day");
    if (day < 1) {
      throw new Error(`illegal solar day: ${year}-${month}-${day}`);
    }
    const m = SolarMonth.fromYm(year, month);
    if (year === 1582 && month === 10) {
      if (day > 4 && day < 15 || day > 31) {
        throw new Error(`illegal solar day: ${year}-${month}-${day}`);
      }
    } else if (day > m.getDayCount()) {
      throw new Error(`illegal solar day: ${year}-${month}-${day}`);
    }
    this.month = m;
    this.day = day;
  }
  static fromYmd(year, month, day) {
    return new _SolarDay2(year, month, day);
  }
  getSolarMonth() {
    return this.month;
  }
  getYear() {
    return this.month.getYear();
  }
  getMonth() {
    return this.month.getMonth();
  }
  getDay() {
    return this.day;
  }
  getWeek() {
    return this.getJulianDay().getWeek();
  }
  getConstellation() {
    let index = 11;
    const y = this.getMonth() * 100 + this.day;
    if (y >= 321 && y <= 419) {
      index = 0;
    } else if (y >= 420 && y <= 520) {
      index = 1;
    } else if (y >= 521 && y <= 621) {
      index = 2;
    } else if (y >= 622 && y <= 722) {
      index = 3;
    } else if (y >= 723 && y <= 822) {
      index = 4;
    } else if (y >= 823 && y <= 922) {
      index = 5;
    } else if (y >= 923 && y <= 1023) {
      index = 6;
    } else if (y >= 1024 && y <= 1122) {
      index = 7;
    } else if (y >= 1123 && y <= 1221) {
      index = 8;
    } else if (y >= 1222 || y <= 119) {
      index = 9;
    } else if (y <= 218) {
      index = 10;
    }
    return Constellation.fromIndex(index);
  }
  getName() {
    return _SolarDay2.NAMES[this.day - 1];
  }
  toString() {
    return this.month.toString() + this.getName();
  }
  next(n) {
    return this.getJulianDay().next(n).getSolarDay();
  }
  isBefore(target) {
    const aYear = this.getYear();
    const bYear = target.getYear();
    if (aYear !== bYear) {
      return aYear < bYear;
    }
    const aMonth = this.getMonth();
    const bMonth = target.getMonth();
    return aMonth !== bMonth ? aMonth < bMonth : this.day < target.getDay();
  }
  isAfter(target) {
    const aYear = this.getYear();
    const bYear = target.getYear();
    if (aYear !== bYear) {
      return aYear > bYear;
    }
    const aMonth = this.getMonth();
    const bMonth = target.getMonth();
    return aMonth !== bMonth ? aMonth > bMonth : this.day > target.getDay();
  }
  getTerm() {
    return this.getTermDay().getSolarTerm();
  }
  getTermDay() {
    let y = this.getYear();
    let i = this.getMonth() * 2;
    if (i == 24) {
      y += 1;
      i = 0;
    }
    let term = SolarTerm.fromIndex(y, i);
    let day = term.getJulianDay().getSolarDay();
    while (this.isBefore(day)) {
      term = term.next(-1);
      day = term.getJulianDay().getSolarDay();
    }
    return new SolarTermDay(term, this.subtract(day));
  }
  getSolarWeek(start2) {
    const y = this.getYear();
    const m = this.getMonth();
    return SolarWeek.fromYm(y, m, Math.ceil((this.day + _SolarDay2.fromYmd(y, m, 1).getWeek().next(-start2).getIndex()) / 7) - 1, start2);
  }
  getPhenologyDay() {
    const term = this.getTerm();
    let dayIndex = this.subtract(term.getJulianDay().getSolarDay());
    let index = ~~(dayIndex / 5);
    if (index > 2) {
      index = 2;
    }
    dayIndex -= index * 5;
    return new PhenologyDay(Phenology.fromIndex(term.getIndex() * 3 + index), dayIndex);
  }
  getDogDay() {
    const xiaZhi = SolarTerm.fromIndex(this.getYear(), 12);
    let start2 = xiaZhi.getJulianDay().getSolarDay();
    let add = 6 - start2.getLunarDay().getSixtyCycle().getHeavenStem().getIndex();
    if (add < 0) {
      add += 10;
    }
    add += 20;
    start2 = start2.next(add);
    let days = this.subtract(start2);
    if (days < 0) {
      return null;
    }
    if (days < 10) {
      return new DogDay(Dog.fromIndex(0), days);
    }
    start2 = start2.next(10);
    days = this.subtract(start2);
    if (days < 10) {
      return new DogDay(Dog.fromIndex(1), days);
    }
    start2 = start2.next(10);
    days = this.subtract(start2);
    if (xiaZhi.next(3).getJulianDay().getSolarDay().isAfter(start2)) {
      if (days < 10) {
        return new DogDay(Dog.fromIndex(1), days + 10);
      }
      start2 = start2.next(10);
      days = this.subtract(start2);
    }
    if (days < 10) {
      return new DogDay(Dog.fromIndex(2), days);
    }
    return null;
  }
  getPlumRainDay() {
    const grainInEar = SolarTerm.fromIndex(this.getYear(), 11);
    let start2 = grainInEar.getJulianDay().getSolarDay();
    let add = 2 - start2.getLunarDay().getSixtyCycle().getHeavenStem().getIndex();
    if (add < 0) {
      add += 10;
    }
    start2 = start2.next(add);
    const slightHeat = grainInEar.next(2);
    let end2 = slightHeat.getJulianDay().getSolarDay();
    add = 7 - end2.getLunarDay().getSixtyCycle().getEarthBranch().getIndex();
    if (add < 0) {
      add += 12;
    }
    end2 = end2.next(add);
    if (this.isBefore(start2) || this.isAfter(end2)) {
      return null;
    }
    return this.equals(end2) ? new PlumRainDay(PlumRain.fromIndex(1), 0) : new PlumRainDay(PlumRain.fromIndex(0), this.subtract(start2));
  }
  getNineDay() {
    const year = this.getYear();
    let start2 = SolarTerm.fromIndex(year + 1, 0).getJulianDay().getSolarDay();
    if (this.isBefore(start2)) {
      start2 = SolarTerm.fromIndex(year, 0).getJulianDay().getSolarDay();
    }
    const end2 = start2.next(81);
    if (this.isBefore(start2) || !this.isBefore(end2)) {
      return null;
    }
    const days = this.subtract(start2);
    return new NineDay(Nine.fromIndex(~~(days / 9)), days % 9);
  }
  getIndexInYear() {
    return this.subtract(_SolarDay2.fromYmd(this.getYear(), 1, 1));
  }
  subtract(target) {
    return ~~this.getJulianDay().subtract(target.getJulianDay());
  }
  getJulianDay() {
    return JulianDay.fromYmdHms(this.getYear(), this.getMonth(), this.day, 0, 0, 0);
  }
  getLunarDay() {
    let m = LunarMonth.fromYm(this.getYear(), this.getMonth());
    let days = this.subtract(m.getFirstJulianDay().getSolarDay());
    while (days < 0) {
      m = m.next(-1);
      days += m.getDayCount();
    }
    return LunarDay.fromYmd(m.getYear(), m.getMonthWithLeap(), days + 1);
  }
  getLegalHoliday() {
    return LegalHoliday.fromYmd(this.getYear(), this.getMonth(), this.day);
  }
  getFestival() {
    return SolarFestival.fromYmd(this.getYear(), this.getMonth(), this.day);
  }
};
__publicField(_SolarDay, "NAMES", ["1\u65E5", "2\u65E5", "3\u65E5", "4\u65E5", "5\u65E5", "6\u65E5", "7\u65E5", "8\u65E5", "9\u65E5", "10\u65E5", "11\u65E5", "12\u65E5", "13\u65E5", "14\u65E5", "15\u65E5", "16\u65E5", "17\u65E5", "18\u65E5", "19\u65E5", "20\u65E5", "21\u65E5", "22\u65E5", "23\u65E5", "24\u65E5", "25\u65E5", "26\u65E5", "27\u65E5", "28\u65E5", "29\u65E5", "30\u65E5", "31\u65E5"]);
var SolarDay = _SolarDay;

class SolarTime extends AbstractTyme {
  constructor(year, month, day, hour, minute, second) {
    super();
    __publicField(this, "day");
    __publicField(this, "hour");
    __publicField(this, "minute");
    __publicField(this, "second");
    if (hour < 0 || hour > 23) {
      throw new Error(`illegal hour: ${hour}`);
    }
    if (minute < 0 || minute > 59) {
      throw new Error(`illegal minute: ${minute}`);
    }
    if (second < 0 || second > 59) {
      throw new Error(`illegal second: ${second}`);
    }
    this.day = SolarDay.fromYmd(year, month, day);
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }
  static fromYmdHms(year, month, day, hour, minute, second) {
    return new SolarTime(year, month, day, hour, minute, second);
  }
  getSolarDay() {
    return this.day;
  }
  getYear() {
    return this.day.getYear();
  }
  getMonth() {
    return this.day.getMonth();
  }
  getDay() {
    return this.day.getDay();
  }
  getHour() {
    return this.hour;
  }
  getMinute() {
    return this.minute;
  }
  getSecond() {
    return this.second;
  }
  getName() {
    const h = (this.hour < 10 ? "0" : "") + this.hour;
    const m = (this.minute < 10 ? "0" : "") + this.minute;
    const s = (this.second < 10 ? "0" : "") + this.second;
    return `${h}:${m}:${s}`;
  }
  toString() {
    return `${this.day.toString()} ${this.getName()}`;
  }
  next(n) {
    if (n == 0) {
      return SolarTime.fromYmdHms(this.getYear(), this.getMonth(), this.getDay(), this.hour, this.minute, this.second);
    }
    let ts = this.second + n;
    let tm = this.minute + ~~(ts / 60);
    ts %= 60;
    if (ts < 0) {
      ts += 60;
      tm -= 1;
    }
    let th = this.hour + ~~(tm / 60);
    tm %= 60;
    if (tm < 0) {
      tm += 60;
      th -= 1;
    }
    let td = ~~(th / 24);
    th %= 24;
    if (th < 0) {
      th += 24;
      td -= 1;
    }
    const d = this.day.next(td);
    return SolarTime.fromYmdHms(d.getYear(), d.getMonth(), d.getDay(), th, tm, ts);
  }
  isBefore(target) {
    if (!this.day.equals(target.getSolarDay())) {
      return this.day.isBefore(target.getSolarDay());
    }
    if (this.hour !== target.getHour()) {
      return this.hour < target.getHour();
    }
    return this.minute !== target.getMinute() ? this.minute < target.getMinute() : this.second < target.getSecond();
  }
  isAfter(target) {
    if (!this.day.equals(target.getSolarDay())) {
      return this.day.isAfter(target.getSolarDay());
    }
    if (this.hour !== target.getHour()) {
      return this.hour > target.getHour();
    }
    return this.minute !== target.getMinute() ? this.minute > target.getMinute() : this.second > target.getSecond();
  }
  getTerm() {
    let y = this.getYear();
    let i = this.getMonth() * 2;
    if (i == 24) {
      y += 1;
      i = 0;
    }
    let term = SolarTerm.fromIndex(y, i);
    while (this.isBefore(term.getJulianDay().getSolarTime())) {
      term = term.next(-1);
    }
    return term;
  }
  getJulianDay() {
    return JulianDay.fromYmdHms(this.day.getYear(), this.day.getMonth(), this.day.getDay(), this.hour, this.minute, this.second);
  }
  subtract(target) {
    let days = this.day.subtract(target.getSolarDay());
    const cs = this.hour * 3600 + this.minute * 60 + this.second;
    const ts = target.getHour() * 3600 + target.getMinute() * 60 + target.getSecond();
    let seconds = cs - ts;
    if (seconds < 0) {
      seconds += 86400;
      days--;
    }
    seconds += days * 86400;
    return seconds;
  }
  getLunarHour() {
    const d = this.day.getLunarDay();
    return LunarHour.fromYmdHms(d.getYear(), d.getMonth(), d.getDay(), this.hour, this.minute, this.second);
  }
}
var _LegalHoliday = class _LegalHoliday2 extends AbstractTyme {
  constructor(year, month, day, data) {
    super();
    __publicField(this, "day");
    __publicField(this, "name");
    __publicField(this, "work");
    this.day = SolarDay.fromYmd(year, month, day);
    this.work = data.charCodeAt(8) === 48;
    this.name = _LegalHoliday2.NAMES[data.charCodeAt(9) - 48];
  }
  static fromYmd(year, month, day) {
    const y = (Array(4).join("0") + year).slice(-4);
    const m = (month < 10 ? "0" : "") + month;
    const d = (day < 10 ? "0" : "") + day;
    const matcher = new RegExp(`${y}${m}${d}[0-1][0-8][+|-]\\d{2}`, "g").exec(_LegalHoliday2.DATA);
    if (!matcher) {
      return null;
    }
    return new _LegalHoliday2(year, month, day, matcher[0]);
  }
  getName() {
    return this.name;
  }
  getDay() {
    return this.day;
  }
  isWork() {
    return this.work;
  }
  toString() {
    return `${this.day.toString()} ${this.name}(${this.work ? "\u73ED" : "\u4F11"})`;
  }
  next(n) {
    const year = this.day.getYear();
    const month = this.day.getMonth();
    const day = this.day.getDay();
    if (n === 0) {
      return _LegalHoliday2.fromYmd(year, month, day);
    }
    let ys = (Array(4).join("0") + year).slice(-4);
    const ms = (month < 10 ? "0" : "") + month;
    const ds = (day < 10 ? "0" : "") + day;
    const data = [];
    const today = `${ys}${ms}${ds}`;
    let reg = new RegExp(`${ys}\\d{4}[0-1][0-8][+|-]\\d{2}`, "g");
    let matcher = reg.exec(_LegalHoliday2.DATA);
    while (matcher) {
      data.push(matcher[0]);
      matcher = reg.exec(_LegalHoliday2.DATA);
    }
    let index = -1;
    let size = data.length;
    for (let i = 0;i < size; i++) {
      if (data[i].indexOf(today) === 0) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      return null;
    }
    index += n;
    let y = year;
    if (n > 0) {
      while (index >= size) {
        index -= size;
        y += 1;
        data.length = 0;
        ys = (Array(4).join("0") + y).slice(-4);
        reg = new RegExp(`${ys}\\d{4}[0-1][0-8][+|-]\\d{2}`, "g");
        matcher = reg.exec(_LegalHoliday2.DATA);
        while (matcher) {
          data.push(matcher[0]);
          matcher = reg.exec(_LegalHoliday2.DATA);
        }
        size = data.length;
        if (size < 1) {
          return null;
        }
      }
    } else {
      while (index < 0) {
        y -= 1;
        data.length = 0;
        ys = (Array(4).join("0") + y).slice(-4);
        reg = new RegExp(`${ys}\\d{4}[0-1][0-8][+|-]\\d{2}`, "g");
        matcher = reg.exec(_LegalHoliday2.DATA);
        while (matcher) {
          data.push(matcher[0]);
          matcher = reg.exec(_LegalHoliday2.DATA);
        }
        size = data.length;
        if (size < 1) {
          return null;
        }
        index += size;
      }
    }
    let d = data[index];
    return new _LegalHoliday2(parseInt(d.substring(0, 4), 10), parseInt(d.substring(4, 6), 10), parseInt(d.substring(6, 8), 10), d);
  }
};
__publicField(_LegalHoliday, "NAMES", ["\u5143\u65E6\u8282", "\u6625\u8282", "\u6E05\u660E\u8282", "\u52B3\u52A8\u8282", "\u7AEF\u5348\u8282", "\u4E2D\u79CB\u8282", "\u56FD\u5E86\u8282", "\u56FD\u5E86\u4E2D\u79CB", "\u6297\u6218\u80DC\u5229\u65E5"]);
__publicField(_LegalHoliday, "DATA", "2001122900+032001123000+022002010110+002002010210-012002010310-022002020901+032002021001+022002021211+002002021311-012002021411-022002021511-032002021611-042002021711-052002021811-062002042703+042002042803+032002050113+002002050213-012002050313-022002050413-032002050513-042002050613-052002050713-062002092806+032002092906+022002100116+002002100216-012002100316-022002100416-032002100516-042002100616-052002100716-062003010110+002003020111+002003020211-012003020311-022003020411-032003020511-042003020611-052003020711-062003020801-072003020901-082003042603+052003042703+042003050113+002003050213-012003050313-022003050413-032003050513-042003050613-052003050713-062003092706+042003092806+032003100116+002003100216-012003100316-022003100416-032003100516-042003100616-052003100716-062004010110+002004011701+052004011801+042004012211+002004012311-012004012411-022004012511-032004012611-042004012711-052004012811-062004050113+002004050213-012004050313-022004050413-032004050513-042004050613-052004050713-062004050803-072004050903-082004100116+002004100216-012004100316-022004100416-032004100516-042004100616-052004100716-062004100906-082004101006-092005010110+002005010210-012005010310-022005020501+042005020601+032005020911+002005021011-012005021111-022005021211-032005021311-042005021411-052005021511-062005043003+012005050113+002005050213-012005050313-022005050413-032005050513-042005050613-052005050713-062005050803-072005100116+002005100216-012005100316-022005100416-032005100516-042005100616-052005100716-062005100806-072005100906-082005123100+012006010110+002006010210-012006010310-022006012801+012006012911+002006013011-012006013111-022006020111-032006020211-042006020311-052006020411-062006020501-072006042903+022006043003+012006050113+002006050213-012006050313-022006050413-032006050513-042006050613-052006050713-062006093006+012006100116+002006100216-012006100316-022006100416-032006100516-042006100616-052006100716-062006100806-072006123000+022006123100+012007010110+002007010210-012007010310-022007021701+012007021811+002007021911-012007022011-022007022111-032007022211-042007022311-052007022411-062007022501-072007042803+032007042903+022007050113+002007050213-012007050313-022007050413-032007050513-042007050613-052007050713-062007092906+022007093006+012007100116+002007100216-012007100316-022007100416-032007100516-042007100616-052007100716-062007122900+032007123010+022007123110+012008010110+002008020201+042008020301+032008020611+002008020711-012008020811-022008020911-032008021011-042008021111-052008021211-062008040412+002008040512-012008040612-022008050113+002008050213-012008050313-022008050403-032008060714+012008060814+002008060914-012008091315+012008091415+002008091515-012008092706+042008092806+032008092916+022008093016+012008100116+002008100216-012008100316-022008100416-032008100516-042009010110+002009010210-012009010310-022009010400-032009012401+012009012511+002009012611-012009012711-022009012811-032009012911-042009013011-052009013111-062009020101-072009040412+002009040512-012009040612-022009050113+002009050213-012009050313-022009052814+002009052914-012009053014-022009053104-032009092706+042009100116+002009100216-012009100316-022009100416-032009100515-022009100615-032009100715-042009100815-052009101005-072010010110+002010010210-012010010310-022010021311+002010021411-012010021511-022010021611-032010021711-042010021811-052010021911-062010022001-072010022101-082010040312+022010040412+012010040512+002010050113+002010050213-012010050313-022010061204+042010061304+032010061414+022010061514+012010061614+002010091905+032010092215+002010092315-012010092415-022010092505-032010092606+052010100116+002010100216-012010100316-022010100416-032010100516-042010100616-052010100716-062010100906-082011010110+002011010210-012011010310-022011013001+042011020211+012011020311+002011020411-012011020511-022011020611-032011020711-042011020811-052011021201-092011040202+032011040312+022011040412+012011040512+002011043013+012011050113+002011050213-012011060414+022011060514+012011060614+002011091015+022011091115+012011091215+002011100116+002011100216-012011100316-022011100416-032011100516-042011100616-052011100716-062011100806-072011100906-082011123100+012012010110+002012010210-012012010310-022012012101+022012012211+012012012311+002012012411-012012012511-022012012611-032012012711-042012012811-052012012901-062012033102+042012040102+032012040212+022012040312+012012040412+002012042803+032012042913+022012043013+012012050113+002012050203-012012062214+012012062314+002012062414-012012092905+012012093015+002012100116+002012100216-012012100316-022012100416-032012100516-042012100616-052012100716-062012100806-072013010110+002013010210-012013010310-022013010500-042013010600-052013020911+012013021011+002013021111-012013021211-022013021311-032013021411-042013021511-052013021601-062013021701-072013040412+002013040512-012013040612-022013042703+042013042803+032013042913+022013043013+012013050113+002013060804+042013060904+032013061014+022013061114+012013061214+002013091915+002013092015-012013092115-022013092205-032013092906+022013100116+002013100216-012013100316-022013100416-032013100516-042013100616-052013100716-062014010110+002014012601+052014013111+002014020111-012014020211-022014020311-032014020411-042014020511-052014020611-062014020801-082014040512+002014040612-012014040712-022014050113+002014050213-012014050313-022014050403-032014053114+022014060114+012014060214+002014090615+022014090715+012014090815+002014092806+032014100116+002014100216-012014100316-022014100416+002014100516-042014100616-052014100716-062014101106-102015010110+002015010210-012015010310-022015010400-032015021501+042015021811+012015021911+002015022011-012015022111-022015022211-032015022311-042015022411-052015022801-092015040412+012015040512+002015040612-012015050113+002015050213-012015050313-022015062014+002015062114-012015062214-022015090318+002015090418-012015090518-022015090608-032015092615+012015092715+002015100116+002015100216-012015100316-022015100416+002015100516-042015100616-052015100716-062015101006-092016010110+002016010210-012016010310-022016020601+022016020711+012016020811+002016020911-012016021011-022016021111-032016021211-042016021311-052016021401-062016040212+022016040312+012016040412+002016043013+012016050113+002016050213-012016060914+002016061014-012016061114-022016061204-032016091515+002016091615-012016091715-022016091805-032016100116+002016100216-012016100316-022016100416-032016100516-042016100616-052016100716-062016100806-072016100906-082016123110+012017010110+002017010210-012017012201+062017012711+012017012811+002017012911-012017013011-022017013111-032017020111-042017020211-052017020401-072017040102+032017040212+022017040312+012017040412+002017042913+022017043013+012017050113+002017052704+032017052814+022017052914+012017053014+002017093006+012017100116+002017100216-012017100316-022017100415+002017100516-042017100616-052017100716-062017100816-072017123010+022017123110+012018010110+002018021101+052018021511+012018021611+002018021711-012018021811-022018021911-032018022011-042018022111-052018022401-082018040512+002018040612-012018040712-022018040802-032018042803+032018042913+022018043013+012018050113+002018061614+022018061714+012018061814+002018092215+022018092315+012018092415+002018092906+022018093006+012018100116+002018100216-012018100316-022018100416-032018100516-042018100616-052018100716-062018122900+032018123010+022018123110+012019010110+002019020201+032019020301+022019020411+012019020511+002019020611-012019020711-022019020811-032019020911-042019021011-052019040512+002019040612-012019040712-022019042803+032019050113+002019050213-012019050313-022019050413-032019050503-042019060714+002019060814-012019060914-022019091315+002019091415-012019091515-022019092906+022019100116+002019100216-012019100316-022019100416-032019100516-042019100616-052019100716-062019101206-112020010110+002020011901+062020012411+012020012511+002020012611-012020012711-022020012811-032020012911-042020013011-052020013111-062020020111-072020020211-082020040412+002020040512-012020040612-022020042603+052020050113+002020050213-012020050313-022020050413-032020050513-042020050903-082020062514+002020062614-012020062714-022020062804-032020092707+042020100117+002020100216-012020100316-022020100416-032020100516-042020100616-052020100716-062020100816-072020101006-092021010110+002021010210-012021010310-022021020701+052021021111+012021021211+002021021311-012021021411-022021021511-032021021611-042021021711-052021022001-082021040312+012021040412+002021040512-012021042503+062021050113+002021050213-012021050313-022021050413-032021050513-042021050803-072021061214+022021061314+012021061414+002021091805+032021091915+022021092015+012021092115+002021092606+052021100116+002021100216-012021100316-022021100416-032021100516-042021100616-052021100716-062021100906-082022010110+002022010210-012022010310-022022012901+032022013001+022022013111+012022020111+002022020211-012022020311-022022020411-032022020511-042022020611-052022040202+032022040312+022022040412+012022040512+002022042403+072022043013+012022050113+002022050213-012022050313-022022050413-032022050703-062022060314+002022060414-012022060514-022022091015+002022091115-012022091215-022022100116+002022100216-012022100316-022022100416-032022100516-042022100616-052022100716-062022100806-072022100906-082022123110+012023010110+002023010210-012023012111+012023012211+002023012311-012023012411-022023012511-032023012611-042023012711-052023012801-062023012901-072023040512+002023042303+082023042913+022023043013+012023050113+002023050213-012023050313-022023050603-052023062214+002023062314-012023062414-022023062504-032023092915+002023093016+012023100116+002023100216-012023100316-022023100416-032023100516-042023100616-052023100706-062023100806-072023123010+022023123110+012024010110+002024020401+062024021011+002024021111-012024021211-022024021311-032024021411-042024021511-052024021611-062024021711-072024021801-082024040412+002024040512-012024040612-022024040702-032024042803+032024050113+002024050213-012024050313-022024050413-032024050513-042024051103-102024060814+022024060914+012024061014+002024091405+032024091515+022024091615+012024091715+002024092906+022024100116+002024100216-012024100316-022024100416-032024100516-042024100616-052024100716-062024101206-11");
var LegalHoliday = _LegalHoliday;
var _SolarFestival = class _SolarFestival2 extends AbstractTyme {
  constructor(type, day, startYear, data) {
    super();
    __publicField(this, "type");
    __publicField(this, "index");
    __publicField(this, "day");
    __publicField(this, "name");
    __publicField(this, "startYear");
    this.type = type;
    this.day = day;
    this.startYear = startYear;
    this.index = parseInt(data.substring(1, 3), 10);
    this.name = _SolarFestival2.NAMES[this.index];
  }
  static fromIndex(year, index) {
    if (index < 0 || index >= _SolarFestival2.NAMES.length) {
      throw new Error(`illegal index: ${index}`);
    }
    const is = (index < 10 ? "0" : "") + index;
    const matcher = new RegExp(`@${is}\\d+`, "g").exec(_SolarFestival2.DATA);
    if (matcher) {
      const data = matcher[0];
      const type = data.charCodeAt(3) - 48;
      if (type === 0) {
        const startYear = parseInt(data.substring(8), 10);
        if (year >= startYear) {
          return new _SolarFestival2(0, SolarDay.fromYmd(year, parseInt(data.substring(4, 6), 10), parseInt(data.substring(6, 8), 10)), startYear, data);
        }
      }
    }
    return null;
  }
  static fromYmd(year, month, day) {
    const m = (month < 10 ? "0" : "") + month;
    const d = (day < 10 ? "0" : "") + day;
    const matcher = new RegExp(`@\\d{2}0${m}${d}\\d+`, "g").exec(_SolarFestival2.DATA);
    if (matcher) {
      const data = matcher[0];
      const startYear = parseInt(data.substring(8), 10);
      if (year >= startYear) {
        return new _SolarFestival2(0, SolarDay.fromYmd(year, month, day), startYear, data);
      }
    }
    return null;
  }
  getName() {
    return this.name;
  }
  getIndex() {
    return this.index;
  }
  getDay() {
    return this.day;
  }
  getType() {
    return this.type;
  }
  getStartYear() {
    return this.startYear;
  }
  toString() {
    return `${this.day.toString()} ${this.name}`;
  }
  next(n) {
    if (n === 0) {
      return _SolarFestival2.fromYmd(this.day.getYear(), this.day.getMonth(), this.day.getDay());
    }
    const size = _SolarFestival2.NAMES.length;
    let t2 = this.index + n;
    const offset = this.indexOf(t2, size);
    if (t2 < 0) {
      t2 -= size;
    }
    return _SolarFestival2.fromIndex(this.day.getYear() + ~~(t2 / size), offset);
  }
};
__publicField(_SolarFestival, "NAMES", ["\u5143\u65E6", "\u4E09\u516B\u5987\u5973\u8282", "\u690D\u6811\u8282", "\u4E94\u4E00\u52B3\u52A8\u8282", "\u4E94\u56DB\u9752\u5E74\u8282", "\u516D\u4E00\u513F\u7AE5\u8282", "\u5EFA\u515A\u8282", "\u516B\u4E00\u5EFA\u519B\u8282", "\u6559\u5E08\u8282", "\u56FD\u5E86\u8282"]);
__publicField(_SolarFestival, "DATA", "@00001011950@01003081950@02003121979@03005011950@04005041950@05006011950@06007011941@07008011933@08009101985@09010011950");
var SolarFestival = _SolarFestival;
var _LunarFestival = class _LunarFestival2 extends AbstractTyme {
  constructor(type, day, solarTerm, data) {
    super();
    __publicField(this, "type");
    __publicField(this, "index");
    __publicField(this, "day");
    __publicField(this, "name");
    __publicField(this, "solarTerm");
    this.type = type;
    this.day = day;
    this.solarTerm = solarTerm;
    this.index = parseInt(data.substring(1, 3), 10);
    this.name = _LunarFestival2.NAMES[this.index];
  }
  static fromIndex(year, index) {
    if (index < 0 || index >= _LunarFestival2.NAMES.length) {
      throw new Error(`illegal index: ${index}`);
    }
    const is = (index < 10 ? "0" : "") + index;
    const matcher = new RegExp(`@${is}\\d+`, "g").exec(_LunarFestival2.DATA);
    if (matcher) {
      const data = matcher[0];
      const type = data.charCodeAt(3) - 48;
      switch (type) {
        case 0:
          return new _LunarFestival2(0, LunarDay.fromYmd(year, parseInt(data.substring(4, 6), 10), parseInt(data.substring(6), 10)), null, data);
        case 1:
          const solarTerm = SolarTerm.fromIndex(year, parseInt(data.substring(4), 10));
          return new _LunarFestival2(1, solarTerm.getJulianDay().getSolarDay().getLunarDay(), solarTerm, data);
        case 2:
          return new _LunarFestival2(2, LunarDay.fromYmd(year + 1, 1, 1).next(-1), null, data);
      }
    }
    return null;
  }
  static fromYmd(year, month, day) {
    const m = (month < 10 ? "0" : "") + month;
    const d = (day < 10 ? "0" : "") + day;
    let matcher = new RegExp(`@\\d{2}0${m}${d}`, "g").exec(_LunarFestival2.DATA);
    if (matcher) {
      return new _LunarFestival2(0, LunarDay.fromYmd(year, month, day), null, matcher[0]);
    }
    const reg = new RegExp(`@\\d{2}1\\d{2}`, "g");
    matcher = reg.exec(_LunarFestival2.DATA);
    while (matcher) {
      const data = matcher[0];
      const solarTerm = SolarTerm.fromIndex(year, parseInt(data.substring(4), 10));
      const lunarDay = solarTerm.getJulianDay().getSolarDay().getLunarDay();
      if (lunarDay.getYear() === year && lunarDay.getMonth() === month && lunarDay.getDay() === day) {
        return new _LunarFestival2(1, lunarDay, solarTerm, data);
      }
      matcher = reg.exec(LegalHoliday.DATA);
    }
    matcher = new RegExp(`@\\d{2}2`, "g").exec(_LunarFestival2.DATA);
    if (matcher) {
      const lunarDay = LunarDay.fromYmd(year, month, day);
      const nextDay = lunarDay.next(1);
      if (nextDay.getMonth() === 1 && nextDay.getDay() === 1) {
        return new _LunarFestival2(2, lunarDay, null, matcher[0]);
      }
    }
    return null;
  }
  getName() {
    return this.name;
  }
  getIndex() {
    return this.index;
  }
  getDay() {
    return this.day;
  }
  getType() {
    return this.type;
  }
  getSolarTerm() {
    return this.solarTerm;
  }
  toString() {
    return `${this.day.toString()} ${this.name}`;
  }
  next(n) {
    if (n === 0) {
      return _LunarFestival2.fromYmd(this.day.getYear(), this.day.getMonth(), this.day.getDay());
    }
    const size = _LunarFestival2.NAMES.length;
    let t2 = this.index + n;
    const offset = this.indexOf(t2, size);
    if (t2 < 0) {
      t2 -= size;
    }
    return _LunarFestival2.fromIndex(this.day.getYear() + ~~(t2 / size), offset);
  }
};
__publicField(_LunarFestival, "NAMES", ["\u6625\u8282", "\u5143\u5BB5\u8282", "\u9F99\u5934\u8282", "\u4E0A\u5DF3\u8282", "\u6E05\u660E\u8282", "\u7AEF\u5348\u8282", "\u4E03\u5915\u8282", "\u4E2D\u5143\u8282", "\u4E2D\u79CB\u8282", "\u91CD\u9633\u8282", "\u51AC\u81F3\u8282", "\u814A\u516B\u8282", "\u9664\u5915"]);
__publicField(_LunarFestival, "DATA", "@0000101@0100115@0200202@0300303@04107@0500505@0600707@0700715@0800815@0900909@10124@1101208@122");
var LunarFestival = _LunarFestival;

class EightChar extends AbstractCulture {
  constructor(year, month, day, hour) {
    super();
    __publicField(this, "year");
    __publicField(this, "month");
    __publicField(this, "day");
    __publicField(this, "hour");
    this.year = year instanceof SixtyCycle ? year : SixtyCycle.fromName(year);
    this.month = month instanceof SixtyCycle ? month : SixtyCycle.fromName(month);
    this.day = day instanceof SixtyCycle ? day : SixtyCycle.fromName(day);
    this.hour = hour instanceof SixtyCycle ? hour : SixtyCycle.fromName(hour);
  }
  getYear() {
    return this.year;
  }
  getMonth() {
    return this.month;
  }
  getDay() {
    return this.day;
  }
  getHour() {
    return this.hour;
  }
  getFetalOrigin() {
    return SixtyCycle.fromName(this.month.getHeavenStem().next(1).getName() + this.month.getEarthBranch().next(3).getName());
  }
  getFetalBreath() {
    return SixtyCycle.fromName(this.day.getHeavenStem().next(5).getName() + EarthBranch.fromIndex(13 - this.day.getEarthBranch().getIndex()).getName());
  }
  getOwnSign() {
    let offset = this.month.getEarthBranch().next(-1).getIndex() + this.hour.getEarthBranch().next(-1).getIndex();
    offset = (offset >= 14 ? 26 : 14) - offset;
    offset -= 1;
    return SixtyCycle.fromName(HeavenStem.fromIndex((this.year.getHeavenStem().getIndex() + 1) * 2 + offset).getName() + EarthBranch.fromIndex(2 + offset).getName());
  }
  getBodySign() {
    let offset = this.month.getEarthBranch().getIndex() + this.hour.getEarthBranch().getIndex();
    offset %= 12;
    offset -= 1;
    return SixtyCycle.fromName(HeavenStem.fromIndex((this.year.getHeavenStem().getIndex() + 1) * 2 + offset).getName() + EarthBranch.fromIndex(2 + offset).getName());
  }
  getDuty() {
    return Duty.fromIndex(this.day.getEarthBranch().getIndex() - this.month.getEarthBranch().getIndex());
  }
  getName() {
    return `${this.year.toString()} ${this.month.toString()} ${this.day.toString()} ${this.hour.toString()}`;
  }
  getSolarTimes(startYear, endYear) {
    const l = [];
    let m = this.month.getEarthBranch().next(-2).getIndex();
    if (!HeavenStem.fromIndex((this.year.getHeavenStem().getIndex() + 1) * 2 + m).equals(this.month.getHeavenStem())) {
      return l;
    }
    let y = this.year.next(-57).getIndex() + 1;
    m *= 2;
    const h = this.hour.getEarthBranch().getIndex() * 2;
    const hours = h == 0 ? [0, 23] : [h];
    const baseYear = startYear - 1;
    if (baseYear > y) {
      y += 60 * ~~Math.ceil((baseYear - y) / 60);
    }
    while (y <= endYear) {
      let term = SolarTerm.fromIndex(y, 3);
      if (m > 0) {
        term = term.next(m);
      }
      let solarTime = term.getJulianDay().getSolarTime();
      if (solarTime.getYear() >= startYear) {
        let solarDay = solarTime.getSolarDay();
        const d = this.day.next(-solarDay.getLunarDay().getSixtyCycle().getIndex()).getIndex();
        if (d > 0) {
          solarDay = solarDay.next(d);
        }
        for (let i = 0, j = hours.length;i < j; i++) {
          let mi = 0;
          let s = 0;
          const hour = hours[i];
          if (d == 0 && hour == solarTime.getHour()) {
            mi = solarTime.getMinute();
            s = solarTime.getSecond();
          }
          const time = SolarTime.fromYmdHms(solarDay.getYear(), solarDay.getMonth(), solarDay.getDay(), hour, mi, s);
          if (time.getLunarHour().getEightChar().equals(this)) {
            l.push(time);
          }
        }
      }
      y += 60;
    }
    return l;
  }
}

class ChildLimitInfo {
  constructor(startTime, endTime, yearCount, monthCount, dayCount, hourCount, minuteCount) {
    __publicField(this, "startTime");
    __publicField(this, "endTime");
    __publicField(this, "yearCount");
    __publicField(this, "monthCount");
    __publicField(this, "dayCount");
    __publicField(this, "hourCount");
    __publicField(this, "minuteCount");
    this.startTime = startTime;
    this.endTime = endTime;
    this.yearCount = yearCount;
    this.monthCount = monthCount;
    this.dayCount = dayCount;
    this.hourCount = hourCount;
    this.minuteCount = minuteCount;
  }
  getStartTime() {
    return this.startTime;
  }
  getEndTime() {
    return this.endTime;
  }
  getYearCount() {
    return this.yearCount;
  }
  getMonthCount() {
    return this.monthCount;
  }
  getDayCount() {
    return this.dayCount;
  }
  getHourCount() {
    return this.hourCount;
  }
  getMinuteCount() {
    return this.minuteCount;
  }
}

class AbstractChildLimitProvider {
  next(birthTime, addYear, addMonth, addDay, addHour, addMinute, addSecond) {
    let d = birthTime.getDay() + addDay;
    let h = birthTime.getHour() + addHour;
    let mi = birthTime.getMinute() + addMinute;
    let s = birthTime.getSecond() + addSecond;
    mi += ~~(s / 60);
    s %= 60;
    h += ~~(mi / 60);
    mi %= 60;
    d += ~~(h / 24);
    h %= 24;
    let sm = SolarMonth.fromYm(birthTime.getYear() + addYear, birthTime.getMonth()).next(addMonth);
    let dc = sm.getDayCount();
    while (d > dc) {
      d -= dc;
      sm = sm.next(1);
      dc = sm.getDayCount();
    }
    return new ChildLimitInfo(birthTime, SolarTime.fromYmdHms(sm.getYear(), sm.getMonth(), d, h, mi, s), addYear, addMonth, addDay, addHour, addMinute);
  }
}

class DefaultChildLimitProvider extends AbstractChildLimitProvider {
  getInfo(birthTime, term) {
    let seconds = Math.abs(term.getJulianDay().getSolarTime().subtract(birthTime));
    const year = ~~(seconds / 259200);
    seconds %= 259200;
    const month = ~~(seconds / 21600);
    seconds %= 21600;
    const day = ~~(seconds / 720);
    seconds %= 720;
    const hour = ~~(seconds / 30);
    seconds %= 30;
    const minute = seconds * 2;
    return this.next(birthTime, year, month, day, hour, minute, 0);
  }
}
var _ChildLimit = class _ChildLimit2 {
  constructor(birthTime, gender) {
    __publicField(this, "eightChar");
    __publicField(this, "gender");
    __publicField(this, "forward");
    __publicField(this, "info");
    this.gender = gender;
    this.eightChar = birthTime.getLunarHour().getEightChar();
    const yang = this.eightChar.getYear().getHeavenStem().getYinYang() == 1;
    const man = gender == 1;
    this.forward = yang && man || !yang && !man;
    let term = birthTime.getTerm();
    if (!term.isJie()) {
      term = term.next(-1);
    }
    if (this.forward) {
      term = term.next(2);
    }
    this.info = _ChildLimit2.provider.getInfo(birthTime, term);
  }
  static fromSolarTime(birthTime, gender) {
    return new _ChildLimit2(birthTime, gender);
  }
  getEightChar() {
    return this.eightChar;
  }
  getGender() {
    return this.gender;
  }
  getYearCount() {
    return this.info.getYearCount();
  }
  getMonthCount() {
    return this.info.getMonthCount();
  }
  getDayCount() {
    return this.info.getDayCount();
  }
  getHourCount() {
    return this.info.getHourCount();
  }
  getMinuteCount() {
    return this.info.getMinuteCount();
  }
  getStartTime() {
    return this.info.getStartTime();
  }
  getEndTime() {
    return this.info.getEndTime();
  }
  isForward() {
    return this.forward;
  }
  getStartDecadeFortune() {
    return DecadeFortune.fromChildLimit(this, 0);
  }
  getStartFortune() {
    return Fortune.fromChildLimit(this, 0);
  }
};
__publicField(_ChildLimit, "provider", new DefaultChildLimitProvider);
class DecadeFortune extends AbstractTyme {
  constructor(childLimit, index) {
    super();
    __publicField(this, "childLimit");
    __publicField(this, "index");
    this.childLimit = childLimit;
    this.index = index;
  }
  static fromChildLimit(childLimit, index) {
    return new DecadeFortune(childLimit, index);
  }
  getStartAge() {
    return this.childLimit.getYearCount() + 1 + this.index * 10;
  }
  getEndAge() {
    return this.getStartAge() + 9;
  }
  getStartLunarYear() {
    return this.childLimit.getEndTime().getLunarHour().getLunarDay().getLunarMonth().getLunarYear().next(this.index * 10);
  }
  getEndLunarYear() {
    return this.getStartLunarYear().next(9);
  }
  getSixtyCycle() {
    return this.childLimit.getEightChar().getMonth().next(this.childLimit.isForward() ? this.index + 1 : -this.index - 1);
  }
  getName() {
    return this.getSixtyCycle().getName();
  }
  next(n) {
    return DecadeFortune.fromChildLimit(this.childLimit, this.index + n);
  }
  getStartFortune() {
    return Fortune.fromChildLimit(this.childLimit, this.index * 10);
  }
}

class Fortune extends AbstractTyme {
  constructor(childLimit, index) {
    super();
    __publicField(this, "childLimit");
    __publicField(this, "index");
    this.childLimit = childLimit;
    this.index = index;
  }
  static fromChildLimit(childLimit, index) {
    return new Fortune(childLimit, index);
  }
  getAge() {
    return this.childLimit.getYearCount() + 1 + this.index;
  }
  getLunarYear() {
    return this.childLimit.getEndTime().getLunarHour().getLunarDay().getLunarMonth().getLunarYear().next(this.index);
  }
  getSixtyCycle() {
    const n = this.getAge();
    return this.childLimit.getEightChar().getHour().next(this.childLimit.isForward() ? n : -n);
  }
  getName() {
    return this.getSixtyCycle().getName();
  }
  next(n) {
    return Fortune.fromChildLimit(this.childLimit, this.index + n);
  }
}

// .config/ags/widgets/PopupWindow.ts
var Padding = (name, {
  css = "",
  hexpand = true,
  vexpand = true
} = {}) => Widget.EventBox({
  hexpand,
  vexpand,
  can_focus: false,
  child: Widget.Box({ css }),
  setup: (w) => w.on("button-press-event", () => App.toggleWindow(name))
});
var PopupRevealer = (name, child, transition = "slide_down") => Widget.Box({ css: "padding: 1px;" }, Widget.Revealer({
  transition,
  child: Widget.Box({
    class_name: "window-content",
    child
  }),
  transitionDuration: options_default.transition.bind(),
  setup: (self) => self.hook(App, (_, wname, visible) => {
    if (wname === name)
      self.reveal_child = visible;
  })
}));
var Layout = (name, child, transition) => ({
  center: () => Widget.CenterBox({}, Padding(name), Widget.CenterBox({ vertical: true }, Padding(name), PopupRevealer(name, child, transition), Padding(name)), Padding(name)),
  top: () => Widget.CenterBox({}, Padding(name), Widget.Box({ vertical: true }, PopupRevealer(name, child, transition), Padding(name)), Padding(name)),
  "top-right": () => Widget.Box({}, Padding(name), Widget.Box({
    hexpand: false,
    vertical: true
  }, PopupRevealer(name, child, transition), Padding(name))),
  "top-center": () => Widget.Box({}, Padding(name), Widget.Box({
    hexpand: false,
    vertical: true
  }, PopupRevealer(name, child, transition), Padding(name)), Padding(name)),
  "top-left": () => Widget.Box({}, Widget.Box({
    hexpand: false,
    vertical: true
  }, PopupRevealer(name, child, transition), Padding(name)), Padding(name)),
  "bottom-left": () => Widget.Box({}, Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name), PopupRevealer(name, child, transition)), Padding(name)),
  "bottom-center": () => Widget.Box({}, Padding(name), Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name), PopupRevealer(name, child, transition)), Padding(name)),
  "bottom-right": () => Widget.Box({}, Padding(name), Widget.Box({
    hexpand: false,
    vertical: true
  }, Padding(name), PopupRevealer(name, child, transition)))
});
var PopupWindow_default = ({
  name,
  child,
  layout = "center",
  transition,
  exclusivity = "ignore",
  ...props
}) => Widget.Window({
  name,
  class_names: [name, "popup-window"],
  setup: (w) => w.keybind("Escape", () => App.closeWindow(name)),
  visible: false,
  keymode: "on-demand",
  exclusivity,
  layer: "top",
  anchor: ["top", "bottom", "right", "left"],
  child: Layout(name, child, transition)[layout](),
  ...props
});

// .config/ags/widgets/calendar/Calendar.ts
var now_date = new Date;
var year = now_date.getFullYear();
var month = now_date.getMonth() + 1;
var cal_head = () => {
  return Widget.Box({
    class_name: "horizontal cal-header",
    children: [
      Widget.EventBox({
        child: Widget.Box({
          children: [
            Widget.Button({
              child: Widget.Label("<")
            }),
            Widget.Label({
              label: year.toString() + "\u5E74"
            }),
            Widget.Button({
              child: Widget.Label(">")
            })
          ]
        })
      }),
      Widget.Box({ hexpand: true }),
      Widget.EventBox({
        child: Widget.Box({
          children: [
            Widget.Button({
              child: Widget.Label("<")
            }),
            Widget.Label({
              label: month.toString() + "\u6708"
            }),
            Widget.Button({
              child: Widget.Label(">")
            })
          ]
        })
      })
    ]
  });
};
var cal_body = () => {
  let solarMonth = SolarMonth.fromYm(year, month);
  return Widget.EventBox({
    child: Widget.Box({
      vertical: true,
      class_name: "cal-body",
      children: [
        Widget.Box({
          setup: (self) => {
            const w = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"];
            self.children = w.map((i) => Widget.Label({
              class_name: "day",
              label: i
            }));
          }
        }),
        Widget.Box({
          vertical: true,
          children: solarMonth.getWeeks(1).map((w) => Widget.Box({
            children: w.getDays().map((d) => Widget.Box({
              vertical: true,
              class_name: "day",
              children: [
                Widget.Label(d.getDay().toString()),
                Widget.Label({
                  css: "font-size: 0.8rem;",
                  label: d.getLunarDay().toString().slice(-2)
                })
              ]
            }))
          }))
        })
      ]
    })
  });
};
var cal_foot = () => {
  return Widget.Box({
    class_name: "cal-foot",
    children: [
      Widget.Label({
        wrap: true,
        label: ""
      })
    ]
  });
};
var todo = () => {
  var l = ["todo list 1", "todo list 2"];
  return Widget.Box({
    vertical: true,
    spacing: 10,
    class_name: "vertical",
    children: l.map((i) => Widget.Label({
      class_name: "todo-item",
      wrap: true,
      label: i
    }))
  });
};
var Calendar_default = () => PopupWindow_default({
  name: "calendar",
  layout: "top-center",
  visible: false,
  child: Widget.Box({
    class_name: "calendar",
    spacing: 12,
    children: [
      todo(),
      Widget.Box({
        vertical: true,
        class_name: "vertical",
        children: [cal_head(), cal_body(), cal_foot()]
      })
    ]
  }),
  margins: [50, 0, 0, 0]
});

// .config/ags/widgets/overview/Window.ts
import Gdk3 from "gi://Gdk";
import Gtk from "gi://Gtk?version=3.0";
var monochrome = options_default.overview.monochromeIcon;
var TARGET = [Gtk.TargetEntry.new("text/plain", Gtk.TargetFlags.SAME_APP, 0)];
var hyprland3 = await Service.import("hyprland");
var apps = await Service.import("applications");
var dispatch2 = (args) => hyprland3.messageAsync(`dispatch ${args}`);
var Window_default = ({ address, size: [w, h], class: c, title }) => Widget.Button({
  class_name: "client",
  attribute: { address },
  tooltip_text: `${title}`,
  child: Widget.Icon({
    css: options_default.overview.scale.bind().as((v) => `
            min-width: ${v / 100 * w * 1.4}px;
            min-height: ${v / 100 * h * 1.4}px;
        `),
    size: 32,
    icon: monochrome.bind().as((m) => {
      const app = apps.list.find((app2) => app2.match(c));
      if (!app)
        return icons_default.fallback.executable + (m ? "" : "");
      return icon(app.icon_name, icons_default.fallback.executable);
    })
  }),
  on_secondary_click: () => dispatch2(`closewindow address:${address}`),
  on_clicked: () => {
    dispatch2(`focuswindow address:${address}`);
    App.closeWindow("overview");
  },
  setup: (btn) => btn.on("drag-data-get", (_w, _c, data) => data.set_text(address, address.length)).on("drag-begin", (_, context) => {
    Gtk.drag_set_icon_surface(context, createSurfaceFromWidget(btn));
    btn.toggleClassName("hidden", true);
  }).on("drag-end", () => btn.toggleClassName("hidden", false)).drag_source_set(Gdk3.ModifierType.BUTTON1_MASK, TARGET, Gdk3.DragAction.COPY)
});

// .config/ags/widgets/overview/Workspace.ts
import Gdk4 from "gi://Gdk";
import Gtk2 from "gi://Gtk?version=3.0";
var TARGET2 = [Gtk2.TargetEntry.new("text/plain", Gtk2.TargetFlags.SAME_APP, 0)];
var scale = (size) => options_default.overview.scale.value / 100 * size * 1.4;
var hyprland4 = await Service.import("hyprland");
var dispatch3 = (args) => hyprland4.messageAsync(`dispatch ${args}`);
var size = (id) => {
  const def = { h: 1680, w: 2520 };
  const ws = hyprland4.getWorkspace(id);
  if (!ws)
    return def;
  const mon = hyprland4.getMonitor(ws.monitorID);
  return def;
};
var Workspace_default = (id) => {
  const fixed = Widget.Fixed();
  async function update() {
    const json = await hyprland4.messageAsync("j/clients").catch(() => null);
    if (!json)
      return;
    fixed.get_children().forEach((ch) => ch.destroy());
    const clients = JSON.parse(json);
    clients.filter(({ workspace }) => workspace.id === id).forEach((c) => {
      const x = c.at[0] - (hyprland4.getMonitor(c.monitor)?.x || 0);
      const y = c.at[1] - (hyprland4.getMonitor(c.monitor)?.y || 0);
      c.mapped && fixed.put(Window_default(c), scale(x), scale(y));
    });
    fixed.show_all();
  }
  return Widget.Box({
    attribute: { id },
    tooltipText: `${id}`,
    class_name: "workspace",
    vpack: "center",
    css: options_default.overview.scale.bind().as((v) => `
            min-width: ${v / 100 * size(id).w}px;
            min-height: ${v / 100 * size(id).h}px;
        `),
    setup(box) {
      box.hook(options_default.overview.scale, update);
      box.hook(hyprland4, update, "notify::clients");
      box.hook(hyprland4.active.client, update);
      box.hook(hyprland4.active.workspace, () => {
        box.toggleClassName("active", hyprland4.active.workspace.id === id);
      });
    },
    child: Widget.EventBox({
      expand: true,
      on_primary_click: () => {
        App.closeWindow("overview");
        dispatch3(`workspace ${id}`);
      },
      setup: (eventbox) => {
        eventbox.drag_dest_set(Gtk2.DestDefaults.ALL, TARGET2, Gdk4.DragAction.COPY);
        eventbox.connect("drag-data-received", (_w, _c, _x, _y, data) => {
          const address = new TextDecoder().decode(data.get_data());
          dispatch3(`movetoworkspacesilent ${id},address:${address}`);
        });
      },
      child: fixed
    })
  });
};

// .config/ags/widgets/overview/Overview.ts
var hyprland5 = await Service.import("hyprland");
var Overview = (ws) => Widget.Box({
  class_name: "overview horizontal",
  children: ws > 0 ? range(ws).map(Workspace_default) : hyprland5.workspaces.map(({ id }) => Workspace_default(id)).sort((a, b) => a.attribute.id - b.attribute.id),
  setup: (w) => {
    if (ws > 0)
      return;
    w.hook(hyprland5, (w2, id) => {
      if (id === undefined)
        return;
      w2.children = w2.children.filter((ch) => ch.attribute.id !== Number(id));
    }, "workspace-removed");
    w.hook(hyprland5, (w2, id) => {
      if (id === undefined)
        return;
      w2.children = [...w2.children, Workspace_default(Number(id))].sort((a, b) => a.attribute.id - b.attribute.id);
    }, "workspace-added");
  }
});
var Overview_default = () => PopupWindow_default({
  name: "overview",
  layout: "center",
  child: options_default.overview.workspaces.bind().as(Overview)
});

// .config/ags/main.ts
App.config({
  onConfigParsed: () => {
    init5();
  },
  closeWindowDelay: {
    launcher: options_default.transition.value,
    overview: options_default.transition.value,
    quicksettings: options_default.transition.value,
    datemenu: options_default.transition.value
  },
  windows: () => [
    Bar_default(),
    Calendar_default(),
    Overview_default()
  ]
});
