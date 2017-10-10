require('dotenv').config();
const express = require('express');
const graphqlHTTP = require('express-graphql');
const gql = require('graphql');
const mongoose = require('mongoose');
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
    courses: { type: new gql.GraphQLList(CourseType) }
  }
});

// Use the GraphQLInputObject types when moving everything over
// to a single input variable

// const CourseInputType = new gql.GraphQLInputObjectType({
//   name: 'CourseInputType',
//   fields: {
//     name: { type: gql.GraphQLString },
//     description: { type: gql.GraphQLString },
//     level: { type: gql.GraphQLString }
//   }
// });

// const StudentInputType = new gql.GraphQLInputObjectType({
//   name: 'StudentInputType',
//   fields: {
//     firstName: { type: gql.GraphQLString },
//     lastName: { type: gql.GraphQLString },
//     active: { type: gql.GraphQLBoolean },
//     coursesIds: { type: gql.GraphQLID }
//   }
// });

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

const schema = new gql.GraphQLSchema({
  query: new gql.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      allCourses: {
        type: new gql.GraphQLList(CourseType),
        resolve() {
          return Promise.resolve(Course.find({}));
        }
      },
      allStudents: {
        type: new gql.GraphQLList(StudentType),
        resolve() {
          return Promise.resolve(Student.find({}).populate('courses'));
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
          const input = { name, description, level };
          const course = new Course(input);
          return Promise.resolve(course.save());
        }
      },
      updateCourse: {
        type: CourseType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) },
          name: { type: new gql.GraphQLNonNull(gql.GraphQLString) },
          description: { type: gql.GraphQLString },
          level: { type: gql.GraphQLString }
        },
        resolve(_, { id, name, description, level }) {
          const input = { name, description, level };
          return Promise.resolve(
            Course.findOneAndUpdate({ _id: id }, input, { new: true })
          );
        }
      },
      deleteCourse: {
        type: CourseType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          return Promise.resolve(Course.findOneAndRemove({ _id: id }));
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
          let input = { firstName, lastName, active, coursesIds };
          input.courses = coursesIds;
          const student = new Student(input);
          student.save();
          return Promise.resolve(
            Student.populate(student, { path: 'courses' })
          );
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
          let input = { firstName, lastName, active };
          input.courses = coursesIds;
          return Promise.resolve(
            Student.findOneAndUpdate({ _id: id }, input, {
              new: true
            }).populate('courses')
          );
        }
      },
      deleteStudent: {
        type: StudentType,
        args: {
          id: { type: new gql.GraphQLNonNull(gql.GraphQLID) }
        },
        resolve(_, { id }) {
          return Promise.resolve(
            Student.findOneAndRemove({ _id: id }).populate('courses')
          );
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
