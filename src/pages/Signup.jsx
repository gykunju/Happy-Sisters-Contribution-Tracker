import { useState } from 'react'

function Signup() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSignup(e){
        e.preventDefault()
        const [firstName, lastName] = fullName.split(" ")
        formData = {
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        }

    }

    return(
        <div class=''>
            <form>
                <h2>Signup</h2>
                <div>
                    <div>
                        <label htmlFor='fullName'>Full Name</label>
                        <input id='fullName'
                            placeholder='Enter Full Name'
                            value={fullName}
                            type='text'
                            onChange={setFullName}
                        />
                    </div>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input id='email'
                            placeholder='Enter Email'
                            value={email}
                            type='text'
                            onChange={setEmail}
                        />
                    </div>

                    <div>
                        <label for='password'>Password</label>
                        <input id='password'
                            placeholder='Enter Password'
                            value={password}
                            type='password'
                            onChange={setPassword}
                        />
                    </div>
                    <button type='submit'>Signup</button>
                </div>
            </form>
        </div>
    )
}

export default Signup