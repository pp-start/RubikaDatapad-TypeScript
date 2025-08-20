import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useUserContext, Axios } from './Context';
import { useIdleTimer } from 'react-idle-timer'
import Gear from './svg/Gear';
import TrainIcon from './svg/TrainIcon';
import MagnifyingGlassIcon from './svg/MagnifyingGlassIcon';
import { db } from "./Db.tsx";
import Carousel, { CarouselItem } from "./Carousel";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function Main(): React.JSX.Element {

    type UpdateWorkTimesType = 'standard' | 'update';

    type Camera = {
        camera_number: string;
        station_id: string;
        recording_date: string;
    }

    type CameraSlide = Camera & {
        name: string;
        url: string;
    }

    type Delay = {
        recording_date: string;
        station_id: string;
        train_id: string;
        delay: string;
    }

    type FTP = {
        station_id: string;
        recording_date: string;
        disk: string;
        path: string;
    }

    type ButtonStatus = {
        ftp_host: boolean;
        ftp_user: boolean;
        ftp_password: boolean;
    }

    type JobFilters = {
        job_station_name: string;
        job_date: string;
    }

    type JobWithTrains = {
        job: Job;
        trains: TrainStop[][] | TrainStop[];
    };

    type Measurement = {
        id: number;
        personal_id: string;
        job_number: number;
        station_id: string;
        train_id: string;
        recording_date: string;
        entered_1: number | null;
        entered_2: number | null;
        entered_3: number | null;
        entered_4: number | null;
        entered_5: number | null;
        entered_6: number | null;
        exited_1: number | null;
        exited_2: number | null;
        exited_3: number | null;
        exited_4: number | null;
        exited_5: number | null;
        exited_6: number | null;
        entered_sum: number;
        exited_sum: number;
        arrival_hour: string | null;
        departure_hour: string | null;
        accuracy: number;
        type: string;
        comments: string | null;
        measurement_date: string;
    }

    type Photo = {
        personal_id: string;
        job_number: number;
        recording_date: string;
        station_id: string;
        train_id: string;
        filename: string;
        upload_date: string;
    }

    type PhotoSlide = Photo & {
        name: string;
        url: string;
    }



    type Recording = {
        station_id: string;
        recording_date: string;
    }

    type Station = {
        station_id: string;
        name: string;
        platforms: number | null;
        edges: number | null;
        comments: string | null;
    }

    

    type TrainNumber = {
        train_id: string;
        train_number: string;
        first_station: string;
        last_station: string;
        direction: number | null;
        schedule_date: string | null;
        comments: string | null;
    }

    type Response = {
        cameras?: Camera[];
        delays?: Delay[];
        ftp?: FTP[];
        jobs_trains?: JobWithTrains[];
        measurements?: Measurement[];
        photos?: Photo[];
        recordings?: Recording[];
        stations?: Station[];
        train_numbers?: TrainNumber[];
    }

    type Modal = {
        show: boolean;
        add_photo: boolean;
        preview_photo: boolean;
        show_photo: boolean;
        cameras_photos: boolean;
        ftp_info: boolean;
        info: boolean;
        time: boolean;
        error: boolean;
    }

    type ModalSlide = {
        src: string;
    }

    type MeasurementSummary = MeasurementFormSummary & {
        entered_exited: MeasurementFormData;
        times: Time;
        accuracy: Accuracy;
        comment?: AdditionalComment;
    }

    type Latest = {
        train: MergedTrain | null;
        station: string | null;
        saved_measurements: MeasurementSave | null;
    }

    type CustomTime = {
        job_number: number | null;
        reported_hours: string;
        reported_minutes: string;
    };

    type PassengerType = 'entered' | 'exited';

    type TimeType = 'arrival' | 'departure';

    type PhotoView = 'upload' | 'view';

    // --- Użytkownik i wylogowanie ---

    const { logout } = useUserContext();

    function useAuthUser(): User {

        const { user } = useUserContext();

        if(!user){
            throw new Error("useAuthUser must be used when user is logged in");
        }

        return user;

    }

    const user = useAuthUser();

    // Sprawdzanie aktywności

    const [remaining, setRemaining] = useState<number>(0);

    const [activeStatus, setActiveStatus] = useState<boolean>(true);

    const [manualStop, setManualStop] = useState<boolean>(false);

    const latestManualStop = useRef<boolean>(manualStop);

    useEffect(() => {

        latestManualStop.current = manualStop;

    }, [manualStop]);

    const [workTimeout, setWorkTimeout] = useState<number>(900000);

    const latestUserId = useRef<string | undefined>(undefined);

    useEffect(() => {

        if(user && user.role === 'user' && user.total_work_time){

            setTotalWorkTime(user.total_work_time);

        }

        latestUserId.current = user?.personal_id;
        
    }, [user]);

    // Manualne zatrzymanie czasu

    const handleWorkTime = useCallback((): void => {

        if(!latestActiveStatus.current){

            setActiveStatus(true);

            setManualStop(false);

            setWorkTimeout(900000);

        } else {

            setActiveStatus(false);

            setManualStop(true);

            setWorkTimeout(5000);

        }

    }, []);

    // Zmiana statusu

    const [reactivationMessage, setReactivationMessage] = useState<string | null>(null);

    function resumeWork(): void {

        closeModal();

        setManualStop(false);

        setActiveStatus(true);

        setWorkTimeout(900000);

    }

    const onIdle = (): void => {

        setActiveStatus(false);

        console.log(remaining);

    }

    const onActive = (): void => {

        if(!manualStop){

            setActiveStatus(true);

        } else {

            setModal({...modal, show: true, info: true});

            setReactivationMessage('Czas został zatrzymany. Potwierdź wznowienie pracy poniższym przyciskiem.');

        }

    }

    // Kontrola aktywności

    const { getRemainingTime } = useIdleTimer({
        onIdle,
        onActive,
        timeout: workTimeout,
        throttle: 500
    });

    useEffect(() => {

        const interval: number = setInterval(() => {

            setRemaining(Math.ceil(getRemainingTime() / 1000))

        }, 500);

        return () => {

            clearInterval(interval);

        }

    });

    useEffect(() => {

        function handleVisibilityChange(): void {

            if(document.hidden){

              setSiteActiveStatus(false);

            } else {

              setSiteActiveStatus(true);

            }

        }

        function handleFocus(): void {

            console.log('focus')

            setSiteActiveStatus(true);

        }

        function handleBlur(): void {

            console.log('blur')

            setSiteActiveStatus(false);

        }

        handleVisibilityChange();

        window.addEventListener("focus", handleFocus);

        window.addEventListener("blur", handleBlur);

        document.addEventListener("visibilitychange", handleVisibilityChange, false);

        return () => {

            window.removeEventListener("focus", handleFocus);

            window.removeEventListener("blur", handleBlur);

        };
        
    }, []);

    // Logowanie czasu pracy

    const updateWorkTimes = useCallback((type: UpdateWorkTimesType, time: number) => {

        if(latestTotalWorkTime.current){

            let plus_value: number;

            if(type === 'standard'){

                plus_value = time;

            } else {

                if(time > 900){

                    plus_value = 900;

                } else {

                    plus_value = time;

                }

            }

            console.log(type)

            console.log(plus_value)

            const new_total_value: number = latestTotalWorkTime.current + plus_value;

            setTotalWorkTime(new_total_value);

            if(latestActiveJob.current && latestJobWorkTime.current !== undefined){

                const new_job_value: number = latestJobWorkTime.current + plus_value;

                setJobWorkTime(new_job_value);

            }

        }

    }, []);

    /*

    useEffect(() => {

        const h: number = setInterval(() => {

            if(latestActiveStatus.current && latestSiteActiveStatus.current && latestDifference.current === 0){

                updateWorkTimes('standard', 5);

            }

        }, 5000);

        return () => { clearInterval(h) }

    }, [updateWorkTimes]);

    */

    useEffect(() => {

        const h: number = setInterval(() => {

            if(latestActiveStatus.current && latestSiteActiveStatus.current && latestDifference.current === 0){

                updateWorkTimes('standard', 5);

            }

        }, 5000);

        return () => { clearInterval(h) }

    }, [updateWorkTimes]);

    // Formatowanie czasu

    function formatTimeString(seconds: number): string {

        const hours: number = Math.floor(seconds / 3600);

        const minutes: number = Math.floor((seconds % 3600) / 60);

        const hoursString: string = hours < 100 ? ('0' + hours).slice(-2) : ('00' + hours).slice(-3);

        const minutesString: string = ('0' + minutes).slice(-2);

        const timeString: string = hoursString + ':' + minutesString;

        return timeString;

    }

    // Aktualny stan strony - aktywna/nieaktywna

    const [siteActiveStatus, setSiteActiveStatus] = useState<boolean | undefined>(undefined);

    const latestSiteActiveStatus = useRef<boolean | undefined>(siteActiveStatus);

    useEffect(() => {

        if(!latestManualStop.current){

            // Nieaktywny -> aktywny

            if(!latestSiteActiveStatus.current && siteActiveStatus){

                setSiteActiveDate(null);

                const previousDate: Date | null = latestSiteActiveDate.current;

                const currentDate: Date = new Date();

                const previousDifference: number = latestDifference.current;

                if(previousDate){

                    const time1: number = previousDate.getTime();

                    const time2: number = currentDate.getTime();

                    const difference: number = (time2 - time1) / 1000;

                    const seconds: number = Math.round(difference);

                    if(seconds > previousDifference){

                        setDifference(seconds);

                        updateWorkTimes('update', seconds);

                    }

                }

            }

            // Aktywny -> nieaktywny

            if(latestSiteActiveStatus.current && !siteActiveStatus){

                setSiteActiveDate(new Date());

            }

        }

        latestSiteActiveStatus.current = siteActiveStatus;

    }, [siteActiveStatus, updateWorkTimes]);

    // Data ostatniej aktywności

    const [siteActiveDate, setSiteActiveDate] = useState<Date | null>(null);

    const latestSiteActiveDate = useRef<Date | null>(siteActiveDate);

    useEffect(() => {

        latestSiteActiveDate.current = siteActiveDate;

    }, [siteActiveDate]);

    // Różnica - czas nieaktywnej strony

    const [difference, setDifference] = useState<number>(0);

    const latestDifference = useRef<number>(difference);

    useEffect(() => {

        latestDifference.current = difference;

    }, [difference]);

    // Aktualny stan pracuje/nie pracuje

    const latestActiveStatus = useRef<boolean>(activeStatus);

    useEffect(() => {

        latestActiveStatus.current = activeStatus;

    }, [activeStatus]);

    // Całkowity czas pracy

    const [totalWorkTime, setTotalWorkTime] = useState<number | undefined>(undefined);

    const [formatedTotalTime, setFormatedTotalTime] = useState<string | null>(null);

    const latestTotalWorkTime = useRef<number | undefined>(totalWorkTime);

    useEffect(() => {

        latestTotalWorkTime.current = totalWorkTime;

        if(totalWorkTime){

            const formatedTime: string = formatTimeString(totalWorkTime);

            setFormatedTotalTime(formatedTime);

        }

    }, [totalWorkTime]);

    // Czas pracy w zadaniu

    const [jobWorkTime, setJobWorkTime] = useState<number | undefined>(undefined);

    const [formatedJobTime, setFormatedJobTime] = useState<string | null>(null);

    const latestJobWorkTime = useRef<number | undefined>(jobWorkTime);

    useEffect(() => {

        latestJobWorkTime.current = jobWorkTime;

        if(jobWorkTime){

            const formatedTime: string = formatTimeString(jobWorkTime);

            setFormatedJobTime(formatedTime);

        }

    }, [jobWorkTime]);

    // Aktualnie wybrane zadanie

    const [activeJob, setActiveJob] = useState<UpdatedJob | null>(null);

    const latestActiveJob = useRef<UpdatedJob | null>(activeJob);

    useEffect(() => {

        latestActiveJob.current = activeJob;

        if(activeJob){

            const work_time: number = activeJob.work_time ?? 0;

            setJobWorkTime(work_time);

        }

    }, [activeJob]);

    // Aktualizowanie czasu pracy w bazie danych

    const [timeUpdateErrorCount, setTimeUpdateErrorCount] = useState<number>(0);

    const latestTimeUpdateErrorCount = useRef<number>(timeUpdateErrorCount);

    useEffect(() => {

        latestTimeUpdateErrorCount.current = timeUpdateErrorCount;

    }, [timeUpdateErrorCount]);

    const showTimeUpdateError = useCallback(() => {

        const error_count: number = latestTimeUpdateErrorCount.current;

        if(error_count > 1){

            setModal(prev => ({...prev, show: true, error: true}));

            setModalErrorMessage('Wystąpił problem z aktualizacją czasu pracy. Odśwież stronę, a jeśli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.')

        } else {

            setTimeUpdateErrorCount(error_count + 1);

        }

    }, []);

    useEffect(() => {

        const h: number = setInterval(() => {

            if((latestActiveStatus.current && latestSiteActiveStatus.current) || latestDifference.current > 0){

                if(latestDifference.current > 0){

                    setDifference(0);

                }

                const active_job: Job | null = latestActiveJob.current;

                const personal_id: string | undefined = latestUserId.current;

                const total: number | undefined = latestTotalWorkTime.current;

                let job: number | undefined;

                let job_number: number | undefined;

                let train_id: string | undefined;

                let station_id: string | undefined;

                // Aktywne zadanie - kontrola stacji

                if(active_job && active_job.station_id){

                    station_id = active_job.station_id;

                    if(latestActiveTrain.current){

                        train_id = latestActiveTrain.current.train_id;
    
                    }

                }

                // Aktywne zadanie - kontrola pociągu

                if(active_job && active_job.train_id){

                    train_id = active_job.train_id;

                    if(latestActiveStation.current){

                        station_id = latestActiveStation.current;
    
                    }

                }

                if(active_job && latestJobWorkTime.current){

                    job = latestJobWorkTime.current;

                    job_number = active_job.job_number;

                }

                const request_type = 'update time';

                console.log('Akt BD - total ' + total + ' job ' + job)

                Axios.post('classes/measurements.php', { personal_id, train_id, station_id, total, job, job_number, request_type }, { timeout: 5000 }).then(function(response){

                    if(response.data === true){

                        setTimeUpdateErrorCount(0);

                    } else if(response.data === false){

                        showTimeUpdateError();

                    } else if(typeof response.data === 'object'){

                        const total: number | null = response.data.total ? response.data.total : null;

                        const job: number | null = response.data.job ? response.data.job : null;

                        if(total){

                            setTotalWorkTime(total);

                        }
                        
                        if(latestActiveJob.current && latestJobWorkTime.current && job){

                            setJobWorkTime(job);

                        }

                    } else {

                        showTimeUpdateError();

                    }

                }).catch((error) => {

                    showTimeUpdateError();

                    console.warn(error);

                });

            }

        }, 10000);

        return () => { clearInterval(h) }

    }, [showTimeUpdateError]);

    useEffect(() => {

        const h: number = setInterval(() => {

            console.log(new Date().toLocaleTimeString() + " total " + latestTotalWorkTime.current +  " job " + latestJobWorkTime.current + " difference " + latestDifference.current)

        }, 1000);

        return () => { clearInterval(h) }

    }, []);

    // Przełącznik menu

    const [appLayer, setAppLayer] = useState<number>(100);

    // Wyszukiwanie

    const [searching, setSearching] = useState<boolean>(true);

    // Dane połączone

    const [jobsWithTrains, setJobsWithTrains] = useState<JobWithTrains[]>([]);

    // Zadania

    const [jobs, setJobs] = useState<Job[]>([]);

    // Pociągi

    const [trains, setTrains] = useState<Train[]>([]);

    // Nazwy pociągów

    const [trainNumbers, setTrainNumbers] = useState<TrainNumber[]>([]);

    // Stacje

    const [stations, setStations] = useState<Station[]>([]);

    // Opóźnienia

    const [delays, setDelays] = useState<Delay[]>([]);

    // Kamery

    const [cameras, setCameras] = useState<Camera[]>([]);

    // Nagrania

    const [recordings, setRecordings] = useState<Recording[]>([]);

    // FTP

    const [ftp, setFtp] = useState<FTP[]>([]);

    // Pobieranie danych

    const [dataLoadCount, setDataLoadCount] = useState<number>(0);

    const latestDataLoadCount = useRef<number>(dataLoadCount);

    const getData = useCallback(() => {

        const count: number = latestDataLoadCount.current;

        const personal_id: string | undefined = latestUserId.current;

        const request_type: string = 'get data';

        setSearching(true);

        if(personal_id){

            Axios.post('classes/data.php', { personal_id, request_type }, { timeout: 30000 }).then(function(response){

                if(typeof response.data === 'object' || Array.isArray(response.data)){

                    const data = response.data as Response;

                    if(data.jobs_trains){

                        setJobsWithTrains(data.jobs_trains);

                        const jobs_array: Job[] = data.jobs_trains.map((obj: JobWithTrains) => obj['job']);

                        setJobs(jobs_array);

                    }

                    if(data.delays){

                        setDelays(data.delays);

                    }

                    if(data.stations){

                        setStations(data.stations);

                    }

                    if(data.train_numbers){

                        setTrainNumbers(data.train_numbers);

                    }

                    if(data.cameras){

                        setCameras(data.cameras);

                    }

                    if(data.recordings){

                        setRecordings(data.recordings);

                    }

                    if(Array.isArray(data.ftp)){

                        setFtp(data.ftp);

                    }

                    setDataLoadCount(0);

                    setSearching(false);

                } else if(response.data === 0){

                    setModal(prev => ({...prev, show: true, info: true}));

                    setModalMessage('Brak dostępnych zadań');

                    setDataLoadCount(0);

                    setSearching(false);
                    
                } else {

                    setDataLoadCount(count + 1);

                }

            }).catch((error) => {

                console.warn(error);

                setDataLoadCount(count + 1);

            });

        }

    }, []);

    useEffect(() => {

        latestDataLoadCount.current = dataLoadCount;

        if(dataLoadCount > 2){

            setSearching(false);

            setModal(prev => ({...prev, show: true, error: true}));

            setModalErrorMessage('Wystąpił błąd w trakcie pobierania danych. Odśwież stronę, a jeżeli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.');

        } else {

            const timeout: number = dataLoadCount > 0 ? 1000 : 0;

            setTimeout(() => { getData() }, timeout);

        }

    }, [dataLoadCount, getData]);

    // Wyodrębnianie unikatowych stacji i dat zadań

    const [jobDates, setJobDates] = useState<string[]>([]);

    const [jobStations, setJobStations] = useState<string[]>([]);

    function formatDate(dateString: string): string {

        const [year, month, day] = dateString.split("-");

        return `${day}/${month}/${year}`;

    }

    /*

    useEffect(() => {

        if(jobs.length > 0){ 

            const uniqueDates: string[] = Array.from( new Set(jobs.map(obj => formatDate(obj.recording_date))) );

            

            uniqueDates.sort((a, b) => {

                const [dA, mA, yA] = a.split("/").map(Number);

                const [dB, mB, yB] = b.split("/").map(Number);

                return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();

            });

            setJobDates(uniqueDates)

        }
        
    }, [jobs]);

    */

    // Uzupełnianie zadań o nazwy stacji i numery pociągów

    const [updatedJobs, setUpdatedJobs] = useState<UpdatedJob[]>([]);

    useEffect(() => {

        if(jobs.length > 0 && stations.length > 0 && trainNumbers.length > 0){

            /*

            const sorted_unique_stations = Array.from(

                new Set( jobs.map(job => job.station_name).filter((name): name is string => Boolean(name)) )

            ).sort((a, b) => a.localeCompare(b));

            setJobStations(sorted_unique_stations);



            const jobsWithStationName = jobs.filter(job => job.station_name);

            const uniqueStationNames = [...new Set(jobsWithStationName.map(job => job.station_name))];

            const sortedUniqueStationNames = uniqueStationNames.sort((a, b) => a.localeCompare(b));

            */

            const updated_jobs: UpdatedJob[] = jobs.map(job => {

                let train_number: string | null = null;

                let first_station_name: string | null = null;

                let last_station_name: string | null = null;

                const train_id: string | null = job.train_id;

                if(train_id){

                    const train_search: TrainNumber | undefined = trainNumbers.find(u => u.train_id === train_id);

                    if(train_search){

                        train_number = train_search.train_number;

                        const first_station: Station | undefined = stations.find(u => u.station_id === train_search.first_station);

                        const last_station: Station | undefined = stations.find(u => u.station_id === train_search.last_station);

                        first_station_name = first_station ? first_station.name : null;

                        last_station_name = last_station ? last_station.name : null;

                    }

                }

                return {
                    ...job,
                    train_number: train_number,
                    first_station_name: first_station_name,
                    last_station_name: last_station_name
                };

            });

            setUpdatedJobs(updated_jobs);

        }
        
    }, [jobs, stations, trainNumbers]);

    // Uzupełnianie pociągów o nazwy stacji i numer PKP

    const [updatedTrains, setUpdatedTrains] = useState<UpdatedTrain[]>([]);

    useEffect(() => {

        if(trains.length > 0 && stations.length > 0 && trainNumbers.length > 0){

            /*

            const updated: Train[] = [...trains];

            updated.forEach(train => {

                const train_search: TrainNumber | undefined = trainNumbers.find(u => u.train_id === train.train_id);

                if(train_search){

                    train.train_number = train_search.train_number;

                    const first_station: Station | undefined = stations.find(u => u.station_id === train_search.first_station);

                    const last_station: Station | undefined = stations.find(u => u.station_id === train_search.last_station);

                    if(first_station){

                        train.first_station_name = first_station.name;

                    }

                    if(last_station){

                        train.last_station_name = last_station.name;

                    }

                }

            });

            */

            const updated_trains: UpdatedTrain[] = trains.map(train => {

                let train_number: string | null = null;

                let first_station_name: string | null = null;

                let last_station_name: string | null = null;

                const train_id: string = train.train_id;

                const train_search: TrainNumber | undefined = trainNumbers.find(u => u.train_id === train_id);

                if(train_search){

                    train_number = train_search.train_number;

                    const first_station: Station | undefined = stations.find(u => u.station_id === train_search.first_station);

                    const last_station: Station | undefined = stations.find(u => u.station_id === train_search.last_station);

                    first_station_name = first_station ? first_station.name : null;

                    last_station_name = last_station ? last_station.name : null;

                }

                return {
                    ...train,
                    train_number: train_number,
                    first_station_name: first_station_name,
                    last_station_name: last_station_name
                };

            });

            setUpdatedTrains(updated_trains);

        }
        
    }, [trains, stations, trainNumbers]);

    // Pobieranie pomiarów

    const [mergedTrains, setMergedTrains] = useState<MergedTrain[]>([]);

    useEffect(() => {

        if(updatedTrains.length > 0 && latestActiveJob.current){

            if(latestActiveJob.current.station_id){

                const train_ids: string[] = updatedTrains.map(train => train.train_id);

                getCompletedMeasurements(train_ids);

            } else {

                const stations_ids: string[] = updatedTrains[0].stops.map(item => item.station_id);

                getCompletedMeasurements(stations_ids);

            }

        }

        function getCompletedMeasurements(data: string[]): void {

            if(latestActiveJob.current){

                const request_type: string = 'get data';

                const current: Job = latestActiveJob.current;

                const job_number: number = current.job_number;

                const personal_id: string = current.personal_id;

                const station_id: string | null = current.station_id;

                const train_id: string | null = current.train_id;

                const recording_date: string = current.recording_date

                Axios.post('classes/measurements.php', { personal_id, job_number, data, recording_date, station_id, train_id, request_type }, { timeout: 10000 }).then(function(response){

                    if(response.data.measurements && response.data.photos){

                        const data = response.data as Response;

                        mergeTrainData(data);

                    } 
                    
                }).catch((error) => {

                    console.warn(error);
                    
                });

            }

        }

        function mergeTrainData(data: Response){

            const db_measurements: Measurement[] = data.measurements ?? [];
    
            const db_photos: Photo[] = data.photos ?? [];

            const job: Job | null = latestActiveJob.current;

            if(updatedTrains.length > 0 && job && job.station_id){

                // Pomiar stacji

                /*
    
                const grouped_measurements = db_measurements.reduce <Record<string, Measurement>> ((acc, obj) => {

                    const { id, train_id } = obj;

                    if(!acc[train_id] || acc[train_id].id < id){

                        acc[train_id] = obj;

                    }

                    return acc;

                }, {} as Record<string, Measurement> );
    
                const unique_measurements = Object.values(grouped_measurements);

                */

                const unique_measurements: Measurement[] = [];

                db_measurements.reverse().forEach(item => {

                    const train_id: string = item.train_id;

                    const exist: boolean = unique_measurements.some(obj => obj.train_id === train_id);

                    if(!exist){

                        unique_measurements.push(item);

                    }

                });

                /*

                for(let i = db_measurements.length - 1; i >= 0; i--){

                    const train_id: string = db_measurements[i].train_id;

                    const exist: boolean = unique_measurements.some(obj => obj.train_id === train_id);

                    if(!exist){

                        unique_measurements.push(db_measurements[i]);

                    }

                }

                */

                const merged_trains: MergedTrain[] = updatedTrains.map(train => {

                    const train_id: string = train.train_id;

                    const matching_measurement: Measurement[] = unique_measurements.filter(obj => obj.train_id === train_id);

                    const train_photos: Photo[] = db_photos.filter(photo => photo.train_id === train_id);

                    return {
                        ...train,
                        measurement: matching_measurement,
                        photos: train_photos
                    }

                });

                setMergedTrains(merged_trains);

            }

            if(updatedTrains.length === 1 && job && job.train_id){

                // Pomiar pociągu

                const train: UpdatedTrain = updatedTrains[0];

                const train_id: string = train.train_id;

                const train_photos: Photo[] = db_photos.filter(photo => photo.train_id === train_id);

                const merged_train: MergedTrain = {
                    ...train,
                    photos: train_photos
                }

                /*
    
                const grouped_measurements = db_measurements.reduce((acc, obj) => {

                    const { id, station_id } = obj;

                    if (!acc[station_id] || acc[station_id].id < id) {

                        acc[station_id] = obj;

                    }

                    return acc;

                }, {});

                const unique_measurements = Object.values(grouped_measurements);

                */
    
                const unique_measurements: Measurement[] = [];

                db_measurements.reverse().forEach(item => {

                    const station_id: string = item.station_id;

                    const exist: boolean = unique_measurements.some(obj => obj.station_id === station_id);

                    if(!exist){

                        unique_measurements.push(item);

                    }

                });

                merged_train.stops.forEach(item => {

                    const station_id: string = item.station_id;

                    const matching_measurement: Measurement[] = unique_measurements.filter(measurement => measurement.station_id === station_id);

                    item.measurement = matching_measurement;

                });

                setMergedTrains([merged_train]);

            }

            /*
                
            const updated = newArrayWithMeasurements.map(train => {
    
                const trainPhotos = db_photos.filter(photo => photo.train_id === train.train_id);
    
                return { ...train, photos: trainPhotos };
    
            });

            */
                
        };

    }, [updatedTrains]);

    // Filtrowanie dostępnych zadań

    const [filteredJobs, setFilteredJobs] = useState<UpdatedJob[]>([]);

    const [jobFilters, setJobFilters] = useState<JobFilters>({job_station_name: '', job_date: ''});

    useEffect(() => {

        if(updatedJobs.length > 0){

            const filteredData: UpdatedJob[] = updatedJobs.filter(item => {

                if(jobFilters.job_station_name === '' && jobFilters.job_date === ''){

                    return true;

                }

                return (

                    (jobFilters.job_station_name === '' || item.station_name === jobFilters.job_station_name) &&
                    (jobFilters.job_date === '' || formatDate(item.recording_date) === jobFilters.job_date)

                );

            });

            filteredData.sort((a, b) => a.job_number - b.job_number);
    
            setFilteredJobs(filteredData);

        }
        
    }, [updatedJobs, jobFilters]);

    // Usuwanie nieaktywnych stacji/dat przy filtrowaniu

    useEffect(() => {

        if(filteredJobs.length > 0){

            const unique_dates: string[] = [... new Set(filteredJobs.map(obj => formatDate(obj.recording_date)))];

            unique_dates.sort((a, b) => {

                const [dA, mA, yA] = a.split("/").map(Number);

                const [dB, mB, yB] = b.split("/").map(Number);

                return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();

            });

            setJobDates(unique_dates);

            /*

            setJobDates(filteredJobs.reduce((unique, obj) => {

                const formattedDate = formatDate(obj.recording_date);

                if (!unique.includes(formattedDate)) {

                    unique.push(formattedDate);

                }

                return unique;

            }, []).sort((a, b) => {

                const [dayA, monthA, yearA] = a.split("/");
                const [dayB, monthB, yearB] = b.split("/");

                const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`);

                return dateA - dateB;

            }));

            */

            const jobs_with_station_name = filteredJobs.filter((job): job is UpdatedJob & { station_name: string } => Boolean(job.station_name));

            const unique_station_names: string[] = [...new Set(jobs_with_station_name.map(job => job.station_name))];

            const sorted_station_names = unique_station_names.sort((a, b) => a.localeCompare(b));

            setJobStations(sorted_station_names);

        } else {

            setJobDates([]);

            setJobStations([]);

        }
        
    }, [filteredJobs]);

    function onJobFilterChange(event: React.ChangeEvent<HTMLSelectElement>): void {

        const value: string = event.target.value;

        const name: string = event.target.name;

        setJobFilters(prevFilters => {
            return {
                ...prevFilters,
                [name]: value
            }
        });

    }

    // FTP

    const [ftpList, setFtpList] = useState<FTP[]>([]);

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

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>({
        ftp_host: false,
        ftp_user: false,
        ftp_password: false
    });

    // Aktywowanie zadania

    const activateJob = useCallback((job_number: number) => {

        const match: JobWithTrains | undefined = jobsWithTrains.find(obj => obj.job.job_number === job_number);

        const job_match: UpdatedJob | undefined = updatedJobs.find(item => item.job_number === job_number);

        if(match && job_match){

            const station_id: string | null = job_match.station_id;

            const train_id: string | null = job_match.train_id;

            const rec_date: string = job_match.recording_date;

            const updated: Train[] = [];

            if(station_id){

                // Zlecenie pomiaru stacji

                const current: TrainStop[][] = match.trains as TrainStop[][];

                current.forEach(train => {

                    const train_id: string = train[0].train_id;

                    const found_stop = train.find(train_stop => train_stop.station_id === station_id);

                    if(found_stop){

                        //output.train_id = train_id;

                        //output.stops = train;

                        const station_index = found_stop.stop_number;

                        //output.station_index = station_index;

                        //output.arrival_hour = found_stop.arrival_hour;

                        //output.departure_hour = found_stop.departure_hour;

                        //output.platform_number = found_stop.platform_number;

                        //output.lane_number = found_stop.lane_number;

                        const delay: Delay[] = delays.filter(item => item.train_id === train_id && item.recording_date === rec_date);

                        let delay_text: string | null = null;

                        if(delay.length > 0){

                            const exact: Delay[] = delay.filter(item => item.station_id === station_id);

                            if(exact.length > 0){

                                delay_text = 'opóźniony ' + exact[0].delay + ' min.';

                            } else {

                                for(let i=station_index; i>=0 ;i--){

                                    const current_station: string = train[i].station_id;

                                    const found: Delay | undefined = delay.find(item => item.station_id === current_station);

                                    if(found){

                                        const difference = station_index - train[i].stop_number;

                                        delay_text = 'opóźniony ' + found.delay + ' min. ' + difference + ' st. wcześniej';

                                        break;

                                    }

                                }

                            }

                        } else {

                            delay_text = null;

                        }

                        const output: Train = {
                            train_id: train_id,
                            stops: train,
                            station_index: station_index,
                            arrival_hour: found_stop.arrival_hour,
                            departure_hour: found_stop.departure_hour,
                            platform_number: found_stop.platform_number,
                            lane_number: found_stop.lane_number,
                            delay: delay_text,
                        };

                        updated.push(output);

                    }

                });

                const sorted_trains: Train[] = updated.sort((a, b) => {
        
                    const timeA = a.departure_hour || a.arrival_hour;

                    const timeB = b.departure_hour || b.arrival_hour;
                
                    const dateA = new Date(`1970-01-01 ${timeA}`).getTime();

                    const dateB = new Date(`1970-01-01 ${timeB}`).getTime();
                
                    return dateA - dateB;

                });

                setTrains(sorted_trains);

                const cameras_list: Camera[] = cameras.filter(item => item.station_id === station_id && item.recording_date === rec_date);

                setCamerasList(cameras_list);

                const ftp_list: FTP[] = ftp.filter(item => item.station_id === station_id && item.recording_date === rec_date);

                setFtpList(ftp_list);

            }
            
            if(train_id){

                const current: TrainStop[] = match.trains as TrainStop[];

                const train_id: string = current[0].train_id;

                const delay: Delay[] = delays.filter(item => item.train_id === train_id && item.recording_date === rec_date);

                current.forEach(train_stop => {

                    const current_station: string = train_stop.station_id;

                    const station_details: Station | undefined = stations.find(obj => obj.station_id === current_station);

                    train_stop.station_name = station_details?.name;

                    if(delay.length > 0){

                        const exact: Delay | undefined = delay.find(item => item.station_id === current_station);

                        if(exact){

                            train_stop.delay = 'opóźniony ' + exact.delay + ' min.';

                        } else {

                            train_stop.delay = null;

                        }

                    } else {

                        train_stop.delay = null;

                    }

                    if(recordings.some(u => u.station_id === current_station && u.recording_date === rec_date)){

                        train_stop.active = true;

                    } else {

                        train_stop.active = false;

                    }

                });

                const output: Train = {
                    train_id: train_id,
                    stops: current
                };

                setTrains([output]);

            }

            setActiveJob(job_match);

            setAppLayer(200);

        }

    }, [cameras, delays, ftp, jobsWithTrains, updatedJobs, recordings, stations]);

    // Wyznaczanie slajdów do podglądu obrazów z kamer

    const [camerasList, setCamerasList] = useState<Camera[]>([]);

    const [cameraSlides, setCameraSlides] = useState<CameraSlide[]>([]);

    useEffect(() => {

        if(camerasList.length > 0){

            const current_list = [...camerasList] as CameraSlide[];

            current_list.forEach(camera => {

                const url: string = "/photos/" + camera.station_id + "_" + camera.recording_date + "_" + camera.camera_number + ".jpg";

                camera.url = url;

                camera.name = "Kamera " + camera.camera_number;
                
            });

            const sorted_list = current_list.sort((a, b) => {

                return Number(a.camera_number) - Number(b.camera_number);

            });

            if(sorted_list.length > 3){

                const station_id: string = sorted_list[0].station_id;

                const recording_date: string = sorted_list[0].recording_date;

                const layout_url: string = "/photos/layout/" + station_id + "_" + recording_date + ".jpg";

                const new_object: CameraSlide = {
                    camera_number: "0",
                    station_id: station_id,
                    recording_date: recording_date,
                    name: "Schemat montażu",
                    url: layout_url
                }

                sorted_list.unshift(new_object);

            }

            setCameraSlides(sorted_list);

        } else {

            setCameraSlides([]);

        }

    }, [camerasList]);

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

    function exitJob(): void {

        setPreviousLoad(true);
        setLatest({train: null, station: null, saved_measurements: null});
        setActiveJob(null);
        setJobWorkTime(undefined);
        setAppLayer(100);
        getData();
        setMergedTrains([]);
        setActiveTrain(null);
        setActiveStation(null);
        clearJobFormData();
        setCamerasList([]);
        setFtpList([]);

        db.latest.clear();

    }

    // Aktywowanie pociągu lub stacji do pomiarów

    const [activeTrain, setActiveTrain] = useState<MergedTrain | null>(null);

    const latestActiveTrain = useRef<MergedTrain | null>(activeTrain);

    useEffect(() => {

        latestActiveTrain.current = activeTrain;
        
    }, [activeTrain]);

    const [tempTrainToActivate, setTempTrainToActivate] = useState<MergedTrain | null>(null);

    function activateTrain(train_id: string): void {

        const current_train: MergedTrain | null = activeTrain;

        const new_train: MergedTrain | undefined = mergedTrains.find(obj => obj.train_id === train_id);

        // Jeśli w danej chwili żaden pociąg nie jest aktywny natychmiastowa aktywacja nowego pociągu

        if(!current_train && new_train){

            activateSelectedTrain(new_train);

            return;

        }

        // Jeśli jakiś pociąg jest już aktywny

        if(current_train && new_train){

            // Jeśli aktywny jest ten sam pociąg co nowy - koniec funkcji

            if(new_train.train_id === current_train.train_id){

                return;

            }

            const current_train_measurement: Measurement | undefined = current_train.measurement?.[0];

            // Jeśli jest już zapisany pomiar dla aktywnego pociągu

            if(current_train_measurement){

                const prev_entered_sum: string = String(current_train_measurement.entered_sum);

                const prev_exited_sum: string = String(current_train_measurement.exited_sum);

                const prev_time_arrival: string | null = current_train_measurement.arrival_hour;

                const prev_time_departure: string | null = current_train_measurement.departure_hour;

                // Jeśli pomiar różni się od aktualnych wartości

                if(measurementFormSummary.entered_sum !== prev_entered_sum || measurementFormSummary.exited_sum !== prev_exited_sum || time.arrival !== prev_time_arrival || time.departure !== prev_time_departure){

                    setTempTrainToActivate(new_train);
    
                    setModal({...modal, show: true, info: true});

                // Jeśli nic się nie zmieniło

                } else {

                    activateSelectedTrain(new_train);

                }

            // Jeśli nie ma zapisanego pomiaru dla aktywnego pociągu

            } else {

                // Jeśli jakieś pola pomiarowe zostały uzupełnione

                if(measurementFormSummary.entered_sum !== '' || measurementFormSummary.exited_sum !== '' || time.arrival !== '' || time.departure !== ''){

                    setTempTrainToActivate(new_train);

                    setModal({...modal, show: true, info: true});

                // Jeśli żadne pole pomiarowe nie zostało uzupełnione

                } else {

                    activateSelectedTrain(new_train)

                }

            }

        }

    }

    function confirmStageChange(): void {

        closeModal();

        if(tempTrainToActivate){

            const new_train: MergedTrain = tempTrainToActivate;

            clearJobFormData();

            activateSelectedTrain(new_train);

            setTempTrainToActivate(null);

        }

        if(tempStationToActivate){

            clearJobFormData();

            activateSelectedStation(tempStationToActivate);

            setTempStationToActivate(null);

        }

    }

    // Przywracanie ostatniego pomiaru

    const restoreMeasurements = useCallback((data: Measurement): void => {

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

        setTime(old_time);

        if(data.accuracy) setAccuracy(data.accuracy);

        if(data.comments) setAdditionalComment(data.comments);

    }, []);

    // Aktywowanie pociągu lub stacji

    const activateSelectedTrain = useCallback((train: MergedTrain): void => {

        db.latest.update(1, {train: null, station: null, measurements: null});

        setLatest({train: null, station: null, saved_measurements: null});

        setMeasurementFormData({});

        setTime({arrival: "", departure: ""});

        setAccuracy("");

        setAdditionalComment("");

        setActiveTrain(train);

        const old_measurement: Measurement | undefined = train.measurement?.[0];

        if(old_measurement){

            setMeasurementSaving(false);

            restoreMeasurements(old_measurement);

        } else {

            setMeasurementSaving(true);

        }

    }, [restoreMeasurements]);

    const [activeStation, setActiveStation] = useState<string | null>(null);

    const latestActiveStation = useRef<string | null>(activeStation);

    useEffect(() => {

        latestActiveStation.current = activeStation;
        
    }, [activeStation]);

    const [tempStationToActivate, setTempStationToActivate] = useState<string | null>(null);

    function activateStation(train_stop: TrainStop){

        const new_station_id: string = train_stop.station_id;

        const current_station_id: string | null = activeStation;

        // Jeśli aktywowana jest obecnie sprawdzana stacja - koniec funkcji

        if(current_station_id === new_station_id){

            return;

        }

        // Jeśli w danej chwili żadna stacja nie jest aktywna natychmiastowa aktywacja nowej stacji

        if(!current_station_id){

            activateSelectedStation(new_station_id);

        } else {

            const old_station: TrainStop | undefined = mergedTrains?.[0]?.stops.find(obj => obj.station_id === current_station_id);

            // Sprawdzanie czy jakiekolwiek dane zostały zmienione i nie są zapisane względem poprzedniego pomiaru

            if(old_station && old_station.measurement && old_station.measurement.length > 0){

                const old_measurement: Measurement = old_station.measurement[0];

                const prev_entered_sum: string = String(old_measurement.entered_sum);

                const prev_exited_sum: string = String(old_measurement.exited_sum);

                const prev_time_arrival: string | null = old_measurement.arrival_hour;

                const prev_time_departure: string | null = old_measurement.departure_hour;

                if(measurementFormSummary.entered_sum !== prev_entered_sum || measurementFormSummary.exited_sum !== prev_exited_sum || time.arrival !== prev_time_arrival || time.departure !== prev_time_departure){

                    setTempStationToActivate(new_station_id);
    
                    setModal({...modal, show: true, info: true});

                } else {

                    activateSelectedStation(new_station_id);

                }

            } else {

            // Jeśli nie było poprzedniego pomiaru sprawdzanie czy są niezapisane dane w polach pomiarowych

                if(measurementFormSummary.entered_sum !== '' || measurementFormSummary.exited_sum !== '' || time.arrival !== '' || time.departure !== ''){

                    setTempStationToActivate(new_station_id);

                    setModal({...modal, show: true, info: true});

                } else {

                    activateSelectedStation(new_station_id);

                }

            }
    
        }

    }

    const activateSelectedStation = useCallback((station_id: string): void => {

        db.latest.update(1, {train: null, station: null, measurements: null});

        setLatest({train: null, station: null, saved_measurements: null});

        setMeasurementFormData({});

        setTime({arrival: "", departure: ""});

        setAccuracy("");

        setAdditionalComment("");

        setActiveStation(station_id);

        const current_active_job: Job = activeJob!;

        const recording_date: string = current_active_job.recording_date;

        const cameras_list: Camera[] = cameras.filter(item => item.station_id === station_id && item.recording_date === recording_date);

        setCamerasList(cameras_list);

        const ftp_list: FTP[] = ftp.filter(item => item.station_id === station_id && item.recording_date === recording_date);

        setFtpList(ftp_list);

        const station_data: TrainStop | undefined = mergedTrains?.[0]?.stops.find(item => item.station_id === station_id);

        const old_measurement: Measurement | undefined = station_data?.measurement?.[0];

        if(old_measurement){

            setMeasurementSaving(false);

            restoreMeasurements(old_measurement);

        } else {

            setMeasurementSaving(true);

        }

    }, [activeJob, cameras, ftp, mergedTrains, restoreMeasurements]);

    const [measurementFormData, setMeasurementFormData] = useState<MeasurementFormData>({});

    function measurementFormChange(event: React.ChangeEvent<HTMLInputElement>){

        const value: string = event.target.value;

        const name: string = event.target.name;

        setMeasurementFormData(prevFormData => {
            return {
                ...prevFormData,
                [name]: Number(value)
            }
        });

    }

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

    const [time, setTime] = useState<Time>({arrival: "", departure: ""});

    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

        const value: string = event.target.value;

        const name: string = event.target.name;

        setTime(prevFormData => {
            return {
                ...prevFormData,
                [name]: value
            }
        });

    };

    

    

    function manualTimeChange(handle: string, type: string, field: TimeType, time_object: Time | null){

        // Deklarowanie nowej wartości

        let new_value: string;

        // Sprawdzanie aktualnej wartości

        let current: string;

        if(!time_object){

            current = time[field];

        } else {

            current = time_object[field];

        }

        // Jeśli pole jest puste 

        if(current === ''){

            // Jeśli następuje zmiana godzin

            if(type === 'hour'){

                // Jeśli wartość jest zwiększana

                if(handle === 'increment'){

                    new_value = '01:00';

                // Jeśli wartość jest zmniejszana

                } else {

                    new_value = '23:00';

                }

            // Jeśli następuje zmiana minut

            } else {

                // Jeśli wartość jest zwiększana

                if(handle === 'increment'){

                    new_value = '00:01';

                // Jeśli wartość jest zmniejszana

                } else {

                    new_value = '23:59';

                }

            }

        // Jeśli pole ma już wartość

        } else {

            // Wyodrębnianie godzin i minut

            const arr: string[] = current.split(":");

            const hours_raw: string = arr[0];

            const minutes_raw: string = arr[1];

            const hours: number = parseInt(hours_raw);

            const minutes: number = parseInt(minutes_raw);

            if(isNaN(hours) || isNaN(minutes)){

                setTime(prevFormData => {
                    return {
                        ...prevFormData,
                        [field]: ''
                    }
                });

                return;

            }

            if(type === 'hour'){

                // Jeśli wartość jest zwiększana

                if(handle === 'increment'){

                    // Jeśli jest 23 godzina - zmiana na północ

                    if(hours === 23){

                        const new_minutes: string = minutes < 10 ? "0" + minutes : minutes.toString();

                        new_value = "00:" + new_minutes;

                    } else {

                        const new_hour_number: number = hours + 1;

                        const new_hour: string = new_hour_number < 10 ? "0" + new_hour_number : new_hour_number.toString();

                        const new_minutes: string = minutes < 10 ? "0" + minutes : minutes.toString();

                        new_value = new_hour + ":" + new_minutes;

                    }
                    
                // Jeśli wartość jest zmniejszana

                } else {

                    // Jeśli jest północ - zmiana na 23

                    if(hours === 0){

                        const new_minutes: string = minutes < 10 ? "0" + minutes : minutes.toString();

                        new_value = "23:" + new_minutes;

                    } else {

                        const new_hour_number: number = hours - 1;

                        const new_hour: string = new_hour_number < 10 ? "0" + new_hour_number : new_hour_number.toString();

                        const new_minutes: string = minutes < 10 ? "0" + minutes : minutes.toString();

                        new_value = new_hour + ":" + new_minutes;

                    }

                }

            // Jeśli następuje zmiana minut

            } else {

                if(handle === 'increment'){

                    // Jeśli jest 59 minuta - zmiana na 00

                    if(minutes === 59){

                        let new_hour_number: number;

                        if(hours === 23){

                            new_hour_number = 0;

                        } else {

                            new_hour_number = hours + 1;

                        }

                        const new_hour: string = new_hour_number < 10 ? "0" + new_hour_number : new_hour_number.toString();

                        new_value = new_hour + ":00";

                    } else {

                        const new_hour: string = hours < 10 ? "0" + hours : hours.toString();

                        const new_minutes_number: number = minutes + 1;

                        const new_minutes: string = new_minutes_number < 10 ? "0" + new_minutes_number : new_minutes_number.toString();

                        new_value = new_hour + ":" + new_minutes;

                    }

                // Jeśli wartość jest zmniejszana

                } else {

                    // Jeśli jest 00 - zmiana na 59

                    if(minutes === 0){

                        let new_hour_number: number;

                        if(hours === 0){

                            new_hour_number = 23;

                        } else {

                            new_hour_number = hours - 1;

                        }

                        const new_hour: string = new_hour_number < 10 ? "0" + new_hour_number : new_hour_number.toString();

                        new_value = new_hour + ":59";

                    } else {

                        const new_hours: string = hours < 10 ? "0" + hours : hours.toString();

                        const new_minutes_number: number = minutes - 1;

                        const new_minutes: string = new_minutes_number < 10 ? "0" + new_minutes_number : new_minutes_number.toString();

                        new_value = new_hours + ":" + new_minutes;

                    }

                }

            }

        }

        setTime(prevFormData => {
            return {
                ...prevFormData,
                [field]: new_value
            }
        });

    }

    // Przytrzymanie przycisków zmiany godzin

    const intervalRef = useRef<number | null>(null);

    const timeoutRef = useRef<number | null>(null);

    const timeRef = useRef<Time>(time);

    useEffect(() => {

        timeRef.current = time;

    }, [time]);

    function startChanging(handle: string, type: string, field: TimeType){

        timeoutRef.current = setTimeout(() => {

            intervalRef.current = setInterval(() => {

                manualTimeChange(handle, type, field, timeRef.current);

            }, 120);

        }, 200);

    }

    function stopChanging(){

        if(timeoutRef.current){

            clearTimeout(timeoutRef.current);

            timeoutRef.current = null;

        }

        if(intervalRef.current){

            clearInterval(intervalRef.current);

            intervalRef.current = null;

        }

    }

    useEffect(() => {

        const handleMouseUp = () => {

            stopChanging();

        };

        window.addEventListener('mouseup', handleMouseUp);

        return () => {

            window.removeEventListener('mouseup', handleMouseUp);

        };

    }, []);

    const [accuracy, setAccuracy] = useState<Accuracy>('');

    // Suwak widoczności

    const handleAccuracyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {

        setAccuracy(parseInt(event.target.value));

    };

    const [sliderInfo, setSliderInfo] = useState<boolean>(false);

    // Modale

    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

    const [modal, setModal] = useState<Modal>({
        show: false, 
        add_photo: false,
        preview_photo: false,
        show_photo: false,
        cameras_photos: false,
        ftp_info: false,
        info: false,
        time: false,
        error: false
    });

    function closeModal(): void {

        const closed = Object.fromEntries(Object.keys(modal).map((key) => [key, false])) as Modal;

        setModal(closed);

        /*

        setModal({
            show: false, 
            add_photo: false,
            preview_photo: false,
            show_photo: false,
            cameras_photos: false,
            ftp_info: false,
            info: false,
            time: false,
            error: false
        });

        */

        //setUploadedFiles([]);
        //setUploadedPreviews([]);
        //setActivePreview(null);
        //setActiveUpload(false);


        // Podgląd zdjęć

        setPhotosToShow([]);
        setActivePhotoShow(null);

        // Informacyjny

        setFormErrors([]);
        setModalMessage(null);
        setReactivationMessage(null);

        // Błąd

        setModalErrorMessage(null);

        // Tymczasowe

        setTempTrainToActivate(null);
        setTempStationToActivate(null);

    }

    // Aktualnie wybrane zadanie

    const latestModal = useRef<Modal>(modal);

    useEffect(() => {

        latestModal.current = modal

    }, [modal]);

    function handleModalClose(): void {

        if(!modal.error){

            closeModal();

        } else if(modal.error && (modal.add_photo || modal.show_photo || modal.info)){

            setModal({...modal, error: false});

            setModalErrorMessage(null);

        } else {

            closeModal();

        }

    }

    // Dodawanie zdjęć

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Wklejanie zdjęć

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {

        const item = event.clipboardData.items[0];

        if(item.type.indexOf("image") === 0){

            const file: File | null = item.getAsFile();

            if(file){

                setUploadedFiles([file]);

            } else {

                const ua: string = navigator.userAgent;

                if(ua.includes('Linux') && ua.includes('Firefox')){

                    setModalErrorMessage('Firefox nie obsługuje wklejania zdjęć na systemie Linux. Użyj przeglądarki na chromium.');

                } else {

                    setModalErrorMessage('Nie udało się przetworzyć obrazu');

                }

                setModal(prev => ( {...prev, error: true} ));

            }

        } else {

            setModalErrorMessage('Wklejone dane to nie zdjęcie');

            setModal(prev => ( {...prev, error: true} ));
            
        }

    }

    // Upuszczanie zdjęć

    function allowDrop(event: React.DragEvent<HTMLLabelElement>): void {

        event.preventDefault();

    }

    function handleDrop(event: React.DragEvent<HTMLLabelElement>): void {

        event.preventDefault();

        const imageTypes: string[] = ['image/png', 'image/gif', 'image/bmp', 'image/jpeg', 'image/jpg'];

        const raw_files: FileList = event.dataTransfer.files;

        const files: File[] = Array.from(raw_files);

        const images: File[] = [];

        files.forEach(file => {

            if(imageTypes.includes(file.type)){

                images.push(file);

            }

        });

        if(images.length > 0){

            setUploadedFiles(images);

        } else {

            setModalErrorMessage('Wybrany plik to nie zdjęcie');

            setModal(prev => ( {...prev, error: true} ));

        }

    }

    const handlePhotos = (event: React.ChangeEvent<HTMLInputElement>): void => {

        if(!event.target.files || event.target.files.length === 0){

            setUploadedFiles([]);

            return

        }

        const chosenFiles: File[] = Array.prototype.slice.call(event.target.files);

        handleUploadFiles(chosenFiles);

    }
    
    const handleUploadFiles = (files: File[]): void => {

        const uploaded: File[] = [];

        const imageTypes = ['image/png', 'image/gif', 'image/bmp', 'image/jpeg', 'image/jpg'];

        files.forEach(file => {

            if(imageTypes.includes(file.type)){

                uploaded.push(file);

            }

        });

        setUploadedFiles(uploaded);

    }

    // Podgląd zdjęć

    const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);

    const [activePreview, setActivePreview] = useState<number | null>(null);

    useEffect(() => {

        if(uploadedFiles.length > 0){

            setModal(prev => ({...prev, show: false, add_photo: false}));

            const urls: string[] = [];

            uploadedFiles.forEach(file => {

                const objectUrl: string = URL.createObjectURL(file);

                urls.push(objectUrl);
                
            });

            setUploadedPreviews(urls);

            setActivePreview(0);

        }

    }, [uploadedFiles]);

    function changeActivePreview(field: PhotoView, type: string): void {

        let last: number;
    
        let current: number;

        if(field === 'upload'){

            if(uploadedPreviews.length === 1){

                return;

            }
    
            last = uploadedPreviews.length -1;
    
            current = activePreview? activePreview : 0;

        } else {

            last = photosToShow.length -1;
    
            current = activePhotoShow? activePhotoShow : 0;

        }

        let new_value: number;

        if(type === 'decrement'){

            if(current === 0){

                new_value = last;

            } else {

                new_value = current -1;

            }

        } else {

            if(current === last){

                new_value = 0;

            } else {

                new_value = current +1;

            }

        }

        if(field === 'upload'){

            setActivePreview(new_value);

        } else if(field === 'view'){

            setActivePhotoShow(new_value);

        }

    }

    // Dodatkowy komentarz

    const [additionalComment, setAdditionalComment] = useState<AdditionalComment>('');

    function handleComment(event: React.ChangeEvent<HTMLTextAreaElement>): void {

        const value = event.target.value;

        setAdditionalComment(value);

    }

    // Wysyłanie formularza

    const [formErrors, setFormErrors] = useState<string[]>([]);

    function sendJobForm(): void {

        // Sprawdzenie czy są podane wszystkie wymagane wartości

        const current_job = activeJob as Job;

        const errors: string[] = [];

        if(measurementFormSummary.entered_sum === ''){

            errors.push('podaj liczbę wsiadających');

        }

        if(measurementFormSummary.exited_sum === ''){

            errors.push('podaj liczbę wysiadających');

        }

        if(accuracy === ''){

            errors.push('określ dokładność pomiaru');

        }

        if(current_job.station_id){

            const current_train = activeTrain as MergedTrain;

            const train_id: string = current_train.train_id;

            const matching_object: MergedTrain | undefined = mergedTrains.find(train => train.train_id === train_id);

            if(uploadedFiles.length === 0 && matching_object?.measurement?.length === 0){

                errors.push('dodaj zdjęcie pojazdu');

            }

        }

        if(errors.length > 0){

            setModal({...modal, show: true, info: true});

            setFormErrors(errors);

            return;

        }

        // Przesyłanie danych

        const button: HTMLElement | null = document.getElementById('measurement-save-button');

        button?.setAttribute("disabled", "disabled");

        const measurements: MeasurementSummary = {
            entered_exited: measurementFormData,
            entered_sum: measurementFormSummary.entered_sum,
            exited_sum: measurementFormSummary.exited_sum,
            times: time,
            accuracy: accuracy,
            ...(additionalComment ? { comment: additionalComment } : {})
        };

        const job_number: number = current_job.job_number;

        const personal_id: string = current_job.personal_id;

        const recording_date: string = current_job.recording_date;

        const request_type: string = 'put measurements';

        let station_id: string;

        let train_id: string;

        if(current_job.station_id){

            const current_train = activeTrain as Train;

            station_id = current_job.station_id;

            train_id = current_train.train_id;

        } else {

            station_id = activeStation as string;

            train_id = current_job.train_id as string;

        }

        const current_date: string = (new Date).toISOString().slice(0, 19).replace("T", " ");

        const data: FormData = new FormData();

        uploadedFiles.forEach((file, index )=> data.append(index.toString(), file));

        data.append('request_type', request_type);

        data.append('measurements', JSON.stringify(measurements));

        data.append('job_number', job_number.toString());

        data.append('train_id', train_id);

        data.append('station_id', station_id);

        data.append('recording_date', recording_date);

        data.append('personal_id', personal_id);

        Axios.post('classes/measurements.php', data, { timeout: 10000 }).then(function(response){

            if(response.data.filenames || response.data.success){

                setModalMessage('Pomiar został zapisany.');

                setLatest({train: null, station: null, saved_measurements: null});

                // Dodawanie zdjęć

                const outputArray: Photo[] = [];

                const filenames_array: string[] | undefined = response.data.filenames;

                if(filenames_array){

                    filenames_array.forEach(item => {

                        const outputObject: Photo = {
                            filename: item,
                            job_number: job_number,
                            personal_id: personal_id,
                            recording_date: recording_date,
                            station_id: station_id,
                            train_id: train_id,
                            upload_date: current_date
                        };

                        outputArray.push(outputObject);
                        
                    });

                }

                // Sprawdzanie opóźnienia

                let time_difference: number = 0;

                let matching_object: MergedTrain | TrainStop | undefined;

                if(time.departure !== ""){

                    const time_entered: string = time.departure;

                    if(current_job.station_id){

                        matching_object = mergedTrains.find(train => train.train_id === train_id);

                    }

                    if(current_job.train_id){

                        matching_object = mergedTrains[0].stops.find(station => station.station_id === station_id);

                    }

                    const time_scheduled: string | null | undefined = matching_object?.departure_hour;

                    if(time_scheduled){

                        const [scheduled_hour, scheduled_minute] = time_scheduled.split(':').map(Number);

                        const [user_hour, user_minute] = time_entered.split(':').map(Number);

                        const scheduled_minutes: number = scheduled_hour * 60 + scheduled_minute;

                        const user_minutes: number = user_hour * 60 + user_minute;

                        let difference: number = user_minutes - scheduled_minutes;

                        if (difference < -720){

                            difference += 1440;

                        }

                        if(difference > 10){

                            time_difference = difference;

                        } else {

                            time_difference = 0;

                        }

                    }

                }

                let measurement_id: number = 1;

                let measurement_type: string = 'pomiar';

                if(matching_object && matching_object.measurement){

                    const i: number = matching_object.measurement.length -1;

                    measurement_id = matching_object.measurement[i].id + 1;

                    measurement_type = 'poprawka';

                }

                const new_measurement: Measurement = {
                    id: measurement_id,
                    personal_id: personal_id,
                    job_number: job_number,
                    station_id: station_id,
                    train_id: train_id,
                    recording_date: recording_date,
                    entered_1: measurementFormData.entered_1 ? measurementFormData.entered_1 : null,
                    entered_2: measurementFormData.entered_2 ? measurementFormData.entered_2 : null,
                    entered_3: measurementFormData.entered_3 ? measurementFormData.entered_3 : null,
                    entered_4: measurementFormData.entered_4 ? measurementFormData.entered_4 : null,
                    entered_5: measurementFormData.entered_5 ? measurementFormData.entered_5 : null,
                    entered_6: measurementFormData.entered_6 ? measurementFormData.entered_6 : null,
                    exited_1: measurementFormData.exited_1 ? measurementFormData.exited_1 : null,
                    exited_2: measurementFormData.exited_2 ? measurementFormData.exited_2 : null,
                    exited_3: measurementFormData.exited_3 ? measurementFormData.exited_3 : null,
                    exited_4: measurementFormData.exited_4 ? measurementFormData.exited_4 : null,
                    exited_5: measurementFormData.exited_5 ? measurementFormData.exited_5 : null,
                    exited_6: measurementFormData.exited_6 ? measurementFormData.exited_6 : null,
                    entered_sum: Number(measurementFormSummary.entered_sum),
                    exited_sum: Number(measurementFormSummary.exited_sum),
                    arrival_hour: time.arrival ? time.arrival : null,
                    departure_hour: time.departure ? time.departure : null,
                    accuracy: Number(accuracy),
                    type: measurement_type,
                    comments: additionalComment ? additionalComment : null,
                    measurement_date: current_date
                }

                // Dopisywanie pomiaru do obiektu - jeśli mierzona jest stacja

                if(current_job.station_id){

                    const updated: MergedTrain[] = mergedTrains.map(train => {

                        if(train.train_id === train_id){
                          
                            return {

                                ...train,

                                photos: [ ...(train.photos ?? []), ...outputArray ],

                                delay: time_difference > 10 ? "opóźniony " + time_difference + " min." : null,
                                
                                measurement: [new_measurement],
                                
                            };

                        } else {

                            return train;

                        }

                    });

                    setMergedTrains(updated);
        
                }

                // Dopisywanie pomiaru - jeśli mierzony jest pociąg

                if(current_job.train_id){

                    if(mergedTrains.length === 1){

                        const updated: MergedTrain = mergedTrains[0];

                        updated.stops.forEach(station => {

                            if(station.station_id === station_id){

                                station.measurement = [new_measurement];

                                station.delay = time_difference > 10 ? "opóźniony " + time_difference + " min." : null;

                            }

                        });

                        updated.photos = [ ...(updated.photos ?? []), ...outputArray ];

                        setMergedTrains([updated]);

                    }
        
                }

                const list = document.querySelectorAll<HTMLElement>('.currently-measured-train');

                if(list.length > 0){

                    const element: HTMLElement = list[0];

                    element.scrollIntoView();

                }

                clearJobFormData();

                setActiveTrain(null);

                setActiveStation(null);

                setUploadedFiles([]);

                setUploadedPreviews([]);

                setActivePreview(null);

            } else if(response.data === false){

                setModalMessage('Wystąpił problem z zapisem pomiaru. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.');

            } else {

                setModalMessage('Wystąpił problem z zapisem pomiaru. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.');

            }

            setModal({...modal, show: true, info: true});

            button?.removeAttribute("disabled");

        }).catch((error) => {

            console.warn(error);

            setModalMessage('Wystąpił problem z zapisem pomiaru. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.');

            setModal({...modal, show: true, info: true});

            button?.removeAttribute("disabled");

        });
        
    }

    function clearJobFormData(): void {

        setMeasurementFormData({});

        setTime({arrival: "", departure: ""});

        setAccuracy('');

        setAdditionalComment('');

    }

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

        return found_station ? found_station.name : "";

    }

    // Podgląd zdjęć

    const [photosToShow, setPhotosToShow] = useState<PhotoSlide[]>([]);

    const [activePhotoShow, setActivePhotoShow] = useState<number | null>(null);

    function showPhotos(train_id: string): void {

        const train: MergedTrain | undefined = mergedTrains.find(u => u.train_id === train_id);

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

            setActivePhotoShow(0);

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

    // Zachowanie ostatniego stanu

    const [previousLoad, setPreviousLoad] = useState<boolean>(false);

    const latestPreviousLoad = useRef<boolean>(previousLoad);

    useEffect(() => {

        latestPreviousLoad.current = previousLoad;

    }, [previousLoad]);

    const [measurementSaving, setMeasurementSaving] = useState<boolean>(false);

    const latestMeasurementSaving = useRef<boolean>(measurementSaving);

    useEffect(() => {

        latestMeasurementSaving.current = measurementSaving;

    }, [measurementSaving]);

    // Zachowywanie w pamięci wybranego zadania

    useEffect(() => {

        if(activeJob){

            db.latest.toArray().then(function(result){

                if(result.length > 0){

                    db.latest.update(1, {job: activeJob});

                } else {

                    db.latest.put({index: 1, job: activeJob});

                }

            });

        }

    }, [activeJob]);

    // Zachowywanie pomiarów jeśli pociąg/stacja mierzona jest pierwszy raz

    useEffect(() => {

        if(latestMeasurementSaving.current){

            const current_train: MergedTrain | null = latestActiveTrain.current ? latestActiveTrain.current : null;

            const current_station: string | null = latestActiveStation.current;

            const updated: MeasurementSave = {
                measurementFormData: measurementFormData,
                time: time,
                accuracy: accuracy,
                additionalComment: additionalComment
            }

            db.latest.update(1, {train: current_train, station: current_station, measurements: updated});

        }

    }, [measurementFormData, time, accuracy, additionalComment]);

    // Aktywowanie wcześniejszego zadania przy pierwszym wczytaniu strony

    const [latest, setLatest] = useState<Latest>({train: null, station: null, saved_measurements: null});

    useEffect(() => {

        if(updatedJobs.length > 0 && !latestPreviousLoad.current){

            db.latest.toArray().then(function(result){

                if(result.length > 0){

                    const latest_job: Job | undefined = result[0].job;

                    const latest_train: MergedTrain | null = result[0].train ? result[0].train : null;

                    const latest_station: string | null = result[0].station ? result[0].station : null;

                    const latest_measurments: MeasurementSave | null = result[0].measurements ? result[0].measurements : null;

                    if(latest_job){

                        const job_number: number = latest_job.job_number;

                        if(updatedJobs.some(job => job.job_number === job_number)){

                            activateJob(job_number);

                        }

                        if((latest_train || latest_station) && latest_measurments){

                            setLatest({train: latest_train, station: latest_station, saved_measurements: latest_measurments});

                        }

                    }

                }

            });

        }

    }, [updatedJobs, activateJob]);

    useEffect(() => {

        if(mergedTrains.length > 0 && (latest.train || latest.station) && latest.saved_measurements){

            setMeasurementSaving(true);

            const latest_train: MergedTrain | null = latest.train;

            const latest_station: string | null = latest.station;

            const latest_measurments: MeasurementSave = latest.saved_measurements;

            if(latest_train){

                activateSelectedTrain(latest_train);

            }

            if(latest_station){

                activateSelectedStation(latest_station);

            }

            setMeasurementFormData(latest_measurments.measurementFormData);

            setTime(latest_measurments.time);

            setAccuracy(latest_measurments.accuracy);

            setAdditionalComment(latest_measurments.additionalComment);

        }

    }, [mergedTrains, latest, activateSelectedTrain, activateSelectedStation]);

    // Pełny rozkład jazdy pociągów

    function openSchedules(): void {

        if(activeJob?.station_id){

            db.station.put({index: 1, station: activeJob.station_id});

            window.open('/rozklady', '_blank');

        }

    }

    // Raportowanie czasu pracy

    const [customTime, setCustomTime] = useState<CustomTime>({
        job_number: null,
        reported_hours: '',
        reported_minutes: ''
    });

    function showCustomTime(job_number: number): void {

        setCustomTime({
            job_number: job_number,
            reported_hours: '',
            reported_minutes: ''
        });

        setModal({...modal, show: true, time: true});

    }

    function reportedTimeChange(event: React.ChangeEvent<HTMLInputElement>): void {

        const {name, value} = event.target;

        const new_value: number = Number(value);

        let new_calculated: string;

        if(name === 'reported_minutes'){

            if(new_value < 0){

                new_calculated = '00';

            } else if(new_value >= 0 && new_value < 10){

                new_calculated = '0' + new_value;

            } else if(new_value >= 10 && new_value < 60){

                new_calculated = String(new_value);

            } else if(new_value >= 60){

                new_calculated = '59';

            } 

        }

        if(name === 'reported_hours'){

            if(new_value <= 0){

                new_calculated = '0';

            } else if(new_value > 0 && new_value < 50){

                new_calculated = String(new_value);

            } else if(new_value >= 50){

                new_calculated = '50';

            }

        }

        setCustomTime(prevFormData => {
            return {
                ...prevFormData,
                [name]: new_calculated
            }
        });

    }

    function cancelTimeReport(): void {

        closeModal();

        setCustomTime({
            job_number: null,
            reported_hours: '',
            reported_minutes: ''
        });

    }

    function reportTime(): void {

        if(customTime.reported_hours === '' && customTime.reported_minutes === ''){

            return;

        }

        const job_number = customTime.job_number;

        const hours: string = customTime.reported_hours;

        const minutes: string = customTime.reported_minutes;

        const personal_id: string = user.personal_id;

        const request_type: string = 'report time';

        Axios.post('classes/measurements.php', { personal_id, job_number, hours, minutes, request_type }, { timeout: 10000 }).then(function(response){

            if(response.data.reported_time){
                
                setModalMessage('Czas został zapisany.');

                setCustomTime({
                    job_number: null,
                    reported_hours: '',
                    reported_minutes: ''
                });

                const reported_time: string = response.data.reported_time

                const updated: UpdatedJob[] = filteredJobs.map(job => {

                    if(job.job_number === job_number){
                      
                        return {

                            ...job,  
                            
                            reported_work_hours: reported_time,
                            
                        };

                    } else {

                        return job;

                    }

                });

                setFilteredJobs(updated);

            } else {

                setModalMessage('Wystąpił problem z zapisem. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.');

            }

            setModal({...modal, show: true, time: false, info: true});

        }).catch((error) => {

            console.warn(error);

            setModalMessage('Wystąpił problem z zapisem. Spróbuj ponownie, a jeżeli problem będzie się powtarzał skontaktuj się z koordynatorem projektu.');

            setModal({...modal, show: true, time: false, info: true});

        });

    }

    // Wyznaczanie klasy wiersza w tabeli

    const buttonClassName = useMemo(() => {

        if((measurementFormSummary.entered_sum === '' && measurementFormSummary.exited_sum === '' && accuracy === '') || !activeJob){

            return "user-top-panel-button finish-measurements-button-disabled";

        }

        let matching_object: MergedTrain | TrainStop | undefined;

        if(activeJob.station_id){

            matching_object = mergedTrains.find(train => train.train_id === activeTrain?.train_id);

        }

        if(activeJob.train_id){

            matching_object = mergedTrains[0]?.stops.find(station => station.station_id === activeStation);

        }

        if((uploadedFiles.length === 0) && (!matching_object || matching_object.measurement?.length === 0)){

            return "user-top-panel-button finish-measurements-button-disabled";

        }

            return "user-top-panel-button finish-measurements-button";

    }, [measurementFormSummary, accuracy, uploadedFiles, activeJob, activeTrain, activeStation, mergedTrains]);

    //console.log(mergedTrains)

    return (
        <div id="app-outer-container">
            {(appLayer === 100 || appLayer === 200) && 
                <div className="user-top-panel-outer-wrapper">
                    <div className="user-top-panel-middle-wrapper">
                        <div className="user-top-panel-inner-wrapper">
                            <p className="work-panel-top-text">Witaj {user.first_name ? user.first_name : ""} {user.surname ? user.surname : ""}</p>
                        </div>
                        <div className="separator"></div>
                        <div className="user-top-panel-inner-wrapper">
                            <p className="work-panel-top-text">Łączny czas pracy: <span className="top-panel-important-info">{formatedTotalTime}</span></p>
                            {activeJob && <p className="work-panel-top-text">Czas pracy w zadaniu: <span className="top-panel-important-info">{formatedJobTime}</span></p>}
                        </div>
                    </div>
                    <div className="user-top-panel-middle-wrapper">
                        <div className="user-top-panel-inner-wrapper">
                            <button className={!activeStatus ? "user-top-panel-button user-top-panel-button-red" : "user-top-panel-button"} onClick={() => handleWorkTime()}>{activeStatus ? 'Zatrzymaj czas' : 'Wznów pracę'}</button>
                        </div>
                        <div className="separator"></div>
                        {activeJob && <><div className="user-top-panel-inner-wrapper">
                            <button className="user-top-panel-button" onClick={() => exitJob()}>Zmień zadanie</button>
                        </div>
                        <div className="separator"></div>
                        </>}
                        <div className="user-top-panel-inner-wrapper">
                            <button className="user-top-panel-button" onClick={logout}>Wyloguj się &#10140;</button>
                        </div>
                    </div>
                </div>
            }
            <div id="app-inner-container">
                {appLayer === 100 && <>
                    {updatedJobs.length === 0 && 
                        <div className="waiting-wrapper">
                            {searching && 
                            <>
                                <p className="waiting-message">Wyszukiwanie dostępnych zadań</p>
                                <Gear/>
                            </>}
                            {!searching && 
                            <>
                                <p className="waiting-message">Brak dostępnych zadań</p>
                                <button className='user-top-panel-button' onClick={()=>getData()}>Sprawdź ponownie</button>
                            </>}                    
                        </div>
                    }
                    {updatedJobs.length > 0 && 
                        <div className="job-selection-outer-wrapper">
                            <div className="job-selection-top-panel-wrapper">
                                {jobDates.length > 0 && 
                                    <div className="job-selection-filter-wrapper">
                                        <p className="job-selection-filter-label">Data pomiarów</p>
                                        <select
                                            onChange={onJobFilterChange}
                                            value={jobFilters.job_date}
                                            name='job_date'
                                            className="filter-select"
                                            id="user-job-date"
                                        >
                                            <option value=''>Wszystkie</option>
                                            {jobDates.map((date, index) => (
                                            <option key={index} value={date}>{date}</option>
                                            ))}
                                        </select>
                                    </div>
                                }
                                {jobStations.length > 0 &&
                                    <div className="job-selection-filter-wrapper">
                                        <p className="job-selection-filter-label">Nazwa stacji</p>
                                        <select
                                            onChange={onJobFilterChange}
                                            value={jobFilters.job_station_name}
                                            name='job_station_name'
                                            className="filter-select"
                                            id="user-job-station"
                                        >
                                            <option value=''>Wszystkie</option>
                                            {jobStations.map((station, index) => (
                                            <option key={index} value={station}>{station}</option>
                                            ))}
                                        </select>
                                    </div>
                                }
                                <button className="clear-job-filters-button" onClick={() => setJobFilters({job_station_name: '', job_date: ''})}>Pokaż wszystkie</button>
                            </div>
                            <div className="job-selection-bottom-panel-wrapper">
                                <table className="job-details-table">
                                    <thead>
                                        <tr>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">ID</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Punkt/Pociąg</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Data</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Liczba<br></br>pociągów<br></br>/ stacji</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Liczba odcz.<br></br>pociągów<br></br>/ stacji</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">% wykonania</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Informacje<br></br>dodatkowe</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Czas pracy</span></th>
                                            <th><div className="job-details-table-header-cell"></div><span className="job-details-table-span">Wybierz</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.map((job: UpdatedJob, index: number) =>
                                            <tr key={index} className={job.stages === job.completed_stages ? "job-completed-row" : ""}>
                                                <td>{job.job_number}</td> 
                                                <td>{job.station_name ? job.station_name : job.first_station_name + ' \u2014 ' + job.last_station_name}</td>
                                                <td>{formatDate(job.recording_date)}</td>
                                                <td>{job.stages}</td>
                                                <td>{job.completed_stages ? job.completed_stages : '0'}</td>
                                                <td>{!job.completed_stages ? "0" : ((job.completed_stages/job.stages)*100).toFixed(2)}</td>
                                                <td>{job.comments ? job.comments : 'brak'}</td>
                                                {job.stages !== job.completed_stages && <td>{job.work_hours ? job.work_hours : '-'}</td>}
                                                {job.stages === job.completed_stages && !job.reported_work_hours && <td>{job.work_hours}<button onClick={() => showCustomTime(job.job_number)} className="job-time-update-button">raportuj</button></td>}
                                                {job.stages === job.completed_stages && job.reported_work_hours && <td><span className="table-reported-time-span">{job.work_hours}</span><span className="table-reported-time-span">{job.reported_work_hours}</span></td>}
                                                <td><button className="job-selection-button" onClick={() => activateJob(job.job_number)}>&#10000;</button></td>
                                            </tr>
                                        )}
                                        {filteredJobs.length === 0 && 
                                            <tr>
                                                <td colSpan={9}>Brak zadań spełniających wybrane kryteria</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table> 
                            </div>        
                        </div>
                    }
                </>}
                {appLayer === 200 && activeJob &&
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
                                {activeJob.train_id && mergedTrains.length === 1 && mergedTrains[0].photos.length > 0 && <button onClick={() => showPhotos(activeJob.train_id!)} className="job-additional-button">Zobacz zdjęcia</button>}
                            </div>
                        </div>
                        {/* Pobieranie danych */}
                        {mergedTrains.length === 0 && 
                            <div className="waiting-wrapper">
                                <p className="waiting-message">Pobieranie danych</p>
                                <Gear/>
                            </div>
                        }
                        {/* Sprawdzanie stacji */}
                        {activeJob.station_name && mergedTrains.length > 0 &&  
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
                                                <th><div className="job-working-details-table-header-cell"></div><span className="job-working-details-table-span">Analizuj</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mergedTrains.map((train: MergedTrain, index: number) =>
                                                <tr key={index} className={`${getClassNames(train)}`}>
                                                    <td>{train.train_number}</td>
                                                    <td>{train.platform_number ? train.platform_number : "b/d"}</td>
                                                    <td>{train.lane_number ? train.lane_number : "b/d"}</td>
                                                    <td>{train.arrival_hour ? train.arrival_hour : "-"}</td>
                                                    <td>{train.departure_hour ? train.departure_hour : "-"}</td>
                                                    <td>{train.first_station_name + " - " + train.last_station_name}</td>
                                                    <td>{train.measurement && train.measurement.length > 0 && train.measurement[0].entered_sum}</td>
                                                    <td>{train.measurement && train.measurement.length > 0  && train.measurement[0].exited_sum}</td>
                                                    <td>{train.photos[0] ? <button className="job-working-train-icon" onClick={() => showPhotos(train.train_id)}><MagnifyingGlassIcon/></button> : "brak"}</td>
                                                    <td>{train.delay ? train.delay : "-"}</td>
                                                    <td><button className="job-working-train-icon" onClick={() => activateTrain(train.train_id)}><TrainIcon/></button></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table> 
                                </div>
                                {activeJob.train_list !== '' && activeJob.train_list !== null && <div>
                                    <p onClick={() => openSchedules()} id="full-schedule-link">Pełny rozkład jazdy na stacji &#10132;</p>
                                </div>}
                            </div>
                        }
                        {/* Sprawdzanie pociągu */}
                        {activeJob.train_number &&  mergedTrains.length > 0 && 
                            <div className="job-working-middle-outer-wrapper">
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
                                            {mergedTrains[0] && mergedTrains[0].stops.map((train_stop: TrainStop, index: number) =>
                                                <tr key={index} className={`${getStationClassNames(train_stop)}`}>
                                                    <td>{train_stop.station_name}</td>
                                                    <td>{train_stop.platform_number ? train_stop.platform_number : "b/d"}</td>
                                                    <td>{train_stop.lane_number ? train_stop.lane_number : "b/d"}</td>
                                                    <td>{train_stop.arrival_hour ? train_stop.arrival_hour : '-'}</td>
                                                    <td>{train_stop.departure_hour ? train_stop.departure_hour : '-'}</td>
                                                    {train_stop.active === false && <td>-</td>}
                                                    {train_stop.active === true && train_stop.measurement && <td>
                                                        {train_stop.measurement.map((measurement, i) =>
                                                            <p key={i} className="station-measurements-line">
                                                                <span>{measurement.entered_sum}</span>
                                                            </p>
                                                        )}
                                                    </td>}
                                                    {train_stop.active === false && <td>-</td>}
                                                    {train_stop.active === true && train_stop.measurement && <td>
                                                        {train_stop.measurement.map((measurement, i) =>
                                                            <p key={i} className="station-measurements-line">
                                                                <span>{measurement.exited_sum}</span>
                                                            </p>
                                                        )}
                                                    </td>}
                                                    <td>{train_stop.delay ? train_stop.delay : '-'}</td>
                                                    <td>{train_stop.active === true ? <button className="job-working-train-icon" onClick={() => activateStation(train_stop)}><TrainIcon/></button> : "-"}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table> 
                                </div>
                            </div>
                        }
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
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'entered_1'}
                                                        name={'entered_1'}
                                                        value={measurementFormData.entered_1 !== undefined ? measurementFormData.entered_1 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'entered_2'}
                                                        name={'entered_2'}
                                                        value={measurementFormData.entered_2 !== undefined ? measurementFormData.entered_2 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'entered_3'}
                                                        name={'entered_3'}
                                                        value={measurementFormData.entered_3 !== undefined ? measurementFormData.entered_3 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                </div>
                                                <div className="entered-exited-line-wrapper">
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'entered_4'}
                                                        name={'entered_4'}
                                                        value={measurementFormData.entered_4 !== undefined ? measurementFormData.entered_4 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'entered_5'}
                                                        name={'entered_5'}
                                                        value={measurementFormData.entered_5 !== undefined ? measurementFormData.entered_5 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'entered_6'}
                                                        name={'entered_6'}
                                                        value={measurementFormData.entered_6 !== undefined ? measurementFormData.entered_6 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
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
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'exited_1'}
                                                        name={'exited_1'}
                                                        value={measurementFormData.exited_1 !== undefined ? measurementFormData.exited_1 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'exited_2'}
                                                        name={'exited_2'}
                                                        value={measurementFormData.exited_2 !== undefined ? measurementFormData.exited_2 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'exited_3'}
                                                        name={'exited_3'}
                                                        value={measurementFormData.exited_3 !== undefined ? measurementFormData.exited_3 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                </div>
                                                <div className="entered-exited-line-wrapper">
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'exited_4'}
                                                        name={'exited_4'}
                                                        value={measurementFormData.exited_4 !== undefined ? measurementFormData.exited_4 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'exited_5'}
                                                        name={'exited_5'}
                                                        value={measurementFormData.exited_5 !== undefined ? measurementFormData.exited_5 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
                                                    />
                                                    <input 
                                                        className="input-number" 
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) =>measurementFormChange(e)}
                                                        id={'exited_6'}
                                                        name={'exited_6'}
                                                        value={measurementFormData.exited_6 !== undefined ? measurementFormData.exited_6 : ""}
                                                        onWheel={(e) => e.currentTarget.blur()}
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
                                                <div className="hours-buttons-wrapper">
                                                    <div className="hours-button" onClick={() => manualTimeChange('increment', 'hour', 'arrival', null)} onMouseDown={() => startChanging('increment', 'hour', 'arrival')} onMouseUp={stopChanging}><span className="plus-sign">+</span></div>
                                                    <div className="hours-button" onClick={() => manualTimeChange('decrement', 'hour', 'arrival', null)} onMouseDown={() => startChanging('decrement', 'hour', 'arrival')} onMouseUp={stopChanging}><span className="minus-sign">-</span></div>
                                                </div>
                                                <input
                                                    className="input-number input-time"
                                                    type="time"
                                                    id="arrival"
                                                    name="arrival"
                                                    value={time.arrival}
                                                    onChange={handleTimeChange}
                                                    step="60" 
                                                />
                                                <div className="hours-buttons-wrapper">
                                                    <div className="hours-button" onClick={() => manualTimeChange('increment', 'minute', 'arrival', null)} onMouseDown={() => startChanging('increment', 'minute', 'arrival')} onMouseUp={stopChanging}><span className="plus-sign">+</span></div>
                                                    <div className="hours-button" onClick={() => manualTimeChange('decrement', 'minute', 'arrival', null)} onMouseDown={() => startChanging('decrement', 'minute', 'arrival')} onMouseUp={stopChanging}><span className="minus-sign">-</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hours-form-wrapper">
                                            <p className="measuring-form-label measuring-form-label-fixed-width-2">Godzina odjazdu</p>
                                            <div className="hours-inner-wrapper">
                                                <div className="hours-buttons-wrapper">
                                                    <div className="hours-button" onClick={() => manualTimeChange('increment', 'hour', 'departure', null)} onMouseDown={() => startChanging('increment', 'hour', 'departure')} onMouseUp={stopChanging}><span className="plus-sign">+</span></div>
                                                    <div className="hours-button" onClick={() => manualTimeChange('decrement', 'hour', 'departure', null)} onMouseDown={() => startChanging('decrement', 'hour', 'departure')} onMouseUp={stopChanging}><span className="minus-sign">-</span></div>
                                                </div>
                                                <input
                                                    className="input-number input-time"
                                                    type="time"
                                                    id="departure"
                                                    name="departure"
                                                    value={time.departure}
                                                    onChange={handleTimeChange}
                                                    step="60" 
                                                />
                                                <div className="hours-buttons-wrapper">
                                                    <div className="hours-button" onClick={() => manualTimeChange('increment', 'minute', 'departure', null)} onMouseDown={() => startChanging('increment', 'minute', 'departure')} onMouseUp={stopChanging}><span className="plus-sign">+</span></div>
                                                    <div className="hours-button" onClick={() => manualTimeChange('decrement', 'minute', 'departure', null)} onMouseDown={() => startChanging('decrement', 'minute', 'departure')} onMouseUp={stopChanging}><span className="minus-sign">-</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hours-form-bottom-info-wrapper"><p className="hours-form-additional-info">Wprowadź rzeczywisty czas odjazdu/przyjazdu tylko gdy różnica przekracza 10 minut</p></div>
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
                                            onChange={handleAccuracyChange}
                                            onWheel={(e) => e.currentTarget.blur()}
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
                                    <p className="measuring-form-label">Zdjęcie pojazdu</p>
                                    <div id="user-photo-fields-inner-wrapper">
                                        {uploadedFiles.length > 0 && <button id="view-added-photo-button" onClick={() => setModal({...modal, show: true, preview_photo: true})}><svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211zM4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474z"/></svg></button>}
                                        <button className="user-top-panel-button add-photos-button" onClick={() => setModal({...modal, show: true, add_photo: true})}>{uploadedFiles.length === 0 ? 'Dodaj' : 'Zmień'} {uploadedFiles.length < 2 ? 'zdjęcie' : 'zdjęcia'}</button>
                                    </div>
                                </div>
                                <div className="form-additional-fields-outer-wrapper">
                                    <p className="measuring-form-label">Komentarz(opcjonalnie)</p>
                                    <div className="form-additional-fields-inner-wrapper">
                                        <textarea 
                                            id="add_comment"
                                            name="add_comment"
                                            placeholder="Wpisz komentarz do pomiaru"
                                            className="cam-form-field cam-form-field-textarea"
                                            onChange={handleComment}   
                                            value={additionalComment}
                                        />
                                    </div>
                                </div>
                                <div className="job-form-send-button-wrapper">
                                    <button id="measurement-save-button" className={buttonClassName} onClick={() => sendJobForm()}>Zakończ pomiar</button>
                                    {/* className={`${getButtonClassName()}`} */}
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
            {modal.show &&
                <div className="modal-overlay" onClick={() => handleModalClose()}>
                    {/* Dodawanie zdjęć */}
                    {modal.add_photo && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">{uploadedFiles.length === 0 ? 'Dodaj' : 'Dodane'} zdjęcie</h2>
                            </div>
                            <div className="modal-body">
                                    <div id="photo-import-wrapper" >
                                        <label htmlFor="kml-file" className="drop-container" onDragOver={allowDrop} onDrop={handleDrop}>
                                            <span className="drop-title">Przeciągnij plik tutaj</span>
                                            lub
                                            <input
                                                type="text"
                                                id="drop-zone"
                                                placeholder='Wklej zdjęcie tutaj'
                                                className="drop-zone"
                                                onPaste={handlePaste}
                                                readOnly
                                            />
                                            lub
                                            <input 
                                                accept="image/*" 
                                                type="file"
                                                onChange={handlePhotos}
                                                multiple
                                            />
                                        </label>
                                    </div>
                            </div>
                        </div>
                    }
                    {/* Podgląd zdjęcia przed wysłaniem */}
                    {modal.preview_photo && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div id="modal-header" className="modal-header">
                                <h2 className="modal-title">Podgląd zdjęć</h2>
                                <button id="modal-close-button" onClick={() => closeModal()}>&#10006;</button>
                            </div>
                            <div className="modal-body">
                                {uploadedFiles.length > 0 &&
                                    <div className="photo-preview-wrapper">
                                        {uploadedPreviews.length > 0 && 
                                            <div id="photo-preview-inside-wrapper">
                                                {uploadedPreviews.length > 1 && <svg className="btn btn--prev" onClick={() => changeActivePreview('upload', 'decrement')} height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                                                    <path d="M0-.5h24v24H0z" fill="none"/>
                                                </svg>}
                                                {activePreview !== null && 
                                                    <img
                                                        src={uploadedPreviews[activePreview]}
                                                        alt='upload-preview'
                                                        className="image-preview"
                                                    />
                                                }
                                                {uploadedPreviews.length > 1 && <svg className="btn btn--next" onClick={() => changeActivePreview('upload', 'increment')} height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                                                    <path d="M0-.25h24v24H0z" fill="none"/>
                                                </svg>}
                                            </div>
                                        }
                                    </div>
                                }
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
                                <div className="photo-preview-wrapper">
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
                                </div>
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
                                            <div id="ftp-details-container">
                                                <div id="ftp-details-inner-left">
                                                    <p className="ftp-left-row"><span className="ftp-bullet">&bull;</span>Host - <span id="ftp_host" className="ftp-span">rubika.myftp.org</span></p>
                                                    <p className="ftp-left-row"><span className="ftp-bullet">&bull;</span>Użytkownik - <span id="ftp_user" className="ftp-span">filmy</span></p>
                                                    <p className="ftp-left-row"><span className="ftp-bullet">&bull;</span>Hasło - <span id="ftp_password" className="ftp-span">997analiza</span></p>
                                                </div>
                                                <div id="ftp-details-inner-right">
                                                    <button className="ftp-button" onClick={() => copyText('ftp_host')}>{buttonStatus.ftp_host ? 'skopiowano' : 'kopiuj'}</button>
                                                    <button className="ftp-button" onClick={() => copyText('ftp_user')}>{buttonStatus.ftp_user ? 'skopiowano' : 'kopiuj'}</button>
                                                    <button className="ftp-button" onClick={() => copyText('ftp_password')}>{buttonStatus.ftp_password ? 'skopiowano' : 'kopiuj'}</button>
                                                </div>
                                            </div>
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
                    {/* Informacje */}
                    {modal.info && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Informacja</h2>
                            </div>
                            <div className="modal-body">
                                {formErrors.length > 0 && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">Przed zakończeniem pomiaru należy uzupełnić brakujące informacje:</p>
                                        <ul className="modal-error-ul">
                                            {formErrors.map((error, index) => (
                                                <li className="modal-error-list" key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                }
                                {(tempTrainToActivate || tempStationToActivate) && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">Czy na pewno chcesz zmienić {tempTrainToActivate ? 'wybrany pociąg' : 'wybraną stację'}?<br></br>Spowoduje to usunięcie bieżących pomiarów.</p>
                                    </div>
                                }
                                {modalMessage && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">{modalMessage}</p>
                                    </div>
                                }
                                {reactivationMessage && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">{reactivationMessage}</p>
                                    </div>
                                }
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    {reactivationMessage && <button className="user-top-panel-button" onClick={() => resumeWork()}>Wznów pracę</button>}
                                    {modalMessage && <button className="user-top-panel-button" onClick={() => closeModal()}>OK</button>}
                                    {formErrors.length > 0 && <button className="user-top-panel-button user-top-panel-button-red" onClick={() => closeModal()}>Powróć</button>}
                                    {(tempTrainToActivate || tempStationToActivate) && <button className="user-top-panel-button user-top-panel-button-red" onClick={() => confirmStageChange()}>Zmień</button>}
                                    {(tempTrainToActivate || tempStationToActivate) && <button className="user-top-panel-button" onClick={() => closeModal()}>Anuluj</button>}
                                </div>
                            </div>
                        </div>
                    }
                    {/* Aktualizacja czasu */}
                    {modal.time && !modal.error && 
                        <div className="modal" onClick={(e)=>e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Raportuj czas pracy</h2>
                            </div>
                            <div className="modal-body">
                                <p className="modal-time-info-text">Jeśli czas obliczony w aplikacji różni się rzeczywistego czasu poświęconego na wykonanie danego zadania podaj go tutaj.</p>
                                <div className="modal-time-inputs-wrapper">
                                    <span className="modal-time-input-span">godzin</span>
                                    <input 
                                        className="input-number" 
                                        type="number" 
                                        onChange={(e) =>reportedTimeChange(e)}
                                        id={'reported_hours'}
                                        name={'reported_hours'}
                                        value={customTime.reported_hours}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    <input 
                                        className="input-number" 
                                        type="number" 
                                        onChange={(e) =>reportedTimeChange(e)}
                                        id={'reported_minutes'}
                                        name={'reported_minutes'}
                                        value={customTime.reported_minutes}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    <span className="modal-time-input-span">minut</span>
                                </div>
                                
                            </div>

                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    <button className={(customTime.reported_hours !== '' || customTime.reported_minutes !== '') ? "user-top-panel-button" : "user-top-panel-button user-top-panel-button-disabled"} onClick={() => reportTime()}>Akceptuj</button>
                                    <button className="user-top-panel-button user-top-panel-button-red" onClick={() => cancelTimeReport()}>Anuluj</button>
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
                                {modalErrorMessage && 
                                    <div className="modal-info-wrapper">
                                        <p className="modal-info-text">{modalErrorMessage}</p>
                                    </div>
                                }
                            </div>
                            <div className="modal-footer">
                                <div className="modal-buttons-wrapper"> 
                                    {modalErrorMessage && <button className="user-top-panel-button user-top-panel-button-red" onClick={() => handleModalClose()}>OK</button>}
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    );
};