const pluginPermissions = {
    // This permission regards the main component (App) and is used to tell
    // If the plugin link should be displayed in the menu
    // And also if the plugin is accessible. This use case is found when a user types the url of the
    // plugin directly in the browser
    main: [{ action: 'plugin::postgis.main', subject: null }],
    readSettings: [
        { action: 'plugin::passwordless.settings.read', subject: null },
    ],
    updateSettings: [
        { action: 'plugin::passwordless.settings.update', subject: null },
    ],

  };

export default pluginPermissions;