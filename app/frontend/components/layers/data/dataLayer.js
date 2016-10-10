angular.module('dataLayer', [])
    .service('dataLayer', [DataLayer]);

function DataLayer() {

    this.getDataTypes = function () {
        return [
            {value: "Image", text: "Image"},
            {value: "CSV", text: "CSV"}
        ];
    };

    this.getDefaultSettings = function () {
        return {
            "datasetType": "",
            "datasetId": ""
        }
    }
}