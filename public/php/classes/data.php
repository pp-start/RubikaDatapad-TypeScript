<?php

include 'connection.php';

class Data {

    use Connection;

    public function __construct(){

        $this->dbh = $this->connect();

    }

    public function getData($personal_id, $admin){

        if(!$this->checkConnection()){

            return;

        }

        $personal_id_param = array('personal_id' => $personal_id);

        // Pobieranie listy zadań przyporządkowanych do ankietera

        if(!empty($admin)){

            $stmt_jobs = $this->dbh->prepare("SELECT * FROM `jobs` WHERE personal_id = :personal_id");

        } else {

            $stmt_jobs = $this->dbh->prepare("SELECT * FROM `jobs` WHERE personal_id = :personal_id AND `status` IN ('wydany', 'rozpoczęty', 'zakończony')");

        }

        $stmt_jobs->execute($personal_id_param);

        $jobs = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

        $stmt_jobs->closeCursor();

        // Jeśli są znalezione zadania

        if(!empty($jobs)){

            $response_jobs = array();

            // Pobieranie listy pociągów

            $trains = $this->getDataFromTable('trains');

            $grouped_trains = $this->groupTrains($trains);

            // Pobieranie listy stacji

            $stations = $this->getDataFromTable('stations');

            // Pobieranie numerów pociągów

            $train_numbers = $this->getDataFromTable('train_numbers');
    
            foreach($jobs as $job){

                $data_array = array();

                // Jeśli jest podana badana stacja
    
                if(!empty($job['station_id'])){

                    $station_id = $job['station_id'];

                    $start_hour = $job['start_hour'];

                    $end_hour = $job['end_hour'];

                    // Gdy jest podany zakres godzinowy

                    if(!empty($start_hour) && !empty($end_hour)){

                        $train_list = array_values($this->filterTrains($grouped_trains, $station_id, $start_hour, $end_hour));

                    // Gdy nie ma podanego zakresu godzin

                    } else {

                        $train_array = $job['train_list'];

                        $decoded_array = json_decode($train_array, true);

                        $train_list_associative = array_intersect_key($grouped_trains, array_flip($decoded_array));

                        $train_list = array_values($train_list_associative);

                    }

                    // Pobieranie nazwy stacji

                    $station_name = $this->findStationName($stations, $station_id);

                    $job['station_name'] = $station_name;

                    // Umieszczanie danych

                    $data_array['job'] = $job;

                    $data_array['trains'] = $train_list;

                    $response_jobs[] = $data_array;

                // Gdy nie ma podanej stacji - badany jest pociąg

                } else {

                    $train_id = $job['train_id'];

                    $stmt_train_job = $this->dbh->prepare("SELECT * FROM trains WHERE train_id = :train_id");

                    $stmt_train_job->execute(['train_id' => $train_id]);

                    $train_list = $stmt_train_job->fetchAll(PDO::FETCH_ASSOC);

                    $stmt_train_job->closeCursor();
                    
                    $data_array['job'] = $job;

                    $data_array['trains'] = $train_list;

                    $response_jobs[] = $data_array;

                }
    
            }

            $recordings = $this->getDataFromTable('recordings');

            $delays = $this->getDataFromTable('delays');

            $cameras = $this->getDataFromTable('cameras');

            $ftp = $this->getDataFromTable('ftp');

        }

        $response = array();

        $response['jobs_trains'] = !empty($response_jobs) ? $response_jobs : [];

        if(!empty($admin)){

            $response['trains'] = !empty($grouped_trains) ? $grouped_trains : [];

        } 

        $response['train_numbers'] = !empty($train_numbers) ? $train_numbers : [];

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        $response['delays'] = !empty($delays) ? $delays : [];

        $response['cameras'] = !empty($cameras) ? $cameras : [];

        $response['ftp'] = !empty($ftp) ? $ftp : [];

        echo json_encode($response);
        
    }

    public function getUserViewData(){

        if(!$this->checkConnection()){

            return;

        }

        $jobs = $this->getDataFromTable('jobs');

        $trains = $this->getDataFromTable('trains');

        $train_numbers = $this->getDataFromTable('train_numbers');

        $stations = $this->getDataFromTable('stations');

        $recordings = $this->getDataFromTable('recordings');

        $delays = $this->getDataFromTable('delays');

        $ftp = $this->getDataFromTable('ftp');

        $cameras = $this->getDataFromTable('cameras');

        $response = array();

        $response['jobs'] = !empty($jobs) ? $jobs : [];

        $response['trains'] = !empty($trains) ? array_values($this->groupTrains($trains)) : [];

        $response['train_numbers'] = !empty($train_numbers) ? $train_numbers : [];

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        $response['delays'] = !empty($delays) ? $delays : [];

        $response['ftp'] = !empty($ftp) ? $ftp : [];

        $response['cameras'] = !empty($cameras) ? $cameras : [];

        echo json_encode($response);

    }

    public function getAdminData(){

        if(!$this->checkConnection()){

            return;

        }

        $trains = $this->getDataFromTable('trains');

        $train_numbers = $this->getDataFromTable('train_numbers');

        $stations = $this->getDataFromTable('stations');

        $recordings = $this->getDataFromTable('recordings');

        $jobs = $this->getDataFromTable('jobs');

        $measurements = $this->getDataFromTable('measurements');

        $users = $this->getUserDataFromTable();

        $response = array();

        $response['trains'] = !empty($trains) ? array_values($this->groupTrains($trains)) : [];

        $response['train_numbers'] = !empty($train_numbers) ? $train_numbers : [];

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        $response['jobs'] = !empty($jobs) ? $jobs : [];

        $response['measurements'] = !empty($measurements) ? $measurements : [];

        $response['users'] = !empty($users) ? $users : [];

        echo json_encode($response);

    }

    public function getProgressData(){

        if(!$this->checkConnection()){

            return;

        }

        $stations = $this->getDataFromTable('stations');

        $recordings = $this->getDataFromTable('recordings');

        $jobs = $this->getDataFromTable('jobs');

        $users = $this->getUserDataFromTable();

        $response = array();

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        $response['jobs'] = !empty($jobs) ? $jobs : [];

        $response['users'] = !empty($users) ? $users : [];

        echo json_encode($response);

    }

