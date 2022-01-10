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

class OnboardingComponent extends React.Component {
  constructor(props) {
    super(props)
    console.log(props)
    this.onSubmit = props.onSubmit
    this.state = { 
      gender: 'Unanswered',
      englishNative: "Unanswered"
    }
    this.handleGenderChange = this.handleGenderChange.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleGenderChange(event) {
    this.setState({ gender : event.target.value });
  }

  handleLanguageChange(event) {
    this.setState({ englishNative : event.target.value });
  }

  handleSubmit(event) {
    this.onSubmit({ success: true, fromForm: 'test', ...this.state })
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <Directions>
          Please complete onboarding before you can submit tasks. You may only submit this once!
        </Directions>
        <form>
          <div>
            <label>
              What gender do you identify as? 
              <select value={this.state.gender} onChange={this.handleGenderChange}>
                <option value="Unanswered">Unanswered</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Is English your first language? 
              <select value={this.state.englishNative} onChange={this.handleLanguageChange}>
                <option value="Unanswered">Unanswered</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
          </div>
          </form>
        <button className="button is-link" onClick={this.handleSubmit} >
          Submit onboarding and move to main task.
        </button>
      </div>
    );
  }

}
        //<Direction>
          //Please complete onboarding before you can submit tasks. You may only submit this once!
        //<Direction/>
      //<div>
      //<form onSubmit={this.handleSubmit}>
      ////<form onSubmit={ () => this.onSubmit({success: true, test: 'test'}) } >
      ////<form onSubmit={() => this.onSubmit({ success: true, test: 'test' })}>
        //<label>
          //Pick your favorite flavor:
          //<select value={'none'} onChange={(event) => console.log(event)}>
            //<option value="none">None</option>
            //<option value="grapefruit">Grapefruit</option>
            //<option value="lime">Lime</option>
            //<option value="coconut">Coconut</option>
            //<option value="mango">Mango</option>
          //</select>
        //</label>
        //<input type="submit" value="Submit" />
        //</form>
      //</div>
      //<div> //<button
        //className="button is-link"
        //onClick={() => this.onSubmit({ success: true, test: 'test' })}
      //>
        //Move to main task.
      //</button>
      //</div>

//class OnboardingComponent extends React.Component {
  //constructor(props) {
    //super(props)
    //this.onSubmit = props.onSubmit
    //this.state = { 
      //gender: 'none',
      //englishNative: true
    //}
  //}

  //handleChange(event) {
    //console.log(event)
    //this.setState({ value : event.target.value });
  //}

  //handleSubmit(event) {
    //console.log('handle submit')
    //console.log(this.onSubmit)
    ////this.onSubmit(this.state)
    //this.onSubmit({ success: true })
    //console.log('calling submit')
    //event.preventDefault();
  //}

  //render() {
    //return (
      //<div>
      //<form onSubmit={this.handleSubmit}>
        //<label>
          //Pick your favorite flavor:
          //<select value={this.state.value} onChange={this.handleFlavorChange}>
            //<option value="none">None</option>
            //<option value="grapefruit">Grapefruit</option>
            //<option value="lime">Lime</option>
            //<option value="coconut">Coconut</option>
            //<option value="mango">Mango</option>
          //</select>
        //</label>
        //<input type="submit" value="Submit" />
      //</form>
      //</div>
    //)
  //}

//}

//function OnboardingComponent({ onSubmit }) {
  //return (
    //<div>
    //<form onSubmit={ (label) => { 
      //console.log(label)
      //onSubmit({ option: label})
    //}}
    //<label>
      //What gender do you identify as? 
      //<Directions>
       //By accepting this task, you agree to the following conditions:
      //</Directions>
      //<button
        //className="button is-link"
        //onClick={() => onSubmit({ success: true })}
      //>
        //Move to main task.
      //</button>
    //</div>
  //);
  ////return (
      ////<div>
      ////<form onSubmit={ () => onSumit({ success: true}) } onChange={ (value) => { console.log(value) }} >
        ////<label>
          ////Pick your favorite flavor:
          ////<select value={"none"}>
            ////<option value="none">None</option>
            ////<option value="grapefruit">Grapefruit</option>
            ////<option value="lime">Lime</option>
            ////<option value="coconut">Coconut</option>
            ////<option value="mango">Mango</option>
          ////</select>
        ////</label>
        ////<input type="submit" value="Submit" />
      ////</form>
      ////</div>
    ////)
//}

//function OnboardingComponent({ onSubmit }) {
  //return (
    //<div>
      ////<Directions>
        ////This component only renders if you have chosen to assign an onboarding
        ////qualification for your task. Click the button to move on to the main
        ////task.
      ////</Directions>
      //<button
        //className="button is-link"
        //onClick={() => onSubmit({ success: true, test: 'test' })}
      //>
        //Move to main task.
      //</button>
    //</div>
  //);
//}


function LoadingScreen() {
  return <Directions>Loading... (If this persists for more than 20-30 seconds, please move on to another HIT! Apologies for the inconvenience) </Directions>;
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
