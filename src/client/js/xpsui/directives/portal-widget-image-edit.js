(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetImageEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetImageEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-image-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button icon-chevron-up" ng-click="moveUp();"></i><i class="action-button icon-chevron-down" ng-click="moveDown();"></i><i class="action-button icon-trash" ng-click="remove();"></i></div></div>');
				var content = angular.element('<div class="psui-wrapper" style="text-align: center;"><div xpsui-uploadable-image="" xpsui-imageresizor="" psui-width={{data.data.config.width}} psui-height={{data.data.config.height}} ng-model="data.data.img" style="width: 100% !important; height: 492px !important; background-image: url(https://localhost:3443/img/no_image.jpg); margin:0;" class="xpsui-uploadable-image xpsui-imageresizor"></div></div>');

				elm.append(titleBar);
				elm.append(content);

				$compile(titleBar)(scope);
				$compile(content)(scope);

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


