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

#### `<DoneResponse />`

#### `<FormResponse />`

#### `<Glyphicon />`

#### `<ReviewButtons />`

#### `<SystemMessage />`

#### `<TextResponse />`

#### `<VolumeControl />`

#### `<WorkerChatPopup />`