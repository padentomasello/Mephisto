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
//import {Recorder} from 'react-voice-recorder'

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
    this.onSubmit = props.onSubmit
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
    var audioData = this.audioData
    const file = new File([ this.audioData.blob ], audioData.url + ".wav", {
      type: audioData.blob.type,
      lastModified: Date.now()
    });
    const formData = new FormData()
    formData.append("file", file)
    let objData = {};
    formData.forEach((value, key) => {
      objData[key] = value;
    });
    this.onSubmit(formData, objData)
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

    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height: '10vh'}}>
          <Button variant="success" size="lg" onClick={this.start} disabled={submitted}> Start </Button>
          <Button variant="danger" size="lg" onClick={this.stop} disabled={submitted} >Stop</Button>
          <Button variant="primary" size="lg" onClick={this.submit} disabled={submitted}> { !submitted ? ("Submit") : ("Submitted!") }</Button>
         <ReactAudioPlayer src={preview} controls/>
        <AudioReactRecorder canvasHeight="75" state={recordState} onStop={this.onStop} />
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
  return (
    <div>
      <Directions>
        Directions: Please rate the below sentence as good or bad.
      </Directions>
      <section className="section">
        <div className="container" style={{'marginLeft': 0}}>
          <AudioRecorder onSubmit={onSubmit}> </AudioRecorder>
        </div>
      </section>
    </div>
  );
}

export { LoadingScreen, SimpleFrontend as BaseFrontend };
