/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { useState, Component } from "react";
import { Button } from "react-bootstrap";
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import ReactAudioPlayer from 'react-audio-player';

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

class AudioRecorder extends Component {
  constructor(props) {
    super(props)

    this.state = {
      recordState: RecordState.STOP,
      preview: null,
      submitted: false
    }
    this.submitUnit = props.submitUnit
    this.audioData = null
  }

  start = () => {
    this.setState({
      recordState: RecordState.START
    })
  }

  stop = () => {
    this.setState({
      recordState: RecordState.STOP
    })
  }

  submit = () => {
    this.submitUnit(this.audioData, this.props.id)
    this.setState({submitted: true})
  }

  //audioData contains blob and blobUrl
  onStop = (audioData) => {
    this.audioData = audioData
    let preview = URL.createObjectURL(audioData.blob)
    this.setState({ preview: preview})
    this.render()
  }

  render() {
    const { recordState, preview, submitted } = this.state
    const { command } = this.props

    return (
      <div>
        <div>
          <strong> Prompt: { command } </strong>
        </div>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', height: '10vh'}}>
            <Button variant="success" size="lg" onClick={this.start} disabled={submitted}> Start </Button>
            <Button variant="danger" size="lg" onClick={this.stop} disabled={submitted} >Stop</Button>
            <Button variant="primary" size="lg" onClick={this.submit} disabled={submitted || preview === null}> { !submitted ? ("Submit") : ("Submitted!") }</Button>
           <ReactAudioPlayer src={preview} controls/>
          <AudioReactRecorder canvasHeight="75" state={recordState} onStop={this.onStop} />
        </div>
      </div>
    )
  }
}



function SimpleFrontend({ taskData, isOnboarding, onSubmit, onError }) {
  if (!taskData) {
    return <LoadingScreen />;
  }
  if (isOnboarding) {
    return <OnboardingComponent onSubmit={onSubmit} />;
  }


  let numTasks = taskData.length
  var tasks = {}
  // Waits until all tasks have been submitted and then submits the tasks
  function submit(audioData, id) {
    tasks[id] = audioData    
    if(Object.keys(tasks).length == numTasks) {
      // TODO!!!!! We need to keep track of which audio is for which tasks
      // Tasks should have an id established at the start
      const formData = new FormData()
      Object.keys(tasks).map(
        (key, index) => { 
          let audio = tasks[key]
          const file = new File( [ audio.blob ], key + ".wav", {
            type: audio.blob.type,
            lastModified: Date.now()
          })
          formData.append("file", file);
        }
      )
      let objData = {};
      formData.forEach((value, key) => {
        objData[key] = value;
      });
      onSubmit(formData, objData)
    }
  }

  return (
    <div>
      <Directions>
        Directions: Please rate the below sentence as good or bad.
       { taskData.text }
      </Directions>
      <section className="section">
        <div className="container" style={{'marginLeft': 0}}>
          { taskData.map(
            ({id, utterance}, index) => (<AudioRecorder command={utterance} key={id} id={id} submitUnit={submit}> </AudioRecorder>))
          }
        </div>
      </section>
    </div>
  );
}

export { LoadingScreen, SimpleFrontend as BaseFrontend };
