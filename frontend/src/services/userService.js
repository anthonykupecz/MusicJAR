import axios from 'axios'
const baseUrl = '/api/users'

const getAllUsers = async () => {
    try {
        const response = await axios.get(baseUrl)
        return response.data
    } catch (error)  {
        console.log(error.message)
    }
}

const registerUser = async (username, password, email) => {
    try {
        const body = {
            username, password, email
        }
        const response = await axios.post(baseUrl, body)
        return response.data

    } catch (e) {
        if (e.response.data.error === 'ValidationError') {
            return e.response.data.error
        } else {
            return undefined
        }
    }
}

const addArtist = async (artistName) => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    try {
        const body = {
            artistName : artistName,
            add : true
        }
        console.log("(addArtist) the user id is", user.id)
        const response = await axios.put(baseUrl + "/" + user.id.toString(), body)
        return response.data
    } catch (error)  {
        console.log(error.message)
    }
}

const removeArtist = async (artistName) => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    try {
        const body = {
            artistName : artistName,
            add : false

        }
        const response = await axios.put(baseUrl + "/" + user.id.toString(), body)
        return response.data
    } catch (error)  {
        console.log(error.message)
    }
}

export default {getAllUsers, registerUser, addArtist, removeArtist}