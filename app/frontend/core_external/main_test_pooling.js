/**
 * Created by ar on 21.01.17.
 */

import {LW_MaxPooling1D, LW_AveragePooling1D,
        LW_MaxPooling2D, LW_AveragePooling2D,
        LW_MaxPooling3D, LW_AveragePooling3D,
        LW_GlobalMaxPooling1D, LW_GlobalAveragePooling1D,
        LW_GlobalMaxPooling2D, LW_GlobalAveragePooling2D,
        LW_GlobalMaxPooling3D, LW_GlobalAveragePooling3D} from './models/lightweight_layers/layers_pooling';

export let test_layers_pooling = function () {
    const INPUT_SHAPES_CONV1D_1 = [null, 32,   3];
    const INPUT_SHAPES_CONV1D_2 = [null, 128,  3];

    const INPUT_SHAPES_CONV2D_1 = [null, 3, 128, 128];
    const INPUT_SHAPES_CONV2D_2 = [null, 1, 256, 256];

    const INPUT_SHAPES_CONV3D_1 = [null, 3, 128, 128, 64];
    const INPUT_SHAPES_CONV3D_2 = [null, 1, 256, 256, 64];

    /*
     Simple test: Pooling 1D Layers
     */
    console.log(`\t\t>>>>>> Pooling 1D <<<<<<<`);
    let poolingMax1DLayer = new LW_MaxPooling1D({pool_length:3});
    let poolingAvg1DLayer = new LW_AveragePooling1D({pool_length:3});

    let poolingMax1DLayer_CalculatedShape_1 = poolingMax1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    let poolingMax1DLayer_CalculatedShape_2 = poolingMax1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_2);
    console.log(`${poolingMax1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${poolingMax1DLayer_CalculatedShape_1}\n`);
    console.log(`${poolingMax1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${poolingMax1DLayer_CalculatedShape_2}\n\n\n`);

    let poolingAvg1DLayer_CalculatedShape_1 = poolingAvg1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    let poolingAvg1DLayer_CalculatedShape_2 = poolingAvg1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_2);
    console.log(`${poolingAvg1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : ${poolingAvg1DLayer_CalculatedShape_1}\n`);
    console.log(`${poolingAvg1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_2}) : ${poolingAvg1DLayer_CalculatedShape_2}\n\n\n`);

    /*
     Simple test: Pooling 2D Layers
     */
    console.log(`\t\t>>>>>> Pooling 2D <<<<<<<`);
    let poolingMax2DLayer = new LW_MaxPooling2D({pool_size:     [3,3]});
    let poolingAvg2DLayer = new LW_AveragePooling2D({pool_size: [3,3]});

    let poolingMax2DLayer_CalculatedShape_1 = poolingMax2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let poolingMax2DLayer_CalculatedShape_2 = poolingMax2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${poolingMax2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${poolingMax2DLayer_CalculatedShape_1}\n`);
    console.log(`${poolingMax2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${poolingMax2DLayer_CalculatedShape_2}\n\n\n`);

    let poolingAvg2DLayer_CalculatedShape_1 = poolingAvg2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let poolingAvg2DLayer_CalculatedShape_2 = poolingAvg2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_2);
    console.log(`${poolingAvg2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : ${poolingAvg2DLayer_CalculatedShape_1}\n`);
    console.log(`${poolingAvg2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_2}) : ${poolingAvg2DLayer_CalculatedShape_2}\n\n\n`);

    /*
     Simple test: Pooling 3D Layers
     */
    console.log(`\t\t>>>>>> Pooling 3D <<<<<<<`);
    let poolingMax3DLayer = new LW_MaxPooling3D({pool_size:     [3,3,3]});
    let poolingAvg3DLayer = new LW_AveragePooling3D({pool_size: [3,3,3]});

    let poolingMax3DLayer_CalculatedShape_1 = poolingMax3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let poolingMax3DLayer_CalculatedShape_2 = poolingMax3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_2);
    console.log(`${poolingMax3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : ${poolingMax3DLayer_CalculatedShape_1}\n`);
    console.log(`${poolingMax3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_2}) : ${poolingMax3DLayer_CalculatedShape_2}\n\n\n`);

    let poolingAvg3DLayer_CalculatedShape_1 = poolingAvg3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let poolingAvg3DLayer_CalculatedShape_2 = poolingAvg3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_2);
    console.log(`${poolingAvg3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : ${poolingAvg3DLayer_CalculatedShape_1}\n`);
    console.log(`${poolingAvg3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_2}) : ${poolingAvg3DLayer_CalculatedShape_2}\n\n\n`);

    /*
     Simple test: GlobalPooling 1D/2D/3D Layers
     */
    console.log(`\t\t>>>>>> Global Pooling 1D/2D/3D <<<<<<<`);
    // 1D
    let globalMax1DLayer = new LW_GlobalMaxPooling1D();
    let globalAvg1DLayer = new LW_GlobalAveragePooling1D();
    // 2D
    let globalMax2DLayer = new LW_GlobalMaxPooling2D();
    let globalAvg2DLayer = new LW_GlobalAveragePooling2D();
    // 3D
    let globalMax3DLayer = new LW_GlobalMaxPooling3D();
    let globalAvg3DLayer = new LW_GlobalAveragePooling3D();

    let globalMax1DLayer_CalculatedShape_1 = globalMax1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    let globalAvg1DLayer_CalculatedShape_1 = globalAvg1DLayer.get_output_shape_for(INPUT_SHAPES_CONV1D_1);
    console.log(`${globalMax1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : [${globalMax1DLayer_CalculatedShape_1}]\n`);
    console.log(`${globalAvg1DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV1D_1}) : [${globalAvg1DLayer_CalculatedShape_1}]\n\n`);

    let globalMax2DLayer_CalculatedShape_1 = globalMax2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    let globalAvg2DLayer_CalculatedShape_1 = globalAvg2DLayer.get_output_shape_for(INPUT_SHAPES_CONV2D_1);
    console.log(`${globalMax2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : [${globalMax2DLayer_CalculatedShape_1}]\n`);
    console.log(`${globalAvg2DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV2D_1}) : [${globalAvg2DLayer_CalculatedShape_1}]\n\n`);

    let globalMax3DLayer_CalculatedShape_1 = globalMax3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    let globalAvg3DLayer_CalculatedShape_1 = globalAvg3DLayer.get_output_shape_for(INPUT_SHAPES_CONV3D_1);
    console.log(`${globalMax3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : [${globalMax3DLayer_CalculatedShape_1}]\n`);
    console.log(`${globalAvg3DLayer.toString()} ->calculatedShape(${INPUT_SHAPES_CONV3D_1}) : [${globalAvg3DLayer_CalculatedShape_1}]\n\n`);

};
