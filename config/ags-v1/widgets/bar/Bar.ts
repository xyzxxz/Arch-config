import BatteryBar from "./buttons/BatteryBar"
import Clock from "./buttons/Clock"
import ColorPicker from "./buttons/ColorPicker"
import SysTray from "./buttons/SysTray"
import SystemIndicators from "./buttons/SystemIndicators"
import Workspaces from "./buttons/Workspaces"
import options from "options"

const { start, center, end } = options.bar.layout
const { transparent, position } = options.bar

export type BarWidget = keyof typeof widget

const widget = {
    battery: BatteryBar,
    clock: Clock,
    colorpicker: ColorPicker,
    systray: SysTray,
    system: SystemIndicators,
    workspaces: Workspaces,
    expander: () => Widget.Box({ expand: true })
}

export default () => Widget.Window({
    class_name: "bar",
    name: "bar",
    exclusivity: "exclusive",
    anchor: position.bind().as(pos => [pos, "right", "left"]),
    child: Widget.CenterBox({
        css: "min-width: 2px; min-height: 2px;",
        startWidget: Widget.Box({
            hexpand: true,
            children: start.bind().as(s => s.map(w => widget[w]())),
        }),
        centerWidget: Widget.Box({
            hpack: "center",
            children: center.bind().as(c => c.map(w => widget[w]())),
        }),
        endWidget: Widget.Box({
            hexpand: true,
            children: end.bind().as(e => e.map(w => widget[w]())),
        }),
    }),
    setup: self => self.hook(transparent, () => {
        self.toggleClassName("transparent", transparent.value)
    }),
})
