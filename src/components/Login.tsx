import { useState, useEffect } from "react";
import { useUserContext } from './Context';

export default function Login(): React.JSX.Element {

    const { loginUser } = useUserContext();

    const [message, setMessage] = useState<string | null>(null);

    const [intro, setIntro] = useState<boolean>(true);

    useEffect(() => {

        setTimeout(() => {

            setIntro(false);

        }, 1200);

    }, []);

    const [formFields, setFormFields] = useState<FormFields>(
        {
            username: '',
            password: ''
        }
    );

    function formChange(event: React.ChangeEvent<HTMLInputElement>): void {

        const {name, value} = event.target;

        setFormFields(prevFormFields => {
            return {
                ...prevFormFields,
                [name]: value
            }
        });

    }

    // Handle enter key press on forms

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {

        if(event.key === "Enter"){

            sendLogin();

        }

    }

    const sendLogin = async(): Promise<void> => {

        setMessage(null);

        //event.preventDefault();

        if(!formFields.username || !formFields.password){

            setMessage('Proszę wypełnić oba pola');

        } else {

            const button = document.getElementById('login-button');

            if(button){

                button.setAttribute("disabled", "disabled");

            }

            const data: UserData = await loginUser(formFields);

            if(data.token){

                setMessage("Logowanie udane.");

            } else {

                const message = data.message ? data.message : 'Nieznany błąd. Spróbuj później.';

                setMessage(message);

            }

            if(button){

                button.removeAttribute("disabled");

            }

        }

    }

    return (
        <>
            {intro && <div id="intro-outer-container">
                <div id="intro-inner-container">
                </div>
            </div>}
            {!intro &&
                <div id="login-outer-container">
                    <div id="login-inner-container">
                        <div id="login-inner-1">
                            <div id="login-inner-2">
                                <div id="login">
                                    <div className="login-field">
                                        <input 
                                            className="login-form"
                                            id="username"
                                            type="text"
                                            onChange={formChange}
                                            onKeyDown={handleKeyDown}
                                            name="username"
                                            value={formFields.username}
                                            placeholder="Nazwa użytkownika"
                                        />
                                    </div>
                                    <div className="login-field">
                                        <input 
                                            className="login-form"
                                            id="password"
                                            type="password"
                                            onChange={formChange}
                                            onKeyDown={handleKeyDown}
                                            name="password"
                                            value={formFields.password}
                                            placeholder="Hasło"
                                        />
                                    </div>
                                    <p id="login-button-wrapper">
                                        <button id="login-button" onClick={sendLogin}><span id="send-login-text">Zaloguj się</span></button>	
                                        {message && <span id="login-message">{message}</span>}
                                    </p>
                                </div>
                            </div>
                            <div id="login-background">
                                <span id="login-background-shape4" className="login-background-shape"></span>
                                <span id="login-background-shape3" className="login-background-shape"></span>		
                                <span id="login-background-shape2" className="login-background-shape"></span>
                                <span id="login-background-shape1" className="login-background-shape"></span>
                            </div>		
                        </div>
                    </div>
                </div>
            }
        </>
    );
};