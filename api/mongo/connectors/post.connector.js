import mongoose from 'mongoose';
import _ from 'lodash';

const getTags = tags => tags.join(',');
const setTags = tags => tags.split(',');

const PostSchema = new mongoose.Schema({
    title: {type: String, require: true},
    body: {type: String},
    views: {type: Number},
    tags: {type: [], get: getTags, set: setTags},
    author: {type: String},
    createdAt: {type: Date, default: Date.now},
    comments: [{
        body: {type: String, default: ''},
        author: {type: String},
        createdAt: {type: Date, default: Date.now}
    }],
});

PostSchema.path('title').validate(function (title, fn) {
    const Post = mongoose.model('Post');
    // Check only when it is a new post or when title field is modified
    if (this.isModified('title')) {
        Post.find({title: title})
            .exec(function (err, title) {
                fn(!err && title.length === 0);
            });
    } else fn(true);
}, 'Title already exists');

PostSchema.method({

    toJSON() {
        const post = this;
        const postObject = post.toObject();

        return _.pick(postObject, ['id', 'title', 'body', 'view', 'author']);
    },

    addComment(userId, comment) {
        const post = this;
        post.comments.push({
            body: comment,
            author: userId,
        });

        return post.save();
    },

    removeComment(commentId) {
        const post = this;
        const index = post.comments
            .map(comment => comment.id)
            .indexOf(commentId);

        if (~index) post.comments.splice(index, 1);
        else return Promise.reject('Comment not found');
        return post.save();
    },

    getAuthor(){
        //const post = this;
        //return User.getById(post.author);
        return 'Sandro Sanchez';
    },

});

PostSchema.statics = {

    load(userId, limit = 50, skip = 0) {
        return this.find({'author': userId})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .then((posts) => {
                if (posts) {
                    return posts;
                }
                return Promise.reject('Posts not found');
            });
    },

    getById(id) {
        return this.findById(id)
            .then((post) => {
                if (post) {
                    return post;
                }
                return Promise.reject('Post not found');
            });
    },

    findByTitle(title) {
        const Post = this;
        return Post.findOne({'title': title})
            .then((post) => {
                if (post) {
                    return post;
                }
                return Promise.reject('Post not found');
            });
    },

};

export const Post = mongoose.model('Post', PostSchema);
