import { format } from 'util'
import { spawn}   from 'child_process'

export default class Browser {
  private readonly preferredBrowser: string;
  private readonly process;

  constructor(process, preferredBrowser: string) {
    this.process = process;
    this.preferredBrowser = preferredBrowser;
  }

  /**
   * Opens a URL in the configured browser
   */
  public open(url: string) {
    const browser = this.preferredBrowser || this.getDefaultBrowser();
    if (!browser) {
      throw new Error('Could not detect browser; please configure "browser" option');
    }

    spawn(browser, [url]);
  }

  /**
   * Attempts to guess the browser command
   */
  private getDefaultBrowser(): string | null {
    if (this.process.platform === 'darwin') return 'open';
    if (this.process.platform === 'linux')  return 'xdg-open';
    return null;
  }
}
