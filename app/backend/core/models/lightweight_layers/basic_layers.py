#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

###############################################
default_dim_ordering = 'th'

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

class LW_Convolution2D(LW_Layer):
    def __init__(self, nb_filter, nb_row, nb_col,
                 border_mode='valid', subsample=(1, 1), dim_ordering='default'):
        if dim_ordering == 'default':
            dim_ordering = default_dim_ordering
        assert dim_ordering in {'tf', 'th'}, 'dim_ordering must be in {tf, th}'
        if border_mode not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for Convolution2D:', border_mode)
        self.nb_filter = nb_filter
        self.nb_row = nb_row
        self.nb_col = nb_col
        self.border_mode = border_mode
        self.subsample = tuple(subsample)
        self.dim_ordering = dim_ordering
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'th':
            rows = input_shape[2]
            cols = input_shape[3]
        elif self.dim_ordering == 'tf':
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        rows = conv_output_length(rows, self.nb_row, self.border_mode, self.subsample[0])
        cols = conv_output_length(cols, self.nb_col, self.border_mode, self.subsample[1])
        if self.dim_ordering == 'th':
            return (input_shape[0], self.nb_filter, rows, cols)
        elif self.dim_ordering == 'tf':
            return (input_shape[0], rows, cols, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_AtrousConvolution2D(LW_Convolution2D):
    def __init__(self, nb_filter, nb_row, nb_col,
                 init='glorot_uniform', activation=None, weights=None,
                 border_mode='valid', subsample=(1, 1),
                 atrous_rate=(1, 1), dim_ordering='default',
                 W_regularizer=None, b_regularizer=None, activity_regularizer=None,
                 W_constraint=None, b_constraint=None,
                 bias=True, **kwargs):
        if dim_ordering == 'default':
            dim_ordering = default_dim_ordering
        if border_mode not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for AtrousConv2D:', border_mode)
        self.atrous_rate = tuple(atrous_rate)
        super(LW_AtrousConvolution2D, self).__init__(nb_filter, nb_row, nb_col, border_mode=border_mode,
                                                  subsample=subsample, dim_ordering=dim_ordering)
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'th':
            rows = input_shape[2]
            cols = input_shape[3]
        elif self.dim_ordering == 'tf':
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        rows = conv_output_length(rows, self.nb_row, self.border_mode, self.subsample[0], dilation=self.atrous_rate[0])
        cols = conv_output_length(cols, self.nb_col, self.border_mode, self.subsample[1], dilation=self.atrous_rate[1])
        if self.dim_ordering == 'th':
            return (input_shape[0], self.nb_filter, rows, cols)
        elif self.dim_ordering == 'tf':
            return (input_shape[0], rows, cols, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_SeparableConvolution2D(LW_Layer):
    def __init__(self, nb_filter, nb_row, nb_col,
                 border_mode='valid', subsample=(1, 1),
                 depth_multiplier=1, dim_ordering='default'):
        if dim_ordering == 'default':
            dim_ordering = default_dim_ordering
        assert dim_ordering in {'tf', 'th'}, 'dim_ordering must be in {tf, th}'
        if border_mode not in {'valid', 'same'}:
            raise Exception('Invalid border mode for SeparableConv2D:', border_mode)
        self.nb_filter = nb_filter
        self.nb_row = nb_row
        self.nb_col = nb_col
        # self.activation = activations.get(activation)
        self.border_mode = border_mode
        self.subsample = tuple(subsample)
        self.depth_multiplier = depth_multiplier
        self.dim_ordering = dim_ordering
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'th':
            rows = input_shape[2]
            cols = input_shape[3]
        elif self.dim_ordering == 'tf':
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        rows = conv_output_length(rows, self.nb_row, self.border_mode, self.subsample[0])
        cols = conv_output_length(cols, self.nb_col, self.border_mode, self.subsample[1])
        if self.dim_ordering == 'th':
            return (input_shape[0], self.nb_filter, rows, cols)
        elif self.dim_ordering == 'tf':
            return (input_shape[0], rows, cols, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_Convolution3D(LW_Layer):
    def __init__(self, nb_filter, kernel_dim1, kernel_dim2, kernel_dim3,
                 border_mode='valid', subsample=(1, 1, 1), dim_ordering='default'):
        if dim_ordering == 'default':
            dim_ordering = default_dim_ordering
        assert dim_ordering in {'tf', 'th'}, 'dim_ordering must be in {tf, th}'
        if border_mode not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for Convolution3D:', border_mode)
        self.nb_filter = nb_filter
        self.kernel_dim1 = kernel_dim1
        self.kernel_dim2 = kernel_dim2
        self.kernel_dim3 = kernel_dim3
        self.border_mode = border_mode
        self.subsample = tuple(subsample)
        self.dim_ordering = dim_ordering
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'th':
            conv_dim1 = input_shape[2]
            conv_dim2 = input_shape[3]
            conv_dim3 = input_shape[4]
        elif self.dim_ordering == 'tf':
            conv_dim1 = input_shape[1]
            conv_dim2 = input_shape[2]
            conv_dim3 = input_shape[3]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        conv_dim1 = conv_output_length(conv_dim1, self.kernel_dim1, self.border_mode, self.subsample[0])
        conv_dim2 = conv_output_length(conv_dim2, self.kernel_dim2, self.border_mode, self.subsample[1])
        conv_dim3 = conv_output_length(conv_dim3, self.kernel_dim3, self.border_mode, self.subsample[2])
        if self.dim_ordering == 'th':
            return (input_shape[0], self.nb_filter, conv_dim1, conv_dim2, conv_dim3)
        elif self.dim_ordering == 'tf':
            return (input_shape[0], conv_dim1, conv_dim2, conv_dim3, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_UpSampling1D(LW_Layer):
    def __init__(self, length=2):
        self.length = length
    def get_output_shape_for(self, input_shape):
        length = self.length * input_shape[1] if input_shape[1] is not None else None
        return (input_shape[0], length, input_shape[2])

class LW_UpSampling2D(LW_Layer):
    def __init__(self, size=(2, 2), dim_ordering='default'):
        if dim_ordering == 'default':
            dim_ordering = default_dim_ordering
        assert dim_ordering in {'tf', 'th'}, 'dim_ordering must be in {tf, th}'
        self.size = tuple(size)
        self.dim_ordering = dim_ordering
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'th':
            width = self.size[0] * input_shape[2] if input_shape[2] is not None else None
            height = self.size[1] * input_shape[3] if input_shape[3] is not None else None
            return (input_shape[0],
                    input_shape[1],
                    width,
                    height)
        elif self.dim_ordering == 'tf':
            width = self.size[0] * input_shape[1] if input_shape[1] is not None else None
            height = self.size[1] * input_shape[2] if input_shape[2] is not None else None
            return (input_shape[0],
                    width,
                    height,
                    input_shape[3])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_UpSampling3D(LW_Layer):
    def __init__(self, size=(2, 2, 2), dim_ordering='default'):
        if dim_ordering == 'default':
            dim_ordering = default_dim_ordering
        assert dim_ordering in {'tf', 'th'}, 'dim_ordering must be in {tf, th}'
        self.size = tuple(size)
        self.dim_ordering = dim_ordering
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'th':
            dim1 = self.size[0] * input_shape[2] if input_shape[2] is not None else None
            dim2 = self.size[1] * input_shape[3] if input_shape[3] is not None else None
            dim3 = self.size[2] * input_shape[4] if input_shape[4] is not None else None
            return (input_shape[0],
                    input_shape[1],
                    dim1,
                    dim2,
                    dim3)
        elif self.dim_ordering == 'tf':
            dim1 = self.size[0] * input_shape[1] if input_shape[1] is not None else None
            dim2 = self.size[1] * input_shape[2] if input_shape[2] is not None else None
            dim3 = self.size[2] * input_shape[3] if input_shape[3] is not None else None
            return (input_shape[0],
                    dim1,
                    dim2,
                    dim3,
                    input_shape[4])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

if __name__ == '__main__':
    pass