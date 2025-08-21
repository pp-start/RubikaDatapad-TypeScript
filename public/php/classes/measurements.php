<?php

include 'connection.php';

class Measurements{

    use Connection;

    public $personal_id;
    public $job_number;
    public $station_id;
    public $train_id;
    public $recording_date;
    public $entered_1;
    public $entered_2;
    public $entered_3;
    public $entered_4;
    public $entered_5;
    public $entered_6;
    public $exited_1;
    public $exited_2;
    public $exited_3;
    public $exited_4;
    public $exited_5;
    public $exited_6;
    public $entered_sum;
    public $exited_sum;
    public $arrival_hour;
    public $departure_hour;
    public $accuracy;
    public $type;
    public $comments;
    public $dbh;

    public function __construct(){

        $this->dbh = $this->connect();

    }

    public function logTime($data){

        if(!$this->checkConnection()){

            return;

        }

        $response = array();

        // Pobieranie danych i weryfikowanie ich poprawności

        $personal_id = $data['personal_id'];

        $total = $data['total'];

        if(array_key_exists('job', $data)){

            $job = $data['job'];

        }

        if(!is_int($total) || (isset($job) && !is_int($job))){

            echo json_encode(false);

            return;

        }

        if(array_key_exists('job_number', $data)){

            $job_number = $data['job_number'];

        }

        if(array_key_exists('train_id', $data)){

            $train_id = $data['train_id'];

        }

        if(array_key_exists('station_id', $data)){

            $station_id = $data['station_id'];

        }

        // Sprawdzanie całkowitego czasu dla danego użytkownika

        $params['personal_id'] = $personal_id;

        $stmt_total_time = $this->dbh->prepare("SELECT `total_work_time` FROM users WHERE personal_id = :personal_id");

        $stmt_total_time->execute($params);

        $prev_total_time_raw = $stmt_total_time->fetchAll(PDO::FETCH_ASSOC);

        $stmt_total_time->closeCursor();

        $prev_total_time = $prev_total_time_raw[0]['total_work_time'];

        if(!$prev_total_time){

            $prev_total_time = 0;

        }

        // Zwracanie błędu jeśli nowy czas jest większy o ponad 15 minut(za duży przeskok) 

        $total_time_check = $prev_total_time + 930;

        if($total > $total_time_check){

            echo json_encode(false);

            return;

        }

        // Aktualizacja całkowitego czasu pracy

        if($prev_total_time <= $total){

            $total_time_hours = $this->secondsToTime($total);

            $params['total_work_time'] = $total;

            $params['total_work_hours'] = $total_time_hours;

            $stmt_total_time_update = $this->dbh->prepare("UPDATE users SET `total_work_time` = :total_work_time, `total_work_hours` = :total_work_hours WHERE personal_id = :personal_id");

            if(!$stmt_total_time_update->execute($params)){

                echo json_encode(false);

                return;

            }

            $stmt_total_time_update->closeCursor();

        } else {

            $response['total'] = $prev_total_time;

        }

        // Jeśli jest przesłany czas pracy w zadaniu

        if(isset($job) && isset($job_number)){

            $params['job_number'] = $job_number;

            $stmt_job_time = $this->dbh->prepare("SELECT `work_time` FROM jobs WHERE job_number = :job_number");

            $stmt_job_time->execute(['job_number' => $params['job_number']]);

            $prev_job_time_raw = $stmt_job_time->fetchAll(PDO::FETCH_ASSOC);

            $stmt_job_time->closeCursor();

            $prev_job_time = $prev_job_time_raw[0]['work_time'];

            if(!$prev_job_time){

                $prev_job_time = 0;
                
            }

            // Zwracanie błędu jeśli nowy czas jest większy o ponad 15 minut(za duży przeskok) 

            $job_time_check = $prev_job_time + 920;

            if($job > $job_time_check){

                echo json_encode(false);

                return;

            }

            // Aktualizacja czasu pracy w zadaniu

            if($prev_job_time <= $job){

                $job_time_hours = $this->secondsToTime($job);

                $params['work_time'] = $job;

                $params['work_hours'] = $job_time_hours;

                $stmt_job_time_update = $this->dbh->prepare("UPDATE jobs SET `work_time` = :work_time, `work_hours` = :work_hours WHERE job_number = :job_number");
                
                if(!$stmt_job_time_update->execute(['work_time' => $params['work_time'], 'work_hours' => $params['work_hours'], 'job_number' => $params['job_number']])){

                    echo json_encode(false);

                    return;
    
                }

                $stmt_job_time_update->closeCursor();

            } else {

                $response['job'] = $prev_job_time;

            }

        }

        // Aktualizowanie tabeli logowania czasu pracy

        if(!array_key_exists('job', $response) && !array_key_exists('total', $response)){

            $params = array(
                'personal_id' => $personal_id,
                'job_number' => isset($job_number) ? $job_number : null,
                'train_id' => isset($train_id) ? $train_id : null,
                'station_id' => isset($station_id) ? $station_id : null,
                'job_work_time' => isset($job) ? $job : null,
                'job_work_hours' => isset($job_time_hours) ? $job_time_hours : null,
                'total_work_time' => $total,
                'total_work_hours' => $total_time_hours,
            );
    
            $stmt_worktime_log = $this->dbh->prepare("INSERT INTO worktime_log (`personal_id`, `job_number`, `train_id`, `station_id`, `job_work_time`, `job_work_hours`, `total_work_time`, `total_work_hours`) VALUES(:personal_id, :job_number, :train_id, :station_id, :job_work_time, :job_work_hours, :total_work_time, :total_work_hours)");
    
            if(!$stmt_worktime_log->execute($params)){
    
                echo json_encode(false);
    
                return;
    
            }
    
            $stmt_worktime_log->closeCursor();

        }

        // Przesyłanie odpowiedzi

        if(!empty($response)){

            echo json_encode($response);

        } else {

            echo json_encode(true);

        }

    }

