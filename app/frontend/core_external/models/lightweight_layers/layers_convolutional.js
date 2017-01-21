/**
 * Created by ar on 20.01.17.
 */

import {default_dim_ordering, LW_Layer} from './layers_basic';

//////////////////////////////////////////////
export function conv_output_length({input_length, filter_size, border_mode, stride, dilation=1}) {
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
export class LW_Convolution1D extends LW_Layer {
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
}

export class LW_AtrousConvolution1D extends LW_Convolution1D {
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
}

//////////////////////////////////////////////
export class LW_Convolution2D extends LW_Layer {
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
}

export class LW_AtrousConvolution2D extends LW_Convolution2D {
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
}

export class LW_SeparableConvolution2D extends LW_Layer {
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
}

//////////////////////////////////////////////
export class LW_Convolution3D extends LW_Layer {
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
}

//////////////////////////////////////////////
export class LW_UpSampling1D extends LW_Layer {
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
}

export class LW_UpSampling2D extends LW_Layer {
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
}

export class LW_UpSampling3D extends LW_Layer {
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
}

//////////////////////////////////////////////
export class LW_ZeroPadding1D extends LW_Layer {
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

export class LW_ZeroPadding2D extends LW_Layer {
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

export class LW_ZeroPadding3D extends LW_Layer {
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
export class LW_Cropping1D extends LW_Layer {
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

export class LW_Cropping2D extends LW_Layer {
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

export class LW_Cropping3D extends LW_Layer {
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


