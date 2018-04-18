'use strict';

const fileFinder = require('./file_finder.js');

const ipc = require('electron').ipcMain;
ipc.on('movePath', function(event, data) {
  event.sender.send('didMoveDirectory', data);

  const queue = require('queue');
  var q = queue();

  q.push(

    () => {
      fileFinder.search(data.path, (files) => {
        var result = {
          path: data.path,
          files: files,
          referer: data.referer
        };
        event.sender.send('searchFiles', result);
      });
    }
  );

  q.start();

})

ipc.on('moveToTrash', function(event, data) {
  fileFinder.moveToTrash(event, data.filePath)
})

ipc.on('keydown', function(event, data) {
  event.sender.send('keydown', data);
})

// delegate
const proxyList = ['click', 'endedVideo', 'selectFile']
proxyList.forEach(function(e) {
  ipc.on(e, function(event, data) {
    event.sender.send(e, data);
  })
})
