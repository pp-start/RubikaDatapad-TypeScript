import { useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './components/UserContext.tsx';
import { Common /* , Error, Login, Main, Admin, Schedules, Offline */ } from './main.tsx';
import CacheBuster from 'react-cache-buster';
import Loading from './components/Loading.tsx';
import packageInfo from '../package.json';

export default function App() {

    const {user, isOnline} = useContext(UserContext);

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
                                        <Route path='/rozklady' element={<Schedules />} />
                                        <Route path='*' element={<Error />} />
                                    </Route>
                                </Routes>
                            </BrowserRouter>
                        )}
                        {user.role === 'admin' && (
                            <BrowserRouter>
                                <Routes>
                                    <Route path='/' element={<Common />}>
                                        <Route index element={<Admin />} />
                                        <Route path='*' element={<Error />} />
                                    </Route>
                                </Routes>
                            </BrowserRouter>
                        )}
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