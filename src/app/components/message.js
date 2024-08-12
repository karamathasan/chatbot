import Typewriter from "typewriter-effect";

const Message = (props) => {
    const assistantMsgStyling = () => { return "bg-gradient-to-r from-blue-500 to-blue-600 text-[#ededed]" }
    const clientMsgStyling = () => { return "bg-[#fff] border-[2px]" }

    return (
        <div key={props.index} className={"flex " + (props.message.role === "assistant" ? 'justify-start' : 'justify-end')}>
            <div className={((props.message.role === "assistant") ? assistantMsgStyling() : clientMsgStyling()) + " rounded-[16px] p-[1rem]"}>
                {props.message.role === "assistant" &&
                    <Typewriter
                        onInit={(typewriter) => {
                            typewriter.changeDelay(10).pauseFor(400).start().typeString(props.message.content)
                        }}
                    />
                }
                {props.message.role !== "assistant" && 
                    <p>{props.message.content}</p>
                }
            </div>
        </div>
    )
}

export default Message;