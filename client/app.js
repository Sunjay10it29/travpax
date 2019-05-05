angular.module('travelPax', ['ngRoute', 'angularSimplePagination'])

    .controller('mainCtrl', function($scope, $route, $window, $anchorScroll, $http, $location, $filter) {

        $scope.heroes = [];

        $scope.settings = {
            currentPage: 0,
            offset: 0,
            pageLimit: 10,
            pageLimits: ['10', '20']
        };

        $scope.callback = function() {
            console.log('pagination changed...');
        }

        $http.get("https://nodejs-example-app.herokuapp.com/heroes")
            .then(function(response) {
                $scope.heroes = response.data;
                console.log($scope.heroes, 'data')
            });

    })

    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });