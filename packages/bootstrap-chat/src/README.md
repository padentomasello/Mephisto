This directory contains several components and primitives that are used to construct a chat app.

#### `<ChatMessage />`

Props:

- `isSelf`: `boolean` Is the message spoken by the current user? Used to style messages and float them to the right.
- `agentName`: `string` The name of the agent sending the message. Messages are prefixed with the agentName as such: `<agentName>: <message>`.
- `message`: `string` Displays a chat message.
- `duration`: `number` Optional. If defined, displays how long ago the message was sent.

#### `<ChatPane />`

A container for holding `<ChatMessage />` components.

Props:

- `scrollBottomKey`: `string` An id used to preserve the scroll-state of the chat pane. When the key changes, the pane will auto-scroll to the bottom of the pane.
- `children`: `ReactNode` A list of the children that the container will hold.

Example usage:

```jsx
<ChatPane scrollBottomKey={messages.length}>
    {messages.map(msg => <ChatMessage {...} />)}
</ChatPane>
```

#### `<ConnectionIndicator />`

This component displays the current connection status to give feedback to the user. Possible default visual display states are "connected", "reconnecting to router", "reconnecting to server" and "disconnected".

Props:

- `connectionStatus`: `string/enum` A value from the `CONNECTION_STATUS` enum exported from the `mephisto-task` package.

#### `<ConnectionStatusBoundary />`

This component provides a convenient mechanism for wrapping connection sensitive code within your app, with defaults for handling error states baked in.

If the app is initializing, it will display a loading screen. If the app underwent a websockets failure or a general failure, it will display a helpful error message accordingly.

If everything works as expected, then the children of this component will be rendered.

Props:

- `connectionStatus`: `string/enum` A value from the `CONNECTION_STATUS` enum exported from the `mephisto-task` package.
- `children`: `ReactNode` The happy-path rendering behavior for the app.

#### `<DefaultTaskDescription />`

Props:

- `chatTitle`: `string` The header to show in the task description pane.

- `taskDescriptionHtml`: `string` An HTML string to inject into the taskDescription panel, to render details about the task.

- `children`: `ReactNode` Can be used in conjunction with or as an alternative to `taskDescriptionHTML` to render additional details about the task. If both `children` and `taskDescriptionHTML` are specified, `children` will be specified at the top with a divider section below it.

#### `<DoneButton />`

Displays a button to trigger task completion & submission. If `displayFeedback` is set to `true`, displays a small feedback form to gather further data.

Props:

- `onTaskComplete`: `function` A callback that's triggered when the user clicks to complete the task
- `onMessageSend`: `function` A callback to send a message back to Mephisto. In the default implementation, the review form (when `displayFeedback === true`) calls this to provide feedback data back to Mephisto. *NOTE: in the future this flag may be deprecated in favor of a more generalizable feedback form alternative*
- `displayFeedback`: `boolean` (default: `false`) If `true`, displays a small feedback form to gather further data before submission. *NOTE: in the future this flag may be deprecated in favor of a more generalizable feedback form alternative*

#### `<DoneResponse />`

A panel that contains a `<DoneButton />`

Props:

- `onTaskComplete`: `function` A callback that's triggered when the user clicks to complete the task
- `onMessageSend`: `function` A callback to send a message back to Mephisto. In the default implementation, the review form (when `displayFeedback === true`) calls this to provide feedback data back to Mephisto.
- `isTaskDone`: `boolean` If `true`, shows a `<DoneButton />`. 
- `doneText`: `string` Text to show next to the done button.

#### `<FormResponse />`

A panel that contains a submission form.

Props:

- `formOptions`: `Question[]` where the type `Question` is `{type: "choices", question: string, choices: string[] }` An array of objects that will be displayed in a form representation.
- `active`: `boolean` Toggles whether the submission button is active or not.
- `onMessageSend`: `function` A callback to send a message back to Mephisto.

#### `<Glyphicon />`

Props:

- `name`: `string` Displays a [Glyphicon](https://getbootstrap.com/docs/3.3/components/) with the specified name.

#### `<ReviewButtons />`

Props:

- `initState`
- `onMessageSend`
- `onChoice`

#### `<SystemMessage />`

Props:

- `glyphicon`
- `text`

#### `<TextResponse />`

Props:

- `onMessageSend`
- `active`

#### `<VolumeControl />`

Props:

- `volume`
- `onVolumeChange`

#### `<WorkerChatPopup />`

Props:

- `has_new_message`
- `off_chat_messages`
- `onMessageSend`