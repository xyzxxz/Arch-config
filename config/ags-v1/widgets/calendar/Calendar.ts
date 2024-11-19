import { SolarYear, SolarMonth, SolarUtil, LunarYear } from "tyme4ts";
import PopupWindow from "widgets/PopupWindow";

const now_date = new Date();
let year = now_date.getFullYear();
let month = now_date.getMonth() + 1;

const cal_head = () => {
  return Widget.Box({
    class_name: "horizontal cal-header",
    children: [
      Widget.EventBox({
        child: Widget.Box({
          children: [
            Widget.Button({
              child: Widget.Label("<"),
            }),
            Widget.Label({
              label: year.toString() + "年",
            }),
            Widget.Button({
              child: Widget.Label(">"),
            }),
          ],
        }),
      }),
      Widget.Box({ hexpand: true }),
      Widget.EventBox({
        child: Widget.Box({
          children: [
            Widget.Button({
              child: Widget.Label("<"),
            }),
            Widget.Label({
              label: month.toString() + "月",
            }),
            Widget.Button({
              child: Widget.Label(">"),
            }),
          ],
        }),
      }),
    ],
  });
};

const cal_body = () => {
  let solarMonth = SolarMonth.fromYm(year, month);
  return Widget.EventBox({
    child: Widget.Box({
      vertical: true,
      class_name: "cal-body",
      children: [
        Widget.Box({
          setup: (self) => {
            const w = ["一", "二", "三", "四", "五", "六", "日"];
            self.children = w.map((i) =>
              Widget.Label({
                class_name: "day",
                label: i,
              }),
            );
          },
        }),
        Widget.Box({
          vertical: true,
          children: solarMonth.getWeeks(1).map((w) =>
            Widget.Box({
              children: w.getDays().map((d) =>
                Widget.Box({
                  vertical: true,
                  class_name: "day",
                  children: [
                    Widget.Label(d.getDay().toString()),
                    Widget.Label({
                      css: "font-size: 0.8rem;",
                      label: d.getLunarDay().toString().slice(-2),
                    }),
                  ],
                }),
              ),
            }),
          ),
        }),
      ],
    }),
  });
};

const cal_foot = () => {
  return Widget.Box({
    class_name: "cal-foot",
    children: [
      Widget.Label({
        wrap: true,
        label: "",
      }),
    ],
  });
};

const todo = () => {
  var l = ["todo list 1", "todo list 2"];
  return Widget.Box({
    vertical: true,
    spacing: 10,
    class_name: "vertical",
    children: l.map((i) =>
      Widget.Label({
        class_name: "todo-item",
        wrap: true,
        label: i,
      }),
    ),
  });
};

export default () =>
  PopupWindow({
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
          children: [cal_head(), cal_body(), cal_foot()],
        }),
      ],
    }),
      margins: [50, 0,0,0]
  });
