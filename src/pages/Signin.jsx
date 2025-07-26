import { useState } from 'react'

function Signin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return(
        <div class=''>
            <form>
                <h2>Signin</h2>
                <div>
                    <div>
                        <label for='username'></label>
                        <input id='username'
                            placeholder='Username'
                            value={username}
                            type='text'
                        />
                    </div>
                    <div>
                        <label for='username'></label>
                        <input id='username'
                            placeholder='Username'
                            value={username}
                            type='password'
                        />
                    </div>
                    <button type='submit'>Signin</button>
                </div>
            </form>
        </div>
    )
}

export default Signin