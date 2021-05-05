import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { IStatusBar } from '@jupyterlab/statusbar';

const API_URL = 'https://jupyter-dev.nersc.gov/services/announcement/latest';

class ButtonWidget extends Widget {
  public constructor(options = { node: document.createElement('button') }) {
    super(options);
    this.node.onclick = refreshAnnouncements;
  }
}

async function refreshAnnouncements() {
  const response = await fetch(API_URL);
  const data = response.json();

  console.log(data);
}

/**
 * Initialization data for the nersc-refresh-announcements extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'nersc-refresh-announcements:plugin',
  autoStart: true,
  requires: [IStatusBar],
  activate: (app: JupyterFrontEnd, statusBar: IStatusBar) => {
    console.log(
      'JupyterLab extension nersc-refresh-announcements is activated!'
    );

    const statusWidget = new ButtonWidget();
    statusWidget.node.textContent = 'New Announcement ⚠️';

    statusBar.registerStatusItem('test', {
      align: 'middle',
      item: statusWidget
    });
  }
};

export default extension;
