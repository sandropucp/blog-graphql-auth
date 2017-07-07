export const postResolvers = {
    Post: {
        author(post){
            return post.getAuthor();
        },
        tags(post){
            return post.tags.split(',');
        },
    }
};
