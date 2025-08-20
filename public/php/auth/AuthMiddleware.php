<?php

require __DIR__.'/../classes/connection.php';

require 'JwtHandler.php';

class Auth extends JwtHandler {

    use Connection;

    protected $db;

    protected $headers;

    protected $token;

    public function __construct($headers){

        parent::__construct();

        $this->headers = $headers;

    }

    public function isValid(){

        if (array_key_exists('Authorization', $this->headers) && preg_match('/Bearer\s(\S+)/', $this->headers['Authorization'], $matches) || array_key_exists('authorization', $this->headers) && preg_match('/Bearer\s(\S+)/', $this->headers['authorization'], $matches)) {

            $data = $this->jwtDecodeData($matches[1]);

            if(isset($data['data']->personal_id) && $user = $this->fetchUser($data['data']->personal_id)){

                return [
                    "success" => true,
                    "user" => $user
                ];

            } else {

                return [
                    "success" => false,
                    "message" => "User not found",
                ];
                
            }
                
        } else {

            return [
                "success" => false,
                "message" => "Token not found in request"
            ];

        }

    }

    protected function fetchUser($user_id){

        try {

            $dbh = $this->connect();

            if (!($dbh instanceof PDO)){

                return null;

            }

            $personal_id = array('personal_id' => $user_id);

            $stmt = $dbh->prepare("SELECT `username`, `personal_id`, `role`, `first_name`, `surname`, `hour_rate`, `total_work_time` FROM `users` WHERE personal_id = :personal_id AND `status` = 'active'");

            $stmt->execute($personal_id);

            $result = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            if(!empty($result)){

                return $result;

            } else {

                return false;
                
            }

        } catch (PDOException $e){

            return null;

        }

    }

}