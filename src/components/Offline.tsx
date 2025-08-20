import ErrorIcon from '../images/error2.png';

export default function Offline(): React.JSX.Element {

    return (
        <div id="error-outer-container">
            <div id="error-inner-container">
                <p className="text-error">Utracono połączenie z internetem.</p>
                <img
                    src={ErrorIcon}
                    alt='error'
                    className="error-image"
                />
                <p className="text-error">Aplikacja wznowi pracę automatycznie<br></br>gdy połączenie zostanie przywrócone.</p>
            </div>
        </div>
    )
}