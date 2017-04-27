'use strict';


function DataSetBuilderService ($http) {

    let table = null;

    this.initTable = function () {
        table = new DataTable();
        this.getDataSetTypes().then(
            function success(response) {
                let types = response.data.column;
                table.setSupportedTypes(types);
            },
            function error(response) {
                console.log(response.data);
            }
        );

        return table;
    };

    this.getTable = function () {
        return table;
    };


    this.loadRecordsFromCsv = function (path, separator, rows_num) {
        return $http({
            method: 'POST',
            url:    '/dataset/csv/load/rows',
            params: {
                'file-path': path,
                'separator': separator,
                'rows-num': rows_num
            }
        });
    };

    this.getDataSetTypes = function () {
        return $http({
            method: 'GET',
            url:    '/dataset/data/types/config'
        });
    };

}

const types = new Map();
const typesNames = [];


class DataTable {

    static get columnTypes () {
        let types = new Map([
            ['image2d', {
                headerClass: HeaderItem,
                cellClass: CellItem
            }],
            ['number', {
                headerClass: NumberHeaderItem,
                cellClass: NumberCellItem
            }],
            ['string', {
                headerClass: HeaderItem,
                cellClass: CellItem
            }],
            ['string1', {
                headerClass: HeaderItem,
                cellClass: CellItem
            }]
        ]);
        return types;
    }

    static get types () {
        return types;
    }

    constructor(/*path, header, delimiter*/) {
        this.headers = [];
        this.rows = [];
        this.trainingRows = [];
        this.validationRows = [];
        this.selectedColumnIndexes = [];
        this.config = {
            filePath: null,
            header: null,
            threads: 1,
            delimiter: ','
        };
    }

    get supportedTypes() {
        return typesNames;
    }

    setSupportedTypes(types) {
        types.forEach(function (item) {
            if (!DataTable.types.has(item.type)) {
                DataTable.types.set(item.type, item);
                typesNames.push(item.type);
            }
        });
    }

    createTableHeader(firstRow, headerExist) {
        let headerSize = firstRow.length;
        for (let index = 0; index < headerSize; ++index) {
            let name = headerExist ? firstRow[index]: "col_" + index;
            let header = this.createColumnHeader(index, name);
            this.headers.push(header);
        }

    }

    createColumnHeader(index, name) {
        let type = this.supportedTypes[0];
        let Header = this.headerClassByType(type);
        return new Header(type, index, name);
    }

    createTableRow(row) {
        let CellItemString = this.cellClassByType('string');
        let rowItem = new RowItem();

        for (let cell of row) {
            rowItem.addCell(new CellItemString('string', cell));
        }
        return rowItem;
    }

    loadData(trainingData, validationData, header) {
        this.config.header=header;
        this.createTableHeader(trainingData[0], header);

        let firstRowIndex = header ? 1 : 0;
        for (let i = firstRowIndex; i < trainingData.length; ++i) {
            this.trainingRows.push(this.createTableRow(trainingData[i]));
        }
        
        for (let i = firstRowIndex; i < validationData.length; ++i) {
            this.validationRows.push(this.createTableRow(validationData[i]));
        }

        Array.prototype.push.apply(this.rows, this.trainingRows);
    }

    setTrainingData() {
        this.rows = this.trainingRows
    }

    setValidationData() {
        this.rows = this.validationRows
    }

    headerClassByType(type) {
        /*let types = DataTable.columnTypes;
        if (types.has(type))
            return types.get(type).headerClass;*/

        return HeaderItem;
    }

    cellClassByType(type) {
        let types = DataTable.columnTypes;
        if (types.has(type)) {
            return types.get(type).cellClass;
        }
    }

    checkColumn(header) {
        let headerIndex = this.headers.indexOf(header);
        if (headerIndex > -1) {
            let index = this.selectedColumnIndexes.indexOf(headerIndex);
            if (index < 0)
                this.selectedColumnIndexes.push(headerIndex);
            else this.selectedColumnIndexes.splice(index, 1);
        }
    }

    mergeColumns() {
        if (this.selectedColumnIndexes.length < 2)
            return;

        this.mergeHeaders(this.selectedColumnIndexes);

        let destinationColumnIndex = this.selectedColumnIndexes[0];
        let columnsToMergeIndexes = this.selectedColumnIndexes.slice(1, this.selectedColumnIndexes.length);
        
        for(let row of this.trainingRows) {
            row.mergeCells(destinationColumnIndex, columnsToMergeIndexes);
        }
        
        for(let row of this.validationRows) {
            row.mergeCells(destinationColumnIndex, columnsToMergeIndexes);
        }
        
        this.selectedColumnIndexes.length = 0;
        this.removeColumns(columnsToMergeIndexes);
    }

