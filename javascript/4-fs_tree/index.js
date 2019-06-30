const fs = require('fs');
const util = require('util');

const startPath = 'foo';

const fsReadDir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.lstat);

function getFolderData(path) {
  let files = [];
  let dirs = [path];
  const childDirsDataPromises = [];
  return new Promise(async (resolve, reject) => {
    const dirData = await fsReadDir(path).catch((err) => { console.log(`Error occurred during reading path ${path} . Error : ${err.message}`); reject(); });
    if (dirData.length > 0) {
      // dir is not empty
      // collecting info about files in current dir
      const dirDataPromises = [];
      for (let i = 0; i < dirData.length; i += 1) {
        dirDataPromises.push(fsStat(`${path}/${dirData[i]}`));
      }
      const dirDataStats = await Promise.all(dirDataPromises).catch((err) => { console.log(`Failed to collect stats about files in dir ${path}.Error : ${err.message}`); reject(); });

      // filling files and dirs arrays
      for (let j = 0; j < dirDataStats.length; j += 1) {
        if (dirDataStats[j].isDirectory()) {
          // for dir making recursive call, dive deeper....
          childDirsDataPromises.push(getFolderData(`${path}/${dirData[j]}`));
        } else {
          // is file
          files.push(`${path}/${dirData[j]}`);
        }
      }

      if (childDirsDataPromises.length === 0) {
        // we dont have dirs on this level... returning
        resolve({ dirs, files });
      } else {
        // we have dirs here ... waiting for async call with result for all dirs on this level
        const childData = await Promise.all(childDirsDataPromises).catch((err) => { console.log(`Error occurred in recursive call. ${err.message}`); reject(); });

        for (let a = 0; a < childData.length; a += 1) {
          // combining this level data with recursive call data from deeper levels...
          dirs = dirs.concat(childData[a].dirs);
          files = files.concat(childData[a].files);
        }
        resolve({ dirs, files });
      }
    } else {
      // folder is empty
      resolve({ files, dirs });
    }
  });
}

async function run() {
  const callResult = await getFolderData(startPath).catch((err) => {
    console.log(`Error occurred during fetching main data!${err.message}`);
  });
  console.log('Finished!');
  console.log(callResult);
  process.exit(0);
}

run();
