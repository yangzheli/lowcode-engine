// @ts-nocheck
import { 
  isSchema, 
  isFileSchema, 
  inSameDomain, 
  getFileCssName, 
  isJSSlot, 
  getValue,
  getI18n,
  transformArrayToMap,
} from '../../src/utils/common';

describe('test isSchema', () => {
  it('should be false when empty value is passed', () => {
    expect(isSchema(null)).toBeFalsy();
    expect(isSchema(undefined)).toBeFalsy();
    expect(isSchema('')).toBeFalsy();
    expect(isSchema({})).toBeFalsy();
  });

  it('should be true when componentName is Leaf or Slot ', () => {
    expect(isSchema({ componentName: 'Leaf' })).toBeTruthy();
    expect(isSchema({ componentName: 'Slot' })).toBeTruthy();
  });

  it('should check each item of an array', () => {
    const validArraySchema = [
      { componentName: 'Button', props: {}},
      { componentName: 'Button', props: { type: 'JSExpression' }},
      { componentName: 'Leaf' },
      { componentName: 'Slot'},
    ];
    const invalidArraySchema = [
      ...validArraySchema,
      { componentName: 'ComponentWithoutProps'},
    ];
    expect(isSchema(validArraySchema)).toBeTruthy();
    expect(isSchema(invalidArraySchema)).toBeFalsy();
  });

  it('normal valid schema should contains componentName, and props of type object or JSExpression', () => {
    expect(isSchema({ componentName: 'Button', props: {}})).toBeTruthy();
    expect(isSchema({ componentName: 'Button', props: { type: 'JSExpression' }})).toBeTruthy();
    expect(isSchema({ xxxName: 'Button'})).toBeFalsy();
    expect(isSchema({ componentName: 'Button', props: null})).toBeFalsy();
    expect(isSchema({ componentName: 'Button', props: []})).toBeFalsy();
    expect(isSchema({ componentName: 'Button', props: 'props string'})).toBeFalsy();
  });
});

describe('test isFileSchema ', () => {
  it('should be false when invalid schema is passed', () => {
    expect(isFileSchema({ xxxName: 'Button'})).toBeFalsy();
    expect(isFileSchema({ componentName: 'Button', props: null})).toBeFalsy();
    expect(isFileSchema({ componentName: 'Button', props: []})).toBeFalsy();
    expect(isFileSchema({ componentName: 'Button', props: 'props string'})).toBeFalsy();
  });
  it('should be true only when schema with root named Page || Block || Component is passed', () => {
    expect(isFileSchema({ componentName: 'Page', props: {}})).toBeTruthy();
    expect(isFileSchema({ componentName: 'Block', props: {}})).toBeTruthy();
    expect(isFileSchema({ componentName: 'Component', props: {}})).toBeTruthy();
    expect(isFileSchema({ componentName: 'Button', props: {}})).toBeFalsy();
  });
});

describe('test inSameDomain ', () => {
  let windowSpy;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, "window", "get");
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });
  it('should work', () => {

    windowSpy.mockImplementation(() => ({
      parent: {
        location: {
          host: "example.com"
        },
      },
      location: {
        host: "example.com"
      }
    }));
    expect(inSameDomain()).toBeTruthy();

    windowSpy.mockImplementation(() => ({
      parent: {
        location: {
          host: "example.com"
        },
      },
      location: {
        host: "another.com"
      }
    }));
    expect(inSameDomain()).toBeFalsy();

    windowSpy.mockImplementation(() => ({
      parent: null,
      location: {
        host: "example.com"
      }
    }));

    expect(inSameDomain()).toBeFalsy();
  });
});


describe('test getFileCssName ', () => {
  it('should work', () => {
    expect(getFileCssName(null)).toBe(undefined);
    expect(getFileCssName(undefined)).toBe(undefined);
    expect(getFileCssName('')).toBe(undefined);
    expect(getFileCssName('FileName')).toBe('lce-file-name');
    expect(getFileCssName('Page1_abc')).toBe('lce-page1_abc');
  });
});


describe('test isJSSlot ', () => {
  it('should work', () => {
    expect(isJSSlot(null)).toBeFalsy();
    expect(isJSSlot(undefined)).toBeFalsy();
    expect(isJSSlot('stringValue')).toBeFalsy();
    expect(isJSSlot([1, 2, 3])).toBeFalsy();
    expect(isJSSlot({ type: 'JSSlot' })).toBeTruthy();
    expect(isJSSlot({ type: 'JSBlock' })).toBeTruthy();
    expect(isJSSlot({ type: 'anyOtherType' })).toBeFalsy();
  });
});

describe('test getValue ', () => {
  it('should check params', () => {
    expect(getValue(null, 'somePath')).toStrictEqual({});
    expect(getValue(undefined, 'somePath')).toStrictEqual({});
    // array is not valid input, return default
    expect(getValue([], 'somePath')).toStrictEqual({});
    expect(getValue([], 'somePath', 'aaa')).toStrictEqual('aaa');
    expect(getValue([1, 2, 3], 'somePath', 'aaa')).toStrictEqual('aaa');

    expect(getValue({}, 'somePath')).toStrictEqual({});
    expect(getValue({}, 'somePath', 'default')).toStrictEqual('default');
  });
  it('should work normally', () => {
    // single segment path
    expect(getValue({ a: 'aValue' }, 'a')).toStrictEqual('aValue');
    expect(getValue({ a: 'aValue', f:null }, 'f')).toBeNull();
    expect(getValue({ a: { b: 'bValue' } }, 'a.b')).toStrictEqual('bValue');
    expect(getValue({ a: { b: 'bValue', c: { d: 'dValue' } } }, 'a.c.d')).toStrictEqual('dValue');
    expect(getValue({ a: { b: 'bValue', c: { d: 'dValue' } } }, 'e')).toStrictEqual({});
  });
});

describe('test getI18n ', () => {
  it('should work', () => {
    const messages = {
      'zh-CN': {
        'key1': '啊啊啊',
        'key2': '哈哈哈',
      },
    };
    expect(getI18n('keyString', {}, 'zh-CN')).toStrictEqual('');
    expect(getI18n('keyString', {}, 'zh-CN', null)).toStrictEqual('');
    expect(getI18n('keyString', {}, 'en-US', messages)).toStrictEqual('');
    expect(getI18n('key3', {}, 'zh-CN', messages)).toStrictEqual('');
  });
});


describe('test transformArrayToMap ', () => {
  it('should work', () => {
    expect(transformArrayToMap([])).toStrictEqual({});
    expect(transformArrayToMap('not a array')).toStrictEqual({});
    expect(transformArrayToMap({'not Array': 1})).toStrictEqual({});

    let mockArray = [
      {
        name: 'jack', 
        age: 2,
      },
      {
        name: 'jack', 
        age: 20,
      }
    ];
    // test override
    expect(transformArrayToMap(mockArray, 'name', true).jack.age).toBe(20);
    expect(transformArrayToMap(mockArray, 'name').jack.age).toBe(20);
    expect(transformArrayToMap(mockArray, 'name', false).jack.age).toBe(2);

    mockArray = [
      {
        name: 'jack', 
        age: 2,
      },
      {
        name: 'rose', 
        age: 20,
      }
    ];
    // normal case
    expect(transformArrayToMap(mockArray, 'name').jack.age).toBe(2);
    expect(transformArrayToMap(mockArray, 'name').jack.name).toBe('jack');
    expect(transformArrayToMap(mockArray, 'name').rose.age).toBe(20);
    // key not exists
    expect(transformArrayToMap(mockArray, 'nameEn')).toStrictEqual({});
  });
});