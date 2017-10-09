const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

const COURSES = require('./data/courses');
const STUDENTS = require('./data/students');

const CourseType = new gql.GraphQLObjectType({
  name: 'CourseType',
  fields: {
    id: { type: gql.GraphQLID },
    name: { type: gql.GraphQLString },
    description: { type: gql.GraphQLString },
    level: { type: gql.GraphQLString }
  }
});

const StudentType = new gql.GraphQLObjectType({
  name: 'StudentType',
  fields: {
    id: { type: gql.GraphQLID },
    firstName: { type: gql.GraphQLString },
    lastName: { type: gql.GraphQLString },
    active: { type: gql.GraphQLBoolean },

    // TODO: make the courses field require an argument
    // called 'level' which filters out the courses array
    // based on that value. Use the parent (root) data in the
    // resolve function to get access to the proper data
    courses: { ... }
  }
});

const schema = new gql.GraphQLSchema({
  query: new gql.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      allCourses: {
        type: new gql.GraphQLList(CourseType),
        resolve() {
          return COURSES;
        }
      },
      allStudents: {
        type: new gql.GraphQLList(StudentType),
        resolve() {
          return STUDENTS;
        }
      },
      
      // TODO: make this new 'courseById' field search for a
      // course based on the specific ID passed as an argument.
      // Use the JavaScript find method to get the result
      courseById: { ... },

      // TODO: make this new 'studentById' field search for a
      // student based on the specific ID passed as an argument.
      // Use the JavaScript find method to get the result
      studentById: { ... },

      // TODO: make this new 'searchStudentByName' field search for
      // students by last name based on the 'name' argument passed in.
      // Use a RegExp and the JavaScript filter method to look for
      // students that match (or partially match) the name
      searchStudentsByName: { ... }
    }
  })
});

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
