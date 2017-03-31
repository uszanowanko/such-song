function LoginCtrl($scope, $location, UserSvc, WebsocketSvc) {

    this.login = function(username, password) {
        UserSvc.login(username, password)
            .then((user)  => {
                WebsocketSvc.connect(UserSvc.token);
                this.flags.loginBusy = false;
                $location.path('/')
                $scope.$emit("login");
            }, () => {
                this.flags.loginBusy = false;
        })
    }
}

angular.module('app')
    .controller('LoginCtrl', LoginCtrl);
