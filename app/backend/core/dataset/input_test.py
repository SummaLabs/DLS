import shutil, tempfile
from os import path
import unittest
from img2d import *


def create_csv_file(file_name):
    test_dir = tempfile.mkdtemp()
    test_file_path = path.join(test_dir, file_name)
    f = open(test_file_path, 'w')
    for i in range(15):
        f.write('col1%d, col2%d, col3%d, col4%d, col5%d, col6%d\n' % (i, i, i, i, i, i))
    f.close()
    return test_dir, test_file_path


class TestSchema(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path = create_csv_file('test.csv')

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_default_columns(self):
        schema = Schema(self.test_file_path)
        for index, column in enumerate(schema.columns):
            self.assertEqual(column.name, 'col_' + str(index))

    def test_set_column_name(self):
        schema = Schema(self.test_file_path)
        schema["col_0"] = "test_col"
        self.assertEqual(schema.columns[0].name, 'test_col')

    def test_set_columns_names(self):
        schema = Schema(self.test_file_path)
        with self.assertRaises(Exception) as context:
            schema.columns = ("test_col1", "test_col2", "test_col3")
        self.assertTrue("Passed columns number: 3 is not compatible with Schema current columns number: 6"
                        in context.exception)

    def test_drop_column(self):
        schema = Schema(self.test_file_path)
        schema.drop_column("col_0")
        self.assertEqual(schema.columns[0].name, 'col_1')

    def test_merge_columns(self):
        schema = Schema(self.test_file_path)
        schema.merge_columns("test_col", ["col_0", "col_1"])
        self.assertEqual(len(schema.columns), 5)
        self.assertEqual(schema.columns[0].name, 'col_2')
        merged_column = schema.columns[len(schema.columns) - 1]
        self.assertEqual(merged_column.name, 'test_col')
        self.assertTrue(merged_column.columns_indexes, [0, 2])

    def test_merge_columns_in_range(self):
        schema = Schema(self.test_file_path)
        schema.merge_columns_in_range("test_col", (3, 5))
        self.assertEqual(len(schema.columns), 4)
        self.assertEqual(schema.columns[0].name, 'col_0')
        merged_column = schema.columns[len(schema.columns) - 1]
        self.assertEqual(merged_column.name, 'test_col')
        self.assertTrue(merged_column.columns_indexes == [3, 4, 5])

    def test_duplicate_in_header(self):
        test_file_path = path.join(self.test_dir, 'test_duplicate_header.csv')
        f = open(test_file_path, 'w')
        f.write('head1, head1, head3, head4, head5, head6\n')
        for i in range(5):
            f.write('col1%d, col2%d, col3%d, col4%d, col5%d, col6%d\n' % (i, i, i, i, i, i))
        f.close()

        with self.assertRaises(Exception) as context:
            Schema(test_file_path, header=True)
        self.assertTrue("Should be no duplicates in CSV header: head1" in context.exception)

    def test_duplicate_columns(self):
        with self.assertRaises(Exception) as context:
            schema = Schema(self.test_file_path)
            schema['col_0'] = 'col_1'
        self.assertTrue('Should be no duplicates in columns: col_1' in context.exception)

        with self.assertRaises(Exception) as context:
            schema = Schema(self.test_file_path)
            schema.columns = ['col1', 'col1', 'col3', 'col4', 'col5', 'col6']
        self.assertTrue('Should be no duplicates in columns: col1' in context.exception)


class TestInput(unittest.TestCase):
    def setUp(self):
        self.test_dir, self.test_file_path = create_csv_file('test.csv')

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_add_basic_type_column(self):
        input = Input(Schema(self.test_file_path))
        input.add_int_column("col_3")
        is_column_exist = False
        for column in input.schema.columns:
            if column.name == 'col_3':
                is_column_exist = True
                self.assertEqual(column.columns_indexes[0], 3)
                self.assertEqual(column.data_type, "INT")
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_add_categorical_type_column(self):
        input = Input(Schema(self.test_file_path))
        input.add_categorical_column("col_3")
        is_column_exist = False
        for column in input.schema.columns:
            if column.name == 'col_3':
                is_column_exist = True
                self.assertEqual(column.columns_indexes[0], 3)
                self.assertEqual(column.data_type, "CATEGORICAL")
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_add_vector_type_column(self):
        schema = Schema(self.test_file_path)
        schema.merge_columns_in_range("merged_col", (3, 5))
        input = Input(schema)
        input.add_vector_column("merged_col")
        is_column_exist = False
        for column in input.schema.columns:
            if column.name == 'merged_col':
                is_column_exist = True
                self.assertTrue(column.columns_indexes == [3, 4, 5])
                self.assertEqual(column.data_type, "VECTOR")
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_img2d_type_column(self):
        schema = Schema(self.test_file_path)
        input = Input(schema)
        img2d = Img2DColumn(pre_transforms=[ImgCropTransform({"height": 256, "width": 256})],
                            post_transforms=[ImgNormalizationTransform({"height": 256, "width": 256})])
        input.add_column("col_0", img2d)
        is_column_exist = False
        for column in input.schema.columns:
            if column.name == "col_0":
                is_column_exist = True
                self.assertTrue(isinstance(column, Img2DColumn))
                self.assertTrue(isinstance(column.pre_transforms[0], ImgCropTransform))
                self.assertTrue(isinstance(column.post_transforms[0], ImgNormalizationTransform))
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_build_input_from_config(self):
        input_config = {"csv_file_path": self.test_file_path,
                        "header": "False",
                        "separator": ",",
                        "columns": [
                            {
                                "name": "col_0",
                                "type": "FLOAT",
                                "index": [0]
                            },
                            {
                                "name": "col_1",
                                "type": "FLOAT",
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
        input = Input.Builder(input_config).build()
        self.assertEqual(len(input.schema.columns), 4)
        for column in input.schema.columns:
            if column.name == "col_0":
                self.assertEqual(column.columns_indexes, [0])
                self.assertTrue(isinstance(column, BasicColumn))
                self.assertEqual(column.data_type, BasicColumn.Type.FLOAT)

            if column.name == "col_1":
                self.assertEqual(column.columns_indexes, [1])
                self.assertTrue(isinstance(column, BasicColumn))
                self.assertEqual(column.data_type, BasicColumn.Type.FLOAT)

            if column.name == "col_2":
                self.assertEqual(column.columns_indexes, [2, 3, 4])
                self.assertTrue(isinstance(column, BasicColumn))
                self.assertEqual(column.data_type, BasicColumn.Type.VECTOR)

            if column.name == "col_3":
                self.assertEqual(column.columns_indexes, [5])
                self.assertTrue(isinstance(column, Img2DColumn))
                self.assertTrue(isinstance(column.pre_transforms[0], ImgResizeTransform))
                self.assertTrue(isinstance(column.post_transforms[0], ImgCropTransform))


if __name__ == '__main__':
    unittest.main()