    public function secondsToTime($seconds){

        $hours = floor($seconds / 3600);

        $minutes = floor(($seconds % 3600) / 60);

        $seconds = $seconds % 60;

        $timeString = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        
        return $timeString;

    }

    public function putMeasurements($data){

        if(!$this->checkConnection()){

            return;

        }

        $this->personal_id = $data['personal_id'];

        $this->job_number = $data['job_number'];

        $this->recording_date = $data['recording_date'];

        $this->train_id = $data['train_id'];

        $this->station_id = $data['station_id'];

        $measurements = json_decode($data['measurements'], true);

        if(!empty($measurements)){

            if(array_key_exists('entered_exited', $measurements)){

                $entered_exited = $measurements['entered_exited'];

                if(array_key_exists('entered_1', $entered_exited)){

                    $this->entered_1 = $entered_exited['entered_1'];

                }

                if(array_key_exists('entered_2', $entered_exited)){

                    $this->entered_2 = $entered_exited['entered_2'];

                }

                if(array_key_exists('entered_3', $entered_exited)){

                    $this->entered_3 = $entered_exited['entered_3'];

                }

                if(array_key_exists('entered_4', $entered_exited)){

                    $this->entered_4 = $entered_exited['entered_4'];

                }

                if(array_key_exists('entered_5', $entered_exited)){

                    $this->entered_5 = $entered_exited['entered_5'];

                }

                if(array_key_exists('entered_6', $entered_exited)){

                    $this->entered_6 = $entered_exited['entered_6'];

                }

                if(array_key_exists('exited_1', $entered_exited)){

                    $this->exited_1 = $entered_exited['exited_1'];

                }

                if(array_key_exists('exited_2', $entered_exited)){

                    $this->exited_2 = $entered_exited['exited_2'];

                }

                if(array_key_exists('exited_3', $entered_exited)){

                    $this->exited_3 = $entered_exited['exited_3'];

                }

                if(array_key_exists('exited_4', $entered_exited)){

                    $this->exited_4 = $entered_exited['exited_4'];

                }

                if(array_key_exists('exited_5', $entered_exited)){

                    $this->exited_5 = $entered_exited['exited_5'];

                }

                if(array_key_exists('exited_6', $entered_exited)){

                    $this->exited_6 = $entered_exited['exited_6'];

                }

            }

            if(array_key_exists('entered_sum', $measurements)){

                $this->entered_sum = $measurements['entered_sum'];

            }

            if(array_key_exists('exited_sum', $measurements)){

                $this->exited_sum = $measurements['exited_sum'];

            }

            if(array_key_exists('times', $measurements)){

                $times = $measurements['times'];

                if(array_key_exists('arrival', $times)){

                    $this->arrival_hour = !empty($times['arrival']) ? $times['arrival'] : null;

                }

                if(array_key_exists('departure', $times)){

                    $this->departure_hour = !empty($times['departure']) ? $times['departure'] : null;

                }

            }

            if(array_key_exists('accuracy', $measurements)){

                $this->accuracy = $measurements['accuracy'];

            }

            if(array_key_exists('comment', $measurements)){

                $this->comments = $measurements['comment'];

            }

        }

        $personal_id = $this->personal_id;

        $job_number = $this->job_number;

        $train_id = $this->train_id;

        $station_id = $this->station_id;

        $recording_date = $this->recording_date;

        // Wpisywanie opóźnienia

        if(!empty($this->departure_time)){

            $departure_time = $this->departure_time;

            $stmt_train_check = $this->dbh->prepare("SELECT * FROM trains WHERE train_id = :train_id AND station_id = :station_id");
        
            $stmt_train_check->execute(['train_id' => $train_id, 'station_id' => $station_id]);

            $train_check = $stmt_train_check->fetchAll(PDO::FETCH_ASSOC);

            $stmt_train_check->closeCursor();

            $departure_hour = $train_check[0]['departure_hour'];

            $departure_time = $departure_time . ':00';

            $datetime1 = new DateTime($departure_hour);

            $datetime2 = new DateTime($departure_time);

            if( (str_starts_with($departure_hour, "22") || str_starts_with($departure_hour, "23")) && str_starts_with($departure_time, "00") ){

                $datetime1->modify('-1 day');

            }

            $secondsDiff = $datetime2->getTimestamp() - $datetime1->getTimestamp();

            $minutes = $secondsDiff / 60;

            if($minutes > 10){

                $params = ['recording_date' => $recording_date, 'station_id' => $station_id, 'train_id' => $train_id, 'delay' => $minutes, 'delay_update' => $minutes];

                $stmt_delay = $this->dbh->prepare("INSERT INTO delays (`recording_date`, `station_id`, `train_id`, `delay`) VALUES (:recording_date, :station_id, :train_id, :delay) ON DUPLICATE KEY UPDATE delay = :delay_update");

                $stmt_delay->execute($params);

                $stmt_delay->closeCursor();

                /*

                $stmt_delay_check = $this->dbh->prepare("SELECT * FROM delays WHERE station_id = :station_id AND train_id = :train_id AND `recording_date` = :recording_date");
        
                $stmt_delay_check->execute($params);

                $delay_check = $stmt_delay_check->fetchAll(PDO::FETCH_ASSOC);

                $stmt_delay_check->closeCursor();

                $params['delay'] = $minutes;

                if(!empty($delay_check)){

                    $stmt_delay_insert = $this->dbh->prepare("UPDATE delays SET `delay` = :delay WHERE station_id = :station_id AND train_id = :train_id AND `recording_date` = :recording_date");

                } else {

                    $stmt_delay_insert = $this->dbh->prepare("INSERT INTO delays(`recording_date`, `station_id`, `train_id`, `delay`) VALUES(:recording_date, :station_id, :train_id, :delay)");

                }

                $stmt_delay_insert->execute($params);

                $stmt_delay_insert->closeCursor();

                */

            } else {

                $stmt_delay_remove = $this->dbh->prepare("DELETE FROM delays WHERE station_id = :station_id AND train_id = :train_id AND `recording_date` = :recording_date");

                $stmt_delay_remove->execute(['recording_date' => $recording_date, 'station_id' => $station_id, 'train_id' => $train_id]);

                $stmt_delay_remove->closeCursor();

            }

        } else {

            $stmt_delay_remove = $this->dbh->prepare("DELETE FROM delays WHERE station_id = :station_id AND train_id = :train_id AND `recording_date` = :recording_date");

            $stmt_delay_remove->execute(['recording_date' => $recording_date, 'station_id' => $station_id, 'train_id' => $train_id]);

            $stmt_delay_remove->closeCursor();

        }

        // Sprawdzenie czy pomiar jest pierwszy czy kolejny

        $stmt_type_check = $this->dbh->prepare("SELECT * FROM measurements WHERE personal_id = :personal_id AND job_number = :job_number AND train_id = :train_id AND station_id = :station_id");
        
        $stmt_type_check->execute(['personal_id' => $personal_id, 'job_number' => $job_number, 'train_id' => $train_id, 'station_id' => $station_id]);

        $type_check = $stmt_type_check->fetchAll(PDO::FETCH_ASSOC);

        $stmt_type_check->closeCursor();

        if(!empty($type_check)){

            $this->type = 'poprawka';

        } else {

            $this->type = 'pomiar';

        }

        $object = get_object_vars($this);

        unset($object['dbh']);

        $put = $this->insertRecord($object);

        if($put === true){

            if($this->type === 'pomiar'){

                $stmt_train_count_check = $this->dbh->prepare("SELECT `stages`, `completed_stages` FROM jobs WHERE personal_id = :personal_id AND job_number = :job_number");
        
                $stmt_train_count_check->execute(['personal_id' => $personal_id, 'job_number' => $job_number]);

                $train_count_check = $stmt_train_count_check->fetchAll(PDO::FETCH_ASSOC);

                $stmt_train_count_check->closeCursor();

                $train_count = $train_count_check[0]['completed_stages'];

                $stages = $train_count_check[0]['stages'];

                if(empty($train_count)){

                    $completed_stages = 1;

                } else {

                    $completed_stages = $train_count + 1;

                }

                if($completed_stages === $stages){

                    $stmt_completed_stages_update = $this->dbh->prepare("UPDATE jobs SET `completed_stages` = :completed_stages, `status` = 'zakończony' WHERE personal_id = :personal_id AND job_number = :job_number");

                } else if($completed_stages === 1){

                    $stmt_completed_stages_update = $this->dbh->prepare("UPDATE jobs SET `completed_stages` = :completed_stages, `status` = 'rozpoczęty' WHERE personal_id = :personal_id AND job_number = :job_number");

                } else {

                    $stmt_completed_stages_update = $this->dbh->prepare("UPDATE jobs SET `completed_stages` = :completed_stages WHERE personal_id = :personal_id AND job_number = :job_number");

                }

                $stmt_completed_stages_update->execute(['completed_stages' => $completed_stages, 'personal_id' => $personal_id, 'job_number' => $job_number]);

                $stmt_completed_stages_update->closeCursor();

            }

            // Wgrywanie zdjęcia

            if(!empty($_FILES)){

                // Sprawdzanie numeru PKP

                $stmt_train_number = $this->dbh->prepare("SELECT `train_number` FROM train_numbers WHERE train_id = :train_id");

                $stmt_train_number->execute(['train_id' => $train_id]);

                $result_train_number = $stmt_train_number->fetchAll(PDO::FETCH_ASSOC);

                $train_number = $result_train_number[0]['train_number'];

                $stmt_train_number->closeCursor();

                // Sprawdzanie nazwy stacji

                $stmt_station_name = $this->dbh->prepare("SELECT `name` FROM stations WHERE station_id = :station_id");

                $stmt_station_name->execute(['station_id' => $station_id]);

                $result_station_name = $stmt_station_name->fetchAll(PDO::FETCH_ASSOC);

                $station_name = $result_station_name[0]['name'];

                $stmt_station_name->closeCursor();

                // Upload zdjęć

                //$directory = '../../photos/trains/'; PRZYWRÓCIĆ

                $directory = 'uploads/';

                if(!is_dir($directory)){
                    mkdir($directory);
                }

                $filenames = array();

                foreach($_FILES as $file){

                    $type_raw = $file['type'];

                    $type_exp = explode("/", $type_raw);
            
                    $type = $type_exp[1];

                    $filename = "pociag-".$train_number."-stacja-".$station_name."-obieg-".$job_number."-ankieter-".$personal_id."-".uniqid().".".$type;

                    $fullpath = $directory."/".$filename;

                    if(move_uploaded_file($file['tmp_name'], $fullpath)){

                        $filenames[] = $filename;

                    };

                }

                if(!empty($filenames)){

                    /*

                    

                    $sql = "INSERT INTO photos (personal_id, job_number, recording_date, station_id, train_id, `filename`) VALUES ";

                    foreach($filenames as $filename){
                        $sql .= '("' . $personal_id . '","' . $job_number . '","' . $recording_date . '","' . $station_id . '","' . $train_id . '","' . $filename . '"),';
                    }

                    $sql = rtrim($sql, ",");

                    $stmt_insert = $this->dbh->prepare($sql);

                    */

                    $sql = "INSERT INTO photos (personal_id, job_number, recording_date, station_id, train_id, filename) VALUES ";

                    $params = [];

                    $values = [];

                    foreach ($filenames as $index => $filename){

                        $values[] = "(:personal_id_$index, :job_number_$index, :recording_date_$index, :station_id_$index, :train_id_$index, :filename_$index)";
                        
                        $params["personal_id_$index"] = $personal_id;

                        $params["job_number_$index"] = $job_number;

                        $params["recording_date_$index"] = $recording_date;

                        $params["station_id_$index"] = $station_id;

                        $params["train_id_$index"] = $train_id;

                        $params["filename_$index"] = $filename;

                    }

                    $sql .= implode(", ", $values);

                    $stmt_insert = $this->dbh->prepare($sql);

                    if($stmt_insert->execute($params)){

                        $response = ['filenames' => $filenames];

                        echo json_encode($response);

                    } else {

                        echo json_encode(false);

                    }

                    $stmt_insert->closeCursor();

                } else {

                    echo json_encode(false);

                }

            // Jeśli nie ma zdjęć

            } else {

                $response = ['success' => true];

                echo json_encode($response);

            }

        } else {

            echo json_encode(false);

        }

    }

