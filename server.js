const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

let COURSES = require('./data/courses');
let STUDENTS = require('./data/students');

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
    courses: { type: new gql.GraphQLList(CourseType) }
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
      }
    }
  }),
  mutation: new gql.GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createCourse: {
        // TODO: Give the createCourse field a type
        // (hint: we already have this type)
        type: ...,
        // TODO: Provide args for the createCourse field
        args: { ... },
        resolve(_, { name, description, level }) {
          // Push the input onto the COURSES array
          // and return the input
        }
      },
      updateCourse: {
        // TODO: Give the updateCourse field a type
        // (hint: we already have this type)
        type: ...,
        // TODO: Provide args for the updateCourse field
        args: { ... },
        resolve(_, { id, name, description, level }) {
          const input = { id, name, description, level };
          COURSES = COURSES.map(course => {
            // If the course ID matches the mapped
            // course, set it to the input
          });
          // TODO: Return the modified course
        }
      },
      deleteCourse: {
        // TODO: Give the deleteCourse field a type
        // (hint: we already have this type)
        type: ...,
        // TODO: Provide args for the deleteCourse field
        args: { ... },
        resolve(_, { id }) {
          // TODO: find the course in the COURSES array by the id arg
          // and splice it out of the array.
          // If no course is found, return early
        }
      },
      createStudent: {
        // TODO: Give the createStudent field a type
        // (hint: we already have this type)
        type: ...,
        // TODO: Provide args for the createStudent field
        args: { ... }
        },
        resolve(_, { firstName, lastName, active, coursesIds }) {
          // Freebie!
          const id = STUDENTS.length + 1;
          const courses = [];
          coursesIds.forEach(id => {
            courses.push(
              COURSES.find(course => {
                return course.id === id;
              })
            );
          });
          const input = {
            id,
            firstName,
            lastName,
            active,
            courses
          };
          STUDENTS.push(input);
          return input;
        }
      },
      updateStudent: {
        // TODO: Give the updateStudent field a type
        // (hint: we already have this type)
        type: ...,
        // TODO: Provide args for the updateStudent field
        args: { ... },
        resolve(_, { id, firstName, lastName, active, coursesIds }) {
          // Freebie!
          let input = { id, firstName, lastName, active };
          input.courses = [];
          coursesIds.forEach(courseId => {
            input.courses.push(COURSES.find(course => course.id === courseId));
          });
          STUDENTS = STUDENTS.map(student => {
            if (student.id === id) {
              student = input;
            }
            return student;
          });
          return STUDENTS.find(student => student.id === id);
        }
      },
      deleteStudent: {
        // TODO: Give the deleteStudent field a type
        // (hint: we already have this type)
        type: ...,
        // TODO: Provide args for the deleteStudent field
        args: { ... },
        resolve(_, { id }) {
          // TODO: find the student in the STUDENTS array by the id arg
          // and splice it out of the array.
          // If no student is found, return early
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
console.log(`Server listening at localhost:${port}`);
