import { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import axios, { type AxiosInstance } from 'axios';
import { db } from "./Db";

import type { FormData } from "./Login";

type UserContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loginUser: (formData: FormData) => Promise<Data>;
    logout: () => void;
    isOnline: boolean;
    isLocalhost: boolean;
};

type EncryptedPayload = {
    iv: string;
    data: string;
    date: string;
};

export type Data = Omit<Partial<User>, 'hour_rate' | 'total_work_time'> & {
    hour_rate?: number | string | null;
    total_work_time?: number | string | null;
    message?: string;
    token?: string;
    code?: string;
};

/*
type UpdatedData = Omit<Data, 'hour_rate' | 'total_work_time'> & {
    hour_rate?: string;
    total_work_time?: string;
};
*/

export const UserContext: React.Context<UserContextType | undefined> = createContext<UserContextType | undefined>(undefined);

export const isLocalhost: boolean = Boolean(

    window.location.hostname === 'localhost' || window.location.hostname === '[::1]' ||

    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) ||

    window.location.hostname.match(/^192(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)

);

export const Axios: AxiosInstance = axios.create({

    baseURL: isLocalhost ? '/TypeScript/RubikaDatapad/public/php/' : 'php/',

});

export function useUserContext(): UserContextType {

    const context: UserContextType | undefined = useContext(UserContext);

    if(!context){

        throw new Error('useUserContext must be used within a UserContext.Provider');

    }

    return context;

}