    public function getMeasurements($data){

        if(!$this->checkConnection()){

            return;

        }

        $personal_id = $data['personal_id'];

        $job_number = $data['job_number'];

        $recording_date = $data['recording_date'];

        $params = array(
            'personal_id' => $personal_id,
            'job_number' => $job_number
        );

        if(!empty($data['station_id'])){

            $station_id = $data['station_id'];

            $train_ids = $data['data'];

            $params['station_id'] = $station_id;

        }

        if(!empty($data['train_id'])){

            $train_id = $data['train_id'];

            $station_ids = $data['data'];

            $params['train_id'] = $train_id;

        }

        if(isset($train_ids)){

            //$train_ids = implode("','", $train_ids);

            $placeholders = implode(',', array_fill(0, count($train_ids), '?'));

            //$stmt_measurements = $this->dbh->prepare("SELECT * FROM `measurements` WHERE personal_id = :personal_id AND job_number = :job_number AND station_id = :station_id AND train_id IN ('$train_ids')");

            $stmt_measurements = $this->dbh->prepare("SELECT * FROM `measurements` WHERE personal_id = ? AND job_number = ? AND station_id = ? AND train_id IN ($placeholders)");

            $stmt_measurements->execute(array_merge(array_values($params), $train_ids));

            $measurements = $stmt_measurements->fetchAll(PDO::FETCH_ASSOC);

            $stmt_measurements->closeCursor();

            //$recording_date_param = array('recording_date' => $recording_date);

            $stmt_photos = $this->dbh->prepare("SELECT * FROM `photos` WHERE recording_date = ? AND train_id IN ($placeholders)");

            $stmt_photos->execute(array_merge([$recording_date], $train_ids));

            $photos = $stmt_photos->fetchAll(PDO::FETCH_ASSOC);

            $stmt_photos->closeCursor();

        }

        if(isset($station_ids)){

            //$station_ids = implode("','", $station_ids);

            $placeholders = implode(',', array_fill(0, count($station_ids), '?'));

            $stmt_measurements = $this->dbh->prepare("SELECT * FROM `measurements` WHERE personal_id = ? AND job_number = ? AND train_id = ? AND station_id IN ($placeholders)");

            $stmt_measurements->execute(array_merge(array_values($params), $station_ids));

            $measurements = $stmt_measurements->fetchAll(PDO::FETCH_ASSOC);

            $stmt_measurements->closeCursor();

            $stmt_photos = $this->dbh->prepare("SELECT * FROM `photos` WHERE recording_date = :recording_date AND train_id = :train_id");

            $stmt_photos->execute(['recording_date' => $recording_date, 'train_id' => $train_id]);

            $photos = $stmt_photos->fetchAll(PDO::FETCH_ASSOC);

            $stmt_photos->closeCursor();

        }

        $response = array();

        $response['measurements'] = $measurements;

        $response['photos'] = $photos;
        
        echo json_encode($response);

    }

