'use strict';

angular.module('datasetBuilder', ['ngMaterial'])
.component('datasetBuilder', {
    templateUrl: '/frontend/components/builder/dataset/dataset-builder.html',
    bindings: {
        datasetTypes: '<',
        selected: '<'
    },
    controller: function ($scope, $mdDialog, $rootScope) {
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
        self.$onInit = function () {
            self.items = [
                {name: "Text Data", icon: "text_fields", direction: "bottom"},
                {name: "Image 3D", icon: "photo_library", direction: "top"},
                {name: "Image 2D", icon: "photo", direction: "bottom"}
            ];
            self.datasetTypes = {
                image2d:{
                    typeId:   "image2d",
                    textName: "Create Image2D Dataset",
                    iconName: "photo"
                },
                image3d:{
                    typeId:   "image3d",
                    textName: "Create Image3D Dataset",
                    info:     "Create Image3D Dataset",
                    iconName: "photo_library"
                },
                text1:{
                    typeId:   "text1",
                    textName: "Create Text Dataset",
                    iconName: "text_fields"
                },
                import_csv:{
                    typeId:   "import_csv",
                    textName: "Import CSV Dataset",
                    iconName: "assignment"
                }
            };
            self.datasetTypesKeys=self.datasetTypes.keys;
            // self.selected=self.datasetTypes.image2d;
        };

        self.toggleList = function () {
            console.log('::toggleList()');
        };
        self.selectDbType = function (pType) {
            self.selected = pType;
            console.log(pType);
        }
    }
});
