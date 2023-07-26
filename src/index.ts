import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { IStatusBar } from '@jupyterlab/statusbar';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const PLUGIN_ID = 'nersc-refresh-announcements:plugin';

class AnnouncementWidget extends Widget {
  public constructor(options = { node: document.createElement('div') }) {
    super(options);
    this._announcement = '';
    this._alertIcon = '⚠️';
    this._announceIcon = '📢';
    this._label = 'Announcement';

    this.node.classList.add(
      'jp-nersc-refresh-announcements-open-announcements'
    );
    this.node.textContent = this._announceIcon + ' ' + this._label;

    this.node.onclick = () => {
      this.openAnnouncement();
    };
  }

  // creates and open the modal with the announcement in it
  async openAnnouncement() {
    // create the inner body of the announcement popup
    const body = document.createElement('p');
    body.innerHTML = this._announcement;
    body.classList.add('jp-nersc-refresh-announcements-announcement');
    const widget = new Widget();
    widget.node.appendChild(body);

    // show the modal popup with the announcement
    void showDialog({
      title: 'Announcement',
      body: widget,
      buttons: [Dialog.okButton({ label: 'Close' })]
    });
  }

  get announcement() {
    return this._announcement;
  }

  set announcement(s: string) {
    if (!s || s.length === 0) {
      this._announcement = 'Currently no announcement.';
      this.node.textContent = this._announceIcon + ' ' + this._label;
    } else {
      this._announcement = s;
      this.node.textContent =
        this._alertIcon + ' ' + this._announceIcon + ' ' + this._label;
    }
  }

  private _announcement: string;
  private _label: string;
  private _alertIcon: string;
  private _announceIcon: string;
}

// Class that handles all the announcements refresh information and methods
class RefreshAnnouncements {
  // tracks the button to show announcements
  private _openAnnouncementWidget: AnnouncementWidget;

  // this tracks the current stored announcement
  announcement: { user: string; announcement: string; timestamp: string };
  // this is the status bar at the bottom of the screen
  statusbar: IStatusBar;

  // takes the statusbar that we will add to as only parameter
  public constructor(statusbar: IStatusBar) {
    this._openAnnouncementWidget = new AnnouncementWidget();
    this.announcement = { user: '', announcement: '', timestamp: '' };
    this.statusbar = statusbar;

    try {
      // places the widget on the status bar
      this.statusbar.registerStatusItem(PLUGIN_ID, {
        item: this._openAnnouncementWidget,
        align: 'left',
        rank: 0
      });
    } catch (e) {
      console.error(e);
    }
  }

  // fetches the announcements data every n microseconds from the given url
  // creates and destroys the announcement button based on result of fetch
  async fetchAnnouncement(url: string, n: number) {
    // get data from the API
    let data = { user: '', announcement: '', timestamp: '' };
    try {
      const response = await fetch(url);
      data = await response.json();
      this.announcement = data;

      if (data.announcement.length !== 0) {
        this._openAnnouncementWidget.announcement =
          data.timestamp + ' - ' + data.announcement;
      } else {
        this._openAnnouncementWidget.announcement = '';
      }
    } catch (e) {
      // there was an error with fetching
      console.log(e);
    } finally {
      // wait n microseconds and check again
      setTimeout(() => {
        this.fetchAnnouncement(url, n);
      }, n);
    }
  }
}

/**
 * Initialization data for the nersc-refresh-announcements extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IStatusBar, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    statusBar: IStatusBar | null,
    settingRegistry: ISettingRegistry
  ) => {
    console.log(
      'JupyterLab extension nersc-refresh-announcements is activated!'
    );

    const settings = await settingRegistry.load(PLUGIN_ID);
    const apiUrl = settings.get('url').composite as string;
    const refreshInterval = settings.get('refresh-interval')
      .composite as number;

    if (!statusBar) {
      return;
    }

    console.log(
      `Fetching announcements from ${apiUrl} every ${refreshInterval} milliseconds`
    );

    const myObject = new RefreshAnnouncements(statusBar);
    myObject.fetchAnnouncement(apiUrl, refreshInterval);
  }
};

export default extension;
