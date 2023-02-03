import React from "react";
import Conversation from "./Conversation";

const Conversations = ({ history }) => {
  return (
    <div className="w-64 bg-gray-800 p-4">
      <h2 className="text-white mb-4">Conversation History</h2>
      <ul className="list-none">
        {history.map((item, index) => (
          <Conversation key={index} {...item} />
        ))}
      </ul>
    </div>
  );
};

export default Conversations;