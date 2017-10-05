require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const mongoose = require('mongoose');
const cors = require('cors');

const port = process.env.PORT || 8080;

const app = express();

const COURSES = require('./data/courses');
const STUDENTS = require('./data/students');

const CourseSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  level: { type: String, required: false }
});

const StudentSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  active: { type: Boolean, required: true },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
      required: true
    }
  ]
});

const Course = mongoose.model('course', CourseSchema);
const Student = mongoose.model('student', StudentSchema);

const typeDefs = `
  type Course {
    id: ID
    name: String
    description: String
    level: String
  }

  type Student {
    id: ID
    firstName: String
    lastName: String
    active: Boolean
    courses: [Course]
  }

  type CourseInput {
    id: ID!
    name: String!
    description: String
    level: String
  }

  type StudentInput {
    id: ID!
    firstName: String!
    lastName: String!
    active: Boolean!
    courses: [Course]!
  }

  type Query {
    allCourses: [Course]
    allStudents: [Student]
  }

  type Mutation {
    createCourse(name: String!, description: String, level: String): Course
    updateCourse(id: ID! name: String!, description: String, level: String): Course
    deleteCourse(id: ID!): Course
    createStudent(firstName: String! lastName: String!, active: Boolean!, courses: [String]!): Student
    updateStudent(id: ID!, firstName: String! lastName: String!, active: Boolean!, courses: [String]!): Student
    deleteStudent(id: ID!): Student
  }
`;

const resolvers = {
  Query: {
    allCourses: () => {
      return Promise.resolve(Course.find({}));
    },
    allStudents: () => {
      return Promise.resolve(Student.find({}));
    }
  },
  Mutation: {
    createCourse: (_, { name, description, level }) => {
      const input = { name, description, level };
      const course = new Course(input);
      return Promise.resolve(course.save());
    },
    updateCourse: (_, { id, name, description, level }) => {
      const input = { name, description, level };
      return Promise.resolve(
        Course.findOneAndUpdate({ _id: id }, input, { new: true })
      );
    },
    deleteCourse: (_, { id }) => {
      return Promise.resolve(Course.findOneAndRemove({ _id: id }));
    },
    createStudent: (_, { firstName, lastName, active, courses }) => {
      const input = { firstName, lastName, active, courses };
      const student = new Student(input);
      student.save();
      return Promise.resolve(Student.populate(student, { path: 'courses' }));
    },
    updateStudent: (_, { id, firstName, lastName, active, courses }) => {
      const input = { firstName, lastName, active, courses };
      return Promise.resolve(
        Student.findOneAndUpdate({ _id: id }, input, {
          new: true
        }).populate('courses')
      );
    },
    deleteStudent: (_, { id }) => {
      return Promise.resolve(
        Student.findOneAndRemove({ _id: id }).populate('courses')
      );
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

function listen() {
  app.listen(port);
  console.log('Express app started on port ' + port);
}

async function connect() {
  let options = {
    useMongoClient: true,
    keepAlive: true,
    reconnectTries: 30,
    socketTimeoutMS: 0
  };
  try {
    await mongoose.connect(process.env.MLAB_URL, options);
  } catch (err) {
    console.log(err);
  }
  listen();
}

connect();
