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
        type: CourseType,
        args: {
          name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          description: { type: gql.GraphQLString },
          level: { type: gql.GraphQLString }
        },
        resolve(_, { name, description, level }) {
          const id = COURSES.length + 1;
          const input = { id, name, description, level };
          COURSES.push(input);
          return input;
        }
      },
      updateCourse: {
        type: CourseType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) },
          name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          description: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          level: { type: new gql.GraphQLNonNull(gql.GraphQLString) }
        },
        resolve(_, { id, name, description, level }) {
          const input = { id, name, description, level };
          COURSES = COURSES.map(course => {
            if (course.id == id) {
              course = input;
            }
            return course;
          });
          return COURSES.find(course => course.id === id);
        }
      },
      deleteCourse: {
        type: CourseType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          const course = COURSES.find(course => course.id === id);
          if (!course) {
            return;
          }
          const index = COURSES.indexOf(course);
          COURSES.splice(index, 1);
          return course;
        }
      },
      createStudent: {
        type: StudentType,
        args: {
          firstName: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          lastName: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          active: { type: new gql.GraphQLNonNull(gql.GraphQLBoolean) },
          coursesIds: {
            type: new gql.GraphQLNonNull(new gql.GraphQLList(gql.GraphQLID))
          }
        },
        resolve(_, { firstName, lastName, active, coursesIds }) {
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
        type: StudentType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) },
          firstName: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          lastName: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          active: { type: new gql.GraphQLNonNull(gql.GraphQLBoolean) },
          coursesIds: { type: new gql.GraphQLList(gql.GraphQLID) }
        },
        resolve(_, { id, firstName, lastName, active, coursesIds }) {
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
        type: StudentType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          const student = STUDENTS.find(student => student.id === id);
          if (!student) {
            return;
          }
          const index = STUDENTS.indexOf(student);
          STUDENTS.splice(index, 1);
          return student;
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
