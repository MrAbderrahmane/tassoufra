const { BrowserWindow } = require("electron");
const path = require('path');

class MainWindow extends BrowserWindow{
  constructor(pageUrl, iconUrl){
    super({
      show: false,
      webPreferences: {
        nodeIntegration: true,
      },
      ...(iconUrl? {icon: iconUrl}:{})
    });
    this.loadFile(pageUrl);
    this.on("ready-to-show", () => {
      this.show();
    });
  }  
}

class AddPasswordWindow extends BrowserWindow{
  constructor(pageUrl,parentWindow = null){
    super({
      width: 400,
      height: 400,
      show: false,
      parent: parentWindow,
      modal: true,
      // frame: false,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    this.loadFile(pageUrl);
  }  
}

class MasterPasswordWindow extends BrowserWindow{
  constructor(pageUrl,parentWindow = null){
    super({
      width: 400,
      height: 400,
      show: false,
      parent: parentWindow,
      modal: true,
      // frame: false,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    this.loadFile(pageUrl);
  }  
}

module.exports = {MainWindow,AddPasswordWindow,MasterPasswordWindow};