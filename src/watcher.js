const fs = require('fs');

(async () => {
  // const watcher = fs.watch('./index.html');
  // watcher.on('change', () => {
  //   console.log('changed')
  // });
  fs.watch(__dirname,{},(e, s)=>{
    // console.log(__dirname);
    // console.log('event: ',e);
    // console.log('res: ',s);
    window.location.reload();
  })
})();