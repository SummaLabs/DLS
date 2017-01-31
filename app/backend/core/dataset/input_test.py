import shutil, tempfile
from os import path
from input import *
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
        self.assertEqual(schema.columns[len(schema.columns) - 1].name, 'test_col')

    def test_merge_columns_in_range(self):
        schema = Schema(self.test_file_path)
        schema.merge_columns_in_range("test_col", (3, 5))
        self.assertEqual(len(schema.columns), 4)
        self.assertEqual(schema.columns[0].name, 'col_0')
        self.assertEqual(schema.columns[len(schema.columns) - 1].name, 'test_col')

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

    def test_transforms_column(self):
        input = Input(Schema(self.test_file_path))
        input.transform_column('col_3', CropImageTransform(), ResizeTransform())
        column_transform_0 = input.columns_transforms()['col_3']
        self.assertEqual(column_transform_0.column.name, 'col_3')
        self.assertEqual(column_transform_0.column.columns_indexes[0], 3)

    def test_transforms_without_reader(self):
        input = Input(Schema(self.test_file_path))
        input.transform_column('col_0', CropImageTransform(), ResizeTransform())
        column_transform_0 = input.columns_transforms()['col_0']
        self.assertEqual(column_transform_0.column.name, 'col_0')
        self.assertTrue(isinstance(column_transform_0.pre_transforms, CropImageTransform))
        self.assertTrue(isinstance(column_transform_0.post_transforms, ResizeTransform))
        self.assertEqual(column_transform_0.reader, None)

    def test_transforms_with_reader(self):
        input = Input(Schema(self.test_file_path))
        input.transform_column('col_1', CropImageTransform(), ResizeTransform(), Image2DReader())
        column_transform_1 = input.columns_transforms()['col_1']
        self.assertEqual(column_transform_1.column.name, 'col_1')
        self.assertTrue(isinstance(column_transform_1.pre_transforms, CropImageTransform))
        self.assertTrue(isinstance(column_transform_1.post_transforms, ResizeTransform))
        self.assertTrue(isinstance(column_transform_1.reader, Image2DReader))

    def test_transforms_with_list_of_transformers(self):
        input = Input(Schema(self.test_file_path))
        input.transform_column('col_2', [CropImageTransform(), ResizeTransform()], [ResizeTransform(), ResizeTransform()])
        column_transform_1 = input.columns_transforms()['col_2']
        self.assertEqual(column_transform_1.column.name, 'col_2')
        self.assertTrue(isinstance(column_transform_1.pre_transforms, list))
        self.assertTrue(isinstance(column_transform_1.post_transforms, list))

    def test_transforms_incorrect_args_post_transform(self):
        with self.assertRaises(Exception) as context:
            input = Input(Schema(self.test_file_path))
            input.transform_column('col_0', Image2DReader(), ResizeTransform())
        self.assertTrue('Arg pre_transforms should be Transform class instance' in context.exception)

    def test_transforms_incorrect_args_pre_transform(self):
        with self.assertRaises(Exception) as context:
            input = Input(Schema(self.test_file_path))
            input.transform_column('col_0', CropImageTransform(), Image2DReader())
        self.assertTrue('Arg post_transforms should be Transform class instance' in context.exception)

    def test_transforms_incorrect_args_post_transform_list(self):
        with self.assertRaises(Exception) as context:
            input = Input(Schema(self.test_file_path))
            input.transform_column('col_0', [CropImageTransform()], [Image2DReader()])
        self.assertTrue('Arg post_transforms should be list of Transform class instances' in context.exception)


if __name__ == '__main__':
    unittest.main()