    public function getUserJobsData(){

        if(!$this->checkConnection()){

            return;

        }

        $jobs = $this->getDataFromTable('jobs');

        $stmt_users = $this->dbh->prepare("SELECT * FROM `users` WHERE `role` = 'user' AND `status` = 'active'");

        $stmt_users->execute();

        $users = $stmt_users->fetchAll(PDO::FETCH_ASSOC);

        $stmt_users->closeCursor();

        foreach($users as &$user){

            unset($user['password']);

        }

        $response = array();

        $response['jobs'] = !empty($jobs) ? $jobs : [];

        $response['users'] = !empty($users) ? $users : [];

        echo json_encode($response);

    }

    public function getJobsData(){

        if(!$this->checkConnection()){

            return;

        }

        $jobs = $this->getDataFromTable('jobs');

        $measurements = $this->getDataFromTable('measurements');

        $users = $this->getUserDataFromTable();

        $response = array();

        $response['jobs'] = !empty($jobs) ? $jobs : [];

        $response['measurements'] = !empty($measurements) ? $measurements : [];

        $response['users'] = !empty($users) ? $users : [];

        echo json_encode($response);

    }

    // Niepotrzebne ???

    /*

    public function getTrainsData(){

        if(!$this->checkConnection()){

            return;

        }

        $trains = $this->getDataFromTable('trains');

        $stations = $this->getDataFromTable('stations');

        $train_numbers = $this->getDataFromTable('train_numbers');

        $stmt_recordings = $this->dbh->prepare("SELECT DISTINCT `station_id` FROM `recordings`");

        $stmt_recordings->execute();

        $recordings = $stmt_recordings->fetchAll(PDO::FETCH_ASSOC);

        $stmt_recordings->closeCursor();

        $response = array();

        $response['trains'] = !empty($trains) ? array_values($this->groupTrains($trains)) : [];

        $response['train_numbers'] = !empty($train_numbers) ? $train_numbers : [];

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        echo json_encode($response);

    }

    */

    public function getUsersWithJobsData(){

        if(!$this->checkConnection()){

            return;

        }

        $stmt_users_with_jobs = $this->dbh->prepare("SELECT DISTINCT personal_id FROM `jobs`");

        $stmt_users_with_jobs->execute();

        $users_with_jobs = $stmt_users_with_jobs->fetchAll(PDO::FETCH_ASSOC);

        $stmt_users_with_jobs->closeCursor();

        $users_data = $this->getUserDataFromTable();

        foreach($users_with_jobs as $key => $user){

            $personal_id = $user['personal_id'];

            $user_full_name = $this->getUserName($users_data, $personal_id);

            $user_surname = $this->getSurname($users_data, $personal_id);

            $users_with_jobs[$key]['full_name'] = $user_full_name;

            $users_with_jobs[$key]['surname'] = $user_surname;

        }

        $response = array();

        $response['users_with_jobs'] = $users_with_jobs;

        echo json_encode($response);

    }

    public function getMeasurementsData($data){

        if(!$this->checkConnection()){

            return;

        }

        $station_id = $data['station_id'];

        $recording_date = $data['recording_date'];

        $unique_trains = $data['unique_trains'];

        $placeholders = implode(',', array_fill(0, count($unique_trains), '?'));

        $stmt = $this->dbh->prepare("SELECT * FROM `measurements` WHERE station_id = ? AND recording_date = ? AND train_id IN ($placeholders)");

        $params = array_merge([$station_id, $recording_date], $unique_trains);

        $stmt->execute($params);

        $measurements = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt->closeCursor();

        $response = array();

        $response['measurements'] = $measurements;

        echo json_encode($response);
        
    }

    public function getTrainListData(){

        if(!$this->checkConnection()){

            return;

        }

        $trains = $this->getDataFromTable('trains');

        $stations = $this->getDataFromTable('stations');

        $train_numbers = $this->getDataFromTable('train_numbers');

        $recordings = $this->getDataFromTable('recordings');

        $jobs = $this->getDataFromTable('jobs');

        $users = $this->getUserDataFromTable();

        $response = array();

        $response['trains'] = !empty($trains) ? array_values($this->groupTrains($trains)) : [];

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['train_numbers'] = !empty($train_numbers) ? $train_numbers : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        $response['jobs'] = !empty($jobs) ? $jobs : [];

        $response['users'] = !empty($users) ? $users : [];

        echo json_encode($response);
        
    }

    public function getTrainListDetailedData($data){

        if(!$this->checkConnection()){

            return;

        }

        $train_id = $data['train_id'];

        $stmt_delays = $this->dbh->prepare("SELECT * FROM `delays` WHERE train_id = :train_id");

        $stmt_delays->execute(['train_id' => $train_id]);

        $delays = $stmt_delays->fetchAll(PDO::FETCH_ASSOC);

        $stmt_delays->closeCursor();

        $stmt_measurements = $this->dbh->prepare("SELECT * FROM `measurements` WHERE train_id = :train_id ORDER BY job_number");

        $stmt_measurements->execute(['train_id' => $train_id]);

        $measurements = $stmt_measurements->fetchAll(PDO::FETCH_ASSOC);

        $stmt_measurements->closeCursor();

        if(!empty($measurements)){

            $measurements = $this->removeDuplicatesFromArray($measurements);

        }

        $response = array();

        $response['delays'] = !empty($delays) ? $delays : [];

        $response['measurements'] = !empty($measurements) ? $measurements : [];

        echo json_encode($response);
        
    }
    
