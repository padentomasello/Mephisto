#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.


import os
from mephisto.core.operator import Operator
from mephisto.utils.scripts import load_db_and_process_config
from mephisto.server.blueprints.parlai_chat.parlai_chat_blueprint import (
    BLUEPRINT_TYPE,
    SharedParlAITaskState,
)
from mephisto.providers.mturk.utils.script_utils import direct_soft_block_mturk_workers, direct_allow_mturk_workers
from block_list import WORKER_BLOCK_LIST
from mephisto.data_model.qualification import make_qualification_dict, QUAL_EXISTS

"""
python /private/home/jingxu23/Mephisto/examples/parlai_chat_task_demo/parlai_test_script.py mephisto.provider.requester_name=noahturkproject1019_sandbox mephisto/architect=heroku

"""
import hydra
from omegaconf import DictConfig
from dataclasses import dataclass, field
from typing import List, Any

TASK_DIRECTORY = os.path.dirname(os.path.abspath(__file__))

defaults = [
    {"mephisto/blueprint": BLUEPRINT_TYPE},
    {"mephisto/architect": "local"},
    {"mephisto/provider": "mock"},
    "conf/base",
    {"conf": "custom_simple"},
]

from mephisto.core.hydra_config import RunScriptConfig, register_script_config

MASTER_QUALIF = {
    'QualificationTypeId': '2F1QJWKUDD8XADTFD2Q0G6UTO95ALH',
    'Comparator': 'Exists',
    'RequiredToPreview': True,
}

@dataclass
class TestScriptConfig(RunScriptConfig):
    defaults: List[Any] = field(default_factory=lambda: defaults)
    task_dir: str = TASK_DIRECTORY
    num_turns: int = field(
        default=3,
        metadata={"help": "Number of turns before a conversation is complete"},
    )
    turn_timeout: int = field(
        default=300,
        metadata={
            "help": "Maximum response time before kicking "
            "a worker out, default 300 seconds"
        },
    )


register_script_config(name="scriptconfig", module=TestScriptConfig)

ALLOW_LIST_ON = False
WORKER_ALLOW_LIST = []
if ALLOW_LIST_ON:
    with open('/private/home/jingxu23/Mephisto/examples/parlai_chat_task_demo/block_lists/allow_lists.txt') as f:
        WORKER_ALLOW_LIST = [l.strip() for l in f.readlines()]

@hydra.main(config_name="scriptconfig")
def main(cfg: DictConfig) -> None:
    db, cfg = load_db_and_process_config(cfg)

    world_opt = {"num_turns": cfg.num_turns, "turn_timeout": cfg.turn_timeout}

    custom_bundle_path = cfg.mephisto.blueprint.get("custom_source_bundle", None)
    if custom_bundle_path is not None:
        assert os.path.exists(custom_bundle_path), (
            "Must build the custom bundle with `npm install; npm run dev` from within "
            f"the {TASK_DIRECTORY}/webapp directory in order to demo a custom bundle "
        )
        world_opt["send_task_data"] = True

    if ALLOW_LIST_ON:
        existing_qualifications = []
        existing_qualifications.append(
            make_qualification_dict(
                'aq-hhchat1120',
                QUAL_EXISTS,
                None,
            )
        )
        shared_state = SharedParlAITaskState(
            world_opt=world_opt, onboarding_world_opt=world_opt, qualifications=existing_qualifications
        )
    else:
        shared_state = SharedParlAITaskState(
            world_opt=world_opt, onboarding_world_opt=world_opt,
        )
    try:
        # direct_soft_block_mturk_workers(
        #     db, WORKER_BLOCK_LIST, 'bq-hhchat1206', 'noahturkproject1019',
        # )
        if ALLOW_LIST_ON:
            direct_allow_mturk_workers(
                db, WORKER_ALLOW_LIST, 'aq-hhchat1206', 'noahturkproject1019',
            )
    except Exception as e:
        print(e)
        pass
    
    operator = Operator(db)

    operator.validate_and_run_config(cfg.mephisto, shared_state)
    operator.wait_for_runs_then_shutdown(skip_input=True, log_rate=360)


if __name__ == "__main__":
    main()
