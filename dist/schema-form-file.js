/**
 * angular-schema-form-nwp-file-upload - Upload file type for Angular Schema Form
 * @version v0.1.3
 * @link https://github.com/saburab/angular-schema-form-nwp-file-upload
 * @license MIT
 */
'use strict';

angular
   .module('schemaForm')
   .config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
      function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {
         var defaultPatternMsg  = 'Wrong file type. Allowed types are ',
             defaultMaxSizeMsg1 = 'This file is too large. Maximum size allowed is ',
             defaultMaxSizeMsg2 = 'Current file size:',
             defaultMinItemsMsg = 'You have to upload at least one file',
             defaultMaxItemsMsg = 'You can\'t upload more than one file.';

         var nwpSinglefileUpload = function (name, schema, options) {
            if (schema.type === 'array' && schema.format === 'singlefile') {
               if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
                  schema.pattern.validationMessage = defaultPatternMsg;
               }
               if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
                  schema.maxSize.validationMessage  = defaultMaxSizeMsg1;
                  schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
               }
               if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
                  schema.minItems.validationMessage = defaultMinItemsMsg;
               }
               if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
                  schema.maxItems.validationMessage = defaultMaxItemsMsg;
               }

               var f                                                  = schemaFormProvider.stdFormObj(name, schema, options);
               f.key                                                  = options.path;
               f.type                                                 = 'nwpFileUpload';
               options.lookup[sfPathProvider.stringify(options.path)] = f;
               return f;
            }
         };

         schemaFormProvider.defaults.array.unshift(nwpSinglefileUpload);

         var nwpMultifileUpload = function (name, schema, options) {
            if (schema.type === 'array' && schema.format === 'multifile') {
               if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
                  schema.pattern.validationMessage = defaultPatternMsg;
               }
               if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
                  schema.maxSize.validationMessage  = defaultMaxSizeMsg1;
                  schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
               }
               if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
                  schema.minItems.validationMessage = defaultMinItemsMsg;
               }
               if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
                  schema.maxItems.validationMessage = defaultMaxItemsMsg;
               }

               var f                                                  = schemaFormProvider.stdFormObj(name, schema, options);
               f.key                                                  = options.path;
               f.type                                                 = 'nwpFileUpload';
               options.lookup[sfPathProvider.stringify(options.path)] = f;
               return f;
            }
         };

         schemaFormProvider.defaults.array.unshift(nwpMultifileUpload);

         schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'nwpFileUpload',
            'directives/decorators/bootstrap/nwp-file/nwp-file.html'
         );
      }
   ]);

angular
   .module('ngSchemaFormFile', [
      'ngFileUpload',
      'ngMessages'
   ])
   .directive('ngSchemaFile', ['Upload', '$timeout', '$q', function (Upload, $timeout, $q) {
      return {
         restrict: 'A',
         scope:    true,
         require:  'ngModel',
         link:     function (scope, element, attrs, ngModel) {
            scope.url = scope.form && scope.form.endpoint;
            scope.isSinglefileUpload = scope.form && scope.form.schema && scope.form.schema.format === 'singlefile';

            scope.selectFile  = function (file) {
               scope.picFile = file;
            };
            scope.selectFiles = function (files) {
               scope.picFiles = files;
            };

            scope.uploadFile = function (file) {
               file && doUpload(file);
            };

            scope.uploadFiles = function (files) {
               files.length && angular.forEach(files, function (file) {
                  doUpload(file);
               });
            };

            function doUpload(file) {
               if (file && !file.$error && scope.url) {
                  file.upload = Upload.upload({
                     url:  scope.url,
                     file: file
                  });

                  file.upload.then(function (response) {
                     $timeout(function () {
                        file.result = response.data;
                     });
                  }, function (response) {
                     if (response.status > 0) {
                        scope.errorMsg = response.status + ': ' + response.data;
                     }
                  });

                  file.upload.progress(function (evt) {
                     file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                  });
               }
            }

            scope.validateField = function () {
               scope.uploadForm.$setDirty();
               if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
                  console.log('singlefile-form is invalid');
               } else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {
                  console.log('multifile-form is  invalid');
               } else {
                  console.log('single- and multifile-form are valid');
               }
            };
            scope.submit        = function () {
               if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
                  scope.uploadFile(scope.picFile);
               } else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {
                  scope.uploadFiles(scope.picFiles);
               }
            };
            scope.$on('schemaFormValidate', scope.validateField);
            scope.$on('schemaFormFileUploadSubmit', scope.submit);
         }
      };
   }]);

angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/nwp-file/nwp-file.html","<ng-form class=\"file-upload mb-lg\" ng-schema-file ng-model=\"$$value$$\" name=\"uploadForm\">\r\n   <label ng-show=\"form.title && form.notitle !== true\" class=\"control-label\" for=\"fileInputButton\" ng-class=\"{\'sr-only\': !showTitle(), \'text-danger\': uploadForm.$error.required && !uploadForm.$pristine}\">\r\n      {{ form.title }}<i ng-show=\"form.required\">&nbsp;*</i>\r\n   </label>\r\n\r\n   <div ng-show=\"picFile\">\r\n      <div ng-include=\"\'uploadProcess.html\'\" class=\"mb\"></div>\r\n   </div>\r\n\r\n   <ul ng-show=\"picFiles && picFiles.length\" class=\"list-group\">\r\n      <li class=\"list-group-item\" ng-repeat=\"picFile in picFiles\">\r\n         <div ng-include=\"\'uploadProcess.html\'\"></div>\r\n      </li>\r\n   </ul>\r\n\r\n<div class=\"well well-sm bg-white mb\" ng-class=\"{\'has-error border-danger\': (uploadForm.$error.required && !uploadForm.$pristine) || (hasError() && errorMessage(schemaError()))}\">\r\n   <div ng-if=\"isSinglefileUpload\" ng-include=\"\'singleFileUpload.html\'\"></div>\r\n   <div ng-if=\"!isSinglefileUpload\" ng-include=\"\'multiFileUpload.html\'\"></div>\r\n   <div class=\"help-block mb0\" ng-show=\"uploadForm.$error.required && !uploadForm.$pristine\">{{ \'modules.attribute.fields.required.caption\' | translate }}</div>\r\n   <div class=\"help-block mb0\" ng-show=\"(hasError() && errorMessage(schemaError())) || form.description\" ng-bind-html=\"(hasError() && errorMessage(schemaError())) || form.description\"></div>\r\n</div>\r\n</ng-form>\r\n\r\n<script type=\'text/ng-template\' id=\"uploadProcess.html\">\r\n   <div class=\"row mb\">\r\n      <div class=\"col-sm-4 mb-sm\">\r\n         <label title=\"{{ \'modules.upload.field.preview\' | translate }}\" class=\"text-info\">{{\r\n            \'modules.upload.field.preview\' | translate }}</label>\r\n         <img ngf-src=\"picFile\" class=\"img-thumbnail img-responsive\">\r\n         <div class=\"img-placeholder\"\r\n              ng-class=\"{\'show\': picFile.$invalid && !picFile.blobUrl, \'hide\': !picFile || picFile.blobUrl}\">No preview\r\n            available\r\n         </div>\r\n      </div>\r\n      <div class=\"col-sm-4 mb-sm\">\r\n         <label title=\"{{ \'modules.upload.field.filename\' | translate }}\" class=\"text-info\">{{\r\n            \'modules.upload.field.filename\' | translate }}</label>\r\n         <div class=\"filename\" title=\"{{ picFile.name }}\">{{ picFile.name }}</div>\r\n      </div>\r\n      <div class=\"col-sm-4 mb-sm\">\r\n         <label title=\"{{ \'modules.upload.field.progress\' | translate }}\" class=\"text-info\">{{\r\n            \'modules.upload.field.progress\' | translate }}</label>\r\n         <div class=\"progress\">\r\n            <div class=\"progress-bar progress-bar-striped\" role=\"progressbar\"\r\n                 ng-class=\"{\'progress-bar-success\': picFile.progress == 100}\"\r\n                 ng-style=\"{width: picFile.progress + \'%\'}\">\r\n               {{ picFile.progress }} %\r\n            </div>\r\n         </div>\r\n         <button class=\"btn btn-primary btn-sm\" type=\"button\" ng-click=\"uploadFile(picFile)\"\r\n                 ng-disabled=\"!picFile || picFile.$error\">{{ \"buttons.upload\" | translate }}\r\n         </button>\r\n      </div>\r\n   </div>\r\n   <div ng-messages=\"uploadForm.$error\" ng-messages-multiple=\"\">\r\n      <div class=\"text-danger errorMsg\" ng-message=\"maxSize\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong>. ({{ form.schema[picFile.$error].validationMessage2 | translate }} <strong>{{picFile.size / 1000000|number:1}}MB</strong>)</div>\r\n      <div class=\"text-danger errorMsg\" ng-message=\"pattern\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\r\n      <div class=\"text-danger errorMsg\" ng-message=\"maxItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\r\n      <div class=\"text-danger errorMsg\" ng-message=\"minItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\r\n      <div class=\"text-danger errorMsg\" ng-show=\"errorMsg\">{{errorMsg}}</div>\r\n   </div>\r\n</script>\r\n\r\n<script type=\'text/ng-template\' id=\"singleFileUpload.html\">\r\n   <div ngf-drop=\"selectFile(picFile)\" ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\"\r\n        ng-model=\"picFile\" name=\"file\"\r\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n        ng-required=\"form.required\"\r\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\r\n      <p class=\"text-center\">{{ \'modules.upload.descriptionSinglefile\' | translate }}</p>\r\n   </div>\r\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\r\n\r\n   <button ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\" ng-model=\"picFile\" name=\"file\"\r\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n           ng-required=\"form.required\"\r\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\r\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\r\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\r\n      {{ \"buttons.add\" | translate }}\r\n   </button>\r\n</script>\r\n\r\n<script type=\'text/ng-template\' id=\"multiFileUpload.html\">\r\n   <div ngf-drop=\"selectFiles(picFiles)\" ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\"\r\n        ng-model=\"picFiles\" name=\"files\"\r\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n        ng-required=\"form.required\"\r\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\r\n      <p class=\"text-center\">{{ \'modules.upload.descriptionMultifile\' | translate }}</p>\r\n   </div>\r\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\r\n\r\n   <button ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\" multiple ng-model=\"picFiles\" name=\"files\"\r\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n           ng-required=\"form.required\"\r\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\r\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\r\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\r\n      {{ \"buttons.add\" | translate }}\r\n   </button>\r\n</script>\r\n");}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVtYS1mb3JtLWZpbGUuanMiLCJ0ZW1wbGF0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckpBLDhFQUFBIiwiZmlsZSI6InNjaGVtYS1mb3JtLWZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5hbmd1bGFyXHJcbiAgIC5tb2R1bGUoJ3NjaGVtYUZvcm0nKVxyXG4gICAuY29uZmlnKFsnc2NoZW1hRm9ybVByb3ZpZGVyJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLFxyXG4gICAgICBmdW5jdGlvbiAoc2NoZW1hRm9ybVByb3ZpZGVyLCBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLCBzZlBhdGhQcm92aWRlcikge1xyXG4gICAgICAgICB2YXIgZGVmYXVsdFBhdHRlcm5Nc2cgID0gJ1dyb25nIGZpbGUgdHlwZS4gQWxsb3dlZCB0eXBlcyBhcmUgJyxcclxuICAgICAgICAgICAgIGRlZmF1bHRNYXhTaXplTXNnMSA9ICdUaGlzIGZpbGUgaXMgdG9vIGxhcmdlLiBNYXhpbXVtIHNpemUgYWxsb3dlZCBpcyAnLFxyXG4gICAgICAgICAgICAgZGVmYXVsdE1heFNpemVNc2cyID0gJ0N1cnJlbnQgZmlsZSBzaXplOicsXHJcbiAgICAgICAgICAgICBkZWZhdWx0TWluSXRlbXNNc2cgPSAnWW91IGhhdmUgdG8gdXBsb2FkIGF0IGxlYXN0IG9uZSBmaWxlJyxcclxuICAgICAgICAgICAgIGRlZmF1bHRNYXhJdGVtc01zZyA9ICdZb3UgY2FuXFwndCB1cGxvYWQgbW9yZSB0aGFuIG9uZSBmaWxlLic7XHJcblxyXG4gICAgICAgICB2YXIgbndwU2luZ2xlZmlsZVVwbG9hZCA9IGZ1bmN0aW9uIChuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIHNjaGVtYS5mb3JtYXQgPT09ICdzaW5nbGVmaWxlJykge1xyXG4gICAgICAgICAgICAgICBpZiAoc2NoZW1hLnBhdHRlcm4gJiYgc2NoZW1hLnBhdHRlcm4ubWltZVR5cGUgJiYgIXNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdFBhdHRlcm5Nc2c7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhTaXplICYmIHNjaGVtYS5tYXhTaXplLm1heGltdW0gJiYgIXNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlICA9IGRlZmF1bHRNYXhTaXplTXNnMTtcclxuICAgICAgICAgICAgICAgICAgc2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UyID0gZGVmYXVsdE1heFNpemVNc2cyO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIGlmIChzY2hlbWEubWluSXRlbXMgJiYgc2NoZW1hLm1pbkl0ZW1zLm1pbmltdW0gJiYgIXNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICBzY2hlbWEubWluSXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWluSXRlbXNNc2c7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhJdGVtcyAmJiBzY2hlbWEubWF4SXRlbXMubWF4aW11bSAmJiAhc2NoZW1hLm1heEl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNYXhJdGVtc01zZztcclxuICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgdmFyIGYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gc2NoZW1hRm9ybVByb3ZpZGVyLnN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgZi5rZXkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gb3B0aW9ucy5wYXRoO1xyXG4gICAgICAgICAgICAgICBmLnR5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnbndwRmlsZVVwbG9hZCc7XHJcbiAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XHJcbiAgICAgICAgICAgICAgIHJldHVybiBmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH07XHJcblxyXG4gICAgICAgICBzY2hlbWFGb3JtUHJvdmlkZXIuZGVmYXVsdHMuYXJyYXkudW5zaGlmdChud3BTaW5nbGVmaWxlVXBsb2FkKTtcclxuXHJcbiAgICAgICAgIHZhciBud3BNdWx0aWZpbGVVcGxvYWQgPSBmdW5jdGlvbiAobmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBzY2hlbWEuZm9ybWF0ID09PSAnbXVsdGlmaWxlJykge1xyXG4gICAgICAgICAgICAgICBpZiAoc2NoZW1hLnBhdHRlcm4gJiYgc2NoZW1hLnBhdHRlcm4ubWltZVR5cGUgJiYgIXNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdFBhdHRlcm5Nc2c7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhTaXplICYmIHNjaGVtYS5tYXhTaXplLm1heGltdW0gJiYgIXNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlICA9IGRlZmF1bHRNYXhTaXplTXNnMTtcclxuICAgICAgICAgICAgICAgICAgc2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UyID0gZGVmYXVsdE1heFNpemVNc2cyO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIGlmIChzY2hlbWEubWluSXRlbXMgJiYgc2NoZW1hLm1pbkl0ZW1zLm1pbmltdW0gJiYgIXNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICBzY2hlbWEubWluSXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWluSXRlbXNNc2c7XHJcbiAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhJdGVtcyAmJiBzY2hlbWEubWF4SXRlbXMubWF4aW11bSAmJiAhc2NoZW1hLm1heEl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNYXhJdGVtc01zZztcclxuICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgdmFyIGYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gc2NoZW1hRm9ybVByb3ZpZGVyLnN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgZi5rZXkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gb3B0aW9ucy5wYXRoO1xyXG4gICAgICAgICAgICAgICBmLnR5cGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnbndwRmlsZVVwbG9hZCc7XHJcbiAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XHJcbiAgICAgICAgICAgICAgIHJldHVybiBmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgIH07XHJcblxyXG4gICAgICAgICBzY2hlbWFGb3JtUHJvdmlkZXIuZGVmYXVsdHMuYXJyYXkudW5zaGlmdChud3BNdWx0aWZpbGVVcGxvYWQpO1xyXG5cclxuICAgICAgICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5hZGRNYXBwaW5nKFxyXG4gICAgICAgICAgICAnYm9vdHN0cmFwRGVjb3JhdG9yJyxcclxuICAgICAgICAgICAgJ253cEZpbGVVcGxvYWQnLFxyXG4gICAgICAgICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2Jvb3RzdHJhcC9ud3AtZmlsZS9ud3AtZmlsZS5odG1sJ1xyXG4gICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgIF0pO1xyXG5cclxuYW5ndWxhclxyXG4gICAubW9kdWxlKCduZ1NjaGVtYUZvcm1GaWxlJywgW1xyXG4gICAgICAnbmdGaWxlVXBsb2FkJyxcclxuICAgICAgJ25nTWVzc2FnZXMnXHJcbiAgIF0pXHJcbiAgIC5kaXJlY3RpdmUoJ25nU2NoZW1hRmlsZScsIFsnVXBsb2FkJywgJyR0aW1lb3V0JywgJyRxJywgZnVuY3Rpb24gKFVwbG9hZCwgJHRpbWVvdXQsICRxKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgIHNjb3BlOiAgICB0cnVlLFxyXG4gICAgICAgICByZXF1aXJlOiAgJ25nTW9kZWwnLFxyXG4gICAgICAgICBsaW5rOiAgICAgZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xyXG4gICAgICAgICAgICBzY29wZS51cmwgPSBzY29wZS5mb3JtICYmIHNjb3BlLmZvcm0uZW5kcG9pbnQ7XHJcbiAgICAgICAgICAgIHNjb3BlLmlzU2luZ2xlZmlsZVVwbG9hZCA9IHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5zY2hlbWEgJiYgc2NvcGUuZm9ybS5zY2hlbWEuZm9ybWF0ID09PSAnc2luZ2xlZmlsZSc7XHJcblxyXG4gICAgICAgICAgICBzY29wZS5zZWxlY3RGaWxlICA9IGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgIHNjb3BlLnBpY0ZpbGUgPSBmaWxlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzY29wZS5zZWxlY3RGaWxlcyA9IGZ1bmN0aW9uIChmaWxlcykge1xyXG4gICAgICAgICAgICAgICBzY29wZS5waWNGaWxlcyA9IGZpbGVzO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgc2NvcGUudXBsb2FkRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgIGZpbGUgJiYgZG9VcGxvYWQoZmlsZSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzY29wZS51cGxvYWRGaWxlcyA9IGZ1bmN0aW9uIChmaWxlcykge1xyXG4gICAgICAgICAgICAgICBmaWxlcy5sZW5ndGggJiYgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICBkb1VwbG9hZChmaWxlKTtcclxuICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkb1VwbG9hZChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgIGlmIChmaWxlICYmICFmaWxlLiRlcnJvciAmJiBzY29wZS51cmwpIHtcclxuICAgICAgICAgICAgICAgICAgZmlsZS51cGxvYWQgPSBVcGxvYWQudXBsb2FkKHtcclxuICAgICAgICAgICAgICAgICAgICAgdXJsOiAgc2NvcGUudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgZmlsZS51cGxvYWQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnJlc3VsdCA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXJyb3JNc2cgPSByZXNwb25zZS5zdGF0dXMgKyAnOiAnICsgcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGZpbGUudXBsb2FkLnByb2dyZXNzKGZ1bmN0aW9uIChldnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgZmlsZS5wcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgcGFyc2VJbnQoMTAwLjAgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKSk7XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLnZhbGlkYXRlRmllbGQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgIHNjb3BlLnVwbG9hZEZvcm0uJHNldERpcnR5KCk7XHJcbiAgICAgICAgICAgICAgIGlmIChzY29wZS51cGxvYWRGb3JtLmZpbGUgJiYgc2NvcGUudXBsb2FkRm9ybS5maWxlLiR2YWxpZCAmJiBzY29wZS5waWNGaWxlICYmICFzY29wZS5waWNGaWxlLiRlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnc2luZ2xlZmlsZS1mb3JtIGlzIGludmFsaWQnKTtcclxuICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS51cGxvYWRGb3JtLmZpbGVzICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZXMuJHZhbGlkICYmIHNjb3BlLnBpY0ZpbGVzICYmICFzY29wZS5waWNGaWxlcy4kZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ211bHRpZmlsZS1mb3JtIGlzICBpbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaW5nbGUtIGFuZCBtdWx0aWZpbGUtZm9ybSBhcmUgdmFsaWQnKTtcclxuICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzY29wZS5zdWJtaXQgICAgICAgID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICBpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZS4kdmFsaWQgJiYgc2NvcGUucGljRmlsZSAmJiAhc2NvcGUucGljRmlsZS4kZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGUudXBsb2FkRmlsZShzY29wZS5waWNGaWxlKTtcclxuICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS51cGxvYWRGb3JtLmZpbGVzICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZXMuJHZhbGlkICYmIHNjb3BlLnBpY0ZpbGVzICYmICFzY29wZS5waWNGaWxlcy4kZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgc2NvcGUudXBsb2FkRmlsZXMoc2NvcGUucGljRmlsZXMpO1xyXG4gICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybVZhbGlkYXRlJywgc2NvcGUudmFsaWRhdGVGaWVsZCk7XHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybUZpbGVVcGxvYWRTdWJtaXQnLCBzY29wZS5zdWJtaXQpO1xyXG4gICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgIH1dKTtcclxuIixudWxsXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
