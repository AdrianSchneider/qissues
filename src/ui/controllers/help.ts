import { Widgets } from 'blessed';

export default class HelpController {
  private args: string[];
  private helpProgram: string;
  private screen: Widgets.Screen;

  constructor(helpProgram: string, helpProgramArgs: string[], contentFile: string, screen: Widgets.Screen) {
    this.args = helpProgramArgs.concat([contentFile]);
    this.screen = screen;
    this.helpProgram = helpProgram;
  }

  public help(): void {
    this.screen.exec(this.helpProgram, this.args, {}, () => {});
    this.screen.render();
  }
}