    public function checkWorkTimeDetails(){

        if(!$this->checkConnection()){

            return;

        }

        // Pobieranie danych z bazy

        $stmt1 = $this->dbh->prepare("SELECT DISTINCT personal_id FROM `measurements`");

        $stmt1->execute();

        $users = $stmt1->fetchAll(PDO::FETCH_ASSOC);

        $stmt1->closeCursor();

        $measurements = $this->getDataFromTable('measurements');

        $measurements = $this->removeDuplicatesFromArray($measurements);

        $jobs = $this->getDataFromTable('jobs');

        $users = $this->getUserDataFromTable();

        //$directory = '../../downloads/'; - Przywrócić

        $directory = '../../../../downloads/';

        $file = fopen($directory.'zestawienie_zadan.csv', 'w');

        $columns = ['zadanie', 'użytkownik', 'czas aplikacji', 'czas zaraportowany', 'stan ukończenia', 'procent ukończenia', 'średnia na 1 pociąg', 'średnia na 1 osobę'];

        fputcsv($file, $columns);

        $summary = array();

        // Dla każdego użytkownika z pomiarami

        foreach($users as $user){

            $personal_id = $user['personal_id'];

            $user_full_name = $this->findUserFullName($users_list, $personal_id);

            $filtered = $this->filterMeasurementsByUser($measurements, $personal_id);

            $result = array();

            foreach($filtered as $row){

                $small = array();

                $job_number = $row["job_number"];

                if(!isset($result['zadanie_'.$job_number])){

                    $result['zadanie_'.$job_number] = [];

                }

                $small['job_number'] = $job_number;

                $small['entered'] = $row['entered_sum'];

                $small['exited'] = $row['exited_sum'];

                $result['zadanie_'.$job_number][] = $small;

            }

            foreach($result as $job){

                $job_number = $job[0]['job_number'];

                $job_data = $this->findJobData($jobs, $job_number);

                $total_entered = array_sum(
                    array_filter(array_column($job, 'entered'), function($value) {
                        return $value >= 0;
                    })
                );

                $total_exited = array_sum(
                    array_filter(array_column($job, 'exited'), function($value) {
                        return $value >= 0;
                    })
                );

                $total_persons = $total_entered + $total_exited;

                $job_status = $job_data['status'];

                $total_stages = $job_data['stages'];

                $completed_stages = $job_data['completed_stages'];
                
                if($job_status !== 'zakończony'){

                    $job_completion = ($completed_stages/$total_stages)*100 ."%";

                } else {

                    $job_completion = '100%';

                }

                $job_work_time = $job_data['work_time'];

                $job_work_hours = $job_data['work_hours'];

                $job_reported_time = $job_data['reported_work_time'];

                $job_reported_hours = $job_data['reported_work_hours'];

                $average_per_train = $job_work_time/$completed_stages;

                $average_per_person = $job_work_time/$total_persons;

                // Dodawanie danych do podsumowania

                $arr = array();

                if(!isset($summary[$personal_id])){

                    $summary[$personal_id] = [];

                }

                $previous = $summary[$personal_id];

                $arr['full_name'] = $user_full_name;

                if(array_key_exists('application_time', $previous)){

                    $arr['application_time'] = $previous['application_time'] + $job_work_time;

                } else {

                    $arr['application_time'] = $job_work_time;

                }

                if(array_key_exists('reported_time', $previous)){

                    $arr['reported_time'] = $previous['reported_time'] + ($job_reported_time ? $job_reported_time : 0);

                } else {

                    $arr['reported_time'] = $job_reported_time ? $job_reported_time : 0;

                }

                if(array_key_exists('completed_stages', $previous)){

                    $arr['completed_stages'] = $previous['completed_stages'] + $completed_stages;

                } else {

                    $arr['completed_stages'] = $completed_stages;

                }

                if(array_key_exists('total_persons', $previous)){

                    $arr['total_persons'] = $previous['total_persons'] + $total_persons;

                } else {

                    $arr['total_persons'] = $total_persons;

                }

                $summary[$personal_id] = $arr;

                fputcsv($file, [$job_number, $user_full_name, $job_work_hours, $job_reported_hours, $job_status, $job_completion, $this->secondsToTime($average_per_train), $this->secondsToTime($average_per_person)]);

            }

        }

        fclose($file);

        $file2 = fopen($directory.'podsumowanie.csv', 'w');

        $columns2 = ['użytkownik', 'czas aplikacji', 'czas zaraportowany', 'średnia na 1 pociąg', 'średnia na 1 osobę'];

        fputcsv($file2, $columns2);

        foreach($summary as $row){

            $user_full_name = $row['full_name'];

            $application_time = $row['application_time'];

            $reported_time = $row['reported_time'];

            $completed_stages = $row['completed_stages'];

            $total_persons = $row['total_persons'];

            $average_per_train = $application_time/$completed_stages;

            $average_per_person = $application_time/$total_persons;

            fputcsv($file2, [$user_full_name, $this->secondsToTime($application_time), $this->secondsToTime($reported_time), $this->secondsToTime($average_per_train), $this->secondsToTime($average_per_person)]);

        }

        fclose($file2);

        $zip = new ZipArchive();

        $zipFilePath = $directory.'wydajnosc_pracy.zip';

        if(file_exists($zipFilePath)){
            unlink($zipFilePath);
        }

        if($zip->open($zipFilePath, ZipArchive::CREATE) === TRUE){
                    
            $zip->addFile($directory.'zestawienie_zadan.csv', 'zestawienie_zadan.csv');

            $zip->addFile($directory.'podsumowanie.csv', 'podsumowanie.csv');

            $zip->close();

            unlink($directory.'zestawienie_zadan.csv');

            unlink($directory.'podsumowanie.csv');

            $response = array();

            $response['success'] = true;

            $response['filename'] = 'wydajnosc_pracy.zip';
            
        } else {

            $response = false;
            
        }

        echo json_encode($response);

    }

