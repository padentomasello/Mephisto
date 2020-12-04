/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import ReactDOM from "react-dom";
import "bootstrap-chat/styles.css";
import { FormGroup, FormControl, Button, Radio, Col, Row } from "react-bootstrap";

import { ChatApp, INPUT_MODE, FormResponse, DoneResponse} from "bootstrap-chat";
/*
This example modifies the default parlai_chat example to demonstrate
how one can override the default visual implementations for the
chat message bubble and the response input bar, while coordinating
behavior between them with global state.

In this example we add a radio button group to each received chat message.
Additionally, we require the user to make a selection for the most
recently received chat message, before they can submit their own message
by modifying the input bar code.

This example is for illustrative purposes only and has not been tested
with production usage.
*/

function PersonaLines({taskData}) {
  if (taskData !== undefined && taskData.personas !==undefined) {
    let should_flip = (taskData.agent_name === 'Speaker 1' ? 1 : 0)
    return (
     <div>
       
       <h4>Notes on what <b>have been said in previous chats</b>:</h4>
        <Row>
          <Col sm={5} style={{ padding: "2px", margin: "5px" }}>
          <div
            className={"alert " + "alert-warning" }
            role="alert"
            style={{ float: "left", display: "table", width: "100%", margin: "10px", padding: 10 }}
          >
            <b>Speaker {1+should_flip}</b>: {taskData.personas[should_flip]}
          </div>
        </Col>
        <Col sm={5} style={{ padding: "2px", margin: "5px" }}>
          <div
            className={"alert " +"alert-info"}
            role="alert"
            style={{ float: "right", display: "table", width: "100%", margin: "10px", padding: 10 }}
          >
            <b>Speaker {2-should_flip}</b>: {taskData.personas[1-should_flip]}
          </div>
        </Col>
        </Row>
        {(taskData.agent_name === 'Speaker 1') ?  "The first message below has been automatically generated for you as it would naturally follow previous chats." : null}
      </div>
      )
  } else {
    return null;
  }
}

function CoordinatorChatMessage({ agentName, message = "", taskData}) {
  const floatToSide = "left";
  const alertStyle  = "alert-success";

  return (
    <div className="row" style={{ marginLeft: "0", marginRight: "0" }}>
      <div
        className={"alert message " + alertStyle}
        role="alert"
        style={{ float: floatToSide }}
      >
        <span style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
          <b>{agentName}</b>: {message}
        </span>
        <PersonaLines
        taskData={taskData}
        agentName={agentName}
        />
      </div>
    </div>
  );
}

function ChatMessage({ isSelf, idx, agentName, message = "", onRadioChange }) {
  const floatToSide = isSelf ? "right" : "left";
  const alertStyle = isSelf ? "alert-info" : "alert-warning";

  const handleChange = (e) => {
    onRadioChange(e.currentTarget.value, agentName);
  };

  return (
    <div className="row" style={{ marginLeft: "0", marginRight: "0" }}>
      <div
        className={"alert message " + alertStyle}
        role="alert"
        style={{ float: floatToSide }}
      >
        <span style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
          <b>{agentName}</b>: {message}
        </span>
        {isSelf ? null : (
          <FormGroup>
            <br />
            {<i>Quality of this message:</i>}
            <Radio
              name={"radio" + idx}
              value={"good"}
              inline
              onChange={handleChange}
            >
              Good
            </Radio>
            {"           "}
            <Radio
              name={"radio" + idx}
              value={"fair"}
              inline
              onChange={handleChange}
            >
              Fair
            </Radio>
            {"           "}
            <Radio
              name={"radio" + idx}
              value={"poor"}
              inline
              onChange={handleChange}
            >
              Poor
            </Radio>
          </FormGroup>
        )}
      </div>
    </div>
  );
}

function RenderChatMessage({
  message,
  mephistoContext,
  appContext,
  idx,
  onRadioChange,
}) {
  const { agentId } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;

  if (message.id === 'SUBMIT_WORLD_DATA') {
    return <div />;
  }
  if (message.id === 'Coordinator'){
    return (
      <div>
        <CoordinatorChatMessage
          agentName={
            message.id in currentAgentNames
              ? currentAgentNames[message.id]
              : message.id
          }
          message={message.text}
          taskData={message.task_data}
          messageId={message.message_id}
        />
      </div>
    ); 
  }

  return (
    <div>
      <ChatMessage
        idx={idx}
        isSelf={message.id === agentId || message.id in currentAgentNames}
        agentName={
          message.id in currentAgentNames
            ? currentAgentNames[message.id]
            : message.id
        }
        message={message.text}
        taskData={message.task_data}
        messageId={message.message_id}
        onRadioChange={onRadioChange}
      />
    </div>
  );
}

function TaskDescription({ mephistoContext, appContext }) {
  const {taskConfig, children } = mephistoContext;

  return (
    <div>
      <h3>{taskConfig.chat_title}</h3>
      <hr style={{ borderTop: "1px solid #555" }} />
      {children}
      {children ? <hr style={{ borderTop: "1px solid #555" }} /> : null}
      <span
        id="task-description"
        style={{ fontSize: "16px" }}
        dangerouslySetInnerHTML={{
          __html: taskConfig.task_description || "Task Description Loading",
        }}
      />
    </div>
  );
}



