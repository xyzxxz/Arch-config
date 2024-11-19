import PanelButton from "../PanelButton";
import brightness from "services/brightness";
import icons from "libs/icons"

const audio = await Service.import("audio");
const network = await Service.import("network");

const BluetoothIndicator = () =>
  PanelButton({
    child: Widget.Box({
      children: [
	  Widget.Icon({
	      icon: icons.bluetooth.activated
	  }),
	  Widget.Label({})
      ],
    }),
  });

const AudioIndicator = () =>
  Widget.Box({
    children: [
      Widget.Icon().hook(audio.speaker, self => {
	  const vol = audio.speaker.is_muted ? 0 : audio.speaker.volume
	  const { mute, low, medium, high } = icons.audio.volume
	  const cons = [[60, high], [30,medium], [1, low], [0, mute]] as const
	  self.icon = cons.find(([n]) => n <= vol * 100)?.[1] || ""
      }),
      Widget.Label({
        label: Math.floor(audio.speaker.volume*100).toString() + "%",
      }),
    ],
  });

const NetworkIndicator = () =>
  PanelButton({
    child: Widget.Box({
      children: [
        Widget.Icon().hook(network, self => {
	    const icon = network[network.primary || "wifi"]?.icon_name
	    self.icon = icon || ""
	}),
        Widget.Label({
          label: network.wifi.ssid,
        }),
      ],
    }),
  });

const BrightnessIndicator = () =>
  Widget.Box({
    children: [
      Widget.Icon(),
      Widget.Label({
        label: brightness.bind("screen-value").as((v) => `${v}%`),
      }),
    ],
  });

export default () =>
  Widget.Box({
    children: [AudioIndicator(), NetworkIndicator(), BrightnessIndicator()],
  });
