import pytest

from layers_basic import LW_Merge


def test_merge_shape():

    merge_layer = LW_Merge(mode='concat')
    assert merge_layer.input_shape == 4


if __name__ == '__main__':
  pytest.main([__file__])
