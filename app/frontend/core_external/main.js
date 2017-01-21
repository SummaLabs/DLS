/**
 * Created by ar on 17.01.17.
 */

import {test_layers_basic}          from './main_test_basic';
import {test_layers_convolutional}  from './main_test_convolutional';
import {test_layers_pooling}        from './main_test_pooling';


// (1) Test Basic layers
console.log('\n\n****************** [    TEST BASIC LAYERS    ] ******************');
test_layers_basic();

// (2) Test Convolutional layers
console.log('\n\n****************** [ TEST BASIC CONVOLUTIONAL ] ******************');
test_layers_convolutional();

// (3) Test Pooling layers
console.log('\n\n****************** [    TEST BASIC Pooling    ] ******************');
test_layers_pooling();









