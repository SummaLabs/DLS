(function () {
  'use strict';
  angular
      .module('convolEditor', ['ngMaterial'])
	  .component('convolEditor', {
				templateUrl: "frontend/components/layers/convol/convol-editor.html",
				controller: function () { 
					this.$onInit = function () {
						this.act_funcs = [
							{	value: "Sigmoid", 	text: "Sigmoid"	},
							{	value: "Tanh", 		text: "Tanh"	},
							{	value: "ReLU", 		text: "ReLU"	}
						];
						
						this.subsample_types = [
							{	value: "MaxPooling", 		text: "Max Pooling"	},
							{	value: "AveragePooling", 	text: "Average Pooling"	}
						];
					};
				}
				
	  });
	  
	  
})();