<?php

include 'connection.php';

class Job{

    use Connection;

    public $job_number;
    public $personal_id;
    public $station_id;
    public $train_list;
    public $recording_date;
    public $train_id;
    public $status;
    public $start_hour;
    public $end_hour;
    public $type;
    public $stages;
    public $completed_stages;
    public $work_time;
    public $work_hours;
    public $comments;

    public $dbh;

    public function __construct(){

        $this->dbh = $this->connect();

    }

    public function createJob($data){

        if(!$this->checkConnection()){

            return;

        }

        $stmt_jobs = $this->dbh->prepare("SELECT MAX(job_number) AS max_job_number FROM `jobs`");

        $stmt_jobs->execute();

        $max_job_number = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

        $stmt_jobs->closeCursor();

        $current_max = $max_job_number[0]['max_job_number'];

        $this->job_number = $current_max + 1;

        $this->personal_id = $data['personal_id'];

        if(array_key_exists('station_id', $data)){

            $this->station_id = $data['station_id'];

        }

        if(array_key_exists('ids_list', $data)){

            $this->train_list = $data['ids_list'];

        }
        
        $this->recording_date = $data['recording_date'];

        if(array_key_exists('train_id', $data)){

            $this->train_id = $data['train_id'];

        }
        
        $this->status = 'wydany';

        if(array_key_exists('start_hour', $data)){

            $this->start_hour = $data['start_hour'].":00";

        }

        if(array_key_exists('end_hour', $data)){

            $this->end_hour = $data['end_hour'].":00";

        }

        $this->type = $data['kind'];

        // Określanie liczby etapów

        if($data['type'] === 'station'){

            $station_id = $this->station_id;

            $start_hour = $this->start_hour;

            $end_hour = $this->end_hour;

            if(!empty($start_hour) && !empty($end_hour)){

                $stmt_train_count = $this->dbh->prepare("SELECT * FROM `trains` WHERE `station_id` = :station_id AND IF(`arrival_hour` IS NULL, `departure_hour` BETWEEN :departure_start_hour AND :departure_end_hour, `arrival_hour` BETWEEN :arrival_start_hour AND :arrival_end_hour)");

                $params = array(
                    'station_id' => $station_id,
                    'arrival_start_hour' => $start_hour,
                    'arrival_end_hour' => $end_hour,
                    'departure_start_hour' => $start_hour,
                    'departure_end_hour' => $end_hour
                );

                $stmt_train_count->execute($params);

                $train_list = $stmt_train_count->fetchAll(PDO::FETCH_ASSOC);

                $stmt_train_count->closeCursor();

                $train_count = count($train_list);

            // Gdy nie ma podanego zakresu godzin

            } else {

                $train_count = $data['train_list_count'];

            }

            $this->stages = $train_count;

        }

        if($data['type'] === 'train'){

            // Sprawdzanie liczby stacji

            $stmt_train_job = $this->dbh->prepare("SELECT station_id FROM trains WHERE train_id = :train_id");

            $stmt_train_job->execute(['train_id' => $this->train_id]);

            $stations_list = array_column($stmt_train_job->fetchAll(PDO::FETCH_ASSOC), 'station_id');

            $stmt_train_job->closeCursor();

            $stmt_recordings = $this->dbh->prepare("SELECT station_id FROM recordings WHERE recording_date = :recording_date");

            $stmt_recordings->execute(['recording_date' => $this->recording_date]);

            $recorded_stations = array_column($stmt_recordings->fetchAll(PDO::FETCH_ASSOC), 'station_id');

            $stmt_recordings->closeCursor();

            $recorded_train_stations = array_intersect($stations_list, $recorded_stations);

            $stations_count = count($recorded_train_stations);
            
            $this->stages = $stations_count;

        }

        if(array_key_exists('comments', $data) && !empty($data['comments'])){

            $this->comments = $data['comments'];

        } else {

            $this->comments = null;

        }

        $object = get_object_vars($this);

        unset($object['dbh']);

        $put = $this->insert($object);

    }

    public function checkStationMatch($array, $station_id, $recording_date){

        foreach($array as $element){

            if($element['station_id'] === $station_id && $element['recording_date'] === $recording_date){

                return true;

            }

        }

        return false;
    }

    public function insert($object){

        if(!$this->checkConnection()){

            return;

        }

        $obj_properties = array_keys($object);

        $names = implode(",", $obj_properties);

        $values = implode(",:", $obj_properties);

        $stmt = $this->connect()->prepare("INSERT INTO `jobs` ($names) VALUES (:$values)");

        $stmt->execute($object);

        $count = $stmt->rowCount();

        if($count === 1){

            $response = true;

        } else {

            $response = false;

        }

        echo json_encode($response);
        
    }

    public function filterTrains($trains, $station_id, $start_hour, $end_hour){

        $output = array();

        $start_hour = strtotime($start_hour);
                    
        $end_hour = strtotime($end_hour);

        foreach($trains as $train){

            foreach($train as $train_stop){

                $current_station = $train_stop['station_id'];

                if($current_station !== $station_id){

                    continue;

                }

                $arrival_time = $train_stop['arrival_hour'];

                $departure_time = $train_stop['departure_hour'];

                if(!empty($arrival_time)){

                    $compared_time = strtotime($train_stop['arrival_hour']);
                    
                } else {

                    $compared_time = strtotime($train_stop['departure_hour']);

                }

                if($compared_time >= $start_hour && $compared_time <= $end_hour){

                    $output[] = $train;

                }

                break;

            }

        }

        return $output;

    }

}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){

    $data = json_decode(file_get_contents("php://input"), true);

    $request_type = $data['request_type'];

    switch ($request_type) {

        case "create job":

            $job_data = $data['job_data'];

            $createJob = new Job;

            $createJob->createJob($job_data);

            break;

    }

}