/**
 * Created by ar on 17.01.17.
 */

const default_dim_ordering = 'th';

//////////////////////////////////////////////
class LW_Layer {
    constructor() {
        this.input_shape=null;
    }
    // FIXME: is this method really needed?
    static get_layer(jsonCfg) {
        return new this();
    }
    get_output_shape_for(input_shape) {
        return input_shape;
    }
    toString() {
        const layerClassName = this.constructor.name;
        let outputShape = null;
        try{
            outputShape = this.get_output_shape_for(this.input_shape);
        } catch (err) {
            outputShape = 'unknown';
        }
        // return `${layerClassName}(input_shape=${this.input_shape}, output_shape=${outputShape})`;
        return `${layerClassName}(inp=?, out=?)`;
    }
    isMultiInput() {
        return false;
    }
}

//////////////////////////////////////////////
class LW_InputLayer extends LW_Layer {
    constructor(input_shape=null) {
        super();
        this.input_shape = input_shape;
    }
}

class LW_OutputLayer extends LW_Layer {
    constructor() {
        super();
    }
}

//////////////////////////////////////////////
class LW_Merge extends LW_Layer {
    constructor({mode='sum', concat_axis=-1, dot_axes=-1}) {
        super();
        this.mode = mode;
        this.concat_axis = concat_axis;
        this.dot_axes = dot_axes;
    }
    get_output_shape_for(input_shape) {
        let input_shapes = input_shape;
        if (['sum', 'mul', 'ave', 'max'].indexOf(this.mode)>0) {
            // All tuples in input_shapes should be the same.
            return input_shapes[0]
        } else if(this.mode === 'concat') {
            // let output_shape = new Array(...input_shapes[0]); // make a copy
            let output_shape = input_shapes[0].slice();
            for (let shape of input_shapes.slice(1)) {
                // fucking JS
                let idxAxisOut = this.concat_axis;
                let idxAxisShp = this.concat_axis;
                if(this.concat_axis<0) {
                    idxAxisOut = output_shape.length - 1;
                    idxAxisShp = shape.length - 1;
                }
                //
                if (output_shape[idxAxisOut] === null || shape[idxAxisShp] === null ) {
                    output_shape[idxAxisOut] = null;
                    break;
                }
                //FIXME: check "+= shape operation" --> Array concatenation?
                output_shape[idxAxisOut] += shape[idxAxisShp];
            }
            return output_shape;
        } else if(['dot', 'cos'].indexOf(this.mode)) {
            // let shape1 = new Array(...input_shapes[0]); // make a copy
            // let shape2 = new Array(...input_shapes[1]);
            let shape1 = input_shapes[0].slice();
            let shape2 = input_shapes[1].slice();
            shape1.pop(this.dot_axes[0]);
            shape2.pop(this.dot_axes[1]);
            shape2.pop(0);
            let output_shape = [...shape1,...shape2];
            if(output_shape.length===1) {
                output_shape = [...output_shape, ...[1]];
            }
            return output_shape;
        }
    }
    static get_layer(jsonCfg) {
        return new LW_Merge({
            mode:           jsonCfg['mergeType'],
            concat_axis:    jsonCfg['mergeAxis']
        });
    }
    isMultiInput() {
        return true;
    }
}

//////////////////////////////////////////////
class LW_Flatten extends LW_Layer {
    constructor() {
        super();
    }
    get_output_shape_for(input_shape) {
        /*
        if not all(input_shape[1:]):
            raise Exception('The shape of the input to "Flatten" '
            'is not fully defined '
            '(got ' + str(input_shape[1:]) + '. '
            'Make sure to pass a complete "input_shape" '
            'or "batch_input_shape" argument to the first '
            'layer in your model.')
         */
        let tprod = 1;
        for (let ii of input_shape.slice(1)) {
            tprod *= ii;
        }
        return [input_shape[0], tprod];
    }
}

//////////////////////////////////////////////
class LW_Dense extends LW_Layer {
    constructor(output_dim) {
        super();
        this.output_dim = output_dim;
    }
    get_output_shape_for(input_shape) {
        if ( !(input_shape!=null && input_shape.length===2) ) {
            throw new TypeError(`Invalid input shape: ${input_shape}`);
        }
        return [input_shape[0], this.output_dim];
    }
    static get_layer(jsonCfg) {
        return new LW_Dense(jsonCfg['neuronsCount']);
    }
}

//////////////////////////////////////////////
class LW_Activation extends LW_Layer {

}
/**
 * Created by ar on 21.01.17.
 */





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
    static get_layer(jsonCfg) {
        let tcfg = {
            pool_length: jsonCfg['subsamplingSizeWidth']
        };
        if(jsonCfg['subsamplingType']==='max_pooling') {
            return new LW_MaxPooling1D(tcfg);
        } else {
            return new LW_AveragePooling1D(tcfg);
        }
    }
}

class LW_MaxPooling1D extends _LW_Pooling1D {
    constructor({pool_length=2, stride=null, border_mode='valid'}) {
        super({
            pool_length:    pool_length,
            stride:         stride,
            border_mode:    border_mode
        });
    }
}

