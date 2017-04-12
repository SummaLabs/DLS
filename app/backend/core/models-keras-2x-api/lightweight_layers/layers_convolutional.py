#!/usr/bin/python
# -*- coding: utf-8 -*-
__author__ = 'ar'

from layers_basic import LW_Layer, default_data_format

###############################################
def conv_output_length(filters, kernel_size, padding, strides, dilation=1):
    if filters is None:
        return None
    assert padding in {'same', 'valid', 'full'}
    dilated_filter_size = kernel_size + (kernel_size - 1) * (dilation - 1)
    if padding == 'same':
        output_length = filters
    elif padding == 'valid':
        output_length = filters - dilated_filter_size + 1
    elif padding == 'full':
        output_length = filters + dilated_filter_size - 1
    else:
        raise Exception('Invalid border mode [%s]' % padding)
    return (output_length + strides - 1) // strides

###############################################
class LW_Conv1D(LW_Layer):
    def __init__(self, filters, kernel_size, padding='valid', strides=1):
        if padding not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for Convolution1D:', padding)
        self.nb_filter = filters
        self.filter_length = kernel_size
        self.border_mode = padding
        self.subsample = (strides, 1)
    def get_output_shape_for(self, input_shape):
        length = conv_output_length(input_shape[1],
                                    self.filter_length,
                                    self.border_mode,
                                    self.subsample[0])
        return (input_shape[0], length, self.nb_filter)

class LW_AtrousConv1D(LW_Conv1D):
    def __init__(self, filters, kernel_size,
                 padding='valid', strides=1, atrous_rate=1):
        self.atrous_rate = int(atrous_rate)
        super(LW_AtrousConv1D, self).__init__(filters, kernel_size,
                                              padding=padding,
                                              strides=strides)
    def get_output_shape_for(self, input_shape):
        length = conv_output_length(input_shape[1],
                                    self.filter_length,
                                    self.border_mode,
                                    self.subsample[0],
                                    dilation=self.atrous_rate)
        return (input_shape[0], length, self.nb_filter)

