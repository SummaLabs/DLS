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

class LW_InputLayer(LW_Layer):
    def __init__(self, input_shape=None):
        self.input_shape = input_shape

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

if __name__ == '__main__':
    pass