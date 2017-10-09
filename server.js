const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

const COURSES = require('./data/courses');
const STUDENTS = require('./data/students');

// TODO: Create a GraphQLObjectType which holds fields
// that describes the data in the data/courses.js file
const CourseType = // ...

// TODO: Create a GraphQLObjectType which holds fields
// that describes the data in the data/students.js file

// NOTE: think carefully about how to model the `courses` field
const StudentType = // ...

// TODO: Create a GraphQLSchema which holds
// a root query type. The root query type should
// have fields used to get a list of all the courses
// and all the students. Use the `resolve` function
// to return the data when it is queried
const schema = // ...

app.use(
  '/graphql',
  cors(),
  graphqlHTTP({
    schema,
    graphiql: true
  })
);

app.listen(port);
console.log(`Server listening on localhost:${port}`);
