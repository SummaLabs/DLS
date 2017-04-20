import shutil, tempfile
from os import path
import unittest
from skimage import data
from img2d import *


test_csv_file = 'test.csv'
test_img_file = 'test-img.png'
categories = ['cat_1', 'cat_2', 'cat_3', 'cat_4']


def create_test_data(test_dir, records_number, header=False, delimiter=",", is_related_path=False):
    test_csv_file_path = path.join(test_dir, test_csv_file)
    # Save test image
    image = data.camera()
    img = Image.fromarray(image)
    test_img_file_path = path.join(test_dir, test_img_file)
    img.save(test_img_file_path)
    f = open(test_csv_file_path, 'w')
    for i in range(records_number):
        if header and i == 0:
            f.write('col_0_h{0} col_1_h{0} col_2_h{0} col_3_h{0} col_4_h{0} col_5_h\n'.format(delimiter))
        else:
            f.write('{0}{1} {2}{1} {2}{1} {2}{1} {2}{1} {3}\n'
                    .format(categories[random.randrange(4)], delimiter, i, test_img_file if is_related_path else test_img_file_path))
    f.close()
    return test_csv_file_path, test_img_file_path


class TestSchema(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 15)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_default_columns(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        for index, column in enumerate(schema.columns):
            self.assertEqual(column.name, 'col_' + str(index))

    def test_header_columns(self):
        test_csv_header_file_path, _ = create_test_data(self.test_dir, 15, header=True)
        schema = Schema.from_csv(csv_path=self.test_csv_file_path, header=True)
        for index, column in enumerate(schema.columns):
            self.assertEqual(column.name, 'col_' + str(index) + '_h')

    def test_delimiter(self):
        test_csv_header_file_path, _ = create_test_data(self.test_dir, 15, header=True, delimiter='|')
        schema = Schema.from_csv(csv_path=self.test_csv_file_path, delimiter='|')
        for index, column in enumerate(schema.columns):
            self.assertEqual(column.name, 'col_' + str(index))

    def test_set_column_name(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        schema["col_0"] = "test_col"
        self.assertEqual(schema.columns[0].name, 'test_col')

    def test_set_columns_names(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        with self.assertRaises(Exception) as context:
            schema.columns = ("test_col1", "test_col2", "test_col3")
        self.assertTrue("Passed columns number: 3 is not compatible with Schema current columns number: 6"
                        in context.exception)

    def test_drop_column(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        schema.drop_column("col_0")
        self.assertEqual(schema.columns[0].name, 'col_1')

    def test_merge_columns(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        schema.merge_columns("test_col", ["col_0", "col_1"])
        self.assertEqual(len(schema.columns), 5)
        self.assertEqual(schema.columns[0].name, 'col_2')
        merged_column = schema.columns[len(schema.columns) - 1]
        self.assertEqual(merged_column.name, 'test_col')
        self.assertTrue(merged_column.columns_indexes, [0, 2])

    def test_merge_columns_in_range(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
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
            Schema.from_csv(csv_path=test_file_path, header=True)
        self.assertTrue("Should be no duplicates in CSV header: head1" in context.exception)

    def test_duplicate_columns(self):
        with self.assertRaises(Exception) as context:
            schema = Schema.from_csv(csv_path=self.test_csv_file_path)
            schema['col_0'] = 'col_1'
        self.assertTrue('Should be no duplicates in columns: col_1' in context.exception)

        with self.assertRaises(Exception) as context:
            schema = Schema.from_csv(csv_path=self.test_csv_file_path)
            schema.columns = ['col1', 'col1', 'col3', 'col4', 'col5', 'col6']
        self.assertTrue('Should be no duplicates in columns: col1' in context.exception)

    def test_read_rows(self):
        row = Schema.read_n_rows(csv_file_path=self.test_csv_file_path, delimiter=",", rows_number=10)
        self.assertEqual(len(row), 10)


class TestInput(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 15)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_add_float_type_column(self):
        input = Input(Schema.from_csv(csv_path=self.test_csv_file_path))
        input.add_numeric_column("col_3")
        is_column_exist = False
        for column in input.columns:
            if column.name == 'col_3':
                is_column_exist = True
                self.assertEqual(column.columns_indexes[0], 3)
                self.assertEqual(column.type, "NUMERIC")
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_add_categorical_type_column(self):
        input = Input(Schema.from_csv(csv_path=self.test_csv_file_path))
        input.add_categorical_column("col_3")
        is_column_exist = False
        for column in input.columns:
            if column.name == 'col_3':
                is_column_exist = True
                self.assertEqual(column.columns_indexes[0], 3)
                self.assertEqual(column.type, "CATEGORICAL")
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_add_vector_type_column(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        schema.merge_columns_in_range("merged_col", (3, 5))
        input = Input(schema)
        input.add_vector_column("merged_col")
        is_column_exist = False
        for column in input.columns:
            if column.name == 'merged_col':
                is_column_exist = True
                self.assertTrue(column.columns_indexes == [3, 4, 5])
                self.assertEqual(column.type, "VECTOR")
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_img2d_type_column(self):
        schema = Schema.from_csv(csv_path=self.test_csv_file_path)
        input = Input(schema)
        img2d = Img2DColumn(pre_transforms=[ImgCropTransform({"height": 256, "width": 256})],
                            post_transforms=[ImgNormalizationTransform({"height": 256, "width": 256})])
        input.add_column("col_0", img2d)
        is_column_exist = False
        for column in input.columns:
            if column.name == "col_0":
                is_column_exist = True
                self.assertTrue(isinstance(column, Img2DColumn))
                self.assertTrue(isinstance(column.pre_transforms[0], ImgCropTransform))
                self.assertTrue(isinstance(column.post_transforms[0], ImgNormalizationTransform))
        self.assertTrue(is_column_exist, 'Expected column was not found')

    def test_build_input_from_config(self):
        input_config = {"csv_file_path": self.test_csv_file_path,
                        "header": False,
                        "delimiter": ",",
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
                                'metadata': {"mean-img-path": self.test_img_file_path},
                                "pre_transforms": [{"type": "imgResize", "params": {"height": 256, "width": 256}},
                                                   {"type": "imgNormalization",
                                                    "params": {"is_global": "False"}}],
                                "post_transforms": [{"type": "imgCrop", "params": {"height": 256, "width": 256}}]
                            }
                        ]
                        }
        input = Input.from_schema(input_config)
        self.assertEqual(len(input.columns), 4)
        for column in input.columns:
            if column.name == "col_0":
                self.assertEqual(column.columns_indexes, [0])
                self.assertTrue(isinstance(column, NumericColumn))
                self.assertEqual(column.type, Column.Type.NUMERIC)

            if column.name == "col_1":
                self.assertEqual(column.columns_indexes, [1])
                self.assertTrue(isinstance(column, NumericColumn))
                self.assertEqual(column.type, Column.Type.NUMERIC)

            if column.name == "col_2":
                self.assertEqual(column.columns_indexes, [2, 3, 4])
                self.assertTrue(isinstance(column, VectorColumn))
                self.assertEqual(column.type, Column.Type.VECTOR)

            if column.name == "col_3":
                self.assertEqual(column.columns_indexes, [5])
                self.assertTrue(isinstance(column, Img2DColumn))
                self.assertTrue(isinstance(column.pre_transforms[0], ImgResizeTransform))
                self.assertTrue(isinstance(column.post_transforms[0], ImgCropTransform))


class TestBasicColumns(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.test_csv_file_path, self.test_img_file_path = create_test_data(self.test_dir, 15)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_categorical_column_metadata(self):
        categorical = CategoricalColumn()
        for i in range(0, 4):
            categorical.metadata.aggregate(category=categories[i])
        categories_count = categorical.metadata.categories_count
        for category in categories_count:
            self.assertEqual(categories_count[category], 1)


if __name__ == '__main__':
    unittest.main()
