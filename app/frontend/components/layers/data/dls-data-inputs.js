(function () {
  'use strict';
  angular
      .module('dataLayer', ['ngMaterial'])
	  .component('dlsDataInputs', {
			templateUrl: "frontend/components/layers/data/dls-data-inputs.html",
			controller: function() {
				this.$onInit = function () {
					this.dataset_types = [
						{	value: "Image", 	text: "Image"	},
						{	value: "CSV", 		text: "CSV"	}
					];
					
					this.dataset_names = [
						{	value: "load1", 	text: "load1"	},
						{	value: "load2", 	text: "load2"	}
					];
				};
			}
	  });
	  
	  
})();