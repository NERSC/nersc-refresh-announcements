import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { IStatusBar } from '@jupyterlab/statusbar';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

// Class that handles all the announcements refresh information and methods
class RefreshAnnouncements {
  // tracks the button to show announcements
  openAnnouncementButton: Widget;

  // this tracks the current stored announcement
  announcement: { user: string; announcement: string; timestamp: string };
  // this is the status bar at the bottom of the screen
  statusbar: IStatusBar;
  // this tracks whether or not the user has seen the announcement
  // it determines whether or not to show the yellow alert emoji
  newAnnouncement: boolean;

  // takes the statusbar that we will add to as only parameter
  public constructor(statusbar: IStatusBar) {
    this.openAnnouncementButton = null;
    this.announcement = { user: '', announcement: '', timestamp: '' };
    this.statusbar = statusbar;
    this.newAnnouncement = false;
  }

  // fetches the announcements data every n microseconds from the given url
  // creates and destroys the announcement button based on result of fetch
  async updateAnnouncements(url: string, n: number) {
    // get data the data from the API
    let data = { user: '', announcement: '', timestamp: '' };
    try {
      const response = await fetch(url);
      data = await response.json();
    } catch (e) {
      // there was an error with fetching

      // dispose of announcements button if there is one
      if (this.openAnnouncementButton) {
        this.openAnnouncementButton.dispose();
      }

      // call again in n microseconds (maybe the API is only down for a little bit)
      setTimeout(() => {
        this.updateAnnouncements(url, n);
      }, n);

      return;
    }

    // check to see if the data is new
    if (data.announcement !== this.announcement.announcement) {
      this.newAnnouncement = true;
      this.announcement = data;
    }

    // if we have an announcement display a button to get the announcements
    if (Object.keys(data).length !== 0 && data.announcement !== '') {
      this.createAnnouncementsButton(this.newAnnouncement);
    }
    // otherwise hide any button present
    else {
      if (this.openAnnouncementButton) {
        this.openAnnouncementButton.node.textContent = '';
      }
    }

    // wait n microseconds and check again
    setTimeout(() => {
      this.updateAnnouncements(url, n);
    }, n);
  }

  // creates/edits a button on the status bar to open the announcements modal
  createAnnouncementsButton(newAnnouncement: boolean) {
    // class used to create the open announcements button
    class ButtonWidget extends Widget {
      public constructor(
        announcementsObject: RefreshAnnouncements,
        newAnnouncement: boolean,
        options = { node: document.createElement('p') }
      ) {
        super(options);
        this.node.classList.add('open-announcements');

        // when the button is clicked:
        // mark the announcement as no longer new
        // open the announcement in a modal
        // edit the announcement button (to get rid of yellow warning emoji)
        this.node.onclick = () => {
          announcementsObject.newAnnouncement = false;
          announcementsObject.openAnnouncements();
          announcementsObject.createAnnouncementsButton(
            announcementsObject.newAnnouncement
          );
        };
      }
    }

    // if the open announcements button isn't on the status bar
    if (!this.openAnnouncementButton) {
      // creates the open annonucements button
      this.openAnnouncementButton = new ButtonWidget(
        this,
        this.newAnnouncement
      );

      // places the button on the status bar
      this.statusbar.registerStatusItem('new-announcement', {
        align: 'left',
        item: this.openAnnouncementButton
      });
    }

    // labels the button if the announcement based on if it is new or not
    if (!newAnnouncement) {
      this.openAnnouncementButton.node.textContent = 'Announcements';
    } else {
      this.openAnnouncementButton.node.textContent =
        '⚠️ Click for Announcements';
    }
  }

  // creates and open the modal with the announcement in it
  async openAnnouncements() {
    // because the user has click to read the announcement
    // it is no longer new to them
    this.newAnnouncement = false;

    // create the inner body of the announcement popup
    const body = document.createElement('p');
    body.innerHTML = this.announcement.announcement;
    body.classList.add('announcement');
    const widget = new Widget();
    widget.node.appendChild(body);

    // show the modal popup with the announcement
    void showDialog({
      title: 'Announcements',
      body: widget,
      buttons: [Dialog.okButton({ label: 'Close' })]
    });
  }
}

const PLUGIN_ID = 'nersc-refresh-announcements:plugin';

/**
 * Initialization data for the nersc-refresh-announcements extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IStatusBar, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    statusBar: IStatusBar,
    settingRegistry: ISettingRegistry
  ) => {
    console.log(
      'JupyterLab extension nersc-refresh-announcements is activated!'
    );

    const settings = await settingRegistry.load(PLUGIN_ID);
    const apiUrl = settings.get('url').composite as string;
    const refreshInterval = settings.get('refresh-interval')
      .composite as number;

    console.log(
      `Fetching announcements from ${apiUrl} every ${refreshInterval} milliseconds`
    );

    const myObject = new RefreshAnnouncements(statusBar);
    myObject.updateAnnouncements(apiUrl, refreshInterval);
  }
};

export default extension;