class LW_Conv2D(LW_Layer):
    def __init__(self, filters, kernel_size,
                 padding='valid', strides=(1, 1), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, 'data_format must be in {channels_last, channels_first}'
        if padding not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for Convolution2D:', padding)
        self.nb_filter = filters
        self.nb_row = kernel_size[0]
        self.nb_col = kernel_size[1]
        self.border_mode = padding
        self.subsample = tuple(strides)
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            rows = input_shape[2]
            cols = input_shape[3]
        elif self.dim_ordering == 'channels_last':
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        rows = conv_output_length(rows, self.nb_row, self.border_mode, self.subsample[0])
        cols = conv_output_length(cols, self.nb_col, self.border_mode, self.subsample[1])
        if self.dim_ordering == 'channels_first':
            return (input_shape[0], self.nb_filter, rows, cols)
        elif self.dim_ordering == 'channels_last':
            return (input_shape[0], rows, cols, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

###############################################
class LW_AtrousConv2D(LW_Conv2D):
    def __init__(self, filters, kernel_size,
                 padding='valid', strides=(1, 1),
                 atrous_rate=(1, 1), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        if padding not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for AtrousConv2D:', padding)
        self.atrous_rate = tuple(atrous_rate)
        super(LW_AtrousConv2D, self).__init__(filters, kernel_size, padding=padding,
                                              strides=strides, data_format=data_format)
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            rows = input_shape[2]
            cols = input_shape[3]
        elif self.dim_ordering == 'channels_last':
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        rows = conv_output_length(rows, self.nb_row, self.border_mode, self.subsample[0], dilation=self.atrous_rate[0])
        cols = conv_output_length(cols, self.nb_col, self.border_mode, self.subsample[1], dilation=self.atrous_rate[1])
        if self.dim_ordering == 'channels_first':
            return (input_shape[0], self.nb_filter, rows, cols)
        elif self.dim_ordering == 'channels_last':
            return (input_shape[0], rows, cols, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_SeparableConv2D(LW_Layer):
    def __init__(self, filters, kernel_size,
                 padding='valid', strides=(1, 1),
                 depth_multiplier=1, data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        if padding not in {'valid', 'same'}:
            raise Exception('Invalid border mode for SeparableConv2D:', padding)
        self.nb_filter = filters
        self.nb_row = kernel_size[0]
        self.nb_col = kernel_size[1]
        # self.activation = activations.get(activation)
        self.border_mode = padding
        self.subsample = tuple(strides)
        self.depth_multiplier = depth_multiplier
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            rows = input_shape[2]
            cols = input_shape[3]
        elif self.dim_ordering == 'channels_last':
            rows = input_shape[1]
            cols = input_shape[2]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        rows = conv_output_length(rows, self.nb_row, self.border_mode, self.subsample[0])
        cols = conv_output_length(cols, self.nb_col, self.border_mode, self.subsample[1])
        if self.dim_ordering == 'channels_first':
            return (input_shape[0], self.nb_filter, rows, cols)
        elif self.dim_ordering == 'channels_last':
            return (input_shape[0], rows, cols, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

###############################################
class LW_Conv3D(LW_Layer):
    def __init__(self, filters, kernel_size,
                 padding='valid', strides=(1, 1, 1), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        if padding not in {'valid', 'same', 'full'}:
            raise Exception('Invalid border mode for Convolution3D:', padding)
        self.nb_filter = filters
        self.kernel_dim1 = kernel_size[0]
        self.kernel_dim2 = kernel_size[1]
        self.kernel_dim3 = kernel_size[2]
        self.border_mode = padding
        self.subsample = tuple(strides)
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            conv_dim1 = input_shape[2]
            conv_dim2 = input_shape[3]
            conv_dim3 = input_shape[4]
        elif self.dim_ordering == 'channels_last':
            conv_dim1 = input_shape[1]
            conv_dim2 = input_shape[2]
            conv_dim3 = input_shape[3]
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)
        conv_dim1 = conv_output_length(conv_dim1, self.kernel_dim1, self.border_mode, self.subsample[0])
        conv_dim2 = conv_output_length(conv_dim2, self.kernel_dim2, self.border_mode, self.subsample[1])
        conv_dim3 = conv_output_length(conv_dim3, self.kernel_dim3, self.border_mode, self.subsample[2])
        if self.dim_ordering == 'channels_first':
            return (input_shape[0], self.nb_filter, conv_dim1, conv_dim2, conv_dim3)
        elif self.dim_ordering == 'channels_last':
            return (input_shape[0], conv_dim1, conv_dim2, conv_dim3, self.nb_filter)
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

###############################################
class LW_UpSampling1D(LW_Layer):
    def __init__(self, size=2):
        self.length = size
    def get_output_shape_for(self, input_shape):
        length = self.length * input_shape[1] if input_shape[1] is not None else None
        return (input_shape[0], length, input_shape[2])

class LW_UpSampling2D(LW_Layer):
    def __init__(self, size=(2, 2), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        self.size = tuple(size)
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            width = self.size[0] * input_shape[2] if input_shape[2] is not None else None
            height = self.size[1] * input_shape[3] if input_shape[3] is not None else None
            return (input_shape[0],
                    input_shape[1],
                    width,
                    height)
        elif self.dim_ordering == 'channels_last':
            width = self.size[0] * input_shape[1] if input_shape[1] is not None else None
            height = self.size[1] * input_shape[2] if input_shape[2] is not None else None
            return (input_shape[0],
                    width,
                    height,
                    input_shape[3])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_UpSampling3D(LW_Layer):
    def __init__(self, size=(2, 2, 2), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        self.size = tuple(size)
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            dim1 = self.size[0] * input_shape[2] if input_shape[2] is not None else None
            dim2 = self.size[1] * input_shape[3] if input_shape[3] is not None else None
            dim3 = self.size[2] * input_shape[4] if input_shape[4] is not None else None
            return (input_shape[0],
                    input_shape[1],
                    dim1,
                    dim2,
                    dim3)
        elif self.dim_ordering == 'channels_last':
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

###############################################
class LW_ZeroPadding1D(LW_Layer):
    def __init__(self, padding=1):
        self.padding = padding
        if isinstance(padding, int):
            self.left_pad = padding
            self.right_pad = padding
        elif isinstance(padding, dict):
            if set(padding.keys()) <= {'left_pad', 'right_pad'}:
                self.left_pad = padding.get('left_pad', 0)
                self.right_pad = padding.get('right_pad', 0)
            else:
                raise ValueError('Unexpected key found in `padding` dictionary. '
                                 'Keys have to be in {"left_pad", "right_pad"}. '
                                 'Found: ' + str(padding.keys()))
        else:
            padding = tuple(padding)
            if len(padding) != 2:
                raise ValueError('`padding` should be int, or dict with keys '
                                 '{"left_pad", "right_pad"}, or tuple of length 2. '
                                 'Found: ' + str(padding))
            self.left_pad = padding[0]
            self.right_pad = padding[1]
    def get_output_shape_for(self, input_shape):
        length = input_shape[1] + self.left_pad + self.right_pad if input_shape[1] is not None else None
        return (input_shape[0], length, input_shape[2])

class LW_ZeroPadding2D(LW_Layer):
    def __init__(self, padding=(1, 1), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, '`dim_ordering` must be in {"tf", "th"}.'
        self.padding = padding
        if isinstance(padding, dict):
            if set(padding.keys()) <= {'top_pad', 'bottom_pad', 'left_pad', 'right_pad'}:
                self.top_pad = padding.get('top_pad', 0)
                self.bottom_pad = padding.get('bottom_pad', 0)
                self.left_pad = padding.get('left_pad', 0)
                self.right_pad = padding.get('right_pad', 0)
            else:
                raise ValueError('Unexpected key found in `padding` dictionary. '
                                 'Keys have to be in {"top_pad", "bottom_pad", '
                                 '"left_pad", "right_pad"}.'
                                 'Found: ' + str(padding.keys()))
        else:
            padding = tuple(padding)
            if len(padding) == 2:
                self.top_pad = padding[0]
                self.bottom_pad = padding[0]
                self.left_pad = padding[1]
                self.right_pad = padding[1]
            elif len(padding) == 4:
                self.top_pad = padding[0]
                self.bottom_pad = padding[1]
                self.left_pad = padding[2]
                self.right_pad = padding[3]
            else:
                raise TypeError('`padding` should be tuple of int '
                                'of length 2 or 4, or dict. '
                                'Found: ' + str(padding))
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            rows = input_shape[2] + self.top_pad + self.bottom_pad if input_shape[2] is not None else None
            cols = input_shape[3] + self.left_pad + self.right_pad if input_shape[3] is not None else None
            return (input_shape[0], input_shape[1], rows, cols)
        elif self.dim_ordering == 'channels_last':
            rows = input_shape[1] + self.top_pad + self.bottom_pad if input_shape[1] is not None else None
            cols = input_shape[2] + self.left_pad + self.right_pad if input_shape[2] is not None else None
            return (input_shape[0], rows, cols, input_shape[3])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_ZeroPadding3D(LW_Layer):
    def __init__(self, padding=(1, 1, 1), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        self.padding = tuple(padding)
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            dim1 = input_shape[2] + 2 * self.padding[0] if input_shape[2] is not None else None
            dim2 = input_shape[3] + 2 * self.padding[1] if input_shape[3] is not None else None
            dim3 = input_shape[4] + 2 * self.padding[2] if input_shape[4] is not None else None
            return (input_shape[0], input_shape[1], dim1, dim2, dim3)
        elif self.dim_ordering == 'channels_last':
            dim1 = input_shape[1] + 2 * self.padding[0] if input_shape[1] is not None else None
            dim2 = input_shape[2] + 2 * self.padding[1] if input_shape[2] is not None else None
            dim3 = input_shape[3] + 2 * self.padding[2] if input_shape[3] is not None else None
            return (input_shape[0], dim1, dim2, dim3, input_shape[4])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

###############################################
class LW_Cropping1D(LW_Layer):
    def __init__(self, cropping=(1, 1)):
        self.cropping = tuple(cropping)
        assert len(self.cropping) == 2, 'cropping must be a tuple length of 2'
    def get_output_shape_for(self, input_shape):
        length = input_shape[1] - self.cropping[0] - self.cropping[1] if input_shape[1] is not None else None
        return (input_shape[0], length, input_shape[2])

class LW_Cropping2D(LW_Layer):
    def __init__(self, cropping=((0, 0), (0, 0)), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        self.cropping = tuple(cropping)
        assert len(self.cropping) == 2, 'cropping must be a tuple length of 2'
        assert len(self.cropping[0]) == 2, 'cropping[0] must be a tuple length of 2'
        assert len(self.cropping[1]) == 2, 'cropping[1] must be a tuple length of 2'
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            return (input_shape[0],
                    input_shape[1],
                    input_shape[2] - self.cropping[0][0] - self.cropping[0][1],
                    input_shape[3] - self.cropping[1][0] - self.cropping[1][1])
        elif self.dim_ordering == 'channels_last':
            return (input_shape[0],
                    input_shape[1] - self.cropping[0][0] - self.cropping[0][1],
                    input_shape[2] - self.cropping[1][0] - self.cropping[1][1],
                    input_shape[3])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

class LW_Cropping3D(LW_Layer):
    def __init__(self, cropping=((1, 1), (1, 1), (1, 1)), data_format='default'):
        if data_format == 'default':
            data_format = default_data_format
        self.cropping = tuple(cropping)
        assert len(self.cropping) == 3, 'cropping must be a tuple length of 3'
        assert len(self.cropping[0]) == 2, 'cropping[0] must be a tuple length of 2'
        assert len(self.cropping[1]) == 2, 'cropping[1] must be a tuple length of 2'
        assert len(self.cropping[2]) == 2, 'cropping[2] must be a tuple length of 2'
        assert data_format in {'channels_last', 'channels_first'}, 'dim_ordering must be in {channels_last, channels_first}'
        self.dim_ordering = data_format
    def get_output_shape_for(self, input_shape):
        if self.dim_ordering == 'channels_first':
            dim1 = input_shape[2] - self.cropping[0][0] - self.cropping[0][1] if input_shape[2] is not None else None
            dim2 = input_shape[3] - self.cropping[1][0] - self.cropping[1][1] if input_shape[3] is not None else None
            dim3 = input_shape[4] - self.cropping[2][0] - self.cropping[2][1] if input_shape[4] is not None else None
            return (input_shape[0], input_shape[1], dim1, dim2, dim3)
        elif self.dim_ordering == 'channels_last':
            dim1 = input_shape[1] - self.cropping[0][0] - self.cropping[0][1] if input_shape[1] is not None else None
            dim2 = input_shape[2] - self.cropping[1][0] - self.cropping[1][1] if input_shape[2] is not None else None
            dim3 = input_shape[3] - self.cropping[2][0] - self.cropping[2][1] if input_shape[3] is not None else None
            return (input_shape[0], dim1, dim2, dim3, input_shape[4])
        else:
            raise Exception('Invalid dim_ordering: ' + self.dim_ordering)

###############################################
if __name__ == '__main__':
    pass