import { useState, useEffect, useRef, useCallback } from "react";
import { useUserContext, Axios, isLocalhost } from './Context';
import Gear from './svg/Gear';
import DownloadButtonIcon from './svg/DownloadButtonIcon';
import EyeIcon from './svg/EyeIcon';
import ListIcon from './svg/ListIcon';
import LoadIcon from '../images/load.png';
import LogoutIcon from './svg/LogoutIcon';
import MagnifyingGlassIcon from './svg/MagnifyingGlassIcon';
import PenIcon from './svg/PenIcon';
import ToggleButtonIcon from './svg/ToggleButtonIcon';
import TrainIcon from './svg/TrainIcon';
import UserAddIcon from './svg/UserAddIcon';
import UserListIcon from './svg/UserListIcon';
import UserSolidIcon from './svg/UserSolidIcon';
import Carousel, { CarouselItem } from "./Carousel";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Admin(){

    type Modal = {
        show: boolean;
        add_user: boolean;
        change_password: boolean;
        change_status: boolean;
        info: boolean;
        error: boolean;
        create_job: boolean;
        import_trains: boolean;
        show_photo: boolean;
        cameras_photos: boolean;
        cameras_photos_panel: boolean;
        ftp_info: boolean;
    }

    type SortedStation = {
        station_id: string;
        station_name: string;
    }

    type UserAddForm = {
        add_username: string;
        add_password: string;
        full_name: string;
        phone: string;
        mail: string;
        rating: string;
        hour_rate: string;
        comment: string;
    }

    

    type UpdatedUser = Users & {
        average_per_person: number;
        average_per_stage: number;
        full_name: string;
        finished_jobs: number;
        total_counted: number;
        total_jobs: number;
        total_stages: number;
        total_work_time_in_jobs: number;
    }

    // Sortowanie tabeli użytkowników

    type UserTableSorting = {
        attribute: SortableUserStringKeys | SortableUserNumericalKeys | SortableUserDateKeys;
        direction: 'ascending' | 'descending';
    }

    type SortableUserStringKeys = 'surname' | 'personal_id' | 'status';

    type SortableUserNumericalKeys = 'total_work_time' | 'total_work_time_in_jobs' | 'total_stages' | 'average_per_stage' | 'average_per_person' | 'total_jobs' | 'finished_jobs';

    type SortableUserDateKeys = 'last_update';

    // Nowe hasło

    type UserPasswordChange = {
        personal_id: string | null;
        new_password: string; 
        full_name: string | null;
    }

    // Aktywacja/deaktywacja

    type UserActivationChange = {
        personal_id: string | null;
        new_status: string | null;
        full_name: string | null;
    }

    type HasTrainHours = {
        departure_hour?: string | null;
        arrival_hour?: string | null;
    };










    // Panel wydawania zadań

    type JobCount = {
        recording_date: string;
        count: number;
    }

    type SynchronizedTrain = UpdatedTrain & {
        arrival_hour?: string | null;
        departure_hour?: string | null;
        days?: Recording[];
        measurements?: Measurement[];
        job_count?: JobCount[];
        jobs?: Job[];
        lane_number?: string | null;
        platform_number?: string | null;
        station_id?: string;
        station_name?: string;
    }

    type DateFilters = {
        start_date: string; 
        end_date: string;
    }

    type TimeFilters = {
        start_hour: string; 
        end_hour: string;
    }

    type Passengers = "entered_sum" | "exited_sum";



    type PreparedJob = {
        kind: string;
        type: string;
        layer?: number;
        first_station_name?: string;
        last_station_name?: string;
        station_id?: string;
        station_name?: string;
        train_number?: string;
        train_id?: string;
        date: Recording[];
    }

    type CreatedJob = {
        personal_id: string;
        kind: string;
        type: string;
        train_id: string | null;
        station_id: string | null;
        start_hour: string | null;
        end_hour: string | null;
        ids_list: string | null;
        train_list_count: number | null;
        recording_date: string;
        comments: string;
    }








    // Panel postępu

    type ProgressFilters = {
        start_date: string;
        end_date: string;
        status: string;
        check: string;
    }

    type UpdatedProgressJob = Job & {
        user_full_name: string;
    }

    type UpdatedProgressData = {
        recording_date: string;
        station_id: string;
        station_name: string;
        normal_jobs: UpdatedProgressJob[];
        check_jobs: UpdatedProgressJob[];
    }

    type TrainIdList = {
        train_id: string;
    }

    type MeasurementSummaryData = {
        date: string | null;
        measurements: Measurement[];
        trains: TrainIdList[];
        station_id: string | null;
        station_name: string | null;
    }

    type UpdatedSummaryMeasurement = Measurement & {
        arrival_difference: number;
        departure_difference: number;
        job_type: string;
        full_name: string;
    }

    type UpdatedMeasurementSummaryData = {
        arrival_hour: string | null;
        departure_hour: string | null;
        platform: string | null;
        relation: string;
        measurements: UpdatedSummaryMeasurement[];
        station_name: string;
        train_id: string;
        train_number: string;
    }

    type MeasurementSummarySorting = {
        attribute: string | null;
        direction: string | null;
    }






    // Realizacja zadań

    type UpdatedCompletionJob = Job & {
        created_on: string;
        full_name: string;
        station_name: string | null;
        train_number: string | null;
        first_station_name: string | null;
        last_station_name: string | null;
    }

    type DateJobsFilters = {
        job_start_date: string;
        job_end_date: string;
    }

    type DateRange = {
        min: string;
        max: string;
    }

    type TypeJobsFilter = {
        type_value: string;
        type_name: string;
    }

    type StatusJobsFilter = {
        status_value: string;
        status_name: string;
    }

    type CountedMeasurement = {
        job_number: number;
        recording_date: string;
        count: number;
    }

    type DetailedJobInfo = {
        type: string | null;
        job_number: number | null;
        station_id: string | null;
        station_name: string | null;
        train_number: string | null;
        train_relation: string | null;
        recording_date: string | null;
    }









    // Podgląd zadania jako pracownik

    type JobFilters = {
        job_station_name: string;
        job_date: string;
    }

    // Podgląd pociągów

    type TrainTypes = {
        name: string; 
        data: string[];
    }

    type TrainListView = {
        trains_group: string;
        train: string;
    }

    type TrainViewDetailedSearching = {
        active: boolean;
        search: boolean;
    }


    // --- Użytkownik i wylogowanie ---

    const { logout } = useUserContext();

    /*

    function useAuthUser(): User {
    
        const { user } = useUserContext();

        if(!user){
            throw new Error("useAuthUser must be used when user is logged in");
        }

        return user;

    }

    const user = useAuthUser();

    */

    // Przełącznik menu

    const [appLayer, setAppLayer] = useState<number>(100);

    // Wyszukiwanie

    const [searching, setSearching] = useState<boolean>(true);

    // Zadania

    const [jobs, setJobs] = useState<Job[]>([]);

    // Pociągi

    const [trains, setTrains] = useState<TrainStop[][]>([]);

    // Nazwy pociągów

    const [trainNumbers, setTrainNumbers] = useState<TrainNumber[]>([]);

    // Stacje

    const [stations, setStations] = useState<Station[]>([]);

    // Dni pomiaru

    const [recordings, setRecordings] = useState<Recording[]>([]);

    // Pomiary

    const [measurements, setMeasurements] = useState<Measurement[]>([]);

    // Użytkownicy

    const [users, setUsers] = useState<Users[]>([]);

    // Modale

    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

    const [modal, setModal] = useState<Modal>({
        show: false, 
        add_user: false,
        change_password: false,
        change_status: false,
        info: false,
        error: false,
        create_job: false,
        import_trains: false,
        show_photo: false,
        cameras_photos: false,
        cameras_photos_panel: false,
        ftp_info: false
    });

    function closeModal(): void {

        const closed = Object.fromEntries(Object.keys(modal).map((key) => [key, false])) as Modal;

        setModal(closed);

    }

    // Pokazywanie błędu

    const showError = useCallback((message?: string | null): void => {

        const error_message: string = message ? message : "Wystąpił błąd w trakcie pobierania danych. Odśwież stronę, a jeżeli problem będzie się powtarzał skontaktuj się z Pawłem.";

        setModal(prev => ({...prev, show: true, error: true}));

        setModalErrorMessage(error_message);

    }, []);

    function closeErrorModal(): void {

        const excludedProps: string[] = ['show', 'error'];

        const hasTrueProp: boolean = Object.entries(modal).some(([key, value]) => !excludedProps.includes(key) && value);

        if(hasTrueProp){

            setModal(prevModal => {return {...prevModal, error: false}});

        } else {

            closeModal();

        }

    }

    // Formatowanie daty

    function formatDate(dateString: string): string {

        const [year, month, day] = dateString.split("-");

        return `${day}/${month}/${year}`;

    }

    // Formatowanie czasu

    function formatTime(time: number): string {

        let hours: string = (Math.floor(time / 3600)).toString();

        if(hours.length === 1){

            hours = "0" + hours;

        }

        time %= 3600;

        let minutes: string = (Math.floor(time / 60)).toString();

        if(minutes.length === 1){

            minutes = "0" + minutes;

        }

        let seconds: string = (time % 60).toString();

        if(seconds.length === 1){

            seconds = "0" + seconds;

        }

        const timestring: string = hours + ":" + minutes + ":" + seconds;

        return timestring;

    }

    // Obliczanie różnicy między dwoma czasami

    function calculateTimeDifference(time1: string, time2: string): string {

        if (time1.length === 5) time1 += ":00";

        if (time2.length === 5) time2 += ":00";

        const today: string = new Date().toISOString().slice(0, 10); 

        const date1: Date = new Date(`${today}T${time1}`);

        const date2: Date = new Date(`${today}T${time2}`);

        if(time1.startsWith("23") && time2.startsWith("00")){

            date2.setDate(date2.getDate() + 1);

        }
    
        const differenceInMillis: number = date2.getTime() - date1.getTime();
    
        let differenceInMinutes: number = Math.floor(differenceInMillis / (1000 * 60));

        if(Math.abs(differenceInMinutes) > 720){

            if(differenceInMinutes > 0){

                differenceInMinutes -= 1440;

            } else {

                differenceInMinutes += 1440;

            }

        }
    
        return `${differenceInMinutes} min.`;

    }

    // Sortowanie pociągów według czasu

    const sortTrainsByHours = useCallback(<T extends HasTrainHours>(trains: T[]): T[] => {

        const sorted_trains = trains.sort((a, b) => {

            const timeA = a.departure_hour || a.arrival_hour;

            const timeB = b.departure_hour || b.arrival_hour;
        
            const dateA = new Date(`1970-01-01T${timeA}`).getTime();

            const dateB = new Date(`1970-01-01T${timeB}`).getTime();
        
            return dateA - dateB;

        });

        return sorted_trains;

    }, []);

    // Uzupełnianie pociągów o numer PKP i relację

    const updateTrainData = useCallback((trains: TrainStop[][], train_numbers: TrainNumber[], stations: Station[]): UpdatedTrain[] => {

        const updated: UpdatedTrain[] = [];

        trains.forEach(train => {

            const train_id: string = train[0].train_id;

            let train_number: string | null = null;

            let first_station_name: string | null = null;

            let last_station_name: string | null = null;

            const train_search: TrainNumber | undefined = train_numbers.find(u => u.train_id === train_id);

            if(train_search){

                train_number = train_id.startsWith('PW') ? train_search.train_number + " - wakacje" : train_search.train_number;

                const first_station: Station | undefined = stations.find(u => u.station_id === train_search.first_station);

                const last_station: Station | undefined = stations.find(u => u.station_id === train_search.last_station);

                if(first_station){

                    first_station_name = first_station.name;

                }

                if(last_station){

                    last_station_name = last_station.name;

                }

            }

            const output: UpdatedTrain = {
                train_id: train_id,
                stops: train,
                train_number: train_number,
                first_station_name: first_station_name,
                last_station_name: last_station_name
            };

            updated.push(output);

        });

        return updated;

    }, []);

    // Wyodrębnianie stacji

    const getUniqueStations = useCallback((data: Recording[] | UpdatedCompletionJob[], stations: Station[]): SortedStation[] => {

        //const filtered_objects: (Recording | UpdatedCompletionJob)[] = data.filter(a => a.station_id !== null);

        //const unique_stations_ids: string[] = [...new Set(filtered_objects.map(a => a.station_id))];

        const unique_stations_ids: string[] = [...new Set(data.map(a => a.station_id).filter((id): id is string => id !== null))];

        const sorted_stations: SortedStation[] = [];

        unique_stations_ids.forEach(station => {

            const station_match = stations.find(item => item.station_id === station);

            const station_name = station_match ? ( station.startsWith("SW") ? station_match.name + " - wakacje" : station_match.name ) : "-";

            const obj: SortedStation = {
                station_id: station,
                station_name: station_name
            };

            sorted_stations.push(obj);

        });

        sorted_stations.sort((a, b) => a.station_name.localeCompare(b.station_name));

        return sorted_stations;

    }, []);

    // Wyodrębnianie unikalnych rodzajów zadań

    const getUniqueTypes = useCallback((array: UpdatedCompletionJob[]): TypeJobsFilter[] => {

        const unique_types = [...new Set(array.map(a => a.type))];

        const output: TypeJobsFilter[] = [];

        unique_types.forEach(type => {

            const obj: TypeJobsFilter = {
                type_value: type,
                type_name: type === 'normal' ? 'Zwykłe' : 'Kontrolne'
            };

            output.push(obj);

        });

        return output;

    }, []);

    // wyodrębnianie unikalnych statusów zadań

    const getUniqueStatuses = useCallback((array: UpdatedCompletionJob[]): StatusJobsFilter[] => {

        const unique_statuses: string[] = [...new Set(array.map(a => a.status))];

        const output: StatusJobsFilter[] = [];

        unique_statuses.forEach(status_value => {

            let status_name: string = "";

            switch(status_value){

                case 'wydany':

                    status_name = 'nierozpoczęte';

                    break;

                case 'rozpoczęty':

                    status_name = 'rozpoczęte';

                    break;

                 case 'zakończony':

                    status_name = 'ukończone';

                    break;

                case 'zamknięty':

                    status_name = 'zamknięte';

                    break;  
                    
                default:

            }

            const obj: StatusJobsFilter = {
                status_value: status_value,
                status_name: status_name
            };

            output.push(obj);

        });

        return output;

    }, [])

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Panel użytkowników

    // Wyznaczanie statusu - offline/online

    function getStatus(user: UpdatedUser): React.JSX.Element {

        const current_time: number = new Date().getTime();

        const last_update: number = new Date(user.last_update).getTime();

        let status;

        if(user.total_work_hours){

            const time_difference: number = current_time - last_update;

            const threshold: number = 5 * 60 * 1000;
    
            status = time_difference < threshold ? 'Online' : 'Offline';

        } else {

            status = 'Offline';

        }

        return <span className="user-status-info" style={{ color: status === 'Online' ? 'green' : 'red' }}>{status}</span>;

    }






















    // Dodawanie nowego użytkownika

    const [userAddForm, setUserAddForm] = useState<UserAddForm>({
        add_username: '',
        add_password: '',
        full_name: '',
        phone: '',
        mail: '',
        rating: '',
        hour_rate: '',
        comment: ''
    });

    // Sprawdzanie czy nazwa użytkownika jest wolna

    const [usernameTaken, setUsernameTaken] = useState<boolean>(false);

    useEffect(() => {

        const username: string = userAddForm.add_username;

        if(username !== ""){

            const request_type: string = 'check username';

            Axios.post('classes/users.php', { username, request_type }, { timeout: 1000 }).then(function(response){

                if(response.data.busy){

                    setUsernameTaken(true);

                } else {

                    setUsernameTaken(false);

                }

            }).catch((error) => {

                setUsernameTaken(false);

                console.warn(error);

            });

        }

    }, [userAddForm.add_username]);

    function userAddFormChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {

        const {name, value} = event.target;

        setUserAddForm(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        });

    }

    const [formErrors, setFormErrors] = useState<string[]>([]);

    // Tworzenie użytkownika

    function createUser(): void {

        if(usernameTaken){

            return;

        }

        const errors: string[] = [];

        const mailRegex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if(userAddForm.add_username === ''){
            errors.push('nazwa użytkownika nie może być pusta');
        }

        if(userAddForm.add_password === ''){
            errors.push('hasło nie może być puste');
        }

        if(userAddForm.add_password.length > 0 && userAddForm.add_password.length < 10){
            errors.push('hasło musi mieć co najmniej 10 znaków');
        }

        if(userAddForm.phone !== '' && !userAddForm.phone.match(/\d/g)){
            errors.push('wprowadzono nieprawidłowy numer telefonu');
        }

        const digits: RegExpMatchArray | null = userAddForm.phone.match(/\d/g);

        if(userAddForm.phone !== '' && digits && digits.length !== 9){
            errors.push('numer telefonu musi mieć 9 cyfr');
        }

        if(userAddForm.mail !== '' && !userAddForm.mail.match(mailRegex)){
            errors.push('wprowadzono nieprawidłowy adres email');
        }

        if(errors.length > 0){

            setModal({...modal, show: true, error: true});

            setFormErrors(errors);

        } else {

            setFormErrors([]);

            const request_type: string = 'create user';

            const formData: UserAddForm = userAddForm;

            Axios.post('classes/users.php', { formData, request_type }, { timeout: 10000 }).then(function(response){

                if(response.data === true){

                    setModal({...modal, show: true, add_user: false, info: true});

                    setModalMessage('Użytkownik został dodany.');

                    setUserAddForm({
                        add_username: '',
                        add_password: '',
                        full_name: '',
                        phone: '',
                        mail: '',
                        rating: '',
                        hour_rate: '',
                        comment: ''
                    });

                    getData();

                } else if(response.data.error){

                    showError(response.data.error);

                } else {

                    showError();

                }

            }).catch((error) => {

                showError();

                console.warn(error);

            });

        }

    }

    // Tabela użytkowników

    const [updatedUsers, setUpdatedUsers] = useState<UpdatedUser[]>([]);

    useEffect(() => {

        // Usuwanie zduplikowanych pomiarów(zostawianie ostatniego pomiaru)

        /*

        const removeDuplicates = (arr: Measurement[]) => {

            return Object.values(arr.reduce((acc, obj) => {

                const key = `${obj.job_number}-${obj.train_id}-${obj.station_id}`;
                
                if(!acc[key] || obj.id > acc[key].id){

                    acc[key] = obj;

                }
                
                return acc;

            }, {}));

        }

        */

        const removeDuplicates = (user_measurements: Measurement[]): Measurement[] => {

            const unique_measurements: Measurement[] = [];

            user_measurements.reverse().forEach(item => {

                const job_number: number = item.job_number;

                const train_id: string = item.train_id;

                const station_id: string = item.station_id;

                const exist: boolean = unique_measurements.some(obj => obj.job_number === job_number && obj.train_id === train_id && obj.station_id === station_id);

                if(!exist){

                    unique_measurements.push(item);

                }

            });

            return unique_measurements;

        }

        if(users.length > 0 && jobs.length > 0 && measurements.length > 0){

            const current_users: Users[] = [...users];

            const updated_users: UpdatedUser[] = [];

            current_users.forEach(user => {

                const personal_id: string = user.personal_id;

                const user_measurements: Measurement[] = measurements.filter(item => item.personal_id === personal_id);

                const unique_user_measurements: Measurement[] = removeDuplicates(user_measurements);

                const total_stages: number = unique_user_measurements.length;

                const total_counted: number = unique_user_measurements.reduce((sum, current) => {

                    const entered_sum: number = current.entered_sum >= 0 ? current.entered_sum : 0;

                    const exited_sum: number = current.exited_sum >= 0 ? current.exited_sum : 0;

                    return sum + entered_sum + exited_sum;

                }, 0);

                const user_jobs: Job[] = jobs.filter(item => item.personal_id === personal_id);

                const user_finished_jobs: Job[] = user_jobs.filter(item => item.status === 'zakończony' || item.status === 'zamknięty');

                const total_jobs: number = user_jobs.length;

                const finished_jobs: number = user_finished_jobs.length;

                const total_work_time_in_jobs: number = user_jobs.reduce((sum, current) => sum + (current.work_time ?? 0), 0);

                const updated_user: UpdatedUser = {
                    ...user,
                    full_name: (user.first_name && user.surname) ? user.first_name + " " + user.surname : user.username,
                    total_counted: total_counted,
                    total_stages: total_stages,
                    total_jobs: total_jobs,
                    finished_jobs: finished_jobs,
                    total_work_time_in_jobs: total_work_time_in_jobs,
                    average_per_stage: total_stages > 0 ? Math.round(total_work_time_in_jobs/total_stages) : 0,
                    average_per_person: total_counted > 0 ? Math.round(total_work_time_in_jobs/total_counted) : 0
                }

                updated_users.push(updated_user);

            });

            setUpdatedUsers(updated_users);

        }

    }, [users, jobs, measurements]);

    

    const [userTable, setUserTable] = useState<UpdatedUser[]>([]);

    // Sortowanie tabeli użytkowników

    const [userTableSorting, setUserTableSorting] = useState<UserTableSorting>({attribute: 'personal_id', direction: 'ascending'});

    useEffect(() => {

        if(updatedUsers.length > 0){

            const string_attributes: string[] = ['surname', 'personal_id', 'status'];

            const numerical_attributes: string[] = ['total_work_time', 'total_work_time_in_jobs', 'total_stages', 'average_per_stage', 'average_per_person', 'total_jobs', 'finished_jobs'];

            const date_attributes: string[] = ['last_update'];

            const raw_attribute: SortableUserStringKeys | SortableUserNumericalKeys | "last_update" = userTableSorting.attribute;

            const direction: string = userTableSorting.direction;

            const array_of_objects: UpdatedUser[] = [...updatedUsers];

            if(string_attributes.includes(raw_attribute)){

                const attribute: SortableUserStringKeys = userTableSorting.attribute as SortableUserStringKeys;

                array_of_objects.sort((a, b) => {

                    const aValue: string = a[attribute] || '';

                    const bValue: string = b[attribute] || '';

                    const comparison: number = aValue.localeCompare(bValue);

                    return direction === 'ascending' ? comparison : -comparison;

                });

            } else if(numerical_attributes.includes(raw_attribute)){

                const attribute: SortableUserNumericalKeys = userTableSorting.attribute as SortableUserNumericalKeys;

                array_of_objects.sort((a, b) => {

                    const aValue: number = a[attribute] ? a[attribute] : 0;

                    const bValue: number = b[attribute] ? b[attribute] : 0;

                    if (aValue < bValue) return direction === 'ascending' ? -1 : 1;

                    if (aValue > bValue) return direction === 'ascending' ? 1 : -1;

                    return 0;

                });

            } else if(date_attributes.includes(raw_attribute)){

                const attribute: SortableUserDateKeys = userTableSorting.attribute as SortableUserDateKeys;

                array_of_objects.sort((a, b) => {

                    if(attribute === 'last_update'){

                        const aIsUnchanged: boolean = a.last_update === a.created_on;

                        const bIsUnchanged: boolean = b.last_update === b.created_on;

                        if (aIsUnchanged && !bIsUnchanged) return direction === 'ascending' ? -1 : 1;

                        if (!aIsUnchanged && bIsUnchanged) return direction === 'ascending' ? 1 : -1;

                    }

                    const aDate: number = new Date(a[attribute]).getTime();

                    const bDate: number = new Date(b[attribute]).getTime();

                    const comparison: number = aDate - bDate;

                    return direction === 'ascending' ? comparison : -comparison;

                });

            }

            setUserTable(array_of_objects);

        }

    }, [updatedUsers, userTableSorting]);

    function handleUserTableSorting(attribute: SortableUserStringKeys | SortableUserNumericalKeys | SortableUserDateKeys): void {

        const current_attribute = userTableSorting.attribute;

        const current_direction = userTableSorting.direction;

        let new_direction: "ascending" | "descending";

        if(attribute === current_attribute){

            new_direction = current_direction === 'ascending' ? 'descending' : 'ascending';

        } else {

            new_direction = 'ascending';

        }

        setUserTableSorting({attribute: attribute, direction: new_direction});

    }

    // Pobieranie zestawienia wydajności pracowników

    const [modalSpin, setModalSpin] = useState<boolean>(false);

    function getSummaryData(request_type: string, data?: Recording): void {

        setModalMessage('Czekaj, trwa generowanie pliku.');

        setModalSpin(true);

        setModal({...modal, show: true, info: true});

        Axios.post('classes/data.php', { request_type, data }, { timeout: 10000 }).then(function(response){

            if(response.data.success){

                const filename: string = response.data.filename;

                downloadFile(filename);

                setModalMessage(null);

                closeModal();

            } else {

                setModalMessage('Wystąpił błąd w trakcie generowania pliku. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z Pawłem.');

            }

            setModalSpin(false);

        }).catch((error) => {

            console.warn(error);

            setModalSpin(false);

            setModalMessage('Wystąpił błąd w trakcie generowania pliku. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z Pawłem.');

        });

    }

    function downloadFile(filename: string): void {

        const link: HTMLAnchorElement = document.createElement('a');

        link.href = !isLocalhost ? 'https://analiza.badaniaruchu.pl/downloads/'+filename : 'http://localhost/Rubika/downloads/'+filename;

        link.setAttribute('download', filename); 

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }

    // Zmiana hasła

    const [passwordChange, setPasswordChange] = useState<UserPasswordChange>({personal_id: null, new_password: '', full_name: null});

    function showPasswordChange(user: UpdatedUser): void {

        const personal_id: string = user.personal_id;

        const full_name = (user.first_name && user.surname) ? user.first_name + " " + user.surname : user.username;

        setPasswordChange({personal_id: personal_id, new_password: '', full_name: full_name});

        setModal({...modal, show: true, change_password: true});

    }

    function newPasswordChange(event: React.ChangeEvent<HTMLInputElement>): void {

        const {name, value} = event.target;

        setPasswordChange(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        });

    }

    function changePassword(): void {

        const errors: string[] = [];

        if(passwordChange.new_password === ''){

            errors.push('hasło nie może być puste');

        }

        if(passwordChange.new_password.length > 0 && passwordChange.new_password.length < 10){

            errors.push('hasło musi mieć co najmniej 10 znaków');

        }

        if(errors.length > 0){

            setModal({...modal, show: true, error: true});

            setFormErrors(errors);

        } else {

            setFormErrors([]);

            const request_type = 'change password';

            const formData = passwordChange;

            Axios.post('classes/users.php', { formData, request_type }, { timeout: 3000 }).then(function(response){

                if(response.data === true){

                    setModal({...modal, show: true, change_password: false, info: true});

                    setModalMessage('Hasło zostało zmienione');

                } else if(response.data.error){

                    showError(response.data.error);

                } else {

                    showError();

                }

            }).catch((error) => {

                showError();

                console.warn(error);

            });

        }

    }

    const [showDeactivatedUsers, setShowDeactivatedUsers] = useState<boolean>(false);

    const handleShowDeactivatedChange = (): void => {

        setShowDeactivatedUsers(prev => !prev);

    }

    // Deaktywacja / aktywacja użytkownika

    const [userToDeactivate, setUserToDeactivate] = useState<UserActivationChange>({personal_id: null, new_status: null, full_name: null});

    function showUserDeactivation(user: UpdatedUser): void {

        const personal_id: string = user.personal_id;

        const full_name: string = (user.first_name !== "" && user.surname !== "") ? user.first_name + " " + user.surname : user.username;

        const old_status: string = user.status;

        let new_status: string;

        if(old_status === 'active'){

            new_status = 'deactivated';

        } else {

            new_status = 'active';

        }

        setUserToDeactivate({personal_id: personal_id, new_status: new_status, full_name: full_name});

        setModal({...modal, show: true, change_status: true});

    }

    function changeUserActivation(): void {

        const formData: UserActivationChange = userToDeactivate;

        const request_type: string = 'change status';

        const new_status = userToDeactivate.new_status === 'active' ? 'active' : 'deactivated';

        const success_message: string = 'Użytkownik został ' + new_status === "active" ? "aktywowany" : "deaktywowany";

        Axios.post('classes/users.php', { formData, request_type }, { timeout: 3000 }).then(function(response){

            if(response.data === true){

                setModal({...modal, show: true, change_status: false, info: true});

                /*

                const current: Users = [...users];

                const index = current.findIndex(user => user.personal_id === userToDeactivate.personal_id);

                current[index].status = userToDeactivate.new_status;

                setUsers(current);

                */

                const current: UpdatedUser[] = [...userTable];

                const index: number = current.findIndex(user => user.personal_id === userToDeactivate.personal_id);

                if(index !== -1){

                    current[index].status = new_status;

                }

                setUserTable(current);

                setModalMessage(success_message);

            } else if(response.data.error){

                showError(response.data.error);

            } else {

                showError();

            }

        }).catch((error) => {

            showError();

            console.warn(error);

        });

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Panel wydawania zadań

    const getData = useCallback((): void => {

        const request_type = 'get admin data';

        setSearching(true);

        Axios.post('classes/data.php', { request_type }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data = response.data as APIResponse;

                if(data.trains){

                    setTrains(data.trains);

                }

                if(data.train_numbers){

                    setTrainNumbers(data.train_numbers);

                }

                if(data.stations){

                    setStations(data.stations);

                }

                if(data.recordings){

                    setRecordings(data.recordings);

                }

                if(data.jobs){

                    setJobs(data.jobs);

                }

                if(data.measurements){

                    setMeasurements(data.measurements);

                }

                if(data.users){

                    setUsers(data.users);

                }

            } else {

                showError();

            }

            setSearching(false);

        }).catch((error) => {

            console.warn(error);

            setSearching(false);

            showError();

        });

    }, [showError]);

    // Wyodrębnianie unikalnych dat

    const [uniqueDays, setUniqueDays] = useState<string[]>([]);
    
    useEffect(() => {

        if(recordings.length > 0){

            const unique_dates: string[] = [...new Set(recordings.map(a => a.recording_date))];
            
            unique_dates.sort();

            setUniqueDays(unique_dates);

            setStartDates(unique_dates);

            setEndDates(unique_dates);

        }
        
    }, [recordings]);

    // Daty początkowa i końcowa

    const [startDates, setStartDates] = useState<string[]>([]);

    const [endDates, setEndDates] = useState<string[]>([]);

    // Wyodrębnianie unikalnych stacji

    const [uniqueStations, setUniqueStations] = useState<SortedStation[]>([]);

    const latestUniqueStations = useRef<SortedStation[]>(uniqueStations);

    useEffect(() => {

        latestUniqueStations.current = uniqueStations;

    }, [uniqueStations]);

    useEffect(() => {

        if(recordings.length > 0 && stations.length > 0){

            const sorted_stations: SortedStation[] = getUniqueStations([...recordings], [...stations]);

            setUniqueStations(sorted_stations);

        }
        
    }, [recordings, stations, getUniqueStations]);

    // Uzupełnianie pociągów o nazwy stacji i numer PKP oraz pomiary

    const [updatedTrains, setUpdatedTrains] = useState<SynchronizedTrain[]>([]);

    useEffect(() => {

        if(trains.length > 0 && stations.length > 0 && trainNumbers.length > 0){

            const updated: UpdatedTrain[] = updateTrainData([...trains], [...trainNumbers], [...stations]);

            const updated_with_measurements: SynchronizedTrain[] = updated.map(train => {

                const measurements_array: Measurement[] = measurements.filter(item => item.train_id === train.train_id);

                return {
                    ...train,
                    measurements: measurements_array
                }

            });

            setUpdatedTrains(updated_with_measurements);

        }
        
    }, [trains, stations, trainNumbers, measurements, updateTrainData]);

    // Filtrowanie - data

    const [dateFilters, setDateFilters] = useState<DateFilters>({start_date: '', end_date: ''});

    const latestDateFilters = useRef<DateFilters>(dateFilters);

    useEffect(() => {

        latestDateFilters.current = dateFilters;

    }, [dateFilters]);

    // Wyodrębnianie minimalnej i maksymalnej daty i ustawianie domyślnego zakresu

    useEffect(() => {

        if(uniqueDays.length > 0){ 

            const dateObjects: number[] = uniqueDays.map(dateString => new Date(dateString).getTime());

            const maxDate = new Date(Math.max.apply(null, dateObjects));
            
            const minDate = new Date(Math.min.apply(null, dateObjects));

            const formattedMaxDate = maxDate.toISOString().split('T')[0];

            const formattedMinDate = minDate.toISOString().split('T')[0];

            if(latestDateFilters.current.start_date === '' && latestDateFilters.current.end_date === ''){

                setDateFilters({start_date: formattedMinDate, end_date: formattedMaxDate});

            }

        }

    }, [uniqueDays]);

    // Zmiana filtrów daty

    function onDateChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const value: string = event.target.value;

        const name: string = event.target.name;

        let current_start: string = dateFilters.start_date;

        let current_end: string = dateFilters.end_date;

        // Jeśli zmieniona została data poczatkowa

        if(name === 'start_date'){

            const filteredDates: string[] = uniqueDays.filter(date => {

                return new Date(date) >= new Date(value);

            });

            setEndDates(filteredDates)

            if(new Date(current_end) < new Date(value)){

                current_end = value;

            }

            setDateFilters(prevFilters => {
                return {
                    ...prevFilters,
                    start_date: value,
                    end_date: current_end
                }
            });

        }

        // Jeśli została zmieniona data końcowa

        if(name === 'end_date'){

            const filteredDates: string[] = uniqueDays.filter(date => {

                return new Date(date) <= new Date(value);

            });

            setStartDates(filteredDates);

            if(new Date(current_start) > new Date(value)){

                current_start = value;

            }

            setDateFilters(prevFilters => {
                return {
                    ...prevFilters,
                    start_date: current_start,
                    end_date: value
                }
            });

        }

    }

    useEffect(() => {

        if(dateFilters.start_date !== "" && dateFilters.end_date !== ""){

            const station_filter: string | undefined = latestStationFilter.current;

            const unique_stations: SortedStation[] = latestUniqueStations.current;

            const current_filtered_stations: string[] = recordings.filter(item => {

                const recording_date = new Date(item.recording_date);

                const start_date = new Date(dateFilters.start_date);

                const end_date = new Date(dateFilters.end_date);

                return recording_date >= start_date && recording_date <= end_date;

            }).map(item => item.station_id);

            const filtered_unique_stations = unique_stations.filter(station => {
                
                return current_filtered_stations.includes(station.station_id);

            });

            setFilteredStations(filtered_unique_stations);

            if(filtered_unique_stations.length > 0 && !filtered_unique_stations.some(item => item.station_id === station_filter)){

                setStationFilter(filtered_unique_stations[0].station_id);

            }

            /*

            if(filtered_unique_stations.length > 0 && !filtered_unique_stations.some(item => Object.values(item).includes(station_filter))){

                setStationFilter(filteredUniqueStations[0].station_id);

            }

            */

        }

    }, [dateFilters, recordings]);

    // Filtrowanie - stacja

    const [stationFilter, setStationFilter] = useState<string | undefined>(undefined);

    const latestStationFilter = useRef<string | undefined>(stationFilter);

    useEffect(() => {

        latestStationFilter.current = stationFilter;

    }, [stationFilter]);

    const [filteredStations, setFilteredStations] = useState<SortedStation[]>([]);

    function onStationChange(event: React.ChangeEvent<HTMLSelectElement>) : void {

        const value: string = event.target.value;

        setStationFilter(value);

    }

    useEffect(() => {

        if(uniqueStations.length > 0){ 

            if(!latestStationFilter.current){

                setStationFilter(uniqueStations[0].station_id);

            }

            setFilteredStations(uniqueStations);

        }

    }, [uniqueStations]);

    // Filtrowanie - godzina

    const [time, setTime] = useState<TimeFilters>({start_hour: '00:00', end_hour: '23:59'});
    
    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

        const {name, value} = event.target;

        setTime(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        });

    };
    
    // Wyznaczanie pociągów dla wybranej stacji i zakresu godzin

    const [preFilteredTrains, setPreFilteredTrains] = useState<SynchronizedTrain[]>([]);

    const [filteredTrains, setFilteredTrains] = useState<SynchronizedTrain[]>([]);

    useEffect(() => {

        if(updatedTrains.length > 0 && stationFilter){

            const filtered_trains: SynchronizedTrain[] = filterTrains(false);

            const prefiltered_trains: SynchronizedTrain[] = filterTrains(true);

            setFilteredTrains(filtered_trains);

            setPreFilteredTrains(prefiltered_trains);

        }

        function filterTrains(all: boolean): SynchronizedTrain[] {

            // all - określa czy filtrujemy wszystkie pociągi czy jest aktywny przedział godzinowy

            let hour1: number;

            let hour2: number;

            let start_hour: number;

            let end_hour: number;

            if(!all){

                hour1 = ( new Date(`1970-01-01T${time.start_hour}`) ).getTime();

                hour2 = ( new Date(`1970-01-01T${time.end_hour}`) ).getTime();

                //hour1 = new Date(new Date().toDateString() + ' ' + time.start_hour);

                //hour2 = new Date(new Date().toDateString() + ' ' + time.end_hour);

                if(hour1 > hour2){

                    start_hour = hour2;

                    end_hour = hour1;

                } else {

                    start_hour = hour1;

                    end_hour = hour2;

                }

            }

            const filtered_trains: SynchronizedTrain[] = updatedTrains.flatMap(train => {

                const station_match: TrainStop | undefined = train.stops.find(item => item.station_id === stationFilter);

                if(!station_match) return [];

                const departure_hour: string | null = station_match.departure_hour;

                const arrival_hour: string | null = station_match.arrival_hour;

                const chosen_value: string = departure_hour ?? arrival_hour!;

                const compared_time = ( new Date(`1970-01-01T${chosen_value}`) ).getTime();

                if(!all && (compared_time < start_hour || compared_time > end_hour)) return [];

                return [{
                    ...train,
                    departure_hour: departure_hour,
                    arrival_hour: arrival_hour,
                    station_id: station_match.station_id,
                    platform_number: station_match.platform_number,
                    lane_number: station_match.lane_number
                }];

            });

            const sorted_trains = sortTrainsByHours(filtered_trains) as SynchronizedTrain[];

            return sorted_trains;

        }
        
    }, [stationFilter, time, updatedTrains, sortTrainsByHours]);

    const [outputTrains, setOutputTrains] = useState<SynchronizedTrain[]>([]);

    useEffect(() => {

        if(filteredTrains.length > 0){

            const output_trains: SynchronizedTrain[] = filteredTrains.map(train => {

                const train_id: string = train.train_id;

                const station_id: string = train.station_id ?? "";

                const train_hour: string = train.departure_hour ?? train.arrival_hour!;

                const station: Station | undefined = stations.find(station => station.station_id === train.station_id);

                const station_name: string = station ? station.name : "";

                //const job_list: Job[] = jobs.filter(item => item.train_id === train.train_id || item.station_id === train.station_id);

                const filtered_jobs: Job[] = jobs.flatMap(job => {

                    if(job.train_id !== train_id && job.station_id !== station_id) return [];

                    if(job.train_id === train_id) return [{...job}];

                    if(job.train_list && job.train_list.includes(train_id)) return [{...job}];

                    if(job.station_id !== station_id) return [];

                    const start_hour: string | null = job.start_hour;

                    const end_hour: string | null = job.end_hour;

                    if((start_hour && end_hour) && (train_hour >= start_hour && train_hour <= end_hour)){

                        return [{...job}];

                    } else {

                        return [];

                    }

                });

                const day_list: Recording[] = recordings.filter(item => item.station_id === station_id);

                day_list.sort((a, b) => a.recording_date.localeCompare(b.recording_date));

                //train.days = day_list; ASSIGN to .days

                const job_count: JobCount[] = [];

                day_list.forEach(day => {

                    const recording_date: string = day.recording_date;

                    const match_jobs: Job[] = filtered_jobs.filter(item => item.recording_date === recording_date && item.type === 'normal');

                    const obj: JobCount = {
                        recording_date: recording_date,
                        count: match_jobs.length
                    };

                    job_count.push(obj);

                });

                return {
                    ...train,
                    days: day_list,
                    jobs: filtered_jobs,
                    job_count: job_count,
                    station_name: station_name
                }

            });

            setOutputTrains(output_trains);

            /*

            filteredTrains.forEach(train => {

                const train_id = train.train_id;

                const station = stations.find(station => station.station_id === train.station_id);

                train.station_name = station ? station.name : "";

                const job_list = jobs.filter(item => item.train_id === train.train_id || item.station_id === train.station_id);

                train.jobs = job_list;

                const day_list = recordings.filter(item => item.station_id === train.station_id);

                day_list.sort((a, b) => a.recording_date.localeCompare(b.recording_date));

                train.days = day_list;

                const train_hour = train.departure_hour ? train.departure_hour : train.arrival_hour;

                const job_count = [];

                if(day_list.length > 0){

                    day_list.forEach(day => {

                        const obj = {};

                        const recording_date = day.recording_date;

                        obj.recording_date = recording_date;

                        const match_jobs = job_list.filter(item => item.recording_date === recording_date && item.type === 'normal');

                        let current_count = 0;

                        if(match_jobs.length > 0){

                            match_jobs.forEach(job => {

                                if(job.train_id){

                                    current_count++;

                                } else {

                                    if(job.train_list){

                                        const train_list = JSON.parse(job.train_list);

                                        if(train_list.includes(train_id)){

                                            current_count++;

                                        }
            
                                    } else {

                                        let start_hour = job.start_hour;
            
                                        let end_hour = job.end_hour;
            
                                        if(train_hour >= start_hour && train_hour <= end_hour){

                                            current_count++;

                                        }

                                    }

                                }

                            });

                        }

                        obj.count = current_count;

                        job_count.push(obj);

                    });

                }

                train.job_count = job_count;

            });

            */

            

        } else {

            setOutputTrains([]);

        }
        
    }, [filteredTrains, recordings, jobs, stations]);

    // Wybór pociągów z tabeli

    const [selectedTrains, setSelectedTrains] = useState<string[]>([]);

    const selectRow = (event: React.ChangeEvent<HTMLInputElement>): void => {

        const train_id: string = event.target.value;

        const current_selected: string[] = [...selectedTrains];

        if(current_selected.includes(train_id)){

            current_selected.splice(current_selected.indexOf(train_id), 1);

        } else {

            current_selected.push(train_id);

        }

        setSelectedTrains(current_selected);

    };

    const isTrainSelected = (train_id: string): boolean => {

        return selectedTrains.includes(train_id);

    };

    const [isChecked, setIsChecked] = useState<boolean>(true);

    const inverseSelection = (): void => {

        setIsChecked(prevChecked => !prevChecked);

        const current_ids: string[] = outputTrains.map(item => item.train_id);

        const selected: Set<string> = new Set(selectedTrains);

        const inverted: string[] = current_ids.filter(item => !selected.has(item));

        setSelectedTrains(inverted);

    };

    useEffect(() => {

        setSelectedTrains([]);

        setIsChecked(true);
        
    }, [stationFilter]);

    // Funkcje wyznaczania danych w tabeli

    function getMeasurementsResults(train: SynchronizedTrain, type?: Passengers): React.JSX.Element | string {

        const jobs: Job[] | undefined = train.jobs;

        const measurements: Measurement[] | undefined = train.measurements;

        if(!jobs || !measurements) return "-";

        //const measurements_data: Measurement[] = measurements.filter(item => item.station_id === stationFilter);  Czy to jest potrzebne???

        if(measurements.length > 0){

            /*

            const reduced = measurements_data.reduce<Record<string, Measurement>>((acc, obj) => {

                const key: string = `${obj.personal_id}-${obj.job_number}`;

                if(!acc[key] || obj.id > acc[key].id){

                    const job_check: Job | undefined = jobs.find(item => item.job_number === obj.job_number);

                    if(job_check && job_check.type === 'normal'){

                        acc[key] = obj;

                    }

                }

                return acc;

            }, {});

            const result: Measurement[] = Object.values(reduced);

            const sorted = result.sort((a, b) => a.recording_date.localeCompare(b.recording_date));

            */

            /*

            const reduced = measurements_data.reduce((acc, obj) => {

                const key = `${obj.personal_id}-${obj.job_number}`;
              
                if (!acc[key] || obj.id > acc[key].id) {

                    const job_check = jobs.find(item => item.job_number === obj.job_number);

                    if(job_check && job_check.type === 'normal'){

                        acc[key] = obj; 

                    }

                }
              
                return acc;

            }, {});

            const result = Object.values(reduced);

            */

            const sorted: Measurement[] = reduceMeasurements(jobs, measurements);

            if(type){
    
                return (
    
                    <>
    
                        {sorted.map((item, index) => (
                            <span key={index} className="train-number-split-main">{item[type]}</span>
                        ))}
    
                    </>
    
                );

            } else {

                return (
    
                    <>
    
                        {sorted.map((item, index) => (
                            <span key={index} className="train-number-split-main">{formatDate(item.recording_date)}</span>
                        ))}
    
                    </>
    
                );

            }

        } else {

            return "-";

        }

    }

    // Wyznaczanie danych użytkowników do wykonanych pomiarów

    function getUserNames(train: SynchronizedTrain): React.JSX.Element {

        const measurements: Measurement[] | undefined = train.measurements;

        const jobs: Job[] | undefined = train.jobs;

        if(jobs && measurements){

            //const measurements_data = measurements.filter(item => item.station_id === stationFilter); Czy to jest potrzebne ???

            const sorted: Measurement[] = reduceMeasurements(jobs, measurements);

            sorted.forEach(measurement => {

                const user_data: Users | undefined = users.find(user => user.personal_id === measurement.personal_id);

                if(user_data){

                    const user_name: string = (user_data.first_name && user_data.surname) ? user_data.first_name + " " + user_data.surname : user_data.username;

                    measurement.full_name = user_name;

                }

            });

            if(sorted.length > 0){

                return  <p className="user-list-paragraph">
                        {sorted.map((item, index) => (
                            <span className="user-list-span" key={index}>{item.full_name}</span>
                        ))}
                    </p>

            } else {

                return <span>-</span>;

            }

        } else {

            return <span>-</span>;

        }

    }

    // Redukowanie pomiarów

    function reduceMeasurements(jobs: Job[], measurements: Measurement[]): Measurement[] {

        const reduced = measurements.reduce<Record<string, Measurement>>((acc, obj) => {

            const key: string = `${obj.personal_id}-${obj.job_number}`;

            if(!acc[key] || obj.id > acc[key].id){

                const job_check: Job | undefined = jobs.find(item => item.job_number === obj.job_number);

                if(job_check && job_check.type === 'normal'){

                    acc[key] = obj;

                }

            }

            return acc;

        }, {});

        const result: Measurement[] = Object.values(reduced);

        result.sort((a, b) => a.recording_date.localeCompare(b.recording_date));

        return result;

    }

    // Importowanie listy pociągów

    const [trainListImport, setTrainListImport] = useState<string>('');

    const [importListMessage, setImportListMessage] = useState<string | null>(null);

    function showImportTrainList(): void {

        setModal({...modal, show: true, import_trains: true});

    }

    function importTrainList(): void {

        setImportListMessage(null);

        if(trainListImport === ''){

            return;

        }

        const all_trains: SynchronizedTrain[] = [...preFilteredTrains];

        const list_to_import: string = trainListImport;

        let list: string;

        if(!list_to_import.startsWith("[") || !list_to_import.endsWith("]")){

            list = "[" + list_to_import + "]";

        } else {

            list = list_to_import;

        }

        if(isValidJSON(list)){

            const parsed_list = JSON.parse(list);

            if(Array.isArray(parsed_list)){

                const array_of_trains: string[] = parsed_list; 

                const train_ids: string[] = all_trains.map(train => train.train_id);

                const train_ids_check: boolean = array_of_trains.every(element => train_ids.includes(element));

                if(!train_ids_check){

                    const missing_ids: string[] = array_of_trains.filter(element => !train_ids.includes(element));

                    const output: string = missing_ids.join(', ');

                    const output_message: string = "Błędna lista pociągów - następujących numerów nie ma na liście dla bieżącej stacji: " + output + ".";

                    setImportListMessage(output_message);

                } else {

                    setTime({start_hour: "00:00", end_hour: "23:59"});

                    const selection: string[] = all_trains.filter(obj => !array_of_trains.includes(obj.train_id)).map(obj => obj.train_id);

                    setSelectedTrains(selection);

                    closeModal();

                }

            }  else {

                setImportListMessage('Niewłaściwy format danych');

            }            

        } else {

            setImportListMessage('Niewłaściwy format danych');

        }

    }

    function handleTrainListImport(event: React.ChangeEvent<HTMLTextAreaElement>): void {

        const value: string = event.target.value;

        setTrainListImport(value);

    }

    function isValidJSON(str: string): boolean {

        try {

            JSON.parse(str);

            return true;

        } catch (error) {

            console.log(error);

            return false;

        }

    }

    // Tworzenie zadania

    const [jobToPrepare, setJobToPrepare] = useState<PreparedJob | null>(null);

    const [dateToPrepare, setDateToPrepare] = useState("");

    /*

    const [latestUserData, setLatestUserData] = useState<Users[]>([]);

    const [latestJobsData, setLatestJobsData] = useState<Job[]>([]);

    const [updatedUserJobsData, setUpdatedUserJobsData] = useState([]);

    useEffect(() => {

        if(latestUserData.length > 0){

            const update_data = [...latestUserData];

            if(latestJobsData.length > 0){

                update_data.forEach(user => {

                    const user_jobs = latestJobsData.filter(job => job.personal_id === user.personal_id);
    
                    let number_of_jobs = user_jobs.length;
    
                    let completed_jobs;
    
                    if(number_of_jobs > 0){
    
                        completed_jobs = user_jobs.filter(job => job.status === "zakończony" || job.status === 'zamknięty').length;
    
                    } else {
    
                        completed_jobs = 0;
    
                    }
    
                    user.number_of_jobs = number_of_jobs;
    
                    user.completed_jobs = completed_jobs;
    
                });
    
            } else {

                update_data.forEach(user => {
    
                    user.number_of_jobs = 0;
    
                    user.completed_jobs = 0;
    
                });

            }

            setUpdatedUserJobsData(update_data);

        }

    }, [latestJobsData, latestUserData]);

    */

    function prepareJob(type: string, kind: string, id?: string): void {

        if(kind === 'normal'){

            if(type === 'train'){

                const train: SynchronizedTrain | undefined = outputTrains.find(train => train.train_id === id);

                const days_list: Recording[] | undefined = train?.days;

                if(train && days_list){

                    const new_job_data: PreparedJob = {
                        kind: kind,
                        type: type,
                        first_station_name: train.first_station_name ?? "",
                        last_station_name: train.last_station_name ?? "",
                        train_number: train.train_number ?? "",
                        train_id: train.train_id,
                        date: days_list
                    }
            
                    setJobToPrepare(new_job_data);

                }
    
            } else if(type === 'station'){
    
                if(outputTrains.every(obj => selectedTrains.includes(obj.train_id))){
    
                    return;
    
                }
    
                const current_station: SortedStation | undefined = filteredStations.find(station => station.station_id === stationFilter);
    
                const days_list: Recording[] = recordings.filter(item => item.station_id === stationFilter);

                if(current_station){

                    const new_job_data: PreparedJob = {
                        kind: kind,
                        type: type,
                        station_id: current_station.station_id,
                        station_name: current_station.station_name,
                        date: days_list
                    }
        
                    setJobToPrepare(new_job_data);

                }
    
                
    
            }
    
        } else if(kind === 'check'){

            // Przygotowanie z poziomu panelu realizacji

            if(id){

                if(detailedJobData.filter(obj => obj.measurement && obj.measurement.length > 0).every(obj => selectedJobTrains.includes(obj.train_id))){
    
                    return;
    
                }

                const current_station_id: string | null = detailedJobInfo.station_id;
    
                const current_station_name: string | null = detailedJobInfo.station_name;

                const current_recording_date: string | null = detailedJobInfo.recording_date

                if(current_station_id && current_station_name && current_recording_date){

                    const days_list: Recording[] = recordings.filter(item => item.station_id === current_station_id && item.recording_date === current_recording_date);
        
                    const new_job_data = {
                        kind: kind,
                        type: type,
                        layer: 550,
                        station_id: current_station_id,
                        station_name: current_station_name,
                        date: days_list
                    }
            
                    setJobToPrepare(new_job_data);

                }

            // Przygotowanie z poziomu panelu postępu

            } else {

                if(updatedMeasurementSummaryData.filter(obj => obj.measurements.length > 0).every(obj => selectedMeasuredTrains.includes(obj.train_id))){
    
                    return;
    
                }
    
                const current_station_id: string | null = measurementSummaryData.station_id;
    
                const current_station_name: string | null = measurementSummaryData.station_name;

                const current_recording_date: string | null = detailedJobInfo.recording_date

                if(current_station_id && current_station_name && current_recording_date){

                    const days_list: Recording[] = recordings.filter(item => item.station_id === current_station_id && item.recording_date === current_recording_date);
    
                    const new_job_data = {
                        kind: kind,
                        type: type,
                        layer: 450,
                        station_id: current_station_id,
                        station_name: current_station_name,
                        date: days_list
                    }

                    setJobToPrepare(new_job_data);

                }

            }

        }

        setAppLayer(350);
    
        getLatestUserJobsData();

    }

    function getLatestUserJobsData(): void {

        const request_type: string = 'get user jobs';

        setSearching(true);

        Axios.post('classes/data.php', { request_type }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                if(data.jobs){

                    setJobs(data.jobs);

                }

                if(data.users){

                    setUsers(data.users);

                }

            } else {

                showError();

            }

            setSearching(false);

        }).catch((error) => {

            console.warn(error);

            showError();

            setSearching(false);

        });

    }

    // Tworzenie zadania - wybór daty nagrania

    useEffect(() => {

        if(jobToPrepare?.date && jobToPrepare.date.length > 0){

            setDateToPrepare(jobToPrepare.date[0].recording_date);

        }

    }, [jobToPrepare]);

    function onDatePrepareChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const value: string = event.target.value;

        setDateToPrepare(value);

    }

    // Tworzenie zadania

    const [chosenUser, setChosenUser] = useState<UpdatedUser | null>(null);

    function prepareCreateJob(user: UpdatedUser): void {

        setChosenUser(user);

        setModal({...modal, show: true, create_job: true});

    }

    // Dodatkowy komentarz do zadania

    const [jobComment, setJobComment] = useState<string>('');

    function handleComment(event: React.ChangeEvent<HTMLTextAreaElement>): void {

        const value: string = event.target.value;

        setJobComment(value);

    }

    // Tworzenie zadania w bazie danych

    function createJob(): void {

        setIsChecked(true);

        if(chosenUser && jobToPrepare){

            const personal_id: string = chosenUser.personal_id;

            const type: string = jobToPrepare.type;

            const kind: string = jobToPrepare.kind;

            let train_id: string | null = null;

            let station_id: string | null = null;

            let start_hour: string | null = null;

            let end_hour: string | null = null;

            let ids_list: string | null = null;

            let train_list_count: number | null = null;

            if(kind === 'normal'){

                if(type === 'train'){

                    train_id = jobToPrepare.train_id!;
        
                }
        
                if(type === 'station'){
        
                    station_id = jobToPrepare.station_id!;
        
                    if(selectedTrains.length === 0){
        
                        start_hour = time.start_hour;
        
                        end_hour = time.end_hour;
        
                    } else {
        
                        const filtered: SynchronizedTrain[] = outputTrains.filter(item => !selectedTrains.includes(item.train_id));
        
                        train_list_count = filtered.length;
        
                        ids_list = JSON.stringify(filtered.map(item => item.train_id));
        
                    }
        
                }

            } else if(kind === 'check'){

                station_id = jobToPrepare.station_id!;

                if(jobToPrepare.layer === 550){

                    const filtered = detailedJobData.filter(item => item.measurement && item.measurement.length > 0 && !selectedJobTrains.includes(item.train_id));
        
                    train_list_count = filtered.length;

                    ids_list = JSON.stringify(filtered.map(item => item.train_id));

                } else if(jobToPrepare.layer === 450){

                    const filtered = updatedMeasurementSummaryData.filter(item => item.measurements.length > 0 && !selectedMeasuredTrains.includes(item.train_id));
        
                    train_list_count = filtered.length;

                    ids_list = JSON.stringify(filtered.map(item => item.train_id));

                }

            }

            const recording_date: string = dateToPrepare;

            const comments: string = jobComment;

            const job_data: CreatedJob = {
                personal_id: personal_id,
                kind: kind,
                type: type,
                train_id: train_id,
                station_id: station_id,
                start_hour: start_hour,
                end_hour: end_hour,
                ids_list: ids_list,
                train_list_count: train_list_count,
                recording_date: recording_date,
                comments: comments
            }

            const request_type: string = 'create job';

            Axios.post('classes/job.php', { request_type, job_data }, { timeout: 5000 }).then(function(response){

                if(response.data === true){

                    setModal({...modal, show: true, create_job: false, info: true});

                    setModalMessage('Zadanie zostało utworzone.');

                    if(kind === 'normal'){

                        setSelectedTrains([]);

                        setAppLayer(300);

                    } else if(kind === 'check'){

                        setSelectedMeasuredTrains([]);

                        setAppLayer(400);

                    }

                    setJobToPrepare(null);

                    setJobComment('');

                    getData();
                    
                } else {

                    showError();

                }

            }).catch((error) => {

                console.warn(error);
                
                showError();

            });

        }

    }

    // Anulowanie tworzenia zadania

    function cancelPrepareJob(): void {

        if(jobToPrepare){

            //const kind: string = jobToPrepare.kind

            const layer: number = jobToPrepare.layer ?? 300;

            setJobToPrepare(null);

            setAppLayer(layer);

            /*

            if(kind === 'normal'){

                setAppLayer(300);

            } else {

                setAppLayer(jobToPrepare.layer);

            }

            */

        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Panel postępu

    const tableRef = useRef<HTMLDivElement | null>(null);

    const [scrollPosition, setScrollPosition] = useState<number>(0);

    const latestScrollPosition = useRef(scrollPosition);

    useEffect(() => {

        latestScrollPosition.current = scrollPosition;

    }, [scrollPosition]);

    /*

    const [progressJobs, setProgressJobs] = useState([]);

    const [progressStations, setProgressStations] = useState([]);

    const [progressDays, setProgressDays] = useState([]);

    const [progressUsers, setProgressUsers] = useState([]);

    */

    const [uniqueProgressDays, setUniqueProgressDays] = useState<string[]>([]);

    const [progressStartDates, setProgressStartDates] = useState<string[]>([]);

    const [progressEndDates, setProgressEndDates] = useState<string[]>([]);


    const getProgressData = useCallback(() => {

        const request_type = 'get progress data';

        setSearching(true);

        Axios.post('classes/data.php', { request_type }, { timeout: 20000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                if(data.stations){

                    setStations(data.stations);

                }

                if(data.recordings){

                    setRecordings(data.recordings);

                }

                if(data.jobs){

                    setJobs(data.jobs);

                }

                if(data.users){

                    setUsers(data.users);

                }

            } else {

                setSearching(false);

                showError();

            }

            setSearching(false);

        }).catch((error) => {

            console.warn(error);

            setSearching(false);

            showError();

        });

    }, [showError]);

    // Daty początkowa i końcowa

    const [progressFilters, setProgressFilters] = useState<ProgressFilters>({start_date: '', end_date: '', status: '', check: ''});

    const latestProgressFilters = useRef(progressFilters);

    useEffect(() => {

        latestProgressFilters.current = progressFilters;

    }, [progressFilters]);

    useEffect(() => {

        if(recordings.length > 0){

            const progressFilters: ProgressFilters = latestProgressFilters.current;

            const unique_dates: string[] = [...new Set(recordings.map(a => a.recording_date))];

            unique_dates.sort();

            setUniqueProgressDays(unique_dates);

            const date_objects: number[] = unique_dates.map(dateString => new Date(dateString).getTime());

            const max_date: Date = new Date(Math.max.apply(null, date_objects));
            
            const min_date: Date = new Date(Math.min.apply(null, date_objects));

            const formatted_max_date: string = max_date.toISOString().split('T')[0];

            const formatted_min_date: string = min_date.toISOString().split('T')[0];

            if(progressFilters.start_date === "" && progressFilters.end_date === ""){

                setProgressStartDates(unique_dates);

                setProgressEndDates(unique_dates);

                setProgressFilters({...progressFilters, start_date: formatted_min_date, end_date: formatted_max_date});

            }

        }

    }, [recordings]);

    
    /*

    useEffect(() => {

        if(progressDays.length > 0){

            const progressFilters = latestProgressFilters.current;

            const unique_dates = [...new Set(progressDays.map(a => a.recording_date))];

            const sorted_dates = unique_dates.sort();

            setUniqueProgressDays(sorted_dates);

            const dateObjects = sorted_dates.map(dateString => new Date(dateString));

            const maxDate = new Date(Math.max.apply(null, dateObjects));
            
            const minDate = new Date(Math.min.apply(null, dateObjects));

            const formattedMaxDate = maxDate.toISOString().split('T')[0];

            const formattedMinDate = minDate.toISOString().split('T')[0];

            if(progressFilters.start_date === "" && progressFilters.end_date === ""){

                setProgressStartDates(sorted_dates);

                setProgressEndDates(sorted_dates);

                setProgressFilters({...progressFilters, start_date: formattedMinDate, end_date: formattedMaxDate});

            }

        }

    }, [progressDays]);

    */

    // Zmiana filtrów daty

    function onSelectedProgressDayChange(event: React.ChangeEvent<HTMLSelectElement>){

        const value: string = event.target.value;

        const name: string = event.target.name;

        let current_start: string = progressFilters.start_date;

        let current_end: string = progressFilters.end_date;

        // Jeśli zmieniona została data poczatkowa

        if(name === 'start_date'){

            const filtered_dates: string[] = uniqueProgressDays.filter(date => {

                return new Date(date) >= new Date(value);

            });

            setProgressEndDates(filtered_dates)

            if(new Date(current_end) < new Date(value)){

                current_end = value;

            }

            setProgressFilters(prevFilters => {
                return {
                    ...prevFilters,
                    start_date: value,
                    end_date: current_end
                }
            });

        }

        // Jeśli została zmieniona data końcowa

        if(name === 'end_date'){

            const filtered_dates: string[] = uniqueProgressDays.filter(date => {

                return new Date(date) <= new Date(value);

            });

            setProgressStartDates(filtered_dates);

            if(new Date(current_start) > new Date(value)){

                current_start = value;

            }

            setProgressFilters(prevFilters => {
                return {
                    ...prevFilters,
                    start_date: current_start,
                    end_date: value
                }
            });

        }

        // Jeśli został zmieniony status lub stan kontroli

        if(name === 'status' || name === 'check'){

            setProgressFilters(prevFilters => {
                return {
                    ...prevFilters,
                    [name]: value
                }
            });

        }

    }





    /*

    useEffect(() => {

        if(jobs.length > 0 && users.length > 0){

            const progress_jobs: Job[] = [...jobs];

            const updated_jobs: UpdatedProgressJob[] = progress_jobs.map(job => {

                const user_search: UpdatedUser | undefined = updatedUsers.find(u => u.personal_id === job.personal_id);

                return {
                    ...job,
                    user_full_name: user_search ? (user_search.first_name && user_search.surname ? user_search.first_name + " " + user_search.surname : user_search.username) : "-"
                }

            });

            setUpdatedProgressJobs(updated_jobs);

            const unique_statuses: string[] = [...new Set(progress_jobs.map(a => a.status))];

            let index = unique_statuses.indexOf('wydany');

            if(index !== -1){

                unique_statuses[index] = 'nierozpoczęty';

            }

            unique_statuses.sort();

            setUniqueJobStatuses(unique_statuses);

        }
        
    }, [jobs, updatedUsers]);

    useEffect(() => {

        if(uniqueProgressJobStatuses.length > 0 && updatedProgressData.length > 0){

            const statuses = [...uniqueProgressJobStatuses];

            if(updatedProgressData.some(obj => obj.normal_jobs.length === 0)){

                statuses.unshift('niewydany');

            } 

            setUniqueProgressStatuses(statuses);

        }
        
    }, [uniqueProgressJobStatuses, updatedProgressData]);

    */

    const [updatedProgressData, setUpdatedProgressData] = useState<UpdatedProgressData[]>([]);

    const [filteredProgressData, setFilteredProgressData] = useState<UpdatedProgressData[]>([]);

    const [uniqueProgressStatuses, setUniqueProgressStatuses] = useState<string[]>([]);

    useEffect(() => {

        if(recordings.length > 0 && stations.length > 0 && jobs.length > 0 && updatedUsers.length > 0){

            // Dopisywanie imienia i nazwiska do zadań

            const progress_jobs: Job[] = [...jobs];

            const updated_jobs: UpdatedProgressJob[] = progress_jobs.map(job => {

                const user_search: UpdatedUser | undefined = updatedUsers.find(u => u.personal_id === job.personal_id);

                return {
                    ...job,
                    user_full_name: user_search ? user_search.full_name : ""
                }

            });

            // Generowanie danych - łączenie dni z zadaniami

            const progress_recordings: Recording[] = [...recordings];

            const updated_progress_data: UpdatedProgressData[] = progress_recordings.map(day => {

                const station_id: string = day.station_id;

                const recording_date: string = day.recording_date;

                const station_search = stations.find(u => u.station_id === station_id);

                const station_name: string = station_search?.name ?? "";

                const normal_jobs_array: UpdatedProgressJob[] = updated_jobs.filter(item => item.station_id === station_id && item.recording_date === recording_date && item.type === 'normal');

                const check_jobs_array: UpdatedProgressJob[] = updated_jobs.filter(item => item.station_id === station_id && item.recording_date === recording_date && item.type === 'check');

                return {
                    recording_date: recording_date,
                    station_id: station_id,
                    station_name: station_name,
                    normal_jobs: normal_jobs_array,
                    check_jobs: check_jobs_array,
                }

            });

            setUpdatedProgressData(updated_progress_data);

            // Określanie unikalnych statusów zadań

            const unique_statuses: string[] = [...new Set(progress_jobs.map(a => a.status))];

            const index: number = unique_statuses.indexOf('wydany');

            if(index !== -1){

                unique_statuses[index] = 'nierozpoczęty';

            }

            if(updated_progress_data.some(obj => obj.normal_jobs.length === 0)){

                unique_statuses.unshift('niewydany');

            } 

            unique_statuses.sort();

            setUniqueProgressStatuses(unique_statuses);

        }
        
    }, [recordings, stations, jobs, updatedUsers]);

    useEffect(() => {

        if(updatedProgressData.length > 0){

            const start_date: Date = new Date(progressFilters.start_date);

            const end_date: Date = new Date(progressFilters.end_date);

            function status(item: UpdatedProgressData): boolean {

                if(progressFilters.status === ''){

                    return true;

                }

                if(progressFilters.status === "niewydany"){

                    return item.normal_jobs.length === 0;
    
                }

                const status: string = progressFilters.status === 'nierozpoczęty' ? 'wydany' : progressFilters.status;

                return item.normal_jobs.some(job => job.status === status) || item.check_jobs.some(job => job.status === status);
    
            }

            function check(item: UpdatedProgressData): boolean {

                if(progressFilters.check === "yes"){

                    return item.check_jobs.length > 0;

                }

                if(progressFilters.check === "no"){

                    return item.check_jobs.length === 0;

                }

                return true;

            }

            const current_filtered: UpdatedProgressData[] = updatedProgressData.filter(item => {

                const recording_date: Date = new Date(item.recording_date);

                return recording_date >= start_date && recording_date <= end_date && status(item) && check(item);

            });

            current_filtered.sort((a, b) => new Date(a.recording_date).getTime() - new Date(b.recording_date).getTime());

            setFilteredProgressData(current_filtered);

        }
        
    }, [updatedProgressData, progressFilters]);




















    // Wyświetlanie szczegółów zadania - 450

    const [measurementSummaryData, setMeasurementSummaryData] = useState<MeasurementSummaryData>({date: null, measurements: [], trains: [], station_id: null, station_name: null});

    function showDetailedPoint(day: UpdatedProgressData): void {

        setIsMeasuredTrainChecked(true);

        setSelectedMeasuredTrains([]);

        const jobs_data: UpdatedProgressJob[] = day.normal_jobs;

        const train_list: string[] = [];

        const station_id: string = day.station_id;

        const station_data: Station | undefined = stations.find(station => station.station_id === station_id);

        const station_name: string = station_data?.name ?? "";

        const recording_date: string = day.recording_date;

        const filtered_trains: SynchronizedTrain[] = updatedTrains.filter(train => train.stops.some(train_stop => train_stop.station_id === station_id));

        jobs_data.forEach(job => {

            if(job.train_list){

                train_list.push(...JSON.parse(job.train_list));

            } else {

                const hour1: number = ( new Date(`1970-01-01T${time.start_hour}`) ).getTime();

                const hour2: number = ( new Date(`1970-01-01T${time.end_hour}`) ).getTime();

                let start_hour: number;

                let end_hour: number;

                if(hour1 > hour2){

                    start_hour = hour2;

                    end_hour = hour1;

                } else {

                    start_hour = hour1;

                    end_hour = hour2;

                }

                filtered_trains.forEach(train => {

                    const station_match: TrainStop | undefined = train.stops.find(item => item.station_id === station_id);

                    if(station_match){
    
                        const chosen_value: string = station_match.departure_hour ? station_match.departure_hour : station_match.arrival_hour!;

                        const compared_time: number = ( new Date(`1970-01-01T${chosen_value}`) ).getTime();
    
                        if(compared_time >= start_hour && compared_time <= end_hour){

                            train_list.push(train.train_id);

                        }

                    }

                });

            }

        });

        const unique_trains: string[] = [...new Set(train_list)];

        const unique_array: TrainIdList[] = unique_trains.map(value => ({ train_id: value }));
        
        const request_type: string = 'get measurements data';

        setSearching(true);

        Axios.post('classes/data.php', { request_type, station_id, recording_date, unique_trains }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                if(data.measurements){

                    const scroll_position: number = tableRef.current?.scrollTop ?? 0;

                    setScrollPosition(scroll_position);

                    setAppLayer(450);

                    setMeasurementSummaryData(
                        {
                            date: recording_date, 
                            measurements: response.data.measurements, 
                            trains: unique_array, 
                            station_id: station_id, 
                            station_name: station_name
                        }
                    );

                } else {

                    showError();

                }

            } else {

                showError();

            }

            setSearching(false);

        }).catch((error) => {

            console.warn(error);

            showError();

            setSearching(false);

        });

    }

    useEffect(() => {

        if(measurementSummaryData.trains.length > 0 && measurementSummaryData.station_id && measurementSummaryData.station_name){

            const trains_data: TrainIdList[] = measurementSummaryData.trains;

            const measurements_data: Measurement[] = measurementSummaryData.measurements;

            const station_id: string = measurementSummaryData.station_id;

            const station_name: string = measurementSummaryData.station_name;

            let unique_measurements: Measurement[];

            if(measurements_data.length > 0){

                unique_measurements = Array.from(

                    measurements_data.reduce((map, obj) => {

                        const key = `${obj.train_id}-${obj.job_number}`;

                        if(!map.has(key) || map.get(key).id < obj.id){

                            map.set(key, obj);

                        }

                        return map;

                    }, new Map()).values()

                );
    
            } else {

                unique_measurements = measurements_data;

            }

            const updated_measurements_data: UpdatedMeasurementSummaryData[] = trains_data.map(train => {

                const train_id: string = train.train_id;

                const train_match: SynchronizedTrain | undefined = updatedTrains.find(item => item.train_id === train_id);

                const station_match: TrainStop | undefined = train_match?.stops.find(item => item.station_id === station_id);

                const arrival_hour: string | null = station_match ? station_match.arrival_hour : null;

                const departure_hour: string | null = station_match ? station_match.departure_hour : null;

                const train_measurements: Measurement[] = unique_measurements.filter(item => item.train_id === train_id);

                const updated_train_measurements: UpdatedSummaryMeasurement[] = train_measurements.map(measurement => {

                    const user_match: UpdatedUser | undefined = updatedUsers.find(user => user.personal_id === measurement.personal_id);

                    const job_match: Job | undefined = jobs.find(job => job.job_number === measurement.job_number);

                    const measured_arrival_hour: string | null = measurement.arrival_hour;

                    const measured_departure_hour: string | null = measurement.departure_hour;

                    let arrival_difference: number = 0;

                    let departure_difference: number = 0;

                    if(arrival_hour && measured_arrival_hour){

                        arrival_difference = calculateMeasurementTimeDifference(arrival_hour, measured_arrival_hour);

                    }

                    if(departure_hour && measured_departure_hour){

                        departure_difference = calculateMeasurementTimeDifference(departure_hour, measured_departure_hour);

                    }

                    return {
                        ...measurement,
                        arrival_difference: arrival_difference,
                        departure_difference: departure_difference,
                        job_type: job_match?.type ?? "",
                        full_name: user_match?.full_name ?? ""
                    }

                });

                return {
                    arrival_hour: station_match?.arrival_hour ?? null,
                    departure_hour: station_match?.departure_hour ?? null,
                    platform: station_match?.platform_number ?? null,
                    relation: (train_match && train_match.first_station_name && train_match.last_station_name) ? train_match.first_station_name + " - " + train_match.last_station_name : "",
                    measurements: updated_train_measurements,
                    station_name: station_name,
                    train_id: train_id,
                    train_number: (train_match && train_match.train_number) ? train_match.train_number : ""
                }

            });

            const sorted = sortTrainsByHours(updated_measurements_data) as UpdatedMeasurementSummaryData[];

            setUpdatedMeasurementSummaryData(sorted);

            function calculateMeasurementTimeDifference(hour1: string, hour2: string): number {

                if (hour1.length === 5) hour1 += ":00";

                if (hour2.length === 5) hour2 += ":00";

                const today: string = new Date().toISOString().slice(0, 10); 

                const date1: Date = new Date(`${today}T${hour1}`);

                const date2: Date = new Date(`${today}T${hour2}`);

                if( ( hour1.startsWith("22") || hour1.startsWith("23") ) && ( hour2.startsWith("00") || hour2.startsWith("01") ) ){

                    date2.setDate(date2.getDate() + 1);

                }

                const difference_in_millis: number = date2.getTime() - date1.getTime();
                    
                const difference_in_minutes: number = Math.floor(difference_in_millis / (1000 * 60));

                return difference_in_minutes;

            }

        }

    }, [measurementSummaryData, updatedTrains, stations, updatedUsers, jobs, sortTrainsByHours]);

    const [updatedMeasurementSummaryData, setUpdatedMeasurementSummaryData] = useState<UpdatedMeasurementSummaryData[]>([]);   

    const [outputMeasurementSummaryData, setOutputMeasurementSummaryData] = useState<UpdatedMeasurementSummaryData[]>([]);

    const [measurementSummarySorting, setMeasurementSummarySorting] = useState<MeasurementSummarySorting>({attribute: null, direction: null})

    useEffect(() => {

        if(updatedMeasurementSummaryData.length > 0){

            const current: UpdatedMeasurementSummaryData[] = [...updatedMeasurementSummaryData];

            if(measurementSummarySorting.attribute && measurementSummarySorting.direction){

                const attribute: string = measurementSummarySorting.attribute;

                const direction: string = measurementSummarySorting.direction;

                const multiplier: number = direction === 'descending' ? -1 : 1;

                switch (attribute){

                    case 'accuracy':
                    case 'entered_sum':
                    case 'exited_sum':
                        // falls through

                        current.forEach(item => {

                            item.measurements.sort((a, b) => (a[attribute] - b[attribute]) * multiplier);

                        });

                        current.sort((a, b) => {

                            const valueA = a.measurements.length > 0 ? a.measurements[0][attribute] : 0;

                            const valueB = b.measurements.length > 0 ? b.measurements[0][attribute] : 0;

                            return (valueA - valueB) * multiplier;

                        });

                        break;

                    case 'arrival_hour':
                    case 'departure_hour': {

                        const fallback_attribute: 'departure_hour' | 'arrival_hour' = attribute === 'arrival_hour' ? 'departure_hour' : 'arrival_hour';

                        current.sort((a, b) => {

                            const timeA = a[attribute] || a[fallback_attribute] as string;

                            const timeB = b[attribute] || b[fallback_attribute] as string;

                            const dateA: number = new Date(`1970-01-01T${timeA}`).getTime();

                            const dateB: number = new Date(`1970-01-01T${timeB}`).getTime();

                            return (dateA - dateB) * multiplier;

                        });

                        break;

                    }

                    case "arrival_difference":
                    case "departure_difference":
                        
                        //const calculate_attribute = attribute === 'arrival_difference' ? 'arrival_hour' : 'departure_hour';

                        //calculateMeasurementTimeDifference(current, calculate_attribute);

                        current.forEach(item => {

                            item.measurements.sort((a, b) => (a[attribute] - b[attribute]) * multiplier);

                        });

                        current.sort((a, b) => {

                            const differenceA = a.measurements.length > 0 ? a.measurements[0][attribute] : 0;

                            const differenceB = b.measurements.length > 0 ? b.measurements[0][attribute] : 0;

                            return (differenceA - differenceB) * multiplier;

                        });
                        
                        break;

                    case 'total_exchange':

                        current.forEach(item => {
    
                            item.measurements.sort((a, b) => ((a.entered_sum + a.exited_sum) - (b.entered_sum + b.exited_sum)) * multiplier);
        
                        });
        
                        current.sort((a, b) => {
        
                            const exchangeA = a.measurements.length > 0 ? (a.measurements[0].entered_sum + a.measurements[0].exited_sum) : 0;
        
                            const exchangeB = b.measurements.length > 0 ? (b.measurements[0].entered_sum + b.measurements[0].exited_sum) : 0;
        
                            return (exchangeA - exchangeB) * multiplier;
        
                        });

                        break;

                    case 'train_number':

                        current.sort((a, b) => {
            
                            return a.train_number.localeCompare(b.train_number) * multiplier;
        
                        });

                        break;

                    default:
                    
                }

                setOutputMeasurementSummaryData(current);

            } else {

                setOutputMeasurementSummaryData(current);

            }

        }

        /*

        function calculateMeasurementTimeDifference(data, attribute){

            data.forEach(item => {
    
                const measurements = item.measurements;

                let attribute_value = item[attribute];

                measurements.forEach(measurement => {

                    if(attribute_value && measurement[attribute]){

                        let measured_attribute_value = measurement[attribute];

                        if (attribute_value.length === 5) attribute_value += ":00";

                        if (measured_attribute_value.length === 5) measured_attribute_value += ":00";

                        const today = new Date().toISOString().slice(0, 10); 

                        const date1 = new Date(`${today}T${attribute_value}`);

                        let date2 = new Date(`${today}T${measured_attribute_value}`);

                        if(attribute_value.startsWith("23") && measured_attribute_value.startsWith("00")){

                            date2.setDate(date2.getDate() + 1);

                        }
                    
                        const differenceInMillis = date2 - date1;
                    
                        const differenceInMinutes = Math.floor(differenceInMillis / (1000 * 60));

                        measurement.difference = differenceInMinutes;

                    } else {

                        measurement.difference = 0;

                    }

                });

            });

        }

        */

    }, [updatedMeasurementSummaryData, measurementSummarySorting]);

    const [selectedMeasuredTrains, setSelectedMeasuredTrains] = useState<string[]>([]);

    const selectMeasurementRow = (event: React.ChangeEvent<HTMLInputElement>): void => {

        const train_id: string = event.target.value;

        const current_selected: string[] = [...selectedMeasuredTrains];

        if(current_selected.includes(train_id)){

            current_selected.splice(current_selected.indexOf(train_id), 1);

        } else {

            current_selected.push(train_id);

        }

        setSelectedMeasuredTrains(current_selected);

    };

    const isMeasuredTrainSelected = (train_id: string): boolean => {

        return selectedMeasuredTrains.includes(train_id);

    };

    const [isMeasuredTrainChecked, setIsMeasuredTrainChecked] = useState<boolean>(true);

    const inverseMeasuredSelection = (): void => {

        setIsMeasuredTrainChecked(prevChecked => !prevChecked);

        const current_ids: string[] = updatedMeasurementSummaryData.map(item => item.train_id);

        const current_selected: string[] = [...selectedMeasuredTrains];

        current_ids.forEach(value => {

            if(current_selected.includes(value)){

                current_selected.splice(current_selected.indexOf(value), 1);

            } else {

                current_selected.push(value);

            }

        });

        setSelectedMeasuredTrains(current_selected);

    };

    function getAccuracy(accuracy: number): string {

        if(accuracy === 5){
            return "99 %";
        }

        if(accuracy === 4){
            return "95 %";
        }

        if(accuracy === 3){
            return "90 %";
        }

        if(accuracy === 2){
            return "80 %";
        }

        if(accuracy === 1){
            return "<80 %";
        }

        return "";

    }

    function getJobType(job_type: 'normal' | 'check'): string {

        if(job_type === 'normal'){
            return "zwykłe";
        }

        if(job_type === 'check'){
            return "kontrolne";
        }

        return "";

    }

    function cancelDetailedProgressView(){

        setMeasurementSummaryData({date: null, measurements: [], trains: [], station_id: null, station_name: null});

        setAppLayer(400);

    }

    // Sortowanie pociągów

    function sortMeasurementSummaryTable(attribute: string): void {

        const current_attribute = measurementSummarySorting.attribute;

        const current_direction = measurementSummarySorting.direction;

        let new_direction;

        if(attribute === current_attribute){

            new_direction = current_direction === 'ascending' ? 'descending' : 'ascending';

        } else {

            new_direction = 'descending';

        }

        setMeasurementSummarySorting({attribute: attribute, direction: new_direction});

    }




















    ///////////////////////////////////////

    // Podgląd zadań

    /*

    const [jobsData, setJobsData] = useState([]);

    const [userData, setUserData] = useState([]);

    const [measurementsData, setMeasurementsData] = useState([]);

    */

    const getJobsData = useCallback((): void => {

        const request_type = 'get jobs data';

        setSearching(true);

        Axios.post('classes/data.php', { request_type }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                if(data.jobs){

                    setJobs(data.jobs);

                } 

                if(data.users){

                    setUsers(data.users);

                }

                if(data.measurements){

                    setMeasurements(data.measurements);

                }

            } else {

                showError();

            }

            setSearching(false);

        }).catch((error) => {

            console.warn(error);

            showError();

            setSearching(false);

        });

    }, [showError]);

    

    // Łączenie danych na temat zadań

    const [updatedCompletionJobsData, setUpdatedCompletionJobsData] = useState<UpdatedCompletionJob[]>([]);

    useEffect(() => {

        if(jobs.length > 0 && updatedUsers.length > 0 && stations.length > 0 && trains.length > 0 && trainNumbers.length > 0){

            const updated_jobs: UpdatedCompletionJob[] = jobs.map(job => {

                const user_data: UpdatedUser | undefined = updatedUsers.find(user => user.personal_id === job.personal_id);

                const full_name: string = user_data?.full_name ?? "brak użytkownika";

                let station_name: string | null = null;

                let train_number: string | null = null;

                let first_station_name: string | null = null;

                let last_station_name: string | null = null;

                if(job.station_id){

                    const station_data: Station | undefined = stations.find(stations => stations.station_id === job.station_id);

                    station_name = station_data?.name ?? "";

                }

                if(job.train_id){

                    const train_data: TrainNumber | undefined = trainNumbers.find(train => train.train_id === job.train_id);

                    if(train_data){

                        train_number = train_data.train_number;

                        const first_station_data = stations.find(station => station.station_id === train_data.first_station);

                        const last_station_data = stations.find(station => station.station_id === train_data.last_station);

                        first_station_name = first_station_data?.name ?? "";

                        last_station_name = last_station_data?.name ?? "";

                    }

                }

                const created_on: string = job.creation_date.split(' ')[0];

                return {
                    ...job,
                    created_on: created_on,
                    full_name: full_name,
                    station_name: station_name,
                    train_number: train_number,
                    first_station_name: first_station_name,
                    last_station_name: last_station_name,
                }

            });

            setUpdatedCompletionJobsData(updated_jobs);

        }

    }, [jobs, updatedUsers, stations, trains, trainNumbers]);

    // Filtry widoku zadań

    ///////////////////////////////////////////////////////////////////////////

    // Unikalne daty sposród wszystkich zadań

    const [uniqueJobsDays, setUniqueJobsDays] = useState<string[]>([]);

    // Daty początkowa i końcowa

    const [startJobsDates, setStartJobsDates] = useState<string[]>([]);

    const [endJobsDates, setEndJobsDates] = useState<string[]>([]);

    // Aktualne filtry - daty początkowej i końcowej

    const [dateJobsFilters, setDateJobsFilters] = useState<DateJobsFilters>({job_start_date: '', job_end_date: ''});

    // Wyodrębnianie minimalnej i maksymalnej daty i ustawianie domyślnego zakresu

    const [dateRange, setDateRange] = useState<DateRange>({min: "", max: ""});

    useEffect(() => {

        if(uniqueJobsDays.length > 0){ 

            const date_objects: number[] = uniqueJobsDays.map(dateString => new Date(dateString).getTime());

            const max_date: Date = new Date(Math.max.apply(null, date_objects));
            
            const min_date: Date = new Date(Math.min.apply(null, date_objects));

            const formatted_max_date = max_date.toISOString().split('T')[0];

            const formatted_min_date = min_date.toISOString().split('T')[0];

            setDateRange({min: formatted_min_date, max: formatted_max_date});

            setDateJobsFilters({job_start_date: formatted_min_date, job_end_date: formatted_max_date});

        }
        
    }, [uniqueJobsDays]);

    // Zmiana filtrów daty

    function onJobsDateChange(event: React.ChangeEvent<HTMLSelectElement>){

        const value: string = event.target.value;

        const name: string = event.target.name;

        let current_start: string = dateJobsFilters.job_start_date;

        let current_end: string = dateJobsFilters.job_end_date;

        // Jeśli zmieniona została data poczatkowa

        if(name === 'job_start_date'){

            const filteredDates: string[] = uniqueJobsDays.filter(date => {

                return new Date(date) >= new Date(value);

            });

            setEndJobsDates(filteredDates);

            if(new Date(current_end) < new Date(value)){

                current_end = value;

            }

            setDateJobsFilters({
                job_start_date: value,
                job_end_date: current_end
            });

        }

        // Jeśli została zmieniona data końcowa

        if(name === 'job_end_date'){

            const filteredDates: string[] = uniqueJobsDays.filter(date => {

                return new Date(date) <= new Date(value);

            });

            setStartJobsDates(filteredDates);

            if(new Date(current_start) > new Date(value)){

                current_start = value;

            }

            setDateJobsFilters({
                job_start_date: current_start,
                job_end_date: value
            });

        }

    }

    // Unikalne stacje występujące w zadaniu

    const [uniqueJobsStations, setUniqueJobsStations] = useState<SortedStation[]>([]);

    ///////////////////////////////////////////////////////////////////////////

    // Filtrowanie - stacja

    const [jobsStationFilter, setJobsStationFilter] = useState<string>('');

    const [filteredJobsStations, setFilteredJobsStations] = useState<SortedStation[]>([]);

    function onJobsStationChange(event: React.ChangeEvent<HTMLSelectElement>){

        const value: string = event.target.value;

        setJobsStationFilter(value);

    }

    /*

    // Wyodrębnianie unikalnych stacji

    useEffect(() => {

        if(updatedCompletionJobsData.length > 0 && stations.length > 0){

            const sortedStations: SortedStation[] = getUniqueStations([...updatedCompletionJobsData], [...stations]);

            setUniqueJobsStations(sortedStations);

            setFilteredJobsStations(sortedStations);

        }
        
    }, [updatedCompletionJobsData, stations, getUniqueStations]);

    */

    ///////////////////////////////////////////////////////////////////////////

    // Filtrowanie - pomiarowiec

    const [uniqueJobsUsers, setUniqueJobsUsers] = useState<string[]>([]);

    const [filteredJobsUsers, setFilteredJobsUsers] = useState<string[]>([]);

    const [jobsUserFilter, setJobsUserFilter] = useState<string>("");

    function onJobUserChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const value: string = event.target.value;

        setJobsUserFilter(value);

    }

    ///////////////////////////////////////////////////////////////////////////

    // Data wydania zadania

    const [uniqueJobsScheduleDays, setUniqueJobsScheduleDays] = useState<string[]>([]);

    const [filteredJobsScheduleDays, setFilteredJobsScheduleDays] = useState<string[]>([]);

    const [scheduleDateJobsFilters, setScheduleDateJobsFilters] = useState<string>("");

    function onScheduleJobsDateChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const value: string = event.target.value;

        setScheduleDateJobsFilters(value);

    }

    ///////////////////////////////////////////////////////////////////////////

    // Rodzaje zadań

    const [filteredJobsTypes, setFilteredJobsTypes] = useState<TypeJobsFilter[]>([]);

    // Statusy zadań

    const [filteredJobsStatuses, setFilteredJobsStatuses] = useState<StatusJobsFilter[]>([]);

    // Filtrowanie - rodzaj zadania i stan wykonania

    const [jobStatusFilter, setJobStatusFilter] = useState<{job_type: string; job_status: string;}>({job_type: '', job_status: ''});

    function onjobStatusFilterChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const {name, value} = event.target;

        setJobStatusFilter(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        });

    }

    ///////////////////////////////////////////////////////////////////////////

    // Wyodrębnianie danych początkowy i przy filtrowaniu

    const handleCompletionJobsData = useCallback((jobs: UpdatedCompletionJob[], stations: Station[], handle_all: boolean): void => {

        // Wyodrębnianie unikalnych dat

        const unique_dates_array: string[] = [...new Set(jobs.map(a => a.recording_date))];

        unique_dates_array.sort();

        setStartJobsDates(unique_dates_array);

        setEndJobsDates(unique_dates_array);

        // Wyodrębnianie stacji

        const sortedStations: SortedStation[] = getUniqueStations(jobs, stations);

        setFilteredJobsStations(sortedStations);

        // Wyodrębnianie unikalnych pomiarowców

        const unique_users_array: string[] = [...new Set(jobs.map(a => a.full_name))];
            
        unique_users_array.sort((a, b) => {

            const last_name_A = a.split(' ')[1];

            const last_name_B = b.split(' ')[1];

            return last_name_A.localeCompare(last_name_B);

        });

        setFilteredJobsUsers(unique_users_array);

        // Wyodrębnianie unikalnych dat wydania zadań

        const unique_release_days_array: string[] = [...new Set(jobs.map(a => a.created_on))];

        unique_release_days_array.sort();

        setFilteredJobsScheduleDays(unique_release_days_array);

        // Wyodrębnianie unikalnych rodzajów zadań

        const unique_types: TypeJobsFilter[] = getUniqueTypes(jobs);

        setFilteredJobsTypes(unique_types)

        // Wyodrębnianie unikalnych statusów

        const unique_statuses: StatusJobsFilter[] = getUniqueStatuses(jobs);

        unique_statuses.sort((a, b) => {

            if(a.status_name < b.status_name){

                return -1;

            }

            if(a.status_name > b.status_name){

                return 1;

            }

            return 0;

        });

        setFilteredJobsStatuses(unique_statuses);

        // Dla danych początkowych

        if(handle_all){

            setUniqueJobsDays(unique_dates_array);

            setUniqueJobsStations(sortedStations);

            setUniqueJobsUsers(unique_users_array);

            setUniqueJobsScheduleDays(unique_release_days_array);

        }

    }, [getUniqueStations, getUniqueTypes, getUniqueStatuses]);

    // Wyodrębnianie początkowych unikalnych wartości spośród wszystkich zadań
    
    useEffect(() => {

        if(updatedCompletionJobsData.length > 0 && stations.length > 0){

            handleCompletionJobsData([...updatedCompletionJobsData], [...stations], true);

        }
        
    }, [updatedCompletionJobsData, stations, handleCompletionJobsData]);

    ///////////////////////////////////////////////////////////////////////////

    // Wyodrębnianie aktualnej listy zadań według zastosowanych filtrów

    const [filteredJobsData, setFilteredJobsData] = useState<UpdatedCompletionJob[]>([]);

    useEffect(() => {

        if(updatedCompletionJobsData.length > 0){

            const filtered_data: UpdatedCompletionJob[] = updatedCompletionJobsData.filter(job => {

                const is_recording_date_valid: boolean = (!dateJobsFilters.job_start_date || !dateJobsFilters.job_end_date) ||
                    (new Date(job.recording_date) >= new Date(dateJobsFilters.job_start_date) && new Date(job.recording_date) <= new Date(dateJobsFilters.job_end_date));

                const is_station_id_valid: boolean = !jobsStationFilter || job.station_id === jobsStationFilter;

                const is_full_name_valid: boolean = !jobsUserFilter || job.full_name === jobsUserFilter;

                const is_created_on_valid: boolean = !scheduleDateJobsFilters || job.created_on === scheduleDateJobsFilters;

                const is_type_valid: boolean = !jobStatusFilter.job_type || job.type === jobStatusFilter.job_type;

                const is_status_valid: boolean = !jobStatusFilter.job_status || job.status === jobStatusFilter.job_status;

                return is_recording_date_valid && is_station_id_valid && is_full_name_valid && is_created_on_valid && is_type_valid && is_status_valid;

            });

            setFilteredJobsData(filtered_data);

        }

    }, [updatedCompletionJobsData, dateJobsFilters, jobsStationFilter, jobsUserFilter, scheduleDateJobsFilters, jobStatusFilter]);

    useEffect(() => {

        if(filteredJobsData.length > 0 && stations.length > 0){

            handleCompletionJobsData([...updatedCompletionJobsData], [...stations], false);

        }

    }, [filteredJobsData, updatedCompletionJobsData, stations, handleCompletionJobsData]);

    function clearAllFilters(): void {

        setDateJobsFilters({job_start_date: dateRange.min, job_end_date: dateRange.max});

        setJobsStationFilter('');

        setJobsUserFilter('');

        setScheduleDateJobsFilters('');

        setJobStatusFilter({job_type: '', job_status: ''});

    }

    // Wyliczenie liczby pomiarów 

    function getMeasurementsCount(train: SynchronizedTrain): React.JSX.Element | string {

        const measurements: Measurement[] = train.measurements ?? [];

        const measurements_data: Measurement[] = measurements.filter(item => item.station_id === stationFilter);

        const jobs: Job[] | undefined = train.jobs;

        const count = measurements_data.reduce<Record<string, CountedMeasurement>>((acc, obj) => {

            const job_check = jobs?.find(item => item.job_number === obj.job_number);

            if(job_check && job_check.type === 'normal'){

                const key = `${obj.job_number}|${obj.recording_date}`;

                if(!acc[key]){

                    acc[key] = { job_number: obj.job_number, recording_date: obj.recording_date, count: 0 };

                }

                acc[key].count++;
                
            }

            return acc;

        }, {});
        
        const result: CountedMeasurement[] = Object.values(count);

        result.sort((a, b) => a.recording_date.localeCompare(b.recording_date));

        if(result.length > 0){

            return (

                <>

                    {result.map((item, index) => (
                        <span key={index} className="train-number-split-main">{item.count}</span>
                    ))}

                </>

            );

        } else {

            return "-";

        }

    }

    


























    // Szczegółowy podgląd zadania - 550

    const jobTableRef = useRef<HTMLDivElement | null>(null);

    const [jobScrollPosition, setJobScrollPosition] = useState<number>(0);

    const latestJobScrollPosition = useRef(jobScrollPosition);

    useEffect(() => {

        latestJobScrollPosition.current = jobScrollPosition;

    }, [jobScrollPosition]);

    function showDetailedJob(job: UpdatedCompletionJob): void {

        const job_number: number = job.job_number;

        const station_id: string | null = job.station_id;

        const train_id: string | null = job.train_id;

        const recording_date: string = job.recording_date;

        getDetailedJobData(job, job_number, recording_date, station_id, train_id);

    }

    function getDetailedJobData(job: UpdatedCompletionJob, job_number: number, recording_date: string, station_id: string | null, train_id: string | null): void {

        setDetailedJobInfo({
            type: null,
            job_number: null,
            station_id: null,
            station_name: null,
            train_number: null,
            train_relation: null,
            recording_date: null
        });

        setDetailedJobData([]);

        const scroll_position: number = jobTableRef.current?.scrollTop ?? 0;

        setJobScrollPosition(scroll_position);

        setAppLayer(550);

        const request_type = 'get detailed job data';

        Axios.post('classes/data.php', { request_type, job_number, recording_date, station_id, train_id }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                prepareDetailedJobView(data, job);

                //setAppLayer(450);

                //setMeasurementSummaryData({date: recording_date, measurements: response.data.measurements, trains: unique_array, station_id: station_id, station_name: station_name});

            } else {

                showError();

            }

            setSearching(false);

        }).catch((error) => {

            console.warn(error);

            showError();

            setSearching(false);

        });

    }

    const [detailedJobInfo, setDetailedJobInfo] = useState<DetailedJobInfo>({
        type: null,
        job_number: null,
        station_id: null,
        station_name: null,
        train_number: null,
        train_relation: null,
        recording_date: null
    });

    const [detailedJobData, setDetailedJobData] = useState<MergedTrain[] | TrainStop[]>([]);

    const [ftpDirectoriesList, setFTPDirectioriesList] = useState<FTP[]>([]);

    const [cameraSlideList, setCameraSlideList] = useState<CameraSlide[]>([]);

    function prepareDetailedJobView(data: APIResponse, job: UpdatedCompletionJob): void {

        setSelectedJobTrains([]);

        setIsJobMeasuredTrainChecked(true);

        const cameras: Camera[] = data.cameras ? data.cameras : [];

        if(cameras.length > 0){

            const camera_slides: CameraSlide[] = cameras.map(camera => {

                const url: string = "/photos/" + camera.station_id + "_" + camera.recording_date + "_" + camera.camera_number + ".jpg";

                return {
                    ...camera,
                    url: url,
                    name: "Kamera " + camera.camera_number
                }

            });

            camera_slides.sort((a, b) => {

                return Number(a.camera_number) - Number(b.camera_number);

            });

            if(camera_slides.length > 3){

                const station_id: string = camera_slides[0].station_id;

                const recording_date: string = camera_slides[0].recording_date;

                const layout_url: string = "/photos/layout/" + station_id + "_" + recording_date + ".jpg";

                const new_object: CameraSlide = {
                    camera_number: "-",
                    recording_date: recording_date,
                    station_id: station_id,
                    name: "Schemat montażu",
                    url: layout_url
                }

                camera_slides.unshift(new_object);

            }

            setCameraSlideList(camera_slides);

        }

        const all_delays: Delay[] = data.delays ? data.delays : [];

        const ftp: FTP[] = data.ftp ? data.ftp : [];

        setFTPDirectioriesList(ftp);

        const all_measurements: Measurement[] = data.measurements ?? [];

        const stations: Station[] = data.stations ?? [];

        const trains: TrainStop[][] = data.trains ?? [];

        const train_numbers: TrainNumber[] = data.train_numbers ?? [];

        const recordings: Recording[] = data.recordings ?? [];

        const recording_date: string = job.recording_date;

        const job_number: number = job.job_number;

        const station_id: string | null = job.station_id;

        const train_id: string | null = job.train_id;

        /*

        type SynchronizedTrain = UpdatedTrain & {
            arrival_hour?: string | null;
            departure_hour?: string | null;
            days?: Recording[];
            measurements?: Measurement[];
            job_count?: JobCount[];
            jobs?: Job[];
            lane_number?: string | null;
            platform_number?: string | null;
            station_id?: string;
            station_name?: string;
    }

        */

        if(station_id){

            const station_search: Station | undefined = stations.find(item => item.station_id === station_id);

            const station_name: string = station_search?.name ?? "-"; 

            const type: string = 'station';

            const updated_trains: MergedTrain[] = trains.map(train => {

                const train_id: string = train[0].train_id;

                const stops = train;

                const station_match: TrainStop | undefined = train.find(item => item.station_id === station_id);

                const station_index = station_match?.stop_number ?? 0;

                const arrival_hour = station_match?.arrival_hour ?? null;

                const departure_hour = station_match?.departure_hour ?? null;

                const platform = station_match?.platform_number ?? null;

                const filtered_measurements: Measurement[] = all_measurements.filter(item => item.train_id === train_id);

                const measurements: Measurement[] = mergeMeasurementsData(filtered_measurements);

                const delay_item: Delay | undefined = all_delays.find(item => item.train_id === train_id && item.station_id === station_id && item.recording_date === recording_date);

                const delay: string | null = delay_item ? 'opóźniony ' + delay_item.delay + ' min.' : null;

                const train_data: TrainNumber | undefined = train_numbers.find(item => item.train_id === train_id);

                const train_number: string = train_data?.train_number ?? "-";

                const first_station_id: string = train_data?.first_station ?? "-";

                const last_station_id: string = train_data?.last_station ?? "-";

                const first_station_search: Station | undefined = stations.find(item => item.station_id === first_station_id);

                const last_station_search: Station | undefined = stations.find(item => item.station_id === last_station_id);

                const first_station_name: string = first_station_search?.name ?? "";
                    
                const last_station_name: string = last_station_search?.name ?? "";

                const relation: string = first_station_name + " - " + last_station_name;

                return {
                    train_id: train_id,
                    stops: stops,
                    station_index: station_index,
                    arrival_hour: arrival_hour,
                    departure_hour: departure_hour,
                    platform: platform,
                    measurements: measurements,
                    photos: [],
                    delay: delay,
                    train_number: train_number,
                    first_station_name: first_station_name,
                    last_station_name: last_station_name,
                    relation: relation
                }

            });

            const sorted_trains = sortTrainsByHours(updated_trains) as MergedTrain[];

            setDetailedJobInfo({
                type: type,
                job_number: job_number,
                station_id: station_id,
                station_name: station_name,
                train_number: '',
                train_relation: '',
                recording_date: recording_date
            });

            setDetailedJobData(sorted_trains);

        }
        
        if(train_id){

            // Zadanie pomiaru pociągu

            const type: string = 'train';

            const train_number_data: TrainNumber | undefined = train_numbers[0];

            if(train_number_data){

                const train_number: string = train_number_data.train_number;

                const first_station_id: string = train_number_data.first_station;

                const last_station_id: string = train_number_data.last_station;

                const first_station_data: Station | undefined = stations.find(item => item.station_id === first_station_id);

                const last_station_data: Station | undefined = stations.find(item => item.station_id === last_station_id);

                const train_relation: string = (first_station_data && last_station_data) ? first_station_data.name + " - " + last_station_data.name : "-";

                const train_stops: TrainStop[] = trains[0];

                const updated_train: TrainStop[] = train_stops.map(train_stop => {

                    const current_station_id: string = train_stop.station_id;

                    const station_match: Station | undefined = stations.find(item => item.station_id === current_station_id);

                    const station_name: string = station_match?.name ?? "nie znaleziono";

                    const measurement: Measurement[] = all_measurements.filter(item => item.station_id === current_station_id);

                    const active: boolean = recordings.some(item => item.station_id === current_station_id);

                    const delay_item: Delay | undefined = all_delays.find(item => item.train_id === train_stop.train_id && item.station_id === current_station_id && item.recording_date === recording_date);

                    const delay = delay_item ? 'opóźniony ' + delay_item.delay + ' min.' : null;

                    return {
                        ...train_stop,
                        active: active,
                        delay: delay,
                        station_name: station_name,
                        measurement: measurement,
                    }

                });

                setDetailedJobInfo({
                    type: type,
                    job_number: job_number,
                    station_id: '',
                    station_name: '',
                    train_number: train_number,
                    train_relation: train_relation,
                    recording_date: recording_date
                });

                setDetailedJobData(updated_train);

            }

        }

        function mergeMeasurementsData(measurements_data: Measurement[]): Measurement[] {

            measurements_data.forEach(measurement => {

                const user_data: UpdatedUser | undefined = updatedUsers.find(user => user.personal_id === measurement.personal_id);

                measurement.full_name = user_data?.full_name ?? "nie znaleziono";

            });

            return measurements_data;

        }

    }

    const [selectedJobTrains, setSelectedJobTrains] = useState<string[]>([]);

    const selectJobMeasurementRow = (event: React.ChangeEvent<HTMLInputElement>) => {

        const train_id: string = event.target.value;

        const current_selected: string[] = [...selectedJobTrains];

        if(current_selected.includes(train_id)){

            current_selected.splice(current_selected.indexOf(train_id), 1);

        } else {

            current_selected.push(train_id);

        }

        setSelectedJobTrains(current_selected);

    };

    const isJobMeasuredTrainSelected = (train_id: string): boolean => {

        return selectedJobTrains.includes(train_id);

    };

    const [isJobMeasuredTrainChecked, setIsJobMeasuredTrainChecked] = useState<boolean>(true);

    const inverseJobMeasuredSelection = () => {

        setIsJobMeasuredTrainChecked(prevChecked => !prevChecked);

        const current_ids: string[] = detailedJobData.map(item => item.train_id);

        const current_selected: string[] = [...selectedJobTrains];

        current_ids.forEach(value => {

            if(current_selected.includes(value)){

                current_selected.splice(current_selected.indexOf(value), 1);

            } else {

                current_selected.push(value);

            }

        });

        setSelectedJobTrains(current_selected);

    };

    function cancelDetailedJobView(){

        setAppLayer(500);

    }





























    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Podgląd zadania jako pracownik

    const [userWithJobsSearching, setUserWithJobsSearching] = useState<boolean>(true);

    const [usersWithJobs, setUsersWithJobs] = useState<UserWithJobs[]>([]);

    const getUsersWithJobsData = useCallback((job?: Job) => {

        const request_type: string = 'get users with jobs';

        setUserWithJobsSearching(true);

        Axios.post('classes/data.php', { request_type }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                if(data.users_with_jobs){

                    const users_with_jobs: UserWithJobs[] = data.users_with_jobs;

                    users_with_jobs.sort((a, b) => {

                        return a.surname.localeCompare(b.surname);

                    });

                    setUsersWithJobs(users_with_jobs);

                    if(job){

                        const personal_id: string = job.personal_id;

                        setSelectedWorkerView(personal_id);

                    }

                }

            } else {

                showError();

            }

            setUserWithJobsSearching(false);

        }).catch((error) => {

            console.warn(error);

            setUserWithJobsSearching(false);

            showError();

        });

    }, [showError]);

    const [selectedWorkerView, setSelectedWorkerView] = useState<string>('');

    function onSelectedWorkerViewChange(event: React.ChangeEvent<HTMLSelectElement>){

        const value: string = event.target.value;

        setSelectedWorkerView(value);

    }

    // Pobieranie danych dla wybranego pracownika

    const [activeJob, setActiveJob] = useState<UpdatedJob | null>(null);

    // Aktualnie wybrane zadanie

    const latestActiveJob = useRef(activeJob);

    useEffect(() => {

        latestActiveJob.current = activeJob;

    }, [activeJob]);

    const [userViewJobs, setUserViewJobs] = useState<Job[]>([]);

    //const [userViewTrains, setUserViewTrains] = useState([]);

    const [delays, setDelays] = useState<Delay[]>([]);

    //const [userViewStations, setUserViewStations] = useState([]);

    //const [userViewTrainNumbers, setUserViewTrainNumbers] = useState([]);

    const [cameras, setCameras] = useState<Camera[]>([]);

    //const [userViewRecordings, setUserViewRecordings] = useState([]);

    const [FTP, setFTP] = useState<FTP[]>([]);

    const [userViewSearching, setUserViewSearching] = useState<boolean>(false);

    const latestUserViewStations = useRef(stations);

    useEffect(() => {

        latestUserViewStations.current = stations;

    }, [stations]);

    useEffect(() => {

        if(selectedWorkerView !== ''){

            getWorkerViewData();

            setActiveJob(null);

        }

        function getWorkerViewData(): void {
    
            const request_type: string = 'get user view data';

            setJobFilters({job_station_name: '', job_date: ''});
    
            setUserViewSearching(true);
    
            Axios.post('classes/data.php', { request_type }, { timeout: 5000 }).then(function(response){
                
                if(typeof response.data === 'object' || Array.isArray(response.data)){

                    const data: APIResponse = response.data;

                    if(data.jobs){

                        setUserViewJobs(data.jobs);

                    }

                    if(data.trains){

                        setTrains(data.trains);

                    }

                    if(data.train_numbers){

                        setTrainNumbers(data.train_numbers);

                    }

                    if(data.stations){

                        setStations(data.stations);

                    }

                    if(data.recordings){

                        setRecordings(data.recordings);

                    }

                    if(data.cameras){

                        setCameras(data.cameras);

                    }

                    if(data.ftp){

                        setFTP(data.ftp);

                    }

                    if(data.delays){

                        setDelays(data.delays);

                    }

                    

                    

                    





                    /*

                    data.jobs.forEach(job => {

                        if(job.train_id){

                            const train_search = data.train_numbers.find(u => u.train_id === job.train_id);

                            if(train_search){

                                const first_station = data.stations.find(u => u.station_id === train_search.first_station);

                                const last_station = data.stations.find(u => u.station_id === train_search.last_station);

                                job.train_number = train_search.train_number;

                                job.first_station_name = first_station ? first_station.name : "";

                                job.last_station_name = last_station ? last_station.name : "";

                            }

                        }

                        if(job.station_id){

                            const station_search = data.stations.find(u => u.station_id === job.station_id);

                            job.station_name = station_search ? station_search.name : "-";

                        }

                    });

                    setUserViewJobs(data.jobs);

                    setUserViewTrains(data.trains);

                    setUserViewTrainNumbers(data.train_numbers);

                    setUserViewStations(data.stations);

                    setUserViewRecordings(data.recordings);

                    setUserViewDelays(data.delays);

                    setUserViewFtp(data.ftp);

                    setUserViewCameras(data.cameras);

                    */

                } else {
                
                    showError();

                }

                setUserViewSearching(false);
                
            }).catch((error) => {

                console.warn(error);

                setUserViewSearching(false);

                showError();

            });
    
        }

    }, [selectedWorkerView, showError]);

    /*

    const [updatedUserViewTrains, setUpdatedUserViewTrains] = useState([]);

    useEffect(() => {

        if(userViewTrains.length > 0 && userViewStations.length > 0 && userViewTrainNumbers.length > 0){

            const updated = updateTrainData([...userViewTrains], [...userViewTrainNumbers], [...userViewStations]);

            setUpdatedUserViewTrains(updated);

        }

    }, [userViewTrains, userViewStations, userViewTrainNumbers, updateTrainData]);

    */


    const [updatedUserViewJobs, setUpdatedUserViewJobs] = useState<UpdatedJob[]>([]);

    useEffect(() => {

        const updated_jobs: UpdatedJob[] = userViewJobs.map(job => {

            let station_name: string | null = null;

            let first_station_name: string | null = null;

            let last_station_name: string | null = null;

            let train_number: string | null = null;

            const station_id: string | null = job.station_id;

            const train_id: string | null = job.train_id;

            if(station_id){

                const station_search: Station | undefined = stations.find(u => u.station_id === station_id);

                station_name = station_search?.name ?? "nie znaleziono";

            }

            if(train_id){

                const train_search: TrainNumber | undefined = trainNumbers.find(u => u.train_id === train_id);

                if(train_search){

                    const first_station: Station | undefined = stations.find(u => u.station_id === train_search.first_station);

                    const last_station: Station | undefined = stations.find(u => u.station_id === train_search.last_station);

                    train_number = train_search.train_number;

                    first_station_name = first_station?.name ?? "nie znaleziono";

                    last_station_name = last_station?.name ?? "nie znaleziono";

                }

            }

            return {
                ...job,
                station_name: station_name,
                train_number: train_number,
                first_station_name: first_station_name,
                last_station_name: last_station_name
            }

        });

        setUpdatedUserViewJobs(updated_jobs);

    }, [userViewJobs, stations, trainNumbers]);











    // Wyodrębnianie unikalnych dat i nazw stacji spośród zadań wybranego użytkownika

    const [userViewJobDates, setUserViewJobDates] = useState<string[]>([]);

    const [userViewJobStations, setUserViewJobStations] = useState<string[]>([]);

    const [selectedUserViewJobs, setSelectedUserViewJobs] = useState<UpdatedJob[]>([]);

    const getUniqueFilterValues = useCallback((jobs_data: UpdatedJob[]): void => {

        // Unikalne daty

        const unique_job_dates: string[] = [...new Set(jobs_data.map(job => job.recording_date))];

        unique_job_dates.sort((a, b) => a.localeCompare(b));

        setUserViewJobDates(unique_job_dates);

        // Unikalne stacje

        const unique_job_stations: string[] = [...new Set(jobs_data.map(job => job.station_name).filter((name): name is string => name != null))];

        unique_job_stations.sort((a, b) => a.localeCompare(b));

        setUserViewJobStations(unique_job_stations);

    }, []);

    useEffect(() => {

        if(updatedUserViewJobs.length > 0 && selectedWorkerView !== ""){

            const user_jobs: UpdatedJob[] = updatedUserViewJobs.filter(job => job.personal_id === selectedWorkerView);

            setSelectedUserViewJobs(user_jobs);

            getUniqueFilterValues(user_jobs);

        }
        
    }, [updatedUserViewJobs, selectedWorkerView, getUniqueFilterValues]);

    // Filtrowanie zadań pracownika

    const [filteredUserViewJobs, setFilteredUserViewJobs] = useState<UpdatedJob[]>([]);

    const [jobFilters, setJobFilters] = useState<JobFilters>({job_station_name: '', job_date: ''});

    function onUserViewJobFilterChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const value: string = event.target.value;

        const name: string = event.target.name;

        setJobFilters(prevFilters => {
            return {
                ...prevFilters,
                [name]: value
            }
        });

    }

    useEffect(() => {

        if(selectedUserViewJobs.length > 0){

            const station_name_filter: string = jobFilters.job_station_name;

            const date_filter: string = jobFilters.job_date;

            const filtered_jobs: UpdatedJob[] = selectedUserViewJobs.filter(job => {

                const station_matches = !jobFilters.job_station_name || job.station_name === station_name_filter;

                const date_matches = !jobFilters.job_date || job.recording_date === date_filter;

                return station_matches && date_matches;

            });

            setFilteredUserViewJobs(filtered_jobs);

            getUniqueFilterValues(filtered_jobs);

        }

    }, [jobFilters, selectedUserViewJobs, getUniqueFilterValues]);











    const [selectedUserViewTrains, setSelectedUserViewTrains] = useState<SynchronizedTrain[]>([]);

    function activateJob(job_number: number): void {

        const job_match: UpdatedJob | undefined = updatedUserViewJobs.find(item => item.job_number === job_number);

        if(job_match){

            const station_id: string | null = job_match.station_id;

            const train_id: string | null = job_match.train_id;

            const recording_date: string = job_match.recording_date;

            const start_hour: number | null = job_match.start_hour ? new Date(`1970-01-01T${job_match.start_hour}`).getTime() : null; 

            const end_hour: number | null = job_match.end_hour ? new Date(`1970-01-01T${job_match.end_hour}`).getTime() : null;

            const train_list = (job_match && job_match.train_list) ? JSON.parse(job_match.train_list) : null;

            // Zadanie pomiaru stacji

            if(station_id){

                let job_trains: SynchronizedTrain[] = [];

                if(start_hour && end_hour){

                    job_trains = updatedTrains.flatMap(train => {

                        const station_match: TrainStop | undefined = train.stops.find(item => item.station_id === station_id);

                        if(!station_match) return [];

                        const departure_hour: string | null = station_match.departure_hour;

                        const arrival_hour: string | null = station_match.arrival_hour;

                        const chosen_value: string = departure_hour ?? arrival_hour!;

                        const compared_time = ( new Date(`1970-01-01T${chosen_value}`) ).getTime();

                        if(compared_time < start_hour || compared_time > end_hour) return [];

                        return [{
                            ...train,
                            arrival_hour: arrival_hour,
                            departure_hour: departure_hour,
                            platform_number: station_match.platform_number,
                            lane_number: station_match.lane_number
                        }];

                    });

                }

                if(train_list && Array.isArray(train_list)){

                    const array_of_trains: string[] = train_list;

                    const filtered_trains: SynchronizedTrain[] = updatedTrains.filter(train => array_of_trains.includes(train.train_id));

                    job_trains = filtered_trains.map(train => {

                        const station_match: TrainStop | undefined = train.stops.find(item => item.station_id === station_id);

                        const departure_hour: string | null = station_match?.departure_hour ?? null;

                        const arrival_hour: string | null = station_match?.arrival_hour ?? null;

                        const platform_number: string | null = station_match?.platform_number ?? null;
                        
                        const lane_number: string | null = station_match?.lane_number ?? null;

                        return {
                            ...train,
                            arrival_hour: arrival_hour,
                            departure_hour: departure_hour,
                            platform_number: platform_number,
                            lane_number: lane_number
                        };

                    });

                }

                job_trains.forEach(train => {

                    const train_id = train.train_id;

                    const station_match: TrainStop | undefined = train.stops.find(item => item.station_id === station_id);

                    if(station_match){

                        const index: number = station_match.stop_number;

                        const delay: Delay[] = delays.filter(item => item.train_id === train_id && item.recording_date === recording_date);

                        let delay_text: string | null = null;

                        if(delay.length > 0){

                            const exact: Delay | undefined = delay.find(item => item.station_id === station_id);

                            if(exact){

                                delay_text = 'opóźniony ' + exact.delay + ' min.';

                            } else {

                                for(let i=index; i>=0 ;i--){

                                    const current_station: string = train.stops[i].station_id;

                                    const found: Delay | undefined = delay.find(item => item.station_id === current_station);

                                    if(found){

                                        const difference: number = index - train.stops[i].stop_number;

                                        delay_text = 'opóźniony ' + found.delay + ' min. ' + difference + ' st. wcześniej';

                                        break;

                                    }

                                }

                            }

                        }

                        train.delay = delay_text;

                    }

                });

                const sorted_trains: SynchronizedTrain[] = sortTrainsByHours(job_trains);

                setSelectedUserViewTrains(sorted_trains);

                const cameras_list: Camera[] = cameras.filter(item => item.station_id === station_id && item.recording_date === recording_date);

                setCameraList(cameras_list);

                const ftp_list: FTP[] = FTP.filter(item => item.station_id === station_id && item.recording_date === recording_date);

                setFtpList(ftp_list);

            }

            if(train_id){

                const train: SynchronizedTrain | undefined = updatedTrains.find(item => item.train_id === train_id);

                if(train){

                    train.stops.forEach(train_stop => {

                        const current_station_id: string = train_stop.station_id;

                        const delay: Delay | undefined = delays.find(item => item.train_id === train_id && item.recording_date === recording_date && item.station_id === current_station_id);

                        if(delay){

                            train_stop.delay = 'opóźniony ' + delay.delay + ' min.';

                        } else {

                            train_stop.delay = null;

                        }

                        train_stop.active = recordings.some(item => item.recording_date === recording_date && item.station_id === current_station_id);

                    });

                    setSelectedUserViewTrains([train]);

                }

            }

            setActiveJob(job_match);

        }

    }


    





    // Pobieranie pomiarów

    const [mergedUserViewTrains, setMergedUserViewTrains] = useState<MergedTrain[]>([]);

    useEffect(() => {

        if(selectedUserViewTrains.length > 0 && latestActiveJob.current){

            const active_job: Job = latestActiveJob.current;

            if(active_job.station_id){

                const train_ids: string[] = selectedUserViewTrains.map(train => train.train_id);

                getCompletedMeasurements(train_ids, active_job);

            }

            if(active_job.train_id){

                const station_ids: string[] = selectedUserViewTrains[0].stops.map(stop => stop.station_id);

                getCompletedMeasurements(station_ids, active_job);

            }

        }

        function getCompletedMeasurements(data: string[], active_job: Job): void {

            const job_number: number = active_job.job_number;

            const personal_id: string = active_job.personal_id;

            const request_type: string = 'get data';

            const station_id: string | null = active_job.station_id;

            const train_id: string | null = active_job.train_id;

            const recording_date: string = active_job.recording_date;

            Axios.post('classes/measurements.php', { personal_id, job_number, data, station_id, train_id, recording_date, request_type }, { timeout: 10000 }).then(function(response){

                if(typeof response.data === 'object' || Array.isArray(response.data)){

                    const data: APIResponse = response.data;

                    if(Array.isArray(data.measurements) && Array.isArray(data.photos)){

                        mergeTrainData(data, active_job);

                        return;

                    }

                }

                showError();

            }).catch((error) => {

                showError();

                console.warn(error);

            });

        }

        function mergeTrainData(data: APIResponse, active_job: Job): void {

            const db_measurements: Measurement[] = data.measurements!;
    
            const db_photos: Photo[] = data.photos!;

            const stations: Station[] = latestUserViewStations.current;

            const station_id: string | null = active_job.station_id;

            const train_id: string | null = active_job.train_id;

            if(station_id){

                const grouped_objects = db_measurements.reduce<Record<string, Measurement>>((acc, obj) => {

                    const { id, train_id } = obj;

                    if(!acc[train_id] || acc[train_id].id < id){

                        acc[train_id] = obj;

                    }

                    return acc;

                }, {});
    
                const unique_measurements: Measurement[] = Object.values(grouped_objects);

                const merged_trains: MergedTrain[] = selectedUserViewTrains.map(train => {

                    const matching_measurement: Measurement[] = unique_measurements.filter(item => item.train_id === train.train_id);

                    const matching_photos: Photo[] = db_photos.filter(photo => photo.train_id === train.train_id);

                    return {
                        ...train,
                        measurements: matching_measurement,
                        photos: matching_photos
                    }

                });

                setMergedUserViewTrains(merged_trains);

            }

            if(train_id){

                const grouped_objects = db_measurements.reduce<Record<string, Measurement>>((acc, obj) => {

                    const { id, station_id } = obj;

                    if(!acc[station_id] || acc[station_id].id < id){

                        acc[station_id] = obj;

                    }

                    return acc;

                }, {});
    
                const unique_measurements: Measurement[] = Object.values(grouped_objects);

                const matching_photos: Photo[] = db_photos.filter(photo => photo.train_id === train_id);

                const train: SynchronizedTrain = {...selectedUserViewTrains[0]};

                if(train && train.stops){

                    train.stops.forEach(station => {

                        const current_station_id = station.station_id;

                        const matching_measurement: Measurement[] = unique_measurements.filter(item => item.station_id === current_station_id);

                        station.measurement = matching_measurement;

                        const matching_station = stations.find(item => item.station_id === current_station_id);

                        station.station_name = matching_station ? matching_station.name : "";

                    });

                }

                const merged_train: MergedTrain = {
                    ...train,
                    photos: matching_photos
                };

                setMergedUserViewTrains([merged_train]);

            }            
            
        };

    }, [selectedUserViewTrains, showError]);

    // FTP

    const [ftpList, setFtpList] = useState<FTP[]>([]);

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>({
        ftp_host: false,
        ftp_user: false,
        ftp_password: false
    });

    function copyText(id: string): void {

        const ele: HTMLElement | null = document.getElementById(id);

        if(ele){

            const text: string = ele.innerText;

            navigator.clipboard.writeText(text).then(() => {

                setButtonStatus(prev => { return {...prev, [id]: true} });
        
                setTimeout(() => { setButtonStatus({ftp_host: false, ftp_user: false, ftp_password: false}) }, 2000);

            }).catch(err => {

                console.error('Failed to copy text: ', err);

            });

        }

    }

    // Wyznaczanie slajdów do podglądu obrazów z kamer

    const [cameraList, setCameraList] = useState<Camera[]>([]);

    const [cameraSlides, setCameraSlides] = useState<CameraSlide[]>([]);

    useEffect(() => {

        if(cameraList.length > 0){

            const camera_list: CameraSlide[] = cameraList.map(camera => {

                const url: string = "/photos/" + camera.station_id + "_" + camera.recording_date + "_" + camera.camera_number + ".jpg";

                return {
                    ...camera,
                    name: "Kamera " + camera.camera_number,
                    url: url
                }

            });

            camera_list.sort((a, b) => {

                return Number(a.camera_number) - Number(b.camera_number);

            });

            if(camera_list.length > 3){

                const station_id: string = camera_list[0].station_id;

                const recording_date: string = camera_list[0].recording_date;

                const layout_url: string = "/photos/layout/" + station_id + "_" + recording_date + ".jpg";

                const new_object: CameraSlide = {
                    camera_number: "0",
                    station_id: station_id,
                    recording_date: recording_date,
                    name: "Schemat montażu",
                    url: layout_url
                }

                camera_list.unshift(new_object);

            }

            setCameraSlides(camera_list);

        } else {

            setCameraSlides([]);

        }

    }, [cameraList]);

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [imageIndex, setImageIndex] = useState<number | undefined>(undefined);

    const [modalSlides, setModalSlides] = useState<ModalSlide[]>([]);

    function runModal(id: number): void {

        setImageIndex(id);

        setOpenModal(true);

    }

    useEffect(() => {

        setModalSlides( cameraSlides.map( (image) => { return { src: image.url } } ) );

    }, [cameraSlides]);

    // Zmiana zadania

    function exitJob(){

        setActiveJob(null);
        setMergedUserViewTrains([]);
        setActiveTrain(null);
        setActiveStation(null);
        clearJobFormData();
        setCameraList([]);
        setFtpList([]);
        //setUpdatedUserViewTrains([]);
    }

    // Aktywowanie pociągu lub stacji do pomiarów

    const [activeTrain, setActiveTrain] = useState<MergedTrain | null>(null);

    const latestActiveTrain = useRef<MergedTrain | null>(activeTrain);

    useEffect(() => {

        latestActiveTrain.current = activeTrain;
        
    }, [activeTrain]);

    function activateTrain(train_id: string): void {

        const train: MergedTrain | undefined = mergedUserViewTrains.find(item => item.train_id === train_id);

        if(train){

            setMeasurementFormData({});

            setJobTime({arrival: "", departure: ""});

            setAccuracy("");

            setAdditionalComment("");

            setActiveTrain(train);

            if(train.measurement && train.measurement.length > 0){

                const measurement: Measurement = train.measurement[0];

                restoreMeasurements(measurement);

            }

        }

    }

    const [activeStation, setActiveStation] = useState<string | null>(null);

    const latestActiveStation = useRef<string | null>(activeStation);

    useEffect(() => {

        latestActiveStation.current = activeStation;
        
    }, [activeStation]);

    function activateStation(train_stop: TrainStop): void {

        const station_id: string = train_stop.station_id;

        const recording_date: string = activeJob!.recording_date;

        setMeasurementFormData({});

        setJobTime({arrival: "", departure: ""});

        setAccuracy("");

        setAdditionalComment("");

        setActiveStation(station_id);

        const cameras_list: Camera[] = cameras.filter(item => item.station_id === station_id && item.recording_date === recording_date);

        setCameraList(cameras_list);

        const ftp_list: FTP[] = FTP.filter(item => item.station_id === station_id && item.recording_date === recording_date);

        setFtpList(ftp_list);

        if(train_stop.measurement && train_stop.measurement.length > 0){

            const measurement: Measurement = train_stop.measurement[0];

            restoreMeasurements(measurement);

        }

    }

    // Przywracanie ostatniego pomiaru

    function restoreMeasurements(data: Measurement): void {

        const oldMeasurementFormData: MeasurementFormData = {};

        if(data.entered_1 !== null && data.entered_1 !== undefined) oldMeasurementFormData.entered_1 = data.entered_1;

        if(data.entered_2 !== null && data.entered_2 !== undefined) oldMeasurementFormData.entered_2 = data.entered_2;

        if(data.entered_3 !== null && data.entered_3 !== undefined) oldMeasurementFormData.entered_3 = data.entered_3;

        if(data.entered_4 !== null && data.entered_4 !== undefined) oldMeasurementFormData.entered_4 = data.entered_4;

        if(data.entered_5 !== null && data.entered_5 !== undefined) oldMeasurementFormData.entered_5 = data.entered_5;

        if(data.entered_6 !== null && data.entered_6 !== undefined) oldMeasurementFormData.entered_6 = data.entered_6;

        if(data.exited_1 !== null && data.exited_1 !== undefined) oldMeasurementFormData.exited_1 = data.exited_1;

        if(data.exited_2 !== null && data.exited_2 !== undefined) oldMeasurementFormData.exited_2 = data.exited_2;

        if(data.exited_3 !== null && data.exited_3 !== undefined) oldMeasurementFormData.exited_3 = data.exited_3;

        if(data.exited_4 !== null && data.exited_4 !== undefined) oldMeasurementFormData.exited_4 = data.exited_4;

        if(data.exited_5 !== null && data.exited_5 !== undefined) oldMeasurementFormData.exited_5 = data.exited_5;

        if(data.exited_6 !== null && data.exited_6 !== undefined) oldMeasurementFormData.exited_6 = data.exited_6;

        setMeasurementFormData(oldMeasurementFormData);

        const old_time: Time = {
            arrival: data.arrival_hour ? data.arrival_hour : "",
            departure: data.departure_hour ? data.departure_hour : ""
        };

        setJobTime(old_time);

        if(data.accuracy) setAccuracy(data.accuracy);

        if(data.comments) setAdditionalComment(data.comments);

    }

    const [measurementFormData, setMeasurementFormData] = useState<MeasurementFormData>({});

    const [measurementFormSummary, setMeasurementFormSummary] = useState<MeasurementFormSummary>({entered_sum: "", exited_sum: ""});

    useEffect(() => {

        if(Object.keys(measurementFormData).length > 0){

            const entered_sum = calculatePassengersSum("entered");

            const exited_sum = calculatePassengersSum("exited");

            function calculatePassengersSum(type: PassengerType): "" | number {

                const field_1: number = Number(measurementFormData[`${type}_1`] ? measurementFormData[`${type}_1`] : 0);

                const field_2: number = Number(measurementFormData[`${type}_2`] ? measurementFormData[`${type}_2`] : 0);

                const field_3: number = Number(measurementFormData[`${type}_3`] ? measurementFormData[`${type}_3`] : 0);

                const field_4: number = Number(measurementFormData[`${type}_4`] ? measurementFormData[`${type}_4`] : 0);

                const field_5: number = Number(measurementFormData[`${type}_5`] ? measurementFormData[`${type}_5`] : 0);

                const field_6: number = Number(measurementFormData[`${type}_6`] ? measurementFormData[`${type}_6`] : 0);

                const sum: number = field_1 + field_2 + field_3 + field_4 + field_5 + field_6;

                if(measurementFormData[`${type}_1`] === undefined && measurementFormData[`${type}_2`] === undefined && measurementFormData[`${type}_3`] === undefined && measurementFormData[`${type}_4`] === undefined && measurementFormData[`${type}_5`] === undefined && measurementFormData[`${type}_6`] === undefined){

                    return "";

                } else {

                    return sum;

                }

            }
    
            setMeasurementFormSummary({entered_sum: entered_sum, exited_sum: exited_sum});

        } else {

            setMeasurementFormSummary({entered_sum: "", exited_sum: ""});

        }

    }, [measurementFormData]);

    // Formularz pomiarowy

    const [jobTime, setJobTime] = useState<Time>({arrival: "", departure: ""});

    const [accuracy, setAccuracy] = useState<Accuracy>('');

    const [sliderInfo, setSliderInfo] = useState<boolean>(false);

    const [additionalComment, setAdditionalComment] = useState<AdditionalComment>('');

    function clearJobFormData(): void {

        setMeasurementFormData({});

        setJobTime({arrival: "", departure: ""});

        setAccuracy('');

        setAdditionalComment('');

    }

    // Podgląd zdjęć

    const [photosToShow, setPhotosToShow] = useState<PhotoSlide[]>([]);

    function showPhotos(train_id: string): void {

        const train: MergedTrain | undefined = mergedUserViewTrains.find(u => u.train_id === train_id);

        const photos: Photo[] = train?.photos ? train?.photos : [];

        if(photos.length > 0){

            const photoSlides: PhotoSlide[] = photos.map(photo => {

                const train_id: string = photo.train_id;

                const station_id: string = photo.station_id;

                const train_match: TrainNumber | undefined = trainNumbers.find(u => u.train_id === train_id);

                const station_match: Station | undefined = stations.find(u => u.station_id === station_id);

                return {
                    ...photo,
                    name: 'Pociąg ' + ( train_match ? train_match.train_number : "?" ) + ' na stacji ' + ( station_match ? station_match.name : "?" ) + ' w dniu ' + formatDate(photo.recording_date),
                    url: '/TypeScript/RubikaDatapad/public/php/classes/uploads/' + photo.filename
                    //url: '/photos/trains/' + photo.filename; - PRZYWRÓCIĆ
                };
            });

            setPhotosToShow(photoSlides);

            setModal({...modal, show: true, show_photo: true});

        }

    }

    const [viewModalSlides, setViewModalSlides] = useState<ModalSlide[]>([]);

    useEffect(() => {

        setViewModalSlides(
            photosToShow.map((image) => {
                return { src: image.url };
            })
        );

    }, [photosToShow]);

    // Wyznaczanie klasy wiersza w tabeli

    const getClassNames = (train: MergedTrain): string => {

        if(activeTrain && activeTrain.train_id === train.train_id){

            return 'currently-measured-train';

        }
        
        if(train.measurement && train.measurement.length > 0){

            return 'previously-measured-train';

        }

        return '';

    }

    const getStationClassNames = (train_stop: TrainStop): string => {

        if(train_stop.station_id === activeStation){

            return 'currently-measured-train';

        } 
        
        if(!train_stop.active){

            return 'not-measured-train';

        }

        if(train_stop.measurement && train_stop.measurement.length > 0){

            return 'previously-measured-train';

        }

        return '';

    }

    function getStationName(): string {

        const found_station = stations.find(u => u.station_id === activeStation);

        return found_station ? found_station.name : "nie znaleziono";

    }

    function formatTrainNumber(train_number: string): string | React.JSX.Element {

        if(train_number.includes("-")){

            const split = train_number.split("-");

            return <><span className="train-number-split-main">{split[0]}</span><span className="train-number-split-sub">-</span><span className="train-number-split-main">{split[1]}</span></>;

        } else {

            return train_number;

        }

    }

    // Otwieranie zadania - bezpośrednio z widoku realizacji

    //const [jobToOpen, setJobToOpen] = useState(null);

    function openJob(job: Job): void {

        //setJobToOpen(job);

        getUsersWithJobsData(job);

        setSelectedWorkerView('');

        setModalMessage('Czekaj, trwa pobieranie danych.');

        setModalSpin(true);

        setModal({...modal, show: true, info: true});

    }

    // Podgląd pociągu

    const [trainViewSearching, setTrainViewSearching] = useState<boolean>(false);

    /*

    const [trainList, setTrainList] = useState([]);

    const [trainNumbersList, setTrainNumbersList] = useState([]);

    const [stationsList, setStationsList] = useState([]);

    const [recordingsList, setRecordingsList] = useState([]);

    const [jobsList, setJobsList] = useState([]);

    const [usersList, setUsersList] = useState([]);

    */

    const getTrainViewData = useCallback(() => {

        const request_type = 'get train list data';

        setTrainViewSearching(true);

        Axios.post('classes/data.php', { request_type }, { timeout: 10000 }).then(function(response){

            if(typeof response.data === 'object' || Array.isArray(response.data)){

                const data: APIResponse = response.data;

                if(data.trains){

                    setTrains(data.trains);

                }

                if(data.train_numbers){

                    setTrainNumbers(data.train_numbers);

                }

                if(data.stations){

                    setStations(data.stations);

                }

                if(data.recordings){

                    setRecordings(data.recordings);

                }

                if(data.jobs){

                    setJobs(data.jobs);

                }

                if(data.users){

                    setUsers(data.users);

                }

            } else {

                showError();

            }

            setTrainViewSearching(false);

        }).catch((error) => {

            console.warn(error);

            setTrainViewSearching(false);

            showError();

        });

    }, [showError]);

    /*

    const [trainListWithNumbers, setTrainListWithNumbers] = useState([]);

    useEffect(() => {

        if(trainList.length > 0 && trainNumbersList.length > 0 && stationsList.length > 0){

            const updated = updateTrainData([...trainList], [...trainNumbersList], [...stationsList]);

            setTrainListWithNumbers(updated);

        }

    }, [trainList, trainNumbersList, stationsList, updateTrainData]);

    */

    const [trainListSelectionData, setTrainListSelectionData] = useState<TrainTypes[]>([]);

    useEffect(() => {

        if(updatedTrains.length > 0){

            const output: TrainTypes[] = [
                {name: 'Arriva', data: []}, 
                {name: 'Intercity', data: []}, 
                {name: 'Osobowe - R 1****', data: []}, 
                {name: 'Osobowe - R 2****', data: []}, 
                {name: 'Osobowe - R 3****', data: []}, 
                {name: 'Osobowe - R 4****', data: []}, 
                {name: 'Osobowe - R 5****', data: []}, 
                {name: 'Osobowe - R 6****', data: []}, 
                {name: 'Osobowe - R 7****', data: []}, 
                {name: 'Osobowe - R 8****', data: []}, 
                {name: 'Osobowe - R 9****', data: []},
                {name: 'Szybka Kolej Miejska', data: []},
                {name: 'Twoje Linie Kolejowe', data: []}, 
                {name: 'Zastepcze', data: []}
            ];

            updatedTrains.forEach(train => {

                const train_number: string | null = train.train_number;

                if(train_number){

                    const prefix_map: Record<string, number> = { AR: 0, IC: 1, SKM: 11, TLK: 12, BUS: 13 };

                        const matched_prefix: string | undefined = Object.keys(prefix_map).find(prefix => train_number.startsWith(prefix));

                        if(matched_prefix){

                            output[prefix_map[matched_prefix]].data.push(train_number);

                        } else if(train_number.startsWith('R')){

                            const type: string = train_number[2];

                            const typeIndex: number = parseInt(type, 10);

                        if(!isNaN(typeIndex) && typeIndex >= 1 && typeIndex <= 9){

                            output[1 + typeIndex].data.push(train_number);
                        }

                    }

                }

            });

            const not_empty: TrainTypes[] = output.filter(item => item.data.length > 0);

            not_empty.forEach(item => {

                item.data.sort((a, b) => {
            
                    return a.localeCompare(b);

                });

            })

            setTrainListSelectionData(not_empty);

        }

    }, [updatedTrains]);

    const [selectedTrainListView, setSelectedTrainListView] = useState<TrainListView>({trains_group: '', train: ''});

    function onSelectedTrainViewChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const {name, value} = event.target;

        if(name === 'trains_group'){

            setSelectedTrainListView({trains_group: value, train: ''});

        } else {

            setSelectedTrainListView(prev => {
                return {
                    ...prev,
                    [name]: value
                }
            });

        }
        
    }

    const [trainViewDetailedSearching, setTrainViewDetailedSearching] = useState<TrainViewDetailedSearching>({active: false, search: false});

    const [outputDetailedTrain, setOutputDetailedTrain] = useState<SynchronizedTrain | null>(null);

    const getTrainListDetailedData = useCallback((train_number: string): void => {

        const train: SynchronizedTrain | undefined = updatedTrains.find(item => item.train_number === train_number);

        if(train){

            const train_id: string = train.train_id;

            const request_type = 'get train list detailed data';

            setTrainViewDetailedSearching({active: true, search: true});

            Axios.post('classes/data.php', { request_type, train_id }, { timeout: 10000 }).then(function(response){

                if(typeof response.data === 'object' || Array.isArray(response.data)){

                    const data: APIResponse = response.data;

                    const data_measurements: Measurement[] = data.measurements ?? [];

                    //const data_delays: Delay[] = data.delays ?? [];

                    train.stops.forEach(train_stop => {

                        // Wyznaczanie szczegółów dotyczących stacji

                        const station_id: string = train_stop.station_id;

                        const station_match: Station | undefined = stations.find(item => item.station_id === station_id);

                        train_stop.station_name = station_match?.name ?? "nie znaleziono";

                        // Sprawdzanie czy stacja jest mierzona i wyznaczanie dat pomiaru

                        const recordings_match: Recording[] = recordings.filter(item => item.station_id === station_id);

                        const recording_dates: string[] = recordings_match.map(item => item.recording_date);

                        recording_dates.sort((a, b) => {

                            return new Date(a).getTime() - new Date(b).getTime();

                        });

                        train_stop.recording_dates = recording_dates;

                        // Dopasowywanie pomiarów

                        const measurement_match: Measurement[] = data_measurements.filter(item => item.station_id === station_id && item.train_id === train_id);

                        measurement_match.forEach(measurement => {

                            // Wyznaczanie użytkownika

                            const personal_id: string = measurement.personal_id;

                            const user_data: UpdatedUser | undefined = updatedUsers.find(item => item.personal_id === personal_id);

                            measurement.full_name = user_data?.full_name ?? "nie znaleziono";

                            // Wyznaczanie rodzaju zadania

                            const job_number: number = measurement.job_number;

                            const job_data: Job | undefined = jobs.find(item => item.job_number === job_number);

                            measurement.job_type = job_data ? (job_data.type === 'normal' ? "zwykłe" : "kontrolne") : "nierozpoznane";

                        });

                        const sorted_measurements: Measurement[] = measurement_match.sort((a, b) => {

                            return new Date(a.recording_date).getTime() - new Date(b.recording_date).getTime();

                        });

                        train_stop.measurement = sorted_measurements;

                    });

                    setOutputDetailedTrain(train);

                    setTrainViewDetailedSearching({active: false, search: false});
                    
                } else {

                    showError();

                    setTrainViewDetailedSearching({active: true, search: false});

                }

            }).catch((error) => {

                console.warn(error);

                setTrainViewDetailedSearching({active: true, search: false});

                showError();

            });


        }

    }, [jobs, stations, recordings, updatedTrains, updatedUsers, showError]);

    useEffect(() => {

        if(selectedTrainListView.train !== ''){

            setOutputDetailedTrain(null);

            getTrainListDetailedData(selectedTrainListView.train);

        }

    }, [selectedTrainListView.train, getTrainListDetailedData]);

    useEffect(() => {

        setOutputDetailedTrain(null);

    }, [selectedTrainListView.trains_group]);

    // Pobieranie danych przy przełączaniu ekranów aplikacji

    const isInitialMount = useRef<boolean>(true);

    useEffect(() => {

        if(isInitialMount.current){

            isInitialMount.current = false;

        } else {

            if(appLayer > 0 && appLayer < 300){

                getData();

            }

            if(appLayer === 400){

                getProgressData();

                if(tableRef.current){

                    tableRef.current.scrollTop = latestScrollPosition.current;
        
                    setScrollPosition(0);
        
                }

            }

            if(appLayer === 500){

                getJobsData();

                if(jobTableRef.current){

                    jobTableRef.current.scrollTop = latestJobScrollPosition.current;
        
                    setJobScrollPosition(0);
        
                }

            }

            if(appLayer === 610){

                getUsersWithJobsData();

            }

            if(appLayer === 620){

                getTrainViewData();

            }

        }

    }, [appLayer, getData, getJobsData, getProgressData, getUsersWithJobsData, getTrainViewData]);

    return (
        <div id="admin-app-outer-container">
            {/* Menu główne */}
            {appLayer !== 100 && 
                <div className="admin-panel-top-menu-button-wrapper">
                    <div id="admin-panel-top-menu-button-inner-wrapper">
                        <button className={appLayer === 200 ? "admin-panel-button admin-panel-button-active" : "admin-panel-button"} onClick={() => setAppLayer(200)}>Użytkownicy</button>
                        <button className={appLayer === 300 || appLayer === 350 ? "admin-panel-button admin-panel-button-active" : "admin-panel-button"} onClick={() => setAppLayer(300)}>Wydawanie</button>
                        <button className={appLayer === 400 || appLayer === 450 ? "admin-panel-button admin-panel-button-active" : "admin-panel-button"} onClick={() => setAppLayer(400)}>Postępy</button>
                        <button className={appLayer === 500 || appLayer === 550 ? "admin-panel-button admin-panel-button-active" : "admin-panel-button"} onClick={() => setAppLayer(500)}>Realizacja</button>
                        <button className={appLayer >= 600 ? "admin-panel-button admin-panel-button-active" : "admin-panel-button"} onClick={() => setAppLayer(600)}>Podgląd</button>
                        <button className="admin-panel-button" onClick={logout}>Wyloguj się<span id="logout-span">&#10140;</span></button>
                    </div>
                </div>
            }
            <div id="admin-app-outer-wrapper">
                {/* Menu górne */}
                {appLayer === 100 && 
                    <div className="admin-panel-main-menu-container">
                        <div className="admin-panel-main-menu-sub-wrapper">
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(200)}>
                                <p className="admin-panel-main-menu-title">Użytkownicy</p>
                                <UserListIcon/>
                            </div>
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(300)}>
                                <p className="admin-panel-main-menu-title">Wydawanie</p>
                                <UserAddIcon/>
                            </div>
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(400)}>
                                <p className="admin-panel-main-menu-title">Postępy</p>
                                <ListIcon/>
                            </div>
                        </div>
                        <div className="admin-panel-main-menu-sub-wrapper">
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(500)}>
                                <p className="admin-panel-main-menu-title">Realizacja</p>
                                <MagnifyingGlassIcon/>
                            </div>
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(600)}>
                                <p className="admin-panel-main-menu-title">Podgląd</p>
                                <EyeIcon/>
                            </div>
                            <div className="admin-panel-main-menu-wrapper" onClick={logout}>
                                <p className="admin-panel-main-menu-title">Wyloguj się</p>
                                <LogoutIcon/>
                            </div>
                        </div>
                    </div>
                }
                {/* Panel użytkowników */}
                {appLayer === 200 && 
                    <div className="user-panel-outer-container">
                        <div className="user-panel-function-buttons-wrapper">
                            <button className="admin-function-button" onClick={() => setModal({...modal, show: true, add_user: true})}>Dodaj nowego użytkownika</button>
                            <button className="admin-function-button" onClick={() => getSummaryData("get performance data")}>Sprawdź wydajność pracy</button>
                        </div>
                        <div id="user-state-checkbox-wrapper">
                            <span id="user-state-checkbox-description">Pokaż nieaktywnych użytkowników </span>
                            <input onChange={handleShowDeactivatedChange} checked={showDeactivatedUsers} type='checkbox' value={''}></input>
                        </div>
                        <div className="admin-working-middle-outer-wrapper">
                            <div id="admin-table-wrapper-1" className="admin-table-wrapper">
                                <table className="job-working-details-table">
                                    <thead>
                                        <tr>
                                            <th><div className={userTableSorting.attribute === 'surname' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Imię i nazwisko<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('surname')}>{userTableSorting.attribute === 'surname' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Nazwa<br></br>użytkownika</span></th>
                                            <th><div className={userTableSorting.attribute === 'personal_id' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Num. ID<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('personal_id')}>{userTableSorting.attribute === 'personal_id' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Mail</span></th>
                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Telefon</span></th>
                                            {userTable.some(item => item.rating) && <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Ocena</span></th>}
                                            {userTable.some(item => item.hour_rate) && <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Stawka</span></th>}
                                            <th><div className={userTableSorting.attribute === 'total_work_time' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Czas pracy<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('total_work_time')}>{userTableSorting.attribute === 'total_work_time' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'total_work_time_in_jobs' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Czas pracy<br></br>w zad.<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('total_work_time_in_jobs')}>{userTableSorting.attribute === 'total_work_time_in_jobs' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'total_jobs' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Wydane<br></br>zadania<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('total_jobs')}>{userTableSorting.attribute === 'total_jobs' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'finished_jobs' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Ukończone<br></br>zadania<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('finished_jobs')}>{userTableSorting.attribute === 'finished_jobs' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'total_stages' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Liczba<br></br>sprawdzonych<br></br>pociągów<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('total_stages')}>{userTableSorting.attribute === 'total_stages' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'average_per_stage' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Średnia<br></br>na pociąg<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('average_per_stage')}>{userTableSorting.attribute === 'average_per_stage' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'average_per_person' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Średnia<br></br>/osobę<br></br>[ s ]<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('average_per_person')}>{userTableSorting.attribute === 'average_per_person' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className={userTableSorting.attribute === 'last_update' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Ostatnio online<br></br><button className="table-sorting-button-2" onClick={() => handleUserTableSorting('last_update')}>{userTableSorting.attribute === 'last_update' ? (userTableSorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Status</span></th>
                                            {userTable.some(item => item.comment) && <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Komentarz</span></th>}
                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Zmień<br></br>hasło</span></th>
                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Zmień<br></br>stan</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userTable.map((user, index) =>
                                            <tr className={(user.status === 'deactivated' && !showDeactivatedUsers) ? "table-row-hidden" : (user.status === 'deactivated' ? "table-row-deactivated" : "")} key={index}>
                                                <td>{(user.first_name && user.surname) ? user.first_name + " " + user.surname : "-"}</td>
                                                <td>{user.username}</td>
                                                <td>{user.personal_id}</td>
                                                <td>{user.email ? user.email : "-"}</td>
                                                <td>{user.phone_number ? user.phone_number : "-"}</td>
                                                {userTable.some(item => item.rating) && <td>{user.rating ? user.rating : "-"}</td>}
                                                {userTable.some(item => item.hour_rate) && <td>{user.hour_rate ? user.hour_rate : "-"}</td>}
                                                <td>{user.total_work_hours ? user.total_work_hours : '00:00:00'}</td>
                                                <td>{user.total_work_time_in_jobs ? formatTime(user.total_work_time_in_jobs) : '00:00:00'}</td>
                                                <td>{user.total_jobs}</td>
                                                <td>{user.finished_jobs}</td>
                                                <td>{user.total_stages}</td>
                                                <td>{formatTime(user.average_per_stage)}</td>
                                                <td>{user.average_per_person}</td>
                                                <td>{user.last_update !== user.created_on ? user.last_update : "nigdy"}</td>
                                                <td>{getStatus(user)}</td>
                                                {userTable.some(item => item.comment) && <td>{user.comment ? user.comment : '-'}</td>}
                                                <td><button className="job-working-train-icon" onClick={() => showPasswordChange(user)}><PenIcon/></button></td>
                                                <td><button className={user.status === 'active' ? "job-working-train-icon" : "job-working-train-icon job-working-train-icon-red"} onClick={() => showUserDeactivation(user)}><ToggleButtonIcon/></button></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table> 
                            </div>
                        </div>
                    </div>
                }
                {appLayer === 300 && 
                    <div className="job-assignment-panel-outer-container">
                        {trains.length === 0 && 
                            <div className="waiting-wrapper">
                                {searching && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!searching && 
                                    <>
                                        <p className="waiting-message">Brak danych w bazie</p>
                                        <button className='user-top-panel-button' onClick={()=>getData()}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {trains.length > 0 &&
                            <>
                                
                                    <div className="user-panel-function-buttons-wrapper">
                                        <button className={outputTrains.every(obj => selectedTrains.includes(obj.train_id)) ? "admin-function-button-disabled" : "admin-function-button"} onClick={() => prepareJob('station', 'normal')}>Utwórz nowe zadanie</button>
                                    </div>
                                
                                <div className="top-panel-filters-wrapper">
                                    {uniqueDays.length > 0 && 
                                        <div className="job-selection-filter-wrapper admin-selection-filter-wrapper2">
                                            <p className="admin-selection-filter-label admin-selection-filter-label-responsive">Data pomiarów</p>
                                            <div>
                                                <select
                                                    onChange={onDateChange}
                                                    value={dateFilters.start_date}
                                                    name={'start_date'}
                                                    className={"filter-select"}
                                                >
                                                    {startDates.map((date, index) => (
                                                    <option key={index} value={date}>{formatDate(date)}</option>
                                                    ))}
                                                </select>
                                                <span className="job-selection-filter-date-separator">-</span>
                                                <select
                                                    onChange={onDateChange}
                                                    value={dateFilters.end_date}
                                                    name={'end_date'}
                                                    className={"filter-select"}
                                                >
                                                    {endDates.map((date, index) => (
                                                    <option key={index} value={date}>{formatDate(date)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    }
                                    {uniqueStations.length > 0 && 
                                        <div className="job-selection-filter-wrapper admin-selection-filter-wrapper2">
                                            <p className="admin-selection-filter-label admin-selection-filter-label-responsive">Punkt</p>
                                            <select
                                                onChange={onStationChange}
                                                value={stationFilter}
                                                name={'station_id'}
                                                className={"filter-select"}
                                            >
                                                {filteredStations.sort((a, b) => a.station_name.localeCompare(b.station_name)).map((station, index) => (
                                                <option key={index} value={station.station_id}>{station.station_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    }
                                    <div className="job-selection-filter-wrapper admin-selection-filter-wrapper2">
                                        <p className="admin-selection-filter-label admin-selection-filter-label-responsive">Zakres godzinowy</p>
                                        <div>
                                            <input
                                                className="input-number-2 input-time"
                                                type="time"
                                                id="start_hour"
                                                name="start_hour"
                                                value={time.start_hour}
                                                onChange={handleTimeChange}
                                                step="60" 
                                            />
                                            <span className="job-selection-filter-date-separator">-</span>
                                            <input
                                                className="input-number-2 input-time"
                                                type="time"
                                                id="end_hour"
                                                name="end_hour"
                                                value={time.end_hour}
                                                onChange={handleTimeChange}
                                                step="60" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div id="admin-table-wrapper-parent" className="admin-working-middle-outer-wrapper">
                                    <div id="admin-table-wrapper-2" className="admin-table-wrapper" >
                                        <table className="job-working-details-table">
                                            <thead>
                                                <tr>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span job-working-details-column">Wybór<input onChange={inverseSelection} checked={isChecked} type='checkbox' value={''}></input><button title="wczytaj listę pociągów" className="load-button" onClick={() => showImportTrainList()}><img src={LoadIcon} alt='load' className="load"/></button></span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Data</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Liczba<br></br>zadań</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Punkt</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pociąg</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Przyjazd</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Odjazd</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Peron</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Mierzony<br></br>dzień</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Wsiadło</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Wysiadło</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Liczba<br></br>odczytów</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pomiarowcy</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Analiza<br></br>pociągu</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {outputTrains.length > 0 && outputTrains.map((train, index) =>
                                                    <tr key={index}>
                                                        <th><input onChange={selectRow} checked={!isTrainSelected(train.train_id)} type='checkbox' value={train.train_id}></input></th>
                                                        <th>{train.days && train.days.map((day, i) =><span className="recording-date-span" key={i}>{formatDate(day.recording_date)}</span>)}</th>
                                                        <th>{train.job_count ? ( train.job_count.length === 0 ? "0" : train.job_count.map((job_date, i) => <span key={i} className="train-number-split-main">{job_date.count}</span>) ) : "0"}</th>
                                                        <th>{train.station_name}</th>
                                                        <th className="table-no-wrap">{train.train_number ? formatTrainNumber(train.train_number) : "nie znaleziono"}</th>
                                                        <th>{train.arrival_hour ? train.arrival_hour : "-"}</th>
                                                        <th>{train.departure_hour ? train.departure_hour : "-"}</th>
                                                        <th>{train.platform_number ? train.platform_number : "b/d"}</th>
                                                        <th>{(train.measurements && train.measurements.length > 0) ? getMeasurementsResults(train) : "-"}</th>
                                                        <th>{(train.measurements && train.measurements.length > 0) ? getMeasurementsResults(train, 'entered_sum') : "-"}</th>
                                                        <th>{(train.measurements && train.measurements.length > 0) ? getMeasurementsResults(train, 'exited_sum') : "-"}</th>
                                                        <th>{(train.measurements && train.measurements.length > 0) ? getMeasurementsCount(train) : '-'}</th>
                                                        <th>{(train.measurements && train.measurements.length > 0) ? getUserNames(train) : '-'}</th>
                                                        <th><button className="job-working-train-icon" onClick={() => prepareJob('train', 'normal', train.train_id)}><TrainIcon/></button></th>
                                                    </tr>
                                                )}
                                                {outputTrains.length === 0 &&
                                                    <tr>
                                                        <th colSpan={14}>Żaden pociąg nie spełnia podanych kryteriów</th>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table> 
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                }
                {appLayer === 350 && 
                    <div className="job-assignment-panel-outer-container">
                        {updatedUsers.length === 0 && 
                            <div className="waiting-wrapper">
                                {searching && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!searching && 
                                    <>
                                        <p className="waiting-message">Brak danych w bazie</p>
                                        <button className='user-top-panel-button' onClick={()=>getLatestUserJobsData()}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {updatedUsers.length > 0 && jobToPrepare &&
                            <div className="job-working-middle-outer-wrapper">
                                <div className="job-assignment-panel-info-wrapper">
                                    {jobToPrepare.type && 
                                        <div className="job-assignment-panel-info-inner-wrapper">
                                            <p className="job-assignment-panel-text job-assignment-important">Przydziel zadanie wybranemu pracownikowi</p>
                                            <p className="job-assignment-panel-text">Tworzysz zadanie {jobToPrepare.kind === 'normal' ? 'zwykłe' : 'kontrolne'} - {jobToPrepare.type === 'station' ? 'pomiar stacji ' + jobToPrepare.station_name : 'pomiar pociągu '+ jobToPrepare.train_number}</p>
                                            {jobToPrepare.type === 'train' && <p className="job-assignment-panel-text">Relacja: {jobToPrepare.first_station_name + " - " + jobToPrepare.last_station_name}</p>}
                                            {jobToPrepare.kind === 'normal' && jobToPrepare.type === 'station' && !outputTrains.some(obj => selectedTrains.includes(obj.train_id)) && <p className="job-assignment-panel-text">Zakres godzinowy: {time.start_hour + " - " + time.end_hour}</p>}
                                            {jobToPrepare.date.length > 0 &&
                                                <div className={jobToPrepare.date.length > 1 ? "job-selection-filter-wrapper job-selection-filter-wrapper-important" : "job-selection-filter-wrapper job-selection-filter-wrapper-date"}>
                                                    <p className="admin-selection-filter-label">{jobToPrepare.date.length > 1 ? "Wybrana data nagrania" : "Data nagrania:"}</p>
                                                    <select
                                                        onChange={onDatePrepareChange}
                                                        value={dateToPrepare}
                                                        name={'station_id'}
                                                        className={"filter-select"}
                                                    >
                                                        {jobToPrepare.date.map((date, index) => (
                                                            <option key={index} value={date.recording_date}>{formatDate(date.recording_date)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                                <div id="admin-table-wrapper-2-5" className="admin-table-wrapper">
                                    <table className="job-working-details-table">
                                        <thead>
                                            <tr>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Imię i nazwisko</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Stawka</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Ocena</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Przydzielone<br></br>zadania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Ukończone<br></br>zadania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Łączny<br></br>czas pracy</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Przydziel<br></br>zadanie</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {updatedUsers.map((user, index) =>
                                                <tr key={index}>
                                                    <th>{user.full_name}</th>
                                                    <th>{user.hour_rate ? user.hour_rate : "-"}</th>
                                                    <th>{user.rating ? user.rating : "-"}</th>
                                                    <th>{user.total_jobs}</th>
                                                    <th>{user.finished_jobs}</th>
                                                    <th>{user.total_work_hours ? user.total_work_hours : "00:00:00"}</th>
                                                    <th><button className="job-working-train-icon" onClick={() => prepareCreateJob(user)}><UserAddIcon/></button></th>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table> 
                                </div>
                                <div className="user-panel-function-buttons-wrapper">
                                    <button className="admin-function-button admin-function-button-red" onClick={() => cancelPrepareJob()}>Anuluj i powróć</button>
                                </div>
                            </div>
                        }
                    </div>
                }
                {appLayer === 400 && 
                    <div className="job-assignment-panel-outer-container">
                        {updatedProgressData.length === 0 && 
                            <div className="waiting-wrapper">
                                {searching && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!searching && stations.length === 0 && 
                                    <>
                                        <p className="waiting-message">Brak danych w bazie</p>
                                        <button className='user-top-panel-button' onClick={()=>getProgressData()}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {updatedProgressData.length > 0 &&
                            <>
                            {filteredProgressData.length > 0 &&
                                <div className="user-panel-function-buttons-wrapper">
                                    <button className={updatedProgressData.some(obj => obj.check_jobs.length > 0) ? "admin-function-button" : "admin-function-button-disabled"} onClick={() => getSummaryData("get check jobs data")}>Pobierz wyniki kontroli</button>
                                </div>
                            }
                            {uniqueProgressDays.length > 0 &&
                                <div className="admin-selection-filter-wrapper2">
                                    <div className="admin-selection-filter-inner-wrapper2">
                                        <p className="admin-selection-filter-label">Data pomiarów:</p>
                                        <div>
                                            <select
                                                onChange={onSelectedProgressDayChange}
                                                value={progressFilters.start_date}
                                                name={'start_date'}
                                                className={"filter-select"}
                                            >
                                                {progressStartDates.map((date, index) => (
                                                    <option key={index} value={date}>{formatDate(date)}</option>
                                                ))}
                                            </select>
                                            <span className="job-selection-filter-date-separator">-</span>
                                            <select
                                                onChange={onSelectedProgressDayChange}
                                                value={progressFilters.end_date}
                                                name={'end_date'}
                                                className={"filter-select"}
                                            >
                                                {progressEndDates.map((date, index) => (
                                                    <option key={index} value={date}>{formatDate(date)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="admin-selection-filter-inner-wrapper2">
                                        <p className="admin-selection-filter-label">Status:</p>
                                        <div>
                                            <select
                                                onChange={onSelectedProgressDayChange}
                                                value={progressFilters.status}
                                                name={'status'}
                                                className={"filter-select"}
                                            >
                                                <option value={''}>wszystkie</option>
                                                {uniqueProgressStatuses.map((status, index) => (
                                                    <option key={index} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="admin-selection-filter-inner-wrapper2">
                                        <p className="admin-selection-filter-label">Wydana kontrola:</p>
                                        <div>
                                            <select
                                                onChange={onSelectedProgressDayChange}
                                                value={progressFilters.check}
                                                name={'check'}
                                                className={"filter-select"}
                                            >
                                                <option value={''}>wszystkie</option>
                                                <option value={'yes'}>tak</option>
                                                <option value={'no'}>nie</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div className="admin-working-middle-outer-wrapper">
                                <div id="admin-table-wrapper-3" ref={tableRef} className="admin-table-wrapper">
                                    <table className="job-working-details-table">
                                        <thead>
                                            <tr>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Data</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Stacja</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Liczba zadań<br></br>zwykłych</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pracownik</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Ukończone<br></br>etapy</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Liczba zadań<br></br>kontrolnych</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pracownik</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Ukończone<br></br>etapy</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pobierz<br></br>wyniki</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Wyświetl<br></br>szczegóły</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProgressData.length > 0 && filteredProgressData.map((day, index) =>
                                                <tr key={index}>
                                                    <th>{formatDate(day.recording_date)}</th>
                                                    <th>{day.station_name}</th>
                                                    <th>{day.normal_jobs.length}</th>
                                                    <th>{day.normal_jobs.length > 0 ? day.normal_jobs.map((job, i) =>
                                                            <p key={i} className="station-measurements-line station-measurements-line-nowrap">{job.user_full_name}</p>
                                                        ) : "-"}
                                                    </th>
                                                    <th>{day.normal_jobs.length > 0 ? day.normal_jobs.map((job, i) =>
                                                            <p key={i} className="station-measurements-line">{(job.completed_stages ? job.completed_stages : "0") + "/" + job.stages}</p>
                                                        ) : "-"}
                                                    </th>
                                                    <th>{day.check_jobs.length}</th>
                                                    <th>{day.check_jobs.length > 0 ? day.check_jobs.map((job, i) =>
                                                            <p key={i} className="station-measurements-line station-measurements-line-nowrap">{job.user_full_name}</p>
                                                        ) : "-"}
                                                    </th>
                                                    <th>{day.check_jobs.length > 0 ? day.check_jobs.map((job, i) =>
                                                            <p key={i} className="station-measurements-line">{(job.completed_stages ? job.completed_stages : "0") + "/" + job.stages}</p>
                                                        ) : "-"}
                                                    </th>
                                                    <th>{day.normal_jobs.length > 0 ? <button className="job-working-train-icon" onClick={() => getSummaryData("get station detailed data", {station_id: day.station_id, recording_date: day.recording_date})}><DownloadButtonIcon/></button> : "-"}</th>
                                                    <th>{day.normal_jobs.length > 0 ? <button className="job-working-train-icon" onClick={() => showDetailedPoint(day)}><MagnifyingGlassIcon/></button> : "-"}</th>
                                                </tr>
                                            )}
                                            {filteredProgressData.length === 0 &&
                                                <tr>
                                                    <th colSpan={12}>Żadne zadanie nie spełnia podanych kryteriów</th>
                                                </tr>
                                            }
                                        </tbody>
                                    </table> 
                                </div>
                            </div>
                        </>
                        }
                    </div>
                }
                {appLayer === 450 && 
                    <div className="job-assignment-panel-outer-container">
                        {updatedMeasurementSummaryData.length === 0 && 
                            <div className="waiting-wrapper">
                                <>
                                    <p className="waiting-message">Generowanie zestawienia</p>
                                    <Gear/>
                                </>
                            </div>
                        }
                        {outputMeasurementSummaryData.length > 0 &&
                            <>
                                {measurementSummaryData.date && measurementSummaryData.station_name && 
                                    <div className="job-assignment-panel-info-inner-wrapper">
                                        <p className="job-assignment-panel-text job-assignment-important">Wyniki pomiarów - stacji {measurementSummaryData.station_name} w dniu {formatDate(measurementSummaryData.date)}<button id="admin-back-button" onClick={() => cancelDetailedProgressView()}>Cofnij<span>&#10140;</span></button></p>
                                    </div>
                                }
                                <div className="user-panel-function-buttons-wrapper-2">
                                    <button className={outputMeasurementSummaryData.filter(obj => obj.measurements.length > 0).every(obj => selectedMeasuredTrains.includes(obj.train_id)) ? "admin-function-button admin-function-button-disabled" : "admin-function-button"} onClick={() => prepareJob('station', 'check')}>Utwórz zadanie kontrolne</button>
                                </div>
                                <div className="admin-working-middle-outer-wrapper">
                                    <div id="admin-table-wrapper-3-5" className="admin-table-wrapper">
                                        <table className="job-working-details-table">
                                            <thead>
                                                <tr>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span job-working-details-column">Wybór{updatedMeasurementSummaryData.some(obj => obj.measurements.length > 0) && <input onChange={inverseMeasuredSelection} checked={isMeasuredTrainChecked} type='checkbox' value={''}></input>}</span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'train_number' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Numer<br></br>pociągu<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('train_number')}>{measurementSummarySorting.attribute === 'train_number' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Relacja</span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'arrival_hour' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Godzina<br></br>przyjazdu<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('arrival_hour')}>{measurementSummarySorting.attribute === 'arrival_hour' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'departure_hour' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Godzina<br></br>odjazdu<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('departure_hour')}>{measurementSummarySorting.attribute === 'departure_hour' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Peron</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pracownik</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Numer<br></br>zadania</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Typ<br></br>zadania</span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'entered_sum' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Wsiadło<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('entered_sum')}>{measurementSummarySorting.attribute === 'entered_sum' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'exited_sum' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Wysiadło<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('exited_sum')}>{measurementSummarySorting.attribute === 'exited_sum' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'total_exchange' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Łączna<br></br>wymiana<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('total_exchange')}>{measurementSummarySorting.attribute === 'total_exchange' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'arrival_difference' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Różnica<br></br>przyjazd<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('arrival_difference')}>{measurementSummarySorting.attribute === 'arrival_difference' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'departure_difference' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Różnica<br></br>odjazd<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('departure_difference')}>{measurementSummarySorting.attribute === 'departure_difference' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className={measurementSummarySorting.attribute === 'accuracy' ? "job-working-details-table-header-cell job-working-details-table-header-cell-sorted" : "job-working-details-table-header-cell"}></div><span className="job-working-details-table-span job-working-details-column-2">Dokładność<br></br>pomiaru<br></br><button className="table-sorting-button-2" onClick={() => sortMeasurementSummaryTable('accuracy')}>{measurementSummarySorting.attribute === 'accuracy' ? (measurementSummarySorting.direction === 'descending' ? <span>&#x25be;</span>: <span>&#x25b4;</span>) : <span>&#x25B8;</span>}</button></span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Data<br></br>pomiaru</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {outputMeasurementSummaryData.map((train, index) =>
                                                    <tr key={index} className={train.measurements.length > 0 && train.measurements.some(item => item.job_type === 'check') ? "train-row-checked" : "train-row-not-checked"}>
                                                        <th>{train.measurements.length > 0 ? <input onChange={selectMeasurementRow} checked={!isMeasuredTrainSelected(train.train_id)} type='checkbox' value={train.train_id}></input> : "-"}</th>
                                                        <th className="table-no-wrap">{formatTrainNumber(train.train_number)}</th>
                                                        <th>{train.relation}</th>
                                                        <th>{train.arrival_hour ? train.arrival_hour : "-"}</th>
                                                        <th>{train.departure_hour ? train.departure_hour : "-"}</th>
                                                        <th>{train.platform ? train.platform : "b/d"}</th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.full_name}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.job_number}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.job_type === 'normal' || measurement.job_type === 'check') && getJobType(measurement.job_type)}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.entered_sum !== null && measurement.entered_sum !== undefined ? measurement.entered_sum : "-"}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.exited_sum !== null && measurement.exited_sum !== undefined ? measurement.exited_sum : "-"}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.entered_sum !== null && measurement.entered_sum !== undefined && measurement.exited_sum !== null && measurement.exited_sum !== undefined && (measurement.entered_sum + measurement.exited_sum > 0) ? measurement.entered_sum + measurement.exited_sum : "-"}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.arrival_hour && measurement.arrival_hour) ? calculateTimeDifference(train.arrival_hour, measurement.arrival_hour) : "-"}</p>
                                                            ) : "-"}
                                                        </th>  
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.departure_hour && measurement.departure_hour) ? calculateTimeDifference(train.departure_hour, measurement.departure_hour) : "-"}</p>
                                                            ) : "-"}
                                                        </th> 
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{getAccuracy(measurement.accuracy)}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurements.length > 0 ? train.measurements.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.measurement_date}</p>
                                                            ) : "-"}
                                                        </th>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table> 
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                }
                {appLayer === 500 && 
                    <div className="job-assignment-panel-outer-container">
                        {updatedCompletionJobsData.length === 0 && 
                            <div className="waiting-wrapper">
                                {searching && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!searching && 
                                    <>
                                        <p className="waiting-message">Brak danych w bazie</p>
                                        <button className='user-top-panel-button' onClick={()=>getJobsData()}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {updatedCompletionJobsData.length > 0 &&
                        <>
                            <div className="top-panel-admin-filters-container">
                                {uniqueJobsDays.length > 0 && 
                                    <div className="job-selection-filter-wrapper admin-selection-filter-wrapper">
                                        <p className="admin-selection-filter-label">Data pomiarów</p>
                                        <div className="job-selection-filter-dates-wrapper">
                                            <select
                                                onChange={onJobsDateChange}
                                                value={dateJobsFilters.job_start_date}
                                                name={'job_start_date'}
                                                className={"filter-select"}
                                            >
                                                {startJobsDates.map((date, index) => (
                                                <option key={index} value={date}>{formatDate(date)}</option>
                                                ))}
                                            </select>
                                            <span className="job-selection-filter-date-separator">-</span>
                                            <select
                                                onChange={onJobsDateChange}
                                                value={dateJobsFilters.job_end_date}
                                                name={'job_end_date'}
                                                className={"filter-select"}
                                            >
                                                {endJobsDates.map((date, index) => (
                                                <option key={index} value={date}>{formatDate(date)}</option>
                                                ))}
                                            </select>
                                            <button className="filter-single-remove-button" onClick={() => setDateJobsFilters({job_start_date: dateRange.min, job_end_date: dateRange.max})}><span className="filter-single-remove-button-span">&#10006;</span></button>
                                        </div>
                                    </div>
                                }
                                {uniqueJobsStations.length > 0 && 
                                    <div className="job-selection-filter-wrapper admin-selection-filter-wrapper">
                                        <p className="admin-selection-filter-label">Punkt</p>
                                        <div className="job-selection-filter-dates-wrapper"> 
                                            <select
                                                onChange={onJobsStationChange}
                                                value={jobsStationFilter}
                                                name={'job_station_id'}
                                                className={"filter-select"}
                                            >
                                                <option value="">Wszystkie</option>
                                                {filteredJobsStations.map((station, index) => (
                                                <option key={index} value={station.station_id}>{station.station_name}</option>
                                                ))}
                                            </select>
                                            <button className="filter-single-remove-button" onClick={() => setJobsStationFilter('')}><span className="filter-single-remove-button-span">&#10006;</span></button>
                                        </div>
                                    </div>
                                }
                                {uniqueJobsUsers.length > 0 && 
                                    <div className="job-selection-filter-wrapper admin-selection-filter-wrapper">
                                        <p className="admin-selection-filter-label">Pomiarowiec</p>
                                        <div className="job-selection-filter-dates-wrapper"> 
                                            <select
                                                onChange={onJobUserChange}
                                                value={jobsUserFilter}
                                                name={'job_user_full_name'}
                                                className={"filter-select"}
                                            >
                                                <option value="">Wszyscy</option>
                                                {filteredJobsUsers.map((user, index) => (
                                                <option key={index} value={user}>{user}</option>
                                                ))}
                                            </select>
                                            <button className="filter-single-remove-button" onClick={() => setJobsUserFilter('')}><span className="filter-single-remove-button-span">&#10006;</span></button>
                                        </div>
                                    </div>
                                }
                            
                                {uniqueJobsScheduleDays.length > 0 && 
                                    <div className="job-selection-filter-wrapper admin-selection-filter-wrapper">
                                        <p className="admin-selection-filter-label">Data wydania</p>
                                        <div className="job-selection-filter-dates-wrapper"> 
                                            
                                            <select
                                                onChange={(e) => onScheduleJobsDateChange(e)}
                                                value={scheduleDateJobsFilters}
                                                name={'job_start_date'}
                                                className={"filter-select"}
                                            >
                                                <option value="">Wszystkie</option>
                                                {filteredJobsScheduleDays.map((date, index) => (
                                                <option key={index} value={date}>{formatDate(date)}</option>
                                                ))}
                                            </select>
                                            <button className="filter-single-remove-button" onClick={() => setScheduleDateJobsFilters('')}><span className="filter-single-remove-button-span">&#10006;</span></button>
                                        </div>
                                    </div>
                                }
                                <div className="job-selection-filter-wrapper admin-selection-filter-wrapper">
                                    <p className="admin-selection-filter-label">Rodzaj zadania</p>
                                    <div className="job-selection-filter-dates-wrapper"> 
                                        
                                        <select
                                            onChange={onjobStatusFilterChange}
                                            value={jobStatusFilter.job_type}
                                            name={'job_type'}
                                            className={"filter-select"}
                                        >
                                            <option value={''}>Wszystkie</option>
                                            {filteredJobsTypes.map((type, index) => (
                                                <option key={index} value={type.type_value}>{type.type_name}</option>
                                            ))}
                                        </select>
                                        <button className="filter-single-remove-button" onClick={() => setJobStatusFilter({...jobStatusFilter, job_type: ''})}><span className="filter-single-remove-button-span">&#10006;</span></button>
                                    </div>
                                </div>
                                <div className="job-selection-filter-wrapper admin-selection-filter-wrapper">
                                    <p className="admin-selection-filter-label">Stan wykonania</p>
                                    <div className="job-selection-filter-dates-wrapper"> 
                                        <select
                                            onChange={onjobStatusFilterChange}
                                            value={jobStatusFilter.job_status}
                                            name={'job_status'}
                                            className={"filter-select"}
                                        >
                                            <option value={''}>Wszystkie</option>
                                            {filteredJobsStatuses.map((status, index) => (
                                                <option key={index} value={status.status_value}>{status.status_name}</option>
                                            ))}
                                        </select>
                                        <button className="filter-single-remove-button" onClick={() => setJobStatusFilter({...jobStatusFilter, job_status: ''})}><span className="filter-single-remove-button-span">&#10006;</span></button>
                                    </div>
                                </div>
                            </div>
                            <div id="filter-main-remove-button-wrapper">
                                <button className="filter-remove-button" onClick={() => clearAllFilters()}><span className="filter-remove-button-span">Wyczyść wszystkie filtry &#10006;</span></button>
                            </div>
                            <div className="job-working-middle-outer-wrapper">
                                <div id="admin-table-wrapper-4" ref={jobTableRef} className="admin-table-wrapper">
                                    <table className="job-working-details-table">
                                        <thead>
                                            <tr>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Numer<br></br>zadania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Data<br></br>pomiaru</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Punkt /<br></br>Pociąg</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pracownik</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Czas<br></br>przepracowany</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Czas<br></br>zaraportowany</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Liczba<br></br>etapów</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Ukończ.<br></br>etapy</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Postęp<br></br>[ % ]</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Średnia<br></br>na pociąg</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Typ<br></br>zadania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Data<br></br>wydania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Otwórz<br></br>w widoku<br></br>pracownika</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pokaż<br></br>szczegóły</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredJobsData.length > 0 && filteredJobsData.map((job, index) =>
                                                <tr key={index}>
                                                    <td>{job.job_number}</td>
                                                    <td>{formatDate(job.recording_date)}</td>
                                                    <td>{job.station_name ? job.station_name : (job.train_number + ": " + job.first_station_name + " - " + job.last_station_name)}</td>
                                                    <td>{job.full_name}</td>
                                                    <td>{job.work_hours ? job.work_hours : "00:00:00"}</td>
                                                    <td>{job.reported_work_hours ? job.reported_work_hours : "-"}</td>
                                                    <td>{job.stages}</td>
                                                    <td>{job.completed_stages ? job.completed_stages : "0"}</td>
                                                    <td>{job.completed_stages ? ((job.completed_stages/job.stages)*100).toFixed(2) : ""}</td>
                                                    <td>{(job.work_time && job.completed_stages) ? (formatTime(Math.round(job.work_time / job.completed_stages))) : "-"}</td>
                                                    <td>{job.type === "normal" ? "zwykłe" : "kontrolne"}</td>
                                                    <td>{formatDate(job.created_on)}</td>
                                                    <td><button className="job-working-train-icon" onClick={() => openJob(job)}><UserSolidIcon/></button></td>
                                                    <td><button className="job-working-train-icon" onClick={() => showDetailedJob(job)}><MagnifyingGlassIcon/></button></td>
                                                </tr>
                                            )}
                                            {filteredJobsData.length === 0 &&
                                                <tr>
                                                    <th colSpan={12}>Żadne zadanie nie spełnia podanych kryteriów</th>
                                                </tr>
                                            }
                                        </tbody>
                                    </table> 
                                </div>
                            </div>
                        </>}
                    </div>
                }
                {appLayer === 550 && 
                    <div className="job-assignment-panel-outer-container">
                        {detailedJobData.length === 0 && 
                            <div className="waiting-wrapper">
                                <>
                                    <p className="waiting-message">Generowanie zestawienia</p>
                                    <Gear/>
                                </>
                            </div>
                        }
                        {detailedJobData.length > 0 &&
                            <>
                                <div className="job-assignment-panel-info-inner-wrapper">
                                    <p className="job-assignment-panel-text job-assignment-important">Zadanie {detailedJobInfo.job_number} - {detailedJobInfo.type === 'station' ? 'stacja ' + detailedJobInfo.station_name : 'pociąg ' + detailedJobInfo.train_number + " " + detailedJobInfo.train_relation} {detailedJobInfo.recording_date && formatDate(detailedJobInfo.recording_date)}<button id="admin-back-button" onClick={() => cancelDetailedJobView()}>Cofnij<span>&#10140;</span></button></p>
                                    {cameraSlideList.length > 0 && <button className="job-additional-button job-additional-button-bottom" onClick={() => setModal({...modal, show: true, cameras_photos_panel: true})}>Podgląd kamer</button>}
                                    
                                </div>
                                <div className="user-panel-function-buttons-wrapper-2">
                                    {detailedJobInfo.type === 'station' && <button className={detailedJobData.filter(obj => obj.measurement && obj.measurement.length > 0).every(obj => selectedJobTrains.includes(obj.train_id)) ? "admin-function-button admin-function-button-disabled" : "admin-function-button"} onClick={() => prepareJob('station', 'check')/* Dodatkowy parametr zamiast ID??? */}>Utwórz zadanie kontrolne</button>}
                                </div>
                                <div className="admin-working-middle-outer-wrapper">
                                    <div id="admin-table-wrapper-4-5" className="admin-table-wrapper">
                                        <table className="job-working-details-table">
                                            <thead>
                                                <tr>
                                                    {detailedJobInfo.type === 'station' && <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span job-working-details-column">Wybór{detailedJobData.some(obj => obj.measurement && obj.measurement.length > 0) && <input onChange={inverseJobMeasuredSelection} checked={isJobMeasuredTrainChecked} type='checkbox' value={''}></input>}</span></th>}
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">{detailedJobInfo.type === 'station' ? 'Numer' : 'Nazwa'}<br></br>{detailedJobInfo.type === 'station' ? 'pociągu' : 'stacji'}</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">{detailedJobInfo.type === 'station' ? 'Relacja' : 'Badana'}</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Godzina<br></br>przyjazdu</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Godzina<br></br>odjazdu</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Peron</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Wsiadło</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Wysiadło</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Łączna<br></br>wymiana</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Różnica<br></br>przyjazd</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Różnica<br></br>odjazd</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Dokładność<br></br>pomiaru</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Data<br></br>wpisu</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Godzina<br></br>wpisu</span></th>
                                                    <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pracownik</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailedJobData.map((train, index) => {

                                                    const typeStation = train as MergedTrain;

                                                    const typeTrain = train as TrainStop;

                                                    return (

                                                        <tr key={index} className={detailedJobInfo.type === 'train' && typeTrain.active === false ? "not-measured-train" : ""}>
                                                            {detailedJobInfo.type === 'station' && 
                                                                <th>{train.measurement && train.measurement.length > 0 ? <input onChange={selectJobMeasurementRow} checked={!isJobMeasuredTrainSelected(train.train_id)} type='checkbox' value={train.train_id}></input> : "-"}</th>
                                                                }
                                                            <th className="table-no-wrap">{detailedJobInfo.type === 'station' ? typeStation.train_number && formatTrainNumber(typeStation.train_number) : typeTrain.station_name}</th>
                                                            <th>{detailedJobInfo.type === 'station' ? typeStation.relation : (typeTrain.active === true ? 'tak' : 'nie')}</th>
                                                            <th>{train.arrival_hour ? train.arrival_hour : "-"}</th>
                                                            <th>{train.departure_hour ? train.departure_hour : "-"}</th>
                                                            <th>{train.platform_number ? train.platform_number : "b/d"}</th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.entered_sum !== null && measurement.entered_sum !== undefined ? measurement.entered_sum : "-"}</p>
                                                                ) : "-"}
                                                            </th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.exited_sum !== null && measurement.exited_sum !== undefined ? measurement.exited_sum : "-"}</p>
                                                                ) : "-"}
                                                            </th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.entered_sum !== null && measurement.entered_sum !== undefined && measurement.exited_sum !== null && measurement.exited_sum !== undefined && (measurement.entered_sum + measurement.exited_sum > 0) ? measurement.entered_sum + measurement.exited_sum : "-"}</p>
                                                                ) : "-"}
                                                            </th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.arrival_hour && measurement.arrival_hour) ? calculateTimeDifference(train.arrival_hour, measurement.arrival_hour) : "-"}</p>
                                                                ) : "-"}
                                                            </th>  
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.departure_hour && measurement.departure_hour) ? calculateTimeDifference(train.departure_hour, measurement.departure_hour) : "-"}</p>
                                                                ) : "-"}
                                                            </th> 
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{getAccuracy(measurement.accuracy)}</p>
                                                                ) : "-"}
                                                            </th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.measurement_date).split(" ")[0]}</p>
                                                                ) : "-"}
                                                            </th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.measurement_date).split(" ")[1]}</p>
                                                                ) : "-"}
                                                            </th>
                                                            <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                    <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.full_name}</p>
                                                                ) : "-"}
                                                            </th>
                                                        </tr>

                                                    )
                                                })}
                                                {/*
                                                
                                                <tr key={index}>
                                                        {detailedJobInfo.type === 'station'
                                                            ? <th>{stationTrain.train_number}</th>
                                                            : <th>{movingTrain.station_name}</th>
                                                        }
                                                        </tr>
                                                
                                                
                                                
                                                
                                                
                                                
                                                detailedJobData.map((train, index) =>
                                                    <tr key={index} className={detailedJobInfo.type === 'train' && train.active === false ? "not-measured-train" : ""}>
                                                        {detailedJobInfo.type === 'station' && <th>{train.measurement && train.measurement.length > 0 ? <input onChange={selectJobMeasurementRow} checked={!isJobMeasuredTrainSelected(train.train_id)} type='checkbox' value={train.train_id}></input> : "-"}</th>}
                                                        <th className="table-no-wrap">{detailedJobInfo.type === 'station' ? formatTrainNumber(train.train_number) : train.station_name}</th>
                                                        <th>{detailedJobInfo.type === 'station' ? train.relation : (train.active === true ? 'tak' : 'nie')}</th>
                                                        <th>{train.arrival_hour ? train.arrival_hour : "-"}</th>
                                                        <th>{train.departure_hour ? train.departure_hour : "-"}</th>
                                                        <th>{train.platform_number ? train.platform_number : "b/d"}</th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.entered_sum !== null && measurement.entered_sum !== undefined ? measurement.entered_sum : "-"}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.exited_sum !== null && measurement.exited_sum !== undefined ? measurement.exited_sum : "-"}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.entered_sum !== null && measurement.entered_sum !== undefined && measurement.exited_sum !== null && measurement.exited_sum !== undefined && (measurement.entered_sum + measurement.exited_sum > 0) ? measurement.entered_sum + measurement.exited_sum : "-"}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.arrival_hour && measurement.arrival_hour) ? calculateTimeDifference(train.arrival_hour, measurement.arrival_hour) : "-"}</p>
                                                            ) : "-"}
                                                        </th>  
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.departure_hour && measurement.departure_hour) ? calculateTimeDifference(train.departure_hour, measurement.departure_hour) : "-"}</p>
                                                            ) : "-"}
                                                        </th> 
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{getAccuracy(measurement.accuracy)}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.measurement_date).split(" ")[0]}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.measurement_date).split(" ")[1]}</p>
                                                            ) : "-"}
                                                        </th>
                                                        <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                                <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.full_name}</p>
                                                            ) : "-"}
                                                        </th>
                                                    </tr>
                                                )*/}
                                                
                                            </tbody>
                                        </table> 
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                }
                {appLayer === 600 && 
                    <div id="user-view-app-inner-container-2">
                        <div className="admin-panel-main-menu-container-2">
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(610)}>
                                <p className="admin-panel-main-menu-title">Pracownicy</p>
                                <UserSolidIcon/>
                            </div>
                            <div className="admin-panel-main-menu-wrapper" onClick={()=>setAppLayer(620)}>
                                <p className="admin-panel-main-menu-title">Pociągi</p>
                                <TrainIcon/>
                            </div>
                        </div>
                        
                    </div>
                }
                {appLayer === 610 &&
                    <div id="user-view-app-inner-container">
                        {usersWithJobs.length === 0 &&
                            <div className="waiting-wrapper">
                                {userWithJobsSearching && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!userWithJobsSearching && 
                                    <>
                                        <p className="waiting-message">Brak pracowników z aktywnymi zadaniami</p>
                                        <button className='user-top-panel-button' onClick={() => getUsersWithJobsData()}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {usersWithJobs.length > 0 && 
                            <div className={selectedWorkerView === "" ? "user-view-selection-filter-wrapper" : "user-view-selection-filter-wrapper user-view-selection-filter-wrapper-border"}>
                                <div className="user-view-selection-filter-inside-wrapper">
                                    <p className="admin-selection-filter-label">Pracownik:</p>
                                    <div>
                                        <select
                                            onChange={onSelectedWorkerViewChange}
                                            value={selectedWorkerView}
                                            name={'selected-user-view'}
                                            className={"filter-select"}
                                        >
                                            {selectedWorkerView === '' && <option value={''}>wybierz</option>}
                                            {usersWithJobs.map((user, index) => (
                                                <option key={index} value={user.personal_id}>{user.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {activeJob && 
                                    <div className="user-view-top-panel-wrapper">
                                        <button className="user-top-panel-button" onClick={() => exitJob()}>Zmień zadanie</button>
                                    </div>
                                }
                            </div>
                        }
                        {selectedWorkerView !== '' && 
                            <>
                                {!activeJob && <div id="user-view-middle-wrapper">
                                    {!userViewSearching && selectedUserViewJobs.length > 0 && 
                                        <div className="job-selection-outer-wrapper">
                                            <div className="job-selection-top-panel-wrapper">
                                                {userViewJobDates.length > 0 && 
                                                    <div className="job-selection-filter-wrapper">
                                                        <p className="admin-selection-filter-label">Data pomiarów</p>
                                                        <select
                                                            onChange={onUserViewJobFilterChange}
                                                            value={jobFilters.job_date}
                                                            name='job_date'
                                                            className="filter-select"
                                                            id="user-job-date"
                                                        >
                                                            <option value=''>Wszystkie</option>
                                                            {userViewJobDates.map((date, index) => (
                                                                <option key={index} value={date}>{formatDate(date)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                }
                                                {userViewJobStations.length > 0 &&
                                                    <div className="job-selection-filter-wrapper">
                                                        <p className="admin-selection-filter-label">Nazwa stacji</p>
                                                        <select
                                                            onChange={onUserViewJobFilterChange}
                                                            value={jobFilters.job_station_name}
                                                            name='job_station_name'
                                                            className="filter-select"
                                                            id="user-job-station"
                                                        >
                                                            <option value=''>Wszystkie</option>
                                                            {userViewJobStations.map((station, index) => (
                                                                <option key={index} value={station}>{station}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                }
                                                <button className="clear-job-filters-button" onClick={() => setJobFilters({job_station_name: '', job_date: ''})}>Pokaż wszystkie</button>
                                            </div>
                                            <div className="admin-working-middle-outer-wrapper">
                                            <div id="admin-table-wrapper-5" className="admin-table-wrapper">
                                                <table className="job-working-details-table">
                                                    <thead>
                                                        <tr>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Numer<br></br>zadania</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Punkt/Pociąg</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Data</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Liczba<br></br>pociągów<br></br>/ stacji</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Liczba odcz.<br></br>pociągów<br></br>/ stacji</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">% wykonania</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Informacje<br></br>dodatkowe</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Czas pracy /<br></br>zaraportowany<br></br>czas pracy</span></th>
                                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Wybierz</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredUserViewJobs.map((job, index) =>
                                                            <tr key={index} className={job.stages === job.completed_stages ? "job-completed-row" : ""}>
                                                                <td>{job.job_number}</td> 
                                                                <td>{job.station_name ? job.station_name : job.first_station_name + ' \u2014 ' + job.last_station_name}</td>
                                                                <td>{formatDate(job.recording_date)}</td>
                                                                <td>{job.stages}</td>
                                                                <td>{job.completed_stages ? job.completed_stages : '0'}</td>
                                                                <td>{!job.completed_stages ? "0" : ((job.completed_stages/job.stages)*100).toFixed(2)}</td>
                                                                <td>{job.comments ? job.comments : 'brak'}</td>
                                                                <td><span className="table-reported-time-span">{job.work_hours}</span>{job.reported_work_hours && <span className="table-reported-time-span">{job.reported_work_hours}</span>}</td>
                                                                <td><button className="job-selection-button" onClick={() => activateJob(job.job_number)}>&#10000;</button></td>
                                                            </tr>
                                                        )}
                                                        {filteredUserViewJobs.length === 0 && 
                                                            <tr>
                                                                <td colSpan={9}>Brak zadań spełniających wybrane kryteria</td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </table> 
                                            </div>   
                                            </div>     
                                        </div>
                                    }
                                    {updatedUserViewJobs.length === 0 && 
                                        <div id="user-view-info-wrapper">
                                            {userViewSearching && 
                                                <>
                                                    <p className="waiting-message">Pobieranie danych</p>
                                                    <Gear/>
                                                </>
                                            }
                                            {!userViewSearching && 
                                                <>
                                                    <p className="waiting-message">Brak zadań dla wybranego pracownika</p>
                                                </>
                                            }
                                        </div>
                                    }
                                </div>
                                }
                                {activeJob && 
                                    <div id="job-working-outer-container" className={(activeTrain?.train_id || activeStation) ? "" : "job-working-outer-extended"}>
                                        <h1 className="section-title">Zadanie nr {activeJob.job_number}</h1>
                                        <div className="job-working-top-outer-wrapper">
                                            <div className="job-working-top-inner-wrapper">
                                                <p className="job-working-top-text">Data pomiarów: <span className="job-info-important">{formatDate(activeJob.recording_date)}</span></p>
                                                {activeJob.station_name && <p className="job-working-top-text">Badany punkt: <span className="job-info-important">{activeJob.station_name}</span></p>}
                                                {activeJob.station_name && activeJob.stages !== null && activeJob.stages !== undefined && <p className="job-working-top-text">Liczba pociągów: <span className="job-info-important">{activeJob.stages}</span></p>}
                                                {activeJob.train_number && <p className="job-working-top-text">Numer pociągu: <span className="job-info-important">{activeJob.train_number}</span></p>}
                                                {activeJob.first_station_name && activeJob.last_station_name && <p className="job-working-top-text">Relacja: <span className="job-info-important">{activeJob.first_station_name + " - " + activeJob.last_station_name}</span></p>}
                                            </div>
                                            <div className="job-working-top-2-inner-wrapper">
                                                {cameraSlides.length > 0 && <button className="job-additional-button" onClick={() => setModal({...modal, show: true, cameras_photos: true})}>Podgląd kamer</button>}
                                                {ftpList.length > 0 && <button className="job-additional-button" onClick={() => setModal({...modal, show: true, ftp_info: true})}>Pobierz filmy</button>}
                                                {activeJob.train_id && mergedUserViewTrains.length > 0 && mergedUserViewTrains[0].photos.length > 0 && <button onClick={() => showPhotos(activeJob.train_id!)} className="job-additional-button">Zobacz zdjęcia</button>}
                                            </div>
                                        </div>
                                        {activeJob.station_name && 
                                            <div className="job-working-middle-outer-wrapper">
                                                <div className="job-working-table-wrapper">
                                                    <table className="job-working-details-table">
                                                        <thead>
                                                            <tr>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Pociąg</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Peron</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Tor</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Przyjazd</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Odjazd</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Relacja</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">&sum; wsiadło</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">&sum; wysiadło</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Zdjęcia</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Zmiany w<br></br>rozkładzie</span></th>
                                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Wyświetl</span></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {mergedUserViewTrains.map((train, index) =>
                                                                <tr key={index} className={`${getClassNames(train)}`}>
                                                                    <td>{train.train_number}</td>
                                                                    <td>{train.platform_number ? train.platform_number : "b/d"}</td>
                                                                    <td>{train.lane_number ? train.lane_number : "b/d"}</td>
                                                                    <td>{train.arrival_hour ? train.arrival_hour : "-"}</td>
                                                                    <td>{train.departure_hour ? train.departure_hour : "-"}</td>
                                                                    <td>{train.first_station_name + " - " + train.last_station_name}</td>
                                                                    <td>{train.measurement && train.measurement.length > 0 && train.measurement[0].entered_sum}</td>
                                                                    <td>{train.measurement && train.measurement.length > 0 && train.measurement[0].exited_sum}</td>
                                                                    <td>{train.photos[0] ? <button className="job-working-train-icon" onClick={() => showPhotos(train.train_id)}><MagnifyingGlassIcon/></button> : "brak"}</td>
                                                                    <td>{train.delay ? train.delay : "-"}</td>
                                                                    <td><button className="job-working-train-icon" onClick={() => activateTrain(train.train_id)}><TrainIcon/></button></td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table> 
                                                </div>
                                            </div>
                                        }
                                        {activeJob.train_number && <div className="job-working-middle-outer-wrapper">
                                            <div className="job-working-table-wrapper">
                                                <table className="job-working-details-table">
                                                    <thead>
                                                        <tr>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Stacja</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Peron</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Tor</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Przyjazd</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Odjazd</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">&sum; wsiadło</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">&sum; wysiadło</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Zmiany w<br></br>rozkładzie</span></th>
                                                            <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Analizuj</span></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {mergedUserViewTrains[0] && mergedUserViewTrains[0].stops.map((train_stop, index) =>
                                                            <tr key={index} className={`${getStationClassNames(train_stop)}`}>
                                                                <td>{train_stop.station_name}</td>
                                                                <td>{train_stop.platform_number ? train_stop.platform_number : "b/d"}</td>
                                                                <td>{train_stop.lane_number ? train_stop.lane_number : "b/d"}</td>
                                                                <td>{train_stop.arrival_hour ? train_stop.arrival_hour : '-'}</td>
                                                                <td>{train_stop.departure_hour ? train_stop.departure_hour : '-'}</td>
                                                                <td>{train_stop.active ? (train_stop.measurement && train_stop.measurement.length > 0 ? train_stop.measurement[0].entered_sum : "") : "-"}</td>
                                                                <td>{train_stop.active ? (train_stop.measurement && train_stop.measurement.length > 0 ? train_stop.measurement[0].exited_sum : "") : "-"}</td>
                                                                <td>{train_stop.delay ? train_stop.delay : '-'}</td>
                                                                <td>{train_stop.active === true ? <button className="job-working-train-icon" onClick={() => activateStation(train_stop)}><TrainIcon/></button> : "-"}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table> 
                                            </div>
                                        </div>}
                                        {(activeTrain?.train_id || activeStation) && 
                                            <div className="job-working-bottom-outer-wrapper">
                                                <div className="measurement-title">
                                                    {activeTrain?.train_id && <h2 className="section-title">Pociąg {activeTrain.train_number}<br></br>{activeTrain.first_station_name} - {activeTrain.last_station_name}</h2>}
                                                    {activeStation && <h2 className="section-title">Stacja {getStationName()}</h2>}
                                                </div>
                                                <div className="entered-exited-form-outer-container">
                                                    <div className="entered-exited-form-middle-wrapper">
                                                        <div className="entered-exited-form-inner-wrapper">
                                                            <p className="measuring-form-label measuring-form-label-fixed-width">Wsiadło</p>
                                                            <div className="entered-exited-outer-line-wrapper">
                                                                <div className="entered-exited-line-wrapper">
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'entered_1'}
                                                                        name={'entered_1'}
                                                                        value={measurementFormData.entered_1 !== undefined ? measurementFormData.entered_1 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'entered_2'}
                                                                        name={'entered_2'}
                                                                        value={measurementFormData.entered_2 !== undefined ? measurementFormData.entered_2 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'entered_3'}
                                                                        name={'entered_3'}
                                                                        value={measurementFormData.entered_3 !== undefined ? measurementFormData.entered_3 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <div className="entered-exited-line-wrapper">
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'entered_4'}
                                                                        name={'entered_4'}
                                                                        value={measurementFormData.entered_4 !== undefined ? measurementFormData.entered_4 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'entered_5'}
                                                                        name={'entered_5'}
                                                                        value={measurementFormData.entered_5 !== undefined ? measurementFormData.entered_5 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'entered_6'}
                                                                        name={'entered_6'}
                                                                        value={measurementFormData.entered_6 !== undefined ? measurementFormData.entered_6 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="entered-exited-sum-wrapper">
                                                                <input 
                                                                    className="input-number input-number-sum" 
                                                                    type="number" 
                                                                    min="0" 
                                                                    id={'entered_sum'}
                                                                    name={'entered_sum'}
                                                                    value={measurementFormSummary.entered_sum !== '' ? measurementFormSummary.entered_sum : ""}
                                                                    readOnly
                                                                />
                                                                <p className="measuring-form-label">&sum;</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="entered-exited-form-middle-wrapper">
                                                        <div className="entered-exited-form-inner-wrapper">
                                                            <p className="measuring-form-label measuring-form-label-fixed-width">Wysiadło</p>
                                                            <div className="entered-exited-outer-line-wrapper">
                                                                <div className="entered-exited-line-wrapper">
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'exited_1'}
                                                                        name={'exited_1'}
                                                                        value={measurementFormData.exited_1 !== undefined ? measurementFormData.exited_1 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'exited_2'}
                                                                        name={'exited_2'}
                                                                        value={measurementFormData.exited_2 !== undefined ? measurementFormData.exited_2 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'exited_3'}
                                                                        name={'exited_3'}
                                                                        value={measurementFormData.exited_3 !== undefined ? measurementFormData.exited_3 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                                <div className="entered-exited-line-wrapper">
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'exited_4'}
                                                                        name={'exited_4'}
                                                                        value={measurementFormData.exited_4 !== undefined ? measurementFormData.exited_4 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'exited_5'}
                                                                        name={'exited_5'}
                                                                        value={measurementFormData.exited_5 !== undefined ? measurementFormData.exited_5 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                    <input 
                                                                        className="input-number" 
                                                                        type="number" 
                                                                        min="0" 
                                                                        id={'exited_6'}
                                                                        name={'exited_6'}
                                                                        value={measurementFormData.exited_6 !== undefined ? measurementFormData.exited_6 : ""}
                                                                        onWheel={(e) => e.currentTarget.blur()}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="entered-exited-sum-wrapper">
                                                                <input 
                                                                    className="input-number input-number-sum" 
                                                                    type="number" 
                                                                    min="0" 
                                                                    id={'exited_sum'}
                                                                    name={'exited_sum'}
                                                                    value={measurementFormSummary.exited_sum !== "" ? measurementFormSummary.exited_sum : ""}
                                                                    readOnly
                                                                />
                                                                <p className="measuring-form-label">&sum;</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hours-form-outer-wrapper">
                                                    <div className="hours-form-additional-wrapper">
                                                        <div className="hours-form-wrapper">
                                                            <p className="measuring-form-label measuring-form-label-fixed-width-2">Godzina przyjazdu</p>
                                                            <div className="hours-inner-wrapper">
                                                                
                                                                <input
                                                                    className="input-number input-time"
                                                                    type="time"
                                                                    id="arrival"
                                                                    name="arrival"
                                                                    value={jobTime.arrival}
                                                                    onChange={handleTimeChange}
                                                                    step="60" 
                                                                    readOnly
                                                                />
                                                                
                                                            </div>
                                                        </div>
                                                        <div className="hours-form-wrapper">
                                                            <p className="measuring-form-label measuring-form-label-fixed-width-2">Godzina odjazdu</p>
                                                            <div className="hours-inner-wrapper">
                                                                
                                                                <input
                                                                    className="input-number input-time"
                                                                    type="time"
                                                                    id="departure"
                                                                    name="departure"
                                                                    value={jobTime.departure}
                                                                    onChange={handleTimeChange}
                                                                    step="60" 
                                                                    readOnly
                                                                />
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                   
                                                </div>
                                                <div className="form-slider-outer-wrapper">
                                                    <div id="slider-info-parent">
                                                        <p className="measuring-form-label" onMouseOver={() => setSliderInfo(true)} onMouseOut={() => setSliderInfo(false)}>Dokładność pomiaru<span id="info-slider-span">&#9432;</span></p>
                                                        {sliderInfo &&
                                                        <div id="slider-info-child">
                                                            <p className="slider-info-child-paragraph">99% - możliwy błąd 1 osoby na 100</p>
                                                            <p className="slider-info-child-paragraph">95% - możliwy błąd 1 osoby na 25</p>
                                                            <p className="slider-info-child-paragraph">90% - możliwy błąd 1 osoby na 10</p>
                                                            <p className="slider-info-child-paragraph">80% - możliwy błąd 2 osoby na 10</p>
                                                            <p className="slider-info-child-paragraph">Uwaga - wymagana jest dokładność pomiaru na poziomie 99-95%.</p>
                                                            <p className="slider-info-child-paragraph">Wyższy poziom błędu jest dopuszczalny tylko jeśli jakość obrazu nie pozwala na dokładne policzenie osób.</p>
                                                        </div>
                                                        }
                                                    </div>
                                                    <div className="form-slider-inner-wrapper">
                                                        <input
                                                            id="accuracy-slider"
                                                            type="range"
                                                            min={1}
                                                            max={5}
                                                            step={1}
                                                            value={accuracy === '' ? 1 : accuracy}
                                                            onWheel={(e) => e.currentTarget.blur()}
                                                            readOnly
                                                        />
                                                        <div className="form-slider-info-outer-wrapper">
                                                            <div className="form-slider-info-inner-wrapper">
                                                                <span className="form-slider-span">&#10072;</span>
                                                                <span className="form-slider-span form-slider-span-lower">&lt;80%</span>
                                                            </div>
                                                            <div className="form-slider-info-inner-wrapper">
                                                                <span className="form-slider-span">&#10072;</span>
                                                                <span className="form-slider-span form-slider-span-lower">80%</span>
                                                            </div>
                                                            <div className="form-slider-info-inner-wrapper">
                                                                <span className="form-slider-span">&#10072;</span>
                                                                <span className="form-slider-span form-slider-span-lower">90%</span>
                                                            </div>
                                                            <div className="form-slider-info-inner-wrapper">
                                                                <span className="form-slider-span">&#10072;</span>
                                                                <span className="form-slider-span form-slider-span-lower">95%</span>
                                                            </div>
                                                            <div className="form-slider-info-inner-wrapper">
                                                                <span className="form-slider-span">&#10072;</span>
                                                                <span className="form-slider-span form-slider-span-lower">99%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-additional-fields-outer-wrapper">
                                                    <p className="measuring-form-label">Komentarz</p>
                                                    <div className="form-additional-fields-inner-wrapper">
                                                        <textarea 
                                                            id="add_comment"
                                                            name="add_comment"
                                                            placeholder="komentarz do pomiaru"
                                                            className="cam-form-field cam-form-field-textarea"
                                                            onChange={handleComment}   
                                                            value={additionalComment}
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                            </>
                        }
                    </div>
                }
                {appLayer === 620 &&
                    <div id="user-view-app-inner-container">
                        {trainListSelectionData.length === 0 &&
                            <div className="waiting-wrapper">
                                {trainViewSearching && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!trainViewSearching && 
                                    <>
                                        <p className="waiting-message">Brak pociągów w bazie danych</p>
                                        <button className='user-top-panel-button' onClick={()=>getTrainViewData()}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {trainListSelectionData.length > 0 &&
                            <div className={selectedTrainListView.train === "" ? "user-view-selection-filter-wrapper" : "user-view-selection-filter-wrapper user-view-selection-filter-wrapper-border"}>
                                <div className="user-view-selection-filter-inside-wrapper train-list-view-wrapper">
                                    <div className="train-list-view-inner-wrapper">
                                        <p className="admin-selection-filter-label admin-selection-filter-label-nowrap">Grupa pociągów:</p>
                                        <div>
                                            <select
                                                onChange={onSelectedTrainViewChange}
                                                value={selectedTrainListView.trains_group}
                                                name={'trains_group'}
                                                className={"filter-select"}
                                            >
                                                {selectedTrainListView.trains_group === '' && <option value={''}>wybierz</option>}
                                                {trainListSelectionData.map((group, index) => (
                                                    <option key={index} value={group.name}>{group.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <span className="train-list-separator">&#10230;</span>
                                    <div className="train-list-view-inner-wrapper">
                                        <p className="admin-selection-filter-label">Pociąg:</p>
                                        <div>
                                            <select
                                                onChange={onSelectedTrainViewChange}
                                                value={selectedTrainListView.train}
                                                name={'train'}
                                                className={"filter-select"}
                                                disabled={selectedTrainListView.trains_group === ''}
                                            >
                                                {selectedTrainListView.train === '' && <option value={''}>wybierz</option>}
                                                {trainListSelectionData.filter(item => item.name === selectedTrainListView.trains_group).length > 0 && trainListSelectionData.filter(item => item.name === selectedTrainListView.trains_group)[0].data.map((train, index) => (
                                                    <option key={index} value={train}>{train}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div> 
                                </div>                
                            </div>
                        }
                        {trainViewDetailedSearching.active &&
                            <div className="waiting-wrapper waiting-wrapper-2">
                                {trainViewDetailedSearching.search && 
                                    <>
                                        <p className="waiting-message">Pobieranie danych</p>
                                        <Gear/>
                                    </>
                                }
                                {!trainViewDetailedSearching.search && 
                                    <>
                                        <p className="waiting-message">Wystąpił problem z pobraniem danych</p>
                                        <button className='user-top-panel-button' onClick={getTrainViewData}>Sprawdź ponownie</button>
                                    </>
                                }
                            </div>
                        }
                        {outputDetailedTrain && outputDetailedTrain.train_id && 
                            <div className="job-working-middle-outer-wrapper">
                                <div className="train-view-title-wrapper">
                                    <p className="job-assignment-panel-text job-assignment-important">Pociąg {outputDetailedTrain.train_number} relacji {outputDetailedTrain.first_station_name} - {outputDetailedTrain.last_station_name}</p>
                                </div>
                                <div id="admin-table-wrapper-5-5" className="admin-table-wrapper">
                                    <table className="job-working-details-table">
                                        <thead>
                                            <tr>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Numer<br></br>stacji</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Nazwa<br></br>stacji</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Planowy<br></br>przyjazd</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Planowy<br></br>odjazd</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Peron</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Tor</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Daty<br></br>pomiaru</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Numer<br></br>zadania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Rodzaj<br></br>zadania</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Sprawdzany<br></br>dzień</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Suma<br></br>wsiadających</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Suma<br></br>wysiadających</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Różnica<br></br>przyjazd</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Różnica<br></br>odjazd</span></th>
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Odczytujący<br></br>pracownik</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {outputDetailedTrain.stops.length > 0 && outputDetailedTrain.stops.map((train, index) =>
                                                <tr key={index}>
                                                    <th>{index+1}</th>
                                                    <th>{train.station_name}</th>
                                                    <th>{train.arrival_hour ? train.arrival_hour : "-"}</th>
                                                    <th>{train.departure_hour ? train.departure_hour : "-"}</th>
                                                    <th>{train.platform_number ? train.platform_number : "b/d"}</th>
                                                    <th>{train.lane_number ? train.lane_number : "b/d"}</th>
                                                    <th>{train.recording_dates && train.recording_dates.length > 0 ? train.recording_dates.map((date, i) => 
                                                        <p key={i} className="station-measurements-line station-measurements-line-nowrap">{formatDate(date)}</p>
                                                    ) : "-"}
                                                    </th>
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) => 
                                                        <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.job_number}</p>
                                                    ) : "-"}
                                                    </th>
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) => 
                                                        <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.job_type === 'normal' ? 'zwykłe' : 'kontrolne'}</p>
                                                    ) : "-"}
                                                    </th>
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) => 
                                                        <p key={i} className="station-measurements-line station-measurements-line-nowrap">{formatDate(measurement.recording_date)}</p>
                                                    ) : "-"}
                                                    </th>
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) => 
                                                        <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.entered_sum !== null && measurement.entered_sum !== undefined) ? measurement.entered_sum : "-"}</p>
                                                    ) : "-"}
                                                    </th>
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) => 
                                                        <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(measurement.exited_sum !== null && measurement.exited_sum !== undefined) ? measurement.exited_sum : "-"}</p>
                                                    ) : "-"}
                                                    </th>
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                            <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.arrival_hour && measurement.arrival_hour) ? calculateTimeDifference(train.arrival_hour, measurement.arrival_hour) : "-"}</p>
                                                        ) : "-"}
                                                    </th>  
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                            <p key={i} className="station-measurements-line station-measurements-line-nowrap">{(train.departure_hour && measurement.departure_hour) ? calculateTimeDifference(train.departure_hour, measurement.departure_hour) : "-"}</p>
                                                        ) : "-"}
                                                    </th> 
                                                    <th>{train.measurement && train.measurement.length > 0 ? train.measurement.map((measurement, i) =>
                                                            <p key={i} className="station-measurements-line station-measurements-line-nowrap">{measurement.full_name}</p>
                                                        ) : "-"}
                                                    </th>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table> 
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
            {modal.show &&
                <div className="modal-overlay" onClick={() => closeModal()}>
                    {/* Dodawanie użytkownika */}
                    {modal.add_user && !modal.error &&
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Dodaj użytkownika</h2>
                                <button id="modal-close-button" onClick={closeModal}>&#10006;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-line-outer-wrapper">
                                    <div className="form-line-column-wrapper">
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Nazwa użytkownika:</span>
                                            <input 
                                                className="user-form"
                                                id="add_username"
                                                type="text"
                                                onChange={userAddFormChange}
                                                name="add_username"
                                                value={userAddForm.add_username}
                                                autoComplete="new-password"
                                            />
                                            {usernameTaken && <p id="username-taken-error">nazwa użytkownika jest już zajęta</p>}
                                        </div>
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Hasło:</span>
                                            <input 
                                                className="user-form"
                                                id="add_password"
                                                type="password"
                                                onChange={userAddFormChange}
                                                name="add_password"
                                                value={userAddForm.add_password}
                                                autoComplete="new-password" 
                                            />
                                        </div>
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Imię i nazwisko:</span>
                                            <input 
                                                className="user-form"
                                                id="full_name"
                                                type="text"
                                                onChange={userAddFormChange}
                                                name="full_name"
                                                value={userAddForm.full_name}
                                            />
                                        </div>
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Mail:</span>
                                            <input 
                                                className="user-form"
                                                id="mail"
                                                type="text"
                                                onChange={userAddFormChange}
                                                name="mail"
                                                value={userAddForm.mail}
                                            />
                                        </div>
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Telefon:</span>
                                            <input 
                                                className="user-form"
                                                id="phone"
                                                type="text"
                                                onChange={userAddFormChange}
                                                name="phone"
                                                value={userAddForm.phone}
                                            />
                                        </div>
                                    </div>
                                    <div className="vertical-separator"></div>
                                    <div className="form-line-column-wrapper">
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Ocena:</span>
                                            <div className="user-form-slider-wrapper">
                                                <span className="form-slider-label">1</span>
                                                <input
                                                    type="range"
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    id="rating"
                                                    name="rating"
                                                    value={userAddForm.rating}
                                                    onChange={userAddFormChange}
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                />
                                                <span className="form-slider-label">5</span>
                                            </div>
                                        </div>
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Stawka:</span>
                                            <input 
                                                className="user-form"
                                                id="hour_rate"
                                                type="text"
                                                onChange={userAddFormChange}
                                                name="hour_rate"
                                                value={userAddForm.hour_rate}
                                            />
                                        </div>
                                        <div className="form-line-wrapper">
                                            <span className="form-label">Komentarz:</span>
                                            <textarea 
                                                className="user-comment"
                                                id="comment"
                                                onChange={userAddFormChange}
                                                name="comment"
                                                value={userAddForm.comment}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className="user-top-panel-button" onClick={() => createUser()}>Utwórz użytkownika</button>
                                </div>
                            </div>
                        </div>
                    }
                    {/* Zmiana hasła */}
                    {modal.change_password && !modal.error &&
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Zmień hasło</h2>
                            </div>
                            <div className="modal-body">
                                <div className="form-line-wrapper">
                                    <p className="modal-info-text">Podaj nowe hasło dla użytkownika {passwordChange.full_name}:</p>
                                </div>
                                <div className="form-line-wrapper">
                                    <input 
                                        className="user-form user-form-margin"
                                        id="new_password"
                                        type="password"
                                        onChange={newPasswordChange}
                                        name="new_password"
                                        value={passwordChange.new_password}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className="user-top-panel-button user-top-panel-button-fixed" onClick={() => changePassword()}>Potwierdź</button>
                                    <button className="user-top-panel-button user-top-panel-button-fixed user-top-panel-button-red" onClick={() => closeModal()}>Anuluj</button>
                                </div>
                            </div>
                        </div>
                    }
                    {/* Zmiana statusu użytkownika */}
                    {modal.change_status && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">{userToDeactivate.new_status === 'active' ? "Aktywacja użytkownika" : "Deaktywacja użytkownika"}</h2>
                            </div>
                            <div className="modal-body">
                                <p className="modal-info-text modal-info-text-margin">Czy na pewno chcesz {userToDeactivate.new_status === 'active' ? "aktywować" : "deaktywować"} użytkownika {userToDeactivate.full_name}?</p>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className="user-top-panel-button user-top-panel-button-fixed" onClick={() => changeUserActivation()}>{userToDeactivate.new_status === 'active' ? "Aktywuj" : "Deaktywuj"}</button>
                                    <button className="user-top-panel-button user-top-panel-button-fixed user-top-panel-button-red" onClick={() => closeModal()}>Anuluj</button>
                                </div>
                            </div>
                        </div>
                    }
                    {/* Dodawanie zadania */}
                    {modal.create_job && !modal.error && chosenUser &&
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Utwórz zadanie</h2>
                            </div>
                            <div className="modal-body">
                                <div className="form-line-wrapper">
                                    <span className="form-label">Czy na pewno utworzyć zadanie i przydzielić<br></br>je pracownikowi {(chosenUser.first_name && chosenUser.surname) ? chosenUser.first_name + " " + chosenUser.surname : chosenUser.username}?</span>
                                </div>
                                <div className="form-line-wrapper form-line-wrapper-extended">
                                    <textarea 
                                        id="job_comments"
                                        name="job_comments"
                                        placeholder="Opcjonalny komentarz do zadania"
                                        className="cam-form-field cam-form-field-textarea"
                                        onChange={handleComment}   
                                        value={jobComment}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className="user-top-panel-button user-top-panel-button-fixed" onClick={() => createJob()}>Utwórz zadanie</button>
                                    <button className="user-top-panel-button user-top-panel-button-fixed user-top-panel-button-red" onClick={() => closeModal()}>Anuluj</button>

                                </div>
                            </div>
                        </div>
                    }
                    {/* Błędy */}
                    {modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header modal-header-error">
                                <h2 className="modal-title">Błąd</h2>
                            </div>
                            <div className="modal-body">
                                {formErrors.length > 0 && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">Formularz zawiera błędy:</p>
                                        <ul className="modal-error-ul">
                                            {formErrors.map((error, index) => (
                                                <li className="modal-error-list" key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                }
                                {modalErrorMessage && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">{modalErrorMessage}</p>
                                    </div>
                                }
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className="user-top-panel-button user-top-panel-button-red" onClick={() => closeErrorModal()}>OK</button>
                                </div>
                            </div>
                        </div>
                    }
                    {/* Pokazywanie zdjęć */}
                    {modal.show_photo && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div id="modal-header" className="modal-header">
                                <h2 className="modal-title">Podgląd zdjęć</h2>
                                <button id="modal-close-button" onClick={() => closeModal()}>&#10006;</button>
                            </div>
                            <div className="modal-body">
                                {photosToShow.length > 0 &&
                                    <div className="photo-preview-wrapper">
                                        <Carousel>
                                            {photosToShow.map((image, index) =>
                                                <CarouselItem key={index} name={image.name}>
                                                    <div className="carousel-image-wrapper">
                                                        <img onClick={() => runModal(index)} className="camera-image" referrerPolicy="no-referrer" src={image.url} alt="pociąg"/>
                                                    </div>
                                                </CarouselItem>
                                            )}
                                        </Carousel>
                                        <Lightbox
                                            open={openModal}
                                            index={imageIndex}
                                            close={() => setOpenModal(false)}
                                            slides={viewModalSlides}
                                            plugins={[Thumbnails, Zoom]}
                                            zoom={{
                                                maxZoomPixelRatio: 10,
                                                scrollToZoom: true
                                            }}
                                        />
                                    </div>
                                }
                            </div>       
                        </div>
                    }
                    {/* Podgląd kamer */}
                    {modal.cameras_photos && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div id="modal-header" className="modal-header">
                                <button id="modal-close-button" onClick={() => closeModal()}>&#10006;</button>
                                <h2 className="modal-title">Podgląd kamer</h2>
                            </div>
                            <div className="modal-body">
                                {cameraSlides.length > 0 && <div className="photo-preview-wrapper">
                                    <Carousel>
                                        {cameraSlides.map((image, index) =>
                                            <CarouselItem key={index} name={image.name}>
                                                <div className="carousel-image-wrapper">
                                                    <img onClick={() => runModal(index)} className="camera-image" referrerPolicy="no-referrer" src={image.url} alt="kamera"/>
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </Carousel>
                                    <Lightbox
                                        open={openModal}
                                        index={imageIndex}
                                        close={() => setOpenModal(false)}
                                        slides={modalSlides}
                                        plugins={[Thumbnails, Zoom]}
                                        zoom={{
                                            maxZoomPixelRatio: 10,
                                            scrollToZoom: true
                                        }}
                                    />
                                </div>}
                            </div>
                        </div>
                    }
                    {/* Podgląd kamer - panel realizacji */}
                    {modal.cameras_photos_panel && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div id="modal-header" className="modal-header">
                                <button id="modal-close-button" onClick={() => closeModal()}>&#10006;</button>
                                <h2 className="modal-title">Informacje o filmach</h2>
                            </div>
                            <div className="modal-body">
                                {ftpDirectoriesList.length > 0 && <div className="ftp-nested-list-wrapper">
                                    <div id="ftp-info-admin-wrapper">
                                        <p>Filmy z badanego punktu znajdują się w:</p>
                                        <ul className="ftp-nested-list ftp-nested-list-padding">
                                            {ftpDirectoriesList.map((ftp, index) => (
                                                <li key={index}>{ftp.disk}/{ftp.path}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>}
                                {cameraSlideList.length > 0 && <div className="photo-preview-wrapper">
                                    <Carousel>
                                        {cameraSlideList.map((image, index) =>
                                            <CarouselItem key={index} name={image.name}>
                                                <div className="carousel-image-wrapper">
                                                    <img onClick={() => runModal(index)} className="camera-image" referrerPolicy="no-referrer" src={image.url} alt="kamera"/>
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </Carousel>
                                    <Lightbox
                                        open={openModal}
                                        index={imageIndex}
                                        close={() => setOpenModal(false)}
                                        slides={modalSlides}
                                        plugins={[Thumbnails, Zoom]}
                                        zoom={{
                                            maxZoomPixelRatio: 10,
                                            scrollToZoom: true
                                        }}
                                    />
                                </div>}
                            </div>
                        </div>
                    }
                    {/* Podgląd ftp */}
                    {modal.ftp_info && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div id="modal-header" className="modal-header">
                                <button id="modal-close-button" onClick={() => closeModal()}>&#10006;</button>
                                <h2 className="modal-title">Pobieranie z FTP</h2>
                            </div>
                            <div className="modal-body">
                                <div id="ftp-info-container">
                                    <ol>
                                        <li>Pobierz, a następnie zainstaluj darmowego klienta FTP - Filezilla z <a className="ftp-link" target="_blank" rel="noreferrer" href="https://filezilla-project.org/download.php">tego adresu</a></li>
                                        <li>Połącz się z serwerem za pomocą poniższych danych:
                                            <ul className="ftp-nested-list">
                                                <li>Host - <span id="ftp_host" className="ftp-span">rubika.myftp.org</span><button className="ftp-button" onClick={() => copyText('ftp_host')}>{buttonStatus.ftp_host ? 'skopiowano' : 'kopiuj'}</button></li>
                                                <li>Użytkownik - <span id="ftp_user" className="ftp-span">filmy</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="ftp-button" onClick={() => copyText('ftp_user')}>{buttonStatus.ftp_user ? 'skopiowano' : 'kopiuj'}</button></li>
                                                <li>Hasło - <span id="ftp_password" className="ftp-span">997analiza</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button className="ftp-button" onClick={() => copyText('ftp_password')}>{buttonStatus.ftp_password ? 'skopiowano' : 'kopiuj'}</button></li>
                                            </ul>
                                        </li>
                                        <li>Filmy z badanego punktu znajdziesz w poniższych lokalizacjach:
                                            <ul className="ftp-nested-list">
                                                {ftpList.map((ftp, index) => (
                                                    <li key={index}>{ftp.disk}/{ftp.path}</li>
                                                ))}
                                            </ul>
                                        </li>
                                        <li>Jeśli potrzebujesz informacji jak korzystać z klienta FTP <a className="ftp-link" target="_blank" rel="noreferrer" href="https://analiza.badaniaruchu.pl/photos/ftp.jpg">zajrzyj tutaj</a></li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    }
                    {/* Dodawanie listy pociągów */}
                    {modal.import_trains && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Importuj listę pociągów</h2>
                            </div>
                            <div className="modal-body">
                                <textarea 
                                    id="train_list"
                                    name="train_list"
                                    placeholder="Wklej listę pociągów"
                                    className="train-list-import-area"
                                    onChange={handleTrainListImport}   
                                    value={trainListImport}
                                />
                            </div>
                            {importListMessage && 
                                <div className="modal-info-wrapper">
                                    <p className="modal-info-text modal-info-error">{importListMessage}</p>
                                </div>
                            }
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className={trainListImport !== '' ? "user-top-panel-button user-top-panel-button-fixed" : "user-top-panel-button user-top-panel-button-fixed user-top-panel-button-disabled"} onClick={() => importTrainList()}>Importuj</button>
                                    <button className="user-top-panel-button user-top-panel-button-fixed user-top-panel-button-red" onClick={() => closeModal()}>Anuluj</button>
                                </div>
                            </div>
                        </div>
                    }
                    {/* Informacje */}
                    {modal.info && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Informacja</h2>
                            </div>
                            <div className="modal-body">
                                {modalMessage && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text modal-success-text">{modalMessage}</p>
                                        {modalSpin && <Gear/>}
                                    </div>
                                }                   
                            </div>
                            {!modalSpin && <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    {modalMessage && <button className="user-top-panel-button" onClick={() => closeModal()}>OK</button>}
                                </div>
                            </div>}
                        </div>
                    }
                </div>
            }
        </div>
    );
};