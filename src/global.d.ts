declare module '@fontsource/roboto';

// User context i login

declare type FormFields = {
    username: string;
    password: string;
}

declare type UserContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loginUser: (formFields: FormFields) => Promise<Data>;
    logout: () => void;
    isOnline: boolean;
    isLocalhost: boolean;
};

declare type UserData = Omit<Partial<User>, 'hour_rate' | 'total_work_time'> & {
    hour_rate?: number | string | null;
    total_work_time?: number | string | null;
    message?: string;
    token?: string;
    code?: string;
};

// Użytkownik

declare type User = {
    username: string;
    personal_id: string;
    role: string;
    first_name?: string | null;
    surname?: string | null;
    hour_rate?: number | null;
    total_work_time?: number | null;
}


declare type ModalSlide = {
    src: string;
}

declare type PassengerType = 'entered' | 'exited';

declare type Camera = {
    camera_number: string;
    station_id: string;
    recording_date: string;
}

declare type CameraSlide = Camera & {
    name: string;
    url: string;
}

declare type Delay = {
    recording_date: string;
    station_id: string;
    train_id: string;
    delay: string;
}

declare type FTP = {
    station_id: string;
    recording_date: string;
    disk: string;
    path: string;
}

declare type ButtonStatus = {
    ftp_host: boolean;
    ftp_user: boolean;
    ftp_password: boolean;
}

declare type JobFilters = {
    job_station_name: string;
    job_date: string;
}

declare type JobWithTrains = {
    job: Job;
    trains: TrainStop[][] | TrainStop[];
};

declare type Measurement = {
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
    full_name?: string; // Dopisywane w admin
    job_type?: string; // Dopisywane w admin
}

declare type Photo = {
    personal_id: string;
    job_number: number;
    recording_date: string;
    station_id: string;
    train_id: string;
    filename: string;
    upload_date: string;
}

declare type PhotoSlide = Photo & {
    name: string;
    url: string;
}



declare type Recording = {
    station_id: string;
    recording_date: string;
}

declare type Station = {
    station_id: string;
    name: string;
    platforms: number | null;
    edges: number | null;
    comments: string | null;
}

    

declare type TrainNumber = {
    train_id: string;
    train_number: string;
    first_station: string;
    last_station: string;
    direction: number | null;
    schedule_date: string | null;
    comments: string | null;
}

declare type Users = {
    username: string;
    status: string;
    role: string;
    personal_id: string;
    email: string | null;
    phone_number: string | null;
    first_name: string | null;
    surname: string | null;
    rating: number | null;
    hour_rate: number | null;
    total_work_time: number | null;
    total_work_hours: string | null;
    comment: string | null;
    last_update: string;
    created_on: string;
}

declare type APIResponse = {

    // Użytkownicy i admin:
    cameras?: Camera[];
    delays?: Delay[];
    ftp?: FTP[];
    jobs_trains?: JobWithTrains[];
    measurements?: Measurement[];
    photos?: Photo[];
    recordings?: Recording[];
    stations?: Station[];
    train_numbers?: TrainNumber[];

    // Tylko admin:
    jobs?: Job[];
    trains?: TrainStop[][];
    users?: Users[];
    users_with_jobs?: UserWithJobs[];
}

declare type UserWithJobs = {
    personal_id: string;
    full_name: string;
    surname: string;
}











declare type Job = {
    comments: string | null;
    completed_stages: number | null;
    creation_date: string;
    end_hour: string | null;
    job_number: number;
    personal_id: string;
    recording_date: string;
    reported_work_time: number | null;
    reported_work_hours: string | null;
    stages: number;
    start_hour: string | null;
    station_id: string | null;
    station_name?: string | null; // uzupełniana PHP
    status: string;
    train_id: string | null;
    train_list: string | null;
    type: string;
    work_time: number | null;
    work_hours: string | null;
}

type UpdatedJob = Job & {
    first_station_name: string | null;
    last_station_name: string | null;
    train_number: string | null;
}

type Train = {
    train_id: string;
    stops: TrainStop[];
    station_index?: number;
    arrival_hour?: string | null;
    departure_hour?: string | null;
    platform_number?: string | null;
    lane_number?: string | null;
    delay?: string | null;
}

type UpdatedTrain = Train & {
    train_number: string | null;
    first_station_name: string | null;
    last_station_name: string | null;
}

type MergedTrain = UpdatedTrain & {
    measurement?: Measurement[]; // uzupełniana
    photos: Photo[]; // uzupełniana
    relation?: string;
}

type TrainStop = {
    train_id: string;
    stop_number: number;
    station_id: string;
    arrival_hour: string | null;
    departure_hour: string | null;
    platform_number: string | null;
    lane_number: string | null;
    active?: boolean; // uzupełniana
    delay?: string | null; // uzupełniana
    station_name?: string | undefined; // uzupełniana PHP
    measurement?: Measurement[]; // uzupełniana
    recording_dates?: string[];
}

type MeasurementFormData = {
    entered_1?: '' | number;
    entered_2?: '' | number;
    entered_3?: '' | number;
    entered_4?: '' | number;
    entered_5?: '' | number;
    entered_6?: '' | number;
    exited_1?: '' | number;
    exited_2?: '' | number;
    exited_3?: '' | number;
    exited_4?: '' | number;
    exited_5?: '' | number;
    exited_6?: '' | number;
}

type MeasurementFormSummary = {
    entered_sum: '' | number;
    exited_sum: '' | number;
}

type Time = {
    arrival: string;
    departure: string;
}



type Accuracy = number | '';

type AdditionalComment = string;

type MeasurementSave = {
    measurementFormData: MeasurementFormData;
    time: Time,
    accuracy: Accuracy;
    additionalComment: AdditionalComment
}