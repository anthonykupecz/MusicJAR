const mapRouter = require('express').Router()

var config = require('../utils/config.js');
var mysql = require('mysql');
config.AWS_CONFIG.connectionLimit = 10;
const AWS_CONNECTION = mysql.createPool(config.AWS_CONFIG);
console.log("the aws connection is...", AWS_CONNECTION)
const helper = require('../tools/helpers')

mapRouter.post('/simplefilter', async (req, res) => {
  query = helper.simpleQueryMaker(req.body);
  helper.sendQueryResults(query, res, AWS_CONNECTION);
})

mapRouter.post('/mostpopulargenres', async (req, res) => {
  baseQuery = helper.simpleQueryMaker(req.body);
  fullQuery = `
  with baseQuery as (${baseQuery})
  select genre_name, count(genre_name) c
  from baseQuery
  inner join lae on lae.event_id = baseQuery.e_id
  inner join genre on genre.artist_name = lae.artist_name
  group by genre_name
  order by c DESC`
  helper.sendQueryResults(fullQuery, res, AWS_CONNECTION);
})

mapRouter.post('/artistsbyevent', async (req, res) => {
  query = `select artist_name from event inner join lae on lae.event_id = event.id inner join artist on artist.name = lae.artist_name where event.id = ${req.body.event_id}`
  helper.sendQueryResults(query, res, AWS_CONNECTION);
})

mapRouter.post('/eventtoevent', async (req, res) => {
  //given an event_id, find all other events that include any artists from this event, ordered by most artists included to least
  baseQuery = `
  select secondLae.event_id se_id, count(secondLae.event_id) c_se_id
  from lae firstLae
  inner join lae secondLae
  on secondLae.artist_name = firstLae.artist_name
  where firstLae.event_id = ${req.body.event_id}
  group by se_id
  order by c_se_id DESC
  `
  query = `
  with baseQuery as (${baseQuery})
  select distinct se_id as e_id, event.name e_name, event.begin_date, event.end_date, place.address, place.latitude, place.longitude, c_se_id
  from baseQuery
  inner join event
    on event.id = baseQuery.se_id
  inner join lep
    on lep.event_id = baseQuery.se_id
  inner join place
    on place.id = lep.place_id
  order by c_se_id DESC
  `
  helper.sendQueryResults(query, res, AWS_CONNECTION);
})

module.exports = mapRouter
