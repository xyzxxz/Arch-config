import PanelButton from "../PanelButton.ts"
import options from "options"
import Gdk from "gi://Gdk"
const systemtray = await Service.import("systemtray")
const { ignore } = options.bar.systray

const SysTrayItem = (item) => PanelButton({
    child: Widget.Icon({ icon: item.bind("icon") }),
    on_primary_click: (_, event) => item.activate(event),
    on_secondary_click: (btn, event) => item.menu.popup_at_widget(btn, Gdk.Gravity.SOUTH_EAST, Gdk.Gravity.NORTH, null)
})

export default () => Widget.Box({
    setup: self => self.hook(systemtray, self => {
	self.children = systemtray.items.filter(({id}) => !ignore.value.includes(id)).map(SysTrayItem)
    })
})
