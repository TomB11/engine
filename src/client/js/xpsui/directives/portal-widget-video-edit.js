(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetVideoEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetVideoEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit', '^ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-video-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button icon-chevron-up" ng-click="moveUp();"></i><i class="action-button icon-chevron-down" ng-click="moveDown();"></i><i class="action-button icon-trash" ng-click="remove();"></i></div></div>');
				var content = angular.element(
						'<form class="form">'
						+'<fieldset class="form-group" style="background-color: black; padding: 10px;" ng-show="mode !== \'edit\'">'
						+'<div style="background-color: white; padding-top: 10px; padding-bottom: 10px;">'
						+' <div class="form-group row">'
						+'  <label class="col-sm-2 control-label">Video embed URL:</label>'
						+'  <div class="col-sm-4"><div class="input-group"><input ng-model="data.data.src" ng-change="changeUrlVideoInWidget()"/></div></div>'
						+' </div>'
						+' <div class="form-group row">'
						+'  <label class="col-sm-2 control-label">Title:</label>'
						+'  <div class="col-sm-4"><div class="input-group"><input ng-model="data.data.title"/></div></div>'
						+' </div>'
						+' <div class="form-group row">'
						+'  <label class="col-sm-2 control-label">Subtitle:</label>'
						+'  <div class="col-sm-4"><div class="input-group"><input ng-model="data.data.subTitle" /></div></div>'
						+' </div>'
						+' <div class="form-group row">'
						+'  <label class="col-sm-2 control-label">Text:</label>'
						+'  <div class="col-sm-4"><div class="input-group"><section class="content" xpsui-contenteditable="true" ng-model="data.data.text"></section></div></div>'
						+' </div>'
						+'</div>'
						+'</fieldset>'
						+'</form>'
					);

				elm.append(titleBar);
				elm.append(content);

				$compile(titleBar)(scope);
				$compile(content)(scope);

				scope.changeUrlVideoInWidget = function() {
					console.log('firstURL= ' +  scope.data.data.src);

					var fixURL = scope.data.data.src;
					scope.data.data.src = fixURL.replace("watch?v=", "embed/");

					console.log('secondURL= ' +  scope.data.data.src);
				};

				scope.moveUp = function() {
					ctrls[0].moveUp(scope.index);
				};

				scope.moveDown = function() {
					ctrls[0].moveDown(scope.index);
				};

				scope.remove = function() {
					ctrls[0].remove(scope.index);
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


