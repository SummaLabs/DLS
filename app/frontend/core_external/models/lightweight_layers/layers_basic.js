/**
 * Created by ar on 17.01.17.
 */

export const default_dim_ordering = 'th';

//////////////////////////////////////////////
export class LW_Layer {
    constructor() {
        this.input_shape=None;
    }
    get_config() {
        return null;
    }
    get_output_shape_for(input_shape) {
        return input_shape;
    }
    toString() {
        let outputShape = this.get_output_shape_for(this.input_shape);
        return `LW_Layer(input_shape=${this.input_shape}, output_shape=${outputShape})`;
    }
}

//////////////////////////////////////////////
export class LW_InputLayer extends LW_Layer {
    constructor(input_shape=null) {
        super();
        this.input_shape = input_shape;
    }
}

//////////////////////////////////////////////