    mergeHeaders(columnIndexes) {
        let destinationHeader = this.headers[columnIndexes[0]];
        destinationHeader.selected = false;

        let headerToMergeInxs = columnIndexes.slice(1, columnIndexes.length);
        for(let headerToMergeInx of headerToMergeInxs) {
            destinationHeader.mergeWith(this.headers[headerToMergeInx]);
        }
    }

    removeColumn(index) {
        this.headers.splice(index, 1);
        
        for(let row of this.trainingRows) {
            row.cells.splice(index, 1);
        }
        
        for(let row of this.validationRows) {
            row.cells.splice(index, 1);
        }
    }

    removeColumns(indexes) {
        if (!indexes)
            indexes = this.selectedColumnIndexes;
        let counter = 0;
        for (let index of indexes) {
            this.removeColumn(index - counter++);
        }
        this.selectedColumnIndexes.length = 0;
    }
}

class HeaderItem {

    constructor(type, index, name) {
        this.type = type;
        this.name = name;
        this.selected = false;
        this.template = null;
        this.columnsIndexes = [index];

        this.buildTemplate();
    }

    getTemplate() {
        return this.template;
    }

    buildTemplate() {

        console.log(DataTable.types);
        console.log(this.type);
        let params = DataTable.types.get(this.type);
        console.log(params);

        let settingsTemplate = '';
        if (params.transforms) {
            for (let param of params.transforms) {
                console.log(param);
                for (let elem in param.config) {
                    console.log(elem);
                    if (param.config[elem].input === 'list') {
                        settingsTemplate += buildList(param.config[elem], elem);
                    } else if (param.config[elem].input === 'int') {
                        settingsTemplate += buildInteger(param.config[elem], elem);
                    }

                }
            }
        }


        this.template = `
            <md-dialog aria-label=${this.name}>
                <form ng-cloak>
                    <md-toolbar>
                        <div class="md-toolbar-tools">
                        <h2>Settings - ${this.name}</h2>
                        <span flex></span>
                        <md-button class="md-icon-button" ng-click="cancel()">
                        <md-icon>close</md-icon>
                        </md-button>
                        </div>
                    </md-toolbar>
                    <md-dialog-content  layout="column">
                        ${settingsTemplate}
                    </md-dialog-content>
                    <md-dialog-actions layout="row">
                        <md-button ng-click="ok()" md-autofocus>
                            Применить
                        </md-button>
                        <span flex></span>
                    </md-dialog-actions>
                
                <form ng-cloak>
            </md-dialog>
        `;
    }

    toString() {
        return this.name + `(${this.type})`;
    }

    mergeWith(item) {
        this.columnsIndexes = this.columnsIndexes.concat(item.columnsIndexes);
        this.name += '_' + item.name;
    }

    controller() {
        let self = this;

        return function ($scope, $mdDialog) {
            $scope.data = self.params;
            $scope.ok = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.hide();
            };
        };
    }

    set changeType(type) {
        this.type = type;
        this.buildTemplate();
        console.log(type);
    }

}

class CellItem {

    constructor(type, value) {
        this.type = type;
        this.value = value;
    }

    getTitle() {
        return this.value;
    }

    toString() {
        return this.getTitle();
    }

    mergeWith(cell) {
        this.value += ', ' + cell.value;
    }
}

class RowItem {

    constructor(cells = []) {
        this.cells = cells;
    }

    addCell(cell) {
        this.cells.push(cell);
    }

    addCells(cells) {
        this.cells.push(cells);
    }

    getCell(index = 0) {
        if (this.cells.length <= index)
            return;

        return this.cells[index];
    }

    mergeCells(destIndex, srcIndexes) {
        if (typeof destIndex !== 'number' || !Array.isArray(srcIndexes))
            return;

        let destCell = this.cells[destIndex];

        for(let cell of srcIndexes) {
            destCell.mergeWith(this.cells[cell]);
        }
    }

}

class NumberHeaderItem extends HeaderItem {

    constructor(name) {
        super('number', name);

    }

    mergeWith(item) {
        this.name += ' + ' + item.name;
    }
}

class NumberCellItem extends CellItem {

    constructor(value) {

        super('number', value);
    }

    getTitle() {
        return this.value;
    }

    toString() {
        return this.getTitle();
    }

    mergeWith(cell) {
        this.value += cell.value;
    }
}


function buildList(list, name) {
    let template = `
        <md-input-container style="margin: 10px;">
            <label>${list.name}</label>
            <md-select ng-model="data.${name}.value" aria-label="favoriteColor">
                <md-option ng-click="selected()" ng-value="item" ng-repeat="item in data.${name}.list">{{item}}</md-option>
             </md-select>
        </md-input-container>
        `;
    return template;
}

function buildInteger(obj, name) {
    let template = `
        <md-input-container>
            <label>${obj.name}</label>
            <input ng-model="data.${name}.value" type="number" required>
        </md-input-container>
     `;
    return template;
}