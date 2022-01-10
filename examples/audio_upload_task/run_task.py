#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import os
import json
import shutil
import subprocess
from pathlib import Path
from mephisto.operations.operator import Operator
from mephisto.operations.utils import get_root_dir
from mephisto.tools.scripts import load_db_and_process_config
from mephisto.abstractions.blueprints.static_react_task.static_react_blueprint import (
    BLUEPRINT_TYPE,
)
from mephisto.abstractions.blueprints.abstract.static_task.static_blueprint import (
    SharedStaticTaskState,
)
from mephisto.data_model.qualification import QUAL_NOT_EXIST, make_qualification_dict

import hydra
from omegaconf import DictConfig
from dataclasses import dataclass, field
from typing import List, Any

TASK_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

defaults = [
    "_self_",
    {"mephisto/blueprint": BLUEPRINT_TYPE},
    {"mephisto/architect": "local"},
    {"mephisto/provider": "mock"},
    {"conf": "example"},
]

from mephisto.operations.hydra_config import RunScriptConfig, register_script_config


@dataclass
class TestScriptConfig(RunScriptConfig):
    defaults: List[Any] = field(default_factory=lambda: defaults)
    task_dir: str = TASK_DIRECTORY


register_script_config(name="scriptconfig", module=TestScriptConfig)


# TODO it would be nice if this was automated in the way that it
# is for ParlAI custom frontend tasks
def build_task(task_dir):
    """Rebuild the frontend for this task"""

    frontend_source_dir = os.path.join(task_dir, "webapp")
    frontend_build_dir = os.path.join(frontend_source_dir, "build")

    return_dir = os.getcwd()
    os.chdir(frontend_source_dir)
    if os.path.exists(frontend_build_dir):
        shutil.rmtree(frontend_build_dir)
    packages_installed = subprocess.call(["npm", "install"])
    if packages_installed != 0:
        raise Exception(
            "please make sure npm is installed, otherwise view "
            "the above error for more info."
        )

    webpack_complete = subprocess.call(["npm", "run", "dev"])
    if webpack_complete != 0:
        raise Exception(
            "Webpack appears to have failed to build your "
            "frontend. See the above error for more information."
        )
    os.chdir(return_dir)


@hydra.main(config_path="hydra_configs", config_name="scriptconfig")
def main(cfg: DictConfig) -> None:
    task_dir = cfg.task_dir

    split = cfg.mephisto.task.task_tags.split(',')[-1]

    def onboarding_always_valid(onboarding_data):
        return True

    with open('/private/home/padentomasello/data/mephisto/' + split +'.json', 'r') as f:
        utterances = json.load(f)

    done = set()

    split_dir = Path('/private/home/padentomasello/data/stop/mturk/' + split)
    print(split_dir)
    split_dir.mkdir(exist_ok=True)
    manifest_file = split_dir / 'manifest.txt'
    print(manifest_file)
    manifest_file.touch(exist_ok=True)
    with open(manifest_file, 'r') as m:
        for line in m:
            path = line.split('\t')[0]
            h = os.path.basename(path).split('.')[0]
            done.add(h)


    static_task_data = []
    assignment = [];
    tasksPerAssignment = 10
    i = 0
    idx = 0
    num_done = 0
    for (key, (domain, utterance, parse)) in utterances.items():
        if key in done:
            num_done += 1
            continue
        if i == tasksPerAssignment:
            static_task_data.append(assignment)
            i = 0;
            assignment = []
        assignment.append({ "id": key, "utterance": utterance })
        i += 1
        idx += 1
        if(idx == 2000): break
    # return
    print(f'Num done: { num_done }')

    if(len(assignment) > 0):
        static_task_data.append(assignment)
    print(f'Submitting { len(static_task_data) } number of tasks')

    shared_state = SharedStaticTaskState(
        static_task_data=static_task_data,
        validate_onboarding=onboarding_always_valid,
    )

    states = "AL, AR, DE, FL, GA, IA, KS, KY, LA, MD, MN, MS, MO, NE, ND, OK, SC, SD, TN, TX, VA, WV"
    states = states.split(', ')
    LocaleValues = [ {"Country": "US", "Subdivision": state} for state in states ];


    shared_state.mturk_specific_qualifications = [{
        "QualificationTypeId":"00000000000000000071",
          "Comparator":"In",
          "LocaleValues": LocaleValues
          }
      ]

    shared_state.qualifications = [
        make_qualification_dict(
            "test-set",
            QUAL_NOT_EXIST,
            None
        ),
        make_qualification_dict(
            "eval-set",
            QUAL_NOT_EXIST,
            None
        ),
        make_qualification_dict(
            "100_done",
            QUAL_NOT_EXIST,
            None
        ),
    ]

    # shared_state.qualifications = 

    build_task(task_dir)

    db, cfg = load_db_and_process_config(cfg)
    operator = Operator(db)

    operator.validate_and_run_config(cfg.mephisto, shared_state)
    operator.wait_for_runs_then_shutdown(skip_input=True, log_rate=30)


if __name__ == "__main__":
    main()
