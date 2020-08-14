const { BrowserWindow, app, ipcMain, Notification } = require("electron");

const knexHelper = require("./knexhelper");

let mainWindow, addPasswordWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: "./assets/images/icon.png",
  });
  mainWindow.loadFile("./src/index.html");
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.openDevTools();

  addPasswordWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    parent: mainWindow,
    modal: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  addPasswordWindow.loadFile("./src/passwords/addpassword.html");
  addPasswordWindow.webContents.openDevTools();
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

ipcMain.on("get-all-passwords", (e) => {
  // console.log('get-all-password from main');
  knexHelper
    .getAllPasswords()
    .then((res) => {
      // console.log(res)
      e.sender.send("all-passwords-result", { result: 1, args: res });
    })
    .catch((err) => {
      e.sender.send("all-passwords-result", {
        result: 0,
        args: "Can not get data!!!",
      });
    });
});

ipcMain.on("show-add-password-dialog", () => {
  addPasswordWindow.show();
});

ipcMain.on("save-password", (e, args) => {
  // console.log('saving password');
  const obj = { website: args.website, hashedpassword: args.password };
  knexHelper
    .savePasswords({ ...obj })
    .then((res) => {
      console.log("save password res from db", res);
      return knexHelper.getPassword(res[0]);
    })
    .then((newP) => {
      console.log(newP);
      mainWindow.webContents.send("save-password-result", {
        result: 1,
        args: newP[0],
      });
    })
    .catch((err) => {
      mainWindow.webContents.send("save-password-result", {
        result: 0,
        args: "Can not save data!!!",
      });
    });
  addPasswordWindow.hide();
});

ipcMain.on("delete-password", (e, args) => {
  knexHelper
    .deletePassword(args)
    .then((res) => {
      if (res === 1) {
        e.sender.send("delete-password-result", { result: 1, args });
      } else {
        e.sender.send("delete-password-result", {
          result: 0,
          args: "No result",
        });
      }
    })
    .catch((err) => {
      e.sender.send("delete-password-result", {
        result: 0,
        args: "There was an error!!!",
      });
    });
});

ipcMain.on("show-notification", (e, args) => {
  new Notification({
    title: args.title,
    body: args.body,
    icon: "./assets/images/icon.png",
  }).show();
});
