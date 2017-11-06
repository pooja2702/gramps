import { GraphQLSchema } from 'graphql';
import gramps from '../src';

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('gramps()', () => {
    it('creates a valid schema and empty context with no arguments', () => {
      const getGrampsContext = gramps();

      expect(getGrampsContext()).toEqual(
        expect.objectContaining({
          schema: expect.any(GraphQLSchema),
          context: {},
        }),
      );
    });

    it('warns for use of schema', () => {
      console.warn = jest.genMockFn();
      const dataSources = [
        {
          namespace: 'Baz',
          schema: 'type User { name: String } type Query { me: User }',
          model: req => ({ baz: 'test' }),
          stitching: {
            linkTypeDefs: 'extend type User { age: Int }',
            resolvers: mergeInfo => ({
              User: {
                age: () => 40,
              },
            }),
          },
        },
      ];
      gramps({ dataSources });
      return expect(console.warn).toBeCalled();
    });

    it('properly combines contexts', () => {
      const dataSources = [
        { namespace: 'Foo', model: { foo: 'test' } },
        { namespace: 'Bar', model: { bar: 'test' } },
        {
          namespace: 'Baz',
          typeDefs: 'type User { name: String } type Query { me: User }',
          model: req => ({ baz: 'test' }),
          stitching: {
            linkTypeDefs: 'extend type User { age: Int }',
            resolvers: mergeInfo => ({
              User: {
                age: () => 40,
              },
            }),
          },
        },
      ];

      const grampsConfig = gramps({ dataSources, enableMockData: false })();

      expect(grampsConfig.context).toEqual({
        Foo: {
          foo: 'test',
        },
        Bar: {
          bar: 'test',
        },
        Baz: {
          baz: 'test',
        },
      });
    });

    it('properly adds extra context', () => {
      const grampsConfig = gramps({
        extraContext: () => ({ extra: 'test' }),
      })();

      expect(grampsConfig.context).toEqual({
        extra: 'test',
      });
    });
  });
});