    public function generateQualityChecksReport(){

        if(!$this->checkConnection()){

            return;

        }

        $stmt_jobs = $this->dbh->prepare("SELECT * FROM jobs WHERE `type` = 'check'");

        $stmt_jobs->execute();

        $jobs = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

        $stmt_jobs->closeCursor();

        $total_count = count($jobs);

        $all_jobs = $this->getDataFromTable('jobs');

        foreach($jobs as $key => &$job){

            $current_recording_date = $job['recording_date'];

            $current_station_id = $job['station_id'];

            $current_train_list = $job['train_list'];

            $current_train_list_array = json_decode($current_train_list, true);

            $next = $key +1;

            if($next < $total_count){

                for($i = $next; $i < $total_count; $i++){

                    $next_recording_date = $jobs[$i]['recording_date'];

                    $next_station_id = $jobs[$i]['station_id'];

                    if($current_recording_date === $next_recording_date && $current_station_id === $next_station_id){

                        $next_train_list = $jobs[$i]['train_list'];

                        $next_train_list_array = json_decode($next_train_list, true);

                        $common_trains = array_intersect($current_train_list_array, $next_train_list_array);

                        if(!empty($common_trains)){

                            $filtered_trains = array_diff($current_train_list_array, $next_train_list_array);

                            $current_train_list_array = array_values($filtered_trains);

                        }

                    }

                }

                $job['train_list'] = json_encode($current_train_list_array);

            };

        }

        unset($job);

        $filtered_value = '[]';

        $key = 'train_list';

        $jobs = array_filter($jobs, function($item) use ($key, $filtered_value){

            return $item[$key] !== $filtered_value;

        });

        $jobs = array_values($jobs);

        $stations = $this->getDataFromTable('stations');

        $all_trains = $this->getDataFromTable('trains');

        $all_trains = array_values($this->groupTrains($all_trains));

        $train_numbers = $this->getDataFromTable('train_numbers');

        $trains = [];

        foreach($all_trains as $train){

            $arr = [];

            $train_id = $train[0]['train_id'];

            $train_number_data = $this->findTrainNumberData($train_numbers, $train_id);

            $train_number = $train_number_data['train_number'];

            $first_station_id = $train_number_data['first_station'];

            $last_station_id = $train_number_data['last_station'];

            $first_station_name = $this->findStationName($stations, $first_station_id);

            $last_station_name = $this->findStationName($stations, $last_station_id);

            $train_path = $first_station_name . " - " . $last_station_name;

            $arr['train_id'] = $train_id;

            $arr['train_number'] = $train_number;

            $arr['train_path'] = $train_path;

            $arr['stops'] = $train;

            $trains[] = $arr;

        }

        $users = $this->getUserDataFromTable();

        $output_array = array();

        foreach($jobs as $job){

            $recording_date = $job['recording_date'];

            $station_id = $job['station_id'];

            $station_name = $this->findStationName($stations, $station_id);

            $train_list = $job['train_list'];

            $train_ids = json_decode($train_list, true);

            $placeholders = implode(',', array_fill(0, count($train_ids), '?'));

            $params = [$station_id, $recording_date];

            $stmt_measurements = $this->dbh->prepare("SELECT * FROM `measurements` WHERE station_id = ? AND recording_date = ? AND train_id IN ($placeholders)");

            $stmt_measurements->execute(array_merge($params, $train_ids));

            $measurements = $stmt_measurements->fetchAll(PDO::FETCH_ASSOC);

            $stmt_measurements->closeCursor();

            $measurements = $this->removeDuplicatesFromArray($measurements);

            usort($measurements, function ($a, $b){

                return strcmp($a['train_id'], $b['train_id']);

            });

            foreach($measurements as $measurement){

                $job_number = $measurement['job_number'];

                $job_data = $this->findJobData($all_jobs, $job_number);

                $job_type_raw = $job_data['type'];

                if($job_type_raw === 'normal'){

                    $job_type = 'zwykłe';

                } else {

                    $job_type = 'kontrolne';

                }

                $personal_id = $measurement['personal_id'];

                $train_id = $measurement['train_id'];

                $train_data = $this->findTrainData($trains, $train_id);

                $train_number = $train_data['train_number'];

                $train_path = $train_data['train_path'];

                $train_stops = $train_data['stops'];

                foreach($train_stops as $train_stop){

                    $current_station_id = $train_stop['station_id'];

                    if($current_station_id === $station_id){

                        $scheduled_arrival = $train_stop['arrival_hour'];

                        $scheduled_departure = $train_stop['departure_hour'];

                        $scheduled_platform = $train_stop['platform_number'];

                        break;

                    }

                }

                $row = array();

                $full_name = $this->findUserFullName($users, $personal_id);

                $row['full_name'] = $full_name;

                $row['station_name'] = $station_name;

                $row['recording_date'] = $recording_date;

                $row['job_number'] = $job_number;

                $row['job_type'] = $job_type;

                $row['train_number'] = $train_number;

                $row['train_path'] = $train_path;

                $row['scheduled_arrival'] = !empty($scheduled_arrival) ? $scheduled_arrival : "-";

                $row['scheduled_departure'] = !empty($scheduled_departure) ? $scheduled_departure : "-";

                $row['scheduled_platform'] = !empty($scheduled_platform) ? $scheduled_platform : "b/d";

                $row['entered_sum'] = $measurement['entered_sum'];

                $row['exited_sum'] = $measurement['exited_sum'];

                $row['total_exchange'] = $measurement['entered_sum'] + $measurement['exited_sum'];

                $arrival_time = $measurement['arrival_time'];

                $row['arrival_time'] = $arrival_time;

                $departure_time = $measurement['departure_time'];

                $row['departure_time'] = $departure_time;

                $accuracy_raw = $measurement['accuracy'];

                switch($accuracy_raw){

                    case 1:
                        $accuracy = "<80%";
                        break;

                    case 2:
                        $accuracy = "80%";
                        break;

                    case 3:
                        $accuracy = "90%";
                        break;

                    case 4:
                        $accuracy = "95%";
                        break;

                    case 5:
                        $accuracy = "99%";
                        break;

                    default:
                        $accuracy = '?';

                }

                $row['accuracy'] = $accuracy;

                $row['comments'] = $measurement['comments'];

                $row['measurement_date'] = $measurement['measurement_date'];

                // Wyliczanie różnicy przyjazdu

                if(!empty($scheduled_arrival) && !empty($arrival_time)){

                    $arrival_time = $arrival_time . ':00';

                    $departure_difference = $this->calculateTimeDifference($scheduled_arrival, $arrival_time);

                } else {

                    $arrival_difference = '-';

                }

                // Wyliczenie różnicy odjazdu

                if(!empty($scheduled_departure) && !empty($departure_time)){

                    $departure_time = $departure_time . ':00';

                    $departure_difference = $this->calculateTimeDifference($scheduled_departure, $departure_time);

                } else {

                    $departure_difference = '-';

                }

                $row['arrival_difference'] = $arrival_difference;

                $row['departure_difference'] = $departure_difference;

                $output[] = $row;

            }

        }

        // Sortowanie danych przed umieszczeniem w pliku

        usort($output, function ($a, $b) {

            $dateComparison = strcmp($a['recording_date'], $b['recording_date']);
            
            if ($dateComparison === 0){

                $stationComparison = strcmp($a['station_name'], $b['station_name']);

                if ($stationComparison === 0) {

                    $trainComparison = strcmp($a['train_number'], $b['train_number']);

                    if ($trainComparison === 0) {

                        return $a['job_number'] <=> $b['job_number'];
    
                    }

                    return $trainComparison;

                }
                
                return $stationComparison;

            }
            
            return $dateComparison;

        });

        //$directory = '../../downloads/'; - Przywrócić

        $directory = '../../../../downloads/';

        $file = fopen($directory.'zestawienie_kontroli.csv', 'w');

        $columns = ['Stacja', 'Data', 'Numer pociągu', 'Relacja', 'Przyjazd', 'Odjazd', 'Peron', 'Pomiarowiec', 'Zadanie', 'Rodzaj zadania', 'Wsiadło', 'Wysiadło', 'Łączna wymiana', 'Rzecz. przyjazd', 'Rzecz. odjazd', 'Dokładność', 'Komentarz', 'Data pomiaru'];

        fputcsv($file, $columns);

        foreach($output as $row){

            fputcsv($file, [$row['station_name'], $row['recording_date'], $row['train_number'], $row['train_path'], $row['scheduled_arrival'], $row['scheduled_departure'], $row['scheduled_platform'], $row['full_name'], $row['job_number'], $row['job_type'], $row['entered_sum'], $row['exited_sum'], $row['total_exchange'], $row['arrival_difference'], $row['departure_difference'], $row['accuracy'], $row['comments'], $row['measurement_date']]);

        }

        fclose($file);

        $response = array();

        $response['success'] = true;

        $response['filename'] = 'zestawienie_kontroli.csv';

        echo json_encode($response);

    }

