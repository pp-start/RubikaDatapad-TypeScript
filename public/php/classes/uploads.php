<?php

include 'connection.php';

class Uploads {

    use Connection;

    public $dbh;

    public function __construct(){

        $this->dbh = $this->connect();

    }

    public function checkConnection(){

        if(($this->dbh instanceof PDO)){

            return true;

        } else {

            echo json_encode(false);

            return false;

        }

    }

    public function uploadFilesToVolume(){

        if(!$this->checkConnection()){

            return;

        }

        $personal_id = $_POST['personal_id'];

        $job_number = (int)$_POST['job_number'];

        $train_id = $_POST['train_id'];

        $station_id = $_POST['station_id'];

        $recording_date = $_POST['recording_date'];

        // Sprawdzanie numeru PKP

        $train_id_param = array('train_id' => $train_id);

        $stmt_train_number = $this->dbh->prepare("SELECT `train_number` FROM train_numbers WHERE train_id = :train_id");

        $stmt_train_number->execute($train_id_param);

        $result_train_number = $stmt_train_number->fetchAll(PDO::FETCH_ASSOC);

        $train_number = $result_train_number[0]['train_number'];

        $stmt_train_number->closeCursor();

        // Sprawdzanie nazwy stacji

        $station_id_param = array('station_id' => $station_id);

        $stmt_station_name = $this->dbh->prepare("SELECT `name` FROM stations WHERE station_id = :station_id");

        $stmt_station_name->execute($station_id_param);

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

            $sql = "INSERT INTO photos (personal_id, job_number, recording_date, station_id, train_id, `filename`) VALUES ";

            foreach($filenames as $filename){
                $sql .= '("' . $personal_id . '","' . $job_number . '","' . $recording_date . '","' . $station_id . '","' . $train_id . '","' . $filename . '"),';
            }

            $sql = rtrim($sql, ",");

            $stmt_insert = $this->dbh->prepare($sql);

            if($stmt_insert->execute()){

                echo json_encode($filenames);

                $stmt_insert->closeCursor();

            } else {

                echo json_encode(false);

                $stmt_insert->closeCursor();

            }

        } else {

            echo json_encode(false);

        }

    }

}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){

    $uploads = new Uploads;
    $uploadFiles = $uploads->uploadFilesToVolume();
    
}