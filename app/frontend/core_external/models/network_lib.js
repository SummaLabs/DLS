/**
 * Created by ar on 22.01.17.
 */

/*
import {
    LW_InputLayer, LW_Merge, LW_Flatten, LW_Dense, LW_Activation
} from './lightweight_layers/layers_basic';

import {
    LW_Convolution1D, LW_AtrousConvolution1D,
    LW_Convolution2D, LW_AtrousConvolution2D, LW_SeparableConvolution2D,
    LW_Convolution3D,
    LW_UpSampling1D, LW_UpSampling2D, LW_UpSampling3D,
    LW_ZeroPadding1D, LW_ZeroPadding2D, LW_ZeroPadding3D,
    LW_Cropping1D, LW_Cropping2D, LW_Cropping3D
} from './lightweight_layers/layers_convolutional';


import {
    LW_MaxPooling1D, LW_AveragePooling1D,
    LW_MaxPooling2D, LW_AveragePooling2D,
    LW_MaxPooling3D, LW_AveragePooling3D,
    LW_GlobalMaxPooling1D, LW_GlobalAveragePooling1D,
    LW_GlobalMaxPooling2D, LW_GlobalAveragePooling2D,
    LW_GlobalMaxPooling3D, LW_GlobalAveragePooling3D
} from './lightweight_layers/layers_pooling';

export {
    LW_InputLayer, LW_Merge, LW_Flatten, LW_Dense, LW_Activation,

    LW_Convolution1D, LW_AtrousConvolution1D,
    LW_Convolution2D, LW_AtrousConvolution2D, LW_SeparableConvolution2D,
    LW_Convolution3D,
    LW_UpSampling1D, LW_UpSampling2D, LW_UpSampling3D,
    LW_ZeroPadding1D, LW_ZeroPadding2D, LW_ZeroPadding3D,
    LW_Cropping1D, LW_Cropping2D, LW_Cropping3D,

    LW_MaxPooling1D, LW_AveragePooling1D,
    LW_MaxPooling2D, LW_AveragePooling2D,
    LW_MaxPooling3D, LW_AveragePooling3D,
    LW_GlobalMaxPooling1D, LW_GlobalAveragePooling1D,
    LW_GlobalMaxPooling2D, LW_GlobalAveragePooling2D,
    LW_GlobalMaxPooling3D, LW_GlobalAveragePooling3D
}
*/

export function test_network_library() {
    console.log('Hello, from network library!');
}

class NodeF {
    constructor(jsonNodeExt=null, inpNodeIdx=null, outNodeIdx=null) {
        this.nodeExt    = jsonNodeExt;
        this.inpNodeIdx = inpNodeIdx;
        this.outNodeIdx = outNodeIdx;
    }
}

export function calculateShapesInModel(modelJson) {
    let modelLayers = modelJson.layers;
    for(let ll of modelLayers) {
        console.log(ll);
    }
}





























