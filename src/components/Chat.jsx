import React, { useState, useEffect, useRef, useCallback } from 'react';
import Message from './Message';

const Chat = () => {

  // State to store the user's message
  const [userMessage, setUserMessage] = useState("");
  // State to store the chatbot's response
  const [botResponse, setBotResponse] = useState("");
  // State to store all the messages
  
  //This state stores the user message and the bot response
  const [messages, setMessages] = useState([]);
  // Ref to access the feed div
  const feedRef = useRef(null);

  // Function to generate a unique ID for each message
  const generateUniqueID = () => {
    // Using timestamp as a unique ID
    const timestamp = new Date().getTime();
    // Using random number as a unique ID
    const randomNumber = Math.floor(Math.random() * 1000000000);
    // Using hexadecimal as a unique ID
    const hexaDecimalString = randomNumber.toString(16);
    // Return the unique ID
    return `id-${timestamp}-${randomNumber}-${hexaDecimalString}`;
  }

  // Function to handle the user's message
  const handleChange = (e) => {

    setUserMessage(e.target.value);

  };  

  //To handle the bot typing animation

  const [dots, setDots] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalId = useRef();  
  
  const showLoading = useCallback(() => {
    setDots((dots) => (dots + 1) % 4);
  }, []);
  
  useEffect(() => {

    if (!botResponse) {
      setLoading(true);
      intervalId.current = setInterval(() => {
        showLoading();
      }, 600);
    } else {
      clearInterval(intervalId.current);
      setLoading(false);
    }
  
    return () => clearInterval(intervalId.current);

  }, [botResponse, dots, intervalId, loading, showLoading]);

  //Function to handle the form submission
  const handleSubmit = async (e) => {

    e.preventDefault();

    // Add the user message to the messages state

    setUserMessage(userMessage);
  

    //Show the bot typing animation
   
    if(loading){
      setBotResponse(".".repeat(dots));
    }

    setMessages([...messages, { userMessage: userMessage, botResponse:botResponse}]);
    // Clear the user message
    setUserMessage("");
  
    // Scroll to the bottom of the feed
    feedRef.current.scrollTop = feedRef.current.scrollHeight;

  };

  

  return (
    <div className='flex flex-1 h-screen w-full items-start dark:text-white dark:bg-[#12151c]'>
      <div className="w-full overflow-y-scroll scrollbar-w-2 sm:scrollbar-track-gray-800 sm:scrollbar-thumb-gray-500 items-start max-h-[80%]">
        <div id="feed" ref={feedRef} className="h-full sm:overflow-y-scroll">
          {messages.map((message, index) => (
            <Message
              key={index}
              userMessage={message.userMessage}
              botResponse={message.botResponse}
              userMessageUniqueID={generateUniqueID()}
              botMessageUniqueID={generateUniqueID()}
            />
          ))}
          
        </div>
      </div>
    
      <div className="fixed bottom-0 flex-col w-full sm:pr-80 sm:pl-6 md:pr-80 md:pl-0 sm:items-center border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent">
        <form onSubmit={handleSubmit} className="stretch mx-2 sm:mx-0 flex flex-row gap-3 pt-2 last:mb-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6">
          <div className="flex w-full">
            <div className="flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative bg-white dark:text-white dark:bg-[#242d3b] rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
              <textarea tabIndex="0" name="userInput" onChange={handleChange} value={userMessage} data-id="request-:r0:-4" rows="1" placeholder="" className="m-0 w-full resize-none bg-transparent ring-0 focus:ring-0 p-0 pl-2 pr-2 dark:bg-transparent flex-grow" />
              <button type="submit" className="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" className="h-4 w-4 rotate-90" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;