    public function generateStationReport($station_id, $recording_date){

        if(!$this->checkConnection()){

            return;

        }

        $stmt_jobs = $this->dbh->prepare("SELECT * FROM jobs WHERE station_id = :station_id AND recording_date = :recording_date");

        $stmt_jobs->execute(['station_id' => $station_id, 'recording_date' => $recording_date]);

        $jobs = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

        $stmt_jobs->closeCursor();

        $stmt_stations = $this->dbh->prepare("SELECT `name` FROM stations WHERE station_id = :station_id");

        $stmt_stations->execute(['station_id' => $station_id]);

        $station = $stmt_stations->fetchAll(PDO::FETCH_ASSOC);

        $stmt_stations->closeCursor();

        $station_name = $station[0]['name'];

        $stations = $this->getDataFromTable('stations');

        $stmt_measurements = $this->dbh->prepare("SELECT * FROM measurements WHERE station_id = :station_id AND recording_date = :recording_date");

        $stmt_measurements->execute(['station_id' => $station_id, 'recording_date' => $recording_date]);

        $measurements = $stmt_measurements->fetchAll(PDO::FETCH_ASSOC);

        $stmt_measurements->closeCursor();

        $measurements = $this->removeDuplicatesFromArray($measurements);

        $train_ids_raw = array_column($measurements, 'train_id');

        $train_ids = array_unique($train_ids_raw);

        $placeholders = implode(',', array_fill(0, count($train_ids), '?'));


        $stmt_trains = $this->dbh->prepare("SELECT * FROM `trains` WHERE train_id IN ($placeholders)");

        $stmt_trains->execute($train_ids);

        $trains = $stmt_trains->fetchAll(PDO::FETCH_ASSOC);

        $stmt_trains->closeCursor();

        $trains = array_values($this->groupTrains($trains));


        $stmt_train_numbers = $this->dbh->prepare("SELECT * FROM train_numbers WHERE train_id IN ($placeholders)");

        $stmt_train_numbers->execute($train_ids);

        $train_numbers = $stmt_train_numbers->fetchAll(PDO::FETCH_ASSOC);

        $stmt_train_numbers->closeCursor();


        $user_ids_raw = array_column($measurements, 'personal_id');

        $user_ids = array_unique($user_ids_raw);

        $placeholders = implode(',', array_fill(0, count($user_ids), '?'));

        $stmt_users = $this->dbh->prepare("SELECT * FROM users WHERE personal_id IN ($placeholders)");

        $stmt_users->execute($user_ids);

        $users = $stmt_users->fetchAll(PDO::FETCH_ASSOC);

        $stmt_users->closeCursor();


        $job_numbers_raw = array_column($measurements, 'job_number');

        $job_numbers = array_unique($job_numbers_raw);

        $placeholders = implode(',', array_fill(0, count($job_numbers), '?'));


        $stmt_jobs = $this->dbh->prepare("SELECT * FROM jobs WHERE job_number IN ($placeholders)");

        $stmt_jobs->execute($job_numbers);

        $jobs = $stmt_jobs->fetchAll(PDO::FETCH_ASSOC);

        $stmt_jobs->closeCursor();


        $all_trains_data = [];

        foreach($trains as $train){

            $output = [];

            $train_id = $train[0]['train_id'];

            $output['train_id'] = $train_id;

            $train_number_data = $this->findTrainNumberData($train_numbers, $train_id);

            $output['train_number'] = $train_number_data['train_number'];

            $first_station_id = $train_number_data['first_station'];

            $last_station_id = $train_number_data['last_station'];

            $first_station_name = $this->findStationName($stations, $first_station_id);

            $last_station_name = $this->findStationName($stations, $last_station_id);

            $output['path'] = $first_station_name . " - " . $last_station_name;

            foreach ($train as $stop){

                if($stop['station_id'] === $station_id){

                    $station_match = $stop;

                    break;

                }

            }

            $output['scheduled_arrival'] = $station_match['arrival_hour'];

            $output['scheduled_departure'] = $station_match['departure_hour'];

            $output['scheduled_platform'] = $station_match['platform_number'];

            $all_trains_data[] = $output;

        }

        

        $output = [];

        foreach($measurements as $measurement){

            $personal_id = $measurement['personal_id'];

            $full_name = $this->findUserFullName($users, $personal_id);

            $job_number = $measurement['job_number'];

            $job_data = $this->findJobData($jobs, $job_number);

            $job_type_raw = $job_data['type'];

            if($job_type_raw === 'normal'){

                $job_type = 'zwykłe';

            } else {

                $job_type = 'kontrolne';

            }

            $train_id = $measurement['train_id'];

            $train_data = $this->findTrainData($all_trains_data, $train_id);

            $row = array();

            $row['full_name'] = $full_name;

            $row['station_name'] = $station_name;

            $row['recording_date'] = $recording_date;

            $row['job_number'] = $job_number;

            $row['job_type'] = $job_type;

            $row['train_number'] = $train_data['train_number'];

            $row['train_path'] = $train_data['path'];

            $row['scheduled_arrival'] = !empty($train_data['scheduled_arrival']) ? $train_data['scheduled_arrival'] : "-";

            $row['scheduled_departure'] = !empty($train_data['scheduled_departure']) ? $train_data['scheduled_departure'] : "-";

            $row['scheduled_platform'] = !empty($train_data['scheduled_platform']) ? $train_data['scheduled_platform'] : "b/d";

            $row['entered_sum'] = $measurement['entered_sum'];

            $row['exited_sum'] = $measurement['exited_sum'];

            $row['total_exchange'] = $measurement['entered_sum'] + $measurement['exited_sum'];

            $arrival_time = $measurement['arrival_time'];

            $row['arrival_time'] = $arrival_time;

            $departure_time = $measurement['departure_time'];

            $row['departure_time'] = $departure_time;

            $accuracy_raw = $measurement['accuracy'];

            switch($accuracy_raw){

                case 1:
                    $accuracy = "<80%";
                    break;

                case 2:
                    $accuracy = "80%";
                    break;

                case 3:
                    $accuracy = "90%";
                    break;

                case 4:
                    $accuracy = "95%";
                    break;

                case 5:
                    $accuracy = "99%";
                    break;

                default:
                    $accuracy = '?';

            }

            $row['accuracy'] = $accuracy;

            $row['comments'] = $measurement['comments'];

            $row['measurement_date'] = $measurement['measurement_date'];

            // Wyliczanie różnicy przyjazdu

            if(!empty($scheduled_arrival) && !empty($arrival_time)){

                $arrival_time = $arrival_time . ':00';

                $arrival_difference = $this->calculateTimeDifference($scheduled_arrival, $arrival_time);

            } else {

                $arrival_difference = '-';

            }

            // Wyliczenie różnicy odjazdu

            if(!empty($scheduled_departure) && !empty($departure_time)){

                $departure_time = $departure_time . ':00';

                $departure_difference = $this->calculateTimeDifference($scheduled_departure, $departure_time);

            } else {

                $departure_difference = '-';

            }

            $row['arrival_difference'] = $arrival_difference;

            $row['departure_difference'] = $departure_difference;

            $output[] = $row;

        }

        usort($output, function ($a, $b) {

            $time1 = $a['scheduled_departure'] !== '-' ? $a['scheduled_departure'] : $a['scheduled_arrival'];
            $time2 = $b['scheduled_departure'] !== '-' ? $b['scheduled_departure'] : $b['scheduled_arrival'];

            if ($time1 === $time2){

                return $a['job_number'] <=> $b['job_number'];
                
            }

            return strcmp($time1, $time2);

        });

        //$directory = '../../downloads/'; - Przywrócić

        $directory = '../../../../downloads/';

        $filename = $station_name.'_'.$recording_date.'.csv';

        $file = fopen($directory.$filename, 'w');

        $columns = ['Stacja', 'Data', 'Numer pociągu', 'Relacja', 'Przyjazd', 'Odjazd', 'Peron', 'Pomiarowiec', 'Zadanie', 'Rodzaj zadania', 'Wsiadło', 'Wysiadło', 'Łączna wymiana', 'Rzecz. przyjazd', 'Rzecz. odjazd', 'Dokładność', 'Komentarz', 'Data pomiaru'];

        fputcsv($file, $columns);

        foreach($output as $row){

            fputcsv($file, [$row['station_name'], $row['recording_date'], $row['train_number'], $row['train_path'], $row['scheduled_arrival'], $row['scheduled_departure'], $row['scheduled_platform'], $row['full_name'], $row['job_number'], $row['job_type'], $row['entered_sum'], $row['exited_sum'], $row['total_exchange'], $row['arrival_difference'], $row['departure_difference'], $row['accuracy'], $row['comments'], $row['measurement_date']]);

        }

        fclose($file);

        $response = array();

        $response['success'] = true;

        $response['filename'] = $filename;

        echo json_encode($response);

    }

