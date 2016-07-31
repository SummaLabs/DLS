(function () {
  'use strict';
  angular
      .module('denseEditor', ['ngMaterial'])
	  .component('denseEditor', {
			templateUrl: "frontend/components/layers/dense/dense-editor.html",
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