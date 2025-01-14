import React, {useState, useEffect} from 'react'
import TableArtist from './TableArtist'
import {Form, Button, Alert, Table, Grid, Row, Col} from 'react-bootstrap' 
const RecCompontent = ({recArtists, recArtist,setRecArtist, setRecArtists}) => {
    return (
        <>
        <h2>Because you liked <em> <p style={{color : "blue", display: "inline"}}><a href={`artist/${recArtist.name}`}>{recArtist.name}</a></p></em></h2>
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
                {recArtists.map(
                    (artist) => 
                    <TableArtist artist={artist} inprofile={true} setRecArtists={setRecArtists} setRecArtist={setRecArtist}/>
                )}
            </tbody>
        </Table>
        </>
    )
}
export default RecCompontent