import Hyprland from "gi://AstalHyprland";
import Apps from "gi://AstalApps";
import { bind, Variable } from "astal";
import { Widget, App, Astal, Gtk, Gdk } from "astal/gtk3";
import { subprocess, exec, execAsync } from "astal/process";

const TARGET = [Gtk.TargetEntry.new("text/plain", Gtk.TargetFlags.SAME_APP, 0)];
const hypr = Hyprland.get_default();
const apps = new Apps.Apps();

function Window(c: Hyprland.Client) {
  const app = apps.fuzzy_query(c.class)[0];
  return (
    <button
      className={"client"}
      tooltipText={`${c.title}`}
      onClicked={() => {
        // hypr.message_async(`dispatch focuswindow address:${c.address}`);
        exec(`hyprctl dispatch focuswindow address:${c.address}`);
        App.toggle_window("overview");
      }}
      setup={(btn) =>
        btn.drag_source_set(
          Gdk.ModifierType.BUTTON1_MASK,
          TARGET,
          Gdk.DragAction.COPY
        )
      }
    >
      <icon
        css={`
          min-width: ${c.width * 1.4 * 0.09}px;
          min-height: ${c.height * 1.4 * 0.09}px;
        `}
        icon={app?.icon_name}
      ></icon>
    </button>
  );
}

function Workspace(id: number) {
  return (
    <box
      tooltipText={`${id}`}
      className={"workspace"}
      css={`
        min-width: ${2520 * 0.09}px;
        min-height: ${1680 * 0.09}px;
      `}
    >
      <eventbox
        onClickRelease={() => {
          exec(`hyprctl dispatch workspace ${id}`);
          // hypr.message_async(`dispatch workspace ${id}`);
        }}
        setup={(eb) => {
          eb.drag_dest_set(Gtk.DestDefaults.ALL, TARGET, Gdk.DragAction.COPY);
          eb.connect("drag-data-received", (_w, _c, _x, _y, data) => {
            const address = new TextDecoder().decode(data.get_data());
            exec(
              `hyprctl dispatch movetoworkspacesilent ${id},address:${address}`
            );
          });
        }}
        expand
      >
        <box spacing={8}>
          {bind(hypr.get_workspace(id), "clients").as((c) => c.map(Window))}
        </box>
      </eventbox>
    </box>
  );
}

export default function Overview() {
  return (
    <window
      name={"overview"}
      visible={false}
      className="overview"
      application={App}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      keymode={Astal.Keymode.ON_DEMAND}
    >
      <centerbox spacing={10}>
        <box expand></box>
        <centerbox vertical>
          <box expand></box>
          <box
            spacing={12}
            setup={(w) => {
              w.hook(hypr, "workspace-removed", (w, id?: String) => {
                if (id === undefined) return;
              });
              w.hook(hypr, "workspace-added", (w, id?: String) => {
                if (id === undefined) return;
              });
            }}
          >
            {bind(hypr, "workspaces").as((wss) =>
              wss.sort((a, b) => a.id - b.id).map((ws) => Workspace(ws.id))
            )}
          </box>
          <box expand></box>
        </centerbox>
        <box expand></box>
      </centerbox>
    </window>
  );
}
