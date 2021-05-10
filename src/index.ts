import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { IStatusBar } from '@jupyterlab/statusbar';
import { IDisposable } from '@lumino/disposable';
import { Dialog } from '@jupyterlab/apputils';

// API to fetch the announcements from
// const API_URL = 'https://jupyter-dev.nersc.gov/services/announcement/latest';
const API_URL = 'http://localhost:3000';

// global variables used to keep track of on screen elements

// tracks the button to show announcements so we can dispose it when needed
let openAnnouncementButton: IDisposable;

// this tracks the current stored announcement
let announcement = { user: '', announcement: '', timestamp: '' };

// this is the status bar at the bottom of the screen
let STATUSBAR: IStatusBar;

// this tracks whether or not the user has seen the announcement
// it determines whether or not to show the yellow alert emoji
let newAnnouncement = false;

let showAnnouncementButton = true;

// open the announcement modal and update the newAnnouncement to false
// because the user has seen the announcement now
function openAnnouncementsAndCloseButton() {
  newAnnouncement = false;
  openAnnouncements();
  createAnnouncementsButton(newAnnouncement, showAnnouncementButton);
}

// open the modal with the announcement in it
async function openAnnouncements() {
  // because the user has click to read the announcement
  // it is no longer new to them
  newAnnouncement = false;

  // create the inner body of the announcement popup
  const body = document.createElement('p');
  body.innerHTML = announcement.announcement;
  body.classList.add('announcement');
  const widget = new Widget();
  widget.node.appendChild(body);

  // create the modal popup with the announcement
  const dialog = new Dialog({
    title: 'Announcements',
    body: widget,
    buttons: [
      Dialog.okButton({ label: 'Hide Announcements' }),
      Dialog.okButton({ label: 'Close' })
    ]
  });

  // get which button on the modal the user clicks
  const result = await dialog.launch();

  // hide the announcement button if the user chooses so
  if (result.button.label === 'Hide Announcements') {
    showAnnouncementButton = false;
    openAnnouncementButton.dispose();
  }
}

// fetches the announcements data every n microseconds
async function updateAnnouncements(url: string, n: number) {
  // get data the data from the API
  let data = { user: '', announcement: '', timestamp: '' };
  try {
    const response = await fetch(url);
    data = await response.json();
  } catch (e) {
    // there was an error with fetching

    // dispose of announcements button if there is one
    if (openAnnouncementButton) {
      openAnnouncementButton.dispose();
    }

    // call again in n microseconds (maybe the API is only down for a little bit)
    setTimeout(() => {
      updateAnnouncements(url, n);
    }, n);

    return;
  }

  // check to see if the data is new
  if (data.announcement !== announcement.announcement) {
    newAnnouncement = true;
    showAnnouncementButton = true;
    announcement = data;
  }

  // if we have an announcement display a button to get the announcements
  if (Object.keys(data).length !== 0) {
    createAnnouncementsButton(newAnnouncement, showAnnouncementButton);
  }
  // otherwise destroy any button present
  else {
    if (openAnnouncementButton) {
      openAnnouncementButton.dispose();
    }
  }

  // wait n microseconds and check again
  setTimeout(() => {
    updateAnnouncements(url, n);
  }, n);
}

// class used to create the button to open the announcements
// see method below
class ButtonWidget extends Widget {
  public constructor(options = { node: document.createElement('p') }) {
    super(options);
    this.node.classList.add('open-announcements');
    this.node.onclick = openAnnouncementsAndCloseButton;
  }
}

// creates a button on the status bar to open the announcements modal
function createAnnouncementsButton(
  newAnnouncement: boolean,
  showAnnouncement: boolean
) {
  if (openAnnouncementButton) {
    openAnnouncementButton.dispose();
  }

  const statusWidget = new ButtonWidget();
  if (!newAnnouncement && showAnnouncement) {
    statusWidget.node.textContent = 'Announcements';
  } else if (!newAnnouncement && !showAnnouncement) {
    return;
  } else if (newAnnouncement) {
    statusWidget.node.textContent = '⚠️ Click for Announcements';
  }

  openAnnouncementButton = STATUSBAR.registerStatusItem('new-announcement', {
    align: 'left',
    item: statusWidget
  });
}

/**
 * Initialization data for the nersc-refresh-announcements extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'nersc-refresh-announcements:plugin',
  autoStart: true,
  requires: [IStatusBar],
  activate: async (app: JupyterFrontEnd, statusBar: IStatusBar) => {
    console.log(
      'JupyterLab extension nersc-refresh-announcements is activated!'
    );

    STATUSBAR = statusBar;

    // 300,000,000 microseconds is 5 minutes
    updateAnnouncements(API_URL, 300000000);
  }
};

export default extension;
