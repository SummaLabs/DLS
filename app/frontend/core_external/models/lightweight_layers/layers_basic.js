/**
 * Created by ar on 17.01.17.
 */

export const default_dim_ordering = 'th';

//////////////////////////////////////////////
export class LW_Layer {
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
export class LW_InputLayer extends LW_Layer {
    constructor(input_shape=null) {
        super();
        this.input_shape = input_shape;
    }
}

export class LW_OutputLayer extends LW_Layer {
    constructor() {
        super();
    }
}

//////////////////////////////////////////////
export class LW_Merge extends LW_Layer {
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
export class LW_Flatten extends LW_Layer {
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
export class LW_Dense extends LW_Layer {
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
export class LW_Activation extends LW_Layer {

}
