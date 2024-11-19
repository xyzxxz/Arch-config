import "libs/session"
import "styles/style"
import init from "libs/init"
import options from "options"
import { forMonitors } from "libs/utils"
import Bar from "widgets/bar/Bar"
import Calendar from "widgets/calendar/Calendar"
import Overview from "widgets/overview/Overview"

App.config({
    onConfigParsed: () => {
        //setupQuickSettings()
        //setupDateMenu()
        init()
    },
    closeWindowDelay: {
        "launcher": options.transition.value,
        "overview": options.transition.value,
        "quicksettings": options.transition.value,
        "datemenu": options.transition.value,
    },
    windows: () => [
        Bar(),
        //...forMonitors(NotificationPopups),
        //...forMonitors(ScreenCorners),
        //...forMonitors(OSD),
        //Launcher(),
	Calendar(),
        Overview(),
        //PowerMenu(),
        //SettingsDialog(),
        //Verification(),
    ],
})
