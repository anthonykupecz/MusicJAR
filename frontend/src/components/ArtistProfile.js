import React, { useState, setState, useEffect, useRef } from 'react'
//import ErrorMessage from './ErrorMessage'
import {Form, Button, Alert, Table, Grid, Row, Col} from 'react-bootstrap' 
import {
    useHistory
    , Link
} from 'react-router-dom'
import artistService from '../services/artistService'
import ProfileTableArtist from './ProfileTableArtist'


const ArtistProfile = ({artistName}) => {
    console.log("within", artistName)

  const [artist, setArtist] = useState(null)
  const [similar, setSimilar] = useState([])
  const didMountRef = useRef(false)
  const history = useHistory()

  const onFeedClick = () => {
    history.push("/artists")
  }
  useEffect(() => {
      if (didMountRef.current) {
          if (artistName && !artist) {
            console.log("the artistname is...", artistName)
            artistService.getSingleArtist(artistName)
            .then(res => {
                console.log("getsingle artist", res)
                setArtist(res)
            })
    }
    } else {
        didMountRef.current = true
    }
    })
  const seeSimilar = () => {
    artistService.getSimilarArtists(artist)
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
        setSimilar(inter[1])
        console.log("similiar is ", inter[1])
    })
  }

  if (artist) {
    const summaryArr = artist.summary.split("<a href=")
    const summary = summaryArr[0]
    const link = summaryArr[1].split(">")[0]

    // artistService.getSimilarArtists(artist).then(response => {
    //   let inter = response.reduce((acc, item) => {
    //     if (!acc[0].includes(item.name)) {
    //       acc[0].push(item.name)
    //       if (item.end_date_year == "0000") {
    //         item.end_date_year = "N/A"
    //       }
    //       acc[1].push(item)
    //     }
    //     return acc
    //   }, [[],[]])

    //   inter[1].sort((a, b) => {
    //     return b.listen_count - a.listen_count
    //   })
    //   setSimilar(inter[1])
    // })

  return (
      <>
      <style></style>
      <body style={{backgroundColor: "royalblue"}}>
      <Button value="backToArtists" onClick={onFeedClick}>
          Back to Artists...
      </Button>
      
      <a href='/map'>
        <Button>
          Check out the Map
        </Button>
      </a>
      
      <b><h1 style={{color: "gold", textAlign: "center"}} >{artist.name}</h1></b>
      <br></br>

      <div>
      <h2 style= {{color:"gold"}}>Summary:</h2>
      <p style={{border:"3px", borderStyle: "solid", borderColor:"black", padding: "1em" ,color: 'khaki' }}>
      {summary}
      <br></br>
      <br></br>
      <a href={link} style={{ color: '#FFF' }}> <b>Click here to learn more.</b></a>
      </p>
      </div>
      <hr></hr>
      <h2 style= {{color:"gold"}}>Information:</h2>

      <div>
      <h3 style= {{color:"khaki", fontFamily: 'Times New Roman'}}>Artist: {artist.name}</h3>
      <hr style={{
            color: "red",
            backgroundColor: "black",
            height: 3
        }}></hr>
      <h4 style= {{color:"khaki"}}>Genre: {artist.genre_name}</h4>
      <hr style={{
            color: "red",
            backgroundColor: "black",
            height: 3
        }}></hr>
      <h4 style= {{color:"khaki"}}>Formation Year: {artist.begin_date_year}</h4>
      <hr style={{
            color: "red",
            backgroundColor: "black",
            height: 3
        }}></hr>
      <h4 style= {{color:"khaki"}}>Monthly Listen Count: {artist.listen_count}</h4>
      <hr style={{
            color: "red",
            backgroundColor: "black",
            height: 3
        }}></hr>
      <h4 style= {{color:"khaki"}}>Top Track: {artist.top_track}</h4>
      <hr style={{
            color: "red",
            backgroundColor: "black",
            height: 3
        }}></hr>
        </div>
      <div>
      <h2 style= {{color:"gold"}}>Similar Artists:</h2>
      <Button value="seeSimilar" onClick={seeSimilar}>
          See similar artists.
      </Button>
      <Table striped>
      <tbody>
            <tr>
                <th style= {{color:"khaki"}}>
                    Artist
                </th>
                <th style= {{color:"khaki"}}>
                    Genre
                </th>
                <th style= {{color:"khaki"}}>
                    Listen Count
                </th>
                <th style= {{color:"khaki"}}>
                    Top Track
                </th>
                <th style= {{color:"khaki"}}>
                    Begin Date
                </th>
                <th style= {{color:"khaki"}}>
                    End Date
                </th>
                <th style= {{color:"khaki"}}>
                    Like
                </th>
            </tr>
            {similar.map(
                (artist1) => 
                    <ProfileTableArtist artist={artist1}/>
            )}
        </tbody>
        </Table>

      </div>
      </body>
      </>
  )
  }
  else {
    return (
      <>
      </>
    )
  }
}

export default ArtistProfile