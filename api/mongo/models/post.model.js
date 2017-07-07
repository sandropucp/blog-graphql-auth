import {Post as PostDB} from '../connectors';

const create = (userId, tags, title, body) => {
  const post = new PostDB({
    tags: tags,
    title: title,
    body: body,
    author: userId,
  });

  post.save();
  return post;
};

const getById = (id) => {
  return PostDB.getById(id);
};

const load = (userId, limit, skip) => {
    return PostDB.load(userId, limit, skip);
};

export const Post = {
    create,
    getById,
    load
};
