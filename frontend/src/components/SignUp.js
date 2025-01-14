import React, {useState} from 'react'
import {Form, Button, Alert} from 'react-bootstrap' 
import {useHistory} from 'react-router-dom'
import userService from '../services/userService'

const SignUp = () => {


    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [email, setEmail] = useState('')
    const history = useHistory()
    
    const linkToLogin = () => {
        history.push('/')
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            const response = await userService.registerUser(username, password, email)


            if (password !== confirm) {
                // setError(true)
                // dispatch(createMessage('passwords must match!'))
                // setTimeout(() => setError(false), 3000)
            }

            else if (response == 'ValidationError') {
                // setError(true)
                // dispatch(createMessage(`The username '${username}' is not unique, please choose another one`))
                // setTimeout(() => setError(false), 3000)
            }
            
            else if (!response) {
                // setError(true)
                // dispatch(createMessage('Theres an issue with your credentials'))
                // setTimeout(() => setError(false), 3000)
            } else {
                alert(`Succesfully created user: ${username}!`)
                setTimeout(() => {
                    history.push('/')
                }, 500)
                // dispatch(createMessage(`Succesfully created user ${username}, thanks ${name}!`))
                // setTimeout(() => {
                //     dispatch(resetMessage())
                //     setUsername('')
                //     setPassword('')
                //     history.push('/')
                // }, 500)
            }
            } catch (error) {
        //     setError(true)
        //     dispatch(createMessage('There an error'))
        //     setTimeout(() => setError(false), 3000)
        }
    }

    const spacing = {'marginTop' : '10px', 'width' : '60%'}
    //  const center = {'marginRight' : '28em'}

    return (
        <>
            <h1>
            Sign up for Music App!
            </h1>

            <Form onSubmit={handleSubmit}>


                <Form.Control
                    required
                    style={spacing}
                    type="text"
                    value={email}
                    onChange={ ({target} )=> setEmail(target.value)}
                    placeholder="Your actual name, e.g. : realemail@gmail.com"
                />

                <Form.Control
                    required
                    style={spacing}
                    type="text"
                    value={username}
                    onChange={ ({target} )=> setUsername(target.value)}
                    placeholder="username"
                />
                
                <Form.Control
                    required
                    style={spacing}
                    type="password"
                    value={password}
                    onChange={ ({target} )=> setPassword(target.value)}
                    placeholder="password"
                />
                <Form.Control
                    required
                    style={spacing}
                    type="password"
                    value={confirm}
                    onChange={ ({target} )=> setConfirm(target.value)}
                    placeholder="Confirm your password"
                />
                <Button
                    variant="primary"
                    type="submit"
                    style={spacing}
                >
                Sign Up!
                </Button>
            </Form>
            <Button style={spacing} variant="link" onClick={linkToLogin}>
                                Or go back to login
            </Button>
        </>
    )
}

export default SignUp