    public function reportTime($data){

        if(!$this->checkConnection()){

            return;

        }

        $personal_id = $data['personal_id'];

        $job_number = $data['job_number'];

        if($data['hours'] !== '' && is_numeric($data['hours'])){
            $hours = (int) $data['hours'];
        } else {
            $hours = 0;
        }

        if($data['minutes'] !== '' && is_numeric($data['minutes'])){
            $minutes = (int) $data['minutes'];
        } else {
            $minutes = 0;
        }

        $reported_work_time = $hours * 3600 + $minutes * 60;

        $reported_work_hours = $this->secondsToTime($reported_work_time);

        $params = array(
            'personal_id' => $personal_id,
            'job_number' => $job_number,
            'reported_work_time' => $reported_work_time,
            'reported_work_hours' => $reported_work_hours
        );

        $stmt_time_update = $this->dbh->prepare("UPDATE jobs SET `reported_work_time` = :reported_work_time, `reported_work_hours` = :reported_work_hours WHERE personal_id = :personal_id AND job_number = :job_number");

        $stmt_time_update->execute($params);

        if($stmt_time_update->rowCount() === 1){

            $response['reported_time'] = $reported_work_hours;

            echo json_encode($response);

        } else {

            echo json_encode(false);

        }

        $stmt_time_update->closeCursor();

    }

    public function insertRecord($object){

        if(!$this->checkConnection()){

            return false;

        }

        $obj_properties = array_keys($object);

        $names = implode(",", $obj_properties);

        $values = implode(",:", $obj_properties);

        $stmt = $this->dbh->prepare("INSERT INTO `measurements` ($names) VALUES (:$values)");

        if($stmt->execute($object)){

            $stmt->closeCursor();

            return true;

        } else {

            $stmt->closeCursor();

            return false;

        }

    }

}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){

    $data = json_decode(file_get_contents("php://input"), true);

    if(!$data){

        $data = $_POST;

    }

    //var_dump($data);

    if($data === null && json_last_error() !== JSON_ERROR_NONE){

        http_response_code(400);

        echo json_encode(['error' => 'Invalid JSON']);

        return;
        
    }

    $request_type = $data['request_type'];

    switch ($request_type) {

        case "update time":

            $measurements = new Measurements;

            $measurements->logTime($data);

            break;

        case "get data":

            $measurements = new Measurements;

            $measurements->getMeasurements($data);

            break;

        case "put measurements":

            $measurements = new Measurements;

            $measurements->putMeasurements($data);

            break;

        case "report time":

            $measurements = new Measurements;

            $measurements->reportTime($data);

            break;

    }
    
}