#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
from parlai.mturk.core.worlds import MTurkOnboardWorld, MTurkTaskWorld
from parlai.core.worlds import validate
from joblib import Parallel, delayed
import time
from copy import deepcopy

class MTurkMultiAgentDialogOnboardWorld(MTurkOnboardWorld):
    def __init__(self, opt, mturk_agent):
        super().__init__(opt, mturk_agent)
        self.opt = opt

    def parley(self):
        self.mturk_agent.agent_id = "Onboarding Agent"
        self.mturk_agent.observe({"id": "System", "text": "Welcome onboard!"})
        x = self.mturk_agent.act(timeout=self.opt["turn_timeout"])
        self.mturk_agent.observe(
            {
                "id": "System",
                "text": "Thank you for your input! Please wait while "
                "we match you with another worker...",
                "episode_done": True,
            }
        )
        self.episodeDone = True


class MTurkMultiAgentDialogWorld(MTurkTaskWorld):
    """
    Basic world where each agent gets a turn in a round-robin fashion, receiving as
    input the actions of all other agents since that agent last acted.
    """

    def __init__(self, opt, agents=None, shared=None):
        # Add passed in agents directly.
        self.agents = agents
        self.acts = [None] * len(agents)
        self.form_results = [None] * len(agents)
        self.episodeDone = False
        self.max_turns = opt.get("max_turns", 3)
        self.current_turns = 0
        self.send_task_data = opt.get("send_task_data", False)
        self.opt = opt
        for idx, agent in enumerate(self.agents):
            agent.agent_id = f"Speaker {idx + 1}"
        self.init_task_data = self.agents[0].mephisto_agent.state.get_init_state()
        try:
            print('_____ inital_task_data', self.init_task_data)
            print('_____ inital_task_data["task_data"]', self.init_task_data['task_data'])
            self.prompt = self.init_task_data['task_data']['prompt']
        except IndexError:
            self.prompt = "It's been sometime since last time we chat. Do you have anything specific you want to know more about?"
        self.personas = self.init_task_data['task_data']['personas']
        self.persona_strings = self.get_persona_strings()
        self.time_num = self.init_task_data['task_data']['time_num']
        self.time_unit = self.init_task_data['task_data']['time_unit']
        self.msgs = []
        self.start_ts = 0
        self.end_ts = 0

    def get_persona_strings(self):
        return [' '.join(x) for x in self.personas]

    def observe_intro_msg(self):
        for agent in self.agents:
            time.sleep(2)
            persona_hint_msg = {
                'text': f"Hi {agent.agent_id}, I'm the coordinator. Please chat with the other person as if this is a follow-up after you two spoke {self.time_num} {self.time_unit} ago. ",
                'id': 'Coordinator',
                'task_data': {
                    'personas': self.persona_strings,
                    'agent_name': agent.agent_id,
                },
                'episode_done': False,
            }
            agent.observe(persona_hint_msg)
    
        self.agents[0].observe(
            {
                'text': f"{self.prompt}",
                'id': self.agents[0].mephisto_agent.get_agent_id(),
                'episode_done': False,
            }
        )

        time.sleep(2)
        # speaker 2 observe its partner's prompt
        self.acts[0] = {
                'text': f"{self.prompt}",
                'id': self.agents[0].agent_id,
                'episode_done': False,
            }
        self.agents[1].observe(self.acts[0])
        self.msgs.append(
            {
                'text': self.acts[0].get('text', ''),
                'id': self.acts[0].get('id', self.agents[0].agent_id,),
            }
        )
    
    def get_turker_answer(self, agent, index):
        bad = True
        while bad:
            try:
                act = agent.act(timeout=self.opt["turn_timeout"])
                if self.send_task_data:
                    act.force_set(
                        "task_data",
                        {
                            "last_acting_agent": agent.agent_id,
                            "current_dialogue_turn": self.current_turns,
                            "utterance_count": self.current_turns + index,
                        },
                    )
            except TypeError:
                act = agent.act()  # not MTurkAgent

            if act.get("episode_done", False):
                return act

            bad = len(act.get("text", '').split(' ')) < 5
            if bad:
                agent.observe(
                    {
                        'id': 'Coordinator',
                        'text': f'Your message should contain at least 5 words and be related to personal topics. Please try again.',
                        'episode_done': False,
                    }
                )

        return act
     
    def parley(self):
        """
        For each agent, get an observation of the last action each of the other agents
        took.
        Then take an action yourself.
        """
        acts = self.acts
        if self.current_turns == 0:
            self.start_ts = time.time()
            # first message
            self.observe_intro_msg()
            index = 1
            agent = self.agents[index]
            acts[index] = self.get_turker_answer(self.agents[1], index)
            self.msgs.append(
                {
                    'text': acts[index].get('text', ''),
                    'id':  self.agents[index].agent_id,
                }
            )
            print('__state = 0', acts[index].get('text', ''))
            print('act: ', acts[index])
            if acts[index]["episode_done"]:
                self.episodeDone = True
            for other_agent in self.agents:
                if other_agent != agent:
                    other_agent.observe(validate(acts[index]))
        self.current_turns += 1
        for index, agent in enumerate(self.agents):
            acts[index] = self.get_turker_answer(agent, index)
            self.msgs.append({
                'text': acts[index].get('text', ''),
                'id':  agent.agent_id,
            })
            print(f'__state = {self.current_turns}, agent[{index}]', acts[index].get('text', ''))
            print('act: ', acts[index])
            if acts[index]["episode_done"]:
                self.episodeDone = True
            for other_agent in self.agents:
                if other_agent != agent:
                    other_agent.observe(validate(acts[index]))
        if self.current_turns >= self.max_turns:
            self.episodeDone = True
            self.fill_out_form()
    
    def fill_out_form(self):
        """
        Fill out form after task
        """
        for agent in self.agents:
            agent.observe(
                {
                    "id": "Coordinator",
                    "text": "Please fill out the form to complete the chat:",
                    "task_data": {
                        "respond_with_form": [
                            {
                                "type": "choices",
                                "question": "How much did you enjoy talking to the other speaker?",
                                "choices": [
                                        "Not at all",
                                        "A little",
                                        "Somewhat",
                                        "A lot",
                                    ],
                            },
                            {"type": "text", "question": "Enter any comment here"},
                        ]
                    },
                }
            )
            agent.act()  # Request a response
            
        for i, agent in enumerate(self.agents):  # Ensure you get the response
            self.form_results[i] = agent.act(timeout=self.opt["turn_timeout"])

    def prep_save_data(self, agent):
        """Process and return any additional data from this world you may want to store"""
        self.end_ts = time.time()
        save_data =  {
            "max_turn": self.max_turns,
            'start_ts': self.start_ts,
            'end_ts': self.end_ts,
            "msgs": self.msgs,
        }
        return save_data

    def episode_done(self):
        return self.episodeDone

    def shutdown(self):
        """
        Shutdown all mturk agents in parallel, otherwise if one mturk agent is
        disconnected then it could prevent other mturk agents from completing.
        """
        global shutdown_agent

        def shutdown_agent(agent):
            try:
                agent.shutdown(timeout=None)
            except Exception:
                agent.shutdown()  # not MTurkAgent

        Parallel(n_jobs=len(self.agents), backend="threading")(
            delayed(shutdown_agent)(agent) for agent in self.agents
        )


def make_onboarding_world(opt, agent):
    return MTurkMultiAgentDialogOnboardWorld(opt, agent)


def validate_onboarding(data):
    """Check the contents of the data to ensure they are valid"""
    print(f"Validating onboarding data {data}")
    return True


def make_world(opt, agents):
    return MTurkMultiAgentDialogWorld(opt, agents)


def get_world_params():
    return {"agent_count": 2}
