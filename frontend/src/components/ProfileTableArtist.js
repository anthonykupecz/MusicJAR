import React, {useState, useEffect} from 'react'
import artistService from '../services/artistService'
import userService from '../services/userService'
import {Button} from 'react-bootstrap'
const ProfileTableArtist = ({artist, inprofile, setRecArtist, setRecArtists}) => {
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


    return (
        <>
        <tr>
        <td>
            <a href={`/artist/${artist.name}`} style={{ color: '#FFF' }}>
            {artist.name}
            </a>
        </td>
        <td style={{ color: '#FFF' }}>
            {artist.genre_name}
        </td>
        <td style={{ color: '#FFF' }}>
            {artist.listen_count}
        </td>
        <td style={{ color: '#FFF' }}>
            {artist.top_track}
        </td>
        <td style={{ color: '#FFF' }}>
            {artist.begin_date_year}
        </td>
        <td style={{ color: '#FFF' }}>
            {artist.end_date_year}
        </td>
        <td>
            {!containsArtist && <input type="button" value="Add artist" onClick={addArtist}/>}
            {containsArtist && <input type="button" value="Remove artist" onClick={addArtist}/>}
        </td>
        </tr>
        </>
    )
}

export default ProfileTableArtist