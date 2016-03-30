/**
 * angular-schema-form-nwp-file-upload - Upload file type for Angular Schema Form
 * @version v0.1.5
 * @link https://github.com/saburab/angular-schema-form-nwp-file-upload
 * @license MIT
 */
'use strict';

angular
	.module('schemaForm')
	.config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
		function(schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {
			var defaultPatternMsg = 'Wrong file type. Allowed types are ',
				defaultMaxSizeMsg1 = 'This file is too large. Maximum size allowed is ',
				defaultMaxSizeMsg2 = 'Current file size:',
				defaultMinItemsMsg = 'You have to upload at least one file',
				defaultMaxItemsMsg = 'You can\'t upload more than one file.';

			var nwpSinglefileUpload = function(name, schema, options) {
				if (schema.type === 'array' && schema.format === 'singlefile') {
					if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
						schema.pattern.validationMessage = defaultPatternMsg;
					}
					if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
						schema.maxSize.validationMessage = defaultMaxSizeMsg1;
						schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
					}
					if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
						schema.minItems.validationMessage = defaultMinItemsMsg;
					}
					if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
						schema.maxItems.validationMessage = defaultMaxItemsMsg;
					}

					var f = schemaFormProvider.stdFormObj(name, schema, options);
					f.key = options.path;
					f.type = 'nwpFileUpload';
					options.lookup[sfPathProvider.stringify(options.path)] = f;
					return f;
				}
			};

			schemaFormProvider.defaults.array.unshift(nwpSinglefileUpload);

			var nwpMultifileUpload = function(name, schema, options) {
				if (schema.type === 'array' && schema.format === 'multifile') {
					if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
						schema.pattern.validationMessage = defaultPatternMsg;
					}
					if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
						schema.maxSize.validationMessage = defaultMaxSizeMsg1;
						schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
					}
					if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
						schema.minItems.validationMessage = defaultMinItemsMsg;
					}
					if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
						schema.maxItems.validationMessage = defaultMaxItemsMsg;
					}

					var f = schemaFormProvider.stdFormObj(name, schema, options);
					f.key = options.path;
					f.type = 'nwpFileUpload';
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
	.directive('ngSchemaFile', ['Upload', '$timeout', '$q', function(Upload, $timeout, $q) {
		return {
			restrict: 'A',
			scope: true,
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				scope.url = scope.form && scope.form.endpoint;
				scope.isSinglefileUpload = scope.form && scope.form.schema && scope.form.schema.format === 'singlefile';

				scope.selectFile = function(file) {
					scope.picFile = file;
				};
				scope.selectFiles = function(files) {
					scope.picFiles = files;
				};

				scope.uploadFile = function(file) {
					file && doUpload(file);
				};

				scope.uploadFiles = function(files) {
					files.length && angular.forEach(files, function(file) {
						doUpload(file);
					});
				};

				function doUpload(file) {
					if (file && !file.$error && scope.url) {
						file.upload = Upload.upload({
							url: scope.url,
							file: file
						});

						file.upload.then(function(response) {
							$timeout(function() {
								file.result = response.data;
							});
							ngModel.$setViewValue(response.data);
							ngModel.$commitViewValue();
						}, function(response) {
							if (response.status > 0) {
								scope.errorMsg = response.status + ': ' + response.data;
							}
						});

						file.upload.progress(function(evt) {
							file.progress = Math.min(100, parseInt(100.0 *
								evt.loaded / evt.total));
						});
					}
				}

				scope.validateField = function() {
					if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
						console.log('singlefile-form is invalid');
					} else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {
						console.log('multifile-form is  invalid');
					} else {
						console.log('single- and multifile-form are valid');
					}
				};
				scope.submit = function() {
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
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/nwp-file/nwp-file.html","<ng-form class=\"file-upload mb-lg\" ng-schema-file ng-model=\"$$value$$\" name=\"uploadForm\">\n   <label ng-show=\"form.title && form.notitle !== true\" class=\"control-label\" for=\"fileInputButton\" ng-class=\"{\'sr-only\': !showTitle(), \'text-danger\': uploadForm.$error.required && !uploadForm.$pristine}\">\n      {{ form.title }}<i ng-show=\"form.required\">&nbsp;*</i>\n   </label>\n\n   <div ng-show=\"picFile\">\n      <div ng-include=\"\'uploadProcess.html\'\" class=\"mb\"></div>\n   </div>\n\n   <ul ng-show=\"picFiles && picFiles.length\" class=\"list-group\">\n      <li class=\"list-group-item\" ng-repeat=\"picFile in picFiles\">\n         <div ng-include=\"\'uploadProcess.html\'\"></div>\n      </li>\n   </ul>\n\n   <div class=\"well well-sm bg-white mb\" ng-class=\"{\'has-error border-danger\': (uploadForm.$error.required && !uploadForm.$pristine) || (hasError() && errorMessage(schemaError()))}\">\n      <small class=\"text-muted\" ng-show=\"form.description\" ng-bind-html=\"form.description\"></small>\n      <div ng-if=\"isSinglefileUpload\" ng-include=\"\'singleFileUpload.html\'\"></div>\n      <div ng-if=\"!isSinglefileUpload\" ng-include=\"\'multiFileUpload.html\'\"></div>\n      <div class=\"help-block mb0\" ng-show=\"uploadForm.$error.required && !uploadForm.$pristine\">{{ \'modules.attribute.fields.required.caption\' | translate }}</div>\n      <div class=\"help-block mb0\" ng-show=\"(hasError() && errorMessage(schemaError()))\" ng-bind-html=\"(hasError() && errorMessage(schemaError()))\"></div>\n   </div>\n</ng-form>\n\n<script type=\'text/ng-template\' id=\"uploadProcess.html\">\n   <div class=\"row mb\">\n      <div class=\"col-sm-4 mb-sm\">\n         <label title=\"{{ \'modules.upload.field.preview\' | translate }}\" class=\"text-info\">{{\n            \'modules.upload.field.preview\' | translate }}</label>\n         <img ngf-src=\"picFile\" class=\"img-thumbnail img-responsive\">\n         <div class=\"img-placeholder\"\n              ng-class=\"{\'show\': picFile.$invalid && !picFile.blobUrl, \'hide\': !picFile || picFile.blobUrl}\">No preview\n            available\n         </div>\n      </div>\n      <div class=\"col-sm-4 mb-sm\">\n         <label title=\"{{ \'modules.upload.field.filename\' | translate }}\" class=\"text-info\">{{\n            \'modules.upload.field.filename\' | translate }}</label>\n         <div class=\"filename\" title=\"{{ picFile.name }}\">{{ picFile.name }}</div>\n      </div>\n      <div class=\"col-sm-4 mb-sm\">\n         <label title=\"{{ \'modules.upload.field.progress\' | translate }}\" class=\"text-info\">{{\n            \'modules.upload.field.progress\' | translate }}</label>\n         <div class=\"progress\">\n            <div class=\"progress-bar progress-bar-striped\" role=\"progressbar\"\n                 ng-class=\"{\'progress-bar-success\': picFile.progress == 100}\"\n                 ng-style=\"{width: picFile.progress + \'%\'}\">\n               {{ picFile.progress }} %\n            </div>\n         </div>\n         <button class=\"btn btn-primary btn-sm\" type=\"button\" ng-click=\"uploadFile(picFile)\"\n                 ng-disabled=\"!picFile || picFile.$error\">{{ \"buttons.upload\" | translate }}\n         </button>\n      </div>\n   </div>\n   <div ng-messages=\"uploadForm.$error\" ng-messages-multiple=\"\">\n      <div class=\"text-danger errorMsg\" ng-message=\"maxSize\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong>. ({{ form.schema[picFile.$error].validationMessage2 | translate }} <strong>{{picFile.size / 1000000|number:1}}MB</strong>)</div>\n      <div class=\"text-danger errorMsg\" ng-message=\"pattern\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\n      <div class=\"text-danger errorMsg\" ng-message=\"maxItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\n      <div class=\"text-danger errorMsg\" ng-message=\"minItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\n      <div class=\"text-danger errorMsg\" ng-show=\"errorMsg\">{{errorMsg}}</div>\n   </div>\n</script>\n\n<script type=\'text/ng-template\' id=\"singleFileUpload.html\">\n   <div ngf-drop=\"selectFile(picFile)\" ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\"\n        ng-model=\"picFile\" name=\"file\"\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n        ng-required=\"form.required\"\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\n      <p class=\"text-center\">{{ \'modules.upload.descriptionSinglefile\' | translate }}</p>\n   </div>\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\n\n   <button ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\" ng-model=\"picFile\" name=\"file\"\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n           ng-required=\"form.required\"\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\n      {{ \"buttons.add\" | translate }}\n   </button>\n</script>\n\n<script type=\'text/ng-template\' id=\"multiFileUpload.html\">\n   <div ngf-drop=\"selectFiles(picFiles)\" ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\"\n        ng-model=\"picFiles\" name=\"files\"\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n        ng-required=\"form.required\"\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\n      <p class=\"text-center\">{{ \'modules.upload.descriptionMultifile\' | translate }}</p>\n   </div>\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\n\n   <button ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\" multiple ng-model=\"picFiles\" name=\"files\"\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n           ng-required=\"form.required\"\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\n      {{ \"buttons.add\" | translate }}\n   </button>\n</script>\n");}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVtYS1mb3JtLWZpbGUuanMiLCJ0ZW1wbGF0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckpBLDhFQUFBIiwiZmlsZSI6InNjaGVtYS1mb3JtLWZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXJcblx0Lm1vZHVsZSgnc2NoZW1hRm9ybScpXG5cdC5jb25maWcoWydzY2hlbWFGb3JtUHJvdmlkZXInLCAnc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlcicsICdzZlBhdGhQcm92aWRlcicsXG5cdFx0ZnVuY3Rpb24oc2NoZW1hRm9ybVByb3ZpZGVyLCBzY2hlbWFGb3JtRGVjb3JhdG9yc1Byb3ZpZGVyLCBzZlBhdGhQcm92aWRlcikge1xuXHRcdFx0dmFyIGRlZmF1bHRQYXR0ZXJuTXNnID0gJ1dyb25nIGZpbGUgdHlwZS4gQWxsb3dlZCB0eXBlcyBhcmUgJyxcblx0XHRcdFx0ZGVmYXVsdE1heFNpemVNc2cxID0gJ1RoaXMgZmlsZSBpcyB0b28gbGFyZ2UuIE1heGltdW0gc2l6ZSBhbGxvd2VkIGlzICcsXG5cdFx0XHRcdGRlZmF1bHRNYXhTaXplTXNnMiA9ICdDdXJyZW50IGZpbGUgc2l6ZTonLFxuXHRcdFx0XHRkZWZhdWx0TWluSXRlbXNNc2cgPSAnWW91IGhhdmUgdG8gdXBsb2FkIGF0IGxlYXN0IG9uZSBmaWxlJyxcblx0XHRcdFx0ZGVmYXVsdE1heEl0ZW1zTXNnID0gJ1lvdSBjYW5cXCd0IHVwbG9hZCBtb3JlIHRoYW4gb25lIGZpbGUuJztcblxuXHRcdFx0dmFyIG53cFNpbmdsZWZpbGVVcGxvYWQgPSBmdW5jdGlvbihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIHNjaGVtYS5mb3JtYXQgPT09ICdzaW5nbGVmaWxlJykge1xuXHRcdFx0XHRcdGlmIChzY2hlbWEucGF0dGVybiAmJiBzY2hlbWEucGF0dGVybi5taW1lVHlwZSAmJiAhc2NoZW1hLnBhdHRlcm4udmFsaWRhdGlvbk1lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdHNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdFBhdHRlcm5Nc2c7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChzY2hlbWEubWF4U2l6ZSAmJiBzY2hlbWEubWF4U2l6ZS5tYXhpbXVtICYmICFzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZSkge1xuXHRcdFx0XHRcdFx0c2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWF4U2l6ZU1zZzE7XG5cdFx0XHRcdFx0XHRzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZTIgPSBkZWZhdWx0TWF4U2l6ZU1zZzI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChzY2hlbWEubWluSXRlbXMgJiYgc2NoZW1hLm1pbkl0ZW1zLm1pbmltdW0gJiYgIXNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xuXHRcdFx0XHRcdFx0c2NoZW1hLm1pbkl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdE1pbkl0ZW1zTXNnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoc2NoZW1hLm1heEl0ZW1zICYmIHNjaGVtYS5tYXhJdGVtcy5tYXhpbXVtICYmICFzY2hlbWEubWF4SXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdHNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNYXhJdGVtc01zZztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR2YXIgZiA9IHNjaGVtYUZvcm1Qcm92aWRlci5zdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0Zi5rZXkgPSBvcHRpb25zLnBhdGg7XG5cdFx0XHRcdFx0Zi50eXBlID0gJ253cEZpbGVVcGxvYWQnO1xuXHRcdFx0XHRcdG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cdFx0XHRcdFx0cmV0dXJuIGY7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdHNjaGVtYUZvcm1Qcm92aWRlci5kZWZhdWx0cy5hcnJheS51bnNoaWZ0KG53cFNpbmdsZWZpbGVVcGxvYWQpO1xuXG5cdFx0XHR2YXIgbndwTXVsdGlmaWxlVXBsb2FkID0gZnVuY3Rpb24obmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XG5cdFx0XHRcdGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBzY2hlbWEuZm9ybWF0ID09PSAnbXVsdGlmaWxlJykge1xuXHRcdFx0XHRcdGlmIChzY2hlbWEucGF0dGVybiAmJiBzY2hlbWEucGF0dGVybi5taW1lVHlwZSAmJiAhc2NoZW1hLnBhdHRlcm4udmFsaWRhdGlvbk1lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdHNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdFBhdHRlcm5Nc2c7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChzY2hlbWEubWF4U2l6ZSAmJiBzY2hlbWEubWF4U2l6ZS5tYXhpbXVtICYmICFzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZSkge1xuXHRcdFx0XHRcdFx0c2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWF4U2l6ZU1zZzE7XG5cdFx0XHRcdFx0XHRzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZTIgPSBkZWZhdWx0TWF4U2l6ZU1zZzI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChzY2hlbWEubWluSXRlbXMgJiYgc2NoZW1hLm1pbkl0ZW1zLm1pbmltdW0gJiYgIXNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xuXHRcdFx0XHRcdFx0c2NoZW1hLm1pbkl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdE1pbkl0ZW1zTXNnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoc2NoZW1hLm1heEl0ZW1zICYmIHNjaGVtYS5tYXhJdGVtcy5tYXhpbXVtICYmICFzY2hlbWEubWF4SXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UpIHtcblx0XHRcdFx0XHRcdHNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNYXhJdGVtc01zZztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR2YXIgZiA9IHNjaGVtYUZvcm1Qcm92aWRlci5zdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0Zi5rZXkgPSBvcHRpb25zLnBhdGg7XG5cdFx0XHRcdFx0Zi50eXBlID0gJ253cEZpbGVVcGxvYWQnO1xuXHRcdFx0XHRcdG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG5cdFx0XHRcdFx0cmV0dXJuIGY7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdHNjaGVtYUZvcm1Qcm92aWRlci5kZWZhdWx0cy5hcnJheS51bnNoaWZ0KG53cE11bHRpZmlsZVVwbG9hZCk7XG5cblx0XHRcdHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIuYWRkTWFwcGluZyhcblx0XHRcdFx0J2Jvb3RzdHJhcERlY29yYXRvcicsXG5cdFx0XHRcdCdud3BGaWxlVXBsb2FkJyxcblx0XHRcdFx0J2RpcmVjdGl2ZXMvZGVjb3JhdG9ycy9ib290c3RyYXAvbndwLWZpbGUvbndwLWZpbGUuaHRtbCdcblx0XHRcdCk7XG5cdFx0fVxuXHRdKTtcblxuYW5ndWxhclxuXHQubW9kdWxlKCduZ1NjaGVtYUZvcm1GaWxlJywgW1xuXHRcdCduZ0ZpbGVVcGxvYWQnLFxuXHRcdCduZ01lc3NhZ2VzJ1xuXHRdKVxuXHQuZGlyZWN0aXZlKCduZ1NjaGVtYUZpbGUnLCBbJ1VwbG9hZCcsICckdGltZW91dCcsICckcScsIGZ1bmN0aW9uKFVwbG9hZCwgJHRpbWVvdXQsICRxKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnQScsXG5cdFx0XHRzY29wZTogdHJ1ZSxcblx0XHRcdHJlcXVpcmU6ICduZ01vZGVsJyxcblx0XHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbCkge1xuXHRcdFx0XHRzY29wZS51cmwgPSBzY29wZS5mb3JtICYmIHNjb3BlLmZvcm0uZW5kcG9pbnQ7XG5cdFx0XHRcdHNjb3BlLmlzU2luZ2xlZmlsZVVwbG9hZCA9IHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5zY2hlbWEgJiYgc2NvcGUuZm9ybS5zY2hlbWEuZm9ybWF0ID09PSAnc2luZ2xlZmlsZSc7XG5cblx0XHRcdFx0c2NvcGUuc2VsZWN0RmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRzY29wZS5waWNGaWxlID0gZmlsZTtcblx0XHRcdFx0fTtcblx0XHRcdFx0c2NvcGUuc2VsZWN0RmlsZXMgPSBmdW5jdGlvbihmaWxlcykge1xuXHRcdFx0XHRcdHNjb3BlLnBpY0ZpbGVzID0gZmlsZXM7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0c2NvcGUudXBsb2FkRmlsZSA9IGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0XHRmaWxlICYmIGRvVXBsb2FkKGZpbGUpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHNjb3BlLnVwbG9hZEZpbGVzID0gZnVuY3Rpb24oZmlsZXMpIHtcblx0XHRcdFx0XHRmaWxlcy5sZW5ndGggJiYgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdFx0XHRkb1VwbG9hZChmaWxlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRmdW5jdGlvbiBkb1VwbG9hZChmaWxlKSB7XG5cdFx0XHRcdFx0aWYgKGZpbGUgJiYgIWZpbGUuJGVycm9yICYmIHNjb3BlLnVybCkge1xuXHRcdFx0XHRcdFx0ZmlsZS51cGxvYWQgPSBVcGxvYWQudXBsb2FkKHtcblx0XHRcdFx0XHRcdFx0dXJsOiBzY29wZS51cmwsXG5cdFx0XHRcdFx0XHRcdGZpbGU6IGZpbGVcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRmaWxlLnVwbG9hZC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRcdCR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdGZpbGUucmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdG5nTW9kZWwuJHNldFZpZXdWYWx1ZShyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHRcdFx0bmdNb2RlbC4kY29tbWl0Vmlld1ZhbHVlKCk7XG5cdFx0XHRcdFx0XHR9LCBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHNjb3BlLmVycm9yTXNnID0gcmVzcG9uc2Uuc3RhdHVzICsgJzogJyArIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRmaWxlLnVwbG9hZC5wcm9ncmVzcyhmdW5jdGlvbihldnQpIHtcblx0XHRcdFx0XHRcdFx0ZmlsZS5wcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgcGFyc2VJbnQoMTAwLjAgKlxuXHRcdFx0XHRcdFx0XHRcdGV2dC5sb2FkZWQgLyBldnQudG90YWwpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNjb3BlLnZhbGlkYXRlRmllbGQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZS4kdmFsaWQgJiYgc2NvcGUucGljRmlsZSAmJiAhc2NvcGUucGljRmlsZS4kZXJyb3IpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdzaW5nbGVmaWxlLWZvcm0gaXMgaW52YWxpZCcpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlcyAmJiBzY29wZS51cGxvYWRGb3JtLmZpbGVzLiR2YWxpZCAmJiBzY29wZS5waWNGaWxlcyAmJiAhc2NvcGUucGljRmlsZXMuJGVycm9yKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnbXVsdGlmaWxlLWZvcm0gaXMgIGludmFsaWQnKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3NpbmdsZS0gYW5kIG11bHRpZmlsZS1mb3JtIGFyZSB2YWxpZCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblx0XHRcdFx0c2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKHNjb3BlLnVwbG9hZEZvcm0uZmlsZSAmJiBzY29wZS51cGxvYWRGb3JtLmZpbGUuJHZhbGlkICYmIHNjb3BlLnBpY0ZpbGUgJiYgIXNjb3BlLnBpY0ZpbGUuJGVycm9yKSB7XG5cdFx0XHRcdFx0XHRzY29wZS51cGxvYWRGaWxlKHNjb3BlLnBpY0ZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlcyAmJiBzY29wZS51cGxvYWRGb3JtLmZpbGVzLiR2YWxpZCAmJiBzY29wZS5waWNGaWxlcyAmJiAhc2NvcGUucGljRmlsZXMuJGVycm9yKSB7XG5cdFx0XHRcdFx0XHRzY29wZS51cGxvYWRGaWxlcyhzY29wZS5waWNGaWxlcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRzY29wZS4kb24oJ3NjaGVtYUZvcm1WYWxpZGF0ZScsIHNjb3BlLnZhbGlkYXRlRmllbGQpO1xuXHRcdFx0XHRzY29wZS4kb24oJ3NjaGVtYUZvcm1GaWxlVXBsb2FkU3VibWl0Jywgc2NvcGUuc3VibWl0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XSk7IixudWxsXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
