const battery = await Service.import("battery")
import icons from "libs/icons"

export default () => Widget.Box({
    children: [
	Widget.Icon().hook(battery, self => {
	    self.icon = icons.battery.percent[Math.floor(battery.percent/10)]
	}),
	Widget.Label({
	    label: battery.bind("percent").as(v => `${v}%`)
	})
    ]
})
