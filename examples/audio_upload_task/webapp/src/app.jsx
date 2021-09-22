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
            This is an incredibly simple React task working with Mephisto!
          </div>
          <div className="subtitle is-4">
            Inside you'll be asked to rate a given sentence as good or bad.
          </div>
        </div>
      </section>
    );
  }

const axiosInstance = axios.create();

function postData(url = "", data = {}) {
  // Default options are marked with *
  console.log("In post")
  console.log("In post!!!!!")
  console.log(data)
  console.log(url)
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
    if (isOnboarding) {
      console.log("isOnboarding")
      handleSubmit(objData);
    } else {
      console.log("IN submitFromFrame")
      console.log(formData)
      console.log(objData)
      formData.append("USED_AGENT_ID", agentId);
      formData.append("final_data", JSON.stringify(objData));
      formData.append("files", "test")
      postData("/submit_task", formData)
        .then((data) => {
          console.log("here2")
          handleSubmitToProvider(objData);
          return data;
        })
        .then(function (data) {
          console.log("Submitted");
          console.log(formData);
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
