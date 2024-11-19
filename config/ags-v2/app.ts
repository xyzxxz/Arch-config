import { App } from "astal/gtk3";
import style from "./style.scss";

import Bar from "./widget/Bar";
import Overview from "./widget/Overview";

App.start({
  css: style,
  main() {
    // App.get_monitors().map(Bar)
    Overview();
  },
});
