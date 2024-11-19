import { clock } from "libs/variables"
import PanelButton from "../PanelButton.ts"
import options from "options"

const { format, action } = options.bar.clock

export default () => PanelButton({
    child: Widget.Label({
	justification: "center",
	label: Utils.derive([clock, format], (c, f) => c.format(f) || "").bind()
    }),
    on_clicked: () => App.toggleWindow("calendar")
})