    public function getDetailedJobData($job_number, $recording_date, $station_id, $train_id){

        if(!$this->checkConnection()){

            return;

        }

        $param = ['job_number' => $job_number];

        $stmt_job = $this->dbh->prepare("SELECT * FROM jobs WHERE job_number = :job_number");

        $stmt_job->execute($param);

        $job_data = $stmt_job->fetchAll(PDO::FETCH_ASSOC);

        $stmt_job->closeCursor();

        $job = $job_data[0];

        $stmt_measurements = $this->dbh->prepare("SELECT * FROM measurements WHERE job_number = :job_number");

        $stmt_measurements->execute($param);

        $measurements = $stmt_measurements->fetchAll(PDO::FETCH_ASSOC);

        $stmt_measurements->closeCursor();

        // Zadanie pomiaru stacji

        if(!empty($station_id)){

            $stations = $this->getDataFromTable('stations');


            $params = ['recording_date' => $recording_date, 'station_id' => $station_id];

            $stmt_cameras = $this->dbh->prepare("SELECT * FROM cameras WHERE recording_date = :recording_date AND station_id = :station_id");

            $stmt_cameras->execute($params);

            $cameras = $stmt_cameras->fetchAll(PDO::FETCH_ASSOC);

            $stmt_cameras->closeCursor();


            $stmt_ftp = $this->dbh->prepare("SELECT * FROM ftp WHERE recording_date = :recording_date AND station_id = :station_id");

            $stmt_ftp->execute($params);

            $ftp = $stmt_ftp->fetchAll(PDO::FETCH_ASSOC);

            $stmt_ftp->closeCursor();


            if(!empty($job['train_list'])){

                $train_list = $job['train_list'];

                $train_ids = json_decode($train_list, true);

            } else {

                $start_hour = $job['start_hour'];

                $end_hour = $job['end_hour'];

                $stmt_trains_ids = $this->dbh->prepare("SELECT train_id FROM `trains` WHERE `station_id` = :station_id AND IF(`arrival_hour` IS NULL, `departure_hour` BETWEEN :departure_start_hour AND :departure_end_hour, `arrival_hour` BETWEEN :arrival_start_hour AND :arrival_end_hour)");

                $params = array(
                    'station_id' => $station_id,
                    'arrival_start_hour' => $start_hour,
                    'arrival_end_hour' => $end_hour,
                    'departure_start_hour' => $start_hour,
                    'departure_end_hour' => $end_hour
                );

                $stmt_trains_ids->execute($params);

                $train_ids_raw = $stmt_trains_ids->fetchAll(PDO::FETCH_ASSOC);

                $stmt_trains_ids->closeCursor();

                $train_ids = array_column($train_ids_raw, 'train_id');

            }

            $placeholders = implode(',', array_fill(0, count($train_ids), '?'));


            $stmt_trains = $this->dbh->prepare("SELECT * FROM `trains` WHERE train_id IN ($placeholders)");

            $stmt_trains->execute($train_ids);

            $trains = $stmt_trains->fetchAll(PDO::FETCH_ASSOC);

            $stmt_trains->closeCursor();

            $trains = array_values($this->groupTrains($trains));


            $stmt_train_numbers = $this->dbh->prepare("SELECT * FROM `train_numbers` WHERE train_id IN ($placeholders)");

            $stmt_train_numbers->execute($train_ids);

            $train_numbers = $stmt_train_numbers->fetchAll(PDO::FETCH_ASSOC);

            $stmt_train_numbers->closeCursor();


            $params = [$station_id, $recording_date];

            $stmt_delays = $this->dbh->prepare("SELECT * FROM `delays` WHERE `recording_date`= ? AND station_id = ? AND train_id IN ($placeholders)");

            $stmt_delays->execute(array_merge($params, $train_ids));

            $delays = $stmt_delays->fetchAll(PDO::FETCH_ASSOC);

            $stmt_delays->closeCursor();

        // Zadanie pomiaru pociągu
           
        } else {

            $param = ['train_id' => $train_id];

            $stmt_train = $this->dbh->prepare("SELECT * FROM `trains` WHERE `train_id`= :train_id");

            $stmt_train->execute($param);

            $train_data = $stmt_train->fetchAll(PDO::FETCH_ASSOC);

            $stmt_train->closeCursor();

            $trains = array_values($this->groupTrains($train_data));

            $train = $trains[0];


            $stations_list = [];

            foreach($train as $train_stop){

                $stations_list[] = $train_stop['station_id'];

            }

            $placeholders = implode(',', array_fill(0, count($stations_list), '?'));


            $stmt_stations = $this->dbh->prepare("SELECT * FROM stations WHERE station_id IN ($placeholders)");

            $stmt_stations->execute($stations_list);

            $stations = $stmt_stations->fetchAll(PDO::FETCH_ASSOC);

            $stmt_stations->closeCursor();



            $stmt_train_numbers = $this->dbh->prepare("SELECT * FROM `train_numbers` WHERE train_id = :train_id");

            $stmt_train_numbers->execute($param);

            $train_numbers = $stmt_train_numbers->fetchAll(PDO::FETCH_ASSOC);

            $stmt_train_numbers->closeCursor();


            $stmt_recordings = $this->dbh->prepare("SELECT station_id FROM `recordings` WHERE `recording_date`= :recording_date");

            $stmt_recordings->execute(['recording_date' => $recording_date]);

            $recordings = $stmt_recordings->fetchAll(PDO::FETCH_ASSOC);

            $stmt_recordings->closeCursor();


            $stmt_delays = $this->dbh->prepare("SELECT * FROM `delays` WHERE `recording_date`= ? AND train_id = ? AND station_id IN ($placeholders)");

            $stmt_delays->execute(array_merge([$recording_date, $train_id], $stations_list));

            $delays = $stmt_delays->fetchAll(PDO::FETCH_ASSOC);

            $stmt_delays->closeCursor();

            
            $stmt_cameras = $this->dbh->prepare("SELECT * FROM cameras WHERE recording_date = ? AND station_id IN ($placeholders)");

            $stmt_cameras->execute(array_merge([$recording_date], $stations_list));

            $cameras = $stmt_cameras->fetchAll(PDO::FETCH_ASSOC);

            $stmt_cameras->closeCursor();


            $stmt_ftp = $this->dbh->prepare("SELECT * FROM ftp WHERE recording_date = ? AND station_id IN ($placeholders)");

            $stmt_ftp->execute(array_merge([$recording_date], $stations_list));

            $ftp = $stmt_ftp->fetchAll(PDO::FETCH_ASSOC);

            $stmt_ftp->closeCursor();
            
        }

        $response = array();

        $response['trains'] = !empty($trains) ? $trains : [];

        $response['train_numbers'] = !empty($train_numbers) ? $train_numbers : [];

        $response['stations'] = !empty($stations) ? $stations : [];

        $response['delays'] = !empty($delays) ? $delays : [];

        $response['cameras'] = !empty($cameras) ? $cameras : [];

        $response['ftp'] = !empty($ftp) ? $ftp : [];

        $response['recordings'] = !empty($recordings) ? $recordings : [];

        $response['measurements'] = !empty($measurements) ? $measurements : [];

        echo json_encode($response);

    }

