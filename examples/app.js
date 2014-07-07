
angular.module('app', ['andreax79.partial-date'])

.controller('TestCtrl', function($scope, $locale) {
  $scope.model = { day: 6, month: 0, year: 1979 };
});

