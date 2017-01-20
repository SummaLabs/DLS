/**
 * Created by ar on 17.01.17.
 */

import {LW_InputLayer, LW_Merge, LW_Flatten, LW_Dense, LW_Activation} from './models/lightweight_layers/layers_basic';
import {LW_Convolution1D, LW_AtrousConvolution1D,
        LW_Convolution2D} from './models/lightweight_layers/layers_convolutional';

const INPUT_SHAPE_1 = [null, 256,256,3];
const INPUT_SHAPE_2 = [null, 256];

/*
 Simple test: Input Layer
 */
let inputLayer = new LW_InputLayer();
let inputLayer_CalculatedShape_1 = inputLayer.get_output_shape_for(INPUT_SHAPE_1);
let inputLayer_CalculatedShape_2 = inputLayer.get_output_shape_for(INPUT_SHAPE_2);

console.log(`${inputLayer.toString()} ->calculatedShape(${INPUT_SHAPE_1}) : ${inputLayer_CalculatedShape_1}\n`);
console.log(`${inputLayer.toString()} ->calculatedShape(${INPUT_SHAPE_2}) : ${inputLayer_CalculatedShape_2}\n\n\n`);

/*
 Simple test: Activation Layer
 */
let activationLayer = new LW_Activation();
let activationLayer_CalculatedShape_1 = activationLayer.get_output_shape_for(INPUT_SHAPE_1);
let activationLayer_CalculatedShape_2 = activationLayer.get_output_shape_for(INPUT_SHAPE_2);

console.log(`${activationLayer.toString()} ->calculatedShape(${INPUT_SHAPE_1}) : ${activationLayer_CalculatedShape_1}\n`);
console.log(`${activationLayer.toString()} ->calculatedShape(${INPUT_SHAPE_2}) : ${activationLayer_CalculatedShape_2}\n\n\n`);

/*
 Simple test: Dense Layer
 */
let denseLayer = new LW_Dense(128);
try {
    let denseLayer_CalculatedShape_1 = denseLayer.get_output_shape_for(INPUT_SHAPE_1);
    console.log(`${denseLayer.toString()} ->calculatedShape(${INPUT_SHAPE_1}) : ${denseLayer_CalculatedShape_1}\n`);
} catch (err) {
    console.log(`Error: ${err}`);
}

let denseLayer_CalculatedShape_2 = denseLayer.get_output_shape_for(INPUT_SHAPE_2);
console.log(`${denseLayer.toString()} ->calculatedShape(${INPUT_SHAPE_2}) : ${denseLayer_CalculatedShape_2}\n\n\n`);

/*
 Simple test: Merge Layer
 */

let mergeLayer1 = new LW_Merge({mode:'concat'});
const INPUT_SHAPES_MERGE_1 = [[null,128], [null, 128]];
const INPUT_SHAPES_MERGE_2 = [[null,256,256,3], [null, 256,256,1]];
const INPUT_SHAPES_MERGE_3 = [[null,3, 256,256,256], [null, 1, 256, 256,256]];
let mergeLayer_CalculatedShape_1 = mergeLayer1.get_output_shape_for(INPUT_SHAPES_MERGE_1);
let mergeLayer_CalculatedShape_2 = mergeLayer1.get_output_shape_for(INPUT_SHAPES_MERGE_2);

console.log(`${mergeLayer1.toString()} ->calculatedShape(${INPUT_SHAPES_MERGE_1}) : ${mergeLayer_CalculatedShape_1}\n`);
console.log(`${mergeLayer1.toString()} ->calculatedShape(${INPUT_SHAPES_MERGE_2}) : ${mergeLayer_CalculatedShape_2}\n`);

let mergeLayer2 = new LW_Merge({mode:'concat', concat_axis:1});
for(let ii=1; ii<5; ii++) {
    mergeLayer2.concat_axis = ii;
    let mergeLayer_CalculatedShape_3 = mergeLayer2.get_output_shape_for(INPUT_SHAPES_MERGE_3);
    console.log(`\tconcatAxis = ${ii}, ${mergeLayer2.toString()} ->calculatedShape(${INPUT_SHAPES_MERGE_3}) : ${mergeLayer_CalculatedShape_3}\n`);
}

/*
 Simple test: Convolution1D Layer
 */
let conv1DLayer = new LW_Convolution1D({nb_filter:5, filter_length:3});
//FIXME: check, that Conv1D input shape does not depend from type of Framework, and defined in form: [None, #Time-steps, #Channels]
const INPUT_SHAPES_CONV1D_1 = [null, 32,  1];
const INPUT_SHAPES_CONV1D_2 = [null, 128, 3];
let conv1DLayer_CalculatedShape_1 = conv1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
let conv1DLayer_CalculatedShape_2 = conv1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_2);
console.log(`${conv1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${conv1DLayer_CalculatedShape_1}\n`);
console.log(`${conv1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${conv1DLayer_CalculatedShape_2}\n\n\n`);

/*
 Simple test: AtrousConvolution1D Layer
 */
let atrous1DLayer = new LW_AtrousConvolution1D({nb_filter:5, filter_length:3});
let atrous1DLayer_CalculatedShape_1 = atrous1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
let atrous1DLayer_CalculatedShape_2 = atrous1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_2);

console.log(`${atrous1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${atrous1DLayer_CalculatedShape_1}\n`);
console.log(`${atrous1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${atrous1DLayer_CalculatedShape_2}\n\n\n`);


/*
 Simple test: Convolution2D Layer
 */
let conv2DLayer = new LW_Convolution2D({nb_filter:16, nb_row:3, nb_col:3});
const INPUT_SHAPES_CONV2D_1 = [null, 1, 128, 128];
const INPUT_SHAPES_CONV2D_2 = [null, 3, 256, 256];

let conv2DLayer_CalculatedShape_1 = conv2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
let conv2DLayer_CalculatedShape_2 = conv2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
console.log(`${conv2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${conv2DLayer_CalculatedShape_1}\n`);
console.log(`${conv2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${conv2DLayer_CalculatedShape_2}\n\n\n`);





