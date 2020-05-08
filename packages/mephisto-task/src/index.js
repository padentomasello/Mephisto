import React from "react";
import {
  getTaskConfig,
  registerWorker,
  requestAgent,
  isMobile,
  getInitTaskData,
  postCompleteTask,
  postCompleteOnboarding,
} from "./utils";
export * from "./utils";
export * from "./live";

/*
  The following global methods are to be specified in wrap_crowd_source.js
  They are sideloaded and exposed as global import during the build process:
*/
/* global
  getWorkerName, getAssignmentId, getWorkerRegistrationInfo,
  getAgentRegistration, handleSubmitToProvider
*/

const useMephistoTask = function () {
  const providerWorkerId = getWorkerName();
  const assignmentId = getAssignmentId();
  const isPreview = providerWorkerId === null || assignmentId === null;

  const reducerFn = (state, action) => ({
    ...state,
    ...action,
  });
  const initialState = {
    providerWorkerId: providerWorkerId,
    mephistoWorkerId: null,
    agentId: null,
    assignmentId: assignmentId,
    taskConfig: null,
    isPreview: isPreview,
    previewHtml: null,
    blockedReason: null,
    initialTaskData: null,
    isOnboarding: null,
    loaded: false,
  };

  const [state, setState] = React.useReducer(reducerFn, initialState);

  const handleSubmit = React.useCallback(
    (data) => {
      if (state.isOnboarding) {
        postCompleteOnboarding(state.agentId, data).then((packet) => {
          setState({ taskData: null });
          afterAgentRegistration(state.workerId, packet);
        })
      } else {
        postCompleteTask(state.agentId, data)
      }
    },
    [state.agentId]
  );

  function handleIncomingTaskConfig(taskConfig) {
    if (taskConfig.block_mobile && isMobile()) {
      setState({ blockedReason: "no_mobile" });
    } else if (!state.isPreview) {
      registerWorker().then((data) => afterWorkerRegistration(data));
    }
    setState({ taskConfig: taskConfig, loaded: isPreview });
  }
  function afterAgentRegistration(workerId, dataPacket) {
    const agentId = dataPacket.data.agent_id;
    const isOnboarding = agentId.startsWith("onboarding");
    setState({ agentId: agentId, isOnboarding: isOnboarding });
    if (agentId === null) {
      setState({ blockedReason: "null_agent_id" });
    } else if (isOnboarding) {
      setState({ taskData: dataPacket.data.onboard_data })
    } else {
      getInitTaskData(workerId, agentId).then((packet) => {
        setState({ initialTaskData: packet.data.init_data, loaded: true });
      });
    }
  }
  function afterWorkerRegistration(dataPacket) {
    const workerId = dataPacket.data.worker_id;
    setState({ mephistoWorkerId: workerId });
    if (workerId !== null) {
      requestAgent(workerId).then((data) =>
        afterAgentRegistration(workerId, data)
      );
    } else {
      setState({ blockedReason: "null_worker_id" });
      console.log("worker_id returned was null");
    }
  }

  React.useEffect(() => {
    getTaskConfig().then((data) => handleIncomingTaskConfig(data));
  }, []);

  return {
    ...state,
    isLoading: !state.loaded,
    handleSubmit,
  };
};

export { useMephistoTask };