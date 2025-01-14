import React, {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import artistService from '../services/artistService'
import TableArtist from './TableArtist'
import {Form, Button, Alert, Table, Grid, Row, Col} from 'react-bootstrap' 
import RecCompontent from './RecComponent'
/*
    useState returns an array where the first element represents the thing that gets modified on a call to setArtists

    setArtist(['1', '2']) --> this changes artists to ['1', '2']. Cant do artists = ['1', '2'].


*/


const User = ({setCurrUser, currUser}) => {
  const [artists, setArtists] = useState([])
  const [recArtists, setRecArtists] = useState([])
  const [recArtist, setRecArtist] = useState([])
  const history = useHistory()
  var [beginYear, setBeginYear] = useState([])
  var [endYear, setEndYear] = useState([])
  var [artistName, setArtistName] = useState([])
  var [genre, setGenre] = useState([])
  var [eventsAttended, setEventsAttended] = useState([])
  var [listenCount, setListenCount] = useState([])
  var [orderCategory, setOrderCategory] = useState([])
  var [order, setOrder] = useState([])



  const generateRandomArtist = (artists) => {
    if(artists.length == 0) {
      return(null)
    }
    const randomArtist = artists[Math.floor(Math.random() * artists.length)]
    console.log("the artists",)
    console.log("hi! im the random artists", randomArtist)
    setRecArtist(randomArtist)
    artistService.getRecArtists(randomArtist).then(response=> {
        let inter = response.reduce((acc, item) => {
            if (!acc[0].includes(item.name)) {
                acc[0].push(item.name)
                if (item.end_date_year == "0000") {
                    item.end_date_year = "N/A"
                }
                acc[1].push(item)
            }
            return acc
        }, [[], []])
        inter[1].sort((a, b) => {
           return b.listen_count - a.listen_count
        })
        setRecArtists(inter[1])
    })
}

const handleSubmit = () => {
    if (artistName.length == 0) {
        artistName = null
    }
    if (beginYear.length == 0) {
      beginYear = null
    }
    if (endYear.length == 0) {
      endYear = null
    }
    if (genre.length == 0) {
      genre = null
    }
    if (eventsAttended.length == 0) {
      eventsAttended = null
    }
    if (listenCount.length == 0) {
      listenCount = null
    }
    if (orderCategory.length == 0) {
      orderCategory = null
    }
    if (order.length == 0) {
      order = null
    }
    const data = {
        artistName: artistName,
        beginYear: beginYear,
        endYear: endYear,
        genre: genre,
        eventsAttended: eventsAttended,
        listenCount: listenCount,
        orderCategory: orderCategory,
        order: order,
        userArtists : artists.map(a => a.name)
    }

    artistService.getFilteredArtist(data)
    .then(response => {
        console.log("the response is...", response)
        let inter = response.reduce((acc, item) => {
            if (!acc[0].includes(item.name)) {
                acc[0].push(item.name)
                if (item.end_date_year == "0000") {
                    item.end_date_year = "N/A"
                }
                if (item.genre_name === "") {
                  item.genre_name = "N/A"
              }
                acc[1].push(item)
            }
            return acc
        }, [[], []])
        inter[1].sort((a, b) => {
           return b.listen_count - a.listen_count
        })
        setArtists(inter[1])
    })
}



  useEffect(() => {
    artistService.getUserArtists()
    .then(response => {
        let inter = response.reduce((acc, item) => {
            if (!acc[0].includes(item.name)) {
                acc[0].push(item.name)
                if (item.end_date_year == "0000") {
                    item.end_date_year = "N/A"
                }
                acc[1].push(item)
            }
            return acc
        }, [[], []])
        inter[1].sort((a, b) => {
           return b.listen_count - a.listen_count
        })
        console.log("inter1 is.,.", inter[1])
        setArtists(inter[1])
        if (inter[1].length > 0) generateRandomArtist(inter[1])
    })
  }, [])

//   useEffect(() => {
//     const randomArtist = artists[Math.floor(Math.random() * artists.length)]
//     console.log("the artists",)
//     console.log("hi! im the random artists", randomArtist)
//     setRecArtist(randomArtist)
//     artistService.getRecArtists(randomArtist).then(response=> {
//         let inter = response.reduce((acc, item) => {
//             if (!acc[0].includes(item.name)) {
//                 acc[0].push(item.name)
//                 if (item.end_date_year == "0000") {
//                     item.end_date_year = "N/A"
//                 }
//                 acc[1].push(item)
//             }
//             return acc
//         }, [[], []])
//         inter[1].sort((a, b) => {
//            return b.listen_count - a.listen_count
//         })
//         setRecArtists(inter[1])
//     })
//     }, [])

  const logout = () => {
      sessionStorage.removeItem('user')
      setCurrUser(null)
      history.push("/")
  }
  const onFeedClick = () => {
    history.push("/artists")
  }


  const spacing = {'marginTop' : '10px', 'width' : '60%'}


  return (
      <>
      <h2>Here are the artists for: <em>{currUser.username}</em></h2>
      <Button value="backToArtists" onClick={onFeedClick}>
          Back to Artists
      </Button>

      <a href='/map'>
        <Button>
          Check out the Map
        </Button>
      </a>

      <Button value="logout" onClick={logout}>
          logout
      </Button>
      <Form>
      <Form.Row>
          <Form.Group as={Col} controlId="ArtistName">
          <Col sm={10} xs="auto">
          <Form.Label>Artist:</Form.Label>
          <Form.Control
          size="sm"
          type="text"
          value={artistName}
          onChange={ ({target} )=> setArtistName(target.value)}
          onKeyPress={handleSubmit}
          placeholder="Please enter an artist name..." />
          </Col>
          </Form.Group>

          <Form.Group as={Col} controlId="GenreName">
          <Col sm={10} xs="auto">
          <Form.Label>Genre:</Form.Label>
          <Form.Control
          size="sm"
          type="text"
          value={genre}
          onChange={ ({target} )=> setGenre(target.value)}
          onKeyPress={handleSubmit}
          placeholder="Please enter a genre...." />
          </Col>
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="beginYear">
              <Col sm={10}>
          <Form.Label>Begin Year:</Form.Label>
          <Form.Control
          size="sm"
          type="number"
          placeholder="Please enter a start year i.e. 1995"
          value={beginYear}
          onChange={ ({target} )=> setBeginYear(target.value)}
          />
          </Col>
          </Form.Group>

          <Form.Group as={Col} controlId="endYear">
              <Col sm={10}>
          <Form.Label>End Year:</Form.Label>
          <Form.Control
           size="sm"
           type="number"
           placeholder="Please enter an end year i.e. 2010"
           value={endYear}
           onChange={ ({target} )=> setEndYear(target.value)}
          />
          </Col>
          </Form.Group>

        </Form.Row>

      <Form.Row>
      <Form.Group as={Col} controlId="EventsAttended">
        <Col sm={10}>
          <Form.Label>Number of Events Attended:</Form.Label>
          <Form.Control
          size="sm"
          as="select"
          defaultValue="Choose..."
          value={eventsAttended}
          onChange={ ({target} )=> setEventsAttended(target.value)}
          >
          <option>Choose...</option>
          <option>Most Popular</option>
          <option>Popular</option>
          <option>Least Popular</option>
          </Form.Control>
          </Col>
          </Form.Group>

          <Form.Group as={Col} controlId="ListenCount">
          <Col sm={10}>
          <Form.Label>Listen Count:</Form.Label>
          <Form.Control
          size="sm"
          as="select"
          defaultValue="Choose..."
          value={listenCount}
          onChange={ ({target} )=> setListenCount(target.value)}
          >
          <option>Choose...</option>
          <option>Most Popular</option>
          <option>Popular</option>
          <option>Least Popular</option>
          </Form.Control>
          </Col>
          </Form.Group>
      </Form.Row>

        <Form.Row>
        <Form.Group as={Col} controlId="OrderCategory">
        <Col sm={10}>
        <Form.Label>Order On:</Form.Label>
          <Form.Control
          size="sm"
          as="select"
          defaultValue="Choose..."
          value={orderCategory}
          onChange={ ({target})=> setOrderCategory(target.value) }
          >
          <option>Choose...</option>
          <option>Artist</option>
          <option>Genre</option>
          <option>Begin Year</option>
          <option>End Year</option>
          <option>Number of Events</option>
          <option>Listen Count</option>
          </Form.Control>
          </Col>
          </Form.Group>

       <Form.Group as={Col} controlId="Order">
       <Col sm={10}>
       <Form.Label>Order By:</Form.Label>
          <Form.Control
          size="sm"
          as="select"
          defaultValue="Choose..."
          value={order}
          onChange={ ({target})=> setOrder(target.value)}
          >
          <option>Choose...</option>
          <option>Highest to Lowest</option>
          <option>Lowest to Highest</option>
          </Form.Control>
          </Col>
          </Form.Group>
        </Form.Row>
      </Form>

      <Button onClick={handleSubmit} variant="primary" type="submit">
          Search:
      </Button>
      <Table striped>
        <tbody>
            <tr>
                <th>
                    Artist
                </th>
                <th>
                    Genre
                </th>
                <th>
                    Listen Count
                </th>
                <th>
                    Top Track
                </th>
                <th>
                    Begin Date
                </th>
                <th>
                    End Date
                </th>
                <th>
                    Like
                </th>
                <th>
                    Get recs
                </th>
            </tr>
            {artists.map(
                (artist) =>
                    <TableArtist artist={artist} inprofile={true} setRecArtists={setRecArtists} setRecArtist={setRecArtist}/>
            )}
        </tbody>
    </Table>
    {recArtist && <RecCompontent recArtist={recArtist} recArtists={recArtists}  setRecArtists={setRecArtists} setRecArtist={setRecArtist}/>}
      </>

  )
}

export default User
