'use strict';

var myApp = angular.module('formApp', [
   'schemaForm',
   'pascalprecht.translate',
   'ngSchemaFormFile'
])
.controller('formController', ['$scope', '$q', function ($scope, $q) {
  
  $scope.schema = {
    "type": "object",
    "title": "Album",
    "properties": {
      "image": {
        "title": "Image",
        "type": "array",
        "format": "singlefile",
        "x-schema-form": {
          "type": "array"
        },
        "pattern": {
          "mimeType": "image/*",
          "validationMessage": "Falscher Dateityp: "
        },
        "maxSize": {
          "maximum": "2MB",
          "validationMessage": "Erlaubte Dateigröße überschritten: ",
          "validationMessage2": "Aktuelle Dateigröße: "
        },
        "maxItems": {
          "validationMessage": "Es wurden mehr Dateien hochgeladen als erlaubt."
        },
        "minItems": {
          "validationMessage": "Sie müssen mindestens eine Datei hochladen"
        }
      },
      "images": {
        "title": "Images",
        "type": "array",
        "format": "multifile",
        "x-schema-form": {
          "type": "array"
        },
        "pattern": {
          "mimeType": "image/*,!.gif",
          "validationMessage": "Falscher Dateityp: "
        },
        "maxSize": {
          "maximum": "2MB",
          "validationMessage": "Erlaubte Dateigröße überschritten: ",
          "validationMessage2": "Aktuelle Dateigröße: "
        },
        "maxItems": {
          "validationMessage": "Es wurden mehr Dateien hochgeladen als erlaubt."
        },
        "minItems": {
          "validationMessage": "Sie müssen mindestens eine Datei hochladen"
        }
      }
    },
    "required": [
      "images"
    ]
  };

  $scope.form = [
  {
    "key": "image",
    "type": "nwpFileUpload",
    "endpoint": "https://angular-file-upload-cors-srv.appspot.com/upload"
  }, {
    "key": "images",
    "type": "nwpFileUpload",
    "endpoint": "https://angular-file-upload-cors-srv.appspot.com/upload"
  }];
  
  $scope.model = {};

   $scope.submit = function () {
      $scope.$broadcast('schemaFormValidate');
      if ($scope.myForm.$valid) {
         console.log('form valid');
      }
   };

}])
.config(['$translateProvider', function($translateProvider) {
  // Simply register translation table as object hash
  $translateProvider.translations('en', {
    'modules.upload.dndNotSupported': 'Drag n drop not surpported by your browser',
    'modules.attribute.fields.required.caption': 'Required',
    'modules.upload.descriptionMultifile': 'Drop your file(s) here',
    'buttons.add': 'Open file browser',
    'modules.upload.field.filename': 'Filename',
    'modules.upload.field.preview': 'Preview',
    'modules.upload.multiFileUpload': 'Multifile upload',
    'modules.upload.field.progress': 'Progress',
    'buttons.upload': 'Upload'
  });
  $translateProvider.preferredLanguage('en');

}]);


