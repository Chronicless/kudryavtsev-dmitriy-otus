const { Readable, Writable, Transform } = require('stream');

function randomNumberGenerator(type) {
  const num = Math.floor(Math.random() * 1000000);
  console.log(`For ${type} generated number ${num}`);
  return num.toString();
}


function getReadbleSteam(opts) {
  return new Readable({

    read() {
      this.push();
    },
    highWaterMark: opts.highWaterMark,

  });
}
function getWritableSteam() {
  return new Writable({
    write(chunk, encoding, callback) {
      console.log(`Writable stream output:${chunk.toString()}`);
      callback();
    },
  });
}

function getTransformStream() {
  return new Transform({
    writableObjectMode: true,

    transform(chunk, encoding, callback) {
      const data = chunk.toString() + randomNumberGenerator('transformStream');

      // Push the data onto the readable queue.
      callback(null, data);
    },
  });
}


const wStream = getWritableSteam();
const rStream = getReadbleSteam({ highWaterMark: 100 });
const tStream = getTransformStream();


setInterval(() => {
  rStream.push(randomNumberGenerator('readble'));
}, 1500);

rStream.pipe(tStream).pipe(wStream);
