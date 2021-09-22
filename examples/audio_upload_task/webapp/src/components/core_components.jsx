/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { useState } from "react";
import { Button } from "react-bootstrap";

function OnboardingComponent({ onSubmit }) {
  return (
    <div>
      <Directions>
        This component only renders if you have chosen to assign an onboarding
        qualification for your task. Click the button to move on to the main
        task.
      </Directions>
      <button
        className="button is-link"
        onClick={() => onSubmit({ success: true })}
      >
        Move to main task.
      </button>
    </div>
  );
}

function LoadingScreen() {
  return <Directions>Loading...</Directions>;
}

function Directions({ children }) {
  return (
    <section className="hero is-light">
      <div className="hero-body">
        <div className="container">
          <p className="subtitle is-5">{children}</p>
        </div>
      </div>
    </section>
  );
}

function FileUploadFrame({children, onSubmit}) {

  const [uploadFile, setUploadFile] = React.useState();
  const [submitting, setSubmitting] = React.useState(false);
  //const submitForm = (event) => {
    //event.preventDefault();
    //console.log("Here!")
    //console.log("uploadedFile", uploadFile)
    //dataArray.append("uploadFile", uploadFile);
    //console.log(event)
    //return;

    //const dataArray = new FormData();
    //dataArray.append("superHeroName", superHero);

    //axios
      //.post("api_url_here", dataArray, {
        //headers: {
          //"Content-Type": "multipart/form-data"
        //}
      //})
      //.then((response) => {
        //// successfully uploaded response
      //})
      //.catch((error) => {
        //// error response
      //});
    //}

  function handleFormSubmit(event) {
    event.preventDefault();
    console.log("uploadFile", uploadFile)
    console.log(uploadFile)
    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", uploadFile)
    console.log(formData)
    let objData = {};
    formData.forEach((value, key) => {
      objData[key] = value;
    });
    //formData['files'] = [ 'test' ]
    //objData['files'] = [ {"filename": "test" } ]
    console.log("objData")
    console.log(objData)
    //console.log(objData["files"])
    //console.log(objData["files"][0])
    onSubmit(formData, objData);
  }
  return (
      <div>
      <form encType="multipart/form-data" onSubmit={handleFormSubmit}>
        <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
        <input type="submit" />
      </form>
    </div>
  );
}

//function FileUploadFrame({ children, onSubmit }) {
  //const [submitting, setSubmitting] = React.useState(false);

  //function handleFormSubmit(event) {
    //console.log("HERE!")
    //console.log(event)
    //console.log(event.target)
    //event.preventDefault();
    //setSubmitting(true);
    //const formData = new FormData(event.target);
    //let objData = {};
    //formData.forEach((value, key) => {
      //objData[key] = value;
    //});
    //onSubmit(formData, objData);
  //}

  //return (
    //<div>
      //<form encType="multipart/form-data" onSubmit={handleFormSubmit}>
        //<input type="file" encType="multipart/form-data">
        //</input>
        //<Button type="submit" disabled={submitting}>
            //<span
              //style={{ marginRight: 5 }}
              //className="glyphicon glyphicon-ok"
            ///>
            //{submitting ? "Submitting..." : "Submit"}
        //</Button>
      //</form>
    //</div>
  //);
//}



function SimpleFrontend({ taskData, isOnboarding, onSubmit, onError }) {
  if (!taskData) {
    return <LoadingScreen />;
  }
  if (isOnboarding) {
    return <OnboardingComponent onSubmit={onSubmit} />;
  }

  //function submitFromFrame(formData, objData) {
    //if (isOnboarding) {
      //handleSubmit(objData);
    //} else {
      //formData.append("USED_AGENT_ID", agentId);
      //formData.append("final_data", JSON.stringify(objData));
      //postData("/submit_task", formData)
        //.then((data) => {
          //handleSubmitToProvider(objData);
          //return data;
        //})
        //.then(function (data) {
          //console.log("Submitted");
          //console.log(formData);
          //console.table(objData);
        //});
    //}
  //}
  return (
    <div>
      <Directions>
        Directions: Please rate the below sentence as good or bad.
      </Directions>
      <section className="section">
        <div className="container">
          <FileUploadFrame onSubmit={onSubmit}> Uplaod! </FileUploadFrame>
          <p className="subtitle is-5"></p>
          <p className="title is-3 is-spaced">{taskData.text}</p>
          <div className="field is-grouped">
            <div className="control">
              <button
                className="button is-success is-large"
                onClick={() => onSubmit({ rating: "good" })}
              >
                Mark as Good
              </button>
            </div>
            <div className="control">
              <button
                className="button is-danger is-large"
                onClick={() => onSubmit({ rating: "bad" })}
              >
                Mark as Bad
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { LoadingScreen, SimpleFrontend as BaseFrontend };
