(function () {
  'use strict';
  angular
      .module('denseLayer', ['ngMaterial'])
	  .component('dlsDenseInputs', {
			templateUrl: "frontend/components/layers/dense/dls-dense-inputs.html",
			controller: function() {
				this.$onInit = function () {
					this.act_funcs = [
							{	value: "Sigmoid", 	text: "Sigmoid"	},
							{	value: "Tanh", 		text: "Tanh"	},
							{	value: "ReLU", 		text: "ReLU"	},
							{	value: "SoftMax", 	text: "SoftMax"	},
						];
				};
			}
	  });
	  
	  
})();