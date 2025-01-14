import React, {useState, useEffect} from 'react'
import artistService from '../services/artistService'
import userService from '../services/userService'
import {Button} from 'react-bootstrap'
const TableArtist = ({artist, inprofile, setRecArtist, setRecArtists}) => {
    let user = JSON.parse(sessionStorage.getItem('user'))
    const def = !user.artists ? false : (user.artists.find(a1=> a1 === artist.name))
    const [containsArtist, setContainsArtist] = useState(def)
    const addArtist = () => {
        user = JSON.parse(sessionStorage.getItem('user'))
        console.log("the artist clicked on is....", artist)
        console.log("the user array of artists is....", user.artists)
        if (containsArtist) {
            let newArtists = user.artists.filter(a1 => a1 !== artist.name)
            user.artists = newArtists
            setContainsArtist(false)
            userService.removeArtist(artist.name)
        } else {
            user.artists.push(artist.name)
            setContainsArtist(true)
            userService.addArtist(artist.name)
        }
        console.log("after add the user array of artists is....", user.artists)
        sessionStorage.setItem('user', JSON.stringify(user))
    }
    const handleRecs = () => {
        setRecArtist(artist)
        artistService.getRecArtists(artist).then(response=> {
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

    return (
        <>
        <tr>
        <td>
            <a href={`/artist/${artist.name}`}>
            {artist.name}
            </a>
        </td>
        <td>
            {artist.genre_name}
        </td>
        <td>
            {artist.listen_count}
        </td>
        <td>
            {artist.top_track}
        </td>
        <td>
            {artist.begin_date_year}
        </td>
        <td>
            {artist.end_date_year}
        </td>
        <td>
            {!containsArtist && <input type="button" value="Add artist" onClick={addArtist}/>}
            {containsArtist && <input type="button" value="Remove artist" onClick={addArtist}/>}
        </td>
        {inprofile && 
        <td>
            <Button onClick={handleRecs}>
                See more like this
            </Button>
        </td>
        }
        </tr>
        </>
    )
}

export default TableArtist