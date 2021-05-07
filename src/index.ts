import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { IStatusBar } from '@jupyterlab/statusbar';
import { IDisposable } from '@lumino/disposable';
import { Dialog, showDialog } from '@jupyterlab/apputils';

// API to fetch the announcements from
// const API_URL = 'https://jupyter-dev.nersc.gov/services/announcement/latest';
const API_URL = 'http://localhost:3000';

// global variables used to keep track of on screen elements

// keeps track of the button to show announcements so we can dispose it when needed
let openAnnouncementButton: IDisposable;

// this is the current stored announcement
let announcement = { user: '', announcement: '', timestamp: '' };

// this is the status bar at the bottom of the screen
let STATUSBAR: IStatusBar;

// this is whether or not the user has seen the announcement
// it determines whether or not to show the yellow alert emoji
let newAnnouncement = false;

// open the announcement modal and update the newAnnouncement to false
// because the user has seen the announcement now
function openAnnouncementsAndCloseButton() {
  newAnnouncement = false;
  openAnnouncements();
  createAnnouncementsButton(newAnnouncement);
}

// open the modal with the announcement in it
function openAnnouncements() {
  // because the user has click to read the announcement
  // it is no longer new to them
  newAnnouncement = false;

  // create the inner body of the announcement popup
  const body = document.createElement('p');
  body.innerHTML = announcement.announcement;
  body.classList.add('announcement');
  const widget = new Widget();
  widget.node.appendChild(body);

  // show the modal popup with the announcement
  void showDialog({
    title: 'Announcements',
    body: widget,
    buttons: [Dialog.okButton({ label: 'OK' })]
  });
}

// fetches the data every n microseconds
async function updateAnnouncements(url: string, n: number) {
  // get data the data from the API
  const response = await fetch(url);
  const data = await response.json();

  // check to see if the data is new
  if (data.announcement !== announcement.announcement) {
    console.log('New Announcement!');
    newAnnouncement = true;
    announcement = data;
  } else {
    console.log('Same announcement');
  }

  // if we have an announcement display a button to get the announcements
  if (Object.keys(data).length !== 0) {
    createAnnouncementsButton(newAnnouncement);
  }
  // otherwise destroy any button present
  else {
    if (openAnnouncementButton) {
      openAnnouncementButton.dispose();
    }
  }

  // wait n microseconds and check again
  setTimeout(updateAnnouncements, n);
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
function createAnnouncementsButton(newAnnouncement: boolean) {
  if (openAnnouncementButton) {
    openAnnouncementButton.dispose();
  }

  const statusWidget = new ButtonWidget();
  if (!newAnnouncement) {
    statusWidget.node.textContent = 'Click for Announcements';
  } else {
    statusWidget.node.textContent = '⚠️ Click for Announcements';
  }

  openAnnouncementButton = STATUSBAR.registerStatusItem('new-announcement', {
    align: 'middle',
    item: statusWidget
  });
}

// function openAnnouncements() {
//   const widget = new Widget();
//   widget.addClass('new-announcement'); // see base.css for styling

//   widget.id = 'announcement';
//   widget.title.label = 'New Announcement';
//   widget.title.closable = true;

//   const button = document.createElement('p');
//   button.innerHTML = 'X';
//   button.classList.add('close-button');
//   button.onclick = closeAnnouncement;
//   widget.node.appendChild(button);

//   const text = document.createElement('p');
//   text.innerHTML = ANNOUNCEMENT.announcement;
//   text.classList.add('announcement');
//   widget.node.appendChild(text);

//   APP.shell.add(widget, 'top');
//   APP.shell.activateById(widget.id);

//   announcementWidget = widget;
// }

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
    // APP = app;
    STATUSBAR = statusBar;
    updateAnnouncements(API_URL, 5000);
  }
};

export default extension;
