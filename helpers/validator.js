class Validator {
    static validateUserInfo(userInfo) {
        var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (userInfo.hasOwnProperty("email")
        && userInfo.hasOwnProperty("password")){
            if(userInfo.email.match(emailFormat)){
            return {
                "status": true,
                "message": "Validated successfully"
            };
        } 
    }else {
            return {
                "status": false,
                "message": "Please provide all the parameters"
            }
        }
    }
    static validateTaskInfo(eventInfo) {
        if (eventInfo.hasOwnProperty("title")
        && eventInfo.hasOwnProperty("description")&& eventInfo.hasOwnProperty("duedate")) {
           
            return {
                "status": true,
                "message": "Validated successfully"
            };
         
    }else {
            return {
                "status": false,
                "message": "Please provide all the parameters"
            }
        }
    }
    
}

module.exports=Validator
