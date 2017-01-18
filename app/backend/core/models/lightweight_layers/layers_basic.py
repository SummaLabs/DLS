#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

###############################################
default_dim_ordering = 'th'

###############################################
class LW_Layer(object):
    input_shape=None
    def get_config(self):
        pass
    def get_output_shape_for(self, input_shape):
        return input_shape

###############################################
class LW_InputLayer(LW_Layer):
    def __init__(self, input_shape=None):
        self.input_shape = input_shape

###############################################
class LW_Merge(LW_Layer):
    def __init__(self, layers=None, mode='sum', concat_axis=-1, dot_axes=-1):
        self.layers = layers
        self.mode = mode
        self.concat_axis = concat_axis
        self.dot_axes = dot_axes
    def get_output_shape_for(self, input_shape):
        input_shapes = input_shape
        if self.mode in ['sum', 'mul', 'ave', 'max']:
            # All tuples in input_shapes should be the same.
            return input_shapes[0]
        elif self.mode == 'concat':
            output_shape = list(input_shapes[0])
            for shape in input_shapes[1:]:
                if output_shape[self.concat_axis] is None or shape[self.concat_axis] is None:
                    output_shape[self.concat_axis] = None
                    break
                output_shape[self.concat_axis] += shape[self.concat_axis]
            return tuple(output_shape)
        elif self.mode in ['dot', 'cos']:
            shape1 = list(input_shapes[0])
            shape2 = list(input_shapes[1])
            shape1.pop(self.dot_axes[0])
            shape2.pop(self.dot_axes[1])
            shape2.pop(0)
            output_shape = shape1 + shape2
            if len(output_shape) == 1:
                output_shape += [1]
            return tuple(output_shape)

###############################################
class LW_Flatten(LW_Layer):
    def get_output_shape_for(self, input_shape):
        if not all(input_shape[1:]):
            raise Exception('The shape of the input to "Flatten" '
                            'is not fully defined '
                            '(got ' + str(input_shape[1:]) + '. '
                            'Make sure to pass a complete "input_shape" '
                            'or "batch_input_shape" argument to the first '
                            'layer in your model.')
        tprod = 1
        for ii in input_shape[1:]:
            tprod += ii
        return (input_shape[0], tprod)

###############################################
class LW_Dense(LW_Layer):
    def __init__(self, output_dim):
        self.output_dim = output_dim
    def get_output_shape_for(self, input_shape):
        assert input_shape and len(input_shape) == 2
        return (input_shape[0], self.output_dim)

class LW_Activation(LW_Layer):
    pass

###############################################
if __name__ == '__main__':
    testMergeLayer = LW_Merge(mode='concat')
    print ('----')