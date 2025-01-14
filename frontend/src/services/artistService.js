import axios from 'axios'
const baseUrl = '/api/artist/'

const getAllArtists = async () => {
    try {
        const response = await axios.get(baseUrl)
        console.log("response.data", response)
        return response.data.data
    }
    catch (e) {
        console.log("getAllArtists", e)
    }

}

const getUserArtists = async () => {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'))
        console.log("the user is getua frontend", user)
        const body = {
            artists : user.artists
        }
        console.log("the body", body)
        const response = await axios.post(baseUrl + "getUserArtists", body)
        console.log("(getUserARtists) response.data", response)
        return response.data.data
    }
    catch (e) {
        console.log("getUserArtist", e)
    }
}

const getFilteredArtist = async (info) => {
    try {
        console.log("(35) getfiltered artist")
        const url = baseUrl + "artistfilter"
        const response = await axios.post(url, info)
        return response.data.data
    }
    catch (e) {
    console.log("error in getFilteredArtist...", e)
    }
}

const getRecArtists = async (artist) => {
    try {
        const url = baseUrl + "findsimilarbygenre"
        const data = {
            artist : artist.name
        }
        console.log("the data", data)

        const response = await axios.post(url, data)
        return response.data.data
    }
    catch (e) {
        console.log("error in getRecArtists...", e)
        }
}

const getSingleArtist = async (info) => {
    try {
        // info = info.replace("%20", " ");
        const url = baseUrl + info
        console.log("url", url)
        const response = await axios.get(url)
        console.log("data", response.data.data)
        let arrayOfArtists = response.data.data
        if (Array.isArray(arrayOfArtists)) {
            arrayOfArtists = arrayOfArtists[0]
        }
        return arrayOfArtists
    }
    catch (e) {
    console.log("error in login...", e)
    }
}
const getSimilarArtists = async (artist) => {
    try {
        const url = baseUrl + "findsimilar"
        const data = {
            artist : artist.name
        }
        const response = await axios.post(url, data)
        console.log("RESPONSE", response.data.data)
        return response.data.data
    }
    catch (e) {
        console.log("error in getRecArtists...", e)
        }
}

export default {getAllArtists, getUserArtists, getFilteredArtist, getSingleArtist, getRecArtists, getSimilarArtists}