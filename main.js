const electron = require("electron");
const { BrowserWindow, app, ipcMain, Notification, clipboard } = electron;
const path = require("path");

const knexHelper = require("./utils/knexhelper");
const cryptohelper = require("./utils/cryptohelper");
const { MainWindow, AddPasswordWindow, MasterPasswordWindow } = require("./utils/windows");

let allWindows = {};

require('dotenv').config();

if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: __dirname + "/node_modules/.bin/electron",
    hardResetMethod: "exit",
    ignored: /node_modules|[\/\\]\.|db.sqlite3/
  });
}

function createWindow() {
  // main window
  allWindows.mainWindow = new MainWindow(path.join(__dirname,"src/index.html"),path.join(__dirname,"assets/images/icon.png"));
  if (process.env.NODE_ENV === "development")
    allWindows.mainWindow.webContents.openDevTools();
}

function createAddPasswordWindow() {
  // add password window
  allWindows.addPasswordWindow = new AddPasswordWindow(path.join(__dirname,"./src/passwords/addpassword.html"),allWindows.mainWindow)
  allWindows.addPasswordWindow.once("close", () => {
    allWindows.addPasswordWindow = undefined;
  });
  if (process.env.NODE_ENV === "development")
    allWindows.addPasswordWindow.webContents.openDevTools();
}

function createMasterPasswordWindow() {
  // master password window
  allWindows.masterPasswordWindow = 
    new MasterPasswordWindow(path.join(__dirname,"./src/masterpasswords/masterpassword.html"),allWindows.mainWindow)
  allWindows.masterPasswordWindow.once("close", () => {
    allWindows.masterPasswordWindow = undefined;
  });
  if (process.env.NODE_ENV === "development")
    allWindows.masterPasswordWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function showAddPasswordForm() {
  createAddPasswordWindow();
  allWindows.addPasswordWindow.once("ready-to-show", () => {
    allWindows.addPasswordWindow.show();
  });
}

/*
==================================================================
== MainWindow ipc handlers                                      ==
==================================================================
*/

ipcMain.on("copy-to-clipboard",(e,args)=>{
  clipboard.writeText(args);
});

ipcMain.handle("show-password", (e, args) => {
  console.log(args);
  let p;
  try {
    p = cryptohelper.decrypt(args);
  } catch (e) {
    p = null;
  } finally {
    return {
      result: p ? 1 : 0,
      args: p ? p : "Decryption error!!!",
    }
  }
});

ipcMain.on("show-notification", (e, args) => {
  new Notification({
    title: args.title,
    body: args.body,
    icon: "./assets/images/icon.png",
  }).show();
});

ipcMain.handle("delete-password", async (e, args) => {
  let res;
  try {
    res = await knexHelper.deletePassword(args);
  } catch (error) {
    res = null;
  } finally {
    return {
      result: res? 1:0,
      args: res===1?  args: res !== null? "no result" : "There was an error!!!"
    }
  }
});

ipcMain.handle("get-all-passwords", async (e) => {
  let results;
  try {
    results = { result: 1, args: await knexHelper.getAllPasswords()}
  } catch (error) {
    results = { result: 0, args: "Can not get data!!!"}
  } finally {
    return results;
  }
});


/*
==================================================================
== MasterPassordWindow ipc handlers                             ==
==================================================================
*/

ipcMain.on("show-master-password-dialog", e => {
  if (!cryptohelper.getEncryptionPassword()) {
    createMasterPasswordWindow();
    allWindows.masterPasswordWindow.on("ready-to-show", () => {
      allWindows.masterPasswordWindow.show();
    });
  } else {
    allWindows.mainWindow.webContents.send("master-password-set");
  }
});

ipcMain.on("chck-mstr-psswrd", async (e, password) => {
  try{
    const res = await knexHelper.getRandomPassword();
    if (res.length > 0) {
      cryptohelper.setEncryptionPassword(cryptohelper.hash(password));
      cryptohelper.decrypt(res[0].hashedpassword);
      allWindows.mainWindow.webContents.send("master-password-set");
      allWindows.masterPasswordWindow.close();
    } else {
      cryptohelper.setEncryptionPassword(cryptohelper.hash(password));
      allWindows.mainWindow.webContents.send("master-password-set");
      allWindows.masterPasswordWindow.close();
    }
  } catch(err) {
    e.reply("show-notification", "There was an error!!!");
  }
});

/*
==================================================================
== AddPasswordHandler ipc handlers                             ==
==================================================================
*/

ipcMain.on("show-add-password-dialog", () => {
  showAddPasswordForm();
});

ipcMain.on("save-password", async (e, args) => {
  let newP;
  try{
    const obj = { website: args.website, username: args.username };
    obj.hashedpassword = cryptohelper.encrypt(args.password);
    const res = await knexHelper.savePasswords({ ...obj });
    newP = await knexHelper.getPassword(res[0]);
  } catch(err) {
    newP = null;
  } finally {
    allWindows.mainWindow.webContents.send("save-password-result", {
      result: newP? 1:0,
      args: newP? newP[0] : "Can not save data!!!",
    });
    allWindows.addPasswordWindow.close();
  }
});

ipcMain.on("edit-password", async (e, args) => {
  let res;
  try {
    res = await knexHelper.getPassword(args);
  } catch (error) {
    res = null;
  } finally {
    if (res && res.length === 1) {
      showAddPasswordForm();
      allWindows.addPasswordWindow.password = res[0];
    } else {
      allWindows.mainWindow.webContents.send("show-notification", "There was an error!!!");
    }
  }
});

ipcMain.on("update-password", async (e, args) => {
  let res;
  try{
    if (args.password) {
      args.hashedpassword = cryptohelper.encrypt(args.password);
      delete args.password;
    }
    res = await knexHelper.updatePassword(args);
  } catch(err) {
    res = null;
  } finally {
    if (res === 1) {
      allWindows.mainWindow.webContents.send("rerender");
    } else {
      allWindows.mainWindow.webContents.send("show-notification", "There was an error!!!");
    }
    allWindows.addPasswordWindow.close();
  }
});
