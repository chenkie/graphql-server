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
    courses: {
      type: new gql.GraphQLList(CourseType),
      args: {
        level: { type: new gql.GraphQLNonNull(gql.GraphQLString) }
      },
      resolve(parent, { level }) {
        return parent.courses.filter(course => {
          return course.level === level;
        });
      }
    }
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
      courseById: {
        type: CourseType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          return COURSES.find(course => {
            return course.id === id;
          });
        }
      },
      studentById: {
        type: StudentType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          return STUDENTS.find(student => {
            return student.id === id;
          });
        }
      },
      searchStudentsByName: {
        type: new gql.GraphQLList(StudentType),
        args: {
          name: { type: new gql.GraphQLNonNull(gql.GraphQLString) }
        },
        resolve(_, { name }) {
          const pattern = new RegExp(name);
          return STUDENTS.filter(student => {
            return pattern.test(student.lastName);
          });
        }
      }
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
