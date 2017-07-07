import Joi from 'joi';

export default {
    createUser: {
        body: {
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            username: Joi.string().required(),
            mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/),
            birthYear: Joi.number(),
            password: Joi.string().min(3).max(15).required()
        }
    },

    updateUser: {
        body: {
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/),
            birthYear: Joi.number()
        }
    },

    login: {
        body: {
            username: Joi.string().required(),
            password: Joi.string().required()
        }
    },

    createPost: {
        body: {
            title: Joi.string().min(3).max(30).required(),
            body: Joi.string().min(3).max(2000).required(),
            author: Joi.string().hex().required()
        }
    },

};
