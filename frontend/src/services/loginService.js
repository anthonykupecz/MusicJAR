import axios from 'axios'
import userService from './userService'
import songService from './songService'
const baseUrl = '/api/login'

const login = async (username, password) => {
    const formData = {
        username : username,
        password : password
    }
        try {
        const response = await axios.post(baseUrl, formData)
        const user = response.data
        console.log("the login data is...", response)
        sessionStorage.setItem('user', JSON.stringify(user))
       // songService.setToken(user.token)
        return user
        }
        catch(error) {
            console.log("error in login...", error)
            return null;
        }
}

export default { login }