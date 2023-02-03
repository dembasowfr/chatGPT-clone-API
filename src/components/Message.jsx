import React from "react";
import bot from "../assets/bot.svg";
import user from "../assets/user.svg";

const Message = ({userMessage, botResponse, userMessageUniqueID, botMessageUniqueID}) => {
    
    
  return (
    <>
        <div className="w-full text-base items-start gap-4 md:gap-6 m-auto sm:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 sm:py-6 flex lg:px-0">
            <div className="w-[30px] flex flex-col relative items-end">
                <div className="bg-[#5436DA] rounded-sm text-white flex justify-center items-center relative tracking-widest h-8 w-8 text-xs">
                    <img src={user} alt="user"/>
                </div>
            </div>
            <div className="relative flex w-[calc(100%-50px)] md:flex-col lg:w-[calc(100%-115px)]">
                <div className="flex flex-grow flex-col gap-3">
                    <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap">
                        <p id = {userMessageUniqueID}>{userMessage}</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="w-full items-start border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group bg-gray-50 dark:bg-[#242d3b]">
            <div className="text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0">
                <div className="w-[30px] flex flex-col relative items-end">
                    <div className="relative bg-green-500 h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center" >
                        <img src = {bot} alt="bot"/>
                    </div>
                </div>
                <div className="relative flex w-[calc(100%-50px)] md:flex-col lg:w-[calc(100%-115px)]">
                    <div className="flex flex-grow flex-col gap-3">
                        <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap">
                            <div className="markdown prose w-full break-words dark:prose-invert dark">
                                <p id={botMessageUniqueID}>{botResponse}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
};

export default Message;
