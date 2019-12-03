import React, { Component } from 'react';
import weatherStyles from './Weather.css';


export class Temperature extends Component{
  render(){
    return (
      <h2>{this.props.temperature}º C</h2>
    )
  }
}

 class Wind extends Component{
  render(){
    return (
      <div >
        <img src="https://cdn.icon-icons.com/icons2/788/PNG/512/wind_icon-icons.com_65118.png" width="30px"></img> {this.props.wind} м/с
      </div>

    )
  }
}

 class Humidity extends Component{
  render(){
    return (
      <div >
        humidity : {this.props.humidity}%
      </div>

    )
  }
}
 class Pressure extends Component{
  render(){
    return (
      <span >
        Pressure : {this.props.pressure} мм рт ст
      </span>

    )
  }
}
export class Weather extends Component{
  render(){
    return (

        <div className={weatherStyles.Weather}>

          <span className={weatherStyles.Temperature}><Temperature temperature={this.props.temperature}/> </span>
          <span className={weatherStyles.Wind}><Wind wind={this.props.wind}> </Wind></span>
          <span className={weatherStyles.Pressure}><Pressure pressure={this.props.pressure}> </Pressure></span>
          <span className={weatherStyles.Humidity}><Humidity humidity={this.props.humidity}> </Humidity></span>

        </div>


    )
  }
}

