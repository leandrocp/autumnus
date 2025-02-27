import { gql } from "apollo-server";

const hello = "hey there!";

const typeDefs = gql`
  type Entity {
    id: String
  }
`;
