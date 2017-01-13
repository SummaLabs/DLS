#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

###############################################
def conv_output_length(input_length, filter_size, border_mode, stride, dilation=1):
    if input_length is None:
        return None
    assert border_mode in {'same', 'valid', 'full'}
    dilated_filter_size = filter_size + (filter_size - 1) * (dilation - 1)
    if border_mode == 'same':
        output_length = input_length
    elif border_mode == 'valid':
        output_length = input_length - dilated_filter_size + 1
    elif border_mode == 'full':
        output_length = input_length + dilated_filter_size - 1
    return (output_length + stride - 1) // stride

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


###############################################
class LW_Convolution1D(LW_Layer):
    def __init__(self, nb_filter, filter_length, border_mode='valid', subsample_length=1):
        if border_mode not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for Convolution1D:', border_mode)
        self.nb_filter = nb_filter
        self.filter_length = filter_length
        self.border_mode = border_mode
        self.subsample = (subsample_length, 1)
    def get_output_shape_for(self, input_shape):
        length = conv_output_length(input_shape[1],
                                    self.filter_length,
                                    self.border_mode,
                                    self.subsample[0])
        return (input_shape[0], length, self.nb_filter)

class LW_AtrousConvolution1D(LW_Convolution1D):
    def __init__(self, nb_filter, filter_length,
                 border_mode='valid', subsample_length=1, atrous_rate=1):
        self.atrous_rate = int(atrous_rate)
        super(LW_AtrousConvolution1D, self).__init__(nb_filter, filter_length,
                                                     border_mode=border_mode,
                                                     subsample_length=subsample_length)
    def get_output_shape_for(self, input_shape):
        length = conv_output_length(input_shape[1],
                                    self.filter_length,
                                    self.border_mode,
                                    self.subsample[0],
                                    dilation=self.atrous_rate)
        return (input_shape[0], length, self.nb_filter)


if __name__ == '__main__':
    pass