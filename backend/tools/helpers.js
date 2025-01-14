function stringMaker(item, current, queryAdd) {
    return((item !== undefined && item !== "") ? current + " " + queryAdd + " '" + item + "' ": current);
  }

  function addPagination(query, queryParams) {
    return(( (queryParams.start != undefined) && (queryParams.number != undefined)) ? query + `
      limit ${queryParams.start}, ${queryParams.number}` : query);
  }

  function getUserCondition(artists) {
    let ret = `name = '${artists[0]}'`

    for (let i = 1; i < artists.length; i++) {
      ret += ` or name = '${artists[i]}'`
    }
    return ret
  }

  function artistQueryMaker(params) {
    genre = params.genre;
    begin_date_year = params.beginYear;
    end_date_year = params.endYear;
    artist_name = params.artistName;
    num_events = params.eventsAttended;
    listen_count = params.listenCount;
    order_by_col = params.orderCategory;
    order_by_order = params.order;

    select_from_string = "";
    if (params.userArtists) {
      console.log("nyer")
      const userCondition = getUserCondition(params.userArtists)
      const query1 = `
      With a as (
        SELECT *
        FROM artist
        WHERE ${userCondition}
        )

      `
      select_from_string = query1 + "SELECT DISTINCT a.name, a.listen_count, a.events_attended, a.begin_date_year, a.end_date_year, g.genre_name, a.summary, a.top_track FROM a INNER JOIN genre g ON a.name = g.artist_name ";
    } else {
      console.log("retweet")
    select_from_string += "SELECT DISTINCT a.name, a.listen_count, a.events_attended, a.begin_date_year, a.end_date_year, g.genre_name, a.summary, a.top_track FROM artist a INNER JOIN genre g ON a.name = g.artist_name ";
    }
    where_string = "";

    //If any of these were input, then we need a WHERE condition, else we don't
    if (genre || begin_date_year || end_date_year || artist_name || num_events || listen_count) {
      where_string += "WHERE ";
      if (genre) {
        where_string += `g.genre_name LIKE '%${genre}%' AND `;
      }

      if (begin_date_year && end_date_year) {
        where_string += `a.begin_date_year >= ${begin_date_year} AND a.end_date_year <= ${end_date_year} AND `;
      } else if (begin_date_year) {
        where_string += `a.begin_date_year >= ${begin_date_year} AND a.end_date_year <= ${new Date().getFullYear()} AND `;
      } else if (end_date_year) {
        where_string += `a.begin_date_year >= 1900 AND a.end_date_year <= ${end_date_year} AND `;
      }

      if (artist_name) {
        where_string += `a.name LIKE '%${artist_name}%' AND `;
      }

      if (num_events) {
        // For range [0,9]
        if (num_events === "Least Popular") {
          where_string += `a.events_attended >= 0 AND a.events_attended <= 9 AND `;
        } else if (num_events === "Popular") { // for range [10,20]
          where_string += `a.events_attended >= 10 AND a.events_attended <= 20 AND `;
        } else { // for range [21, inf]
          where_string += `a.events_attended >= 21 AND `;
        }
      }

      if (listen_count) {
        // For range [0,10000]
        if (listen_count === "Least Popular") {
          where_string += `a.listen_count >= 0 AND a.listen_count <= 10000 AND `;
        } else if (listen_count === "Popular") { // for range [10001,100000]
          where_string += `a.listen_count >= 10001 AND a.listen_count <= 100000 AND `;
        } else { // for range [100001, inf]
          where_string += `a.listen_count >= 100001 AND `;
      }
    }

      // get rid of leading AND
      where_string = where_string.slice(0, -4);
  }


      order_string = "";
      if (order_by_col) {
        if (order_by_col === "Choose...") {
          order_string == ""
        }
        else if (order_by_col === "Genre") {
          order_string += `ORDER BY g.genre_name `;
        }
        else if (order_by_col === "Begin Year") {
          order_string += `ORDER BY a.begin_date_year `;
        }
        else if (order_by_col === "End Year") {
          order_string += `ORDER BY a.end_date_year `;
        }
        else if (order_by_col === "Artist") {
          order_string += `ORDER BY a.name `;
        }
        else if (order_by_col === "Number of Events") {
          order_string += `ORDER BY a.events_attended `;
        }
        else if (order_by_col === "Listen Count") {
          order_string += `ORDER BY a.listen_count `;
        }

        if (order_by_order) {
          console.log("order", order_by_order)
          if (order_by_order === "Highest to Lowest") {
            order_string += `DESC `;
          }
        }
      }

      query = select_from_string + where_string + order_string + "LIMIT 100" ;
      query = query.trim()

      return(query);
    }

  function simpleQueryMaker(params) {
    left_longitude = params.left_longitude;
    right_longitude = params.right_longitude;

    bottom_latitude = params.bottom_latitude;
    top_latitude = params.top_latitude;

    earliest_date = params.earliest_date;
    latest_date = params.latest_date;

    artist = params.artist;
    include_attendance_number = params.include_attendance_number;
    lowest_attendance = params.lowest_attendance;
    highest_attendance = params.highest_attendance;


    random_order = params.random_order;
    order_by_col = params.order_by_col; //date, artist_count, long, lat
    order_by_order = params.order_by_order; //ASC or DESC

    include_attendance_number = (include_attendance_number || lowest_attendance || highest_attendance);


    join_string = `
    inner join
      lep on lep.event_id = event.id
    inner join
      place on place.id = lep.place_id`

    if(include_attendance_number || artist) {
      //not indented properly because of string
    join_string += `
    inner join
      lae on lae.event_id = event.id`
      if(artist) {
    join_string += `
    inner join
      artist on artist.name = lae.artist_name`
      }
    }

    where_string = "";
    where_string = stringMaker(left_longitude, where_string, "longitude >=");
    where_string = stringMaker(right_longitude, where_string, "AND longitude <=");

    where_string = stringMaker(bottom_latitude, where_string, "AND latitude >=");
    where_string = stringMaker(top_latitude, where_string, "AND latitude <=");

    where_string = stringMaker(earliest_date, where_string, "AND begin_date >=");
    where_string = stringMaker(latest_date, where_string, "AND begin_date <=");

    where_string = stringMaker(artist, where_string, "AND artist.name =")

    //add the where keyword and remove leading AND, if there is one
    if(where_string.length > 0) {
      where_string = where_string.trim();
      if(where_string.slice(0, 4) === "AND ") {
        where_string = where_string.slice(4);
      }
      where_string = "\n where " + where_string;
    }

    select_string = `select
      event.id e_id, event.name e_name, event.begin_date, event.end_date, place.name p_name, place.address, longitude, latitude
    `
    if(include_attendance_number) {
      select_string += `, count(artist_name) artist_count
      `
    }

    group_by_string = "";

    if(include_attendance_number) {
      group_by_string += `
      group by event.id`
    }

    having_string = "";
    having_string = stringMaker(lowest_attendance, having_string, "count(artist_name) >=");
    having_string = stringMaker(highest_attendance, having_string, "AND count(artist_name) <=");

    //add the having keyword and remove leading AND, if there is one
    if(having_string.length > 0) {
      having_string = having_string.trim();
      if(having_string.slice(0, 4) === "AND ") {
        having_string = having_string.slice(4);
      }
      having_string = "\n having " + having_string;
    }

    order_by_string = random_order ? "\norder by RAND()" : ((order_by_col) ? (`
      order by ${order_by_col} ${order_by_order}`): "");

    query = select_string +
    `from
      event` + join_string + where_string + group_by_string + having_string + order_by_string;
    query = addPagination(query, params);
    return(query);
  }

  function sendQueryResults(query, res, connection) {
    console.log(query);
    connection.query(query, (err,rows) => {
      let error = null;
      let data = null;
      var status;

      if(err) {
        console.log("Error with MySQL", err);
        error = err;
        status = 500;
      }
      else {
       // console.log(rows);
        status = 200;
        data = rows;
      }
      res
        .status(status)
        .send({data: data, error: error});
    });
  }

  module.exports= {sendQueryResults, simpleQueryMaker, addPagination, stringMaker, artistQueryMaker, getUserCondition}
