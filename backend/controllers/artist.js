const artistRouter = require('express').Router()


var config = require('../utils/config.js');
var mysql = require('mysql');
config.AWS_CONFIG.connectionLimit = 10;
const AWS_CONNECTION = mysql.createPool(config.AWS_CONFIG);
const helper = require('../tools/helpers')



// Goes straight to the artist's personalized page ** might need to edit route somehow 
artistRouter.get('/:name', (req, res) => {
  const name = req.params.name
  const query = `SELECT * FROM artist a join genre g ON a.name = g.artist_name where a.name = '${name}';`
  helper.sendQueryResults(query, res, AWS_CONNECTION)
})

  //Query for finding similar artists of a given artist -- Will be used solely for artists personal page.
  artistRouter.post('/findsimilar', async (req, res) => {
    query = `
    WITH similar1 AS (
      SELECT similiar_artist
      FROM similar_artist
      WHERE artist = '${req.body.artist}'
    ),
     similar2 AS (
      SELECT artist
      FROM similar_artist
      WHERE similiar_artist = '${req.body.artist}'
    ),
     similar AS (
      (SELECT * FROM similar1)
      union 
      (SELECT * FROM similar2)
    )
    SELECT * 
    FROM artist a INNER JOIN genre g ON a.name = g.artist_name
    WHERE a.name IN (SELECT * FROM similar)
    ORDER BY a.name
    LIMIT 100`
    helper.sendQueryResults(query, res, AWS_CONNECTION);
  })

  //Query for finding similar artists of some given artist, based on the genres they share, ordered by amount they share
  // Will be used for recommending artists on a users page
  artistRouter.post('/findsimilarbygenre', async (req, res) => {
    query = `
     WITH givenGenres AS (
       SELECT genre_name
       FROM genre
       WHERE artist_name = '${req.body.artist}'
     )
    SELECT g.genre_name, a.name, a.begin_date_year, a.end_date_year, a.events_attended, a.listen_count, a.top_track, a.summary, COUNT(*) AS num_shared_genres
    FROM artist a INNER JOIN genre g on a.name = g.artist_name 
    WHERE g.genre_name IN (SELECT * FROM givenGenres) AND a.name <> '${req.body.artist}'
    GROUP BY a.name, a.begin_date_year, a.end_date_year, a.events_attended, a.listen_count, a.top_track, a.summary
    ORDER BY num_shared_genres DESC
    LIMIT 15`
    helper.sendQueryResults(query, res, AWS_CONNECTION);
    })

  
artistRouter.get('/artistswithevents', (req, res) => {
    const body = req.body
    const query = "SELECT artist_name, event.name as event_name FROM lae JOIN event ON lae.event_id = event.id;"
    helper.sendQueryResults(query, res, AWS_CONNECTION)
})

artistRouter.post('/getUserArtists', (req, res) => {
  console.log("inside get ua", req.body)
  if (req.body.artists) {
    console.log("the artists are...", req.body.artists)
  const userCondition = helper.getUserCondition(req.body.artists)
  const artist = req.body.artists
  const query = `
    SELECT *
    FROM artist a join genre g on a.name = g.artist_name
    WHERE ${userCondition}
  `
  helper.sendQueryResults(query, res, AWS_CONNECTION)
  } else {
    res.status(401).send({error: "req.body.artists not found"})
  }
})



/**
 * General filter for the artist page. Has the ability to take a varying amout of 
 * arguments and filter based on those conditions.
 * Arguments include:
 * 1. Genre -- Preset list of genres, but has ability to capture majority of genres in DB.
 * 
 * 2. Date -- This is the begin date year and end date year for the artist. If a field is unspecified,
 * default begin date year is set to 1900 and default end date year is set to the current year.
 * 
 * 3. Name -- This is the name of the artist. Uses a LIKE condition, so you do not need to specify
 * the whole artist to achieve results. 
 * 
 * 4. Number of Events -- User has options of "Least Popular", "Popular", and "Most Popular" -- these correspond to different
 * ranges on the number of events an artist has attended. 
 * 
 * 5. Listen Count -- User has options of "Least Popular", "Popular", and "Most Popular" -- these correspond to different
 * ranges on the listen count of an artist.
 * 
 * 6. Ascending/Descending -- User can order the results in an ascending or descending fashion, ordered on artist name. 
 * 
 * 7. Order By Column -- Allows the user to specify on what attribute they want to order their results. 
 */

artistRouter.post('/artistfilter', async (req, res) => {
  console.log("yerpo")
  query = helper.artistQueryMaker(req.body);
  console.log("the query is...")
  helper.sendQueryResults(query, res, AWS_CONNECTION);
})

//Query for finding a specific artist by name
artistRouter.post('/searchartist', async (req, res) => {
  console.log(req.body)
  query = `
  select * 
  from artist
  WHERE name LIKE '%${req.body.artist}%'`
  helper.sendQueryResults(query, res, AWS_CONNECTION);
})

//The data we will pull upon intially loading the artists page.
artistRouter.get('/', async (req, res) => {
  console.log("yes.")
  query = `
  with t as (
  select DISTINCT a.name, a.listen_count, a.events_attended, a.begin_date_year, a.end_date_year, g.genre_name, a.summary, a.top_track
  from artist a
  join genre g
  on a.name = g.artist_name
  )
  select  DISTINCT name, listen_count, events_attended, begin_date_year, end_date_year, genre_name, summary, top_track
  from t
  ORDER BY RAND()
  LIMIT 100
  `
  helper.sendQueryResults(query, res, AWS_CONNECTION);
})

module.exports = artistRouter