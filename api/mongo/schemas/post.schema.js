
export const postSchema = `
type Post {
  id: Int!
  tags: [String]
  title: String
  body: String
  views: Int  
  author: User
  createdAt: String   
  comments:[Comment]
}
`;