class LW_AveragePooling1D extends _LW_Pooling1D {
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
    static get_layer(jsonCfg) {
        let tcfg = {
            pool_size: [jsonCfg['subsamplingSizeWidth'], jsonCfg['subsamplingSizeHeight']]
        };
        if(jsonCfg['subsamplingType']==='max_pooling') {
            return new LW_MaxPooling2D(tcfg);
        } else {
            return new LW_AveragePooling2D(tcfg);
        }
    }
}

class LW_MaxPooling2D extends _LW_Pooling2D {
    constructor({pool_size=[2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super({
            pool_size:      pool_size,
            strides:        strides,
            border_mode:    border_mode,
            dim_ordering:   dim_ordering
        });
    }
}

class LW_AveragePooling2D extends _LW_Pooling2D {
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
    static get_layer(jsonCfg) {
        let tcfg = {
            pool_size: [
                jsonCfg['subsamplingSizeWidth'],
                jsonCfg['subsamplingSizeHeight'],
                jsonCfg['subsamplingSizeDepth']
            ]
        };
        if(jsonCfg['subsamplingType']==='max_pooling') {
            return new LW_MaxPooling3D(tcfg);
        } else {
            return new LW_AveragePooling3D(tcfg);
        }
    }
}

class LW_MaxPooling3D extends _LW_Pooling3D {
    constructor({pool_size=[2, 2, 2], strides=null, border_mode='valid', dim_ordering='default'}) {
        super({
            pool_size:      pool_size,
            strides:        strides,
            border_mode:    border_mode,
            dim_ordering:   dim_ordering
        });
    }
}

class LW_AveragePooling3D extends _LW_Pooling3D {
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

class LW_GlobalAveragePooling1D extends _LW_GlobalPooling1D {
    constructor() {
        super();
    }
}

class LW_GlobalMaxPooling1D extends _LW_GlobalPooling1D {
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

class LW_GlobalAveragePooling2D extends _LW_GlobalPooling2D {
    constructor() {
        super();
    }
}

class LW_GlobalMaxPooling2D extends _LW_GlobalPooling2D {
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

class LW_GlobalAveragePooling3D extends _LW_GlobalPooling3D {
    constructor() {
        super();
    }
}

class LW_GlobalMaxPooling3D extends _LW_GlobalPooling3D {
    constructor() {
        super();
    }
}



/**
 * Created by ar on 20.01.17.
 */



//////////////////////////////////////////////
function conv_output_length({input_length, filter_size, border_mode, stride, dilation=1}) {
    if(input_length===null) {
        return null;
    }
    if(['same', 'valid', 'full'].indexOf(border_mode)<0) {
        throw new TypeError(`Invalid parameter 'border_mode': [${border_mode}]`);
    }
    const dilated_filter_size = filter_size + (filter_size - 1) * (dilation - 1);
    let outputLength = 0;
    if (border_mode==='same') {
        outputLength = input_length;
    } else if (border_mode==='valid') {
        outputLength = input_length - dilated_filter_size + 1;
    } else if (border_mode==='full') {
        outputLength = input_length + dilated_filter_size - 1;
    }
    //FIXME: check that div&Math.fllor is equal Python Floor-Division!
    return Math.floor( (outputLength + stride -1) / stride);
 }

//////////////////////////////////////////////
class LW_Convolution1D extends LW_Layer {
    constructor({nb_filter, filter_length, border_mode='valid', subsample_length=1}) {
        super();
        if(['valid', 'same', 'full'].indexOf(border_mode)<0) {
            throw new TypeError(`Invalid border mode for Convolution1D: [${border_mode}]`);
        }
        this.nb_filter      = nb_filter;
        this.filter_length  = filter_length;
        this.border_mode    = border_mode;
        this.subsample      = [subsample_length, 1];
    }
    get_output_shape_for(input_shape) {
        const lengthOut = conv_output_length({
                input_length:   input_shape[1],
                filter_size:    this.filter_length,
                border_mode:    this.border_mode,
                stride:         this.subsample[0]
        });
        return [input_shape[0], lengthOut, this.nb_filter];
    }
    static get_layer(jsonCfg) {
        return new LW_Convolution1D({
            nb_filter:      jsonCfg['filtersCount'],
            filter_length:  jsonCfg['filterWidth']
        });
    }
}

class LW_AtrousConvolution1D extends LW_Convolution1D {
    constructor({nb_filter, filter_length, border_mode='valid', subsample_length=1, atrous_rate=1}) {
        //FIXME: check, that Math.floor is equal Pyhtonic float-to-int conversion int(X_in_float)
        super({
            nb_filter:          nb_filter,
            filter_length:      filter_length,
            border_mode:        border_mode,
            subsample_length:   subsample_length
        });
        this.atrous_rate = Math.floor(atrous_rate);
    }
    get_output_shape_for(input_shape) {
        const lengthOut = conv_output_length({
            input_length:   input_shape[1],
            filter_size:    this.filter_length,
            border_mode:    this.border_mode,
            stride:         this.subsample[0],
            dilation:       this.atrous_rate
        });
        return [input_shape[0], lengthOut, this.nb_filter];
    }
    //FIXME: validate parameters!!!
    static get_layer(jsonCfg) {
        return new LW_AtrousConvolution1D({
            nb_filter:      jsonCfg['filtersCount'],
            filter_length:  jsonCfg['filterWidth']
        });
    }
}

//////////////////////////////////////////////
class LW_Convolution2D extends LW_Layer {
    constructor({nb_filter, nb_row, nb_col, border_mode='valid', subsample=[1, 1], dim_ordering='default'}) {
        super();
        if(dim_ordering==='default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError(`Invalid dim_ordering: [${dim_ordering}]`);
        }
        if(['valid', 'same', 'full'].indexOf(border_mode)<0) {
            throw new TypeError(`Invalid border_mode parameter: [${border_mode}]`);
        }
        this.nb_filter      = nb_filter;
        this.nb_row         = nb_row;
        this.nb_col         = nb_col;
        this.border_mode    = border_mode;
        this.subsample      = subsample;
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
            input_length: rows,
            filter_size: this.nb_row,
            border_mode: this.border_mode,
            stride: this.subsample[0]
        });
        cols = conv_output_length({
            input_length: cols,
            filter_size: this.nb_col,
            border_mode: this.border_mode,
            stride: this.subsample[1]
        });
        if (this.dim_ordering === 'th') {
            return [input_shape[0], this.nb_filter, rows, cols];
        } else if (this.dim_ordering === 'tf') {
            return [input_shape[0], rows, cols, this.nb_filter];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
    static get_layer(jsonCfg) {
        return new LW_Convolution2D({
            nb_filter:  jsonCfg['filtersCount'],
            nb_row:     jsonCfg['filterWidth'],
            nb_col:     jsonCfg['filterHeight']
        });
    }
}

class LW_AtrousConvolution2D extends LW_Convolution2D {
    constructor({nb_filter, nb_row, nb_col,  border_mode='valid', subsample=[1, 1],
                    atrous_rate=[1, 1], dim_ordering='default'}) {
        //FIXME: check that super()-call on first line of constructor() is equal Pythonic last-line call...
        super({
            nb_filter:      nb_filter,
            nb_row:         nb_row,
            nb_col:         nb_col,
            border_mode:    border_mode,
            subsample:      subsample,
            dim_ordering:   dim_ordering
        });
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if (['valid', 'same', 'full'].indexOf(border_mode)<0) {
            throw new TypeError(`Invalid border mode for AtrousConv2D: ${border_mode}`);
        }
        this.atrous_rate    = atrous_rate;
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
            filter_size:    this.nb_row,
            border_mode:    this.border_mode,
            stride:         this.subsample[0],
            dilation:       this.atrous_rate[0]
        });
        cols = conv_output_length({
            input_length:   cols,
            filter_size:    this.nb_col,
            border_mode:    this.border_mode,
            stride:         this.subsample[1],
            dilation:       this.atrous_rate[1]
        });
        if (this.dim_ordering === 'th') {
            return [input_shape[0], this.nb_filter, rows, cols];
        } else if (this.dim_ordering === 'tf') {
            return [input_shape[0], rows, cols, this.nb_filter];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
    //FIXME: validate parameters!!!
    static get_layer(jsonCfg) {
        return new LW_AtrousConvolution2D({
            nb_filter:  jsonCfg['filtersCount'],
            nb_row:     jsonCfg['filterWidth'],
            nb_col:     jsonCfg['filterHeight']
        });
    }
}

class LW_SeparableConvolution2D extends LW_Layer {
    constructor({nb_filter, nb_row, nb_col,
                border_mode='valid', subsample=[1, 1],
                depth_multiplier=1, dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        if (['valid', 'same'].indexOf(border_mode)<0) {
            throw new TypeError(`Invalid border mode for SeparableConv2D: ${border_mode}`);
        }
        this.nb_filter          = nb_filter;
        this.nb_row             = nb_row;
        this.nb_col             = nb_col;
        this.border_mode        = border_mode;
        this.subsample          = subsample;
        this.depth_multiplier   = depth_multiplier;
        this.dim_ordering       = dim_ordering;
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
            filter_size:    this.nb_row,
            border_mode:    this.border_mode,
            stride:         this.subsample[0]
        });
        cols = conv_output_length({
            input_length:   cols,
            filter_size:    this.nb_col,
            border_mode:    this.border_mode,
            stride:         this.subsample[1]
        });
        if (this.dim_ordering === 'th') {
            return [input_shape[0], this.nb_filter, rows, cols];
        } else if (this.dim_ordering === 'tf') {
            return [input_shape[0], rows, cols, this.nb_filter];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
    static get_layer(jsonCfg) {
        //FIXME: validate parameters!!!
        return new LW_SeparableConvolution2D({
            nb_filter:  jsonCfg['filtersCount'],
            nb_row:     jsonCfg['filterWidth'],
            nb_col:     jsonCfg['filterHeight']
        });
    }
}

//////////////////////////////////////////////
class LW_Convolution3D extends LW_Layer {
    constructor({nb_filter, kernel_dim1, kernel_dim2, kernel_dim3,
                border_mode='valid', subsample=[1, 1, 1], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        if (['valid', 'same'].indexOf(border_mode)<0) {
            throw new TypeError(`Invalid border mode for LW_Convolution3D: ${border_mode}`);
        }
        this.nb_filter      = nb_filter;
        this.kernel_dim1    = kernel_dim1;
        this.kernel_dim2    = kernel_dim2;
        this.kernel_dim3    = kernel_dim3;
        this.border_mode    = border_mode;
        this.subsample      = subsample;
        this.dim_ordering   = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let conv_dim1, conv_dim2, conv_dim3;
        if (this.dim_ordering === 'th') {
            conv_dim1 = input_shape[2];
            conv_dim2 = input_shape[3];
            conv_dim3 = input_shape[4];
        } else if(this.dim_ordering === 'tf') {
            conv_dim1 = input_shape[1];
            conv_dim2 = input_shape[2];
            conv_dim3 = input_shape[3];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
        conv_dim1 = conv_output_length({
            input_length:   conv_dim1,
            filter_size:    this.kernel_dim1,
            border_mode:    this.border_mode,
            stride:         this.subsample[0]
        });
        conv_dim2 = conv_output_length({
            input_length:   conv_dim2,
            filter_size:    this.kernel_dim2,
            border_mode:    this.border_mode,
            stride:         this.subsample[1]
        });
        conv_dim3 = conv_output_length({
            input_length:   conv_dim3,
            filter_size:    this.kernel_dim3,
            border_mode:    this.border_mode,
            stride:         this.subsample[2]
        });
        if (this.dim_ordering === 'th') {
            return [input_shape[0], this.nb_filter, conv_dim1, conv_dim2, conv_dim3];
        } else if (this.dim_ordering === 'tf') {
            return [input_shape[0], conv_dim1, conv_dim2, conv_dim3, this.nb_filter];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
    static get_layer(jsonCfg) {
        //FIXME: validate parameters!!!
        return new LW_Convolution3D({
            nb_filter:      jsonCfg['filtersCount'],
            kernel_dim1:    jsonCfg['filterWidth'],
            kernel_dim2:    jsonCfg['filterHeight'],
            kernel_dim3:    jsonCfg['filterDepth']
        });
    }
}

//////////////////////////////////////////////
class LW_UpSampling1D extends LW_Layer {
    constructor(length=2) {
        super();
        this.length = length;
    }
    get_output_shape_for(input_shape) {
        let length;
        if(input_shape[1]!=null) {
            length = this.length * input_shape[1];
        } else {
            length = null;
        }
        return [input_shape[0], length, input_shape[2]];
    }
    static get_layer(jsonCfg) {
        return new LW_UpSampling1D({
            length: jsonCfg['subsamplingSizeWidth']
        });
    }
}

class LW_UpSampling2D extends LW_Layer {
    constructor({size=[2, 2], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.size           = size;
        this.dim_ordering   = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let width, height;
        if (this.dim_ordering === 'th') {
            if(input_shape[2] !=null) {
                width   = this.size[0] * input_shape[2];
            } else {
                width   = null;
            }
            if(input_shape[3] !=null) {
                height   = this.size[1] * input_shape[3];
            } else {
                height   = null;
            }
            return [input_shape[0], input_shape[1], width, height];
        } else if(this.dim_ordering === 'tf') {
            if(input_shape[1] !=null) {
                width   = this.size[0] * input_shape[1];
            } else {
                width   = null;
            }
            if(input_shape[2] !=null) {
                height   = this.size[1] * input_shape[2];
            } else {
                height   = null;
            }
            return [input_shape[0], width, height, input_shape[3]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
    static get_layer(jsonCfg) {
        let tmpSize = [jsonCfg['subsamplingSizeWidth'], jsonCfg['subsamplingSizeHeight']];
        return new LW_UpSampling2D({
            size:   tmpSize
        });
    }
}

class LW_UpSampling3D extends LW_Layer {
    constructor({size=[2, 2, 2], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.size           = size;
        this.dim_ordering   = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let dim1, dim2, dim3;
        if (this.dim_ordering === 'th') {
            dim1 = (input_shape[2] != null) ? (this.size[0] * input_shape[2]) : null;
            dim2 = (input_shape[3] != null) ? (this.size[1] * input_shape[3]) : null;
            dim3 = (input_shape[4] != null) ? (this.size[2] * input_shape[4]) : null;
            return [input_shape[0], input_shape[1], dim1, dim2, dim3];
        } else if(this.dim_ordering === 'tf') {
            dim1 = (input_shape[1] != null) ? (this.size[0] * input_shape[1]) : null;
            dim2 = (input_shape[2] != null) ? (this.size[1] * input_shape[2]) : null;
            dim3 = (input_shape[3] != null) ? (this.size[2] * input_shape[3]) : null;
            return [input_shape[0], dim1, dim2, dim3, input_shape[4]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
    static get_layer(jsonCfg) {
        let tmpSize = [
            jsonCfg['subsamplingSizeWidth'],
            jsonCfg['subsamplingSizeHeight'],
            jsonCfg['subsamplingSizeDepth']];
        return new LW_UpSampling3D({
            size:   tmpSize
        });
    }
}

//////////////////////////////////////////////
class LW_ZeroPadding1D extends LW_Layer {
    constructor(padding=1) {
        super();
        this.padding = padding;
        if(typeof(padding)==='number') {
            this.left_pad = padding;
            this.right_pad = padding;
        } else if (Array.isArray()) {
            if (padding.length != 2) {
                throw new TypeError(`'padding' should be int, or dict with keys {"left_pad", "right_pad"}, or tuple of length 2. Found: ${padding}`);
            }
            this.left_pad   = padding[0];
            this.right_pad  = padding[1];
        } else {
            //FIXME: check that es6 is equivalent Pythonic dict-getter with default values...
            this.left_pad   = padding['left_pad'];  //padding.get('left_pad', 0)
            this.right_pad  = padding['right_pad']; //padding.get('right_pad', 0)
        }
    }
    get_output_shape_for(input_shape) {
        let lengthOut = (input_shape[1]!=null) ? (input_shape[1] + this.left_pad + this.right_pad) : null;
        return [input_shape[0], lengthOut, input_shape[2]];
    }
}

class LW_ZeroPadding2D extends LW_Layer {
    constructor({padding=[1, 1], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.padding = padding;
        //
        if(Array.isArray(padding)) {
            if(padding.length===2) {
                this.top_pad    = padding[0];
                this.bottom_pad = padding[0];
                this.left_pad   = padding[1];
                this.right_pad  = padding[1];
            } else if(padding.length===4) {
                this.top_pad    = padding[0];
                this.bottom_pad = padding[1];
                this.left_pad   = padding[2];
                this.right_pad  = padding[3];
            } else {
                throw new TypeError(`'padding should be tuple of int of length 2 or 4, or dict. Found: ${padding}`);
            }
        } else {
            //FIXME: check that this code is equivalent to list/dict validation
            try {
                this.top_pad        = padding['top_pad'];       //padding.get('top_pad', 0)
                this.bottom_pad     = padding['bottom_pad'];    //padding.get('bottom_pad', 0)
                this.left_pad       = padding['left_pad'];      //padding.get('left_pad', 0)
                this.right_pad      = padding['right_pad'];     //padding.get('right_pad', 0)
            } catch (err) {
                //FIXME: check code-style
                throw new TypeError(`Unexpected key found in 'padding' dictionary.  Keys have to be 
                                    in {"top_pad", "bottom_pad", "left_pad", "right_pad"}. Found: ${padding}`);
            }
        }
        this.dim_ordering = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let rows, cols;
        if (this.dim_ordering === 'th') {
            rows = (input_shape[2] != null) ? (input_shape[2] + this.top_pad + this.bottom_pad) : null;
            cols = (input_shape[3] != null) ? (input_shape[3] + this.left_pad + this.right_pad) : null;
            return [input_shape[0], input_shape[1], rows, cols];
        } else if(this.dim_ordering === 'tf') {
            rows = (input_shape[1] != null) ? (input_shape[1] + this.top_pad + this.bottom_pad) : null;
            cols = (input_shape[2] != null) ? (input_shape[2] + this.left_pad + this.right_pad) : null;
            return [input_shape[0], rows, cols, input_shape[3]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

class LW_ZeroPadding3D extends LW_Layer {
    constructor({padding=[1, 1, 1], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.padding        = padding;
        this.dim_ordering   = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let dim1, dim2, dim3;
        if (this.dim_ordering === 'th') {
            dim1 = (input_shape[2] != null) ? (input_shape[2] + 2 * this.padding[0]) : null;
            dim2 = (input_shape[3] != null) ? (input_shape[3] + 2 * this.padding[1]) : null;
            dim3 = (input_shape[4] != null) ? (input_shape[4] + 2 * this.padding[2]) : null;
            return [input_shape[0], input_shape[1], dim1, dim2, dim3];
        } else if(this.dim_ordering === 'tf') {
            dim1 = (input_shape[1] != null) ? (input_shape[1] + 2 * this.padding[0]) : null;
            dim2 = (input_shape[2] != null) ? (input_shape[2] + 2 * this.padding[1]) : null;
            dim3 = (input_shape[3] != null) ? (input_shape[3] + 2 * this.padding[2]) : null;
            return [input_shape[0], dim1, dim2, dim3, input_shape[4]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

//////////////////////////////////////////////
class LW_Cropping1D extends LW_Layer {
    constructor(cropping=[1, 1]) {
        super();
        this.cropping = cropping;
        if(this.cropping.length != 2) {
            throw new TypeError(`Cropping must be a tuple length of 2`);
        }
    }
    get_output_shape_for(input_shape) {
        let lengthOut = (input_shape[1]!=null) ? (input_shape[1] - this.cropping[0] - this.cropping[1]) : null;
        return [input_shape[0], lengthOut, input_shape[2]];
    }
}

class LW_Cropping2D extends LW_Layer {
    constructor({cropping=[[0, 0], [0, 0]], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.cropping = cropping;
        //
        if(this.cropping.length!=2)     {throw new TypeError(`Cropping must be a tuple length of 2`)}
        if(this.cropping[0].length!=2)  {throw new TypeError(`Cropping[0] must be a tuple length of 2`)}
        if(this.cropping[1].length!=2)  {throw new TypeError(`Cropping[1] must be a tuple length of 2`)}
        this.dim_ordering = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        if (this.dim_ordering === 'th') {
            return [input_shape[0],
                    input_shape[1],
                    input_shape[2] - this.cropping[0][0] - this.cropping[0][1],
                    input_shape[3] - this.cropping[1][0] - this.cropping[1][1]];
        } else if(this.dim_ordering === 'tf') {
            return [input_shape[0],
                    input_shape[1] - this.cropping[0][0] - this.cropping[0][1],
                    input_shape[2] - this.cropping[1][0] - this.cropping[1][1],
                    input_shape[3]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}

class LW_Cropping3D extends LW_Layer {
    constructor({cropping=[[1, 1], [1, 1], [1, 1]], dim_ordering='default'}) {
        super();
        if (dim_ordering === 'default') {
            dim_ordering = default_dim_ordering;
        }
        if(['tf', 'th'].indexOf(dim_ordering)<0) {
            throw new TypeError('dim_ordering must be in {tf, th}');
        }
        this.cropping = cropping;
        //
        if(this.cropping.length!=3)     {throw new TypeError(`Cropping must be a tuple length of 3`)}
        if(this.cropping[0].length!=2)  {throw new TypeError(`Cropping[0] must be a tuple length of 2`)}
        if(this.cropping[1].length!=2)  {throw new TypeError(`Cropping[1] must be a tuple length of 2`)}
        if(this.cropping[2].length!=2)  {throw new TypeError(`Cropping[2] must be a tuple length of 2`)}
        this.dim_ordering = dim_ordering;
    }
    get_output_shape_for(input_shape) {
        let dim1, dim2, dim3;
        if (this.dim_ordering === 'th') {
            dim1 = (input_shape[2] != null) ? (input_shape[2] - this.cropping[0][0] - this.cropping[0][1]) : null;
            dim2 = (input_shape[3] != null) ? (input_shape[3] - this.cropping[1][0] - this.cropping[1][1]) : null;
            dim3 = (input_shape[4] != null) ? (input_shape[4] - this.cropping[2][0] - this.cropping[2][1]) : null;
            return [input_shape[0], input_shape[1], dim1, dim2, dim3];
        } else if(this.dim_ordering === 'tf') {
            dim1 = (input_shape[1] != null) ? (input_shape[1] - this.cropping[0][0] - this.cropping[0][1]) : null;
            dim2 = (input_shape[2] != null) ? (input_shape[2] - this.cropping[1][0] - this.cropping[1][1]) : null;
            dim3 = (input_shape[3] != null) ? (input_shape[3] - this.cropping[2][0] - this.cropping[2][1]) : null;
            return [input_shape[0], dim1, dim2, dim3, input_shape[4]];
        } else {
            throw new TypeError(`Invalid dim_ordering: ${this.dim_ordering}`);
        }
    }
}


/**
 * Created by ar on 22.01.17.
 */

/*
 * @author Samuel Neff (https://github.com/samuelneff)
 *
 * based almost entirely on gist from
 *
 * @author SHIN Suzuki (shinout310@gmail.com)
 *
 * https://gist.github.com/shinout/1232505
 */

function topologicalSort(arrayOfEdges) {
    var EdgeNode = (function () {
        function EdgeNode(id) {
            this.id = id;
            this.afters = [];
        }
        return EdgeNode;
    })();

    function sortDesc(a, b) {
        if (a < b)
            return 1;
        if (a > b)
            return -1;

        // a must be equal to b
        return 0;
    }
    /**
     * general topological sort
     * @param edges : list of edges. each edge forms Array<ID,ID> e.g. [12 , 3]
     * @param options When provided with 'continueOnCircularDependency' set to true, sorting will continue even if a
     *                  circular dependency is found. The precise sort is not guaranteed.
     * @returns Array : topological sorted list of IDs
     **/
    function topsort(edges, options) {
        var nodes = {};
        options = options || { continueOnCircularDependency: false };

        var sorted = [];

        // hash: id of already visited node => true
        var visited = {};

        // 1. build data structures
        edges.forEach(function (edge) {
            var fromEdge = edge[0];
            var fromStr = fromEdge.toString();
            var fromNode;

            if (!(fromNode = nodes[fromStr])) {
                fromNode = nodes[fromStr] = new EdgeNode(fromEdge);
            }

            edge.forEach(function (toEdge) {
                // since from and to are in same array, we'll always see from again, so make sure we skip it..
                if (toEdge == fromEdge) {
                    return;
                }

                var toEdgeStr = toEdge.toString();

                if (!nodes[toEdgeStr]) {
                    nodes[toEdgeStr] = new EdgeNode(toEdge);
                }
                fromNode.afters.push(toEdge);
            });
        });

        // 2. topological sort
        var keys = Object.keys(nodes);
        keys.sort(sortDesc);
        keys.forEach(function visit(idstr, ancestorsIn) {
            var node = nodes[idstr];
            var id = node.id;

            // if already exists, do nothing
            if (visited[idstr]) {
                return;
            }

            var ancestors = Array.isArray(ancestorsIn) ? ancestorsIn : [];

            ancestors.push(id);
            visited[idstr] = true;

            node.afters.sort(sortDesc);
            node.afters.forEach(function (afterID) {
                // if already in ancestors, a closed chain exists.
                if (ancestors.indexOf(afterID) >= 0) {
                    if (options.continueOnCircularDependency) {
                        return;
                    }
                    throw new Error('Circular chain found: ' + id + ' must be before ' + afterID + ' due to a direct order specification, but ' + afterID + ' must be before ' + id + ' based on other specifications.');
                }

                // recursive call
                visit(afterID.toString(), ancestors.map(function (v) {
                    return v;
                }));
            });

            sorted.unshift(id);
        });

        return sorted;
    }
    return topsort(arrayOfEdges);
}

/**
 * Created by ar on 22.01.17.
 */



/*
{
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



/////////////////////////////////////////////////////////////////////
class LWLayerBuilder {
    static buildNodeByType(nodeTypeStr, cfgJson) {
        switch (nodeTypeStr) {
            case 'datainput':
                return LW_InputLayer.get_layer(cfgJson);
            case 'dataoutput':
                return LW_OutputLayer.get_layer(cfgJson);
            case 'convolution1d':
                return LW_Convolution1D.get_layer(cfgJson);
            case 'convolution2d':
                return LW_Convolution2D.get_layer(cfgJson);
            case 'convolution3d':
                return LW_Convolution3D.get_layer(cfgJson);
            case 'pooling1d':
                return LW_MaxPooling1D.get_layer(cfgJson);
            case 'pooling2d':
                return LW_MaxPooling2D.get_layer(cfgJson);
            case 'pooling3d':
                return LW_MaxPooling3D.get_layer(cfgJson);
            case 'flatten':
                return LW_Flatten.get_layer(cfgJson);
            case 'activation':
                return LW_Activation.get_layer(cfgJson);
            case 'merge':
                return LW_Merge.get_layer(cfgJson);
            case 'dense':
                return LW_Dense.get_layer(cfgJson);
            default:
                console.log(`****WARNING**** unknown layer type [${nodeTypeStr}]`);
                return null;
        }
    }
}

/////////////////////////////////////////////////////////////////////
class NodeF {
    constructor(jsonNodeExt, nodeIdx, nodeName, inpNodesLst=null, outNodesLst=null) {
        this.nodeCfg     = jsonNodeExt;
        this.nodeIdx     = nodeIdx;
        this.inpNodesLst = inpNodesLst;
        this.outNodesLst = outNodesLst;
        this.nodeName    = nodeName;
        //
        this.shapeInp    = null;
        this.shapeOut    = null;
    }
    getType() {
        if(this.nodeCfg===null) {
            return 'Unknown';
        } else {
            return this.nodeCfg['layerType'];
        }
    }
    name() {
        if(this.nodeName===null) {
            return 'Unknown';
        } else {
            return this.nodeName;
        }
    }
    id() {
        if(this.nodeName===null) {
            return '-1';
        } else {
            return this.nodeCfg['id'];
        }
    }
    static _toStringNodeList(listOfNodes, pref='Inp') {
        let retVal = `${pref}: [`;
        if(listOfNodes !=null) {
            for(let ii of listOfNodes) {
                if(ii!=null) {
                    retVal=`${retVal} ${ii.name()},`;
                }
            }
        }
        retVal = `${retVal}]`;
        return retVal;
    }
    toString() {
        if(this.nodeCfg===null) {
            return 'NodeF(is not configured)';
        } else {
            let nodeInpStr = NodeF._toStringNodeList(this.inpNodesLst, 'Inp');
            let nodeOutStr = NodeF._toStringNodeList(this.outNodesLst, 'Out');
            return `NodeF(${this.name()})[${this.nodeIdx}](inp: [${nodeInpStr}], out: [${nodeOutStr}]) : [${this.getType()}]`;
        }
    }
    hasInpNodes() {
        if(this.inpNodesLst===null) {
            return false;
        } else {
            return (this.inpNodesLst.length>0);
        }
    }
    hasOutNodes() {
        if(this.outNodesLst===null) {
            return false;
        } else {
            return (this.outNodesLst.length>0);
        }
    }
}

/////////////////////////////////////////////////////////////////////
function _findNodeByID(listOfNodes, wireId) {
    for(let node of listOfNodes) {
        if(node.id()===wireId) {
            return node;
        }
    }
    return null;
}


/////////////////////////////////////////////////////////////////////
function calculateShapesInModel(modelJson, defaultInputShape=[null, 3, 256, 256]) {
    let modelLayers = modelJson.layers;
    if (!modelLayers)
        modelLayers = modelJson;
    let ii = 0;
    let mapNodeNames = new Map();
    let nodeArray = [];
    // (1) Preparing array with nodes
    for(let ll of modelLayers) {
        const tmpType = ll['layerType'];
        if(mapNodeNames.has(tmpType)) {
            mapNodeNames.set(tmpType,mapNodeNames.get(tmpType)+1);
        } else {
            mapNodeNames.set(tmpType,1);
        }
        const newNodeName = `${tmpType}_${mapNodeNames.get(tmpType)}`;
        let tmpNode = new NodeF(ll,ii,newNodeName);
        tmpNode.inpNodesLst = [];
        tmpNode.outNodesLst = [];

        if(ll.hasOwnProperty('shapeInp') && ll.shapeInp) {
            tmpNode.shapeInp = ll.shapeInp;

        } else {
            if(tmpType==='datainput') {
                tmpNode.shapeInp = defaultInputShape.slice();
            }
        }
        // ll.shapeInp = null;
        // ll.shapeOut = null;
        nodeArray.push(tmpNode);
        ii+=1;
    }
    // (2.1) Fill Input Nodes
    for(let [ii, node] of nodeArray.entries()) {
        // console.log(ii + ' : ' + node.name() + ' :   ' + node.nodeCfg.wires);
        if(node.nodeCfg.hasOwnProperty('wires')) {
            for (let wireIdx of node.nodeCfg.wires) {
                let tmpOutNode = _findNodeByID(nodeArray, wireIdx);
                if (tmpOutNode != null) {
                    node.outNodesLst.push(tmpOutNode);
                    // tmpOutNode.inpNodesLst.push(node);
                }
            }
        } else {
            //pass
        }
        // console.log(`\t\t${node.toString()}`);
    }
    // (2.2) Fill Output Nodes
    for(let node of nodeArray) {
        for(let nodeOut of node.outNodesLst) {
            nodeOut.inpNodesLst.push(node);
        }
    }
  /*  for( let [ii,ll] of nodeArray.entries()) {
        console.log(`${ii}  :  ${ll.toString()}`);
    }*/
    // (3) Prepare Edge Index before sorting
    let edgesIdx = [];
    for(let [idx, ll] of nodeArray.entries()) {
        if(ll.hasOutNodes()) {
            for(let outNode of ll.outNodesLst) {
                edgesIdx.push([ll.nodeIdx, outNode.nodeIdx]);
            }
        }
    }
    // console.log(edgesIdx);
    // (4) Sort Topolgicaly index of nodes
    let nodeIndexTopoSorted = topologicalSort(edgesIdx);
    // console.log(nodeIndexTopoSorted);
    // console.log(nodeArray);
    // (5) Fill Shape Information for every Node from list of NodeF
    for(let ii of nodeIndexTopoSorted) {
        let ll = nodeArray[ii];
        let tmpLayer = LWLayerBuilder.buildNodeByType(ll.getType(), ll.nodeCfg['params']);
        if(ll.shapeInp===null) {
            if(ll.hasInpNodes()) {
                if(tmpLayer.isMultiInput()) {
                    // Node like a Merge
                    let tmpInp = [];
                    let isOk   = true;
                    for (let nn of ll.inpNodesLst) {
                        if(!nn.shapeOut) {
                            isOk = false;
                            continue;
                        }
                        tmpInp.push(nn.shapeOut.slice());
                    }
                    if(isOk) {
                        ll.shapeInp = tmpInp;
                    } else {
                        ll.shapeInp = null;
                    }
                } else {
                    let inpNodeF = ll.inpNodesLst[0];
                    if((inpNodeF!=null) && (inpNodeF.shapeOut!=null)) {
                        ll.shapeInp = inpNodeF.shapeOut.slice();
                    } else {
                        ll.shapeInp = null;
                    }
                }
            } else {
                ll.shapeInp = null;
            }
        } else {
            // Node from Input Nodes: pass
        }
        if(ll.shapeInp===null) {
            ll.shapeOut  = null;
        } else {
            ll.shapeOut  = tmpLayer.get_output_shape_for(ll.shapeInp.slice());
            // console.log(`[${ii}] ${ll.shapeInp} : [${ll.shapeOut}] -> ${ll.toString()} * ${tmpLayer}`);
        }
    }
    // (6) Add inpShape and outShape properties in Model Json
    for( let ll of nodeArray) {
        modelLayers[ll.nodeIdx].shapeInp = ll.shapeInp;
        modelLayers[ll.nodeIdx].shapeOut = ll.shapeOut;
    }
}

function test_network_library() {
    console.log('Hello, from network library!');
}




