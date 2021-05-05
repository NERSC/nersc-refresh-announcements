import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the nersc-refresh-announcements extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'nersc-refresh-announcements:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension nersc-refresh-announcements is activated!');
  }
};

export default extension;
