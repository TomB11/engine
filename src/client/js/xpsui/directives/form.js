(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiForm', [
		'$compile',
		'$parse',
		'xpsui:logging',
		'xpsui:FormGenerator',
		'xpsui:Calculator',
		'$translate',
		'$timeout',
		'xpsui:calculator2',
		function($compile, $parse, log, formGenerator, calculator, $translate, $timeout, calculator2) {
			return {
				restrict: 'A',
				require: '^form',
				controller: [ '$scope', '$element', '$attrs', function($scope, $element, $attrs) {
					this.focusedElm = null;

					this.acquireFocus = function(e) {
						if (this.focusedElm === null || this.focusedElm === e) {
							this.focusedElm = e;
							return true;
						}

						return false;
					};

					this.releaseFocus = function(e) {
						if (this.focusedElm === e) {
							this.focusedElm = null;
							return true;
						}

						return false;
					};

					var unregistrations = [];

					var canCalculate = false;

					unregistrations.push($scope.$on('xpsui:data-unstable', function() {
						canCalculate = false;
					}));

					unregistrations.push($scope.$on('xpsui:data-stable', function() {
						$timeout(function() {canCalculate = true; }, 500);
					}));

					$scope.$on('$destroy', function() {
						unregistrations.map(function(i) {
							i();
						});
					});

					this.registerCalculation2 = function(def, callback) {
						if (!angular.isArray(def.watch)) {
							// FIXME errorify
							throw 'no watches';
						}

						var watches = def.watch;

						// prefix watchers my root model path
						if ($attrs.xpsuiModel) {
							watches = def.watch.map(function(val) {
								return $attrs.xpsuiModel.concat('.', val);
							});
						}

						var calc = calculator2.createCalculator(def);

						function calculate() {
							calc.execute(
								calculator2.createCtx($scope, $parse($attrs.xpsuiModel)($scope)
							)).then(function(result) {
								callback(null, result);
							}, function(err) {
								callback(err, def.empty || null);
								// FIXME do something with error
							});
						}

						calculate();

						return $scope.$watchGroup(watches, function(nv, ov) {
							var changed = false;

							for (var i in nv) {
								if (nv[i] !== ov[i]) {
									changed = true;
								}
							}

							if (changed) {
								calculate();
							}
						});
					};

					/**
					 * Registers a calculation for the `model` based on the `scheam`
					 *
					 * @param {string} model
					 * @param {object} schema
					 * @returns {function()} Returns a deregistration function for this listener
					 */
					this.registerCalculation = function(model, schema) {
						// Create new Computed property
						var property = calculator.createProperty(schema),
							// getter for the form model
							formModelGetter = $parse($attrs.xpsuiModel),
							// getter for the current model
							modelGetter = $parse(model);

						// Get form model
						var formModel = formModelGetter($scope);

						function calculate() {
							if (!canCalculate) {
								return;
							}

							// Get model value
							var modelValue = modelGetter($scope);
							var formModel = formModelGetter($scope);

							// Check 'onlyEmpty' flag - run calculation only if the this flag is not set or
							// current model value is empty
							// NOTE: Do not use !model because "false" can be allowed value
							if (!schema.onlyEmpty || modelValue === undefined || modelValue === "") {
								// Run first calculation
								property.getter(formModel).then(function (result) {
									modelGetter.assign($scope, result);
								});
							}
						}

						//calculate();

						// Register property watcher
						return $scope.$watch(property.watcher(formModelGetter, $scope), function(newValue, oldValue) {
							if (newValue !== oldValue) {
								calculate();
							}
						}, true); // NOTE: Always use TRUE for computedProperty.watcher
					};
				}],
				link: function(scope, elm, attrs, ctrls) {
					log.group('xpsuiForm Link');
					log.time('xpsuiForm Link');

					var formCtrl = ctrls;

					formCtrl.xpsui = formCtrl.xpsui || {
						submitPrepare: false,
						prepareForSubmit: function() {
							formCtrl.xpsui.submitPrepare = true;
						}
					};

					elm.addClass('x-form');

					if (attrs.xpsuiModel && attrs.xpsuiSchema) {
					} else {
						log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping form generation');
						log.timeEnd('xpsuiForm Link');
						log.groupEnd();
						return;
					}

					// we are watching collection because it will be loaded later after element creation
					scope.$watchCollection( attrs.xpsuiSchema, function() {
						log.info('xpsuiForm generate');
						var schema = scope.$eval(attrs.xpsuiSchema);
						var mode = attrs.xpsuiForm;

						// ACTIONS
						if ( "viewedit"===mode && schema.clientActions ) {
							var contentActionsHolder = angular.element('<div class="content-actions pull-right"></div>');
							elm.append(contentActionsHolder);

							for (var actionIndex in schema.clientActions) {
								var action = schema.clientActions[actionIndex];

								var actionElm;
								switch (action.__DIRECTIVE__){
									case 'action-link':
										actionElm = angular.element('<a xpsui-form-action-link psui-options="schemaFormOptions.schema.clientActions['+actionIndex+']" psui-model="'+attrs.xpsuiModel+'" class="btn-primary"></a>');
										$compile(actionElm)(scope);
										contentActionsHolder.append(actionElm);
									break;
									case 'url-link':
										actionElm = angular.element('<a xpsui-form-url-link psui-options="schemaFormOptions.schema.clientActions['+actionIndex+']" psui-model="'+attrs.xpsuiModel+'" class="btn-primary"></a>');
										$compile(actionElm)(scope);
										contentActionsHolder.append(actionElm);
									break;
									case 'generate-action-link':
										actionElm = angular.element('<a xpsui-form-generate-action-link psui-options="schemaFormOptions.schema.clientActions['+actionIndex+']" psui-model="'+attrs.xpsuiModel+'" class="btn-primary"></a>');
										$compile(actionElm)(scope);
										contentActionsHolder.append(actionElm);
									break;
									default:
									console.error('Unknown directive value',action.__DIRECTIVE__);
									break;
								}

							}
						}

						if(schema.properties){
							elm.append('<div class="x-form-title">'
								+ (schema.transCode ? $translate.instant(schema.transCode) : schema.title)
								+ '</div>'
							);
							formGenerator.generateForm(scope, elm, schema, attrs.xpsuiSchema, attrs.xpsuiModel, mode || formGenerator.MODE.VIEW);
						} else {
							log.info('xpsuiForm schema does not exist');
						}


					});

					log.timeEnd('xpsuiForm Link');
					log.groupEnd();
				}
			};
		}
	]);


}(window.angular));
