(function () {
    'use strict';

    angular.module('mainDataSet', ['ngMaterial'])
        .component('mainDataSet', {
            templateUrl: '/frontend/components/data-set-main/main-data-set.html',
            bindings: {
                models: '<'
            },
            controller: function ($scope, $rootScope, $mdDialog, $timeout, appConfig) {
                $rootScope.intabSelectedIndex = 4;
                var self = this;
                self.hidden = false;
                self.isOpen = false;
                self.hover = false;
                $scope.$watch('eventIsOpen', function (isOpen) {
                    if (isOpen) {
                        $timeout(function () {
                            $scope.tooltipVisible = self.isOpen;
                        }, 600);
                    } else {
                        $scope.tooltipVisible = self.isOpen;
                    }
                });
                self.items = [
                    {name: "Text Data", icon: "text_fields", direction: "bottom"},
                    {name: "Image 3D", icon: "photo_library", direction: "top"},
                    {name: "Image 2D", icon: "photo", direction: "bottom"}
                ];
                //
                self.openDialogCreateDataset = function ($event, item) {
                    if(item.name=='Image 2D') {
                        $mdDialog.show({
                            controller: DialogControllerCreateDatasetImage2D,
                            templateUrl: '/frontend/components/dialog/dialog-create-dataset-image2d.html',
                            parent: angular.element(document.body),
                            targetEvent: $event,
                            clickOutsideToClose: true,
                            fullscreen: true // Only for -xs, -sm breakpoints.
                        });
                    // .then(function (answer) {
                    //         // $scope.status = 'You said the information was "' + answer + '".';
                    //     }, function () {
                    //         // $scope.status = 'You cancelled the dialog.';
                    //     });
                    } else {
                        $mdDialog.show(
                        $mdDialog.alert()
                            .title('Currently not implemented :(')
                            .textContent('Dataset type [' + item.name + '] is not implemented yet!')
                            .ariaLabel('Primary click demo')
                            .ok('Ok')
                            .targetEvent(event)
                    );
                    }
                };
                function DialogControllerCreateDatasetImage2D($scope, $mdDialog) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };
                }
                //
                self.$onInit = function () {
                    self.models = [
                        { name: 'Data Set 1'},
                        { name: 'Data Set 2'},
                        { name: 'Data Set 3'},
                        { name: 'Data Set 4'}
                    ]
                };

                this.createDialog = function(event) {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = false;
                	$mdDialog.show({
						controller: DialogControllerFS,
						templateUrl: 'frontend/components/dialog/file-manager.html',
						parent: angular.element(document.body),
						targetEvent: event,
						clickOutsideToClose:false
					});
                };
            }
        });
})();

function DialogControllerFS($scope, $mdDialog, $rootScope) {

	$scope.select = function(answer) {
		$mdDialog.hide(answer);

        console.log('/' + $rootScope.selectedModalPath.join('/'));
		$rootScope.selectedFiles.forEach(function(item, i, array) {
            console.log(item.model.fullPath(), item.model.name,
                        item.model.type, item.model.size );
		});
	};

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
};