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
        let lengthOut = conv_output_length({
            input_length:   input_shape[1],
            filter_size:    this.pool_length,
            border_mode:    this.border_mode,
            stride:         this.stride
        });
        return [input_shape[0], lengthOut, input_shape[2]]
    }
}

export class LW_MaxPooling1D extends _LW_Pooling1D {
    constructor({pool_length=2, stride=null, border_mode='valid'}) {
        super({
            pool_length:    pool_length,
            stride:         stride,
            border_mode:    border_mode
        });
    }
}

export class LW_AveragePooling1D extends _LW_Pooling1D {
    constructor({pool_length=2, stride=null, border_mode='valid'}) {
        super({
            pool_length:    pool_length,
            stride:         stride,
            border_mode:    border_mode
        });
    }
}

//////////////////////////////////////////////
class _LW_Pooling2D extends LW_Layer {
    constructor({pool_size=[2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.pool_size = pool_size;
        if (strides===null) {
            strides = this.pool_size;
        }
        if(['valid', 'same'].indexOf(border_mode)<0) {
            throw new TypeError(`'border_mode must be in {valid, same}'`);
        }
        this.strides        = strides;
        this.border_mode    = border_mode;
        this.dim_ordering   = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let rows, cols;
        if (this.dim_ordering === 'th') {
            rows = input_shape[2];
            cols = input_shape[3];
        } else if (this.dim_ordering === 'tf') {
            rows = input_shape[1];
            cols = input_shape[2];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
        rows = conv_output_length({
            input_length:   rows,
            filter_size:    this.pool_size[0],
            border_mode:    this.border_mode,
            stride:         this.strides[0]
        });
        cols = conv_output_length({
            input_length:   cols,
            filter_size:    this.pool_size[1],
            border_mode:    this.border_mode,
            stride:         this.strides[1]
        });
        if (this.dim_ordering === 'th') {
            return [input_shape[0], input_shape[1], rows, cols];
        } else if (this.dim_ordering === 'tf') {
            return [input_shape[0], rows, cols, input_shape[3]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

export class LW_MaxPooling2D extends _LW_Pooling2D {
    constructor({pool_size=[2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super({
            pool_size:      pool_size,
            strides:        strides,
            border_mode:    border_mode,
            dim_ordering:   dim_ordering
        });
    }
}

export class LW_AveragePooling2D extends _LW_Pooling2D {
    constructor({pool_size=[2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super({
            pool_size:      pool_size,
            strides:        strides,
            border_mode:    border_mode,
            dim_ordering:   dim_ordering
        });
    }
}

//////////////////////////////////////////////
class _LW_Pooling3D extends LW_Layer {
    constructor({pool_size=[2, 2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.pool_size = pool_size;
        if (strides===null) {
            strides = this.pool_size;
        }
        this.strides = strides;
        if(['valid', 'same'].indexOf(border_mode)<0) {
            throw new TypeError(`'border_mode must be in {valid, same}'`);
        }
        this.border_mode    = border_mode;
        this.dim_ordering   = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let len_dim1, len_dim2, len_dim3;
        if (this.dim_ordering === 'th') {
            len_dim1 = input_shape[2];
            len_dim2 = input_shape[3];
            len_dim3 = input_shape[4];
        } else if (this.dim_ordering === 'tf') {
            len_dim1 = input_shape[1];
            len_dim2 = input_shape[2];
            len_dim3 = input_shape[3];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
        len_dim1 = conv_output_length({
            input_length:   len_dim1,
            filter_size:    this.pool_size[0],
            border_mode:    this.border_mode,
            stride:         this.strides[0]
        });
        len_dim2 = conv_output_length({
            input_length:   len_dim2,
            filter_size:    this.pool_size[1],
            border_mode:    this.border_mode,
            stride:         this.strides[1]
        });
        len_dim3 = conv_output_length({
            input_length:   len_dim3,
            filter_size:    this.pool_size[2],
            border_mode:    this.border_mode,
            stride:         this.strides[2]
        });
        if (this.dim_ordering === 'th') {
            return [input_shape[0], input_shape[1], len_dim1, len_dim2, len_dim3];
        } else if (this.dim_ordering === 'tf') {
            return [input_shape[0], len_dim1, len_dim2, len_dim3, input_shape[4]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

export class LW_MaxPooling3D extends _LW_Pooling3D {
    constructor({pool_size=[2, 2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super({
            pool_size:      pool_size,
            strides:        strides,
            border_mode:    border_mode,
            dim_ordering:   dim_ordering
        });
    }
}

export class LW_AveragePooling3D extends _LW_Pooling3D {
    constructor({pool_size=[2, 2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super({
            pool_size:      pool_size,
            strides:        strides,
            border_mode:    border_mode,
            dim_ordering:   dim_ordering
        });
    }
}

//////////////////////////////////////////////
class _LW_GlobalPooling1D extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {
        return [input_shape[0], input_shape[2]];
    }
}

export class LW_GlobalAveragePooling1D extends _LW_GlobalPooling1D {
    constructor() {
        super();
    }
}

export class LW_GlobalMaxPooling1D extends _LW_GlobalPooling1D {
    constructor() {
        super();
    }
}

//////////////////////////////////////////////
class _LW_GlobalPooling2D extends LW_Layer {
    constructor(dim_ordering='default') {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        this.dim_ordering = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        if(this.dim_ordering==='tf') {
            return [input_shape[0], input_shape[3]];
        } else if(this.dim_ordering==='th') {
            return [input_shape[0], input_shape[1]]
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

export class LW_GlobalAveragePooling2D extends _LW_GlobalPooling2D {
    constructor() {
        super();
    }
}

export class LW_GlobalMaxPooling2D extends _LW_GlobalPooling2D {
    constructor() {
        super();
    }
}

//////////////////////////////////////////////
class _LW_GlobalPooling3D extends LW_Layer {
    constructor(dim_ordering='default') {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        this.dim_ordering = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        if(this.dim_ordering==='tf') {
            return [input_shape[0], input_shape[4]];
        } else if(this.dim_ordering==='th') {
            return [input_shape[0], input_shape[1]]
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

export class LW_GlobalAveragePooling3D extends _LW_GlobalPooling3D {
    constructor() {
        super();
    }
}

export class LW_GlobalMaxPooling3D extends _LW_GlobalPooling3D {
    constructor() {
        super();
    }
}




