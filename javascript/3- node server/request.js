const http = require('http');

const supportedModes = ['Parallel', 'Simultaneous'];

async function request(requestsToSend, mode) {
  for (let i = 0; i < requestsToSend; i++) {
    if (mode === supportedModes[0]) {
      console.log('Sending request...');
      makeRequest();

    }
    if (mode === supportedModes[1]) {
      console.log('Sending request...');
      await makeRequest();
      console.log('Response recieved...');
    }
  }
}

function makeRequest() {
  return new Promise((resolve) => {
    http.get('http://localhost:8000', () => {
      resolve()
    })
  })
}

//request(500,'Parallel');
request(500, 'Simultaneous');