    // Funkcje pomocnicze

    public function getDataFromTable($table){

        $stmt = $this->dbh->prepare("SELECT * FROM `$table`");

        $stmt->execute();

        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt->closeCursor();

        return $data;

    }

    public function getUserDataFromTable(){

        $stmt_users = $this->dbh->prepare("SELECT * FROM `users` WHERE `role` = 'user'");

        $stmt_users->execute();

        $users = $stmt_users->fetchAll(PDO::FETCH_ASSOC);

        $stmt_users->closeCursor();

        foreach($users as &$user){

            unset($user['password']);

        }

        return $users;

    }

    public function findUserFullName($array, $personal_id){

        foreach ($array as $sub){

            if(isset($sub['personal_id']) && $sub['personal_id'] === $personal_id){

                return $sub['first_name']. " " .$sub['surname'];

            }

        }

        return -1; 

    }

    public function findJobData($array, $job_number){

        foreach ($array as $sub) {

            if(isset($sub['job_number']) && $sub['job_number'] == $job_number){

                return $sub;

            }

        }

        return -1; 

    }

    public function findStationName($array, $station_id){

        foreach ($array as $sub) {

            if ($sub['station_id'] === $station_id){

                return $sub['name'];

            }

        }

        return null;

    }

    public function findTrainData($array, $train_id){

        foreach ($array as $sub){

            if ($sub['train_id'] === $train_id){

                return $sub;

            }

        }

        return null;

    }

