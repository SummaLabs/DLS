(function () {
  'use strict';
  angular
      .module('solverLayer', ['ngMaterial'])
	  .component('dlsSolverInputs', {
			templateUrl: "frontend/components/layers/solver/dls-solver-inputs.html",
			controller: function () {
				this.$onInit = function () {
					this.loss_funcs = [
						{	value: "CategoricalCrossEntropy", 	text: "Categorical Cross Entropy"	},
					];
					this.act_funcs = [
						{	value: "SGD", 	text: "Stochastic gradient descent (SGD)"	},
						{	value: "RMSprop", 		text: "RMSProp optimizer"	},
						{	value: "Adagrad", 		text: "Adagrad optimizer"	},
						{	value: "Adadelta", 	text: "Adadelta optimizer"	},
						{	value: "Adam", 	text: "Adam optimizer"	},
						{	value: "Adamax", 	text: "Adamax optimizer"	},
						{	value: "Nadam", 	text: "Nesterov Adam optimizer"	},
					];
				};
			}
	  });
	  
	  
})();