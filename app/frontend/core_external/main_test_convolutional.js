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
    console.log(`\t\t>>>>>> Convolution 1D <<<<<<<`);
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
    console.log(`\t\t>>>>>> Convolution 2D <<<<<<<`);
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

    /*
     Simple test: SeparableConvolution2D Layer
     */
    let sepConv2DLayer = new LW_SeparableConvolution2D({nb_filter:32, nb_row:5, nb_col:5});
    let sepConv2DLayer_CalculatedShape_1 = sepConv2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let sepConv2DLayer_CalculatedShape_2 = sepConv2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${sepConv2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${sepConv2DLayer_CalculatedShape_1}\n`);
    console.log(`${sepConv2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${sepConv2DLayer_CalculatedShape_2}\n\n\n`);


    /*
     Simple test: Convolution3D Layer
     */
    console.log(`\t\t>>>>>> Convolution 3D <<<<<<<`);
    let conv3DLayer = new LW_Convolution3D({nb_filter:16, kernel_dim1:3, kernel_dim2:3, kernel_dim3:3});
    const INPUT_SHAPES_CONV3D_1 = [null, 1, 128, 128, 64];
    const INPUT_SHAPES_CONV3D_2 = [null, 5, 256, 256, 64];
    let conv3DLayer_CalculatedShape_1 = conv3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let conv3DLayer_CalculatedShape_2 = conv3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_2);
    console.log(`${conv3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : ${conv3DLayer_CalculatedShape_1}\n`);
    console.log(`${conv3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_2}) : ${conv3DLayer_CalculatedShape_2}\n\n\n`);

    /*
     Simple test: UpSampling 1D/2D/3D Layers
     */
    console.log(`\t\t>>>>>> Upsampling 1D/2D/3D <<<<<<<`);
    let upSample1D = new LW_UpSampling1D();
    let upSample2D = new LW_UpSampling2D({size: [3,3]});
    let upSample3D = new LW_UpSampling3D({size: [5,5,5]});

    let upSample1D_CalculatedShape_1 = upSample1D.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    let upSample1D_CalculatedShape_2 = upSample1D.get_output_shape_for(INPUT_SHAPES_CONV1D_2);
    console.log(`${upSample1D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${upSample1D_CalculatedShape_1}\n`);
    console.log(`${upSample1D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${upSample1D_CalculatedShape_2}\n\n\n`);

    let upSample2D_CalculatedShape_1 = upSample2D.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let upSample2D_CalculatedShape_2 = upSample2D.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${conv3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${upSample2D_CalculatedShape_1}\n`);
    console.log(`${conv3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${upSample2D_CalculatedShape_2}\n\n\n`);

    let upSample3D_CalculatedShape_1 = upSample3D.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let upSample3D_CalculatedShape_2 = upSample3D.get_output_shape_for(INPUT_SHAPES_CONV3D_2);
    console.log(`${conv3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : ${upSample3D_CalculatedShape_1}\n`);
    console.log(`${conv3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_2}) : ${upSample3D_CalculatedShape_2}\n\n\n`);

    /*
     Simple test: Zeropadding 1D/2D/3D Layers
     */
    console.log(`\t\t>>>>>> Zeropadding 1D/2D/3D <<<<<<<`);
    let zeroPadding1D = new LW_ZeroPadding1D();
    let zeroPadding2D = new LW_ZeroPadding2D({padding: [3,3]});
    let zeroPadding3D = new LW_ZeroPadding3D({padding: [5,5,5]});

    let zeroPadding1D_CalculatedShape_1 = zeroPadding1D.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    let zeroPadding1D_CalculatedShape_2 = zeroPadding1D.get_output_shape_for(INPUT_SHAPES_CONV1D_2);
    console.log(`${zeroPadding1D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${zeroPadding1D_CalculatedShape_1}\n`);
    console.log(`${zeroPadding1D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${zeroPadding1D_CalculatedShape_2}\n\n\n`);

    let zeroPadding2D_CalculatedShape_1 = zeroPadding2D.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let zeroPadding2D_CalculatedShape_2 = zeroPadding2D.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${zeroPadding2D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${zeroPadding2D_CalculatedShape_1}\n`);
    console.log(`${zeroPadding2D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${zeroPadding2D_CalculatedShape_2}\n\n\n`);

    let zeroPadding3D_CalculatedShape_1 = zeroPadding3D.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let zeroPadding3D_CalculatedShape_2 = zeroPadding3D.get_output_shape_for(INPUT_SHAPES_CONV3D_2);
    console.log(`${zeroPadding3D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : ${zeroPadding3D_CalculatedShape_1}\n`);
    console.log(`${zeroPadding3D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_2}) : ${zeroPadding3D_CalculatedShape_2}\n\n\n`);

    /*
     Simple test: Cropping 1D/2D/3D Layers
     */
    console.log(`\t\t>>>>>> Cropping 1D/2D/3D <<<<<<<`);
    let cropping1D = new LW_Cropping1D();
    let cropping2D = new LW_Cropping2D({cropping: [[3,3], [3,3]]});
    let cropping3D = new LW_Cropping3D({cropping: [[7,7], [5,5], [3,3]]});

    let cropping1D_CalculatedShape_1 = cropping1D.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    let cropping1D_CalculatedShape_2 = cropping1D.get_output_shape_for(INPUT_SHAPES_CONV1D_2);
    console.log(`${cropping1D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${cropping1D_CalculatedShape_1}\n`);
    console.log(`${cropping1D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${cropping1D_CalculatedShape_2}\n\n\n`);

    let cropping2D_CalculatedShape_1 = cropping2D.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let cropping2D_CalculatedShape_2 = cropping2D.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${cropping2D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${cropping2D_CalculatedShape_1}\n`);
    console.log(`${cropping2D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${cropping2D_CalculatedShape_2}\n\n\n`);

    let cropping3D_CalculatedShape_1 = cropping3D.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let cropping3D_CalculatedShape_2 = cropping3D.get_output_shape_for(INPUT_SHAPES_CONV3D_2);
    console.log(`${cropping3D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : ${cropping3D_CalculatedShape_1}\n`);
    console.log(`${cropping3D.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_2}) : ${cropping3D_CalculatedShape_2}\n\n\n`);
};





