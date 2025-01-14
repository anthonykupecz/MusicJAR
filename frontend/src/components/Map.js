import React, { Component } from 'react';
import {Table, Row, Col, Container} from 'react-bootstrap'
import GoogleMapReact from 'google-map-react';
import mapService from '../services/mapService'
import {Slider, Typography} from '@material-ui/core'
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { Form, Button, Alert } from 'react-bootstrap'
import {
    useHistory
} from 'react-router-dom'
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const latMarks = [
    {
      value: -90,
      label: "-90°"
    },
    {
        value: 0,
        label: "0°"
      },
    {
      value: 90,
      label: "90°"
    }
  ]
const longMarks = [
    {
      value: -180,
      label: "-180°"
    },
    {
        value: 0,
        label: "0°"
      },
    {
      value: 180,
      label: "180°"
    }
  ]
const attMarks = [
    {
        value: 0,
        label: "0"
      },
    {
      value: 100,
      label: "100"
    }
  ]

const examplePlace = {
  name: "Example Place Name",
  rating: 5,
  types: ["TYPE HERE"],
  price_level: 1,
  open: true,
  lat: 40.7128,
  lng: -74.0060
}

const dateConverter = function(date) {
  var months = ["January", "February", "March", "April", "May",
"June", "July", "August", "September", "October", "November", "December"]

  var year = date.getFullYear()
  var month = months[date.getMonth()]
  var day = date.getDate()
  var convertedString = month + " " + day + ", " + year
  return(convertedString)
}

const getInfoWindowString = function (marker) {

  var begin = new Date(marker.begin_date)
  var end = new Date(marker.end)
  var dateString = ""
  if(!isNaN(begin)) {
    var beginConverted = dateConverter(begin)
    if(!isNaN(end)) {
      var endConverted = dateConverter(end)
      if(endConverted == beginConverted) {
        dateString = beginConverted
      }
      else {
        dateString = beginConverted + " - " + endConverted
      }
    }
    else {
      dateString = beginConverted
    }
  }
  else {
    dateString = "Unknown"
  }

  return(
    `
  <div>
    <div style="font-size: 16px;">
      <b> ${marker.e_name} </b>
    </div>
    <div style="font-size: 16px;">
      Dates: ${dateString}
    </div>
    <div style="font-size: 16px;">
      Place Name: ${(marker.p_name === "") ? "Unknown" : marker.p_name}
    </div>
    <div style="font-size: 16px;">
      Place Address: ${(marker.address === "") ? "Unknown" : marker.address }
    </div>
  </div>
  `
);
}


const makeQueryParams = function(state) {
  var start = state.startDate
  var end = state.endDate

  var earliest_date = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate()

  var latest_date = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" + end.getDate()

  console.log("earliest_date: ", earliest_date, "\nlatest_date: ", latest_date)

  return {
    // "start": 0,
    // "number": numberLimit,
    "left_longitude": state.longitudeRange[0],
    "right_longitude": state.longitudeRange[1],
    "bottom_latitude": state.latitudeRange[0],
    "top_latitude": state.latitudeRange[1],
    "earliest_date": earliest_date,
    "latest_date": latest_date,
    "lowest_attendance": state.attRange[0],
    "highest_attendance": state.attRange[1],
    "artist": (state.inputArtist === "" ? undefined : state.inputArtist)
  }
}