export const UserContextProvider = ( { children } : { children: ReactNode } ) => {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        let code: string | null = localStorage.getItem("code");

        if(!code){

            generateCode();

        }

    }, []);

    const generateCode = useCallback((): string => {

        const letters: string = 'ABCDEFGHIJKLMNOPRSTUWXYZ';

        const number: string = '0123456789';

        let code: string = '';

        for(let i = 1; i <= 10; i++){

            if(i <= 3){

                let random: number = Math.floor(Math.random() * letters.length);

                code = code + letters.charAt(random);

            } else {

                let random: number = Math.floor(Math.random() * number.length);

                code = code + number.charAt(random);

            }

        }

        localStorage.setItem("code", code);

        return code;

    }, []);

    // Szyfrowanie

    const encrypt = async (data: Data): Promise<Data> => {

        const encrypted_username: string = data.username ? await encryptString(data.username) : "";

        const encrypted_personal_id: string = data.personal_id ? await encryptString(data.personal_id) : "";

        const encrypted_role: string = data.role ? await encryptString(data.role) : "";

        const encrypted_token: string = data.token ? await encryptString(data.token) : "";

        const encrypted_code: string = data.code ? await encryptString(data.code) : "";

        const encrypted_first_name: string = data.first_name ? await encryptString(data.first_name) : ""; 

        const encrypted_surname: string = data.surname ? await encryptString(data.surname) : ""; 

        const encrypted_hour_rate: string = data.hour_rate ? await encryptString(String(data.hour_rate)) : ""; 

        const encrypted_total_work_time: string = data.total_work_time ? await encryptString(String(data.total_work_time)) : "";

        return { username: encrypted_username, personal_id: encrypted_personal_id, role: encrypted_role, token: encrypted_token, code: encrypted_code, first_name: encrypted_first_name, surname: encrypted_surname, hour_rate: encrypted_hour_rate, total_work_time: encrypted_total_work_time };

    }

    async function encryptString(text: string): Promise<string> {

        const date: string = new Date().toISOString().split('T')[0];

        const key: CryptoKey = await generateKey(date);

        const iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(12));

        const encodedText: Uint8Array<ArrayBuffer> = new TextEncoder().encode(text);

        const encryptedBuffer: ArrayBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encodedText
        );

        return JSON.stringify({
            iv: arrayBufferToBase64(iv),
            data: arrayBufferToBase64(encryptedBuffer),
            date
        });

    }

    async function generateKey(date: string): Promise<CryptoKey> {

        const encoder: TextEncoder = new TextEncoder();

        const secret: string = "rubika_datapad_ts_app";

        const dateKeyMaterial: ArrayBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(date + secret));

        return crypto.subtle.importKey(
            "raw",
            dateKeyMaterial,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );

    }

    function arrayBufferToBase64(buffer: Uint8Array | ArrayBuffer): string {

        return btoa(String.fromCharCode(...new Uint8Array(buffer)));

    }

    // Odszyfrowanie

    const decryptString = useCallback(async (encryptedText: string): Promise<string> => {

        if(encryptedText){

            const parsed: unknown = JSON.parse(encryptedText);

            if(isEncryptedPayload(parsed)){

                const { iv, data, date }: { iv: string, data: string, date: string } = parsed;

                const key: CryptoKey = await generateKey(date);
    
                const decryptedBuffer: ArrayBuffer = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
                    key,
                    base64ToArrayBuffer(data)
                );
        
                return new TextDecoder().decode(decryptedBuffer);

            } else {

                throw new Error("Invalid encrypted payload format");

            }

        } else {

            return "";

        }

        function isEncryptedPayload(obj: unknown): obj is EncryptedPayload {

            return (
                typeof obj === "object" &&
                obj !== null &&
                typeof (obj as any).iv === "string" &&
                typeof (obj as any).data === "string" &&
                typeof (obj as any).date === "string"
            );

        }

    }, []);

    const decrypt = useCallback(async (data: Data): Promise<Data> => {

        const decrypted_username: string = data.username ? await decryptString(data.username) : "";

        const decrypted_personal_id: string = data.personal_id ? await decryptString(data.personal_id) : "";

        const decrypted_role: string = data.role ? await decryptString(data.role) : "";

        const decrypted_token: string = data.token ? await decryptString(data.token) : ""; 

        const decrypted_code: string = data.code ? await decryptString(data.code) : "";

        const decrypted_first_name: string = data.first_name ? await decryptString(data.first_name) : ""; 

        const decrypted_surname: string = data.surname ? await decryptString(data.surname) : "";

        const decrypted_hour_rate: string = data.hour_rate ? await decryptString(data.hour_rate.toString()) : "";

        const decrypted_total_work_time: string = data.total_work_time ? await decryptString(data.total_work_time.toString()) : ""; 
       
        return { username: decrypted_username, personal_id: decrypted_personal_id, role: decrypted_role, token: decrypted_token, code: decrypted_code, first_name: decrypted_first_name, surname: decrypted_surname, hour_rate: Number(decrypted_hour_rate), total_work_time: Number(decrypted_total_work_time) };

    }, [decryptString]);

    function base64ToArrayBuffer(base64: string): ArrayBuffer {

        const binaryString = atob(base64);

        const bytes = new Uint8Array(binaryString.length);

        for(let i = 0; i < binaryString.length; i++){

            bytes[i] = binaryString.charCodeAt(i);

        }

        return bytes.buffer;
    }

    // Logowanie - wysyłanie formularza

    const loginUser = async (formData: FormData): Promise<Data> => {

        try {

            const { data } : { data: Data } = await Axios.post('classes/login.php', { formData });

            if(data.token){

                let retrieved_code: string | null = localStorage.getItem("code");

                let user_code: string = retrieved_code ? retrieved_code : generateCode();

                const code: string = user_code + "-" + window.navigator.hardwareConcurrency + "-" + window.navigator.maxTouchPoints;

                const updated_data: Data = {
                    ...data,
                    code: code
                }

                handleUser(updated_data);

                return data;

            }

            return { message: data.message };

        } catch(err) {

            return { message: 'Błąd serwera!' };

        }

    }

    // Wpisywanie użytkownika do lokalnej bazy danych

    const handleUser = async(data: Data): Promise<void> => {

        const encrypted: Data = await encrypt(data);

        if(userDB.length === 0){

            await db.user.put({index: 1, ...encrypted, first_name: encrypted.first_name ?? "", surname: encrypted.surname ?? "", hour_rate: String(encrypted.hour_rate ?? ''), total_work_time: String(encrypted.total_work_time ?? '')});

        } else {

            await db.user.update(1, {...encrypted, first_name: encrypted.first_name ?? "", surname: encrypted.surname ?? "", hour_rate: String(encrypted.hour_rate ?? ''), total_work_time: String(encrypted.total_work_time ?? '')});

        }

        setUserDB([{...encrypted}]);

    }

    // Pobieranie użytkownika z lokalnej bazy danych

    const [userDB, setUserDB] = useState<Data[]>([]);

    useEffect(() => {

        db.user.toArray().then(function(result){

            if(result.length > 0){

                setUserDB(result);

            } else {

                setUser({username: '', personal_id: '', role: 'none'});

            }
            
        });

    },[]);

    // Logging in
    
    useEffect(() => {

        if(userDB.length > 0){

            const data: Data = userDB[0];

            Axios.options('auth/getUser.php', { timeout: 1500 }).then(function(){

                logOnline(data);

            }).catch((error) => {

                console.log(error);

                setUser({username: '', personal_id: '', role: 'none'});

            });

        }

        const logOnline = async (data: Data): Promise<void> => {

            const decrypted_data: Data = await decrypt(data);

            let stored_code: string | null = localStorage.getItem("code");

            const current_code = stored_code + "-" + window.navigator.hardwareConcurrency + "-" + window.navigator.maxTouchPoints;

            const empty_user: User = { username: '', personal_id: '', role: 'none' };

            if(decrypted_data.code === current_code){

                const loginToken: string | undefined = decrypted_data.token;

                if(loginToken){

                    Axios.defaults.headers.common['Authorization'] = 'Bearer ' + loginToken;

                    const { data }: { data: unknown } = await Axios.get('auth/getUser.php');

                    if (typeof data === 'object' && data !== null && 'success' in data && 'user' in data){

                        const userData = data.user as User[];

                        // ZWERYFIKOWAĆ POPRAWNOŚĆ DANYCH

                        setUser(userData[0]);

                    } else {

                        setUser(empty_user);

                    }

                } else {

                    setUser(empty_user);

                }

            } else {

                setUser(empty_user);

            }

        }

    },[decrypt, userDB]);

    // Sprawdzenie połączenia z internetem

    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

    useEffect(() => {

        const interval = setInterval(() => {
            
            axios.get('https://pp-start.pl/php/connection.php', { timeout: 1000 }).then(function(response){

                if(response.status === 204){
    
                    setIsOnline(true);
    
                } else {
    
                    setTimeout(reCheckConnection, 5000);
                
                }
    
            }).catch((error) => {
    
                console.log(error);
    
                setTimeout(reCheckConnection, 5000);
    
            });

        }, 10000);

        function reCheckConnection(): void {

            axios.get('https://pp-start.pl/php/connection.php', { timeout: 1000 }).then(function(response){

                if(response.status === 204){
    
                    setIsOnline(true);
    
                } else {
    
                    setIsOnline(false);
                
                }
    
            }).catch((error) => {
    
                console.log(error);
    
                setIsOnline(false);
    
            });

        }

        const handleOnline = (): void => setIsOnline(true);

        const handleOffline = (): void => setIsOnline(false);
    
        window.addEventListener('online', handleOnline);

        window.addEventListener('offline', handleOffline);
    
        return () => {

            clearInterval(interval);

            window.removeEventListener('online', handleOnline);

            window.removeEventListener('offline', handleOffline);
            
        };

    }, []);

    // Wylogowanie

    const logout = (): void => {

        db.user.clear();

        setUser(null);

        window.location.reload();

    }

    return (
        <UserContext.Provider value={{user:user, setUser, loginUser, logout, isOnline, isLocalhost}}>
            {children}
        </UserContext.Provider>
    );

}

export default UserContextProvider;