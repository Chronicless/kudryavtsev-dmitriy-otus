import React from 'react';
import ReactDom from 'react-dom';

import randomGenerator from './utils';
import {CityList} from './components/Cities';

function generateWeatherData(){
  return {
    name: randomGenerator({type:'city'}),
    temperature: randomGenerator({len :40,type :'double'})* (randomGenerator({type:'boolean'})?-1:1),
    wind :randomGenerator({len: 20, type: 'int'}),
    humidity : randomGenerator({len: 100, type:'int'}), //влажность
    pressure: randomGenerator({type:'interval',min:750, max:770}),
    weather: randomGenerator({type:'weather'})
  }
}

const startCityList = [];
for (let i=0; i<9; i++){
  startCityList.push(generateWeatherData())
}
console.log(startCityList);
ReactDom.render(<CityList cities={startCityList}></CityList>,document.getElementById('app'));
