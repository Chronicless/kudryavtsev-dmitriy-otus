import React, { Component } from 'react';
import {Weather} from './Weather';

import cityStyles from './Cities.css';




class CityCard extends Component{
  constructor(props) {
    super(props);
    this.state = {isFavorite : true};
  }

  render(){
    let { isFavorite } = this.state;
    const changeFavoriteState =  () => {
      this.setState({isFavorite:!isFavorite});
    };
    return (

        <div className={cityStyles.CityCard}>
          <span className={cityStyles.CityName}> <CityName name={this.props.name}></CityName></span>
          <span title={isFavorite? 'Remove from favorite' : 'Add to favorite'}><Favorite isFavorite={isFavorite} changeState={changeFavoriteState}/></span>

          <Weather temperature={this.props.temperature} wind={this.props.wind} humidity={this.props.humidity} pressure={this.props.pressure} weather={this.props.weather}/>
        </div>



    )
  }
}


class CityName extends Component{
  render(){
    return (
      <span>{this.props.name}</span>
    )
  }
}

class Favorite extends Component {
  render() {
    return (
      <div className={cityStyles.Favorite}>
        <img
          src={this.props.isFavorite? 'https://cdn3.iconfinder.com/data/icons/flat-actions-icons-9/792/Star_Gold_Dark-512.png' : 'https://icon-icons.com/icons2/1456/PNG/512/mbristar_99561.png'}
          width="30px"
          onClick={this.props.changeState }>

        </img>
      </div>
    )
  }
}

export class CityList extends Component {

  render() {
    return (
      <div className={cityStyles.CityList}>
          {this.props.cities.map(city =>
            <CityCard key={city.name} name={city.name} temperature={city.temperature} wind={city.wind} humidity={city.humidity} pressure={city.pressure} weather={city.weather}>
            </CityCard>)}
        </div>
    );
  }
}
