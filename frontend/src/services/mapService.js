import axios from 'axios'
const baseUrl = '/api/map/'

const getSimpleFilter = async (queryParams) => {
    try {
        console.log("queryParams is: ", queryParams)
        const response = await axios.post(baseUrl + 'simplefilter', queryParams)
        console.log("simple filter response: ", response)
        return response.data.data
    }
    catch (e) {
        console.log("error with getSimpleFilter: ", e)
    }
}

const getArtistsByEvent = async (queryParams) => {
  try {
    const response = await axios.post(baseUrl + "artistsbyevent", queryParams)
    return response.data.data
  }
  catch (e) {
    console.log("error with getArtistsByEvent: ", e)
  }
}

const getMostPopularGenres = async (queryParams) => {
  try {
    const response = await axios.post(baseUrl + "mostpopulargenres", queryParams)
    return response.data.data
  }
  catch (e) {
    console.log("error with mostpopulargenres: ", e)
  }
}

const getSimilarEvents = async (queryParams) => {
  try {
    const response = await axios.post(baseUrl + "eventtoevent", queryParams)
    return response.data.data
  }
  catch (e) {
    console.log("error with eventtoevent: ", e)
  }
}

export default {getSimpleFilter, getArtistsByEvent, getMostPopularGenres, getSimilarEvents}
