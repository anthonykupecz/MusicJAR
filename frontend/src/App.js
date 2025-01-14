import React, { useState, useEffect, useRef } from 'react'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Artists from './components/Artists'
import User from './components/User'
import ArtistProfile from './components/ArtistProfile'
import login from './services/loginService'
import artistService from './services/artistService'
import Map from './components/Map'

import {
  BrowserRouter,
  Switch,
  Route,
  useRouteMatch,
  useHistory
} from 'react-router-dom'


const App = () => {
 // const [songs, setSongs] = useState([])
 const history = useHistory()
  const [users, setUsers]= useState([])
  const [currUser, setCurrUser] = useState(null)
  const fromSession = JSON.parse(sessionStorage.getItem('artists'))
  const def = !fromSession ? [] : fromSession
  const [artists, setArtists] = useState(def)
  const artistMatch = useRouteMatch('/artist/:name')
  const [clickedArtist, setClickedArtist] = useState(null)
  const didMountRef = useRef(false)
  // useEffect(() => {
  //   songService.getAllSongs()lk
  //   .then(response => {
  //     setSongs(response)
  //   })
  // }, [])
  useEffect(() => {
    console.log("CALLING THE FIRST USE EFFECT:", artists)
    
    artistService.getAllArtists()
    .then(response => {
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
        sessionStorage.setItem("artists", JSON.stringify(inter[1]))
      })
  }, [])
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    console.log("the user is...", user)
    if (user) {
      setCurrUser(user)
    }
  }, [])
  
  // //THIS IS GETTING CALLED HELLLLLLA
  // if (didMountRef.curr && artistMatch) {
  //  // artistService.getSingleArtist(artistMatch.params.name).then(res=> {
  //    // console.log("res is...", res[0].name)
  //    console.log("matched!")
  //    setClickedArtist(artistMatch.params.name)
  //  // })
  // }
  useEffect(() => {
      if (didMountRef.current) {
        if (artistMatch) {
          console.log("matched! params: ", artistMatch.params.name)
          setClickedArtist(artistMatch.params.name)
        }
      } else {
        didMountRef.current = true
      }
  })
  if (!currUser) {
    return (
    <>
    <div className="container">
        <Switch>
            <Route path="/signup">
                    <SignUp/>
            </Route>
            <Route path="/">
                    <Login
                    setCurrUser={setCurrUser}
                    />
            </Route>
        </Switch>
        </div>
    </>
    )
  } else {
    // console.log("here???", songs)
    // return (
    //   <Songs
    //   songs={songs}
    //   />
    // )
    return(
    <div className="container">
      <Switch>
      <Route path="/artist/:name">
              <ArtistProfile artistName={clickedArtist}/>
        </Route>
        <Route path="/artists">
          <Artists artists={artists} setArtists={setArtists} setCurrUser={setCurrUser}/> 
        </Route>
        <Route path="/userprofile">
          <User setCurrUser={setCurrUser} currUser={currUser}/>
        </Route>
        <Route path="/map">
          <Map history={history} setCurrUser={setCurrUser}  />
        </Route>
        <Route path="/">
          <Artists artists={artists} setArtists={setArtists} setCurrUser={setCurrUser}/>
        </Route>
      </Switch>
    </div>

    )
  }

}


export default App;