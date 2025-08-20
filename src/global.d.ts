declare module '@fontsource/roboto';

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
    station_name: string | null; // uzupełniana PHP
    status: string | null;
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