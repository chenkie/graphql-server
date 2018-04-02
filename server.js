const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

let COURSES = require('./data/courses');
let STUDENTS = require('./data/students');

const typeDefs = `
  type CourseType {
    id: ID
    name: String
    description: String
    level: String
  }

  type StudentType {
    id: ID
    firstName: String
    lastName: String
    active: Boolean
    courses: [CourseType]
  }

  input CourseInput {
    id: ID!
    name: String!
    description: String
    level: String
  }

  input StudentInput {
    id: ID!
    firstName: String!
    lastName: String!
    active: Boolean!
    coursesIds: [ID]!
  }

  type Query {
    allCourses: [CourseType]
    allStudents: [StudentType]
  }

  type Mutation {
    createCourse(name: String!, description: String, level: String): CourseType
    updateCourse(id: ID! name: String!, description: String, level: String): CourseType
    deleteCourse(id: ID!): CourseType
    createStudent(firstName: String! lastName: String!, active: Boolean!, coursesIds: [ID]!): StudentType
    updateStudent(id: ID!, firstName: String! lastName: String!, active: Boolean!, coursesIds: [ID]!): StudentType
    deleteStudent(id: ID!): StudentType
  }
`;

const resolvers = {
  Query: {
    allCourses: () => {
      return COURSES;
    },
    allStudents: () => {
      return STUDENTS;
    }
  },
  Mutation: {
    createCourse: (_, { name, description, level }) => {
      const id = COURSES.length + 1;
      const input = { id, name, description, level };
      COURSES.push(input);
      return input;
    },
    updateCourse: (_, { id, name, description, level }) => {
      const input = { id, name, description, level };
      COURSES = COURSES.map(course => {
        if (course.id == id) {
          course = input;
        }
        return course;
      });
      return COURSES.find(course => course.id === id);
    },
    deleteCourse: (_, { id }) => {
      const course = COURSES.find(course => course.id === id);
      if (!course) {
        return;
      }
      const index = COURSES.indexOf(course);
      COURSES.splice(index, 1);
      return course;
    },
    createStudent: (_, { firstName, lastName, active, coursesIds }) => {
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
    },
    updateStudent: (_, { id, firstName, lastName, active, coursesIds }) => {
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
    },
    deleteStudent: (_, { id }) => {
      const student = STUDENTS.find(student => student.id === id);
      if (!student) {
        return;
      }
      const index = STUDENTS.indexOf(student);
      STUDENTS.splice(index, 1);
      return student;
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

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
