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