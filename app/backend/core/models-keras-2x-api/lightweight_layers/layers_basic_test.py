import unittest

from layers_basic import LW_Merge


from keras.models import Model
from keras.layers import merge, Input

class TestBasicLWLayers(unittest.TestCase):

    def setUp(self):
        pass

    def test_merge_1d(self):
        inp1 = Input(shape=(8))
        inp2 = Input(shape=(3))
        model = Model(inputs=[inp1, inp2])


        merge_layer = LW_Merge(mode='concat')
        assert merge_layer.input_shape == 4


if __name__ == '__main__':
    unittest.main()
