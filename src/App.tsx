import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserContext } from './components/UserContext';
import { Common, Error, Login, Main, Offline /* , Admin, Schedules */ } from './main';
import CacheBuster from 'react-cache-buster';
import Loading from './components/Loading';
import packageInfo from '../package.json';

export default function App() {

    const { user, isOnline } = useUserContext();

    useEffect(() => {

        document.title = 'Badania ruchu';

    }, []);

    const isProduction: boolean = import.meta.env.MODE === 'production';

    return (
        <CacheBuster
            currentVersion={packageInfo.version}
            isEnabled={isProduction} 
            isVerboseMode={false} 
            loadingComponent={<Loading />} 
            metaFileDirectory={'.'}
            onCacheClear={() => window.location.reload()}
        >
            <>
                {user && isOnline &&
                    <>
                        {user.role === 'none' && (
                            <BrowserRouter>
                                <Routes>
                                    <Route path='/' element={<Common />}>
                                        <Route index element={<Login />} />
                                        <Route path='*' element={<Navigate to='/' />} />
                                    </Route>
                                </Routes>
                            </BrowserRouter>
                        )}
                        {user.role === 'user' && (
                            <BrowserRouter>
                                <Routes>
                                    <Route path='/' element={<Common />}>
                                        <Route index element={<Main />} />
                                        {/*<Route path='/rozklady' element={<Schedules />} />*/}
                                        <Route path='*' element={<Error />} />
                                    </Route>
                                </Routes>
                            </BrowserRouter>
                        )}
                        {/*user.role === 'admin' && (
                            <BrowserRouter>
                                <Routes>
                                    <Route path='/' element={<Common />}>
                                        <Route index element={<Admin />} />
                                        <Route path='*' element={<Error />} />
                                    </Route>
                                </Routes>
                            </BrowserRouter>
                        )*/}
                    </>
                }
                {!isOnline && (
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<Common />}>
                                <Route index element={<Offline />} />
                                <Route path='*' element={<Navigate to='/' />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                )}
            </>
        </CacheBuster>
    );
}