class Map extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentlyViewingSimilar: false,
      nameOfSimilarView: undefined,
      lastClickedEventId: undefined,
      lastClickedEventName: undefined,
      mostPopularGenreRows: [],
      currentPage: 0,
      pageSize: 10,
      map: null,
      maps: null,
      markers: [],
      events: [],
      longitudeRange: [-180, 180],
      latitudeRange: [-90, 90],
      endDate : new Date('2030-01-01T21:11:54'),
      startDate : new Date('1900-01-01T21:11:54'),
      attRange : [0, 100],
      inputArtist : ""
    };
    this.handleChangeLat = this.handleChangeLat.bind(this)
    this.handleChangeLong = this.handleChangeLong.bind(this)
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this)
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this)
    this.handleChangeAtt = this.handleChangeAtt.bind(this)
    this.handleInputArtistChange = this.handleInputArtistChange.bind(this)
    // this.logout = this.logout.bind(this)
    this.onUserButtonClick = this.onUserButtonClick.bind(this)
    this.onFeedClick = this.onFeedClick.bind(this)

    this.onEventButtonClick = this.onEventButtonClick.bind(this)
    this.internalHandleApiLoaded = this.internalHandleApiLoaded.bind(this)
    this.updateMap = this.updateMap.bind(this)
    this.removeMarkers = this.removeMarkers.bind(this)
    this.displayPage = this.displayPage.bind(this)
    this.setPageSize = this.setPageSize.bind(this)
    this.onSimilarButtonClick = this.onSimilarButtonClick.bind(this)
  }

  static defaultProps = {
    center: {
      lat: 40.7128,
      lng: -74.0060
    },
    zoom: 10
  };

  setPageSize(newPageSize) {
    if(newPageSize < 1) {
      return
    }
    this.setState({pageSize: newPageSize}, () => {
      this.displayPage(0)
    })
  }

  displayPage(pageNumber) {
    //note: pageNumber is 0 indexed here
    console.log("Displaying page number: ", pageNumber)
    if(pageNumber < 0 || pageNumber >= Math.ceil(this.state.events.length / this.state.pageSize)) {
      return;
    }
    this.setState({currentPage: pageNumber})
    this.updateMap(this.state.map, this.state.maps, this.state.events, pageNumber * this.state.pageSize, this.state.pageSize)
  }

  removeMarkers() {
    var markers = this.state.markers;
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    this.setState({markers: []})
  }

  updateMap(map, maps, events, offset, number) {
    this.removeMarkers()

    if(!offset) {
      offset = 0
    }
    if(!number) {
      number = events.length
    }
    const markers = [];
    const infowindows = [];
    const e_ids = [];
    const e_names = [];

    console.log("offset is: ", offset)
    console.log("number is: ", number)
    for(var i = offset; i < Math.min((offset + number), events.length); i++) {
      var event = events[i]
      if(typeof(event.latitude) != 'number' || typeof(event.longitude) != 'number') {
        continue;
      }

      e_ids.push(event.e_id)
      e_names.push(event.e_name)

      markers.push(new maps.Marker({
        position: {
          lat: event.latitude,
          lng: event.longitude,
        },
        map,
      }));

      infowindows.push(new maps.InfoWindow({
        content: getInfoWindowString(event),
      }));
    }

    markers.forEach((marker, i) => {
      marker.addListener('click', () => {
        this.setState({lastClickedEventId: e_ids[i], lastClickedEventName: e_names[i]})
        if(infowindows[i].hasArtists) {
          infowindows[i].open(map, marker);
          console.log("Clicked an event with artists, so displaying.")
        }
        else {
          console.log("Clicked an event without artists; getting artists now.")
          infowindows[i].hasArtists = true;
          mapService.getArtistsByEvent({"event_id": e_ids[i]})
            .then(response => {
              console.log("mapService.getArtistsByEvent: ", response)
              var artistContentString = ""
              if(response.length > 0) {
                artistContentString = `
                <br>
                <div style="font-size: 16px;">
                  Artists In Attendance:
                </div>
                `
                response.forEach((artistRow) => {
                  console.log("ARTIST ROW IS: ", artistRow["artist_name"])
                  artistContentString += `
                  <div style="font-size: 16px;">
                    <a href="/artist/${artistRow["artist_name"]}">
                      ${artistRow["artist_name"]}
                    </a>
                  </div>
                  `
                })
              }
              infowindows[i].setContent(infowindows[i].getContent() + artistContentString)
              infowindows[i].open(map, marker);
            })
        }
      });
    });
    this.setState({markers: markers})
  };

  internalHandleApiLoaded(map, maps) {
    console.log("CALLED internalHandleApiLoaded")
    this.setState({map: map});
    this.setState({maps: maps})
    this.updateMap(map, maps, this.state.events, 0, this.state.pageSize)
  }

  handleChangeLat (event, newValue) {
    this.setState({latitudeRange: newValue})
    console.log("the latitudeRange is...", this.state.latitudeRange)
  }

  handleChangeLong (event, newValue) {
    this.setState({longitudeRange: newValue})
    console.log("the latitudeRange is...", this.state.longitudeRange)
  }

  handleChangeAtt(event, newValue) {
    this.setState({attRange: newValue})
  }

  handleChangeStartDate (date) {
        this.setState({startDate: date})
        console.log("the date is,,,",typeof(date))
        console.log("the year is...", date.getFullYear())
        console.log("the month is...", date.getMonth()) //This is zero index 0-11
        console.log("the day of month is...", date.getDate()) //1-31
  }

  handleChangeEndDate (date) {
    this.setState({endDate: date})
  };

  handleInputArtistChange (event) {
    console.log("happening", event.target.value)
    this.setState({inputArtist: event.target.value})
  }

  // logout() {
  //   sessionStorage.removeItem('user')
  //   this.props.setCurrUser(null)
  //   this.props.history.push("/")
  //   }
  onUserButtonClick () {
    this.props.history.push("/userprofile")
  }

  onEventButtonClick() {
    this.setState({currentlyViewingSimilar: false})
    mapService.getSimpleFilter(makeQueryParams(this.state))
      .then(response => {
        console.log("mapService.getSimpleFilter from event button: ", response)
        this.setState({events: response})
        this.setState({currentPage: 0})
        this.updateMap(this.state.map, this.state.maps, response, 0, this.state.pageSize)
      })
      mapService.getMostPopularGenres(makeQueryParams(this.state))
        .then(response => {
          console.log("mapService.getMostPopularGenres button: ", response)
          this.setState({mostPopularGenreRows: response})
        })
  }

  onSimilarButtonClick() {
    if(!this.state.lastClickedEventId) {
      return
    }
    this.setState({currentlyViewingSimilar: true, nameOfSimilarView: this.state.lastClickedEventName})
    var queryParams = {
      event_id: this.state.lastClickedEventId
    }
    mapService.getSimilarEvents(queryParams)
      .then(response => {
        console.log("mapService.getSimilarEvents button: ", response)
        this.setState({events: response})
        this.setState({currentPage: 0})
        this.updateMap(this.state.map, this.state.maps, response, 0, this.state.pageSize)
      })
      // mapService.getMostPopularGenres(makeQueryParams(this.state))
      //   .then(response => {
      //     console.log("mapService.getMostPopularGenres button: ", response)
      //     this.setState({mostPopularGenreRows: response})
      //   })
  }

  onFeedClick = () => {
    this.props.history.push("/artists")
  }

  componentDidMount() {
    console.log("CALLED COMPONENT DID MOUNT")
    this.setState({currentlyViewingSimilar: false})
    var queryParams = {
      "random_order": true,
      "left_longitude": -75,
      "right_longitude": -73,
      "top_latitude": 41,
      "bottom_latitude": 40,
      "lowest_attendance": 2
    }
    mapService.getSimpleFilter(queryParams)
      .then(response => {
        console.log("mapService.getSimpleFilter: ", response)
        this.setState({events: response})
        // this.updateMap(this.state.map, this.state.maps, response, 0, this.state.pageSize)
      })
    mapService.getMostPopularGenres(queryParams)
      .then(response => {
        console.log("mapService.getMostPopularGenres button: ", response)
        this.setState({mostPopularGenreRows: response})
      })
  }

  render() {
    return (

      <div>
    <Button value="backToArtists" onClick={this.onFeedClick}>
          Back to Artists
    </Button>
    <Button onClick={this.onUserButtonClick}>
        User profile
    </Button>
    <h1 style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
            Music Events!
    </h1>
        <Container>
            <Row>
          <div style={{display: 'inline-block'}}>
          <Button onClick={this.onEventButtonClick} style={{display: 'inline'}}>
            Get Events
          </Button>

          <Button onClick={this.onSimilarButtonClick} style={{display: 'inline'}}>
            Similar To {!this.state.lastClickedEventName ? "" : (this.state.lastClickedEventName).substring(0,  Math.min(10,(this.state.lastClickedEventName).length )) + "..."}
          </Button>

          <p>
            Current Page: {this.state.currentPage + 1} out of {Math.ceil(this.state.events.length / this.state.pageSize)}
          </p>

          <p>
          {this.state.currentlyViewingSimilar ? "Viewing similar to: " + (this.state.nameOfSimilarView).substring(0,  Math.min(10,(this.state.nameOfSimilarView).length )) + "..." : ""}
          </p>

          <Button onClick={() => this.displayPage(this.state.currentPage + 1)}>
            +
          </Button>
          <Button onClick={() => this.displayPage(this.state.currentPage - 1)}>
            -
          </Button>

          <p>
            Page size: {this.state.pageSize}
          </p>

          <Button onClick={() => this.setPageSize(this.state.pageSize + 1)}>
            +
          </Button>
          <Button onClick={() => this.setPageSize(this.state.pageSize - 1)}>
            -
          </Button>

          <p>
            Most Popular Genres
          </p>
          <Table striped>
            <tbody>
                <tr>
                    <th>
                        Genre
                    </th>
                    <th>
                        Event Count
                    </th>
                </tr>

                <tr>
                  <td>
                    {this.state.mostPopularGenreRows[0] ? this.state.mostPopularGenreRows[0].genre_name : ""}
                  </td>

                  <td>
                    {this.state.mostPopularGenreRows[0] ? this.state.mostPopularGenreRows[0].c : ""}
                  </td>
                </tr>

                <tr>
                  <td>
                    {this.state.mostPopularGenreRows[1] ? this.state.mostPopularGenreRows[1].genre_name : ""}
                  </td>

                  <td>
                    {this.state.mostPopularGenreRows[1] ? this.state.mostPopularGenreRows[1].c : ""}
                  </td>
                </tr>
                <tr>

                  <td>
                    {this.state.mostPopularGenreRows[2] ? this.state.mostPopularGenreRows[2].genre_name : ""}
                  </td>

                  <td>
                    {this.state.mostPopularGenreRows[2] ? this.state.mostPopularGenreRows[2].c : ""}
                  </td>
                </tr>
            </tbody>
        </Table>

          </div>

        <div style={{display: 'flex', margin: "auto", width: "70vh", height: '70vh', justifyContent:'center', alignItems:'center'}}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: "AIzaSyBvUVzM4USxYthkVET1J1MF2VYKz0mt4OI" }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
            yesIWantToUseGoogleMapApiInternals={true}
            onGoogleApiLoaded={({map, maps}) => this.internalHandleApiLoaded(map, maps)}
          />
        </div>
    </Row>
    </Container>
        <Typography style={{ display: "flex", "flex-direction": "column", "justify-content": "center", "align-items": "center" }} id="range-slider" gutterBottom>
        Specify Latitude
      </Typography>
        <div style={{margin:"auto", display:"flex", width:"50vh"}}>
            <Slider
            aria-labelledby="range-slider"
            value={[this.state.latitudeRange[0], this.state.latitudeRange[1]]}
            onChange={this.handleChangeLat}
            max={90}
            min={-90}
            valueLabelDisplay="auto"
            step={.1}
            marks={latMarks}
            />
        </div>
        <Typography style={{ display: "flex", "flex-direction": "column", "justify-content": "center", "align-items": "center" }} id="range-slider" gutterBottom>
        Specify Longitude
      </Typography>
        <div style={{margin:"auto", display:"flex", width:"50vh"}}>
            <Slider
            aria-labelledby="range-slider"
            value={[this.state.longitudeRange[0], this.state.longitudeRange[1]]}
            onChange={this.handleChangeLong}
            max={180}
            min={-180}
            valueLabelDisplay="auto"
            step={.1}
            marks={longMarks}
            />
        </div>
        <Typography style={{ display: "flex", "flex-direction": "column", "justify-content": "center", "align-items": "center" }} id="range-slider" gutterBottom>
        Specify # Of Artists At Events
      </Typography>
        <div style={{margin:"auto", display:"flex", width:"50vh"}}>
            <Slider
            aria-labelledby="range-slider"
            value={[this.state.attRange[0], this.state.attRange[1]]}
            onChange={this.handleChangeAtt}
            max={100}
            min={0}
            valueLabelDisplay="auto"
            step={1}
            marks={attMarks}
            />
        </div>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="space-around">
        <KeyboardDatePicker
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Start date"
          value={this.state.startDate}
        onChange={this.handleChangeStartDate}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        <KeyboardDatePicker
          margin="normal"
          id="date-picker-dialog"
          label="End date"
          format="MM/dd/yyyy"
          value={this.state.endDate}
          onChange={this.handleChangeEndDate}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </Grid>
      <Typography style={{ display: "flex", "flex-direction": "column", "justify-content": "center", "align-items": "center" }} id="range-slider" gutterBottom>
        <div>
        Specify Artist: &nbsp;
        <input value={this.inputArtist} onChange={this.handleInputArtistChange}/>
        </div>
      </Typography>

    </MuiPickersUtilsProvider>
    </div>

    );
  }
}

export default Map;
