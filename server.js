const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');

const port = process.env.PORT || 8080;

const app = express();

const messageAsString = 'Hello, world!';
const messageAsObject = { message: 'Hello, world!' };

const schema = new gql.GraphQLSchema({
  query: new gql.GraphQLObjectType({
    name: 'Root',
    fields: {
      // if we want to get our message
      // just as a string
      message: {
        type: gql.GraphQLString,
        resolve() {
          return messageAsString;
        }
      },
      // if we want to get our message
      // as a key on an objet. note that
      // we can work with multiple keys in
      // this case if we want
      messageAsObject: {
        type: new gql.GraphQLObjectType({
          name: 'messageObject',
          fields: {
            message: {
              type: gql.GraphQLString
            }
          }
        }),
        resolve() {
          return messageAsObject;
        }
      }
    }
  })
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`Server listening at localhost:${port}`);
