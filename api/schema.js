import {merge} from 'lodash';
import {makeExecutableSchema} from 'graphql-tools';
import {withFilter} from 'graphql-subscriptions';

import {pubsub} from './subscriptions';
import {userSchema} from './mongo/schemas/user.schema';
import {commentSchema} from './mongo/schemas/comment.schema';
import {postSchema} from './mongo/schemas/post.schema';
import {dateResolvers} from './mongo/resolvers/custom.resolver';
import {userResolvers} from './mongo/resolvers/user.resolver';
import {postResolvers} from './mongo/resolvers/post.resolver';

const COMMENT_ADDED_TOPIC = 'commentAdded';

const rootSchema = [`

scalar Date

# The query root of Blog's GraphQL interface.
type Query {   
  testString: String
  getPosts(userId: String, limit: Int, skip: Int): [Post]
}

# The root query for implementing GraphQL mutations.
type Mutation {
  loginWithToken(token: String!):String
  createPost(tags: String!, title: String!, body: String!): Post
  addComment(postId: String!, comment: String!): Post
  removeComment(postId: String!, commentId: String!): Post
}

# The root query for implementing GraphQL Subscriptions
type Subscription {
  commentAdded(title: String!): String
}

# Blog Graphql provides a root type for each kind of operation.
schema {
  query: Query 
  mutation: Mutation
  subscription: Subscription
}
`];

const rootResolvers = {
    Query: {
        getPosts(root, {limit, skip}, context) {
            const user = context.user;
            console.log(user);
            return context.Post.load(user.sub, limit, skip);
        },
    },
    Mutation: {
        loginWithToken(root, {token}, context) {
            context.token = token;
        },
        createPost(root, {tags, title, body}, context) {
            const user = context.user;
            return context.Post.create(user.sub, tags, title, body);
        },
        addComment(root, {postId, comment}, context) {
            const user = context.user;
            return context.Post.getById(postId)
                .then(post => post.addComment(user.sub, comment))
                .then((post) => {
                    pubsub.publish('commentAdded', comment);
                    return post;
                });
        },
        removeComment(root, {postId, commentId}, context) {
            const user = context.user
            return context.Post.getById(postId)
                .then((post) => {
                    if (post.author === user.sub) {
                        post.removeComment(commentId);
                    }
                });
        },
    },
    Subscription: {
        commentAdded: {
            subscribe: withFilter(() => pubsub.asyncIterator(COMMENT_ADDED_TOPIC), (payload, args) => {
                return payload.commentAdded.repository_name === args.repoFullName;
            }),
        },
    },
};

const logger = {
    log: e => console.log(e),
};

const schema = [...rootSchema, userSchema, commentSchema, postSchema];

const resolvers = merge(rootResolvers, userResolvers, dateResolvers, postResolvers);

const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
    logger,
});

export default executableSchema;
