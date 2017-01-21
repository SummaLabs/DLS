/**
 * Created by ar on 21.01.17.
 */

import {LW_Convolution1D, LW_AtrousConvolution1D,
    LW_Convolution2D, LW_AtrousConvolution2D, LW_SeparableConvolution2D,
    LW_Convolution3D,
    LW_UpSampling1D, LW_UpSampling2D, LW_UpSampling3D,
    LW_ZeroPadding1D, LW_ZeroPadding2D, LW_ZeroPadding3D,
    LW_Cropping1D, LW_Cropping2D, LW_Cropping3D} from './models/lightweight_layers/layers_convolutional';



export let test_layers_convolutional = function () {
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

    /*
     Simple test: AtrousConvolution2D Layer
     */
    let atrousConv2DLayer = new LW_AtrousConvolution2D({nb_filter:32, nb_row:5, nb_col:5});
    let atrousConv2DLayer_CalculatedShape_1 = atrousConv2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let atrousConv2DLayer_CalculatedShape_2 = atrousConv2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${atrousConv2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${atrousConv2DLayer_CalculatedShape_1}\n`);
    console.log(`${atrousConv2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${atrousConv2DLayer_CalculatedShape_2}\n\n\n`);
};



