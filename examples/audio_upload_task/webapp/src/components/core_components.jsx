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
       By accepting this task, you agree to the following conditions:
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
          <p className="subtitle is-5">
            <strong>
              { children }
            </strong>
            <br></br>
            <br></br>
            Your voice recording responses to this task may be reviewed by Requestor's machine processes and human reviewers for research purposes. YOUR VOICE RECORDING RESPONSES WILL ALSO BE PUBLICLY DISCLOSED AS PART OF A PUBLIC DATASET AND MAY BE PUBLICLY DISCLOSED AS PART OF A RESEARCH PAPER OR SHARED WITH THIRD PARTIES IN CONNECTION WITH THIS RESEARCH. Requestor will take measures to remove any information that directly identifies you before doing so, but cannot guarantee that identification will not be possible. Do not include personal information (for example, name, address, email, phone number, or other information you would wish to keep private) in your responses.
          </p>
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



function SimpleFrontend({ taskData, isOnboarding, onSubmit, handleSubmit, onError }) {
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
       { 
            "Directions: Please record yourself reading each of the following prompts. You can preview the recording using the player to the right. When you are satisfied with the recording, hit submit. You may only submit once. Once all recordings have been submitted, the audio will upload and the HIT is complete."
     }
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
