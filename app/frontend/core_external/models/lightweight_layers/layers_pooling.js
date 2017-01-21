/**
 * Created by ar on 21.01.17.
 */

import {LW_Layer, default_dim_ordering} from './layers_basic';
import {conv_output_length} from './layers_convolutional';


//////////////////////////////////////////////
class _LW_Pooling1D extends LW_Layer {
    constructor({pool_length=2, stride=null, border_mode='valid'}) {
        super();
        this.input_dim = 3;
        if (stride===null) {
            stride = pool_length;
        }
        if(['valid', 'same'].indexOf(border_mode)<0) {
            throw new TypeError(`'border_mode must be in {valid, same}'`);
        }
        this.pool_length    = pool_length;
        this.stride         = stride;
        this.border_mode    = border_mode;
    }
    get_output_shape_for(input_shape) {
        let lengthOut = conv_output_length(input_shape[1], this.pool_length, this.border_mode, this.stride)
        return [input_shape[0], lengthOut, input_shape[2]]
    }
}

export class LW_MaxPooling1D extends _LW_Pooling1D {
    constructor({pool_length=2, stride=None, border_mode='valid'}) {
        super({
            pool_length:    pool_length,
            stride:         stride,
            border_mode:    border_mode
        });
    }
}

export class LW_AveragePooling1D extends _LW_Pooling1D {
    constructor({pool_length=2, stride=None, border_mode='valid'}) {
        super({
            pool_length:    pool_length,
            stride:         stride,
            border_mode:    border_mode
        });
    }
}

//////////////////////////////////////////////
class _LW_Pooling2D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_MaxPooling2D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_AveragePooling2D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

//////////////////////////////////////////////
class _LW_Pooling3D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_MaxPooling3D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_AveragePooling3D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

//////////////////////////////////////////////
class _LW_GlobalPooling2D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_GlobalAveragePooling2D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_GlobalMaxPooling2D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

//////////////////////////////////////////////
class _LW_GlobalPooling3D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_GlobalAveragePooling3D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}

export class LW_GlobalMaxPooling3D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {

    }
}











