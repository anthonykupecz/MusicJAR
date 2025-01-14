import React, { useState, setState } from 'react'
//import ErrorMessage from './ErrorMessage'
import { Form, Button, Alert } from 'react-bootstrap'
import {
    useHistory
    , Link
} from 'react-router-dom'
import loginService from '../services/loginService'


const Login = ({setCurrUser}) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const history = useHistory()

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const user = await loginService.login(username, password)
            console.log("after logining in the user is...", user)
            if (!user) {
                alert("wrong credentials");
                setUsername('')
                setPassword('')
            }
            else {
                console.log("the user after logining in is...", user)
                alert("success!")
                const songUser = JSON.parse(sessionStorage.getItem('user'))
                setCurrUser(songUser)
                history.push('/map')
            }
        } catch(e) {
            console.log("the login error is...", e)
            alert("wrong credentials");
        }

    }
    const spacing = {'marginTop' : '10px', 'width' : '60%'}
    const center = {'marginRight' : '28em'}
    return (
        <>
            <h1 >Login to Music App!</h1>
            <div>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        
                        <Form.Control
                            style={spacing}
                            type="text"
                            name="username"
                            onChange={({target}) => setUsername(target.value)}
                            value={username}
                            placeholder="Enter username"
                        />
                        <Form.Control
                            style={spacing}
                            name="password"
                            type="password"
                            value={password}
                            onChange={({ target }) => setPassword(target.value)}
                            placeholder="Enter Password"
                            id="password"
                        />
                        <div>
                            <Button style={spacing} variant="primary" type="submit">
                             login
                            </Button>
                            <div className="text-center" style={center}>
                                <Link to='/signup'>
                                    <div>
                                Not a user?
                                    </div>
                                    <div>Sign up for Music Generator
                                    </div> 
                                </Link>
                            </div>
                
                        </div>
                    </Form.Group>
                </Form>
            </div>
        </>
    )
}

export default Login
