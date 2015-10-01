'use strict';

var myApp = angular.module('myApp', [
   'schemaForm',
   'ngSchemaFormFile'
]);

// our controller for the form
// =============================================================================
myApp.controller('FormController', ['$scope', '$http', function ($scope, $http) {

   $http.get('schema.json').success(function (data) {
      $scope.schema = data.schema;
      $scope.form   = data.form;
   });

   $scope.model = {};

   $scope.submit = function () {
      $scope.$broadcast('schemaFormValidate');
      if ($scope.myForm.$valid) {
         console.log('form valid');
      }
   };

}]);

