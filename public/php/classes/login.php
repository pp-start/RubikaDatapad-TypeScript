<?php

require 'connection.php';

require __DIR__.'/../auth/JwtHandler.php';

class Login {

    use Connection;

    public function __construct(){

        $this->dbh = $this->connect();

    }

    // Check if there is connection to the DB

    public function checkConnection(){

        if(($this->dbh instanceof PDO)){

            return true;

        } else {

            $response = array('message' => 'No connection to DB');

            echo json_encode($response);

            return false;

        }

    }

    public function checkCredentials($username, $password){

        if(!$this->checkConnection()){

            return;

        }

        $username = array('username' => $username);

        $stmt = $this->dbh->prepare("SELECT * FROM `users` WHERE username = :username");

        $stmt->execute($username);

        $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        if(!$result){

            $response = array('message' => 'Podany użytkownik nie istnieje');

            echo json_encode($response);

            return;

        } else {

            $status = $result[0]['status'];

            if($status === 'deactivated'){

                $response = array('message' => 'Użytkownik nieaktywny');

                echo json_encode($response);

                return;

            }

            $hash = $result[0]['password'];

            if(password_verify($password, $hash)){

                $jwt = new JwtHandler();

                $token = $jwt->jwtEncodeData('php_auth_api/', array("personal_id"=> $result[0]['personal_id']));
                
                $username = $result[0]['username'];

                $role = $result[0]['role'];

                $personal_id = $result[0]['personal_id'];

                $first_name = $result[0]['first_name'];

                $surname = $result[0]['surname'];

                $hour_rate = $result[0]['hour_rate'];

                $total_work_time = $result[0]['total_work_time'];

                $response = array('token' => $token, 'username' => $username, 'role' => $role, 'personal_id' => $personal_id, 'first_name' => $first_name, 'surname' => $surname, 'hour_rate' => $hour_rate, 'total_work_time' => $total_work_time,);
                
            } else {

                $response = array('message' => 'Podane hasło jest nieprawidłowe');

            }

        }

        echo json_encode($response);
        
    }

}

if($_SERVER['REQUEST_METHOD'] === "POST"){

    $input = json_decode(file_get_contents("php://input"), true);

    $data = $input['formData'];

    $username = $data['username'];

    $password = $data['password'];
    
    $login = new Login();

    $login->checkCredentials($username, $password);

}