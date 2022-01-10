/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import ReactDOM from "react-dom";
import { BaseFrontend, LoadingScreen } from "./components/core_components.jsx";
import { useMephistoTask, ErrorBoundary } from "mephisto-task";
const axios = require("axios");
import 'bootstrap/dist/css/bootstrap.min.css';

/* ================= Application Components ================= */

function MainApp() {
  const {
    blockedReason,
    blockedExplanation,
    isPreview,
    isLoading,
    initialTaskData,
    handleSubmit,
    handleFatalError,
    isOnboarding,
    agentId,
    providerWorkerId,
  } = useMephistoTask();

  if (blockedReason !== null) {
    return (
      <section className="hero is-medium is-danger">
        <div class="hero-body">
          <h2 className="title is-3">{blockedExplanation}</h2>{" "}
        </div>
      </section>
    );
  }
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (isPreview) {
    return (
      <section className="hero is-medium is-link">
        <div class="hero-body">
          <div className="title is-3">
            This task asks you to record yourself saying simple commands like "set an alarm for the next hour"
          </div>
          <div className="subtitle is-4">
           By accepting this task, you agree to the following conditions: Your voice recording responses to this task may be reviewed by Requestor's machine processes and human reviewers for research purposes. YOUR VOICE RECORDING RESPONSES WILL ALSO BE PUBLICLY DISCLOSED AS PART OF A PUBLIC DATASET AND MAY BE PUBLICLY DISCLOSED AS PART OF A RESEARCH PAPER OR SHARED WITH THIRD PARTIES IN CONNECTION WITH THIS RESEARCH. Requestor will take measures to remove any information that directly identifies you before doing so, but cannot guarantee that identification will not be possible. Do not include personal information (for example, name, address, email, phone number, or other information you would wish to keep private) in your responses.
          </div>
        </div>
      </section>
    );
  }

  const axiosInstance = axios.create();

  function postData(url = "", data = {}) {
    // Default options are marked with *
    return axiosInstance({
      url: url,
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: data, // body data type must match "Content-Type" header
      files: ["in postData"]
    }).then((res) => res.data);
  }


 function submitFromFrame(formData, objData) {
   console.log("iS oNbaording", isOnboarding)
    if (isOnboarding) {
      console.log("handleSubmit in onboarding")
      handleSubmit(formData);
    } else {
      formData.append("USED_AGENT_ID", agentId);
      formData.append("final_data", JSON.stringify(objData));
      postData("/submit_task", formData)
        .then((data) => {
          handleSubmitToProvider(objData);
          return data;
        })
        .then(function (data) {
          console.table(objData);
        });
    }
  }

  return (
    <div>
      <ErrorBoundary handleError={handleFatalError}>
        <BaseFrontend
          taskData={initialTaskData}
          onSubmit={submitFromFrame}
          isOnboarding={isOnboarding}
          onError={handleFatalError}
        />
      </ErrorBoundary>
    </div>
  );
}

ReactDOM.render(<MainApp />, document.getElementById("app"));
