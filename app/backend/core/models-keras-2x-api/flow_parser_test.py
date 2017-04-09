# #!/usr/bin/python
# # -*- coding: utf-8 -*-
# __author__ = 'ar'

import unittest
from flow_parser import DLSDesignerFlowsParser, precalculateShapes, precalculateShapes_LW

class TestBasicLWLayers(unittest.TestCase):

    def setUp(self):
        self.pathNetwork1 = '../../../../data/network/saved_for_tests/test_simple_cnn_model1.json'
        self.pathNetwork2 = '../../../../data/network/saved_for_tests/testnet_multi_input_multi_output_v1.json'
        self.dirWithTestDataset = '../../../../data/datasets_for_tests'

    def test_native_and_lw_flowparser(self):
        lstPathModel = [self.pathNetwork1, self.pathNetwork2]
        for pathModel in lstPathModel:
            # (1) build Flowparser for Native (Keras) and LW parsing
            flowParser = DLSDesignerFlowsParser(pathModel)
            flowParser_LW = DLSDesignerFlowsParser(pathModel)
            # (2) clean and validate flow
            flowParser.cleanAndValidate()
            flowParser_LW.cleanAndValidate()
            # (3) build connected flow and sort model nodes topologically
            flowParser.buildConnectedFlow()
            flowParser_LW.buildConnectedFlow()
            sortedFlow = flowParser._topoSort(flowParser.configFlowLinked)
            sortedFlow_LW = flowParser_LW._topoSort(flowParser_LW.configFlowLinked)
            # (4) pre-calculate native (Keras) and LW model node shapes
            precalculateShapes(sortedFlow)
            precalculateShapes_LW(sortedFlow_LW)
            # (5) compare native and LW-shapes
            for l1,l2 in zip(sortedFlow, sortedFlow_LW):
                self.assertTrue(l1.shapeOut[1:] == l2.shapeOut[1:])

    def test_convert_network_from_dls_to_keras(self):
        import keras
        from app.backend.core.datasets.dbwatcher import DatasetsWatcher
        dbWatcher = DatasetsWatcher(self.dirWithTestDataset)
        dbWatcher.refreshDatasetsInfo()
        lstPathModel = [self.pathNetwork1, self.pathNetwork2]
        for pathModel in lstPathModel:
            flowParser = DLSDesignerFlowsParser(pathModel)
            flowParser.cleanAndValidate()
            flowParser.buildConnectedFlow()
            modelJson, lstDBIdx = flowParser.generateModelKerasConfigJson(dbWatcher=dbWatcher)
            kerasModel = keras.models.model_from_config(modelJson)
            kerasModel.summary()
            print ('---')


####################################
if __name__=='__main__':
    unittest.main()
