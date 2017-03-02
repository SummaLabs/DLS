def produce_ui_layout():
    input_config = {"csv_file_path": "/home/test/test-file",
                    "header": "False",
                    "separator": ",",
                    "columns": [
                        {
                            "name": "col_0",
                            "type": "NUMERIC",
                            "index": [0]
                        },
                        {
                            "name": "col_1",
                            "type": "NUMERIC",
                            "index": [1]
                        },
                        {
                            "name": "col_2",
                            "type": "VECTOR",
                            "index": [2, 3, 4]
                        },
                        {
                            "name": "col_3",
                            "type": "IMG_2D",
                            "index": [5],
                            "pre_transforms": [{"type": "imgResize", "params": {"height": 256, "width": 256}},
                                               {"type": "imgNormalization",
                                                "params": {"height": 256, "width": 256}}],
                            "post_transforms": [{"type": "imgCrop", "params": {"height": 256, "width": 256}}]
                        }
                    ]
                    }
    return input_config