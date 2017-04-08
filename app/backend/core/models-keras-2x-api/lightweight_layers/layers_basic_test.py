import unittest

from layers_basic import LW_Merge, LW_InputLayer, LW_Flatten


import keras
from keras.models import Model
from keras.layers import merge, Input

class TestBasicLWLayers(unittest.TestCase):

    def setUp(self):
        print ("In method:: [%s]" % self._testMethodName)

    def test_input(self):
        lstInpShapes = [[None, 16], [None, 24, 24], [None, 128, 64, 128]]
        for inpShape in lstInpShapes:
            inp = Input(shape=inpShape[1:])
            model = Model(inputs=inp, outputs=inp)
            outShape = model.output_shape
            #
            input_layer = LW_InputLayer()
            lw_outShape = tuple(input_layer.get_output_shape_for(input_shape=inpShape))
            self.assertTrue(outShape[1:] == lw_outShape[1:])

    def test_flatten(self):
        lstInpShapes = [[None, 24,24], [None, 128, 64, 128]]
        for inpShape in lstInpShapes:
            # print ('#shape = %s' % inpShape)
            inp = Input(shape=inpShape[1:])
            x = keras.layers.Flatten()(inp)
            model = Model(inputs=inp, outputs=x)
            outShape = model.output_shape
            flatten_layer = LW_Flatten()
            lw_outShape = tuple(flatten_layer.get_output_shape_for(input_shape=inpShape))
            self.assertTrue (outShape[1:] == lw_outShape[1:])

    def test_merge_1d_concat(self):
        #mode: 'sum', 'mul', 'concat', 'ave', 'cos', 'dot', 'max'
        inp1 = Input(shape=[8])
        inp2 = Input(shape=[3])
        # FIXME: this is a Keras 1.x API
        # k_x = merge(inputs=[k_inp1, k_inp2], mode='concat')
        # FIXME: this is a Keras 2.x API
        x = keras.layers.Concatenate()([inp1, inp2])
        model = Model(inputs=[inp1, inp2], outputs=x)
        outShape = model.output_shape
        #
        merge_layer = LW_Merge(mode='concat')
        lw_outShape = merge_layer.get_output_shape_for(input_shape=[[None, 8], [None, 3]])
        self.assertTrue (outShape[1:] == lw_outShape[1:])

    def test_merge_1d_all(self):
        # mode: 'sum', 'mul', 'concat', 'ave', 'cos', 'dot', 'max'
        for pmode in ['sum', 'mul', 'concat', 'ave', 'dot', 'max']:
            print ('Mode: [ %s ]' % pmode)
            inp1 = Input(shape=[10])
            inp2 = Input(shape=[10])
            # FIXME: this is a Keras 1.x API
            # k_x = merge(inputs=[k_inp1, k_inp2], mode='concat')
            # FIXME: this is a Keras 2.x API
            if pmode == 'sum':
                x = keras.layers.Add()([inp1, inp2])
            elif pmode == 'mul':
                x = keras.layers.Multiply()([inp1, inp2])
            elif pmode == 'concat':
                x = keras.layers.Concatenate()([inp1, inp2])
            elif pmode == 'ave':
                x = keras.layers.Average()([inp1, inp2])
            elif pmode == 'dot':
                x = keras.layers.Dot(axes=-1)([inp1, inp2])
            elif pmode == 'max':
                x = keras.layers.Maximum()([inp1, inp2])
            model = Model(inputs=[inp1, inp2], outputs=x)
            outShape = model.output_shape
            #
            merge_layer = LW_Merge(mode=pmode)
            lw_outShape = tuple(merge_layer.get_output_shape_for(input_shape=[[None, 10], [None, 10]]))
            self.assertTrue (outShape[1:] == lw_outShape[1:])

    def test_merge_2d_all(self):
        # mode: 'sum', 'mul', 'concat', 'ave', 'cos', 'dot', 'max'
        inpShape1 = [None, 32, 24]
        inpShape2 = [None, 32, 24]
        for pmode in ['sum', 'mul', 'concat', 'ave', 'dot', 'max']:
            print ('Mode: [ %s ]' % pmode)
            inp1 = Input(shape=inpShape1[1:])
            inp2 = Input(shape=inpShape2[1:])
            # FIXME: this is a Keras 1.x API
            # k_x = merge(inputs=[k_inp1, k_inp2], mode='concat')
            # FIXME: this is a Keras 2.x API
            if pmode == 'sum':
                x = keras.layers.Add()([inp1, inp2])
            elif pmode == 'mul':
                x = keras.layers.Multiply()([inp1, inp2])
            elif pmode == 'concat':
                x = keras.layers.Concatenate()([inp1, inp2])
            elif pmode == 'ave':
                x = keras.layers.Average()([inp1, inp2])
            elif pmode == 'dot':
                x = keras.layers.Dot(axes=-1)([inp1, inp2])
            elif pmode == 'max':
                x = keras.layers.Maximum()([inp1, inp2])
            model = Model(inputs=[inp1, inp2], outputs=x)
            outShape = model.output_shape
            #
            merge_layer = LW_Merge(mode=pmode)
            lw_outShape = merge_layer.get_output_shape_for(input_shape=[inpShape1, inpShape2])
            self.assertTrue (outShape[1:] == lw_outShape[1:])


    def test_merge_3d_all(self):
        # mode: 'sum', 'mul', 'concat', 'ave', 'cos', 'dot', 'max'
        inpShape1 = [None, 32, 24, 37]
        inpShape2 = [None, 32, 24, 37]
        for pmode in ['sum', 'mul', 'concat', 'ave', 'dot', 'max']:
            print ('Mode: [ %s ]' % pmode)
            inp1 = Input(shape=inpShape1[1:])
            inp2 = Input(shape=inpShape2[1:])
            # FIXME: this is a Keras 1.x API
            # k_x = merge(inputs=[k_inp1, k_inp2], mode='concat')
            # FIXME: this is a Keras 2.x API
            if pmode == 'sum':
                x = keras.layers.Add()([inp1, inp2])
            elif pmode == 'mul':
                x = keras.layers.Multiply()([inp1, inp2])
            elif pmode == 'concat':
                x = keras.layers.Concatenate()([inp1, inp2])
            elif pmode == 'ave':
                x = keras.layers.Average()([inp1, inp2])
            elif pmode == 'dot':
                x = keras.layers.Dot(axes=-1)([inp1, inp2])
            elif pmode == 'max':
                x = keras.layers.Maximum()([inp1, inp2])
            model = Model(inputs=[inp1, inp2], outputs=x)
            outShape = model.output_shape
            #
            merge_layer = LW_Merge(mode=pmode)
            lw_outShape = merge_layer.get_output_shape_for(input_shape=[inpShape1, inpShape2])
            self.assertTrue (outShape[1:] == lw_outShape[1:])


if __name__ == '__main__':
    unittest.main()
    # q1 = TestBasicLWLayers()
    # q1.test_merge_1d_other()