    public function findTrainNumberData($array, $train_id){

        foreach($array as $sub){

            if($sub['train_id'] === $train_id){

                return $sub;

            }

        }

        return null;

    }

    public function filterMeasurementsByUser($multiArray, $personal_id){

        $result = [];
        
        foreach ($multiArray as $measurement){

            if($measurement['personal_id'] === $personal_id){

                $result[] = $measurement;

            }
            
        }
        
        return $result;

    }

    function removeDuplicatesFromArray($array){
        
        $uniqueEntries = [];

        for($i = count($array) - 1; $i >= 0; $i--) {

            $entry = $array[$i];
            
            $uniqueKey = $entry['train_id'] . '_' . $entry['station_id'] . '_' . $entry['recording_date'] . '_' . $entry['job_number'];
            
            if (!isset($uniqueEntries[$uniqueKey])) {

                $uniqueEntries[$uniqueKey] = $entry;

            }

        }
    
        return array_reverse(array_values($uniqueEntries));

    }

    public function calculateTimeDifference($time1, $time2){

        $datetime1 = new DateTime($time1);

        $datetime2 = new DateTime($time2);

        if( (str_starts_with($time1, "22") || str_starts_with($time1, "23")) && str_starts_with($time2, "00") ){

            $datetime1->modify('-1 day');

        }

        $secondsDiff = $datetime2->getTimestamp() - $datetime1->getTimestamp();

        $minutes = $secondsDiff / 60;

        if($minutes > 4){

            return $minutes .' min.';

        } else {

            return '-';

        }

    }

    public function secondsToTime($seconds){

        $hours = floor($seconds / 3600);

        $minutes = floor(($seconds % 3600) / 60);

        $seconds = $seconds % 60;

        $timeString = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        
        return $timeString;

    }

    public function groupTrains($trains){

        $grouped_trains = [];

        foreach ($trains as $train){

            $train_id = $train['train_id'];

            if(!isset($grouped_trains[$train_id])){

                $grouped_trains[$train_id] = [];

            }

            $grouped_trains[$train_id][] = $train;

        }

        return $grouped_trains;

    }

    public function filterTrains($trains, $station_id, $start_hour, $end_hour){

        $start_hour = strtotime($start_hour);

        $end_hour   = strtotime($end_hour);

        $filtered = array_filter($trains, function($stops) use ($station_id, $start_hour, $end_hour){

            $matchingStops = array_filter($stops, function($stop) use ($station_id, $start_hour, $end_hour){

                $compared_time = !empty($stop['arrival_hour']) ? strtotime($stop['arrival_hour']) : strtotime($stop['departure_hour']);

                return $stop['station_id'] === $station_id && $compared_time >= $start_hour && $compared_time <= $end_hour;
            
            });

            return !empty($matchingStops);
        });

        return $filtered;
        
    }

    /*

    public function filterTrains($trains, $station_id, $start_hour, $end_hour){

        $output = array();

        $start_hour = strtotime($start_hour);
                    
        $end_hour = strtotime($end_hour);

        $filtered = array_filter($trains, function($stops) use ($station_id) {

            $compared_time = !empty($stop['arrival_hour']) ? strtotime($stop['arrival_hour']) : strtotime($stop['departure_hour']);

            return array_filter($stops, fn($stop) => $stop['station_id'] === $station_id && $compared_time >= $start_hour && $compared_time <= $end_hour);

        });

        return $filtered;

    }

    */

    public function getUserName($users_array, $personal_id){

        foreach($users_array as $user){

            if($user['personal_id'] === $personal_id){

                if(!empty($user['first_name']) && !empty($user['surname'])){

                    return $user['first_name'] . " " . $user['surname'];

                } else {

                    return $user['username'];

                }

            }

        }

        return "nie znaleziono";

    }

    public function getSurname($users_array, $personal_id){

        foreach($users_array as $user){

            if($user['personal_id'] === $personal_id){

                return $user['surname'];

            }

        }

        return "nie znaleziono";

    }
    
}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){

    $data = json_decode(file_get_contents("php://input"), true);

    if(array_key_exists('personal_id', $data)){

        $personal_id = $data['personal_id'];

    }

    $request_type = $data['request_type'];

    $getData = new Data;

    switch ($request_type) {

        case "get data":

            if(array_key_exists('admin_override', $data)){

                $getData->getData($personal_id, true);

            } else {

                $getData->getData($personal_id, null);

            }

            break;

        case "get admin data":

            $getData->getAdminData();

            break;

        case "get progress data":

            $getData->getProgressData();

            break;

        case "get user jobs":

            $getData->getUserJobsData();

            break;

        case "get jobs data":

            $getData->getJobsData();

            break;

        // Niepotrzebne ???

        /*

        case "get train data":

            $getData->getTrainsData();

            break;

        */

        case "get users with jobs":

            $getData->getUsersWithJobsData();

            break;

        case "get measurements data":

            $getData->getMeasurementsData($data);

            break;

        case "get user view data":

            $getData->getUserViewData();

            break;

        case "get train list data":

            $getData->getTrainListData($data);

            break;
            
        case "get train list detailed data":

            $getData->getTrainListDetailedData($data);

            break;

        case "get performance data":

            $getData->checkWorkTimeDetails();

            break;

        case "get check jobs data":

            $getData->generateQualityChecksReport();

            break;

        case "get station detailed data":

            $request_details = $data['data'];

            $station_id = $request_details['station_id'];

            $recording_date = $request_details['recording_date'];

            $getData->generateStationReport($station_id, $recording_date);

            break;

        case "get detailed job data":

            $job_number = $data['job_number'];

            $recording_date = $data['recording_date'];

            $station_id = $data['station_id'];

            $train_id = $data['train_id'];

            $getData->getDetailedJobData($job_number, $recording_date, $station_id, $train_id);

            break;

    }

}