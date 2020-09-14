const { BrowserWindow, app, ipcMain, Notification, clipboard } = require("electron");

const knexHelper = require("./utils/knexhelper");
const encryptoHelper = require("./utils/cryptohelper");
const cryptohelper = require("./utils/cryptohelper");

let mainWindow, addPasswordWindow, masterPasswordWindow;

function createWindow() {
  // main window
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

  // add password window
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
  // addPasswordWindow.on('close', ()=>{masterPasswordWindow = null});
  addPasswordWindow.webContents.openDevTools();

  // master password window
  masterPasswordWindow = new BrowserWindow({
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

  masterPasswordWindow.loadFile("./src/masterpasswords/masterpassword.html");
  // masterPasswordWindow.on('close', ()=>{masterPasswordWindow = null});
  masterPasswordWindow.webContents.openDevTools();
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
  const obj = { website: args.website,username:args.username };
  try{
    obj.hashedpassword = encryptoHelper.encrypt(args.password);
  } catch(err) {
    console.error(err);
    mainWindow.webContents.send('save-password-result',{result:0,args:'Error encription'})
    return 
  }
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
      console.log(err)
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

ipcMain.on('show-password', (e, args) => {
  console.log(args);
  let p;
  try{
   p = encryptoHelper.decrypt(args);
  } catch(e) {
    p = null;
  }
  e.sender.send('showed-password',{
    result: p? 1:0,
    args: p? p:'Decryption error!!!'
  });
})

ipcMain.on('copy-to-clipboard', (e, args) => {
  clipboard.writeText(args);
});

ipcMain.on('show-master-password-dialog', (e, args) => {
  if(!encryptoHelper.getEncryptionPassword()){
    masterPasswordWindow.show()
  }
});

ipcMain.on('check-master-password', (e, password) => {
  knexHelper.getFirstPassword().then(res => {
    if(res.length > 0){
      try {
        encryptoHelper.setEncryptionPassword(encryptoHelper.hash(password))
        cryptohelper.decrypt(res[0].hashedpassword);
        masterPasswordWindow.hide();
        mainWindow.webContents.send('master-password-set')
  
      } catch (error) {
        e.sender.send('wrong-master-password');
        // masterPasswordWindow.webContents.send('wrong-master-password')
        console.log(error);
      }
    } else {
      encryptoHelper.setEncryptionPassword(encryptoHelper.hash(password));
      masterPasswordWindow.hide();
      mainWindow.webContents.send('master-password-set')
    }
  }).catch(err => {
    e.sender.send('error',err);
    // masterPasswordWindow.webContents.send('error',err);
    console.log(error);
  })
})