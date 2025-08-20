<?php

include 'connection.php';

class User {

    use Connection;

    public $username;
    public $password;
    public $status;
    public $role;
    public $personal_id;
    public $email;
    public $phone_number;
    public $first_name;
    public $surname;
    public $rating;
    public $hour_rate;
    public $comment;

    public $dbh;

    public function __construct(){

        $this->dbh = $this->connect();

    }

    public function checkUser($username){

        if(!$this->checkConnection()){

            return;

        }

        $username = ['username' => $username];

        $stmt_check = $this->dbh->prepare("SELECT * FROM `users` WHERE username = :username");

        $stmt_check->execute($username);

        $result = $stmt_check->fetchAll(\PDO::FETCH_ASSOC);

        if(!empty($result)){

            $response = ['busy' => true];

        } else {

            $response = ['free' => true];

        }

        echo json_encode($response);

    }

    public function addUser($data){

        if(!$this->checkConnection()){

            return;

        }

        $username = ['username' => $data['add_username']];

        $stmt_check = $this->dbh->prepare("SELECT * FROM `users` WHERE username = :username");

        $stmt_check->execute($username);

        $result = $stmt_check->fetchAll(\PDO::FETCH_ASSOC);

        $stmt_check->closeCursor();

        if(!empty($result)){

            $response['error'] = 'Nazwa użytkownika już istnieje. Proszę wybierz inną nazwę.';

            echo json_encode($response);

            return;

        }

        $this->status = 'active';

        $this->username = $data['add_username'];

        $form_password = $data['add_password'];

        if(empty($form_password) || !is_string($form_password) || strlen($form_password) < 10){

            $response['error'] = 'Hasło jest puste, zbyt krótkie, albo w niepoprawnym formacie(przynajmniej 10 znaków).';

            echo json_encode($response);

            return;

        }
        
        $password = password_hash($data['add_password'], PASSWORD_DEFAULT);

        $stmt_personal_id = $this->dbh->prepare("SELECT MAX(CAST(SUBSTRING(personal_id, 2) AS UNSIGNED)) AS max_personal_id FROM `users` WHERE personal_id != '-'");
        
        $stmt_personal_id->execute();
        
        $result = $stmt_personal_id->fetchAll(\PDO::FETCH_ASSOC);
        
        $stmt_personal_id->closeCursor();

        $max_id = $result[0]['max_personal_id'];

        $this->role = 'user';

        $this->personal_id = 'U' . str_pad($max_id + 1, 3, '0', STR_PAD_LEFT);

        $this->password = $password;

        if(!empty($data['phone']) && (!is_string($data['phone']) || preg_match_all('/\d/', $data['phone']) < 9)){

            $response['error'] = 'Numer telefonu jest nieprawidłowy(przynajmniej 9 cyfr).';

            echo json_encode($response);

            return;

        }

        $this->phone_number = !empty($data['phone']) ? $data['phone'] : null;

        $this->email = !empty($data['mail']) ? $data['mail'] : null;

        if(!empty($data['full_name']) && is_string($data['full_name'])){

            $raw = explode(" ", $data['full_name']);

            $this->first_name = $raw[0];

            if(isset($raw[1])){

                $this->surname = $raw[1];

            } else {

                $this->surname = null;

            }

        } else {

            $this->first_name = null;

            $this->surname = null;

        }

        if(!empty($data['rating']) && is_numeric($data['rating'])){

            $this->rating = (int)$data['rating'];

        } else {

            $this->rating = null;

        }

        if(!empty($data['hour_rate']) && is_numeric($data['hour_rate'])){

            $hour_rate = (float)$data['hour_rate'];

            $this->hour_rate = round($hour_rate, 2);

        } else {

            $this->hour_rate = null;

        }

        if(!empty($data['comment'])){

            $this->comment = $data['comment'];

        } else {

            $this->comment = null;

        }
        
        $object = get_object_vars($this);

        unset($object['dbh']);

        $put = $this->insert($object);
        
    }

    public function changePassword($data){

        if(!$this->checkConnection()){

            return;

        }

        $new_password = password_hash($data['new_password'], PASSWORD_DEFAULT);

        $params = ['personal_id' => $data['personal_id'], 'new_password' => $new_password];

        $stmt = $this->dbh->prepare("UPDATE users SET `password` = :new_password, `last_update` = `last_update` WHERE personal_id = :personal_id");

        $stmt->execute($params);

        $stmt->closeCursor();

        $count = $stmt->rowCount();

        if($count === 1){

            $response = true;

        } else {

            $error = 'Wystąpił problem z aktualizacją bazy danych. Spróbuj ponownie później.';

            $response['error'] = $error;

        }

        echo json_encode($response);

    }

    public function changeStatus($data){

        if(!$this->checkConnection()){

            return;

        }

        $params = ['personal_id' => $data['personal_id'], 'new_status' => $data['new_status']];

        $stmt = $this->dbh->prepare("UPDATE users SET `status` = :new_status, `last_update` = `last_update` WHERE personal_id = :personal_id");

        $stmt->execute($params);

        $stmt->closeCursor();

        $count = $stmt->rowCount();

        if($count === 1){

            $response = true;

        } else {

            $error = 'Wystąpił problem z aktualizacją bazy danych. Spróbuj ponownie później.';

            $response['error'] = $error;

        }

        echo json_encode($response);

    }   

    public function countDigits($str){

        return preg_match_all( "/[0-9]/", $str );

    }

    public function insert($object){

        if(!$this->checkConnection()){

            return;

        }

        $obj_properties = array_keys($object);

        $names = implode(",", $obj_properties);

        $values = implode(",:", $obj_properties);

        $stmt = $this->dbh->prepare("INSERT INTO `users` ($names) VALUES (:$values)");

        $stmt->execute($object);

        $count = $stmt->rowCount();

        if($count === 1){

            $response = true;

        } else {

            $error = 'Wystąpił problem z aktualizacją bazy danych. Spróbuj ponownie później.';

            $response['error'] = $error;

        }

        echo json_encode($response);
        
    }

}

if ($_SERVER['REQUEST_METHOD'] === 'POST'){

    $data = json_decode(file_get_contents("php://input"), true);

    $request_type = $data['request_type'];

    switch ($request_type) {

        case "check username":

            $user = new User;

            $user->checkUser($data['username']);

            break;

        case "create user":

            $user = new User;

            $user->addUser($data['formData']);

            break;

        case "change password":

            $user = new User;

            $user->changePassword($data['formData']);

            break;

        case "change status":

            $user = new User;

            $user->changeStatus($data['formData']);

            break;

    }
    
}