function RenderCustomResponsePane({ onMessageSend,  inputMode, messages, chatAnnotations, appContext, mephistoContext}) {
  const taskContext = appContext.taskContext;
  const agentState = mephistoContext.agentState
  const { agentId } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;
  let response_pane = null;
  var lastMessageToAnnotate = null;
  var lastMessageAnnotation = null;
  for (let i=messages.length-1; i>=0 ;i--) {
    if (!isMessageSystem(messages[i]) && !isMessageSelf(messages[i], agentId, currentAgentNames) ) {
      lastMessageAnnotation = chatAnnotations[i];
      lastMessageToAnnotate = messages[i];
      break;
    }
  }
  const isLastMessageAnnotated= (lastMessageToAnnotate === null || lastMessageAnnotation !== undefined);
  switch (inputMode) {
    case INPUT_MODE.DONE:
    case INPUT_MODE.INACTIVE:
      response_pane = (
        <DoneResponse
          onTaskComplete={appContext.onTaskComplete}
          onMessageSend={onMessageSend}
          doneText={agentState.done_text || null}
          isTaskDone={agentState.task_done || null}
        />
      );
      break;
    case INPUT_MODE.READY_FOR_INPUT:
    case INPUT_MODE.WAITING:
      if (taskContext && taskContext["respond_with_form"]) {
        response_pane = (
          <FormResponse
            onMessageSend={onMessageSend}
            active={inputMode === INPUT_MODE.READY_FOR_INPUT}
            formOptions={taskContext["respond_with_form"]}
          />
        );
      } else {
        response_pane = (
          <CustomTextResponse
            onMessageSend={onMessageSend}
            active={inputMode === INPUT_MODE.READY_FOR_INPUT}
            messages={messages}
            key={lastMessageAnnotation}
            isLastMessageAnnotated={isLastMessageAnnotated}
            lastMessageAnnotation={lastMessageAnnotation}
          />
        );
      }
      break;
    case INPUT_MODE.IDLE:
    default:
      response_pane = null;
      break;
  }
  return response_pane;
}

function isMessageSystem(message) {
  return (message === undefined || message.id === 'Coordinator' || message.id === 'SUBMIT_WORLD_DATA')
}

function isMessageSelf(message, agentId, currentAgentNames) {
  return (message.id === agentId || message.id in currentAgentNames);
}

function MainApp() {
  // const { currentAgentNames } = appContext.taskContext!==undefined ? appContext.taskContext : [];

  const [messages, setMessages] = React.useState([]);
  const [chatAnnotations, setChatAnnotation] = React.useReducer(
    (state, action) => {
      return { ...state, ...{ [action.index]: {value: action.value, name: action.speaker} } };
    },
    {}
  );

  // const lastMessageAnnotation = chatAnnotations[messages.length - 1];
  // const lastMessage = messages[messages.length - 1]
  // const isLastMessageSystem = messages.length === 0 || isMessageAnnotate(lastMessage)
  console.log('chatAnnotations');
  console.log(chatAnnotations);
  return (
    <ChatApp
      onMessagesChange={(messages) => {setMessages(messages);}}
      /*
        You can also use renderTextResponse below, which allows you
        to modify the input bar while keeping additional default
        functionality such as the ability to trigger custom forms
        and a done state.
        Or you can use renderResponse for more flexibility and implement
        those states yourself, as shown below with the done state:
      */
      renderResponse={({ onMessageSend, inputMode, mephistoContext, appContext }) => (
          <RenderCustomResponsePane
            onMessageSend={onMessageSend}
            inputMode={inputMode}
            mephistoContext={mephistoContext}
            appContext={appContext}
            messages={messages}
            chatAnnotations={chatAnnotations}
          />
      )}
      renderMessage={({ message, idx, mephistoContext, appContext }) => (
        <RenderChatMessage
          message={message}
          mephistoContext={mephistoContext}
          appContext={appContext}
          idx={idx}
          key={message.message_id + "-" + idx}
          onRadioChange={(val, name) => {
            setChatAnnotation({ index: idx, value: val, speaker: name });
          }}
        />
      )}
      renderSidePane={({ mephistoContext, appContext }) => (
        <TaskDescription
          mephistoContext={mephistoContext}
          appContext={appContext}
        />
      )}
    />
  )
}

function CustomTextResponse({
  onMessageSend,
  active,
  isLastMessageAnnotated,
  lastMessageAnnotation,
}) {
  // const [textValue, setTextValue] = React.useState(
  //   !lastMessageAnnotation ? "" : lastMessageAnnotation + " - "
  // );
  const [textValue, setTextValue] = React.useState(
    !lastMessageAnnotation ? "" : ""
  );
  const [sending, setSending] = React.useState(false);

  const annotationNeeded = active && !isLastMessageAnnotated;
  active = active && isLastMessageAnnotated;

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (active && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, [active]);

  const tryMessageSend = React.useCallback(() => {
    if (textValue !== "" && active && !sending) {
      setSending(true);
      onMessageSend({ text: textValue, task_data: {last_annotation: lastMessageAnnotation} }).then(() => {
        setTextValue("");
        setSending(false);
      });
    }
  }, [textValue, active, sending, onMessageSend, lastMessageAnnotation]);

  const handleKeyPress = React.useCallback(
    (e) => {
      if (e.key === "Enter") {
        tryMessageSend();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
    },
    [tryMessageSend]
  );
  return (
    <div className="response-type-module">
      <div className="response-bar">
        <FormControl
          type="text"
          className="response-text-input"
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          value={textValue}
          placeholder={
            annotationNeeded
              ? "Please annotate the last message before you can continue"
              : "Enter your message here..."
          }
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => setTextValue(e.target.value)}
          disabled={!active || sending}
        />
        <Button
          className="btn btn-primary submit-response"
          id="id_send_msg_button"
          disabled={textValue === "" || !active || sending}
          onClick={() => tryMessageSend()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

ReactDOM.render(<MainApp />, document.getElementById("app"));
