# nersc_refresh_announcements

A JupyterLab extension.

This extension fetches announcements from an external API to and creates
a button in the JupyterLab status bar that can display the announcement
in a modal window.


## Requirements

* JupyterLab >= 3.0

## Install

To install the extension, enter the root repository folder and execute:

```bash
pip install .
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall nersc_refresh_announcements
```

If that does not work, you can directly delete the extension folder from
Jupyter. See 
<a href="https://jupyterlab.readthedocs.io/en/latest/user/directories.html#extensions">this link</a> 
to find where your extensions are installed.

## Configuration and Announcement API Assumptions

The default url that the extension will attempt to fetch announcements from is
<base url>/services/announcement/latest . If you wish to change that url you 
can do so for each user in JupyterLab under the advanced settings window. You
can also change that url for every user on the system by modifying Jupyter's
`overrides.json` file. Click 
<a href="https://jupyterlab.readthedocs.io/en/latest/user/directories.html#overrides-json"> this link</a>
to see where your overrides.json file is installed. Similarly, the refresh
interval that controls how often the announcement API is checked can also
be configured either per user or system-wide.

View the `examples_overrides.json` file above to see how to format this file.

There are two assumptions made about the announcements API. The first is that 
it has Cross-Origin Resource Sharing enabled and is accessible from the url 
that the JupyterLab server is running on (for most users this is 
localhost:8888, but if you use a JupyterHub service or other portal it might 
be different). You might have to work with your announcements API provider to ensure your JupyterLab is allowed to fetch from that url. The second 
assumption is that the API will return a json object that has an 
"announcement" field (i.e. {"announcement": "Hello, World!"}).

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the nersc_refresh_announcements directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall nersc_refresh_announcements
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `nersc-refresh-announcements` within that folder.
