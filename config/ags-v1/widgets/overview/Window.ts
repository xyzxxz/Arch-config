import { type Client } from "types/service/hyprland"
import { createSurfaceFromWidget, icon } from "libs/utils"
import Gdk from "gi://Gdk"
import Gtk from "gi://Gtk?version=3.0"
import options from "options"
import icons from "libs/icons"

const monochrome = options.overview.monochromeIcon
const TARGET = [Gtk.TargetEntry.new("text/plain", Gtk.TargetFlags.SAME_APP, 0)]
const hyprland = await Service.import("hyprland")
const apps = await Service.import("applications")
const dispatch = (args: string) => hyprland.messageAsync(`dispatch ${args}`)

export default ({ address, size: [w, h], class: c, title }: Client) => Widget.Button({
    class_name: "client",
    attribute: { address },
    tooltip_text: `${title}`,
    child: Widget.Icon({
        css: options.overview.scale.bind().as(v => `
            min-width: ${(v / 100) * w * 1.4}px;
            min-height: ${(v / 100) * h * 1.4}px;
        `),
	size: 32,
        icon: monochrome.bind().as(m => {
            const app = apps.list.find(app => app.match(c))
            if (!app)
                return icons.fallback.executable + (m ? "" : "")


            return icon(
                app.icon_name ,
                icons.fallback.executable ,
            )
        }),
    }),
    on_secondary_click: () => dispatch(`closewindow address:${address}`),
    on_clicked: () => {
        dispatch(`focuswindow address:${address}`)
        App.closeWindow("overview")
    },
    setup: btn => btn
        .on("drag-data-get", (_w, _c, data) => data.set_text(address, address.length))
        .on("drag-begin", (_, context) => {
            Gtk.drag_set_icon_surface(context, createSurfaceFromWidget(btn))
            btn.toggleClassName("hidden", true)
        })
        .on("drag-end", () => btn.toggleClassName("hidden", false))
        .drag_source_set(Gdk.ModifierType.BUTTON1_MASK, TARGET, Gdk.DragAction.COPY),
})
